import {
  Opportunity,
  Insight,
  ProductContext,
  CustomerSegment,
  FeedbackAtom
} from '@/types/trace';
import { FrequencyScorer } from './frequency-scorer';
import { SeverityScorer } from './severity-scorer';
import { TrendScorer } from './trend-scorer';
import { SegmentScorer } from './segment-scorer';
import { StrategyScorer } from './strategy-scorer';
import { ConfidenceEvaluator } from './confidence-evaluator';
import { AIClient } from '@/ai/client';
import { PIPELINE_VERSION } from '@/ai/versioning';

export class ExplainableScoringEngine {
  /**
   * LOCKED FORMULA:
   * Priority Score = Frequency(25%) + Severity(25%) + Trend(15%) + Segment(20%) + Strategy(15%)
   */
  public static calculateOpportunityScore(params: {
    frequency: number;
    atoms: FeedbackAtom[];
    trendPercentage: number;
    isEmerging: boolean;
    affectedSegments: { segment: string; count: number; percentage: number }[];
    configuredSegments: CustomerSegment[];
    opportunityTitle: string;
    problemStatement: string;
    context?: ProductContext;
    maxWorkspaceMentions?: number;
  }): {
    scoreFrequency: number;
    scoreSeverity: number;
    scoreTrend: number;
    scoreSegmentImpact: number;
    scoreStrategicRelevance: number;
    overallPriorityScore: number;
  } {
    const scoreFrequency = FrequencyScorer.calculate(params.frequency, params.maxWorkspaceMentions);
    const scoreSeverity = SeverityScorer.calculate(params.atoms.map(a => a.severity));
    const scoreTrend = TrendScorer.calculate(params.trendPercentage, params.isEmerging);
    const scoreSegmentImpact = SegmentScorer.calculate(params.affectedSegments, params.configuredSegments);
    const scoreStrategicRelevance = StrategyScorer.calculate(
      params.opportunityTitle,
      params.problemStatement,
      params.context
    );

    // Exact 5-factor weighted calculation (0 - 100)
    const composite =
      scoreFrequency * 0.25 +
      scoreSeverity * 0.25 +
      scoreTrend * 0.15 +
      scoreSegmentImpact * 0.20 +
      scoreStrategicRelevance * 0.15;

    const overallPriorityScore = Math.min(100, Math.max(0, Math.round(composite)));

    return {
      scoreFrequency,
      scoreSeverity,
      scoreTrend,
      scoreSegmentImpact,
      scoreStrategicRelevance,
      overallPriorityScore
    };
  }

  /**
   * Synthesizes Opportunity initiatives gated strictly by valid insights and customer evidence.
   * HARD EVIDENCE GATE: Rejects any opportunity with 0 valid insights or 0 evidence atoms.
   */
  public static async synthesizeOpportunities(params: {
    insights: Insight[];
    atoms: FeedbackAtom[];
    context?: ProductContext;
    customerSegments: CustomerSegment[];
    workspaceId: string;
    jobId?: string;
  }): Promise<Opportunity[]> {
    const timestamp = new Date().toISOString();
    const opportunities: Opportunity[] = [];

    const atomMap = new Map<string, FeedbackAtom>();
    params.atoms.forEach(a => atomMap.set(a.id, a));

    for (const insight of params.insights) {
      // Hard Evidence Gate Check: Must have verified supporting evidence
      if (!insight.evidence || insight.evidence.length === 0) {
        continue;
      }

      const insightAtoms = insight.evidence
        .map(e => atomMap.get(e.atomId))
        .filter((a): a is FeedbackAtom => a !== undefined);

      if (insightAtoms.length === 0) {
        continue;
      }

      // AI synthesizes opportunity statement and suggested product intervention
      const aiOutput = await AIClient.synthesizeOpportunity(
        insight.title,
        insight.summary,
        params.workspaceId,
        params.jobId
      );

      // Deterministic Multi-Factor Score Calculation
      const scores = ExplainableScoringEngine.calculateOpportunityScore({
        frequency: insight.frequency,
        atoms: insightAtoms,
        trendPercentage: insight.trendPercentage,
        isEmerging: insight.insightType === 'emerging_issue',
        affectedSegments: insight.affectedSegments,
        configuredSegments: params.customerSegments,
        opportunityTitle: aiOutput.title,
        problemStatement: aiOutput.problemStatement,
        context: params.context
      });

      // Independent Evidence Confidence
      const evidenceConfidence = ConfidenceEvaluator.evaluate(insight.evidence);

      opportunities.push({
        id: `opp-${Date.now()}-${opportunities.length}`,
        workspaceId: params.workspaceId,
        insightId: insight.id,
        title: aiOutput.title,
        problemStatement: aiOutput.problemStatement,
        opportunityStatement: aiOutput.opportunityStatement,
        suggestedSolution: aiOutput.suggestedSolution,
        targetSegments: insight.affectedSegments.map(s => s.segment),
        scoreFrequency: scores.scoreFrequency,
        scoreSeverity: scores.scoreSeverity,
        scoreTrend: scores.scoreTrend,
        scoreSegmentImpact: scores.scoreSegmentImpact,
        scoreStrategicRelevance: scores.scoreStrategicRelevance,
        overallPriorityScore: scores.overallPriorityScore,
        evidenceConfidence,
        status: 'suggested',
        confidence: insight.confidence,
        evidenceCount: insight.evidence.length,
        supportingInsightIds: [insight.id],
        supportingAtomIds: insightAtoms.map(a => a.id),
        pipelineVersion: PIPELINE_VERSION,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }

    return opportunities;
  }
}
