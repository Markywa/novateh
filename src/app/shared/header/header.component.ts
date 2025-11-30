import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLinkActive } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { RouterLink } from '@angular/router';
import { QuestionModalComponent } from '../question-modal/question-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { filter, first, fromEvent, map, Observable, startWith, throttleTime } from 'rxjs';
import { CartService } from '../../services/cart-service/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLinkActive,
    AngularSvgIconModule,
    RouterLink
],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private router = inject(Router);
  public cartService = inject(CartService); 

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
}
