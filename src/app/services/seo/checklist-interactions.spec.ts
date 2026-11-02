import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID, NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CarouselComponent } from '../../components/carousel/carousel.component';
import { AnalyticsService } from '../analytics/analytics.service';
import { SafeHtmlPipe } from '../pipes/safe-html/safe-html.pipe';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SliderComponent } from '../../components/news-section/slider/slider.component';

describe('Checklist SSR hydration timers', () => {
  it('does not keep Angular unstable while the product carousel autoplays', () => {
    const zone = new NgZone({ enableLongStackTrace: false });
    const carousel = new CarouselComponent('browser', zone);
    carousel.items = [{ id: 1, image: '/one.png' }, { id: 2, image: '/two.png' }];
    try {
      zone.run(() => carousel.ngOnChanges());
      expect(zone.hasPendingMacrotasks).toBeFalse();
      zone.run(() => carousel.next());
      expect(zone.hasPendingMacrotasks).toBeFalse();
    } finally { carousel.ngOnDestroy(); }
  });

  it('does not keep Angular unstable while the home banner autoplays', () => {
    TestBed.configureTestingModule({ providers: [{ provide: Router, useValue: {} }] });
    const zone = TestBed.inject(NgZone);
    const slider = TestBed.runInInjectionContext(() => new SliderComponent('browser'));
    slider.autoPlay = true;
    slider.slides = [
      { imageSrc: '/one.png', title: 'One', description: '' },
      { imageSrc: '/two.png', title: 'Two', description: '' },
    ];
    try {
      slider.ngOnInit();
      zone.run(() => slider.ngAfterViewInit());
      expect(zone.hasPendingMacrotasks).toBeFalse();
      zone.run(() => slider.nextSlide());
      expect(zone.hasPendingMacrotasks).toBeFalse();
    } finally { slider.ngOnDestroy(); }
  });
});

describe('Checklist carousel', () => {
  let carousel: CarouselComponent;
  const element = { setPointerCapture: () => {}, closest: () => null };
  const pointer = (x: number, y = 10) => ({ clientX: x, clientY: y, isPrimary: true, button: 0, pointerId: 1, currentTarget: element, target: element } as unknown as PointerEvent);
  beforeEach(() => {
    carousel = new CarouselComponent('browser', new NgZone({ enableLongStackTrace: false }));
    carousel.autoPlay = false;
    carousel.items = [{ id: 1, image: '/one.png' }, { id: 2, image: '/two.png' }];
  });
  afterEach(() => carousel.ngOnDestroy());
  it('drags left and right without opening the zoom viewer', () => {
    const open = spyOn(carousel.imageOpen, 'emit');
    carousel.onPointerDown(pointer(200)); carousel.onPointerMove(pointer(100)); carousel.onPointerUp(pointer(100));
    expect(carousel.currentIndex).toBe(1);
    carousel.open(1, { detail: 1 } as MouseEvent);
    expect(open).not.toHaveBeenCalled();
    carousel.onPointerDown(pointer(100)); carousel.onPointerUp(pointer(200));
    expect(carousel.currentIndex).toBe(0);
  });
  it('opens by click or keyboard, but not after vertical scrolling', () => {
    const open = spyOn(carousel.imageOpen, 'emit');
    carousel.onPointerDown(pointer(100)); carousel.onPointerUp(pointer(100));
    carousel.open(0, { detail: 1 } as MouseEvent);
    expect(open).toHaveBeenCalledWith(0);
    open.calls.reset();
    carousel.onPointerDown(pointer(100)); carousel.onPointerUp(pointer(100, 200));
    carousel.open(0, { detail: 1 } as MouseEvent);
    expect(open).not.toHaveBeenCalled();
    carousel.open(1, { detail: 0 } as MouseEvent);
    expect(open).toHaveBeenCalledWith(1);
  });
  it('handles cancellation, empty lists and product changes', () => {
    carousel.onPointerDown(pointer(100)); carousel.onPointerMove(pointer(20)); carousel.cancelPointer();
    expect(carousel.dragOffset).toBe(0);
    expect(carousel.currentIndex).toBe(0);
    carousel.items = []; carousel.next(); carousel.prev();
    expect(carousel.currentIndex).toBe(0);
  });
});

describe('Checklist consent and analytics', () => {
  let service: AnalyticsService;
  let doc: Document;
  let consent: string | null;
  let ym: jasmine.Spy;
  let originalYm: typeof window.ym;
  let originalLayer: typeof window.dataLayer;
  beforeEach(() => {
    consent = null;
    originalYm = window.ym; originalLayer = window.dataLayer;
    ym = jasmine.createSpy('ym'); window.ym = ym;
    spyOn(Storage.prototype, 'getItem').and.callFake(() => consent);
    spyOn(Storage.prototype, 'setItem').and.callFake((_key, value) => { consent = value; });
    doc = document.implementation.createHTMLDocument('Test');
    TestBed.configureTestingModule({ providers: [{ provide: DOCUMENT, useValue: doc }, { provide: PLATFORM_ID, useValue: 'browser' }] });
    service = TestBed.inject(AnalyticsService);
  });
  afterEach(() => { window.ym = originalYm; window.dataLayer = originalLayer; });
  it('does not load analytics or send goals before consent or after refusal', () => {
    service.initializeFromStoredConsent(); service.reachGoal('ym-add-to-cart'); service.declineCookies();
    expect(doc.querySelector('script')).toBeNull(); expect(ym).not.toHaveBeenCalled();
    expect(consent).toBe('declined');
  });
  it('initializes once, tracks routes/goals, then stops on refusal', () => {
    service.acceptCookies(); service.acceptCookies();
    expect(doc.querySelectorAll('#yandex-metrika-script').length).toBe(1);
    expect(ym.calls.allArgs().filter(args => args[1] === 'init').length).toBe(1);
    service.trackPageView('/catalog'); service.trackPageView('/catalog');
    expect(ym.calls.allArgs().filter(args => args[1] === 'hit').length).toBe(2);
    service.reachGoal('ym-submit-leadform');
    expect(ym).toHaveBeenCalledWith(110137975, 'reachGoal', 'ym-submit-leadform', undefined);
    service.declineCookies(); ym.calls.reset(); service.trackPageView('/contacts'); service.reachGoal('ym-add-to-cart');
    expect(ym).not.toHaveBeenCalled();
  });
  it('does not crash when browser privacy settings block storage', () => {
    (Storage.prototype.getItem as jasmine.Spy).and.throwError('denied');
    (Storage.prototype.setItem as jasmine.Spy).and.throwError('denied');
    expect(() => service.acceptCookies()).not.toThrow();
    expect(service.getStoredConsent()).toBe('accepted');
    service.declineCookies(); expect(service.getStoredConsent()).toBe('declined');
  });
  it('removes active content from raw HTML without fetching editor images during parsing', () => {
    const pipe = new SafeHtmlPipe(TestBed.inject(DomSanitizer), doc);
    const sanitized = TestBed.inject(DomSanitizer).sanitize(1, pipe.transform('<img src="/image.png" onerror="alert(1)" style="width:120px"><script>bad()</script>', true))!;
    expect(sanitized).not.toContain('<img'); expect(sanitized).not.toContain('bad()');
  });
});
