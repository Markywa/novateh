import { Component, inject, Input } from '@angular/core';
import { NewsFields } from '../../../services/news/news.service';
import { convertDate } from '../../../helpers';
import { environment } from '../../../../environments/environment';
import { Router, RouterLink } from "@angular/router";
import { BreadCrumbsService } from '../../../services/bread-crumbs/bread-crumbs.service';

@Component({
  selector: 'app-news-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './news-card.component.html',
  styleUrl: './news-card.component.scss'
})
export class NewsCardComponent {
  @Input() set newsFields(value: NewsFields) {
    this._newsFields = value;
    this.breadCrumbsService.pushBreadcrumb(this._newsFields.title, '', false);
  }
  public _newsFields!: NewsFields;

  private breadCrumbsService = inject(BreadCrumbsService);
  private router = inject(Router);
  public convertDate = convertDate;
  environment = environment

}
