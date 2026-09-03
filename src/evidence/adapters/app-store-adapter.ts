import { AppMetadata, ReviewFetchResult } from './review-source-adapter';

export class AppStoreAdapter {
  /**
   * Validates whether a URL is a syntactically valid public Apple App Store app URL.
   */
  public static validateUrl(inputUrl: string): {
    isValid: boolean;
    error?: string;
    appId?: string;
    country?: string;
  } {
    if (!inputUrl || typeof inputUrl !== 'string') {
      return { isValid: false, error: 'URL is required.' };
    }

    try {
      const url = new URL(inputUrl.trim());
      const isApple =
        url.hostname === 'apps.apple.com' ||
        url.hostname.endsWith('.apps.apple.com') ||
        url.hostname === 'itunes.apple.com';

      if (!isApple) {
        return { isValid: false, error: 'URL must be a valid Apple App Store domain (apps.apple.com).' };
      }

      // Match path format: /[country]/app/[appName]/id[digits] or /app/id[digits]
      // Examples: /us/app/spotify-music-and-podcasts/id324684580, /app/id324684580
      const match = url.pathname.match(/(?:\/([a-z]{2}))?(?:\/app\/[^/]+)?\/id(\d+)/i);
      if (!match) {
        // Fallback: check query parameter ?id=...
        const idQuery = url.searchParams.get('id');
        if (idQuery && /^\d+$/.test(idQuery.trim())) {
          const countryQuery = url.searchParams.get('country') || 'us';
          return { isValid: true, appId: idQuery.trim(), country: countryQuery.toLowerCase() };
        }
        return { isValid: false, error: 'Could not locate the numeric Apple App ID ("/id123456789") in URL path.' };
      }

      const country = (match[1] || 'us').toLowerCase();
      const appId = match[2];

      return { isValid: true, appId, country };
    } catch {
      return { isValid: false, error: 'Invalid URL format. Please provide a complete URL including https://.' };
    }
  }

  /**
   * Extracts the numeric app ID and country from an Apple App Store URL.
   */
  public static parseAppIdentifier(url: string): { appId: string; country: string } | null {
    const res = AppStoreAdapter.validateUrl(url);
    if (res.isValid && res.appId) {
      return { appId: res.appId, country: res.country || 'us' };
    }
    return null;
  }

  /**
   * Fetches app metadata from the backend API.
   */
  public static async fetchAppMetadata(url: string): Promise<AppMetadata> {
    const check = AppStoreAdapter.validateUrl(url);
    if (!check.isValid || !check.appId) {
      throw new Error(check.error || 'Invalid Apple App Store URL.');
    }

    const res = await fetch(`/api/reviews/preview?url=${encodeURIComponent(url.trim())}&platform=app_store`);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch App Store details (Status ${res.status}).`);
    }

    const data: AppMetadata = await res.json();
    return data;
  }

  /**
   * Fetches real user reviews from the Apple App Store via the backend API.
   */
  public static async fetchReviews(url: string, limit = 50): Promise<ReviewFetchResult> {
    const check = AppStoreAdapter.validateUrl(url);
    if (!check.isValid || !check.appId) {
      throw new Error(check.error || 'Invalid Apple App Store URL.');
    }

    const res = await fetch('/api/reviews/fetch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: url.trim(),
        platform: 'app_store',
        limit
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch App Store reviews (Status ${res.status}).`);
    }

    const result: ReviewFetchResult = await res.json();
    return result;
  }
}
