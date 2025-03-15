import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MerchantstatusComponent} from './merchantstatus.component';

describe('MerchantstatusComponent', () => {
  let component: MerchantstatusComponent;
  let fixture: ComponentFixture<MerchantstatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MerchantstatusComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantstatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
