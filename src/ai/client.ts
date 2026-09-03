import { AI_MODELS, PROMPT_VERSIONS } from './versioning';
import { AIUsageGuard } from './usage';
import { IntentType, SeverityType, SentimentType } from '@/types/trace';
import { GeminiServerClient } from './gemini.server';
import { env } from '@/config/env';
import { Classifier } from '../intelligence/classification/classifier';

export interface AnalysisInput {
  analysisText: string;
}

export interface ProposedAtom {
  atomText: string;
  intent: IntentType;
  sentiment: SentimentType;
  sentimentScore: number;
  severity: SeverityType;
  isFeatureRequest: boolean;
  underlyingProblemHint?: string;
}

export interface ThemeSynthesisOutput {
  name: string;
  description: string;
  topKeywords: string[];
}

export interface PainPointSynthesisOutput {
  title: string;
  description: string;
  hypothesis?: string;
  severity: SeverityType;
}

export interface InsightSynthesisOutput {
  title: string;
  summary: string;
  insightType: 'pain_point' | 'feature_request' | 'trend' | 'emerging_issue' | 'divergent_signal';
}

export interface OpportunitySynthesisOutput {
  title: string;
  problemStatement: string;
  opportunityStatement: string;
  suggestedSolution: string;
}

export class AIClient {
  /**
   * Clause decomposition & NLP classification on sanitized analysisText.
   * Locked rule: originalText is NEVER passed to this function.
   * If Gemini is configured, calls live Gemini API with structured JSON output;
   * otherwise falls back to deterministic NLP tokenizer.
   */
  public static async atomizeAndClassify(
    input: AnalysisInput,
    workspaceId: string,
    jobId?: string
  ): Promise<ProposedAtom[]> {
    const startTime = Date.now();
    const text = input.analysisText.trim();
    if (!text) return [];

    // Try Live Gemini AI if configured
    if (GeminiServerClient.isConfigured()) {
      try {
        const prompt = `You are a product intelligence classifier. Decompose the following sanitized customer feedback into discrete clause atoms.
Each atom must be an EXACT substring extracted from the feedback text without paraphrasing.

Return a JSON array of objects with these exact fields:
- "atomText": string (exact substring from the feedback text)
- "intent": "bug_report" | "complaint" | "feature_request" | "praise" | "question"
- "sentiment": "positive" | "neutral" | "negative"
- "sentimentScore": number between -1.0 and 1.0
- "severity": "low" | "medium" | "high" | "critical"
- "isFeatureRequest": boolean
- "underlyingProblemHint": optional string describing the underlying user friction

Feedback Text:
"${text}"`;

        const geminiResult = await GeminiServerClient.generateJson<ProposedAtom[]>(prompt);
        if (Array.isArray(geminiResult) && geminiResult.length > 0) {
          const durationMs = Date.now() - startTime;
          AIUsageGuard.recordRun({
            workspaceId,
            jobId,
            stage: 'atomization',
            operation: 'gemini_atomize_and_classify',
            provider: 'google_gemini',
            model: env.GEMINI_MODEL,
            inputTokens: text.length / 4,
            outputTokens: geminiResult.length * 20,
            estimatedCost: 0.0001 * geminiResult.length,
            durationMs,
            promptVersion: PROMPT_VERSIONS.atomization
          });
          return geminiResult;
        }
      } catch (err) {
        console.warn('[AIClient] Gemini atomization failed or returned empty; falling back to deterministic tokenizer:', err);
      }
    }

    // Fallback: Deterministic clause tokenizer
    const clauses = text
      .split(/(?<=[.!?])\s+|,\s+and\s+|,\s+but\s+|;\s+|\n+/)
      .map(c => c.trim())
      .filter(c => c.length >= 3);

    const atomsToProcess = clauses.length > 0 ? clauses : [text];

    const result: ProposedAtom[] = atomsToProcess.map(clause => {
      const classified = Classifier.classifyContextually(clause, { analysisText: text });
      return {
        atomText: clause,
        intent: classified.intent,
        sentiment: classified.sentiment,
        sentimentScore: classified.sentimentScore,
        severity: classified.severity,
        isFeatureRequest: classified.intent === 'feature_request',
        underlyingProblemHint: classified.intent === 'feature_request'
          ? `User struggle in current workflow: "${clause.slice(0, 45)}..."`
          : undefined
      };
    });

    const durationMs = Date.now() - startTime;
    AIUsageGuard.recordRun({
      workspaceId,
      jobId,
      stage: 'atomization',
      operation: 'atomize_and_classify',
      provider: 'trace_nlp',
      model: AI_MODELS.classification,
      inputTokens: text.length / 4,
      outputTokens: result.length * 15,
      estimatedCost: 0.0001 * result.length,
      durationMs,
      promptVersion: PROMPT_VERSIONS.atomization
    });

    return result;
  }

  /**
   * Generates a normalized 1536-dim semantic embedding vector for sanitized analysisText.
   */
  public static async generateEmbedding(
    input: AnalysisInput,
    workspaceId: string,
    jobId?: string
  ): Promise<{ vector: number[]; model: string; version: string; dimensions: number }> {
    const startTime = Date.now();
    const text = input.analysisText.toLowerCase().trim();

    if (GeminiServerClient.isConfigured()) {
      try {
        const geminiVec = await GeminiServerClient.generateEmbedding(text);
        if (geminiVec && geminiVec.length > 0) {
          const durationMs = Date.now() - startTime;
          AIUsageGuard.recordRun({
            workspaceId,
            jobId,
            stage: 'embedding',
            operation: 'gemini_embedding',
            provider: 'google_gemini',
            model: env.GEMINI_EMBEDDING_MODEL,
            inputTokens: text.length / 4,
            outputTokens: geminiVec.length,
            estimatedCost: 0.00002,
            durationMs,
            promptVersion: 'v1.0'
          });

          return {
            vector: geminiVec,
            model: env.GEMINI_EMBEDDING_MODEL,
            version: 'gemini-v1',
            dimensions: geminiVec.length
          };
        }
      } catch (err) {
        console.warn('[AIClient] Gemini embedding failed; falling back to deterministic embedding:', err);
      }
    }

    // High-dimensional deterministic semantic embedding generator
    const dim = AI_MODELS.embeddingDimensions;
    const vector = new Array(dim).fill(0);

    // Hash token distribution across embedding space
    const tokens = text.split(/\W+/).filter(t => t.length > 1);
    tokens.forEach((token, tIdx) => {
      let hash = 0;
      for (let i = 0; i < token.length; i++) {
        hash = (hash << 5) - hash + token.charCodeAt(i);
        hash |= 0;
      }
      const baseIdx = Math.abs(hash) % dim;
      vector[baseIdx] += 1.0 / (tIdx + 1);
      vector[(baseIdx + 7) % dim] += 0.5;
      vector[(baseIdx + 31) % dim] += 0.25;
    });

    // L2 Normalize
    const norm = Math.sqrt(vector.reduce((acc, v) => acc + v * v, 0)) || 1.0;
    const normalizedVector = vector.map(v => Number((v / norm).toFixed(6)));

    const durationMs = Date.now() - startTime;
    AIUsageGuard.recordRun({
      workspaceId,
      jobId,
      stage: 'embedding',
      operation: 'generate_embedding',
      provider: 'trace_embedding',
      model: AI_MODELS.embedding,
      inputTokens: text.length / 4,
      outputTokens: dim,
      estimatedCost: 0.00002,
      durationMs,
      promptVersion: 'v1.0'
    });

    return {
      vector: normalizedVector,
      model: AI_MODELS.embedding,
      version: AI_MODELS.embeddingVersion,
      dimensions: dim
    };
  }

  /**
   * Synthesizes theme descriptive name and summary from clustered atom texts.
   */
  public static async synthesizeTheme(
    clusterSampleTexts: string[],
    workspaceId: string,
    jobId?: string
  ): Promise<ThemeSynthesisOutput> {
    if (GeminiServerClient.isConfigured() && clusterSampleTexts.length > 0) {
      try {
        const prompt = `Synthesize a concise theme for this cluster of customer feedback statements.
Feedback clauses:
${clusterSampleTexts.slice(0, 10).map(t => `- ${t}`).join('\n')}

Return JSON with exact keys:
- "name": concise title (e.g. "Export Reliability & Performance")
- "description": 1-2 sentence explanation of the theme
- "topKeywords": array of up to 5 keywords`;

        const res = await GeminiServerClient.generateJson<ThemeSynthesisOutput>(prompt);
        if (res && res.name && res.description) {
          return res;
        }
      } catch (err) {
        console.warn('[AIClient] Gemini theme synthesis fallback:', err);
      }
    }

    const combined = clusterSampleTexts.join(' ').toLowerCase();

    // Extract top domain keywords
    const keywords = ['login', 'auth', 'export', 'performance', 'latency', 'billing', 'crash', 'filter', 'dashboard', 'search', 'reports', 'mobile', 'sync']
      .filter(k => combined.includes(k));

    const topWord = keywords[0] || 'Usability';
    const capitalized = topWord.charAt(0).toUpperCase() + topWord.slice(1);

    const name = `${capitalized} & Operational Reliability`;
    const description = `Customers frequently report issues and feature requests regarding ${topWord} operations, workflow friction, and system responsiveness.`;

    AIUsageGuard.recordRun({
      workspaceId,
      jobId,
      stage: 'theme_generation',
      operation: 'synthesize_theme',
      provider: 'trace_ai',
      model: AI_MODELS.synthesis,
      inputTokens: combined.length / 4,
      outputTokens: 50,
      estimatedCost: 0.0002,
      durationMs: 40,
      promptVersion: PROMPT_VERSIONS.themes
    });

    return {
      name,
      description,
      topKeywords: keywords.slice(0, 5)
    };
  }

  /**
   * Synthesizes pain point problem description and root cause hypothesis.
   */
  public static async synthesizePainPoint(
    themeName: string,
    sampleQuotes: string[],
    workspaceId: string,
    jobId?: string
  ): Promise<PainPointSynthesisOutput> {
    if (GeminiServerClient.isConfigured() && sampleQuotes.length > 0) {
      try {
        const prompt = `Given theme "${themeName}" and sample customer quotes:
${sampleQuotes.slice(0, 6).map(q => `- ${q}`).join('\n')}

Synthesize the primary pain point. Return JSON with:
- "title": clear pain point title
- "description": description of customer struggle
- "hypothesis": potential technical or UX root cause hypothesis
- "severity": "low" | "medium" | "high" | "critical"`;

        const res = await GeminiServerClient.generateJson<PainPointSynthesisOutput>(prompt);
        if (res && res.title && res.description) {
          return res;
        }
      } catch (err) {
        console.warn('[AIClient] Gemini pain point synthesis fallback:', err);
      }
    }

    const title = `Recurring friction in ${themeName}`;
    const description = `Aggregated evidence highlights frequent customer disruption during ${themeName.toLowerCase()} tasks.`;
    const hypothesis = `Possible root cause hypothesis: underlying API latency or insufficient error state recovery.`;

    AIUsageGuard.recordRun({
      workspaceId,
      jobId,
      stage: 'pain_point_generation',
      operation: 'synthesize_pain_point',
      provider: 'trace_ai',
      model: AI_MODELS.synthesis,
      inputTokens: themeName.length + sampleQuotes.join(' ').length / 4,
      outputTokens: 40,
      estimatedCost: 0.00015,
      durationMs: 30,
      promptVersion: PROMPT_VERSIONS.painPoints
    });

    return {
      title,
      description,
      hypothesis,
      severity: 'high'
    };
  }

  /**
   * Synthesizes explainable insight statement with supporting quote grounding.
   */
  public static async synthesizeInsight(
    painPointTitle: string,
    frequency: number,
    supportingQuotes: string[],
    workspaceId: string,
    jobId?: string
  ): Promise<InsightSynthesisOutput> {
    const startTime = Date.now();

    if (GeminiServerClient.isConfigured() && supportingQuotes.length > 0) {
      try {
        const prompt = `You are a product management analyst. Synthesize an explainable insight for this customer problem cluster.
Problem: "${painPointTitle}"
Customer Mentions: ${frequency}
Evidence Quotes:
${supportingQuotes.slice(0, 6).map(q => `- "${q}"`).join('\n')}

Output strict JSON:
{
  "title": string,
  "summary": string,
  "insightType": "pain_point" | "feature_request" | "trend" | "emerging_issue" | "divergent_signal"
}`;

        const res = await GeminiServerClient.generateJson<InsightSynthesisOutput>(prompt);
        if (res && res.title && res.summary) {
          const durationMs = Date.now() - startTime;
          AIUsageGuard.recordRun({
            workspaceId,
            jobId,
            stage: 'insight_generation',
            operation: 'gemini_synthesize_insight',
            provider: 'google_gemini',
            model: env.GEMINI_MODEL,
            inputTokens: prompt.length / 4,
            outputTokens: 50,
            estimatedCost: 0.0002,
            durationMs,
            promptVersion: PROMPT_VERSIONS.insights
          });
          return res;
        }
      } catch (err) {
        console.warn('[AIClient] Gemini insight synthesis fallback:', err);
      }
    }

    const title = painPointTitle;
    const summary = `Evidence across ${frequency} customer mentions indicates recurrent friction disrupting user workflow.`;

    const durationMs = Date.now() - startTime;
    AIUsageGuard.recordRun({
      workspaceId,
      jobId,
      stage: 'insight_generation',
      operation: 'synthesize_insight',
      provider: 'trace_ai',
      model: AI_MODELS.synthesis,
      inputTokens: painPointTitle.length + supportingQuotes.join(' ').length / 4,
      outputTokens: 45,
      estimatedCost: 0.00018,
      durationMs,
      promptVersion: PROMPT_VERSIONS.insights
    });

    return {
      title,
      summary,
      insightType: 'pain_point'
    };
  }

  /**
   * Synthesizes actionable product opportunity candidate linked to customer struggle.
   */
  public static async synthesizeOpportunity(
    insightTitle: string,
    customerStruggleSummary: string,
    workspaceId: string,
    jobId?: string
  ): Promise<OpportunitySynthesisOutput> {
    const startTime = Date.now();

    if (GeminiServerClient.isConfigured()) {
      try {
        const prompt = `You are a Principal Product Manager. Synthesize an actionable product opportunity based on this customer insight.
Insight: "${insightTitle}"
Customer Struggle: "${customerStruggleSummary}"

Output strict JSON:
{
  "title": string,
  "problemStatement": string,
  "opportunityStatement": string,
  "suggestedSolution": string
}`;

        const res = await GeminiServerClient.generateJson<OpportunitySynthesisOutput>(prompt);
        if (res && res.title && res.opportunityStatement) {
          const durationMs = Date.now() - startTime;
          AIUsageGuard.recordRun({
            workspaceId,
            jobId,
            stage: 'opportunity_generation',
            operation: 'gemini_synthesize_opportunity',
            provider: 'google_gemini',
            model: env.GEMINI_MODEL,
            inputTokens: prompt.length / 4,
            outputTokens: 60,
            estimatedCost: 0.00025,
            durationMs,
            promptVersion: PROMPT_VERSIONS.opportunities
          });
          return res;
        }
      } catch (err) {
        console.warn('[AIClient] Gemini opportunity synthesis fallback:', err);
      }
    }

    const title = `Resolve: ${insightTitle}`;
    const problemStatement = customerStruggleSummary;
    const opportunityStatement = `Resolving friction in ${insightTitle.toLowerCase()} eliminates recurring disruption and improves customer retention.`;
    const suggestedSolution = `Address the root causes highlighted in customer evidence and implement error prevention for the workflow.`;

    const durationMs = Date.now() - startTime;
    AIUsageGuard.recordRun({
      workspaceId,
      jobId,
      stage: 'opportunity_generation',
      operation: 'synthesize_opportunity',
      provider: 'trace_ai',
      model: AI_MODELS.synthesis,
      inputTokens: insightTitle.length + customerStruggleSummary.length / 4,
      outputTokens: 60,
      estimatedCost: 0.00025,
      durationMs,
      promptVersion: PROMPT_VERSIONS.opportunities
    });

    return {
      title,
      problemStatement,
      opportunityStatement,
      suggestedSolution
    };
  }
}
