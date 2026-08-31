import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  AlertCircle,
  CheckCircle2,
  Zap,
  Flame,
  Filter,
  Search,
  MessageSquare,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { useTraceStore } from '@/lib/store';

export function InboxPage() {
  const { feedbackList } = useTraceStore();
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
    <div className="space-y-4 text-slate-900 dark:text-[#EDEDED]">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1F232B] pb-3.5">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-[#EDEDED] flex items-center gap-2">
            <span>Feedback Ingestion Queue & Triage</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#8C92A4] mt-0.5 font-mono">
            Real-time feed of arriving customer statements requiring PM verification and anomaly triage.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#121418] border border-slate-200 dark:border-[#1F232B] text-xs font-semibold">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filterTab === 'all'
                ? 'bg-white dark:bg-[#181B22] text-slate-900 dark:text-[#EDEDED] shadow-2xs font-bold'
                : 'text-slate-600 dark:text-[#8C92A4] hover:text-slate-900 dark:hover:text-[#EDEDED]'
            }`}
          >
            All ({feedbackList.length})
          </button>
          <button
            onClick={() => setFilterTab('critical')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filterTab === 'critical'
                ? 'bg-rose-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-[#8C92A4] hover:text-slate-900 dark:hover:text-[#EDEDED]'
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => setFilterTab('unreviewed')}
            className={`px-3 py-1 rounded-md transition-colors ${
              filterTab === 'unreviewed'
                ? 'bg-amber-600 text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-[#8C92A4] hover:text-slate-900 dark:hover:text-[#EDEDED]'
            }`}
          >
            Low Ratings (≤2★)
          </button>
          <button
            onClick={() => setFilterTab('emerging')}
            className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
              filterTab === 'emerging'
                ? 'bg-[#2E8B75] text-white shadow-2xs font-bold'
                : 'text-slate-600 dark:text-[#8C92A4] hover:text-slate-900 dark:hover:text-[#EDEDED]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Spikes</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter incoming customer statements by keyword, account name, or extracted atom payload..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg bg-white dark:bg-[#121418] border border-slate-200 dark:border-[#1F232B] text-xs text-slate-900 dark:text-[#EDEDED] placeholder:text-slate-400 dark:placeholder:text-[#525866] focus:outline-none focus:border-[#2E8B75] shadow-2xs transition-colors"
        />
      </div>

      {/* Feed List */}
      <div className="space-y-2.5">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center surface-card rounded-xl text-xs text-slate-400 dark:text-[#525866] space-y-2">
            <Inbox className="w-8 h-8 text-slate-400 dark:text-[#525866] mx-auto" />
            <p className="font-semibold text-slate-700 dark:text-[#EDEDED]">No statements match selected triage filter</p>
            <p className="text-[11px]">Try clearing search filters or importing a new feedback file.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl surface-card surface-card-hover space-y-2 text-xs"
            >
              {/* Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-[#1F232B] pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-[#181B22] text-slate-700 dark:text-[#EDEDED] font-bold text-[10px] flex items-center justify-center font-mono">
                    {(item.customerName || 'A').charAt(0)}
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-[#EDEDED]">
                    {item.customerName || 'Anonymous Account'}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#181B22] text-slate-600 dark:text-[#8C92A4] text-[10px] font-mono">
                    {item.customerSegmentName || 'SMB'}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#181B22] text-[#2E8B75] dark:text-[#10B981] text-[10px] font-bold uppercase font-mono tracking-wider">
                    {item.sourceType}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-[#525866] font-mono">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(item.sourceCreatedAt || item.importedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Feedback Verbatim */}
              <p className="text-slate-800 dark:text-[#C9CDD8] text-xs leading-relaxed font-normal">
                "{item.originalText}"
              </p>

              {/* Atoms Chips */}
              {item.atoms && item.atoms.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-[#525866] uppercase font-mono tracking-wider mr-1">
                    EXTRACTED CLAUSES:
                  </span>
                  {item.atoms.map((atom) => (
                    <span
                      key={atom.id}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                        atom.intent === 'bug_report'
                          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/60'
                          : atom.intent === 'feature_request'
                          ? 'bg-slate-100 dark:bg-[#181B22] text-[#2E8B75] dark:text-[#10B981] border border-slate-200 dark:border-[#232833]'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-900/60'
                      }`}
                    >
                      {atom.intent.replace('_', ' ')} · {atom.severity}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
