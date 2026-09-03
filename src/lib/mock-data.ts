import {
  Workspace,
  ProductContext,
  CustomerSegment
} from '@/types/trace';

export const INITIAL_WORKSPACE: Workspace = {
  id: 'ws-default',
  name: 'Default Workspace',
  slug: 'default-workspace',
  productName: 'Trace Intelligence',
  productCategory: 'Product Management & B2B SaaS',
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
