import { Component, inject, Input, OnInit } from '@angular/core';
import { LayoutPageComponent } from '../layout-page/layout-page.component';
import { NewsCardComponent } from './news-card/news-card.component';
import { NewsFields, NewsService } from '../../services/news/news.service';
import { AsyncPipe } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { BreadCrumbsComponent } from '../../shared/bread-crumbs/bread-crumbs.component';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [
    LayoutPageComponent,
    NewsCardComponent,
    AsyncPipe,
    AngularSvgIconModule,
    BreadCrumbsComponent
  ],
  templateUrl: './news.component.html',
  styleUrl: './news.component.scss'
})
export class NewsComponent implements OnInit {
  public newsService = inject(NewsService);
  public newsList: NewsFields[] = [];
  public loading = false;

  ngOnInit(): void {
    this.loading = true;
    this.newsService.getNewsList$(true).subscribe((res) => {
      this.newsList = res;
      this.loading = false;
    })
  }
}
