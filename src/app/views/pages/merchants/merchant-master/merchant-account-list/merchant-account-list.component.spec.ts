import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MerchantAccountListComponent} from './merchant-account-list.component';

describe('MerchantAccountListComponent', () => {
  let component: MerchantAccountListComponent;
  let fixture: ComponentFixture<MerchantAccountListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MerchantAccountListComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantAccountListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
