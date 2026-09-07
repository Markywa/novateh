import { SeoService } from '../../services/seo/seo.service';
import { Component, inject } from '@angular/core';
import { LayoutPageComponent } from '../layout-page/layout-page.component';
import { BreadCrumbsComponent } from '../../shared/bread-crumbs/bread-crumbs.component';
import { BreadCrumbsService } from '../../services/bread-crumbs/bread-crumbs.service';

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
  private seoService = inject(SeoService);
  private breadCrumbsService = inject(BreadCrumbsService);
  constructor() {
    this.seoService.staticPage('/privacy-policy');
  }

  ngOnInit(): void {
    this.breadCrumbsService.setBreadcrumbs([
      { label: 'Главная', url: '/', isClickable: true },
      { label: 'Политика в отношении обработки персональных данных и конфиденциальности', url: '', isClickable: false },
    ]);
  }

}
