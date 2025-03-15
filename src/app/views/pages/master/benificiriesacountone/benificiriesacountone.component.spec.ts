import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BenificiriesacountoneComponent } from './benificiriesacountone.component';

describe('BenificiriesacountoneComponent', () => {
  let component: BenificiriesacountoneComponent;
  let fixture: ComponentFixture<BenificiriesacountoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BenificiriesacountoneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BenificiriesacountoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
