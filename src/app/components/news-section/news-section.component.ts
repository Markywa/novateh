import { Component, inject, Input, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { NewsFields } from '../../services/news/news.service';
import { convertDate } from '../../helpers';
import { SlideItem, SliderComponent } from './slider/slider.component';
import { BrandsService } from '../../services/brands-service/brands.service';
import { SlidesService } from '../../services/slides/slides.service';

@Component({
  selector: 'app-news-section',
  standalone: true,
  imports: [RouterLink, SliderComponent],
  templateUrl: './news-section.component.html',
  styleUrl: './news-section.component.scss'
})
export class NewsSectionComponent implements OnInit{
  @Input() newsList: NewsFields[] = []
  public convertDate = convertDate;
  private brandsService = inject(BrandsService);
  private sliderService = inject(SlidesService);

  ngOnInit(): void {
    this.sliderService.getSlides$().subscribe((res) => {
      const buff: any[] = [];

      res.forEach((item: any) => {
        buff.push({
          imageSrc: item.image,
          title: item.title,
          description: item.text,
          buttonLink: item.slug,
          buttonText: item.slug ? 'Подробнее' : '',
        })
      })
      this.sliderSlides = buff;
    }) 
  }

  sliderSlides: SlideItem[] = [];
}
