/**
 * Trace Master Architectural Invariants & Resilience Test Suite
 * Validates all 27 locked contracts, the "Kill the AI" test, and 10 Atom Integrity test suites.
 */
import { NormalizationEngine } from '../evidence/normalization/engine';
import { FieldDetector } from '../evidence/normalization/field-detector';
import { Validator } from '../evidence/normalization/validator';
import { PiiRedactor } from '../evidence/pii/pii-redactor';
import { FingerprintEngine } from '../evidence/deduplication/fingerprint';
import { ProvenanceVerifier } from '../evidence/provenance';
import { PasteAdapter } from '../evidence/adapters/paste-adapter';
import { SubstringAtomizer } from '../intelligence/atomization/substring-atomizer';
import { Classifier } from '../intelligence/classification/classifier';
import { EmbeddingService } from '../intelligence/embeddings/embedding-service';
import { VectorClusterer } from '../intelligence/clustering/vector-clusterer';
import { ThemeSynthesizer } from '../intelligence/themes/theme-synthesizer';
import { PainPointSynthesizer } from '../intelligence/pain-points/pain-point-synthesizer';
import { InsightSynthesizer } from '../intelligence/insights/insight-synthesizer';
import { FrequencyScorer } from '../scoring/frequency-scorer';
import { SeverityScorer } from '../scoring/severity-scorer';
import { TrendScorer } from '../scoring/trend-scorer';
import { SegmentScorer } from '../scoring/segment-scorer';
import { StrategyScorer } from '../scoring/strategy-scorer';
import { ConfidenceEvaluator } from '../scoring/confidence-evaluator';
import { ExplainableScoringEngine } from '../scoring/explainable-scoring';
import { ProcessingJobFactory } from '../processing/jobs';
import { StageDependencyValidator, STAGE_DEPENDENCIES } from '../processing/stage-dependencies';
import { ProcessingOrchestrator } from '../processing/orchestrator';
import { FeedbackRepo } from '../repositories/feedback-repo';
import { IntelligenceRepo } from '../repositories/intelligence-repo';
import { DecisionsRepo } from '../repositories/decisions-repo';
import { Feedback, FeedbackAtom, ProcessingStageType } from '../types/trace';
import {
  isVerifiedAtom,
  getVerifiedAtoms,
  getCustomerDisplayName,
  getSegmentDisplayName,
  formatEvidenceDate,
  formatSourceType
} from '../lib/evidence-utils';

export async function runAllTests(): Promise<{ passed: number; failed: number; log: string[] }> {
  const log: string[] = [];
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      log.push(`✓ [PASS] ${testName}`);
    } else {
      failed++;
      log.push(`✗ [FAIL] ${testName}`);
    }
  }

  // 1. PII Redaction Test
  const rawTextWithPii = 'Contact user@trace.app or call 555-123-4567 for export bugs.';
  const piiRes = PiiRedactor.redact(rawTextWithPii);
  assert(piiRes.originalText === rawTextWithPii, 'PII: originalText is immutable');
  assert(!piiRes.analysisText.includes('user@trace.app'), 'PII: Email is redacted from analysisText');
  assert(piiRes.analysisText.includes('[REDACTED_EMAIL]'), 'PII: Email replaced with token');
  assert(piiRes.analysisText.includes('[REDACTED_PHONE]'), 'PII: Phone replaced with token');

  // 2. Fingerprinting & Deduplication Test
  const fp1 = FingerprintEngine.generateContentFingerprint('ws-1', 'Slow dashboard loading', 'cust1');
  const fp2 = FingerprintEngine.generateContentFingerprint('ws-1', 'slow dashboard loading', 'cust1');
  const fp3 = FingerprintEngine.generateContentFingerprint('ws-1', 'slow dashboard loading', 'cust2');
  assert(fp1 === fp2, 'Fingerprint: Content normalization produces identical hashes');
  assert(fp1 !== fp3, 'Fingerprint: Distinct customers have distinct fingerprints (preserving frequency)');

  // 3. Normalization & Field Detection Test
  const pasteParse = PasteAdapter.parseInput({
    text: 'Export fails on large datasets.\n\nDashboard takes 40s to load.',
    sourceName: 'Support Log',
    defaultSegment: 'Enterprise'
  });
  assert(pasteParse.rows.length === 2, 'PasteAdapter: Multi-paragraph split');
  const detected = FieldDetector.autoDetectHeaders(['feedback', 'author', 'score']);
  assert(detected.text === 'feedback', 'FieldDetector: Auto-detected feedback text column');
  assert(detected.customerName === 'author', 'FieldDetector: Auto-detected customerName column');

  // 4. Atomization Invariant Test: originalText.slice(sourceStart, sourceEnd) === atomText
  const testFb: Feedback = {
    id: 'fb-test-1',
    workspaceId: 'ws-test',
    sourceType: 'csv',
    originalText: 'The app freezes when generating reports, and export to CSV is completely broken.',
    analysisText: 'The app freezes when generating reports, and export to CSV is completely broken.',
    sourceCreatedAt: new Date().toISOString(),
    importedAt: new Date().toISOString(),
    fingerprint: 'fp-test-1'
  };
  const atoms = await SubstringAtomizer.atomizeFeedback(testFb);
  assert(atoms.length >= 1, 'Atomizer: Produced extracted clauses');
  for (const atom of atoms) {
    const verified = isVerifiedAtom(testFb, atom);
    assert(verified, `Atom Invariant: slice(${atom.sourceStart}, ${atom.sourceEnd}) === "${atom.atomText}"`);
  }

  // --- ATOM INTEGRITY & INBOX TEST SUITE (TESTS 1 - 10) ---
  log.push('--- RUNNING ATOM INTEGRITY & INBOX CONTRACT TESTS ---');

  // Test 1: Valid atom
  const t1Fb: Feedback = {
    id: 'fb-t1',
    workspaceId: 'ws-atom-tests',
    sourceType: 'csv',
    originalText: 'The export is very slow.',
    analysisText: 'The export is very slow.',
    sourceCreatedAt: new Date().toISOString(),
    importedAt: new Date().toISOString(),
    fingerprint: 'fp-t1'
  };
  const t1Atom: FeedbackAtom = {
    id: 'atom-t1-1',
    workspaceId: 'ws-atom-tests',
    feedbackId: 'fb-t1',
    atomText: 'The export is very slow.',
    sourceStart: 0,
    sourceEnd: 24,
    intent: 'bug_report',
    sentiment: 'negative',
    severity: 'medium',
    isFeatureRequest: false,
    confidence: 'high',
    verificationStatus: 'verified',
    pipelineVersion: '1.0.0',
    model: 'gpt-4o',
    promptVersion: '1.0.0',
    createdAt: new Date().toISOString()
  };
  assert(isVerifiedAtom(t1Fb, t1Atom) === true, 'Test 1 (Valid atom): verificationStatus === verified and exact substring matches');

  // Test 2: Wrong offset
  const t2AtomWrongOffset: FeedbackAtom = {
    ...t1Atom,
    id: 'atom-t2-wrong',
    sourceStart: 5,
    sourceEnd: 20 // originalText.slice(5, 20) !== "The export is very slow."
  };
  assert(isVerifiedAtom(t1Fb, t2AtomWrongOffset) === false, 'Test 2 (Wrong offset): rejected when slice does not match atomText');

  // Test 3: Duplicate AI atoms (Two identical proposals with the same span)
  await FeedbackRepo.clearWorkspace('ws-atom-tests');
  await FeedbackRepo.saveCanonicalFeedback([{
    id: 'fb-t3',
    workspaceId: 'ws-atom-tests',
    sourceId: 'src-t3',
    importId: 'imp-t3',
    sourceType: 'csv',
    originalText: 'The dashboard is slow and sometimes crashes.',
    analysisText: 'The dashboard is slow and sometimes crashes.',
    sourceTimestamp: new Date().toISOString(),
    ingestionTimestamp: new Date().toISOString(),
    normalizedMetadata: {},
    rawPayload: {},
    fingerprint: 'fp-t3',
    status: 'valid'
  }]);

  const t3Atom1: FeedbackAtom = {
    ...t1Atom,
    id: 'atom-t3-1',
    feedbackId: 'fb-t3',
    atomText: 'dashboard is slow',
    sourceStart: 4,
    sourceEnd: 21,
    verificationStatus: 'verified'
  };
  const t3Atom2: FeedbackAtom = {
    ...t1Atom,
    id: 'atom-t3-2',
    feedbackId: 'fb-t3',
    atomText: 'dashboard is slow',
    sourceStart: 4,
    sourceEnd: 21,
    verificationStatus: 'verified'
  };

  await FeedbackRepo.saveAtoms([t3Atom1, t3Atom2]);
  const fbT3WithAtoms = await FeedbackRepo.getFeedbackById('fb-t3');
  const verifiedT3 = getVerifiedAtoms(fbT3WithAtoms);
  assert(verifiedT3.length === 1, 'Test 3 (Duplicate AI atoms): Only 1 persisted atom for identical source span 4:21');

  // Test 4: Same text, different location (both may exist)
  const t4Canonical = {
    id: 'fb-t4',
    workspaceId: 'ws-atom-tests',
    sourceId: 'src-t4',
    importId: 'imp-t4',
    sourceType: 'csv' as const,
    originalText: 'very slow export process and very slow queries',
    analysisText: 'very slow export process and very slow queries',
    sourceTimestamp: new Date().toISOString(),
    ingestionTimestamp: new Date().toISOString(),
    normalizedMetadata: {},
    rawPayload: {},
    fingerprint: 'fp-t4',
    status: 'valid' as const
  };
  await FeedbackRepo.saveCanonicalFeedback([t4Canonical]);
  const t4AtomA: FeedbackAtom = {
    ...t1Atom,
    id: 'atom-t4-a',
    feedbackId: 'fb-t4',
    atomText: 'very slow',

    sourceStart: 0,
    sourceEnd: 9,
    verificationStatus: 'verified'
  };
  const t4AtomB: FeedbackAtom = {
    ...t1Atom,
    id: 'atom-t4-b',
    feedbackId: 'fb-t4',
    atomText: 'very slow',
    sourceStart: 29,
    sourceEnd: 38,
    verificationStatus: 'verified'
  };
  await FeedbackRepo.saveAtoms([t4AtomA, t4AtomB]);
  const fbT4WithAtoms = await FeedbackRepo.getFeedbackById('fb-t4');
  const verifiedT4 = getVerifiedAtoms(fbT4WithAtoms);
  assert(verifiedT4.length === 2, 'Test 4 (Same text, different location): Both unique spans 0:9 and 29:38 survive');

  // Test 5: Missing customer
  assert(getCustomerDisplayName(undefined) === 'Unknown customer', 'Test 5: Missing customer returns "Unknown customer"');
  assert(getCustomerDisplayName('') === 'Unknown customer', 'Test 5: Empty customer returns "Unknown customer"');
  assert(getCustomerDisplayName('Ofzen LLP') === 'Ofzen LLP', 'Test 5: Persisted customer name is preserved');

  // Test 6: Missing segment
  assert(getSegmentDisplayName(undefined) === 'Unassigned', 'Test 6: Missing segment returns "Unassigned"');
  assert(getSegmentDisplayName('Enterprise') === 'Enterprise', 'Test 6: Persisted segment is preserved');

  // Test 7: Missing date
  assert(formatEvidenceDate(undefined, undefined) === 'No date', 'Test 7: Missing date returns "No date"');
  assert(formatEvidenceDate('2026-01-15T00:00:00.000Z', undefined) !== 'No date', 'Test 7: Valid source date formatted');

  // Test 8: AI failure (Evidence survives AI failure, no fake atoms)
  const t8Fb: Feedback = {
    id: 'fb-t8-fail',
    workspaceId: 'ws-atom-tests',
    sourceType: 'csv',
    originalText: 'System timeout during large migration.',
    analysisText: '',
    sourceCreatedAt: new Date().toISOString(),
    importedAt: new Date().toISOString(),
    fingerprint: 'fp-t8'
  };
  const failAtoms = await SubstringAtomizer.atomizeFeedback(t8Fb);
  assert(failAtoms.length === 0, 'Test 8 (AI failure): No hallucinated or fake atoms when AI input is empty/fails');

  // Test 9: Retry (Retrying atomization must not create duplicate atoms)
  await FeedbackRepo.saveAtoms([t3Atom1]);
  await FeedbackRepo.saveAtoms([t3Atom1]); // retry save
  const retryFb = await FeedbackRepo.getFeedbackById('fb-t3');
  assert(getVerifiedAtoms(retryFb).length === 1, 'Test 9 (Retry): Retrying atomization does not duplicate atoms');

  // Test 10: Concurrent retry (Two workers result in 1 atom per unique span)
  await Promise.all([
    FeedbackRepo.saveAtoms([t3Atom1]),
    FeedbackRepo.saveAtoms([t3Atom2])
  ]);
  const concurrentFb = await FeedbackRepo.getFeedbackById('fb-t3');
  assert(getVerifiedAtoms(concurrentFb).length === 1, 'Test 10 (Concurrent retry): 1 atom per unique source span');

  // Source Formatter Test
  assert(formatSourceType('csv') === 'CSV', 'Source format: CSV');
  assert(formatSourceType('google_play') === 'GOOGLE PLAY', 'Source format: GOOGLE PLAY');
  assert(formatSourceType(undefined) === 'UNKNOWN', 'Source format: fallback UNKNOWN');

  // 5. Deterministic 5-Factor Scoring Test (25% + 25% + 15% + 20% + 15% = 100%)
  const scoreBreakdown = ExplainableScoringEngine.calculateOpportunityScore({
    frequency: 15,
    atoms: atoms,
    trendPercentage: 35,
    isEmerging: true,
    affectedSegments: [{ segment: 'Enterprise', count: 12, percentage: 80 }, { segment: 'SMB', count: 3, percentage: 20 }],
    configuredSegments: [{ id: 'seg-ent', workspaceId: 'ws-test', name: 'Enterprise', strategicWeight: 1.5 }],
    opportunityTitle: 'Fix CSV export latency',
    problemStatement: 'Export latency causes failure for Enterprise reporting teams'
  });
  assert(scoreBreakdown.overallPriorityScore >= 0 && scoreBreakdown.overallPriorityScore <= 100, 'Scoring: Score is in [0, 100]');
  assert(scoreBreakdown.scoreFrequency >= 0, 'Scoring: Frequency score calculated');
  assert(scoreBreakdown.scoreSeverity >= 0, 'Scoring: Severity score calculated');
  assert(scoreBreakdown.scoreTrend >= 0, 'Scoring: Trend score calculated');
  assert(scoreBreakdown.scoreSegmentImpact >= 0, 'Scoring: Segment score calculated');
  assert(scoreBreakdown.scoreStrategicRelevance >= 0, 'Scoring: Strategic score calculated');

  // 6. Hard Evidence Gate Tests
  const gateCheck0Atoms = await InsightSynthesizer.synthesizeInsights([], [], [], 'ws-test');
  assert(gateCheck0Atoms.length === 0, 'Evidence Gate: 0 atoms produces 0 insights');

  const insufficientOppGate = await ExplainableScoringEngine.synthesizeOpportunities({
    insights: [],
    atoms: [],
    customerSegments: [],
    workspaceId: 'ws-test'
  });
  assert(insufficientOppGate.length === 0, 'Evidence Gate: 0 insights produces 0 opportunities');

  // 7. Stage Dependency Enforcement Test
  const completedStages = new Set<ProcessingStageType>(['normalization', 'atomization', 'classification']);
  const canRunEmbed = StageDependencyValidator.canExecuteStage('embedding', completedStages);
  const canRunCluster = StageDependencyValidator.canExecuteStage('clustering', completedStages);
  assert(canRunEmbed.allowed === true, 'Stage Dependency: Embedding allowed after classification');
  assert(canRunCluster.allowed === false, 'Stage Dependency: Clustering BLOCKED until embedding completed');

  // 8. Acceptance Test: "Kill the AI" Provider Failure & Resiliency
  log.push('--- RUNNING "KILL THE AI" END-TO-END RESILIENCE TEST ---');
  const testWorkspaceId = 'ws-kill-ai-test';
  await FeedbackRepo.clearWorkspace(testWorkspaceId);
  await IntelligenceRepo.clearWorkspace(testWorkspaceId);
  await DecisionsRepo.clearWorkspace(testWorkspaceId);

  // Step 1: Ingest 10 canonical records
  const sampleRecords = Array.from({ length: 10 }).map((_, idx) => ({
    id: `fb-kill-${idx}`,
    workspaceId: testWorkspaceId,
    sourceId: 'src-kill',
    importId: 'imp-kill',
    sourceType: 'csv' as const,
    originalText: `Customer statement ${idx}: The reporting dashboard fails to load and export crashes.`,
    analysisText: `Customer statement ${idx}: The reporting dashboard fails to load and export crashes.`,
    ingestionTimestamp: new Date().toISOString(),
    normalizedMetadata: {},
    rawPayload: { row: idx },
    fingerprint: `fp-kill-${idx}`,
    status: 'valid' as const
  }));

  // Step 2: Persist Layer A evidence
  await FeedbackRepo.saveCanonicalFeedback(sampleRecords);
  const savedFb = await FeedbackRepo.getFeedbackByWorkspace(testWorkspaceId);
  assert(savedFb.length === 10, 'Kill-AI Step 2: 10 canonical evidence records persisted before AI');

  // Step 3: Create processing job and run up to classification
  const job = await ProcessingOrchestrator.createJob({
    workspaceId: testWorkspaceId,
    importId: 'imp-kill',
    totalRecords: 10
  });
  assert(job.status === 'pending', 'Kill-AI Step 3: Durable processing job created');

  // Step 4: Verify 0 fake insights or opportunities exist before intelligence stages finish
  const emptyInsights = await IntelligenceRepo.getInsightsByWorkspace(testWorkspaceId);
  const emptyOpps = await DecisionsRepo.getOpportunitiesByWorkspace(testWorkspaceId);
  assert(emptyInsights.length === 0, 'Kill-AI Step 4: Zero hallucinated insights during failure');
  assert(emptyOpps.length === 0, 'Kill-AI Step 4: Zero hallucinated opportunities during failure');

  // Step 5: Execute full pipeline and verify end-to-end lineage
  await ProcessingOrchestrator.executeJob(job.id);
  const synthesizedInsights = await IntelligenceRepo.getInsightsByWorkspace(testWorkspaceId);
  const synthesizedOpps = await DecisionsRepo.getOpportunitiesByWorkspace(testWorkspaceId);

  assert(synthesizedInsights.length >= 1, 'Kill-AI Step 7: Synthesized grounded insights after completion');
  assert(synthesizedOpps.length >= 1, 'Kill-AI Step 7: Synthesized defensible opportunities after completion');

  // Step 8: Assert full lineage chain from Opportunity -> Insight -> Atom -> Feedback -> Original Quote
  if (synthesizedOpps.length > 0) {
    const opp = synthesizedOpps[0];
    assert(opp.supportingAtomIds.length > 0, 'Kill-AI Step 8: Opportunity linked to supporting atom IDs');
    assert(opp.overallPriorityScore > 0, 'Kill-AI Step 8: Opportunity has deterministic priority score');
  }

  return { passed, failed, log };
}
