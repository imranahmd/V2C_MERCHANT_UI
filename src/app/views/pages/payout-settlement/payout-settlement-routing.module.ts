import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HDFCPayoutComponent} from './hdfcpayout/hdfcpayout.component';
import {PayoutSettlementComponent} from './payout-settlement/payout-settlement.component';
import {YesBankPayoutComponent} from './yes-bank-payout/yes-bank-payout.component';

const routes: Routes = [
  {
    path: '',
    data: {breadcrumb: {alias: 'Payout & Settlement'}},
    children: [
      {path: '', data: {breadcrumb: {alias: 'Payout & Settlement'}}, component: PayoutSettlementComponent},
      {path: 'hdfcpayout', data: {breadcrumb: {alias: 'HDFC payout'}}, component: HDFCPayoutComponent},
      {path: 'yesbankpayout', data: {breadcrumb: {alias: 'YesBank Payout'}}, component: YesBankPayoutComponent}


    ]
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PayoutSettlementRoutingModule {
}
