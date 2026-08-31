import React, { useState } from 'react';
import {
  Target,
  Layers,
  ArrowRight,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { useTraceStore } from '@/lib/store';
import { useToast } from '@/components/ui/toast';

export function ContextSettingsPage() {
  const { productContext, updateProductContext, customerSegments } = useTraceStore();
  const { addToast } = useToast();

  const [goals, setGoals] = useState(() => productContext?.companyGoals || []);
  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalPriority, setNewGoalPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [isSaved, setIsSaved] = useState(false);

  const handleAddGoal = () => {
    if (!newGoalText.trim()) return;
    setGoals((prev) => [
      ...prev,
      {
        id: `goal-${Date.now()}`,
        goal: newGoalText,
        priority: newGoalPriority
      }
    ]);
    setNewGoalText('');
    setIsSaved(false);
  };

  const handleRemoveGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    setIsSaved(false);
  };

  const handleSave = () => {
    updateProductContext({
      ...productContext,
      companyGoals: goals
    });
    setIsSaved(true);
    addToast({
      type: 'success',
      title: 'Context Saved',
      description: 'Strategic objectives updated successfully.'
    });
  };

  return (
    <div className="max-w-4xl space-y-4 text-slate-900 dark:text-slate-100">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-[#1a1e2b] pb-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Strategic Product Context
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Define organizational goals, segment multipliers, and architectural constraints used in opportunity prioritization.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-center"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isSaved ? 'Saved' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Section 1: Company Objectives */}
      <div className="p-5 rounded-2xl surface-card space-y-3.5 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#171b26] pb-2.5">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 dark:text-white">Active Goals & OKRs</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono-numbers">{goals.length} Goals</span>
        </div>

        <div className="space-y-2">
          {goals.map((g) => (
            <div
              key={g.id}
              className="p-3 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200/80 dark:border-[#1e2333] flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  g.priority === 'high'
                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/40'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/40'
                }`}>
                  {g.priority}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{g.goal}</span>
              </div>

              <button
                onClick={() => handleRemoveGoal(g.id)}
                className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add Goal Form */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            placeholder="Add new company goal or strategic objective..."
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-[#1e2333] text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
          <select
            value={newGoalPriority}
            onChange={(e) => setNewGoalPriority(e.target.value as 'high' | 'medium' | 'low')}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-[#1e2333] text-xs font-semibold focus:outline-none font-mono"
          >
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <button
            onClick={handleAddGoal}
            className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center gap-1 shadow-xs hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Section 2: Customer Segment Multipliers */}
      <div className="p-5 rounded-2xl surface-card space-y-3.5 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#171b26] pb-2.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 dark:text-white">Customer Segment Weights</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {customerSegments.map((seg) => (
            <div key={seg.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200/80 dark:border-[#1e2333] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">{seg.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/40">
                  {seg.strategicWeight}x Weight
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{seg.description || 'Target customer cohort'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Known Architectural Constraints */}
      <div className="p-5 rounded-2xl surface-card space-y-3.5 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#171b26] pb-2.5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-slate-900 dark:text-white">Operational & Architectural Constraints</h3>
          </div>
        </div>

        <div className="space-y-2">
          {productContext?.knownConstraints?.map((c, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200/80 dark:border-[#1e2333] text-slate-800 dark:text-slate-200 font-medium">
              • {c}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
