import React, { useState, useEffect, useMemo } from 'react';
import { useTraceStore } from '@/lib/store';
import {
  AuditStatisticsCalculator,
  AuditStatistics,
  AuditSummarySynthesizer,
  AuditSummaryResult,
  DetailedAuditAnalyzer,
  DetailedPainPointAnalysis
} from '@/intelligence/audit';
import { Feedback, FeedbackAtom } from '@/types/trace';
import { getStageHumanLabel } from '@/lib/stage-utils';
import { FeedbackDetailDrawer } from '@/components/feedback/FeedbackDetailDrawer';
import {
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Star,
  Activity,
  ArrowRight,
  TrendingUp,
  Layers,
  Heart,
  Smile,
  Frown,
  CheckCircle2,
  ExternalLink,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function AuditPage() {
  const {
    workspace,
    feedbackList,
    themes,
    painPoints,
    insights,
    opportunities,
    customerSegments,
    activeJob,
    activeStage,
    isProcessing
  } = useTraceStore();

  const [auditResult, setAuditResult] = useState<AuditSummaryResult | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed_analysis' | 'emotions'>('overview');

  // Extract all atoms from feedbackList
  const allAtoms: FeedbackAtom[] = useMemo(() => {
    return feedbackList.flatMap(f => f.atoms || []);
  }, [feedbackList]);

  // Compute 100% deterministic audit statistics directly from persisted records
  const statistics: AuditStatistics = useMemo(() => {
    return AuditStatisticsCalculator.calculate(
      feedbackList,
      allAtoms,
      themes,
      painPoints,
      opportunities,
      customerSegments
    );
  }, [feedbackList, allAtoms, themes, painPoints, opportunities, customerSegments]);

  // Build detailed PM pain point analysis
  const detailedAnalysis: DetailedPainPointAnalysis[] = useMemo(() => {
    return DetailedAuditAnalyzer.analyzePainPoints(
      painPoints,
      allAtoms,
      feedbackList,
      themes,
      insights,
      opportunities,
      customerSegments
    );
  }, [painPoints, allAtoms, feedbackList, themes, insights, opportunities, customerSegments]);

  // Generate audit summary on initial load or evidence change
  useEffect(() => {
    let isMounted = true;

    async function loadAuditSummary() {
      setIsSynthesizing(true);
      try {
        const result = await AuditSummarySynthesizer.synthesize(
          workspace.id,
          statistics,
          allAtoms,
          themes,
          painPoints,
          opportunities
        );
        if (isMounted) {
          setAuditResult(result);
        }
      } catch (err) {
        console.error('Audit synthesis failed:', err);
      } finally {
        if (isMounted) {
          setIsSynthesizing(false);
        }
      }
    }

    loadAuditSummary();

    return () => {
      isMounted = false;
    };
  }, [workspace.id, statistics, allAtoms, themes, painPoints, opportunities]);

  // Check active processing jobs
  const isJobProcessing = isProcessing || (activeJob !== null && (activeJob.status === 'processing' || activeJob.status === 'pending'));

  const openEvidenceDrawerByAtomId = (atomId: string) => {
    const parentFeedback = feedbackList.find(f => (f.atoms || []).some(a => a.id === atomId));
    if (parentFeedback) {
      setSelectedFeedback(parentFeedback);
    }
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-[#EDEDED]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1F232B] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-[#EDEDED] tracking-tight">
                Audit Intelligence & Executive Overview
              </h1>
              <p className="text-xs text-slate-500 dark:text-[#8C92A4] mt-0.5 font-mono">
                Evidence-based sentiment distribution, emotional breakdown, and friction analysis
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation & Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 rounded-lg surface-subtle border border-slate-200 dark:border-white/10 text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Executive Summary
            </button>
            <button
              onClick={() => setActiveTab('detailed_analysis')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                activeTab === 'detailed_analysis'
                  ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Detailed PM Analysis ({detailedAnalysis.length})
            </button>
            <button
              onClick={() => setActiveTab('emotions')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                activeTab === 'emotions'
                  ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Emotional Breakdown
            </button>
          </div>

          <button
            onClick={() => window.location.reload()}
            disabled={isJobProcessing || isSynthesizing}
            className="p-2 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 transition-colors"
            title="Refresh audit intelligence"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isJobProcessing || isSynthesizing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Processing Status Banner */}
      {isJobProcessing && (
        <div className="p-3.5 rounded-xl border border-teal-500/30 bg-teal-500/5 text-teal-800 dark:text-teal-300 text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <RefreshCw className="w-4 h-4 animate-spin text-teal-600 dark:text-teal-400 shrink-0" />
            <div>
              <span className="font-semibold text-slate-900 dark:text-[#EDEDED]">
                {getStageHumanLabel(activeStage?.stage)}
              </span>
              <span className="text-slate-500 dark:text-[#8C92A4] ml-2 text-[11px]">
                {activeJob?.processedRecords || 0} of {activeJob?.totalRecords || 0} records analyzed
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300">
            In Progress
          </span>
        </div>
      )}

      {/* Insufficient Evidence Banner (Section 11) */}
      {!statistics.evidenceSufficiency.isSufficient && (
        <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-amber-900 dark:text-amber-200 text-xs space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <h3 className="font-bold text-sm">Insufficient Evidence Threshold</h3>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {statistics.evidenceSufficiency.message}
          </p>
          <div className="pt-2 flex items-center gap-3">
            <Link
              to="/sources"
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <span>Import More Evidence</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Deterministic Audit Stat Cards (100% Persisted Supabase Data) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl surface-card border border-slate-200 dark:border-white/10 space-y-1">
          <span className="text-slate-400 font-mono text-[10px] uppercase block tracking-wider">
            Verified Atoms
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {statistics.totalVerifiedAtoms}
            </span>
            <span className="text-xs font-mono text-slate-400">
              from {statistics.totalFeedback} reviews
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono pt-1">
            {statistics.distinctCustomers} distinct authors
          </div>
        </div>

        <div className="p-4 rounded-xl surface-card border border-slate-200 dark:border-white/10 space-y-1">
          <span className="text-slate-400 font-mono text-[10px] uppercase block tracking-wider">
            Average Sentiment
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold ${
              statistics.averageSentiment >= 0.25
                ? 'text-emerald-600 dark:text-emerald-400'
                : statistics.averageSentiment <= -0.25
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}>
              {statistics.averageSentiment > 0 ? `+${statistics.averageSentiment}` : statistics.averageSentiment}
            </span>
            <span className="text-xs font-mono text-slate-400">[-1.0 to +1.0]</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono pt-1 text-slate-500">
            <span className="text-emerald-600 dark:text-emerald-400">+{statistics.positiveAtomCount} pos</span>
            <span>·</span>
            <span className="text-rose-600 dark:text-rose-400">-{statistics.negativeAtomCount} neg</span>
          </div>
        </div>

        <div className="p-4 rounded-xl surface-card border border-slate-200 dark:border-white/10 space-y-1">
          <span className="text-slate-400 font-mono text-[10px] uppercase block tracking-wider">
            Dominant Emotion
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900 dark:text-white capitalize truncate">
              {statistics.emotionalDistribution[0]?.emotion || 'Neutral'}
            </span>
            <span className="text-xs font-mono text-teal-600 dark:text-teal-400 font-bold">
              {statistics.emotionalDistribution[0]?.percentage || 0}%
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono pt-1 truncate">
            Avg intensity: {(statistics.averageEmotionalIntensity * 100).toFixed(0)}%
          </div>
        </div>

        <div className="p-4 rounded-xl surface-card border border-slate-200 dark:border-white/10 space-y-1">
          <span className="text-slate-400 font-mono text-[10px] uppercase block tracking-wider">
            Downstream Strategy
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {statistics.totalOpportunities}
            </span>
            <span className="text-xs font-mono text-slate-400">opportunities</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono pt-1 truncate">
            across {statistics.totalPainPoints} pain points
          </div>
        </div>
      </div>

      {/* TAB 1: EXECUTIVE SUMMARY */}
      {activeTab === 'overview' && auditResult?.summary && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="p-5 rounded-2xl surface-card border border-slate-200 dark:border-white/10 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-[#EDEDED]">
                Executive Audit Summary
              </h2>
            </div>
            <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-xs">
              {auditResult.summary.executiveSummary}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-400 border-t border-slate-100 dark:border-white/5">
              <span>Dominant emotional experience:</span>
              <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold">
                {auditResult.summary.dominantEmotionalExperience}
              </span>
            </div>
          </div>

          {/* What Users Love vs What Users Struggle With */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* What Users Love */}
            <div className="p-5 rounded-2xl surface-card border border-slate-200 dark:border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                <Smile className="w-4 h-4" />
                <span>What Users Love ({auditResult.summary.whatUsersLove.length})</span>
              </div>
              {auditResult.summary.whatUsersLove.length === 0 ? (
                <p className="text-slate-400 text-xs italic">No strong positive signals identified yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {auditResult.summary.whatUsersLove.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 space-y-1.5">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {item.claim}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-slate-400">Verified Evidence:</span>
                        {item.evidenceAtomIds.slice(0, 3).map(id => (
                          <button
                            key={id}
                            onClick={() => openEvidenceDrawerByAtomId(id)}
                            className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>#{id.slice(-6)}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* What Users Struggle With */}
            <div className="p-5 rounded-2xl surface-card border border-slate-200 dark:border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
                <Frown className="w-4 h-4" />
                <span>What Users Struggle With ({auditResult.summary.whatUsersStruggleWith.length})</span>
              </div>
              {auditResult.summary.whatUsersStruggleWith.length === 0 ? (
                <p className="text-slate-400 text-xs italic">No recurring struggle items extracted.</p>
              ) : (
                <div className="space-y-2.5">
                  {auditResult.summary.whatUsersStruggleWith.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 space-y-1.5">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {item.claim}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-slate-400">Verified Evidence:</span>
                        {item.evidenceAtomIds.slice(0, 3).map(id => (
                          <button
                            key={id}
                            onClick={() => openEvidenceDrawerByAtomId(id)}
                            className="text-[10px] font-mono text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-0.5"
                          >
                            <span>#{id.slice(-6)}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Major Product Problems & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl surface-card border border-slate-200 dark:border-white/10 space-y-3">
              <h3 className="font-bold text-xs text-slate-900 dark:text-[#EDEDED] uppercase tracking-wider font-mono">
                Major Product Friction Areas
              </h3>
              <div className="space-y-2">
                {auditResult.summary.majorProductProblems.map((prob, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 flex items-start justify-between gap-3">
                    <p className="text-xs text-slate-800 dark:text-slate-200">{prob.claim}</p>
                    {prob.severity && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 ${
                        prob.severity === 'critical' || prob.severity === 'high'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                          : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                      }`}>
                        {prob.severity}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl surface-card border border-slate-200 dark:border-white/10 space-y-3">
              <h3 className="font-bold text-xs text-slate-900 dark:text-[#EDEDED] uppercase tracking-wider font-mono">
                PM Recommendations
              </h3>
              <ul className="space-y-2">
                {auditResult.summary.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DETAILED PM ANALYSIS (Section 9) */}
      {activeTab === 'detailed_analysis' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              DETAILED PAIN POINT AUDIT & EVIDENCE LINEAGE ({detailedAnalysis.length})
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              All metrics calculated deterministically from persisted records
            </span>
          </div>

          {detailedAnalysis.length === 0 ? (
            <div className="p-12 text-center rounded-2xl surface-card border border-slate-200 dark:border-white/10 text-slate-400 text-xs">
              No pain points synthesized yet. Ingest and process reviews to view detailed intelligence.
            </div>
          ) : (
            <div className="space-y-4">
              {detailedAnalysis.map((item) => (
                <div
                  key={item.painPointId}
                  className="p-5 rounded-2xl surface-card border border-slate-200 dark:border-white/10 space-y-4 shadow-xs"
                >
                  {/* Top Bar: Problem Title & Priority Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          item.severity === 'critical' || item.severity === 'high'
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                            : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                        }`}>
                          {item.severity} severity
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          {item.trendSignal}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {item.problemTitle}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {item.userExperience}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">
                        Opportunity Priority
                      </span>
                      <span className="text-lg font-extrabold text-teal-600 dark:text-teal-400 font-mono">
                        {item.priorityScore} / 100
                      </span>
                    </div>
                  </div>

                  {/* Middle Grid: Emotional Response & Evidence Volume */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    {/* Emotional Breakdown */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 space-y-2">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">
                        Emotional Response
                      </span>
                      <div className="space-y-1.5">
                        {item.emotionalResponse.slice(0, 3).map(e => (
                          <div key={e.emotion} className="flex items-center justify-between text-[11px]">
                            <span className="capitalize text-slate-700 dark:text-slate-300">{e.emotion}</span>
                            <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{e.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Evidence Stats */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 space-y-2">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">
                        Evidence Volume
                      </span>
                      <div className="space-y-1 text-[11px] font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Verified Atoms:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{item.verifiedAtomsCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Distinct Reviews:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{item.distinctReviewsCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Confidence:</span>
                          <span className="font-bold uppercase text-teal-600 dark:text-teal-400">{item.evidenceConfidence}</span>
                        </div>
                      </div>
                    </div>

                    {/* Downstream Opportunity Link */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 space-y-2">
                      <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">
                        Strategic Opportunity
                      </span>
                      {item.relatedOpportunity ? (
                        <div className="space-y-1">
                          <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {item.relatedOpportunity.title}
                          </p>
                          <Link
                            to="/opportunities"
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-teal-600 dark:text-teal-400 hover:underline"
                          >
                            <span>Inspect Opportunity →</span>
                          </Link>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">No active opportunity</span>
                      )}
                    </div>
                  </div>

                  {/* Representative Customer Quotes (Verbatim with Offsets) */}
                  <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-white/5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                      Representative Customer Quotes (Exact Substrings)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {item.representativeQuotes.map((q, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            const parent = feedbackList.find(f => f.id === q.feedbackId);
                            if (parent) setSelectedFeedback(parent);
                          }}
                          className="p-3 rounded-xl border border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-colors cursor-pointer bg-slate-50/50 dark:bg-white/1 space-y-1.5 group"
                        >
                          <p className="text-xs italic text-slate-800 dark:text-slate-200 font-medium line-clamp-2">
                            "{q.atomText}"
                          </p>
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span>{q.customerName || 'Anonymous reviewer'} {q.rating ? `(${q.rating}★)` : ''}</span>
                            <span className="text-teal-600 dark:text-teal-400 group-hover:underline">Inspect →</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EMOTIONAL ANALYSIS (Section 10) */}
      {activeTab === 'emotions' && (
        <div className="space-y-6">
          {/* Emotional Breakdown Cards */}
          <div className="p-5 rounded-2xl surface-card border border-slate-200 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <h2 className="font-bold text-sm text-slate-900 dark:text-[#EDEDED]">
                  Overall Customer Emotional Distribution
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Calculated across {statistics.totalVerifiedAtoms} verified atoms
              </span>
            </div>

            {/* Emotional Progress Bars */}
            <div className="space-y-3 pt-2">
              {statistics.emotionalDistribution.map((item) => (
                <div key={item.emotion} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">
                      {item.emotion}
                    </span>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-slate-400">{item.count} atoms</span>
                      <span className="font-bold text-teal-600 dark:text-teal-400">{item.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.emotion === 'joy' || item.emotion === 'satisfaction' || item.emotion === 'delight'
                          ? 'bg-emerald-500'
                          : item.emotion === 'frustration' || item.emotion === 'anger'
                          ? 'bg-rose-500'
                          : item.emotion === 'disappointment' || item.emotion === 'confusion'
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                      style={{ width: `${Math.max(4, item.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rating Alignment Diagnostics (Section J) */}
          <div className="p-5 rounded-2xl surface-card border border-slate-200 dark:border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-[#EDEDED]">
                Store Rating vs Written Text Consistency
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Detects contradictions where customers give high star ratings but report severe technical friction, or vice-versa.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {statistics.ratingAlignmentDistribution.map(align => (
                <div key={align.alignment} className="p-3 rounded-xl bg-slate-50 dark:bg-white/2 border border-slate-100 dark:border-white/5 space-y-1 text-xs">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block font-bold">
                    {align.alignment.replace('_', ' ')}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-slate-900 dark:text-white">{align.count}</span>
                    <span className="text-[11px] font-mono text-slate-400">({align.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Slide-out Feedback Detail Drawer for Full Evidence Traceability */}
      {selectedFeedback && (
        <FeedbackDetailDrawer
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
        />
      )}
    </div>
  );
}
