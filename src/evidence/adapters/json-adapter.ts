import { AdapterParseResult, RawFeedbackRow, AdapterCollection } from '../types';

export class JsonAdapter {
  public static async parse(file: File): Promise<AdapterParseResult> {
    const text = await file.text();
    let jsonContent: unknown;

    try {
      jsonContent = JSON.parse(text);
    } catch (e: unknown) {
      const err = e as Error;
      throw new Error(`Invalid JSON syntax: ${err.message}`);
    }

    if (Array.isArray(jsonContent)) {
      const rows = JsonAdapter.extractRowsFromArray(jsonContent, file.name);
      const headers = JsonAdapter.extractHeaders(rows);

      return {
        headers,
        rows,
        totalRows: rows.length,
        sourceMetadata: {
          name: file.name.replace(/\.[^/.]+$/, ''),
          type: 'json',
          fileName: file.name,
          fileSize: file.size
        }
      };
    }

    if (typeof jsonContent === 'object' && jsonContent !== null) {
      const collections: AdapterCollection[] = [];
      const entries = Object.entries(jsonContent as Record<string, unknown>);

      for (const [key, val] of entries) {
        if (Array.isArray(val) && val.length > 0) {
          const rows = JsonAdapter.extractRowsFromArray(val, file.name);
          collections.push({
            name: key,
            recordCount: rows.length,
            rows
          });
        }
      }

      if (collections.length > 0) {
        const primary = collections[0];
        const headers = JsonAdapter.extractHeaders(primary.rows);

        return {
          headers,
          rows: primary.rows,
          totalRows: primary.rows.length,
          collections,
          sourceMetadata: {
            name: file.name.replace(/\.[^/.]+$/, ''),
            type: 'json',
            fileName: file.name,
            fileSize: file.size
          }
        };
      }
    }

    throw new Error('No JSON records or array of feedback items found in the file.');
  }

  private static extractRowsFromArray(arr: unknown[], fileName: string): RawFeedbackRow[] {
    return arr.map((item, idx) => {
      const data = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : { text: String(item) };
      return {
        rowIndex: idx + 1,
        data,
        sourceLocation: {
          fileName,
          rowIndex: idx + 1
        }
      };
    });
  }

  private static extractHeaders(rows: RawFeedbackRow[]): string[] {
    const keys = new Set<string>();
    rows.slice(0, 50).forEach(r => {
      Object.keys(r.data).forEach(k => keys.add(k));
    });
    return Array.from(keys);
  }
}
