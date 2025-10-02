import { Component, Input } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-producer',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './producer.component.html',
  styleUrl: './producer.component.scss'
})
export class ProducerComponent {
  @Input() producerItem!: {id: string, img: string}
}
