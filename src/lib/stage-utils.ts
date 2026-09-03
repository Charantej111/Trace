import { ProcessingStageType } from '@/types/trace';

/**
 * Transforms internal technical pipeline stage keys into professional,
 * human-readable SaaS product status descriptions.
 * Never exposes raw technical job IDs or robotic "AI slop" logs to end users.
 */
export function getStageHumanLabel(stage?: ProcessingStageType | string | null): string {
  switch (stage) {
    case 'normalization':
      return 'Validating and formatting customer statements';
    case 'atomization':
      return 'Extracting verbatim customer quotes';
    case 'classification':
      return 'Analyzing sentiment, severity, and customer intent';
    case 'embedding':
      return 'Computing semantic relationships';
    case 'clustering':
      return 'Grouping statements into friction clusters';
    case 'theme_generation':
      return 'Synthesizing core product themes';
    case 'pain_point_generation':
      return 'Detecting friction velocity and critical issues';
    case 'insight_generation':
      return 'Formulating defensible product insights';
    case 'opportunity_generation':
      return 'Calculating priority scores and recommendations';
    default:
      return 'Processing feedback dataset';
  }
}
