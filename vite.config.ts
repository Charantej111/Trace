import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

function reviewApiPlugin(): Plugin {
  return {
    name: 'trace-review-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const reqUrl = req.url || '';
        if (!reqUrl.startsWith('/api/reviews/')) {
          return next();
        }

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        try {
          const parsedUrl = new URL(reqUrl, 'http://localhost');
          const pathname = parsedUrl.pathname;

          // Dynamically import ReviewService to ensure full TypeScript module resolution
          const { ReviewService } = await import('./src/server/review-service');

          // 1. GET /api/reviews/preview?url=...&platform=...
          if (pathname === '/api/reviews/preview' && req.method === 'GET') {
            const url = parsedUrl.searchParams.get('url') || '';
            const platform = (parsedUrl.searchParams.get('platform') as 'google_play' | 'app_store') || undefined;

            if (!url) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ status: 'INVALID_URL', message: 'Missing "url" query parameter.' }));
              return;
            }

            try {
              const preview = await ReviewService.getAppPreview(url, platform);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(preview));
            } catch (err: unknown) {
              const error = err as Error;
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ status: 'APP_NOT_FOUND', message: error.message }));
            }
            return;
          }

          // 2. POST /api/reviews/fetch
          if (pathname === '/api/reviews/fetch' && req.method === 'POST') {
            let bodyStr = '';
            req.on('data', chunk => {
              bodyStr += chunk;
            });

            req.on('end', async () => {
              try {
                const body = JSON.parse(bodyStr || '{}');
                const { url, platform, limit = 50 } = body;

                if (!url) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ status: 'INVALID_URL', message: 'Missing "url" in request body.' }));
                  return;
                }

                const result = await ReviewService.fetchReviews(url, platform, Number(limit) || 50);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(result));
              } catch (err: unknown) {
                const error = err as Error;
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ status: 'FETCH_ERROR', message: error.message }));
              }
            });
            return;
          }

          next();
        } catch (serverErr: unknown) {
          const error = serverErr as Error;
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 'SERVER_ERROR', message: error.message }));
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    reviewApiPlugin(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  envPrefix: ['VITE_', 'NEXT_PUBLIC_', 'GEMINI_', 'SUPABASE_'],
  server: {
    open: true,
  },
});
