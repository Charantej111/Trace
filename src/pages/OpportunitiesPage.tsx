import React, { useState } from 'react';
import { useTraceStore } from '@/lib/store';
import { Opportunity, DecisionType } from '@/types/trace';
import { Target, CheckCircle2, XCircle, ChevronRight, Layers, ArrowUpRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { TraceabilityDrawer } from '@/components/roadmap/TraceabilityDrawer';
import { useToast } from '@/components/ui/toast';

export function OpportunitiesPage() {
  const { opportunities, feedbackList, isProcessing, activeStage, recordDecision } = useTraceStore();
  const { addToast } = useToast();

  const [selectedOppForTraceability, setSelectedOppForTraceability] = useState<Opportunity | null>(null);

  const suggestedOpps = opportunities.filter(o => o.status === 'suggested');
  const totalFeedbackCount = feedbackList.length;

  const handleDecision = (opp: Opportunity, decision: DecisionType) => {
    const rationale = decision === 'accepted'
      ? `Priority score of ${opp.overallPriorityScore}/100 driven by deterministic multi-factor evidence evaluation (${opp.evidenceCount} verified mentions).`
      : `Deferred due to technical constraints and existing workarounds.`;

    recordDecision(opp.id, decision, rationale);

    addToast({
      type: decision === 'accepted' ? 'success' : 'info',
      title: decision === 'accepted' ? 'Opportunity Accepted' : 'Opportunity Deferred',
      description: `Recorded decision for "${opp.title}".`
    });
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1F232B] pb-3.5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#EDEDED] tracking-tight flex items-center gap-2.5">
            <span>Opportunities Matrix</span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#181B22] text-slate-600 dark:text-[#8C92A4] border border-slate-200 dark:border-[#232833]">
              {suggestedOpps.length} open for review
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#8C92A4] mt-0.5 font-mono">
            Deterministic 5-factor priority scoring: Frequency (25%) + Severity (25%) + Trend (15%) + Segment Impact (20%) + Strategic Alignment (15%).
          </p>
        </div>
      </div>

      {/* Live Processing Indicator */}
      {isProcessing && (
        <div className="p-3.5 rounded-xl surface-card border border-emerald-500/30 flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              Intelligence updating... Executing stage: <span className="capitalize">{activeStage?.stage.replace(/_/g, ' ') || 'Processing'}</span>
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 dark:text-[#8C92A4]">
            {activeStage ? `${activeStage.processedItems}/${activeStage.totalItems} items` : 'Running'}
          </span>
        </div>
      )}

      {/* Insufficient Evidence State (First-Class Product State) */}
      {!isProcessing && totalFeedbackCount > 0 && totalFeedbackCount < 3 && (
        <div className="p-5 rounded-xl surface-card border border-amber-500/30 bg-amber-500/5 space-y-2 text-left">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
            <AlertCircle className="w-4 h-4" />
            <span>INSUFFICIENT EVIDENCE THRESHOLD</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-[#8C92A4] leading-relaxed">
            Trace enforces a minimum threshold of <span className="font-semibold text-slate-900 dark:text-[#EDEDED]">≥3 verified atoms across ≥2 distinct customers</span> before generating strategic opportunities. Current evidence count: <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{totalFeedbackCount}</span>.
          </p>
          <p className="text-[11px] font-mono text-slate-500 dark:text-[#525866]">
            Import more customer feedback records to establish reproducible cluster significance.
          </p>
        </div>
      )}

      {/* Opportunities List */}
      <div className="space-y-3.5">
        {suggestedOpps.length === 0 ? (
          <div className="p-8 rounded-xl surface-card text-center text-xs text-slate-400 dark:text-[#525866] space-y-2">
            <Target className="w-6 h-6 mx-auto text-slate-400 dark:text-[#525866]" />
            <p className="font-bold text-slate-700 dark:text-[#EDEDED]">No Open Opportunities</p>
            <p className="text-[11px]">When customer problem clusters satisfy evidence requirements, ranked opportunities appear here.</p>
          </div>
        ) : (
          suggestedOpps.map((opp) => (
            <div key={opp.id} className="p-4 rounded-xl surface-card surface-card-hover space-y-3.5">
              {/* Header & Score Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#1F232B] pb-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-slate-900 dark:text-[#EDEDED] text-sm">
                      {opp.title}
                    </h3>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400">
                      Suggested
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      opp.evidenceConfidence === 'high'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400'
                        : opp.evidenceConfidence === 'medium'
                        ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      Confidence: {opp.evidenceConfidence.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-[#8C92A4] mt-0.5 leading-relaxed">
                    {opp.problemStatement}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-2xl font-bold font-mono-numbers text-[#2E8B75] dark:text-[#10B981]">
                    {opp.overallPriorityScore} <span className="text-xs font-normal text-slate-400 dark:text-[#525866]">/ 100</span>
                  </span>
                  <p className="text-[10px] font-mono text-slate-400 dark:text-[#525866]">{opp.evidenceCount} verified mentions</p>
                </div>
              </div>

              {/* Explainable 5-Factor Score Breakdown */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-slate-400 dark:text-[#525866] uppercase font-mono tracking-wider">
                  DETERMINISTIC 5-FACTOR SCORE BREAKDOWN
                </span>

                <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-lg surface-subtle">
                    <div className="flex justify-between font-mono text-[10px] text-slate-500 dark:text-[#8C92A4] mb-1.5">
                      <span>Frequency (25%)</span>
                      <span className="font-bold text-slate-900 dark:text-[#EDEDED]">{opp.scoreFrequency}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200/80 dark:bg-[#121418] rounded-full overflow-hidden">
                      <div className="h-full bg-[#2E8B75]" style={{ width: `${opp.scoreFrequency}%` }}></div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg surface-subtle">
                    <div className="flex justify-between font-mono text-[10px] text-slate-500 dark:text-[#8C92A4] mb-1.5">
                      <span>Severity (25%)</span>
                      <span className="font-bold text-slate-900 dark:text-[#EDEDED]">{opp.scoreSeverity}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200/80 dark:bg-[#121418] rounded-full overflow-hidden">
                      <div className="h-full bg-[#2E8B75]" style={{ width: `${opp.scoreSeverity}%` }}></div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg surface-subtle">
                    <div className="flex justify-between font-mono text-[10px] text-slate-500 dark:text-[#8C92A4] mb-1.5">
                      <span>Trend (15%)</span>
                      <span className="font-bold text-slate-900 dark:text-[#EDEDED]">{opp.scoreTrend}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200/80 dark:bg-[#121418] rounded-full overflow-hidden">
                      <div className="h-full bg-[#2E8B75]" style={{ width: `${opp.scoreTrend}%` }}></div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg surface-subtle">
                    <div className="flex justify-between font-mono text-[10px] text-slate-500 dark:text-[#8C92A4] mb-1.5">
                      <span>Segment (20%)</span>
                      <span className="font-bold text-slate-900 dark:text-[#EDEDED]">{opp.scoreSegmentImpact}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200/80 dark:bg-[#121418] rounded-full overflow-hidden">
                      <div className="h-full bg-[#2E8B75]" style={{ width: `${opp.scoreSegmentImpact}%` }}></div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg surface-subtle">
                    <div className="flex justify-between font-mono text-[10px] text-slate-500 dark:text-[#8C92A4] mb-1.5">
                      <span>Strategy (15%)</span>
                      <span className="font-bold text-slate-900 dark:text-[#EDEDED]">{opp.scoreStrategicRelevance}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200/80 dark:bg-[#121418] rounded-full overflow-hidden">
                      <div className="h-full bg-[#2E8B75]" style={{ width: `${opp.scoreStrategicRelevance}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-[#1F232B]">
                <button
                  onClick={() => setSelectedOppForTraceability(opp)}
                  className="text-xs font-semibold text-[#2E8B75] dark:text-[#10B981] hover:underline flex items-center gap-1 font-mono"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Inspect Evidence Lineage ({opp.evidenceCount})</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDecision(opp, 'rejected_wont_do')}
                    className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-[#181B22] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-[#EDEDED] hover:text-rose-700 font-semibold text-xs transition-colors flex items-center gap-1.5 border border-transparent dark:border-[#232833]"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span>Defer Initiative</span>
                  </button>

                  <button
                    onClick={() => handleDecision(opp, 'accepted')}
                    className="px-3.5 py-1.5 rounded-md bg-[#2E8B75] hover:bg-[#1F6B58] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Accept & Add to Roadmap</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
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
