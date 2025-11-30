import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TProductsContent } from '../products-service/products.service';

export type TGroupsContent = {
    id: number,
    parent_id: number,
    name: string,
    slug: string,
    description: string,
    media: string
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

    return this.http.get<TGroupsContent[]>('http://26.39.56.58:8000/groups', { params: httpParams })
  }

  getGroupDetailsPage$(slug: string): Observable<TGroupsPageContent>{
    return this.http.get<TGroupsPageContent>(`http://26.39.56.58:8000/groups/${slug}`)
  } 
}
