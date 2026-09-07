import assert from 'node:assert/strict';

const origin = process.env.SEO_TEST_ORIGIN || 'http://127.0.0.1:4321';
const product = process.env.SEO_PRODUCT_SLUG || 'k-flex-st';
const group = process.env.SEO_GROUP_SLUG || 'insulation';
const brand = process.env.SEO_BRAND_SLUG || 'k-flex';

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(match => [match[1], match[2]]));
}

async function page(path, status = 200) {
  const response = await fetch(origin + path, { redirect: 'manual', signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, status, path);
  const html = await response.text();
  assert.equal((html.match(/<h1\b/g) || []).length, 1, path + ': one H1');
  const metas = [...html.matchAll(/<meta\s[^>]*>/g)].map(match => attributes(match[0]));
  const links = [...html.matchAll(/<link\s[^>]*>/g)].map(match => attributes(match[0])).filter(link => link.rel === 'canonical');
  assert.equal(metas.filter(meta => meta.name === 'description').length, 1, path + ': one description');
  const graph = JSON.parse(html.match(/<script[^>]*id="novateh-structured-data"[^>]*>([\s\S]*?)<\/script>/)[1])['@graph'];
  if (status === 200) {
    assert.equal(links.length, 1, path + ': one canonical');
    assert.equal(links[0].href, 'https://nvt24.ru' + path.split('?')[0]);
    assert.equal(metas.find(meta => meta.property === 'og:url').content, links[0].href);
  } else {
    assert.equal(links.length, 0);
    assert.match(metas.find(meta => meta.name === 'robots').content, /noindex/);
    assert.ok(!graph.some(node => node['@type'] === 'Product'));
  }
  console.log('OK', response.status, path);
  return { html, metas, graph };
}

for (const path of ['/', '/catalog', '/about', '/contacts', '/certificates', '/news', '/personal-data', '/privacy-policy', '/group/' + group, '/brand/' + brand]) {
  await page(path);
}
const detail = await page('/product/' + product);
assert.equal(detail.graph.filter(node => node['@type'] === 'Product').length, 1);
assert.equal(detail.graph.filter(node => node['@type'] === 'BreadcrumbList').length, 1);
assert.ok(!/<[^>]*\bitemscope\b/.test(detail.html), 'No duplicate imported microdata in rendered elements');
assert.match(detail.html, /href="\/catalog"/);
for (const path of ['/seo-does-not-exist', '/product/seo-does-not-exist', '/group/seo-does-not-exist', '/brand/seo-does-not-exist', '/news/seo-does-not-exist']) await page(path, 404);
for (const [from, to] of [['/welcome', '/'], ['/welcome/', '/'], ['/catalog/', '/catalog'], ['/products/' + product, '/product/' + product], ['/producer/' + brand, '/brand/' + brand], ['/catalog/' + group, '/group/' + group]]) {
  const response = await fetch(origin + from, { redirect: 'manual' });
  assert.equal(response.status, 301, from);
  assert.equal(response.headers.get('location'), to);
  console.log('OK 301', from, '->', to);
}
const search = await page('/catalog?query=k-flex');
assert.match(search.metas.find(meta => meta.name === 'robots').content, /noindex/);
console.log('SSR SEO smoke passed');
