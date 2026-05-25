// import { CommonModule } from '@angular/common';
// import { Component, inject, OnInit } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { AngularSvgIconModule } from 'angular-svg-icon';
// import { BrandsService, TBrandDetailsContent } from '../../services/brands-service/brands.service';
// import { ProductLineComponent } from '../../components/product-line/product-line.component';
// import { environment } from '../../../environments/environment.development';
// import { LoaderComponent } from '../../shared/loader/loader.component';

// @Component({
//   selector: 'app-producer-products',
//   standalone: true,
//   imports: [
//     CommonModule,
//     AngularSvgIconModule,
//     ProductLineComponent,
//     LoaderComponent
//   ],
//   templateUrl: './producer-products.component.html',
//   styleUrl: './producer-products.component.scss'
// })
// export class ProducerProductsComponent implements OnInit {
//   private route = inject(ActivatedRoute);
//   private producerService = inject(BrandsService)
//   public brandEntity!: TBrandDetailsContent;
//   public loading = true;
//   env = environment

//   ngOnInit(): void {
//     this.loading = true;
//       this.route.paramMap.subscribe((paramMap) => {
//           const slug = paramMap.get('slug');
          
//           if (slug) {
//               this.producerService.getBrandsDetailsPage$(slug).subscribe({
//                   next: (res) => {
//                     this.brandEntity = res;
//                     this.loading = false;
//                   },
//                   error: (err) => {
//                       console.error('Ошибка при получении данных:', err);
//                   }
//               });
//           } else {
//               console.warn('Slug не найден в параметрах URL');
//           }
//       });
//   }

// }
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { BrandsService, TBrandDetailsContent } from '../../services/brands-service/brands.service';
import { ProductLineComponent } from '../../components/product-line/product-line.component';
import { environment } from '../../../environments/environment.development';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { BreadCrumbsComponent } from '../../shared/bread-crumbs/bread-crumbs.component';
import { BreadCrumbsService } from '../../services/bread-crumbs/bread-crumbs.service';
import { Meta, Title } from '@angular/platform-browser';

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
  private route = inject(ActivatedRoute);
  private producerService = inject(BrandsService);
  private breadCrumbsService = inject(BreadCrumbsService);
  private router = inject(Router);
  public brandEntity!: TBrandDetailsContent;
  public loading = true;
  public selectedCategoryId: number | null = null;
  env = environment
  public error = false;     
  
  constructor(private title: Title, private meta: Meta) {
        this.meta.addTags([
          { name: 'description', content: 'Полный каталог теплоизоляции от производителя Новатех. Минеральная вата, базальтовый утеплитель, пенопласт, экструдированный пенополистирол (XPS), напыляемая теплоизоляция. Технические характеристики, цены, сертификаты. Подберите утеплитель для любых задач.' },
          { name: 'keywords', content: 'каталог теплоизоляции, виды утеплителей, минеральная вата купить, пенополистирол цена, XPS утеплитель, базальтовая вата характеристики' },
          { property: 'og:title', content: 'Каталог теплоизоляционных материалов - Новатех' },
          { property: 'og:description', content: 'Широкий выбор теплоизоляции от производителя. Характеристики, цены, сертификаты.' },
          { property: 'og:image', content: 'assets/images/web-app-manifest-192x192.png' },
          { property: 'og:url', content: 'https://nvt24.ru/lambda/catalog' },
          { property: 'og:type', content: 'website' },
        ]);
      }

  ngOnInit(): void {
    this.loading = true;
    this.error = false;  
      this.route.paramMap.subscribe((paramMap) => {
          const slug = paramMap.get('slug');
          
          if (slug) {
              this.producerService.getBrandsDetailsPage$(slug).subscribe({
                  next: (res) => {
                    this.breadCrumbsService.setBreadcrumbs([
                      { label: 'Главная', url: '/', isClickable: true },
                      { label: res.brand.name, url: this.router.url, isClickable: true },
                    ]);
                    this.brandEntity = res;
                    
                    this.title.setTitle('Новатех - Товары бренда ' + res.brand.name);
                    this.loading = false;
                    this.error = false;
                  },
                  error: (err) => {
                      console.error('Ошибка при получении данных:', err);
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
