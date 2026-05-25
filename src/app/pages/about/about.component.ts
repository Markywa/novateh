import { Component, inject } from '@angular/core';
import { LayoutPageComponent } from '../layout-page/layout-page.component';
import { RouterOutlet } from '@angular/router';
import { BreadCrumbsComponent } from '../../shared/bread-crumbs/bread-crumbs.component';
import { BreadCrumbsService } from '../../services/bread-crumbs/bread-crumbs.service';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    LayoutPageComponent,
    BreadCrumbsComponent
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  private breadCrumbsService = inject(BreadCrumbsService);
  constructor(private title: Title, private meta: Meta) {
    this.title.setTitle('О компании Новатех | Производитель теплоизоляции');
    this.meta.addTags([
      { name: 'description', content: 'Узнайте больше о компании Новатех - современном производителе теплоизоляционных материалов. Собственное производство, контроль качества на всех этапах. Наши преимущества, технологии и гарантии.' },
      { name: 'keywords', content: 'производитель теплоизоляции, завод утеплителей, компания новатех, производство утеплителя, теплоизоляция от производителя' },
      { property: 'og:title', content: 'О компании Новатех - Производитель теплоизоляции' },
      { property: 'og:description', content: 'Современное производство теплоизоляционных материалов. Высший контроль качества.'},
      { property: 'og:image', content: 'assets/images/web-app-manifest-192x192.png' },
      { property: 'og:url', content: 'https://nvt24.ru/lambda/shopping-cart' },
      { property: 'og:type', content: 'website' },
    ]);
  }

  ngOnInit(): void {
    this.breadCrumbsService.setBreadcrumbs([
      { label: 'Главная', url: '/', isClickable: true },
      { label: 'О компании', url: '', isClickable: false },
    ]);
  }

}
