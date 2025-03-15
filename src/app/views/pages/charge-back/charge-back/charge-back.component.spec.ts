import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargeBackComponent } from './charge-back.component';

describe('ChargeBackComponent', () => {
  let component: ChargeBackComponent;
  let fixture: ComponentFixture<ChargeBackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargeBackComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargeBackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
