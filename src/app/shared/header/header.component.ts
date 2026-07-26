import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, inject, PLATFORM_ID } from '@angular/core';
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
import { ContactsService } from '../../services/contacts/contacts.service';
import { NavigationService } from '../../services/navigation/navigation.service';

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
  private navigationService = inject(NavigationService);
  private http = inject(HttpClient)
  environment = environment;
  private contactsSerbice = inject(ContactsService);

  public contactPhone$ = this.contactsSerbice.getContacts$().pipe(map((contacts: any) => contacts.phone))

  private lastScrollTop = 0;
    isHeaderVisible = true;
    isHeaderHidden = false;   

    @HostListener('window:scroll', [])
    onWindowScroll() {
        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        if (currentScroll > this.lastScrollTop && currentScroll > 10) {
            this.isHeaderVisible = false;
            this.isHeaderHidden = true;
        } 
        else if (currentScroll < this.lastScrollTop) {
            this.isHeaderVisible = true;
            this.isHeaderHidden = false;
        }
        
        this.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }

      private lastScrollY = 0;
    private lastTouchY = 0;
    
    @HostListener('touchstart', ['$event'])
    onTouchStart(event: TouchEvent) {
        this.lastTouchY = event.touches[0].clientY;
        this.lastScrollY = window.scrollY;
    }
    
    @HostListener('touchmove', ['$event'])
    onTouchMove(event: TouchEvent) {
        const currentTouchY = event.touches[0].clientY;
        const currentScrollY = window.scrollY;
        const deltaY = currentTouchY - this.lastTouchY;
        const scrollDelta = currentScrollY - this.lastScrollY;
        
        if (deltaY < -10 && scrollDelta > 10) {
            this.isHeaderHidden = true;
        } else if (deltaY > 10 && scrollDelta < -10) {
            this.isHeaderHidden = false;
        }
        
        this.lastTouchY = currentTouchY;
        this.lastScrollY = currentScrollY;
    }


  public linkArr: {name: string, link: string}[] = [
    {
      name: 'О КОМПАНИИ',
      link: '/about'
    },
    {
      name: 'СЕРТИФИКАТЫ',
      link: '/certificates'
    },
    {
      name: 'НОВОСТИ',
      link: '/news'
    },
    {
      name: 'КОНТАКТЫ',
      link: '/contacts'
    },
  ]

  private createMobileObservable(): Observable<boolean> {
      // Проверка на сервер
      if (!isPlatformBrowser(this.platformId)) {
        return of(false); // Возвращаем false на сервере
      }

      // На клиенте создаем полноценный Observable
      return fromEvent(window, 'resize').pipe(
        throttleTime(100),
        map(() => window.innerWidth < 680),
        startWith(this.checkIsMobile()),
        shareReplay(1) // Кешируем последнее значение
      );
    }

  isMobile = false;

  private checkIsMobile(): boolean {
    return window.innerWidth < 680;
  }

  public mobileArr: {name: string, link: string}[] = [
    {
      name: 'ГЛАВНАЯ',
      link: '/welcome'
    },
    {
      name: 'КАТАЛОГ',
      link: '/catalog'
    },
    {
      name: 'О КОМПАНИИ',
      link: '/about'
    },
    {
      name: 'СЕРТИФИКАТЫ',
      link: '/certificates'
    },
    {
      name: 'НОВОСТИ',
      link: '/news'
    },
    {
      name: 'КОНТАКТЫ',
      link: '/contacts'
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
    this.isHeaderVisible = false;
    this.isHeaderHidden = false;
    setTimeout(() => {
      this.isMenuOpen = !this.isMenuOpen;
      document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
    }, 0)
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

   handleCartNavigation() {
    const currentUrl = this.router.url;
    const isInCart = currentUrl.includes('shopping-cart');
    console.log('Current URL:', currentUrl);
    
    if (isInCart) {
      const previousUrl = this.navigationService.getPreviousUrl();
      console.log(previousUrl);
      
      if (previousUrl && previousUrl !== '/shopping-cart') {
        this.router.navigate([previousUrl]);
        this.navigationService.clearPreviousUrl();
      } else {
        this.router.navigate(['/']);
      }
    } else {
      this.navigationService.clearPreviousUrl();
      this.router.navigate(['shopping-cart']);
    }
  }

  sendQuestionModal(mobile?: boolean): void {
    const dialogus = this.dialog.open(QuestionModalComponent, {
      height: mobile ? 'auto' : '540px',
      width: mobile ? 'auto' : '550px',
    })

    dialogus.afterClosed().subscribe(result => {
    });
  }
  searchControl = new FormControl('');
  searchResults$: Observable<any>;
  showDropdown = false;
  isLoading = false;
  
  private destroy$ = new Subject<void>();
  public isMobile$;
  
  constructor(private elementRef: ElementRef, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isMobile$ = this.createMobileObservable();

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
    this.router.navigate(['/catalog'], { 
      queryParams: { query: this.searchControl.value } 
    });
    this.clearSearch();
  }
}
