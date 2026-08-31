import { FeedbackAtom } from '@/types/trace';
import { AIClient } from '@/ai/client';

export class EmbeddingService {
  /**
   * Generates embedding vector for a feedback atom based strictly on sanitized text.
   */
  public static async embedAtom(atom: FeedbackAtom, jobId?: string): Promise<FeedbackAtom> {
    const { vector, model, version } = await AIClient.generateEmbedding(
      { analysisText: atom.atomText },
      atom.workspaceId,
      jobId
    );

    return {
      ...atom,
      embedding: vector,
      embeddingModel: model,
      embeddingVersion: version
    };
  }

  /**
   * Batch embeds multiple atoms.
   */
  public static async embedBatch(atoms: FeedbackAtom[], jobId?: string): Promise<FeedbackAtom[]> {
    const embedded: FeedbackAtom[] = [];
    for (const atom of atoms) {
      const res = await EmbeddingService.embedAtom(atom, jobId);
      embedded.push(res);
    }
    return embedded;
  }
}
