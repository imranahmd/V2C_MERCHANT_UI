import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RiskActionComponent} from './risk-action/risk-action.component';
import {RiskAlertComponent} from './risk-alert/risk-alert.component';
import {RiskHomeComponent} from './risk-home/risk-home.component';
import {RiskTransactionComponent} from './risk-transaction/risk-transaction.component';
import {RiskdashboardComponent} from './riskdashboard/riskdashboard.component';

const routes: Routes = [
  {
    path: '',
    data: {breadcrumb: {alias: 'Risk Dashboard'}},
    children: [
      {path: '', data: {breadcrumb: {alias: 'Risk Dashboard'}}, component: RiskdashboardComponent},
      {path: 'riskalert', data: {breadcrumb: {alias: 'Risk Alert'}}, component: RiskAlertComponent},
      {path: 'riskaction', data: {breadcrumb: {alias: 'Risk Action'}}, component: RiskActionComponent},
      {path: 'riskhome', data: {breadcrumb: {alias: 'Risk Home'}}, component: RiskHomeComponent},
      {path: 'risktransaction', data: {breadcrumb: {alias: 'Risk Transaction'}}, component: RiskTransactionComponent},


    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RiskdashboardRoutingModule {
}
