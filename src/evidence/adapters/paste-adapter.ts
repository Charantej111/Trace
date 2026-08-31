import { AdapterParseResult, RawFeedbackRow } from '../types';

export interface PasteInputOptions {
  text: string;
  sourceName?: string;
  defaultSegment?: string;
  defaultRating?: number;
}

export class PasteAdapter {
  public static parseInput(options: PasteInputOptions): AdapterParseResult {
    const raw = options.text.trim();
    if (!raw) {
      return {
        headers: ['text'],
        rows: [],
        totalRows: 0,
        sourceMetadata: {
          name: options.sourceName || 'Quick Paste',
          type: 'paste'
        }
      };
    }

    // Split on double line breaks, bullet points, or numbered lines
    const statements = raw
      .split(/(?:\r?\n){2,}|\n(?=[•\-*]\s)|\n(?=\d+[\.\)]\s)/)
      .map(s => s.replace(/^[•\-*]\s*|^\d+[\.\)]\s*/, '').trim())
      .filter(s => s.length >= 3);

    const now = new Date().toISOString();
    const rows: RawFeedbackRow[] = statements.map((stmt, idx) => ({
      rowIndex: idx + 1,
      data: {
        text: stmt,
        createdAt: now,
        segment: options.defaultSegment || 'SMB',
        rating: options.defaultRating !== undefined ? options.defaultRating : null
      },
      sourceLocation: {
        fileName: 'quick-capture-paste',
        rowIndex: idx + 1
      }
    }));

    return {
      headers: ['text', 'createdAt', 'segment', 'rating'],
      rows,
      totalRows: rows.length,
      sourceMetadata: {
        name: options.sourceName || 'Quick Paste',
        type: 'paste'
      }
    };
  }
}
