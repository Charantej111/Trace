import {
  ProcessingJob,
  ProcessingJobStage,
  ProcessingJobItem,
  ProcessingStageType,
  JobStatus,
  StageStatus,
  ProcessingEntityType
} from '@/types/trace';
import { PIPELINE_VERSION } from '@/ai/versioning';
import { IdempotencyManager } from './idempotency';

export class ProcessingJobFactory {
  public static createJob(params: {
    workspaceId: string;
    importId?: string;
    totalRecords: number;
    type?: 'import' | 'reprocess' | 'incremental';
  }): ProcessingJob {
    const timestamp = new Date().toISOString();
    const type = params.type || 'import';
    const idempotencyKey = IdempotencyManager.generateJobKey(
      params.workspaceId,
      params.importId || `imp-${Date.now()}`,
      type,
      PIPELINE_VERSION
    );

    return {
      id: `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      workspaceId: params.workspaceId,
      importId: params.importId,
      idempotencyKey,
      type,
      status: 'pending',
      totalRecords: params.totalRecords,
      processedRecords: 0,
      failedRecords: 0,
      pipelineVersion: PIPELINE_VERSION,
      createdAt: timestamp
    };
  }

  public static createStage(params: {
    jobId: string;
    stage: ProcessingStageType;
    totalItems: number;
  }): ProcessingJobStage {
    return {
      id: `stage-${params.jobId}-${params.stage}`,
      jobId: params.jobId,
      stage: params.stage,
      status: 'pending',
      totalItems: params.totalItems,
      processedItems: 0,
      failedItems: 0,
      attempt: 1,
      createdAt: new Date().toISOString()
    };
  }

  public static createItem(params: {
    stageId: string;
    jobId: string;
    entityType: ProcessingEntityType;
    entityId: string;
  }): ProcessingJobItem {
    return {
      id: `item-${params.stageId}-${params.entityId}`,
      stageId: params.stageId,
      jobId: params.jobId,
      entityType: params.entityType,
      entityId: params.entityId,
      status: 'pending',
      attempt: 1,
      createdAt: new Date().toISOString()
    };
  }
}
