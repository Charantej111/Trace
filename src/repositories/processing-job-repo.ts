import { ProcessingJob, ProcessingJobStage, ProcessingJobItem, AIRun } from '@/types/trace';

export class ProcessingJobRepo {
  private static jobs: Map<string, ProcessingJob> = new Map();
  private static stages: Map<string, ProcessingJobStage> = new Map();
  private static items: Map<string, ProcessingJobItem> = new Map();
  private static aiRuns: Map<string, AIRun> = new Map();

  public static async saveJob(job: ProcessingJob): Promise<ProcessingJob> {
    this.jobs.set(job.id, job);
    return job;
  }

  public static async getJobById(id: string): Promise<ProcessingJob | null> {
    return this.jobs.get(id) || null;
  }

  public static async getJobByIdempotencyKey(workspaceId: string, key: string): Promise<ProcessingJob | null> {
    for (const job of this.jobs.values()) {
      if (job.workspaceId === workspaceId && job.idempotencyKey === key) {
        return job;
      }
    }
    return null;
  }

  public static async saveStage(stage: ProcessingJobStage): Promise<ProcessingJobStage> {
    const key = `${stage.jobId}-${stage.stage}`;
    this.stages.set(key, stage);
    return stage;
  }

  public static async getStagesByJobId(jobId: string): Promise<ProcessingJobStage[]> {
    return Array.from(this.stages.values()).filter(s => s.jobId === jobId);
  }

  public static async getStage(jobId: string, stageName: string): Promise<ProcessingJobStage | null> {
    const key = `${jobId}-${stageName}`;
    return this.stages.get(key) || null;
  }

  public static async saveItem(item: ProcessingJobItem): Promise<ProcessingJobItem> {
    const key = `${item.stageId}-${item.entityType}-${item.entityId}`;
    this.items.set(key, item);
    return item;
  }

  public static async getItemsByStage(stageId: string): Promise<ProcessingJobItem[]> {
    return Array.from(this.items.values()).filter(i => i.stageId === stageId);
  }

  public static async saveAIRun(run: AIRun): Promise<AIRun> {
    this.aiRuns.set(run.id, run);
    return run;
  }

  public static async getAIRunsByJob(jobId: string): Promise<AIRun[]> {
    return Array.from(this.aiRuns.values()).filter(r => r.jobId === jobId);
  }

  public static async clearWorkspace(workspaceId: string): Promise<void> {
    for (const [id, j] of this.jobs.entries()) {
      if (j.workspaceId === workspaceId) {
        this.jobs.delete(id);
        for (const [sKey, s] of this.stages.entries()) {
          if (s.jobId === id) this.stages.delete(sKey);
        }
        for (const [iKey, it] of this.items.entries()) {
          if (it.jobId === id) this.items.delete(iKey);
        }
      }
    }
  }
}
