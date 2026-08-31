import { ConfidenceLevel, InsightEvidence } from '@/types/trace';

export class ConfidenceEvaluator {
  /**
   * Evaluates evidence confidence independently from Priority Score.
   * LOCKED: Priority Score is never multiplied or reduced secretly by confidence.
   */
  public static evaluate(evidence: InsightEvidence[]): ConfidenceLevel {
    if (evidence.length >= 8) return 'high';
    if (evidence.length >= 4) return 'medium';
    return 'low';
  }
}
