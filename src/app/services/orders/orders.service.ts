import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  constructor(private http: HttpClient) { }

  public postOrder$(body: any): Observable<any> {
    
    return this.http.post(`${environment.baseUrl}/v1/public-orders`, body)
  }
}
