import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProducerProductsComponent } from './producer-products.component';

describe('ProducerProductsComponent', () => {
  let component: ProducerProductsComponent;
  let fixture: ComponentFixture<ProducerProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProducerProductsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProducerProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
