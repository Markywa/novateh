import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, AfterViewInit, OnChanges, SimpleChanges, inject } from '@angular/core';
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
  environment = environment
  
  currentIndex: number = 0;
  totalSlides: number = 0;
  private autoPlayTimer: any;
  private router = inject(Router);  

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
    if (this.autoPlay && this.totalSlides > 1) {
      this.startAutoPlay();
    }
  }

  goToSlide(index: number): void {
    if (index >= 0 && index < this.totalSlides) {
      this.currentIndex = index;
      
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
    console.log(this.currentIndex);
    
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
    
    if (this.autoPlay) {
      this.resetAutoPlay();
    }
  }

  private startAutoPlay(): void {
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

  onButtonClick(slide: SlideItem): void {
    if (slide.buttonLink) {
      this.router.navigateByUrl('/main' + slide.buttonLink);
    } else {
      console.log('Button clicked for slide:', slide)
    }
  }

  ngOnDestroy(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
    }
  }
}