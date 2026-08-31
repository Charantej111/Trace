import React, { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Layers,
  FileText,
  AlertCircle
} from 'lucide-react';
import { CustomSelect } from '@/components/ui/CustomSelect';
import {
  AdapterParseResult,
  CanonicalFieldKey,
  CsvAdapter,
  FieldDetector,
  FieldMappingConfig,
  FieldMatchSuggestion,
  JsonAdapter,
  NormalizationEngine,
  RawFeedbackRow,
  ValidationResult,
  Validator,
  XlsxAdapter
} from '@/ingestion';
import { SourceType as FeedbackSourceType } from '@/types/trace';
import { useTraceStore } from '@/lib/store';
import { useToast } from '@/components/ui/toast';

interface IngestionWizardModalProps {
  initialFormat?: 'csv' | 'xlsx' | 'json';
  onClose: () => void;
}

const CANONICAL_FIELD_LABELS: Record<CanonicalFieldKey, { label: string; required: boolean; desc: string }> = {
  text: { label: 'Feedback Text', required: true, desc: 'Verbatim customer comment or review statement' },
  customerName: { label: 'Customer Name', required: false, desc: 'User or account display name' },
  customerEmail: { label: 'Customer Email', required: false, desc: 'Contact email address' },
  externalId: { label: 'External Record ID', required: false, desc: 'Ticket ID, Review ID, or UUID' },
  createdAt: { label: 'Submission Date', required: false, desc: 'Timestamp when feedback was submitted' },
  rating: { label: 'Rating / CSAT Score', required: false, desc: '1 to 5 numeric rating or star score' },
  segment: { label: 'Customer Segment', required: false, desc: 'Account tier (e.g. Enterprise, SMB)' },
  language: { label: 'Language', required: false, desc: 'Language code (e.g. en, es)' },
  productArea: { label: 'Product Area', required: false, desc: 'Feature or module category' }
};

export function IngestionWizardModal({ initialFormat = 'csv', onClose }: IngestionWizardModalProps) {
  const { ingestCanonicalBatch } = useTraceStore();
  const { addToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedFormat, setSelectedFormat] = useState<FeedbackSourceType>(initialFormat);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const [parseResult, setParseResult] = useState<AdapterParseResult | null>(null);
  const [selectedCollectionIndex, setSelectedCollectionIndex] = useState<number>(0);
  const [activeRows, setActiveRows] = useState<RawFeedbackRow[]>([]);
  const [activeHeaders, setActiveHeaders] = useState<string[]>([]);

  const [mappings, setMappings] = useState<FieldMappingConfig>({
    text: null,
    customerName: null,
    customerEmail: null,
    externalId: null,
    createdAt: null,
    rating: null,
    segment: null,
    language: null,
    productArea: null
  });
  const [suggestions, setSuggestions] = useState<FieldMatchSuggestion[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  // File Upload Handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    try {
      let result: AdapterParseResult;
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext === 'xlsx' || ext === 'xls') {
        setSelectedFormat('xlsx');
        result = await XlsxAdapter.parse(file);
      } else if (ext === 'json') {
        setSelectedFormat('json');
        result = await JsonAdapter.parse(file);
      } else {
        setSelectedFormat('csv');
        result = await CsvAdapter.parse(file);
      }

      setParseResult(result);

      // Determine initial active rows & headers
      let targetRows = result.rows;
      if (result.collections && result.collections.length > 0) {
        targetRows = result.collections[0].rows;
      }
      setActiveRows(targetRows);

      const targetHeaders = result.headers;
      setActiveHeaders(targetHeaders);

      // Run auto-detection
      const sampleRows = targetRows.slice(0, 5).map(r => r.data);
      const autoMappings = FieldDetector.autoDetectHeaders(targetHeaders, sampleRows);
      setMappings(autoMappings);

      const fieldSuggestions = FieldDetector.getMatchSuggestions(targetHeaders, sampleRows);
      setSuggestions(fieldSuggestions);

      setStep(2);
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Parsing Failed',
        description: err instanceof Error ? err.message : 'Could not read file structure'
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleCollectionSelect = (index: number) => {
    if (!parseResult || !parseResult.collections) return;
    setSelectedCollectionIndex(index);
    const col = parseResult.collections[index];
    setActiveRows(col.rows);
    const headers = col.rows.length > 0 ? Object.keys(col.rows[0].data) : parseResult.headers;
    setActiveHeaders(headers);

    const sampleRows = col.rows.slice(0, 5).map(r => r.data);
    setMappings(FieldDetector.autoDetectHeaders(headers, sampleRows));
    setSuggestions(FieldDetector.getMatchSuggestions(headers, sampleRows));
  };

  const handleRunValidation = () => {
    if (!mappings.text) {
      addToast({
        type: 'error',
        title: 'Required Field Missing',
        description: 'Please select which column contains the Feedback Text statement.'
      });
      return;
    }

    const valResult = Validator.validate(activeRows, mappings);
    setValidation(valResult);
    setStep(3);
  };

  const handleConfirmImport = () => {
    if (!parseResult || !validation) return;
    setIsImporting(true);

    setTimeout(() => {
      const sourceId = `src-${selectedFormat}-${Date.now()}`;
      const importId = `imp-${Date.now()}`;
      const workspaceId = 'ws-prod';

      const { records, validCount, duplicateCount, invalidCount } = NormalizationEngine.normalizeBatch(
        activeRows,
        mappings,
        {
          workspaceId,
          sourceId,
          importId,
          sourceType: selectedFormat
        }
      );

      ingestCanonicalBatch(records, {
        name: parseResult.sourceMetadata.name,
        type: selectedFormat,
        fileName: parseResult.sourceMetadata.fileName,
        fileSize: parseResult.sourceMetadata.fileSize,
        importId,
        validCount,
        invalidCount,
        duplicateCount
      });

      setIsImporting(false);
      setStep(4);

      addToast({
        type: 'success',
        title: 'Feedback Imported',
        description: `Successfully ingested ${validCount} canonical records from ${parseResult.sourceMetadata.name}.`
      });
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl surface-glass rounded-3xl border border-slate-200/80 dark:border-[#334155] shadow-2xl overflow-hidden text-xs space-y-4 p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-[#334155] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2E8B75]/10 text-[#2E8B75] dark:text-[#3B9B85] flex items-center justify-center font-bold shadow-2xs">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Ingest Customer Feedback
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Step {step} of 4 — {step === 1 ? 'Upload File' : step === 2 ? 'Map Fields' : step === 3 ? 'Validation & Diagnostics' : 'Import Complete'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: File Upload */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedFormat('csv')}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  selectedFormat === 'csv'
                    ? 'bg-[#2E8B75]/10 border-[#2E8B75] text-[#2E8B75] dark:text-[#3B9B85]'
                    : 'border-slate-200/80 dark:border-[#334155] text-slate-600 dark:text-slate-400'
                }`}
              >
                CSV File (.csv)
              </button>
              <button
                onClick={() => setSelectedFormat('xlsx')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  selectedFormat === 'xlsx'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-[#1e2333] text-slate-600 dark:text-slate-400'
                }`}
              >
                Excel Spreadsheet (.xlsx)
              </button>
              <button
                onClick={() => setSelectedFormat('json')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                  selectedFormat === 'json'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-[#1e2333] text-slate-600 dark:text-slate-400'
                }`}
              >
                JSON Records (.json)
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-300 dark:border-[#1e2333] rounded-2xl p-8 text-center space-y-3">
              <Upload className="w-8 h-8 text-indigo-600 mx-auto" />
              <div>
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-block shadow-xs transition-colors">
                  <span>{isParsing ? 'Reading File Structure...' : `Select ${selectedFormat.toUpperCase()} File`}</span>
                  <input
                    type="file"
                    accept={selectedFormat === 'xlsx' ? '.xlsx,.xls' : selectedFormat === 'json' ? '.json' : '.csv'}
                    onChange={handleFileChange}
                    disabled={isParsing}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-400 mt-2">
                  Supports standard customer feedback exports from any tool or database
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Map Fields */}
        {step === 2 && parseResult && (
          <div className="space-y-4 max-h-120 overflow-y-auto pr-1">
            {/* File info banner */}
            <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-800/30 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{parseResult.sourceMetadata.name}</p>
                <p className="text-[11px] text-slate-400 font-mono">
                  {activeRows.length} rows parsed · {activeHeaders.length} columns detected
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                {selectedFormat.toUpperCase()}
              </span>
            </div>

            {/* Collection picker if JSON object has multiple arrays */}
            {parseResult.collections && parseResult.collections.length > 1 && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 space-y-2">
                <p className="font-bold text-amber-800 dark:text-amber-300 text-xs flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Multiple Collections Detected — Select Feedback Target:
                </p>
                <div className="flex flex-wrap gap-2">
                  {parseResult.collections.map((col, idx) => (
                    <button
                      key={col.name}
                      onClick={() => handleCollectionSelect(idx)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        selectedCollectionIndex === idx
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white dark:bg-[#161a26] text-slate-700 dark:text-slate-300 border-amber-200 dark:border-amber-800/50'
                      }`}
                    >
                      {col.name} ({col.recordCount} items)
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Field Mapper List */}
            <div className="space-y-3 pt-1">
              <p className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                FIELD MAPPING & CONFIDENCE
              </p>

              {(Object.keys(CANONICAL_FIELD_LABELS) as CanonicalFieldKey[]).map(fieldKey => {
                const spec = CANONICAL_FIELD_LABELS[fieldKey];
                const suggestion = suggestions.find(s => s.fieldKey === fieldKey);

                return (
                  <div
                    key={fieldKey}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#090b10] border border-slate-200/80 dark:border-[#1e2333] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span>{spec.label}</span>
                        {spec.required && <span className="text-rose-500">*</span>}
                      </label>

                      {suggestion && (
                        <span className={`text-[10px] font-mono px-2 py-0.2 rounded font-bold ${
                          suggestion.confidenceScore >= 80
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60'
                        }`}>
                          {suggestion.confidenceScore >= 80 ? 'Auto-mapped' : 'Needs Review'} ({suggestion.confidenceScore}%)
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{spec.desc}</p>

                    <CustomSelect
                      options={[
                        { value: '', label: '-- Unmapped --' },
                        ...activeHeaders.map(col => ({
                          value: col,
                          label: `${col} ${activeRows[0] ? `(e.g. "${String(activeRows[0].data[col] || '').slice(0, 25)}")` : ''}`
                        }))
                      ]}
                      value={mappings[fieldKey] || ''}
                      onChange={(val) => setMappings(prev => ({ ...prev, [fieldKey]: val || null }))}
                      className="w-full"
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between pt-3 border-t border-slate-100 dark:border-[#171b26]">
              <button
                onClick={() => setStep(1)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#161a26] text-slate-700 dark:text-slate-300 font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleRunValidation}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <span>Validate & Preview</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Validation & Diagnostics */}
        {step === 3 && validation && (
          <div className="space-y-4 max-h-120 overflow-y-auto pr-1">
            {/* Validation Dashboard Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-center space-y-0.5">
                <span className="text-lg font-black font-mono-numbers text-emerald-700 dark:text-emerald-400">
                  {validation.validRowsCount}
                </span>
                <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase font-mono">
                  Valid Records
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-center space-y-0.5">
                <span className="text-lg font-black font-mono-numbers text-amber-700 dark:text-amber-400">
                  {validation.warningsCount}
                </span>
                <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase font-mono">
                  Warnings
                </p>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 text-center space-y-0.5">
                <span className="text-lg font-black font-mono-numbers text-rose-700 dark:text-rose-400">
                  {validation.invalidRowsCount}
                </span>
                <p className="text-[10px] font-bold text-rose-800 dark:text-rose-300 uppercase font-mono">
                  Invalid Rows
                </p>
              </div>
            </div>

            {/* Diagnostic Warnings / Errors List */}
            {validation.diagnostics.length > 0 && (
              <div className="space-y-2">
                <p className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  ROW-LEVEL DIAGNOSTICS LOG ({validation.diagnostics.length})
                </p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {validation.diagnostics.map((diag, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                        diag.severity === 'error'
                          ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200'
                          : 'bg-amber-50/50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200'
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold">
                          Row #{diag.rowNumber} {diag.field ? `[${diag.field}]` : ''}: {diag.message}
                        </p>
                        {diag.rawDataSample && (
                          <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            Sample: {diag.rawDataSample}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-3 border-t border-slate-100 dark:border-[#171b26]">
              <button
                onClick={() => setStep(2)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#161a26] text-slate-700 dark:text-slate-300 font-semibold"
              >
                Fix Field Mapping
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={isImporting || validation.validRowsCount === 0}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
              >
                {isImporting ? (
                  <span>Importing Canonical Evidence...</span>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Import {validation.validRowsCount} Valid Records</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 4 && (
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Feedback Successfully Ingested
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Canonical feedback records have been created and processed into Trace intelligence.
              </p>
            </div>

            <div className="pt-3">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-colors inline-block"
              >
                Done & View Feedback
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
