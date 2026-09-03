import gplay from 'google-play-scraper';
import { AppMetadata, RawReviewItem, ReviewFetchResult, ReviewPlatform } from '../evidence/adapters/review-source-adapter';
import { GooglePlayAdapter } from '../evidence/adapters/google-play-adapter';
import { AppStoreAdapter } from '../evidence/adapters/app-store-adapter';

export class ReviewService {
  /**
   * Detects platform from URL and validates syntax.
   */
  public static detectPlatform(url: string): ReviewPlatform {
    const gpCheck = GooglePlayAdapter.validateUrl(url);
    if (gpCheck.isValid) return 'google_play';

    const asCheck = AppStoreAdapter.validateUrl(url);
    if (asCheck.isValid) return 'app_store';

    throw new Error('Invalid URL. Must be a valid Google Play (play.google.com) or Apple App Store (apps.apple.com) URL.');
  }

  /**
   * Fetches real metadata preview for a public app URL.
   * ZERO MOCK DATA: Throws real error if app does not exist or store is unreachable.
   */
  public static async getAppPreview(url: string, platformHint?: ReviewPlatform): Promise<AppMetadata> {
    const platform = platformHint || ReviewService.detectPlatform(url);

    if (platform === 'google_play') {
      const appId = GooglePlayAdapter.parseAppIdentifier(url);
      if (!appId) {
        throw new Error('Could not parse Android package identifier from URL.');
      }

      try {
        const appInfo = await gplay.app({ appId });
        return {
          platform: 'google_play',
          appId,
          appName: appInfo.title,
          developer: appInfo.developer,
          iconUrl: appInfo.icon,
          sourceUrl: url,
          rating: typeof appInfo.score === 'number' ? Number(appInfo.score.toFixed(1)) : undefined,
          totalReviews: typeof appInfo.reviews === 'number' ? appInfo.reviews : undefined
        };
      } catch (err: unknown) {
        const error = err as Error;
        if (error.message && error.message.includes('404')) {
          throw new Error(`App "${appId}" was not found on Google Play Store.`);
        }
        throw new Error(`Google Play preview failed: ${error.message}`);
      }
    }

    if (platform === 'app_store') {
      const parsed = AppStoreAdapter.parseAppIdentifier(url);
      if (!parsed) {
        throw new Error('Could not parse numeric Apple App ID from URL.');
      }

      const country = parsed.country || 'us';
      const lookupUrl = `https://itunes.apple.com/lookup?id=${parsed.appId}&country=${country}`;

      try {
        const res = await fetch(lookupUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (!res.ok) {
          throw new Error(`Apple iTunes API returned HTTP ${res.status}`);
        }

        const data = await res.json();
        const results = data.results || [];
        if (results.length === 0) {
          throw new Error(`App with ID "${parsed.appId}" was not found on Apple App Store for country "${country.toUpperCase()}".`);
        }

        const appData = results[0];
        return {
          platform: 'app_store',
          appId: parsed.appId,
          appName: appData.trackName || 'iOS App',
          developer: appData.artistName,
          iconUrl: appData.artworkUrl512 || appData.artworkUrl100,
          sourceUrl: url,
          rating: typeof appData.averageUserRating === 'number' ? Number(appData.averageUserRating.toFixed(1)) : undefined,
          totalReviews: typeof appData.userRatingCount === 'number' ? appData.userRatingCount : undefined,
          country
        };
      } catch (err: unknown) {
        const error = err as Error;
        throw new Error(`Apple App Store preview failed: ${error.message}`);
      }
    }

    throw new Error(`Unsupported platform: ${platform}`);
  }

  /**
   * Fetches real user reviews from the public store.
   * ZERO MOCK DATA: Never fabricates missing reviews or demo text.
   */
  public static async fetchReviews(
    url: string,
    platformHint?: ReviewPlatform,
    limit = 50
  ): Promise<ReviewFetchResult> {
    const platform = platformHint || ReviewService.detectPlatform(url);
    const cappedLimit = Math.min(100, Math.max(1, limit));

    if (platform === 'google_play') {
      const appId = GooglePlayAdapter.parseAppIdentifier(url);
      if (!appId) {
        throw new Error('Could not parse Android package identifier from URL.');
      }

      const preview = await ReviewService.getAppPreview(url, 'google_play');

      try {
        const sortVal = ((gplay as unknown as { sort?: { NEWEST?: number } }).sort?.NEWEST || 2);
        const result = await gplay.reviews({
          appId,
          sort: sortVal as unknown as any,
          num: cappedLimit
        });

        const rawData = Array.isArray(result.data) ? result.data : [];
        const reviews: RawReviewItem[] = rawData.map((r, idx) => ({
          id: r.id || `${appId}-r-${idx}-${r.date ? new Date(r.date).getTime() : Date.now()}`,
          text: (r.text || '').trim(),
          rating: typeof r.score === 'number' ? r.score : 0,
          author: r.userName && r.userName.trim() ? r.userName.trim() : undefined,
          date: r.date ? new Date(r.date).toISOString() : undefined,
          version: r.version || undefined,
          title: r.title || undefined,
          thumbsUpCount: typeof r.thumbsUp === 'number' ? r.thumbsUp : undefined
        })).filter((r: RawReviewItem) => r.text.length > 0);

        return {
          platform: 'google_play',
          appId,
          appName: preview.appName,
          developer: preview.developer,
          iconUrl: preview.iconUrl,
          sourceUrl: url,
          reviews,
          fetchedCount: reviews.length,
          requestedCount: cappedLimit,
          hasMore: reviews.length >= cappedLimit
        };
      } catch (err: unknown) {
        const error = err as Error;
        throw new Error(`Failed to fetch Google Play reviews: ${error.message}`);
      }
    }

    if (platform === 'app_store') {
      const parsed = AppStoreAdapter.parseAppIdentifier(url);
      if (!parsed) {
        throw new Error('Could not parse numeric Apple App ID from URL.');
      }

      const country = parsed.country || 'us';
      const preview = await ReviewService.getAppPreview(url, 'app_store');

      try {
        let reviews: RawReviewItem[] = [];
        const appleHeaders = {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
          'Accept': 'application/xml,text/xml,application/json,*/*'
        };

        // 1. Primary: Fetch Apple native XML/Atom customer reviews feed (reliable across all international storefronts)
        const xmlUrl = `https://itunes.apple.com/${country}/rss/customerreviews/id=${parsed.appId}/xml`;
        const xmlRes = await fetch(xmlUrl, { headers: appleHeaders });

        if (xmlRes.ok) {
          const xmlText = await xmlRes.text();
          reviews = ReviewService.parseAppleXmlReviews(xmlText, parsed.appId, country, cappedLimit);
        }

        // 2. Secondary: If XML had 0 reviews, try the JSON feed format
        if (reviews.length === 0) {
          const jsonUrl = `https://itunes.apple.com/${country}/rss/customerreviews/id=${parsed.appId}/json`;
          const jsonRes = await fetch(jsonUrl, { headers: appleHeaders });

          if (jsonRes.ok) {
            const data = await jsonRes.json().catch(() => ({}));
            const rawEntries = Array.isArray(data.feed?.entry) ? data.feed.entry : [];
            const reviewEntries = rawEntries.filter((e: Record<string, unknown>) => Boolean(e['im:rating']));

            reviews = reviewEntries.slice(0, cappedLimit).map((e: {
              id?: { label?: string };
              content?: { label?: string };
              'im:rating'?: { label?: string };
              author?: { name?: { label?: string } };
              updated?: { label?: string };
              'im:version'?: { label?: string };
              title?: { label?: string };
            }, idx: number) => ({
              id: e.id?.label || `${parsed.appId}-r-${idx}-${e.updated?.label ? new Date(e.updated.label).getTime() : Date.now()}`,
              text: (e.content?.label || '').trim(),
              rating: parseInt(e['im:rating']?.label || '0', 10),
              author: e.author?.name?.label && e.author.name.label.trim() ? e.author.name.label.trim() : undefined,
              date: e.updated?.label ? new Date(e.updated.label).toISOString() : undefined,
              version: e['im:version']?.label || undefined,
              title: e.title?.label || undefined,
              country
            })).filter((r: RawReviewItem) => r.text.length > 0);
          }
        }

        // 3. Fallback: If regional storefront has 0 reviews, check global US storefront
        if (reviews.length === 0 && country !== 'us') {
          const usXmlUrl = `https://itunes.apple.com/us/rss/customerreviews/id=${parsed.appId}/xml`;
          const usXmlRes = await fetch(usXmlUrl, { headers: appleHeaders });

          if (usXmlRes.ok) {
            const usXmlText = await usXmlRes.text();
            reviews = ReviewService.parseAppleXmlReviews(usXmlText, parsed.appId, 'us', cappedLimit);
          }
        }

        return {
          platform: 'app_store',
          appId: parsed.appId,
          appName: preview.appName,
          developer: preview.developer,
          iconUrl: preview.iconUrl,
          sourceUrl: url,
          reviews,
          fetchedCount: reviews.length,
          requestedCount: cappedLimit,
          hasMore: reviews.length >= cappedLimit
        };
      } catch (err: unknown) {
        const error = err as Error;
        throw new Error(`Failed to fetch Apple App Store reviews: ${error.message}`);
      }
    }

    throw new Error(`Unsupported platform: ${platform}`);
  }

  /**
   * Parses reviews from Apple's native RSS XML/Atom feed.
   */
  private static parseAppleXmlReviews(
    xmlText: string,
    appId: string,
    country?: string,
    limit = 50
  ): RawReviewItem[] {
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
    const reviews: RawReviewItem[] = [];
    let match: RegExpExecArray | null;
    let idx = 0;

    while ((match = entryRegex.exec(xmlText)) !== null && reviews.length < limit) {
      const entryXml = match[1];

      const idMatch = entryXml.match(/<id>([^<]+)<\/id>/);
      const titleMatch = entryXml.match(/<title>([^<]+)<\/title>/);
      const contentMatch = entryXml.match(/<content type="text">([\s\S]*?)<\/content>/);
      const ratingMatch = entryXml.match(/<im:rating>(\d+)<\/im:rating>/);
      const versionMatch = entryXml.match(/<im:version>([^<]+)<\/im:version>/);
      const updatedMatch = entryXml.match(/<updated>([^<]+)<\/updated>/);
      const authorMatch = entryXml.match(/<author>[\s\S]*?<name>([^<]+)<\/name>/);

      const text = contentMatch ? contentMatch[1].trim() : '';
      if (!text) continue;

      reviews.push({
        id: idMatch ? idMatch[1].trim() : `${appId}-xml-${idx}`,
        text,
        rating: ratingMatch ? parseInt(ratingMatch[1], 10) : 0,
        author: authorMatch && authorMatch[1].trim() ? authorMatch[1].trim() : undefined,
        date: updatedMatch ? updatedMatch[1].trim() : undefined,
        version: versionMatch && versionMatch[1].trim() ? versionMatch[1].trim() : undefined,
        title: titleMatch && titleMatch[1].trim() ? titleMatch[1].trim() : undefined,
        country
      });
      idx++;
    }

    return reviews;
  }
}
