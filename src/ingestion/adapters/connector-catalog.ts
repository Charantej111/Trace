import { SourceType } from '@/types/trace';

export interface ConnectorInfo {
  id: SourceType;
  name: string;
  category: 'App Store' | 'Helpdesk' | 'CRM / Sales' | 'Custom';
  description: string;
  status: 'available' | 'coming_soon';
  iconName: 'Play' | 'Apple' | 'MessageSquare' | 'Zap' | 'Database';
  capabilities: string[];
}

export const CONNECTOR_CATALOG: ConnectorInfo[] = [
  {
    id: 'google_play',
    name: 'Google Play Store',
    category: 'App Store',
    description: 'Automated synchronization of Android app store user reviews and star ratings.',
    status: 'coming_soon',
    iconName: 'Play',
    capabilities: ['App Version', 'Device Info', 'Android OS Version', 'Star Rating']
  },
  {
    id: 'app_store',
    name: 'Apple App Store',
    category: 'App Store',
    description: 'Direct ingestion of iOS and iPadOS Customer App Reviews.',
    status: 'coming_soon',
    iconName: 'Apple',
    capabilities: ['App Version', 'iOS Version', 'Star Rating', 'Review Title']
  },
  {
    id: 'zendesk',
    name: 'Zendesk Support',
    category: 'Helpdesk',
    description: 'Import customer support ticket descriptions, customer segments, and satisfaction ratings.',
    status: 'coming_soon',
    iconName: 'MessageSquare',
    capabilities: ['Ticket ID', 'Priority', 'Satisfaction CSAT', 'Customer Account']
  },
  {
    id: 'intercom',
    name: 'Intercom Conversations',
    category: 'Helpdesk',
    description: 'Sync live customer chat transcripts, tagged feedback, and user segment attributes.',
    status: 'coming_soon',
    iconName: 'MessageSquare',
    capabilities: ['Conversation ID', 'User Plan', 'CSAT Rating', 'Custom Attributes']
  },
  {
    id: 'api',
    name: 'Trace REST API v1',
    category: 'Custom',
    description: 'Programmatically submit canonical customer feedback records from your backend or webhook pipeline.',
    status: 'coming_soon',
    iconName: 'Zap',
    capabilities: ['Real-time Webhook', 'Custom Metadata', 'External ID Mapping']
  }
];
