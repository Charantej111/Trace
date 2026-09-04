import { ReviewService } from '../../src/server/review-service';

interface VercelApiRequest {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
  body?: unknown;
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'METHOD_NOT_ALLOWED',
      message: 'Only POST requests are supported on this endpoint.'
    });
  }

  let body: Record<string, unknown> = {};
  if (typeof req.body === 'string') {
    try {
      body = JSON.parse(req.body);
    } catch {
      return res.status(400).json({
        status: 'INVALID_JSON',
        message: 'Invalid JSON body in request.'
      });
    }
  } else if (req.body && typeof req.body === 'object') {
    body = req.body as Record<string, unknown>;
  }

  const { url, platform, limit = 50 } = body;

  if (!url || typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({
      status: 'INVALID_URL',
      message: 'Missing or invalid "url" in request body.'
    });
  }

  try {
    const result = await ReviewService.fetchReviews(
      url.trim(),
      platform as 'google_play' | 'app_store' | undefined,
      Number(limit) || 50
    );
    return res.status(200).json(result);
  } catch (err: unknown) {
    const error = err as Error;
    return res.status(400).json({
      status: 'FETCH_ERROR',
      message: error.message || 'Failed to fetch reviews.'
    });
  }
}
