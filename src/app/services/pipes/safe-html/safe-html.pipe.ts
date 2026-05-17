import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml',
  standalone: true
})
export class SafeHtmlPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(html: string | SafeHtml, hidden?: boolean): SafeHtml {
    if (!html) return '';

    let htmlString: string = '';

    if (typeof html === 'string') {
      htmlString = html;
    } else {
      const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, html);
      htmlString = sanitized || '';
    }

    // Если hidden === true, удаляем все img теги
    let modifiedHtml = htmlString;
    if (hidden) {
      modifiedHtml = htmlString.replace(/<img([^>]*)>[\s\n\r]*/g, '');
    } else {
      // Добавляем стили к изображениям
      modifiedHtml = htmlString.replace(/<img([^>]*)>/g, (match, attributes) => {
        if (attributes.includes('style=')) {
          const newAttributes = attributes.replace(/style="([^"]*)"/, 'style="$1; width: 100%;"');
          return `<img${newAttributes}>`;
        } else {
          return `<img${attributes} style="width: 100%;">`;
        }
      });
    }

    return this.sanitizer.bypassSecurityTrustHtml(modifiedHtml);
  }
}