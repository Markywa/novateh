import { CommonModule } from '@angular/common';
import { Component, Input, HostListener, ElementRef, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment.development';

export interface CarouselItem {
  id: number;
  image: string;
  title?: string;
  description?: string;
}

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.scss'
})
export class CarouselComponent {
  @Input() items: CarouselItem[] = [];
  @Input() autoPlay: boolean = true;
  @Input() autoPlayInterval: number = 3000;
  @Input() showControls: boolean = true;
  @Input() showIndicators: boolean = true;
  @Input() swipeThreshold: number = 50;

  @ViewChild('carouselContainer') carouselContainer!: ElementRef;

  env = environment;
  currentIndex: number = 0;
  private autoPlayTimer: any;
  
  touchStartX: number = 0;
  touchEndX: number = 0;
  isSwiping: boolean = false;

  ngOnInit() {
    if (this.autoPlay && this.items.length > 1) {
      this.startAutoPlay();
    }
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.restartAutoPlay();
  }

  prev() {
    this.currentIndex = this.currentIndex === 0 
      ? this.items.length - 1 
      : this.currentIndex - 1;
    this.restartAutoPlay();
  }

  goTo(index: number) {
    this.currentIndex = index;
    this.restartAutoPlay();
  }

  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.touches[0].clientX;
    this.isSwiping = true;
    this.stopAutoPlay();
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isSwiping) return;
    this.touchEndX = event.touches[0].clientX;
    
    const diff = this.touchEndX - this.touchStartX;
    const track = document.querySelector('.carousel-track') as HTMLElement;
    if (track) {
      const currentTranslate = -this.currentIndex * 100;
      const dragTranslate = currentTranslate + (diff / this.carouselContainer.nativeElement.offsetWidth) * 100;
      track.style.transform = `translateX(${dragTranslate}%)`;
      track.style.transition = 'none';
    }
  }

  onTouchEnd() {
    if (!this.isSwiping) return;
    
    const diff = this.touchEndX - this.touchStartX;
    const threshold = this.swipeThreshold;
    
    const track = document.querySelector('.carousel-track') as HTMLElement;
    if (track) {
      track.style.transition = 'transform 0.5s ease-in-out';
    }
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        this.prev();
      } else {
        this.next();
      }
    } else {
      if (track) {
        track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
      }
    }
    
    this.isSwiping = false;
    this.touchStartX = 0;
    this.touchEndX = 0;
    
    if (this.autoPlay) {
      this.startAutoPlay();
    }
  }

  private startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayTimer = setInterval(() => {
      this.next();
    }, this.autoPlayInterval);
  }

  private stopAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  private restartAutoPlay() {
    if (this.autoPlay) {
      this.startAutoPlay();
    }
  }
}