import { ProcessingJob, ProcessingJobStage, ProcessingJobItem, AIRun } from '@/types/trace';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export class ProcessingJobRepo {
  private static jobs: Map<string, ProcessingJob> = new Map();
  private static stages: Map<string, ProcessingJobStage> = new Map();
  private static items: Map<string, ProcessingJobItem> = new Map();
  private static aiRuns: Map<string, AIRun> = new Map();

  public static async saveJob(job: ProcessingJob): Promise<ProcessingJob> {
    this.jobs.set(job.id, job);

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.from('processing_jobs').upsert({
          id: job.id,
          workspace_id: job.workspaceId,
          import_id: job.importId || null,
          idempotency_key: job.idempotencyKey,
          type: job.type,
          status: job.status,
          total_records: job.totalRecords,
          processed_records: job.processedRecords,
          failed_records: job.failedRecords,
          error: job.error || null,
          pipeline_version: job.pipelineVersion,
          started_at: job.startedAt || null,
          completed_at: job.completedAt || null
        }, { onConflict: 'workspace_id,idempotency_key' });
        if (error) console.warn('[ProcessingJobRepo] Supabase saveJob notice:', error);
      } catch (err) {
        console.warn('[ProcessingJobRepo] Supabase saveJob failed:', err);
      }
    }

    return job;
  }

  public static async getJobById(id: string): Promise<ProcessingJob | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('processing_jobs')
          .select('*')
          .eq('id', id)
          .single();

        if (!error && data) {
          const j: ProcessingJob = {
            id: String(data.id),
            workspaceId: String(data.workspace_id),
            importId: data.import_id ? String(data.import_id) : undefined,
            idempotencyKey: String(data.idempotency_key),
            type: (data.type as ProcessingJob['type']) || 'import',
            status: (data.status as ProcessingJob['status']) || 'pending',
            totalRecords: Number(data.total_records || 0),
            processedRecords: Number(data.processed_records || 0),
            failedRecords: Number(data.failed_records || 0),
            error: data.error ? String(data.error) : undefined,
            pipelineVersion: String(data.pipeline_version || '1.0.0'),
            startedAt: data.started_at ? String(data.started_at) : undefined,
            completedAt: data.completed_at ? String(data.completed_at) : undefined,
            createdAt: String(data.created_at || new Date().toISOString())
          };
          this.jobs.set(j.id, j);
          return j;
        }
      } catch (err) {
        console.warn('[ProcessingJobRepo] Supabase getJobById failed:', err);
      }
    }

    return this.jobs.get(id) || null;
  }

  public static async getJobByIdempotencyKey(workspaceId: string, key: string): Promise<ProcessingJob | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('processing_jobs')
          .select('*')
          .eq('workspace_id', workspaceId)
          .eq('idempotency_key', key)
          .maybeSingle();

        if (!error && data) {
          return {
            id: String(data.id),
            workspaceId: String(data.workspace_id),
            importId: data.import_id ? String(data.import_id) : undefined,
            idempotencyKey: String(data.idempotency_key),
            type: (data.type as ProcessingJob['type']) || 'import',
            status: (data.status as ProcessingJob['status']) || 'pending',
            totalRecords: Number(data.total_records || 0),
            processedRecords: Number(data.processed_records || 0),
            failedRecords: Number(data.failed_records || 0),
            error: data.error ? String(data.error) : undefined,
            pipelineVersion: String(data.pipeline_version || '1.0.0'),
            startedAt: data.started_at ? String(data.started_at) : undefined,
            completedAt: data.completed_at ? String(data.completed_at) : undefined,
            createdAt: String(data.created_at || new Date().toISOString())
          };
        }
      } catch (err) {
        console.warn('[ProcessingJobRepo] Supabase getJobByIdempotencyKey failed:', err);
      }
    }

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

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase.from('processing_job_stages').upsert({
          id: stage.id,
          job_id: stage.jobId,
          stage: stage.stage,
          status: stage.status,
          total_items: stage.totalItems,
          processed_items: stage.processedItems,
          failed_items: stage.failedItems,
          error: stage.error || null,
          attempt: stage.attempt || 1,
          started_at: stage.startedAt || null,
          completed_at: stage.completedAt || null
        }, { onConflict: 'job_id,stage' });
        if (error) console.warn('[ProcessingJobRepo] Supabase saveStage notice:', error);
      } catch (err) {
        console.warn('[ProcessingJobRepo] Supabase saveStage failed:', err);
      }
    }

    return stage;
  }

  public static async getStagesByJobId(jobId: string): Promise<ProcessingJobStage[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('processing_job_stages')
          .select('*')
          .eq('job_id', jobId);

        if (!error && data && data.length > 0) {
          return data.map((r: Record<string, unknown>) => ({
            id: String(r.id),
            jobId: String(r.job_id),
            stage: r.stage as ProcessingJobStage['stage'],
            status: (r.status as ProcessingJobStage['status']) || 'pending',
            totalItems: Number(r.total_items || 0),
            processedItems: Number(r.processed_items || 0),
            failedItems: Number(r.failed_items || 0),
            error: r.error ? String(r.error) : undefined,
            attempt: Number(r.attempt || 1),
            startedAt: r.started_at ? String(r.started_at) : undefined,
            completedAt: r.completed_at ? String(r.completed_at) : undefined,
            createdAt: String(r.created_at || new Date().toISOString())
          }));
        }
      } catch (err) {
        console.warn('[ProcessingJobRepo] Supabase getStagesByJobId failed:', err);
      }
    }

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

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('ai_runs').upsert({
          id: run.id,
          workspace_id: run.workspaceId,
          job_id: run.jobId || null,
          stage: run.stage,
          operation: run.operation,
          provider: run.provider,
          model: run.model,
          input_tokens: run.inputTokens,
          output_tokens: run.outputTokens,
          estimated_cost: run.estimatedCost,
          duration_ms: run.durationMs,
          status: run.status,
          pipeline_version: run.pipelineVersion,
          prompt_version: run.promptVersion,
          error: run.error || null
        });
      } catch (err) {
        console.warn('[ProcessingJobRepo] Supabase saveAIRun failed:', err);
      }
    }

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

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('processing_jobs').delete().eq('workspace_id', workspaceId);
      } catch (err) {
        console.warn('[ProcessingJobRepo] Supabase clearWorkspace failed:', err);
      }
    }
  }
}
