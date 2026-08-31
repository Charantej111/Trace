import { SourceType } from '@/types/trace';

export interface ConnectorInfo {
  id: SourceType;
  name: string;
  category: 'file' | 'app_store' | 'support' | 'custom';
  status: 'active' | 'coming_soon';
  description: string;
  badge?: string;
}

export const CONNECTOR_CATALOG: ConnectorInfo[] = [
  {
    id: 'csv',
    name: 'CSV Spreadsheet',
    category: 'file',
    status: 'active',
    description: 'Import feedback, support exports, or survey logs from standard CSV files.'
  },
  {
    id: 'xlsx',
    name: 'Excel Spreadsheet',
    category: 'file',
    status: 'active',
    description: 'Directly parse multi-column XLSX spreadsheets.'
  },
  {
    id: 'json',
    name: 'JSON Document',
    category: 'file',
    status: 'active',
    description: 'Ingest raw JSON feedback arrays with automatic nested collection detection.'
  },
  {
    id: 'paste',
    name: 'Quick Paste & Text',
    category: 'custom',
    status: 'active',
    description: 'Instant capture for unstructured notes, call transcripts, or chat snippets.'
  },
  {
    id: 'google_play',
    name: 'Google Play Store',
    category: 'app_store',
    status: 'coming_soon',
    description: 'Developer API integration for Android store reviews and star ratings.',
    badge: 'Coming Soon'
  },
  {
    id: 'app_store',
    name: 'Apple App Store',
    category: 'app_store',
    status: 'coming_soon',
    description: 'App Store Connect API connector for iOS ratings and reviews.',
    badge: 'Coming Soon'
  },
  {
    id: 'zendesk',
    name: 'Zendesk Support',
    category: 'support',
    status: 'coming_soon',
    description: 'Ticket comment stream and customer resolution conversations.',
    badge: 'Coming Soon'
  },
  {
    id: 'intercom',
    name: 'Intercom Conversations',
    category: 'support',
    status: 'coming_soon',
    description: 'Live chat feedback and CSAT score synchronizer.',
    badge: 'Coming Soon'
  }
];
