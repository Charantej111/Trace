import { FeedbackAtom } from '../../types/trace';
import { GeminiServerClient } from '../../ai/gemini.server';
import { AIUsageGuard } from '../../ai/usage';
import { env } from '../../config/env';
import { PIPELINE_VERSION, PROMPT_VERSIONS } from '../../ai/versioning';
import {
  ClassificationContext,
  ClassificationOutputSchema,
  ValidatedClassification,
  RatingAlignmentSchema
} from './schemas';

export class Classifier {
  /**
   * Production-grade contextual classifier.
   * Review text is primary evidence; rating is a contextual signal.
   * If Gemini is available, uses structured JSON output validated against Zod.
   * Always runs deterministic sanity checks to prevent obvious contradictions.
   */
  public static async classifyAtom(
    atom: FeedbackAtom,
    context?: ClassificationContext,
    jobId?: string
  ): Promise<FeedbackAtom> {
    const safeContext: ClassificationContext = context || {
      analysisText: atom.atomText
    };

    let result: ValidatedClassification | null = null;

    // 1. Try AI contextual classification with Gemini if configured
    if (GeminiServerClient.isConfigured()) {
      try {
        result = await this.classifyWithGemini(atom, safeContext, jobId);
      } catch (err) {
        console.warn(`[Classifier] Gemini classification failed for atom ${atom.id}, using contextual semantic engine:`, err);
      }
    }

    // 2. Fallback to contextual semantic engine (handles emojis, typos, negation, contrast)
    if (!result) {
      result = this.classifyContextually(atom.atomText, safeContext);
    }

    // 3. Deterministic Sanity & Contradiction Gate
    result = this.applySanityGate(atom.atomText, safeContext, result);

    return {
      ...atom,
      intent: result.intent,
      sentiment: result.sentiment,
      sentimentScore: result.sentimentScore,
      sentimentLabel: result.sentimentLabel,
      emotionalState: result.emotionalState,
      emotionalIntensity: result.emotionalIntensity,
      severity: result.severity,
      classificationConfidence: result.confidence,
      ratingAlignment: result.ratingAlignment,
      model: result.model,
      promptVersion: result.promptVersion,
      pipelineVersion: result.pipelineVersion
    };
  }

  /**
   * Calls Gemini structured JSON classification with review-level context and rating.
   */
  private static async classifyWithGemini(
    atom: FeedbackAtom,
    context: ClassificationContext,
    jobId?: string
  ): Promise<ValidatedClassification | null> {
    const startTime = Date.now();

    const prompt = `You are a product management intelligence classifier. Analyze this feedback atom within the context of its parent customer review.
Review text is the PRIMARY evidence. The rating is a supporting contextual signal (never let rating blindly override text).

Parent Review Text (sanitized):
"${context.analysisText}"
${context.rating ? `Store Rating: ${context.rating} / 5 stars` : 'Store Rating: Not provided'}
${context.appVersion ? `App Version: ${context.appVersion}` : ''}

Target Atom to Classify:
"${atom.atomText}"

Classify into strict JSON matching this schema:
{
  "intent": "praise" | "complaint" | "feature_request" | "bug_report" | "question" | "usability_issue" | "cancellation" | "pricing" | "other",
  "sentimentScore": number between -1.0 (extremely negative) and +1.0 (extremely positive),
  "sentimentLabel": "positive" | "neutral" | "negative" | "mixed",
  "emotion": "joy" | "satisfaction" | "delight" | "excitement" | "gratitude" | "frustration" | "anger" | "disappointment" | "confusion" | "sadness" | "anxiety" | "relief" | "trust" | "neutral" | "other",
  "emotionalIntensity": number between 0.0 (subtle) and 1.0 (extreme),
  "severity": "none" | "low" | "medium" | "high" | "critical",
  "confidence": "high" | "medium" | "low"
}

Important Rules:
- Handle typos and informal speech (e.g. "amezing plateform" -> amazing platform = praise, joy, positive).
- Consider emojis as emotional evidence (e.g. 🥰, ❤️ = joy/love, 😡, 😤 = anger/frustration).
- If parent review has contrast ("Love the app but crashes whenever photo uploaded"), the crash atom must be classified as bug_report, mixed/negative sentiment, frustration, and high severity.
- If rating is 5 stars but text reports a serious bug, the atom intent is still bug_report with high severity.
- Praise statements have severity "none".`;

    const raw = await GeminiServerClient.generateJson<Record<string, unknown>>(prompt);
    const parsed = ClassificationOutputSchema.safeParse(raw);

    if (!parsed.success) {
      console.warn('[Classifier] Gemini returned invalid classification schema:', parsed.error.issues);
      return null;
    }

    const data = parsed.data;
    const durationMs = Date.now() - startTime;

    AIUsageGuard.recordRun({
      workspaceId: atom.workspaceId,
      jobId,
      stage: 'classification',
      operation: 'gemini_classification',
      provider: 'google_gemini',
      model: env.GEMINI_MODEL,
      inputTokens: prompt.length / 4,
      outputTokens: 50,
      estimatedCost: 0.0001,
      durationMs,
      promptVersion: PROMPT_VERSIONS.classification
    });

    const ratingAlignment = this.calculateRatingAlignment(data.sentimentScore, context.rating);

    return {
      intent: data.intent,
      sentiment: data.sentimentLabel,
      sentimentScore: Math.max(-1.0, Math.min(1.0, data.sentimentScore)),
      sentimentLabel: data.sentimentLabel,
      emotionalState: data.emotion,
      emotionalIntensity: Math.max(0.0, Math.min(1.0, data.emotionalIntensity)),
      severity: data.severity,
      confidence: data.confidence,
      ratingAlignment,
      model: env.GEMINI_MODEL,
      provider: 'google_gemini',
      promptVersion: PROMPT_VERSIONS.classification,
      pipelineVersion: PIPELINE_VERSION
    };
  }

  /**
   * Deterministic contextual semantic engine.
   * Handles spelling mistakes, emojis, negation, contrast, and rating signals.
   */
  public static classifyContextually(
    text: string,
    context: ClassificationContext
  ): ValidatedClassification {
    const cleanText = text.toLowerCase().trim();
    const parentText = (context.analysisText || text).toLowerCase().trim();
    const rating = context.rating;

    // 1. Emoji Analysis
    const hasLoveEmoji = /[\u{1F970}\u{2764}\u{FE0F}?\u{1F60D}\u{1F60A}\u{1F389}\u{1F44D}\u{1F44F}\u{1F525}\u{2728}\u{2B50}\u{1F4AF}\u{1F601}\u{1F64C}]/u.test(text);
    const hasAngerEmoji = /[\u{1F621}\u{1F620}\u{1F92C}\u{1F624}\u{1F44E}\u{1F92E}\u{1F644}\u{1F926}]/u.test(text);
    const hasSadnessEmoji = /[\u{1F622}\u{1F61E}\u{1F614}\u{1F494}\u{1F62D}\u{1F629}\u{1F630}]/u.test(text);

    // 2. Typo Normalization
    const normalized = cleanText
      .replace(/amezing|amzing|amazng/g, 'amazing')
      .replace(/plateform|platfrom/g, 'platform')
      .replace(/lacky|lagy|laging/g, 'laggy')
      .replace(/verry|vry/g, 'very')
      .replace(/looo+ve|lovv+e/g, 'love')
      .replace(/worrr+st|worsss+t/g, 'worst')
      .replace(/crashe+s|crashin+g/g, 'crashes');

    // 3. Negation & Praise patterns
    const isNegatedPraise = /no problems?|zero (bugs?|issues?|problems?)|without any (issues?|problems?)|not bad|works? perfectly|fixed the/i.test(normalized);
    const isExplicitPraise = /amazing|love|great|awesome|excellent|good|best|fantastic|superb|brilliant|thank you|thanks|helpful|perfect/i.test(normalized) || hasLoveEmoji;

    // 4. Actionable Problems / Bug signals
    const isCrashOrBug = /crash|freez|error|bug|broken|failed|timeout|fatal|corrupt|data loss|lockout|exception|glitch|down|unusable/i.test(normalized);
    const isUsability = /slow|lag|delay|unresponsive|confusing|hard to|difficult|cannot find|cant find|where is/i.test(normalized);
    const isPricing = /expensive|price|subscription|cost|charge|payment failed|refund|overpriced|fee/i.test(normalized);
    const isFeatureRequest = /please add|feature request|would be great to have|wish (it|there)|need (a|the|to)|support for|allow us/i.test(normalized);
    const isQuestion = /\?|how do i|how to|where can i|is it possible/i.test(normalized);

    // 5. Contrast in Parent Context (e.g. "love the app but crashes")
    const hasContrastInParent = /but|however|although|except/i.test(parentText);

    // Classification synthesis
    let intent: ValidatedClassification['intent'] = 'complaint';
    let sentimentLabel: ValidatedClassification['sentimentLabel'] = 'neutral';
    let sentimentScore = 0.0;
    let emotionalState: ValidatedClassification['emotionalState'] = 'neutral';
    let emotionalIntensity = 0.5;
    let severity: ValidatedClassification['severity'] = 'none';
    let confidence: ValidatedClassification['confidence'] = 'high';

    if (isCrashOrBug) {
      intent = 'bug_report';
      sentimentLabel = hasContrastInParent ? 'mixed' : 'negative';
      sentimentScore = hasContrastInParent ? -0.4 : -0.85;
      emotionalState = 'frustration';
      emotionalIntensity = 0.85;
      const isCritical = /crash|data loss|corrupt|security|lockout|payment failed|unusable|fatal/i.test(normalized);
      severity = isCritical ? 'critical' : 'high';
    } else if (isPricing) {
      intent = 'pricing';
      sentimentLabel = (isExplicitPraise || rating && rating >= 3) ? 'mixed' : 'negative';
      sentimentScore = sentimentLabel === 'mixed' ? -0.2 : -0.6;
      emotionalState = 'disappointment';
      emotionalIntensity = 0.6;
      severity = 'medium';
    } else if (isFeatureRequest) {
      intent = 'feature_request';
      sentimentLabel = (rating && rating >= 4) ? 'positive' : 'neutral';
      sentimentScore = sentimentLabel === 'positive' ? 0.3 : 0.0;
      emotionalState = 'neutral';
      emotionalIntensity = 0.2;
      severity = 'none';
    } else if (isUsability) {
      intent = 'usability_issue';
      sentimentLabel = 'negative';
      sentimentScore = -0.5;
      emotionalState = 'confusion';
      emotionalIntensity = 0.6;
      severity = 'medium';
    } else if (isQuestion) {
      intent = 'question';
      sentimentLabel = 'neutral';
      sentimentScore = 0.0;
      emotionalState = 'neutral';
      emotionalIntensity = 0.3;
      severity = 'none';
    } else if (isNegatedPraise || isExplicitPraise) {
      intent = 'praise';
      sentimentLabel = 'positive';
      sentimentScore = hasLoveEmoji ? 0.95 : 0.85;
      emotionalState = /thank you|thanks/i.test(normalized) ? 'gratitude' : 'joy';
      emotionalIntensity = hasLoveEmoji ? 0.9 : 0.75;
      severity = 'none';
    } else if (hasAngerEmoji || /worst|terrible|horrible|useless|hate|scam|pathetic/i.test(normalized)) {
      intent = 'complaint';
      sentimentLabel = 'negative';
      sentimentScore = -0.9;
      emotionalState = hasAngerEmoji ? 'anger' : 'frustration';
      emotionalIntensity = 0.9;
      severity = 'high';
    } else if (hasSadnessEmoji || /disappoint|sad|unhappy|regret/i.test(normalized)) {
      intent = 'complaint';
      sentimentLabel = 'negative';
      sentimentScore = -0.7;
      emotionalState = 'disappointment';
      emotionalIntensity = 0.7;
      severity = 'medium';
    } else if (rating !== undefined && rating <= 2) {
      intent = 'complaint';
      sentimentLabel = 'negative';
      sentimentScore = -0.6;
      emotionalState = 'disappointment';
      emotionalIntensity = 0.5;
      severity = 'medium';
    } else if (rating !== undefined && rating >= 4) {
      intent = 'praise';
      sentimentLabel = 'positive';
      sentimentScore = 0.7;
      emotionalState = 'satisfaction';
      emotionalIntensity = 0.6;
      severity = 'none';
    }

    const ratingAlignment = this.calculateRatingAlignment(sentimentScore, rating);

    return {
      intent,
      sentiment: sentimentLabel,
      sentimentScore,
      sentimentLabel,
      emotionalState,
      emotionalIntensity,
      severity,
      confidence,
      ratingAlignment,
      model: 'trace-contextual-engine',
      provider: 'trace',
      promptVersion: PROMPT_VERSIONS.classification,
      pipelineVersion: PIPELINE_VERSION
    };
  }

  /**
   * Deterministic sanity gate:
   * Catches obvious contradictions between text and AI output.
   * Ensures praise with joyful emojis is never labeled as a complaint.
   */
  private static applySanityGate(
    text: string,
    context: ClassificationContext,
    result: ValidatedClassification
  ): ValidatedClassification {
    const lower = text.toLowerCase();
    const hasLoveEmoji = /[\u{1F970}\u{2764}\u{FE0F}?\u{1F60D}\u{1F60A}\u{1F389}\u{1F44D}\u{1F4AF}]/u.test(text);
    const hasPraiseWords = /amazing|amezing|love|great|awesome|excellent|good|best|thank you/i.test(lower);
    const hasFatalBugs = /crash|corrupt|data loss|security|cannot login|wont open/i.test(lower);

    // Contradiction 1: Pure praise + love emoji labeled as complaint / negative / bug
    if (hasLoveEmoji && hasPraiseWords && !hasFatalBugs && (result.intent === 'complaint' || result.intent === 'bug_report')) {
      return {
        ...result,
        intent: 'praise',
        sentiment: 'positive',
        sentimentScore: Math.max(0.8, result.sentimentScore),
        sentimentLabel: 'positive',
        emotionalState: 'joy',
        severity: 'none',
        confidence: 'high'
      };
    }

    // Contradiction 2: Crash or severe technical defect labeled as praise with severity none
    if (hasFatalBugs && result.intent === 'praise') {
      return {
        ...result,
        intent: 'bug_report',
        sentiment: 'negative',
        sentimentScore: Math.min(-0.5, result.sentimentScore),
        sentimentLabel: 'negative',
        emotionalState: 'frustration',
        severity: 'high',
        confidence: 'high'
      };
    }

    // Contradiction 3: Feature request labeled as critical bug
    if (/please add|feature request|would like to have/i.test(lower) && !hasFatalBugs && result.severity === 'critical') {
      return {
        ...result,
        severity: 'none',
        intent: 'feature_request'
      };
    }

    return result;
  }

  /**
   * Calculates diagnostic rating vs text alignment.
   */
  public static calculateRatingAlignment(
    sentimentScore: number,
    rating?: number
  ): ValidatedClassification['ratingAlignment'] {
    if (rating === undefined || rating === null) {
      return 'unavailable';
    }

    if (rating >= 4) {
      if (sentimentScore >= 0.3) return 'strongly_aligned';
      if (sentimentScore >= -0.2) return 'mixed';
      return 'contradictory'; // e.g. 5-star review saying "worst app ever"
    }

    if (rating <= 2) {
      if (sentimentScore <= -0.3) return 'strongly_aligned';
      if (sentimentScore <= 0.2) return 'mixed';
      return 'contradictory'; // e.g. 1-star review saying "absolutely love this app!"
    }

    // Rating 3 is neutral/mixed
    if (Math.abs(sentimentScore) <= 0.35) return 'aligned';
    return 'mixed';
  }
}
