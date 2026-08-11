import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAngularSvgIcon } from 'angular-svg-icon';
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { serverApiInterceptor } from './services/server-api.interceptor';
import { svgLoaderProvider } from './services/svg-loader.factory';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([serverApiInterceptor])),
    provideAngularSvgIcon({ loader: svgLoaderProvider }),
    provideClientHydration(withHttpTransferCacheOptions({ includePostRequests: true })),
  ]
};
