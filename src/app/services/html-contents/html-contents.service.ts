import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HtmlContentsService {

  constructor(private http: HttpClient) { }

  getHtmlContent$(): Observable<any>{
    return this.http.get(`${environment.baseUrl}/v1/html-content`)
  }
}
