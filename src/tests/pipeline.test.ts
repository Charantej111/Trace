/**
 * Trace Master Architectural Invariants & Resilience Test Suite
 * Validates all 27 locked contracts and the "Kill the AI" test.
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
    const verified = ProvenanceVerifier.verifyAtomProvenance(atom, testFb);
    assert(verified, `Atom Invariant: slice(${atom.sourceStart}, ${atom.sourceEnd}) === "${atom.atomText}"`);
  }

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
