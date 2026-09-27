import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { EMPTY } from 'rxjs';
import { AgentsService } from '../../services/agents/agents.service';
import { AnalyticsService } from '../../services/analytics/analytics.service';
import { BreadCrumbsService } from '../../services/bread-crumbs/bread-crumbs.service';
import { CartService } from '../../services/cart-service/cart.service';
import { SafeHtmlPipe } from '../../services/pipes/safe-html/safe-html.pipe';
import { ProductsService, TProductCardDetails } from '../../services/products-service/products.service';
import { SeoService } from '../../services/seo/seo.service';
import { DetailsPageComponent } from './details-page.component';

describe('Product description rendering', () => {
  let fixture: ComponentFixture<DetailsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsPageComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: EMPTY } },
        { provide: ProductsService, useValue: {} },
        { provide: MatDialog, useValue: {} },
        { provide: CartService, useValue: {} },
        { provide: SeoService, useValue: {} },
        { provide: BreadCrumbsService, useValue: {} },
        { provide: AgentsService, useValue: { getAgentsList$: () => EMPTY } },
        { provide: AnalyticsService, useValue: {} },
      ],
    }).overrideComponent(DetailsPageComponent, {
      // Exercise the actual product template without unrelated child services.
      set: { imports: [CommonModule, SafeHtmlPipe], schemas: [NO_ERRORS_SCHEMA] },
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsPageComponent);
    fixture.componentInstance.productEntity = {
      id: 1, name: 'Product', description: '', seo: {}, price: '0',
      attributes: [], certificates_list: [],
    } as unknown as TProductCardDetails;
  });

  function render(description: string): HTMLElement {
    fixture.componentInstance.productEntity = {
      ...fixture.componentInstance.productEntity, description,
    };
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('.container-content__desc');
  }

  it('renders editor paragraphs, emphasis, lists and line breaks as markup', () => {
    const element = render('<p>First <strong>bold</strong></p><p>Second<br>line</p><ul><li>Item</li></ul>');
    expect(element.querySelectorAll('p').length).toBe(2);
    expect(element.querySelector('strong')!.textContent).toBe('bold');
    expect(element.querySelector('li')!.textContent).toBe('Item');
    expect(element.querySelector('br')).not.toBeNull();
    expect(element.textContent).not.toContain('<p>');
  });

  it('preserves plain text and decodes entities only once', () => {
    expect(render('Density 60 kg/m3, 2 < 3 & 5 > 4').textContent).toBe('Density 60 kg/m3, 2 < 3 & 5 > 4');
    const element = render('<p>A &amp; B &lt;script&gt;literal&lt;/script&gt;</p>');
    expect(element.textContent).toBe('A & B <script>literal</script>');
    expect(element.querySelector('script')).toBeNull();
  });

  it('strips executable markup instead of bypassing Angular sanitization', () => {
    const element = render('<p onclick="alert(1)">Safe</p><script>alert(1)</script><img onerror="alert(1)"><iframe srcdoc="<script>alert(1)</script>"></iframe><a href="javascript:alert(1)">Link</a>');
    expect(element.querySelector('script, iframe, [onclick], [onerror], [srcdoc]')).toBeNull();
    expect(element.querySelector('a')!.getAttribute('href')).not.toBe('javascript:alert(1)');
    expect(element.querySelector('p')!.textContent).toBe('Safe');
  });

  it('updates the description when switching products and handles an empty value', () => {
    render('<p>Previous product</p>');
    expect(render('<p>Next product</p>').textContent).toBe('Next product');
    expect(render('').textContent).toBe('');
  });
});
