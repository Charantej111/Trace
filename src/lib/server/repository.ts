import {
  Feedback,
  FeedbackAtom,
  PainPoint,
  Insight,
  Opportunity,
  ProductDecision,
  RoadmapItem,
  ProductContext,
  CustomerSegment,
  FeedbackSource,
  DecisionType,
  RoadmapStatus,
  OpportunityStatus
} from '@/types/trace';
import {
  DB_CUSTOMER_SEGMENTS,
  DB_PRODUCT_CONTEXT,
  DB_SOURCES,
  DB_FEEDBACK,
  DB_PAIN_POINTS,
  DB_INSIGHTS,
  DB_OPPORTUNITIES,
  DB_DECISIONS,
  DB_ROADMAP,
  DB_TIMESERIES_DATA
} from './db-seed';

class TraceRepository {
  private feedback: Feedback[] = [...DB_FEEDBACK];
  private painPoints: PainPoint[] = [...DB_PAIN_POINTS];
  private insights: Insight[] = [...DB_INSIGHTS];
  private opportunities: Opportunity[] = [...DB_OPPORTUNITIES];
  private decisions: ProductDecision[] = [...DB_DECISIONS];
  private roadmap: RoadmapItem[] = [...DB_ROADMAP];
  private sources: FeedbackSource[] = [...DB_SOURCES];
  private context: ProductContext = { ...DB_PRODUCT_CONTEXT };
  private segments: CustomerSegment[] = [...DB_CUSTOMER_SEGMENTS];

  // Feedback Queries
  getFeedback(params?: {
    search?: string;
    source?: string;
    segment?: string;
    sentiment?: string;
    severity?: string;
    limit?: number;
    offset?: number;
  }) {
    let result = [...this.feedback];

    if (params?.search?.trim()) {
      const q = params.search.toLowerCase();
      result = result.filter(
        f =>
          f.originalText.toLowerCase().includes(q) ||
          f.customerName?.toLowerCase().includes(q) ||
          f.atoms?.some(a => a.atomText.toLowerCase().includes(q))
      );
    }

    if (params?.source && params.source !== 'all') {
      result = result.filter(f => f.sourceType === params.source);
    }

    if (params?.segment && params.segment !== 'all') {
      result = result.filter(
        f => f.customerSegmentId === params.segment || f.customerSegmentName === params.segment
      );
    }

    if (params?.sentiment && params.sentiment !== 'all') {
      result = result.filter(f => f.atoms?.some(a => a.sentiment === params.sentiment));
    }

    if (params?.severity && params.severity !== 'all') {
      result = result.filter(f => f.atoms?.some(a => a.severity === params.severity));
    }

    const total = result.length;
    const offset = params?.offset || 0;
    const limit = params?.limit || 50;
    const paginated = result.slice(offset, offset + limit);

    return {
      items: paginated,
      total,
      hasMore: offset + limit < total
    };
  }

  // Add new feedback batch with span atomization
  addFeedbackBatch(newRecords: Partial<Feedback>[], sourceName = 'Custom Upload') {
    const timestamp = new Date().toISOString();
    const created: Feedback[] = newRecords.map((rec, idx) => {
      const fbId = `fb-${Date.now()}-${idx}`;
      const text = rec.originalText || '';

      // Decompose sentences into atoms with exact character offsets
      const clauses = text.split(/(?<=[.!?])\s+|,\s+and\s+|,\s+but\s+/).filter(c => c.trim().length > 3);
      const atoms: FeedbackAtom[] = clauses.length > 0 ? clauses.map((clause, cIdx) => {
        const start = text.indexOf(clause);
        const end = start >= 0 ? start + clause.length : clause.length;
        const isRequest = /add|support|want|please|need|feature|request/i.test(clause);
        const isBug = /crash|freeze|error|bug|broken|failed|timeout|slow/i.test(clause);

        return {
          id: `atom-${fbId}-${cIdx}`,
          workspaceId: 'ws-prod',
          feedbackId: fbId,
          atomText: clause.trim(),
          sourceStart: Math.max(0, start),
          sourceEnd: Math.max(0, end),
          intent: isBug ? 'bug_report' : isRequest ? 'feature_request' : 'complaint',
          sentiment: isBug ? 'negative' : isRequest ? 'neutral' : 'negative',
          sentimentScore: isBug ? -0.88 : isRequest ? 0 : -0.5,
          severity: isBug ? 'high' : 'medium',
          isFeatureRequest: isRequest,
          underlyingProblemHint: isRequest ? `Customer struggle in: "${clause.trim().slice(0, 45)}..."` : undefined,
          confidence: 'high',
          themeName: isBug ? 'Stability & Error Recovery' : 'Product Usability',
          createdAt: timestamp
        };
      }) : [
        {
          id: `atom-${fbId}-0`,
          workspaceId: 'ws-prod',
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
        workspaceId: 'ws-prod',
        sourceType: rec.sourceType || 'csv',
        originalText: text,
        sourceCreatedAt: rec.sourceCreatedAt || timestamp,
        importedAt: timestamp,
        customerName: rec.customerName || 'Anonymous Account',
        customerSegmentName: rec.customerSegmentName || 'SMB',
        customerSegmentId: rec.customerSegmentId || 'seg-smb',
        rating: rec.rating || 3,
        appVersion: rec.appVersion || 'v4.13.0',
        deviceInfo: rec.deviceInfo || 'Web App',
        fingerprint: `fp-${Date.now()}-${idx}`,
        atoms
      };
    });

    this.feedback = [...created, ...this.feedback];

    this.sources = [
      {
        id: `src-${Date.now()}`,
        workspaceId: 'ws-prod',
        type: 'csv',
        name: sourceName,
        status: 'active',
        lastSyncedAt: timestamp,
        recordCount: newRecords.length
      },
      ...this.sources
    ];

    return { insertedCount: created.length };
  }

  // Telemetry Timeseries data for Recharts
  getTimeseriesTelemetry() {
    return DB_TIMESERIES_DATA;
  }

  // Insights Queries
  getPainPoints() {
    return this.painPoints;
  }

  getInsights() {
    return this.insights;
  }

  // Opportunities Queries & Mutation
  getOpportunities() {
    return this.opportunities;
  }

  updateOpportunityStatus(id: string, status: OpportunityStatus) {
    this.opportunities = this.opportunities.map(o => (o.id === id ? { ...o, status } : o));
    return this.opportunities.find(o => o.id === id);
  }

  // Decision Recording
  recordDecision(params: {
    opportunityId: string;
    decision: DecisionType;
    rationale: string;
    alternativeTitle?: string;
  }) {
    const opp = this.opportunities.find(o => o.id === params.opportunityId);
    if (!opp) throw new Error('Opportunity not found');

    const timestamp = new Date().toISOString();
    const newDecision: ProductDecision = {
      id: `dec-${Date.now()}`,
      workspaceId: 'ws-prod',
      opportunityId: opp.id,
      opportunityTitle: opp.title,
      title: `${params.decision === 'accepted' ? 'Accepted & Committed' : 'Deferred (Won\'t Do)'}: ${opp.title}`,
      decision: params.decision,
      rationale: params.rationale,
      evidenceSnapshot: {
        mentionCount: opp.evidenceCount,
        severity: opp.scoreSeverity > 80 ? 'critical' : opp.scoreSeverity > 50 ? 'high' : 'medium',
        affectedSegments: opp.targetSegments,
        sampleQuotes: ['Preserved customer quote snapshot from Trace repository.'],
        scoreAtDecisionTime: opp.overallPriorityScore
      },
      alternativePrioritizedTitle: params.alternativeTitle,
      decidedBy: 'Principal Product Manager',
      decidedAt: timestamp
    };

    this.decisions = [newDecision, ...this.decisions];

    // Update opportunity status
    this.opportunities = this.opportunities.map(o =>
      o.id === opp.id ? { ...o, status: params.decision === 'accepted' ? 'accepted' : 'rejected' } : o
    );

    // If accepted, add to Roadmap
    if (params.decision === 'accepted') {
      const newRoadmapItem: RoadmapItem = {
        id: `rd-${Date.now()}`,
        workspaceId: 'ws-prod',
        opportunityId: opp.id,
        decisionId: newDecision.id,
        title: opp.title,
        description: opp.suggestedSolution || opp.opportunityStatement,
        status: 'planned',
        targetPeriod: 'Upcoming Sprint',
        priority: opp.overallPriorityScore > 85 ? 'P0' : opp.overallPriorityScore > 70 ? 'P1' : 'P2',
        evidenceCount: opp.evidenceCount,
        topQuotes: [`Customer Struggle: ${opp.problemStatement}`],
        createdAt: timestamp,
        updatedAt: timestamp
      };
      this.roadmap = [newRoadmapItem, ...this.roadmap];
    }

    return newDecision;
  }

  getDecisions() {
    return this.decisions;
  }

  // Roadmap Queries & Stage Mutation
  getRoadmap() {
    return this.roadmap;
  }

  updateRoadmapStage(id: string, status: RoadmapStatus) {
    this.roadmap = this.roadmap.map(item =>
      item.id === id
        ? {
            ...item,
            status,
            updatedAt: new Date().toISOString(),
            shippedAt: status === 'shipped' ? new Date().toISOString() : item.shippedAt
          }
        : item
    );
    return this.roadmap.find(item => item.id === id);
  }

  // Sources & Context
  getSources() {
    return this.sources;
  }

  getProductContext() {
    return this.context;
  }

  updateProductContext(update: Partial<ProductContext>) {
    this.context = {
      ...this.context,
      ...update,
      updatedAt: new Date().toISOString()
    };
    return this.context;
  }

  getCustomerSegments() {
    return this.segments;
  }

  resetAll() {
    this.feedback = [...DB_FEEDBACK];
    this.painPoints = [...DB_PAIN_POINTS];
    this.insights = [...DB_INSIGHTS];
    this.opportunities = [...DB_OPPORTUNITIES];
    this.decisions = [...DB_DECISIONS];
    this.roadmap = [...DB_ROADMAP];
    this.sources = [...DB_SOURCES];
    this.context = { ...DB_PRODUCT_CONTEXT };
    this.segments = [...DB_CUSTOMER_SEGMENTS];
  }
}

// Global Singleton
export const traceRepo = new TraceRepository();
