import { Injectable } from '@angular/core';
import { Router, Routes, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface Breadcrumb {
  label: string;
  url: string;
  isClickable: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BreadCrumbsService {
  private breadcrumbs: Breadcrumb[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.firstInit();
    this.listenToRouterEvents();
  }

  getBreadcrumbs(): Breadcrumb[] {
    return this.breadcrumbs;
  }

  private firstInit(): void {
    this.breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
  }

  private listenToRouterEvents(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
      });
  }

  private buildBreadcrumbs(
    route: ActivatedRoute, 
    url: string = '', 
    breadcrumbs: Breadcrumb[] = []
  ): Breadcrumb[] {
    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') {
        url += `/${routeURL}`;
      }

      const label = this.getBreadcrumbLabel(child);
      if (label && label !== 'welcome') {
        const isClickable = url !== this.router.url;
        breadcrumbs.push({ label, url, isClickable });
      }

      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }

  private getBreadcrumbLabel(route: ActivatedRoute): string {
    const snapshot = route.snapshot;
    
    if (snapshot.data && snapshot.data['breadcrumb']) {
      return snapshot.data['breadcrumb'];
    }

    if (snapshot.params['id'] || snapshot.params['slug']) {
      return snapshot.params['slug'] || snapshot.params['id'] || '';
    }

    return snapshot.url[0]?.path || '';
  }

  navigateToBreadcrumb(breadcrumb: Breadcrumb): void {
    if (breadcrumb.isClickable) {
      this.router.navigate([breadcrumb.url]);
    }
  }
}