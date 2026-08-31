import { Feedback, FeedbackAtom } from '@/types/trace';
import { AIClient, ProposedAtom } from '@/ai/client';
import { PIPELINE_VERSION, AI_MODELS, PROMPT_VERSIONS } from '@/ai/versioning';

export class SubstringAtomizer {
  /**
   * Decomposes customer feedback into discrete atoms and strictly asserts substring offsets in code.
   * INVARIANT: originalText.slice(sourceStart, sourceEnd) === atomText
   *
   * Flow:
   * 1. AI proposes atom clauses based on analysisText
   * 2. Normalize proposed atom text for matching
   * 3. Locate exact substring in originalText
   * 4. Calculate sourceStart/sourceEnd
   * 5. Verify: originalText.slice(sourceStart, sourceEnd) === atomText
   * 6. Deduplicate by span (sourceStart:sourceEnd)
   * 7. Persist only valid unique atoms. If not found -> verificationStatus = 'rejected'.
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
    let proposed: ProposedAtom[] = [];
    try {
      proposed = await AIClient.atomizeAndClassify(
        { analysisText: safeAnalysis },
        feedback.workspaceId,
        jobId
      );
    } catch (e) {
      console.error(`AI atomization failed for feedback ${feedback.id}:`, e);
      // Evidence survives AI failure; return no fake atoms
      return [];
    }

    const atoms: FeedbackAtom[] = [];
    const seenSpans = new Set<string>();

    proposed.forEach((prop, idx) => {
      const atomTextRaw = prop.atomText ? prop.atomText.trim() : '';
      if (!atomTextRaw) return;

      // Locate exact verbatim substring in originalText
      let sourceStart = rawOriginal.indexOf(atomTextRaw);
      let sourceEnd = sourceStart >= 0 ? sourceStart + atomTextRaw.length : -1;
      let resolvedText = atomTextRaw;

      // If exact casing wasn't found, try case-insensitive location to extract verbatim text
      if (sourceStart === -1) {
        const lowerRaw = rawOriginal.toLowerCase();
        const lowerAtom = atomTextRaw.toLowerCase();
        sourceStart = lowerRaw.indexOf(lowerAtom);
        if (sourceStart >= 0) {
          sourceEnd = sourceStart + lowerAtom.length;
          // Extract exact verbatim text from originalText at found offsets
          resolvedText = rawOriginal.slice(sourceStart, sourceEnd);
        }
      }

      // Strict Invariant Check
      let isVerified = false;
      if (
        sourceStart >= 0 &&
        sourceEnd > sourceStart &&
        sourceEnd <= rawOriginal.length
      ) {
        const sliced = rawOriginal.slice(sourceStart, sourceEnd);
        if (sliced === resolvedText) {
          isVerified = true;
        }
      }

      // If substring cannot be located, mark rejected without inventing offsets
      if (!isVerified) {
        sourceStart = -1;
        sourceEnd = -1;
        resolvedText = atomTextRaw;
      } else {
        // Deduplicate by span (feedback_id + sourceStart + sourceEnd)
        const spanKey = `${sourceStart}:${sourceEnd}`;
        if (seenSpans.has(spanKey)) {
          // Already have a verified atom for this exact source span; do not duplicate
          return;
        }
        seenSpans.add(spanKey);
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
