import { Component, Input } from '@angular/core';
import { NewsFields } from '../../../services/news/news.service';
import { convertDate } from '../../../helpers';

@Component({
  selector: 'app-news-card',
  standalone: true,
  imports: [],
  templateUrl: './news-card.component.html',
  styleUrl: './news-card.component.scss'
})
export class NewsCardComponent {
  @Input() newsFields!: NewsFields;
  public convertDate = convertDate;
}
