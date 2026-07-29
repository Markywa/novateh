import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Input, OnInit, AfterViewInit, OnChanges, SimpleChanges, inject, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

export interface SlideItem {
  imageSrc: string;
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
}

@Component({
  selector: 'app-slider',
  standalone: true,
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  imports: [CommonModule],
})
export class SliderComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() slides: SlideItem[] = [];
  @Input() backgroundImage: string = 'assets/images/slider-back.png';
  @Input() autoPlay: boolean = false;
  @Input() autoPlayInterval: number = 5000;
  @Input() dragThreshold: number = 50; // Минимальное расстояние для переключения слайда
  environment = environment
  
  currentIndex: number = 0;
  totalSlides: number = 0;
  private autoPlayTimer: any;
  private router = inject(Router);
  
  // Drag to slide properties
  isDragging: boolean = false;
  dragStartX: number = 0;
  dragCurrentX: number = 0;
  dragOffset: number = 0; // в пикселях
  startTime: number = 0;
  containerWidth: number = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    this.totalSlides = this.slides.length;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['slides']){
      this.totalSlides = this.slides.length;
      if (this.autoPlay && this.totalSlides > 1) {
        this.startAutoPlay();
      }
    }
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.autoPlay && this.totalSlides > 1) {
      this.startAutoPlay();
    }
    this.updateContainerWidth();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.updateContainerWidth();
  }

  goToSlide(index: number): void {
    if (index >= 0 && index < this.totalSlides) {
      this.currentIndex = index;
      this.dragOffset = 0;
      
      if (this.autoPlay) {
        this.resetAutoPlay();
      }
    }
  }

  nextSlide(): void {
    if (this.currentIndex < this.totalSlides - 1) {
      this.currentIndex++;
    } else if (this.totalSlides > 0) {
      this.currentIndex = 0; 
    }
    this.dragOffset = 0;    
    if (this.autoPlay) {
      this.resetAutoPlay();
    }
  }

  prevSlide(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else if (this.totalSlides > 0) {
      this.currentIndex = this.totalSlides - 1; 
    }
    this.dragOffset = 0;
    
    if (this.autoPlay) {
      this.resetAutoPlay();
    }
  }

  // Touch events for mobile
  onTouchStart(event: TouchEvent): void {
    const target = event.target as HTMLElement;
    const isButton = target.closest('button') !== null;
    
    if (isButton) {
        return;
    }
    
    event.preventDefault();
    this.startDrag(event.touches[0].clientX);
  } 

  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging) return;
    event.preventDefault();
    this.dragCurrentX = event.touches[0].clientX;
    this.updateDragOffset();
  }

  onTouchEnd(): void {
    this.endDrag();
  }

  // Mouse events for desktop testing
  onMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.startDrag(event.clientX);
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    event.preventDefault();
    this.dragCurrentX = event.clientX;
    this.updateDragOffset();
  }

  @HostListener('window:mouseup')
  onMouseUp(): void {
    if (this.isDragging) {
      this.endDrag();
    }
  }

  private startDrag(clientX: number): void {
    // Stop auto-play while dragging
    if (this.autoPlay && this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
    }
    
    this.isDragging = true;
    this.dragStartX = clientX;
    this.dragCurrentX = clientX;
    this.startTime = Date.now();
    this.dragOffset = 0;
    this.updateContainerWidth();
  }

  private updateDragOffset(): void {
    if (!this.isDragging) return;
    
    const deltaX = this.dragCurrentX - this.dragStartX;
    
    const maxOffset = this.containerWidth * 1; 
    let newOffset = deltaX;
    newOffset = Math.max(-maxOffset, Math.min(maxOffset, newOffset));
    this.dragOffset = newOffset;
  }

  private endDrag(): void {
    if (!this.isDragging) return;
    
    const deltaX = this.dragCurrentX - this.dragStartX;
    const dragTime = Date.now() - this.startTime;
    const dragPercentage = (Math.abs(deltaX) / this.containerWidth) * 100;
    
    // Проверяем, нужно ли переключить слайд
    const shouldSwitch = dragPercentage > this.dragThreshold || (Math.abs(deltaX) > 30 && dragTime < 300);
    
    if (shouldSwitch) {
      if (deltaX > 0) {
        // Тянем вправо - слайд уходит направо, показываем предыдущий
        this.prevSlide();
      } else if (deltaX < 0) {
        // Тянем влево - слайд уходит налево, показываем следующий
        this.nextSlide();
      }
    }
    
    // Сбрасываем состояние перетаскивания
    this.isDragging = false;
    this.dragOffset = 0;
    
    // Перезапускаем автовоспроизведение
    if (this.autoPlay && this.totalSlides > 1) {
      this.startAutoPlay();
    }
  }

  private updateContainerWidth(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.containerWidth = 0;
      return;
    }

    const container = document.querySelector('.slider-container');
    this.containerWidth = container ? container.clientWidth : window.innerWidth;
  }

  private startAutoPlay(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
    }
    this.autoPlayTimer = setInterval(() => {
      this.nextSlide();
    }, this.autoPlayInterval);
  }

  private resetAutoPlay(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.startAutoPlay();
    }
  }

  slideHref(slide: SlideItem): string | null {
    const link = (slide.buttonLink || '').trim();
    if (!link) return null;
    if (/^(https?:)?\/\//i.test(link) || link.startsWith('mailto:') || link.startsWith('tel:')) {
      return link;
    }
    return link.startsWith('/') ? link : `/${link}`;
  }

  onButtonClick(event: MouseEvent, slide: SlideItem): void {
    const href = this.slideHref(slide);
    if (!href || /^(https?:)?\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }
    event.preventDefault();
    this.router.navigateByUrl(href);
  }

  ngOnDestroy(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
    }
  }
}
