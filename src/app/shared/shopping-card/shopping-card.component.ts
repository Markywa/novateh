// shopping-card.component.ts (обновлённый)
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common'; // Добавьте для *ngIf и пайпов
import { CartService } from '../../services/cart-service/cart.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-shopping-card',
  standalone: true,
  imports: [CommonModule], // Добавлен CommonModule для *ngIf и number pipe
  templateUrl: './shopping-card.component.html',
  styleUrl: './shopping-card.component.scss'
})
export class ShoppingCardComponent {
  isChecked: boolean = false;
  private cartService = inject(CartService);
  environment = environment;

  toggleCheckbox() {
    this.isChecked = !this.isChecked;
    this.checked.emit(this.product?.id);
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
    if (this.cartService) {
      this.cartService.updateCount(this.product.id, newValue);
    }
    this.valueChange.emit(this.value);
    this.changed.emit(this.value);
  }

  public deleteFromCart(id: number): void {
    if (this.cartService) {
      this.cartService.removeFromCart(id);
    }
    this.updateList.emit();
  }
}