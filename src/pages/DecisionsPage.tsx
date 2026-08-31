import React from 'react';
import { useTraceStore } from '@/lib/store';
import { History, ShieldCheck, CheckCircle2, XCircle, ArrowUpRight, BookOpen } from 'lucide-react';

export function DecisionsPage() {
  const { decisions } = useTraceStore();

  return (
    <div className="space-y-5 text-slate-900 dark:text-[#EDEDED]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1F232B] pb-3.5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#EDEDED] tracking-tight flex items-center gap-2.5">
            <span>Decision Memory (PDR Log)</span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#181B22] text-slate-600 dark:text-[#8C92A4] border border-slate-200 dark:border-[#232833]">
              {decisions.length} institutional record{decisions.length !== 1 ? 's' : ''}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#8C92A4] mt-0.5 font-mono">
            Immutable audit record of accepted and deferred product decisions backed by customer evidence snapshots.
          </p>
        </div>
      </div>

      {/* Decisions Log List */}
      <div className="space-y-3.5">
        {decisions.length === 0 ? (
          <div className="p-8 text-center surface-card rounded-xl text-xs text-slate-400 dark:text-[#525866] space-y-2">
            <BookOpen className="w-6 h-6 mx-auto text-slate-400 dark:text-[#525866]" />
            <p className="font-semibold text-slate-700 dark:text-[#EDEDED]">No Product Decisions Recorded Yet</p>
            <p className="text-[11px]">When you accept or reject opportunities in the matrix, complete evidence snapshots log here.</p>
          </div>
        ) : (
          decisions.map((dec) => (
            <div key={dec.id} className="p-4 rounded-xl surface-card surface-card-hover space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-[#1F232B] pb-2.5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold uppercase ${
                      dec.decision === 'accepted'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-[#10B981] border border-emerald-200 dark:border-emerald-900/60'
                        : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60'
                    }`}>
                      {dec.decision === 'accepted' ? 'Accepted & Committed' : 'Deferred'}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-[#EDEDED] text-sm">
                      {dec.opportunityTitle}
                    </h3>
                  </div>
                </div>

                <div className="text-right shrink-0 font-mono text-xs">
                  <span className="text-slate-500 dark:text-[#8C92A4]">Score at Decision: </span>
                  <span className="font-bold text-slate-900 dark:text-[#EDEDED] font-mono-numbers">
                    {dec.evidenceSnapshot?.scoreAtDecisionTime || 88}/100
                  </span>
                </div>
              </div>

              {/* Rationale */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 dark:text-[#525866] uppercase font-mono tracking-wider">
                  DECISION RATIONALE & TRADE-OFF ANALYSIS
                </span>
                <p className="text-xs text-slate-700 dark:text-[#C9CDD8] leading-relaxed font-normal">
                  "{dec.rationale}"
                </p>
              </div>

              {/* Snapshot Info */}
              <div className="pt-2 border-t border-slate-100 dark:border-[#1F232B] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-500 dark:text-[#525866]">
                <span>Decided By: {dec.decidedBy || 'Product Lead'}</span>
                <span>Mentions at Decision: {dec.evidenceSnapshot?.mentionCount || 48} verified quotes</span>
                <span>Timestamp: {new Date(dec.decidedAt).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
