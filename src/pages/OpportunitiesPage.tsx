import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  Sparkles,
  ArrowRight,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  X,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { useTraceStore } from '@/lib/store';
import { Opportunity, OpportunityStatus, DecisionType } from '@/types/trace';
import { useToast } from '@/components/ui/toast';

export function OpportunitiesPage() {
  const { opportunities, recordDecision, addOpportunity } = useTraceStore();
  const { addToast } = useToast();

  const [filterStatus, setFilterStatus] = useState<'all' | 'suggested' | 'accepted' | 'rejected'>('all');
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(() => {
    return opportunities.filter(o => o.status === 'suggested')[0] || opportunities[0] || null;
  });

  // Modal logic for recording PM rationale
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionRationale, setDecisionRationale] = useState('');
  const [alternativeTitle, setAlternativeTitle] = useState('');
  const [decisionType, setDecisionType] = useState<DecisionType>('accepted');

  // Custom Opportunity Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newProblem, setNewProblem] = useState('');
  const [newOpportunity, setNewOpportunity] = useState('');
  const [newSolution, setNewSolution] = useState('');

  const filteredOpportunities = opportunities.filter((opp) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'rejected') return opp.status === 'rejected';
    return opp.status === filterStatus;
  });

  const handleOpenDecision = (opp: Opportunity, type: DecisionType) => {
    setSelectedOpp(opp);
    setDecisionType(type);
    setDecisionRationale('');
    setAlternativeTitle('');
    setIsDecisionModalOpen(true);
  };

  const handleConfirmDecision = () => {
    if (!selectedOpp) return;
    if (!decisionRationale.trim()) {
      addToast({
        type: 'error',
        title: 'Rationale Required',
        description: 'You must provide a PM justification before persisting this decision.'
      });
      return;
    }

    recordDecision(
      selectedOpp.id,
      decisionType,
      decisionRationale,
      decisionType !== 'accepted' ? alternativeTitle : undefined
    );

    setIsDecisionModalOpen(false);
    addToast({
      type: 'success',
      title: decisionType === 'accepted' ? 'Opportunity Accepted' : 'Decision Grounded',
      description: decisionType === 'accepted'
        ? 'Opportunity committed and automatically linked to Roadmap.'
        : 'Rationale formally recorded to Institutional Decision Memory.'
    });
  };

  const handleCreateOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newProblem.trim()) return;

    addOpportunity({
      workspaceId: 'ws-prod',
      title: newTitle,
      problemStatement: newProblem,
      opportunityStatement: newOpportunity || newProblem,
      suggestedSolution: newSolution || undefined,
      targetSegments: ['Enterprise', 'SMB'],
      scoreFrequency: 80,
      scoreSeverity: 85,
      scoreTrend: 75,
      scoreSegmentImpact: 80,
      scoreStrategicRelevance: 90,
      scoreEvidenceQuality: 85,
      status: 'suggested',
      confidence: 'high',
      evidenceCount: 12
    });

    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewProblem('');
    setNewOpportunity('');
    setNewSolution('');

    addToast({
      type: 'success',
      title: 'Opportunity Created',
      description: 'New product initiative added to scoring matrix.'
    });
  };

  return (
    <div className="space-y-4 text-slate-900 dark:text-slate-100">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Actionable Opportunities & Prioritization Matrix
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Explainable AI-scored initiatives grounded in customer evidence and strategic context.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 card-shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              All ({opportunities.length})
            </button>
            <button
              onClick={() => setFilterStatus('suggested')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === 'suggested'
                  ? 'bg-amber-600 text-white card-shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Suggested
            </button>
            <button
              onClick={() => setFilterStatus('accepted')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === 'accepted'
                  ? 'bg-emerald-600 text-white card-shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Accepted
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 card-shadow transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Opportunity</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Split: Opportunities Ranking + Explainable Scoring Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 6 Cols: Opportunities Cards */}
        <div className="lg:col-span-6 space-y-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
            Prioritized Initiatives ({filteredOpportunities.length})
          </span>

          <div className="space-y-3">
            {filteredOpportunities.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 card-shadow text-xs text-slate-400">
                No opportunities match the selected status filter.
              </div>
            ) : (
              filteredOpportunities.map((opp) => {
                const isSelected = selectedOpp?.id === opp.id;

                return (
                  <div
                    key={opp.id}
                    onClick={() => setSelectedOpp(opp)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 text-xs card-shadow ${
                      isSelected
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500/80 ring-1 ring-indigo-500/40'
                        : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono-numbers font-extrabold bg-indigo-600 text-white shadow-xs">
                          {opp.overallPriorityScore}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          opp.status === 'accepted'
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30'
                            : opp.status === 'rejected'
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30'
                        }`}>
                          {opp.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono-numbers">
                        {opp.evidenceCount} evidence links
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug">
                      {opp.title}
                    </h3>

                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {opp.opportunityStatement}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[11px]">
                      <span className="text-slate-500 font-semibold">
                        Targets: {opp.targetSegments.join(', ')}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 6 Cols: Explainable Score Matrix & PM Action Panel */}
        <div className="lg:col-span-6 sticky top-20 space-y-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
            Explainable Priority Formula & PM Actions
          </span>

          {selectedOpp ? (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 card-shadow space-y-5 text-xs">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                    Opportunity Trace #{selectedOpp.id}
                  </span>
                  <span className="font-mono-numbers text-xs font-bold text-slate-900 dark:text-slate-100">
                    Confidence: {selectedOpp.confidence}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {selectedOpp.title}
                </h2>
              </div>

              {/* Problem & Opportunity Framing */}
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Validated Customer Problem</span>
                  <p className="text-slate-800 dark:text-slate-200">{selectedOpp.problemStatement}</p>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/30 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">Strategic Product Opportunity</span>
                  <p className="text-slate-800 dark:text-slate-200">{selectedOpp.opportunityStatement}</p>
                </div>
              </div>

              {/* Explainable Scoring Factors Breakdown */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  6-Factor Weighted Score Breakdown
                </span>

                <div className="space-y-2 text-xs font-mono-numbers">
                  {[
                    { name: 'Mention Frequency (20%)', score: selectedOpp.scoreFrequency, color: 'bg-indigo-600' },
                    { name: 'Severity & Churn Risk (20%)', score: selectedOpp.scoreSeverity, color: 'bg-rose-500' },
                    { name: 'Trend Velocity Surge (15%)', score: selectedOpp.scoreTrend, color: 'bg-amber-500' },
                    { name: 'Segment Strategic Weight (15%)', score: selectedOpp.scoreSegmentImpact, color: 'bg-emerald-500' },
                    { name: 'Strategic Context Alignment (15%)', score: selectedOpp.scoreStrategicRelevance, color: 'bg-sky-500' },
                    { name: 'Evidence Quote Quality (15%)', score: selectedOpp.scoreEvidenceQuality, color: 'bg-purple-500' }
                  ].map((factor, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-600 dark:text-slate-400 font-sans">{factor.name}</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{factor.score}/100</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className={`${factor.color} h-full rounded-full`} style={{ width: `${factor.score}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PM Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenDecision(selectedOpp, 'accepted')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Accept & Commit</span>
                  </button>

                  <button
                    onClick={() => handleOpenDecision(selectedOpp, 'rejected_wont_do')}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors"
                  >
                    <span>Won't Do / Defer</span>
                  </button>
                </div>

                {selectedOpp.status === 'accepted' && (
                  <Link
                    to="/roadmap"
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <span>View on Roadmap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 card-shadow text-xs text-slate-400">
              Select an opportunity to inspect score factors.
            </div>
          )}
        </div>
      </div>

      {/* Decision Rationale Modal */}
      {isDecisionModalOpen && selectedOpp && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 card-shadow overflow-hidden text-xs space-y-4 p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Formal Decision Record (PDR)</span>
              </h3>
              <button onClick={() => setIsDecisionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Opportunity Subject</span>
              <p className="font-bold text-slate-900 dark:text-slate-100">{selectedOpp.title}</p>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                PM Rationale & Justification <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={decisionRationale}
                onChange={(e) => setDecisionRationale(e.target.value)}
                placeholder="Explain why this decision is made, trade-offs considered, and expected impact on OKRs..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {decisionType !== 'accepted' && (
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  Alternative Prioritized (Optional)
                </label>
                <input
                  type="text"
                  value={alternativeTitle}
                  onChange={(e) => setAlternativeTitle(e.target.value)}
                  placeholder="e.g., Prioritized Q3 Mobile Crash Hardening instead"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsDecisionModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDecision}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-xs transition-colors"
              >
                Persist Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Opportunity Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateOpportunity} className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 card-shadow overflow-hidden text-xs space-y-4 p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <span>Create Opportunity</span>
              </h3>
              <button type="button" onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                Initiative Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g., Background Chunked Export Pipeline"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                Validated Customer Problem <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={newProblem}
                onChange={(e) => setNewProblem(e.target.value)}
                placeholder="Describe what customer friction or struggle this solves..."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                Strategic Opportunity Statement
              </label>
              <textarea
                rows={2}
                value={newOpportunity}
                onChange={(e) => setNewOpportunity(e.target.value)}
                placeholder="How does addressing this advance product strategy?"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-xs transition-colors"
              >
                Add Opportunity
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
