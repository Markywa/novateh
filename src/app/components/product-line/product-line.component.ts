import { Component, inject, Input, OnInit } from '@angular/core';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { CommonModule } from '@angular/common';
import { BrandsService, TBrandsContent } from '../../services/brands-service/brands.service';
import { Observable } from 'rxjs';
import { TGroupsContent } from '../../services/groups-service/groups.service';
import { TProductsContent } from '../../services/products-service/products.service';

@Component({
  selector: 'app-product-line',
  standalone: true,
  imports: [
    ProductCardComponent,
    CommonModule
  ],
  templateUrl: './product-line.component.html',
  styleUrl: './product-line.component.scss'
})
export class ProductLineComponent {
  @Input() productList!: TProductsContent[]
}
