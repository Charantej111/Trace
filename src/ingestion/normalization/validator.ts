import { FieldMappingConfig, RawFeedbackRow, RowDiagnostic, ValidationResult } from '../types';

export class Validator {
  public static validate(
    rows: RawFeedbackRow[],
    mappings: FieldMappingConfig
  ): ValidationResult {
    const diagnostics: RowDiagnostic[] = [];
    let validRowsCount = 0;
    let invalidRowsCount = 0;
    let warningsCount = 0;

    if (!mappings.text) {
      diagnostics.push({
        rowNumber: 0,
        field: 'text',
        message: 'Feedback Text column is not mapped. High severity error.',
        severity: 'error'
      });
      return {
        totalRows: rows.length,
        validRowsCount: 0,
        invalidRowsCount: rows.length,
        duplicateRowsCount: 0,
        warningsCount: 1,
        diagnostics
      };
    }

    rows.forEach(row => {
      const rowNum = row.rowIndex;
      const textVal = row.data[mappings.text!] ? String(row.data[mappings.text!]).trim() : '';

      if (!textVal || textVal.length < 3) {
        invalidRowsCount++;
        diagnostics.push({
          rowNumber: rowNum,
          field: mappings.text!,
          message: 'Empty or insufficient feedback text (minimum 3 characters required)',
          severity: 'error',
          rawDataSample: JSON.stringify(row.data).slice(0, 80)
        });
        return;
      }

      validRowsCount++;

      // Check optional field warnings
      if (mappings.createdAt) {
        const dateVal = row.data[mappings.createdAt];
        if (dateVal && isNaN(Date.parse(String(dateVal)))) {
          warningsCount++;
          diagnostics.push({
            rowNumber: rowNum,
            field: mappings.createdAt,
            message: `Invalid date format "${dateVal}". Will fall back to ingestion date.`,
            severity: 'warning'
          });
        }
      }

      if (mappings.rating) {
        const ratingVal = row.data[mappings.rating];
        if (ratingVal !== undefined && ratingVal !== null && ratingVal !== '') {
          const num = Number(ratingVal);
          if (isNaN(num) || num < 1 || num > 5) {
            warningsCount++;
            diagnostics.push({
              rowNumber: rowNum,
              field: mappings.rating,
              message: `Rating value "${ratingVal}" is out of range 1-5. Will be set to null.`,
              severity: 'warning'
            });
          }
        }
      }
    });

    return {
      totalRows: rows.length,
      validRowsCount,
      invalidRowsCount,
      duplicateRowsCount: 0,
      warningsCount,
      diagnostics
    };
  }
}
