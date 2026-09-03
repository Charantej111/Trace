import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '@/config/env';
import {
  Feedback,
  FeedbackAtom,
  Theme,
  PainPoint,
  Insight,
  Opportunity,
  ProductDecision,
  RoadmapItem,
  FeedbackSource,
  ImportJob,
  ProcessingJob,
  ProcessingJobStage,
  ProcessingJobItem,
  AIRun,
  ProductContext,
  CustomerSegment
} from '@/types/trace';

const supabaseUrl = env.SUPABASE_URL;
const supabaseAnonKey = env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.trim().length > 0 &&
    supabaseUrl.startsWith('http') &&
    supabaseAnonKey &&
    supabaseAnonKey.trim().length > 0
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

// ==========================================
// Database Row Transformers (Postgres snake_case <-> TypeScript camelCase)
// ==========================================

export const Transformers = {
  // Feedback
  feedbackToRow(fb: Feedback): Record<string, unknown> {
    return {
      id: fb.id,
      workspace_id: fb.workspaceId,
      source_id: fb.sourceId || null,
      import_id: fb.importId || null,
      external_id: fb.externalId || null,
      original_text: fb.originalText,
      analysis_text: fb.analysisText || fb.originalText,
      language: fb.language || 'en',
      source_created_at: fb.sourceCreatedAt,
      imported_at: fb.importedAt,
      customer_id: null,
      customer_name: fb.customerName || null,
      customer_segment_name: fb.customerSegmentName || null,
      customer_segment_id: null,
      rating: fb.rating ?? null,
      app_version: fb.appVersion || null,
      device_info: fb.deviceInfo || null,
      source_location: fb.sourceLocation || {},
      normalized_metadata: fb.normalizedMetadata || {},
      raw_payload: fb.rawPayload || {},
      fingerprint: fb.fingerprint,
      status: fb.status || 'valid'
    };
  },

  rowToFeedback(row: Record<string, unknown>, atoms: FeedbackAtom[] = []): Feedback {
    return {
      id: String(row.id),
      workspaceId: String(row.workspace_id),
      sourceId: row.source_id ? String(row.source_id) : undefined,
      importId: row.import_id ? String(row.import_id) : undefined,
      sourceType: (row.source_type as Feedback['sourceType']) || 'csv',
      externalId: row.external_id ? String(row.external_id) : undefined,
      originalText: String(row.original_text || ''),
      analysisText: row.analysis_text ? String(row.analysis_text) : undefined,
      language: row.language ? String(row.language) : 'en',
      sourceCreatedAt: String(row.source_created_at || row.created_at || new Date().toISOString()),
      importedAt: String(row.imported_at || row.created_at || new Date().toISOString()),
      customerName: row.customer_name ? String(row.customer_name) : undefined,
      customerSegmentName: row.customer_segment_name ? String(row.customer_segment_name) : undefined,
      customerSegmentId: row.customer_segment_id ? String(row.customer_segment_id) : undefined,
      rating: typeof row.rating === 'number' ? row.rating : undefined,
      appVersion: row.app_version ? String(row.app_version) : undefined,
      deviceInfo: row.device_info ? String(row.device_info) : undefined,
      sourceLocation: (row.source_location as Feedback['sourceLocation']) || {},
      normalizedMetadata: (row.normalized_metadata as Record<string, unknown>) || {},
      rawPayload: (row.raw_payload as Record<string, unknown>) || {},
      fingerprint: String(row.fingerprint || ''),
      status: (row.status as Feedback['status']) || 'valid',
      atoms
    };
  },

  // Feedback Atoms
  atomToRow(atom: FeedbackAtom): Record<string, unknown> {
    // Pack rich classification metadata safely into underlying_problem_hint JSON
    const metadataPayload = JSON.stringify({
      hint: atom.underlyingProblemHint || null,
      extendedIntent: atom.intent,
      extendedSentiment: atom.sentiment,
      sentimentScore: atom.sentimentScore,
      sentimentLabel: atom.sentimentLabel || atom.sentiment,
      emotionalState: atom.emotionalState,
      emotionalIntensity: atom.emotionalIntensity,
      extendedSeverity: atom.severity,
      classificationConfidence: atom.classificationConfidence || atom.confidence,
      ratingAlignment: atom.ratingAlignment
    });

    const safeIntent = ['bug_report', 'complaint', 'feature_request', 'praise', 'question'].includes(atom.intent)
      ? atom.intent
      : 'complaint';

    const safeSentiment = ['positive', 'neutral', 'negative'].includes(atom.sentiment)
      ? atom.sentiment
      : 'neutral';

    const safeSeverity = ['low', 'medium', 'high', 'critical'].includes(atom.severity)
      ? atom.severity
      : (atom.severity === 'none' ? 'low' : 'medium');

    return {
      id: atom.id,
      workspace_id: atom.workspaceId,
      feedback_id: atom.feedbackId,
      atom_text: atom.atomText,
      source_start: atom.sourceStart,
      source_end: atom.sourceEnd,
      intent: safeIntent,
      sentiment: safeSentiment,
      sentiment_score: atom.sentimentScore ?? null,
      severity: safeSeverity,
      is_feature_request: atom.isFeatureRequest ?? false,
      underlying_problem_hint: metadataPayload,
      confidence: atom.confidence || 'medium'
    };
  },

  rowToAtom(row: Record<string, unknown>): FeedbackAtom {
    let rawMeta: Record<string, unknown> | null = null;
    let originalHint: string | undefined = undefined;

    if (row.underlying_problem_hint && typeof row.underlying_problem_hint === 'string') {
      try {
        if (row.underlying_problem_hint.startsWith('{')) {
          rawMeta = JSON.parse(row.underlying_problem_hint);
          originalHint = rawMeta?.hint ? String(rawMeta.hint) : undefined;
        } else {
          originalHint = row.underlying_problem_hint;
        }
      } catch {
        originalHint = row.underlying_problem_hint;
      }
    }

    const intent = (rawMeta?.extendedIntent as FeedbackAtom['intent']) ||
      (row.intent as FeedbackAtom['intent']) || 'complaint';

    const sentiment = (rawMeta?.extendedSentiment as FeedbackAtom['sentiment']) ||
      (row.sentiment as FeedbackAtom['sentiment']) || 'neutral';

    const sentimentScore = typeof rawMeta?.sentimentScore === 'number'
      ? rawMeta.sentimentScore
      : (typeof row.sentiment_score === 'number' ? row.sentiment_score : undefined);

    const severity = (rawMeta?.extendedSeverity as FeedbackAtom['severity']) ||
      (row.severity as FeedbackAtom['severity']) || 'medium';

    return {
      id: String(row.id),
      workspaceId: String(row.workspace_id),
      feedbackId: String(row.feedback_id),
      atomText: String(row.atom_text),
      sourceStart: Number(row.source_start),
      sourceEnd: Number(row.source_end),
      intent,
      sentiment,
      sentimentScore,
      sentimentLabel: (rawMeta?.sentimentLabel as FeedbackAtom['sentimentLabel']) || sentiment,
      emotionalState: rawMeta?.emotionalState as FeedbackAtom['emotionalState'],
      emotionalIntensity: typeof rawMeta?.emotionalIntensity === 'number' ? rawMeta.emotionalIntensity : undefined,
      severity,
      isFeatureRequest: Boolean(row.is_feature_request),
      underlyingProblemHint: originalHint,
      confidence: (row.confidence as FeedbackAtom['confidence']) || 'medium',
      classificationConfidence: (rawMeta?.classificationConfidence as FeedbackAtom['confidence']) || (row.confidence as FeedbackAtom['confidence']) || 'medium',
      ratingAlignment: rawMeta?.ratingAlignment as FeedbackAtom['ratingAlignment'],
      verificationStatus: 'verified',
      createdAt: String(row.created_at || new Date().toISOString())
    };
  },

  // Themes
  themeToRow(t: Theme): Record<string, unknown> {
    const metaDesc = JSON.stringify({
      text: t.description || '',
      atomIds: t.atomIds || [],
      topKeywords: t.topKeywords || [],
      sentimentBreakdown: t.sentimentBreakdown || { positive: 0, neutral: 0, negative: 0 }
    });

    return {
      id: t.id,
      workspace_id: t.workspaceId,
      name: t.name,
      description: metaDesc,
      atom_count: t.atomCount || (t.atomIds ? t.atomIds.length : 0),
      confidence: t.confidence,
      status: t.status || 'active'
    };
  },

  rowToTheme(row: Record<string, unknown>): Theme {
    let cleanDesc = String(row.description || '');
    let atomIds: string[] = [];
    let topKeywords: string[] = [];
    let sentimentBreakdown: Theme['sentimentBreakdown'] = { positive: 0, neutral: 0, negative: 0 };

    if (cleanDesc.startsWith('{')) {
      try {
        const parsed = JSON.parse(cleanDesc);
        if (parsed && typeof parsed === 'object') {
          cleanDesc = parsed.text || '';
          if (Array.isArray(parsed.atomIds)) atomIds = parsed.atomIds;
          if (Array.isArray(parsed.topKeywords)) topKeywords = parsed.topKeywords;
          if (parsed.sentimentBreakdown) sentimentBreakdown = parsed.sentimentBreakdown;
        }
      } catch {
        // use raw string
      }
    }

    return {
      id: String(row.id),
      workspaceId: String(row.workspace_id),
      name: String(row.name),
      description: cleanDesc,
      atomCount: Number(row.atom_count || atomIds.length || 0),
      confidence: (row.confidence as Theme['confidence']) || 'medium',
      status: (row.status as Theme['status']) || 'active',
      topKeywords,
      sentimentBreakdown,
      atomIds,
      createdAt: String(row.created_at || new Date().toISOString())
    };
  },

  // Pain Points
  painPointToRow(pp: PainPoint): Record<string, unknown> {
    const metaDesc = JSON.stringify({
      desc: pp.description || '',
      hypothesis: pp.hypothesis,
      affectedSegments: pp.affectedSegments || [],
      atomIds: pp.atomIds || []
    });

    return {
      id: pp.id,
      workspace_id: pp.workspaceId,
      theme_id: pp.themeId || null,
      title: pp.title,
      description: metaDesc,
      severity: pp.severity,
      frequency: pp.frequency,
      trend_percentage: pp.trendPercentage,
      is_emerging: pp.isEmerging,
      velocity_multiplier: pp.velocityMultiplier,
      confidence: pp.confidence
    };
  },

  rowToPainPoint(row: Record<string, unknown>): PainPoint {
    let cleanDesc = String(row.description || '');
    let hypothesis: string | undefined = undefined;
    let affectedSegments: PainPoint['affectedSegments'] = [];
    let atomIds: string[] = [];

    if (cleanDesc.startsWith('{')) {
      try {
        const parsed = JSON.parse(cleanDesc);
        if (parsed && typeof parsed === 'object') {
          cleanDesc = parsed.desc || '';
          hypothesis = parsed.hypothesis;
          if (Array.isArray(parsed.affectedSegments)) affectedSegments = parsed.affectedSegments;
          if (Array.isArray(parsed.atomIds)) atomIds = parsed.atomIds;
        }
      } catch {
        // use raw string
      }
    }

    return {
      id: String(row.id),
      workspaceId: String(row.workspace_id),
      themeId: row.theme_id ? String(row.theme_id) : undefined,
      title: String(row.title),
      description: cleanDesc,
      hypothesis,
      severity: (row.severity as PainPoint['severity']) || 'medium',
      frequency: Number(row.frequency || atomIds.length || 0),
      trendPercentage: Number(row.trend_percentage || 0),
      isEmerging: Boolean(row.is_emerging),
      velocityMultiplier: Number(row.velocity_multiplier || 1.0),
      confidence: (row.confidence as PainPoint['confidence']) || 'medium',
      affectedSegments,
      atomIds,
      createdAt: String(row.created_at || new Date().toISOString())
    };
  },

  // Insights
  insightToRow(ins: Insight): Record<string, unknown> {
    const metaSummary = JSON.stringify({
      text: ins.summary || '',
      evidence: ins.evidence || []
    });

    return {
      id: ins.id,
      workspace_id: ins.workspaceId,
      pain_point_id: ins.painPointId || null,
      title: ins.title,
      summary: metaSummary,
      insight_type: ins.insightType,
      affected_segments: ins.affectedSegments || [],
      frequency: ins.frequency,
      trend_percentage: ins.trendPercentage,
      confidence: ins.confidence
    };
  },

  rowToInsight(row: Record<string, unknown>, evidence: Insight['evidence'] = []): Insight {
    let cleanSummary = String(row.summary || '');
    let resolvedEvidence: Insight['evidence'] = Array.isArray(evidence) && evidence.length > 0 ? evidence : [];

    if (cleanSummary.startsWith('{')) {
      try {
        const parsed = JSON.parse(cleanSummary);
        if (parsed && typeof parsed === 'object') {
          cleanSummary = parsed.text || '';
          if (resolvedEvidence.length === 0 && Array.isArray(parsed.evidence)) {
            resolvedEvidence = parsed.evidence;
          }
        }
      } catch {
        // use raw string
      }
    }

    return {
      id: String(row.id),
      workspaceId: String(row.workspace_id),
      painPointId: row.pain_point_id ? String(row.pain_point_id) : undefined,
      title: String(row.title),
      summary: cleanSummary,
      insightType: (row.insight_type as Insight['insightType']) || 'pain_point',
      affectedSegments: Array.isArray(row.affected_segments) ? (row.affected_segments as Insight['affectedSegments']) : [],
      frequency: Number(row.frequency || 0),
      trendPercentage: Number(row.trend_percentage || 0),
      confidence: (row.confidence as Insight['confidence']) || 'medium',
      evidence: resolvedEvidence,
      supportingEvidenceCount: resolvedEvidence.filter(e => e.evidenceType === 'supporting').length,
      contradictingEvidenceCount: resolvedEvidence.filter(e => e.evidenceType === 'contradicting').length,
      createdAt: String(row.created_at || new Date().toISOString())
    };
  },

  // Opportunities
  opportunityToRow(opp: Opportunity): Record<string, unknown> {
    return {
      id: opp.id,
      workspace_id: opp.workspaceId,
      insight_id: opp.insightId || null,
      title: opp.title,
      problem_statement: opp.problemStatement,
      opportunity_statement: opp.opportunityStatement,
      suggested_solution: opp.suggestedSolution || null,
      target_segments: opp.targetSegments || [],
      score_frequency: opp.scoreFrequency,
      score_severity: opp.scoreSeverity,
      score_trend: opp.scoreTrend,
      score_segment_impact: opp.scoreSegmentImpact,
      score_strategic_relevance: opp.scoreStrategicRelevance,
      score_evidence_quality: opp.scoreEvidenceQuality || 0,
      status: opp.status,
      confidence: opp.confidence
    };
  },

  rowToOpportunity(row: Record<string, unknown>): Opportunity {
    const scoreFrequency = Number(row.score_frequency || 0);
    const scoreSeverity = Number(row.score_severity || 0);
    const scoreTrend = Number(row.score_trend || 0);
    const scoreSegmentImpact = Number(row.score_segment_impact || 0);
    const scoreStrategicRelevance = Number(row.score_strategic_relevance || 0);
    const scoreEvidenceQuality = Number(row.score_evidence_quality || 0);

    const overallPriorityScore = Math.round(
      0.20 * scoreFrequency +
      0.20 * scoreSeverity +
      0.15 * scoreTrend +
      0.15 * scoreSegmentImpact +
      0.15 * scoreStrategicRelevance +
      0.15 * scoreEvidenceQuality
    );

    return {
      id: String(row.id),
      workspaceId: String(row.workspace_id),
      insightId: row.insight_id ? String(row.insight_id) : undefined,
      title: String(row.title),
      problemStatement: String(row.problem_statement || ''),
      opportunityStatement: String(row.opportunity_statement || ''),
      suggestedSolution: row.suggested_solution ? String(row.suggested_solution) : undefined,
      targetSegments: Array.isArray(row.target_segments) ? (row.target_segments as string[]) : [],
      scoreFrequency,
      scoreSeverity,
      scoreTrend,
      scoreSegmentImpact,
      scoreStrategicRelevance,
      scoreEvidenceQuality,
      overallPriorityScore,
      evidenceConfidence: 'high',
      status: (row.status as Opportunity['status']) || 'suggested',
      confidence: (row.confidence as Opportunity['confidence']) || 'medium',
      evidenceCount: Number(row.evidence_count || 0),
      supportingInsightIds: row.insight_id ? [String(row.insight_id)] : [],
      supportingAtomIds: [],
      createdAt: String(row.created_at || new Date().toISOString())
    };
  },

  // Roadmap
  roadmapItemToRow(r: RoadmapItem): Record<string, unknown> {
    return {
      id: r.id,
      workspace_id: r.workspaceId,
      opportunity_id: r.opportunityId || null,
      decision_id: r.decisionId || null,
      title: r.title,
      description: r.description || null,
      status: r.status,
      target_period: r.targetPeriod || null,
      shipped_at: r.shippedAt || null,
      baseline_complaint_frequency: r.baselineComplaintFrequency ?? null,
      post_ship_complaint_frequency: r.postShipComplaintFrequency ?? null,
      impact_percentage_change: r.impactPercentageChange ?? null
    };
  },

  rowToRoadmapItem(row: Record<string, unknown>): RoadmapItem {
    return {
      id: String(row.id),
      workspaceId: String(row.workspace_id),
      opportunityId: row.opportunity_id ? String(row.opportunity_id) : undefined,
      decisionId: row.decision_id ? String(row.decision_id) : undefined,
      title: String(row.title),
      description: row.description ? String(row.description) : undefined,
      status: (row.status as RoadmapItem['status']) || 'candidate',
      targetPeriod: row.target_period ? String(row.target_period) : 'Q4 2026',
      priority: 'P1',
      evidenceCount: Number(row.evidence_count || 0),
      topQuotes: [],
      shippedAt: row.shipped_at ? String(row.shipped_at) : undefined,
      baselineComplaintFrequency: typeof row.baseline_complaint_frequency === 'number' ? row.baseline_complaint_frequency : undefined,
      postShipComplaintFrequency: typeof row.post_ship_complaint_frequency === 'number' ? row.post_ship_complaint_frequency : undefined,
      impactPercentageChange: typeof row.impact_percentage_change === 'number' ? row.impact_percentage_change : undefined,
      createdAt: String(row.created_at || new Date().toISOString()),
      updatedAt: String(row.updated_at || new Date().toISOString())
    };
  },

  // Product Decision
  decisionToRow(d: ProductDecision): Record<string, unknown> {
    return {
      id: d.id,
      workspace_id: d.workspaceId,
      opportunity_id: d.opportunityId || null,
      title: d.title,
      decision: d.decision,
      rationale: d.rationale,
      evidence_snapshot: d.evidenceSnapshot || {},
      decided_at: d.decidedAt
    };
  },

  rowToDecision(row: Record<string, unknown>): ProductDecision {
    return {
      id: String(row.id),
      workspaceId: String(row.workspace_id),
      opportunityId: row.opportunity_id ? String(row.opportunity_id) : undefined,
      title: String(row.title),
      decision: (row.decision as ProductDecision['decision']) || 'accepted',
      rationale: String(row.rationale || ''),
      evidenceSnapshot: (row.evidence_snapshot as ProductDecision['evidenceSnapshot']) || {
        mentionCount: 0,
        severity: 'medium',
        affectedSegments: [],
        sampleQuotes: [],
        scoreAtDecisionTime: 0
      },
      decidedBy: row.decided_by ? String(row.decided_by) : 'Lead Product Manager',
      decidedAt: String(row.decided_at || new Date().toISOString())
    };
  }
};
