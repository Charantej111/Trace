export type IntentType = 'bug_report' | 'complaint' | 'feature_request' | 'praise' | 'question';
export type SentimentType = 'positive' | 'neutral' | 'negative';
export type SeverityType = 'low' | 'medium' | 'high' | 'critical';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type VerificationStatus = 'verified' | 'rejected';
export type SourceType = 'csv' | 'xlsx' | 'json' | 'paste' | 'google_play' | 'app_store' | 'zendesk' | 'intercom' | 'sales_call' | 'survey' | 'api' | 'other';
export type OpportunityStatus = 'suggested' | 'reviewing' | 'accepted' | 'rejected' | 'archived';
export type DecisionType = 'accepted' | 'rejected_wont_do' | 'deferred' | 'workaround_exists';
export type RoadmapStatus = 'idea' | 'candidate' | 'planned' | 'in_progress' | 'shipped' | 'archived';
export type EvidenceType = 'supporting' | 'contradicting' | 'neutral';
export type IngestionRecordStatus = 'pending' | 'valid' | 'invalid' | 'duplicate' | 'processed' | 'failed';

export type ProcessingStageType =
  | 'normalization'
  | 'atomization'
  | 'classification'
  | 'embedding'
  | 'clustering'
  | 'theme_generation'
  | 'pain_point_generation'
  | 'insight_generation'
  | 'opportunity_generation';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'partially_failed';
export type StageStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
export type ItemStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ProcessingEntityType = 'feedback' | 'atom' | 'cluster' | 'pain_point' | 'insight';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  productName: string;
  productCategory: string;
  createdAt: string;
}

export interface ProductContext {
  workspaceId: string;
  companyGoals: { id: string; goal: string; priority: 'high' | 'medium' | 'low'; keywords?: string[] }[];
  targetSegments: { segmentId: string; name: string; weight: number }[];
  strategicFocusAreas: string[];
  knownConstraints: string[];
  productAreaTags?: string[];
  updatedAt: string;
}

export interface CustomerSegment {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  strategicWeight: number;
}

export interface Customer {
  id: string;
  workspaceId: string;
  externalId?: string;
  segmentId?: string;
  displayName: string;
  metadata?: Record<string, unknown>;
}

export interface FeedbackSource {
  id: string;
  workspaceId: string;
  type: SourceType;
  name: string;
  status: 'active' | 'syncing' | 'error' | 'coming_soon';
  lastSyncedAt?: string;
  recordCount: number;
}

export interface SourceLocation {
  fileName?: string;
  sheetName?: string;
  rowIndex?: number;
}

export interface ImportJob {
  id: string;
  workspaceId: string;
  sourceId?: string;
  status: 'pending' | 'processing' | 'completed' | 'completed_with_warnings' | 'failed' | 'cancelled';
  fileName: string;
  fileType?: string;
  totalRows: number;
  acceptedRows: number;
  rejectedRows: number;
  duplicateRows: number;
  atomsExtracted: number;
  errorSummary?: {
    totalErrors?: number;
    totalWarnings?: number;
    sampleErrors?: { rowNumber?: number; message: string }[];
  };
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface CanonicalCustomer {
  externalId?: string;
  name?: string;
  email?: string;
  segment?: string;
}

export interface CanonicalFeedback {
  id: string;
  workspaceId: string;
  sourceId: string;
  importId: string;
  sourceType: SourceType;

  // Immutable raw evidence vs PII-sanitized analysis text
  originalText: string;
  analysisText: string;

  externalId?: string;
  customer?: CanonicalCustomer;

  sourceTimestamp?: string;
  ingestionTimestamp: string;

  sourceLocation?: SourceLocation;

  rating?: number;
  language?: string;
  segment?: string;
  productArea?: string;

  normalizedMetadata: Record<string, unknown>;
  rawPayload: Record<string, unknown>;

  fingerprint: string;
  status: IngestionRecordStatus;
}

export interface Feedback {
  id: string;
  workspaceId: string;
  sourceId?: string;
  sourceType: SourceType;
  importId?: string;
  externalId?: string;
  originalText: string;
  analysisText?: string;
  normalizedText?: string;
  language?: string;
  sourceCreatedAt: string;
  importedAt: string;
  customerId?: string;
  customerName?: string;
  customerSegmentId?: string;
  customerSegmentName?: string;
  rating?: number;
  appVersion?: string;
  deviceInfo?: string;
  sourceLocation?: SourceLocation;
  normalizedMetadata?: Record<string, unknown>;
  rawPayload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  fingerprint: string;
  status?: IngestionRecordStatus;
  atoms?: FeedbackAtom[];
}

export interface FeedbackAtom {
  id: string;
  workspaceId: string;
  feedbackId: string;
  atomText: string;
  sourceStart: number;
  sourceEnd: number;
  intent: IntentType;
  sentiment: SentimentType;
  sentimentScore?: number;
  severity: SeverityType;
  isFeatureRequest: boolean;
  underlyingProblemHint?: string;
  confidence: ConfidenceLevel;
  verificationStatus: VerificationStatus;
  themeId?: string;
  themeName?: string;
  embedding?: number[];
  embeddingModel?: string;
  embeddingVersion?: string;
  pipelineVersion?: string;
  model?: string;
  promptVersion?: string;
  createdAt: string;
}

export interface Theme {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  atomCount: number;
  confidence: ConfidenceLevel;
  status: 'active' | 'archived';
  topKeywords: string[];
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
  atomIds: string[];
  pipelineVersion?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PainPoint {
  id: string;
  workspaceId: string;
  themeId?: string;
  themeName?: string;
  title: string;
  description: string;
  hypothesis?: string;
  severity: SeverityType;
  frequency: number;
  trendPercentage: number;
  isEmerging: boolean;
  velocityMultiplier: number;
  confidence: ConfidenceLevel;
  affectedSegments: { segment: string; count: number; percentage: number }[];
  atomIds: string[];
  pipelineVersion?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface InsightEvidence {
  insightId: string;
  atomId: string;
  feedbackId: string;
  evidenceType: EvidenceType;
  quoteText: string;
  relevanceScore: number;
  sourceType: SourceType;
  customerSegment?: string;
  sourceCreatedAt: string;
}

export interface Insight {
  id: string;
  workspaceId: string;
  painPointId?: string;
  title: string;
  summary: string;
  insightType: 'pain_point' | 'feature_request' | 'trend' | 'emerging_issue' | 'divergent_signal';
  affectedSegments: { segment: string; count: number; percentage: number }[];
  frequency: number;
  trendPercentage: number;
  confidence: ConfidenceLevel;
  evidence: InsightEvidence[];
  supportingEvidenceCount: number;
  contradictingEvidenceCount: number;
  pipelineVersion?: string;
  promptVersion?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Opportunity {
  id: string;
  workspaceId: string;
  insightId?: string;
  title: string;
  problemStatement: string;
  opportunityStatement: string;
  suggestedSolution?: string;
  targetSegments: string[];
  
  // Deterministic 5-Factor Score breakdown (0 - 100)
  scoreFrequency: number;
  scoreSeverity: number;
  scoreTrend: number;
  scoreSegmentImpact: number;
  scoreStrategicRelevance: number;
  scoreEvidenceQuality?: number;
  overallPriorityScore: number;
  
  // Independent Evidence Confidence
  evidenceConfidence: ConfidenceLevel;
  
  status: OpportunityStatus;
  confidence: ConfidenceLevel;
  evidenceCount: number;
  supportingInsightIds: string[];
  supportingAtomIds: string[];
  pipelineVersion?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ProductDecision {
  id: string;
  workspaceId: string;
  opportunityId?: string;
  opportunityTitle?: string;
  title: string;
  decision: DecisionType;
  rationale: string;
  evidenceSnapshot: {
    mentionCount: number;
    severity: string;
    affectedSegments: string[];
    sampleQuotes: string[];
    scoreAtDecisionTime: number;
  };
  alternativePrioritizedTitle?: string;
  decidedBy: string;
  decidedAt: string;
}

export interface RoadmapItem {
  id: string;
  workspaceId: string;
  opportunityId?: string;
  decisionId?: string;
  title: string;
  description?: string;
  status: RoadmapStatus;
  targetPeriod?: string;
  priority: 'P0' | 'P1' | 'P2';
  
  // Traceability & Evidence links
  evidenceCount: number;
  topQuotes: string[];
  
  // Post-Ship Impact
  shippedAt?: string;
  baselineComplaintFrequency?: number;
  postShipComplaintFrequency?: number;
  impactPercentageChange?: number;
  
  createdAt: string;
  updatedAt: string;
}

// Durable 3-Level Processing Job Models
export interface ProcessingJob {
  id: string;
  workspaceId: string;
  importId?: string;
  idempotencyKey: string;
  type: 'import' | 'reprocess' | 'incremental';
  status: JobStatus;
  totalRecords: number;
  processedRecords: number;
  failedRecords: number;
  error?: string;
  pipelineVersion: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface ProcessingJobStage {
  id: string;
  jobId: string;
  stage: ProcessingStageType;
  status: StageStatus;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  error?: string;
  attempt: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface ProcessingJobItem {
  id: string;
  stageId: string;
  jobId: string;
  entityType: ProcessingEntityType;
  entityId: string;
  status: ItemStatus;
  attempt: number;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface AIRun {
  id: string;
  workspaceId: string;
  jobId?: string;
  stage: string;
  operation: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  durationMs: number;
  status: 'success' | 'failed' | 'rate_limited';
  pipelineVersion: string;
  promptVersion: string;
  error?: string;
  createdAt: string;
}
