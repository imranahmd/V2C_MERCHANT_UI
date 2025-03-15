import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MerchantBankLiveComponent} from './merchant-bank-live.component';

describe('MerchantBankLiveComponent', () => {
  let component: MerchantBankLiveComponent;
  let fixture: ComponentFixture<MerchantBankLiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MerchantBankLiveComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantBankLiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
