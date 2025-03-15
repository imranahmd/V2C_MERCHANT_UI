import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RiskdashboardComponent} from './riskdashboard.component';

describe('RiskdashboardComponent', () => {
  let component: RiskdashboardComponent;
  let fixture: ComponentFixture<RiskdashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RiskdashboardComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskdashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
