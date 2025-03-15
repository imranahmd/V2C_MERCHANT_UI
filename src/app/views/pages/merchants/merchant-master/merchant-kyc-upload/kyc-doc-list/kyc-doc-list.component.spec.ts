import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KycDocListComponent } from './kyc-doc-list.component';

describe('KycDocListComponent', () => {
  let component: KycDocListComponent;
  let fixture: ComponentFixture<KycDocListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KycDocListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(KycDocListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
