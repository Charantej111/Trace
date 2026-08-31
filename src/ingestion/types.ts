import { SourceType, IngestionRecordStatus, SourceLocation } from '@/types/trace';

export type FeedbackSourceType = SourceType;

export interface CanonicalCustomer {
  externalId?: string;
  name?: string;
  email?: string;
  segmentId?: string;
  segmentName?: string;
}

export interface CanonicalFeedback {
  id: string;
  workspaceId: string;
  sourceId: string;
  importId: string;
  sourceType: FeedbackSourceType;
  
  // Explicit Text Separation
  originalText: string;     // Exact customer statement (Immutable Evidence)
  analysisText: string;     // PII-sanitized & safe text for AI/rules analysis
  
  // Provenance & Identity
  externalId?: string;
  customer?: CanonicalCustomer;
  sourceTimestamp?: string;
  ingestionTimestamp: string;
  sourceLocation?: SourceLocation;
  
  // Structured Attributes
  rating?: number;
  language?: string;
  segment?: string;
  productArea?: string;
  
  // Metadata & Audit
  normalizedMetadata: Record<string, unknown>; // Preserves all unmapped source columns
  rawPayload: Record<string, unknown>;         // Exact source row/object
  
  fingerprint: string;
  status: IngestionRecordStatus;
}

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
