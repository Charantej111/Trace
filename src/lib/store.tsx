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
  INITIAL_CUSTOMER_SEGMENTS,
  RAW_SAMPLE_DATASET
} from './mock-data';
import { FeedbackRepo } from '@/repositories/feedback-repo';
import { IntelligenceRepo } from '@/repositories/intelligence-repo';
import { DecisionsRepo } from '@/repositories/decisions-repo';
import { ProcessingJobRepo } from '@/repositories/processing-job-repo';
import { ProcessingOrchestrator } from '@/processing/orchestrator';
import { NormalizationEngine } from '@/evidence/normalization/engine';

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
  isDemoMode: boolean;


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
  recordDecision: (opportunityId: string, decision: DecisionType, rationale: string, alternativeTitle?: string) => Promise<void>;
  updateOpportunityStatus: (opportunityId: string, status: OpportunityStatus) => Promise<void>;
  updateRoadmapItemStatus: (roadmapId: string, newStatus: RoadmapStatus) => Promise<void>;
  resetToDemoData: () => Promise<void>;
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
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  // Active Job Execution state
  const [activeJob, setActiveJob] = useState<ProcessingJob | null>(null);
  const [activeStage, setActiveStage] = useState<ProcessingJobStage | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Data Loading / Refresh
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

  // Hydration from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.productContext) setProductContext(parsed.productContext);
        if (parsed.customerSegments) setCustomerSegments(parsed.customerSegments);
        if (parsed.isDemoMode !== undefined) setIsDemoMode(parsed.isDemoMode);
        if (parsed.importJobs) setImportJobs(parsed.importJobs);

        if (parsed.feedbackList) {
          FeedbackRepo.saveCanonicalFeedback(parsed.feedbackList);
          if (parsed.atoms) FeedbackRepo.saveAtoms(parsed.atoms);
          if (parsed.themes) IntelligenceRepo.saveThemes(parsed.themes);
          if (parsed.painPoints) IntelligenceRepo.savePainPoints(parsed.painPoints);
          if (parsed.insights) IntelligenceRepo.saveInsights(parsed.insights);
          if (parsed.opportunities) DecisionsRepo.saveOpportunities(parsed.opportunities);
          if (parsed.decisions) parsed.decisions.forEach((d: ProductDecision) => DecisionsRepo.saveDecision(d));
          if (parsed.roadmapItems) parsed.roadmapItems.forEach((r: RoadmapItem) => DecisionsRepo.saveRoadmapItem(r));
          if (parsed.sources) parsed.sources.forEach((s: FeedbackSource) => FeedbackRepo.saveSource(s));
          refreshFromRepositories();
        }
      }
    } catch (e) {
      console.error('Error loading stored state:', e);
    }
    setIsHydrated(true);
  }, [refreshFromRepositories]);

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
        importJobs,
        isDemoMode
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
    importJobs,
    isDemoMode
  ]);

  const updateProductContext = (newContext: Partial<ProductContext>) => {
    setProductContext(prev => ({
      ...prev,
      ...newContext,
      updatedAt: new Date().toISOString()
    }));
  };

  const addCompanyGoal = (goal: { goal: string; priority: 'high' | 'medium' | 'low' }) => {
    if (!goal.goal.trim()) return;
    const newGoal = {
      id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      goal: goal.goal.trim(),
      priority: goal.priority
    };
    setProductContext(prev => ({
      ...prev,
      companyGoals: [...prev.companyGoals, newGoal],
      updatedAt: new Date().toISOString()
    }));
  };

  const deleteCompanyGoal = (id: string) => {
    setProductContext(prev => ({
      ...prev,
      companyGoals: prev.companyGoals.filter(g => g.id !== id),
      updatedAt: new Date().toISOString()
    }));
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
    setCustomerSegments(prev => [...prev, newSeg]);
  };

  const updateCustomerSegment = (id: string, updates: Partial<CustomerSegment>) => {
    setCustomerSegments(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteCustomerSegment = (id: string) => {
    setCustomerSegments(prev => prev.filter(s => s.id !== id));
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

    // 1. Persist Evidence First (Layer A)
    await FeedbackRepo.saveCanonicalFeedback(records);

    // 2. Register/Update Source
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

    // 3. Auto-discover segments from imported records
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

    // 4. Register Import Job Log
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
    setImportJobs(prev => [newImportJob, ...prev]);
    setIsDemoMode(false);

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
    alternativeTitle?: string
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
        targetPeriod: 'Q3 2026',
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

  /**
   * Reset / Load Sample Data:
   * Ingests RAW realistic customer feedback and executes the real processing engine
   * so intelligence is generated dynamically from evidence (Zero mock intelligence).
   */
  const resetToDemoData = async () => {
    await clearWorkspaceData();
    setIsDemoMode(true);

    const now = Date.now();
    const rows = RAW_SAMPLE_DATASET.map((item, idx) => ({
      rowIndex: idx + 1,
      data: {
        text: item.text,
        customerName: item.customerName,
        segment: item.customerSegment,
        rating: item.rating,
        createdAt: new Date(now - item.dateOffsetDays * 24 * 60 * 60 * 1000).toISOString()
      },
      sourceLocation: {
        fileName: 'demo-sample-feedback.csv',
        rowIndex: idx + 1
      }
    }));

    const mappings = {
      text: 'text',
      customerName: 'customerName',
      customerEmail: null,
      externalId: null,
      createdAt: 'createdAt',
      rating: 'rating',
      segment: 'segment',
      language: null,
      productArea: null
    };

    const normalized = NormalizationEngine.normalizeBatch(rows, mappings, {
      workspaceId: workspace.id,
      sourceId: 'src-sample-demo',
      importId: 'imp-sample-demo',
      sourceType: 'csv',
      fileName: 'demo-sample-feedback.csv'
    });

    await ingestCanonicalBatch(normalized.records, {
      name: 'Sample Customer Dataset',
      type: 'csv',
      fileName: 'demo-sample-feedback.csv',
      importId: 'imp-sample-demo',
      validCount: normalized.validCount,
      invalidCount: normalized.invalidCount,
      duplicateCount: normalized.duplicateCount
    });
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
    setIsDemoMode(false);
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
        isDemoMode,
        activeJob,
        activeStage,
        isProcessing,
        ingestCanonicalBatch,
        reprocessImport,
        recordDecision,
        updateOpportunityStatus,
        updateRoadmapItemStatus,
        resetToDemoData,
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
