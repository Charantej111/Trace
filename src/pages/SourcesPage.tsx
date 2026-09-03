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
  Info,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { useTraceStore } from '@/lib/store';
import { GooglePlayIcon, AppStoreIcon } from '@/components/ui/store-icons';
import { IngestionWizardModal } from '@/components/ingestion/IngestionWizardModal';
import { PasteFeedbackModal } from '@/components/ingestion/PasteFeedbackModal';
import { ImportDetailsModal } from '@/components/ingestion/ImportDetailsModal';
import { AppReviewIngestionModal } from '@/components/ingestion/AppReviewIngestionModal';
import { ImportJob, SourceType } from '@/types/trace';
import { ReviewPlatform } from '@/evidence/adapters/review-source-adapter';

interface IngestionMethod {
  id: string;
  name: string;
  description: string;
  actionText: string;
  icon: React.ComponentType<{ className?: string }>;
  modal: 'wizard_csv' | 'wizard_xlsx' | 'wizard_json' | 'paste' | 'app_reviews';
  platform?: ReviewPlatform;
}

const AVAILABLE_INGESTION_METHODS: IngestionMethod[] = [
  {
    id: 'app_reviews',
    name: 'App Store & Play Store',
    description: 'Enter a public Google Play or Apple App Store URL to fetch real user reviews.',
    actionText: 'Fetch Reviews',
    icon: Smartphone,
    modal: 'app_reviews'
  },
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
    sources,
    importJobs
  } = useTraceStore();

  const [activeModal, setActiveModal] = useState<
    'none' | 'wizard_csv' | 'wizard_xlsx' | 'wizard_json' | 'paste' | 'app_reviews'
  >('none');
  const [reviewPlatform, setReviewPlatform] = useState<ReviewPlatform>('google_play');
  const [selectedImportJob, setSelectedImportJob] = useState<ImportJob | null>(null);

  // Filter configured app review sources from database
  const configuredAppSources = sources.filter(
    s => s.type === 'google_play' || s.type === 'app_store'
  );

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
            Bring customer feedback into Trace from public app stores, spreadsheets, or quick capture.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => {
              setReviewPlatform('google_play');
              setActiveModal('app_reviews');
            }}
            className="px-3.5 py-2 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30 font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Smartphone className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Import App Reviews</span>
          </button>

          <button
            onClick={() => setActiveModal('paste')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-[#334155] text-slate-700 dark:text-slate-200 font-semibold transition-colors flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#2E8B75]" />
            <span>Paste Feedback</span>
          </button>

          <button
            onClick={() => setActiveModal('wizard_csv')}
            className="px-3.5 py-2 rounded-xl bg-[#2E8B75] hover:bg-[#267361] text-white font-semibold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* Configured App Review Sources from Supabase */}
      {configuredAppSources.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-mono font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider">
              CONFIGURED APP STORE SOURCES ({configuredAppSources.length})
            </h2>
            <span className="text-[11px] text-teal-600 dark:text-teal-400 font-mono">
              Live Supabase Persistence
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {configuredAppSources.map(source => {
              const isGoogle = source.type === 'google_play';
              return (
                <div
                  key={source.id}
                  className="p-4 rounded-xl surface-card border border-slate-200 dark:border-white/10 space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center p-1.5 shrink-0">
                        {isGoogle ? (
                          <GooglePlayIcon className="w-5 h-5" />
                        ) : (
                          <AppStoreIcon className="w-5 h-5 rounded-md" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-[#EDEDED] text-xs truncate max-w-42.5">
                          {source.name}
                        </h3>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          {isGoogle ? 'Google Play' : 'App Store'}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-semibold uppercase tracking-wider bg-teal-500/10 text-teal-600 dark:text-teal-400">
                      Active
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">PERSISTED REVIEWS</span>
                      <span className="font-bold text-slate-900 dark:text-[#EDEDED] font-mono">
                        {source.recordCount.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-mono">LAST SYNCED</span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-300 font-mono">
                        {source.lastSyncedAt ? new Date(source.lastSyncedAt).toLocaleDateString() : 'Just now'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Primary Section 1: Ingestion Methods */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider">
            DIRECT INGESTION WORKFLOWS
          </h2>
          <span className="text-[11px] text-slate-400 dark:text-[#525866] font-mono">
            Deterministic Normalization & PII Redaction
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {AVAILABLE_INGESTION_METHODS.map((method) => {
            const Icon = method.icon;
            const isAppReview = method.id === 'app_reviews';

            return (
              <div
                key={method.id}
                className={`p-4 rounded-xl surface-card flex flex-col justify-between space-y-3 transition-all ${
                  isAppReview
                    ? 'border-2 border-teal-500/30 bg-teal-500/2 shadow-sm'
                    : 'hover:border-slate-300 dark:hover:border-[#334155]'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isAppReview
                        ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                        : 'bg-slate-100 dark:bg-[#1E293B] text-[#2E8B75]'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {isAppReview && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                        Real Data
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-[#EDEDED] text-sm">
                      {method.name}
                    </h3>
                    <p className="text-slate-500 dark:text-[#8C92A4] text-xs mt-1 leading-relaxed">
                      {method.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (method.modal === 'app_reviews') {
                      setReviewPlatform('google_play');
                      setActiveModal('app_reviews');
                    } else {
                      setActiveModal(method.modal);
                    }
                  }}
                  className={`w-full py-2 px-3 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 ${
                    isAppReview
                      ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/10'
                      : 'bg-slate-100 dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-[#334155] text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <span>{method.actionText}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Section 2: Store Connectors */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider">
            SUPPORTED STORE CONNECTORS
          </h2>
          <span className="text-[11px] text-slate-400 dark:text-[#525866] font-mono">
            Real Public Review Ingestion
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Google Play Card */}
          <div className="p-4 rounded-xl surface-card border border-slate-200 dark:border-white/10 space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center p-2 shrink-0">
                  <GooglePlayIcon className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-semibold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                  Live Store
                </span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-[#EDEDED] text-sm">
                  Google Play Store
                </h3>
                <p className="text-slate-500 dark:text-[#8C92A4] text-xs mt-1 leading-relaxed">
                  Enter any public Google Play app URL (e.g. Spotify, Slack, WhatsApp) to pull real Android user reviews, star ratings, and device versions.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setReviewPlatform('google_play');
                setActiveModal('app_reviews');
              }}
              className="py-2.5 px-3 rounded-xl font-semibold text-xs bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Fetch Google Play Reviews</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Apple App Store Card */}
          <div className="p-4 rounded-xl surface-card border border-slate-200 dark:border-white/10 space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center p-1.5 shrink-0">
                  <AppStoreIcon className="w-6 h-6 rounded shadow-xs" />
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-semibold uppercase tracking-wider bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                  Live Store
                </span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-[#EDEDED] text-sm">
                  Apple App Store
                </h3>
                <p className="text-slate-500 dark:text-[#8C92A4] text-xs mt-1 leading-relaxed">
                  Enter any public Apple App Store URL to pull real iOS user reviews, star ratings, review titles, and app versions.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setReviewPlatform('app_store');
                setActiveModal('app_reviews');
              }}
              className="py-2.5 px-3 rounded-xl font-semibold text-xs bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Fetch App Store Reviews</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
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
              <p className="text-[11px]">Import real app reviews, CSV, Excel, or JSON above to see provenance and ingestion logs.</p>
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
      {activeModal === 'app_reviews' && (
        <AppReviewIngestionModal
          initialPlatform={reviewPlatform}
          onClose={() => setActiveModal('none')}
        />
      )}

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
