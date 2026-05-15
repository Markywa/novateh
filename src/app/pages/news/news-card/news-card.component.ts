import { Component, Input } from '@angular/core';
import { NewsFields } from '../../../services/news/news.service';
import { convertDate } from '../../../helpers';
import { environment } from '../../../../environments/environment';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-news-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './news-card.component.html',
  styleUrl: './news-card.component.scss'
})
export class NewsCardComponent {
  @Input() newsFields!: NewsFields;
  public convertDate = convertDate;
  environment = environment
}
