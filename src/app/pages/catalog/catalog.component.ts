import { Component, inject, OnInit } from '@angular/core';
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
    BreadCrumbsComponent
  ],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent implements OnInit {
  private brandsService = inject(BrandsService);
  private groupsService = inject(GroupsService);
  private productsService = inject(ProductsService);
  private newsService = inject(NewsService);
  public brandsLoading = true;
  public groupsLoading = true;
  public popularProductLoading = true;
  public brandsList: TBrandsContent[] = [];
  public groupsList: TGroupsContent[] = [];
  public popularProductList: TProductsContent[] = [];
  public newsList: NewsFields[] = []

  ngOnInit(): void {
    this.brandsService.getBrandsList$().subscribe({
      next: (response) => {
        this.brandsLoading = false;
        this.brandsList = response;
      },
      error: () => this.brandsLoading = false
    });

    this.groupsService.getGroupsList$().subscribe({
      next: (response) => {
        this.groupsLoading = false;
        this.groupsList = response;
      },
      error: () => this.groupsLoading = false
    });

    this.productsService.getProductsList$().subscribe({
      next: (response) => {
        this.popularProductLoading = false;
        this.popularProductList = response;
      },
      error: () => this.popularProductLoading = false
    });

    this.newsService.getNewsList$(true).subscribe((response) => this.newsList = response)
  }

}
