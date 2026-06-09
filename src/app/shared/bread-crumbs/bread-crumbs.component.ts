import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Breadcrumb, BreadCrumbsService } from '../../services/bread-crumbs/bread-crumbs.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bread-crumbs',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './bread-crumbs.component.html',
  styleUrl: './bread-crumbs.component.scss'
})
export class BreadCrumbsComponent implements OnInit, OnDestroy {
  @Input() set breadcrumbsData(breadcrumbs: Breadcrumb[] | null) {
    if (breadcrumbs && Array.isArray(breadcrumbs) && breadcrumbs.length > 0) {
      this.breadcrumbs = this.processBreadcrumbs(breadcrumbs);
      if (this.subscription) {
        this.subscription.unsubscribe();
        this.subscription = null;
      }
    } else if (!this.subscription) {
      this.subscribeToService();
    }
  }

  breadcrumbs: Breadcrumb[] = [];
  private subscription: Subscription | null = null;

  constructor(
    private breadCrumbsService: BreadCrumbsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.subscription) {
      this.subscribeToService();
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private subscribeToService(): void {
    this.subscription = this.breadCrumbsService.getBreadcrumbs().subscribe(breadcrumbs => {
      this.breadcrumbs = this.processBreadcrumbs(breadcrumbs);
    });
  }

  private processBreadcrumbs(breadcrumbs: Breadcrumb[]): Breadcrumb[] {
    if (!breadcrumbs || !Array.isArray(breadcrumbs)) {
      return [];
    }

    return breadcrumbs.map((breadcrumb, index) => ({
      ...breadcrumb,
      label: breadcrumb.title as string || breadcrumb.label,
      url: breadcrumb.url,
      isClickable: index !== breadcrumbs.length - 1  
    }));
  }

  onBreadcrumbClick(breadcrumb: Breadcrumb): void {
    if (!breadcrumb.url) {
      return;
    }
    
    this.breadCrumbsService.navigateToBreadcrumb(breadcrumb, this.router);
  }

  formatLabel(label: string): string {
    if (!label) return '';
    
    if (!label.includes('-') && !label.includes('_')) {
      return label;
    }
    
    return label
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  getIcon(breadcrumb: Breadcrumb): string {
    return breadcrumb.icon || '';
  }

  isActive(index: number): boolean {
    return index === this.breadcrumbs.length - 1;
  }
}