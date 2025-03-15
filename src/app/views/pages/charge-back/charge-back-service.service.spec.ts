import { TestBed } from '@angular/core/testing';

import { ChargeBackServiceService } from './charge-back-service.service';

describe('ChargeBackServiceService', () => {
  let service: ChargeBackServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChargeBackServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
