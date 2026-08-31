import { SourceType } from '@/types/trace';
import { FieldMappingConfig, RawFeedbackRow, RowDiagnostic, ValidationResult } from '../types';

export class Validator {
  public static validateBatch(
    rows: RawFeedbackRow[],
    mappings: FieldMappingConfig,
    _sourceType: SourceType
  ): ValidationResult {
    const diagnostics: RowDiagnostic[] = [];
    let validCount = 0;
    let invalidCount = 0;
    let warningsCount = 0;

    const seenFingerprints = new Set<string>();
    let duplicateCount = 0;

    if (!mappings.text) {
      return {
        totalRows: rows.length,
        validRowsCount: 0,
        invalidRowsCount: rows.length,
        duplicateRowsCount: 0,
        warningsCount: 1,
        diagnostics: [
          {
            rowNumber: 0,
            field: 'text',
            message: 'Feedback Text column is required but was not mapped.',
            severity: 'error'
          }
        ]
      };
    }

    rows.forEach(row => {
      const data = row.data;
      const textVal = mappings.text ? String(data[mappings.text] || '').trim() : '';

      if (!textVal || textVal.length < 3) {
        invalidCount++;
        diagnostics.push({
          rowNumber: row.rowIndex,
          field: mappings.text || 'text',
          message: 'Feedback statement is empty or too short (< 3 characters).',
          severity: 'error',
          rawDataSample: JSON.stringify(data).slice(0, 80)
        });
        return;
      }

      // Check rating bounds
      if (mappings.rating && data[mappings.rating] !== undefined && data[mappings.rating] !== null && data[mappings.rating] !== '') {
        const rNum = Number(data[mappings.rating]);
        if (isNaN(rNum) || rNum < 1 || rNum > 5) {
          warningsCount++;
          diagnostics.push({
            rowNumber: row.rowIndex,
            field: mappings.rating,
            message: `Rating '${data[mappings.rating]}' is outside standard 1-5 range.`,
            severity: 'warning'
          });
        }
      }

      // Check duplicate
      const textClean = textVal.toLowerCase().replace(/\s+/g, ' ');
      if (seenFingerprints.has(textClean)) {
        duplicateCount++;
      } else {
        seenFingerprints.add(textClean);
        validCount++;
      }
    });

    return {
      totalRows: rows.length,
      validRowsCount: validCount,
      invalidRowsCount: invalidCount,
      duplicateRowsCount: duplicateCount,
      warningsCount,
      diagnostics: diagnostics.slice(0, 100)
    };
  }
}
