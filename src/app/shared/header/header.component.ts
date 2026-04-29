import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLinkActive } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { RouterLink } from '@angular/router';
import { QuestionModalComponent } from '../question-modal/question-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { catchError, debounceTime, distinctUntilChanged, filter, finalize, first, fromEvent, map, Observable, of, retry, shareReplay, startWith, Subject, switchMap, takeUntil, tap, throttleTime, timeout } from 'rxjs';
import { CartService } from '../../services/cart-service/cart.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLinkActive,
    AngularSvgIconModule,
    RouterLink,
    ReactiveFormsModule,
    FormsModule
],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private router = inject(Router);
  public cartService = inject(CartService); 
  private http = inject(HttpClient)
  environment = environment;

  public linkArr: {name: string, link: string}[] = [
    {
      name: 'О КОМПАНИИ',
      link: '/main/about'
    },
    {
      name: 'СЕРТИФИКАТЫ',
      link: '/main/certificates'
    },
    {
      name: 'НОВОСТИ',
      link: '/main/news'
    },
    {
      name: 'КОНТАКТЫ',
      link: '/main/contacts'
    },
  ]

  isMobile$ = fromEvent(window, 'resize').pipe(
    throttleTime(100), 
    map(() => window.innerWidth < 680),
    startWith(this.checkIsMobile()) 
  );

  isMobile = false;

  private checkIsMobile(): boolean {
    return window.innerWidth < 680;
  }

  public mobileArr: {name: string, link: string}[] = [
    {
      name: 'ГЛАВНАЯ',
      link: '/main/welcome'
    },
    {
      name: 'КАТАЛОГ',
      link: '/main/catalog'
    },
    {
      name: 'О КОМПАНИИ',
      link: '/main/about'
    },
    {
      name: 'СЕРТИФИКАТЫ',
      link: '/main/certificates'
    },
    {
      name: 'НОВОСТИ',
      link: '/main/news'
    },
    {
      name: 'КОНТАКТЫ',
      link: '/main/contacts'
    },
  ]

  private dialog = inject(MatDialog);
  isMenuOpen = false;

  public isActiveCart$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    startWith(false),
    map(() => this.getCurrentRoutePath())
  );

  private getCurrentRoutePath(): boolean {
    let route = this.router.routerState.root.firstChild;
    while (route?.firstChild) {
      route = route.firstChild;
    }
    
    return route!.snapshot.url[0]?.path.includes('shopping-cart');
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    document.body.style.overflow = '';
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    if (!this.isMenuOpen) return;
    
    const target = event.target as HTMLElement;
    const sidebar = document.querySelector('.mobile-menu__content');
    const menuButton = document.querySelector('.menu-btn'); 
    
    if (sidebar && !sidebar.contains(target) && 
        (!menuButton || !menuButton.contains(target))) {
      this.closeMenu();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (event.target.innerWidth > 700 && this.isMenuOpen) {
      this.closeMenu();
    }
  }

  sendQuestionModal(): void {
    const dialogus = this.dialog.open(QuestionModalComponent, {
      height: '445px',
      width: '550px',
    })

    dialogus.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
  searchControl = new FormControl('');
  searchResults$: Observable<any>;
  showDropdown = false;
  isLoading = false;
  
  private destroy$ = new Subject<void>();
  
  constructor(private elementRef: ElementRef) {
    this.searchResults$ = this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      tap(() => this.isLoading = true),
      tap(() => this.showDropdown = true),
      switchMap(query => {
        if (!query || query.trim().length < 2) {
          return of(null);
        }
        return this.http.get<any>(`${environment.baseUrl}/v1/search?q=${encodeURIComponent(query)}`).pipe(
          catchError(error => {
            console.error('Search error:', error);
            return of(null);
          })
        );
      }),
      tap(() => this.isLoading = false),
      takeUntil(this.destroy$)
    );
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  clearSearch(): void {
    this.searchControl.setValue('');
    this.showDropdown = false;
  }
  
  closeDropdown(): void {
    this.showDropdown = false;
  }
  
  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/no-image.png';
  }
  
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showDropdown = false;
    }
  }

  onEnterPressed(): void {
    this.router.navigate(['/main/catalog'], { 
      queryParams: { query: this.searchControl.value } 
    });
    this.clearSearch();
  }
}
