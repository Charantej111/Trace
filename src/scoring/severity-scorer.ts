import { SeverityType } from '@/types/trace';

export class SeverityScorer {
  public static calculate(severities: SeverityType[]): number {
    if (severities.length === 0) return 30;

    let criticalCount = 0;
    let highCount = 0;
    let mediumCount = 0;
    let lowCount = 0;

    severities.forEach(s => {
      if (s === 'critical') criticalCount++;
      else if (s === 'high') highCount++;
      else if (s === 'medium') mediumCount++;
      else lowCount++;
    });

    const total = severities.length;
    const score = (criticalCount * 100 + highCount * 75 + mediumCount * 50 + lowCount * 25) / total;
    return Math.min(100, Math.max(10, Math.round(score)));
  }
}
