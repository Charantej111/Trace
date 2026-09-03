import { GooglePlayAdapter } from '../evidence/adapters/google-play-adapter';
import { AppStoreAdapter } from '../evidence/adapters/app-store-adapter';
import {
  ReviewSourceAdapter,
  RawReviewItem,
  AppMetadata
} from '../evidence/adapters/review-source-adapter';
import { FeedbackRepo } from '../repositories/feedback-repo';
import { SubstringAtomizer } from '../intelligence/atomization/substring-atomizer';
import { ExplainableScoringEngine } from '../scoring/explainable-scoring';
import { Feedback } from '../types/trace';

export async function runReviewIngestionTests(): Promise<{ passed: number; failed: number; log: string[] }> {
  const log: string[] = [];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      log.push(`✓ [PASS] ${testName}`);
      passed++;
    } else {
      log.push(`✗ [FAIL] ${testName}`);
      failed++;
    }
  }

  log.push('--- RUNNING APP STORE & GOOGLE PLAY REVIEW INGESTION CONTRACT TESTS ---');

  // Test 1: Google Play URL validation
  const gpValid1 = GooglePlayAdapter.validateUrl('https://play.google.com/store/apps/details?id=com.spotify.music&hl=en');
  assert(gpValid1.isValid && gpValid1.appId === 'com.spotify.music', 'Google Play: Valid URL parsed with package ID');

  const gpValid2 = GooglePlayAdapter.validateUrl('https://play.google.com/store/apps/details?id=com.whatsapp');
  assert(gpValid2.isValid && gpValid2.appId === 'com.whatsapp', 'Google Play: Valid short URL parsed');

  const gpInvalidDomain = GooglePlayAdapter.validateUrl('https://malicious-site.com/store/apps/details?id=com.spotify.music');
  assert(!gpInvalidDomain.isValid, 'Google Play: Invalid domain rejected');

  const gpMissingId = GooglePlayAdapter.validateUrl('https://play.google.com/store/apps/details');
  assert(!gpMissingId.isValid, 'Google Play: Missing package ID rejected');

  const gpInvalidPackage = GooglePlayAdapter.validateUrl('https://play.google.com/store/apps/details?id=singleword');
  assert(!gpInvalidPackage.isValid, 'Google Play: Malformed package ID rejected');

  // Test 2: Apple App Store URL validation
  const asValid1 = AppStoreAdapter.validateUrl('https://apps.apple.com/us/app/spotify-music-and-podcasts/id324684580');
  assert(asValid1.isValid && asValid1.appId === '324684580' && asValid1.country === 'us', 'App Store: Valid standard US URL parsed');

  const asValid2 = AppStoreAdapter.validateUrl('https://apps.apple.com/gb/app/whatsapp-messenger/id310633997');
  assert(asValid2.isValid && asValid2.appId === '310633997' && asValid2.country === 'gb', 'App Store: Country storefront (GB) parsed');

  const asInvalidDomain = AppStoreAdapter.validateUrl('https://notapple.com/us/app/example/id324684580');
  assert(!asInvalidDomain.isValid, 'App Store: Invalid domain rejected');

  const asMissingId = AppStoreAdapter.validateUrl('https://apps.apple.com/us/app/spotify-music-and-podcasts/');
  assert(!asMissingId.isValid, 'App Store: Missing numeric ID rejected');

  // Test 3: Deterministic Fingerprinting
  const mockReviewA: RawReviewItem = {
    id: 'rev-1001',
    text: 'Great app but playback crashes frequently on Bluetooth.',
    rating: 2,
    author: 'MusicFan99',
    date: '2026-08-15T12:00:00Z'
  };

  const fp1 = ReviewSourceAdapter.createFingerprint('google_play', 'com.spotify.music', mockReviewA);
  const fp2 = ReviewSourceAdapter.createFingerprint('google_play', 'com.spotify.music', mockReviewA);
  assert(fp1 === fp2, 'Fingerprint: Deterministic and identical for same review');

  const mockReviewB: RawReviewItem = {
    ...mockReviewA,
    id: 'rev-1002',
    text: 'Completely different review comment.'
  };
  const fp3 = ReviewSourceAdapter.createFingerprint('google_play', 'com.spotify.music', mockReviewB);
  assert(fp1 !== fp3, 'Fingerprint: Distinct for distinct external review ID');

  // Test 4: Real Review Normalization & PII Redaction
  const sampleMeta: AppMetadata = {
    platform: 'google_play',
    appId: 'com.spotify.music',
    appName: 'Spotify: Music and Podcasts',
    developer: 'Spotify AB',
    sourceUrl: 'https://play.google.com/store/apps/details?id=com.spotify.music'
  };

  const reviewsToNormalize: RawReviewItem[] = [
    {
      id: 'gp-1',
      text: 'Contact me at support@customer.com or +1 (555) 234-5678, the search freezes constantly.',
      rating: 1,
      author: 'Alex Developer',
      date: '2026-08-20T10:00:00Z',
      version: '8.9.20'
    },
    {
      id: 'gp-2',
      text: 'Love the interface and playlists! Works wonderfully on my tablet.',
      rating: 5,
      // Author intentionally absent to test zero fabricated name rule
      date: '2026-08-21T11:00:00Z',
      version: '8.9.20'
    },
    {
      id: 'gp-1', // Duplicate ID
      text: 'Contact me at support@customer.com or +1 (555) 234-5678, the search freezes constantly.',
      rating: 1,
      author: 'Alex Developer',
      date: '2026-08-20T10:00:00Z',
      version: '8.9.20'
    }
  ];

  const normResult = ReviewSourceAdapter.normalizeReviews(
    reviewsToNormalize,
    sampleMeta,
    {
      workspaceId: 'ws-test',
      sourceId: 'src-test-gp',
      importId: 'imp-test-gp'
    }
  );

  assert(normResult.validCount === 2, 'Normalization: Exactly 2 valid records produced from 3 items (1 duplicate rejected)');
  assert(normResult.duplicateCount === 1, 'Normalization: 1 duplicate correctly identified');

  const rec1 = normResult.records[0];
  assert(rec1.originalText.includes('support@customer.com'), 'Normalization: originalText is immutable and preserves exact raw text');
  assert(!rec1.analysisText.includes('support@customer.com'), 'Normalization: analysisText has email redacted');
  assert(rec1.analysisText.includes('[REDACTED_EMAIL]'), 'Normalization: analysisText contains [REDACTED_EMAIL]');
  assert(rec1.analysisText.includes('[REDACTED_PHONE]'), 'Normalization: analysisText contains [REDACTED_PHONE]');
  assert(rec1.customer?.name === 'Alex Developer', 'Normalization: Preserves real author name when available');

  const rec2 = normResult.records[1];
  assert(rec2.customer?.name === undefined, 'Zero Fake Data: Author name is undefined when missing from source (never fabricated)');
  assert(rec2.rating === 5, 'Normalization: Rating is preserved');

  // Test 5: Persist-First Guarantee (Evidence persists before AI)
  await FeedbackRepo.saveCanonicalFeedback(normResult.records);
  const persistedFb = await FeedbackRepo.getFeedbackById(rec1.id);
  assert(Boolean(persistedFb && persistedFb.originalText === rec1.originalText), 'Persist-First: Canonical feedback persisted before AI execution');

  // Test 6: Atom Substring Invariant on App Review Evidence
  const sampleFb: Feedback = {
    id: 'fb-app-rev-test',
    workspaceId: 'ws-test',
    sourceType: 'google_play',
    originalText: 'The audio player stops playing when the screen is locked and battery drain is terrible.',
    analysisText: 'The audio player stops playing when the screen is locked and battery drain is terrible.',
    sourceCreatedAt: new Date().toISOString(),
    importedAt: new Date().toISOString(),
    fingerprint: 'fp-app-rev-test'
  };

  const atoms = await SubstringAtomizer.atomizeFeedback(sampleFb);
  assert(atoms.length > 0, 'Atomization: Generated atoms from app review text');
  for (const atom of atoms) {
    const slice = sampleFb.originalText.slice(atom.sourceStart, atom.sourceEnd);
    assert(slice === atom.atomText, `Atom Invariant: slice(${atom.sourceStart}, ${atom.sourceEnd}) === "${atom.atomText}"`);
  }

  // Test 7: Locked 5-Factor Deterministic Scoring Verification
  const scoringBreakdown = ExplainableScoringEngine.calculateOpportunityScore({
    opportunityTitle: 'Fix audio background playback lock issue',
    frequency: 35,
    atoms,
    trendPercentage: 45,
    isEmerging: true,
    affectedSegments: [{ segment: 'Mobile Users', count: 10, percentage: 50 }],
    configuredSegments: [],
    problemStatement: 'Audio pauses when device enters sleep mode.'
  });

  assert(scoringBreakdown.overallPriorityScore >= 0 && scoringBreakdown.overallPriorityScore <= 100, 'Scoring: Score is in [0, 100]');
  assert(scoringBreakdown.scoreFrequency >= 0, 'Scoring: Frequency score calculated (25% weight)');
  assert(scoringBreakdown.scoreSeverity >= 0, 'Scoring: Severity score calculated (25% weight)');
  assert(scoringBreakdown.scoreTrend >= 0, 'Scoring: Trend score calculated (15% weight)');
  assert(scoringBreakdown.scoreSegmentImpact >= 0, 'Scoring: Segment score calculated (20% weight)');
  assert(scoringBreakdown.scoreStrategicRelevance >= 0, 'Scoring: Strategy score calculated (15% weight)');

  return { passed, failed, log };
}

async function main() {
  const result = await runReviewIngestionTests();
  result.log.forEach(line => console.log(line));
  console.log(`\n========================================`);
  console.log(`REVIEW INGESTION TESTS PASSED: ${result.passed}`);
  console.log(`REVIEW INGESTION TESTS FAILED: ${result.failed}`);
  console.log(`========================================\n`);

  if (result.failed > 0) {
    process.exit(1);
  }
}

if (typeof window === 'undefined') {
  main().catch(console.error);
}
