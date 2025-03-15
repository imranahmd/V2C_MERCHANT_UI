import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MerchantBulkuploadComponent} from './merchant-bulkupload.component';

describe('MerchantBulkuploadComponent', () => {
  let component: MerchantBulkuploadComponent;
  let fixture: ComponentFixture<MerchantBulkuploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MerchantBulkuploadComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantBulkuploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
