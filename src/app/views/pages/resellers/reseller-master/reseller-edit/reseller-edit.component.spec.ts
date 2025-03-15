import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ResellerEditComponent} from './reseller-edit.component';

describe('ResellerEditComponent', () => {
  let component: ResellerEditComponent;
  let fixture: ComponentFixture<ResellerEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResellerEditComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResellerEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
