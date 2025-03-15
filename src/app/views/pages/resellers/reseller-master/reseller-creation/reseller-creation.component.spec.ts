import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ResellerCreationComponent} from './reseller-creation.component';

describe('ResellerCreationComponent', () => {
  let component: ResellerCreationComponent;
  let fixture: ComponentFixture<ResellerCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResellerCreationComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResellerCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
