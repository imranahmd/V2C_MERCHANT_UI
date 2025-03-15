import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ChartGraphsComponent} from './chart-graphs.component';

describe('ChartGraphsComponent', () => {
  let component: ChartGraphsComponent;
  let fixture: ComponentFixture<ChartGraphsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChartGraphsComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartGraphsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
