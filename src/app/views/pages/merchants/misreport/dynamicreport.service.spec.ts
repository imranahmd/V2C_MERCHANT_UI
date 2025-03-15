import {TestBed} from '@angular/core/testing';

import {DynamicreportService} from './dynamicreport.service';

describe('DynamicreportService', () => {
  let service: DynamicreportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DynamicreportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
