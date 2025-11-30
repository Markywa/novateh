import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { BreadCrumbsService } from './services/bread-crumbs/bread-crumbs.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
  ],
  providers:[BreadCrumbsService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'novateh';
  private router = inject(Router);
  
  ngOnInit(): void {
    this.router.events.pipe(
        filter(event => event instanceof NavigationEnd) 
    ).subscribe(() => {
        window.scrollTo(0, 0);
    });
  }
}
