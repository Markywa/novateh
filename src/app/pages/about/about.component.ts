import { Component } from '@angular/core';
import { LayoutPageComponent } from '../layout-page/layout-page.component';
import { RouterOutlet } from '@angular/router';
import { BreadCrumbsComponent } from '../../shared/bread-crumbs/bread-crumbs.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    LayoutPageComponent,
    BreadCrumbsComponent
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {

}
