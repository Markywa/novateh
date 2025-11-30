import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService, TProductCardDetails } from '../../services/products-service/products.service';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { MatDialog } from '@angular/material/dialog';
import { RequestModalComponent } from '../../shared/request-modal/request-modal.component';
import { CartService } from '../../services/cart-service/cart.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { BreadCrumbsComponent } from '../../shared/bread-crumbs/bread-crumbs.component';
import { CarouselComponent, CarouselItem } from '../../components/carousel/carousel.component';
import { TableComponent } from '../../components/table/table.component';

@Component({
  selector: 'app-details-page',
  standalone: true,
  imports: [
    AngularSvgIconModule,
    AsyncPipe,
    BreadCrumbsComponent,
    CommonModule,
    CarouselComponent,
    TableComponent
  ],
  templateUrl: './details-page.component.html',
  styleUrl: './details-page.component.scss'
})
export class DetailsPageComponent implements OnInit{
  private route = inject(ActivatedRoute);
  private productService = inject(ProductsService);
  public productEntity!: TProductCardDetails;
  public loading = false;
  private dialog = inject(MatDialog);
  private cartService = inject(CartService);
  carouselItems: CarouselItem[] = [];

  activeView: string = 'view1'; // Значение по умолчанию

  switchView(view: string) {
    this.activeView = view;
  }

  ngOnInit(): void {
    this.loading = true;
    this.route.paramMap.subscribe((paramMap) => {
        const id = paramMap.get('id');
        
        if(id) {
          this.productService.getProductDetails$(+id).subscribe({
              next: (res) => {
                this.productEntity = res;
                this.loading = false;
                this.itemIsAdded$ = this.cartService.itemIsAdded$(res.id);
                res.media_list.forEach((item) => {
                  this.carouselItems.push({
                    id: item.id,
                    image: item.url.slice(1, item.url.length),
                    // title: res.name
                  })
                })
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

  public itemIsAdded$!: Observable<boolean>;

  openSendRequestModal(): void {
    const dialogus = this.dialog.open(RequestModalComponent, {
      height: '405px',
      width: '550px',
      data: {
        name: this.productEntity.name
      }
    })

    dialogus.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  addToCart(id: number): void {
    this.cartService.addToCart(id);
  }
}
