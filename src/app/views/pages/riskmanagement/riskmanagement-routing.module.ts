import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {GlobalriskconfigComponent} from './globalriskconfig/globalriskconfig.component';
import {RiskmanagementComponent} from './riskmanagement.component';

const routes: Routes = [
  {
    path: '',
    data: {breadcrumb: {alias: 'Risk Management'}},
    children: [
      {path: 'riskmanagement', data: {breadcrumb: {alias: 'Risk Management'}}, component: RiskmanagementComponent},
      {path: 'globalconfig', data: {breadcrumb: {alias: 'Global Config'}}, component: GlobalriskconfigComponent}
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RiskmanagementRoutingModule {
}
