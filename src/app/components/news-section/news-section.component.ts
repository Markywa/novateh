import { Component, Input } from '@angular/core';
import { RouterLink } from "@angular/router";
import { NewsFields } from '../../services/news/news.service';
import { convertDate } from '../../helpers';
import { SlideItem, SliderComponent } from './slider/slider.component';

@Component({
  selector: 'app-news-section',
  standalone: true,
  imports: [RouterLink, SliderComponent],
  templateUrl: './news-section.component.html',
  styleUrl: './news-section.component.scss'
})
export class NewsSectionComponent {
  @Input() newsList: NewsFields[] = []
  public convertDate = convertDate;

  sliderSlides: SlideItem[] = [
    {
      imageSrc: 'assets/images/slide1-image.png',
      title: 'Заголовок слайда 1',
      description: 'Текст описания для первого слайда. Здесь может быть краткое описание товара, услуги или акции.',
      buttonText: 'Подробнее',
      buttonLink: '/product/1'
    },
    {
      imageSrc: 'assets/images/slide2-image.png',
      title: 'Заголовок слайда 2',
      description: 'Текст описания для второго слайда. Расскажите о преимуществах или особенностях предложения.',
      buttonText: 'Узнать больше',
      buttonLink: '/product/2'
    },
    {
      imageSrc: 'assets/images/slide3-image.png',
      title: 'Заголовок слайда 3',
      description: 'Текст описания для третьего слайда. Добавьте призыв к действию или важную информацию.',
      buttonText: 'Подробнее',
      buttonLink: '/promotion'
    },
    {
      imageSrc: 'assets/images/slide4-image.png',
      title: 'Дополнительный слайд',
      description: 'Вы можете добавлять любое количество слайдов динамически.',
      buttonText: 'Перейти',
      buttonLink: '/more'
    }
  ];
}
