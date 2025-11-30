import { Component, inject, Input } from '@angular/core';
import { ProducerComponent } from '../../shared/producer/producer.component';
import { AsyncPipe, CommonModule } from '@angular/common';
import { TBrandsContent } from '../../services/brands-service/brands.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-producer-line',
  standalone: true,
  imports: [
    ProducerComponent,
    CommonModule,
    AsyncPipe
  ],
  templateUrl: './producer-line.component.html',
  styleUrl: './producer-line.component.scss'
})
export class ProducerLineComponent {
  @Input() producerList!: TBrandsContent[]
} 
