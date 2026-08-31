import React, { useState } from 'react';
import { useTraceStore } from '@/lib/store';
import { PainPoint } from '@/types/trace';
import {
  Flame,
  Zap,
  TrendingUp,
  AlertTriangle,
  Users,
  Quote,
  ChevronRight,
  Layers
} from 'lucide-react';

export function InsightsPage() {
  const { painPoints, feedbackList } = useTraceStore();
  const [activeTab, setActiveTab] = useState<'top' | 'emerging' | 'segments'>('top');

  const emergingIssues = painPoints.filter(p => p.isEmerging);
  const topProblems = painPoints;

  const displayList = activeTab === 'emerging' ? emergingIssues : topProblems;

  return (
    <div className="space-y-5 text-slate-900 dark:text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1E293B] pb-3.5">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Insights & Problem Clusters
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Synthesized problem themes, mention frequency trends, and verbatim evidence clusters.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#1E293B] pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('top')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'top'
              ? 'bg-slate-200 dark:bg-[#1E293B] text-slate-900 dark:text-white'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          Top Problems ({topProblems.length})
        </button>

        <button
          onClick={() => setActiveTab('emerging')}
          className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
            activeTab === 'emerging'
              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-rose-500" />
          <span>Emerging Issues ({emergingIssues.length})</span>
        </button>
      </div>

      {/* Cluster List */}
      <div className="space-y-4">
        {displayList.map((problem) => {
          const matchingQuotes = feedbackList.filter(f =>
            f.atoms?.some(a => a.themeName?.toLowerCase().includes(problem.title.toLowerCase().slice(0, 10)))
          ).slice(0, 2);

          return (
            <div key={problem.id} className="p-4 rounded-lg surface-card space-y-3.5">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-[#334155] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {problem.title}
                    </h3>
                    {problem.isEmerging && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
                        EMERGING SPIKE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {problem.description}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-base font-bold font-mono-numbers text-slate-900 dark:text-white">
                    {problem.totalMentions} mentions
                  </span>
                  <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    +{problem.velocityRate || 24}% vs previous period
                  </p>
                </div>
              </div>

              {/* Segment Impact Breakdown */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                  SEGMENT DISTRIBUTION IMPACT
                </span>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                    <span className="text-slate-500 block text-[10px]">Enterprise</span>
                    <span className="font-bold text-slate-900 dark:text-white">68%</span>
                  </div>

                  <div className="p-2 rounded bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                    <span className="text-slate-500 block text-[10px]">SMB</span>
                    <span className="font-bold text-slate-900 dark:text-white">24%</span>
                  </div>

                  <div className="p-2 rounded bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                    <span className="text-slate-500 block text-[10px]">Consumer</span>
                    <span className="font-bold text-slate-900 dark:text-white">8%</span>
                  </div>
                </div>
              </div>

              {/* Verbatim Evidence Quotes */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                  VERBATIM CUSTOMER EVIDENCE
                </span>

                <div className="space-y-1.5">
                  {(matchingQuotes.length > 0 ? matchingQuotes : feedbackList.slice(0, 2)).map(q => (
                    <div key={q.id} className="p-2.5 rounded bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs space-y-0.5">
                      <p className="font-medium text-slate-800 dark:text-slate-200 italic">"{q.originalText}"</p>
                      <p className="text-[10px] font-mono text-slate-400">
                        {q.customerName || 'Customer'} · {q.customerSegmentName || 'SMB'} · {q.sourceType.toUpperCase()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
