import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PayoutSettlementComponent} from './payout-settlement.component';

describe('PayoutSettlementComponent', () => {
  let component: PayoutSettlementComponent;
  let fixture: ComponentFixture<PayoutSettlementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PayoutSettlementComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PayoutSettlementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
