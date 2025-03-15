import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ResellerAccountDeleteComponent} from './reseller-account-delete.component';

describe('ResellerAccountDeleteComponent', () => {
  let component: ResellerAccountDeleteComponent;
  let fixture: ComponentFixture<ResellerAccountDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResellerAccountDeleteComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResellerAccountDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
