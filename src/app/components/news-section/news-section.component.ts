import { Component, Input } from '@angular/core';
import { RouterLink } from "@angular/router";
import { NewsFields } from '../../services/news/news.service';
import { convertDate } from '../../helpers';

@Component({
  selector: 'app-news-section',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './news-section.component.html',
  styleUrl: './news-section.component.scss'
})
export class NewsSectionComponent {
  @Input() newsList: NewsFields[] = []
  public convertDate = convertDate;
}
