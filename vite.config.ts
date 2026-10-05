import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function serverlessApiPlugin(): Plugin {
  return {
    name: 'serverless-api-routes',
    configureServer(server) {
      const apiMiddleware = async (req: any, res: any, next: any) => {
        const rawUrl = req.url || '';
        const parsedUrl = new URL(rawUrl, 'http://localhost');
        const pathname = parsedUrl.pathname;

        if (pathname === '/api/health') {
          try {
            const { default: handler } = await import('./api/health.ts');
            return handler(req, res);
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: err?.message || 'Internal server error' }));
          }
        }

        if (pathname === '/api/sora') {
          try {
            const queryParams: Record<string, string> = {};
            parsedUrl.searchParams.forEach((v, k) => {
              queryParams[k] = v;
            });
            req.query = queryParams;

            const { default: handler } = await import('./api/sora.ts');
            return handler(req, res);
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: err?.message || 'Internal server error' }));
          }
        }

        next();
      };

      // Insert at the front of connect middleware stack to run before Vite file server
      (server.middlewares.stack as any).unshift({ route: '', handle: apiMiddleware });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), serverlessApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
