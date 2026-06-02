import { Component, inject, HostListener } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { BreadCrumbsService } from './services/bread-crumbs/bread-crumbs.service';
import { CookieConsentComponent } from './shared/cookies/cookies.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CookieConsentComponent
  ],
  providers: [BreadCrumbsService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'novateh';
  private router = inject(Router);
  
  isScrollVisible = false;
  private scrollThreshold = 0.3; 
  
  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo(0, 0);
      this.isScrollVisible = false; 
    });
  }
  
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    
    const totalScrollable = scrollHeight - clientHeight;
    
    const scrollPercent = scrollTop / totalScrollable;
    
    this.isScrollVisible = scrollPercent > this.scrollThreshold;
  }
  
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}