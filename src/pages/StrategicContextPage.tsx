import React, { useState } from 'react';
import { useTraceStore } from '@/lib/store';
import { Sliders, Target, Users, ShieldCheck, Plus, Check } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export function StrategicContextPage() {
  const { productContext, updateProductContext, customerSegments } = useTraceStore();
  const { addToast } = useToast();

  const [newGoal, setNewGoal] = useState('');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;

    const updatedGoals = [
      ...productContext.companyGoals,
      { id: `goal-${Date.now()}`, goal: newGoal.trim(), priority: 'high' as const }
    ];

    updateProductContext({ companyGoals: updatedGoals });
    setNewGoal('');

    addToast({
      type: 'success',
      title: 'Strategic Goal Added',
      description: `Added "${newGoal.trim()}" to strategic context.`
    });
  };

  return (
    <div className="space-y-5 text-slate-900 dark:text-[#EDEDED]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1F232B] pb-3.5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#EDEDED] tracking-tight">
            Strategic Product Context & Configuration
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#8C92A4] mt-0.5 font-mono">
            Configure company goals, strategic weights, customer segment priorities, and scoring rules.
          </p>
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Company Goals */}
        <div className="p-4 rounded-xl surface-card space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1F232B] pb-2.5">
            <h2 className="text-xs font-mono font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider">
              STRATEGIC COMPANY GOALS ({productContext.companyGoals.length})
            </h2>
          </div>

          <div className="space-y-2">
            {productContext.companyGoals.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-[#525866] py-2">No custom strategic goals added yet.</p>
            ) : (
              productContext.companyGoals.map(g => (
                <div key={g.id} className="p-3 rounded-lg surface-subtle text-xs flex items-center justify-between">
                  <span className="font-medium text-slate-800 dark:text-[#EDEDED]">{g.goal}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#2E8B75]/10 text-[#2E8B75] dark:text-[#10B981] uppercase border border-[#2E8B75]/20">
                    {g.priority}
                  </span>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddGoal} className="flex gap-2 pt-1">
            <input
              type="text"
              value={newGoal}
              onChange={e => setNewGoal(e.target.value)}
              placeholder="Add new company strategic goal..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#181B22] border border-slate-200 dark:border-[#232833] text-xs text-slate-900 dark:text-[#EDEDED] focus:outline-none focus:border-[#2E8B75]"
            />
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-lg bg-[#2E8B75] hover:bg-[#1F6B58] text-white font-semibold text-xs transition-colors shrink-0 shadow-2xs"
            >
              Add Goal
            </button>
          </form>
        </div>

        {/* Customer Segments & Strategic Weights */}
        <div className="p-4 rounded-xl surface-card space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1F232B] pb-2.5">
            <h2 className="text-xs font-mono font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider">
              CUSTOMER SEGMENTS & WEIGHTS ({customerSegments.length})
            </h2>
          </div>

          <div className="space-y-2">
            {customerSegments.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-[#525866] py-2">No custom customer segments configured.</p>
            ) : (
              customerSegments.map(seg => (
                <div key={seg.id} className="p-3 rounded-lg surface-subtle text-xs flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-[#EDEDED]">{seg.name}</span>
                    <span className="text-[11px] text-slate-500 dark:text-[#8C92A4] ml-2">({seg.description || 'Strategic Tier'})</span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-slate-600 dark:text-[#8C92A4]">
                    Weight: {seg.strategicWeight}x
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#181B22] border border-slate-200/80 dark:border-[#232833] text-xs text-slate-600 dark:text-[#8C92A4] space-y-1">
            <p className="font-semibold text-slate-800 dark:text-[#EDEDED]">Scoring Formula Active:</p>
            <p className="font-mono text-[11px] text-slate-500 dark:text-[#525866]">
              Priority Score = (Frequency × 0.3) + (Severity × 0.25) + (Segment Weight × 0.25) + (Strategic Fit × 0.2)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
