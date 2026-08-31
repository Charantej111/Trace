import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  AlertCircle,
  CheckCircle2,
  Zap,
  Flame,
  ArrowRight,
  Filter,
  Search,
  MessageSquare,
  Clock,
  Sparkles
} from 'lucide-react';
import { useTraceStore } from '@/lib/store';

export function InboxPage() {
  const { feedbackList, painPoints } = useTraceStore();
  const [filterTab, setFilterTab] = useState<'all' | 'critical' | 'unreviewed' | 'emerging'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = feedbackList.filter(item => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesText = item.originalText.toLowerCase().includes(q);
      const matchesCustomer = item.customerName?.toLowerCase().includes(q);
      if (!matchesText && !matchesCustomer) return false;
    }

    if (filterTab === 'critical') {
      return item.atoms?.some(a => a.severity === 'critical');
    }
    if (filterTab === 'emerging') {
      return item.atoms?.some(a => a.atomText.toLowerCase().includes('android') || a.atomText.toLowerCase().includes('crash'));
    }
    if (filterTab === 'unreviewed') {
      return item.rating && item.rating <= 2;
    }

    return true;
  });

  return (
    <div className="space-y-5 text-slate-900 dark:text-slate-100">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Inbox & Ingestion Queue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Newly arrived customer statements requiring PM review and anomaly triage.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
              filterTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 card-shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            All ({feedbackList.length})
          </button>
          <button
            onClick={() => setFilterTab('critical')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
              filterTab === 'critical'
                ? 'bg-rose-600 text-white card-shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => setFilterTab('unreviewed')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
              filterTab === 'unreviewed'
                ? 'bg-amber-600 text-white card-shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            Unreviewed
          </button>
          <button
            onClick={() => setFilterTab('emerging')}
            className={`px-3 py-1.5 rounded-lg transition-colors font-semibold flex items-center gap-1 ${
              filterTab === 'emerging'
                ? 'bg-indigo-600 text-white card-shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Spikes</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter incoming customer statements by keyword, client name, or atom payload..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 card-shadow transition-colors"
        />
      </div>

      {/* Feed List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 card-shadow text-xs text-slate-500 dark:text-slate-400 space-y-2">
            <Inbox className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-bold text-slate-700 dark:text-slate-300">No customer statements match criteria</p>
            <p className="text-[11px]">Try clearing search filters or importing new feedback files.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const hasCritical = item.atoms?.some(a => a.severity === 'critical');
            const hasBug = item.atoms?.some(a => a.intent === 'bug_report');

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 card-shadow card-shadow-hover space-y-3 text-xs transition-all"
              >
                {/* Top Row: Customer & Source */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {item.customerName}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-mono-numbers">
                      {item.customerSegmentName}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                      {item.sourceType}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono-numbers">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(item.sourceCreatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Original Feedback Statement */}
                <p className="text-slate-800 dark:text-slate-200 text-xs leading-relaxed">
                  "{item.originalText}"
                </p>

                {/* Extracted Atoms Chips */}
                {item.atoms && item.atoms.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                      Atoms:
                    </span>
                    {item.atoms.map((atom) => (
                      <span
                        key={atom.id}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          atom.intent === 'bug_report'
                            ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/30'
                            : atom.intent === 'feature_request'
                            ? 'bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-800/30'
                            : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30'
                        }`}
                      >
                        {atom.intent.replace('_', ' ')} · {atom.severity}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Row */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                  <span className="text-slate-500 font-mono">
                    ID: {item.id}
                  </span>

                  <Link
                    to="/feedback"
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Inspect Atoms in Explorer</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
