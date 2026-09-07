import { Subscription } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService, TGroupsPageContent } from '../../services/groups-service/groups.service';
import { CommonModule } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ProductLineComponent } from '../../components/product-line/product-line.component';
import { BreadCrumbsComponent } from '../../shared/bread-crumbs/bread-crumbs.component';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { BreadCrumbsService } from '../../services/bread-crumbs/bread-crumbs.service';
import { SeoService } from '../../services/seo/seo.service';

@Component({
  selector: 'app-group-page',
  standalone: true,
  imports: [
    CommonModule,
    AngularSvgIconModule,
    ProductLineComponent,
    BreadCrumbsComponent,
    LoaderComponent
  ],
  templateUrl: './group-page.component.html',
  styleUrl: './group-page.component.scss'
})
export class GroupPageComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private detailRequest?: Subscription;
    private route = inject(ActivatedRoute);
    private groupsService = inject(GroupsService);
    private router = inject(Router);
    private breadCrumbsService = inject(BreadCrumbsService);
    private seoService = inject(SeoService);
    public groupEntity!: TGroupsPageContent;
    public loading = true;
    public errorTitle = '';
    
  
    ngOnInit(): void {
      this.loading = true;
      this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((paramMap) => {
          this.detailRequest?.unsubscribe();
          this.loading = true;
          this.errorTitle = '';
          const slug = paramMap.get('slug');
          
          if (slug) {
              this.detailRequest = this.groupsService.getGroupDetailsPage$(slug).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
                  next: (res) => {
                    this.groupEntity = res;
                    this.seoService.updateSeo(res.category.seo);
                    this.seoService.breadcrumbs([
                      { title: 'Каталог', url: '/catalog' },
                      { title: res.category.name, url: null },
                    ], '/group/' + res.category.slug);

                    this.loading = false;

                    this.breadCrumbsService.setBreadcrumbs([
                      { label: 'Главная', url: '/', isClickable: true },
                      { label: res.category.name, url: this.router.url, isClickable: true },
                    ]);
                  },
                  error: (err) => {
                      this.errorTitle = this.seoService.pageError(err.status);
                      this.loading = false;
                  }
              });
          } else {
              console.warn('Slug не найден в параметрах URL');
          }
      });
  }
}
