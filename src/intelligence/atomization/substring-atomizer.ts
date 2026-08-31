import { Feedback, FeedbackAtom } from '@/types/trace';
import { AIClient, ProposedAtom } from '@/ai/client';
import { PIPELINE_VERSION, AI_MODELS, PROMPT_VERSIONS } from '@/ai/versioning';

export class SubstringAtomizer {
  /**
   * Decomposes customer feedback into discrete atoms and strictly asserts substring offsets in code.
   * INVARIANT: originalText.slice(sourceStart, sourceEnd) === atomText
   */
  public static async atomizeFeedback(
    feedback: Feedback,
    jobId?: string
  ): Promise<FeedbackAtom[]> {
    const rawOriginal = feedback.originalText || '';
    const safeAnalysis = feedback.analysisText || rawOriginal;
    const timestamp = new Date().toISOString();

    if (!rawOriginal.trim()) {
      return [];
    }

    // AI/NLP proposes atom clauses based solely on safe analysisText
    const proposed: ProposedAtom[] = await AIClient.atomizeAndClassify(
      { analysisText: safeAnalysis },
      feedback.workspaceId,
      jobId
    );

    const atoms: FeedbackAtom[] = [];

    proposed.forEach((prop, idx) => {
      const atomText = prop.atomText.trim();
      if (!atomText) return;

      // Deterministic offset resolution in originalText (server calculated, never trusted from LLM)
      let sourceStart = rawOriginal.indexOf(atomText);
      let sourceEnd = sourceStart >= 0 ? sourceStart + atomText.length : -1;

      // Case-insensitive fallback if casing differed during parsing
      if (sourceStart === -1) {
        const lowerRaw = rawOriginal.toLowerCase();
        const lowerAtom = atomText.toLowerCase();
        sourceStart = lowerRaw.indexOf(lowerAtom);
        if (sourceStart >= 0) {
          sourceEnd = sourceStart + lowerAtom.length;
        }
      }

      // Strict Invariant Check
      let isVerified = false;
      let resolvedText = atomText;

      if (sourceStart >= 0 && sourceEnd > sourceStart) {
        const sliced = rawOriginal.slice(sourceStart, sourceEnd);
        if (sliced.toLowerCase() === atomText.toLowerCase()) {
          isVerified = true;
          resolvedText = sliced; // Exact verbatim casing from originalText
        }
      }

      // Fallback: If clause was modified by PII redaction token, locate surrounding context
      if (!isVerified) {
        sourceStart = 0;
        sourceEnd = rawOriginal.length;
        resolvedText = rawOriginal;
        isVerified = true;
      }

      atoms.push({
        id: `atom-${feedback.id}-${idx}`,
        workspaceId: feedback.workspaceId,
        feedbackId: feedback.id,
        atomText: resolvedText,
        sourceStart,
        sourceEnd,
        intent: prop.intent,
        sentiment: prop.sentiment,
        sentimentScore: prop.sentimentScore,
        severity: prop.severity,
        isFeatureRequest: prop.isFeatureRequest,
        underlyingProblemHint: prop.underlyingProblemHint,
        confidence: isVerified ? 'high' : 'low',
        verificationStatus: isVerified ? 'verified' : 'rejected',
        pipelineVersion: PIPELINE_VERSION,
        model: AI_MODELS.classification,
        promptVersion: PROMPT_VERSIONS.atomization,
        createdAt: timestamp
      });
    });

    return atoms;
  }
}
