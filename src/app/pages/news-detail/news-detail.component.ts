import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BreadCrumbsComponent } from '../../shared/bread-crumbs/bread-crumbs.component';
import { environment } from '../../../environments/environment';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { BreadCrumbsService } from '../../services/bread-crumbs/bread-crumbs.service';
import { SafeHtmlPipe } from '../../services/pipes/safe-html/safe-html.pipe';

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  content: string;
  media: string;
  published_at: string;
  is_published: boolean;
}

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [CommonModule, BreadCrumbsComponent, HttpClientModule, RouterLink, LoaderComponent, SafeHtmlPipe],
  templateUrl: './news-detail.component.html',
  styleUrl: './news-detail.component.scss'
})
export class NewsDetailComponent implements OnInit {
  newsItem: NewsItem | null = null;
  loading: boolean = true;
  error: string | null = null;
  newsSlug: string | null = null;
  environment = environment;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private breadCrumbsService: BreadCrumbsService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.newsSlug = params['id']; 
      if (this.newsSlug) {
        this.fetchNewsData();
      } else {
        this.error = 'Slug новости не найден в URL';
        this.loading = false;
      }
    });
  }

  fetchNewsData(): void {
    this.loading = true;
    this.error = null;
    
    const apiUrl = `${environment.baseUrl}/v1/news`;
    
    this.http.get<NewsItem>(apiUrl).subscribe({
      next: (data: any) => {
        this.newsItem = data.find((item: any) => item.slug === this.newsSlug);
        
        this.breadCrumbsService.pushBreadcrumb(this.newsItem?.title || '', '', false);
        this.loading = false;
      },
      error: (err) => {
        console.error('Ошибка при загрузке новости:', err);
        this.error = 'Не удалось загрузить новость. Пожалуйста, попробуйте позже.';
        this.loading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}