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
  const { feedbackList, painPoints, opportunities, roadmapItems, decisions, isDemoMode } = useTraceStore();

  const totalFeedback = feedbackList.length;
  const totalPainPoints = painPoints.length;
  const emergingCount = painPoints.filter(p => p.isEmerging).length;
  const openOppsCount = opportunities.filter(o => o.status === 'suggested').length;

  const emergingSpikes = painPoints.filter(p => p.isEmerging);
  const topThemes = painPoints.slice(0, 4);
  const recentDecisions = decisions.slice(0, 3);

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1E293B] pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Good morning
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            Customer feedback overview · Last 30 days
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/sources"
            className="px-3 py-1.5 rounded-md bg-[#2E8B75] hover:bg-[#1F6B58] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import feedback</span>
          </Link>
        </div>
      </div>

      {/* KPI Row (Simple white surface cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-lg surface-card space-y-1">
          <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase">FEEDBACK RECORDS</span>
          <p className="text-2xl font-bold font-mono-numbers text-slate-900 dark:text-white tracking-tight">
            {totalFeedback.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 font-mono">Total imported evidence</p>
        </div>

        <div className="p-4 rounded-lg surface-card space-y-1">
          <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase">PAIN POINTS</span>
          <p className="text-2xl font-bold font-mono-numbers text-slate-900 dark:text-white tracking-tight">
            {totalPainPoints}
          </p>
          <p className="text-[10px] text-slate-400 font-mono">Clustered problem items</p>
        </div>

        <div className="p-4 rounded-lg surface-card space-y-1">
          <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase">EMERGING ISSUES</span>
          <p className="text-2xl font-bold font-mono-numbers text-rose-600 dark:text-rose-400 tracking-tight">
            {emergingCount}
          </p>
          <p className="text-[10px] text-slate-400 font-mono">Velocity spikes detected</p>
        </div>

        <div className="p-4 rounded-lg surface-card space-y-1">
          <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase">OPEN OPPORTUNITIES</span>
          <p className="text-2xl font-bold font-mono-numbers text-slate-900 dark:text-white tracking-tight">
            {openOppsCount}
          </p>
          <p className="text-[10px] text-slate-400 font-mono">Awaiting PM decision</p>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Attention Required & What Customers Are Telling You */}
        <div className="lg:col-span-2 space-y-5">
          {/* Section: Attention Required */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                ATTENTION REQUIRED ({emergingSpikes.length})
              </h2>
            </div>

            <div className="space-y-2.5">
              {emergingSpikes.length === 0 ? (
                <div className="p-4 rounded-lg surface-card text-xs text-slate-500 text-center">
                  No critical velocity spikes currently detected.
                </div>
              ) : (
                emergingSpikes.map(issue => (
                  <div
                    key={issue.id}
                    className="p-4 rounded-lg surface-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 border-l-rose-500"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          {issue.title}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                          Critical
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-1">
                        {issue.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-right">
                      <div>
                        <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                          +{issue.velocityRate || 34}%
                        </span>
                        <p className="text-[10px] text-slate-400 font-mono">{issue.totalMentions} reports</p>
                      </div>

                      <Link
                        to="/insights"
                        className="px-2.5 py-1 rounded bg-slate-100 dark:bg-[#334155] hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
                      >
                        View Cluster
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section: What Customers Are Telling You */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                WHAT CUSTOMERS ARE TELLING YOU (MAJOR THEMES)
              </h2>
              <Link to="/insights" className="text-xs font-semibold text-[#2E8B75] dark:text-[#3B9B85] hover:underline">
                View All Clusters →
              </Link>
            </div>

            <div className="space-y-2.5">
              {topThemes.map(theme => (
                <div key={theme.id} className="p-4 rounded-lg surface-card space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {theme.title}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-500">
                      {theme.totalMentions} customer mentions
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {theme.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-[#334155] flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>Impact: Enterprise (68%), SMB (32%)</span>
                    <span className="font-semibold text-[#2E8B75] dark:text-[#3B9B85]">
                      {theme.isEmerging ? 'Emerging Spike' : 'Stable Volume'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry & Product Decisions */}
        <div className="space-y-5">
          {/* Feedback Velocity Telemetry Chart */}
          <div className="p-4 rounded-lg surface-card space-y-3">
            <h2 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              FEEDBACK VELOCITY TREND
            </h2>
            <div className="h-44">
              <TelemetryChart />
            </div>
          </div>

          {/* Section: Product Decisions */}
          <div className="p-4 rounded-lg surface-card space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-2">
              <h2 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                RECENT DECISIONS ({decisions.length})
              </h2>
              <Link to="/decisions" className="text-xs font-semibold text-[#2E8B75] dark:text-[#3B9B85] hover:underline">
                Memory Log →
              </Link>
            </div>

            <div className="space-y-3">
              {recentDecisions.length === 0 ? (
                <p className="text-xs text-slate-400">No decisions recorded yet.</p>
              ) : (
                recentDecisions.map(dec => (
                  <div key={dec.id} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px]">
                        {dec.opportunityTitle}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold uppercase ${
                        dec.decision === 'accepted'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                      }`}>
                        {dec.decision}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
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
