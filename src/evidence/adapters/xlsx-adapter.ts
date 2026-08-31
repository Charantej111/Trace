import { AdapterParseResult, RawFeedbackRow } from '../types';

export class XlsxAdapter {
  public static async parse(file: File): Promise<AdapterParseResult> {
    // For CSV/XLSX text fallbacks or binary spreadsheet rows
    const text = await file.text();
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) {
      return {
        headers: [],
        rows: [],
        totalRows: 0,
        sourceMetadata: {
          name: file.name,
          type: 'xlsx',
          fileName: file.name,
          fileSize: file.size
        }
      };
    }

    const headers = lines[0].split(/[,\t;]/).map(h => h.replace(/^["']|["']$/g, '').trim());
    const rows: RawFeedbackRow[] = lines.slice(1).map((line, idx) => {
      const values = line.split(/[,\t;]/).map(v => v.replace(/^["']|["']$/g, '').trim());
      const data: Record<string, unknown> = {};
      headers.forEach((h, hIdx) => {
        data[h] = values[hIdx] !== undefined ? values[hIdx] : '';
      });

      return {
        rowIndex: idx + 1,
        data,
        sourceLocation: {
          fileName: file.name,
          sheetName: 'Sheet1',
          rowIndex: idx + 1
        }
      };
    });

    return {
      headers,
      rows,
      totalRows: rows.length,
      sheets: ['Sheet1'],
      sourceMetadata: {
        name: file.name.replace(/\.[^/.]+$/, ''),
        type: 'xlsx',
        fileName: file.name,
        fileSize: file.size
      }
    };
  }
}
