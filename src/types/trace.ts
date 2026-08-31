export type IntentType = 'bug_report' | 'complaint' | 'feature_request' | 'praise' | 'question';
export type SentimentType = 'positive' | 'neutral' | 'negative';
export type SeverityType = 'low' | 'medium' | 'high' | 'critical';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type SourceType = 'csv' | 'google_play' | 'app_store' | 'zendesk' | 'intercom' | 'sales_call' | 'survey' | 'other';
export type OpportunityStatus = 'suggested' | 'reviewing' | 'accepted' | 'rejected' | 'archived';
export type DecisionType = 'accepted' | 'rejected_wont_do' | 'deferred' | 'workaround_exists';
export type RoadmapStatus = 'idea' | 'candidate' | 'planned' | 'in_progress' | 'shipped' | 'archived';
export type EvidenceType = 'supporting' | 'contradicting' | 'neutral';

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
  companyGoals: { id: string; goal: string; priority: 'high' | 'medium' | 'low' }[];
  targetSegments: { segmentId: string; name: string; weight: number }[];
  strategicFocusAreas: string[];
  knownConstraints: string[];
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
  status: 'active' | 'syncing' | 'error';
  lastSyncedAt?: string;
  recordCount: number;
}

export interface ImportJob {
  id: string;
  workspaceId: string;
  sourceId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileName: string;
  totalRows: number;
  acceptedRows: number;
  rejectedRows: number;
  duplicateRows: number;
  atomsExtracted: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  workspaceId: string;
  sourceId?: string;
  sourceType: SourceType;
  importId?: string;
  externalId?: string;
  originalText: string;
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
  metadata?: Record<string, unknown>;
  fingerprint: string;
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
  themeId?: string;
  themeName?: string;
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
  createdAt: string;
}

export interface PainPoint {
  id: string;
  workspaceId: string;
  themeId?: string;
  themeName?: string;
  title: string;
  description: string;
  severity: SeverityType;
  frequency: number;
  trendPercentage: number;
  isEmerging: boolean;
  velocityMultiplier: number;
  confidence: ConfidenceLevel;
  affectedSegments: { segment: string; count: number; percentage: number }[];
  createdAt: string;
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
  createdAt: string;
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
  
  // Explainable Score breakdown (0 - 100)
  scoreFrequency: number;
  scoreSeverity: number;
  scoreTrend: number;
  scoreSegmentImpact: number;
  scoreStrategicRelevance: number;
  scoreEvidenceQuality: number;
  overallPriorityScore: number;
  
  status: OpportunityStatus;
  confidence: ConfidenceLevel;
  evidenceCount: number;
  createdAt: string;
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
