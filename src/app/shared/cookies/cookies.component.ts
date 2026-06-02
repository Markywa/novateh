// cookie-consent.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cookie-banner" *ngIf="showBanner" [class.slide-up]="showBanner">
      <div class="cookie-content">
        <div class="cookie-text">
            <svg fill="#ffffff" width="64px" height="64px" viewBox="-8 -8 48.00 48.00" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0" transform="translate(0,0), scale(1)"><rect x="-8" y="-8" width="48.00" height="48.00" rx="24" fill="#F9A826" strokewidth="0"></rect></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M16 15.503A5.041 5.041 0 1 0 16 5.42a5.041 5.041 0 0 0 0 10.083zm0 2.215c-6.703 0-11 3.699-11 5.5v3.363h22v-3.363c0-2.178-4.068-5.5-11-5.5z"></path></g></svg>
          <div>
            <h3>Мы уважаем вашу конфиденциальность</h3>
            <p>Этот сайт использует файлы cookie для улучшения работы, аналитики и персонализации. Вы можете принять или отклонить использование cookie. Ваш выбор будет сохранен.</p>
          </div>
        </div>
        <div class="cookie-buttons">
          <button class="btn btn-outline" (click)="declineCookies()">Отклонить</button>
          <button class="btn btn-primary" (click)="acceptCookies()">Принять</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cookie-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(10px);
      background: linear-gradient(135deg, rgba(18, 25, 45, 0.98), rgba(28, 35, 55, 0.98));
      color: #fff;
      z-index: 1000;
      padding: 1rem 1.5rem;
      box-shadow: 0 -8px 25px rgba(0, 0, 0, 0.2);
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      transition: transform 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1);
      transform: translateY(100%);
    }

    .cookie-banner.slide-up {
      transform: translateY(0);
    }

    .cookie-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1.2rem;
    }

    .cookie-text {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      flex: 3;
      min-width: 240px;
    }

    .cookie-icon {
      width: 42px;
      height: 42px;
      flex-shrink: 0;
    }

    .cookie-text h3 {
      margin: 0 0 0.25rem 0;
      font-size: 1.1rem;
      font-weight: 600;
      letter-spacing: -0.2px;
      color: #FFE6B3;
    }

    .cookie-text p {
      margin: 0;
      font-size: 0.85rem;
      line-height: 1.4;
      opacity: 0.9;
    }

    .cookie-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.6rem 1.4rem;
      border-radius: 60px;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s ease;
      border: none;
      font-family: inherit;
    }

    .btn-primary {
      background: #f7b32b;
      color: #1a1f2c;
      box-shadow: 0 2px 6px rgba(247, 179, 43, 0.3);
    }

    .btn-primary:hover {
      background: #ffc857;
      transform: scale(1.02);
    }

    .btn-outline {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.5);
      color: #f0f0f0;
    }

    .btn-outline:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: #fff;
    }

    @media (max-width: 640px) {
      .cookie-content {
        flex-direction: column;
        align-items: stretch;
        text-align: left;
      }
      .cookie-text {
        margin-bottom: 0.25rem;
      }
      .cookie-buttons {
        justify-content: flex-end;
      }
      .btn {
        padding: 0.5rem 1.2rem;
      }
    }
  `]
})


export class CookieConsentComponent implements OnInit {
  showBanner = false;
  private readonly COOKIE_KEY = 'cookie_consent_status';

  ngOnInit(): void {
    // Проверяем, было ли уже принято/отклонено согласие
    const consent = localStorage.getItem(this.COOKIE_KEY);
    if (!consent) {
      // Если согласия нет — показываем баннер с небольшой задержкой (для плавности)
      setTimeout(() => {
        this.showBanner = true;
      }, 300);
    } else {
      // Согласие уже есть — баннер не показываем
      this.showBanner = false;
      // Можно также опционально применить логику в зависимости от значения 'accepted' или 'declined'
    }
  }

  acceptCookies(): void {
    localStorage.setItem(this.COOKIE_KEY, 'accepted');
    this.showBanner = false;
    // Здесь вы можете включить аналитику, загрузить сторонние скрипты и т.д.
    console.log('Cookies accepted. Можно загружать аналитику и другие куки.');
    // Дополнительно: событие для других сервисов
    this.dispatchConsentEvent(true);
  }

  declineCookies(): void {
    localStorage.setItem(this.COOKIE_KEY, 'declined');
    this.showBanner = false;
    // Отключаем всю необязательную аналитику, куки третьих лиц
    console.log('Cookies declined. Необязательные куки отключены.');
    this.dispatchConsentEvent(false);
  }

  private dispatchConsentEvent(accepted: boolean): void {
    // Глобальное событие, чтобы другие части приложения могли реагировать на согласие
    window.dispatchEvent(new CustomEvent('cookieConsent', { detail: { accepted } }));
  }
}