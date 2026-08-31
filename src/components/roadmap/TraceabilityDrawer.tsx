import React from 'react';
import { Opportunity, RoadmapItem } from '@/types/trace';
import { X, ArrowDown, ShieldCheck, Quote, Layers, Target, CheckCircle2, ChevronRight } from 'lucide-react';
import { useTraceStore } from '@/lib/store';

interface TraceabilityDrawerProps {
  roadmapItem?: RoadmapItem;
  opportunity?: Opportunity;
  onClose: () => void;
}

export function TraceabilityDrawer({ roadmapItem, opportunity, onClose }: TraceabilityDrawerProps) {
  const { opportunities, insights, painPoints, feedbackList } = useTraceStore();

  const opp = opportunity || opportunities.find(o => o.id === roadmapItem?.opportunityId) || opportunities[0];
  const linkedInsight = insights.find(i => opp?.linkedInsightIds?.includes(i.id)) || insights[0];
  const linkedPainPoint = painPoints.find(p => p.id === linkedInsight?.painPointId) || painPoints[0];
  const supportingQuotes = feedbackList.slice(0, 4);

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-2xs z-50 flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-[#1E293B] border-l border-slate-200 dark:border-[#334155] h-full overflow-y-auto p-5 text-xs space-y-5 text-slate-900 dark:text-slate-100 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3.5">
          <div>
            <span className="text-[10px] font-mono font-bold text-[#2E8B75] dark:text-[#3B9B85] uppercase tracking-wider">
              EVIDENCE LINEAGE TRACE
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              Why are we building this initiative?
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#334155] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Lineage Chain Steps */}
        <div className="space-y-3 relative before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200 dark:before:bg-[#334155]">
          {/* Node 1: Roadmap Item */}
          {roadmapItem && (
            <div className="relative pl-8 space-y-1">
              <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-[#1E293B] dark:bg-[#F8FAFC] flex items-center justify-center text-white dark:text-[#0F172A] font-bold text-[9px]">
                1
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                ROADMAP INITIATIVE
              </span>
              <div className="p-3 rounded-md bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] font-semibold text-slate-900 dark:text-white">
                {roadmapItem.title}
              </div>
            </div>
          )}

          {/* Node 2: Opportunity */}
          {opp && (
            <div className="relative pl-8 space-y-1">
              <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-[#2E8B75] dark:bg-[#3B9B85] flex items-center justify-center text-white font-bold text-[9px]">
                2
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                PRODUCT OPPORTUNITY (SCORE: {opp.overallPriorityScore}/100)
              </span>
              <div className="p-3 rounded-md bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-1">
                <p className="font-semibold text-slate-900 dark:text-white">{opp.title}</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">{opp.summary}</p>
              </div>
            </div>
          )}

          {/* Node 3: Insight */}
          {linkedInsight && (
            <div className="relative pl-8 space-y-1">
              <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-slate-400 dark:bg-slate-600 flex items-center justify-center text-white font-bold text-[9px]">
                3
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                PRODUCT INSIGHT & IMPACT
              </span>
              <div className="p-3 rounded-md bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-1">
                <p className="font-semibold text-slate-900 dark:text-white">{linkedInsight.title}</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">{linkedInsight.statement}</p>
              </div>
            </div>
          )}

          {/* Node 4: Problem Cluster */}
          {linkedPainPoint && (
            <div className="relative pl-8 space-y-1">
              <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold text-[9px]">
                4
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                PROBLEM CLUSTER ({linkedPainPoint.totalMentions} MENTIONS)
              </span>
              <div className="p-3 rounded-md bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-1">
                <p className="font-semibold text-slate-900 dark:text-white">{linkedPainPoint.title}</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">{linkedPainPoint.description}</p>
              </div>
            </div>
          )}

          {/* Node 5: Supporting Customer Quotes */}
          <div className="relative pl-8 space-y-2">
            <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-bold text-[9px]">
              5
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
              VERBATIM SUPPORTING QUOTES ({supportingQuotes.length})
            </span>

            <div className="space-y-2">
              {supportingQuotes.map(quote => (
                <div key={quote.id} className="p-3 rounded-md bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-1">
                  <p className="font-medium text-slate-800 dark:text-slate-200 italic">"{quote.originalText}"</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span>{quote.customerName || 'Customer'} · {quote.sourceType.toUpperCase()}</span>
                    <span>{new Date(quote.sourceCreatedAt || quote.importedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-[#334155] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-slate-100 dark:bg-[#334155] text-slate-700 dark:text-slate-200 font-semibold"
          >
            Close Traceability Chain
          </button>
        </div>
      </div>
    </div>
  );
}
