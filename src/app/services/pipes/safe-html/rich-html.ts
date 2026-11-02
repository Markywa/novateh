import { SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

const TAGS = new Set('div span p h1 h2 h3 h4 h5 h6 ul ol li table caption colgroup col tr td th thead tbody tfoot strong b em i u s a img br hr section article header footer main blockquote sub sup'.split(' '));
const DROP = new Set('script style iframe object embed template svg math form input button'.split(' '));
const ATTRS = new Set('class href src alt title width height align valign colspan rowspan span scope border cellpadding cellspacing bgcolor'.split(' '));
const STYLES = new Set('width height min-width max-width min-height max-height margin margin-left margin-right margin-top margin-bottom padding padding-left padding-right padding-top padding-bottom text-align vertical-align color background-color font-size font-weight font-style text-decoration line-height border border-width border-style border-color border-collapse table-layout display float'.split(' '));
const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// Share an explicit editor allowlist between SSR and the browser.
export function cleanRichHtml(doc: Document, sanitizer: DomSanitizer, html: string, hideImages = false): string {
  // Template contents are inert: parsing must not fire image handlers/requests.
  const root = doc.createElement('template');
  root.innerHTML = html;
  const children = (node: Node): string => Array.from(node.childNodes).map(visit).join('');
  function visit(node: Node): string {
    if (node.nodeType === 3) return escape(node.textContent || '');
    if (node.nodeType !== 1) return '';
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    if (DROP.has(tag) || (tag === 'img' && hideImages)) return '';
    if (!TAGS.has(tag)) return children(node);
    const attrs: string[] = [];
    const styles: string[] = [];
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if (name === 'style') {
        for (const declaration of attr.value.split(';')) {
          const colon = declaration.indexOf(':');
          const key = declaration.slice(0, colon).trim().toLowerCase();
          const value = declaration.slice(colon + 1).trim();
          if (colon > 0 && STYLES.has(key) && value && /^[a-z0-9\s#.,%()\-]+$/i.test(value)
              && !/url\s*\(|expression|var\s*\(|behavior|binding/i.test(value)) styles.push(`${key}:${value}`);
        }
      } else if (ATTRS.has(name)) {
        const value = ['href', 'src'].includes(name)
          ? sanitizer.sanitize(SecurityContext.URL, attr.value) || '' : attr.value;
        attrs.push(`${name}="${escape(value)}"`);
      }
    }
    // Constrain overflow without stretching small images or distorting their ratio.
    if (tag === 'img') styles.push('max-width:100%', 'height:auto');
    if (styles.length) attrs.push(`style="${escape(styles.join(';'))}"`);
    const open = `<${tag}${attrs.length ? ' ' + attrs.join(' ') : ''}>`;
    return ['img', 'br', 'hr', 'col'].includes(tag) ? open : open + children(node) + `</${tag}>`;
  }
  return children(root.content || root);
}
