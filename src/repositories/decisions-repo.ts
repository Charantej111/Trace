import { Opportunity, ProductDecision, RoadmapItem } from '@/types/trace';

export class DecisionsRepo {
  private static oppStore: Map<string, Opportunity> = new Map();
  private static decisionStore: Map<string, ProductDecision> = new Map();
  private static roadmapStore: Map<string, RoadmapItem> = new Map();

  public static async saveOpportunities(opps: Opportunity[]): Promise<Opportunity[]> {
    opps.forEach(o => this.oppStore.set(o.id, o));
    return opps;
  }

  public static async getOpportunitiesByWorkspace(workspaceId: string): Promise<Opportunity[]> {
    return Array.from(this.oppStore.values()).filter(o => o.workspaceId === workspaceId);
  }

  public static async updateOpportunityStatus(id: string, status: Opportunity['status']): Promise<Opportunity | null> {
    const opp = this.oppStore.get(id);
    if (!opp) return null;
    opp.status = status;
    opp.updatedAt = new Date().toISOString();
    return opp;
  }

  public static async saveDecision(decision: ProductDecision): Promise<ProductDecision> {
    this.decisionStore.set(decision.id, decision);
    return decision;
  }

  public static async getDecisionsByWorkspace(workspaceId: string): Promise<ProductDecision[]> {
    return Array.from(this.decisionStore.values()).filter(d => d.workspaceId === workspaceId);
  }

  public static async saveRoadmapItem(item: RoadmapItem): Promise<RoadmapItem> {
    this.roadmapStore.set(item.id, item);
    return item;
  }

  public static async getRoadmapByWorkspace(workspaceId: string): Promise<RoadmapItem[]> {
    return Array.from(this.roadmapStore.values()).filter(r => r.workspaceId === workspaceId);
  }

  public static async updateRoadmapItemStatus(id: string, status: RoadmapItem['status']): Promise<RoadmapItem | null> {
    const item = this.roadmapStore.get(id);
    if (!item) return null;
    item.status = status;
    item.updatedAt = new Date().toISOString();
    return item;
  }

  public static async clearWorkspace(workspaceId: string): Promise<void> {
    for (const [id, o] of this.oppStore.entries()) {
      if (o.workspaceId === workspaceId) this.oppStore.delete(id);
    }
    for (const [id, d] of this.decisionStore.entries()) {
      if (d.workspaceId === workspaceId) this.decisionStore.delete(id);
    }
    for (const [id, r] of this.roadmapStore.entries()) {
      if (r.workspaceId === workspaceId) this.roadmapStore.delete(id);
    }
  }
}
