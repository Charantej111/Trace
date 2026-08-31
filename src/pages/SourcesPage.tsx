import React, { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  FileCode,
  MessageSquare,
  Play,
  Apple,
  Zap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  ChevronRight,
  Database,
  Plus,
  RefreshCw,
  Info
} from 'lucide-react';
import { useTraceStore } from '@/lib/store';
import { CONNECTOR_CATALOG } from '@/ingestion';
import { IngestionWizardModal } from '@/components/ingestion/IngestionWizardModal';
import { PasteFeedbackModal } from '@/components/ingestion/PasteFeedbackModal';
import { ImportDetailsModal } from '@/components/ingestion/ImportDetailsModal';
import { ImportJob } from '@/types/trace';

export function SourcesPage() {
  const {
    sources,
    importJobs,
    feedbackList,
    isDemoMode,
    resetToDemoData,
    clearWorkspaceData
  } = useTraceStore();

  const [activeModal, setActiveModal] = useState<'none' | 'wizard_csv' | 'wizard_xlsx' | 'wizard_json' | 'paste'>('none');
  const [selectedImportJob, setSelectedImportJob] = useState<ImportJob | null>(null);

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'google_play':
        return Play;
      case 'app_store':
        return Apple;
      case 'zendesk':
      case 'intercom':
        return MessageSquare;
      case 'json':
        return FileCode;
      case 'paste':
        return MessageSquare;
      case 'xlsx':
        return FileSpreadsheet;
      default:
        return FileSpreadsheet;
    }
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Demo Data Mode Banner */}
      {isDemoMode && (
        <div className="p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/40 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-indigo-600 text-white shadow-2xs">
              DEMO DATA
            </span>
            <p className="text-slate-700 dark:text-slate-200 font-medium">
              You are exploring Trace with a clean sample dataset. Bring in your own customer feedback to analyze real evidence.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveModal('wizard_csv')}
              className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] shadow-2xs transition-colors"
            >
              Upload Your File
            </button>
            <button
              onClick={clearWorkspaceData}
              className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#161a26] text-slate-600 dark:text-slate-300 hover:text-rose-600 font-medium text-[11px] border border-slate-200 dark:border-[#262f44] transition-colors"
            >
              Start Empty
            </button>
          </div>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-[#1a1e2b] pb-4">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Feedback Sources
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Bring customer feedback into Trace from files, quick capture, or connected tools.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveModal('paste')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#161a26] hover:bg-slate-200 dark:hover:bg-[#1f2536] text-slate-700 dark:text-slate-200 font-semibold transition-colors flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
            <span>Paste Feedback</span>
          </button>

          <button
            onClick={() => setActiveModal('wizard_csv')}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* Primary Section 1: Ingest Feedback (Available Now) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            IMPORT FEEDBACK (AVAILABLE NOW)
          </h2>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 4 Ingestion Methods Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: CSV */}
          <div
            onClick={() => setActiveModal('wizard_csv')}
            className="p-4 rounded-2xl surface-card hover:border-indigo-500/50 transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-[#1a2030] text-indigo-600 dark:text-indigo-400 flex items-center justify-center ring-1 ring-slate-200 dark:ring-[#262f44] group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80">
                ACTIVE
              </span>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                CSV File (.csv)
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1 leading-relaxed">
                Import exported customer feedback rows from any spreadsheet or database.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-[#171b26] flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              <span>Upload CSV</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 2: XLSX */}
          <div
            onClick={() => setActiveModal('wizard_xlsx')}
            className="p-4 rounded-2xl surface-card hover:border-indigo-500/50 transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-[#1a2030] text-indigo-600 dark:text-indigo-400 flex items-center justify-center ring-1 ring-slate-200 dark:ring-[#262f44] group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80">
                ACTIVE
              </span>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Excel (.xlsx)
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1 leading-relaxed">
                Multi-sheet Excel workbook parser with sheet picker and header detection.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-[#171b26] flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              <span>Upload Excel</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 3: JSON */}
          <div
            onClick={() => setActiveModal('wizard_json')}
            className="p-4 rounded-2xl surface-card hover:border-indigo-500/50 transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-[#1a2030] text-indigo-600 dark:text-indigo-400 flex items-center justify-center ring-1 ring-slate-200 dark:ring-[#262f44] group-hover:scale-105 transition-transform">
                <FileCode className="w-4 h-4" />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80">
                ACTIVE
              </span>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                JSON Data (.json)
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1 leading-relaxed">
                Structured JSON arrays or wrapped objects with collection picker.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-[#171b26] flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              <span>Upload JSON</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card 4: Paste Feedback */}
          <div
            onClick={() => setActiveModal('paste')}
            className="p-4 rounded-2xl surface-card hover:border-indigo-500/50 transition-all cursor-pointer space-y-3 group"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-[#1a2030] text-indigo-600 dark:text-indigo-400 flex items-center justify-center ring-1 ring-slate-200 dark:ring-[#262f44] group-hover:scale-105 transition-transform">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80">
                ACTIVE
              </span>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Quick Capture (Paste)
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1 leading-relaxed">
                Paste raw customer statements, chat quotes, or call transcripts.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-[#171b26] flex items-center justify-between text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              <span>Paste Statements</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Primary Section 2: Connect Sources (Coming Soon) */}
      <div className="space-y-3">
        <h2 className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          CONNECT SOURCES (COMING SOON)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {CONNECTOR_CATALOG.map((connector) => {
            const Icon = getSourceIcon(connector.id);
            return (
              <div
                key={connector.id}
                className="p-4 rounded-2xl surface-card space-y-3 opacity-95"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#161a26] text-slate-500 flex items-center justify-center ring-1 ring-slate-200 dark:ring-[#262f44]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-[#161a26] text-slate-500 border border-slate-200 dark:border-slate-800">
                    COMING SOON
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs">
                    {connector.name}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1 leading-relaxed">
                    {connector.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-[#171b26] flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{connector.category}</span>
                  <span>No credentials stored</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Section 3: Import History & Audit Log */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            IMPORT HISTORY & EVIDENCE AUDIT LOG ({importJobs.length})
          </h2>
        </div>

        <div className="p-4 rounded-2xl surface-card space-y-3">
          {importJobs.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 dark:border-[#1e2333] rounded-xl text-xs text-slate-400 space-y-2">
              <Clock className="w-6 h-6 mx-auto text-slate-400" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No Import History Logged Yet</p>
              <p className="text-[11px]">Imported files and quick capture sessions will log complete audit metrics here.</p>
            </div>
          ) : (
            <div className="space-y-2 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[#171b26] text-[10px] font-mono text-slate-400">
                    <th className="py-2 px-3">FILE / SOURCE</th>
                    <th className="py-2 px-3">FORMAT</th>
                    <th className="py-2 px-3">TOTAL ROWS</th>
                    <th className="py-2 px-3">VALID</th>
                    <th className="py-2 px-3">DUPLICATES</th>
                    <th className="py-2 px-3">STATUS</th>
                    <th className="py-2 px-3">INGESTED AT</th>
                    <th className="py-2 px-3 text-right">AUDIT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#171b26]">
                  {importJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-[#0f121a] transition-colors">
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white truncate max-w-45">
                        {job.fileName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] uppercase text-slate-500">
                        {job.fileType || 'file'}
                      </td>
                      <td className="py-2.5 px-3 font-mono-numbers font-semibold text-slate-700 dark:text-slate-300">
                        {job.totalRows}
                      </td>
                      <td className="py-2.5 px-3 font-mono-numbers font-semibold text-emerald-600 dark:text-emerald-400">
                        {job.acceptedRows}
                      </td>
                      <td className="py-2.5 px-3 font-mono-numbers text-amber-600 dark:text-amber-400">
                        {job.duplicateRows}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold uppercase ${
                          job.status === 'completed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/80'
                        }`}>
                          {job.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">
                        {new Date(job.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setSelectedImportJob(job)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 text-indigo-600 dark:text-indigo-300 font-bold text-[11px] transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {(activeModal === 'wizard_csv' || activeModal === 'wizard_xlsx' || activeModal === 'wizard_json') && (
        <IngestionWizardModal
          initialFormat={activeModal === 'wizard_xlsx' ? 'xlsx' : activeModal === 'wizard_json' ? 'json' : 'csv'}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'paste' && (
        <PasteFeedbackModal onClose={() => setActiveModal('none')} />
      )}

      {selectedImportJob && (
        <ImportDetailsModal
          importJob={selectedImportJob}
          onClose={() => setSelectedImportJob(null)}
        />
      )}
    </div>
  );
}
