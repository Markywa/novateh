import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

type MetrikaFunction = ((counterId: number, method: string, ...args: unknown[]) => void) & {
  a?: unknown[][];
  l?: number;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    ym?: MetrikaFunction;
  }
}

export type AnalyticsGoal =
  | 'ym-add-to-cart'
  | 'ym-begin-checkout'
  | 'ym-open-leadform'
  | 'ym-submit-leadform';

export interface AnalyticsProduct {
  id: number | string;
  name: string;
  price?: number | string | null;
  quantity?: number;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  static readonly CONSENT_STORAGE_KEY = 'cookie_consent_status';

  private readonly counterId = 110137975;
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private initialized = false;
  private lastTrackedUrl: string | null = null;
  private previousPageUrl = '';

  initializeFromStoredConsent(): void {
    if (this.getStoredConsent() === 'accepted') {
      this.initialize();
    }
  }

  getStoredConsent(): 'accepted' | 'declined' | null {
    if (!this.isBrowser) return null;

    const consent = localStorage.getItem(AnalyticsService.CONSENT_STORAGE_KEY);
    return consent === 'accepted' || consent === 'declined' ? consent : null;
  }

  acceptCookies(): void {
    if (!this.isBrowser) return;

    localStorage.setItem(AnalyticsService.CONSENT_STORAGE_KEY, 'accepted');
    this.initialize();
  }

  declineCookies(): void {
    if (!this.isBrowser) return;

    localStorage.setItem(AnalyticsService.CONSENT_STORAGE_KEY, 'declined');
    if (this.initialized) {
      window.ym?.(this.counterId, 'destruct');
      this.initialized = false;
      this.lastTrackedUrl = null;
    }
  }

  trackPageView(routerUrl: string): void {
    if (!this.initialized || !this.isBrowser) return;

    const absoluteUrl = new URL(routerUrl, window.location.origin).href;
    if (absoluteUrl === this.lastTrackedUrl) return;

    window.ym?.(this.counterId, 'hit', absoluteUrl, {
      title: this.document.title,
      referer: this.previousPageUrl || this.document.referrer,
    });

    this.previousPageUrl = absoluteUrl;
    this.lastTrackedUrl = absoluteUrl;
  }

  reachGoal(goal: AnalyticsGoal, params?: Record<string, unknown>): void {
    if (!this.initialized || !this.isBrowser) return;

    window.ym?.(this.counterId, 'reachGoal', goal, params);
  }

  trackAddToCart(product: AnalyticsProduct): void {
    if (!this.initialized || !this.isBrowser) return;

    this.reachGoal('ym-add-to-cart', { product_id: String(product.id) });
    this.pushEcommerce('add', product);
  }

  private initialize(): void {
    if (!this.isBrowser || this.initialized) return;

    this.installCommandQueue();
    window.dataLayer = window.dataLayer || [];

    if (!this.document.getElementById('yandex-metrika-script')) {
      const script = this.document.createElement('script');
      script.id = 'yandex-metrika-script';
      script.async = true;
      script.src = 'https://mc.yandex.ru/metrika/tag.js';
      this.document.head.appendChild(script);
    }

    window.ym?.(this.counterId, 'init', {
      accurateTrackBounce: true,
      clickmap: true,
      defer: true,
      ecommerce: 'dataLayer',
      ssr: true,
      trackLinks: true,
      webvisor: true,
    });

    this.initialized = true;
    this.previousPageUrl = this.document.referrer;
    this.trackPageView(this.currentRouterUrl());
  }

  private installCommandQueue(): void {
    if (window.ym) return;

    const queue: MetrikaFunction = (...args: unknown[]) => {
      queue.a = queue.a || [];
      queue.a.push(args);
    };
    queue.l = Date.now();
    window.ym = queue;
  }

  private currentRouterUrl(): string {
    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
  }

  private pushEcommerce(action: 'add', product: AnalyticsProduct): void {
    const price = Number(product.price);
    window.dataLayer?.push({
      ecommerce: {
        currencyCode: 'RUB',
        [action]: {
          products: [
            {
              id: String(product.id),
              name: product.name,
              ...(Number.isFinite(price) ? { price } : {}),
              quantity: product.quantity ?? 1,
            },
          ],
        },
      },
    });
  }
}
