import { z } from 'zod';
import { FeedbackAtom, Theme, PainPoint, Opportunity, SeverityType } from '../../types/trace';
import { AuditStatistics } from './audit-statistics';
import { GeminiServerClient } from '../../ai/gemini.server';
import { AIUsageGuard } from '../../ai/usage';
import { env } from '../../config/env';
import { PIPELINE_VERSION, PROMPT_VERSIONS } from '../../ai/versioning';

export const EvidenceClaimSchema = z.object({
  claim: z.string().min(3),
  evidenceAtomIds: z.array(z.string()).min(1),
  themeId: z.string().optional(),
  painPointId: z.string().optional(),
  severity: z.enum(['none', 'low', 'medium', 'high', 'critical']).optional()
});

export const AuditSummarySchema = z.object({
  executiveSummary: z.string().min(10),
  dominantEmotionalExperience: z.string().min(5),
  whatUsersLove: z.array(EvidenceClaimSchema),
  whatUsersStruggleWith: z.array(EvidenceClaimSchema),
  majorProductProblems: z.array(EvidenceClaimSchema),
  emergingConcerns: z.array(z.string()),
  notablePositiveSignals: z.array(z.string()),
  recommendations: z.array(z.string())
});

export type EvidenceClaim = z.infer<typeof EvidenceClaimSchema>;
export type AuditSummaryPayload = z.infer<typeof AuditSummarySchema>;

export interface AuditSummaryResult {
  status: 'sufficient' | 'insufficient_evidence';
  summary?: AuditSummaryPayload;
  statistics: AuditStatistics;
  model: string;
  provider: string;
  promptVersion: string;
  pipelineVersion: string;
  generatedAt: string;
  message?: string;
}

export class AuditSummarySynthesizer {
  /**
   * Synthesizes an evidence-grounded Audit Summary.
   * AI may interpret text, but may NEVER invent evidence, numbers, or quotes.
   * Every claim must reference real verified atom IDs.
   */
  public static async synthesize(
    workspaceId: string,
    statistics: AuditStatistics,
    atoms: FeedbackAtom[],
    themes: Theme[],
    painPoints: PainPoint[],
    opportunities: Opportunity[],
    jobId?: string
  ): Promise<AuditSummaryResult> {
    const timestamp = new Date().toISOString();

    // 1. Evidence Threshold Gate
    if (!statistics.evidenceSufficiency.isSufficient) {
      return {
        status: 'insufficient_evidence',
        statistics,
        model: 'trace-evidence-gate',
        provider: 'trace',
        promptVersion: PROMPT_VERSIONS.themes,
        pipelineVersion: PIPELINE_VERSION,
        generatedAt: timestamp,
        message: statistics.evidenceSufficiency.message
      };
    }

    const verifiedAtoms = atoms.filter(a => a.verificationStatus === 'verified');
    const validAtomIdSet = new Set(verifiedAtoms.map(a => a.id));

    // Try Gemini if configured
    if (GeminiServerClient.isConfigured()) {
      try {
        const result = await this.synthesizeWithGemini(
          workspaceId,
          statistics,
          verifiedAtoms,
          themes,
          painPoints,
          jobId
        );
        if (result) {
          // Filter out any claim where AI hallucinated atom IDs that do not exist
          const sanitizedWhatUsersLove = result.whatUsersLove
            .map(c => ({ ...c, evidenceAtomIds: c.evidenceAtomIds.filter(id => validAtomIdSet.has(id)) }))
            .filter(c => c.evidenceAtomIds.length > 0);

          const sanitizedStruggles = result.whatUsersStruggleWith
            .map(c => ({ ...c, evidenceAtomIds: c.evidenceAtomIds.filter(id => validAtomIdSet.has(id)) }))
            .filter(c => c.evidenceAtomIds.length > 0);

          const sanitizedProblems = result.majorProductProblems
            .map(c => ({ ...c, evidenceAtomIds: c.evidenceAtomIds.filter(id => validAtomIdSet.has(id)) }))
            .filter(c => c.evidenceAtomIds.length > 0);

          return {
            status: 'sufficient',
            summary: {
              ...result,
              whatUsersLove: sanitizedWhatUsersLove,
              whatUsersStruggleWith: sanitizedStruggles,
              majorProductProblems: sanitizedProblems
            },
            statistics,
            model: env.GEMINI_MODEL,
            provider: 'google_gemini',
            promptVersion: PROMPT_VERSIONS.themes,
            pipelineVersion: PIPELINE_VERSION,
            generatedAt: timestamp
          };
        }
      } catch (err) {
        console.warn('[AuditSummarySynthesizer] Gemini summary generation failed; using deterministic synthesizer:', err);
      }
    }

    // 2. Deterministic evidence-grounded fallback synthesizer
    const fallbackSummary = this.synthesizeDeterministic(statistics, verifiedAtoms, themes, painPoints);

    return {
      status: 'sufficient',
      summary: fallbackSummary,
      statistics,
      model: 'trace-audit-synthesizer',
      provider: 'trace',
      promptVersion: PROMPT_VERSIONS.themes,
      pipelineVersion: PIPELINE_VERSION,
      generatedAt: timestamp
    };
  }

  private static async synthesizeWithGemini(
    workspaceId: string,
    stats: AuditStatistics,
    atoms: FeedbackAtom[],
    themes: Theme[],
    painPoints: PainPoint[],
    jobId?: string
  ): Promise<AuditSummaryPayload | null> {
    const startTime = Date.now();

    // Prepare sanitized context (never originalText)
    const atomSnippets = atoms.slice(0, 30).map(a => ({
      id: a.id,
      text: a.atomText,
      intent: a.intent,
      sentiment: a.sentiment,
      emotion: a.emotionalState,
      severity: a.severity
    }));

    const themeSnippets = themes.slice(0, 10).map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      atomCount: t.atomCount
    }));

    const painPointSnippets = painPoints.slice(0, 10).map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      severity: p.severity,
      themeId: p.themeId
    }));

    const prompt = `You are an executive product intelligence advisor. Generate an evidence-grounded Audit Summary for this customer feedback audit.

DETERMINISTIC PERSISTED AUDIT METRICS (DO NOT INVENT DIFFERENT NUMBERS):
- Total Reviews Analyzed: ${stats.totalFeedback}
- Total Verified Atoms: ${stats.totalVerifiedAtoms}
- Average Sentiment Score: ${stats.averageSentiment} (-1.0 to +1.0)
- Positive Atoms: ${stats.positiveAtomCount} | Negative Atoms: ${stats.negativeAtomCount} | Neutral Atoms: ${stats.neutralAtomCount}
- Top Emotions: ${stats.emotionalDistribution.slice(0, 4).map(e => `${e.emotion}: ${e.percentage}%`).join(', ')}
- Severity Breakdown: ${stats.severityDistribution.map(s => `${s.severity}: ${s.percentage}%`).join(', ')}

VERIFIED EVIDENCE ATOMS (Use ONLY these IDs for evidence citations):
${JSON.stringify(atomSnippets, null, 2)}

IDENTIFIED THEMES:
${JSON.stringify(themeSnippets, null, 2)}

IDENTIFIED PAIN POINTS:
${JSON.stringify(painPointSnippets, null, 2)}

INSTRUCTIONS:
1. Every claim in "whatUsersLove", "whatUsersStruggleWith", and "majorProductProblems" MUST have an "evidenceAtomIds" array referencing real atom IDs from the evidence list above.
2. DO NOT invent fake statistics, percentages, or quotes.
3. If there are no positive signals, leave "whatUsersLove" empty.
4. Output strict JSON conforming to this schema:
{
  "executiveSummary": string,
  "dominantEmotionalExperience": string,
  "whatUsersLove": [{ "claim": string, "evidenceAtomIds": string[] }],
  "whatUsersStruggleWith": [{ "claim": string, "evidenceAtomIds": string[], "themeId": string, "painPointId": string }],
  "majorProductProblems": [{ "claim": string, "severity": "none" | "low" | "medium" | "high" | "critical", "evidenceAtomIds": string[] }],
  "emergingConcerns": string[],
  "notablePositiveSignals": string[],
  "recommendations": string[]
}`;

    const raw = await GeminiServerClient.generateJson<Record<string, unknown>>(prompt);
    const parsed = AuditSummarySchema.safeParse(raw);

    if (!parsed.success) {
      console.warn('[AuditSummarySynthesizer] Invalid Gemini audit summary output:', parsed.error.issues);
      return null;
    }

    const durationMs = Date.now() - startTime;
    AIUsageGuard.recordRun({
      workspaceId,
      jobId,
      stage: 'theme_generation',
      operation: 'gemini_audit_summary',
      provider: 'google_gemini',
      model: env.GEMINI_MODEL,
      inputTokens: prompt.length / 4,
      outputTokens: 150,
      estimatedCost: 0.0003,
      durationMs,
      promptVersion: PROMPT_VERSIONS.themes
    });

    return parsed.data;
  }

  /**
   * Deterministic fallback summary:
   * Assembles an evidence-linked executive summary directly from verified atoms, themes, and pain points.
   */
  private static synthesizeDeterministic(
    stats: AuditStatistics,
    atoms: FeedbackAtom[],
    themes: Theme[],
    painPoints: PainPoint[]
  ): AuditSummaryPayload {
    const praiseAtoms = atoms.filter(a => a.intent === 'praise' || a.sentiment === 'positive');
    const bugAtoms = atoms.filter(a => a.intent === 'bug_report' || a.severity === 'critical' || a.severity === 'high');
    const frictionAtoms = atoms.filter(a => a.intent === 'complaint' || a.intent === 'usability_issue' || a.intent === 'pricing');

    const dominantEmotion = stats.emotionalDistribution[0]?.emotion || 'neutral';
    const dominantPercentage = stats.emotionalDistribution[0]?.percentage || 0;

    const executiveSummary = `Customer sentiment across ${stats.totalFeedback} reviews is ${
      stats.averageSentiment >= 0.25 ? 'predominantly positive' : (stats.averageSentiment <= -0.25 ? 'predominantly negative' : 'mixed or balanced')
    } (score: ${stats.averageSentiment.toFixed(2)}). The primary emotional response is ${dominantEmotion} (${dominantPercentage}% of feedback), with ${
      stats.severityDistribution.find(s => s.severity === 'high' || s.severity === 'critical')?.count || 0
    } high-severity user friction items identified.`;

    const whatUsersLove: EvidenceClaim[] = praiseAtoms.length > 0 ? [
      {
        claim: `Users expressed strong satisfaction and praise regarding core product experience.`,
        evidenceAtomIds: praiseAtoms.slice(0, 5).map(a => a.id)
      }
    ] : [];

    const whatUsersStruggleWith: EvidenceClaim[] = painPoints.slice(0, 3).map(pp => {
      const relatedAtoms = atoms.filter(a => a.themeId === pp.themeId || a.atomText.toLowerCase().includes(pp.title.toLowerCase().slice(0, 10)));
      return {
        claim: pp.title,
        evidenceAtomIds: relatedAtoms.length > 0 ? relatedAtoms.slice(0, 5).map(a => a.id) : atoms.slice(0, 2).map(a => a.id),
        themeId: pp.themeId,
        painPointId: pp.id
      };
    });

    const majorProductProblems: EvidenceClaim[] = bugAtoms.slice(0, 3).map(ba => ({
      claim: `Technical stability friction: "${ba.atomText.slice(0, 60)}..."`,
      severity: ba.severity || 'high',
      evidenceAtomIds: [ba.id]
    }));

    return {
      executiveSummary,
      dominantEmotionalExperience: `${dominantEmotion.toUpperCase()} (${dominantPercentage}% of evidence)`,
      whatUsersLove,
      whatUsersStruggleWith,
      majorProductProblems,
      emergingConcerns: frictionAtoms.slice(0, 3).map(a => `User friction around ${a.intent.replace('_', ' ')}: "${a.atomText.slice(0, 50)}..."`),
      notablePositiveSignals: praiseAtoms.slice(0, 3).map(a => `Positive customer quote: "${a.atomText.slice(0, 50)}..."`),
      recommendations: [
        'Prioritize addressing critical defects and recurring stability issues.',
        'Review usability and navigation friction reported in customer evidence.',
        'Protect and celebrate key features that drive high customer praise.'
      ]
    };
  }
}
