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
  id: 'ws-trace-primary',
  name: 'Acme Cloud Platform',
  slug: 'acme-cloud',
  productName: 'Acme Workspace Pro',
  productCategory: 'B2B Enterprise Productivity',
  createdAt: '2026-08-01T00:00:00Z'
};

export const INITIAL_PRODUCT_CONTEXT: ProductContext = {
  workspaceId: 'ws-trace-primary',
  companyGoals: [
    { id: 'g-1', goal: 'Reduce Enterprise Customer Churn by 25% in Q3/Q4', priority: 'high' },
    { id: 'g-2', goal: 'Achieve >4.6 Star Rating across Google Play & App Store', priority: 'medium' },
    { id: 'g-3', goal: 'Automate manual data extraction and reporting workflows', priority: 'high' }
  ],
  targetSegments: [
    { segmentId: 'seg-enterprise', name: 'Enterprise', weight: 1.5 },
    { segmentId: 'seg-smb', name: 'SMB', weight: 1.1 },
    { segmentId: 'seg-consumer', name: 'Consumer', weight: 0.8 }
  ],
  strategicFocusAreas: ['Document Management', 'Billing Reliability', 'Mobile Stability', 'Export Engine'],
  knownConstraints: [
    'Legacy PDF parsing backend cannot handle files > 50MB before Q4 rewrite',
    'Stripe webhook latency during peak European trading hours'
  ],
  updatedAt: '2026-08-30T10:00:00Z'
};

export const INITIAL_CUSTOMER_SEGMENTS: CustomerSegment[] = [
  { id: 'seg-enterprise', workspaceId: 'ws-trace-primary', name: 'Enterprise', description: 'Companies > 250 employees', strategicWeight: 1.5 },
  { id: 'seg-smb', workspaceId: 'ws-trace-primary', name: 'SMB', description: 'Growing teams 10-250 seats', strategicWeight: 1.1 },
  { id: 'seg-consumer', workspaceId: 'ws-trace-primary', name: 'Consumer', description: 'Individual freelancers & self-serve users', strategicWeight: 0.8 }
];

export const INITIAL_SOURCES: FeedbackSource[] = [
  { id: 'src-csv-q3', workspaceId: 'ws-trace-primary', type: 'csv', name: 'Customer_Support_Q3_Export.csv', status: 'active', lastSyncedAt: '2026-08-31T09:15:00Z', recordCount: 1420 },
  { id: 'src-play-store', workspaceId: 'ws-trace-primary', type: 'google_play', name: 'Google Play Store Reviews', status: 'active', lastSyncedAt: '2026-08-31T08:00:00Z', recordCount: 2840 },
  { id: 'src-app-store', workspaceId: 'ws-trace-primary', type: 'app_store', name: 'Apple App Store Connect', status: 'active', lastSyncedAt: '2026-08-30T22:30:00Z', recordCount: 1690 },
  { id: 'src-zendesk', workspaceId: 'ws-trace-primary', type: 'zendesk', name: 'Zendesk VIP Support Queue', status: 'active', lastSyncedAt: '2026-08-31T11:45:00Z', recordCount: 950 }
];

export const INITIAL_FEEDBACK: Feedback[] = [
  {
    id: 'fb-001',
    workspaceId: 'ws-trace-primary',
    sourceType: 'zendesk',
    sourceId: 'src-zendesk',
    externalId: 'ZD-89421',
    originalText: 'The app crashes whenever I upload a 20MB PDF invoice, and honestly we cannot export bulk reports for our quarterly audit.',
    sourceCreatedAt: '2026-08-28T14:22:00Z',
    importedAt: '2026-08-28T14:30:00Z',
    customerName: 'Marcus Vance (Fintech Corp)',
    customerSegmentName: 'Enterprise',
    customerSegmentId: 'seg-enterprise',
    rating: 1,
    appVersion: 'v4.12.0',
    deviceInfo: 'Web Chrome / macOS 14.5',
    fingerprint: 'fp-89421-pdf-crash',
    atoms: [
      {
        id: 'atom-001-a',
        workspaceId: 'ws-trace-primary',
        feedbackId: 'fb-001',
        atomText: 'The app crashes whenever I upload a 20MB PDF invoice',
        sourceStart: 0,
        sourceEnd: 51,
        intent: 'bug_report',
        sentiment: 'negative',
        sentimentScore: -0.92,
        severity: 'critical',
        isFeatureRequest: false,
        underlyingProblemHint: 'Upload timeout/crash on multi-page PDF files exceeding 15MB',
        confidence: 'high',
        themeName: 'Document Upload & Parsing',
        createdAt: '2026-08-28T14:30:00Z'
      },
      {
        id: 'atom-001-b',
        workspaceId: 'ws-trace-primary',
        feedbackId: 'fb-001',
        atomText: 'we cannot export bulk reports for our quarterly audit.',
        sourceStart: 66,
        sourceEnd: 120,
        intent: 'feature_request',
        sentiment: 'negative',
        sentimentScore: -0.65,
        severity: 'medium',
        isFeatureRequest: true,
        underlyingProblemHint: 'Finance teams waste hours manually downloading individual statements',
        confidence: 'high',
        themeName: 'Export & Compliance Reporting',
        createdAt: '2026-08-28T14:30:00Z'
      }
    ]
  },
  {
    id: 'fb-002',
    workspaceId: 'ws-trace-primary',
    sourceType: 'google_play',
    sourceId: 'src-play-store',
    externalId: 'GP-401923',
    originalText: 'Immediate crash on launch after updating to Android 15. Reinstalled twice and still black screens.',
    sourceCreatedAt: '2026-08-30T09:12:00Z',
    importedAt: '2026-08-30T09:30:00Z',
    customerName: 'Sarah Jenkins',
    customerSegmentName: 'Consumer',
    customerSegmentId: 'seg-consumer',
    rating: 1,
    appVersion: 'v4.13.1',
    deviceInfo: 'Pixel 8 Pro (Android 15 beta/release)',
    fingerprint: 'fp-android15-blackscreen',
    atoms: [
      {
        id: 'atom-002-a',
        workspaceId: 'ws-trace-primary',
        feedbackId: 'fb-002',
        atomText: 'Immediate crash on launch after updating to Android 15. Reinstalled twice and still black screens.',
        sourceStart: 0,
        sourceEnd: 99,
        intent: 'bug_report',
        sentiment: 'negative',
        sentimentScore: -0.98,
        severity: 'critical',
        isFeatureRequest: false,
        underlyingProblemHint: 'TargetSDK 35 compatibility crash on splash screen initialization',
        confidence: 'high',
        themeName: 'Mobile Authentication & Launch Stability',
        createdAt: '2026-08-30T09:30:00Z'
      }
    ]
  },
  {
    id: 'fb-003',
    workspaceId: 'ws-trace-primary',
    sourceType: 'app_store',
    sourceId: 'src-app-store',
    externalId: 'AS-77182',
    originalText: 'Love the new dark mode theme! It looks super slick. But please add bulk CSV export so I don\'t have to click 50 times.',
    sourceCreatedAt: '2026-08-29T18:05:00Z',
    importedAt: '2026-08-29T18:15:00Z',
    customerName: 'Devon Miller',
    customerSegmentName: 'SMB',
    customerSegmentId: 'seg-smb',
    rating: 4,
    appVersion: 'v4.13.0',
    deviceInfo: 'iPhone 15 Pro (iOS 17.5)',
    fingerprint: 'fp-darkmode-bulk-as',
    atoms: [
      {
        id: 'atom-003-a',
        workspaceId: 'ws-trace-primary',
        feedbackId: 'fb-003',
        atomText: 'Love the new dark mode theme! It looks super slick.',
        sourceStart: 0,
        sourceEnd: 52,
        intent: 'praise',
        sentiment: 'positive',
        sentimentScore: 0.94,
        severity: 'low',
        isFeatureRequest: false,
        confidence: 'high',
        themeName: 'Dark Mode & UI Accessibility',
        createdAt: '2026-08-29T18:15:00Z'
      },
      {
        id: 'atom-003-b',
        workspaceId: 'ws-trace-primary',
        feedbackId: 'fb-003',
        atomText: 'please add bulk CSV export so I don\'t have to click 50 times.',
        sourceStart: 57,
        sourceEnd: 118,
        intent: 'feature_request',
        sentiment: 'neutral',
        sentimentScore: -0.2,
        severity: 'medium',
        isFeatureRequest: true,
        underlyingProblemHint: 'Repetitive single-item export fatigue for SMB accounts',
        confidence: 'high',
        themeName: 'Export & Compliance Reporting',
        createdAt: '2026-08-29T18:15:00Z'
      }
    ]
  },
  {
    id: 'fb-004',
    workspaceId: 'ws-trace-primary',
    sourceType: 'zendesk',
    sourceId: 'src-zendesk',
    externalId: 'ZD-89910',
    originalText: 'Our European accounts team was charged twice during checkout renewal because the button froze without loading spinner.',
    sourceCreatedAt: '2026-08-31T07:45:00Z',
    importedAt: '2026-08-31T08:00:00Z',
    customerName: 'Elena Rostova (Global Logistics AG)',
    customerSegmentName: 'Enterprise',
    customerSegmentId: 'seg-enterprise',
    rating: 1,
    appVersion: 'Web v4.13.0',
    deviceInfo: 'Firefox 129 / Windows 11',
    fingerprint: 'fp-double-charge-checkout',
    atoms: [
      {
        id: 'atom-004-a',
        workspaceId: 'ws-trace-primary',
        feedbackId: 'fb-004',
        atomText: 'Our European accounts team was charged twice during checkout renewal because the button froze without loading spinner.',
        sourceStart: 0,
        sourceEnd: 120,
        intent: 'bug_report',
        sentiment: 'negative',
        sentimentScore: -0.96,
        severity: 'critical',
        isFeatureRequest: false,
        underlyingProblemHint: 'Double submission idempotency flaw during gateway timeout',
        confidence: 'high',
        themeName: 'Checkout & Renewal Billing',
        createdAt: '2026-08-31T08:00:00Z'
      }
    ]
  },
  {
    id: 'fb-005',
    workspaceId: 'ws-trace-primary',
    sourceType: 'csv',
    sourceId: 'src-csv-q3',
    externalId: 'CSV-1049',
    originalText: 'The new analytics dashboard is clean and fast, but the contrast between text and background in light mode is hard to read.',
    sourceCreatedAt: '2026-08-27T11:20:00Z',
    importedAt: '2026-08-31T09:15:00Z',
    customerName: 'Liam Chen',
    customerSegmentName: 'SMB',
    customerSegmentId: 'seg-smb',
    rating: 3,
    appVersion: 'v4.12.5',
    deviceInfo: 'MacBook Air M2',
    fingerprint: 'fp-dashboard-contrast-smb',
    atoms: [
      {
        id: 'atom-005-a',
        workspaceId: 'ws-trace-primary',
        feedbackId: 'fb-005',
        atomText: 'The new analytics dashboard is clean and fast',
        sourceStart: 0,
        sourceEnd: 45,
        intent: 'praise',
        sentiment: 'positive',
        sentimentScore: 0.88,
        severity: 'low',
        isFeatureRequest: false,
        confidence: 'high',
        themeName: 'Dark Mode & UI Accessibility',
        createdAt: '2026-08-31T09:15:00Z'
      },
      {
        id: 'atom-005-b',
        workspaceId: 'ws-trace-primary',
        feedbackId: 'fb-005',
        atomText: 'the contrast between text and background in light mode is hard to read.',
        sourceStart: 51,
        sourceEnd: 122,
        intent: 'complaint',
        sentiment: 'negative',
        sentimentScore: -0.6,
        severity: 'medium',
        isFeatureRequest: false,
        underlyingProblemHint: 'WCAG AAA contrast failure on secondary slate gray badges in light mode',
        confidence: 'high',
        themeName: 'Dark Mode & UI Accessibility',
        createdAt: '2026-08-31T09:15:00Z'
      }
    ]
  }
];

export const INITIAL_THEMES: Theme[] = [
  {
    id: 'theme-doc-upload',
    workspaceId: 'ws-trace-primary',
    name: 'Document Upload & Parsing',
    description: 'Feedback regarding PDF, XLSX, and invoice uploads, timeout failures, and large file handling.',
    atomCount: 612,
    confidence: 'high',
    status: 'active',
    topKeywords: ['PDF upload', 'invoice failure', 'timeout', '50MB limit', 'crash on drop'],
    sentimentBreakdown: { positive: 8, neutral: 14, negative: 78 },
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'theme-mobile-stability',
    workspaceId: 'ws-trace-primary',
    name: 'Mobile Authentication & Launch Stability',
    description: 'Reports of crashes on launch, black screens on Android 15, and session token expiry loops.',
    atomCount: 384,
    confidence: 'high',
    status: 'active',
    topKeywords: ['Android 15', 'black screen', 'crash on launch', 'face ID loop', 'reinstalled'],
    sentimentBreakdown: { positive: 2, neutral: 6, negative: 92 },
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'theme-billing',
    workspaceId: 'ws-trace-primary',
    name: 'Checkout & Renewal Billing',
    description: 'Issues with renewal checkout freezing, double charging, and invoice tax display.',
    atomCount: 245,
    confidence: 'high',
    status: 'active',
    topKeywords: ['double charged', 'checkout freeze', 'VAT number', 'no spinner', 'payment error'],
    sentimentBreakdown: { positive: 5, neutral: 12, negative: 83 },
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'theme-export-reporting',
    workspaceId: 'ws-trace-primary',
    name: 'Export & Compliance Reporting',
    description: 'Feature requests for bulk CSV export, scheduled PDF summaries, and audit trail downloads.',
    atomCount: 214,
    confidence: 'high',
    status: 'active',
    topKeywords: ['bulk export', 'CSV download', 'quarterly audit', 'click 50 times', 'scheduled email'],
    sentimentBreakdown: { positive: 12, neutral: 48, negative: 40 },
    createdAt: '2026-08-01T00:00:00Z'
  },
  {
    id: 'theme-ui-contrast',
    workspaceId: 'ws-trace-primary',
    name: 'Dark Mode & UI Accessibility',
    description: 'Reactions to recent dashboard redesign, light mode contrast, and dark mode palette praise.',
    atomCount: 310,
    confidence: 'high',
    status: 'active',
    topKeywords: ['dark mode praise', 'contrast', 'hard to read', 'clean design', 'slate gray font'],
    sentimentBreakdown: { positive: 54, neutral: 18, negative: 28 },
    createdAt: '2026-08-01T00:00:00Z'
  }
];

export const INITIAL_PAIN_POINTS: PainPoint[] = [
  {
    id: 'pp-upload-crashes',
    workspaceId: 'ws-trace-primary',
    themeId: 'theme-doc-upload',
    themeName: 'Document Upload & Parsing',
    title: 'Multi-page PDF upload failure on files > 15MB',
    description: 'Enterprise finance customers experience silent timeouts or browser tab freezes when uploading multi-page PDF statements.',
    severity: 'critical',
    frequency: 612,
    trendPercentage: 34.2,
    isEmerging: false,
    velocityMultiplier: 1.34,
    confidence: 'high',
    affectedSegments: [
      { segment: 'Enterprise', count: 428, percentage: 70 },
      { segment: 'SMB', count: 142, percentage: 23 },
      { segment: 'Consumer', count: 42, percentage: 7 }
    ],
    createdAt: '2026-08-10T00:00:00Z'
  },
  {
    id: 'pp-android-15-spike',
    workspaceId: 'ws-trace-primary',
    themeId: 'theme-mobile-stability',
    themeName: 'Mobile Authentication & Launch Stability',
    title: 'Instant splash screen black-out on Android 15 release',
    description: 'Users on Android 15 encounter a total launch crash due to TargetSDK 35 splash screen windowing incompatibility.',
    severity: 'critical',
    frequency: 48,
    trendPercentage: 1050.0,
    isEmerging: true,
    velocityMultiplier: 10.5,
    confidence: 'high',
    affectedSegments: [
      { segment: 'Consumer', count: 32, percentage: 67 },
      { segment: 'SMB', count: 12, percentage: 25 },
      { segment: 'Enterprise', count: 4, percentage: 8 }
    ],
    createdAt: '2026-08-29T00:00:00Z'
  },
  {
    id: 'pp-checkout-double-charge',
    workspaceId: 'ws-trace-primary',
    themeId: 'theme-billing',
    themeName: 'Checkout & Renewal Billing',
    title: 'Double submission during checkout button freeze',
    description: 'When checkout network latency occurs, lack of button disable state leads users to click repeatedly, causing duplicate card authorizations.',
    severity: 'high',
    frequency: 184,
    trendPercentage: 18.5,
    isEmerging: false,
    velocityMultiplier: 1.18,
    confidence: 'high',
    affectedSegments: [
      { segment: 'Enterprise', count: 110, percentage: 60 },
      { segment: 'SMB', count: 58, percentage: 31 },
      { segment: 'Consumer', count: 16, percentage: 9 }
    ],
    createdAt: '2026-08-15T00:00:00Z'
  },
  {
    id: 'pp-manual-export-fatigue',
    workspaceId: 'ws-trace-primary',
    themeId: 'theme-export-reporting',
    themeName: 'Export & Compliance Reporting',
    title: 'Manual individual export fatigue for compliance audits',
    description: 'Admins spend upwards of 3 hours per month clicking single-item exports rather than executing a batch download.',
    severity: 'medium',
    frequency: 214,
    trendPercentage: -4.1,
    isEmerging: false,
    velocityMultiplier: 0.96,
    confidence: 'high',
    affectedSegments: [
      { segment: 'Enterprise', count: 120, percentage: 56 },
      { segment: 'SMB', count: 82, percentage: 38 },
      { segment: 'Consumer', count: 12, percentage: 6 }
    ],
    createdAt: '2026-08-05T00:00:00Z'
  }
];

export const INITIAL_INSIGHTS: Insight[] = [
  {
    id: 'ins-doc-upload-enterprise',
    workspaceId: 'ws-trace-primary',
    painPointId: 'pp-upload-crashes',
    title: 'Document upload failures are disproportionately impacting Enterprise accounts (+34.2% in last 30d)',
    summary: 'Over 70% of upload crash tickets originate from Tier-1 Enterprise customers uploading quarterly compliance packets. The issue has accelerated following the v4.12 client release.',
    insightType: 'pain_point',
    frequency: 612,
    trendPercentage: 34.2,
    confidence: 'high',
    supportingEvidenceCount: 612,
    contradictingEvidenceCount: 4,
    affectedSegments: [
      { segment: 'Enterprise', count: 428, percentage: 70 },
      { segment: 'SMB', count: 142, percentage: 23 },
      { segment: 'Consumer', count: 42, percentage: 7 }
    ],
    evidence: [
      {
        insightId: 'ins-doc-upload-enterprise',
        atomId: 'atom-001-a',
        feedbackId: 'fb-001',
        evidenceType: 'supporting',
        quoteText: 'The app crashes whenever I upload a 20MB PDF invoice',
        relevanceScore: 0.98,
        sourceType: 'zendesk',
        customerSegment: 'Enterprise',
        sourceCreatedAt: '2026-08-28T14:22:00Z'
      },
      {
        insightId: 'ins-doc-upload-enterprise',
        atomId: 'atom-sample-praise-upload',
        feedbackId: 'fb-sample-praise',
        evidenceType: 'contradicting',
        quoteText: 'Small 1-page receipts upload smoothly in under a second for me.',
        relevanceScore: 0.82,
        sourceType: 'google_play',
        customerSegment: 'Consumer',
        sourceCreatedAt: '2026-08-26T10:00:00Z'
      }
    ],
    createdAt: '2026-08-31T00:00:00Z'
  },
  {
    id: 'ins-android-15-velocity',
    workspaceId: 'ws-trace-primary',
    painPointId: 'pp-android-15-spike',
    title: 'Emerging Issue: Android 15 launch crash velocity spiked +1,050% over past 48 hours',
    summary: 'Despite representing only 48 absolute reviews so far, this regression has an extreme velocity multiplier (10.5x) and a 100% 1-star review correlation on Google Play.',
    insightType: 'emerging_issue',
    frequency: 48,
    trendPercentage: 1050.0,
    confidence: 'high',
    supportingEvidenceCount: 48,
    contradictingEvidenceCount: 0,
    affectedSegments: [
      { segment: 'Consumer', count: 32, percentage: 67 },
      { segment: 'SMB', count: 12, percentage: 25 },
      { segment: 'Enterprise', count: 4, percentage: 8 }
    ],
    evidence: [
      {
        insightId: 'ins-android-15-velocity',
        atomId: 'atom-002-a',
        feedbackId: 'fb-002',
        evidenceType: 'supporting',
        quoteText: 'Immediate crash on launch after updating to Android 15. Reinstalled twice and still black screens.',
        relevanceScore: 0.99,
        sourceType: 'google_play',
        customerSegment: 'Consumer',
        sourceCreatedAt: '2026-08-30T09:12:00Z'
      }
    ],
    createdAt: '2026-08-31T06:00:00Z'
  },
  {
    id: 'ins-divergent-dashboard',
    workspaceId: 'ws-trace-primary',
    title: 'Divergent Signal: Redesigned UI receives praise for aesthetic dark mode but complaints on light mode contrast',
    summary: 'Customers are polarized on the new UI: 54% positive praise for the sleek dark theme, while 28% report accessibility eye strain on low-contrast gray text in light mode.',
    insightType: 'divergent_signal',
    frequency: 310,
    trendPercentage: 12.0,
    confidence: 'high',
    supportingEvidenceCount: 168,
    contradictingEvidenceCount: 86,
    affectedSegments: [
      { segment: 'SMB', count: 160, percentage: 52 },
      { segment: 'Consumer', count: 100, percentage: 32 },
      { segment: 'Enterprise', count: 50, percentage: 16 }
    ],
    evidence: [
      {
        insightId: 'ins-divergent-dashboard',
        atomId: 'atom-005-b',
        feedbackId: 'fb-005',
        evidenceType: 'supporting',
        quoteText: 'the contrast between text and background in light mode is hard to read.',
        relevanceScore: 0.92,
        sourceType: 'csv',
        customerSegment: 'SMB',
        sourceCreatedAt: '2026-08-27T11:20:00Z'
      },
      {
        insightId: 'ins-divergent-dashboard',
        atomId: 'atom-003-a',
        feedbackId: 'fb-003',
        evidenceType: 'contradicting',
        quoteText: 'Love the new dark mode theme! It looks super slick.',
        relevanceScore: 0.95,
        sourceType: 'app_store',
        customerSegment: 'SMB',
        sourceCreatedAt: '2026-08-29T18:05:00Z'
      }
    ],
    createdAt: '2026-08-30T12:00:00Z'
  }
];

export const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-doc-resilience',
    workspaceId: 'ws-trace-primary',
    insightId: 'ins-doc-upload-enterprise',
    title: 'Re-architect Document Upload Pipeline with Chunked Streaming & Worker Recovery',
    problemStatement: 'Enterprise customers uploading large multi-page PDF statements experience unrecoverable timeout crashes, driving churn risks.',
    opportunityStatement: 'Deliver resilient background chunked uploading with resumable transfer and client-side pre-flight compression.',
    suggestedSolution: 'Replace synchronous monolithic upload endpoint with S3 chunked multipart upload and background worker queue.',
    targetSegments: ['Enterprise', 'SMB'],
    
    // Explainable Score: (94*0.20)+(95*0.20)+(85*0.15)+(92*0.15)+(95*0.15)+(90*0.15) = 92.8
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
    id: 'opp-android-15-hotfix',
    workspaceId: 'ws-trace-primary',
    insightId: 'ins-android-15-velocity',
    title: 'Emergency Hotfix: TargetSDK 35 Splash Screen Initialization Fix for Android 15',
    problemStatement: 'Android 15 users crash immediately on app open due to unhandled splash screen lifecycle callback in v4.13.1.',
    opportunityStatement: 'Release expedited patch v4.13.2 within 24h to prevent app store rating collapse from 4.7 to 3.8.',
    suggestedSolution: 'Migrate to AndroidX SplashScreen API compat library and bypass legacy theme splash windowing.',
    targetSegments: ['Consumer', 'SMB', 'Enterprise'],
    
    // Explainable Score
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
    workspaceId: 'ws-trace-primary',
    title: 'Checkout Idempotency Key & Optimistic Loading State',
    problemStatement: 'Slow network renewals allow duplicate button clicks, creating double authorization charges for customers.',
    opportunityStatement: 'Implement client-side click debouncing with UUID idempotency headers to guarantee exactly-once payment execution.',
    suggestedSolution: 'Add optimistic disabled button state with spinner, generate checkout_idempotency_key on modal load.',
    targetSegments: ['Enterprise', 'SMB'],
    scoreFrequency: 72,
    scoreSeverity: 88,
    scoreTrend: 70,
    scoreSegmentImpact: 84,
    scoreStrategicRelevance: 82,
    scoreEvidenceQuality: 85,
    overallPriorityScore: 80.0,
    status: 'suggested',
    confidence: 'high',
    evidenceCount: 184,
    createdAt: '2026-08-31T08:00:00Z'
  },
  {
    id: 'opp-bulk-export-engine',
    workspaceId: 'ws-trace-primary',
    title: 'Asynchronous Bulk CSV & ZIP Compliance Export Engine',
    problemStatement: 'Finance admins waste hours downloading records one by one for quarterly reporting.',
    opportunityStatement: 'Provide single-click date-range batch exporter that compiles records in background and emails download link.',
    suggestedSolution: 'Build background CSV worker generating presigned S3 ZIP download archives.',
    targetSegments: ['Enterprise', 'SMB'],
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

export const INITIAL_DECISIONS: ProductDecision[] = [
  {
    id: 'dec-001-bulk-export-reject',
    workspaceId: 'ws-trace-primary',
    opportunityId: 'opp-bulk-export-engine',
    opportunityTitle: 'Asynchronous Bulk CSV & ZIP Compliance Export Engine',
    title: 'Deferred: Bulk Export Engine postponed to Q1 2027',
    decision: 'rejected_wont_do',
    rationale: 'While mention volume is notable (214 mentions), severity is medium and an existing automated REST API workaround exists for enterprise customers. Priority given to critical Document Upload crash fix affecting enterprise churn.',
    evidenceSnapshot: {
      mentionCount: 214,
      severity: 'medium',
      affectedSegments: ['Enterprise (56%)', 'SMB (38%)', 'Consumer (6%)'],
      sampleQuotes: [
        'we cannot export bulk reports for our quarterly audit.',
        'please add bulk CSV export so I don\'t have to click 50 times.'
      ],
      scoreAtDecisionTime: 63.5
    },
    alternativePrioritizedTitle: 'Re-architect Document Upload Pipeline (Score: 92.8, 612 mentions, Critical)',
    decidedBy: 'Alex Rivera (Principal PM)',
    decidedAt: '2026-08-31T10:30:00Z'
  },
  {
    id: 'dec-002-doc-upload-accept',
    workspaceId: 'ws-trace-primary',
    opportunityId: 'opp-doc-resilience',
    opportunityTitle: 'Re-architect Document Upload Pipeline with Chunked Streaming',
    title: 'Accepted & Committed: Re-architect Document Upload Pipeline',
    decision: 'accepted',
    rationale: 'Top enterprise driver of Q3 support tickets and direct threat to enterprise renewal retention goal. Full engineering commitment assigned for Sprint 4-5.',
    evidenceSnapshot: {
      mentionCount: 612,
      severity: 'critical',
      affectedSegments: ['Enterprise (70%)', 'SMB (23%)', 'Consumer (7%)'],
      sampleQuotes: [
        'The app crashes whenever I upload a 20MB PDF invoice',
        'Upload timed out three times in a row for our monthly payroll file.'
      ],
      scoreAtDecisionTime: 92.8
    },
    decidedBy: 'Alex Rivera (Principal PM)',
    decidedAt: '2026-08-31T11:00:00Z'
  }
];

export const INITIAL_ROADMAP: RoadmapItem[] = [
  {
    id: 'rd-001',
    workspaceId: 'ws-trace-primary',
    opportunityId: 'opp-doc-resilience',
    decisionId: 'dec-002-doc-upload-accept',
    title: 'Resilient Chunked PDF & Invoice Upload Pipeline',
    description: 'S3 multipart chunked uploader with client-side compression and auto-resume on network drop.',
    status: 'in_progress',
    targetPeriod: 'Q3 2026 (Sprint 44)',
    priority: 'P0',
    evidenceCount: 612,
    topQuotes: [
      'The app crashes whenever I upload a 20MB PDF invoice',
      'Upload timed out three times in a row for our monthly payroll file.'
    ],
    createdAt: '2026-08-31T11:00:00Z',
    updatedAt: '2026-08-31T11:00:00Z'
  },
  {
    id: 'rd-002',
    workspaceId: 'ws-trace-primary',
    opportunityId: 'opp-android-15-hotfix',
    title: 'Hotfix v4.13.2: Android 15 Splash Screen Compatibility',
    description: 'Urgent AndroidX splash windowing patch to eliminate black screen regression.',
    status: 'in_progress',
    targetPeriod: 'Immediate (24h Patch)',
    priority: 'P0',
    evidenceCount: 48,
    topQuotes: [
      'Immediate crash on launch after updating to Android 15. Reinstalled twice and still black screens.'
    ],
    createdAt: '2026-08-31T08:30:00Z',
    updatedAt: '2026-08-31T08:30:00Z'
  },
  {
    id: 'rd-003',
    workspaceId: 'ws-trace-primary',
    opportunityId: 'opp-checkout-idempotency',
    title: 'Checkout Idempotency & Debounced Submission',
    description: 'Header-based deduplication and loading state to eliminate double renewals.',
    status: 'planned',
    targetPeriod: 'Q4 2026 (Sprint 46)',
    priority: 'P1',
    evidenceCount: 184,
    topQuotes: [
      'Our European accounts team was charged twice during checkout renewal because the button froze.'
    ],
    createdAt: '2026-08-31T08:00:00Z',
    updatedAt: '2026-08-31T08:00:00Z'
  },
  {
    id: 'rd-004-shipped',
    workspaceId: 'ws-trace-primary',
    title: 'Dark Mode System Palette & Theme Toggle',
    description: 'Native dark mode support with system preference auto-detection and high-contrast color tokens.',
    status: 'shipped',
    targetPeriod: 'Shipped (v4.13.0)',
    priority: 'P2',
    shippedAt: '2026-08-15T00:00:00Z',
    evidenceCount: 310,
    topQuotes: [
      'Love the new dark mode theme! It looks super slick.',
      'Much easier to read when working late at night.'
    ],
    // Post-Ship Impact
    baselineComplaintFrequency: 450,
    postShipComplaintFrequency: 126,
    impactPercentageChange: -72.0,
    createdAt: '2026-07-15T00:00:00Z',
    updatedAt: '2026-08-31T00:00:00Z'
  }
];
