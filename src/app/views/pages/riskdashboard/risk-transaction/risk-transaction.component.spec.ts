import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RiskTransactionComponent} from './risk-transaction.component';

describe('RiskTransactionComponent', () => {
  let component: RiskTransactionComponent;
  let fixture: ComponentFixture<RiskTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RiskTransactionComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
