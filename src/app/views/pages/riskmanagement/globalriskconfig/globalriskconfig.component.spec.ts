import {ComponentFixture, TestBed} from '@angular/core/testing';

import {GlobalriskconfigComponent} from './globalriskconfig.component';

describe('GlobalriskconfigComponent', () => {
  let component: GlobalriskconfigComponent;
  let fixture: ComponentFixture<GlobalriskconfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GlobalriskconfigComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalriskconfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
