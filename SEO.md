# SEO and SSR verification

- Canonical homepage: `/`. `/welcome` and trailing slash variants redirect 301.
- Historical `/products/`, `/producer/`, `/catalog/<slug>` links redirect to the
  matching `/product/`, `/brand/`, `/group/` routes.
- Missing routes and API 404s render an explanatory page with HTTP 404 and
  `noindex`. Temporary backend failures return 503, not a false 404.
- Each page owns its metadata. SPA navigation replaces previous metadata and
  structured data instead of accumulating tags.
- Product JSON-LD and breadcrumbs are generated from the API. Zero/unknown
  prices never become free offers. No invented ratings, stock or price data.
- Supplier microdata is removed from rendered product HTML, not from the
  stored technical content. Breadcrumb anchors include real hrefs in SSR.

## Tests

```sh
npm ci
npm run build
npm run test:seo
```

`test:seo` uses a focused configuration because legacy specs currently have
unrelated TypeScript errors and the old global SCSS URL imports fail in Karma.
Production styles are checked by the normal application build. Chrome must be
installed; `CHROME_BIN` can point to its executable.

For HTTP-level SSR tests, run a local backend containing `k-flex-st`, group
`insulation` and brand `k-flex`, then start the built server:

```sh
PORT=4321 SSR_API_ORIGIN=http://127.0.0.1:8002 node dist/novateh/server/server.mjs
npm run test:seo:ssr
```

The smoke script is read-only. Override `SEO_TEST_ORIGIN`, `SEO_PRODUCT_SLUG`,
`SEO_GROUP_SLUG`, `SEO_BRAND_SLUG` to check a deployed site. It checks H1,
canonical, Open Graph, JSON-LD, missing pages, redirects and noindex search.
The production build retains the pre-existing initial bundle size warning.

Search visibility still depends on indexing, content relevance and external
signals. A successful release is not a guarantee of positions or rich results.
