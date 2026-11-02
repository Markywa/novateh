import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Input, Output, EventEmitter, Inject, PLATFORM_ID, OnChanges, OnDestroy, NgZone } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface CarouselItem {
  id: number;
  image: string;
  alt?: string;
  title?: string;
  description?: string;
}

@Component({
  selector: 'app-carousel', standalone: true, imports: [CommonModule],
  templateUrl: './carousel.component.html', styleUrl: './carousel.component.scss'
})
export class CarouselComponent implements OnChanges, OnDestroy {
  @Input() items: CarouselItem[] = [];
  @Input() autoPlay = true;
  @Input() autoPlayInterval = 3000;
  @Input() showControls = true;
  @Input() showIndicators = true;
  @Input() swipeThreshold = 50;
  @Output() imageOpen = new EventEmitter<number>();
  env = environment;
  currentIndex = 0;
  dragOffset = 0;
  private pointerId: number | null = null;
  private startX = 0;
  private startY = 0;
  private moved = false;
  private timer?: ReturnType<typeof setInterval>;
  constructor(@Inject(PLATFORM_ID) private platformId: Object, private zone: NgZone) {}
  ngOnChanges() {
    this.currentIndex = Math.min(this.currentIndex, Math.max(0, this.items.length - 1));
    this.restartAutoPlay();
  }
  ngOnDestroy() { this.stopAutoPlay(); }
  next() { this.goTo((this.currentIndex + 1) % this.items.length); }
  prev() { this.goTo((this.currentIndex + this.items.length - 1) % this.items.length); }
  goTo(index: number) {
    if (!Number.isInteger(index) || index < 0 || index >= this.items.length) return;
    this.currentIndex = index;
    this.restartAutoPlay();
  }
  open(index: number, event: MouseEvent) {
    if ((!this.moved || event.detail === 0) && this.items[index]) this.imageOpen.emit(index);
    this.moved = false;
  }
  onPointerDown(event: PointerEvent) {
    if (!event.isPrimary || event.button !== 0) return;
    this.pointerId = event.pointerId;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.moved = false;
    this.dragOffset = 0;
    const target = (event.target as HTMLElement).closest('button') || event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);
    this.stopAutoPlay();
  }
  onPointerMove(event: PointerEvent) {
    if (this.pointerId !== event.pointerId) return;
    const dx = event.clientX - this.startX;
    const dy = event.clientY - this.startY;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 8) this.moved = true;
    if (Math.abs(dx) > Math.abs(dy)) this.dragOffset = dx;
  }
  onPointerUp(event: PointerEvent) {
    if (this.pointerId !== event.pointerId) return;
    const dx = event.clientX - this.startX;
    const dy = event.clientY - this.startY;
    this.moved ||= Math.max(Math.abs(dx), Math.abs(dy)) > 8;
    if (Math.abs(dx) > this.swipeThreshold && Math.abs(dx) > Math.abs(dy)) {
      dx > 0 ? this.prev() : this.next();
    }
    this.cancelPointer();
  }
  cancelPointer() {
    this.pointerId = null;
    this.dragOffset = 0;
    this.restartAutoPlay();
  }
  private stopAutoPlay() { clearInterval(this.timer); }
  private restartAutoPlay() {
    this.stopAutoPlay();
    if (isPlatformBrowser(this.platformId) && this.autoPlay && this.items.length > 1) {
      this.zone.runOutsideAngular(() => {
        this.timer = setInterval(() => this.zone.run(() => this.next()), this.autoPlayInterval);
      });
    }
  }
}
