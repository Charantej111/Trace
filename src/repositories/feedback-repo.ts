import { CanonicalFeedback, Feedback, FeedbackAtom, FeedbackSource, ImportJob } from '@/types/trace';
import { isVerifiedAtom } from '@/lib/evidence-utils';
import { supabase, isSupabaseConfigured, Transformers } from '@/lib/supabase';

export class FeedbackRepo {
  private static feedbackStore: Map<string, Feedback> = new Map();
  private static atomStore: Map<string, FeedbackAtom> = new Map();
  // Database-level uniqueness constraint simulator: unique (feedback_id, source_start, source_end)
  private static atomSpanIndex: Map<string, string> = new Map();
  private static sourceStore: Map<string, FeedbackSource> = new Map();

  public static async saveCanonicalFeedback(records: CanonicalFeedback[]): Promise<Feedback[]> {
    const timestamp = new Date().toISOString();
    const created: Feedback[] = records.map(rec => {
      const fb: Feedback = {
        id: rec.id,
        workspaceId: rec.workspaceId,
        sourceId: rec.sourceId,
        importId: rec.importId,
        sourceType: rec.sourceType,
        externalId: rec.externalId,
        originalText: rec.originalText,
        analysisText: rec.analysisText,
        language: rec.language || 'en',
        sourceCreatedAt: rec.sourceTimestamp || timestamp,
        importedAt: rec.ingestionTimestamp || timestamp,
        customerName: rec.customer?.name?.trim() ? rec.customer.name.trim() : undefined,
        customerSegmentName: rec.segment?.trim() ? rec.segment.trim() : (rec.customer?.segment?.trim() ? rec.customer.segment.trim() : undefined),
        customerSegmentId: undefined,
        rating: rec.rating,
        sourceLocation: rec.sourceLocation,
        normalizedMetadata: rec.normalizedMetadata,
        rawPayload: rec.rawPayload,
        fingerprint: rec.fingerprint,
        status: rec.status,
        atoms: []
      };
      this.feedbackStore.set(fb.id, fb);
      return fb;
    });

    if (isSupabaseConfigured() && supabase) {
      try {
        const rows = created.map(Transformers.feedbackToRow);
        const { error } = await supabase.from('feedback').upsert(rows, { onConflict: 'id' });
        if (error) {
          console.warn('[FeedbackRepo] Supabase feedback upsert notice (falling back to memory):', error);
        }
      } catch (err) {
        console.warn('[FeedbackRepo] Supabase feedback request failed:', err);
      }
    }

    return created;
  }

  public static async seedFeedback(records: Feedback[]): Promise<Feedback[]> {
    records.forEach(fb => this.feedbackStore.set(fb.id, fb));
    if (isSupabaseConfigured() && supabase && records.length > 0) {
      try {
        const rows = records.map(Transformers.feedbackToRow);
        const { error } = await supabase.from('feedback').upsert(rows);
        if (error) console.warn('[FeedbackRepo] seedFeedback error:', error);
      } catch (err) {
        console.warn('[FeedbackRepo] seedFeedback failed:', err);
      }
    }
    return records;
  }

  public static async getFeedbackById(id: string): Promise<Feedback | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('feedback')
          .select('*, feedback_atoms(*)')
          .eq('id', id)
          .single();

        if (!error && data) {
          const atoms = Array.isArray(data.feedback_atoms)
            ? data.feedback_atoms.map((a: Record<string, unknown>) => Transformers.rowToAtom(a))
            : [];
          const fb = Transformers.rowToFeedback(data, atoms);
          this.feedbackStore.set(fb.id, fb);
          return fb;
        }
      } catch (err) {
        console.warn('[FeedbackRepo] Supabase getFeedbackById failed:', err);
      }
    }

    return this.feedbackStore.get(id) || null;
  }

  public static async getFeedbackByWorkspace(workspaceId: string): Promise<Feedback[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('feedback')
          .select('*, feedback_atoms(*)')
          .eq('workspace_id', workspaceId)
          .order('imported_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const list: Feedback[] = data.map((row: Record<string, unknown>) => {
            const atoms = Array.isArray(row.feedback_atoms)
              ? (row.feedback_atoms as Record<string, unknown>[]).map(Transformers.rowToAtom)
              : [];
            const fb = Transformers.rowToFeedback(row, atoms);
            this.feedbackStore.set(fb.id, fb);
            return fb;
          });
          return list;
        }
      } catch (err) {
        console.warn('[FeedbackRepo] Supabase getFeedbackByWorkspace failed:', err);
      }
    }

    return Array.from(this.feedbackStore.values()).filter(f => f.workspaceId === workspaceId);
  }

  /**
   * Persists atoms enforcing:
   * 1. Parent feedback existence
   * 2. Offset validity and exact substring verification
   * 3. Database unique constraint: unique (feedback_id, source_start, source_end)
   */
  public static async saveAtoms(atoms: FeedbackAtom[]): Promise<FeedbackAtom[]> {
    const persisted: FeedbackAtom[] = [];

    for (const atom of atoms) {
      const parent = this.feedbackStore.get(atom.feedbackId);
      if (!parent) {
        // Feedback does not exist, reject atom
        continue;
      }

      // Check offset validity and exact substring match
      const verified = isVerifiedAtom(parent, atom);
      const atomToSave: FeedbackAtom = {
        ...atom,
        verificationStatus: verified ? 'verified' : 'rejected',
        confidence: verified ? atom.confidence || 'high' : 'low'
      };

      if (!verified) {
        // Do not index invalid offsets into the verified span index, but save to store
        this.atomStore.set(atomToSave.id, atomToSave);
        continue;
      }

      // Unique Constraint: unique (feedback_id, source_start, source_end)
      const spanKey = `${atom.feedbackId}:${atom.sourceStart}:${atom.sourceEnd}`;
      const existingAtomId = this.atomSpanIndex.get(spanKey);

      if (existingAtomId && existingAtomId !== atomToSave.id) {
        // Duplicate span proposal: retain existing, do not create duplicate
        const existing = this.atomStore.get(existingAtomId);
        if (existing) {
          persisted.push(existing);
        }
        continue;
      }

      // Register in span index & atom store
      this.atomSpanIndex.set(spanKey, atomToSave.id);
      this.atomStore.set(atomToSave.id, atomToSave);
      persisted.push(atomToSave);

      // Attach deduplicated atom to parent feedback record
      if (!parent.atoms) {
        parent.atoms = [];
      }

      const existingSpanIdx = parent.atoms.findIndex(
        a => a.sourceStart === atomToSave.sourceStart && a.sourceEnd === atomToSave.sourceEnd
      );

      if (existingSpanIdx >= 0) {
        parent.atoms[existingSpanIdx] = atomToSave;
      } else {
        const existingIdIdx = parent.atoms.findIndex(a => a.id === atomToSave.id);
        if (existingIdIdx >= 0) {
          parent.atoms[existingIdIdx] = atomToSave;
        } else {
          parent.atoms.push(atomToSave);
        }
      }
    }

    if (isSupabaseConfigured() && supabase && persisted.length > 0) {
      try {
        const rows = persisted.map(Transformers.atomToRow);
        const { error } = await supabase.from('feedback_atoms').upsert(rows, {
          onConflict: 'feedback_id,source_start,source_end'
        });
        if (error) {
          console.warn('[FeedbackRepo] Supabase atom upsert error:', error);
        }
      } catch (err) {
        console.warn('[FeedbackRepo] Supabase saveAtoms failed:', err);
      }
    }

    return persisted;
  }

  public static async getAtomsByWorkspace(workspaceId: string): Promise<FeedbackAtom[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('feedback_atoms')
          .select('*')
          .eq('workspace_id', workspaceId);

        if (!error && data && data.length > 0) {
          return data.map(row => {
            const atom = Transformers.rowToAtom(row);
            const cached = this.atomStore.get(atom.id);
            if (cached?.embedding && (!atom.embedding || atom.embedding.length === 0)) {
              atom.embedding = cached.embedding;
            }
            this.atomStore.set(atom.id, atom);
            return atom;
          });
        }
      } catch (err) {
        console.warn('[FeedbackRepo] Supabase getAtomsByWorkspace failed:', err);
      }
    }

    return Array.from(this.atomStore.values()).filter(a => a.workspaceId === workspaceId);
  }

  public static async getVerifiedAtomsByWorkspace(workspaceId: string): Promise<FeedbackAtom[]> {
    const feedbackList = await this.getFeedbackByWorkspace(workspaceId);
    const fbMap = new Map<string, Feedback>();
    feedbackList.forEach(f => fbMap.set(f.id, f));

    const allAtoms = await this.getAtomsByWorkspace(workspaceId);
    return allAtoms.filter(atom => {
      if (atom.workspaceId !== workspaceId) return false;
      const fb = fbMap.get(atom.feedbackId);
      return isVerifiedAtom(fb, atom);
    });
  }

  public static async saveSource(source: FeedbackSource): Promise<FeedbackSource> {
    this.sourceStore.set(source.id, source);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('feedback_sources').upsert({
          id: source.id,
          workspace_id: source.workspaceId,
          type: source.type,
          name: source.name,
          status: source.status,
          configuration: {},
          last_synced_at: source.lastSyncedAt || new Date().toISOString(),
          created_at: new Date().toISOString()
        });
      } catch (err) {
        console.warn('[FeedbackRepo] Supabase saveSource failed:', err);
      }
    }

    return source;
  }

  public static async saveImport(job: ImportJob): Promise<ImportJob> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('imports').upsert({
          id: job.id,
          workspace_id: job.workspaceId,
          source_id: job.sourceId || null,
          status: job.status,
          file_name: job.fileName || null,
          file_type: job.fileType || null,
          total_rows: job.totalRows || 0,
          accepted_rows: job.acceptedRows || 0,
          rejected_rows: job.rejectedRows || 0,
          duplicate_rows: job.duplicateRows || 0,
          atoms_extracted: job.atomsExtracted || 0,
          error_summary: {},
          started_at: job.startedAt || new Date().toISOString(),
          completed_at: job.completedAt || new Date().toISOString(),
          created_at: job.createdAt || new Date().toISOString()
        });
      } catch (err) {
        console.warn('[FeedbackRepo] Supabase saveImport failed:', err);
      }
    }

    return job;
  }

  public static async getSourcesByWorkspace(workspaceId: string): Promise<FeedbackSource[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('feedback_sources')
          .select('*')
          .eq('workspace_id', workspaceId);

        if (!error && data && data.length > 0) {
          return data.map((r: Record<string, unknown>) => ({
            id: String(r.id),
            workspaceId: String(r.workspace_id),
            type: (r.type as FeedbackSource['type']) || 'csv',
            name: String(r.name),
            status: (r.status as FeedbackSource['status']) || 'active',
            lastSyncedAt: r.last_synced_at ? String(r.last_synced_at) : undefined,
            recordCount: 0
          }));
        }
      } catch (err) {
        console.warn('[FeedbackRepo] Supabase getSourcesByWorkspace failed:', err);
      }
    }

    return Array.from(this.sourceStore.values()).filter(s => s.workspaceId === workspaceId);
  }

  public static async clearWorkspace(workspaceId: string): Promise<void> {
    for (const [id, f] of this.feedbackStore.entries()) {
      if (f.workspaceId === workspaceId) this.feedbackStore.delete(id);
    }
    for (const [id, a] of this.atomStore.entries()) {
      if (a.workspaceId === workspaceId) {
        this.atomStore.delete(id);
        const spanKey = `${a.feedbackId}:${a.sourceStart}:${a.sourceEnd}`;
        this.atomSpanIndex.delete(spanKey);
      }
    }
    for (const [id, s] of this.sourceStore.entries()) {
      if (s.workspaceId === workspaceId) this.sourceStore.delete(id);
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await Promise.all([
          supabase.from('feedback_atoms').delete().eq('workspace_id', workspaceId),
          supabase.from('feedback').delete().eq('workspace_id', workspaceId),
          supabase.from('feedback_sources').delete().eq('workspace_id', workspaceId)
        ]);
      } catch (err) {
        console.warn('[FeedbackRepo] Supabase clearWorkspace failed:', err);
      }
    }
  }
}
