import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ResellerAccountListComponent} from './reseller-account-list.component';

describe('ResellerAccountListComponent', () => {
  let component: ResellerAccountListComponent;
  let fixture: ComponentFixture<ResellerAccountListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResellerAccountListComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResellerAccountListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
