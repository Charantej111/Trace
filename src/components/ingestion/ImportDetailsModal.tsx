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
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-[#0d0f15] rounded-2xl border border-slate-200 dark:border-[#1e2333] shadow-2xl overflow-hidden text-xs space-y-4 p-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#171b26] pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Import Audit & Details
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                ID: {importJob.id}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Import Summary Cards */}
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200/80 dark:border-[#1e2333] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white text-xs">
                {importJob.fileName}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                importJob.status === 'completed'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80'
              }`}>
                {importJob.status.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-[#171b26] text-center">
              <div>
                <span className="text-sm font-bold font-mono-numbers text-slate-900 dark:text-white">
                  {importJob.totalRows}
                </span>
                <p className="text-[10px] text-slate-400 font-mono uppercase">Total Rows</p>
              </div>

              <div>
                <span className="text-sm font-bold font-mono-numbers text-emerald-600 dark:text-emerald-400">
                  {importJob.acceptedRows}
                </span>
                <p className="text-[10px] text-slate-400 font-mono uppercase">Valid</p>
              </div>

              <div>
                <span className="text-sm font-bold font-mono-numbers text-amber-600 dark:text-amber-400">
                  {importJob.duplicateRows}
                </span>
                <p className="text-[10px] text-slate-400 font-mono uppercase">Duplicates</p>
              </div>

              <div>
                <span className="text-sm font-bold font-mono-numbers text-rose-600 dark:text-rose-400">
                  {importJob.rejectedRows}
                </span>
                <p className="text-[10px] text-slate-400 font-mono uppercase">Invalid</p>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200/80 dark:border-[#1e2333] space-y-1 text-[11px] font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Ingested Date:</span>
              <span className="text-slate-900 dark:text-slate-200">{new Date(importJob.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Atoms Extracted:</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{importJob.atomsExtracted} clauses</span>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex justify-between pt-3 border-t border-slate-100 dark:border-[#334155]">
          <button
            onClick={handleReprocess}
            className="px-3 py-1.5 rounded-md bg-[#2E8B75]/10 text-[#2E8B75] dark:text-[#3B9B85] font-semibold flex items-center gap-1.5 transition-colors hover:bg-[#2E8B75]/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reprocess Analysis</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-slate-100 dark:bg-[#334155] text-slate-700 dark:text-slate-200 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
