import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RiskmanagementComponent} from './riskmanagement.component';

describe('RiskmanagementComponent', () => {
  let component: RiskmanagementComponent;
  let fixture: ComponentFixture<RiskmanagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RiskmanagementComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskmanagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
