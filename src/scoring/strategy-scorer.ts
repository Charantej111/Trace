import { ProductContext } from '@/types/trace';

export class StrategyScorer {
  /**
   * Deterministically calculates strategic alignment score against workspace product context.
   */
  public static calculate(
    opportunityTitle: string,
    problemStatement: string,
    context?: ProductContext
  ): number {
    if (!context) return 60;

    const searchableText = `${opportunityTitle} ${problemStatement}`.toLowerCase();
    let score = 50;

    // 1. Goal Matching
    if (context.companyGoals && context.companyGoals.length > 0) {
      context.companyGoals.forEach(goal => {
        const goalTokens = goal.goal.toLowerCase().split(/\W+/).filter(t => t.length > 3);
        const matches = goalTokens.filter(t => searchableText.includes(t));
        if (matches.length > 0) {
          const boost = goal.priority === 'high' ? 20 : goal.priority === 'medium' ? 12 : 6;
          score += boost;
        }
      });
    }

    // 2. Strategic Focus Area Matching
    if (context.strategicFocusAreas && context.strategicFocusAreas.length > 0) {
      context.strategicFocusAreas.forEach(area => {
        const areaTokens = area.toLowerCase().split(/\W+/).filter(t => t.length > 3);
        const matches = areaTokens.filter(t => searchableText.includes(t));
        if (matches.length > 0) {
          score += 10;
        }
      });
    }

    return Math.min(100, Math.max(30, score));
  }
}
