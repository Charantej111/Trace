import React, { useState } from 'react';
import {
  Database,
  Upload,
  FileSpreadsheet,
  Play,
  Apple,
  MessageSquare,
  CheckCircle2,
  X,
  Sparkles,
  Radio,
  Plus
} from 'lucide-react';
import { useTraceStore } from '@/lib/store';
import Papa from 'papaparse';
import { useToast } from '@/components/ui/toast';

export function SourcesPage() {
  const { addFeedbackBatch, feedbackList, sources } = useTraceStore();
  const { addToast } = useToast();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [csvFileName, setCsvFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const [feedbackColumn, setFeedbackColumn] = useState('');
  const [customerColumn, setCustomerColumn] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as Record<string, string>[];
        setParsedRows(data);
        if (data.length > 0) {
          const keys = Object.keys(data[0]);
          const fbKey = keys.find(k => /feedback|text|comment|body|review|message/i.test(k)) || keys[0];
          const custKey = keys.find(k => /customer|user|name|account|author/i.test(k)) || keys[1] || keys[0];
          setFeedbackColumn(fbKey);
          setCustomerColumn(custKey);
        }
        setWizardStep(2);
      },
      error: (err) => {
        addToast({
          type: 'error',
          title: 'CSV Parsing Failed',
          description: err.message
        });
      }
    });
  };

  const handleProcessCsv = () => {
    if (parsedRows.length === 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      const records = parsedRows.map((row, idx) => ({
        originalText: row[feedbackColumn] || Object.values(row)[0] || '',
        customerName: row[customerColumn] || `Imported User #${idx + 1}`,
        sourceCreatedAt: new Date().toISOString()
      }));

      addFeedbackBatch(records, csvFileName);

      setIsProcessing(false);
      setIsUploadModalOpen(false);
      setParsedRows([]);
      setWizardStep(1);

      addToast({
        type: 'success',
        title: 'CSV Ingested',
        description: `Successfully ingested and parsed ${records.length} customer feedback items.`
      });
    }, 600);
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'google_play':
        return Play;
      case 'app_store':
        return Apple;
      case 'zendesk':
      case 'intercom':
        return MessageSquare;
      default:
        return FileSpreadsheet;
    }
  };

  return (
    <div className="space-y-4 text-slate-900 dark:text-slate-100">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-[#1a1e2b] pb-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Data Sources & Connectors
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Registered channels supplying customer feedback statements.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => {
              setWizardStep(1);
              setIsUploadModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV File</span>
          </button>
        </div>
      </div>

      {/* Dynamic Data Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {sources.map((src) => {
          const Icon = getSourceIcon(src.type);
          const feedbackCount = feedbackList.filter(
            f => f.sourceType === src.type || f.sourceId === src.id
          ).length || src.recordCount || 0;

          return (
            <div
              key={src.id}
              className="p-4 rounded-2xl surface-card space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#161a26] text-slate-700 dark:text-slate-300 flex items-center justify-center ring-1 ring-slate-200 dark:ring-[#262f44]">
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  src.status === 'active'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/40'
                    : 'bg-slate-100 dark:bg-[#161a26] text-slate-500'
                }`}>
                  {src.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-xs">
                  {src.name}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] font-mono mt-0.5 uppercase">
                  TYPE: {src.type.replace('_', ' ')}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-[#171b26] flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">Ingested Count:</span>
                <strong className="text-slate-900 dark:text-white font-bold font-mono-numbers">
                  {feedbackCount}
                </strong>
              </div>

              {src.lastSyncedAt && (
                <div className="text-[10px] text-slate-400 font-mono">
                  Last Synced: {new Date(src.lastSyncedAt).toLocaleString()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CSV Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#0d0f15] rounded-2xl border border-slate-200 dark:border-[#1e2333] shadow-2xl overflow-hidden text-xs space-y-4 p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#171b26] pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Ingest CSV Feedback
                </h3>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step 1: Upload */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 dark:border-[#1e2333] rounded-2xl p-8 text-center space-y-3">
                  <Upload className="w-8 h-8 text-indigo-600 mx-auto" />
                  <div>
                    <label className="cursor-pointer px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-block shadow-xs transition-colors">
                      <span>Select CSV File</span>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-400 mt-2">Supports any standard CSV feedback export</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Map Columns */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/30 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{csvFileName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{parsedRows.length} rows parsed</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block font-mono text-[11px]">
                      FEEDBACK TEXT COLUMN <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={feedbackColumn}
                      onChange={(e) => setFeedbackColumn(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-[#1e2333] text-xs font-semibold focus:outline-none"
                    >
                      {parsedRows[0] &&
                        Object.keys(parsedRows[0]).map((col) => (
                          <option key={col} value={col}>
                            {col} (e.g. "{parsedRows[0][col]?.slice(0, 30)}...")
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block font-mono text-[11px]">
                      CUSTOMER NAME COLUMN
                    </label>
                    <select
                      value={customerColumn}
                      onChange={(e) => setCustomerColumn(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200 dark:border-[#1e2333] text-xs font-semibold focus:outline-none"
                    >
                      {parsedRows[0] &&
                        Object.keys(parsedRows[0]).map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-[#171b26]">
                  <button
                    onClick={() => setWizardStep(1)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#161a26] text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleProcessCsv}
                    disabled={isProcessing}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    {isProcessing ? (
                      <span>Ingesting...</span>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Confirm & Ingest</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
