import { CanonicalFeedback, Feedback, FeedbackAtom, FeedbackSource } from '@/types/trace';

export class FeedbackRepo {
  private static feedbackStore: Map<string, Feedback> = new Map();
  private static atomStore: Map<string, FeedbackAtom> = new Map();
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
        customerName: rec.customer?.name || 'Anonymous Customer',
        customerSegmentName: rec.segment || 'General SMB',
        customerSegmentId: rec.customer?.segment || 'seg-default',
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

  public static async saveAtoms(atoms: FeedbackAtom[]): Promise<FeedbackAtom[]> {
    atoms.forEach(atom => {
      this.atomStore.set(atom.id, atom);
      const parent = this.feedbackStore.get(atom.feedbackId);
      if (parent) {
        if (!parent.atoms) parent.atoms = [];
        const existingIdx = parent.atoms.findIndex(a => a.id === atom.id);
        if (existingIdx >= 0) {
          parent.atoms[existingIdx] = atom;
        } else {
          parent.atoms.push(atom);
        }
      }
    });
    return atoms;
  }

  public static async getAtomsByWorkspace(workspaceId: string): Promise<FeedbackAtom[]> {
    return Array.from(this.atomStore.values()).filter(a => a.workspaceId === workspaceId);
  }

  public static async getVerifiedAtomsByWorkspace(workspaceId: string): Promise<FeedbackAtom[]> {
    return Array.from(this.atomStore.values()).filter(
      a => a.workspaceId === workspaceId && a.verificationStatus === 'verified'
    );
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
      if (a.workspaceId === workspaceId) this.atomStore.delete(id);
    }
    for (const [id, s] of this.sourceStore.entries()) {
      if (s.workspaceId === workspaceId) this.sourceStore.delete(id);
    }
  }
}
