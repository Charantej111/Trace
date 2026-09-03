import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Workspace,
  ProductContext,
  CustomerSegment,
  FeedbackSource,
  Feedback,
  Theme,
  PainPoint,
  Insight,
  Opportunity,
  ProductDecision,
  RoadmapItem,
  DecisionType,
  RoadmapStatus,
  OpportunityStatus,
  ImportJob,
  SourceType,
  CanonicalFeedback,
  ProcessingJob,
  ProcessingJobStage
} from '@/types/trace';
import {
  INITIAL_WORKSPACE,
  INITIAL_PRODUCT_CONTEXT,
  INITIAL_CUSTOMER_SEGMENTS
} from './mock-data';
import { FeedbackRepo } from '@/repositories/feedback-repo';
import { IntelligenceRepo } from '@/repositories/intelligence-repo';
import { DecisionsRepo } from '@/repositories/decisions-repo';
import { ProcessingJobRepo } from '@/repositories/processing-job-repo';
import { ProcessingOrchestrator } from '@/processing/orchestrator';
import { NormalizationEngine } from '@/evidence/normalization/engine';
import { PainPointSynthesizer } from '@/intelligence/pain-points/pain-point-synthesizer';
import { InsightSynthesizer } from '@/intelligence/insights/insight-synthesizer';
import { ExplainableScoringEngine } from '@/scoring/explainable-scoring';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface TraceStoreContextType {
  workspace: Workspace;
  productContext: ProductContext;
  updateProductContext: (newContext: Partial<ProductContext>) => void;
  addCompanyGoal: (goal: { goal: string; priority: 'high' | 'medium' | 'low' }) => void;
  deleteCompanyGoal: (id: string) => void;
  customerSegments: CustomerSegment[];
  addCustomerSegment: (segment: { name: string; description?: string; strategicWeight: number }) => void;
  updateCustomerSegment: (id: string, updates: Partial<CustomerSegment>) => void;
  deleteCustomerSegment: (id: string) => void;
  sources: FeedbackSource[];
  importJobs: ImportJob[];
  feedbackList: Feedback[];
  themes: Theme[];
  painPoints: PainPoint[];
  insights: Insight[];
  opportunities: Opportunity[];
  decisions: ProductDecision[];
  roadmapItems: RoadmapItem[];

  // Processing state & live progress
  activeJob: ProcessingJob | null;
  activeStage: ProcessingJobStage | null;
  isProcessing: boolean;

  // Actions
  ingestCanonicalBatch: (
    records: CanonicalFeedback[],
    sourceMeta: {
      name: string;
      type: SourceType;
      fileName?: string;
      fileSize?: number;
      importId?: string;
      validCount?: number;
      invalidCount?: number;
      duplicateCount?: number;
    }
  ) => Promise<void>;
  reprocessImport: (importId: string) => Promise<void>;
  recordDecision: (
    opportunityId: string,
    decision: DecisionType,
    rationale: string,
    alternativeTitle?: string,
    targetPeriod?: string
  ) => Promise<void>;
  updateOpportunityStatus: (opportunityId: string, status: OpportunityStatus) => Promise<void>;
  updateRoadmapItemStatus: (roadmapId: string, newStatus: RoadmapStatus) => Promise<void>;
  deleteRoadmapItem: (roadmapId: string) => Promise<void>;
  synthesizeIntelligence: () => Promise<void>;
  clearWorkspaceData: () => Promise<void>;
}

const TraceStoreContext = createContext<TraceStoreContextType | null>(null);

const STORAGE_KEY = 'trace_platform_clean_v6';

export function TraceStoreProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [workspace] = useState<Workspace>(INITIAL_WORKSPACE);
  const [productContext, setProductContext] = useState<ProductContext>(INITIAL_PRODUCT_CONTEXT);
  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>(INITIAL_CUSTOMER_SEGMENTS);

  const [sources, setSources] = useState<FeedbackSource[]>([]);
  const [importJobs, setImportJobs] = useState<ImportJob[]>([]);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [decisions, setDecisions] = useState<ProductDecision[]>([]);
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);

  // Active Job Execution state
  const [activeJob, setActiveJob] = useState<ProcessingJob | null>(null);
  const [activeStage, setActiveStage] = useState<ProcessingJobStage | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const isSynthesizingRef = React.useRef<boolean>(false);

  // Data Loading / Refresh (Pure reader, never recursively invokes synthesis)
  const refreshFromRepositories = useCallback(async () => {
    const wsId = workspace.id;
    const [fb, th, pp, ins, opps, decs, rd, srcs] = await Promise.all([
      FeedbackRepo.getFeedbackByWorkspace(wsId),
      IntelligenceRepo.getThemesByWorkspace(wsId),
      IntelligenceRepo.getPainPointsByWorkspace(wsId),
      IntelligenceRepo.getInsightsByWorkspace(wsId),
      DecisionsRepo.getOpportunitiesByWorkspace(wsId),
      DecisionsRepo.getDecisionsByWorkspace(wsId),
      DecisionsRepo.getRoadmapByWorkspace(wsId),
      FeedbackRepo.getSourcesByWorkspace(wsId)
    ]);

    setFeedbackList(fb);
    setThemes(th);
    setPainPoints(pp);
    setInsights(ins);
    setOpportunities(opps);
    setDecisions(decs);
    setRoadmapItems(rd);
    setSources(srcs);
  }, [workspace.id]);

  // Synthesis of downstream intelligence with strict concurrency mutex lock
  const synthesizeIntelligence = useCallback(async () => {
    if (isSynthesizingRef.current) return;
    isSynthesizingRef.current = true;

    try {
      const wsId = workspace.id;
      const fb = await FeedbackRepo.getFeedbackByWorkspace(wsId);
      if (fb.length === 0) return;

      let atoms = await FeedbackRepo.getAtomsByWorkspace(wsId);
      if (atoms.length === 0) {
        const job = await ProcessingOrchestrator.createJob({
          workspaceId: wsId,
          totalRecords: fb.length,
          type: 'reprocess'
        });
        await ProcessingOrchestrator.executeJob(job.id, productContext, customerSegments);
        await refreshFromRepositories();
        return;
      }

      let th = await IntelligenceRepo.getThemesByWorkspace(wsId);
      let pp = await IntelligenceRepo.getPainPointsByWorkspace(wsId);
      if (pp.length === 0) {
        pp = await PainPointSynthesizer.synthesizePainPoints(th, atoms, fb, wsId);
        await IntelligenceRepo.savePainPoints(pp);
        setPainPoints(pp);
      }

      let ins = await IntelligenceRepo.getInsightsByWorkspace(wsId);
      if (ins.length === 0) {
        ins = await InsightSynthesizer.synthesizeInsights(pp, atoms, fb, wsId);
        await IntelligenceRepo.saveInsights(ins);
        setInsights(ins);
      }

      let opps = await DecisionsRepo.getOpportunitiesByWorkspace(wsId);
      if (opps.length === 0) {
        opps = await ExplainableScoringEngine.synthesizeOpportunities({
          insights: ins,
          atoms,
          context: productContext,
          customerSegments: customerSegments,
          workspaceId: wsId
        });
        await DecisionsRepo.saveOpportunities(opps);
        setOpportunities(opps);
      }
    } catch (err) {
      console.warn('[store] synthesizeIntelligence error:', err);
    } finally {
      isSynthesizingRef.current = false;
    }
  }, [workspace.id, productContext, customerSegments, refreshFromRepositories]);

  // Subscribe to progress events from Orchestrator
  useEffect(() => {
    const unsubscribe = ProcessingOrchestrator.onProgress((job, stage) => {
      setActiveJob(job);
      setActiveStage(stage || null);
      setIsProcessing(job.status === 'processing');
      if (job.status === 'completed' || job.status === 'partially_failed') {
        refreshFromRepositories();
      }
    });
    return () => {
      unsubscribe();
    };
  }, [refreshFromRepositories]);

  // Hydration from LocalStorage & Supabase with Zero-Data-Loss Guarantee
  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      try {
        // 1. Read existing local cache first to ensure zero data loss
        let cachedFeedbackList: Feedback[] = [];
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.productContext && isMounted) setProductContext(parsed.productContext);
            if (parsed.customerSegments && isMounted) setCustomerSegments(parsed.customerSegments);
            if (parsed.importJobs && isMounted) setImportJobs(parsed.importJobs);

            if (Array.isArray(parsed.feedbackList) && parsed.feedbackList.length > 0) {
              const cleanFeedback = parsed.feedbackList.filter((f: Feedback) =>
                !f.customerName?.toLowerCase().startsWith('test') &&
                !f.text?.toLowerCase().startsWith('test ')
              );
              cachedFeedbackList = cleanFeedback;
              // Preload in-memory stores so data is immediately accessible
              await FeedbackRepo.seedFeedback(cleanFeedback);
              if (parsed.atoms) await FeedbackRepo.saveAtoms(parsed.atoms);
              if (parsed.themes) {
                const cleanThemes = (parsed.themes as Theme[]).filter(t => !t.name.toLowerCase().includes('test'));
                await IntelligenceRepo.saveThemes(cleanThemes);
              }
              if (parsed.painPoints) {
                const cleanPP = (parsed.painPoints as PainPoint[]).filter(p => !p.title.toLowerCase().includes('test'));
                await IntelligenceRepo.savePainPoints(cleanPP);
              }
              if (parsed.insights) {
                const cleanIns = (parsed.insights as Insight[]).filter(i => !i.title.toLowerCase().includes('test'));
                await IntelligenceRepo.saveInsights(cleanIns);
              }
              if (parsed.opportunities) {
                const cleanOpps = (parsed.opportunities as Opportunity[]).filter(o => !o.title.toLowerCase().includes('test'));
                await DecisionsRepo.saveOpportunities(cleanOpps);
              }
              if (parsed.decisions) {
                (parsed.decisions as ProductDecision[])
                  .filter(d => !d.opportunityTitle?.toLowerCase().includes('test'))
                  .forEach(d => DecisionsRepo.saveDecision(d));
              }
              if (parsed.roadmapItems) {
                (parsed.roadmapItems as RoadmapItem[])
                  .filter(r => !r.title.toLowerCase().includes('test'))
                  .forEach(r => DecisionsRepo.saveRoadmapItem(r));
              }
              if (parsed.sources) parsed.sources.forEach((s: FeedbackSource) => FeedbackRepo.saveSource(s));
            }
          } catch (err) {
            console.warn('[store] Failed to parse local state cache:', err);
          }
        }

        // 2. If Supabase is configured, ensure workspace row exists and sync with database
        if (isSupabaseConfigured() && supabase) {
          try {
            await supabase.from('workspaces').upsert({
              id: workspace.id,
              name: workspace.name,
              slug: workspace.slug,
              product_name: workspace.productName,
              product_category: workspace.productCategory
            }, { onConflict: 'id' });
          } catch (wsErr) {
            console.warn('[store] Ensure workspace upsert notice:', wsErr);
          }

          const remoteFeedback = await FeedbackRepo.getFeedbackByWorkspace(workspace.id);
          if (remoteFeedback && remoteFeedback.length > 0) {
            await refreshFromRepositories();
          } else if (cachedFeedbackList.length > 0) {
            // Sync local cached feedback to Supabase so it's durable
            await FeedbackRepo.seedFeedback(cachedFeedbackList);
            await refreshFromRepositories();
          } else {
            await refreshFromRepositories();
          }

          // Fetch product context and customer segments
          const { data: ctxData } = await supabase
            .from('product_context')
            .select('*')
            .eq('workspace_id', workspace.id)
            .maybeSingle();

          if (ctxData && isMounted) {
            setProductContext({
              workspaceId: workspace.id,
              companyGoals: ctxData.company_goals || [],
              targetSegments: ctxData.target_segments || [],
              strategicFocusAreas: ctxData.strategic_focus_areas || [],
              knownConstraints: ctxData.known_constraints || [],
              updatedAt: ctxData.updated_at || new Date().toISOString()
            });
          }

          const { data: segData } = await supabase
            .from('customer_segments')
            .select('*')
            .eq('workspace_id', workspace.id);

          if (segData && segData.length > 0 && isMounted) {
            setCustomerSegments(
              segData.map((d: Record<string, unknown>) => ({
                id: String(d.id),
                workspaceId: String(d.workspace_id),
                name: String(d.name),
                description: d.description ? String(d.description) : undefined,
                strategicWeight: Number(d.strategic_weight || 1.0)
              }))
            );
          }
        } else {
          await refreshFromRepositories();
        }
      } catch (e) {
        console.error('Error loading stored state:', e);
      } finally {
        if (isMounted) setIsHydrated(true);
      }
    };

    hydrate();
    return () => {
      isMounted = false;
    };
  }, [refreshFromRepositories, workspace.id]);

  // Persist State Cache
  useEffect(() => {
    if (!isHydrated) return;
    try {
      const stateToSave = {
        productContext,
        customerSegments,
        feedbackList,
        themes,
        painPoints,
        insights,
        opportunities,
        decisions,
        roadmapItems,
        sources,
        importJobs
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }, [
    isHydrated,
    productContext,
    customerSegments,
    feedbackList,
    themes,
    painPoints,
    insights,
    opportunities,
    decisions,
    roadmapItems,
    sources,
    importJobs
  ]);

  const updateProductContext = (newContext: Partial<ProductContext>) => {
    setProductContext(prev => {
      const updated = {
        ...prev,
        ...newContext,
        updatedAt: new Date().toISOString()
      };
      if (isSupabaseConfigured() && supabase) {
        supabase.from('product_context').upsert({
          workspace_id: workspace.id,
          company_goals: updated.companyGoals,
          target_segments: updated.targetSegments,
          strategic_focus_areas: updated.strategicFocusAreas,
          known_constraints: updated.knownConstraints,
          updated_at: updated.updatedAt
        }).then(({ error }) => {
          if (error) console.warn('[Store] Supabase product_context update error:', error);
        });
      }
      return updated;
    });
  };

  const addCompanyGoal = (goal: { goal: string; priority: 'high' | 'medium' | 'low' }) => {
    if (!goal.goal.trim()) return;
    const newGoal = {
      id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      goal: goal.goal.trim(),
      priority: goal.priority
    };
    setProductContext(prev => {
      const updated = {
        ...prev,
        companyGoals: [...prev.companyGoals, newGoal],
        updatedAt: new Date().toISOString()
      };
      if (isSupabaseConfigured() && supabase) {
        supabase.from('product_context').upsert({
          workspace_id: workspace.id,
          company_goals: updated.companyGoals,
          target_segments: updated.targetSegments,
          strategic_focus_areas: updated.strategicFocusAreas,
          known_constraints: updated.knownConstraints,
          updated_at: updated.updatedAt
        });
      }
      return updated;
    });
  };

  const deleteCompanyGoal = (id: string) => {
    setProductContext(prev => {
      const updated = {
        ...prev,
        companyGoals: prev.companyGoals.filter(g => g.id !== id),
        updatedAt: new Date().toISOString()
      };
      if (isSupabaseConfigured() && supabase) {
        supabase.from('product_context').upsert({
          workspace_id: workspace.id,
          company_goals: updated.companyGoals,
          target_segments: updated.targetSegments,
          strategic_focus_areas: updated.strategicFocusAreas,
          known_constraints: updated.knownConstraints,
          updated_at: updated.updatedAt
        });
      }
      return updated;
    });
  };

  const addCustomerSegment = (segment: { name: string; description?: string; strategicWeight: number }) => {
    if (!segment.name.trim()) return;
    const newSeg: CustomerSegment = {
      id: `seg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      workspaceId: workspace.id,
      name: segment.name.trim(),
      description: segment.description?.trim() || 'Custom strategic tier',
      strategicWeight: segment.strategicWeight || 1.0
    };
    setCustomerSegments(prev => {
      const updated = [...prev, newSeg];
      if (isSupabaseConfigured() && supabase) {
        supabase.from('customer_segments').upsert({
          id: newSeg.id,
          workspace_id: newSeg.workspaceId,
          name: newSeg.name,
          description: newSeg.description,
          strategic_weight: newSeg.strategicWeight
        });
      }
      return updated;
    });
  };

  const updateCustomerSegment = (id: string, updates: Partial<CustomerSegment>) => {
    setCustomerSegments(prev => {
      const updated = prev.map(s => (s.id === id ? { ...s, ...updates } : s));
      const target = updated.find(s => s.id === id);
      if (isSupabaseConfigured() && supabase && target) {
        supabase.from('customer_segments').upsert({
          id: target.id,
          workspace_id: target.workspaceId,
          name: target.name,
          description: target.description,
          strategic_weight: target.strategicWeight
        });
      }
      return updated;
    });
  };

  const deleteCustomerSegment = (id: string) => {
    setCustomerSegments(prev => prev.filter(s => s.id !== id));
    if (isSupabaseConfigured() && supabase) {
      supabase.from('customer_segments').delete().eq('id', id);
    }
  };


  /**
   * Ingestion Action:
   * 1. Persists raw canonical evidence to FeedbackRepo (Layer A)
   * 2. Registers Source & ImportJob
   * 3. Creates and runs ProcessingJob through ProcessingOrchestrator
   */
  const ingestCanonicalBatch = async (
    records: CanonicalFeedback[],
    sourceMeta: {
      name: string;
      type: SourceType;
      fileName?: string;
      fileSize?: number;
      importId?: string;
      validCount?: number;
      invalidCount?: number;
      duplicateCount?: number;
    }
  ) => {
    const timestamp = new Date().toISOString();
    const sourceId = records[0]?.sourceId || `src-${Date.now()}`;
    const importId = sourceMeta.importId || `imp-${Date.now()}`;

    // 1. Register/Update Source FIRST (foreign key target for imports & feedback)
    const newSource: FeedbackSource = {
      id: sourceId,
      workspaceId: workspace.id,
      type: sourceMeta.type,
      name: sourceMeta.name,
      status: 'active',
      lastSyncedAt: timestamp,
      recordCount: records.length
    };
    await FeedbackRepo.saveSource(newSource);

    // 2. Register & Persist Import Job Log (foreign key target for feedback & processing_jobs)
    const newImportJob: ImportJob = {
      id: importId,
      workspaceId: workspace.id,
      sourceId,
      status: (sourceMeta.invalidCount || 0) > 0 ? 'completed_with_warnings' : 'completed',
      fileName: sourceMeta.fileName || sourceMeta.name,
      fileType: sourceMeta.type,
      totalRows: records.length,
      acceptedRows: sourceMeta.validCount || records.length,
      rejectedRows: sourceMeta.invalidCount || 0,
      duplicateRows: sourceMeta.duplicateCount || 0,
      atomsExtracted: 0,
      startedAt: timestamp,
      completedAt: timestamp,
      createdAt: timestamp
    };
    await FeedbackRepo.saveImport(newImportJob);
    setImportJobs(prev => [newImportJob, ...prev]);

    // 3. Persist Evidence (Layer A - now satisfies source_id and import_id foreign keys!)
    await FeedbackRepo.saveCanonicalFeedback(records);

    // 4. Auto-discover segments from imported records
    let currentSegments = customerSegments;
    const newSegNames = new Set<string>();
    records.forEach(r => {
      const seg = r.segment || r.customer?.segment;
      if (seg && seg.trim()) newSegNames.add(seg.trim());
    });
    if (newSegNames.size > 0) {
      const existingNames = new Set(customerSegments.map(s => s.name.toLowerCase()));
      const additions: CustomerSegment[] = [];
      newSegNames.forEach(name => {
        if (!existingNames.has(name.toLowerCase())) {
          existingNames.add(name.toLowerCase());
          additions.push({
            id: `seg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            workspaceId: workspace.id,
            name,
            description: 'Discovered from imported evidence',
            strategicWeight: 1.0
          });
        }
      });
      if (additions.length > 0) {
        currentSegments = [...customerSegments, ...additions];
        setCustomerSegments(currentSegments);
      }
    }

    // 5. Create and execute durable processing job through Orchestrator
    const job = await ProcessingOrchestrator.createJob({
      workspaceId: workspace.id,
      importId,
      totalRecords: records.length,
      type: 'import'
    });

    await ProcessingOrchestrator.executeJob(job.id, productContext, currentSegments);
    await refreshFromRepositories();
  };


  const recordDecision = async (
    opportunityId: string,
    decision: DecisionType,
    rationale: string,
    alternativeTitle?: string,
    targetPeriod?: string
  ) => {
    const opp = opportunities.find(o => o.id === opportunityId);
    if (!opp) return;

    const timestamp = new Date().toISOString();
    const newDecision: ProductDecision = {
      id: `dec-${Date.now()}`,
      workspaceId: workspace.id,
      opportunityId: opp.id,
      opportunityTitle: opp.title,
      title: `${decision === 'accepted' ? 'Accepted & Committed' : 'Deferred'}: ${opp.title}`,
      decision,
      rationale,
      evidenceSnapshot: {
        mentionCount: opp.evidenceCount,
        severity: opp.scoreSeverity > 75 ? 'critical' : opp.scoreSeverity > 50 ? 'high' : 'medium',
        affectedSegments: opp.targetSegments,
        sampleQuotes: ['Preserved in decision audit snapshot.'],
        scoreAtDecisionTime: opp.overallPriorityScore
      },
      alternativePrioritizedTitle: alternativeTitle,
      decidedBy: 'Product Lead',
      decidedAt: timestamp
    };

    await DecisionsRepo.saveDecision(newDecision);
    await DecisionsRepo.updateOpportunityStatus(opportunityId, decision === 'accepted' ? 'accepted' : 'rejected');

    if (decision === 'accepted') {
      const newRoadmapItem: RoadmapItem = {
        id: `rd-${Date.now()}`,
        workspaceId: workspace.id,
        opportunityId: opp.id,
        decisionId: newDecision.id,
        title: opp.title,
        status: 'planned',
        targetPeriod: targetPeriod || 'Q3 2026',
        priority: opp.overallPriorityScore >= 80 ? 'P0' : 'P1',
        evidenceCount: opp.evidenceCount,
        topQuotes: ['Directly derived from customer evidence trace in Trace.'],
        createdAt: timestamp,
        updatedAt: timestamp
      };
      await DecisionsRepo.saveRoadmapItem(newRoadmapItem);
    }

    await refreshFromRepositories();
  };

  const updateOpportunityStatus = async (opportunityId: string, status: OpportunityStatus) => {
    await DecisionsRepo.updateOpportunityStatus(opportunityId, status);
    await refreshFromRepositories();
  };

  const updateRoadmapItemStatus = async (roadmapId: string, newStatus: RoadmapStatus) => {
    await DecisionsRepo.updateRoadmapItemStatus(roadmapId, newStatus);
    await refreshFromRepositories();
  };

  const deleteRoadmapItem = async (roadmapId: string) => {
    await DecisionsRepo.deleteRoadmapItem(roadmapId);
    await refreshFromRepositories();
  };

  const reprocessImport = async (importId: string) => {
    setIsProcessing(true);
    try {
      const records = feedbackList.filter(f => f.importId === importId || f.sourceId === importId);
      const job = await ProcessingOrchestrator.createJob({
        workspaceId: workspace.id,
        importId,
        totalRecords: records.length || feedbackList.length,
        type: 'reprocess'
      });
      await ProcessingOrchestrator.executeJob(job.id);
      await refreshFromRepositories();
    } catch (e) {
      console.error('Reprocess import failed:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearWorkspaceData = async () => {
    await Promise.all([
      FeedbackRepo.clearWorkspace(workspace.id),
      IntelligenceRepo.clearWorkspace(workspace.id),
      DecisionsRepo.clearWorkspace(workspace.id),
      ProcessingJobRepo.clearWorkspace(workspace.id)
    ]);

    setFeedbackList([]);
    setThemes([]);
    setPainPoints([]);
    setInsights([]);
    setOpportunities([]);
    setDecisions([]);
    setRoadmapItems([]);
    setSources([]);
    setImportJobs([]);
    setCustomerSegments([]);
    setProductContext(prev => ({
      ...prev,
      companyGoals: [],
      targetSegments: []
    }));
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <TraceStoreContext.Provider
      value={{
        workspace,
        productContext,
        updateProductContext,
        addCompanyGoal,
        deleteCompanyGoal,
        customerSegments,
        addCustomerSegment,
        updateCustomerSegment,
        deleteCustomerSegment,
        sources,
        importJobs,
        feedbackList,
        themes,
        painPoints,
        insights,
        opportunities,
        decisions,
        roadmapItems,
        activeJob,
        activeStage,
        isProcessing,
        ingestCanonicalBatch,
        reprocessImport,
        recordDecision,
        updateOpportunityStatus,
        updateRoadmapItemStatus,
        deleteRoadmapItem,
        synthesizeIntelligence,
        clearWorkspaceData
      }}
    >


      {children}
    </TraceStoreContext.Provider>
  );
}

export function useTraceStore() {
  const context = useContext(TraceStoreContext);
  if (!context) {
    throw new Error('useTraceStore must be used within a TraceStoreProvider');
  }
  return context;
}
