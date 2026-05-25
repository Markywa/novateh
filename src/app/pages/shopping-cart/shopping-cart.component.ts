import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { AngularSvgIconModule } from 'angular-svg-icon';

import { ShoppingCardComponent } from '../../shared/shopping-card/shopping-card.component';
import { BreadCrumbsComponent } from '../../shared/bread-crumbs/bread-crumbs.component';
import { CartService } from '../../services/cart-service/cart.service';
import { ProductsService } from '../../services/products-service/products.service';
import { OrdersService } from '../../services/orders/orders.service';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterLink,
    ShoppingCardComponent,
    AngularSvgIconModule,
    BreadCrumbsComponent,
  ],
  templateUrl: './shopping-cart.component.html',
  styleUrl: './shopping-cart.component.scss'
})
export class ShoppingCartComponent implements OnInit {
  private cartService = inject(CartService);
  private productService = inject(ProductsService);
  private ordersService = inject(OrdersService);
  private fb = inject(FormBuilder);
  
  public isLoading = false;
  public isSubmitting = false;
  public userCart: any[] = [];
  public selectedArr: number[] = [];
  public showSuccessMessage = false;
  
  public orderForm: FormGroup;
  
  get isAllSelected(): boolean {
    return this.userCart.length > 0 && this.selectedArr.length === this.userCart.length;
  }
  
  constructor(
        private title: Title,
        private meta: Meta) {
    this.orderForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[\d\s\-+()]{10,}$/)]],
      email: ['', [Validators.required, Validators.email]],
      address: [''],
      comment: ['']
    });

    this.title.setTitle('Корзина | Оформление заказа теплоизоляции');
    this.meta.addTags([
      { name: 'description', content: 'Оформление заказа на теплоизоляционные материалы в компании Новатех. Рассчитайте стоимость, выберите способ доставки, укажите контактные данные. Быстрое и удобное оформление заказа с доставкой по всей России.' },
      { name: 'keywords', content: 'корзина, оформление заказа, купить утеплитель, заказ теплоизоляции, доставка теплоизоляции' },
      { property: 'og:title', content: 'Корзина и оформление заказа - Новатех' },
      { property: 'og:description', content: 'Оформление заказа на теплоизоляционные материалы с доставкой по России.' },
      { property: 'og:image', content: 'assets/images/web-app-manifest-192x192.png' },
      { property: 'og:url', content: 'https://nvt24.ru/lambda/shopping-cart' },
      { property: 'og:type', content: 'website' },
    ]);
  }
  
  ngOnInit(): void {
    this.getUserCart();
  }
  
  getUserCart(): void {
    this.isLoading = true;
    const items = this.cartService.getCart();
    
    if (items.length === 0) {
      this.userCart = [];
      this.selectedArr = [];
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
        this.isLoading = false;
      }
    });
  }
  
  toggleCheckbox(): void {
    if (this.isAllSelected) {
      this.selectedArr = [];
    } else {
      const allISlugs = this.userCart.map(item => item.slug);
      this.selectedArr = [...allISlugs];
    }
  }
  
  updateList(): void {
    this.getUserCart();
  }
  
  deleteSelected(): void {
    if (this.selectedArr.length === 0) return;
    
    this.cartService.removeFromCart(this.selectedArr);
    this.selectedArr = [];
    this.getUserCart();
  }
  
  sendForm(): void {
    if (this.orderForm.invalid || this.userCart.length === 0) {
      // Отмечаем все поля как touched для показа ошибок
      Object.keys(this.orderForm.controls).forEach(key => {
        const control = this.orderForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.isSubmitting = true;
    
    const items = this.cartService.getCart();
    const orderData = {
      ...this.orderForm.value,
      items: items.map(item => ({ product_id: item.id, qty: item.count }))
    };
    
    this.ordersService.postOrder$(orderData).subscribe({
      next: () => {
        this.showSuccessMessage = true;
        
        this.cartService.clearCart();
        
        this.userCart = [];
        this.selectedArr = [];
        
        this.orderForm.reset();
        
        setTimeout(() => {
          this.closeSuccessMessage();
        }, 5000);
        
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Ошибка при отправке заказа:', error);
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
  
  closeSuccessMessage(): void {
    this.showSuccessMessage = false;
  }
}