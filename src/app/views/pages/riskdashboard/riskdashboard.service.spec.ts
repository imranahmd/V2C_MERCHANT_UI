import {TestBed} from '@angular/core/testing';

import {RiskdashboardService} from './riskdashboard.service';

describe('RiskdashboardService', () => {
  let service: RiskdashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RiskdashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
