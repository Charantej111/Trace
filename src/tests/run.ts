import { runAllTests } from './pipeline.test';

async function main() {
  console.log('=== STARTING TRACE BACKEND ARCHITECTURAL TEST SUITE ===\n');
  const result = await runAllTests();
  result.log.forEach(line => console.log(line));
  console.log(`\n========================================`);
  console.log(`TOTAL PASSED: ${result.passed}`);
  console.log(`TOTAL FAILED: ${result.failed}`);
  console.log(`STATUS: ${result.failed === 0 ? 'SUCCESS' : 'FAILURE'}`);
  console.log(`========================================`);
}

if (typeof window !== 'undefined') {
  (window as unknown as { runTraceTests: typeof main }).runTraceTests = main;
}

main().catch(console.error);
