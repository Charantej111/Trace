import { AIRun } from '@/types/trace';
import { PIPELINE_VERSION } from './versioning';

export interface UsageReport {
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  durationMs: number;
}

export class AIUsageGuard {
  private static workspaceBudgets: Record<string, { maxCost: number; currentCost: number }> = {};
  private static runsLog: AIRun[] = [];

  public static setBudget(workspaceId: string, maxCostUsd: number) {
    this.workspaceBudgets[workspaceId] = {
      maxCost: maxCostUsd,
      currentCost: this.workspaceBudgets[workspaceId]?.currentCost || 0
    };
  }

  public static checkAllowance(workspaceId: string, estimatedOperationCostUsd = 0.01): boolean {
    const budget = this.workspaceBudgets[workspaceId];
    if (!budget) return true; // Default unlimited or demo
    return budget.currentCost + estimatedOperationCostUsd <= budget.maxCost;
  }

  public static recordRun(params: {
    workspaceId: string;
    jobId?: string;
    stage: string;
    operation: string;
    provider: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
    durationMs: number;
    promptVersion: string;
    status?: 'success' | 'failed' | 'rate_limited';
    error?: string;
  }): AIRun {
    const run: AIRun = {
      id: `airun-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      workspaceId: params.workspaceId,
      jobId: params.jobId,
      stage: params.stage,
      operation: params.operation,
      provider: params.provider,
      model: params.model,
      inputTokens: params.inputTokens,
      outputTokens: params.outputTokens,
      estimatedCost: params.estimatedCost,
      durationMs: params.durationMs,
      status: params.status || 'success',
      pipelineVersion: PIPELINE_VERSION,
      promptVersion: params.promptVersion,
      error: params.error,
      createdAt: new Date().toISOString()
    };

    this.runsLog.push(run);

    if (this.workspaceBudgets[params.workspaceId]) {
      this.workspaceBudgets[params.workspaceId].currentCost += params.estimatedCost;
    }

    return run;
  }

  public static getRunsForJob(jobId: string): AIRun[] {
    return this.runsLog.filter(r => r.jobId === jobId);
  }

  public static getTotalCost(workspaceId: string): number {
    return this.runsLog
      .filter(r => r.workspaceId === workspaceId)
      .reduce((acc, r) => acc + r.estimatedCost, 0);
  }
}
