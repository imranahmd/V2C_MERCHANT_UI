import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BulkRefundComponent} from './bulk-refund/bulk-refund.component';
import {RefundListComponent} from './refund-list/refund-list.component';
import {RefundManagementComponent} from './refund-management.component';
import { RefundRequestStatusComponent } from './refund-request-status/refund-request-status.component';

const routes: Routes = [{
  path: '',
  data: {breadcrumb: {alias: 'Refund Management'}},
  children: [
    {path: '', data: {breadcrumb: {alias: 'Refund Management'}}, component: RefundManagementComponent},
    {path: 'refund', data: {breadcrumb: {alias: 'Refund'}}, component: RefundListComponent},
    {path: 'refundlist', data: {breadcrumb: {alias: 'Refund List'}}, component: RefundManagementComponent},
    {path: 'bulkrefund', data: {breadcrumb: {alias: 'Bulk Refund'}}, component: BulkRefundComponent},
    {path: 'refundRequestStatus', data: { breadcrumb: {alias: 'Refund Request Status'} }, component: RefundRequestStatusComponent},


  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RefundManagementRoutingModule {
}
