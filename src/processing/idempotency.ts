export class IdempotencyManager {
  public static generateJobKey(
    workspaceId: string,
    importId: string,
    type: 'import' | 'reprocess' | 'incremental',
    pipelineVersion: string
  ): string {
    return `job-${workspaceId}-${importId}-${type}-${pipelineVersion}`;
  }

  public static generateStageItemKey(
    stageId: string,
    entityType: string,
    entityId: string
  ): string {
    return `${stageId}-${entityType}-${entityId}`;
  }
}
