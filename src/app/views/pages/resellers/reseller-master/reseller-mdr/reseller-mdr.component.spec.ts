import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ResellerMDRComponent} from './reseller-mdr.component';

describe('ResellerMDRComponent', () => {
  let component: ResellerMDRComponent;
  let fixture: ComponentFixture<ResellerMDRComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResellerMDRComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResellerMDRComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
