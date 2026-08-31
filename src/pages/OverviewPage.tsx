import React from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  ArrowRight,
  Target,
  ShieldCheck,
  ChevronRight,
  Layers,
  Activity,
  ArrowUpRight,
  MessageSquare,
  Zap,
  CheckCircle2,
  XCircle,
  Upload
} from 'lucide-react';
import { useTraceStore } from '@/lib/store';
import { TelemetryChart } from '@/components/analytics/TelemetryChart';

export function OverviewPage() {
  const { feedbackList, painPoints, opportunities, roadmapItems, decisions, resetToDemoData } = useTraceStore();

  const totalFeedback = feedbackList.length;
  const totalPainPoints = painPoints.length;
  const emergingCount = painPoints.filter(p => p.isEmerging).length;
  const openOppsCount = opportunities.filter(o => o.status === 'suggested').length;

  const emergingSpikes = painPoints.filter(p => p.isEmerging);
  const topThemes = painPoints.slice(0, 4);
  const recentDecisions = decisions.slice(0, 3);

  return (
    <div className="space-y-5 text-slate-900 dark:text-[#EDEDED]">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1F232B] pb-3.5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#EDEDED] tracking-tight">
            Good morning
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#8C92A4] mt-0.5 font-mono">
            Customer feedback overview · Last 30 days
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/sources"
            className="px-3.5 py-1.5 rounded-md bg-[#2E8B75] hover:bg-[#1F6B58] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import feedback</span>
          </Link>
        </div>
      </div>

      {/* Zero State Onboarding Banner if 0 feedback records */}
      {totalFeedback === 0 && (
        <div className="p-8 rounded-xl surface-card text-center space-y-3 border-2 border-dashed border-slate-200 dark:border-[#232833]">
          <div className="w-10 h-10 rounded-lg bg-[#2E8B75]/10 text-[#2E8B75] dark:text-[#10B981] flex items-center justify-center mx-auto">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-[#EDEDED]">
              Turn customer feedback into defensible product decisions
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#8C92A4] max-w-md mx-auto mt-1 leading-relaxed">
              Start by bringing your first customer feedback dataset into Trace from CSV, Excel, JSON, or Quick Paste.
            </p>
          </div>
          <div className="pt-1 flex items-center justify-center gap-3">
            <Link
              to="/sources"
              className="px-4 py-1.5 rounded-md bg-[#2E8B75] hover:bg-[#1F6B58] text-white font-semibold text-xs transition-colors shadow-2xs"
            >
              Import Your First Feedback
            </Link>
            <button
              onClick={resetToDemoData}
              className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-[#181B22] text-slate-700 dark:text-[#EDEDED] font-semibold text-xs transition-colors border border-transparent dark:border-[#232833]"
            >
              Explore Sample Dataset
            </button>
          </div>
        </div>
      )}

      {/* Handcrafted Split KPI Bar */}
      <div className="p-4 rounded-xl surface-card flex flex-col md:flex-row md:items-center justify-between gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-[#1F232B]">
        <div className="flex-1 md:pr-4 space-y-1">
          <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider">TOTAL FEEDBACK</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-numbers text-slate-900 dark:text-[#EDEDED]">
              {totalFeedback.toLocaleString()}
            </span>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-[#10B981] font-semibold">
              +12.4% vs prev
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-[#8C92A4] font-mono">Verified customer statements</p>
        </div>

        <div className="flex-1 md:px-4 pt-3 md:pt-0 space-y-1">
          <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider">PROBLEM CLUSTERS</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-numbers text-slate-900 dark:text-[#EDEDED]">
              {totalPainPoints}
            </span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-[#8C92A4]">
              Active themes
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-[#8C92A4] font-mono">Clustered issue patterns</p>
        </div>

        <div className="flex-1 md:px-4 pt-3 md:pt-0 space-y-1">
          <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider">EMERGING SPIKES</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-numbers text-rose-600 dark:text-rose-400">
              {emergingCount}
            </span>
            <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400 font-semibold">
              Attention needed
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-[#8C92A4] font-mono">High velocity issues</p>
        </div>

        <div className="flex-1 md:pl-4 pt-3 md:pt-0 space-y-1">
          <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider">OPEN OPPORTUNITIES</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-numbers text-slate-900 dark:text-[#EDEDED]">
              {openOppsCount}
            </span>
            <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
              Awaiting review
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-[#8C92A4] font-mono">Ready for PM decision</p>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Section: Attention Required */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider">
                ATTENTION REQUIRED ({emergingSpikes.length})
              </h2>
            </div>

            <div className="space-y-2">
              {emergingSpikes.length === 0 ? (
                <div className="p-4 rounded-xl surface-card text-xs text-slate-500 dark:text-[#8C92A4] text-center">
                  No critical velocity spikes currently detected.
                </div>
              ) : (
                emergingSpikes.map(issue => (
                  <div
                    key={issue.id}
                    className="p-3.5 rounded-xl surface-card surface-card-hover flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-2 border-l-rose-500"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="status-dot status-dot-critical"></span>
                        <span className="font-semibold text-slate-900 dark:text-[#EDEDED] text-xs truncate">
                          {issue.title}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
                          Critical
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-[#8C92A4] text-xs truncate pl-3.5">
                        {issue.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-right pl-3.5 sm:pl-0">
                      <div>
                        <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                          +{issue.trendPercentage || 34}%
                        </span>
                        <p className="text-[10px] text-slate-400 dark:text-[#525866] font-mono">{issue.frequency} reports</p>
                      </div>

                      <Link
                        to="/insights"
                        className="px-2.5 py-1 rounded bg-slate-100 dark:bg-[#181B22] hover:bg-slate-200 dark:hover:bg-[#232833] text-slate-700 dark:text-[#EDEDED] font-semibold text-xs transition-colors border border-transparent dark:border-[#232833]"
                      >
                        View Cluster
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section: Major Customer Themes */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider">
                WHAT CUSTOMERS ARE TELLING YOU (MAJOR THEMES)
              </h2>
              <Link to="/insights" className="text-xs font-semibold text-[#2E8B75] dark:text-[#10B981] hover:underline font-mono">
                View All Clusters →
              </Link>
            </div>

            <div className="space-y-2">
              {topThemes.map(theme => (
                <div key={theme.id} className="p-3.5 rounded-xl surface-card surface-card-hover space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-[#EDEDED] text-xs">
                      {theme.title}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-500 dark:text-[#8C92A4]">
                      {theme.frequency} customer mentions
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-[#8C92A4] leading-relaxed">
                    {theme.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-[#1F232B] flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-[#525866]">
                    <span>Enterprise (68%) · SMB (32%)</span>
                    <span className="font-semibold text-[#2E8B75] dark:text-[#10B981]">
                      {theme.isEmerging ? 'Emerging Spike' : 'Stable Volume'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Feedback Velocity Telemetry Chart */}
          <TelemetryChart />

          {/* Section: Product Decisions */}
          <div className="p-4 rounded-xl surface-card space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1F232B] pb-2">
              <h2 className="text-xs font-mono font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider">
                RECENT DECISIONS ({decisions.length})
              </h2>
              <Link to="/decisions" className="text-xs font-semibold text-[#2E8B75] dark:text-[#10B981] hover:underline font-mono">
                Memory Log →
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentDecisions.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-[#525866]">No decisions recorded yet.</p>
              ) : (
                recentDecisions.map(dec => (
                  <div key={dec.id} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-[#EDEDED] truncate max-w-42.5">
                        {dec.opportunityTitle}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                        dec.decision === 'accepted'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-[#10B981] border border-emerald-200 dark:border-emerald-900/60'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60'
                      }`}>
                        {dec.decision}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-[#8C92A4] line-clamp-2 leading-relaxed">
                      {dec.rationale}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
