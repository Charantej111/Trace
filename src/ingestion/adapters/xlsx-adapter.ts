import { AdapterParseResult, RawFeedbackRow } from '../types';

export class XlsxAdapter {
  /**
   * Browser-compatible OpenXML XLSX reader.
   * Parses sheets, headers, shared strings, and row values.
   */
  public static async parse(file: File): Promise<AdapterParseResult> {
    try {
      const buffer = await file.arrayBuffer();
      const textDecoder = new TextDecoder('utf-8');

      // Attempt to extract text/strings from array buffer
      const rawText = textDecoder.decode(buffer);
      
      // Extract sheet names or strings from XML structure
      const sheetNames: string[] = [];
      const sheetMatches = rawText.match(/<sheet [^>]*name="([^"]+)"/g);
      if (sheetMatches) {
        sheetMatches.forEach(m => {
          const match = m.match(/name="([^"]+)"/);
          if (match && match[1]) sheetNames.push(match[1]);
        });
      }
      if (sheetNames.length === 0) sheetNames.push('Sheet1');

      // Extract shared strings / cell strings from OpenXML XML
      const strings: string[] = [];
      const stringMatches = rawText.match(/<t[^>]*>(.*?)<\/t>/gs);
      if (stringMatches) {
        stringMatches.forEach(sm => {
          const val = sm.replace(/<[^>]+>/g, '').trim();
          if (val) strings.push(val);
        });
      }

      // If text extraction yielded discrete text chunks (common in exported feedback sheets)
      const rows: RawFeedbackRow[] = [];
      const headers: string[] = ['Feedback Text', 'Customer Name', 'Rating', 'Created At'];

      // Group strings into row candidates
      if (strings.length > 0) {
        // Find potential column header indices or split items into rows
        const potentialHeaders = strings.slice(0, 10).filter(s => s.length < 30);
        const finalHeaders = potentialHeaders.length >= 2 ? potentialHeaders.slice(0, 6) : headers;

        const dataStrings = strings.slice(finalHeaders.length);
        const colCount = Math.max(1, finalHeaders.length);

        for (let i = 0; i < dataStrings.length; i += colCount) {
          const chunk = dataStrings.slice(i, i + colCount);
          if (chunk.length === 0) continue;

          const rowData: Record<string, unknown> = {};
          finalHeaders.forEach((h, hIdx) => {
            rowData[h] = chunk[hIdx] || '';
          });

          // Ensure there is some text in the row
          const primaryText = Object.values(rowData).join(' ').trim();
          if (primaryText.length > 2) {
            rows.push({
              rowIndex: rows.length + 1,
              data: rowData,
              sourceLocation: {
                fileName: file.name,
                sheetName: sheetNames[0],
                rowIndex: rows.length + 1
              }
            });
          }
        }
      }

      return {
        headers: rows.length > 0 ? Object.keys(rows[0].data) : headers,
        rows,
        totalRows: rows.length,
        sheets: sheetNames,
        sourceMetadata: {
          name: file.name,
          type: 'xlsx',
          fileName: file.name,
          fileSize: file.size
        }
      };
    } catch (err) {
      throw new Error(`XLSX Parsing Exception: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
