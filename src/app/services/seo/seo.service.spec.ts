import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { SeoService } from './seo.service';
import { SSR_STATUS } from './ssr-status';
import { absoluteUrl, breadcrumbData, productData, structuredDataJson } from './structured-data';

describe('Catalog SEO', () => {
  const product = { name: 'K-FLEX ST', sku: '123456789', price: '0.00', currency: 'RUB',
    available: true, media: ['/static/preview.png'], breadcrumbs: [
      { title: 'Каталог', url: '/catalog' }, { title: 'K-FLEX', url: '/brand/k-flex' },
      { title: 'K-FLEX ST', url: null },
    ] };
  const canonical = 'https://nvt24.ru/product/k-flex-st';
  let seo: SeoService;
  let doc: Document;
  let status: jasmine.Spy;

  beforeEach(() => {
    status = jasmine.createSpy('status');
    doc = document.implementation.createHTMLDocument('test');
    TestBed.configureTestingModule({ providers: [
      { provide: DOCUMENT, useValue: doc }, { provide: SSR_STATUS, useValue: status },
    ] });
    seo = TestBed.inject(SeoService);
  });

  it('never advertises price-on-request as free or invents reviews', () => {
    const data = productData(product, canonical, 'Description') as any;
    expect(data.offers).toBeUndefined();
    expect(data.aggregateRating).toBeUndefined();
    expect(data.brand.name).toBe('K-FLEX');
    expect(data.image).toEqual(['https://nvt24.ru/static/preview.png']);
  });

  it('uses only an actual positive price and availability for offers', () => {
    const data = productData({ ...product, price: '350.50', available: false }, canonical, '') as any;
    expect(data.offers.price).toBe(350.5);
    expect(data.offers.priceCurrency).toBe('RUB');
    expect(data.offers.availability).toBe('https://schema.org/OutOfStock');
  });

  it('rejects invalid prices and unsafe image URLs', () => {
    for (const price of ['NaN', 'Infinity', '-1', '0']) {
      expect((productData({ ...product, price }, canonical, '') as any).offers).toBeUndefined();
    }
    expect(absoluteUrl('javascript:alert(1)')).toBe('');
  });

  it('gives every breadcrumb a position and an absolute URL', () => {
    const items = (breadcrumbData(product.breadcrumbs, canonical) as any).itemListElement;
    expect(items.map((item: any) => item.position)).toEqual([1, 2, 3]);
    expect(items[2].item).toBe(canonical);
    expect(items[1].item).toBe('https://nvt24.ru/brand/k-flex');
  });

  it('escapes script terminators without changing JSON data', () => {
    const text = structuredDataJson([{ name: '</script><script>alert(1)</script>' }]);
    expect(text).not.toContain('</script>');
    expect(JSON.parse(text)['@graph'][0].name).toContain('</script>');
  });

  it('replaces metadata and product schema on SPA navigation', () => {
    seo.product({ ...product, seo: { title: product.name, description: 'Product description', canonical_url: canonical } });
    seo.staticPage('/contacts');
    expect(doc.querySelectorAll('meta[name="description"]').length).toBe(1);
    expect(doc.querySelectorAll('link[rel="canonical"]').length).toBe(1);
    expect(doc.querySelectorAll('#novateh-structured-data').length).toBe(1);
    expect(doc.querySelector('#novateh-structured-data')!.textContent).not.toContain('"@type":"Product"');
    expect(doc.querySelector('link[rel="canonical"]')!.getAttribute('href')).toBe('https://nvt24.ru/contacts');
    expect(doc.querySelector('meta[property="og:image"]')!.getAttribute('content')).toMatch(/^https:\/\/nvt24.ru\//);
  });

  it('returns a real noindex 404 and removes the previous canonical', () => {
    seo.staticPage('/catalog');
    seo.pageError(404);
    expect(status).toHaveBeenCalledWith(404);
    expect(doc.querySelector('meta[name="robots"]')!.getAttribute('content')).toBe('noindex,follow');
    expect(doc.querySelector('link[rel="canonical"]')).toBeNull();
  });

  it('does not mistake temporary backend failures for missing products', () => {
    seo.pageError(500);
    expect(status).toHaveBeenCalledWith(503);
  });

  it('clears noindex when navigating from cart to an indexable page', () => {
    seo.staticPage('/shopping-cart');
    seo.staticPage('/');
    expect(doc.querySelector('meta[name="robots"]')!.getAttribute('content')).toBe('index,follow');
    expect(doc.documentElement.lang).toBe('ru');
  });

  it('never publishes a foreign canonical', () => {
    seo.setCanonicalUrl('https://supplier.invalid/product');
    expect(doc.querySelector('link[rel="canonical"]')!.getAttribute('href')).toBe('https://nvt24.ru/');
  });
});
