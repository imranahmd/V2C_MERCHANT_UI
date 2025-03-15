import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BulkUploadInvoiceComponent} from './bulk-upload-invoice/bulk-upload-invoice.component';
import {CreateInvoiceComponent} from './create-invoice/create-invoice.component';
import {MasterComponent} from './master/master.component';
import { BenificiriesacountoneComponent } from './benificiriesacountone/benificiriesacountone.component';

const routes: Routes = [
  {
    path: '',
    data: {breadcrumb: {alias: 'Master Management'}},
    children: [
      {path: '', data: {breadcrumb: {alias: 'Master'}}, component: MasterComponent},
      {path: 'createinvoice', data: {breadcrumb: {alias: 'Create Invoice'}}, component: CreateInvoiceComponent},
      {path: 'bulkinvoice', data: {breadcrumb: {alias: 'Bulk Upload Invoice'}}, component: BulkUploadInvoiceComponent},
      {path: 'benificiries', data: {breadcrumb: {alias: 'Benificiries'}}, component: BenificiriesacountoneComponent},




    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterRoutingModule {
}
