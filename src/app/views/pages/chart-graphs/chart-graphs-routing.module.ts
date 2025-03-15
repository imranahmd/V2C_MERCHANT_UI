import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ApexchartsComponent} from './apexcharts/apexcharts.component';
import {ChartGraphsComponent} from './chart-graphs.component';
import {ChartjsComponent} from './chartjs/chartjs.component';
import {TransactionRiskChartComponent} from './transaction-risk-chart/transaction-risk-chart.component';

const routes: Routes = [

  {
    path: '',
    redirectTo: 'riskanalysis',
    data: {breadcrumb: {alias: 'Risk Analysis'}},
    pathMatch: 'full'
  },
  {path: 'riskanalysis', data: {breadcrumb: {alias: 'Risk Analysis'}}, component: ApexchartsComponent},
  {path: 'merchantchart', data: {breadcrumb: {alias: 'Merchant Chart'}}, component: ChartjsComponent},
  {path: 'globalchart', data: {breadcrumb: {alias: 'Global Chart'}}, component: ChartGraphsComponent},
  {path: 'transactionrisk', data: {breadcrumb: {alias: 'Risk Transaction'}}, component: TransactionRiskChartComponent}


]


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChartGraphsRoutingModule {
}
