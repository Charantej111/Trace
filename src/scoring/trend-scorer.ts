export class TrendScorer {
  public static calculate(trendPercentage: number, isEmerging: boolean): number {
    if (isEmerging) {
      return Math.min(100, Math.max(75, 75 + Math.round(trendPercentage * 0.25)));
    }
    if (trendPercentage <= 0) {
      return Math.max(20, 50 + Math.round(trendPercentage * 0.5));
    }
    const scaled = 50 + Math.min(50, Math.round(trendPercentage * 0.75));
    return Math.min(100, Math.max(20, scaled));
  }
}
