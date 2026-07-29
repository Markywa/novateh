import { Component, inject, HostListener, PLATFORM_ID, Inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { BreadCrumbsService } from './services/bread-crumbs/bread-crumbs.service';
import { CookieConsentComponent } from './shared/cookies/cookies.component';
import { isPlatformBrowser } from '@angular/common';

declare global {
  interface Window {
    ym?: (counterId: number, method: string, ...args: unknown[]) => void;
  }
}

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
  private lastTrackedUrl = this.getCurrentUrl();
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  
  isScrollVisible = false;
  private scrollThreshold = 0.3; 
  
  ngOnInit(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      if (!isPlatformBrowser(this.platformId)) return;
      window.scrollTo(0, 0);
      this.isScrollVisible = false; 

      if (event.urlAfterRedirects !== this.lastTrackedUrl) {
        window.ym?.(110137975, 'hit', event.urlAfterRedirects);
        this.lastTrackedUrl = event.urlAfterRedirects;
      }
    });
  }

  private getCurrentUrl(): string {
    if (!isPlatformBrowser(this.platformId)) return '';
    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
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
