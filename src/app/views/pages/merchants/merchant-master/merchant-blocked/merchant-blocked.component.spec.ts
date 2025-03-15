import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MerchantBlockedComponent} from './merchant-blocked.component';

describe('MerchantBlockedComponent', () => {
  let component: MerchantBlockedComponent;
  let fixture: ComponentFixture<MerchantBlockedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MerchantBlockedComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantBlockedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
