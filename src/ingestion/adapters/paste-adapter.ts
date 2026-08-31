import { AdapterParseResult, RawFeedbackRow } from '../types';

export interface PasteInputOptions {
  text: string;
  sourceName?: string;
  defaultSegment?: string;
  defaultRating?: number;
  defaultDate?: string;
}

export class PasteAdapter {
  public static parseInput(options: PasteInputOptions): AdapterParseResult {
    const rawText = options.text || '';
    
    // Split into feedback statements by double line break, bullet point, or numbered list
    const statements = rawText
      .split(/(?:\r?\n){2,}|\n(?=[•\-*]\s)|\n(?=\d+[\.\)]\s)/)
      .map(s => s.replace(/^[•\-*]\s*|^\d+[\.\)]\s*/, '').trim())
      .filter(s => s.length >= 3);

    const sourceName = options.sourceName || 'Quick Capture';
    const timestamp = options.defaultDate || new Date().toISOString();

    const rows: RawFeedbackRow[] = statements.map((stmt, idx) => {
      const rowData: Record<string, unknown> = {
        'Feedback Text': stmt,
        'Created At': timestamp
      };

      if (options.defaultSegment) {
        rowData['Segment'] = options.defaultSegment;
      }
      if (options.defaultRating !== undefined) {
        rowData['Rating'] = options.defaultRating;
      }

      return {
        rowIndex: idx + 1,
        data: rowData,
        sourceLocation: {
          fileName: 'Paste Input',
          rowIndex: idx + 1
        }
      };
    });

    const headers = ['Feedback Text', 'Created At'];
    if (options.defaultSegment) headers.push('Segment');
    if (options.defaultRating !== undefined) headers.push('Rating');

    return {
      headers,
      rows,
      totalRows: rows.length,
      sourceMetadata: {
        name: sourceName,
        type: 'paste'
      }
    };
  }
}
