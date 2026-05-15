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
import { SeoService } from '../../services/seo/seo.service';
import { BreadCrumbsService } from '../../services/bread-crumbs/bread-crumbs.service';
import { AgentsService } from '../../services/agents/agents.service';

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
  private seoService = inject(SeoService);
  private breadCrumbsService = inject(BreadCrumbsService);
  private agentService = inject(AgentsService);
  
  carouselItems: CarouselItem[] = [];
  galleryItems: MediaGalleryItem[] = [];
  Math = Math; 
  environment = environment;
  
  public parsedAssortmentHtml: SafeHtml = '';
  public parsedCharacteristicsHtml: SafeHtml = '';
  
  previewVisible = false;
  previewMedia: MediaGalleryItem | null = null;
  currentIndex: number = 0;
  
  scale: number = 1;
  position = { x: 0, y: 0 };
  isDragging = false;
  dragStart = { x: 0, y: 0 };
  imageLoaded = false;

  activeView: string = 'view1';

  switchView(view: string) {
    this.activeView = view;
  }

  public agentList$ = this.agentService.getAgentsList$();

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap) => {
    this.loading = true;
      const slug = paramMap.get('id');
      
      if (slug) {
        this.productService.getProductDetails$(slug).subscribe({
          next: (res) => {
            this.seoService.updateSeo(res.seo);
            
            this.breadCrumbsService.pushBreadcrumb(res.name, '', false)

            this.productEntity = res;
            this.loading = false;
            this.itemIsAdded$ = this.cartService.itemIsAdded$(res.slug);
            
            if (res.assortment_html) {
              this.parsedAssortmentHtml = this.parseAssortmentHtml(res.assortment_html);
            }

            if (res.characteristics_html) {
              this.parsedCharacteristicsHtml = this.parseAssortmentHtml(res.characteristics_html);
            }

            if (res.media_list) {
              this.carouselItems = [];
              res.media_list.forEach((item) => {
                this.carouselItems.push({
                  id: item.id,
                  image: item.url,
                });
              });
            }
            
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

private parseAssortmentHtml(html: string): SafeHtml {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  if (!tempDiv.hasChildNodes()) {
    return this.sanitizer.bypassSecurityTrustHtml('');
  }
  
  const result = this.parseNodeWithStyles(tempDiv);
  
  return this.sanitizer.bypassSecurityTrustHtml(result);
}

private parseNodeWithStyles(node: Node, level: number = 0): string {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent?.trim();
    if (!text) return '';
    return this.escapeHtml(text);
  }
  
  if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();
    
    const allowedTags = [
      'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody',
      'strong', 'b', 'em', 'i', 'u', 's', 'a', 'img', 'br',
      'section', 'article', 'header', 'footer', 'main'
    ];
    
    if (!allowedTags.includes(tagName)) {
      let innerHtml = '';
      for (let i = 0; i < element.childNodes.length; i++) {
        innerHtml += this.parseNodeWithStyles(element.childNodes[i], level + 1);
      }
      return innerHtml;
    }
    
    const attributes = this.getAllAttributes(element);
    
    if (tagName === 'img') {
      const src = element.getAttribute('src') || '';
      const alt = element.getAttribute('alt') || '';
      return `<img src="${this.escapeHtml(src)}" alt="${this.escapeHtml(alt)}" ${attributes}>`;
    }
    
    if (tagName === 'a') {
      const href = element.getAttribute('href') || '';
      return `<a href="${this.escapeHtml(href)}" ${attributes}>${this.parseChildren(element)}</a>`;
    }
    
    const childrenHtml = this.parseChildren(element);
    
    if (!childrenHtml && ['br', 'hr', 'img'].includes(tagName)) {
      return `<${tagName} ${attributes}>`;
    }
    
    return `<${tagName} ${attributes}>${childrenHtml}</${tagName}>`;
  }
  
  return '';
}

private parseChildren(element: HTMLElement): string {
  let result = '';
  for (let i = 0; i < element.childNodes.length; i++) {
    result += this.parseNodeWithStyles(element.childNodes[i]);
  }
  return result;
}

private getAllAttributes(element: HTMLElement): string {
  const attributes: string[] = [];
  
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    const attrName = attr.name.toLowerCase();
    const attrValue = attr.value;
    
    const allowedAttrs = [
      'style', 'class', 'id', 'href', 'src', 'alt', 'title',
      'width', 'height', 'align', 'valign', 'colspan', 'rowspan',
      'border', 'cellpadding', 'cellspacing', 'bgcolor'
    ];
    
    if (allowedAttrs.includes(attrName) && attrValue) {
      const escapedValue = this.escapeHtml(attrValue);
      attributes.push(`${attrName}="${escapedValue}"`);
    }
  }
  
  return attributes.join(' ');
}


private escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

  private initGallery(product: TProductCardDetails): void {
    this.galleryItems = [];
    
    if (product.gallery && product.gallery.length > 0) {
      product.gallery.forEach((galleryItem: any) => {
        let type: 'image' | 'video' = 'image';
        
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
    });
  }

  addToCart(slug: string): void {
    this.cartService.addToCart(slug);
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

  openMediaPreview(mediaItem: MediaGalleryItem, index: number): void {
    this.previewMedia = mediaItem;
    this.currentIndex = index;
    this.previewVisible = true;
    this.resetZoom();
    
    document.body.style.overflow = 'hidden';

    var element = document.body.getElementsByClassName('container__wrap')[0];
    if (element) {
      (element as HTMLElement).style.display = 'none';
    }
  }

  closePreview(): void {
    this.previewVisible = false;
    this.previewMedia = null;
    this.resetZoom();
    document.body.style.overflow = '';

    var element = document.body.getElementsByClassName('container__wrap')[0];
    if (element) {
      (element as HTMLElement).style.display = '';
    }
  }

  nextItem(): void {
    if (this.currentIndex < this.galleryItems.length - 1) {
      this.currentIndex++;
      this.previewMedia = this.galleryItems[this.currentIndex];
      this.resetZoom();
    }
  }

  prevItem(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.previewMedia = this.galleryItems[this.currentIndex];
      this.resetZoom();
    }
  }

  resetZoom(): void {
    this.scale = 1;
    this.position = { x: 0, y: 0 };
    this.imageLoaded = false;
  }

  zoomIn(): void {
    if (this.scale < 3) {
      this.scale = Math.min(3, this.scale + 0.5);
    }
  }

  zoomOut(): void {
    if (this.scale > 1) {
      this.scale = Math.max(1, this.scale - 0.5);
    } else {
      this.resetZoom();
    }
  }

  startDragging(event: MouseEvent): void {
    if (this.scale > 1) {
      this.isDragging = true;
      this.dragStart = { x: event.clientX - this.position.x, y: event.clientY - this.position.y };
      event.preventDefault();
    }
  }

  onDragging(event: MouseEvent): void {
    if (this.isDragging && this.scale > 1) {
      this.position = {
        x: event.clientX - this.dragStart.x,
        y: event.clientY - this.dragStart.y
      };
      
      const maxX = (this.scale - 1) * 250;
      const maxY = (this.scale - 1) * 250;
      this.position.x = Math.min(Math.max(this.position.x, -maxX), maxX);
      this.position.y = Math.min(Math.max(this.position.y, -maxY), maxY);
    }
  }

  stopDragging(): void {
    this.isDragging = false;
  }

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

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

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

  onImageLoad(): void {
    this.imageLoaded = true;
  }
}