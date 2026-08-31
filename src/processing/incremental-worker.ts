import { CanonicalFeedback, ProductContext, CustomerSegment } from '@/types/trace';
import { FeedbackRepo } from '@/repositories/feedback-repo';
import { ProcessingOrchestrator } from './orchestrator';

export class IncrementalWorker {
  /**
   * Incrementally ingests new feedback records and triggers downstream processing.
   */
  public static async processIncrementalBatch(params: {
    records: CanonicalFeedback[];
    workspaceId: string;
    sourceName: string;
    context?: ProductContext;
    customerSegments: CustomerSegment[];
  }) {
    // 1. Persist Evidence First (Layer A guarantee)
    await FeedbackRepo.saveCanonicalFeedback(params.records);

    // 2. Create and execute durable processing job
    const job = await ProcessingOrchestrator.createJob({
      workspaceId: params.workspaceId,
      importId: params.records[0]?.importId,
      totalRecords: params.records.length,
      type: 'incremental'
    });

    await ProcessingOrchestrator.executeJob(job.id, params.context, params.customerSegments);
    return job;
  }
}
