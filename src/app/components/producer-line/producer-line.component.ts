import { Component } from '@angular/core';
import { ProducerComponent } from '../../shared/producer/producer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-producer-line',
  standalone: true,
  imports: [
    ProducerComponent,
    CommonModule
  ],
  templateUrl: './producer-line.component.html',
  styleUrl: './producer-line.component.scss'
})
export class ProducerLineComponent {
  producerList = [
    {
      img: 'assets/images/Vector.png',
      id: '1'
    },
    {
      img: 'assets/images/Vector.png',
      id: '1'
    },
    {
      img: 'assets/images/Vector.png',
      id: '1'
    },
    {
      img: 'assets/images/Vector.png',
      id: '1'
    },
  ]
} 
