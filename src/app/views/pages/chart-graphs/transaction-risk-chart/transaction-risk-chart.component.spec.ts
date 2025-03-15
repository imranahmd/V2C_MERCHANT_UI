import {ComponentFixture, TestBed} from '@angular/core/testing';

import {TransactionRiskChartComponent} from './transaction-risk-chart.component';

describe('TransactionRiskChartComponent', () => {
  let component: TransactionRiskChartComponent;
  let fixture: ComponentFixture<TransactionRiskChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransactionRiskChartComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionRiskChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
