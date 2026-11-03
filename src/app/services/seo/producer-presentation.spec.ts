import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ProducerComponent } from '../../shared/producer/producer.component';
import { ProducerLineComponent } from '../../components/producer-line/producer-line.component';

describe('Producer presentation isolation', () => {
  const brand = { id: 1, name: 'K-FLEX', slug: 'k-flex', media: '/static/logo.png' };

  beforeEach(() => TestBed.configureTestingModule({
    imports: [ProducerComponent, ProducerLineComponent], providers: [provideRouter([])],
  }));

  it('keeps logos as the default with accessible brand navigation', () => {
    const fixture = TestBed.createComponent(ProducerComponent);
    fixture.componentRef.setInput('producerItem', brand);
    fixture.detectChanges();
    const image = fixture.nativeElement.querySelector('img');
    expect(image.getAttribute('src')).toBe(brand.media);
    expect(image.getAttribute('alt')).toBe(brand.name);
    expect(fixture.nativeElement.querySelector('a').getAttribute('href')).toBe('/brand/k-flex');
    expect(fixture.nativeElement.querySelector('a').getAttribute('aria-label')).toBe(brand.name);
  });

  it('renders text only when explicitly requested', () => {
    const fixture = TestBed.createComponent(ProducerComponent);
    fixture.componentRef.setInput('producerItem', brand);
    fixture.componentRef.setInput('appearance', 'text');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.textContent.trim()).toBe(brand.name);
  });

  it('shows a usable name when a logo is missing or unsafe', () => {
    const fixture = TestBed.createComponent(ProducerComponent);
    for (const media of ['', '   ', 'javascript:alert(1)', '//untrusted.example/logo.svg']) {
      fixture.componentRef.setInput('producerItem', { ...brand, media });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('img')).toBeNull();
      expect(fixture.nativeElement.textContent.trim()).toBe(brand.name);
    }
  });

  it('preserves absolute media URLs without prepending the site origin', () => {
    const fixture = TestBed.createComponent(ProducerComponent);
    fixture.componentRef.setInput('producerItem', { ...brand, media: 'https://cdn.example/logo.png' });
    expect(fixture.componentInstance.logoUrl).toBe('https://cdn.example/logo.png');
  });

  it('falls back after an image error and retries when its URL changes', () => {
    const fixture = TestBed.createComponent(ProducerComponent);
    fixture.componentRef.setInput('producerItem', brand);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('img').dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.textContent.trim()).toBe(brand.name);
    fixture.componentRef.setInput('producerItem', { ...brand, media: '/static/replaced.png' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img').getAttribute('src')).toBe('/static/replaced.png');
  });

  it('keeps home and catalog presentations independent and tracks brands by ID', () => {
    const home = TestBed.createComponent(ProducerLineComponent);
    const catalog = TestBed.createComponent(ProducerLineComponent);
    const second = { ...brand, id: 2, name: 'Second', slug: 'second' };
    home.componentRef.setInput('producerList', [brand, second]);
    catalog.componentRef.setInput('producerList', [brand, second]);
    catalog.componentRef.setInput('appearance', 'text');
    home.detectChanges(); catalog.detectChanges();
    expect(home.nativeElement.querySelectorAll('img').length).toBe(2);
    expect(catalog.nativeElement.querySelectorAll('img').length).toBe(0);
    const first = home.nativeElement.querySelector('app-producer');
    home.componentRef.setInput('producerList', [second, brand]);
    home.detectChanges();
    expect(home.nativeElement.querySelectorAll('app-producer')[1]).toBe(first);
    expect(catalog.nativeElement.querySelectorAll('img').length).toBe(0);
  });
});
