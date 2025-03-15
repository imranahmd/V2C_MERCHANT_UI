import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MerchantMDRComponent} from './merchant-mdr.component';

describe('MerchantMDRComponent', () => {
  let component: MerchantMDRComponent;
  let fixture: ComponentFixture<MerchantMDRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MerchantMDRComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantMDRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
