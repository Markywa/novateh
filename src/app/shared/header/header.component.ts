import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterLinkActive } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { RouterLink } from '@angular/router';

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

  isMenuOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent): void {
    this.closeMenu();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    if (event.target.innerWidth > 700 && this.isMenuOpen) {
      this.closeMenu();
    }
  }
}
