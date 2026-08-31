import {
  Feedback,
  PainPoint,
  Insight,
  Opportunity,
  ProductDecision,
  RoadmapItem,
  ProductContext,
  CustomerSegment,
  FeedbackSource
} from '@/types/trace';

export const DB_CUSTOMER_SEGMENTS: CustomerSegment[] = [];

export const DB_PRODUCT_CONTEXT: ProductContext = {
  workspaceId: 'ws-prod',
  companyGoals: [],
  targetSegments: [],
  strategicFocusAreas: [],
  knownConstraints: [],
  updatedAt: new Date().toISOString()
};

export const DB_SOURCES: FeedbackSource[] = [];
export const DB_FEEDBACK: Feedback[] = [];
export const DB_TIMESERIES_DATA: { week: string; [key: string]: string | number }[] = [];
export const DB_PAIN_POINTS: PainPoint[] = [];
export const DB_INSIGHTS: Insight[] = [];
export const DB_OPPORTUNITIES: Opportunity[] = [];
export const DB_DECISIONS: ProductDecision[] = [];
export const DB_ROADMAP: RoadmapItem[] = [];
