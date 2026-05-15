import { Component, OnInit, OnDestroy } from '@angular/core';
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
  breadcrumbs: Breadcrumb[] = [];
  private subscription: Subscription | null = null;

  constructor(
    private breadCrumbsService: BreadCrumbsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Подписываемся на изменения хлебных крошек
    this.subscription = this.breadCrumbsService.getBreadcrumbs().subscribe(breadcrumbs => {
      this.breadcrumbs = breadcrumbs;
    });
  }

  ngOnDestroy(): void {
    // Отписываемся при уничтожении компонента
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onBreadcrumbClick(breadcrumb: Breadcrumb): void {
    this.breadCrumbsService.navigateToBreadcrumb(breadcrumb, this.router);
  }

  formatLabel(label: string): string {
    // Если уже отформатированная строка, возвращаем как есть
    if (!label.includes('-') && !label.includes('_')) {
      return label;
    }
    
    // Форматируем только если есть дефисы или подчеркивания
    return label
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Дополнительный метод для получения иконки, если она есть
  getIcon(breadcrumb: Breadcrumb): string {
    return breadcrumb.icon || '';
  }
}