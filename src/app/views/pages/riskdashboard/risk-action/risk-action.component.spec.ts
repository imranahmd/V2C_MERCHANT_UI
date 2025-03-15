import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RiskActionComponent} from './risk-action.component';

describe('RiskActionComponent', () => {
  let component: RiskActionComponent;
  let fixture: ComponentFixture<RiskActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RiskActionComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
