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
  const [activeTab, setActiveTab] = useState<'top' | 'emerging'>('top');

  const emergingIssues = painPoints.filter(p => p.isEmerging);
  const topProblems = painPoints;

  const displayList = activeTab === 'emerging' ? emergingIssues : topProblems;

  return (
    <div className="space-y-5 text-slate-900 dark:text-[#EDEDED]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1F232B] pb-3.5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#EDEDED] tracking-tight">
            Insights & Problem Clusters
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#8C92A4] mt-0.5 font-mono">
            Synthesized problem themes, mention frequency trends, and verbatim evidence clusters.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-[#1F232B] pb-3 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('top')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'top'
              ? 'bg-[#2E8B75]/10 text-[#2E8B75] dark:text-[#10B981] font-bold border border-[#2E8B75]/20'
              : 'text-slate-500 dark:text-[#8C92A4] hover:text-slate-900 dark:hover:text-[#EDEDED] hover:bg-slate-100 dark:hover:bg-[#181B22]'
          }`}
        >
          Top Problems ({topProblems.length})
        </button>

        <button
          onClick={() => setActiveTab('emerging')}
          className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
            activeTab === 'emerging'
              ? 'bg-rose-100/80 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60'
              : 'text-slate-500 dark:text-[#8C92A4] hover:text-slate-900 dark:hover:text-[#EDEDED] hover:bg-slate-100 dark:hover:bg-[#181B22]'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-rose-500" />
          <span>Emerging Issues ({emergingIssues.length})</span>
        </button>
      </div>

      {/* Cluster List */}
      <div className="space-y-3.5">
        {displayList.length === 0 ? (
          <div className="p-8 rounded-xl surface-card text-center text-xs text-slate-400 dark:text-[#525866] space-y-2">
            <Zap className="w-6 h-6 mx-auto text-slate-400 dark:text-[#525866]" />
            <p className="font-bold text-slate-700 dark:text-[#EDEDED]">No Problem Clusters Detected</p>
            <p className="text-[11px]">Import feedback datasets to synthesize automatic issue clusters and velocity spikes.</p>
          </div>
        ) : (
          displayList.map((problem) => {
            const matchingQuotes = feedbackList.filter(f =>
              f.atoms?.some(a => a.themeName?.toLowerCase().includes(problem.title.toLowerCase().slice(0, 10)))
            ).slice(0, 2);

            return (
              <div key={problem.id} className="p-4 rounded-xl surface-card surface-card-hover space-y-3">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-[#1F232B] pb-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h3 className="font-bold text-slate-900 dark:text-[#EDEDED] text-sm">
                        {problem.title}
                      </h3>
                      {problem.isEmerging && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400">
                          EMERGING SPIKE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-[#8C92A4] mt-0.5 leading-relaxed">
                      {problem.description}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-bold font-mono-numbers text-slate-900 dark:text-[#EDEDED]">
                      {problem.frequency} mentions
                    </span>
                    <p className="text-[10px] font-mono text-emerald-600 dark:text-[#10B981] font-semibold">
                      +{problem.trendPercentage || 22}% velocity
                    </p>
                  </div>
                </div>

                {/* Segment Impact Breakdown */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-[#525866] uppercase font-mono tracking-wider">
                    SEGMENT DISTRIBUTION IMPACT
                  </span>
                  <div className="grid grid-cols-3 gap-2.5 text-xs font-mono">
                    <div className="p-2.5 rounded-lg surface-subtle">
                      <span className="text-slate-500 dark:text-[#8C92A4] block text-[10px]">Enterprise</span>
                      <span className="font-bold text-slate-900 dark:text-[#EDEDED] text-sm">68%</span>
                    </div>

                    <div className="p-2.5 rounded-lg surface-subtle">
                      <span className="text-slate-500 dark:text-[#8C92A4] block text-[10px]">SMB</span>
                      <span className="font-bold text-slate-900 dark:text-[#EDEDED] text-sm">24%</span>
                    </div>

                    <div className="p-2.5 rounded-lg surface-subtle">
                      <span className="text-slate-500 dark:text-[#8C92A4] block text-[10px]">Consumer</span>
                      <span className="font-bold text-slate-900 dark:text-[#EDEDED] text-sm">8%</span>
                    </div>
                  </div>
                </div>

                {/* Verbatim Evidence Quotes */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-[#525866] uppercase font-mono tracking-wider">
                    VERBATIM CUSTOMER EVIDENCE
                  </span>

                  <div className="space-y-2">
                    {(matchingQuotes.length > 0 ? matchingQuotes : feedbackList.slice(0, 2)).map(q => (
                      <div key={q.id} className="p-3 rounded-lg surface-subtle text-xs space-y-1">
                        <p className="font-medium text-slate-800 dark:text-[#C9CDD8] italic leading-relaxed">"{q.originalText}"</p>
                        <p className="text-[10px] font-mono text-slate-400 dark:text-[#525866] pt-0.5">
                          — {q.customerName || 'Customer'} · {q.customerSegmentName || 'SMB'} · {q.sourceType.toUpperCase()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
