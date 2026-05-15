// cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

export interface CartItem {
  slug: string;
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly STORAGE_KEY = 'cart';
  private cartSubject = new BehaviorSubject<CartItem[]>(this.getCart());

  cart$ = this.cartSubject.asObservable();

  addToCart(slug: string): void {
    const cart = this.getCart();
    const existingItem = cart.find(item => item.slug === slug);

    if (existingItem) {
      existingItem.count += 1;
    } else {
      cart.push({ slug, count: 1 });
    }

    this.saveCart(cart);
    this.cartSubject.next(cart); 
  }

  removeFromCart(slug: string | string[]): void {
    const cart = this.getCart();
    
    if(Array.isArray(slug)) {
      const filteredCart = cart.filter(item => !slug.includes(item.slug));
      this.saveCart(filteredCart);
      this.cartSubject.next(filteredCart);
    } else {
      const filteredCart = cart.filter(item => item.slug !== slug);
      this.saveCart(filteredCart);
      this.cartSubject.next(filteredCart);
    }
  }

  updateCount(slug: string, count: number): void {
    const cart = this.getCart();
    const item = cart.find(item => item.slug === slug);
    
    if (item) {
      item.count = count;
      this.saveCart(cart);
      this.cartSubject.next(cart);
    }
  }

  getCart(): CartItem[] {
    const cartJson = localStorage.getItem(this.STORAGE_KEY);
    return cartJson ? JSON.parse(cartJson) : [];
  }

  getItemCount(slug: string): number {
    const item = this.getCart().find(item => item.slug === slug);
    return item ? item.count : 0;
  }

  itemIsAdded$(slug: string): Observable<boolean> {
    return this.cart$.pipe(
      map(cart => cart.some(item => item.slug === slug)),
      distinctUntilChanged() 
    );
  }

  itemsCounter$(): Observable<number>{
    return this.cart$.pipe(
      map(cart => cart.length))
  }

  getItemCount$(slug: string): Observable<number> {
    return this.cart$.pipe(
      map(cart => {
        const item = cart.find(item => item.slug === slug);
        return item ? item.count : 0;
      }),
      distinctUntilChanged()
    );
  }

  itemIsAdded(slug: string): boolean {
    const cart = this.getCart();
    const item = cart.find(item => item.slug === slug);
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