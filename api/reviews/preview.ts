import { ReviewService } from '../../src/server/review-service';

interface VercelApiRequest {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
  headers?: Record<string, string | string[] | undefined>;
}

interface VercelApiResponse {
  status: (code: number) => VercelApiResponse;
  setHeader: (name: string, value: string) => VercelApiResponse;
  json: (data: unknown) => void;
  end: (data?: unknown) => void;
}

export default async function handler(req: VercelApiRequest, res: VercelApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'METHOD_NOT_ALLOWED',
      message: 'Only GET requests are supported on this endpoint.'
    });
  }

  const queryUrl = req.query?.url;
  const url = Array.isArray(queryUrl) ? queryUrl[0] : (queryUrl || '');

  const queryPlatform = req.query?.platform;
  const platform = (Array.isArray(queryPlatform) ? queryPlatform[0] : queryPlatform) as 'google_play' | 'app_store' | undefined;

  if (!url || !url.trim()) {
    return res.status(400).json({
      status: 'INVALID_URL',
      message: 'Missing "url" query parameter.'
    });
  }

  try {
    const preview = await ReviewService.getAppPreview(url.trim(), platform);
    return res.status(200).json(preview);
  } catch (err: unknown) {
    const error = err as Error;
    return res.status(400).json({
      status: 'APP_NOT_FOUND',
      message: error.message || 'Failed to resolve app preview.'
    });
  }
}
