import { Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { BrandsService, TBrandDetailsContent } from '../../services/brands-service/brands.service';
import { ProductLineComponent } from '../../components/product-line/product-line.component';
import { environment } from '../../../environments/environment';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { BreadCrumbsComponent } from '../../shared/bread-crumbs/bread-crumbs.component';
import { BreadCrumbsService } from '../../services/bread-crumbs/bread-crumbs.service';
import { SeoService } from '../../services/seo/seo.service';

@Component({
  selector: 'app-producer-products',
  standalone: true,
  imports: [
    CommonModule,
    AngularSvgIconModule,
    ProductLineComponent,
    LoaderComponent,
    BreadCrumbsComponent
  ],
  templateUrl: './producer-products.component.html',
  styleUrl: './producer-products.component.scss'
})
export class ProducerProductsComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private detailRequest?: Subscription;
  private route = inject(ActivatedRoute);
  private producerService = inject(BrandsService);
  private breadCrumbsService = inject(BreadCrumbsService);
  private router = inject(Router);
  private seoService = inject(SeoService);
  public brandEntity!: TBrandDetailsContent;
  public loading = true;
  public selectedCategoryId: number | null = null;
  env = environment
  public error = false;
  public errorTitle = '';
  
  ngOnInit(): void {
    this.loading = true;
    this.error = false;  
      this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((paramMap) => {
          this.detailRequest?.unsubscribe();
          this.loading = true;
          this.errorTitle = '';
          const slug = paramMap.get('slug');
          
          if (slug) {
              this.detailRequest = this.producerService.getBrandsDetailsPage$(slug).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                  next: (res) => {
                    this.breadCrumbsService.setBreadcrumbs([
                      { label: 'Главная', url: '/', isClickable: true },
                      { label: res.brand.name, url: this.router.url, isClickable: true },
                    ]);
                    this.brandEntity = res;
                    
                    this.seoService.updateSeo({
                      title: res.brand.name + ': каталог материалов | Новатех',
                      description: res.brand.name + ' в каталоге Новатех. Товары, характеристики и фотографии. Подбор материалов и консультация в Красноярске.',
                      canonical_url: '/brand/' + res.brand.slug,
                      og_image: res.brand.media,
                    });
                    this.seoService.breadcrumbs([
                      { title: 'Каталог', url: '/catalog' },
                      { title: res.brand.name, url: null },
                    ], '/brand/' + res.brand.slug);
                    this.loading = false;
                    this.error = false;
                  },
                  error: (err) => {
                      this.errorTitle = this.seoService.pageError(err.status);
                      this.loading = false;
                      this.error = true; 
                  }
              });
          } else {
              console.warn('Slug не найден в параметрах URL');
              this.loading = false;
              this.error = true;  // Также показываем сообщение при отсутствии slug
          }
      });
  }

  filterByCategory(categoryId: number | null): void {
    this.selectedCategoryId = categoryId;
  }
}
