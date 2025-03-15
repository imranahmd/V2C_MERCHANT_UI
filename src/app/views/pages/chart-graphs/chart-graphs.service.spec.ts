import {TestBed} from '@angular/core/testing';

import {ChartGraphsService} from './chart-graphs.service';

describe('ChartGraphsService', () => {
  let service: ChartGraphsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChartGraphsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
