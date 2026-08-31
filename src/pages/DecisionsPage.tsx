import React, { useState } from 'react';
import { Search, ArrowRight, ShieldCheck, History, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useTraceStore } from '@/lib/store';

export function DecisionsPage() {
  const { decisions } = useTraceStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredDecisions = decisions.filter(d => {
    if (filterType !== 'all' && d.decision !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.rationale.toLowerCase().includes(q) ||
        d.opportunityTitle?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4 text-slate-900 dark:text-slate-100">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Institutional Decision Memory (PDR / ADR)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audit log of why we built something, deferred it, or deliberately said no.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono-numbers">
          <span className="text-slate-600 dark:text-slate-400">
            Decisions Preserved: <strong className="text-slate-900 dark:text-slate-100 font-bold">{decisions.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter & Search bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 card-shadow flex flex-col sm:flex-row items-center gap-3 text-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search past decisions, PM rationale, or trade-offs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto font-semibold">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterType === 'all'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            All ({decisions.length})
          </button>
          <button
            onClick={() => setFilterType('accepted')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterType === 'accepted'
                ? 'bg-emerald-600 text-white card-shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Accepted
          </button>
          <button
            onClick={() => setFilterType('rejected_wont_do')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterType === 'rejected_wont_do'
                ? 'bg-slate-700 text-white card-shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Won't Do / Deferred
          </button>
        </div>
      </div>

      {/* Decision Logs Feed */}
      <div className="space-y-3.5">
        {filteredDecisions.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 card-shadow text-xs text-slate-400">
            No institutional decisions found matching criteria.
          </div>
        ) : (
          filteredDecisions.map((dec) => {
            const isAccepted = dec.decision === 'accepted';

            return (
              <div
                key={dec.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 card-shadow space-y-3 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase flex items-center gap-1 ${
                      isAccepted
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}>
                      {isAccepted ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-500" />}
                      <span>{isAccepted ? 'Accepted & Committed' : 'Deferred (Won\'t Do)'}</span>
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {dec.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono-numbers">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(dec.decidedAt).toLocaleDateString()} by {dec.decidedBy}</span>
                  </div>
                </div>

                {/* Justification / Rationale */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Official PM Justification & Trade-Offs
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {dec.rationale}
                  </p>
                </div>

                {/* Snapshot of Evidence at Decision Time */}
                {dec.evidenceSnapshot && (
                  <div className="p-3 rounded-xl bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 flex flex-wrap items-center justify-between gap-3 text-[11px]">
                    <div className="flex items-center gap-3 font-mono-numbers">
                      <span className="text-slate-500">Mentions at decision: <strong className="text-slate-900 dark:text-slate-100 font-bold">{dec.evidenceSnapshot.mentionCount}</strong></span>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <span className="text-slate-500">Priority Score: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{dec.evidenceSnapshot.scoreAtDecisionTime}</strong></span>
                    </div>

                    {dec.alternativePrioritizedTitle && (
                      <div className="text-slate-600 dark:text-slate-400 font-semibold">
                        Alternative Prioritized: <span className="text-indigo-600 dark:text-indigo-400">{dec.alternativePrioritizedTitle}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
