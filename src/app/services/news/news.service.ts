import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type NewsFields = {
    id: 0,
    title: string,
    slug: string,
    content: string,
    media: string,
    published_at: string,
    is_published: boolean
  }

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private http = inject(HttpClient);

  getNewsList$(only_published: boolean): Observable<NewsFields[]> {
    return this.http.get<NewsFields[]>("http://26.39.56.58:8000/news", { params: {only_published: only_published} })
  }
}
