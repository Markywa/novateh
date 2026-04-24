import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ShoppingCardComponent } from '../../shared/shopping-card/shopping-card.component';
import { CartService } from '../../services/cart-service/cart.service';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { ProductsService } from '../../services/products-service/products.service';
import { forkJoin, map } from 'rxjs';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { CommonModule, NgClass } from "../../../../node_modules/@angular/common";
import { BreadCrumbsComponent } from '../../shared/bread-crumbs/bread-crumbs.component';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [
    FormsModule,
    ShoppingCardComponent,
    AngularSvgIconModule,
    NgClass,
    CommonModule,
    BreadCrumbsComponent
],
  templateUrl: './shopping-cart.component.html',
  styleUrl: './shopping-cart.component.scss'
})
export class ShoppingCartComponent implements OnInit {
  isChecked: boolean = false;
  private cartService = inject(CartService);
  private productService = inject(ProductsService);
  public isLoading = false;
  public userCart: any = [];
  public selectedArr: number[] = [];

  toggleCheckbox() {
    if(this.userCart.length === this.selectedArr.length){
      this.selectedArr = [];
    } else {
      const allIds = this.userCart.map((item: any) => item.id);
      this.selectedArr = [...new Set(allIds)] as number[];
    }
  }

  ngOnInit(): void {
    this.getUserCart();
  }

  getUserCart(): void {
    this.isLoading = true;
    const items = this.cartService.getCart();
    console.log(items);
    
    
    if (items.length === 0) {
      this.userCart = [];
      this.isLoading = false;
      return;
    }
    
    const requests = items.map(item => 
      this.productService.getProductDetails$(item.id).pipe(
        map(product => ({
          ...product,
          count: item.count,
          cartId: item.id
        }))
      )
    );

    forkJoin(requests).subscribe({
      next: (products) => {
        this.userCart = products;        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Ошибка загрузки корзины:', error);
      }
    });
  }

  updateList(): void {
    this.getUserCart();
  }

  deleteSelected(): void {
    this.cartService.removeFromCart(this.selectedArr)
    this.getUserCart();
  }
}
