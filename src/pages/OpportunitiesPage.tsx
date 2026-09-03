import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTraceStore } from '@/lib/store';
import { Opportunity, DecisionType } from '@/types/trace';
import { getStageHumanLabel } from '@/lib/stage-utils';
import {
  Target,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  Calendar,
  X,
  Zap,
  RefreshCw
} from 'lucide-react';
import { TraceabilityDrawer } from '@/components/roadmap/TraceabilityDrawer';
import { useToast } from '@/components/ui/toast';

export function OpportunitiesPage() {
  const {
    opportunities,
    insights,
    painPoints,
    themes,
    feedbackList,
    isProcessing,
    activeStage,
    recordDecision,
    synthesizeIntelligence
  } = useTraceStore();

  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'suggested' | 'accepted' | 'rejected' | 'all'>('suggested');
  const [selectedOppForTraceability, setSelectedOppForTraceability] = useState<Opportunity | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Decision Modal State
  const [decisionModal, setDecisionModal] = useState<{
    opp: Opportunity;
    type: DecisionType;
    rationale: string;
    targetPeriod: string;
  } | null>(null);

  const totalFeedbackCount = feedbackList.length;

  // Pure User Intelligence: Only display opportunities synthesized from real user-uploaded evidence
  const effectiveOpportunities: Opportunity[] = opportunities;

  const suggestedCount = effectiveOpportunities.filter(o => o.status === 'suggested').length;
  const acceptedCount = effectiveOpportunities.filter(o => o.status === 'accepted').length;
  const rejectedCount = effectiveOpportunities.filter(o => o.status === 'rejected').length;

  const filteredOpps = effectiveOpportunities.filter(o => {
    if (activeTab === 'suggested') return o.status === 'suggested';
    if (activeTab === 'accepted') return o.status === 'accepted';
    if (activeTab === 'rejected') return o.status === 'rejected';
    return true;
  });

  const handleManualSynthesis = async () => {
    setIsSynthesizing(true);
    try {
      await synthesizeIntelligence();
      addToast({
        type: 'success',
        title: 'Opportunities Synthesized',
        description: 'Successfully re-scored and persisted candidate opportunities from your evidence.'
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const openDecisionModal = (opp: Opportunity, type: DecisionType) => {
    const defaultRationale = type === 'accepted'
      ? `Priority score of ${opp.overallPriorityScore}/100 driven by deterministic multi-factor evidence evaluation (${opp.evidenceCount || 1} verified mentions across customer cohorts).`
      : `Deferred due to technical dependencies and competing high-impact roadmap commitments.`;

    setDecisionModal({
      opp,
      type,
      rationale: defaultRationale,
      targetPeriod: 'Q3 2026'
    });
  };

  const confirmDecision = async () => {
    if (!decisionModal) return;
    const { opp, type, rationale, targetPeriod } = decisionModal;

    await recordDecision(opp.id, type, rationale, undefined, targetPeriod);

    addToast({
      type: type === 'accepted' ? 'success' : 'info',
      title: type === 'accepted' ? 'Committed to Roadmap' : 'Initiative Deferred',
      description: `Recorded decision for "${opp.title}".`
    });

    setDecisionModal(null);
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1F232B] pb-3.5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#EDEDED] tracking-tight flex items-center gap-2.5">
            <span>Opportunities Matrix</span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#181B22] text-slate-600 dark:text-[#8C92A4] border border-slate-200 dark:border-[#232833]">
              {suggestedCount} open for review
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#8C92A4] mt-0.5 font-mono">
            Deterministic 5-factor priority scoring: Frequency (25%) + Severity (25%) + Trend (15%) + Segment Impact (20%) + Strategic Alignment (15%).
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {totalFeedbackCount > 0 && (
            <button
              onClick={handleManualSynthesis}
              disabled={isSynthesizing || isProcessing}
              className="px-3 py-1.5 rounded-lg bg-[#2E8B75]/10 hover:bg-[#2E8B75]/20 text-[#2E8B75] dark:text-[#10B981] text-xs font-semibold transition-colors flex items-center gap-1.5 font-mono disabled:opacity-50"
            >
              {isSynthesizing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5" />
              )}
              <span>{isSynthesizing ? 'Synthesizing...' : 'Synthesize Intelligence'}</span>
            </button>
          )}

          <Link
            to="/roadmap"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#181B22] hover:bg-slate-200 dark:hover:bg-[#232833] text-xs font-semibold text-slate-700 dark:text-[#EDEDED] transition-colors"
          >
            Roadmap Kanban →
          </Link>
        </div>
      </div>

      {/* Live Processing Indicator */}
      {isProcessing && (
        <div className="p-3.5 rounded-xl surface-card border border-emerald-500/30 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {getStageHumanLabel(activeStage?.stage)}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 dark:text-[#8C92A4]">
            {activeStage ? `${activeStage.processedItems} of ${activeStage.totalItems} records` : 'In progress'}
          </span>
        </div>
      )}

      {/* Insufficient Evidence State */}
      {!isProcessing && totalFeedbackCount > 0 && totalFeedbackCount < 3 && (
        <div className="p-5 rounded-xl surface-card border border-amber-500/30 bg-amber-500/5 space-y-2 text-left">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
            <AlertCircle className="w-4 h-4" />
            <span>PRELIMINARY EVIDENCE THRESHOLD</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-[#8C92A4] leading-relaxed">
            Trace has synthesized preliminary candidate opportunities from your <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{totalFeedbackCount}</span> customer statement(s). Confidence rankings will strengthen automatically with 3+ statements.
          </p>
        </div>
      )}

      {/* Navigation Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#1F232B] pb-3 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('suggested')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'suggested'
              ? 'bg-[#2E8B75]/10 text-[#2E8B75] dark:text-[#10B981] font-bold border border-[#2E8B75]/20'
              : 'text-slate-500 dark:text-[#8C92A4] hover:text-slate-900 dark:hover:text-[#EDEDED] hover:bg-slate-100 dark:hover:bg-[#181B22]'
          }`}
        >
          Open for Review ({suggestedCount})
        </button>

        <button
          onClick={() => setActiveTab('accepted')}
          className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
            activeTab === 'accepted'
              ? 'bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-[#10B981] font-bold border border-emerald-200 dark:border-emerald-900/60'
              : 'text-slate-500 dark:text-[#8C92A4] hover:text-slate-900 dark:hover:text-[#EDEDED] hover:bg-slate-100 dark:hover:bg-[#181B22]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Accepted & on Roadmap ({acceptedCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
            activeTab === 'rejected'
              ? 'bg-rose-100/80 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400 font-bold border border-rose-200 dark:border-rose-900/60'
              : 'text-slate-500 dark:text-[#8C92A4] hover:text-slate-900 dark:hover:text-[#EDEDED] hover:bg-slate-100 dark:hover:bg-[#181B22]'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Deferred ({rejectedCount})</span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'all'
              ? 'bg-slate-200 dark:bg-[#232833] text-slate-900 dark:text-[#EDEDED] font-bold'
              : 'text-slate-500 dark:text-[#8C92A4] hover:text-slate-900 dark:hover:text-[#EDEDED] hover:bg-slate-100 dark:hover:bg-[#181B22]'
          }`}
        >
          All Opportunities ({effectiveOpportunities.length})
        </button>
      </div>

      {/* Opportunities List */}
      <div className="space-y-3.5">
        {filteredOpps.length === 0 ? (
          <div className="p-8 rounded-xl surface-card text-center text-xs text-slate-400 dark:text-[#525866] space-y-3 border border-dashed border-slate-200 dark:border-[#232833]">
            <Target className="w-8 h-8 mx-auto text-slate-400 dark:text-[#525866]" />
            <div className="space-y-1">
              <p className="font-bold text-slate-700 dark:text-[#EDEDED] text-sm">
                {effectiveOpportunities.length === 0
                  ? 'No Opportunities Synthesized Yet'
                  : activeTab === 'suggested'
                  ? 'No Open Opportunities Pending Review'
                  : activeTab === 'accepted'
                  ? 'No Opportunities Committed to Roadmap Yet'
                  : 'No Opportunities Deferred'}
              </p>
              <p className="text-[11px] max-w-md mx-auto leading-relaxed">
                {feedbackList.length === 0
                  ? 'Import customer feedback to automatically extract problem clusters and score defensible product opportunities.'
                  : effectiveOpportunities.length === 0
                  ? 'Customer feedback is uploaded. Click "Run Intelligence Synthesis" above to synthesize and score strategic opportunities directly from your evidence.'
                  : 'All candidate opportunities for this view have been processed.'}
              </p>
            </div>
            {feedbackList.length === 0 && (
              <div className="pt-1">
                <Link
                  to="/sources"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2E8B75] hover:bg-[#257260] text-white text-xs font-semibold transition-colors"
                >
                  <span>Import Customer Feedback</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        ) : (
          filteredOpps.map((opp) => (
            <div key={opp.id} className="p-4 rounded-xl surface-card surface-card-hover space-y-3.5">
              {/* Header & Score Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#1F232B] pb-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-bold text-slate-900 dark:text-[#EDEDED] text-sm">
                      {opp.title}
                    </h3>

                    {/* Status Badge */}
                    {opp.status === 'accepted' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-[#10B981] border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Accepted</span>
                      </span>
                    ) : opp.status === 'rejected' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        <span>Deferred</span>
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400">
                        Suggested
                      </span>
                    )}

                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      opp.evidenceConfidence === 'high'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400'
                        : opp.evidenceConfidence === 'medium'
                        ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      Confidence: {opp.evidenceConfidence?.toUpperCase() || 'HIGH'}
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
                  <p className="text-[10px] font-mono text-slate-400 dark:text-[#525866]">{opp.evidenceCount || 1} verified mentions</p>
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
                  <span>Inspect Evidence Lineage ({opp.evidenceCount || 1})</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                {opp.status === 'accepted' ? (
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-[#10B981] font-semibold">
                      Committed to Roadmap (Status: Planned)
                    </span>
                    <Link
                      to="/roadmap"
                      className="px-3 py-1.5 rounded-md bg-[#2E8B75]/10 text-[#2E8B75] dark:text-[#10B981] font-semibold text-xs hover:bg-[#2E8B75]/20 transition-colors"
                    >
                      View on Roadmap →
                    </Link>
                  </div>
                ) : opp.status === 'rejected' ? (
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400 font-semibold">
                      Deferred in Decision Memory
                    </span>
                    <Link
                      to="/decisions"
                      className="text-xs font-mono font-semibold text-slate-500 dark:text-[#8C92A4] hover:underline"
                    >
                      View Decision Log →
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openDecisionModal(opp, 'rejected_wont_do')}
                      className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-[#181B22] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-[#EDEDED] hover:text-rose-700 font-semibold text-xs transition-colors flex items-center gap-1.5 border border-transparent dark:border-[#232833]"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      <span>Defer Initiative</span>
                    </button>

                    <button
                      onClick={() => openDecisionModal(opp, 'accepted')}
                      className="px-3.5 py-1.5 rounded-md bg-[#2E8B75] hover:bg-[#1F6B58] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept & Add to Roadmap</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Decision Review Modal */}
      {decisionModal && (
        <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg surface-card border border-slate-200 dark:border-[#1F232B] rounded-2xl shadow-2xl overflow-hidden text-xs">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 dark:border-[#1F232B] flex items-center justify-between">
              <div className="flex items-center gap-2">
                {decisionModal.type === 'accepted' ? (
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-[#10B981] flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center">
                    <XCircle className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-[#EDEDED] text-sm">
                    {decisionModal.type === 'accepted' ? 'Commit Initiative to Roadmap' : 'Record Deferral Decision'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-[#8C92A4]">
                    {decisionModal.type === 'accepted'
                      ? 'Creates an institutional decision record and adds to the Roadmap Kanban.'
                      : 'Records a formal deferral with evidence snapshot in Decision Memory.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDecisionModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-[#EDEDED] hover:bg-slate-100 dark:hover:bg-[#181B22]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Selected Opportunity Card */}
              <div className="p-3.5 rounded-xl surface-subtle space-y-1">
                <span className="text-[10px] font-mono text-slate-400 dark:text-[#525866] uppercase tracking-wider font-semibold">
                  OPPORTUNITY ({decisionModal.opp.overallPriorityScore}/100 PRIORITY)
                </span>
                <p className="font-bold text-slate-900 dark:text-[#EDEDED] text-xs">
                  {decisionModal.opp.title}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-[#8C92A4]">
                  {decisionModal.opp.problemStatement}
                </p>
              </div>

              {/* Target Period (if accepted) */}
              {decisionModal.type === 'accepted' && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-700 dark:text-[#C9CDD8] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#2E8B75]" />
                    <span>Target Delivery Period</span>
                  </label>
                  <select
                    value={decisionModal.targetPeriod}
                    onChange={(e) => setDecisionModal({ ...decisionModal, targetPeriod: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg surface-subtle border border-slate-200 dark:border-[#232833] text-xs font-mono text-slate-900 dark:text-[#EDEDED] outline-none focus:border-[#2E8B75]"
                  >
                    <option value="Q3 2026">Q3 2026 (Current Quarter)</option>
                    <option value="Q4 2026">Q4 2026</option>
                    <option value="Q1 2027">Q1 2027</option>
                    <option value="Q2 2027">Q2 2027</option>
                  </select>
                </div>
              )}

              {/* Rationale Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-[#C9CDD8]">
                  Decision Rationale & Trade-off Notes
                </label>
                <textarea
                  value={decisionModal.rationale}
                  onChange={(e) => setDecisionModal({ ...decisionModal, rationale: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 rounded-lg surface-subtle border border-slate-200 dark:border-[#232833] text-xs text-slate-900 dark:text-[#EDEDED] outline-none focus:border-[#2E8B75] leading-relaxed resize-none"
                  placeholder="Enter strategic rationale or justification..."
                />
                <p className="text-[10px] text-slate-400 dark:text-[#525866] font-mono">
                  This justification and an evidence snapshot will be permanently preserved in your Decision Memory.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-[#1F232B] flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDecisionModal(null)}
                className="px-3.5 py-1.5 rounded-lg text-slate-600 dark:text-[#8C92A4] hover:bg-slate-100 dark:hover:bg-[#181B22] font-semibold text-xs transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={confirmDecision}
                className={`px-4 py-1.5 rounded-lg text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs ${
                  decisionModal.type === 'accepted'
                    ? 'bg-[#2E8B75] hover:bg-[#1F6B58]'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {decisionModal.type === 'accepted' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm & Commit to Roadmap</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Confirm Deferral</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
