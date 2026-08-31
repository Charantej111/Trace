import { AdapterCollection, AdapterParseResult, RawFeedbackRow } from '../types';

export class JsonAdapter {
  public static async parse(file: File): Promise<AdapterParseResult> {
    const text = await file.text();
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch (err) {
      throw new Error(`Invalid JSON syntax: ${err instanceof Error ? err.message : String(err)}`);
    }

    let rows: RawFeedbackRow[] = [];
    const collections: AdapterCollection[] = [];

    if (Array.isArray(json)) {
      rows = JsonAdapter.arrayToRows(json, file.name);
    } else if (json && typeof json === 'object') {
      const obj = json as Record<string, unknown>;

      // Discover all array properties
      Object.entries(obj).forEach(([key, val]) => {
        if (Array.isArray(val)) {
          const collectionRows = JsonAdapter.arrayToRows(val, file.name);
          if (collectionRows.length > 0) {
            collections.push({
              name: key,
              recordCount: collectionRows.length,
              rows: collectionRows
            });
          }
        }
      });

      if (collections.length === 1) {
        rows = collections[0].rows;
      } else if (collections.length === 0) {
        // Single object feedback
        rows = [
          {
            rowIndex: 1,
            data: obj,
            sourceLocation: { fileName: file.name, rowIndex: 1 }
          }
        ];
      }
    }

    const headers = rows.length > 0 ? Object.keys(rows[0].data) : ['text', 'rating', 'customer'];

    return {
      headers,
      rows,
      totalRows: rows.length,
      collections: collections.length > 1 ? collections : undefined,
      sourceMetadata: {
        name: file.name,
        type: 'json',
        fileName: file.name,
        fileSize: file.size
      }
    };
  }

  private static arrayToRows(arr: unknown[], fileName: string): RawFeedbackRow[] {
    return arr
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
      .map((data, idx) => ({
        rowIndex: idx + 1,
        data,
        sourceLocation: {
          fileName,
          rowIndex: idx + 1
        }
      }));
  }
}
