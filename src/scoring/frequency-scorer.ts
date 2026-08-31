export class FrequencyScorer {
  public static calculate(mentionCount: number, maxWorkspaceMentions = 50): number {
    if (mentionCount <= 0) return 0;
    const benchmark = Math.max(10, maxWorkspaceMentions);
    const normalized = Math.min(100, Math.round((mentionCount / benchmark) * 100));
    return Math.max(10, normalized);
  }
}
