import { CanonicalFeedback, Feedback, FeedbackAtom, FeedbackSource } from '@/types/trace';
import { isVerifiedAtom } from '@/lib/evidence-utils';

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
        customerSegmentId: rec.customer?.segment?.trim() || undefined,
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

    return created;
  }

  public static async getFeedbackById(id: string): Promise<Feedback | null> {
    return this.feedbackStore.get(id) || null;
  }

  public static async getFeedbackByWorkspace(workspaceId: string): Promise<Feedback[]> {
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

    return persisted;
  }

  public static async getAtomsByWorkspace(workspaceId: string): Promise<FeedbackAtom[]> {
    return Array.from(this.atomStore.values()).filter(a => a.workspaceId === workspaceId);
  }

  public static async getVerifiedAtomsByWorkspace(workspaceId: string): Promise<FeedbackAtom[]> {
    const feedbackList = await this.getFeedbackByWorkspace(workspaceId);
    const fbMap = new Map<string, Feedback>();
    feedbackList.forEach(f => fbMap.set(f.id, f));

    return Array.from(this.atomStore.values()).filter(atom => {
      if (atom.workspaceId !== workspaceId) return false;
      const fb = fbMap.get(atom.feedbackId);
      return isVerifiedAtom(fb, atom);
    });
  }

  public static async saveSource(source: FeedbackSource): Promise<FeedbackSource> {
    this.sourceStore.set(source.id, source);
    return source;
  }

  public static async getSourcesByWorkspace(workspaceId: string): Promise<FeedbackSource[]> {
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
  }
}
