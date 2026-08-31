import React, { useState } from 'react';
import { useTraceStore } from '@/lib/store';
import { RoadmapItem, RoadmapStatus } from '@/types/trace';
import { Kanban, Layers, ArrowRight, ChevronRight, Plus } from 'lucide-react';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { TraceabilityDrawer } from '@/components/roadmap/TraceabilityDrawer';

const COLUMNS: { status: RoadmapStatus; label: string }[] = [
  { status: 'candidate', label: 'CANDIDATE' },
  { status: 'planned', label: 'PLANNED' },
  { status: 'in_progress', label: 'IN PROGRESS' },
  { status: 'shipped', label: 'SHIPPED' }
];

export function RoadmapPage() {
  const { roadmapItems, updateRoadmapItemStatus } = useTraceStore();
  const [selectedItemForTraceability, setSelectedItemForTraceability] = useState<RoadmapItem | null>(null);

  const getItemsByStatus = (status: RoadmapStatus) => roadmapItems.filter(item => item.status === status);

  return (
    <div className="space-y-4 text-slate-900 dark:text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1E293B] pb-3.5">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Roadmap & Initiative Kanban</span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#334155]">
              {roadmapItems.length} initiatives
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Committed product initiatives linked directly to customer evidence and decision memory.
          </p>
        </div>
      </div>

      {/* Kanban Board Grid (Subtle 1px borders, zero colored column fills) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 items-start">
        {COLUMNS.map((col) => {
          const items = getItemsByStatus(col.status);

          return (
            <div
              key={col.status}
              className="p-3.5 rounded-lg surface-card space-y-3 flex flex-col min-h-140"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-2 text-xs font-bold text-slate-900 dark:text-white">
                <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500">
                  {col.label}
                </span>
                <span className="font-mono text-xs font-bold text-slate-400">
                  {items.length}
                </span>
              </div>

              {/* Column Item Cards */}
              <div className="space-y-2.5 flex-1">
                {items.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-slate-200 dark:border-[#334155] rounded-md text-[11px] text-slate-400">
                    No initiatives in {col.label.toLowerCase()}
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-md bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#1E293B] dark:bg-[#F8FAFC] text-white dark:text-[#0F172A]">
                          P0
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {item.targetQuarter || 'Q3 2026'}
                        </span>
                      </div>

                      <p className="font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                        {item.title}
                      </p>

                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                        <span>{item.impactMetrics?.customerReach || 48} customer reports</span>
                        <span className="text-rose-600 dark:text-rose-400 font-bold">Critical</span>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-[#334155] flex items-center justify-between">
                        <button
                          onClick={() => setSelectedItemForTraceability(item)}
                          className="text-[11px] font-mono font-semibold text-[#2E8B75] dark:text-[#3B9B85] hover:underline flex items-center gap-0.5"
                        >
                          <span>→ View evidence</span>
                        </button>

                        <CustomSelect
                          options={[
                            { value: 'candidate', label: 'Candidate' },
                            { value: 'planned', label: 'Planned' },
                            { value: 'in_progress', label: 'In Progress' },
                            { value: 'shipped', label: 'Shipped' }
                          ]}
                          value={item.status}
                          onChange={(val) => updateRoadmapItemStatus(item.id, val as RoadmapStatus)}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-out Evidence Traceability Drawer */}
      {selectedItemForTraceability && (
        <TraceabilityDrawer
          roadmapItem={selectedItemForTraceability}
          onClose={() => setSelectedItemForTraceability(null)}
        />
      )}
    </div>
  );
}
