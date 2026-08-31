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
  ChevronRight,
  Database,
  Plus,
  RefreshCw,
  Info
} from 'lucide-react';
import { useTraceStore } from '@/lib/store';
import { CONNECTOR_CATALOG } from '@/evidence';
import { IngestionWizardModal } from '@/components/ingestion/IngestionWizardModal';
import { PasteFeedbackModal } from '@/components/ingestion/PasteFeedbackModal';
import { ImportDetailsModal } from '@/components/ingestion/ImportDetailsModal';
import { ImportJob } from '@/types/trace';

interface IngestionMethod {
  id: string;
  name: string;
  description: string;
  actionText: string;
  icon: React.ComponentType<{ className?: string }>;
  modal: 'wizard_csv' | 'wizard_xlsx' | 'wizard_json' | 'paste';
}

const AVAILABLE_INGESTION_METHODS: IngestionMethod[] = [
  {
    id: 'csv',
    name: 'CSV File (.csv)',
    description: 'Import exported customer feedback rows from any spreadsheet or database.',
    actionText: 'Upload CSV',
    icon: FileSpreadsheet,
    modal: 'wizard_csv'
  },
  {
    id: 'xlsx',
    name: 'Excel (.xlsx)',
    description: 'Multi-sheet Excel workbook parser with sheet picker and header detection.',
    actionText: 'Upload Excel',
    icon: FileSpreadsheet,
    modal: 'wizard_xlsx'
  },
  {
    id: 'json',
    name: 'JSON Data (.json)',
    description: 'Structured JSON arrays or wrapped objects with collection picker.',
    actionText: 'Upload JSON',
    icon: FileCode,
    modal: 'wizard_json'
  },
  {
    id: 'paste',
    name: 'Quick Capture (Paste)',
    description: 'Paste raw customer statements, chat quotes, or call transcripts.',
    actionText: 'Paste Quotes',
    icon: MessageSquare,
    modal: 'paste'
  }
];

export function SourcesPage() {
  const {
    importJobs
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
      case 'api':
        return Zap;
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
    <div className="space-y-6 text-slate-900 dark:text-[#EDEDED]">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-[#1F232B] pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-[#EDEDED] flex items-center gap-2">
            Feedback Sources
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
            Bring customer feedback into Trace from files, quick capture, or connected tools.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveModal('paste')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-[#334155] text-slate-700 dark:text-slate-200 font-semibold transition-colors flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#2E8B75]" />
            <span>Paste Feedback</span>
          </button>

          <button
            onClick={() => setActiveModal('wizard_csv')}
            className="px-4 py-2 rounded-xl bg-[#2E8B75] hover:bg-[#1F6B58] text-white font-bold text-xs shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* Primary Section 1: Ingest Feedback (Available Now) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider">
            IMPORT FEEDBACK (AVAILABLE NOW)
          </h2>
          <span className="text-[11px] text-emerald-600 dark:text-[#10B981] font-mono font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> {AVAILABLE_INGESTION_METHODS.length} Ingestion Methods Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {AVAILABLE_INGESTION_METHODS.map((method) => {
            const Icon = method.icon;

            return (
              <div
                key={method.id}
                onClick={() => setActiveModal(method.modal)}
                className="p-4 rounded-xl surface-card surface-card-hover cursor-pointer space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-[#2E8B75]/10 text-[#2E8B75] dark:text-[#10B981] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-[#10B981] border border-emerald-200/80 dark:border-emerald-900/60">
                    ACTIVE
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-[#EDEDED] text-xs group-hover:text-[#2E8B75] dark:group-hover:text-[#10B981] transition-colors">
                    {method.name}
                  </h3>
                  <p className="text-slate-500 dark:text-[#8C92A4] text-[11px] mt-1 leading-relaxed">
                    {method.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-[#1F232B] flex items-center justify-between text-[11px] font-semibold text-[#2E8B75] dark:text-[#10B981]">
                  <span>{method.actionText}</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Section 2: Coming Soon Connectors */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider">
            CONNECTED SOURCES · COMING SOON
          </h2>
          <span className="text-[11px] text-slate-400 dark:text-[#525866] font-mono">
            {CONNECTOR_CATALOG.length} Sources on Roadmap
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {CONNECTOR_CATALOG.map((connector) => {
            const Icon = getSourceIcon(connector.id);

            return (
              <div
                key={connector.id}
                className="p-4 rounded-xl surface-card opacity-85 hover:opacity-100 transition-opacity space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#181B22] text-slate-600 dark:text-[#8C92A4] flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-slate-100 dark:bg-[#181B22] text-slate-500 dark:text-[#8C92A4] border border-slate-200 dark:border-[#232833]">
                    COMING SOON
                  </span>
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-[#EDEDED] text-xs">
                    {connector.name}
                  </h3>
                  <p className="text-slate-500 dark:text-[#8C92A4] text-[11px] mt-0.5 leading-relaxed">
                    {connector.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* Section 3: Import History & Audit Trail */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider">
            IMPORT HISTORY & INGESTION AUDIT TRAIL ({importJobs.length})
          </h2>
        </div>

        <div className="rounded-xl surface-card overflow-hidden">
          {importJobs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 dark:text-[#525866] space-y-2">
              <Database className="w-6 h-6 mx-auto text-slate-400 dark:text-[#525866]" />
              <p className="font-semibold text-slate-700 dark:text-[#EDEDED]">No Imports Recorded Yet</p>
              <p className="text-[11px]">Upload a CSV, Excel, or JSON file above to see provenance and ingestion logs.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#1F232B] bg-slate-50/50 dark:bg-[#15181E] text-[10px] font-mono text-slate-500 dark:text-[#64748B] uppercase">
                    <th className="py-2.5 px-3.5">FILE / SOURCE</th>
                    <th className="py-2.5 px-3.5">STATUS</th>
                    <th className="py-2.5 px-3.5">TOTAL ROWS</th>
                    <th className="py-2.5 px-3.5">ACCEPTED</th>
                    <th className="py-2.5 px-3.5">DUPLICATES</th>
                    <th className="py-2.5 px-3.5">DATE</th>
                    <th className="py-2.5 px-3.5 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1F232B]">
                  {importJobs.map((job) => (
                    <tr
                      key={job.id}
                      className="hover:bg-slate-50 dark:hover:bg-[#181B22] transition-colors"
                    >
                      <td className="py-3 px-3.5 font-semibold text-slate-900 dark:text-[#EDEDED] whitespace-nowrap">
                        {job.fileName}
                      </td>
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold uppercase ${
                          job.status === 'completed'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-[#10B981] border border-emerald-200 dark:border-emerald-900/60'
                            : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60'
                        }`}>
                          {job.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 font-mono text-slate-700 dark:text-[#C9CDD8] font-bold whitespace-nowrap">
                        {job.totalRows}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-emerald-600 dark:text-[#10B981] font-bold whitespace-nowrap">
                        {job.acceptedRows}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-amber-600 dark:text-amber-400 font-bold whitespace-nowrap">
                        {job.duplicateRows}
                      </td>
                      <td className="py-3 px-3.5 font-mono text-[10px] text-slate-400 dark:text-[#525866] whitespace-nowrap">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3.5 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedImportJob(job)}
                          className="text-[11px] font-mono font-semibold text-[#2E8B75] dark:text-[#10B981] hover:underline"
                        >
                          Audit Details →
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

      {/* Modal Dialogs */}
      {activeModal === 'wizard_csv' && (
        <IngestionWizardModal
          initialFormat="csv"
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'wizard_xlsx' && (
        <IngestionWizardModal
          initialFormat="xlsx"
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'wizard_json' && (
        <IngestionWizardModal
          initialFormat="json"
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'paste' && (
        <PasteFeedbackModal
          onClose={() => setActiveModal('none')}
        />
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
