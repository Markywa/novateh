import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SlidesService {

  constructor(private http: HttpClient) { }

  getSlides$(): Observable<any> {
    return this.http.get<any>(`${environment.baseUrl}/v1/slider`)
  }
}
