import { Component } from '@angular/core';
import { ProducerLineComponent } from '../../components/producer-line/producer-line.component';
import { NewsSectionComponent } from '../../components/news-section/news-section.component';
import { ProductLineComponent } from '../../components/product-line/product-line.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    ProducerLineComponent,
    NewsSectionComponent,
    ProductLineComponent
  ],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent {

}
