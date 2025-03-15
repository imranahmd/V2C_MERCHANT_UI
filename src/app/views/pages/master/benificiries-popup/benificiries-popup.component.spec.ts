import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BenificiriesPopupComponent } from './benificiries-popup.component';

describe('BenificiriesPopupComponent', () => {
  let component: BenificiriesPopupComponent;
  let fixture: ComponentFixture<BenificiriesPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BenificiriesPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BenificiriesPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
