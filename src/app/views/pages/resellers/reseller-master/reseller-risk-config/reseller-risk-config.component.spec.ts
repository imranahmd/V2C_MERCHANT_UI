import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ResellerRiskConfigComponent} from './reseller-risk-config.component';

describe('ResellerRiskConfigComponent', () => {
  let component: ResellerRiskConfigComponent;
  let fixture: ComponentFixture<ResellerRiskConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResellerRiskConfigComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResellerRiskConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
