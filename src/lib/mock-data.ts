import {
  Workspace,
  ProductContext,
  CustomerSegment,
  SourceType
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


export interface RawSampleFeedbackItem {
  text: string;
  sourceType: SourceType;
  customerName: string;
  customerSegment: string;
  rating?: number;
  dateOffsetDays: number;
}

/**
 * Raw realistic customer feedback statements for the "Explore Sample Dataset" feature.
 * LOCKED: Contains ZERO precomputed themes, pain points, or scores.
 * All intelligence is derived dynamically by running the real pipeline on this raw evidence.
 */
export const RAW_SAMPLE_DATASET: RawSampleFeedbackItem[] = [
  {
    text: 'The CSV export fails every time our data exceeds 50,000 rows. We need support for large-scale file extraction urgently.',
    sourceType: 'zendesk',
    customerName: 'Acme Corp (Dev Ops)',
    customerSegment: 'Enterprise',
    rating: 2,
    dateOffsetDays: 2
  },
  {
    text: 'Reports take over 45 seconds to generate on the dashboard, and sometimes timeout completely. The latency is killing our team weekly reviews.',
    sourceType: 'intercom',
    customerName: 'Global Logistics PM',
    customerSegment: 'Enterprise',
    rating: 1,
    dateOffsetDays: 3
  },
  {
    text: 'Exporting tabular data is broken on Firefox. The screen freezes and nothing downloads.',
    sourceType: 'google_play',
    customerName: 'Marcus Vance',
    customerSegment: 'SMB',
    rating: 2,
    dateOffsetDays: 4
  },
  {
    text: 'We love the clarity of the traceability graph! However, we need SAML SSO support to roll Trace out to our 500+ product managers.',
    sourceType: 'sales_call',
    customerName: 'FinTech Systems VP Product',
    customerSegment: 'Enterprise',
    rating: 4,
    dateOffsetDays: 5
  },
  {
    text: 'Authentication sessions expire too quickly while drafting roadmaps, losing our unsaved initiative notes.',
    sourceType: 'app_store',
    customerName: 'Sarah Jenkins',
    customerSegment: 'Mid-Market',
    rating: 2,
    dateOffsetDays: 7
  },
  {
    text: 'Filtering by customer segment doesn’t work properly when multiple tags are selected. Please add multi-tag boolean search.',
    sourceType: 'survey',
    customerName: 'Elena Rostova',
    customerSegment: 'Mid-Market',
    rating: 3,
    dateOffsetDays: 9
  },
  {
    text: 'Performance is sluggish when switching between matrix view and kanban board. Everything else is awesome!',
    sourceType: 'intercom',
    customerName: 'David K.',
    customerSegment: 'SMB',
    rating: 3,
    dateOffsetDays: 12
  },
  {
    text: 'The automated decision memory log has saved our team countless hours in stakeholder alignment meetings.',
    sourceType: 'sales_call',
    customerName: 'CloudScale Founder',
    customerSegment: 'Enterprise',
    rating: 5,
    dateOffsetDays: 15
  }
];
