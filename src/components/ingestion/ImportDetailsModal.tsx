import React from 'react';
import { ImportJob } from '@/types/trace';
import { X, FileText, CheckCircle2, AlertTriangle, RefreshCw, Layers } from 'lucide-react';
import { useTraceStore } from '@/lib/store';
import { useToast } from '@/components/ui/toast';

interface ImportDetailsModalProps {
  importJob: ImportJob;
  onClose: () => void;
}

export function ImportDetailsModal({ importJob, onClose }: ImportDetailsModalProps) {
  const { reprocessImport } = useTraceStore();
  const { addToast } = useToast();

  const handleReprocess = () => {
    reprocessImport(importJob.id);
    addToast({
      type: 'info',
      title: 'Import Reprocessed',
      description: `Re-ran intelligence analysis for ${importJob.fileName}.`
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg surface-glass rounded-2xl border border-slate-200 dark:border-white/8 shadow-2xl overflow-hidden text-xs space-y-4 p-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/8 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#2E8B75] dark:text-[#10B981]" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#EDEDED]">
                Import Audit & Details
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#8C92A4] font-mono">
                ID: {importJob.id}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-[#EDEDED] p-1 rounded-md hover:bg-slate-100 dark:hover:bg-[#1A1E26]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Import Summary Cards */}
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl surface-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-[#EDEDED] text-xs">
                {importJob.fileName}
              </span>
              <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold uppercase ${
                importJob.status === 'completed'
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-[#10B981] border border-emerald-200 dark:border-emerald-900/60'
                  : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60'
              }`}>
                {importJob.status.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-center">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#13151A] border border-slate-200/80 dark:border-white/6">
                <span className="text-[10px] text-slate-400 dark:text-[#64748B] block">Total</span>
                <span className="font-bold text-slate-900 dark:text-[#EDEDED]">{importJob.totalRows}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#13151A] border border-slate-200/80 dark:border-white/6">
                <span className="text-[10px] text-emerald-600 dark:text-[#10B981] block">Valid</span>
                <span className="font-bold text-emerald-600 dark:text-[#10B981]">{importJob.acceptedRows}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#13151A] border border-slate-200/80 dark:border-white/6">
                <span className="text-[10px] text-rose-500 block">Invalid</span>
                <span className="font-bold text-rose-500">{importJob.rejectedRows}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#13151A] border border-slate-200/80 dark:border-white/6">
                <span className="text-[10px] text-amber-500 block">Duplicates</span>
                <span className="font-bold text-amber-500">{importJob.duplicateRows}</span>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="p-3 rounded-lg surface-subtle space-y-1.5 font-mono text-[11px] text-slate-500 dark:text-[#8C92A4]">
            <div className="flex justify-between">
              <span>Started At:</span>
              <span className="text-slate-800 dark:text-[#EDEDED]">{importJob.startedAt ? new Date(importJob.startedAt).toLocaleString() : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed At:</span>
              <span className="text-slate-800 dark:text-[#EDEDED]">{importJob.completedAt ? new Date(importJob.completedAt).toLocaleString() : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Atoms Extracted:</span>
              <span className="text-slate-800 dark:text-[#EDEDED] font-bold">{importJob.atomsExtracted}</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/8">
          <button
            onClick={handleReprocess}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/8 text-slate-700 dark:text-[#EDEDED] hover:bg-slate-100 dark:hover:bg-[#1A1E26] font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reprocess Ingestion</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200/80 dark:bg-[#1A1E26] hover:bg-slate-300 dark:hover:bg-[#252A36] text-slate-900 dark:text-[#EDEDED] font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
