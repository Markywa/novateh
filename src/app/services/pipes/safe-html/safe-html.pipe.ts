import { DOCUMENT } from '@angular/common';
import { Inject, Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { cleanRichHtml } from './rich-html';

@Pipe({ name: 'safeHtml', standalone: true })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer, @Inject(DOCUMENT) private document: Document) {}
  transform(html: string | SafeHtml, hidden = false): SafeHtml {
    const source = typeof html === 'string' ? html : this.sanitizer.sanitize(SecurityContext.HTML, html) || '';
    return this.sanitizer.bypassSecurityTrustHtml(cleanRichHtml(this.document, this.sanitizer, source || '', hidden));
  }
}
