import {ComponentFixture, TestBed} from '@angular/core/testing';

import {YesBankPayoutComponent} from './yes-bank-payout.component';

describe('YesBankPayoutComponent', () => {
  let component: YesBankPayoutComponent;
  let fixture: ComponentFixture<YesBankPayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [YesBankPayoutComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(YesBankPayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
