import { SeoService } from '../../services/seo/seo.service';
import { Component, inject } from '@angular/core';
import { LayoutPageComponent } from '../layout-page/layout-page.component';
import { RouterOutlet } from '@angular/router';
import { BreadCrumbsComponent } from '../../shared/bread-crumbs/bread-crumbs.component';
import { BreadCrumbsService } from '../../services/bread-crumbs/bread-crumbs.service';

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
  private seoService = inject(SeoService);
  private breadCrumbsService = inject(BreadCrumbsService);
  constructor() {
    this.seoService.staticPage('/about');
  }

  ngOnInit(): void {
    this.breadCrumbsService.setBreadcrumbs([
      { label: 'Главная', url: '/', isClickable: true },
      { label: 'О компании', url: '', isClickable: false },
    ]);
  }

}
