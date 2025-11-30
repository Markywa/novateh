import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CartService } from '../../services/cart-service/cart.service';

@Component({
  selector: 'app-shopping-card',
  standalone: true,
  imports: [],
  templateUrl: './shopping-card.component.html',
  styleUrl: './shopping-card.component.scss'
})
export class ShoppingCardComponent {
  isChecked: boolean = false;
  private cartService = inject(CartService);

  toggleCheckbox() {
    this.isChecked = !this.isChecked;
  }

  @Input() value: number = 1;
  @Input() min: number = 1;
  @Input() max: number = 100;
  @Input() step: number = 1;
  @Input() product: any;
  @Input() isSelected: boolean = false;
  
  @Output() valueChange = new EventEmitter<number>();
  @Output() changed = new EventEmitter<number>();
  @Output() updateList = new EventEmitter<void>();
  @Output() checked = new EventEmitter<number>();

  increment(): void {
    if (this.value < this.max) {
      const newValue = Math.min(this.value + this.step, this.max);
      this.updateValue(newValue);
    }
  }

  decrement(): void {
    if (this.value > this.min) {
      const newValue = Math.max(this.value - this.step, this.min);
      this.updateValue(newValue);
    }
  }

  private updateValue(newValue: number): void {
    this.value = newValue;
    this.cartService.updateCount(this.product.id, newValue);
    this.valueChange.emit(this.value);
    this.changed.emit(this.value);
  }

  public deleteFromCart(id: number): void {
    this.cartService.removeFromCart(id);
    this.updateList.emit();
  }
}
