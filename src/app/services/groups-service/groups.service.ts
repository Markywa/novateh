import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TProductsContent } from '../products-service/products.service';
import { environment } from '../../../environments/environment.development';

export type TGroupsContent = {
    id: number,
    parent_id: number,
    name: string,
    slug: string,
    description: string,
    media: string,
    seo: any
  }

export type TGroupsPageContent = {
  category: TGroupsContent,
  products: TProductsContent[];
}

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  private http = inject(HttpClient);

  getGroupsList$(name?: string): Observable<TGroupsContent[]> {
    let httpParams = new HttpParams()
    if(name){
      httpParams = httpParams.append('name', name)
    }

    return this.http.get<TGroupsContent[]>(`${environment.baseUrl}/v1/groups`, { params: httpParams })
  }

  getGroupDetailsPage$(slug: string): Observable<TGroupsPageContent>{
    return this.http.get<TGroupsPageContent>(`${environment.baseUrl}/v1/groups/${slug}`)
  } 
}
