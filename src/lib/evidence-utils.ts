import { Feedback, FeedbackAtom, SourceType } from '@/types/trace';

/**
 * Single canonical verification function across Trace.
 * Returns true ONLY when:
 * 1. atom.verificationStatus === 'verified'
 * 2. sourceStart and sourceEnd are valid non-negative offsets within originalText
 * 3. feedback.originalText.slice(sourceStart, sourceEnd) === atom.atomText
 */
export function isVerifiedAtom(
  feedback: Feedback | null | undefined,
  atom: FeedbackAtom | null | undefined
): boolean {
  if (!feedback || !atom) return false;
  if (atom.verificationStatus !== 'verified') return false;
  if (typeof atom.sourceStart !== 'number' || typeof atom.sourceEnd !== 'number') return false;

  const originalText = feedback.originalText || '';
  if (
    atom.sourceStart < 0 ||
    atom.sourceEnd > originalText.length ||
    atom.sourceStart >= atom.sourceEnd
  ) {
    return false;
  }

  return originalText.slice(atom.sourceStart, atom.sourceEnd) === atom.atomText;
}

/**
 * Returns all verified, deduplicated atoms for a given feedback record.
 * Deduplicates by unique span (sourceStart:sourceEnd).
 */
export function getVerifiedAtoms(feedback: Feedback | null | undefined): FeedbackAtom[] {
  if (!feedback || !feedback.atoms || feedback.atoms.length === 0) {
    return [];
  }

  const seenSpans = new Set<string>();
  const verified: FeedbackAtom[] = [];

  for (const atom of feedback.atoms) {
    if (isVerifiedAtom(feedback, atom)) {
      const spanKey = `${atom.sourceStart}:${atom.sourceEnd}`;
      if (!seenSpans.has(spanKey)) {
        seenSpans.add(spanKey);
        verified.push(atom);
      }
    }
  }

  return verified;
}

/**
 * Resolves customer name without fabricating identities.
 * Defaults to "Unknown customer" if missing or whitespace.
 */
export function getCustomerDisplayName(customerName?: string | null): string {
  if (customerName && customerName.trim().length > 0) {
    return customerName.trim();
  }
  return 'Unknown customer';
}

/**
 * Resolves segment without fabricating or defaulting to SMB.
 * Defaults to "Unassigned" if missing.
 */
export function getSegmentDisplayName(segmentName?: string | null): string {
  if (segmentName && segmentName.trim().length > 0) {
    return segmentName.trim();
  }
  return 'Unassigned';
}

/**
 * Standard source formatter across Trace.
 * Dynamic mapping from sourceType, fallback to 'UNKNOWN'.
 */
export function formatSourceType(sourceType?: SourceType | string | null): string {
  if (!sourceType) return 'UNKNOWN';
  const normalized = sourceType.toLowerCase().trim();

  switch (normalized) {
    case 'csv':
      return 'CSV';
    case 'xlsx':
      return 'XLSX';
    case 'json':
      return 'JSON';
    case 'paste':
      return 'PASTE';
    case 'google_play':
      return 'GOOGLE PLAY';
    case 'app_store':
      return 'APP STORE';
    case 'zendesk':
      return 'ZENDESK';
    case 'intercom':
      return 'INTERCOM';
    case 'api':
    case 'rest_api':
      return 'API';
    case 'sales_call':
      return 'SALES CALL';
    case 'survey':
      return 'SURVEY';
    default:
      return normalized ? normalized.toUpperCase().replace(/_/g, ' ') : 'UNKNOWN';
  }
}

/**
 * Formats submission date strictly from source timestamps.
 * Uses sourceCreatedAt when available, falls back to importedAt, or returns 'No date'.
 * Never fabricates or defaults to today's date.
 */
export function formatEvidenceDate(sourceCreatedAt?: string | null, importedAt?: string | null): string {
  const dateStr = sourceCreatedAt || importedAt;
  if (!dateStr || !dateStr.trim()) {
    return 'No date';
  }

  const timestamp = Date.parse(dateStr);
  if (isNaN(timestamp)) {
    return 'No date';
  }

  return new Date(timestamp).toLocaleDateString();
}
