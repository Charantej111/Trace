import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTraceStore } from '@/lib/store';
import { RoadmapItem, RoadmapStatus } from '@/types/trace';
import { BookOpen, ShieldCheck, GripVertical, Trash2, ArrowRight } from 'lucide-react';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { TraceabilityDrawer } from '@/components/roadmap/TraceabilityDrawer';
import { useToast } from '@/components/ui/toast';

const COLUMNS: { status: RoadmapStatus; label: string; description: string }[] = [
  { status: 'candidate', label: 'CANDIDATE', description: 'Under backlog evaluation' },
  { status: 'planned', label: 'PLANNED', description: 'Committed to release sprint' },
  { status: 'in_progress', label: 'IN PROGRESS', description: 'Currently in active development' },
  { status: 'shipped', label: 'SHIPPED', description: 'Live in production release' }
];

export function RoadmapPage() {
  const { roadmapItems, opportunities, updateRoadmapItemStatus, deleteRoadmapItem } = useTraceStore();
  const { addToast } = useToast();

  const [selectedItemForTraceability, setSelectedItemForTraceability] = useState<RoadmapItem | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<RoadmapStatus | null>(null);

  const getItemsByStatus = (status: RoadmapStatus) => roadmapItems.filter(item => item.status === status);

  // Drag Event Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItemId(id);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: RoadmapStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent, status: RoadmapStatus) => {
    // Only reset if exiting the column container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      if (dragOverColumn === status) {
        setDragOverColumn(null);
      }
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: RoadmapStatus) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain') || draggedItemId;
    setDragOverColumn(null);
    setDraggedItemId(null);

    if (!itemId) return;

    const item = roadmapItems.find(r => r.id === itemId);
    if (!item) return;

    if (item.status === targetStatus) return;

    await updateRoadmapItemStatus(itemId, targetStatus);

    const targetCol = COLUMNS.find(c => c.status === targetStatus);
    addToast({
      type: 'success',
      title: 'Initiative Updated',
      description: `Moved "${item.title}" to ${targetCol?.label || targetStatus}.`
    });
  };

  const handleDeleteItem = async (e: React.MouseEvent, item: RoadmapItem) => {
    e.stopPropagation();
    if (window.confirm(`Remove "${item.title}" from the roadmap?`)) {
      await deleteRoadmapItem(item.id);
      addToast({
        type: 'info',
        title: 'Initiative Removed',
        description: `Removed "${item.title}" from the roadmap.`
      });
    }
  };

  return (
    <div className="space-y-5 text-slate-900 dark:text-[#EDEDED]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1F232B] pb-3.5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#EDEDED] tracking-tight flex items-center gap-2.5">
            <span>Roadmap & Initiative Kanban</span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-[#181B22] text-slate-600 dark:text-[#8C92A4] border border-slate-200 dark:border-[#232833]">
              {roadmapItems.length} initiatives
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#8C92A4] mt-0.5 font-mono">
            Drag cards across columns to manage lifecycle status. Each initiative is linked directly to customer evidence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/opportunities"
            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#181B22] hover:bg-slate-200 dark:hover:bg-[#232833] text-xs font-semibold text-slate-700 dark:text-[#EDEDED] transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-[#232833]"
          >
            <span>Review Open Opportunities</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          <Link
            to="/decisions"
            className="px-3 py-1.5 rounded-lg bg-[#2E8B75]/10 hover:bg-[#2E8B75]/20 text-[#2E8B75] dark:text-[#10B981] text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Decision Memory</span>
          </Link>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {COLUMNS.map((col) => {
          const items = getItemsByStatus(col.status);
          const isOverThisColumn = dragOverColumn === col.status;

          return (
            <div
              key={col.status}
              onDragOver={(e) => handleDragOver(e, col.status)}
              onDragLeave={(e) => handleDragLeave(e, col.status)}
              onDrop={(e) => handleDrop(e, col.status)}
              className={`p-3.5 rounded-xl surface-card space-y-3 flex flex-col min-h-[500px] transition-all duration-150 ${
                isOverThisColumn
                  ? 'border-2 border-[#2E8B75] ring-4 ring-[#2E8B75]/15 bg-[#2E8B75]/5 dark:bg-[#2E8B75]/10 shadow-lg'
                  : 'border border-slate-200 dark:border-[#1F232B]'
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1F232B] pb-2 text-xs font-semibold text-slate-900 dark:text-[#EDEDED]">
                <div>
                  <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500 dark:text-[#8C92A4]">
                    {col.label}
                  </span>
                  <p className="text-[10px] text-slate-400 dark:text-[#525866] font-normal">{col.description}</p>
                </div>
                <span className="font-mono text-xs font-semibold text-slate-500 dark:text-[#8C92A4] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-[#181B22]">
                  {items.length}
                </span>
              </div>

              {/* Column Item Cards */}
              <div className="space-y-2.5 flex-1 flex flex-col">
                {items.length === 0 ? (
                  <div className={`p-6 text-center border-2 border-dashed rounded-lg text-[11px] flex-1 flex flex-col items-center justify-center transition-colors ${
                    isOverThisColumn
                      ? 'border-[#2E8B75] text-[#2E8B75] dark:text-[#10B981] bg-[#2E8B75]/10 font-medium'
                      : 'border-slate-200 dark:border-[#232833] text-slate-400 dark:text-[#525866]'
                  }`}>
                    {isOverThisColumn ? `Drop to move to ${col.label}` : `No initiatives in ${col.label.toLowerCase()}`}
                  </div>
                ) : (
                  items.map((item) => {
                    const linkedOpp = opportunities.find(o => o.id === item.opportunityId || o.title.toLowerCase() === item.title.toLowerCase());
                    const priority = item.priority || (linkedOpp && linkedOpp.overallPriorityScore >= 80 ? 'P0' : 'P1');
                    const isP0 = priority === 'P0';
                    const isBeingDragged = draggedItemId === item.id;

                    return (
                      <div
                        key={item.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, item.id)}
                        onDragEnd={handleDragEnd}
                        className={`relative p-3.5 rounded-lg surface-subtle surface-card-hover space-y-2 text-xs border border-slate-200/60 dark:border-[#232833] cursor-grab active:cursor-grabbing transition-all select-none ${
                          isBeingDragged
                            ? 'opacity-30 border-dashed border-[#2E8B75] scale-95 shadow-none'
                            : 'hover:shadow-md hover:border-slate-300 dark:hover:border-[#2E8B75]/40'
                        }`}
                      >
                        {/* Card Top Row: Grip Handle, Priority, Period, Delete */}
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="text-slate-400 dark:text-[#525866] hover:text-slate-600 dark:hover:text-[#EDEDED]"
                              title="Drag to move column"
                            >
                              <GripVertical className="w-3.5 h-3.5" />
                            </span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                              isP0
                                ? 'bg-[#1E293B] dark:bg-[#EDEDED] text-white dark:text-[#090A0C]'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}>
                              {priority}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-400 dark:text-[#525866]">
                              {item.targetPeriod || 'Q3 2026'}
                            </span>
                            <button
                              onClick={(e) => handleDeleteItem(e, item)}
                              className="text-slate-400 hover:text-rose-500 dark:text-[#525866] dark:hover:text-rose-400 p-0.5 rounded transition-colors"
                              title="Delete initiative from roadmap"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Title */}
                        <p className="font-semibold text-slate-900 dark:text-[#EDEDED] leading-snug">
                          {item.title}
                        </p>

                        {/* Evidence Mentions & Score */}
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-[#8C92A4] pt-0.5">
                          <span>{item.evidenceCount || (linkedOpp?.evidenceCount) || 1} mentions</span>
                          {linkedOpp ? (
                            <span className="text-emerald-600 dark:text-[#10B981] font-semibold">
                              {linkedOpp.overallPriorityScore}/100 Score
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-[#525866]">Corroborated</span>
                          )}
                        </div>

                        {/* Card Bottom Row: Trace Evidence Button & Quick Column Select */}
                        <div className="pt-2 border-t border-slate-200 dark:border-[#232833] flex items-center justify-between gap-2">
                          <button
                            onClick={() => setSelectedItemForTraceability(item)}
                            className="text-[11px] font-mono font-semibold text-[#2E8B75] dark:text-[#10B981] hover:underline flex items-center gap-1 shrink-0"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Trace Evidence →</span>
                          </button>

                          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                            <CustomSelect
                              options={[
                                { value: 'candidate', label: 'Candidate' },
                                { value: 'planned', label: 'Planned' },
                                { value: 'in_progress', label: 'In Progress' },
                                { value: 'shipped', label: 'Shipped' }
                              ]}
                              value={item.status}
                              className="w-28 text-[11px]"
                              onChange={(val) => {
                                updateRoadmapItemStatus(item.id, val as RoadmapStatus);
                                const targetCol = COLUMNS.find(c => c.status === val);
                                addToast({
                                  type: 'success',
                                  title: 'Initiative Updated',
                                  description: `Moved "${item.title}" to ${targetCol?.label || val}.`
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Drop Slot Indicator when dragging an item over this column */}
                {isOverThisColumn && items.length > 0 && (
                  <div className="p-3 border-2 border-dashed border-[#2E8B75] bg-[#2E8B75]/10 rounded-lg text-center text-xs font-semibold text-[#2E8B75] dark:text-[#10B981] animate-pulse">
                    Drop to move here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Traceability Lineage Drawer */}
      {selectedItemForTraceability && (
        <TraceabilityDrawer
          roadmapItem={selectedItemForTraceability}
          onClose={() => setSelectedItemForTraceability(null)}
        />
      )}
    </div>
  );
}
