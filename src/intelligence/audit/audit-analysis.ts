import {
  Feedback,
  FeedbackAtom,
  Theme,
  PainPoint,
  Insight,
  Opportunity,
  CustomerSegment,
  EmotionalState,
  SeverityType,
  ConfidenceLevel
} from '../../types/trace';

export interface PainPointEmotionalBreakdown {
  emotion: EmotionalState;
  count: number;
  percentage: number;
}

export interface DetailedPainPointAnalysis {
  painPointId: string;
  problemTitle: string;
  userExperience: string;
  hypothesis?: string;
  severity: SeverityType;

  // Emotional Response breakdown
  emotionalResponse: PainPointEmotionalBreakdown[];

  // Evidence Volume
  verifiedAtomsCount: number;
  distinctReviewsCount: number;
  distinctCustomersCount: number;

  // Strategic & Trend Signals
  trendSignal: string;
  affectedSegments: string[];

  // Lineage & Downstream Strategy
  relatedTheme?: { id: string; name: string };
  relatedInsight?: { id: string; statement: string };
  relatedOpportunity?: { id: string; title: string; priorityScore: number };

  // Representative Quotes with Exact Offsets
  representativeQuotes: {
    feedbackId: string;
    atomText: string;
    sourceStart: number;
    sourceEnd: number;
    customerName?: string;
    rating?: number;
    sourceType?: string;
  }[];

  priorityScore: number;
  evidenceConfidence: ConfidenceLevel;
}

export class DetailedAuditAnalyzer {
  /**
   * Builds the detailed PM analysis for each major product pain point.
   * All factual numbers, percentages, and evidence counts are calculated deterministically.
   */
  public static analyzePainPoints(
    painPoints: PainPoint[],
    atoms: FeedbackAtom[],
    feedbackList: Feedback[],
    themes: Theme[],
    insights: Insight[],
    opportunities: Opportunity[],
    segments: CustomerSegment[] = []
  ): DetailedPainPointAnalysis[] {
    const feedbackMap = new Map(feedbackList.map(f => [f.id, f]));
    const verifiedAtoms = atoms.filter(a => a.verificationStatus === 'verified');

    let targetPainPoints = [...painPoints];

    if (targetPainPoints.length === 0 && themes.length > 0) {
      targetPainPoints = themes.map(t => ({
        id: `pp-derived-${t.id}`,
        workspaceId: t.workspaceId,
        themeId: t.id,
        themeName: t.name,
        title: `${t.name} Friction Pattern`,
        description: t.description || `Observed friction and customer feedback regarding ${t.name}.`,
        severity: 'medium',
        frequency: t.atomCount || 1,
        trendPercentage: 0,
        isEmerging: false,
        velocityMultiplier: 1.0,
        confidence: t.confidence,
        affectedSegments: [],
        atomIds: t.atomIds,
        pipelineVersion: '1.0.0',
        createdAt: t.createdAt,
        updatedAt: t.createdAt
      }));
    } else if (targetPainPoints.length === 0 && verifiedAtoms.length > 0) {
      const negativeAtoms = verifiedAtoms.filter(a => a.sentiment === 'negative' || a.intent === 'bug_report' || a.intent === 'complaint');
      const atomsToUse = negativeAtoms.length > 0 ? negativeAtoms : verifiedAtoms;
      targetPainPoints = [{
        id: 'pp-derived-general',
        workspaceId: atomsToUse[0]?.workspaceId || 'ws-default',
        title: 'Core Customer Friction Patterns',
        description: 'Customer feedback indicates key friction areas and usability opportunities across core product workflows.',
        severity: 'medium',
        frequency: atomsToUse.length,
        trendPercentage: 0,
        isEmerging: false,
        velocityMultiplier: 1.0,
        confidence: atomsToUse.length >= 5 ? 'high' : 'medium',
        affectedSegments: [],
        atomIds: atomsToUse.map(a => a.id),
        pipelineVersion: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }];
    }

    return targetPainPoints.map(pp => {
      // Find atoms associated with this pain point (by atomIds, themeId, or direct relation)
      let relatedAtoms = verifiedAtoms.filter(a => (pp.atomIds && pp.atomIds.includes(a.id)) || (a.themeId && a.themeId === pp.themeId));
      if (relatedAtoms.length === 0) {
        // Fallback: match by keywords in title
        const keywords = pp.title.toLowerCase().split(/\s+/).filter(w => w.length >= 4);
        relatedAtoms = verifiedAtoms.filter(a => {
          const lower = a.atomText.toLowerCase();
          return keywords.some(k => lower.includes(k));
        });
      }

      if (relatedAtoms.length === 0 && verifiedAtoms.length > 0) {
        relatedAtoms = verifiedAtoms.slice(0, 3);
      }

      // 1. Evidence Volume
      const verifiedAtomsCount = relatedAtoms.length;
      const associatedFeedback = relatedAtoms
        .map(a => feedbackMap.get(a.feedbackId))
        .filter((f): f is Feedback => Boolean(f));

      const distinctReviewsCount = new Set(associatedFeedback.map(f => f.id)).size;
      const distinctCustomersCount = new Set(
        associatedFeedback.map(f => f.customerId || f.customerName).filter(Boolean)
      ).size || Math.max(1, distinctReviewsCount);

      // 2. Emotional Response Breakdown
      const emoMap = new Map<EmotionalState, number>();
      for (const a of relatedAtoms) {
        const emo = a.emotionalState || 'frustration';
        emoMap.set(emo, (emoMap.get(emo) || 0) + 1);
      }

      const emotionalResponse: PainPointEmotionalBreakdown[] = Array.from(emoMap.entries())
        .map(([emotion, count]) => ({
          emotion,
          count,
          percentage: verifiedAtomsCount > 0 ? Math.round((count / verifiedAtomsCount) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count);

      // 3. Affected Segments
      const segmentSet = new Set<string>();
      for (const f of associatedFeedback) {
        if (f.customerSegmentName) segmentSet.add(f.customerSegmentName);
      }
      if (segmentSet.size === 0 && segments.length > 0) {
        segments.slice(0, 2).forEach(s => segmentSet.add(s.name));
      }

      // 4. Lineage
      const relatedTheme = themes.find(t => t.id === pp.themeId);
      const relatedInsight = insights.find(i => i.painPointId === pp.id);
      const relatedOpportunity = opportunities.find(o =>
        relatedInsight && o.insightId === relatedInsight.id
      );

      // 5. Representative Quotes
      const representativeQuotes = relatedAtoms.slice(0, 3).map(a => {
        const parent = feedbackMap.get(a.feedbackId);
        return {
          feedbackId: a.feedbackId,
          atomText: a.atomText,
          sourceStart: a.sourceStart,
          sourceEnd: a.sourceEnd,
          customerName: parent?.customerName,
          rating: parent?.rating,
          sourceType: parent?.sourceType
        };
      });

      // Priority Score & Confidence
      const priorityScore = relatedOpportunity?.overallPriorityScore ??
        (pp.severity === 'critical' ? 85 : pp.severity === 'high' ? 75 : 60);

      const evidenceConfidence: ConfidenceLevel =
        distinctReviewsCount >= 5 ? 'high' : distinctReviewsCount >= 2 ? 'medium' : 'low';

      return {
        painPointId: pp.id,
        problemTitle: pp.title,
        userExperience: pp.description,
        hypothesis: pp.hypothesis,
        severity: pp.severity,
        emotionalResponse,
        verifiedAtomsCount,
        distinctReviewsCount,
        distinctCustomersCount,
        trendSignal: distinctReviewsCount >= 5
          ? `High Volume (${distinctReviewsCount} reviews)`
          : (distinctReviewsCount >= 2 ? `Recurring Signal (${distinctReviewsCount} reviews)` : 'Emerging Baseline'),
        affectedSegments: Array.from(segmentSet),
        relatedTheme: relatedTheme ? { id: relatedTheme.id, name: relatedTheme.name } : undefined,
        relatedInsight: relatedInsight ? { id: relatedInsight.id, statement: relatedInsight.title || relatedInsight.summary } : undefined,
        relatedOpportunity: relatedOpportunity ? {
          id: relatedOpportunity.id,
          title: relatedOpportunity.title,
          priorityScore: relatedOpportunity.overallPriorityScore || 70
        } : undefined,
        representativeQuotes,
        priorityScore,
        evidenceConfidence
      };
    });
  }
}
