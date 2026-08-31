import { CustomerSegment } from '@/types/trace';

export class SegmentScorer {
  public static calculate(
    affectedSegments: { segment: string; count: number; percentage: number }[],
    configuredSegments: CustomerSegment[]
  ): number {
    if (affectedSegments.length === 0) return 50;

    const weightMap: Record<string, number> = {};
    configuredSegments.forEach(seg => {
      weightMap[seg.name.toLowerCase()] = seg.strategicWeight || 1.0;
    });

    let totalWeightedPercentage = 0;
    let totalPercentage = 0;

    affectedSegments.forEach(item => {
      const segName = item.segment.toLowerCase();
      let weight = weightMap[segName];
      if (weight === undefined) {
        if (segName.includes('enterprise')) weight = 1.5;
        else if (segName.includes('smb') || segName.includes('mid')) weight = 1.2;
        else weight = 1.0;
      }

      totalWeightedPercentage += item.percentage * weight;
      totalPercentage += item.percentage;
    });

    if (totalPercentage === 0) return 50;

    const averageWeightedRatio = totalWeightedPercentage / totalPercentage;
    const baseScore = Math.round(averageWeightedRatio * 60);
    return Math.min(100, Math.max(25, baseScore));
  }
}
