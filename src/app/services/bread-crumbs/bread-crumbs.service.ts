import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Breadcrumb {
  label: string;
  url: string;
  isClickable: boolean;
  data?: any;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BreadCrumbsService {
  private breadcrumbsSubject = new BehaviorSubject<Breadcrumb[]>([]);
  private navigationHistory: Breadcrumb[][] = []; // Хранит весь путь пользователя
  private maxHistorySize = 50;

  constructor() {}

  /**
   * Установка полного пути хлебных крошек
   */
  setBreadcrumbs(breadcrumbs: Breadcrumb[]): void {
    this.breadcrumbsSubject.next(breadcrumbs);
    this.saveToHistory(breadcrumbs);
  }

  /**
   * Добавление одного уровня в конец пути
   */
pushBreadcrumb(label: string, url: string, isClickable: boolean = true, icon?: string): void {
  const currentBreadcrumbs = this.getCurrentBreadcrumbs();
  
  // Проверка, существует ли уже такой путь
  const isDuplicate = currentBreadcrumbs.some(breadcrumb => 
    breadcrumb.url === url || 
    (breadcrumb.label === label && breadcrumb.url === url)
  );
  
  // Если путь уже существует, не добавляем
  if (isDuplicate) {
    console.warn(`Breadcrumb with url "${url}" already exists`);
    return;
  }
  
  const newBreadcrumb: Breadcrumb = {
    label,
    url,
    isClickable,
    icon
  };
  
  this.setBreadcrumbs([...currentBreadcrumbs, newBreadcrumb]);
}

  /**
   * Замена последнего элемента (для динамических страниц)
   */
  updateLastBreadcrumb(label: string, url?: string, isClickable?: boolean): void {
    const currentBreadcrumbs = this.getCurrentBreadcrumbs();
    
    if (currentBreadcrumbs.length > 0) {
      const lastBreadcrumb = currentBreadcrumbs[currentBreadcrumbs.length - 1];
      const updatedBreadcrumb = {
        ...lastBreadcrumb,
        label: label,
        url: url || lastBreadcrumb.url,
        isClickable: isClickable !== undefined ? isClickable : lastBreadcrumb.isClickable
      };
      
      const updatedBreadcrumbs = [...currentBreadcrumbs.slice(0, -1), updatedBreadcrumb];
      this.setBreadcrumbs(updatedBreadcrumbs);
    }
  }

  /**
   * Обрезка пути до указанного уровня
   */
  truncateToLevel(level: number): void {
    const currentBreadcrumbs = this.getCurrentBreadcrumbs();
    
    if (level >= 0 && level < currentBreadcrumbs.length) {
      this.setBreadcrumbs(currentBreadcrumbs.slice(0, level + 1));
    }
  }

  /**
   * Получение текущих хлебных крошек (Observable)
   */
  getBreadcrumbs(): Observable<Breadcrumb[]> {
    return this.breadcrumbsSubject.asObservable();
  }

  /**
   * Получение текущих хлебных крошек (синхронно)
   */
  getCurrentBreadcrumbs(): Breadcrumb[] {
    return this.breadcrumbsSubject.getValue();
  }

  /**
   * Получение всей истории навигации
   */
  getNavigationHistory(): Breadcrumb[][] {
    return this.navigationHistory;
  }

  /**
   * Возврат к предыдущему пути из истории
   */
  goToPreviousPath(): void {
    if (this.navigationHistory.length >= 2) {
      const previousPath = this.navigationHistory[this.navigationHistory.length - 2];
      this.breadcrumbsSubject.next(previousPath);
      this.navigationHistory.pop(); // Удаляем текущий
    }
  }

  /**
   * Очистка хлебных крошек
   */
  clearBreadcrumbs(): void {
    this.setBreadcrumbs([]);
  }

  /**
   * Сохранение пути в историю
   */
  private saveToHistory(breadcrumbs: Breadcrumb[]): void {
    const pathCopy = JSON.parse(JSON.stringify(breadcrumbs));
    this.navigationHistory.push(pathCopy);
    
    if (this.navigationHistory.length > this.maxHistorySize) {
      this.navigationHistory.shift();
    }
  }

  /**
   * Навигация по хлебной крошке
   */
navigateToBreadcrumb(breadcrumb: Breadcrumb, router: any): void {
  if (breadcrumb.isClickable && breadcrumb.url) {
    // Находим индекс выбранной хлебной крошки
    const currentBreadcrumbs = this.getCurrentBreadcrumbs();
    const clickedIndex = currentBreadcrumbs.findIndex(b => b.url === breadcrumb.url);
    
    // Если нашли, обрезаем путь до выбранного элемента
    if (clickedIndex !== -1) {
      const truncatedBreadcrumbs = currentBreadcrumbs.slice(0, clickedIndex + 1);
      this.setBreadcrumbs(truncatedBreadcrumbs);
    }
    
    // Выполняем навигацию
    router.navigateByUrl(breadcrumb.url);
  }
}
}