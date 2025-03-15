import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RiskAlertComponent} from './risk-alert.component';

describe('RiskAlertComponent', () => {
  let component: RiskAlertComponent;
  let fixture: ComponentFixture<RiskAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RiskAlertComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
