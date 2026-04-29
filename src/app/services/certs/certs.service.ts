import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CertsService {

  constructor(private http: HttpClient) { }

  public getCerts$(): Observable<any>{
    return this.http.get(`${environment.baseUrl}/v1/serts`)
  }
}
