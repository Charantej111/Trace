import {
  Workspace,
  ProductContext,
  CustomerSegment,
  FeedbackSource,
  Feedback,
  Theme,
  PainPoint,
  Insight,
  Opportunity,
  ProductDecision,
  RoadmapItem
} from '@/types/trace';

export const INITIAL_WORKSPACE: Workspace = {
  id: 'ws-default',
  name: 'Default Workspace',
  slug: 'default-workspace',
  productName: 'My Product',
  productCategory: 'Product Management',
  createdAt: new Date().toISOString()
};

export const INITIAL_PRODUCT_CONTEXT: ProductContext = {
  workspaceId: 'ws-default',
  companyGoals: [],
  targetSegments: [],
  strategicFocusAreas: [],
  knownConstraints: [],
  updatedAt: new Date().toISOString()
};

export const INITIAL_CUSTOMER_SEGMENTS: CustomerSegment[] = [];
export const INITIAL_SOURCES: FeedbackSource[] = [];
export const INITIAL_FEEDBACK: Feedback[] = [];
export const INITIAL_THEMES: Theme[] = [];
export const INITIAL_PAIN_POINTS: PainPoint[] = [];
export const INITIAL_INSIGHTS: Insight[] = [];
export const INITIAL_OPPORTUNITIES: Opportunity[] = [];
export const INITIAL_DECISIONS: ProductDecision[] = [];
export const INITIAL_ROADMAP: RoadmapItem[] = [];
