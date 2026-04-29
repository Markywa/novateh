import { Component } from '@angular/core';
import { Breadcrumb, BreadCrumbsService } from '../../services/bread-crumbs/bread-crumbs.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bread-crumbs',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './bread-crumbs.component.html',
  styleUrl: './bread-crumbs.component.scss'
})
export class BreadCrumbsComponent {
 breadcrumbs: Breadcrumb[] = [];

  constructor(private breadCrumbsService: BreadCrumbsService) {}

  ngOnInit(): void {
    this.breadcrumbs = this.breadCrumbsService.getBreadcrumbs();
    
    // Можно также подписаться на изменения
    // this.breadCrumbsService.getBreadcrumbs().subscribe(breadcrumbs => {
    //   this.breadcrumbs = breadcrumbs;
    // });
  }

  onBreadcrumbClick(breadcrumb: Breadcrumb): void {
    this.breadCrumbsService.navigateToBreadcrumb(breadcrumb);
  }

  formatLabel(label: string): string {
    return label
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
