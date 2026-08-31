import React, { useState } from 'react';
import {
  Kanban,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  TrendingDown,
  X,
  Zap,
  Target,
  MessageSquare,
  FileText,
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';
import { useTraceStore } from '@/lib/store';
import { RoadmapItem, RoadmapStatus } from '@/types/trace';
import { useToast } from '@/components/ui/toast';

const COLUMNS: { status: RoadmapStatus; label: string; color: string }[] = [
  { status: 'candidate', label: 'Candidate', color: 'bg-slate-400' },
  { status: 'planned', label: 'Planned', color: 'bg-indigo-500' },
  { status: 'in_progress', label: 'In Progress', color: 'bg-amber-500' },
  { status: 'shipped', label: 'Shipped', color: 'bg-emerald-500' }
];

export function RoadmapPage() {
  const { roadmapItems, updateRoadmapItemStatus } = useTraceStore();
  const { addToast } = useToast();
  const [selectedItem, setSelectedItem] = useState<RoadmapItem | null>(null);

  const getItemsByStatus = (status: RoadmapStatus) => {
    return roadmapItems.filter(item => item.status === status);
  };

  const handleAdvanceStatus = (item: RoadmapItem, newStatus: RoadmapStatus) => {
    updateRoadmapItemStatus(item.id, newStatus);
    if (selectedItem?.id === item.id) {
      setSelectedItem({ ...item, status: newStatus });
    }
    addToast({
      type: 'success',
      title: 'Roadmap Stage Updated',
      description: `"${item.title}" moved to ${newStatus.toUpperCase()}.`
    });
  };

  return (
    <div className="space-y-4 text-slate-900 dark:text-slate-100">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-[#1a1e2b] pb-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Product Roadmap & Post-Ship Telemetry Loop
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track execution velocity, maintain customer evidence traceability, and measure post-ship complaint drops.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-400 font-bold flex items-center gap-1.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Post-Ship Feedback Telemetry Active
          </span>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 items-start">
        {COLUMNS.map((col) => {
          const items = getItemsByStatus(col.status);

          return (
            <div
              key={col.status}
              className="p-3.5 rounded-2xl surface-card space-y-3 flex flex-col min-h-[560px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#171b26] pb-2.5 text-xs font-bold text-slate-900 dark:text-white">
                <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider">
                  <span className={`w-2 h-2 rounded-full ${col.color}`}></span>
                  {col.label}
                </span>
                <span className="font-mono-numbers text-[10px] text-slate-500 dark:text-slate-400 font-bold bg-slate-50 dark:bg-[#090b10] px-2 py-0.5 rounded-full border border-slate-200 dark:border-[#1e2333]">
                  {items.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-2.5 flex-1">
                {items.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 dark:border-[#1e2333] rounded-xl text-[11px] text-slate-400">
                    No initiatives in this stage
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#090b10] hover:bg-slate-100/80 dark:hover:bg-[#131620] border border-slate-200/80 dark:border-[#1e2333] transition-all cursor-pointer space-y-2.5 text-xs group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono-numbers font-extrabold ${
                          item.priority === 'P0'
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/40'
                            : item.priority === 'P1'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/40'
                            : 'bg-white dark:bg-[#161a26] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#262f44]'
                        }`}>
                          {item.priority}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{item.targetPeriod}</span>
                      </div>

                      <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                        {item.title}
                      </h4>

                      {item.description && (
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      {/* Post-Ship Telemetry Impact Meter */}
                      {item.status === 'shipped' && item.impactPercentageChange && (
                        <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 font-mono text-[10px] flex items-center justify-between font-bold">
                          <span className="flex items-center gap-1">
                            <TrendingDown className="w-3 h-3 text-emerald-600" />
                            Complaints Drop
                          </span>
                          <span className="text-xs">{item.impactPercentageChange}%</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-[#171b26] text-[10px] text-slate-400 font-mono">
                        <span>{item.evidenceCount} evidence links</span>
                        <ChevronRight className="w-3 h-3 text-slate-400" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Initiative Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#0d0f15] rounded-2xl border border-slate-200 dark:border-[#1e2333] shadow-2xl overflow-hidden text-xs space-y-4 p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#171b26] pb-3">
              <div className="flex items-center gap-2">
                <Kanban className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Roadmap Initiative Trace #{selectedItem.id}
                </h3>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/40">
                  Priority {selectedItem.priority}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Target Period: {selectedItem.targetPeriod}
                </span>
              </div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                {selectedItem.title}
              </h2>
              {selectedItem.description && (
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
                  {selectedItem.description}
                </p>
              )}
            </div>

            {/* Stage Selector */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300 block font-mono text-[11px] uppercase">
                Transition Kanban Stage:
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {COLUMNS.map((col) => (
                  <button
                    key={col.status}
                    onClick={() => handleAdvanceStatus(selectedItem, col.status)}
                    className={`py-1.5 px-2 rounded-lg font-bold text-center text-xs transition-all ${
                      selectedItem.status === col.status
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-[#161a26] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#1f2535]'
                    }`}
                  >
                    {col.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Traceable Quotes Evidence */}
            {selectedItem.topQuotes && selectedItem.topQuotes.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200/80 dark:border-[#1e2333] space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider block">
                  Ground-Truth Customer Struggle Quote
                </span>
                {selectedItem.topQuotes.map((q, idx) => (
                  <p key={idx} className="text-slate-700 dark:text-slate-300 italic text-[11px] leading-relaxed">
                    "{q}"
                  </p>
                ))}
              </div>
            )}

            {/* Post-Ship Telemetry */}
            {selectedItem.status === 'shipped' && selectedItem.impactPercentageChange && (
              <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/40 space-y-1 text-emerald-900 dark:text-emerald-300">
                <span className="text-[10px] font-bold uppercase font-mono tracking-wider block">Post-Ship Telemetry</span>
                <p className="font-mono text-xs font-bold">
                  Verified Complaint Frequency Shift: {selectedItem.impactPercentageChange}% drop
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-[#171b26]">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-[#161a26] text-slate-700 dark:text-slate-300 font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
