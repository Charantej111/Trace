import React, { useState } from 'react';
import {
  Database,
  Upload,
  FileSpreadsheet,
  Play,
  Apple,
  MessageSquare,
  CheckCircle2,
  Lock,
  ArrowRight,
  ChevronRight,
  X,
  Sparkles
} from 'lucide-react';
import { useTraceStore } from '@/lib/store';
import Papa from 'papaparse';
import { useToast } from '@/components/ui/toast';

export function SourcesPage() {
  const { addFeedbackBatch, feedbackList, sources } = useTraceStore();
  const { addToast } = useToast();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [csvFileName, setCsvFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const [feedbackColumn, setFeedbackColumn] = useState('feedback');
  const [customerColumn, setCustomerColumn] = useState('customer_name');

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
        title: 'CSV Import Complete',
        description: `Ingested ${records.length} customer feedback statements into queue.`
      });
    }, 1000);
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Ingestion Sources & Channels
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure automated feedback connectors and upload flat files with auto-atomization.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => {
              setWizardStep(1);
              setIsUploadModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs card-shadow transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV File</span>
          </button>
        </div>
      </div>

      {/* Connected Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* CSV Channel */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 card-shadow space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
              Active
            </span>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">CSV & Flat File Ingestion</h3>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
              Custom batches with sentence clause atomization.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono-numbers">
            <span className="text-slate-500">Statements Ingested:</span>
            <strong className="text-slate-900 dark:text-slate-100 font-bold">{feedbackList.length}</strong>
          </div>
        </div>

        {/* Google Play */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 card-shadow space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Play className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/30">
              Connected
            </span>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Google Play Store</h3>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
              Live app reviews synced hourly for Android builds.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono-numbers">
            <span className="text-slate-500">Last Synced:</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">12m ago</span>
          </div>
        </div>

        {/* Apple App Store */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 card-shadow space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center">
              <Apple className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
              Connected
            </span>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Apple App Store</h3>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
              iOS customer reviews and ratings stream.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono-numbers">
            <span className="text-slate-500">Last Synced:</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">25m ago</span>
          </div>
        </div>

        {/* Zendesk */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 card-shadow space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
              Connected
            </span>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Zendesk Support Tickets</h3>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
              Enterprise customer struggle tickets and bug reports.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono-numbers">
            <span className="text-slate-500">Last Synced:</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">1h ago</span>
          </div>
        </div>

        {/* Intercom */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 card-shadow space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
              Connected
            </span>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Intercom In-App Messenger</h3>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
              Live in-product user conversations and complaints.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono-numbers">
            <span className="text-slate-500">Last Synced:</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">3h ago</span>
          </div>
        </div>

        {/* Sales Calls Transcripts */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/80 card-shadow space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
              Connected
            </span>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Gong / Sales Calls Transcripts</h3>
            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
              Prospect deal blockers and lost reason mentions.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono-numbers">
            <span className="text-slate-500">Last Synced:</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">4h ago</span>
          </div>
        </div>
      </div>

      {/* CSV Ingestion Wizard Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 card-shadow overflow-hidden text-xs space-y-4 p-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  CSV Ingestion & Auto-Atomizer
                </h3>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step 1: Upload File */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center space-y-3 hover:border-indigo-500 transition-colors">
                  <Upload className="w-8 h-8 text-indigo-600 mx-auto" />
                  <div>
                    <label className="cursor-pointer px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-block shadow-xs transition-colors">
                      <span>Choose CSV File</span>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-400 mt-2">or drag and drop a CSV file here</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Map Columns */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/30 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{csvFileName}</p>
                    <p className="text-[11px] text-slate-500">{parsedRows.length} rows parsed</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">
                      Feedback Statement Column <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={feedbackColumn}
                      onChange={(e) => setFeedbackColumn(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none"
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
                    <label className="font-bold text-slate-700 dark:text-slate-300 block">
                      Customer / User Name Column
                    </label>
                    <select
                      value={customerColumn}
                      onChange={(e) => setCustomerColumn(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none"
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

                <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setWizardStep(1)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleProcessCsv}
                    disabled={isProcessing}
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    {isProcessing ? (
                      <span>Atomizing Statements...</span>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Run Atomizer & Ingest</span>
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
