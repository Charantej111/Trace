import { Theme, PainPoint, Insight } from '@/types/trace';

export class IntelligenceRepo {
  private static themeStore: Map<string, Theme> = new Map();
  private static painPointStore: Map<string, PainPoint> = new Map();
  private static insightStore: Map<string, Insight> = new Map();

  public static async saveThemes(themes: Theme[]): Promise<Theme[]> {
    themes.forEach(t => this.themeStore.set(t.id, t));
    return themes;
  }

  public static async getThemesByWorkspace(workspaceId: string): Promise<Theme[]> {
    return Array.from(this.themeStore.values()).filter(t => t.workspaceId === workspaceId);
  }

  public static async savePainPoints(painPoints: PainPoint[]): Promise<PainPoint[]> {
    painPoints.forEach(p => this.painPointStore.set(p.id, p));
    return painPoints;
  }

  public static async getPainPointsByWorkspace(workspaceId: string): Promise<PainPoint[]> {
    return Array.from(this.painPointStore.values()).filter(p => p.workspaceId === workspaceId);
  }

  public static async saveInsights(insights: Insight[]): Promise<Insight[]> {
    insights.forEach(i => this.insightStore.set(i.id, i));
    return insights;
  }

  public static async getInsightsByWorkspace(workspaceId: string): Promise<Insight[]> {
    return Array.from(this.insightStore.values()).filter(i => i.workspaceId === workspaceId);
  }

  public static async clearWorkspace(workspaceId: string): Promise<void> {
    for (const [id, t] of this.themeStore.entries()) {
      if (t.workspaceId === workspaceId) this.themeStore.delete(id);
    }
    for (const [id, p] of this.painPointStore.entries()) {
      if (p.workspaceId === workspaceId) this.painPointStore.delete(id);
    }
    for (const [id, i] of this.insightStore.entries()) {
      if (i.workspaceId === workspaceId) this.insightStore.delete(id);
    }
  }
}
