import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProducerLineComponent } from './producer-line.component';

describe('ProducerLineComponent', () => {
  let component: ProducerLineComponent;
  let fixture: ComponentFixture<ProducerLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProducerLineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProducerLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
