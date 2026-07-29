// seo.service.ts
import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { Inject } from '@angular/core';

export interface SeoData {
  title: string;
  h1: string;
  description: string;
  keywords: string;
  robots: string;
  canonical_url: string;
  og_title: string;
  og_description: string;
  og_image: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  constructor(
    private meta: Meta,
    private titleService: Title,
    @Inject(DOCUMENT) private document: Document
  ) {}

  updateSeo(seo: SeoData): void {
    // 1. Заголовок страницы
    this.titleService.setTitle(seo.title);
    
    // 2. Основные мета-теги
    this.meta.updateTag({ name: 'description', content: seo.description });
    this.meta.updateTag({ name: 'keywords', content: seo.keywords });
    this.meta.updateTag({ name: 'robots', content: seo.robots });
    
    // 3. Open Graph теги
    this.meta.updateTag({ property: 'og:title', content: seo.og_title || seo.title });
    this.meta.updateTag({ property: 'og:description', content: seo.og_description || seo.description });
    this.meta.updateTag({ property: 'og:image', content: seo.og_image });
    this.meta.updateTag({ property: 'og:type', content: 'product' });
    this.meta.updateTag({ property: 'og:url', content: this.getAbsoluteUrl(seo.canonical_url) });
    
    // 4. Canonical URL (важно для SEO)
    this.updateCanonicalUrl(this.getAbsoluteUrl(seo.canonical_url));
  }
  
  private updateCanonicalUrl(url: string): void {
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
    
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    
    link.setAttribute('href', url);
  }

  setCanonicalUrl(path: string): void {
    this.updateCanonicalUrl(this.getAbsoluteUrl(path));
  }
  
  private getAbsoluteUrl(path: string): string {
    const origin = this.document.location.origin;
    if (/^https?:\/\//i.test(path)) {
      return path;
    }
    return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
  }
}
