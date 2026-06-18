import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TGroupsContent } from '../groups-service/groups.service';
import { TProductsContent } from '../products-service/products.service';
import { environment } from '../../../environments/environment';

export type TBrandsContent = {
    id: number,
    name: string,
    slug: string,
    media: string
  }

export type TBrandDetailsContent ={
  brand: TBrandsContent,
   categories: ({
      products: TProductsContent[]; 
    } & TGroupsContent)[]; 
};

@Injectable({
  providedIn: 'root'
})
export class BrandsService {
  private http = inject(HttpClient);

  getBrandsList$(name?: string): Observable<TBrandsContent[]> {
    let httpParams = new HttpParams()
    if(name){
      httpParams = httpParams.append('name', name)
    }

    return this.http.get<TBrandsContent[]>(`${environment.baseUrl}/v1/brands`, { params: httpParams })
  }

  getBrandsDetailsPage$(slug: string): Observable<TBrandDetailsContent>{
    return this.http.get<TBrandDetailsContent>(`${environment.baseUrl}/v1/brands/${slug}`)
  } 
}
