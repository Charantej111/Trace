import { CanonicalFieldKey, FieldMappingConfig, FieldMatchSuggestion } from '../types';

export class FieldDetector {
  private static FIELD_PATTERNS: Record<CanonicalFieldKey, { regex: RegExp; priority: number }> = {
    text: {
      regex: /^(feedback|text|comment|comment_text|review|message|body|description|statement|quote|content|verbatim|issue)$/i,
      priority: 100
    },
    customerName: {
      regex: /^(customer|customer_name|user|user_name|name|author|author_name|account|submitter|client)$/i,
      priority: 90
    },
    customerEmail: {
      regex: /^(email|user_email|customer_email|contact_email|mail)$/i,
      priority: 95
    },
    externalId: {
      regex: /^(id|external_id|review_id|ticket_id|feedback_id|uuid|ref)$/i,
      priority: 90
    },
    createdAt: {
      regex: /^(date|created_at|timestamp|submitted_at|time|datetime|created)$/i,
      priority: 90
    },
    rating: {
      regex: /^(stars|rating|score|val|nps|csat)$/i,
      priority: 90
    },
    segment: {
      regex: /^(segment|customer_segment|tier|plan|cohort|account_type)$/i,
      priority: 90
    },
    language: {
      regex: /^(language|lang|locale)$/i,
      priority: 90
    },
    productArea: {
      regex: /^(product_area|feature|module|category|area|component)$/i,
      priority: 85
    }
  };

  public static autoDetectHeaders(
    headers: string[],
    sampleRows: Record<string, unknown>[] = []
  ): FieldMappingConfig {
    const config: FieldMappingConfig = {
      text: null,
      customerName: null,
      customerEmail: null,
      externalId: null,
      createdAt: null,
      rating: null,
      segment: null,
      language: null,
      productArea: null
    };

    const assignedHeaders = new Set<string>();

    (Object.keys(FieldDetector.FIELD_PATTERNS) as CanonicalFieldKey[]).forEach(fieldKey => {
      const match = FieldDetector.findBestHeaderMatch(fieldKey, headers, sampleRows, assignedHeaders);
      if (match && match.confidenceScore >= 70) {
        config[fieldKey] = match.sourceHeader;
        assignedHeaders.add(match.sourceHeader);
      }
    });

    // Fallback: If text field not assigned, pick header with longest text values in sample rows
    if (!config.text && headers.length > 0) {
      const bestTextHeader = FieldDetector.findLongestTextHeader(headers, sampleRows, assignedHeaders);
      config.text = bestTextHeader || headers[0];
    }

    return config;
  }

  public static getMatchSuggestions(
    headers: string[],
    sampleRows: Record<string, unknown>[] = []
  ): FieldMatchSuggestion[] {
    const suggestions: FieldMatchSuggestion[] = [];
    const assignedHeaders = new Set<string>();

    (Object.keys(FieldDetector.FIELD_PATTERNS) as CanonicalFieldKey[]).forEach(fieldKey => {
      const match = FieldDetector.findBestHeaderMatch(fieldKey, headers, sampleRows, assignedHeaders);
      if (match) {
        suggestions.push(match);
        if (match.confidenceScore >= 80) {
          assignedHeaders.add(match.sourceHeader);
        }
      }
    });

    return suggestions;
  }

  private static findBestHeaderMatch(
    fieldKey: CanonicalFieldKey,
    headers: string[],
    sampleRows: Record<string, unknown>[],
    assignedHeaders: Set<string>
  ): FieldMatchSuggestion | null {
    const pattern = FieldDetector.FIELD_PATTERNS[fieldKey];
    let bestHeader: string | null = null;
    let maxScore = 0;

    headers.forEach(h => {
      if (assignedHeaders.has(h)) return;

      const normalized = h.toLowerCase().trim().replace(/[\s\-_]+/g, '');
      const keyName = fieldKey.toLowerCase();

      let score = 0;
      if (pattern.regex.test(h.trim())) {
        score = pattern.priority;
      } else if (normalized.includes(keyName) || keyName.includes(normalized)) {
        score = 75;
      }

      // Check sample row values for type hint
      if (sampleRows.length > 0) {
        const val = sampleRows[0][h];
        if (fieldKey === 'text' && typeof val === 'string' && val.length > 30) {
          score += 15;
        } else if (fieldKey === 'customerEmail' && typeof val === 'string' && val.includes('@')) {
          score += 20;
        } else if (fieldKey === 'rating' && (typeof val === 'number' || /^[1-5]$/.test(String(val)))) {
          score += 15;
        }
      }

      if (score > maxScore) {
        maxScore = score;
        bestHeader = h;
      }
    });

    if (!bestHeader) return null;

    return {
      fieldKey,
      sourceHeader: bestHeader,
      confidenceScore: Math.min(100, maxScore),
      isExactMatch: maxScore >= 90,
      sampleValue: sampleRows[0] ? String(sampleRows[0][bestHeader] || '') : undefined
    };
  }

  private static findLongestTextHeader(
    headers: string[],
    sampleRows: Record<string, unknown>[],
    assignedHeaders: Set<string>
  ): string | null {
    if (sampleRows.length === 0) return null;

    let maxLength = 0;
    let bestHeader: string | null = null;

    headers.forEach(h => {
      if (assignedHeaders.has(h)) return;
      const avgLen = sampleRows.reduce((acc, r) => acc + String(r[h] || '').length, 0) / sampleRows.length;
      if (avgLen > maxLength) {
        maxLength = avgLen;
        bestHeader = h;
      }
    });

    return bestHeader;
  }
}
