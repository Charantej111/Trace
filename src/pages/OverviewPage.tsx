import React from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import {
  Zap,
  Flame,
  ArrowRight,
  Sparkles,
  Target,
  ShieldCheck,
  ChevronRight,
  Layers,
  Activity,
  ArrowUpRight,
  MessageSquare
} from 'lucide-react';
import { useTraceStore } from '@/lib/store';
import { TelemetryChart } from '@/components/analytics/TelemetryChart';

export function OverviewPage() {
  const { feedbackList, painPoints, opportunities, roadmapItems, decisions } = useTraceStore();

  // Dynamic calculations from actual store data
  const totalFeedback = feedbackList.length;
  const allAtoms = feedbackList.flatMap(f => f.atoms || []);
  const totalAtoms = allAtoms.length;
  const criticalAtomsCount = allAtoms.filter(a => a.severity === 'critical').length;
  const bugsCount = allAtoms.filter(a => a.intent === 'bug_report').length;
  const featureRequestsCount = allAtoms.filter(a => a.intent === 'feature_request').length;
  const complaintsCount = allAtoms.filter(a => a.intent === 'complaint').length;
  const praiseCount = allAtoms.filter(a => a.intent === 'praise').length;

  const emergingSpikes = painPoints.filter(p => p.isEmerging);
  const topProblems = painPoints.slice(0, 5);
  const suggestedOpportunities = opportunities.filter(o => o.status === 'suggested');

  // Dynamic source counts
  const sourceCounts: Record<string, number> = {};
  feedbackList.forEach(f => {
    const src = f.sourceType || 'other';
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5 text-slate-900 dark:text-slate-100"
    >
      {/* Top Header / Actions */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Executive Summary
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Aggregated customer feedback metrics, extracted clause atoms, and prioritized initiatives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/sources"
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ingest Feedback</span>
          </Link>
        </div>
      </motion.div>

      {/* Real Dynamic Metrics Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl surface-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider">
              Feedback Statements
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400">
              {Object.keys(sourceCounts).length} Channels
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono-numbers tracking-tight">
              {totalFeedback}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">total records</span>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-[#171b26] text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
            {Object.entries(sourceCounts).map(([src, count], idx) => (
              <React.Fragment key={src}>
                {idx > 0 && <span>·</span>}
                <span className="capitalize">{src.replace('_', ' ')}: <strong>{count}</strong></span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl surface-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider">
              Extracted Clause Atoms
            </span>
            {criticalAtomsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-numbers font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40">
                {criticalAtomsCount} critical
              </span>
            )}
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono-numbers tracking-tight">
              {totalAtoms}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">parsed clauses</span>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-[#171b26] text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <span>Bugs: <strong>{bugsCount}</strong></span>
            <span>·</span>
            <span>Requests: <strong>{featureRequestsCount}</strong></span>
            <span>·</span>
            <span>Complaints: <strong>{complaintsCount}</strong></span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl surface-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider">
              Problem Clusters
            </span>
            {emergingSpikes.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-numbers font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40">
                {emergingSpikes.length} Emerging
              </span>
            )}
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono-numbers tracking-tight">
              {painPoints.length}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">synthesized themes</span>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-[#171b26] text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <span>Active Roadmaps: <strong>{roadmapItems.length}</strong></span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-2xl surface-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider">
              Decision Memory (PDR)
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Audit Log
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono-numbers tracking-tight">
              {decisions.length}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">preserved decisions</span>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-[#171b26] text-[10px] text-slate-500 dark:text-slate-400 font-mono">
            <span>Accepted: <strong>{decisions.filter(d => d.decision === 'accepted').length}</strong></span>
            <span>·</span>
            <span>Deferred: <strong>{decisions.filter(d => d.decision !== 'accepted').length}</strong></span>
          </div>
        </div>
      </motion.div>

      {/* Dynamic Emerging Spikes (Only if present in painPoints) */}
      {emergingSpikes.length > 0 && (
        <motion.div variants={itemVariants} className="space-y-2">
          {emergingSpikes.map(spike => (
            <div
              key={spike.id}
              className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 surface-card flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Flame className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-rose-600 text-white font-mono">
                      Velocity Spike
                    </span>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                      +{spike.trendPercentage}% Surge ({spike.velocityMultiplier}x baseline)
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs">
                    {spike.title}
                  </h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {spike.description}
                  </p>
                </div>
              </div>

              <div className="shrink-0 self-start md:self-center">
                <Link
                  to="/insights"
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
                >
                  <span>View Evidence</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Main Grid: Telemetry Chart + Ranked Lists */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left 8 Cols: Telemetry Chart & Recent Ingestion Feed */}
        <div className="lg:col-span-8 space-y-5">
          <TelemetryChart />

          {/* Recent Ingestion Stream Feed */}
          <div className="p-5 rounded-2xl surface-card space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#171b26] pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Recent Ingested Statements
                </h3>
              </div>
              <Link
                to="/inbox"
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
              >
                <span>View inbox ({feedbackList.length})</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {feedbackList.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 dark:border-[#1e2333] rounded-xl text-xs text-slate-400 space-y-1.5">
                  <p className="font-semibold text-slate-700 dark:text-slate-300">No Feedback Statements Yet</p>
                  <p className="text-[11px]">Upload a CSV or connect a source channel to ingest feedback.</p>
                </div>
              ) : (
                feedbackList.slice(0, 4).map((fb) => (
                  <div
                    key={fb.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#0f121a] border border-slate-200/80 dark:border-[#1e2333] text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {fb.customerName || 'Anonymous Account'}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-200/60 dark:bg-[#181d2a] text-slate-600 dark:text-slate-400 font-mono">
                          {fb.customerSegmentName}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(fb.sourceCreatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-slate-700 dark:text-slate-300 text-[11px] line-clamp-2 leading-relaxed">
                      "{fb.originalText}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Opportunities & Problem List */}
        <div className="lg:col-span-4 space-y-5">
          {/* Actionable Opportunities */}
          <div className="p-5 rounded-2xl surface-card space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#171b26] pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Prioritized Opportunities
                </h3>
              </div>
              <Link
                to="/opportunities"
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
              >
                <span>View all ({opportunities.length})</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {suggestedOpportunities.length === 0 ? (
                <p className="text-xs text-slate-400 p-4 text-center">No pending suggestions</p>
              ) : (
                suggestedOpportunities.slice(0, 3).map((opp) => (
                  <Link
                    key={opp.id}
                    to="/opportunities"
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#0f121a] hover:bg-slate-100/80 dark:hover:bg-[#161a26] border border-slate-200/80 dark:border-[#1e2333] block transition-all group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                        Score: {opp.overallPriorityScore}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono-numbers">
                        {opp.evidenceCount} links
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                      {opp.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {opp.problemStatement}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Top Problem Clusters */}
          <div className="p-5 rounded-2xl surface-card space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#171b26] pb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-500" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Top Problem Clusters
                </h3>
              </div>
              <Link
                to="/insights"
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
              >
                <span>Details</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {topProblems.length === 0 ? (
                <p className="text-xs text-slate-400 p-4 text-center">No problem clusters synthesized yet</p>
              ) : (
                topProblems.map((p, idx) => (
                  <div key={p.id} className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100 truncate pr-2">
                        {idx + 1}. {p.title}
                      </span>
                      <span className="font-mono-numbers text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                        {p.frequency} mentions
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-[#1a2030] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (p.frequency / Math.max(...painPoints.map(item => item.frequency), 1)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
