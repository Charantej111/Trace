import React, { useState } from 'react';
import { useTraceStore } from '@/lib/store';
import { Opportunity, DecisionType } from '@/types/trace';
import { Target, CheckCircle2, XCircle, ChevronRight, Layers, ArrowUpRight } from 'lucide-react';
import { TraceabilityDrawer } from '@/components/roadmap/TraceabilityDrawer';
import { useToast } from '@/components/ui/toast';

export function OpportunitiesPage() {
  const { opportunities, recordDecision } = useTraceStore();
  const { addToast } = useToast();

  const [selectedOppForTraceability, setSelectedOppForTraceability] = useState<Opportunity | null>(null);

  const suggestedOpps = opportunities.filter(o => o.status === 'suggested');
  const acceptedOpps = opportunities.filter(o => o.status === 'accepted');

  const handleDecision = (opp: Opportunity, decision: DecisionType) => {
    const rationale = decision === 'accepted'
      ? `Priority score of ${opp.overallPriorityScore}/100 driven by high enterprise customer evidence (${opp.evidenceCount} mentions).`
      : `Deferred due to technical constraints and available workaround.`;

    recordDecision(opp.id, decision, rationale);

    addToast({
      type: decision === 'accepted' ? 'success' : 'info',
      title: decision === 'accepted' ? 'Opportunity Accepted' : 'Opportunity Deferred',
      description: `Recorded decision for "${opp.title}".`
    });
  };

  return (
    <div className="space-y-5 text-slate-900 dark:text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1E293B] pb-3.5">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Opportunities Matrix</span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#334155]">
              {suggestedOpps.length} open for review
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Prioritized product initiatives evaluated across evidence frequency, severity, segment impact, and strategic fit.
          </p>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="space-y-4">
        {suggestedOpps.map((opp) => (
          <div key={opp.id} className="p-4 rounded-lg surface-card space-y-4">
            {/* Header & Score Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#334155] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {opp.title}
                  </h3>
                  <span className="px-2 py-0.2 rounded text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                    Suggested
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {opp.summary}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xl font-bold font-mono-numbers text-[#2E8B75] dark:text-[#3B9B85]">
                  {opp.overallPriorityScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
                </span>
                <p className="text-[10px] font-mono text-slate-400">{opp.evidenceCount} verified mentions</p>
              </div>
            </div>

            {/* Score Breakdown (Neutral Progress Indicators) */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                PRIORITY SCORE BREAKDOWN
              </span>

              <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
                <div>
                  <div className="flex justify-between font-mono text-[10px] text-slate-500 mb-1">
                    <span>Frequency</span>
                    <span className="font-bold text-slate-900 dark:text-white">94</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-[#0F172A] rounded-full overflow-hidden">
                    <div className="h-full bg-[#2E8B75] rounded-full" style={{ width: '94%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-mono text-[10px] text-slate-500 mb-1">
                    <span>Severity</span>
                    <span className="font-bold text-slate-900 dark:text-white">95</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-[#0F172A] rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-mono text-[10px] text-slate-500 mb-1">
                    <span>Trend</span>
                    <span className="font-bold text-slate-900 dark:text-white">85</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-[#0F172A] rounded-full overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-mono text-[10px] text-slate-500 mb-1">
                    <span>Segment Impact</span>
                    <span className="font-bold text-slate-900 dark:text-white">92</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-[#0F172A] rounded-full overflow-hidden">
                    <div className="h-full bg-[#2E8B75] rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-mono text-[10px] text-slate-500 mb-1">
                    <span>Strategy Fit</span>
                    <span className="font-bold text-slate-900 dark:text-white">95</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-[#0F172A] rounded-full overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-mono text-[10px] text-slate-500 mb-1">
                    <span>Evidence Quality</span>
                    <span className="font-bold text-slate-900 dark:text-white">90</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-[#0F172A] rounded-full overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence & Action Footer */}
            <div className="pt-2 border-t border-slate-100 dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <button
                onClick={() => setSelectedOppForTraceability(opp)}
                className="text-xs font-semibold text-[#2E8B75] dark:text-[#3B9B85] hover:underline font-mono flex items-center gap-1"
              >
                <span>View Evidence Traceability Chain ({opp.evidenceCount} quotes)</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDecision(opp, 'rejected_wont_do')}
                  className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-[#334155] hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold transition-colors"
                >
                  Reject / Defer
                </button>

                <button
                  onClick={() => handleDecision(opp, 'accepted')}
                  className="px-4 py-1.5 rounded-md bg-[#2E8B75] hover:bg-[#1F6B58] text-white font-bold transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Accept Opportunity</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slide-out Traceability Drawer */}
      {selectedOppForTraceability && (
        <TraceabilityDrawer
          opportunity={selectedOppForTraceability}
          onClose={() => setSelectedOppForTraceability(null)}
        />
      )}
    </div>
  );
}
