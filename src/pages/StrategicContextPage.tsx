import React, { useState } from 'react';
import { useTraceStore } from '@/lib/store';
import { Sliders, Target, Users, ShieldCheck, Plus, Check } from 'lucide-react';
import { useToast } from '@/components/ui/toast';

export function StrategicContextPage() {
  const { productContext, updateProductContext, customerSegments } = useTraceStore();
  const { addToast } = useToast();

  const [newGoal, setNewGoal] = useState('');
  const [newConstraint, setNewConstraint] = useState('');

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
    <div className="space-y-5 text-slate-900 dark:text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1E293B] pb-3.5">
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            Strategic Product Context & Configuration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure company goals, strategic weights, customer segment priorities, and scoring rules.
          </p>
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Company Goals */}
        <div className="p-4 rounded-lg surface-card space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-2">
            <h2 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              STRATEGIC COMPANY GOALS ({productContext.companyGoals.length})
            </h2>
          </div>

          <div className="space-y-2">
            {productContext.companyGoals.map(g => (
              <div key={g.id} className="p-2.5 rounded bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs flex items-center justify-between">
                <span className="font-medium text-slate-800 dark:text-slate-200">{g.goal}</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#2E8B75]/10 text-[#2E8B75] dark:text-[#3B9B85] uppercase">
                  {g.priority}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddGoal} className="flex gap-2 pt-2">
            <input
              type="text"
              value={newGoal}
              onChange={e => setNewGoal(e.target.value)}
              placeholder="Add new company strategic goal..."
              className="flex-1 p-2 rounded bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded bg-[#2E8B75] text-white font-bold text-xs transition-colors shrink-0"
            >
              Add Goal
            </button>
          </form>
        </div>

        {/* Customer Segments & Strategic Weights */}
        <div className="p-4 rounded-lg surface-card space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-2">
            <h2 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              CUSTOMER SEGMENTS & WEIGHTS ({customerSegments.length})
            </h2>
          </div>

          <div className="space-y-2">
            {customerSegments.map(seg => (
              <div key={seg.id} className="p-2.5 rounded bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">{seg.name}</span>
                  <p className="text-[10px] text-slate-400 font-mono">{seg.description}</p>
                </div>
                <span className="font-mono text-xs font-bold text-[#2E8B75] dark:text-[#3B9B85]">
                  Weight: {seg.strategicWeight}x
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
