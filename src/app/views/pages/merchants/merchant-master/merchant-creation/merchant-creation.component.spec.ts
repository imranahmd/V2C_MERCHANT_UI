import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MerchantCreationComponent} from './merchant-creation.component';

describe('MerchantCreationComponent', () => {
  let component: MerchantCreationComponent;
  let fixture: ComponentFixture<MerchantCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MerchantCreationComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MerchantCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
