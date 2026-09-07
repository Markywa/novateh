import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';
import { SSR_STATUS } from './src/app/services/seo/ssr-status';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.disable('x-powered-by');
  server.set('trust proxy', 1);
  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  server.get('/healthz', (_req, res) => {
    res.type('text/plain').send('ok');
  });

  server.get('*', (req, res, next) => {
    let target = req.path.replace(/\/+$/, '') || '/';
    if (target === '/welcome') target = '/';
    target = target.replace(/^\/products\//, '/product/')
      .replace(/^\/producer\//, '/brand/').replace(/^\/catalog\//, '/group/');
    if (target !== req.path && !target.startsWith('//')) {
      const query = req.originalUrl.includes('?') ? req.originalUrl.slice(req.originalUrl.indexOf('?')) : '';
      res.redirect(301, target + query);
      return;
    }
    next();
  });

  // Serve static files from /browser
  server.get('*.*', express.static(browserDistFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Angular engine
  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [
          { provide: APP_BASE_HREF, useValue: baseUrl },
          { provide: SSR_STATUS, useValue: (code: number) => res.status(code) },
        ],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
