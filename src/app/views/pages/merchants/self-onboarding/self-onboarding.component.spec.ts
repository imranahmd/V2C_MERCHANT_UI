import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelfOnboardingComponent } from './self-onboarding.component';

describe('SelfOnboardingComponent', () => {
  let component: SelfOnboardingComponent;
  let fixture: ComponentFixture<SelfOnboardingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelfOnboardingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelfOnboardingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
