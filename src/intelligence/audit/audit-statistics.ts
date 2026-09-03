import {
  Feedback,
  FeedbackAtom,
  Theme,
  PainPoint,
  Opportunity,
  CustomerSegment,
  EmotionalState,
  IntentType,
  SentimentType,
  SeverityType,
  RatingAlignment
} from '../../types/trace';

export interface EmotionMetric {
  emotion: EmotionalState;
  count: number;
  percentage: number;
}

export interface SeverityMetric {
  severity: SeverityType;
  count: number;
  percentage: number;
}

export interface IntentMetric {
  intent: IntentType;
  count: number;
  percentage: number;
}

export interface RatingAlignmentMetric {
  alignment: RatingAlignment;
  count: number;
  percentage: number;
}

export interface AuditStatistics {
  // Volume & Traceability
  totalFeedback: number;
  totalVerifiedAtoms: number;
  distinctCustomers: number;
  distinctSources: number;

  // Sentiment Breakdown
  positiveAtomCount: number;
  negativeAtomCount: number;
  neutralAtomCount: number;
  mixedAtomCount: number;
  averageSentiment: number; // -1.0 to +1.0

  // Emotional Breakdown
  emotionalDistribution: EmotionMetric[];
  averageEmotionalIntensity: number; // 0.0 to 1.0
  positiveEmotionalIntensity: number;
  negativeEmotionalIntensity: number;

  // Structural Distributions
  severityDistribution: SeverityMetric[];
  intentDistribution: IntentMetric[];
  ratingAlignmentDistribution: RatingAlignmentMetric[];

  // Downstream Aggregations
  totalThemes: number;
  totalPainPoints: number;
  totalOpportunities: number;
  affectedCustomerSegments: string[];

  // Evidence Sufficiency Guard
  evidenceSufficiency: {
    isSufficient: boolean;
    minimumReviewsMet: boolean;
    minimumAtomsMet: boolean;
    message?: string;
  };
}

export class AuditStatisticsCalculator {
  // Evidence Thresholds: Minimum volume required before AI may synthesize confident conclusions
  public static readonly MIN_REVIEWS_THRESHOLD = 3;
  public static readonly MIN_ATOMS_THRESHOLD = 3;

  /**
   * Computes 100% deterministic audit statistics directly from persisted records.
   * AI never generates or invents any numbers, percentages, or counts in this function.
   */
  public static calculate(
    feedbackList: Feedback[],
    atoms: FeedbackAtom[],
    themes: Theme[] = [],
    painPoints: PainPoint[] = [],
    opportunities: Opportunity[] = [],
    segments: CustomerSegment[] = []
  ): AuditStatistics {
    const verifiedAtoms = atoms.filter(a => a.verificationStatus === 'verified');
    const totalFeedback = feedbackList.length;
    const totalVerifiedAtoms = verifiedAtoms.length;

    // Distinct customer and source diversity
    const distinctCustomers = new Set(
      feedbackList.map(f => f.customerId || f.customerName).filter(Boolean)
    ).size;
    const distinctSources = new Set(
      feedbackList.map(f => f.sourceType).filter(Boolean)
    ).size;

    // Sentiment breakdown
    let positiveAtomCount = 0;
    let negativeAtomCount = 0;
    let neutralAtomCount = 0;
    let mixedAtomCount = 0;
    let sentimentScoreSum = 0;

    // Emotional intensity aggregators
    let intensitySum = 0;
    let posIntensitySum = 0;
    let posIntensityCount = 0;
    let negIntensitySum = 0;
    let negIntensityCount = 0;

    // Distributions
    const emotionCounts = new Map<EmotionalState, number>();
    const severityCounts = new Map<SeverityType, number>();
    const intentCounts = new Map<IntentType, number>();
    const alignmentCounts = new Map<RatingAlignment, number>();

    for (const atom of verifiedAtoms) {
      // 1. Sentiment
      const sent = atom.sentimentLabel || atom.sentiment;
      if (sent === 'positive') positiveAtomCount++;
      else if (sent === 'negative') negativeAtomCount++;
      else if (sent === 'mixed') mixedAtomCount++;
      else neutralAtomCount++;

      const score = typeof atom.sentimentScore === 'number' ? atom.sentimentScore : 0;
      sentimentScoreSum += score;

      // 2. Emotional State
      const emo: EmotionalState = atom.emotionalState || 'neutral';
      emotionCounts.set(emo, (emotionCounts.get(emo) || 0) + 1);

      // 3. Emotional Intensity
      const intensity = typeof atom.emotionalIntensity === 'number' ? atom.emotionalIntensity : 0.5;
      intensitySum += intensity;
      if (sent === 'positive') {
        posIntensitySum += intensity;
        posIntensityCount++;
      } else if (sent === 'negative' || sent === 'mixed') {
        negIntensitySum += intensity;
        negIntensityCount++;
      }

      // 4. Severity
      const sev: SeverityType = atom.severity || 'low';
      severityCounts.set(sev, (severityCounts.get(sev) || 0) + 1);

      // 5. Intent
      const int: IntentType = atom.intent || 'complaint';
      intentCounts.set(int, (intentCounts.get(int) || 0) + 1);

      // 6. Rating Alignment
      const align: RatingAlignment = atom.ratingAlignment || 'unavailable';
      alignmentCounts.set(align, (alignmentCounts.get(align) || 0) + 1);
    }

    const avgSentiment = totalVerifiedAtoms > 0
      ? Math.round((sentimentScoreSum / totalVerifiedAtoms) * 100) / 100
      : 0;

    const avgIntensity = totalVerifiedAtoms > 0
      ? Math.round((intensitySum / totalVerifiedAtoms) * 100) / 100
      : 0;

    const posAvgIntensity = posIntensityCount > 0
      ? Math.round((posIntensitySum / posIntensityCount) * 100) / 100
      : 0;

    const negAvgIntensity = negIntensityCount > 0
      ? Math.round((negIntensitySum / negIntensityCount) * 100) / 100
      : 0;

    // Convert distributions to sorted percentage lists
    const emotionalDistribution: EmotionMetric[] = Array.from(emotionCounts.entries())
      .map(([emotion, count]) => ({
        emotion,
        count,
        percentage: totalVerifiedAtoms > 0 ? Math.round((count / totalVerifiedAtoms) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    const severityDistribution: SeverityMetric[] = Array.from(severityCounts.entries())
      .map(([severity, count]) => ({
        severity,
        count,
        percentage: totalVerifiedAtoms > 0 ? Math.round((count / totalVerifiedAtoms) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    const intentDistribution: IntentMetric[] = Array.from(intentCounts.entries())
      .map(([intent, count]) => ({
        intent,
        count,
        percentage: totalVerifiedAtoms > 0 ? Math.round((count / totalVerifiedAtoms) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    const ratingAlignmentDistribution: RatingAlignmentMetric[] = Array.from(alignmentCounts.entries())
      .map(([alignment, count]) => ({
        alignment,
        count,
        percentage: totalVerifiedAtoms > 0 ? Math.round((count / totalVerifiedAtoms) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    // Affected segments
    const segmentSet = new Set<string>();
    for (const f of feedbackList) {
      if (f.customerSegmentName) segmentSet.add(f.customerSegmentName);
    }
    for (const s of segments) {
      if (s.name) segmentSet.add(s.name);
    }

    // Evidence sufficiency calculation
    const minimumReviewsMet = totalFeedback >= this.MIN_REVIEWS_THRESHOLD;
    const minimumAtomsMet = totalVerifiedAtoms >= this.MIN_ATOMS_THRESHOLD;
    const isSufficient = minimumReviewsMet && minimumAtomsMet;

    const sufficiencyMessage = !isSufficient
      ? `${totalFeedback} reviews analyzed, ${totalVerifiedAtoms} verified atoms extracted. More diverse evidence is required before Trace can generate reliable product conclusions.`
      : undefined;

    return {
      totalFeedback,
      totalVerifiedAtoms,
      distinctCustomers,
      distinctSources,
      positiveAtomCount,
      negativeAtomCount,
      neutralAtomCount,
      mixedAtomCount,
      averageSentiment: avgSentiment,
      emotionalDistribution,
      averageEmotionalIntensity: avgIntensity,
      positiveEmotionalIntensity: posAvgIntensity,
      negativeEmotionalIntensity: negAvgIntensity,
      severityDistribution,
      intentDistribution,
      ratingAlignmentDistribution,
      totalThemes: themes.length,
      totalPainPoints: painPoints.length,
      totalOpportunities: opportunities.length,
      affectedCustomerSegments: Array.from(segmentSet),
      evidenceSufficiency: {
        isSufficient,
        minimumReviewsMet,
        minimumAtomsMet,
        message: sufficiencyMessage
      }
    };
  }
}
