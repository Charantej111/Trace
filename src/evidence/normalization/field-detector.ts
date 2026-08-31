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

    // 1. Text Field Detection (Highest Priority)
    for (const h of headers) {
      if (FieldDetector.FIELD_PATTERNS.text.regex.test(h)) {
        config.text = h;
        assignedHeaders.add(h);
        break;
      }
    }

    // Fallback: search for long text columns
    if (!config.text && sampleRows.length > 0) {
      for (const h of headers) {
        if (!assignedHeaders.has(h)) {
          const avgLen = sampleRows.reduce((acc, row) => acc + String(row[h] || '').length, 0) / sampleRows.length;
          if (avgLen > 25) {
            config.text = h;
            assignedHeaders.add(h);
            break;
          }
        }
      }
    }

    // 2. Detect all other canonical keys
    const canonicalKeys: CanonicalFieldKey[] = [
      'customerName',
      'customerEmail',
      'externalId',
      'createdAt',
      'rating',
      'segment',
      'language',
      'productArea'
    ];

    canonicalKeys.forEach(key => {
      const pattern = FieldDetector.FIELD_PATTERNS[key];
      for (const h of headers) {
        if (!assignedHeaders.has(h) && pattern.regex.test(h)) {
          config[key] = h;
          assignedHeaders.add(h);
          break;
        }
      }
    });

    return config;
  }

  public static getMatchSuggestions(
    headers: string[],
    sampleRows: Record<string, unknown>[] = []
  ): FieldMatchSuggestion[] {
    const suggestions: FieldMatchSuggestion[] = [];

    const keys: CanonicalFieldKey[] = [
      'text',
      'customerName',
      'customerEmail',
      'externalId',
      'createdAt',
      'rating',
      'segment',
      'language',
      'productArea'
    ];

    keys.forEach(key => {
      const pattern = FieldDetector.FIELD_PATTERNS[key];
      headers.forEach(h => {
        let score = 0;
        const cleanHeader = h.trim().toLowerCase();

        if (pattern.regex.test(cleanHeader)) {
          score = 0.95;
        } else if (cleanHeader.includes(key.toLowerCase())) {
          score = 0.75;
        }

        if (score > 0.4) {
          const sample = sampleRows[0]?.[h] !== undefined ? String(sampleRows[0][h]) : undefined;
          suggestions.push({
            fieldKey: key,
            sourceHeader: h,
            confidenceScore: score,
            isExactMatch: score > 0.9,
            sampleValue: sample
          });
        }
      });
    });

    return suggestions;
  }
}
