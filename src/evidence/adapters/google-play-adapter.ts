import { AppMetadata, ReviewFetchResult } from './review-source-adapter';

export class GooglePlayAdapter {
  /**
   * Validates whether a URL is a syntactically valid public Google Play app URL.
   */
  public static validateUrl(inputUrl: string): { isValid: boolean; error?: string; appId?: string } {
    if (!inputUrl || typeof inputUrl !== 'string') {
      return { isValid: false, error: 'URL is required.' };
    }

    try {
      const url = new URL(inputUrl.trim());
      const isPlayGoogle =
        url.hostname === 'play.google.com' ||
        url.hostname.endsWith('.play.google.com') ||
        url.hostname === 'market.android.com';

      if (!isPlayGoogle) {
        return { isValid: false, error: 'URL must be a valid Google Play Store domain (play.google.com).' };
      }

      const idParam = url.searchParams.get('id');
      if (!idParam || !idParam.trim()) {
        return { isValid: false, error: 'Google Play URL is missing the app package identifier ("?id=...").' };
      }

      const appId = idParam.trim();
      // Java/Android package naming convention: alphanumeric segments separated by dots
      if (!/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(appId)) {
        return { isValid: false, error: `Invalid Android package ID format: "${appId}".` };
      }

      return { isValid: true, appId };
    } catch {
      return { isValid: false, error: 'Invalid URL format. Please provide a complete URL including https://.' };
    }
  }

  /**
   * Extracts the Android package identifier from a Google Play Store URL.
   */
  public static parseAppIdentifier(url: string): string | null {
    const res = GooglePlayAdapter.validateUrl(url);
    return res.isValid && res.appId ? res.appId : null;
  }

  /**
   * Fetches app metadata from the backend API.
   */
  public static async fetchAppMetadata(url: string): Promise<AppMetadata> {
    const check = GooglePlayAdapter.validateUrl(url);
    if (!check.isValid || !check.appId) {
      throw new Error(check.error || 'Invalid Google Play URL.');
    }

    const res = await fetch(`/api/reviews/preview?url=${encodeURIComponent(url.trim())}&platform=google_play`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch Google Play app details (Status ${res.status}).`);
    }

    const data: AppMetadata = await res.json();
    return data;
  }

  /**
   * Fetches real user reviews from Google Play via the backend API.
   */
  public static async fetchReviews(url: string, limit = 50): Promise<ReviewFetchResult> {
    const check = GooglePlayAdapter.validateUrl(url);
    if (!check.isValid || !check.appId) {
      throw new Error(check.error || 'Invalid Google Play URL.');
    }

    const res = await fetch('/api/reviews/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: url.trim(),
        platform: 'google_play',
        limit
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch Google Play reviews (Status ${res.status}).`);
    }

    const result: ReviewFetchResult = await res.json();
    return result;
  }
}
