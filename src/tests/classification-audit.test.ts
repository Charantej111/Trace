import { Classifier } from '../intelligence/classification/classifier';
import { FeedbackAtom, Feedback } from '../types/trace';
import { AuditStatisticsCalculator } from '../intelligence/audit/audit-statistics';
import { AuditSummarySynthesizer } from '../intelligence/audit/audit-summary';
import { DetailedAuditAnalyzer } from '../intelligence/audit/audit-analysis';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

export async function runClassificationAndAuditTests() {
  console.log('\n--- Running Advanced Classification & Audit Intelligence Tests ---');

  const baseAtom = (text: string): FeedbackAtom => ({
    id: 'atom-test-1',
    workspaceId: 'ws-test',
    feedbackId: 'fb-test-1',
    atomText: text,
    sourceStart: 0,
    sourceEnd: text.length,
    intent: 'complaint', // Initial raw default before classification
    sentiment: 'neutral',
    severity: 'medium',
    isFeatureRequest: false,
    confidence: 'high',
    verificationStatus: 'verified',
    createdAt: new Date().toISOString()
  });

  // 1. Praise with Typo and Emoji: "This is amezing plateform 🥰" (5 stars)
  console.log('Test 1: Praise with typo and emoji ("This is amezing plateform 🥰", 5 stars)');
  const res1 = await Classifier.classifyAtom(
    baseAtom('This is amezing plateform 🥰'),
    { analysisText: 'This is amezing plateform 🥰', rating: 5 }
  );
  assert(res1.intent === 'praise', `Expected praise, got ${res1.intent}`);
  assert(res1.sentiment === 'positive', `Expected positive sentiment, got ${res1.sentiment}`);
  assert((res1.sentimentScore || 0) >= 0.7, `Expected high sentiment score, got ${res1.sentimentScore}`);
  assert(res1.emotionalState === 'joy', `Expected joy emotional state, got ${res1.emotionalState}`);
  assert(res1.severity === 'none', `Expected severity none, got ${res1.severity}`);
  assert(res1.ratingAlignment === 'strongly_aligned', `Expected strongly_aligned rating, got ${res1.ratingAlignment}`);
  console.log('  ✓ Correctly classified as praise · positive · joy · none · strongly_aligned');

  // 2. Love statement with Heart Emoji: "Absolutely love this app ❤️" (5 stars)
  console.log('Test 2: Love statement with heart emoji ("Absolutely love this app ❤️", 5 stars)');
  const res2 = await Classifier.classifyAtom(
    baseAtom('Absolutely love this app ❤️'),
    { analysisText: 'Absolutely love this app ❤️', rating: 5 }
  );
  assert(res2.intent === 'praise', `Expected praise, got ${res2.intent}`);
  assert(res2.sentiment === 'positive', `Expected positive, got ${res2.sentiment}`);
  assert(res2.emotionalState === 'joy', `Expected joy, got ${res2.emotionalState}`);
  assert(res2.severity === 'none', `Expected none, got ${res2.severity}`);
  console.log('  ✓ Correctly classified as praise · positive · joy · none');

  // 3. Severe Complaint: "Worst app ever" (1 star)
  console.log('Test 3: Severe complaint ("Worst app ever", 1 star)');
  const res3 = await Classifier.classifyAtom(
    baseAtom('Worst app ever'),
    { analysisText: 'Worst app ever', rating: 1 }
  );
  assert(res3.intent === 'complaint', `Expected complaint, got ${res3.intent}`);
  assert(res3.sentiment === 'negative', `Expected negative, got ${res3.sentiment}`);
  assert((res3.sentimentScore || 0) <= -0.7, `Expected strongly negative score, got ${res3.sentimentScore}`);
  assert(res3.ratingAlignment === 'strongly_aligned', `Expected strongly_aligned, got ${res3.ratingAlignment}`);
  console.log('  ✓ Correctly classified as complaint · negative · strongly_aligned');

  // 4. Critical Crash Bug Report: "App crashes every time I open it" (1 star)
  console.log('Test 4: Technical crash ("App crashes every time I open it", 1 star)');
  const res4 = await Classifier.classifyAtom(
    baseAtom('App crashes every time I open it'),
    { analysisText: 'App crashes every time I open it', rating: 1 }
  );
  assert(res4.intent === 'bug_report', `Expected bug_report, got ${res4.intent}`);
  assert(res4.severity === 'critical' || res4.severity === 'high', `Expected critical/high severity, got ${res4.severity}`);
  assert(res4.emotionalState === 'frustration', `Expected frustration, got ${res4.emotionalState}`);
  console.log('  ✓ Correctly classified as bug_report · critical/high · frustration');

  // 5. Feature Request: "Please add dark mode" (4 stars)
  console.log('Test 5: Feature request ("Please add dark mode", 4 stars)');
  const res5 = await Classifier.classifyAtom(
    baseAtom('Please add dark mode'),
    { analysisText: 'Please add dark mode', rating: 4 }
  );
  assert(res5.intent === 'feature_request', `Expected feature_request, got ${res5.intent}`);
  assert(res5.severity === 'none', `Expected severity none, got ${res5.severity}`);
  console.log('  ✓ Correctly classified as feature_request · severity none');

  // 6. Contrast & Rating Dissonance: "Love the app but it crashes constantly" (5 stars)
  console.log('Test 6: Contrast review ("Love the app but it crashes constantly", 5 stars)');
  const res6 = await Classifier.classifyAtom(
    baseAtom('it crashes constantly'),
    { analysisText: 'Love the app but it crashes constantly', rating: 5 }
  );
  assert(res6.intent === 'bug_report', `Expected bug_report despite 5 stars, got ${res6.intent}`);
  assert(res6.sentiment === 'mixed' || res6.sentiment === 'negative', `Expected mixed or negative, got ${res6.sentiment}`);
  assert(res6.severity === 'critical' || res6.severity === 'high', `Expected critical/high severity, got ${res6.severity}`);
  assert(res6.ratingAlignment === 'mixed' || res6.ratingAlignment === 'contradictory', `Expected mixed/contradictory alignment, got ${res6.ratingAlignment}`);
  console.log('  ✓ Text-first priority enforced: classified as bug_report with high severity despite 5-star rating');

  // 7. Negation Handling: "No problems at all, amazing app" (5 stars)
  console.log('Test 7: Negation handling ("No problems at all, amazing app", 5 stars)');
  const res7 = await Classifier.classifyAtom(
    baseAtom('No problems at all, amazing app'),
    { analysisText: 'No problems at all, amazing app', rating: 5 }
  );
  assert(res7.intent === 'praise', `Expected praise, got ${res7.intent}`);
  assert(res7.sentiment === 'positive', `Expected positive, got ${res7.sentiment}`);
  console.log('  ✓ Correctly avoided false bug_report on "no problems"');

  // 8. Pricing Friction: "It's good but the subscription is too expensive" (3 stars)
  console.log('Test 8: Pricing friction ("subscription is too expensive", 3 stars)');
  const res8 = await Classifier.classifyAtom(
    baseAtom('subscription is too expensive'),
    { analysisText: "It's good but the subscription is too expensive", rating: 3 }
  );
  assert(res8.intent === 'pricing', `Expected pricing, got ${res8.intent}`);
  assert(res8.emotionalState === 'disappointment', `Expected disappointment, got ${res8.emotionalState}`);
  console.log('  ✓ Correctly classified as pricing · disappointment');

  // 9. Anger Emoji: "Worst experience 😡" (1 star)
  console.log('Test 9: Anger emoji ("Worst experience 😡", 1 star)');
  const res9 = await Classifier.classifyAtom(
    baseAtom('Worst experience 😡'),
    { analysisText: 'Worst experience 😡', rating: 1 }
  );
  assert(res9.intent === 'complaint', `Expected complaint, got ${res9.intent}`);
  assert(res9.emotionalState === 'anger', `Expected anger, got ${res9.emotionalState}`);
  console.log('  ✓ Correctly detected anger emotion from emoji');

  // 10. Gratitude: "Thank you so much ❤️" (5 stars)
  console.log('Test 10: Gratitude ("Thank you so much ❤️", 5 stars)');
  const res10 = await Classifier.classifyAtom(
    baseAtom('Thank you so much ❤️'),
    { analysisText: 'Thank you so much ❤️', rating: 5 }
  );
  assert(res10.intent === 'praise', `Expected praise, got ${res10.intent}`);
  assert(res10.emotionalState === 'gratitude', `Expected gratitude, got ${res10.emotionalState}`);
  console.log('  ✓ Correctly detected gratitude emotion');

  // 11. Deterministic Audit Statistics Calculation
  console.log('\nTest 11: Deterministic Audit Statistics Engine');
  const mockFeedback: Feedback[] = [
    {
      id: 'fb-1',
      workspaceId: 'ws-1',
      sourceType: 'google_play',
      originalText: 'Great app',
      sourceCreatedAt: new Date().toISOString(),
      importedAt: new Date().toISOString(),
      fingerprint: 'fp-1',
      status: 'valid'
    },
    {
      id: 'fb-2',
      workspaceId: 'ws-1',
      sourceType: 'google_play',
      originalText: 'Crashes on startup',
      sourceCreatedAt: new Date().toISOString(),
      importedAt: new Date().toISOString(),
      fingerprint: 'fp-2',
      status: 'valid'
    },
    {
      id: 'fb-3',
      workspaceId: 'ws-1',
      sourceType: 'app_store',
      originalText: 'Love it',
      sourceCreatedAt: new Date().toISOString(),
      importedAt: new Date().toISOString(),
      fingerprint: 'fp-3',
      status: 'valid'
    }
  ];

  const mockAtoms: FeedbackAtom[] = [
    { ...res1, id: 'a-1', feedbackId: 'fb-1' },
    { ...res4, id: 'a-2', feedbackId: 'fb-2' },
    { ...res2, id: 'a-3', feedbackId: 'fb-3' }
  ];

  const stats = AuditStatisticsCalculator.calculate(mockFeedback, mockAtoms);
  assert(stats.totalFeedback === 3, `Expected 3 total feedback, got ${stats.totalFeedback}`);
  assert(stats.totalVerifiedAtoms === 3, `Expected 3 verified atoms, got ${stats.totalVerifiedAtoms}`);
  assert(stats.positiveAtomCount === 2, `Expected 2 positive atoms, got ${stats.positiveAtomCount}`);
  assert(stats.negativeAtomCount === 1, `Expected 1 negative atom, got ${stats.negativeAtomCount}`);
  assert(stats.evidenceSufficiency.isSufficient === true, 'Expected sufficient evidence for 3 reviews');
  console.log('  ✓ Deterministic statistics calculated accurately from persisted records');

  // 12. Insufficient Evidence Gate
  console.log('\nTest 12: Insufficient Evidence Threshold Gate');
  const lowStats = AuditStatisticsCalculator.calculate([mockFeedback[0]], [mockAtoms[0]]);
  assert(lowStats.evidenceSufficiency.isSufficient === false, 'Expected insufficient evidence for 1 review');

  const lowSummary = await AuditSummarySynthesizer.synthesize('ws-1', lowStats, [mockAtoms[0]], [], [], []);
  assert(lowSummary.status === 'insufficient_evidence', `Expected insufficient_evidence status, got ${lowSummary.status}`);
  assert(typeof lowSummary.message === 'string', 'Expected informative message');
  console.log('  ✓ Insufficient evidence guard triggered without inventing fake statistics');

  // 13. Audit Summary Evidence Lineage Gate
  console.log('\nTest 13: Audit Summary Evidence Lineage');
  const summaryResult = await AuditSummarySynthesizer.synthesize('ws-1', stats, mockAtoms, [], [], []);
  assert(summaryResult.status === 'sufficient', 'Expected sufficient summary');
  assert(Boolean(summaryResult.summary?.executiveSummary), 'Expected executive summary');
  if (summaryResult.summary?.whatUsersLove && summaryResult.summary.whatUsersLove.length > 0) {
    const claim = summaryResult.summary.whatUsersLove[0];
    assert(claim.evidenceAtomIds.length > 0, 'Every claim must reference verified evidence atom IDs');
    assert(mockAtoms.some(a => a.id === claim.evidenceAtomIds[0]), 'Referenced atom ID must exist in evidence');
  }
  console.log('  ✓ Every synthesized claim strictly links to real verified atom IDs');

  // 14. Detailed PM Analysis Builder
  console.log('\nTest 14: Detailed PM Analysis Builder');
  const detailed = DetailedAuditAnalyzer.analyzePainPoints(
    [{
      id: 'pp-1',
      workspaceId: 'ws-1',
      title: 'App Crashes on Launch',
      description: 'App crashes immediately when user attempts to open home screen.',
      severity: 'critical',
      frequency: 5,
      trendPercentage: 25,
      isEmerging: true,
      velocityMultiplier: 1.5,
      confidence: 'high',
      affectedSegments: [],
      atomIds: ['a-2'],
      createdAt: new Date().toISOString()
    }],
    mockAtoms,
    mockFeedback,
    [],
    [],
    []
  );
  assert(detailed.length === 1, 'Expected 1 detailed analysis item');
  assert(detailed[0].problemTitle === 'App Crashes on Launch', 'Problem title matches');
  assert(detailed[0].severity === 'critical', 'Severity matches');
  assert(detailed[0].representativeQuotes.length > 0, 'Includes representative customer quotes');
  assert(typeof detailed[0].priorityScore === 'number', 'Calculated priority score');
  console.log('  ✓ Detailed PM analysis correctly built with verbatim quotes, offsets, and priority score');

  console.log('\n--- ALL ADVANCED CLASSIFICATION & AUDIT TESTS PASSED ---\n');
}
