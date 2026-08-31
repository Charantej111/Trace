import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTraceStore } from '@/lib/store';
import {
  TrendingUp,
  Zap,
  Split,
  ChevronRight,
  Flame,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export function InsightsPage() {
  const { painPoints, insights } = useTraceStore();

  const [selectedInsight, setSelectedInsight] = useState(() => {
    return insights.find(i => i.painPointId) || insights[0];
  });

  const [activeTab, setActiveTab] = useState<'pain_points' | 'emerging' | 'divergent'>('pain_points');

  const topPainPoints = painPoints.filter(p => !p.isEmerging).slice(0, 5);
  const emergingPainPoints = painPoints.filter(p => p.isEmerging);
  const divergentInsights = insights.filter(i => i.insightType === 'divergent_signal');

  return (
    <div className="space-y-4 text-slate-900 dark:text-slate-100">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-[#1a1e2b] pb-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Problem Intelligence & Evidence Graph
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Synthesized customer struggle clusters verified by supporting and contradicting ground-truth feedback.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#0f121a] border border-slate-200 dark:border-[#1e2333] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('pain_points')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'pain_points'
                ? 'bg-white dark:bg-[#1a2030] text-slate-900 dark:text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Top Problem Clusters ({topPainPoints.length})
          </button>

          <button
            onClick={() => setActiveTab('emerging')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'emerging'
                ? 'bg-rose-600 text-white shadow-xs font-bold'
                : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50/20'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Emerging Velocity Spikes ({emergingPainPoints.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('divergent')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'divergent'
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>Divergent Signals ({divergentInsights.length})</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left 6 Cols: Problem Cards */}
        <div className="lg:col-span-6 space-y-2.5">
          <div className="flex items-center justify-between px-1 text-[11px] font-mono text-slate-400">
            <span>
              {activeTab === 'pain_points'
                ? 'SYNTHESIZED CLUSTERS'
                : activeTab === 'emerging'
                ? 'VELOCITY ANOMALIES'
                : 'CONFLICTING FEEDBACK SIGNALS'}
            </span>
          </div>

          <div className="space-y-2.5">
            {activeTab === 'pain_points' && (
              topPainPoints.length === 0 ? (
                <div className="p-8 text-center surface-card rounded-2xl text-xs text-slate-400">
                  No problem clusters discovered yet. Ingest feedback statements to cluster issues.
                </div>
              ) : (
                topPainPoints.map((pp) => {
                  const relatedInsight = insights.find(i => i.painPointId === pp.id) || insights[0];
                  const isSelected = selectedInsight?.painPointId === pp.id;

                  return (
                    <div
                      key={pp.id}
                      onClick={() => setSelectedInsight(relatedInsight)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 text-xs surface-card ${
                        isSelected
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500/80 ring-1 ring-indigo-500/30'
                          : 'hover:bg-slate-50 dark:hover:bg-[#131620]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            pp.severity === 'critical'
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/40'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/40'
                          }`}>
                            {pp.severity}
                          </span>
                          <span className="font-mono-numbers text-[10px] text-slate-400 font-bold">
                            {pp.frequency} verified mentions
                          </span>
                        </div>
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono-numbers text-[11px] font-bold">
                          +{pp.trendPercentage}% velocity
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-snug">
                        {pp.title}
                      </h4>

                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                        {pp.description}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-[#171b26] text-[11px] text-slate-400">
                        <span className="font-mono text-[10px]">
                          COHORTS: {pp.affectedSegments?.map(s => `${s.segment} (${s.percentage}%)`).join(', ') || 'General'}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    </div>
                  );
                })
              )
            )}

            {activeTab === 'emerging' && (
              emergingPainPoints.length === 0 ? (
                <div className="p-8 text-center surface-card rounded-2xl text-xs text-slate-400">
                  No emerging velocity spikes currently detected.
                </div>
              ) : (
                emergingPainPoints.map((pp) => {
                  const relatedInsight = insights.find(i => i.painPointId === pp.id) || insights[0];
                  const isSelected = selectedInsight?.painPointId === pp.id;

                  return (
                    <div
                      key={pp.id}
                      onClick={() => setSelectedInsight(relatedInsight)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 text-xs surface-card ${
                        isSelected
                          ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-500/80 ring-1 ring-rose-500/30'
                          : 'hover:bg-slate-50 dark:hover:bg-[#131620]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-600 text-white">
                          Velocity Multiplier: {pp.velocityMultiplier}x
                        </span>
                        <span className="text-rose-600 dark:text-rose-400 font-mono-numbers text-[11px] font-bold">
                          +{pp.trendPercentage}% surge
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-snug">
                        {pp.title}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                        {pp.description}
                      </p>
                    </div>
                  );
                })
              )
            )}

            {activeTab === 'divergent' && (
              divergentInsights.length === 0 ? (
                <div className="p-8 text-center surface-card rounded-2xl text-xs text-slate-400">
                  No divergent feedback signals found.
                </div>
              ) : (
                divergentInsights.map((ins) => {
                  const isSelected = selectedInsight?.id === ins.id;

                  return (
                    <div
                      key={ins.id}
                      onClick={() => setSelectedInsight(ins)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 text-xs surface-card ${
                        isSelected
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500/80 ring-1 ring-indigo-500/30'
                          : 'hover:bg-slate-50 dark:hover:bg-[#131620]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
                          Polarized Signal
                        </span>
                        <span className="text-[11px] font-mono-numbers text-slate-400">
                          {ins.supportingEvidenceCount} for / {ins.contradictingEvidenceCount} counter
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{ins.title}</h4>
                      <p className="text-slate-600 dark:text-slate-300 text-xs">{ins.summary}</p>
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>

        {/* Right 6 Cols: Ground-Truth Evidence Deck */}
        <div className="lg:col-span-6 sticky top-16 space-y-3">
          <div className="px-1 text-[11px] font-mono text-slate-400">
            <span>GROUND-TRUTH EVIDENCE GRAPH</span>
          </div>

          {selectedInsight ? (
            <div className="p-5 rounded-2xl surface-card space-y-4 text-xs">
              <div className="border-b border-slate-100 dark:border-[#1c2230] pb-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/40">
                    Confidence: {selectedInsight.confidence}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono-numbers">
                    {selectedInsight.frequency} ground-truth atoms
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                  {selectedInsight.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                  {selectedInsight.summary}
                </p>
              </div>

              {/* Supporting Verbatim Quotes */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Supporting Verbatim Evidence ({selectedInsight.evidence?.filter(e => e.evidenceType === 'supporting').length || 0})
                </span>

                <div className="space-y-2">
                  {selectedInsight.evidence
                    ?.filter(e => e.evidenceType === 'supporting')
                    .map((ev, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30 space-y-1.5"
                      >
                        <p className="text-slate-800 dark:text-slate-200 italic leading-relaxed text-xs">
                          "{ev.quoteText}"
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>Segment: {ev.customerSegment || 'SMB'}</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono-numbers">
                            {(ev.relevanceScore * 100).toFixed(0)}% relevance match
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Contradicting / Counter Evidence */}
              {selectedInsight.evidence?.some(e => e.evidenceType === 'contradicting') && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#171b26]">
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Contradicting / Counter Signal ({selectedInsight.evidence.filter(e => e.evidenceType === 'contradicting').length})
                  </span>

                  <div className="space-y-2">
                    {selectedInsight.evidence
                      .filter(e => e.evidenceType === 'contradicting')
                      .map((ev, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/30 space-y-1.5"
                        >
                          <p className="text-slate-800 dark:text-slate-200 italic leading-relaxed text-xs">
                            "{ev.quoteText}"
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>Segment: {ev.customerSegment || 'Enterprise'}</span>
                            <span className="font-bold text-rose-600 dark:text-rose-400 font-mono-numbers">
                              {(ev.relevanceScore * 100).toFixed(0)}% counter relevance
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Action Flow */}
              <div className="pt-2 border-t border-slate-100 dark:border-[#171b26] flex justify-end">
                <Link
                  to="/opportunities"
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <span>Evaluate as Opportunity</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center surface-card rounded-2xl text-xs text-slate-400">
              Select an insight from the left panel to inspect evidence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
