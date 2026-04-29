import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  constructor(private http: HttpClient) { }

  sendRequest(body: any): Observable<any> {
    return this.http.post<any>(`${environment.baseUrl}/v1/inquiries`, body);
  }
}
