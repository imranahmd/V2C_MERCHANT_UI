import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelfOnbaordingTimelineComponent } from './self-onbaording-timeline.component';

describe('SelfOnbaordingTimelineComponent', () => {
  let component: SelfOnbaordingTimelineComponent;
  let fixture: ComponentFixture<SelfOnbaordingTimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelfOnbaordingTimelineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelfOnbaordingTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
