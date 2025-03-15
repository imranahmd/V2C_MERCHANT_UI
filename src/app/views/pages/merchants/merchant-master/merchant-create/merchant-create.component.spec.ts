import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MerchantCreateComponent} from './merchant-create.component';

describe('MerchantCreateComponent', () => {
  let component: MerchantCreateComponent;
  let fixture: ComponentFixture<MerchantCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MerchantCreateComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
