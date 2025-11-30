import { Component, Input } from '@angular/core';
import { RouterLink } from "@angular/router";
import { TBrandsContent } from '../../services/brands-service/brands.service';
import { environment } from '../../../environments/environment.development';
import { CommonModule } from "../../../../node_modules/@angular/common";

@Component({
  selector: 'app-producer',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule
],
  templateUrl: './producer.component.html',
  styleUrl: './producer.component.scss'
})
export class ProducerComponent {
  @Input() producerItem!: TBrandsContent
  env = environment
}
