import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupLineComponent } from './group-line.component';

describe('GroupLineComponent', () => {
  let component: GroupLineComponent;
  let fixture: ComponentFixture<GroupLineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupLineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GroupLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
