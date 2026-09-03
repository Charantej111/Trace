import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Layers,
  FileText,
  AlertCircle,
  Database,
  Download,
  Eye,
  RefreshCw
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
} from '@/evidence';
import { SourceType as FeedbackSourceType } from '@/types/trace';
import { useTraceStore } from '@/lib/store';
import { useToast } from '@/components/ui/toast';

interface IngestionWizardModalProps {
  initialFormat?: 'csv' | 'xlsx' | 'json';
  onClose: () => void;
}

const REQUIRED_FIELDS: CanonicalFieldKey[] = ['text'];
const RECOMMENDED_FIELDS: CanonicalFieldKey[] = ['customerName', 'segment', 'rating'];
const ADVANCED_FIELDS: CanonicalFieldKey[] = ['createdAt', 'externalId', 'customerEmail', 'productArea', 'language'];

const CANONICAL_FIELD_LABELS: Record<CanonicalFieldKey, { label: string; required: boolean; desc: string }> = {
  text: { label: 'Feedback Text', required: true, desc: 'Verbatim customer quote, review comment, or statement' },
  customerName: { label: 'Customer / Author Name', required: false, desc: 'Display name or author of the statement' },
  segment: { label: 'Customer Segment', required: false, desc: 'Account tier (e.g. Enterprise, SMB, Free)' },
  rating: { label: 'Rating / CSAT Score', required: false, desc: '1 to 5 star rating or numeric satisfaction' },
  createdAt: { label: 'Submission Date', required: false, desc: 'Date when the review or comment was posted' },
  externalId: { label: 'External Record ID', required: false, desc: 'Ticket ID, App Store ID, or UUID' },
  customerEmail: { label: 'Customer Email', required: false, desc: 'Optional contact email for account matching' },
  productArea: { label: 'Product Area', required: false, desc: 'Module or feature tag (e.g. Billing, Mobile)' },
  language: { label: 'Language', required: false, desc: 'Language code (e.g. en, es)' }
};

export function IngestionWizardModal({ initialFormat = 'csv', onClose }: IngestionWizardModalProps) {
  const navigate = useNavigate();
  const { ingestCanonicalBatch } = useTraceStore();
  const { addToast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedFormat, setSelectedFormat] = useState<FeedbackSourceType>(initialFormat);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [showDataPreview, setShowDataPreview] = useState(false);

  const [parseResult, setParseResult] = useState<AdapterParseResult | null>(null);
  const [selectedCollectionIndex, setSelectedCollectionIndex] = useState<number>(0);
  const [activeRows, setActiveRows] = useState<RawFeedbackRow[]>([]);
  const [activeHeaders, setActiveHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<FieldMappingConfig>({} as FieldMappingConfig);
  const [suggestions, setSuggestions] = useState<FieldMatchSuggestion[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const downloadSampleCsv = () => {
    const csvContent = [
      'feedback_text,customer_name,customer_segment,rating',
      '"The app freezes completely when exporting PDF reports. This is blocking our financial close.","Acme Corp","Enterprise",1',
      '"Love the clean interface and navigation speed. Great improvement!","Sarah Jenkins","SMB",5',
      '"Search is very slow for datasets with over 500 records. Needs indexing.","Globex Retail","Mid-Market",2',
      '"Would love to see dark mode support and custom tag filters.","TechFlow Solutions","SMB",4'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'trace_sample_feedback.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processSelectedFile = async (file: File) => {
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processSelectedFile(file);
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

  const handleConfirmImport = async () => {
    if (!parseResult || !validation) return;

    setIsImporting(true);

    try {
      const importId = `imp-${Date.now()}`;
      const sourceId = `src-${Date.now()}`;

      const { records, validCount, invalidCount, duplicateCount } = NormalizationEngine.normalizeBatch(
        activeRows,
        mappings,
        {
          workspaceId: 'ws-default',
          sourceId,
          importId,
          sourceType: selectedFormat,
          fileName: parseResult.sourceMetadata.fileName,
          sheetName: parseResult.collections?.[selectedCollectionIndex]?.name
        }
      );

      await ingestCanonicalBatch(records, {
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
        title: 'Import Completed',
        description: `Successfully processed ${validCount} canonical records into durable Trace intelligence.`
      });
    } catch (err: unknown) {
      const error = err as Error;
      setIsImporting(false);
      addToast({
        type: 'error',
        title: 'Ingestion Error',
        description: error.message || 'Failed to process feedback batch'
      });
    }
  };

  // Extract preview samples of mapped feedback text
  const textColumnName = mappings.text;
  const sampleQuotes = textColumnName
    ? activeRows
        .slice(0, 3)
        .map(r => String(r.data[textColumnName] || '').trim())
        .filter(Boolean)
    : [];

  return (
    <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl surface-glass rounded-2xl border border-slate-200 dark:border-white/8 shadow-2xl overflow-hidden text-xs space-y-4 p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/8 pb-3.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2E8B75]/10 text-[#2E8B75] dark:text-[#10B981] flex items-center justify-center font-bold shadow-2xs">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-[#EDEDED]">
                Ingest Customer Feedback
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-[#8C92A4] font-mono mt-0.5">
                Step {step} of 4 — {step === 1 ? 'Select & Upload File' : step === 2 ? 'Review Column Mapping' : step === 3 ? 'Confirm Import & Diagnostics' : 'Complete'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-[#EDEDED] hover:bg-slate-100 dark:hover:bg-[#1A1E26] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step 1: File Upload */}
        {step === 1 && (
          <div className="space-y-4 overflow-y-auto pr-1">
            {/* Format Selection Tabs */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFormat('csv')}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    selectedFormat === 'csv'
                      ? 'bg-[#2E8B75]/10 border-[#2E8B75] text-[#2E8B75] dark:text-[#10B981]'
                      : 'border-slate-200 dark:border-white/8 text-slate-600 dark:text-[#8C92A4]'
                  }`}
                >
                  CSV (.csv)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFormat('xlsx')}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    selectedFormat === 'xlsx'
                      ? 'bg-[#2E8B75]/10 border-[#2E8B75] text-[#2E8B75] dark:text-[#10B981]'
                      : 'border-slate-200 dark:border-white/8 text-slate-600 dark:text-[#8C92A4]'
                  }`}
                >
                  Excel (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFormat('json')}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    selectedFormat === 'json'
                      ? 'bg-[#2E8B75]/10 border-[#2E8B75] text-[#2E8B75] dark:text-[#10B981]'
                      : 'border-slate-200 dark:border-white/8 text-slate-600 dark:text-[#8C92A4]'
                  }`}
                >
                  JSON (.json)
                </button>
              </div>

              {/* Sample Download Button */}
              <button
                type="button"
                onClick={downloadSampleCsv}
                className="text-[11px] font-semibold text-[#2E8B75] dark:text-[#10B981] hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Sample CSV Template</span>
              </button>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center space-y-3 transition-all ${
                isDragging
                  ? 'border-[#2E8B75] bg-[#2E8B75]/5 scale-[1.01]'
                  : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#2E8B75]/10 text-[#2E8B75] dark:text-[#10B981] flex items-center justify-center mx-auto">
                <Upload className="w-5 h-5" />
              </div>

              <div>
                <p className="font-semibold text-slate-800 dark:text-[#EDEDED] text-sm">
                  {isDragging ? 'Drop your file here' : `Drag and drop your ${selectedFormat.toUpperCase()} file`}
                </p>
                <p className="text-slate-500 dark:text-[#8C92A4] text-xs mt-0.5">
                  or browse your computer to select
                </p>
              </div>

              <div className="pt-2">
                <label className="cursor-pointer px-4 py-2 rounded-xl bg-[#2E8B75] hover:bg-[#1F6B58] text-white font-semibold text-xs inline-flex items-center gap-2 shadow-2xs transition-colors">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isParsing ? 'Reading File Structure...' : `Choose ${selectedFormat.toUpperCase()} File`}</span>
                  <input
                    type="file"
                    accept={selectedFormat === 'xlsx' ? '.xlsx,.xls' : selectedFormat === 'json' ? '.json' : '.csv'}
                    onChange={handleFileChange}
                    disabled={isParsing}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-white/6 max-w-sm mx-auto">
                <p className="text-[11px] text-slate-400 dark:text-[#525866]">
                  <strong>Recommended columns:</strong> Feedback Text, Customer Name, Segment (Enterprise/SMB), Rating (1-5).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Map Fields */}
        {step === 2 && parseResult && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            {/* File metadata & quick preview toggle */}
            <div className="p-3 rounded-xl surface-subtle flex items-center justify-between border border-slate-200 dark:border-white/6">
              <div>
                <p className="font-semibold text-slate-900 dark:text-[#EDEDED]">{parseResult.sourceMetadata.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-[#8C92A4] font-mono mt-0.5">
                  {activeRows.length} rows parsed · {activeHeaders.length} columns detected
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDataPreview(!showDataPreview)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 text-[11px] font-semibold text-slate-600 dark:text-[#8C92A4] hover:text-slate-900 dark:hover:text-[#EDEDED] flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                <span>{showDataPreview ? 'Hide Preview' : 'Preview Table'}</span>
              </button>
            </div>

            {/* Collapsible raw data preview table */}
            {showDataPreview && (
              <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-x-auto max-h-40 bg-slate-50 dark:bg-black/40 p-2">
                <table className="w-full text-left font-mono text-[10px]">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500">
                      {activeHeaders.map(h => (
                        <th key={h} className="p-1.5 font-bold uppercase truncate max-w-32">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeRows.slice(0, 3).map((r, i) => (
                      <tr key={i} className="border-b border-slate-100 dark:border-white/4 text-slate-700 dark:text-slate-300">
                        {activeHeaders.map(h => (
                          <td key={h} className="p-1.5 truncate max-w-32">{String(r.data[h] || '')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

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

            {/* Section 1: Required Core Feedback Text */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider">
                  1. REQUIRED FEEDBACK CONTENT
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
                  Required
                </span>
              </div>

              <div className="p-3.5 rounded-xl surface-subtle border border-teal-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 dark:text-[#EDEDED] text-xs">
                    {CANONICAL_FIELD_LABELS.text.label} <span className="text-rose-500">*</span>
                  </label>
                  {suggestions.find(s => s.fieldKey === 'text')?.confidenceScore ? (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-[#10B981] border border-emerald-200/60 dark:border-emerald-900/60">
                      Auto-detected
                    </span>
                  ) : null}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-[#8C92A4]">
                  {CANONICAL_FIELD_LABELS.text.desc}
                </p>

                <CustomSelect
                  options={[
                    { value: '', label: '-- Select Feedback Text Column --' },
                    ...activeHeaders.map(col => ({
                      value: col,
                      label: `${col} ${activeRows[0] ? `("${String(activeRows[0].data[col] || '').slice(0, 30)}...")` : ''}`
                    }))
                  ]}
                  value={mappings.text || ''}
                  onChange={(val) => setMappings(prev => ({ ...prev, text: val || '' }))}
                  className="w-full"
                />

                {/* Live Quotes Preview */}
                {sampleQuotes.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-white/6 space-y-1">
                    <p className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                      Sample quotes from mapped column:
                    </p>
                    <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300 italic pl-2 border-l border-[#2E8B75]">
                      {sampleQuotes.map((q, idx) => (
                        <p key={idx} className="truncate">"{q}"</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: Customer & Segmentation (Recommended) */}
            <div className="space-y-2 pt-1">
              <span className="font-mono text-[10px] font-bold text-slate-400 dark:text-[#525866] uppercase tracking-wider">
                2. CUSTOMER & SEGMENTATION (RECOMMENDED)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {RECOMMENDED_FIELDS.map(fieldKey => {
                  const spec = CANONICAL_FIELD_LABELS[fieldKey];
                  return (
                    <div key={fieldKey} className="p-3 rounded-xl surface-subtle space-y-1.5 border border-slate-200 dark:border-white/6">
                      <label className="font-semibold text-slate-900 dark:text-[#EDEDED] text-xs">
                        {spec.label}
                      </label>
                      <CustomSelect
                        options={[
                          { value: '', label: '-- Optional / Unmapped --' },
                          ...activeHeaders.map(col => ({
                            value: col,
                            label: col
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
            </div>

            {/* Section 3: Advanced Columns (Collapsible) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                className="text-xs font-semibold text-slate-500 dark:text-[#8C92A4] hover:text-slate-900 dark:hover:text-[#EDEDED] flex items-center gap-1"
              >
                {showAdvancedFields ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>{showAdvancedFields ? 'Hide' : 'Show'} Advanced Columns (Date, ID, Email)</span>
              </button>

              {showAdvancedFields && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  {ADVANCED_FIELDS.map(fieldKey => {
                    const spec = CANONICAL_FIELD_LABELS[fieldKey];
                    return (
                      <div key={fieldKey} className="p-3 rounded-xl surface-subtle space-y-1.5 border border-slate-200 dark:border-white/6">
                        <label className="font-semibold text-slate-900 dark:text-[#EDEDED] text-xs">
                          {spec.label}
                        </label>
                        <CustomSelect
                          options={[
                            { value: '', label: '-- Optional / Unmapped --' },
                            ...activeHeaders.map(col => ({
                              value: col,
                              label: col
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
              )}
            </div>

            {/* Footer Navigation */}
            <div className="flex justify-between pt-3 border-t border-slate-100 dark:border-white/8 shrink-0">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#1A1E26] text-slate-700 dark:text-[#EDEDED] font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleRunValidation}
                disabled={!mappings.text}
                className="px-4 py-1.5 rounded-xl bg-[#2E8B75] hover:bg-[#1F6B58] text-white font-semibold flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50"
              >
                <span>Continue to Validation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Validation & Confirmation */}
        {step === 3 && validation && (
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            {/* Summary card */}
            <div className="p-4 rounded-xl surface-subtle border border-slate-200 dark:border-white/8 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-[#EDEDED]">
                  File Validated & Ready to Import
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
                  <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
                    {validation.validRowsCount}
                  </span>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold mt-0.5">
                    Valid Customer Statements
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                  <span className="text-xl font-bold font-mono text-slate-700 dark:text-slate-300">
                    {validation.invalidRowsCount}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                    Excluded Empty Rows
                  </p>
                </div>
              </div>
            </div>

            {/* Reassurance note */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/4 border border-slate-200 dark:border-white/8 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <p className="font-semibold text-slate-700 dark:text-slate-200">
                What happens during import:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                <li>Statements are stored permanently in your secure workspace.</li>
                <li>Verbatim customer quotes and sentiment are extracted.</li>
                <li>Friction clusters and opportunities are synthesized on the Overview and Audit pages.</li>
              </ul>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-between pt-3 border-t border-slate-100 dark:border-white/8 shrink-0">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isImporting}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#1A1E26] text-slate-700 dark:text-[#EDEDED] font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={isImporting || validation.validRowsCount === 0}
                className="px-5 py-2 rounded-xl bg-[#2E8B75] hover:bg-[#1F6B58] text-white font-semibold flex items-center gap-2 shadow-2xs transition-colors disabled:opacity-50"
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing & Analyzing Records...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5" />
                    <span>Import {validation.validRowsCount} Records</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 4 && (
          <div className="space-y-4 text-center py-6 flex-1 flex flex-col justify-center items-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-[#10B981] flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900 dark:text-[#EDEDED]">
                Feedback Successfully Ingested
              </h4>
              <p className="text-xs text-slate-500 dark:text-[#8C92A4] max-w-sm mx-auto">
                Customer statements have been imported and analyzed. You can explore the extracted quotes in your Inbox or review the executive summary in Audit.
              </p>
            </div>

            <div className="pt-4 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/inbox');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#181B22] hover:bg-slate-200 dark:hover:bg-[#232833] text-slate-700 dark:text-[#EDEDED] font-semibold text-xs transition-colors"
              >
                View in Inbox
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/audit');
                }}
                className="px-5 py-2 rounded-xl bg-[#2E8B75] hover:bg-[#1F6B58] text-white font-semibold text-xs shadow-2xs transition-colors"
              >
                View Audit Intelligence
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
