import { Opportunity, ProductDecision, RoadmapItem } from '@/types/trace';
import { supabase, isSupabaseConfigured, Transformers } from '@/lib/supabase';

export class DecisionsRepo {
  private static oppStore: Map<string, Opportunity> = new Map();
  private static decisionStore: Map<string, ProductDecision> = new Map();
  private static roadmapStore: Map<string, RoadmapItem> = new Map();

  public static async saveOpportunities(opps: Opportunity[]): Promise<Opportunity[]> {
    opps.forEach(o => this.oppStore.set(o.id, o));

    if (isSupabaseConfigured() && supabase && opps.length > 0) {
      try {
        const rows = opps.map(Transformers.opportunityToRow);
        const { error } = await supabase.from('opportunities').upsert(rows);
        if (error) console.warn('[DecisionsRepo] Supabase opportunities upsert error:', error);
      } catch (err) {
        console.warn('[DecisionsRepo] Supabase saveOpportunities failed:', err);
      }
    }

    return opps;
  }

  public static async getOpportunitiesByWorkspace(workspaceId: string): Promise<Opportunity[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('opportunities')
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('score_frequency', { ascending: false });

        if (!error && data && data.length > 0) {
          const list = data.map(row => {
            const opp = Transformers.rowToOpportunity(row);
            const cached = this.oppStore.get(opp.id);
            if (cached && cached.supportingAtomIds && cached.supportingAtomIds.length > 0) {
              opp.supportingAtomIds = cached.supportingAtomIds;
              opp.supportingInsightIds = cached.supportingInsightIds;
              opp.evidenceCount = cached.evidenceCount || opp.evidenceCount;
            }
            this.oppStore.set(opp.id, opp);
            return opp;
          });
          return list;
        }
      } catch (err) {
        console.warn('[DecisionsRepo] Supabase getOpportunitiesByWorkspace failed:', err);
      }
    }

    return Array.from(this.oppStore.values()).filter(o => o.workspaceId === workspaceId);
  }

  public static async updateOpportunityStatus(id: string, status: Opportunity['status']): Promise<Opportunity | null> {
    const opp = this.oppStore.get(id);
    if (opp) {
      opp.status = status;
      opp.updatedAt = new Date().toISOString();
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('opportunities')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id);
      } catch (err) {
        console.warn('[DecisionsRepo] Supabase updateOpportunityStatus failed:', err);
      }
    }

    return opp || null;
  }

  public static async saveDecision(decision: ProductDecision): Promise<ProductDecision> {
    this.decisionStore.set(decision.id, decision);

    if (isSupabaseConfigured() && supabase) {
      try {
        const row = Transformers.decisionToRow(decision);
        const { error } = await supabase.from('product_decisions').upsert(row);
        if (error) console.warn('[DecisionsRepo] Supabase product_decisions upsert error:', error);
      } catch (err) {
        console.warn('[DecisionsRepo] Supabase saveDecision failed:', err);
      }
    }

    return decision;
  }

  public static async getDecisionsByWorkspace(workspaceId: string): Promise<ProductDecision[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('product_decisions')
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('decided_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const list = data.map(Transformers.rowToDecision);
          list.forEach(d => this.decisionStore.set(d.id, d));
          return list;
        }
      } catch (err) {
        console.warn('[DecisionsRepo] Supabase getDecisionsByWorkspace failed:', err);
      }
    }

    return Array.from(this.decisionStore.values()).filter(d => d.workspaceId === workspaceId);
  }

  public static async saveRoadmapItem(item: RoadmapItem): Promise<RoadmapItem> {
    this.roadmapStore.set(item.id, item);

    if (isSupabaseConfigured() && supabase) {
      try {
        const row = Transformers.roadmapItemToRow(item);
        const { error } = await supabase.from('roadmap_items').upsert(row);
        if (error) console.warn('[DecisionsRepo] Supabase roadmap_items upsert error:', error);
      } catch (err) {
        console.warn('[DecisionsRepo] Supabase saveRoadmapItem failed:', err);
      }
    }

    return item;
  }

  public static async getRoadmapByWorkspace(workspaceId: string): Promise<RoadmapItem[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('roadmap_items')
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const list = data.map(Transformers.rowToRoadmapItem);
          list.forEach(r => this.roadmapStore.set(r.id, r));
          return list;
        }
      } catch (err) {
        console.warn('[DecisionsRepo] Supabase getRoadmapByWorkspace failed:', err);
      }
    }

    return Array.from(this.roadmapStore.values()).filter(r => r.workspaceId === workspaceId);
  }

  public static async updateRoadmapItemStatus(id: string, status: RoadmapItem['status']): Promise<RoadmapItem | null> {
    const item = this.roadmapStore.get(id);
    if (item) {
      item.status = status;
      item.updatedAt = new Date().toISOString();
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('roadmap_items')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id);
      } catch (err) {
        console.warn('[DecisionsRepo] Supabase updateRoadmapItemStatus failed:', err);
      }
    }

    return item || null;
  }

  public static async deleteRoadmapItem(id: string): Promise<boolean> {
    this.roadmapStore.delete(id);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('roadmap_items')
          .delete()
          .eq('id', id);
      } catch (err) {
        console.warn('[DecisionsRepo] Supabase deleteRoadmapItem failed:', err);
      }
    }

    return true;
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

    if (isSupabaseConfigured() && supabase) {
      try {
        await Promise.all([
          supabase.from('roadmap_items').delete().eq('workspace_id', workspaceId),
          supabase.from('product_decisions').delete().eq('workspace_id', workspaceId),
          supabase.from('opportunities').delete().eq('workspace_id', workspaceId)
        ]);
      } catch (err) {
        console.warn('[DecisionsRepo] Supabase clearWorkspace failed:', err);
      }
    }
  }
}
