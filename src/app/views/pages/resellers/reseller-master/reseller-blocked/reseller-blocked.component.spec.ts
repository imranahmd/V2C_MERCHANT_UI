import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ResellerBlockedComponent} from './reseller-blocked.component';

describe('ResellerBlockedComponent', () => {
  let component: ResellerBlockedComponent;
  let fixture: ComponentFixture<ResellerBlockedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResellerBlockedComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResellerBlockedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
