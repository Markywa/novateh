import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA, PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { EMPTY, of, Subject } from 'rxjs';
import { AgentsService } from '../../services/agents/agents.service';
import { AnalyticsService } from '../../services/analytics/analytics.service';
import { BreadCrumbsService } from '../../services/bread-crumbs/bread-crumbs.service';
import { CartService } from '../../services/cart-service/cart.service';
import { SafeHtmlPipe } from '../../services/pipes/safe-html/safe-html.pipe';
import { ProductsService, TProductCardDetails } from '../../services/products-service/products.service';
import { SeoService } from '../../services/seo/seo.service';
import { DetailsPageComponent } from './details-page.component';

for (const platform of ['browser', 'server']) {
describe(`Product content rendering (${platform})`, () => {
  let fixture: ComponentFixture<DetailsPageComponent>;
  let params: Subject<ParamMap>;
  let getProduct: jasmine.Spy;

  beforeEach(async () => {
    params = new Subject<ParamMap>();
    getProduct = jasmine.createSpy('getProduct');
    await TestBed.configureTestingModule({
      imports: [DetailsPageComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: platform },
        { provide: ActivatedRoute, useValue: { paramMap: params } },
        { provide: ProductsService, useValue: { getProductDetails$: getProduct } },
        { provide: MatDialog, useValue: {} },
        { provide: CartService, useValue: { itemIsAdded$: () => of(false) } },
        { provide: SeoService, useValue: { product: () => {} } },
        { provide: BreadCrumbsService, useValue: { pushBreadcrumb: () => {} } },
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

  function renderTable(html: string, assortment = false): HTMLElement {
    fixture.detectChanges();
    getProduct.and.returnValue(of({
      ...fixture.componentInstance.productEntity,
      characteristics_html: assortment ? '' : html,
      assortment_html: assortment ? html : '',
    }));
    params.next(convertToParamMap({ id: 'test-product' }));
    if (assortment) fixture.componentInstance.switchView('view2');
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('.catalog-rich-text');
  }

  for (const assortment of [false, true]) {
    it(`keeps editor column widths and merged cells in ${assortment ? 'assortment' : 'characteristics'}`, () => {
      const element = renderTable('<table><caption>Sizes</caption><colgroup><col style="width: 41%;"><col span="2" style="width: 29.5%;"></colgroup><tbody><tr style="height: 24px;"><td rowspan="2" style="background-color: #fffcda;">Size</td><td colspan="2">100</td></tr><tr><td>200</td><td>300</td></tr></tbody><tfoot><tr><td colspan="3">Total</td></tr></tfoot></table>', assortment);
      expect(element.querySelectorAll('colgroup > col').length).toBe(2);
      expect((element.querySelector('col') as HTMLElement).style.width).toBe('41%');
      expect(element.querySelectorAll('col')[1].getAttribute('span')).toBe('2');
      expect(element.querySelector('td[colspan="2"]')!.textContent).toBe('100');
      expect(element.querySelector('td[rowspan="2"]')).not.toBeNull();
      expect((element.querySelector('tr') as HTMLElement).style.height).toBe('24px');
      expect(element.querySelector('caption')!.textContent).toBe('Sizes');
      expect(element.querySelector('tfoot')).not.toBeNull();
    });
  }

  it('preserves spaces around formatting and blank paragraphs that set row height', () => {
    const element = renderTable('<table><tbody><tr><td><p>First <strong>bold</strong> last</p><p>&nbsp;</p></td></tr></tbody></table>');
    expect(element.querySelector('p')!.textContent).toBe('First bold last');
    expect(element.querySelectorAll('p')[1].textContent).toBe('\u00a0');
  });

  it('removes scripts, event handlers, duplicate microdata and executable URLs from tables', () => {
    const element = renderTable('<table itemscope itemtype="https://schema.org/Product"><tbody><tr><td onclick="alert(1)"><script>alert(1)</script><a href="javascript:alert(1)">Link</a></td></tr></tbody></table>');
    expect(element.querySelector('script, [onclick], [itemscope], [itemtype]')).toBeNull();
    expect(element.textContent).not.toContain('alert(1)');
    expect(element.querySelector('a')!.getAttribute('href')).not.toBe('javascript:alert(1)');
  });
});
}
