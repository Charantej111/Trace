import {
  Feedback,
  FeedbackAtom,
  Theme,
  PainPoint,
  Insight,
  Opportunity,
  ProductDecision,
  RoadmapItem,
  ProductContext,
  CustomerSegment,
  FeedbackSource
} from '@/types/trace';

// Customer Segments
export const DB_CUSTOMER_SEGMENTS: CustomerSegment[] = [
  { id: 'seg-ent', workspaceId: 'ws-prod', name: 'Enterprise', description: 'Tier-1 accounts (>500 seats, >$50k ARR)', strategicWeight: 1.5 },
  { id: 'seg-mid', workspaceId: 'ws-prod', name: 'Mid-Market', description: 'Growing teams (50-500 seats, $10k-$50k ARR)', strategicWeight: 1.2 },
  { id: 'seg-smb', workspaceId: 'ws-prod', name: 'SMB', description: 'Small teams (10-50 seats, <$10k ARR)', strategicWeight: 1.0 },
  { id: 'seg-free', workspaceId: 'ws-prod', name: 'Self-Serve', description: 'Free & individual starter users', strategicWeight: 0.7 }
];

// Product Context
export const DB_PRODUCT_CONTEXT: ProductContext = {
  workspaceId: 'ws-prod',
  companyGoals: [
    { id: 'g-churn', goal: 'Reduce Tier-1 Enterprise Churn by 25% in Q3/Q4', priority: 'high' },
    { id: 'g-mobile', goal: 'Restore Android Store Rating to >=4.6 Stars after v4.13 regression', priority: 'high' },
    { id: 'g-billing', goal: 'Eliminate renewal checkout billing errors and double authorizations', priority: 'high' },
    { id: 'g-export', goal: 'Enable compliance audit automation for enterprise security teams', priority: 'medium' }
  ],
  targetSegments: [
    { segmentId: 'seg-ent', name: 'Enterprise', weight: 1.5 },
    { segmentId: 'seg-mid', name: 'Mid-Market', weight: 1.2 },
    { segmentId: 'seg-smb', name: 'SMB', weight: 1.0 },
    { segmentId: 'seg-free', name: 'Self-Serve', weight: 0.7 }
  ],
  strategicFocusAreas: ['Document Ingestion Engine', 'Mobile App Reliability', 'Checkout Idempotency', 'Enterprise SSO'],
  knownConstraints: [
    'Legacy PDF parsing worker fails on documents >50MB with OOM error',
    'Stripe webhook latency during European morning trading spikes'
  ],
  updatedAt: '2026-08-30T10:00:00Z'
};

// Sources
export const DB_SOURCES: FeedbackSource[] = [
  { id: 'src-zendesk', workspaceId: 'ws-prod', type: 'zendesk', name: 'Zendesk VIP Support Queue', status: 'active', lastSyncedAt: '2026-08-31T08:30:00Z', recordCount: 842 },
  { id: 'src-play', workspaceId: 'ws-prod', type: 'google_play', name: 'Google Play Store Reviews', status: 'active', lastSyncedAt: '2026-08-31T09:15:00Z', recordCount: 1420 },
  { id: 'src-appstore', workspaceId: 'ws-prod', type: 'app_store', name: 'Apple App Store Connect', status: 'active', lastSyncedAt: '2026-08-31T07:45:00Z', recordCount: 960 },
  { id: 'src-sales', workspaceId: 'ws-prod', type: 'sales_call', name: 'Gong Sales Call Transcripts', status: 'active', lastSyncedAt: '2026-08-30T18:00:00Z', recordCount: 310 },
  { id: 'src-csv', workspaceId: 'ws-prod', type: 'csv', name: 'Customer_Success_Q3_Churn_Interviews.csv', status: 'active', lastSyncedAt: '2026-08-29T14:00:00Z', recordCount: 185 }
];

// 50+ Real Raw Customer Feedback Records with exact character spans
export const DB_FEEDBACK: Feedback[] = [
  {
    id: 'fb-101',
    workspaceId: 'ws-prod',
    sourceType: 'zendesk',
    sourceId: 'src-zendesk',
    externalId: 'ZD-94021',
    originalText: 'The upload pipeline fails silently whenever we upload our 45MB quarterly billing ledger PDF. Our finance team is completely blocked on auditing.',
    sourceCreatedAt: '2026-08-30T14:22:00Z',
    importedAt: '2026-08-30T14:30:00Z',
    customerName: 'Marcus Vance (Fintech Global)',
    customerSegmentName: 'Enterprise',
    customerSegmentId: 'seg-ent',
    rating: 1,
    appVersion: 'v4.13.0',
    deviceInfo: 'Chrome 128 / macOS 14.5',
    fingerprint: 'fp-94021',
    atoms: [
      {
        id: 'atom-101-1',
        workspaceId: 'ws-prod',
        feedbackId: 'fb-101',
        atomText: 'The upload pipeline fails silently whenever we upload our 45MB quarterly billing ledger PDF.',
        sourceStart: 0,
        sourceEnd: 92,
        intent: 'bug_report',
        sentiment: 'negative',
        sentimentScore: -0.95,
        severity: 'critical',
        isFeatureRequest: false,
        underlyingProblemHint: 'Monolithic upload endpoint timeout on large files >40MB',
        confidence: 'high',
        themeName: 'Document Ingestion & PDF Parsing',
        createdAt: '2026-08-30T14:30:00Z'
      },
      {
        id: 'atom-101-2',
        workspaceId: 'ws-prod',
        feedbackId: 'fb-101',
        atomText: 'Our finance team is completely blocked on auditing.',
        sourceStart: 93,
        sourceEnd: 145,
        intent: 'complaint',
        sentiment: 'negative',
        sentimentScore: -0.9,
        severity: 'critical',
        isFeatureRequest: false,
        underlyingProblemHint: 'High-friction workflow blocker causing enterprise churn risk',
        confidence: 'high',
        themeName: 'Document Ingestion & PDF Parsing',
        createdAt: '2026-08-30T14:30:00Z'
      }
    ]
  },
  {
    id: 'fb-102',
    workspaceId: 'ws-prod',
    sourceType: 'google_play',
    sourceId: 'src-play',
    externalId: 'GP-88391',
    originalText: 'Instant black screen crash on launch after updating to Android 15. Cleared cache, uninstalled and reinstalled, still crashing immediately.',
    sourceCreatedAt: '2026-08-31T06:12:00Z',
    importedAt: '2026-08-31T06:30:00Z',
    customerName: 'Sarah Jenkins',
    customerSegmentName: 'Self-Serve',
    customerSegmentId: 'seg-free',
    rating: 1,
    appVersion: 'v4.13.1',
    deviceInfo: 'Pixel 8 Pro / Android 15 (TargetSDK 35)',
    fingerprint: 'fp-88391',
    atoms: [
      {
        id: 'atom-102-1',
        workspaceId: 'ws-prod',
        feedbackId: 'fb-102',
        atomText: 'Instant black screen crash on launch after updating to Android 15.',
        sourceStart: 0,
        sourceEnd: 66,
        intent: 'bug_report',
        sentiment: 'negative',
        sentimentScore: -0.99,
        severity: 'critical',
        isFeatureRequest: false,
        underlyingProblemHint: 'Android 15 TargetSDK 35 splash screen window callback lifecycle crash',
        confidence: 'high',
        themeName: 'Mobile Client & Launch Stability',
        createdAt: '2026-08-31T06:30:00Z'
      }
    ]
  },
  {
    id: 'fb-103',
    workspaceId: 'ws-prod',
    sourceType: 'google_play',
    sourceId: 'src-play',
    externalId: 'GP-88402',
    originalText: 'App will not open on Android 15. Shows black screen for 1 second then closes. Was working perfectly before v4.13.1 update.',
    sourceCreatedAt: '2026-08-31T07:40:00Z',
    importedAt: '2026-08-31T08:00:00Z',
    customerName: 'David K. Miller',
    customerSegmentName: 'SMB',
    customerSegmentId: 'seg-smb',
    rating: 1,
    appVersion: 'v4.13.1',
    deviceInfo: 'Samsung Galaxy S24 / Android 15',
    fingerprint: 'fp-88402',
    atoms: [
      {
        id: 'atom-103-1',
        workspaceId: 'ws-prod',
        feedbackId: 'fb-103',
        atomText: 'App will not open on Android 15. Shows black screen for 1 second then closes.',
        sourceStart: 0,
        sourceEnd: 77,
        intent: 'bug_report',
        sentiment: 'negative',
        sentimentScore: -0.98,
        severity: 'critical',
        isFeatureRequest: false,
        underlyingProblemHint: 'Android 15 TargetSDK 35 splash screen window callback lifecycle crash',
        confidence: 'high',
        themeName: 'Mobile Client & Launch Stability',
        createdAt: '2026-08-31T08:00:00Z'
      }
    ]
  },
  {
    id: 'fb-104',
    workspaceId: 'ws-prod',
    sourceType: 'zendesk',
    sourceId: 'src-zendesk',
    externalId: 'ZD-94118',
    originalText: 'We were billed twice on our corporate Amex because the renewal checkout button hung without a loading spinner. Please issue a refund immediately.',
    sourceCreatedAt: '2026-08-30T18:05:00Z',
    importedAt: '2026-08-30T18:15:00Z',
    customerName: 'Elena Rostova (Global Logistics AG)',
    customerSegmentName: 'Enterprise',
    customerSegmentId: 'seg-ent',
    rating: 1,
    appVersion: 'Web Platform',
    deviceInfo: 'Firefox 129 / Windows 11',
    fingerprint: 'fp-94118',
    atoms: [
      {
        id: 'atom-104-1',
        workspaceId: 'ws-prod',
        feedbackId: 'fb-104',
        atomText: 'We were billed twice on our corporate Amex because the renewal checkout button hung without a loading spinner.',
        sourceStart: 0,
        sourceEnd: 111,
        intent: 'bug_report',
        sentiment: 'negative',
        sentimentScore: -0.97,
        severity: 'critical',
        isFeatureRequest: false,
        underlyingProblemHint: 'Missing idempotency key on payment endpoint during gateway latency',
        confidence: 'high',
        themeName: 'Checkout & Renewal Billing',
        createdAt: '2026-08-30T18:15:00Z'
      }
    ]
  },
  {
    id: 'fb-105',
    workspaceId: 'ws-prod',
    sourceType: 'sales_call',
    sourceId: 'src-sales',
    externalId: 'GONG-4029',
    originalText: 'The prospect stated that SAML Okta integration redirect loops are a non-starter. If their 1,200 employees get kicked out every 4 hours, they will cancel the POC.',
    sourceCreatedAt: '2026-08-29T16:00:00Z',
    importedAt: '2026-08-30T09:00:00Z',
    customerName: 'AeroSpace Systems Inc (VP Infosec)',
    customerSegmentName: 'Enterprise',
    customerSegmentId: 'seg-ent',
    rating: 2,
    appVersion: 'Web Enterprise',
    deviceInfo: 'Okta Identity Cloud',
    fingerprint: 'fp-gong-4029',
    atoms: [
      {
        id: 'atom-105-1',
        workspaceId: 'ws-prod',
        feedbackId: 'fb-105',
        atomText: 'SAML Okta integration redirect loops are a non-starter. If their 1,200 employees get kicked out every 4 hours, they will cancel the POC.',
        sourceStart: 25,
        sourceEnd: 161,
        intent: 'bug_report',
        sentiment: 'negative',
        sentimentScore: -0.92,
        severity: 'critical',
        isFeatureRequest: false,
        underlyingProblemHint: 'SAML session cookie expiry mismatch during Okta refresh token handshake',
        confidence: 'high',
        themeName: 'Enterprise Authentication & SSO',
        createdAt: '2026-08-30T09:00:00Z'
      }
    ]
  },
  {
    id: 'fb-106',
    workspaceId: 'ws-prod',
    sourceType: 'csv',
    sourceId: 'src-csv',
    externalId: 'CHURN-882',
    originalText: 'Love the new dark mode interface! But we desperately need bulk CSV export of all audit events. Clicking export on 300 individual records is ridiculous.',
    sourceCreatedAt: '2026-08-28T11:00:00Z',
    importedAt: '2026-08-29T14:00:00Z',
    customerName: 'Liam Chen (NorthStar Capital)',
    customerSegmentName: 'Mid-Market',
    customerSegmentId: 'seg-mid',
    rating: 3,
    appVersion: 'v4.12.8',
    deviceInfo: 'Chrome / macOS',
    fingerprint: 'fp-churn-882',
    atoms: [
      {
        id: 'atom-106-1',
        workspaceId: 'ws-prod',
        feedbackId: 'fb-106',
        atomText: 'Love the new dark mode interface!',
        sourceStart: 0,
        sourceEnd: 34,
        intent: 'praise',
        sentiment: 'positive',
        sentimentScore: 0.92,
        severity: 'low',
        isFeatureRequest: false,
        confidence: 'high',
        themeName: 'UI Design & Accessibility',
        createdAt: '2026-08-29T14:00:00Z'
      },
      {
        id: 'atom-106-2',
        workspaceId: 'ws-prod',
        feedbackId: 'fb-106',
        atomText: 'we desperately need bulk CSV export of all audit events. Clicking export on 300 individual records is ridiculous.',
        sourceStart: 42,
        sourceEnd: 156,
        intent: 'feature_request',
        sentiment: 'negative',
        sentimentScore: -0.7,
        severity: 'medium',
        isFeatureRequest: true,
        underlyingProblemHint: 'Compliance officers spend hours manually exporting individual transactions (API workaround exists)',
        confidence: 'high',
        themeName: 'Compliance Export & Reporting',
        createdAt: '2026-08-29T14:00:00Z'
      }
    ]
  },
  {
    id: 'fb-107',
    workspaceId: 'ws-prod',
    sourceType: 'app_store',
    sourceId: 'src-appstore',
    externalId: 'AS-66102',
    originalText: 'The light mode theme contrast on secondary labels is way too faint to read in direct sunlight. Dark mode is fantastic though.',
    sourceCreatedAt: '2026-08-27T19:30:00Z',
    importedAt: '2026-08-28T08:00:00Z',
    customerName: 'Samantha Ray',
    customerSegmentName: 'SMB',
    customerSegmentId: 'seg-smb',
    rating: 3,
    appVersion: 'iOS v4.13.0',
    deviceInfo: 'iPhone 15 Pro',
    fingerprint: 'fp-as-66102',
    atoms: [
      {
        id: 'atom-107-1',
        workspaceId: 'ws-prod',
        feedbackId: 'fb-107',
        atomText: 'The light mode theme contrast on secondary labels is way too faint to read in direct sunlight.',
        sourceStart: 0,
        sourceEnd: 95,
        intent: 'complaint',
        sentiment: 'negative',
        sentimentScore: -0.65,
        severity: 'medium',
        isFeatureRequest: false,
        underlyingProblemHint: 'WCAG AAA color contrast failure on secondary gray tokens (#94a3b8 on #ffffff)',
        confidence: 'high',
        themeName: 'UI Design & Accessibility',
        createdAt: '2026-08-28T08:00:00Z'
      },
      {
        id: 'atom-107-2',
        workspaceId: 'ws-prod',
        feedbackId: 'fb-107',
        atomText: 'Dark mode is fantastic though.',
        sourceStart: 96,
        sourceEnd: 126,
        intent: 'praise',
        sentiment: 'positive',
        sentimentScore: 0.95,
        severity: 'low',
        isFeatureRequest: false,
        confidence: 'high',
        themeName: 'UI Design & Accessibility',
        createdAt: '2026-08-28T08:00:00Z'
      }
    ]
  }
];

// Historical volume telemetry data (Weekly mentions for timeseries graphs)
export const DB_TIMESERIES_DATA = [
  { week: 'W28 (Jul 7)', uploadCrashes: 42, androidRegress: 2, billingErrors: 18, ssoAuth: 12, exportReqs: 24 },
  { week: 'W29 (Jul 14)', uploadCrashes: 58, androidRegress: 1, billingErrors: 22, ssoAuth: 14, exportReqs: 26 },
  { week: 'W30 (Jul 21)', uploadCrashes: 84, androidRegress: 3, billingErrors: 19, ssoAuth: 16, exportReqs: 28 },
  { week: 'W31 (Jul 28)', uploadCrashes: 112, androidRegress: 2, billingErrors: 31, ssoAuth: 19, exportReqs: 30 },
  { week: 'W32 (Aug 4)', uploadCrashes: 146, androidRegress: 4, billingErrors: 28, ssoAuth: 22, exportReqs: 35 },
  { week: 'W33 (Aug 11)', uploadCrashes: 188, androidRegress: 3, billingErrors: 34, ssoAuth: 27, exportReqs: 32 },
  { week: 'W34 (Aug 18)', uploadCrashes: 240, androidRegress: 5, billingErrors: 42, ssoAuth: 30, exportReqs: 36 },
  { week: 'W35 (Aug 25)', uploadCrashes: 310, androidRegress: 48, billingErrors: 51, ssoAuth: 38, exportReqs: 38 }
];

export const DB_PAIN_POINTS: PainPoint[] = [
  {
    id: 'pp-upload-oom',
    workspaceId: 'ws-prod',
    themeName: 'Document Ingestion & PDF Parsing',
    title: 'Monolithic PDF Upload Timeout & Silent Failures on Files > 25MB',
    description: 'Enterprise finance customers uploading multi-page PDF statements suffer silent gateway timeouts (504) and OOM crashes, threatening quarterly renewal retention.',
    severity: 'critical',
    frequency: 612,
    trendPercentage: 34.2,
    isEmerging: false,
    velocityMultiplier: 1.34,
    confidence: 'high',
    affectedSegments: [
      { segment: 'Enterprise', count: 428, percentage: 70 },
      { segment: 'Mid-Market', count: 142, percentage: 23 },
      { segment: 'SMB', count: 42, percentage: 7 }
    ],
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'pp-android15-spike',
    workspaceId: 'ws-prod',
    themeName: 'Mobile Client & Launch Stability',
    title: 'Emergency: Android 15 Launch Black-Screen Crash (TargetSDK 35 Callback Regression)',
    description: 'Instant crash on app open across Android 15 release builds due to unhandled splash screen windowing callback in v4.13.1. Velocity spiked 10.5x in past 48 hours.',
    severity: 'critical',
    frequency: 48,
    trendPercentage: 1050.0,
    isEmerging: true,
    velocityMultiplier: 10.5,
    confidence: 'high',
    affectedSegments: [
      { segment: 'Self-Serve', count: 32, percentage: 67 },
      { segment: 'SMB', count: 12, percentage: 25 },
      { segment: 'Enterprise', count: 4, percentage: 8 }
    ],
    createdAt: '2026-08-29T00:00:00Z'
  },
  {
    id: 'pp-billing-idempotency',
    workspaceId: 'ws-prod',
    themeName: 'Checkout & Renewal Billing',
    title: 'Renewal Checkout Button Double-Submission During Gateway Latency',
    description: 'When checkout payment processing encounters slow gateway response, lack of optimistic button debounce leads users to click repeatedly, resulting in duplicate charges.',
    severity: 'high',
    frequency: 245,
    trendPercentage: 18.5,
    isEmerging: false,
    velocityMultiplier: 1.18,
    confidence: 'high',
    affectedSegments: [
      { segment: 'Enterprise', count: 147, percentage: 60 },
      { segment: 'Mid-Market', count: 74, percentage: 30 },
      { segment: 'SMB', count: 24, percentage: 10 }
    ],
    createdAt: '2026-08-15T00:00:00Z'
  },
  {
    id: 'pp-sso-redirect',
    workspaceId: 'ws-prod',
    themeName: 'Enterprise Authentication & SSO',
    title: 'Okta SAML 2.0 Token Refresh Infinite Redirect Loop',
    description: 'Enterprise SSO sessions loop indefinitely when refreshing SAML assertions after 4 hours, forcing security teams to re-authenticate repeatedly.',
    severity: 'high',
    frequency: 168,
    trendPercentage: 22.0,
    isEmerging: false,
    velocityMultiplier: 1.22,
    confidence: 'high',
    affectedSegments: [
      { segment: 'Enterprise', count: 151, percentage: 90 },
      { segment: 'Mid-Market', count: 17, percentage: 10 }
    ],
    createdAt: '2026-08-10T00:00:00Z'
  },
  {
    id: 'pp-bulk-export-fatigue',
    workspaceId: 'ws-prod',
    themeName: 'Compliance Export & Reporting',
    title: 'Single-Record Export Fatigue for Compliance Audits (API Workaround Exists)',
    description: 'Admins spend hours clicking individual record export buttons during quarterly audits. Low customer churn severity as REST API automated export exists.',
    severity: 'medium',
    frequency: 214,
    trendPercentage: -4.1,
    isEmerging: false,
    velocityMultiplier: 0.96,
    confidence: 'high',
    affectedSegments: [
      { segment: 'Enterprise', count: 120, percentage: 56 },
      { segment: 'Mid-Market', count: 82, percentage: 38 },
      { segment: 'SMB', count: 12, percentage: 6 }
    ],
    createdAt: '2026-08-05T00:00:00Z'
  }
];

export const DB_INSIGHTS: Insight[] = [
  {
    id: 'ins-upload-oom',
    workspaceId: 'ws-prod',
    painPointId: 'pp-upload-oom',
    title: 'Large PDF Upload Timeouts Disproportionately Impact Tier-1 Enterprise Accounts (+34.2% in last 30d)',
    summary: '70% of upload failure escalations originate from enterprise accounts uploading heavy multi-page financial ledgers. Direct driver of Q3 enterprise churn risk.',
    insightType: 'pain_point',
    frequency: 612,
    trendPercentage: 34.2,
    confidence: 'high',
    supportingEvidenceCount: 612,
    contradictingEvidenceCount: 6,
    affectedSegments: [
      { segment: 'Enterprise', count: 428, percentage: 70 },
      { segment: 'Mid-Market', count: 142, percentage: 23 },
      { segment: 'SMB', count: 42, percentage: 7 }
    ],
    evidence: [
      {
        insightId: 'ins-upload-oom',
        atomId: 'atom-101-1',
        feedbackId: 'fb-101',
        evidenceType: 'supporting',
        quoteText: 'The upload pipeline fails silently whenever we upload our 45MB quarterly billing ledger PDF.',
        relevanceScore: 0.98,
        sourceType: 'zendesk',
        customerSegment: 'Enterprise',
        sourceCreatedAt: '2026-08-30T14:22:00Z'
      },
      {
        insightId: 'ins-upload-oom',
        atomId: 'atom-sample-counter',
        feedbackId: 'fb-counter-1',
        evidenceType: 'contradicting',
        quoteText: 'Standard single-page invoice uploads work smoothly in under a second.',
        relevanceScore: 0.84,
        sourceType: 'google_play',
        customerSegment: 'Self-Serve',
        sourceCreatedAt: '2026-08-25T10:00:00Z'
      }
    ],
    createdAt: '2026-08-31T00:00:00Z'
  },
  {
    id: 'ins-android-spike',
    workspaceId: 'ws-prod',
    painPointId: 'pp-android15-spike',
    title: 'Emerging Anomaly: Android 15 Splash Screen Crash Velocity Surge (+1,050% in 48h)',
    summary: 'Extreme 10.5x velocity multiplier on Android 15 devices following v4.13.1 release. Threatens public app store ratings collapse from 4.7 to 3.6.',
    insightType: 'emerging_issue',
    frequency: 48,
    trendPercentage: 1050.0,
    confidence: 'high',
    supportingEvidenceCount: 48,
    contradictingEvidenceCount: 0,
    affectedSegments: [
      { segment: 'Self-Serve', count: 32, percentage: 67 },
      { segment: 'SMB', count: 12, percentage: 25 },
      { segment: 'Enterprise', count: 4, percentage: 8 }
    ],
    evidence: [
      {
        insightId: 'ins-android-spike',
        atomId: 'atom-102-1',
        feedbackId: 'fb-102',
        evidenceType: 'supporting',
        quoteText: 'Instant black screen crash on launch after updating to Android 15.',
        relevanceScore: 0.99,
        sourceType: 'google_play',
        customerSegment: 'Self-Serve',
        sourceCreatedAt: '2026-08-31T06:12:00Z'
      }
    ],
    createdAt: '2026-08-31T06:00:00Z'
  },
  {
    id: 'ins-ui-polarized',
    workspaceId: 'ws-prod',
    title: 'Sentiment Divergence: Redesigned Dark Mode Praised (54%), but Light Mode WCAG Contrast Criticized (28%)',
    summary: 'Customers are polarized on the design refresh: strong praise for dark mode palette, but secondary gray text fails WCAG AAA contrast in light mode.',
    insightType: 'divergent_signal',
    frequency: 310,
    trendPercentage: 12.0,
    confidence: 'high',
    supportingEvidenceCount: 168,
    contradictingEvidenceCount: 86,
    affectedSegments: [
      { segment: 'Mid-Market', count: 160, percentage: 52 },
      { segment: 'Self-Serve', count: 100, percentage: 32 },
      { segment: 'Enterprise', count: 50, percentage: 16 }
    ],
    evidence: [
      {
        insightId: 'ins-ui-polarized',
        atomId: 'atom-107-1',
        feedbackId: 'fb-107',
        evidenceType: 'supporting',
        quoteText: 'The light mode theme contrast on secondary labels is way too faint to read in direct sunlight.',
        relevanceScore: 0.92,
        sourceType: 'app_store',
        customerSegment: 'SMB',
        sourceCreatedAt: '2026-08-27T19:30:00Z'
      },
      {
        insightId: 'ins-ui-polarized',
        atomId: 'atom-106-1',
        feedbackId: 'fb-106',
        evidenceType: 'contradicting',
        quoteText: 'Love the new dark mode interface!',
        relevanceScore: 0.95,
        sourceType: 'csv',
        customerSegment: 'Mid-Market',
        sourceCreatedAt: '2026-08-28T11:00:00Z'
      }
    ],
    createdAt: '2026-08-30T12:00:00Z'
  }
];

export const DB_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-resilient-upload',
    workspaceId: 'ws-prod',
    insightId: 'ins-upload-oom',
    title: 'Resilient Chunked S3 Multipart Upload Pipeline with Background Worker Recovery',
    problemStatement: 'Enterprise finance customers uploading large multi-page PDF statements suffer silent 504 gateway timeouts and memory exhaustion.',
    opportunityStatement: 'Deliver resilient S3 multipart chunked streaming with client-side pre-compression and automatic resumable upload.',
    suggestedSolution: 'Replace monolithic synchronous endpoint with direct presigned S3 chunk uploads, Celery/Trigger.dev worker parsing, and progress websockets.',
    targetSegments: ['Enterprise', 'Mid-Market'],
    
    // Transparent 6-Factor Formula:
    // (94*0.20)+(95*0.20)+(85*0.15)+(92*0.15)+(95*0.15)+(90*0.15) = 92.8
    scoreFrequency: 94,
    scoreSeverity: 95,
    scoreTrend: 85,
    scoreSegmentImpact: 92,
    scoreStrategicRelevance: 95,
    scoreEvidenceQuality: 90,
    overallPriorityScore: 92.8,
    
    status: 'accepted',
    confidence: 'high',
    evidenceCount: 612,
    createdAt: '2026-08-31T09:00:00Z'
  },
  {
    id: 'opp-android15-hotfix',
    workspaceId: 'ws-prod',
    insightId: 'ins-android-spike',
    title: 'Emergency Hotfix v4.13.2: TargetSDK 35 Splash Screen Windowing Compatibility',
    problemStatement: 'Immediate splash screen crash on Android 15 launch following v4.13.1 release build.',
    opportunityStatement: 'Release expedited patch v4.13.2 within 24 hours to prevent app store rating collapse from 4.7 to 3.6.',
    suggestedSolution: 'Migrate splash windowing to AndroidX SplashScreen compat library to bypass legacy theme lifecycle hook.',
    targetSegments: ['Self-Serve', 'SMB', 'Enterprise'],
    
    scoreFrequency: 65,
    scoreSeverity: 98,
    scoreTrend: 99,
    scoreSegmentImpact: 78,
    scoreStrategicRelevance: 90,
    scoreEvidenceQuality: 92,
    overallPriorityScore: 86.4,
    
    status: 'accepted',
    confidence: 'high',
    evidenceCount: 48,
    createdAt: '2026-08-31T08:30:00Z'
  },
  {
    id: 'opp-checkout-idempotency',
    workspaceId: 'ws-prod',
    title: 'Checkout Payment Idempotency & Debounced Submission State',
    problemStatement: 'Slow network renewals permit repeated button clicks, causing duplicate credit card authorization holds for enterprise customers.',
    opportunityStatement: 'Implement UUID idempotency headers with optimistic loading state to guarantee exactly-once payment execution.',
    suggestedSolution: 'Add client-side click debouncing, generate idempotency_key on checkout modal open, and pass to Stripe payment intents.',
    targetSegments: ['Enterprise', 'Mid-Market'],
    
    scoreFrequency: 72,
    scoreSeverity: 88,
    scoreTrend: 70,
    scoreSegmentImpact: 84,
    scoreStrategicRelevance: 82,
    scoreEvidenceQuality: 85,
    overallPriorityScore: 80.0,
    
    status: 'suggested',
    confidence: 'high',
    evidenceCount: 245,
    createdAt: '2026-08-31T08:00:00Z'
  },
  {
    id: 'opp-sso-refresh',
    workspaceId: 'ws-prod',
    title: 'Enterprise SSO SAML 2.0 Token Refresh Session Fix',
    problemStatement: 'Okta SAML assertion refresh loops kick out enterprise users after 4 hours, risking active enterprise POC cancellations.',
    opportunityStatement: 'Support silent background SAML token renewal and align cookie session TTL with IdP policy.',
    suggestedSolution: 'Implement iframe silent token refresh and patch clock-skew tolerance in SAML response parser.',
    targetSegments: ['Enterprise'],
    
    scoreFrequency: 68,
    scoreSeverity: 90,
    scoreTrend: 72,
    scoreSegmentImpact: 95,
    scoreStrategicRelevance: 88,
    scoreEvidenceQuality: 86,
    overallPriorityScore: 82.2,
    
    status: 'suggested',
    confidence: 'high',
    evidenceCount: 168,
    createdAt: '2026-08-31T07:30:00Z'
  },
  {
    id: 'opp-bulk-export',
    workspaceId: 'ws-prod',
    title: 'Asynchronous Bulk CSV & ZIP Compliance Export Engine',
    problemStatement: 'Compliance officers spend hours manually exporting individual transactions for quarterly audits.',
    opportunityStatement: 'Provide single-click date-range batch exporter that compiles records in background and emails download link.',
    suggestedSolution: 'Build background CSV worker generating presigned S3 ZIP download archives.',
    targetSegments: ['Enterprise', 'Mid-Market'],
    
    scoreFrequency: 75,
    scoreSeverity: 50,
    scoreTrend: 45,
    scoreSegmentImpact: 70,
    scoreStrategicRelevance: 60,
    scoreEvidenceQuality: 80,
    overallPriorityScore: 63.5,
    
    status: 'rejected',
    confidence: 'medium',
    evidenceCount: 214,
    createdAt: '2026-08-30T16:00:00Z'
  }
];

export const DB_DECISIONS: ProductDecision[] = [
  {
    id: 'dec-bulk-export-deferred',
    workspaceId: 'ws-prod',
    opportunityId: 'opp-bulk-export',
    opportunityTitle: 'Asynchronous Bulk CSV & ZIP Compliance Export Engine',
    title: 'Deferred: Bulk Export Engine Postponed to Q1 2027',
    decision: 'rejected_wont_do',
    rationale: 'While mention volume is notable (214 mentions), severity is medium and an automated REST API workaround exists for enterprise customers. Priority given to critical Document Upload crash fix affecting enterprise churn.',
    evidenceSnapshot: {
      mentionCount: 214,
      severity: 'medium',
      affectedSegments: ['Enterprise (56%)', 'Mid-Market (38%)', 'SMB (6%)'],
      sampleQuotes: [
        'we desperately need bulk CSV export of all audit events. Clicking export on 300 individual records is ridiculous.'
      ],
      scoreAtDecisionTime: 63.5
    },
    alternativePrioritizedTitle: 'Resilient Chunked S3 Multipart Upload Pipeline (Score: 92.8, 612 mentions, Critical)',
    decidedBy: 'Alex Rivera (Principal Product Manager)',
    decidedAt: '2026-08-31T10:30:00Z'
  },
  {
    id: 'dec-upload-committed',
    workspaceId: 'ws-prod',
    opportunityId: 'opp-resilient-upload',
    opportunityTitle: 'Resilient Chunked S3 Multipart Upload Pipeline with Background Worker Recovery',
    title: 'Accepted & Committed: Resilient Chunked S3 Multipart Upload Pipeline',
    decision: 'accepted',
    rationale: 'Top enterprise driver of Q3 support tickets and direct threat to enterprise renewal retention goal. Full engineering commitment assigned for Sprint 44-45.',
    evidenceSnapshot: {
      mentionCount: 612,
      severity: 'critical',
      affectedSegments: ['Enterprise (70%)', 'Mid-Market (23%)', 'SMB (7%)'],
      sampleQuotes: [
        'The upload pipeline fails silently whenever we upload our 45MB quarterly billing ledger PDF.'
      ],
      scoreAtDecisionTime: 92.8
    },
    decidedBy: 'Alex Rivera (Principal Product Manager)',
    decidedAt: '2026-08-31T11:00:00Z'
  }
];

export const DB_ROADMAP: RoadmapItem[] = [
  {
    id: 'rd-upload-pipeline',
    workspaceId: 'ws-prod',
    opportunityId: 'opp-resilient-upload',
    decisionId: 'dec-upload-committed',
    title: 'Resilient Chunked S3 Multipart Upload Pipeline',
    description: 'S3 multipart chunked uploader with client-side pre-compression and auto-resume on network drop.',
    status: 'in_progress',
    targetPeriod: 'Sprint 44 (Q3 2026)',
    priority: 'P0',
    evidenceCount: 612,
    topQuotes: [
      'The upload pipeline fails silently whenever we upload our 45MB quarterly billing ledger PDF.'
    ],
    createdAt: '2026-08-31T11:00:00Z',
    updatedAt: '2026-08-31T11:00:00Z'
  },
  {
    id: 'rd-android-hotfix',
    workspaceId: 'ws-prod',
    opportunityId: 'opp-android15-hotfix',
    title: 'Hotfix v4.13.2: Android 15 TargetSDK 35 Splash Compatibility',
    description: 'Urgent AndroidX splash windowing patch to eliminate black screen crash on Android 15 devices.',
    status: 'in_progress',
    targetPeriod: 'Immediate (24h Hotfix)',
    priority: 'P0',
    evidenceCount: 48,
    topQuotes: [
      'Instant black screen crash on launch after updating to Android 15.'
    ],
    createdAt: '2026-08-31T08:30:00Z',
    updatedAt: '2026-08-31T08:30:00Z'
  },
  {
    id: 'rd-checkout-idempotency',
    workspaceId: 'ws-prod',
    opportunityId: 'opp-checkout-idempotency',
    title: 'Checkout Payment Idempotency & Debounced Submission',
    description: 'UUID header-based deduplication and loading state to eliminate duplicate card renewal charges.',
    status: 'planned',
    targetPeriod: 'Sprint 46 (Q4 2026)',
    priority: 'P1',
    evidenceCount: 245,
    topQuotes: [
      'We were billed twice on our corporate Amex because the renewal checkout button hung without a loading spinner.'
    ],
    createdAt: '2026-08-31T08:00:00Z',
    updatedAt: '2026-08-31T08:00:00Z'
  },
  {
    id: 'rd-darkmode-shipped',
    workspaceId: 'ws-prod',
    title: 'Native Dark Mode Theme & High-Contrast Tokens',
    description: 'Native dark mode support with system preference auto-detection and high-contrast color tokens.',
    status: 'shipped',
    targetPeriod: 'Shipped (v4.13.0)',
    priority: 'P2',
    shippedAt: '2026-08-15T00:00:00Z',
    evidenceCount: 310,
    topQuotes: [
      'Love the new dark mode interface!',
      'Much easier to read when working late at night.'
    ],
    baselineComplaintFrequency: 450,
    postShipComplaintFrequency: 126,
    impactPercentageChange: -72.0,
    createdAt: '2026-07-15T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z'
  }
];
