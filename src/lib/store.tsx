import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Workspace,
  ProductContext,
  CustomerSegment,
  FeedbackSource,
  Feedback,
  FeedbackAtom,
  Theme,
  PainPoint,
  Insight,
  Opportunity,
  ProductDecision,
  RoadmapItem,
  DecisionType,
  RoadmapStatus,
  OpportunityStatus
} from '@/types/trace';
import {
  INITIAL_WORKSPACE,
  INITIAL_PRODUCT_CONTEXT,
  INITIAL_CUSTOMER_SEGMENTS,
  INITIAL_SOURCES,
  INITIAL_FEEDBACK,
  INITIAL_THEMES,
  INITIAL_PAIN_POINTS,
  INITIAL_INSIGHTS,
  INITIAL_OPPORTUNITIES,
  INITIAL_DECISIONS,
  INITIAL_ROADMAP
} from './mock-data';

interface TraceStoreContextType {
  workspace: Workspace;
  productContext: ProductContext;
  updateProductContext: (newContext: Partial<ProductContext>) => void;
  customerSegments: CustomerSegment[];
  sources: FeedbackSource[];
  feedbackList: Feedback[];
  themes: Theme[];
  painPoints: PainPoint[];
  insights: Insight[];
  opportunities: Opportunity[];
  decisions: ProductDecision[];
  roadmapItems: RoadmapItem[];
  
  // Actions
  addFeedbackBatch: (newRecords: Partial<Feedback>[], sourceName?: string) => void;
  recordDecision: (opportunityId: string, decision: DecisionType, rationale: string, alternativeTitle?: string) => void;
  updateOpportunityStatus: (opportunityId: string, status: OpportunityStatus) => void;
  updateRoadmapItemStatus: (roadmapId: string, newStatus: RoadmapStatus) => void;
  addOpportunity: (opportunity: Omit<Opportunity, 'id' | 'createdAt' | 'overallPriorityScore'>) => void;
  resetToDemoData: () => void;
}

const TraceStoreContext = createContext<TraceStoreContextType | null>(null);

const STORAGE_KEY = 'trace_platform_state_v2';

export function TraceStoreProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [workspace] = useState<Workspace>(INITIAL_WORKSPACE);
  const [productContext, setProductContext] = useState<ProductContext>(INITIAL_PRODUCT_CONTEXT);
  const [customerSegments] = useState<CustomerSegment[]>(INITIAL_CUSTOMER_SEGMENTS);
  const [sources, setSources] = useState<FeedbackSource[]>(INITIAL_SOURCES);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>(INITIAL_FEEDBACK);
  const [themes, setThemes] = useState<Theme[]>(INITIAL_THEMES);
  const [painPoints, setPainPoints] = useState<PainPoint[]>(INITIAL_PAIN_POINTS);
  const [insights, setInsights] = useState<Insight[]>(INITIAL_INSIGHTS);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(INITIAL_OPPORTUNITIES);
  const [decisions, setDecisions] = useState<ProductDecision[]>(INITIAL_DECISIONS);
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>(INITIAL_ROADMAP);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.productContext) setProductContext(parsed.productContext);
        if (parsed.feedbackList) setFeedbackList(parsed.feedbackList);
        if (parsed.themes) setThemes(parsed.themes);
        if (parsed.painPoints) setPainPoints(parsed.painPoints);
        if (parsed.insights) setInsights(parsed.insights);
        if (parsed.opportunities) setOpportunities(parsed.opportunities);
        if (parsed.decisions) setDecisions(parsed.decisions);
        if (parsed.roadmapItems) setRoadmapItems(parsed.roadmapItems);
        if (parsed.sources) setSources(parsed.sources);
      }
    } catch (e) {
      console.error('Error loading stored state:', e);
    }
    setIsHydrated(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (!isHydrated) return;
    try {
      const stateToSave = {
        productContext,
        feedbackList,
        themes,
        painPoints,
        insights,
        opportunities,
        decisions,
        roadmapItems,
        sources
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }, [
    isHydrated,
    productContext,
    feedbackList,
    themes,
    painPoints,
    insights,
    opportunities,
    decisions,
    roadmapItems,
    sources
  ]);

  const updateProductContext = (newContext: Partial<ProductContext>) => {
    setProductContext(prev => ({
      ...prev,
      ...newContext,
      updatedAt: new Date().toISOString()
    }));
  };

  const addFeedbackBatch = (newRecords: Partial<Feedback>[], sourceName = 'Custom Upload') => {
    const timestamp = new Date().toISOString();
    const createdFeedback: Feedback[] = newRecords.map((rec, index) => {
      const fbId = `fb-gen-${Date.now()}-${index}`;
      const text = rec.originalText || '';
      
      // Automatic Atomization for demo import
      const clauses = text.split(/(?<=[.!?])\s+|,\s+and\s+|,\s+but\s+/).filter(c => c.trim().length > 5);
      const atoms: FeedbackAtom[] = clauses.length > 0 ? clauses.map((clause, cIdx) => {
        const start = text.indexOf(clause);
        const end = start >= 0 ? start + clause.length : clause.length;
        const isRequest = /add|support|want|please|need|feature|request/i.test(clause);
        const isBug = /crash|freeze|error|bug|broken|failed|timeout|slow/i.test(clause);
        
        return {
          id: `atom-${fbId}-${cIdx}`,
          workspaceId: workspace.id,
          feedbackId: fbId,
          atomText: clause.trim(),
          sourceStart: Math.max(0, start),
          sourceEnd: Math.max(0, end),
          intent: isBug ? 'bug_report' : isRequest ? 'feature_request' : 'complaint',
          sentiment: isBug ? 'negative' : isRequest ? 'neutral' : 'negative',
          sentimentScore: isBug ? -0.85 : isRequest ? 0 : -0.5,
          severity: isBug ? 'high' : 'medium',
          isFeatureRequest: isRequest,
          underlyingProblemHint: isRequest ? `Customer friction in: "${clause.trim().slice(0, 40)}..."` : undefined,
          confidence: 'high',
          themeName: isBug ? 'Stability & Error Recovery' : 'Product Usability',
          createdAt: timestamp
        };
      }) : [
        {
          id: `atom-${fbId}-0`,
          workspaceId: workspace.id,
          feedbackId: fbId,
          atomText: text,
          sourceStart: 0,
          sourceEnd: text.length,
          intent: 'complaint',
          sentiment: 'negative',
          sentimentScore: -0.6,
          severity: 'medium',
          isFeatureRequest: false,
          confidence: 'medium',
          createdAt: timestamp
        }
      ];

      return {
        id: fbId,
        workspaceId: workspace.id,
        sourceType: rec.sourceType || 'csv',
        originalText: text,
        sourceCreatedAt: rec.sourceCreatedAt || timestamp,
        importedAt: timestamp,
        customerName: rec.customerName || 'Anonymous Customer',
        customerSegmentName: rec.customerSegmentName || 'SMB',
        customerSegmentId: rec.customerSegmentId || 'seg-smb',
        rating: rec.rating || 3,
        appVersion: rec.appVersion || 'v4.13.0',
        deviceInfo: rec.deviceInfo || 'Web App',
        fingerprint: `fp-${Date.now()}-${index}`,
        atoms
      };
    });

    setFeedbackList(prev => [...createdFeedback, ...prev]);

    // Register Source
    setSources(prev => [
      {
        id: `src-custom-${Date.now()}`,
        workspaceId: workspace.id,
        type: 'csv',
        name: sourceName,
        status: 'active',
        lastSyncedAt: timestamp,
        recordCount: newRecords.length
      },
      ...prev
    ]);
  };

  const recordDecision = (
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
      title: `${decision === 'accepted' ? 'Accepted & Committed' : 'Deferred/Rejected'}: ${opp.title}`,
      decision,
      rationale,
      evidenceSnapshot: {
        mentionCount: opp.evidenceCount,
        severity: opp.scoreSeverity > 80 ? 'critical' : opp.scoreSeverity > 50 ? 'high' : 'medium',
        affectedSegments: opp.targetSegments,
        sampleQuotes: ['Directly derived from customer evidence trace in Trace.'],
        scoreAtDecisionTime: opp.overallPriorityScore
      },
      alternativePrioritizedTitle: alternativeTitle,
      decidedBy: 'Product Lead',
      decidedAt: timestamp
    };

    setDecisions(prev => [newDecision, ...prev]);

    // Update opportunity status
    setOpportunities(prev =>
      prev.map(o => (o.id === opportunityId ? { ...o, status: decision === 'accepted' ? 'accepted' : 'rejected' } : o))
    );

    // If accepted, add to Roadmap Kanban
    if (decision === 'accepted') {
      const newRoadmapItem: RoadmapItem = {
        id: `rd-${Date.now()}`,
        workspaceId: workspace.id,
        opportunityId: opp.id,
        decisionId: newDecision.id,
        title: opp.title,
        description: opp.suggestedSolution || opp.opportunityStatement,
        status: 'planned',
        targetPeriod: 'Upcoming Sprint',
        priority: opp.overallPriorityScore > 85 ? 'P0' : opp.overallPriorityScore > 70 ? 'P1' : 'P2',
        evidenceCount: opp.evidenceCount,
        topQuotes: [`Customer Problem: ${opp.problemStatement}`],
        createdAt: timestamp,
        updatedAt: timestamp
      };
      setRoadmapItems(prev => [newRoadmapItem, ...prev]);
    }
  };

  const updateOpportunityStatus = (opportunityId: string, status: OpportunityStatus) => {
    setOpportunities(prev =>
      prev.map(o => (o.id === opportunityId ? { ...o, status } : o))
    );
  };

  const updateRoadmapItemStatus = (roadmapId: string, newStatus: RoadmapStatus) => {
    setRoadmapItems(prev =>
      prev.map(item =>
        item.id === roadmapId
          ? {
              ...item,
              status: newStatus,
              updatedAt: new Date().toISOString(),
              shippedAt: newStatus === 'shipped' ? new Date().toISOString() : item.shippedAt
            }
          : item
      )
    );
  };

  const addOpportunity = (oppData: Omit<Opportunity, 'id' | 'createdAt' | 'overallPriorityScore'>) => {
    const overallScore = Number(
      (
        oppData.scoreFrequency * 0.2 +
        oppData.scoreSeverity * 0.2 +
        oppData.scoreTrend * 0.15 +
        oppData.scoreSegmentImpact * 0.15 +
        oppData.scoreStrategicRelevance * 0.15 +
        oppData.scoreEvidenceQuality * 0.15
      ).toFixed(1)
    );

    const newOpp: Opportunity = {
      ...oppData,
      id: `opp-${Date.now()}`,
      overallPriorityScore: overallScore,
      createdAt: new Date().toISOString()
    };

    setOpportunities(prev => [newOpp, ...prev]);
  };

  const resetToDemoData = () => {
    setProductContext(INITIAL_PRODUCT_CONTEXT);
    setSources(INITIAL_SOURCES);
    setFeedbackList(INITIAL_FEEDBACK);
    setThemes(INITIAL_THEMES);
    setPainPoints(INITIAL_PAIN_POINTS);
    setInsights(INITIAL_INSIGHTS);
    setOpportunities(INITIAL_OPPORTUNITIES);
    setDecisions(INITIAL_DECISIONS);
    setRoadmapItems(INITIAL_ROADMAP);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <TraceStoreContext.Provider
      value={{
        workspace,
        productContext,
        updateProductContext,
        customerSegments,
        sources,
        feedbackList,
        themes,
        painPoints,
        insights,
        opportunities,
        decisions,
        roadmapItems,
        addFeedbackBatch,
        recordDecision,
        updateOpportunityStatus,
        updateRoadmapItemStatus,
        addOpportunity,
        resetToDemoData
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
