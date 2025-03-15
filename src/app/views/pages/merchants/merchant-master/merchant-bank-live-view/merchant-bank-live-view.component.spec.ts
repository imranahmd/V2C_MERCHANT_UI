import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MerchantBankLiveViewComponent} from './merchant-bank-live-view.component';

describe('MerchantBankLiveViewComponent', () => {
  let component: MerchantBankLiveViewComponent;
  let fixture: ComponentFixture<MerchantBankLiveViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MerchantBankLiveViewComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantBankLiveViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
