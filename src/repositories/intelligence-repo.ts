import { Theme, PainPoint, Insight } from '@/types/trace';
import { supabase, isSupabaseConfigured, Transformers } from '@/lib/supabase';

export class IntelligenceRepo {
  private static themeStore: Map<string, Theme> = new Map();
  private static painPointStore: Map<string, PainPoint> = new Map();
  private static insightStore: Map<string, Insight> = new Map();

  public static async saveThemes(themes: Theme[]): Promise<Theme[]> {
    themes.forEach(t => this.themeStore.set(t.id, t));

    if (isSupabaseConfigured() && supabase && themes.length > 0) {
      try {
        const rows = themes.map(Transformers.themeToRow);
        const { error } = await supabase.from('themes').upsert(rows);
        if (error) console.warn('[IntelligenceRepo] Supabase themes upsert error:', error);
      } catch (err) {
        console.warn('[IntelligenceRepo] Supabase saveThemes failed:', err);
      }
    }

    return themes;
  }

  public static async getThemesByWorkspace(workspaceId: string): Promise<Theme[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('themes')
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('atom_count', { ascending: false });

        if (!error && data && data.length > 0) {
          const list = data.map(row => {
            const theme = Transformers.rowToTheme(row);
            const cached = this.themeStore.get(theme.id);
            if (cached && (!theme.atomIds || theme.atomIds.length === 0) && cached.atomIds && cached.atomIds.length > 0) {
              theme.atomIds = cached.atomIds;
              theme.sentimentBreakdown = cached.sentimentBreakdown;
              theme.topKeywords = cached.topKeywords;
            }
            this.themeStore.set(theme.id, theme);
            return theme;
          });
          return list;
        }
      } catch (err) {
        console.warn('[IntelligenceRepo] Supabase getThemesByWorkspace failed:', err);
      }
    }

    return Array.from(this.themeStore.values()).filter(t => t.workspaceId === workspaceId);
  }

  public static async savePainPoints(painPoints: PainPoint[]): Promise<PainPoint[]> {
    painPoints.forEach(p => this.painPointStore.set(p.id, p));

    if (isSupabaseConfigured() && supabase && painPoints.length > 0) {
      try {
        const rows = painPoints.map(Transformers.painPointToRow);
        const { error } = await supabase.from('pain_points').upsert(rows);
        if (error) console.warn('[IntelligenceRepo] Supabase pain_points upsert error:', error);
      } catch (err) {
        console.warn('[IntelligenceRepo] Supabase savePainPoints failed:', err);
      }
    }

    return painPoints;
  }

  public static async getPainPointsByWorkspace(workspaceId: string): Promise<PainPoint[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('pain_points')
          .select('*')
          .eq('workspace_id', workspaceId)
          .order('frequency', { ascending: false });

        if (!error && data && data.length > 0) {
          const list = data.map(row => {
            const pp = Transformers.rowToPainPoint(row);
            const cached = this.painPointStore.get(pp.id);
            if (cached && (!pp.atomIds || pp.atomIds.length === 0) && cached.atomIds && cached.atomIds.length > 0) {
              pp.atomIds = cached.atomIds;
              pp.hypothesis = cached.hypothesis;
              pp.affectedSegments = cached.affectedSegments;
            }
            this.painPointStore.set(pp.id, pp);
            return pp;
          });
          return list;
        }
      } catch (err) {
        console.warn('[IntelligenceRepo] Supabase getPainPointsByWorkspace failed:', err);
      }
    }

    return Array.from(this.painPointStore.values()).filter(p => p.workspaceId === workspaceId);
  }

  public static async saveInsights(insights: Insight[]): Promise<Insight[]> {
    insights.forEach(i => this.insightStore.set(i.id, i));

    if (isSupabaseConfigured() && supabase && insights.length > 0) {
      try {
        const rows = insights.map(Transformers.insightToRow);
        const { error: insErr } = await supabase.from('insights').upsert(rows);
        if (insErr) console.warn('[IntelligenceRepo] Supabase insights upsert error:', insErr);

        // Save evidence relations (Anti-Hallucination Gate)
        for (const ins of insights) {
          if (ins.evidence && ins.evidence.length > 0) {
            const evRows = ins.evidence.map(ev => ({
              insight_id: ins.id,
              atom_id: ev.atomId,
              feedback_id: ev.feedbackId,
              evidence_type: ev.evidenceType,
              quote_text: ev.quoteText,
              relevance_score: ev.relevanceScore
            }));
            await supabase.from('insight_evidence').upsert(evRows);
          }
        }
      } catch (err) {
        console.warn('[IntelligenceRepo] Supabase saveInsights failed:', err);
      }
    }

    return insights;
  }

  public static async getInsightsByWorkspace(workspaceId: string): Promise<Insight[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('insights')
          .select('*, insight_evidence(*)')
          .eq('workspace_id', workspaceId)
          .order('frequency', { ascending: false });

        if (!error && data && data.length > 0) {
          const list = data.map((row: Record<string, unknown>) => {
            const evList = Array.isArray(row.insight_evidence)
              ? (row.insight_evidence as Record<string, unknown>[]).map(ev => ({
                  insightId: String(ev.insight_id),
                  atomId: String(ev.atom_id),
                  feedbackId: String(ev.feedback_id),
                  evidenceType: (ev.evidence_type as Insight['evidence'][0]['evidenceType']) || 'supporting',
                  quoteText: String(ev.quote_text),
                  relevanceScore: Number(ev.relevance_score || 1.0),
                  sourceType: 'csv' as const,
                  sourceCreatedAt: String(ev.created_at || new Date().toISOString())
                }))
              : [];
            const ins = Transformers.rowToInsight(row, evList);
            const cached = this.insightStore.get(ins.id);
            if (cached && ins.evidence.length === 0 && cached.evidence && cached.evidence.length > 0) {
              ins.evidence = cached.evidence;
              ins.supportingEvidenceCount = cached.supportingEvidenceCount;
              ins.contradictingEvidenceCount = cached.contradictingEvidenceCount;
            }
            this.insightStore.set(ins.id, ins);
            return ins;
          });
          return list;
        }
      } catch (err) {
        console.warn('[IntelligenceRepo] Supabase getInsightsByWorkspace failed:', err);
      }
    }

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

    if (isSupabaseConfigured() && supabase) {
      try {
        await Promise.all([
          supabase.from('insight_evidence').delete().match({}),
          supabase.from('insights').delete().eq('workspace_id', workspaceId),
          supabase.from('pain_points').delete().eq('workspace_id', workspaceId),
          supabase.from('themes').delete().eq('workspace_id', workspaceId)
        ]);
      } catch (err) {
        console.warn('[IntelligenceRepo] Supabase clearWorkspace failed:', err);
      }
    }
  }
}
