import { ProcessingStageType } from '@/types/trace';

export const STAGE_DEPENDENCIES: Record<ProcessingStageType, ProcessingStageType[]> = {
  normalization: [],
  atomization: ['normalization'],
  classification: ['atomization'],
  embedding: ['classification'],
  clustering: ['embedding'],
  theme_generation: ['clustering'],
  pain_point_generation: ['theme_generation'],
  insight_generation: ['pain_point_generation'],
  opportunity_generation: ['insight_generation']
};

export class StageDependencyValidator {
  public static canExecuteStage(
    targetStage: ProcessingStageType,
    completedStages: Set<ProcessingStageType>
  ): { allowed: boolean; missingDependency?: ProcessingStageType } {
    const dependencies = STAGE_DEPENDENCIES[targetStage] || [];
    for (const dep of dependencies) {
      if (!completedStages.has(dep)) {
        return { allowed: false, missingDependency: dep };
      }
    }
    return { allowed: true };
  }
}
