import React from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import {
  Zap,
  Flame,
  ArrowRight,
  Sparkles,
  Calendar,
  Filter,
  CheckCircle2,
  Play,
  Apple,
  MessageSquare,
  TrendingUp,
  Target,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useTraceStore } from '@/lib/store';
import { TelemetryChart } from '@/components/analytics/TelemetryChart';

export function OverviewPage() {
  const { feedbackList, painPoints, opportunities, roadmapItems, decisions } = useTraceStore();

  const emergingSpike = painPoints.find(p => p.isEmerging) || painPoints[0];
  const topProblems = painPoints.slice(0, 3);
  const suggestedOpportunities = opportunities.filter(o => o.status === 'suggested');

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 text-slate-900 dark:text-slate-100"
    >
      {/* Greeting Header & Filter Bar */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            Good morning, Alex <span className="animate-bounce inline-block">👋</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Trace has synthesized <strong className="text-indigo-600 dark:text-indigo-400">{feedbackList.length} statements</strong> into <strong className="text-slate-900 dark:text-slate-100">{painPoints.length} validated struggle patterns</strong> today.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 card-shadow cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Last 30 days</span>
          </div>

          <Link
            to="/sources"
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 card-shadow transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ingest Data</span>
          </Link>
        </div>
      </motion.div>

      {/* Top 4 KPI Metrics Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 card-shadow space-y-3 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Feedback Statements</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono-numbers font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30">
              ↑ 18.6%
            </span>
          </div>

          <div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono-numbers tracking-tight">{feedbackList.length}</span>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">from 5 connected channels</p>
          </div>

          <div className="h-7 w-full pt-1">
            <svg className="w-full h-full text-indigo-500" viewBox="0 0 100 25" fill="none">
              <path d="M0 20 Q 20 15, 40 18 T 80 5 T 100 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </motion.div>

        {/* Card 2 */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 card-shadow space-y-3 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Extracted Atoms</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono-numbers font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/30">
              98.4% Acc.
            </span>
          </div>

          <div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono-numbers tracking-tight">
              {feedbackList.reduce((acc, f) => acc + (f.atoms?.length || 1), 0)}
            </span>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">clause-level intent extractions</p>
          </div>

          <div className="h-7 w-full pt-1">
            <svg className="w-full h-full text-emerald-500" viewBox="0 0 100 25" fill="none">
              <path d="M0 18 Q 30 22, 60 10 T 100 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </motion.div>

        {/* Card 3 */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 card-shadow space-y-3 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Emerging Anomalies</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono-numbers font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30">
              High Velocity
            </span>
          </div>

          <div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono-numbers tracking-tight">
              {painPoints.filter(p => p.isEmerging).length} Spikes
            </span>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">abnormal velocity surge</p>
          </div>

          <div className="h-7 w-full pt-1">
            <svg className="w-full h-full text-rose-500" viewBox="0 0 100 25" fill="none">
              <path d="M0 22 Q 40 20, 70 15 T 100 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </motion.div>

        {/* Card 4 */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 card-shadow space-y-3 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Preserved Decisions</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono-numbers font-bold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/30">
              Institutional Memory
            </span>
          </div>

          <div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 font-mono-numbers tracking-tight">
              {decisions.length} Decisions
            </span>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">linked to roadmap & evidence</p>
          </div>

          <div className="h-7 w-full pt-1">
            <svg className="w-full h-full text-sky-500" viewBox="0 0 100 25" fill="none">
              <path d="M0 15 Q 35 8, 70 12 T 100 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </motion.div>
      </motion.div>

      {/* Emerging Spike Critical Anomaly Banner */}
      {emergingSpike && (
        <motion.div
          variants={itemVariants}
          className="p-5 rounded-2xl bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border border-rose-200 dark:border-rose-900/50 card-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-600 text-white">
                  Emerging Anomaly Spike
                </span>
                <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                  +{emergingSpike.trendPercentage}% velocity multiplier ({emergingSpike.velocityMultiplier}x)
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                {emergingSpike.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-3xl">
                {emergingSpike.description}
              </p>
            </div>
          </div>

          <Link
            to="/insights"
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 self-start md:self-center transition-colors shadow-xs"
          >
            <span>Triage Anomaly</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      )}

      {/* Main 2-Column Content: Struggle Telemetry Chart + Top Problem Clusters */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Telemetry Chart */}
        <div className="lg:col-span-8 space-y-6">
          <TelemetryChart />

          {/* AI Executive Synthesis Summary */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 card-shadow space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Trace Intelligence Synthesis
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Updated 4m ago</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Customer friction in recent cycles is heavily concentrated in <strong>Mobile Stability (Android 15 crash loops)</strong> and <strong>Export Processing (large batch PDF generation timeouts)</strong>. Enterprise churn risk remains elevated for Okta SAML customers facing redirect loops.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Top Risk Segment</p>
                <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">Enterprise Accounts (38%)</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Primary Driver</p>
                <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">App Crash on Startup</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Recommended Action</p>
                <p className="font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">Rollback v4.13.0 Engine</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Prioritized Opportunities & Top Problems */}
        <div className="lg:col-span-4 space-y-6">
          {/* Actionable Opportunities */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 card-shadow space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Ready for Decision
                </h3>
              </div>
              <Link to="/opportunities" className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                View all ({opportunities.length})
              </Link>
            </div>

            <div className="space-y-2.5">
              {suggestedOpportunities.slice(0, 3).map((opp) => (
                <Link
                  key={opp.id}
                  to="/opportunities"
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800/80 block transition-colors group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-numbers font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30">
                      Score: {opp.overallPriorityScore}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono-numbers">{opp.evidenceCount} quotes</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {opp.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {opp.problemStatement}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Top Problem Clusters */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 card-shadow space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Top Problem Clusters
                </h3>
              </div>
              <Link to="/insights" className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Explore
              </Link>
            </div>

            <div className="space-y-3">
              {topProblems.map((p, idx) => (
                <div key={p.id} className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-slate-100 truncate pr-2">
                      {idx + 1}. {p.title}
                    </span>
                    <span className="font-mono-numbers text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                      {p.frequency} mentions
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, (p.frequency / 350) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
