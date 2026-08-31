import { Theme } from '@/types/trace';
import { CandidateCluster } from '../clustering/vector-clusterer';
import { AIClient } from '@/ai/client';
import { PIPELINE_VERSION } from '@/ai/versioning';

export class ThemeSynthesizer {
  /**
   * Synthesizes Theme records from deterministically clustered atoms.
   * LOCKED: AI only synthesizes the descriptive name and summary. Membership is 100% deterministic.
   */
  public static async synthesizeThemes(
    clusters: CandidateCluster[],
    workspaceId: string,
    jobId?: string
  ): Promise<Theme[]> {
    const timestamp = new Date().toISOString();
    const themes: Theme[] = [];

    for (const cluster of clusters) {
      const sampleTexts = cluster.atoms.slice(0, 10).map(a => a.atomText);

      // AI synthesizes human-readable title & summary
      const aiOutput = await AIClient.synthesizeTheme(sampleTexts, workspaceId, jobId);

      // Deterministic sentiment breakdown
      let positive = 0;
      let neutral = 0;
      let negative = 0;

      cluster.atoms.forEach(a => {
        if (a.sentiment === 'positive') positive++;
        else if (a.sentiment === 'negative') negative++;
        else neutral++;
      });

      const total = cluster.atoms.length || 1;

      themes.push({
        id: `theme-${Date.now()}-${themes.length}`,
        workspaceId,
        name: aiOutput.name,
        description: aiOutput.description,
        atomCount: cluster.atoms.length,
        confidence: cluster.atoms.length >= 5 ? 'high' : 'medium',
        status: 'active',
        topKeywords: aiOutput.topKeywords,
        sentimentBreakdown: {
          positive: Math.round((positive / total) * 100),
          neutral: Math.round((neutral / total) * 100),
          negative: Math.round((negative / total) * 100)
        },
        atomIds: cluster.atomIds,
        pipelineVersion: PIPELINE_VERSION,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }

    return themes;
  }
}
