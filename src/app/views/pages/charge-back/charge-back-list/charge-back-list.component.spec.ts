import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargeBackListComponent } from './charge-back-list.component';

describe('ChargeBackListComponent', () => {
  let component: ChargeBackListComponent;
  let fixture: ComponentFixture<ChargeBackListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargeBackListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargeBackListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
