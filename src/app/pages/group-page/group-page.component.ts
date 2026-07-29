import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService, TGroupsPageContent } from '../../services/groups-service/groups.service';
import { CommonModule } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ProductLineComponent } from '../../components/product-line/product-line.component';
import { BreadCrumbsComponent } from '../../shared/bread-crumbs/bread-crumbs.component';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { BreadCrumbsService } from '../../services/bread-crumbs/bread-crumbs.service';
import { Meta, Title } from '@angular/platform-browser';
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
    private route = inject(ActivatedRoute);
    private groupsService = inject(GroupsService);
    private router = inject(Router);
    private breadCrumbsService = inject(BreadCrumbsService);
    private seoService = inject(SeoService);
    public groupEntity!: TGroupsPageContent;
    public loading = true;  
    
    constructor(private title: Title, private meta: Meta) {}
  
    ngOnInit(): void {
      this.loading = true;
      this.route.paramMap.subscribe((paramMap) => {
          const slug = paramMap.get('slug');
          
          if (slug) {
              this.groupsService.getGroupDetailsPage$(slug).subscribe({
                  next: (res) => {
                    this.groupEntity = res;
                    if (res.category.seo.title) {
                      this.title.setTitle('Новатех - ' + res.category.seo.title);
                    } else {
                      this.title.setTitle('Новатех - Продукция: ' + res.category.name);
                    }
                    
                    if (res.category.seo.description) {
                      this.meta.updateTag({ name: 'description', content: res.category.seo.description });
                    }
                    
                    if (res.category.seo.keywords) {
                      this.meta.updateTag({ name: 'keywords', content: res.category.seo.keywords });
                    }
                    
                    if (res.category.seo.robots) {
                      this.meta.updateTag({ name: 'robots', content: res.category.seo.robots });
                    }
                    
                    if (res.category.seo.og_title) {
                      this.meta.updateTag({ property: 'og:title', content: res.category.seo.og_title });
                    }
                    
                    if (res.category.seo.og_description) {
                      this.meta.updateTag({ property: 'og:description', content: res.category.seo.og_description });
                    }
                    
                    if (res.category.seo.og_image) {
                      this.meta.updateTag({ property: 'og:image', content: res.category.seo.og_image });
                    }

                    if (res.category.seo.canonical_url) {
                      this.seoService.setCanonicalUrl(res.category.seo.canonical_url);
                    }
                    
                    this.loading = false;

                    this.breadCrumbsService.setBreadcrumbs([
                      { label: 'Главная', url: '/', isClickable: true },
                      { label: res.category.name, url: this.router.url, isClickable: true },
                    ]);
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
