import React, { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  ChevronDown,
  Layers,
  FileText,
  AlertCircle,
  Database
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
  const [mappings, setMappings] = useState<FieldMappingConfig>({});
  const [suggestions, setSuggestions] = useState<FieldMatchSuggestion[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    try {
      const ext = file.name.split('.').pop()?.toLowerCase();
      let result: AdapterParseResult;

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
    const autoMappings = FieldDetector.autoDetectHeaders(headers, sampleRows);
    setMappings(autoMappings);
    const fieldSuggestions = FieldDetector.getMatchSuggestions(headers, sampleRows);
    setSuggestions(fieldSuggestions);
  };

  const handleRunValidation = () => {
    if (!parseResult) return;

    if (!mappings.text) {
      addToast({
        type: 'error',
        title: 'Missing Required Field',
        description: 'You must map a column to "Feedback Text" before continuing.'
      });
      return;
    }

    const validationResult = Validator.validateBatch(activeRows, mappings, selectedFormat);
    setValidation(validationResult);
    setStep(3);
  };

  const handleConfirmImport = () => {
    if (!parseResult || !validation) return;

    setIsImporting(true);

    setTimeout(() => {
      const { records, validCount, invalidCount, duplicateCount, importId } = NormalizationEngine.normalizeBatch(
        activeRows,
        mappings,
        selectedFormat,
        parseResult.sourceMetadata.fileName,
        parseResult.collections?.[selectedCollectionIndex]?.name
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
      <div className="w-full max-w-2xl surface-glass rounded-2xl border border-slate-200 dark:border-white/[0.08] shadow-2xl overflow-hidden text-xs space-y-4 p-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2E8B75]/10 text-[#2E8B75] dark:text-[#10B981] flex items-center justify-center font-bold shadow-2xs">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#EDEDED]">
                Ingest Customer Feedback
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#8C92A4] font-mono mt-0.5">
                Step {step} of 4 — {step === 1 ? 'Upload File' : step === 2 ? 'Map Fields' : step === 3 ? 'Validation & Diagnostics' : 'Import Complete'}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-[#EDEDED] hover:bg-slate-100 dark:hover:bg-[#1A1E26] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: File Upload */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedFormat('csv')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  selectedFormat === 'csv'
                    ? 'bg-[#2E8B75]/10 border-[#2E8B75] text-[#2E8B75] dark:text-[#10B981]'
                    : 'border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-[#8C92A4]'
                }`}
              >
                CSV File (.csv)
              </button>
              <button
                onClick={() => setSelectedFormat('xlsx')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  selectedFormat === 'xlsx'
                    ? 'bg-[#2E8B75]/10 border-[#2E8B75] text-[#2E8B75] dark:text-[#10B981]'
                    : 'border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-[#8C92A4]'
                }`}
              >
                Excel Spreadsheet (.xlsx)
              </button>
              <button
                onClick={() => setSelectedFormat('json')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  selectedFormat === 'json'
                    ? 'bg-[#2E8B75]/10 border-[#2E8B75] text-[#2E8B75] dark:text-[#10B981]'
                    : 'border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-[#8C92A4]'
                }`}
              >
                JSON Records (.json)
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-200 dark:border-white/[0.08] rounded-xl p-8 text-center space-y-3">
              <Upload className="w-8 h-8 text-[#2E8B75] dark:text-[#10B981] mx-auto" />
              <div>
                <label className="cursor-pointer px-4 py-2 rounded-lg bg-[#2E8B75] hover:bg-[#1F6B58] text-white font-semibold text-xs inline-block shadow-2xs transition-colors">
                  <span>{isParsing ? 'Reading File Structure...' : `Select ${selectedFormat.toUpperCase()} File`}</span>
                  <input
                    type="file"
                    accept={selectedFormat === 'xlsx' ? '.xlsx,.xls' : selectedFormat === 'json' ? '.json' : '.csv'}
                    onChange={handleFileChange}
                    disabled={isParsing}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-400 dark:text-[#525866] mt-2">
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
            <div className="p-3 rounded-lg surface-subtle flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900 dark:text-[#EDEDED]">{parseResult.sourceMetadata.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-[#8C92A4] font-mono">
                  {activeRows.length} rows parsed · {activeHeaders.length} columns detected
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#2E8B75]/10 text-[#2E8B75] dark:text-[#10B981]">
                {selectedFormat.toUpperCase()}
              </span>
            </div>

            {/* Collection picker if JSON object has multiple arrays */}
            {parseResult.collections && parseResult.collections.length > 1 && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-2">
                <p className="font-bold text-amber-800 dark:text-amber-300 text-xs flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Multiple Collections Detected — Select Feedback Target:
                </p>
                <div className="flex flex-wrap gap-2">
                  {parseResult.collections.map((col, idx) => (
                    <button
                      key={col.name}
                      onClick={() => handleCollectionSelect(idx)}
                      className={`px-3 py-1 rounded text-xs font-semibold border transition-all ${
                        selectedCollectionIndex === idx
                          ? 'bg-[#2E8B75] text-white border-[#2E8B75]'
                          : 'bg-white dark:bg-[#13151A] text-slate-700 dark:text-[#EDEDED] border-amber-200 dark:border-amber-900/40'
                      }`}
                    >
                      {col.name} ({col.recordCount} items)
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Field Mapper List */}
            <div className="space-y-2.5 pt-1">
              <p className="font-mono text-[11px] font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider">
                FIELD MAPPING & CONFIDENCE
              </p>

              {(Object.keys(CANONICAL_FIELD_LABELS) as CanonicalFieldKey[]).map(fieldKey => {
                const spec = CANONICAL_FIELD_LABELS[fieldKey];
                const suggestion = suggestions.find(s => s.fieldKey === fieldKey);

                return (
                  <div
                    key={fieldKey}
                    className="p-3 rounded-lg surface-subtle space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-900 dark:text-[#EDEDED] flex items-center gap-1.5">
                        <span>{spec.label}</span>
                        {spec.required && <span className="text-rose-500">*</span>}
                      </label>

                      {suggestion && (
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                          suggestion.confidenceScore >= 80
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-[#10B981] border border-emerald-200/60 dark:border-emerald-900/60'
                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60'
                        }`}>
                          {suggestion.confidenceScore >= 80 ? 'Auto-mapped' : 'Needs Review'} ({suggestion.confidenceScore}%)
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-[#8C92A4]">{spec.desc}</p>

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

            <div className="flex justify-between pt-3 border-t border-slate-100 dark:border-white/[0.08]">
              <button
                onClick={() => setStep(1)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#1A1E26] text-slate-700 dark:text-[#EDEDED] font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleRunValidation}
                className="px-4 py-1.5 rounded-lg bg-[#2E8B75] hover:bg-[#1F6B58] text-white font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
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
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-center space-y-0.5">
                <span className="text-lg font-bold font-mono-numbers text-emerald-700 dark:text-[#10B981]">
                  {validation.validRowsCount}
                </span>
                <p className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase font-mono">
                  Valid Records
                </p>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-center space-y-0.5">
                <span className="text-lg font-bold font-mono-numbers text-amber-700 dark:text-amber-400">
                  {validation.warningsCount}
                </span>
                <p className="text-[10px] font-semibold text-amber-800 dark:text-amber-300 uppercase font-mono">
                  Warnings
                </p>
              </div>

              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-center space-y-0.5">
                <span className="text-lg font-bold font-mono-numbers text-rose-700 dark:text-rose-400">
                  {validation.invalidRowsCount}
                </span>
                <p className="text-[10px] font-semibold text-rose-800 dark:text-rose-300 uppercase font-mono">
                  Invalid Rows
                </p>
              </div>
            </div>

            {/* Diagnostic Warnings / Errors List */}
            {validation.diagnostics.length > 0 && (
              <div className="space-y-2">
                <p className="font-mono text-[11px] font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider">
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
                        <p className="font-semibold">
                          Row #{diag.rowNumber} {diag.field ? `[${diag.field}]` : ''}: {diag.message}
                        </p>
                        {diag.rawDataSample && (
                          <p className="text-[10px] font-mono text-slate-500 dark:text-[#8C92A4] mt-0.5 truncate">
                            Sample: {diag.rawDataSample}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-3 border-t border-slate-100 dark:border-white/[0.08]">
              <button
                onClick={() => setStep(2)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#1A1E26] text-slate-700 dark:text-[#EDEDED] font-semibold"
              >
                Fix Field Mapping
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={isImporting || validation.validRowsCount === 0}
                className="px-4 py-1.5 rounded-lg bg-[#2E8B75] hover:bg-[#1F6B58] text-white font-semibold flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50"
              >
                {isImporting ? (
                  <span>Importing Canonical Evidence...</span>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5" />
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
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-[#10B981] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-[#EDEDED]">
                Feedback Successfully Ingested
              </h4>
              <p className="text-xs text-slate-500 dark:text-[#8C92A4] mt-1">
                Canonical feedback records have been created and processed into Trace intelligence.
              </p>
            </div>

            <div className="pt-3">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-[#2E8B75] hover:bg-[#1F6B58] text-white font-semibold text-xs shadow-2xs transition-colors inline-block"
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
