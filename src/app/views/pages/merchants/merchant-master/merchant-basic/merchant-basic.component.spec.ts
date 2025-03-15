import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MerchantBasicComponent} from './merchant-basic.component';

describe('MerchantBasicComponent', () => {
  let component: MerchantBasicComponent;
  let fixture: ComponentFixture<MerchantBasicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MerchantBasicComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantBasicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
