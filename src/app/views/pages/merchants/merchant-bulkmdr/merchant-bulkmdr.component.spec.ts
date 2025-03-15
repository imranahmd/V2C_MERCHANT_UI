import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MerchantBulkmdrComponent} from './merchant-bulkmdr.component';

describe('MerchantBulkmdrComponent', () => {
  let component: MerchantBulkmdrComponent;
  let fixture: ComponentFixture<MerchantBulkmdrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MerchantBulkmdrComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantBulkmdrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
