import { SourceType } from '@/types/trace';
import { CanonicalFeedback, FieldMappingConfig, RawFeedbackRow } from '../types';
import { PiiRedactor } from '../pii/pii-redactor';
import { FingerprintEngine } from '../deduplication/fingerprint';

export interface NormalizationContext {
  workspaceId: string;
  sourceId: string;
  importId: string;
  sourceType: SourceType;
  fileName?: string;
  sheetName?: string;
  existingFingerprints?: Set<string>;
}

export class NormalizationEngine {
  public static normalizeBatch(
    rows: RawFeedbackRow[],
    mappings: FieldMappingConfig,
    context: NormalizationContext
  ): {
    records: CanonicalFeedback[];
    validCount: number;
    duplicateCount: number;
    invalidCount: number;
    importId: string;
  } {
    const records: CanonicalFeedback[] = [];
    const seenFingerprints = context.existingFingerprints || new Set<string>();

    let validCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;

    const timestamp = new Date().toISOString();

    rows.forEach(row => {
      const data = row.data;
      const textRaw = mappings.text ? String(data[mappings.text] || '').trim() : '';

      if (!textRaw || textRaw.length < 3) {
        invalidCount++;
        return;
      }

      // PII Redaction: originalText (Immutable Evidence) vs analysisText (Safe AI analysis)
      const { originalText, analysisText } = PiiRedactor.redact(textRaw);

      // Customer Metadata
      const custName = mappings.customerName && data[mappings.customerName]
        ? String(data[mappings.customerName]).trim()
        : undefined;
      const custEmail = mappings.customerEmail && data[mappings.customerEmail]
        ? String(data[mappings.customerEmail]).trim()
        : undefined;
      const extId = mappings.externalId && data[mappings.externalId]
        ? String(data[mappings.externalId]).trim()
        : undefined;

      const customer = (custName || custEmail || extId) ? {
        externalId: extId,
        name: custName,
        email: custEmail,
        segment: mappings.segment && data[mappings.segment] ? String(data[mappings.segment]).trim() : undefined
      } : undefined;

      // Rating Sanitization
      let rating: number | undefined = undefined;
      if (mappings.rating && data[mappings.rating] !== undefined && data[mappings.rating] !== null && data[mappings.rating] !== '') {
        const num = Number(data[mappings.rating]);
        if (!isNaN(num) && num >= 1 && num <= 5) {
          rating = num;
        }
      }

      // Date Sanitization
      let sourceTimestamp = timestamp;
      if (mappings.createdAt && data[mappings.createdAt]) {
        const parsedDate = Date.parse(String(data[mappings.createdAt]));
        if (!isNaN(parsedDate)) {
          sourceTimestamp = new Date(parsedDate).toISOString();
        }
      }

      // Customer Segment & Product Area
      const segment = mappings.segment && data[mappings.segment]
        ? String(data[mappings.segment]).trim()
        : undefined;
      const productArea = mappings.productArea && data[mappings.productArea]
        ? String(data[mappings.productArea]).trim()
        : undefined;
      const language = mappings.language && data[mappings.language]
        ? String(data[mappings.language]).trim()
        : 'en';

      // Capture unmapped columns into normalizedMetadata
      const mappedHeaders = new Set(Object.values(mappings).filter(Boolean));
      const normalizedMetadata: Record<string, unknown> = {};

      Object.entries(data).forEach(([key, val]) => {
        if (!mappedHeaders.has(key) && val !== undefined && val !== null) {
          normalizedMetadata[key] = val;
        }
      });

      // Fingerprinting & Deduplication
      const fingerprint = extId
        ? FingerprintEngine.generateIdentityFingerprint(context.workspaceId, context.sourceId, extId)
        : FingerprintEngine.generateContentFingerprint(context.workspaceId, originalText, custEmail || custName || 'anon');

      const isDuplicate = seenFingerprints.has(fingerprint);
      if (isDuplicate) {
        duplicateCount++;
      } else {
        seenFingerprints.add(fingerprint);
        validCount++;
      }

      const fbId = `fb-${Date.now()}-${row.rowIndex}`;

      records.push({
        id: fbId,
        workspaceId: context.workspaceId,
        sourceId: context.sourceId,
        importId: context.importId,
        sourceType: context.sourceType,
        originalText,
        analysisText,
        externalId: extId,
        customer,
        sourceTimestamp,
        ingestionTimestamp: timestamp,
        sourceLocation: row.sourceLocation || {
          fileName: context.fileName,
          sheetName: context.sheetName,
          rowIndex: row.rowIndex
        },
        rating,
        language,
        segment,
        productArea,
        normalizedMetadata,
        rawPayload: data,
        fingerprint,
        status: isDuplicate ? 'duplicate' : 'valid'
      });
    });

    return {
      records,
      validCount,
      duplicateCount,
      invalidCount,
      importId: context.importId
    };
  }
}
