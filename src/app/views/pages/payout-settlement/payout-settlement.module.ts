import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {PayoutSettlementRoutingModule} from './payout-settlement-routing.module';
import {PayoutSettlementComponent} from './payout-settlement/payout-settlement.component';
import {HDFCPayoutComponent} from './hdfcpayout/hdfcpayout.component';
import {YesBankPayoutComponent} from './yes-bank-payout/yes-bank-payout.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";


@NgModule({
  declarations: [
    PayoutSettlementComponent,
    HDFCPayoutComponent,
    YesBankPayoutComponent
  ],
  imports: [
    CommonModule,
    PayoutSettlementRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class PayoutSettlementModule {
}
