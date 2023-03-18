import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayCashComponent } from './pay-cash.component';

describe('PayCashComponent', () => {
  let component: PayCashComponent;
  let fixture: ComponentFixture<PayCashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayCashComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayCashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
