import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MerchantRiskConfigComponent} from './merchant-risk-config.component';

describe('MerchantRiskConfigComponent', () => {
  let component: MerchantRiskConfigComponent;
  let fixture: ComponentFixture<MerchantRiskConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MerchantRiskConfigComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantRiskConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
