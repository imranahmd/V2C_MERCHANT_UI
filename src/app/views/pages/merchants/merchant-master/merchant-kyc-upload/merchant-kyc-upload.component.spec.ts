import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MerchantKycUploadComponent} from './merchant-kyc-upload.component';

describe('MerchantKycUploadComponent', () => {
  let component: MerchantKycUploadComponent;
  let fixture: ComponentFixture<MerchantKycUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MerchantKycUploadComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantKycUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
