import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ReconManagementComponent} from './recon-management.component';

describe('ReconManagementComponent', () => {
  let component: ReconManagementComponent;
  let fixture: ComponentFixture<ReconManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReconManagementComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReconManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
