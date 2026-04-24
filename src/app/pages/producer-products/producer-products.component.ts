import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { BrandsService, TBrandDetailsContent } from '../../services/brands-service/brands.service';
import { ProductLineComponent } from '../../components/product-line/product-line.component';
import { environment } from '../../../environments/environment.development';
import { LoaderComponent } from '../../shared/loader/loader.component';

@Component({
  selector: 'app-producer-products',
  standalone: true,
  imports: [
    CommonModule,
    AngularSvgIconModule,
    ProductLineComponent,
    LoaderComponent
  ],
  templateUrl: './producer-products.component.html',
  styleUrl: './producer-products.component.scss'
})
export class ProducerProductsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private producerService = inject(BrandsService)
  public brandEntity!: TBrandDetailsContent;
  public loading = true;
  env = environment

  ngOnInit(): void {
    this.loading = true;
      this.route.paramMap.subscribe((paramMap) => {
          const slug = paramMap.get('slug');
          
          if (slug) {
              this.producerService.getBrandsDetailsPage$(slug).subscribe({
                  next: (res) => {
                    this.brandEntity = res;
                    this.loading = false;
                  },
                  error: (err) => {
                      console.error('Ошибка при получении данных:', err);
                  }
              });
          } else {
              console.warn('Slug не найден в параметрах URL');
          }
      });
  }

}
