import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayFreeComponent } from './pay-free.component';

describe('PayFreeComponent', () => {
  let component: PayFreeComponent;
  let fixture: ComponentFixture<PayFreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PayFreeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayFreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
