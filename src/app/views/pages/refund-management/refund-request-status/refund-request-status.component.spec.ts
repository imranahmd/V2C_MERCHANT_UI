import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefundRequestStatusComponent } from './refund-request-status.component';

describe('RefundRequestStatusComponent', () => {
  let component: RefundRequestStatusComponent;
  let fixture: ComponentFixture<RefundRequestStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RefundRequestStatusComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RefundRequestStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
