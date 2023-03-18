import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { PayCashComponent } from './modals/pay-cash/pay-cash.component';
import { PayCardComponent } from './modals/pay-card/pay-card.component';
import { PayFreeComponent } from './modals/pay-free/pay-free.component';
import { PayCheckComponent } from './modals/pay-check/pay-check.component';
import { ConfirmComponent } from './modals/confirm/confirm.component';

@NgModule({
  declarations: [
    AppComponent,
    PayCashComponent,
    PayCardComponent,
    PayFreeComponent,
    PayCheckComponent,
    ConfirmComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
