// cart.service.ts
import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

export interface CartItem {
  id: number;
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly STORAGE_KEY = 'cart';
  private cartSubject = new BehaviorSubject<CartItem[]>(this.getCart());
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  cart$ = this.cartSubject.asObservable();

  addToCart(id: number): void {
    const cart = this.getCart();
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
      existingItem.count += 1;
    } else {
      cart.push({ id, count: 1 });
    }

    this.saveCart(cart);
    this.cartSubject.next(cart); 
  }

  removeFromCart(id: number | number[]): void {
    const cart = this.getCart();
    
    if(Array.isArray(id)) {
      const filteredCart = cart.filter(item => !id.includes(item.id));
      this.saveCart(filteredCart);
      this.cartSubject.next(filteredCart);
    } else {
      const filteredCart = cart.filter(item => item.id !== id);
      this.saveCart(filteredCart);
      this.cartSubject.next(filteredCart);
    }
  }

  updateCount(id: number, count: number): void {
    const cart = this.getCart();
    const item = cart.find(item => item.id === id);
    
    if (item) {
      item.count = count;
      this.saveCart(cart);
      this.cartSubject.next(cart);
    }
  }

  getCart(): CartItem[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    const cartJson = localStorage.getItem(this.STORAGE_KEY);
    return cartJson ? JSON.parse(cartJson) : [];
  }

  getItemCount(id: number): number {
    const item = this.getCart().find(item => item.id === id);
    return item ? item.count : 0;
  }

  itemIsAdded$(id: number): Observable<boolean> {
    return this.cart$.pipe(
      map(cart => cart.some(item => item.id === id)),
      distinctUntilChanged() 
    );
  }

  itemsCounter$(): Observable<number>{
    return this.cart$.pipe(
      map(cart => cart.length))
  }

  getItemCount$(id: number): Observable<number> {
    return this.cart$.pipe(
      map(cart => {
        const item = cart.find(item => item.id === id);
        return item ? item.count : 0;
      }),
      distinctUntilChanged()
    );
  }

  itemIsAdded(id: number): boolean {
    const cart = this.getCart();
    const item = cart.find(item => item.id === id);
    return !!item;
  }

  clearCart(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.cartSubject.next([]);
  }

  private saveCart(cart: CartItem[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
  }
}