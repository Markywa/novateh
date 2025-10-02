import { Component } from '@angular/core';
import { LayoutPageComponent } from '../layout-page/layout-page.component';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [
    LayoutPageComponent
  ],
  templateUrl: './news.component.html',
  styleUrl: './news.component.scss'
})
export class NewsComponent {

}
