import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type TProductsContent = {
  id: number,
  sku: string,
  name: string,
  price: number,
  currency: string,
  description: string,
  group_id: number,
  brand_id: number,
  media: string,
  available: true
}

export type TProductCardDetails = {
  id: number,
  sku: string,
  name: string,
  price: string,
  currency: string,
  description: string,
  group_id: number,
  brand_id: number,
  media: string[],
  available: boolean,
  search_tsv: string,
  media_list: TProductMedia[],
  attributes: TProductAttributes[]
}

export type TProductMedia = {
  id: number,
  product_id: number,
  storage_path: string,
  url: string,
  mime_type: string,
  size_bytes: any,
  variants: any,
  is_primary: boolean,
  alt_text: any
}

export type TProductAttributes = {
  id: number,
  name: string,
  unit: string,
  value: number
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private http = inject(HttpClient);

  getProductsList$(name?: string): Observable<TProductsContent[]> {
    let httpParams = new HttpParams()
    if(name){
      httpParams = httpParams.append('name', name)
    }

    return this.http.get<TProductsContent[]>("http://26.39.56.58:8000/products", { params: httpParams })
  }

  getProductDetails$(id: number): Observable<TProductCardDetails>{
    return this.http.get<TProductCardDetails>(`http://26.39.56.58:8000/products/${id}`)
  }
}
