import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TBrandsContent } from '../../services/brands-service/brands.service';
import { TProductsContent } from '../../services/products-service/products.service';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule
  ],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input() productItem!: TProductsContent
  environment = environment
}
