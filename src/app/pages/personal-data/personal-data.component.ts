import { SeoService } from '../../services/seo/seo.service';
import { Component, inject } from '@angular/core';
import { LayoutPageComponent } from '../layout-page/layout-page.component';
import { BreadCrumbsComponent } from '../../shared/bread-crumbs/bread-crumbs.component';
import { BreadCrumbsService } from '../../services/bread-crumbs/bread-crumbs.service';

@Component({
  selector: 'app-personal-data',
  standalone: true,
  imports: [
    LayoutPageComponent,
    BreadCrumbsComponent
  ],
  templateUrl: './personal-data.component.html',
  styleUrl: './personal-data.component.scss'
})
export class PersonalDataComponent {
  private seoService = inject(SeoService);
  private breadCrumbsService = inject(BreadCrumbsService);
  constructor() {
    this.seoService.staticPage('/personal-data');
  }

  ngOnInit(): void {
    this.breadCrumbsService.setBreadcrumbs([
      { label: 'Главная', url: '/', isClickable: true },
      { label: 'Согласие на обработку персональных данных', url: '', isClickable: false },
    ]);
  }

}
