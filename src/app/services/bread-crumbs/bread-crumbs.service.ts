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

  /**
   * Рекурсивно строим хлебные крошки из ActivatedRoute
   */
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
        const isClickable = url !== this.router.url; // Текущая страница не кликабельна
        breadcrumbs.push({ label, url, isClickable });
      }

      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }

    return breadcrumbs;
  }

  /**
   * Получаем читабельную метку для хлебной крошки
   */
  private getBreadcrumbLabel(route: ActivatedRoute): string {
    const snapshot = route.snapshot;
    
    // Пытаемся получить label из data
    if (snapshot.data && snapshot.data['breadcrumb']) {
      return snapshot.data['breadcrumb'];
    }

    // Для динамических параметров (id, slug)
    if (snapshot.params['id'] || snapshot.params['slug']) {
      return snapshot.params['slug'] || snapshot.params['id'] || '';
    }

    // Используем path как fallback
    return snapshot.url[0]?.path || '';
  }

  /**
   * Навигация по хлебной крошке
   */
  navigateToBreadcrumb(breadcrumb: Breadcrumb): void {
    if (breadcrumb.isClickable) {
      this.router.navigate([breadcrumb.url]);
    }
  }
}