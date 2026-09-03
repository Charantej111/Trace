import { PainPoint, Theme, Feedback, FeedbackAtom, SeverityType } from '@/types/trace';
import { AIClient } from '@/ai/client';
import { PIPELINE_VERSION } from '@/ai/versioning';
import { IntelligenceRepo } from '@/repositories/intelligence-repo';

export class PainPointSynthesizer {
  /**
   * Synthesizes PainPoint records from themes and verified atom statistics.
   * LOCKED: Frequency, segment breakdown, and velocity are 100% deterministic code/SQL calculations.
   */
  public static async synthesizePainPoints(
    themes: Theme[],
    atoms: FeedbackAtom[],
    feedbackList: Feedback[],
    workspaceId: string,
    jobId?: string
  ): Promise<PainPoint[]> {
    const timestamp = new Date().toISOString();
    const painPoints: PainPoint[] = [];

    const feedbackMap = new Map<string, Feedback>();
    feedbackList.forEach(f => feedbackMap.set(f.id, f));

    // Resilience: If themes is empty but atoms exist, synthesize a core theme
    if (themes.length === 0 && atoms.length > 0) {
      const sampleTexts = atoms.slice(0, 10).map(a => a.atomText);
      const aiOutput = await AIClient.synthesizeTheme(sampleTexts, workspaceId, jobId);
      const fallbackTheme: Theme = {
        id: `theme-${Date.now()}-core`,
        workspaceId,
        name: aiOutput.name || 'Core Product Feedback',
        description: aiOutput.description || 'Customer operational feedback and friction points',
        atomCount: atoms.length,
        confidence: atoms.length >= 5 ? 'high' : 'medium',
        status: 'active',
        topKeywords: aiOutput.topKeywords,
        sentimentBreakdown: { positive: 33, neutral: 33, negative: 34 },
        atomIds: atoms.map(a => a.id),
        pipelineVersion: PIPELINE_VERSION,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      themes.push(fallbackTheme);
      await IntelligenceRepo.saveThemes(themes);
    }

    for (const theme of themes) {
      let themeAtoms = atoms.filter(a => theme.atomIds && theme.atomIds.includes(a.id));
      if (themeAtoms.length === 0 && atoms.length > 0) {
        const themeWords = theme.name.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        themeAtoms = atoms.filter(a => themeWords.some(w => a.atomText.toLowerCase().includes(w)));
        if (themeAtoms.length === 0) {
          themeAtoms = atoms;
        }
      }
      if (themeAtoms.length === 0) continue;

      // Deterministic Frequency
      const frequency = themeAtoms.length;

      // Deterministic Severity Aggregation
      let criticalCount = 0;
      let highCount = 0;
      themeAtoms.forEach(a => {
        if (a.severity === 'critical') criticalCount++;
        else if (a.severity === 'high') highCount++;
      });

      let overallSeverity: SeverityType = 'medium';
      if (criticalCount > 0) overallSeverity = 'critical';
      else if (highCount >= Math.ceil(frequency * 0.4)) overallSeverity = 'high';

      // Deterministic Segment Distribution
      const segmentCounts: Record<string, number> = {};
      themeAtoms.forEach(a => {
        const parentFb = feedbackMap.get(a.feedbackId);
        const segName = parentFb?.customerSegmentName || 'General SMB';
        segmentCounts[segName] = (segmentCounts[segName] || 0) + 1;
      });

      const affectedSegments = Object.entries(segmentCounts).map(([seg, count]) => ({
        segment: seg,
        count,
        percentage: Math.round((count / frequency) * 100)
      }));

      // Deterministic Fixed 30-Day Trend Mathematics
      // Calculate previous period vs current period mentions
      const now = Date.now();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const currentPeriodStart = now - thirtyDaysMs;
      const previousPeriodStart = now - 2 * thirtyDaysMs;

      let currentCount = 0;
      let previousCount = 0;

      themeAtoms.forEach(a => {
        const d = Date.parse(a.createdAt);
        if (d >= currentPeriodStart) currentCount++;
        else if (d >= previousPeriodStart) previousCount++;
      });

      let trendPercentage = 0;
      let isEmerging = false;

      if (previousCount === 0 && currentCount > 0) {
        trendPercentage = Math.min(100, currentCount * 25);
        isEmerging = currentCount >= 3 || overallSeverity === 'critical';
      } else if (previousCount > 0 && currentCount >= 3) {
        trendPercentage = Math.round(((currentCount - previousCount) / previousCount) * 100);
        isEmerging = trendPercentage > 25 || overallSeverity === 'critical';
      }

      const velocityMultiplier = Number((1.0 + Math.max(0, trendPercentage / 100)).toFixed(2));

      // AI synthesizes descriptive problem statement & root cause hypothesis
      const sampleQuotes = themeAtoms.slice(0, 3).map(a => a.atomText);
      const aiOutput = await AIClient.synthesizePainPoint(theme.name, sampleQuotes, workspaceId, jobId);

      painPoints.push({
        id: `pp-${Date.now()}-${painPoints.length}`,
        workspaceId,
        themeId: theme.id,
        themeName: theme.name,
        title: aiOutput.title,
        description: aiOutput.description,
        hypothesis: aiOutput.hypothesis,
        severity: overallSeverity,
        frequency,
        trendPercentage,
        isEmerging,
        velocityMultiplier,
        confidence: frequency >= 5 ? 'high' : 'medium',
        affectedSegments,
        atomIds: theme.atomIds,
        pipelineVersion: PIPELINE_VERSION,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }

    return painPoints;
  }
}
