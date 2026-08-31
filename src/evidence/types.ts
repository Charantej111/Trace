import { SourceType, IngestionRecordStatus, SourceLocation, CanonicalCustomer, CanonicalFeedback } from '@/types/trace';

export type FeedbackSourceType = SourceType;
export type { CanonicalCustomer, CanonicalFeedback };

export interface RawFeedbackRow {
  rowIndex: number;
  data: Record<string, unknown>;
  sourceLocation?: SourceLocation;
}

export interface AdapterCollection {
  name: string;
  recordCount: number;
  rows: RawFeedbackRow[];
}

export interface AdapterParseResult {
  headers: string[];
  rows: RawFeedbackRow[];
  totalRows: number;
  collections?: AdapterCollection[];
  sheets?: string[];
  sourceMetadata: {
    name: string;
    type: FeedbackSourceType;
    fileName?: string;
    fileSize?: number;
  };
}

export type CanonicalFieldKey =
  | 'text'
  | 'customerName'
  | 'customerEmail'
  | 'externalId'
  | 'createdAt'
  | 'rating'
  | 'segment'
  | 'language'
  | 'productArea';

export interface FieldMatchSuggestion {
  fieldKey: CanonicalFieldKey;
  sourceHeader: string;
  confidenceScore: number;
  isExactMatch: boolean;
  sampleValue?: string;
}

export type FieldMappingConfig = Record<CanonicalFieldKey, string | null>;

export interface RowDiagnostic {
  rowNumber: number;
  field?: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  rawDataSample?: string;
}

export interface ValidationResult {
  totalRows: number;
  validRowsCount: number;
  invalidRowsCount: number;
  duplicateRowsCount: number;
  warningsCount: number;
  diagnostics: RowDiagnostic[];
}

export interface IngestionBatchResult {
  importId: string;
  sourceId: string;
  records: CanonicalFeedback[];
  totalIngested: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  warningCount: number;
}
