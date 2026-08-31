import { Feedback, FeedbackAtom } from '@/types/trace';
import { CanonicalFeedback } from '../types';

export class IntelligencePipeline {
  /**
   * Processes canonical feedback records through sentence atomization,
   * intent classification, sentiment analysis, and severity scoring.
   */
  public static process(records: CanonicalFeedback[]): Feedback[] {
    const timestamp = new Date().toISOString();

    return records.map(rec => {
      const textToAnalyze = rec.analysisText || rec.originalText;

      // Span Atomization: Decompose sentences/clauses with character offsets
      const clauses = textToAnalyze
        .split(/(?<=[.!?])\s+|,\s+and\s+|,\s+but\s+/)
        .filter(c => c.trim().length > 3);

      const atoms: FeedbackAtom[] = clauses.length > 0 ? clauses.map((clause, cIdx) => {
        const cleanClause = clause.trim();
        const start = textToAnalyze.indexOf(cleanClause);
        const end = start >= 0 ? start + cleanClause.length : cleanClause.length;

        const isBug = /crash|freeze|error|bug|broken|failed|timeout|slow|latency|exception/i.test(cleanClause);
        const isRequest = /add|support|want|please|need|feature|request|allow|option|export/i.test(cleanClause);
        const isPraise = /love|great|awesome|excellent|amazing|good|happy/i.test(cleanClause);

        const intent = isBug
          ? 'bug_report'
          : isRequest
          ? 'feature_request'
          : isPraise
          ? 'praise'
          : 'complaint';

        const sentiment = isBug ? 'negative' : isRequest ? 'neutral' : isPraise ? 'positive' : 'negative';
        const sentimentScore = isBug ? -0.85 : isRequest ? 0 : isPraise ? 0.9 : -0.5;
        const severity = isBug ? 'high' : isRequest ? 'medium' : 'medium';

        return {
          id: `atom-${rec.id}-${cIdx}`,
          workspaceId: rec.workspaceId,
          feedbackId: rec.id,
          atomText: cleanClause,
          sourceStart: Math.max(0, start),
          sourceEnd: Math.max(0, end),
          intent,
          sentiment,
          sentimentScore,
          severity,
          isFeatureRequest: isRequest,
          underlyingProblemHint: isRequest ? `Customer struggle in: "${cleanClause.slice(0, 45)}..."` : undefined,
          confidence: 'high',
          verificationStatus: 'verified',
          themeName: isBug ? 'Stability & Error Recovery' : isRequest ? 'Feature Requests' : 'Product Usability',
          createdAt: timestamp
        };
      }) : [
        {
          id: `atom-${rec.id}-0`,
          workspaceId: rec.workspaceId,
          feedbackId: rec.id,
          atomText: textToAnalyze,
          sourceStart: 0,
          sourceEnd: textToAnalyze.length,
          intent: 'complaint',
          sentiment: 'negative',
          sentimentScore: -0.6,
          severity: 'medium',
          isFeatureRequest: false,
          confidence: 'medium',
          verificationStatus: 'verified',
          createdAt: timestamp
        }
      ];


      return {
        id: rec.id,
        workspaceId: rec.workspaceId,
        sourceId: rec.sourceId,
        importId: rec.importId,
        sourceType: rec.sourceType,
        externalId: rec.externalId,
        originalText: rec.originalText,
        analysisText: rec.analysisText,
        normalizedText: textToAnalyze,
        language: rec.language || 'en',
        sourceCreatedAt: rec.sourceTimestamp || timestamp,
        importedAt: rec.ingestionTimestamp || timestamp,
        customerName: rec.customer?.name || 'Anonymous Account',
        customerSegmentName: rec.segment || 'General SMB',
        customerSegmentId: 'seg-default',
        rating: rec.rating,
        sourceLocation: rec.sourceLocation,
        normalizedMetadata: rec.normalizedMetadata,
        rawPayload: rec.rawPayload,
        fingerprint: rec.fingerprint,
        status: rec.status,
        atoms
      };
    });
  }
}
