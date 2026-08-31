import React, { useState } from 'react';
import {
  Target,
  Layers,
  ArrowRight,
  Plus,
  Trash2,
  CheckCircle2,
  Sliders,
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
      title: 'Strategic Context Saved',
      description: 'Business objectives and scoring influence weights updated successfully.'
    });
  };

  return (
    <div className="max-w-4xl space-y-5 text-slate-900 dark:text-slate-100">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Strategic Product Context Configuration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure company OKRs, customer segment multipliers, and known operational constraints.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 card-shadow transition-colors self-start sm:self-center"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isSaved ? 'Context Saved' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Visual Representation of Scoring Influence */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 card-shadow space-y-3 text-xs">
        <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider block">
          Opportunity Prioritization Engine Architecture
        </span>
        <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-indigo-950 dark:text-indigo-300 font-bold">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 text-xs shadow-2xs">
              Customer Struggle Evidence (70%)
            </span>
            <span>+</span>
            <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 text-xs shadow-2xs">
              Strategic Context (30%)
            </span>
          </div>

          <ArrowRight className="w-4 h-4 text-indigo-600 hidden sm:block" />

          <div className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs">
            Opportunity Priority Index (0–100)
          </div>
        </div>
      </div>

      {/* Section 1: Company Objectives */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 card-shadow space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100">1. Active Company & Product OKRs</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono-numbers">{goals.length} active goals</span>
        </div>

        <div className="space-y-2">
          {goals.map((g) => (
            <div
              key={g.id}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  g.priority === 'high'
                    ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/30'
                    : 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/30'
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

        {/* Add Goal Input */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            placeholder="Add new company goal or strategic objective..."
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
          />
          <select
            value={newGoalPriority}
            onChange={(e) => setNewGoalPriority(e.target.value as 'high' | 'medium' | 'low')}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none"
          >
            <option value="high">High Priority</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button
            onClick={handleAddGoal}
            className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs flex items-center gap-1 shadow-2xs hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Section 2: Customer Segment Multipliers */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 card-shadow space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100">2. Customer Segment Multiplier Weights</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {customerSegments.map((seg) => (
            <div key={seg.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-slate-100">{seg.name}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-numbers font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
                  {seg.strategicWeight}x Weight
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{seg.description || 'Core customer cohort'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Known Architectural Constraints */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 card-shadow space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100">3. Operational & Architectural Constraints</h3>
          </div>
        </div>

        <div className="space-y-2">
          {productContext?.knownConstraints?.map((c, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 text-slate-800 dark:text-slate-200 font-medium">
              • {c}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
