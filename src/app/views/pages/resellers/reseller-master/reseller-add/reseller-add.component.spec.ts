import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ResellerAddComponent} from './reseller-add.component';

describe('ResellerAddComponent', () => {
  let component: ResellerAddComponent;
  let fixture: ComponentFixture<ResellerAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResellerAddComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResellerAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
