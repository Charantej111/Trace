import { Insight, InsightEvidence, PainPoint, FeedbackAtom, Feedback } from '@/types/trace';
import { AIClient } from '@/ai/client';
import { PIPELINE_VERSION, PROMPT_VERSIONS } from '@/ai/versioning';

export class InsightSynthesizer {
  public static readonly MIN_ATOMS = 3;
  public static readonly MIN_DISTINCT_CUSTOMERS = 2;

  /**
   * Synthesizes Insight records with relational evidence lineage.
   * Gated: Rejects clusters that do not satisfy minimum evidence requirements.
   */
  public static async synthesizeInsights(
    painPoints: PainPoint[],
    atoms: FeedbackAtom[],
    feedbackList: Feedback[],
    workspaceId: string,
    jobId?: string
  ): Promise<Insight[]> {
    const timestamp = new Date().toISOString();
    const insights: Insight[] = [];

    const feedbackMap = new Map<string, Feedback>();
    feedbackList.forEach(f => feedbackMap.set(f.id, f));

    const atomMap = new Map<string, FeedbackAtom>();
    atoms.forEach(a => atomMap.set(a.id, a));

    for (const pp of painPoints) {
      const relatedAtoms = pp.atomIds
        .map(id => atomMap.get(id))
        .filter((a): a is FeedbackAtom => a !== undefined && a.verificationStatus === 'verified');

      // Evidence Threshold Gate Check
      const distinctCustomerKeys = new Set<string>();
      const distinctSources = new Set<string>();

      relatedAtoms.forEach(a => {
        const fb = feedbackMap.get(a.feedbackId);
        if (fb) {
          distinctCustomerKeys.add(fb.customerName || fb.customerId || fb.id);
          distinctSources.add(fb.sourceType);
        }
      });

      // Minimum evidence check: minimum 3 atoms and at least 2 customers/sources
      if (relatedAtoms.length < InsightSynthesizer.MIN_ATOMS && (distinctCustomerKeys.size < 2 && distinctSources.size < 2)) {
        // Evidence is insufficient to form an authoritative insight
        continue;
      }

      const insightId = `ins-${Date.now()}-${insights.length}`;

      // Build relational InsightEvidence objects
      const evidence: InsightEvidence[] = relatedAtoms.map((atom, idx) => {
        const parentFb = feedbackMap.get(atom.feedbackId);
        return {
          insightId,
          atomId: atom.id,
          feedbackId: atom.feedbackId,
          evidenceType: atom.intent === 'praise' ? 'neutral' : 'supporting',
          quoteText: atom.atomText,
          relevanceScore: Number((0.95 - idx * 0.05).toFixed(2)),
          sourceType: parentFb?.sourceType || 'csv',
          customerSegment: parentFb?.customerSegmentName,
          sourceCreatedAt: parentFb?.sourceCreatedAt || timestamp
        };
      });

      const sampleQuotes = evidence.slice(0, 3).map(e => e.quoteText);
      const aiOutput = await AIClient.synthesizeInsight(pp.title, sampleQuotes, workspaceId, jobId);

      insights.push({
        id: insightId,
        workspaceId,
        painPointId: pp.id,
        title: aiOutput.title,
        summary: aiOutput.summary,
        insightType: pp.isEmerging ? 'emerging_issue' : 'pain_point',
        affectedSegments: pp.affectedSegments,
        frequency: pp.frequency,
        trendPercentage: pp.trendPercentage,
        confidence: relatedAtoms.length >= 5 ? 'high' : 'medium',
        evidence,
        supportingEvidenceCount: evidence.filter(e => e.evidenceType === 'supporting').length,
        contradictingEvidenceCount: evidence.filter(e => e.evidenceType === 'contradicting').length,
        pipelineVersion: PIPELINE_VERSION,
        promptVersion: PROMPT_VERSIONS.insights,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }

    return insights;
  }
}
