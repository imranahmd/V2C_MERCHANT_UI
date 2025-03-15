import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ResellerBasicComponent} from './reseller-basic.component';

describe('ResellerBasicComponent', () => {
  let component: ResellerBasicComponent;
  let fixture: ComponentFixture<ResellerBasicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResellerBasicComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResellerBasicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
