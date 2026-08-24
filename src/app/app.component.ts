import { Component, inject, HostListener, PLATFORM_ID, Inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { BreadCrumbsService } from './services/bread-crumbs/bread-crumbs.service';
import { CookieConsentComponent } from './shared/cookies/cookies.component';
import { isPlatformBrowser } from '@angular/common';
import { AnalyticsService } from './services/analytics/analytics.service';

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
export class AppComponent implements OnInit {
  title = 'novateh';
  private router = inject(Router);
  private analytics = inject(AnalyticsService);
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  
  isScrollVisible = false;
  private scrollThreshold = 0.3; 
  
  ngOnInit(): void {
    this.analytics.initializeFromStoredConsent();
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      if (!isPlatformBrowser(this.platformId)) return;
      window.scrollTo(0, 0);
      this.isScrollVisible = false; 

      this.analytics.trackPageView(event.urlAfterRedirects);
    });
  }
  
  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (!isPlatformBrowser(this.platformId)) return;

    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    
    const totalScrollable = scrollHeight - clientHeight;
    
    const scrollPercent = scrollTop / totalScrollable;
    
    this.isScrollVisible = scrollPercent > this.scrollThreshold;
  }
  
  scrollToTop(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
