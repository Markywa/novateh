import { SeoService } from '../../services/seo/seo.service';
import { Component, inject, Input, OnInit } from '@angular/core';
import { LayoutPageComponent } from '../layout-page/layout-page.component';
import { NewsCardComponent } from './news-card/news-card.component';
import { NewsFields, NewsService } from '../../services/news/news.service';
import { AsyncPipe } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { BreadCrumbsComponent } from '../../shared/bread-crumbs/bread-crumbs.component';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { Router } from '@angular/router';
import { BreadCrumbsService } from '../../services/bread-crumbs/bread-crumbs.service';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [
    LayoutPageComponent,
    NewsCardComponent,
    AsyncPipe,
    AngularSvgIconModule,
    BreadCrumbsComponent,
    LoaderComponent
  ],
  templateUrl: './news.component.html',
  styleUrl: './news.component.scss'
})
export class NewsComponent implements OnInit {
  private seoService = inject(SeoService);
  public newsService = inject(NewsService);
  private breadCrumbsService = inject(BreadCrumbsService);
  private router = inject(Router);
  public newsList: NewsFields[] = [];
  public loading = false;

  constructor() {
      this.seoService.staticPage('/news');
  }

  ngOnInit(): void {
    this.breadCrumbsService.setBreadcrumbs([
      { label: 'Главная', url: '/', isClickable: true },
      { label: 'Новости', url: this.router.url, isClickable: true },
    ]);

    this.loading = true;
    this.newsService.getNewsList$(true).subscribe((res) => {
      this.newsList = res;
      this.loading = false;
    })
  }
}
