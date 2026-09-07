import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo/seo.service';

@Component({
  selector: 'app-not-found', standalone: true, imports: [RouterLink],
  template: '<section class="container"><h1 class="main-title">Страница не найдена</h1><p>Проверьте адрес или перейдите в <a routerLink="/catalog">каталог товаров</a>.</p></section>',
})
export class NotFoundComponent {
  constructor() { inject(SeoService).pageError(404); }
}
