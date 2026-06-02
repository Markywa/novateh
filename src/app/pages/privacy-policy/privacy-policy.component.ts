import { Component, inject } from '@angular/core';
import { LayoutPageComponent } from '../layout-page/layout-page.component';
import { BreadCrumbsComponent } from '../../shared/bread-crumbs/bread-crumbs.component';
import { BreadCrumbsService } from '../../services/bread-crumbs/bread-crumbs.service';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [
    LayoutPageComponent,
    BreadCrumbsComponent
  ],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {
  private breadCrumbsService = inject(BreadCrumbsService);
  constructor(private title: Title, private meta: Meta) {
    this.title.setTitle('Новатех | Политика конфиденциальности');
    this.meta.addTags([
      { name: 'description', content: 'Узнайте больше о компании Новатех - современном производителе теплоизоляционных материалов. Собственное производство, контроль качества на всех этапах. Наши преимущества, технологии и гарантии.' },
      { name: 'keywords', content: 'производитель теплоизоляции, завод утеплителей, компания новатех, производство утеплителя, теплоизоляция от производителя' },
      { property: 'og:title', content: 'Новатех | Политика конфиденциальности' },
      { property: 'og:description', content: 'Современное производство теплоизоляционных материалов. Высший контроль качества.'},
      { property: 'og:image', content: 'assets/images/web-app-manifest-192x192.png' },
      { property: 'og:url', content: 'https://nvt24.ru/shopping-cart' },
      { property: 'og:type', content: 'website' },
    ]);
  }

  ngOnInit(): void {
    this.breadCrumbsService.setBreadcrumbs([
      { label: 'Главная', url: '/', isClickable: true },
      { label: 'Политика конфиденциальности', url: '', isClickable: false },
    ]);
  }

}
