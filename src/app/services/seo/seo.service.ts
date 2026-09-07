import { Inject, Injectable, Optional } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { absoluteUrl, breadcrumbData, BreadcrumbData, productData, ProductData, SITE_URL, structuredDataJson } from './structured-data';
import { STATIC_PAGES } from './static-pages';
import { SSR_STATUS } from './ssr-status';

export interface SeoData {
  title: string;
  h1?: string;
  description: string;
  keywords?: string;
  robots?: string;
  canonical_url: string;
  og_title?: string;
  og_description?: string;
  og_image?: string | null;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(
    private meta: Meta,
    private titleService: Title,
    @Inject(DOCUMENT) private document: Document,
    @Optional() @Inject(SSR_STATUS) private setStatus: ((code: number) => void) | null,
  ) {}

  updateSeo(seo: SeoData, type = 'website'): void {
    this.document.documentElement.lang = 'ru';
    this.titleService.setTitle(seo.title);
    this.meta.updateTag({ name: 'description', content: seo.description });
    this.meta.removeTag('name="keywords"');
    this.meta.updateTag({ name: 'robots', content: seo.robots || 'index,follow' });
    this.meta.updateTag({ property: 'og:title', content: seo.og_title || seo.title });
    this.meta.updateTag({ property: 'og:description', content: seo.og_description || seo.description });
    this.meta.updateTag({ property: 'og:image', content: absoluteUrl(seo.og_image || '/assets/images/web-app-manifest-192x192.png') });
    this.meta.updateTag({ property: 'og:type', content: type });
    this.meta.updateTag({ property: 'og:site_name', content: 'Новатех' });
    this.meta.updateTag({ property: 'og:locale', content: 'ru_RU' });
    this.setCanonicalUrl(seo.canonical_url);
    this.setStructuredData([]);
  }

  staticPage(path: string): void {
    const page = STATIC_PAGES[path];
    if (page) this.updateSeo({ ...page, canonical_url: path });
  }

  setCanonicalUrl(path: string): void {
    const candidate = absoluteUrl(path);
    const parsed = new URL(candidate || SITE_URL);
    const url = parsed.origin === SITE_URL ? SITE_URL + parsed.pathname : SITE_URL + '/';
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = url;
    this.meta.updateTag({ property: 'og:url', content: url });
  }

  product(product: ProductData & { seo: SeoData }): void {
    this.updateSeo(product.seo, 'product');
    const canonical = this.document.querySelector('link[rel="canonical"]')!.getAttribute('href')!;
    this.setStructuredData([
      productData(product, canonical, product.seo.description),
      breadcrumbData(product.breadcrumbs || [], canonical),
    ]);
  }

  breadcrumbs(items: BreadcrumbData[], canonical: string): void {
    this.setStructuredData([breadcrumbData(items, canonical)]);
  }

  pageError(status: number): string {
    const missing = status === 404 || status === 410;
    const title = missing ? 'Страница не найдена' : 'Не удалось загрузить страницу';
    this.setStatus?.(missing ? 404 : 503);
    this.updateSeo({
      title: title + ' | Новатех',
      description: missing ? 'Такой страницы нет. Перейдите в каталог Новатех.' : 'Пожалуйста, попробуйте открыть страницу позже.',
      canonical_url: '/', robots: 'noindex,follow',
    });
    this.document.querySelector('link[rel="canonical"]')?.remove();
    this.meta.removeTag('property="og:url"');
    return title;
  }

  setStructuredData(nodes: object[]): void {
    this.document.getElementById('novateh-structured-data')?.remove();
    const script = this.document.createElement('script');
    script.id = 'novateh-structured-data';
    script.type = 'application/ld+json';
    script.textContent = structuredDataJson([
      { '@type': 'Organization', '@id': SITE_URL + '/#organization', name: 'Новатех', url: SITE_URL + '/',
        logo: absoluteUrl('/assets/images/web-app-manifest-192x192.png') },
      { '@type': 'WebSite', '@id': SITE_URL + '/#website', name: 'Новатех', url: SITE_URL + '/',
        inLanguage: 'ru-RU', publisher: { '@id': SITE_URL + '/#organization' } },
      ...nodes,
    ]);
    this.document.head.appendChild(script);
  }
}
