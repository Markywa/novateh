import { isPlatformServer } from '@angular/common';
import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { of } from 'rxjs';

const DEFAULT_SSR_API_ORIGIN = 'https://nvt24.ru';

export const serverApiInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const isServer = isPlatformServer(platformId);

  if (isServer && isSvgAssetRequest(req.url)) {
    return of(new HttpResponse({
      status: 200,
      body: '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
    }));
  }

  const apiPath = getApiPath(req.url);

  if (!apiPath) {
    return next(req);
  }

  const apiOrigin = isServer
    ? process.env['SSR_API_ORIGIN'] || DEFAULT_SSR_API_ORIGIN
    : globalThis.location?.origin || DEFAULT_SSR_API_ORIGIN;

  return next(req.clone({
    url: `${apiOrigin.replace(/\/$/, '')}${apiPath}`,
  }));
};

function isSvgAssetRequest(url: string): boolean {
  const path = url.startsWith('http') ? new URL(url).pathname : url;

  return path.includes('/assets/') && path.endsWith('.svg');
}

function getApiPath(url: string): string | null {
  const normalizedUrl = url.startsWith('v1/') ? `/${url}` : url;

  if (normalizedUrl.startsWith('/v1/')) {
    return normalizedUrl;
  }

  if (!normalizedUrl.startsWith('http')) {
    return null;
  }

  const parsedUrl = new URL(normalizedUrl);

  if (!parsedUrl.pathname.startsWith('/v1/')) {
    return null;
  }

  return `${parsedUrl.pathname}${parsedUrl.search}`;
}
