import { Component, inject, OnInit, HostListener } from '@angular/core';
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
import { LoaderComponent } from '../../shared/loader/loader.component';
import { environment } from '../../../environments/environment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface MediaGalleryItem {
  id: number;
  url: string;
  title: string;
  type: 'image' | 'video';
  mime_type: string;
  size_bytes: number;
  sort_order: number;
}

@Component({
  selector: 'app-details-page',
  standalone: true,
  imports: [
    AngularSvgIconModule,
    AsyncPipe,
    BreadCrumbsComponent,
    CommonModule,
    CarouselComponent,
    TableComponent,
    LoaderComponent
  ],
  templateUrl: './details-page.component.html',
  styleUrl: './details-page.component.scss'
})
export class DetailsPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductsService);
  public productEntity!: TProductCardDetails;
  public loading = false;
  private dialog = inject(MatDialog);
  private cartService = inject(CartService);
  private sanitizer = inject(DomSanitizer);
  
  carouselItems: CarouselItem[] = [];
  galleryItems: MediaGalleryItem[] = [];
  Math = Math; // Для использования Math в шаблоне
  environment = environment;
  
  // Для распарсенного assortment_html
  public parsedAssortmentHtml: SafeHtml = '';
  
  // Для превью модального окна
  previewVisible = false;
  previewMedia: MediaGalleryItem | null = null;
  currentIndex: number = 0;
  
  // Для управления масштабом изображения
  scale: number = 1;
  position = { x: 0, y: 0 };
  isDragging = false;
  dragStart = { x: 0, y: 0 };
  imageLoaded = false;

  activeView: string = 'view1';

  switchView(view: string) {
    this.activeView = view;
  }

  ngOnInit(): void {
    this.loading = true;
    this.route.paramMap.subscribe((paramMap) => {
      const id = paramMap.get('id');
      
      if (id) {
        this.productService.getProductDetails$(+id).subscribe({
          next: (res) => {
            this.productEntity = res;
            this.loading = false;
            this.itemIsAdded$ = this.cartService.itemIsAdded$(res.id);
            
            // Распарсиваем assortment_html
            if (res.assortment_html) {
              this.parsedAssortmentHtml = this.parseAssortmentHtml(res.assortment_html);
            }
            
            // Заполнение карусели основными изображениями
            if (res.media_list) {
              res.media_list.forEach((item) => {
                this.carouselItems.push({
                  id: item.id,
                  image: item.url,
                });
              });
            }
            
            // Заполнение галереи из объекта gallery
            this.initGallery(res);
          },
          error: (err) => {
            console.error('Ошибка при получении данных:', err);
            this.loading = false;
          }
        });
      } else {
        console.warn('ID не найден в параметрах URL');
      }
    });
  }

  // Метод для парсинга HTML
private parseAssortmentHtml(html: string): SafeHtml {
  // Создаем временный DOM элемент
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Проверяем, есть ли вообще содержимое
  if (!tempDiv.hasChildNodes()) {
    return this.sanitizer.bypassSecurityTrustHtml('');
  }
  
  // Унифицированный парсинг всего содержимого с сохранением стилей
  const result = this.parseNodeWithStyles(tempDiv);
  
  return this.sanitizer.bypassSecurityTrustHtml(result);
}

/**
 * Рекурсивно парсит DOM узел с сохранением всех стилей и тегов
 */
private parseNodeWithStyles(node: Node, level: number = 0): string {
  // Обработка текстовых узлов
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim();
    if (!text) return '';
    return this.escapeHtml(text);
  }
  
  // Обработка element узлов
  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();
    
    // Список разрешенных тегов (можно расширить)
    const allowedTags = [
      'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody',
      'strong', 'b', 'em', 'i', 'u', 's', 'a', 'img', 'br',
      'section', 'article', 'header', 'footer', 'main'
    ];
    
    // Если тег не разрешен - парсим только его содержимое
    if (!allowedTags.includes(tagName)) {
      let innerHtml = '';
      for (let i = 0; i < element.childNodes.length; i++) {
        innerHtml += this.parseNodeWithStyles(element.childNodes[i], level + 1);
      }
      return innerHtml;
    }
    
    // Сохраняем все атрибуты, особенно style и class
    const attributes = this.getAllAttributes(element);
    
    // Специальная обработка для img - сохраняем src и alt
    if (tagName === 'img') {
      const src = element.getAttribute('src') || '';
      const alt = element.getAttribute('alt') || '';
      return `<img src="${this.escapeHtml(src)}" alt="${this.escapeHtml(alt)}" ${attributes}>`;
    }
    
    // Специальная обработка для ссылок
    if (tagName === 'a') {
      const href = element.getAttribute('href') || '';
      return `<a href="${this.escapeHtml(href)}" ${attributes}>${this.parseChildren(element)}</a>`;
    }
    
    // Для остальных тегов - сохраняем структуру и стили
    const childrenHtml = this.parseChildren(element);
    
    // Если внутри ничего нет и это не пустой тег - возвращаем пустоту
    if (!childrenHtml && ['br', 'hr', 'img'].includes(tagName)) {
      return `<${tagName} ${attributes}>`;
    }
    
    return `<${tagName} ${attributes}>${childrenHtml}</${tagName}>`;
  }
  
  return '';
}

/**
 * Парсит все дочерние элементы узла
 */
private parseChildren(element: HTMLElement): string {
  let result = '';
  for (let i = 0; i < element.childNodes.length; i++) {
    result += this.parseNodeWithStyles(element.childNodes[i]);
  }
  return result;
}

/**
 * Сохраняет все атрибуты элемента, включая style и class
 */
private getAllAttributes(element: HTMLElement): string {
  const attributes: string[] = [];
  
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    const attrName = attr.name.toLowerCase();
    const attrValue = attr.value;
    
    // Разрешенные атрибуты (можно расширить)
    const allowedAttrs = [
      'style', 'class', 'id', 'href', 'src', 'alt', 'title',
      'width', 'height', 'align', 'valign', 'colspan', 'rowspan',
      'border', 'cellpadding', 'cellspacing', 'bgcolor'
    ];
    
    if (allowedAttrs.includes(attrName) && attrValue) {
      // Экранируем значение атрибута
      const escapedValue = this.escapeHtml(attrValue);
      attributes.push(`${attrName}="${escapedValue}"`);
    }
  }
  
  return attributes.join(' ');
}


/**
 * Экранирование HTML специальных символов
 */
private escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

  // // Экранирование HTML специальных символов
  // private escapeHtml(str: string): string {
  //   const div = document.createElement('div');
  //   div.textContent = str;
  //   return div.innerHTML;
  // }

  // Инициализация галереи из объекта gallery
  private initGallery(product: TProductCardDetails): void {
    this.galleryItems = [];
    
    // Получаем данные только из gallery
    if (product.gallery && product.gallery.length > 0) {
      product.gallery.forEach((galleryItem: any) => {
        let type: 'image' | 'video' = 'image';
        
        // Определяем тип по file_kind или mime_type
        if (galleryItem.file_kind === 'video' || galleryItem.mime_type?.startsWith('video/')) {
          type = 'video';
        } else if (galleryItem.file_kind === 'image' || galleryItem.mime_type?.startsWith('image/')) {
          type = 'image';
        }
        
        this.galleryItems.push({
          id: galleryItem.id,
          url: galleryItem.url,
          title: galleryItem.title || `${type === 'video' ? 'Видео' : 'Изображение'} ${galleryItem.id}`,
          type: type,
          mime_type: galleryItem.mime_type,
          size_bytes: galleryItem.size_bytes || 0,
          sort_order: galleryItem.sort_order || 0
        });
      });
    }
    
    // Сортировка по sort_order, затем по id
    this.galleryItems.sort((a, b) => {
      if (a.sort_order !== b.sort_order) {
        return a.sort_order - b.sort_order;
      }
      return a.id - b.id;
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
    });

    dialogus.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  addToCart(id: number): void {
    this.cartService.addToCart(id);
  }

  downloadCertificate(cert: any): void {
    const url = `${environment.baseUrl}${cert.url}`;
    const fileName = this.getFileName(cert);
    
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        const objectUrl = window.URL.createObjectURL(blob);
        link.href = objectUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(objectUrl);
      })
      .catch(error => {
        console.error('Ошибка при загрузке файла:', error);
        window.open(url, '_blank');
      });
  }

  getFileName(cert: any): string {
    const urlParts = cert.url.split('/');
    const originalFileName = urlParts[urlParts.length - 1];
    
    if (originalFileName.includes('.')) {
      return originalFileName;
    }
    return `${cert.title.replace(/[^a-zа-яё0-9]/gi, '_')}.pdf`;
  }

  // Открытие превью медиа-файла
  openMediaPreview(mediaItem: MediaGalleryItem, index: number): void {
    this.previewMedia = mediaItem;
    this.currentIndex = index;
    this.previewVisible = true;
    this.resetZoom();
    
    // Блокируем прокрутку body
    document.body.style.overflow = 'hidden';

    var element = document.body.getElementsByClassName('container__wrap')[0];
    if (element) {
      (element as HTMLElement).style.display = 'none';
    }
  }

  // Закрытие превью
  closePreview(): void {
    this.previewVisible = false;
    this.previewMedia = null;
    this.resetZoom();
    // Восстанавливаем прокрутку body
    document.body.style.overflow = '';

    var element = document.body.getElementsByClassName('container__wrap')[0];
    if (element) {
      (element as HTMLElement).style.display = '';
    }
  }

  // Следующий элемент
  nextItem(): void {
    if (this.currentIndex < this.galleryItems.length - 1) {
      this.currentIndex++;
      this.previewMedia = this.galleryItems[this.currentIndex];
      this.resetZoom();
    }
  }

  // Предыдущий элемент
  prevItem(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.previewMedia = this.galleryItems[this.currentIndex];
      this.resetZoom();
    }
  }

  // Сброс масштаба и позиции
  resetZoom(): void {
    this.scale = 1;
    this.position = { x: 0, y: 0 };
    this.imageLoaded = false;
  }

  // Увеличение масштаба
  zoomIn(): void {
    if (this.scale < 3) {
      this.scale = Math.min(3, this.scale + 0.5);
    }
  }

  // Уменьшение масштаба
  zoomOut(): void {
    if (this.scale > 1) {
      this.scale = Math.max(1, this.scale - 0.5);
    } else {
      this.resetZoom();
    }
  }

  // Начало перетаскивания
  startDragging(event: MouseEvent): void {
    if (this.scale > 1) {
      this.isDragging = true;
      this.dragStart = { x: event.clientX - this.position.x, y: event.clientY - this.position.y };
      event.preventDefault();
    }
  }

  // Перетаскивание
  onDragging(event: MouseEvent): void {
    if (this.isDragging && this.scale > 1) {
      this.position = {
        x: event.clientX - this.dragStart.x,
        y: event.clientY - this.dragStart.y
      };
      
      // Ограничиваем перемещение
      const maxX = (this.scale - 1) * 250;
      const maxY = (this.scale - 1) * 250;
      this.position.x = Math.min(Math.max(this.position.x, -maxX), maxX);
      this.position.y = Math.min(Math.max(this.position.y, -maxY), maxY);
    }
  }

  // Конец перетаскивания
  stopDragging(): void {
    this.isDragging = false;
  }

  // Обработка колесика мыши для масштабирования
  onWheel(event: WheelEvent): void {
    if (this.previewMedia?.type === 'image') {
      event.preventDefault();
      if (event.deltaY < 0) {
        this.zoomIn();
      } else {
        this.zoomOut();
      }
    }
  }

  // Форматирование размера файла
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Обработка клавиш для навигации
  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.previewVisible) return;
    
    if (event.key === 'ArrowLeft') {
      this.prevItem();
    } else if (event.key === 'ArrowRight') {
      this.nextItem();
    } else if (event.key === 'Escape') {
      this.closePreview();
    } else if (event.key === '+' || event.key === '=') {
      this.zoomIn();
    } else if (event.key === '-' || event.key === '_') {
      this.zoomOut();
    }
  }

  // Загрузка изображения
  onImageLoad(): void {
    this.imageLoaded = true;
  }
}