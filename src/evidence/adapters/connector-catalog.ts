import { SourceType } from '@/types/trace';

export interface ConnectorInfo {
  id: SourceType;
  name: string;
  category: 'app_store' | 'support' | 'custom';
  status: 'coming_soon';
  description: string;
  badge?: string;
}

export const CONNECTOR_CATALOG: ConnectorInfo[] = [
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
    name: 'Zendesk',
    category: 'support',
    status: 'coming_soon',
    description: 'Ticket comment stream and customer resolution conversations.',
    badge: 'Coming Soon'
  },
  {
    id: 'intercom',
    name: 'Intercom',
    category: 'support',
    status: 'coming_soon',
    description: 'Live chat feedback and CSAT score synchronizer.',
    badge: 'Coming Soon'
  },
  {
    id: 'api',
    name: 'REST API',
    category: 'custom',
    status: 'coming_soon',
    description: 'Programmatically submit canonical customer feedback records via secure webhook or endpoint.',
    badge: 'Coming Soon'
  }
];

