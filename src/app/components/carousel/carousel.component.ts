import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
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

  env = environment;
  currentIndex: number = 0;
  private autoPlayTimer: any;

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
