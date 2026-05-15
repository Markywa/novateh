import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService, TGroupsPageContent } from '../../services/groups-service/groups.service';
import { CommonModule } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ProductLineComponent } from '../../components/product-line/product-line.component';
import { BreadCrumbsComponent } from '../../shared/bread-crumbs/bread-crumbs.component';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { BreadCrumbsService } from '../../services/bread-crumbs/bread-crumbs.service';

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
    public groupEntity!: TGroupsPageContent;
    public loading = true;
  
    ngOnInit(): void {
      this.loading = true;
      this.route.paramMap.subscribe((paramMap) => {
          const slug = paramMap.get('slug');
          
          if (slug) {
              this.groupsService.getGroupDetailsPage$(slug).subscribe({
                  next: (res) => {
                    this.groupEntity = res;
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
