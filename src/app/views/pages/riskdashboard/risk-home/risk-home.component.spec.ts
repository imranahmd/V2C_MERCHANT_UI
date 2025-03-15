import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RiskHomeComponent} from './risk-home.component';

describe('RiskHomeComponent', () => {
  let component: RiskHomeComponent;
  let fixture: ComponentFixture<RiskHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RiskHomeComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
