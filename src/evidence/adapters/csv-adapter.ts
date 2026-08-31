import Papa from 'papaparse';
import { AdapterParseResult, RawFeedbackRow } from '../types';

export class CsvAdapter {
  public static async parse(file: File): Promise<AdapterParseResult> {
    return new Promise((resolve, reject) => {
      Papa.parse<Record<string, unknown>>(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: 'greedy',
        complete: (results) => {
          const headers = (results.meta.fields || []).map(h => h.trim());
          const rows: RawFeedbackRow[] = (results.data || []).map((row, index) => ({
            rowIndex: index + 1,
            data: row,
            sourceLocation: {
              fileName: file.name,
              rowIndex: index + 1
            }
          }));

          resolve({
            headers,
            rows,
            totalRows: rows.length,
            sourceMetadata: {
              name: file.name.replace(/\.[^/.]+$/, ''),
              type: 'csv',
              fileName: file.name,
              fileSize: file.size
            }
          });
        },
        error: (error) => {
          reject(new Error(`CSV Parse Error: ${error.message}`));
        }
      });
    });
  }
}
