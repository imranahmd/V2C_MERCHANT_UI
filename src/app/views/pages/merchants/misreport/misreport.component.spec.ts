import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MISReportComponent} from './misreport.component';

describe('MISReportComponent', () => {
  let component: MISReportComponent;
  let fixture: ComponentFixture<MISReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MISReportComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MISReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
