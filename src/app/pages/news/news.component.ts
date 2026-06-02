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
import { Meta, Title } from '@angular/platform-browser';

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
  public newsService = inject(NewsService);
  private breadCrumbsService = inject(BreadCrumbsService);
  private router = inject(Router);
  public newsList: NewsFields[] = [];
  public loading = false;

  constructor(private title: Title, private meta: Meta) {
      this.title.setTitle('Новости компании Новатех | Акции и события');
    this.meta.addTags([
       { name: 'description', content: 'Актуальные новости производителя теплоизоляции Новатех. Акции и скидки на утеплители, новинки продукции, участие в выставках, полезные статьи об утеплении зданий. Будьте в курсе всех событий!' },
      { name: 'keywords', content: 'новости теплоизоляции, акции утеплитель, события компании, скидки на теплоизоляцию, новинки продукции' },
      { property: 'og:title', content: 'Новости и акции - Новатех' },
      { property: 'og:description', content: 'Актуальные новости, акции и скидки на теплоизоляционные материалы.' },
      { property: 'og:image', content: 'assets/images/web-app-manifest-192x192.png' },
      { property: 'og:url', content: 'https://nvt24.ru/shopping-cart' },
      { property: 'og:type', content: 'website' },
    ]);
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
