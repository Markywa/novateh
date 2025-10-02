import { Component } from '@angular/core';
import { ProductCardComponent } from '../../shared/product-card/product-card.component';
import { CommonModule } from '@angular/common';

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
  productList = [
    {
      img: 'assets/images/energoroll-alu 4.png',
      id: '1',
      name: 'Тестовый образец'
    },
    {
      img: 'assets/images/truba.png',
      id: '1',
      name: 'Тестовый образец'
    },
    {
      img: 'assets/images/energoroll-alu 4.png',
      id: '1',
      name: 'Тестовый образец'
    },
    {
      img: 'assets/images/energoroll-alu 4.png',
      id: '1',
      name: 'Тестовый образец'
    },
    {
      img: 'assets/images/energoroll-alu 4.png',
      id: '1',
      name: 'Тестовый образец'
    },
    {
      img: 'assets/images/truba.png',
      id: '1',
      name: 'Тестовый образец'
    },
    {
      img: 'assets/images/truba.png',
      id: '1',
      name: 'Тестовый образец'
    },
    {
      img: 'assets/images/energoroll-alu 4.png',
      id: '1',
      name: 'Тестовый образец'
    },
  ]
}
