import { Component, inject } from '@angular/core';
import { BrandsService, TBrandsContent } from '../../services/brands-service/brands.service';
import { GroupsService, TGroupsContent } from '../../services/groups-service/groups.service';
import { ProductsService, TProductsContent } from '../../services/products-service/products.service';
import { NewsFields, NewsService } from '../../services/news/news.service';
import { ProducerLineComponent } from '../../components/producer-line/producer-line.component';
import { NewsSectionComponent } from '../../components/news-section/news-section.component';
import { ProductLineComponent } from '../../components/product-line/product-line.component';
import { GroupLineComponent } from '../../components/group-line/group-line.component';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { AsyncPipe } from '@angular/common';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { BreadCrumbsService } from '../../services/bread-crumbs/bread-crumbs.service';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [
      ProducerLineComponent,
      NewsSectionComponent,
      ProductLineComponent,
      GroupLineComponent,
      AngularSvgIconModule,
      AsyncPipe,
      LoaderComponent
    ],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent {
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
  private breadCrumbsService = inject(BreadCrumbsService);

  constructor(private title: Title, private meta: Meta) {
      this.title.setTitle('Новатех | Производство и продажа теплоизоляции по всей России');
      this.meta.addTags([
        { name: 'description', content: 'Новатех - производитель высококачественной теплоизоляции. Минеральная вата, базальтовый утеплитель, пенополистирол, экструдированный пенополистирол. Низкие цены, доставка по всей России. Поможем подобрать оптимальное решение для утепления дома, кровли, стен, трубопроводов.' },
        { name: 'keywords', content: 'теплоизоляция, утеплитель, купить теплоизоляцию, минеральная вата, базальтовая вата, пенополистирол, утеплитель для стен, утеплитель для кровли' },
        { property: 'og:title', content: 'Новатех - Производство и продажа теплоизоляции' },
        { property: 'og:description', content: 'Качественная теплоизоляция от производителя. Доставка по России. Консультация специалистов.' },
        { property: 'og:image', content: 'assets/images/web-app-manifest-192x192.png' },
        { property: 'og:url', content: 'https://nvt24.ru/lambda/welcome' },
        { property: 'og:type', content: 'website' },
      ]);
    }

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

    this.productsService.getProductsList$(undefined, true).subscribe({
      next: (response) => {
        this.popularProductLoading = false;
        this.popularProductList = response;
      },
      error: () => this.popularProductLoading = false
    });

    this.breadCrumbsService.setBreadcrumbs([
      { label: 'Главная', url: '/', isClickable: true },
    ]);

    this.newsService.getNewsList$(true).subscribe((response) => this.newsList = response)
  }
}
