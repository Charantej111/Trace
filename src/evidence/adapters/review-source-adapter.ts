import { CanonicalFeedback, SourceType } from '@/types/trace';
import { PiiRedactor } from '../pii/pii-redactor';
import { FingerprintEngine } from '../deduplication/fingerprint';

export type ReviewPlatform = 'google_play' | 'app_store';

export interface AppMetadata {
  platform: ReviewPlatform;
  appId: string;
  appName: string;
  developer?: string;
  iconUrl?: string;
  sourceUrl: string;
  rating?: number;
  totalReviews?: number;
  country?: string;
}

export interface RawReviewItem {
  id: string;
  text: string;
  rating: number;
  author?: string;
  date?: string;
  version?: string;
  title?: string;
  thumbsUpCount?: number;
  country?: string;
  metadata?: Record<string, unknown>;
}

export interface ReviewFetchResult {
  platform: ReviewPlatform;
  appId: string;
  appName: string;
  developer?: string;
  iconUrl?: string;
  sourceUrl: string;
  reviews: RawReviewItem[];
  fetchedCount: number;
  requestedCount: number;
  hasMore: boolean;
  warnings?: string[];
  error?: string;
}

export class ReviewSourceAdapter {
  /**
   * Generates a deterministic fingerprint for an app store review.
   * Preferred: platform + appId + externalId
   * Fallback: platform + appId + normalized(text) + date + author
   */
  public static createFingerprint(
    platform: ReviewPlatform,
    appId: string,
    review: RawReviewItem
  ): string {
    if (review.id && review.id.trim()) {
      return FingerprintEngine.hash(`${platform}:${appId}:${review.id.trim()}`);
    }

    const normalizedText = review.text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ');

    return FingerprintEngine.hash(
      `${platform}:${appId}:${normalizedText}:${review.date || ''}:${review.author || ''}`
    );
  }

  /**
   * Normalizes raw fetched reviews into CanonicalFeedback records.
   * Enforces:
   * 1. originalText is verbatim raw text (NEVER modified).
   * 2. analysisText is sanitized via PIIRedactor.
   * 3. Author is kept if available, otherwise null/undefined (NEVER fabricated).
   * 4. Deduplication via deterministic fingerprint.
   */
  public static normalizeReviews(
    reviews: RawReviewItem[],
    appMetadata: AppMetadata,
    context: {
      workspaceId: string;
      sourceId: string;
      importId: string;
    }
  ): {
    records: CanonicalFeedback[];
    validCount: number;
    duplicateCount: number;
    invalidCount: number;
  } {
    const timestamp = new Date().toISOString();
    const seenFingerprints = new Set<string>();
    const records: CanonicalFeedback[] = [];

    let validCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;

    for (let i = 0; i < reviews.length; i++) {
      const review = reviews[i];
      const rawText = (review.text || '').trim();

      // Validate minimum length for meaningful customer feedback
      if (!rawText || rawText.length < 3) {
        invalidCount++;
        continue;
      }

      const fingerprint = ReviewSourceAdapter.createFingerprint(
        appMetadata.platform,
        appMetadata.appId,
        review
      );

      if (seenFingerprints.has(fingerprint)) {
        duplicateCount++;
        continue;
      }
      seenFingerprints.add(fingerprint);

      // PII Redaction strictly on analysisText; originalText is NEVER modified
      const piiResult = PiiRedactor.redact(rawText);
      const safeAnalysisText = piiResult.analysisText;

      const customerName =
        review.author && review.author.trim() ? review.author.trim() : undefined;

      const recordId = `fb-${appMetadata.platform}-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`;

      const canonical: CanonicalFeedback = {
        id: recordId,
        workspaceId: context.workspaceId,
        sourceId: context.sourceId,
        importId: context.importId,
        sourceType: appMetadata.platform as SourceType,
        originalText: rawText,
        analysisText: safeAnalysisText,
        externalId: review.id || undefined,
        customer: customerName ? { name: customerName } : undefined,
        sourceTimestamp: review.date || timestamp,
        ingestionTimestamp: timestamp,
        sourceLocation: {
          fileName: appMetadata.sourceUrl,
          rowIndex: i + 1
        },
        rating: review.rating,
        language: 'en',
        normalizedMetadata: {
          platform: appMetadata.platform,
          appId: appMetadata.appId,
          appName: appMetadata.appName,
          developer: appMetadata.developer,
          rating: review.rating,
          appVersion: review.version,
          title: review.title,
          thumbsUpCount: review.thumbsUpCount,
          country: review.country || appMetadata.country
        },
        rawPayload: {
          ...review,
          storeUrl: appMetadata.sourceUrl
        },
        fingerprint,
        status: 'valid'
      };

      records.push(canonical);
      validCount++;
    }

    return {
      records,
      validCount,
      duplicateCount,
      invalidCount
    };
  }
}
