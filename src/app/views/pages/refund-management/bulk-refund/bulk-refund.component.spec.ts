import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BulkRefundComponent} from './bulk-refund.component';

describe('BulkRefundComponent', () => {
  let component: BulkRefundComponent;
  let fixture: ComponentFixture<BulkRefundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BulkRefundComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkRefundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
