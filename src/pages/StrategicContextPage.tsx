import React, { useState } from 'react';
import { useTraceStore } from '@/lib/store';
import {
  Target,
  Users,
  RotateCcw,
  Trash2,
  AlertTriangle,
  Loader2,
  User,
  X,
  Plus
} from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { CustomSelect } from '@/components/ui/CustomSelect';

export function StrategicContextPage() {
  const {
    workspace,
    productContext,
    addCompanyGoal,
    deleteCompanyGoal,
    customerSegments,
    addCustomerSegment,
    updateCustomerSegment,
    deleteCustomerSegment,
    resetToDemoData,
    clearWorkspaceData
  } = useTraceStore();
  const { addToast } = useToast();

  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalPriority, setNewGoalPriority] = useState<'high' | 'medium' | 'low'>('high');

  const [newSegmentName, setNewSegmentName] = useState('');
  const [newSegmentDesc, setNewSegmentDesc] = useState('');
  const [newSegmentWeight, setNewSegmentWeight] = useState<number>(1.2);

  const [showResetModal, setShowResetModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;

    addCompanyGoal({
      goal: newGoalText.trim(),
      priority: newGoalPriority
    });
    setNewGoalText('');

    addToast({
      type: 'success',
      title: 'Strategic Goal Added',
      description: `Added "${newGoalText.trim()}" to strategic context.`
    });
  };

  const handleDeleteGoal = (id: string, goalText: string) => {
    deleteCompanyGoal(id);
    addToast({
      type: 'info',
      title: 'Goal Removed',
      description: `Removed goal "${goalText.slice(0, 30)}..."`
    });
  };

  const handleAddSegment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSegmentName.trim()) return;

    addCustomerSegment({
      name: newSegmentName.trim(),
      description: newSegmentDesc.trim() || 'Custom strategic tier',
      strategicWeight: Number(newSegmentWeight) || 1.0
    });
    setNewSegmentName('');
    setNewSegmentDesc('');
    setNewSegmentWeight(1.2);

    addToast({
      type: 'success',
      title: 'Customer Segment Added',
      description: `Added segment "${newSegmentName.trim()}" with weight ${newSegmentWeight}x.`
    });
  };

  const handleDeleteSegment = (id: string, name: string) => {
    deleteCustomerSegment(id);
    addToast({
      type: 'info',
      title: 'Segment Removed',
      description: `Removed customer segment "${name}".`
    });
  };

  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      await resetToDemoData();
      addToast({
        type: 'info',
        title: 'Demo State Restored',
        description: 'Workspace restored to clean baseline demonstration seed.'
      });
      setShowResetModal(false);
    } catch (err) {
      console.error('Reset failed:', err);
      addToast({
        type: 'error',
        title: 'Reset Failed',
        description: err instanceof Error ? err.message : 'Unable to reset workspace data.'
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleConfirmClear = async () => {
    setIsClearing(true);
    try {
      await clearWorkspaceData();
      addToast({
        type: 'info',
        title: 'Workspace Cleared',
        description: 'All feedback records, atoms, goals, segments, and derived intelligence removed.'
      });
      setShowClearModal(false);
    } catch (err) {
      console.error('Clear failed:', err);
      addToast({
        type: 'error',
        title: 'Clear Failed',
        description: err instanceof Error ? err.message : 'Unable to clear workspace data.'
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-[#EDEDED]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1F232B] pb-3.5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#EDEDED] tracking-tight">
            Profile & Product Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#8C92A4] mt-0.5 font-mono">
            Manage your profile, dynamic strategic objectives, customer segments, and workspace state.
          </p>
        </div>
      </div>

      {/* Account & Profile Overview */}
      <div className="p-4 rounded-xl surface-card space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1F232B] pb-2.5">
          <h2 className="text-xs font-mono font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-[#2E8B75] dark:text-[#10B981]" />
            PROFILE & ACTIVE WORKSPACE
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-lg surface-subtle">
            <span className="text-slate-400 font-mono text-[10px] block">Role & Identity</span>
            <p className="font-bold text-slate-900 dark:text-[#EDEDED] mt-0.5">Product Lead</p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">lead@acme.inc</p>
          </div>

          <div className="p-3 rounded-lg surface-subtle">
            <span className="text-slate-400 font-mono text-[10px] block">Organization</span>
            <p className="font-bold text-slate-900 dark:text-[#EDEDED] mt-0.5">Acme Inc.</p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">Enterprise Tier</p>
          </div>

          <div className="p-3 rounded-lg surface-subtle">
            <span className="text-slate-400 font-mono text-[10px] block">Active Workspace</span>
            <p className="font-bold text-slate-900 dark:text-[#EDEDED] mt-0.5">{workspace?.name || 'Default Workspace'}</p>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">{workspace?.productCategory || 'B2B SaaS'}</p>
          </div>
        </div>
      </div>

      {/* Grid of Dynamic Strategy & Customer Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Dynamic Company Goals */}
        <div className="p-4 rounded-xl surface-card space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1F232B] pb-2.5">
            <h2 className="text-xs font-mono font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-[#2E8B75] dark:text-[#10B981]" />
              STRATEGIC COMPANY GOALS ({productContext.companyGoals.length})
            </h2>
          </div>

          <div className="space-y-2 min-h-24">
            {productContext.companyGoals.length === 0 ? (
              <div className="p-4 rounded-lg surface-subtle text-center text-xs text-slate-400 dark:text-[#64748B] space-y-1">
                <p className="font-semibold text-slate-600 dark:text-[#8C92A4]">No strategic goals configured</p>
                <p className="text-[11px]">Add company strategic objectives below to influence opportunity scoring.</p>
              </div>
            ) : (
              productContext.companyGoals.map(g => (
                <div key={g.id} className="p-3 rounded-lg surface-subtle text-xs flex items-center justify-between gap-2 group">
                  <span className="font-medium text-slate-800 dark:text-[#EDEDED] flex-1">{g.goal}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      g.priority === 'high'
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60'
                        : g.priority === 'medium'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60'
                        : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {g.priority}
                    </span>
                    <button
                      onClick={() => handleDeleteGoal(g.id, g.goal)}
                      title="Delete Goal"
                      className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-[#1E232B] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Goal Form */}
          <form onSubmit={handleAddGoal} className="space-y-2 pt-1 border-t border-slate-100 dark:border-[#1F232B]">
            <span className="text-[11px] font-mono text-slate-400 block font-semibold">ADD STRATEGIC GOAL</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={newGoalText}
                onChange={e => setNewGoalText(e.target.value)}
                placeholder="e.g. Reduce Enterprise onboarding friction and latency..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#181B22] border border-slate-200 dark:border-[#232833] text-xs text-slate-900 dark:text-[#EDEDED] focus:outline-none focus:border-[#2E8B75]"
              />
              <CustomSelect
                options={[
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' }
                ]}
                value={newGoalPriority}
                onChange={val => setNewGoalPriority(val as 'high' | 'medium' | 'low')}
                className="w-28"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-[#2E8B75] hover:bg-[#1F6B58] text-white font-semibold text-xs transition-colors shrink-0 shadow-2xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </form>
        </div>


        {/* Dynamic Customer Segments & Strategic Weights */}
        <div className="p-4 rounded-xl surface-card space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1F232B] pb-2.5">
            <h2 className="text-xs font-mono font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-[#2E8B75] dark:text-[#10B981]" />
              CUSTOMER SEGMENTS & WEIGHTS ({customerSegments.length})
            </h2>
          </div>

          <div className="space-y-2 min-h-24">
            {customerSegments.length === 0 ? (
              <div className="p-4 rounded-lg surface-subtle text-center text-xs text-slate-400 dark:text-[#64748B] space-y-1">
                <p className="font-semibold text-slate-600 dark:text-[#8C92A4]">No customer segments configured</p>
                <p className="text-[11px]">Add segments below or import feedback containing segment tags.</p>
              </div>
            ) : (
              customerSegments.map(seg => (
                <div key={seg.id} className="p-3 rounded-lg surface-subtle text-xs flex items-center justify-between gap-2 group">
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-slate-900 dark:text-[#EDEDED]">{seg.name}</span>
                    <span className="text-[11px] text-slate-500 dark:text-[#8C92A4] ml-2 block sm:inline">
                      ({seg.description || 'Strategic Tier'})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 bg-white dark:bg-[#181B22] border border-slate-200 dark:border-[#232833] rounded px-1.5 py-0.5">
                      <span className="text-[10px] text-slate-400 font-mono">Weight:</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="5.0"
                        value={seg.strategicWeight}
                        onChange={e => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val > 0) {
                            updateCustomerSegment(seg.id, { strategicWeight: val });
                          }
                        }}
                        className="w-12 bg-transparent text-xs font-mono font-bold text-slate-900 dark:text-[#EDEDED] text-center focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 font-mono">x</span>
                    </div>

                    <button
                      onClick={() => handleDeleteSegment(seg.id, seg.name)}
                      title="Delete Segment"
                      className="p-1 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-[#1E232B] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Segment Form */}
          <form onSubmit={handleAddSegment} className="space-y-2 pt-1 border-t border-slate-100 dark:border-[#1F232B]">
            <span className="text-[11px] font-mono text-slate-400 block font-semibold">ADD CUSTOMER SEGMENT</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={newSegmentName}
                onChange={e => setNewSegmentName(e.target.value)}
                placeholder="Segment Name (e.g. Enterprise)..."
                className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#181B22] border border-slate-200 dark:border-[#232833] text-xs text-slate-900 dark:text-[#EDEDED] focus:outline-none focus:border-[#2E8B75]"
              />
              <input
                type="text"
                value={newSegmentDesc}
                onChange={e => setNewSegmentDesc(e.target.value)}
                placeholder="Description / Criteria..."
                className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#181B22] border border-slate-200 dark:border-[#232833] text-xs text-slate-900 dark:text-[#EDEDED] focus:outline-none focus:border-[#2E8B75]"
              />
              <div className="flex gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="5.0"
                  value={newSegmentWeight}
                  onChange={e => setNewSegmentWeight(parseFloat(e.target.value) || 1.0)}
                  placeholder="Weight"
                  className="w-20 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-[#181B22] border border-slate-200 dark:border-[#232833] text-xs font-mono text-slate-900 dark:text-[#EDEDED] text-center focus:outline-none focus:border-[#2E8B75]"
                />
                <button
                  type="submit"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[#2E8B75] hover:bg-[#1F6B58] text-white font-semibold text-xs transition-colors shadow-2xs flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </form>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#181B22] border border-slate-200/80 dark:border-[#232833] text-xs text-slate-600 dark:text-[#8C92A4] space-y-1">
            <p className="font-semibold text-slate-800 dark:text-[#EDEDED]">Scoring Formula Active:</p>
            <p className="font-mono text-[11px] text-slate-500 dark:text-[#525866]">
              Priority Score = Frequency(25%) + Severity(25%) + Trend(15%) + Segment Weight(20%) + Strategic Fit(15%)
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone: Workspace Reset & Caution */}
      <div className="p-5 rounded-2xl border border-rose-200 dark:border-rose-950/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-rose-900 dark:text-rose-300">
              CAUTION: Workspace State & Data Reset
            </h2>
            <p className="text-xs text-rose-700/90 dark:text-rose-400 mt-1 leading-relaxed">
              Resetting or clearing workspace data is an irreversible action. All manually imported feedback, extracted atom spans, synthesized pain points, insights, and recorded decisions will be affected.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-rose-200/80 dark:border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-600 dark:text-[#A0A6B5]">
            <span className="font-semibold text-slate-900 dark:text-[#EDEDED] block">Reset to Demo Dataset</span>
            <span className="text-[11px]">Re-seeds clean demonstration feedback with active pipeline derivation.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowClearModal(true)}
              className="px-3.5 py-2 rounded-xl border border-rose-300 dark:border-rose-900/70 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Workspace</span>
            </button>

            <button
              onClick={() => setShowResetModal(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo State</span>
            </button>
          </div>
        </div>
      </div>

      {/* In-App Confirmation Modal: Reset Demo State */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#14171E] border border-slate-200 dark:border-[#232833] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-[#EDEDED]">
                    Reset to Factory Demo State?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#8C92A4] mt-0.5">
                    Caution: Irreversible workspace state change
                  </p>
                </div>
              </div>
              <button
                onClick={() => !isResetting && setShowResetModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-[#EDEDED] hover:bg-slate-100 dark:hover:bg-[#1E232B] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-[#A0A6B5] leading-relaxed">
              This will erase current workspace data and re-ingest the realistic multi-source customer dataset through the deterministic processing pipeline.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-[#1F232B]">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                disabled={isResetting}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-[#2A303C] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1E232B] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={isResetting}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
              >
                {isResetting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <span>Confirm Reset</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Confirmation Modal: Clear Workspace */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#14171E] border border-slate-200 dark:border-[#232833] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-[#EDEDED]">
                    Clear All Workspace Data?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[#8C92A4] mt-0.5">
                    Caution: Total workspace wipeout
                  </p>
                </div>
              </div>
              <button
                onClick={() => !isClearing && setShowClearModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-[#EDEDED] hover:bg-slate-100 dark:hover:bg-[#1E232B] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-[#A0A6B5] leading-relaxed">
              This will completely wipe all feedback statements, atoms, themes, pain points, insights, opportunities, company goals, customer segments, and decisions in this workspace.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-[#1F232B]">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                disabled={isClearing}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-[#2A303C] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1E232B] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                disabled={isClearing}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
              >
                {isClearing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Clearing...</span>
                  </>
                ) : (
                  <span>Confirm Wipe</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
