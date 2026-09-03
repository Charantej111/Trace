import { runAllTests } from './pipeline.test';
import { runReviewIngestionTests } from './review-ingestion.test';
import { runClassificationAndAuditTests } from './classification-audit.test';

async function main() {
  console.log('=== STARTING TRACE BACKEND ARCHITECTURAL TEST SUITE ===\n');
  const result1 = await runAllTests();
  result1.log.forEach(line => console.log(line));

  console.log('\n');
  const result2 = await runReviewIngestionTests();
  result2.log.forEach(line => console.log(line));

  console.log('\n');
  await runClassificationAndAuditTests();

  const totalPassed = result1.passed + result2.passed;
  const totalFailed = result1.failed + result2.failed;

  console.log(`\n========================================`);
  console.log(`MASTER SUITE TOTAL PASSED: ${totalPassed}`);
  console.log(`MASTER SUITE TOTAL FAILED: ${totalFailed}`);
  console.log(`STATUS: ${totalFailed === 0 ? 'SUCCESS' : 'FAILURE'}`);
  console.log(`========================================`);

  if (totalFailed > 0) {
    process.exit(1);
  }
}

if (typeof window !== 'undefined') {
  (window as unknown as { runTraceTests: typeof main }).runTraceTests = main;
}

main().catch(console.error);
