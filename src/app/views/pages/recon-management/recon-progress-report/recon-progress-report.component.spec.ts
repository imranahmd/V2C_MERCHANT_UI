import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ReconProgressReportComponent} from './recon-progress-report.component';

describe('ReconProgressReportComponent', () => {
  let component: ReconProgressReportComponent;
  let fixture: ComponentFixture<ReconProgressReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReconProgressReportComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReconProgressReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
