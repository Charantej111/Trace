import Papa from 'papaparse';
import { AdapterParseResult, RawFeedbackRow } from '../types';

export class CsvAdapter {
  public static async parse(file: File): Promise<AdapterParseResult> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        complete: (results) => {
          const rawData = (results.data as Record<string, unknown>[]).filter(
            row => row && Object.keys(row).length > 0
          );

          const headers = results.meta.fields || (rawData.length > 0 ? Object.keys(rawData[0]) : []);

          const rows: RawFeedbackRow[] = rawData.map((data, idx) => ({
            rowIndex: idx + 1,
            data,
            sourceLocation: {
              fileName: file.name,
              rowIndex: idx + 1
            }
          }));

          resolve({
            headers,
            rows,
            totalRows: rows.length,
            sourceMetadata: {
              name: file.name,
              type: 'csv',
              fileName: file.name,
              fileSize: file.size
            }
          });
        },
        error: (err) => reject(new Error(`CSV Parsing Failed: ${err.message}`))
      });
    });
  }
}
