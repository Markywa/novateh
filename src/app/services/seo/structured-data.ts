export const SITE_URL = 'https://nvt24.ru';

export function absoluteUrl(path: string): string {
  try {
    const url = new URL(path, `${SITE_URL}/`);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

export interface BreadcrumbData {
  title?: string;
  label?: string;
  url?: string | null;
}

export function breadcrumbData(items: BreadcrumbData[], canonical: string): object {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.filter(item => item.title || item.label).map((item, index) => ({
      '@type': 'ListItem', position: index + 1,
      name: item.title || item.label,
      item: absoluteUrl(item.url || canonical),
    })),
  };
}

export interface ProductData {
  name: string;
  sku: string;
  price: string | number;
  currency: string;
  available: boolean;
  media?: string[];
  brand?: { name: string } | null;
  breadcrumbs?: BreadcrumbData[];
}

export function productData(product: ProductData, canonical: string, description: string): object {
  const price = Number(product.price);
  const brand = product.brand?.name || product.breadcrumbs?.find(item => item.url?.startsWith('/brand/'))?.title;
  return {
    '@type': 'Product', '@id': `${canonical}#product`, url: canonical,
    name: product.name, sku: product.sku, description,
    image: (product.media || []).map(absoluteUrl).filter(Boolean),
    ...(brand ? { brand: { '@type': 'Brand', name: brand } } : {}),
    // Zero means "price on request" in this catalog, never a free offer.
    ...(Number.isFinite(price) && price > 0 && /^[A-Z]{3}$/.test(product.currency) ? {
      offers: {
        '@type': 'Offer', url: canonical, price, priceCurrency: product.currency,
        availability: `https://schema.org/${product.available ? 'InStock' : 'OutOfStock'}`,
        seller: { '@id': `${SITE_URL}/#organization` },
      },
    } : {}),
  };
}

export function structuredDataJson(nodes: object[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes }).replace(/</g, '\\u003c');
}
