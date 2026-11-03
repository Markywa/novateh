import { Component, Input } from '@angular/core';
import { ProducerComponent, ProducerAppearance } from '../../shared/producer/producer.component';
import { CommonModule } from '@angular/common';
import { TBrandsContent } from '../../services/brands-service/brands.service';

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
  @Input() producerList: TBrandsContent[] = [];
  @Input() appearance: ProducerAppearance = 'logo';
} 
