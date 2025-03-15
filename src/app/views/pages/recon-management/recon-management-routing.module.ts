import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ReconManagementComponent} from './recon-management/recon-management.component';
import {ReconProgressReportComponent} from './recon-progress-report/recon-progress-report.component';
import {ReconComponent} from './recon/recon.component';

const routes: Routes = [
  {
    path: '',
    data: {breadcrumb: {alias: 'Recon Management'}},
    children: [
      {path: '', data: {breadcrumb: {alias: 'Recon Management'}}, component: ReconManagementComponent},
      {path: 'recon', data: {breadcrumb: {alias: 'Recon'}}, component: ReconComponent},
      {
        path: 'ReconProgressReport',
        data: {breadcrumb: {alias: 'Recon Progress Report'}},
        component: ReconProgressReportComponent
      },


    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReconManagementRoutingModule {
}
