import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ResellerCreateComponent} from './reseller-create.component';

describe('ResellerCreateComponent', () => {
  let component: ResellerCreateComponent;
  let fixture: ComponentFixture<ResellerCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResellerCreateComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResellerCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
