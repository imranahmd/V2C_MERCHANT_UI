import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BulkUploadInvoiceComponent} from './bulk-upload-invoice.component';

describe('BulkUploadInvoiceComponent', () => {
  let component: BulkUploadInvoiceComponent;
  let fixture: ComponentFixture<BulkUploadInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BulkUploadInvoiceComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkUploadInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
