import {ComponentFixture, TestBed} from '@angular/core/testing';

import {HDFCPayoutComponent} from './hdfcpayout.component';

describe('HDFCPayoutComponent', () => {
  let component: HDFCPayoutComponent;
  let fixture: ComponentFixture<HDFCPayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HDFCPayoutComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HDFCPayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
