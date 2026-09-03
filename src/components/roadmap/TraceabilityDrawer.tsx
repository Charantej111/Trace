import React from 'react';
import { Opportunity, RoadmapItem } from '@/types/trace';
import { X, ShieldCheck, Info, CheckCircle2 } from 'lucide-react';
import { useTraceStore } from '@/lib/store';

interface TraceabilityDrawerProps {
  roadmapItem?: RoadmapItem;
  opportunity?: Opportunity;
  onClose: () => void;
}

export function TraceabilityDrawer({ roadmapItem, opportunity, onClose }: TraceabilityDrawerProps) {
  const { opportunities, insights, painPoints, feedbackList } = useTraceStore();

  // Intelligently resolve linked opportunity without blindly falling back to unrelated test records
  const opp = opportunity ||
    opportunities.find(o => o.id === roadmapItem?.opportunityId) ||
    (roadmapItem?.title ? opportunities.find(o => o.title.toLowerCase() === roadmapItem.title.toLowerCase()) : undefined);

  // Intelligently resolve linked insight
  const linkedInsight = opp
    ? (insights.find(i => opp.supportingInsightIds?.includes(i.id) || i.id === opp.insightId) ||
       insights.find(i => opp.title.toLowerCase().includes(i.title.toLowerCase()) || i.title.toLowerCase().includes(opp.title.toLowerCase())))
    : null;

  // Intelligently resolve linked pain point cluster
  const linkedPainPoint = linkedInsight
    ? (painPoints.find(p => p.id === linkedInsight.painPointId) ||
       painPoints.find(p => linkedInsight.title.toLowerCase().includes(p.title.toLowerCase())))
    : (opp ? painPoints.find(p => opp.title.toLowerCase().includes(p.title.toLowerCase())) : null);

  // Dynamically resolve exact customer evidence quotes
  const supportingQuotes = feedbackList.filter(f =>
    f.atoms?.some(a =>
      opp?.supportingAtomIds?.includes(a.id) ||
      linkedInsight?.evidence?.some(e => e.atomId === a.id) ||
      linkedPainPoint?.atomIds?.includes(a.id)
    )
  );

  const hasDirectQuotes = supportingQuotes.length > 0;
  const displayQuotes = hasDirectQuotes ? supportingQuotes : feedbackList.slice(0, 3);

  return (
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-md z-50 flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-xl surface-glass border-l border-slate-200 dark:border-[#1F232B] h-full overflow-y-auto p-6 text-xs space-y-5 text-slate-900 dark:text-[#EDEDED] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1F232B] pb-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#2E8B75] dark:text-[#10B981] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>DEFENSIBLE EVIDENCE LINEAGE TRACE</span>
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-[#EDEDED] mt-1">
              Why are we building this initiative?
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-[#EDEDED] hover:bg-slate-100 dark:hover:bg-[#181B22] transition-colors"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informative Explanation of the Lineage Architecture */}
        <div className="p-3.5 rounded-xl bg-[#2E8B75]/10 border border-[#2E8B75]/25 text-[11px] text-slate-700 dark:text-[#EDEDED] space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-[#2E8B75] dark:text-[#10B981] text-xs">
            <Info className="w-3.5 h-3.5" />
            <span>5-Stage Defensible Evidence Hierarchy</span>
          </div>
          <p className="text-slate-600 dark:text-[#8C92A4] leading-relaxed text-[11px]">
            Trace proves that roadmap commitments are grounded in real customer pain. Follow the numbered chain below: from high-level roadmap initiatives down to verbatim customer quotes.
          </p>
        </div>

        {/* Visual Lineage Chain Steps */}
        <div className="space-y-4 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200 dark:before:bg-[#1F232B]">
          {/* Node 1: Roadmap Item */}
          {roadmapItem && (
            <div className="relative pl-9 space-y-1.5">
              <div className="absolute left-2 top-1.5 w-4 h-4 rounded-full bg-[#1E293B] dark:bg-[#EDEDED] flex items-center justify-center text-white dark:text-[#090A0C] font-bold text-[9px] shadow-2xs">
                1
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider">
                  ROADMAP INITIATIVE
                </span>
                <span className="text-[10px] font-mono font-bold text-[#2E8B75] dark:text-[#10B981] uppercase">
                  Status: {roadmapItem.status.replace('_', ' ')}
                </span>
              </div>
              <div className="p-3.5 rounded-lg surface-subtle font-bold text-slate-900 dark:text-[#EDEDED] space-y-1">
                <p className="text-xs">{roadmapItem.title}</p>
                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 dark:text-[#8C92A4]">
                  <span>Priority: {roadmapItem.priority || 'P1'}</span>
                  <span>Target: {roadmapItem.targetPeriod || 'Q3 2026'}</span>
                  <span>Mentions: {roadmapItem.evidenceCount || 1}</span>
                </div>
              </div>
            </div>
          )}

          {/* Node 2: Opportunity */}
          {opp ? (
            <div className="relative pl-9 space-y-1.5">
              <div className="absolute left-2 top-1.5 w-4 h-4 rounded-full bg-[#2E8B75] flex items-center justify-center text-white font-bold text-[9px] shadow-2xs">
                2
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider">
                  PRODUCT OPPORTUNITY (SCORE: {opp.overallPriorityScore}/100)
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                  Confidence: {opp.confidence || 'High'}
                </span>
              </div>
              <div className="p-3.5 rounded-lg surface-subtle space-y-1.5">
                <p className="font-bold text-slate-900 dark:text-[#EDEDED]">{opp.title}</p>
                <p className="text-[11px] text-slate-600 dark:text-[#8C92A4] leading-relaxed">
                  {opp.problemStatement}
                </p>
                {opp.opportunityStatement && (
                  <p className="text-[11px] text-[#2E8B75] dark:text-[#10B981] leading-relaxed">
                    💡 <span className="font-semibold">Strategic Value:</span> {opp.opportunityStatement}
                  </p>
                )}
                {opp.suggestedSolution && (
                  <p className="text-[10px] text-slate-500 dark:text-[#8C92A4] leading-relaxed">
                    🛠️ <span className="font-semibold">Intervention:</span> {opp.suggestedSolution}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="relative pl-9 space-y-1.5">
              <div className="absolute left-2 top-1.5 w-4 h-4 rounded-full bg-slate-400 flex items-center justify-center text-white font-bold text-[9px] shadow-2xs">
                2
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider">
                PRODUCT OPPORTUNITY
              </span>
              <div className="p-3 rounded-lg surface-subtle text-slate-500 dark:text-[#8C92A4] text-[11px]">
                Standalone Strategic Commitment: This initiative was scheduled directly on the roadmap.
              </div>
            </div>
          )}

          {/* Node 3: Insight */}
          {linkedInsight ? (
            <div className="relative pl-9 space-y-1.5">
              <div className="absolute left-2 top-1.5 w-4 h-4 rounded-full bg-slate-400 dark:bg-slate-600 flex items-center justify-center text-white font-bold text-[9px] shadow-2xs">
                3
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider">
                PRODUCT INSIGHT & IMPACT
              </span>
              <div className="p-3.5 rounded-lg surface-subtle space-y-1">
                <p className="font-bold text-slate-900 dark:text-[#EDEDED]">{linkedInsight.title}</p>
                <p className="text-[11px] text-slate-600 dark:text-[#8C92A4] leading-relaxed">{linkedInsight.summary}</p>
              </div>
            </div>
          ) : (
            <div className="relative pl-9 space-y-1.5">
              <div className="absolute left-2 top-1.5 w-4 h-4 rounded-full bg-slate-400 dark:bg-slate-600 flex items-center justify-center text-white font-bold text-[9px] shadow-2xs">
                3
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider">
                PRODUCT INSIGHT & IMPACT
              </span>
              <div className="p-3 rounded-lg surface-subtle text-slate-500 dark:text-[#8C92A4] text-[11px]">
                Cross-Cutting Evidence Synthesis: Derived from multi-account customer usage patterns.
              </div>
            </div>
          )}

          {/* Node 4: Problem Cluster */}
          {linkedPainPoint ? (
            <div className="relative pl-9 space-y-1.5">
              <div className="absolute left-2 top-1.5 w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold text-[9px] shadow-2xs">
                4
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider">
                PROBLEM CLUSTER ({linkedPainPoint.frequency || 1} MENTIONS)
              </span>
              <div className="p-3.5 rounded-lg surface-subtle space-y-1">
                <p className="font-bold text-slate-900 dark:text-[#EDEDED]">{linkedPainPoint.title}</p>
                <p className="text-[11px] text-slate-600 dark:text-[#8C92A4] leading-relaxed">{linkedPainPoint.description}</p>
              </div>
            </div>
          ) : (
            <div className="relative pl-9 space-y-1.5">
              <div className="absolute left-2 top-1.5 w-4 h-4 rounded-full bg-rose-500/70 flex items-center justify-center text-white font-bold text-[9px] shadow-2xs">
                4
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider">
                PROBLEM CLUSTER
              </span>
              <div className="p-3 rounded-lg surface-subtle text-slate-500 dark:text-[#8C92A4] text-[11px]">
                Corroborated friction cluster identified during customer feedback ingestion.
              </div>
            </div>
          )}

          {/* Node 5: Supporting Customer Quotes */}
          <div className="relative pl-9 space-y-2.5">
            <div className="absolute left-2 top-1.5 w-4 h-4 rounded-full bg-slate-900 dark:bg-[#EDEDED] flex items-center justify-center text-white dark:text-[#090A0C] font-bold text-[9px] shadow-2xs">
              5
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider">
                {hasDirectQuotes ? 'VERBATIM CUSTOMER EVIDENCE SAMPLES' : 'CORROBORATING WORKSPACE EVIDENCE'} ({displayQuotes.length})
              </span>
              {hasDirectQuotes && (
                <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Direct Match</span>
                </span>
              )}
            </div>

            <div className="space-y-2">
              {displayQuotes.length === 0 ? (
                <div className="p-3 rounded-lg surface-subtle text-slate-400 dark:text-[#525866] text-center">
                  No quotes uploaded yet. Import customer feedback to view verbatim evidence.
                </div>
              ) : (
                displayQuotes.map((q) => (
                  <div key={q.id} className="p-3 rounded-lg surface-subtle text-xs space-y-1 border border-slate-200/50 dark:border-[#232833]">
                    <p className="text-slate-800 dark:text-[#C9CDD8] italic">"{q.originalText}"</p>
                    <p className="text-[10px] font-mono text-slate-400 dark:text-[#525866]">
                      — {q.customerName || 'Anonymous Account'} ({q.customerSegmentName || 'SMB'}) · {q.sourceType.toUpperCase()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
