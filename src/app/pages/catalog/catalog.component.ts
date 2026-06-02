import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { ProducerLineComponent } from '../../components/producer-line/producer-line.component';
import { NewsSectionComponent } from '../../components/news-section/news-section.component';
import { ProductLineComponent } from '../../components/product-line/product-line.component';
import { BrandsService, TBrandsContent } from '../../services/brands-service/brands.service';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AsyncPipe } from '@angular/common';
import { ProductsService, TProductsContent } from '../../services/products-service/products.service';
import { GroupsService, TGroupsContent } from '../../services/groups-service/groups.service';
import { GroupLineComponent } from '../../components/group-line/group-line.component';
import { NewsFields, NewsService } from '../../services/news/news.service';
import { BreadCrumbsComponent } from '../../shared/bread-crumbs/bread-crumbs.component';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { environment } from '../../../environments/environment';
import { BreadCrumbsService } from '../../services/bread-crumbs/bread-crumbs.service';
import { Meta, Title } from '@angular/platform-browser';

export interface TSearchResult {
  navigation: {
    mode: string;
  };
  query: string;
  results: {
    products: TProductsContent[];
    brands: TBrandsContent[];
    groups: TGroupsContent[];
  };
  brands: TBrandsContent[];
  characteristics: any[];
  groups: TGroupsContent[];
  products: TProductsContent[];
  tokens: string[];
}

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    ProducerLineComponent,
    NewsSectionComponent,
    ProductLineComponent,
    GroupLineComponent,
    AngularSvgIconModule,
    AsyncPipe,
    BreadCrumbsComponent,
    LoaderComponent
  ],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent implements OnInit, OnDestroy {
  private brandsService = inject(BrandsService);
  private groupsService = inject(GroupsService);
  private productsService = inject(ProductsService);
  private newsService = inject(NewsService);
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private breadCrumbsService = inject(BreadCrumbsService);
  
  private querySubscription?: Subscription;
  private searchSubscription?: Subscription;
  
  public brandsLoading = false;
  public groupsLoading = false;
  public popularProductLoading = false;
  public brandsList: TBrandsContent[] = [];
  public groupsList: TGroupsContent[] = [];
  public popularProductList: TProductsContent[] = [];
  public newsList: NewsFields[] = [];
  
  public isSearchMode = false;
  public searchLoading = false;
  public searchQuery = '';

  constructor(private title: Title, private meta: Meta) {
      this.title.setTitle('Каталог теплоизоляционных материалов | Новатех');
      this.meta.addTags([
        { name: 'description', content: 'Полный каталог теплоизоляции от производителя Новатех. Минеральная вата, базальтовый утеплитель, пенопласт, экструдированный пенополистирол (XPS), напыляемая теплоизоляция. Технические характеристики, цены, сертификаты. Подберите утеплитель для любых задач.' },
        { name: 'keywords', content: 'каталог теплоизоляции, виды утеплителей, минеральная вата купить, пенополистирол цена, XPS утеплитель, базальтовая вата характеристики' },
        { property: 'og:title', content: 'Каталог теплоизоляционных материалов - Новатех' },
        { property: 'og:description', content: 'Широкий выбор теплоизоляции от производителя. Характеристики, цены, сертификаты.' },
        { property: 'og:image', content: 'assets/images/web-app-manifest-192x192.png' },
        { property: 'og:url', content: 'https://nvt24.ru/catalog' },
        { property: 'og:type', content: 'website' },
      ]);
    }

  ngOnInit(): void {
    this.querySubscription = this.route.queryParams.subscribe(params => {

    this.breadCrumbsService.setBreadcrumbs([
      { label: 'Главная', url: '/', isClickable: true },
      { label: 'Каталог', url: this.router.url, isClickable: true },
    ]);
      
      const query = params['query'];
      
      if (query && query.trim()) {
        this.searchQuery = query;
        this.performSearch(query);
      } else {
        this.isSearchMode = false;
        this.loadCatalogData();
      }
    });
  }

  ngOnDestroy(): void {
    this.querySubscription?.unsubscribe();
    this.searchSubscription?.unsubscribe();
  }

  private performSearch(query: string): void {
    this.searchSubscription?.unsubscribe();
    
    this.isSearchMode = true;
    this.searchLoading = true;
    
    this.brandsList = [];
    this.groupsList = [];
    this.popularProductList = [];
    
    this.searchSubscription = this.http.get<any>(`${environment.baseUrl}/v1/search?q=${encodeURIComponent(query)}`)
      .subscribe({
        next: (response) => {
          this.searchLoading = false;
          
          this.brandsList = response.brands || response.results?.brands || [];
          this.groupsList = response.groups || response.results?.groups || [];
          this.popularProductList = response.products || response.results?.products || [];
          
        },
        error: (error) => {
          console.error('Search error:', error);
          this.searchLoading = false;
          this.brandsList = [];
          this.groupsList = [];
          this.popularProductList = [];
        }
      });
  }

  private loadCatalogData(): void {
    this.brandsLoading = true;
    this.brandsService.getBrandsList$().subscribe({
      next: (response) => {
        this.brandsLoading = false;
        this.brandsList = response;
      },
      error: () => {
        this.brandsLoading = false;
        this.brandsList = [];
      }
    });

    this.groupsLoading = true;
    this.groupsService.getGroupsList$().subscribe({
      next: (response) => {
        this.groupsLoading = false;
        this.groupsList = response;
      },
      error: () => {
        this.groupsLoading = false;
        this.groupsList = [];
      }
    });

    this.popularProductLoading = true;
    this.productsService.getProductsList$().subscribe({
      next: (response) => {
        this.popularProductLoading = false;
        this.popularProductList = response;
      },
      error: () => {
        this.popularProductLoading = false;
        this.popularProductList = [];
      }
    });

    this.newsService.getNewsList$(true).subscribe({
      next: (response) => {
        this.newsList = response;
      },
      error: () => {
        this.newsList = [];
      }
    });
  }
}