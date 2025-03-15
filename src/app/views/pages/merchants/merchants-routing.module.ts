import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MerchantBasicComponent} from './merchant-master/merchant-basic/merchant-basic.component';
import {MerchantAddComponent} from './merchant-master/merchant-add/merchant-add.component';
import {MerchantEditComponent} from './merchant-master/merchant-edit/merchant-edit.component';
import {MerchantMasterComponent} from "./merchant-master/merchant-master.component";
import {MerchantKycUploadComponent} from "./merchant-master/merchant-kyc-upload/merchant-kyc-upload.component";
import {SidebarComponent} from "../../layout/sidebar/sidebar.component";
import {MerchantBulkuploadComponent} from './merchant-bulkupload/merchant-bulkupload.component';
import {MerchantstatusComponent} from './merchant-master/merchantstatus/merchantstatus.component';
import {MerchantBulkmdrComponent} from './merchant-bulkmdr/merchant-bulkmdr.component';
import {MerchantsComponent} from './merchants.component';
import {MerchantCreateComponent} from './merchant-master/merchant-create/merchant-create.component';
import {DynamicReportComponent} from './misreport/dynamic-report/dynamic-report.component';
import {InvoiceReportComponent} from './misreport/invoice-report/invoice-report.component';
import {
  SelfOnbaordingTimelineComponent
} from "./self-onboarding/self-onbaording-timeline/self-onbaording-timeline.component";

const routes: Routes = [
  {
    path: '',
    component: MerchantMasterComponent,
    children: [
      {
        path: '',
        redirectTo: 'merchant-master',
        pathMatch: 'full'
      },
      {
        path: 'merchant-master',
        data: {breadcrumb: {alias: 'Merchant Master'}},
        component: MerchantMasterComponent
      },
      // {
      //   path:'merchant-bulkupload',
      //   component: MerchantBulkuploadComponent
      // },

    ]
  },
  {
    path: 'merchant-create',
    data: {breadcrumb: {alias: 'Merchant Create'}},
    // component: MerchantCreationComponent,
    loadChildren: () => import('./merchant-master/merchant-create/merchant-create.module').then(m => m.MerchantCreateModule)
  },
  {
    path: 'merchant-creation',
    data: {breadcrumb: {alias: 'Merchant Add'}},
    // component: MerchantCreationComponent,
    loadChildren: () => import('./merchant-master/merchant-creation/merchant-creation.module').then(m => m.MerchantCreationModule)
  },
  {
    path: 'merchant-kyc-upload',
    data: {breadcrumb: {alias: 'Kyc Upload'}},
    component: MerchantKycUploadComponent
  },
  {
    path: 'merchant-basic',
    data: {breadcrumb: {alias: 'Basic Setup'}},
    component: MerchantBasicComponent
  },
  {
    path: 'merchant-edit',
    data: {breadcrumb: {alias: 'Merchant Edit'}},
    component: MerchantEditComponent
  },
  {
    path: 'merchant-add',
    data: {breadcrumb: {alias: 'Merchant Add'}},
    component: MerchantAddComponent
  },
  {
    path: 'merchant-bulkupload',
    data: {breadcrumb: {alias: 'Merchant Bulk Upload'}},
    component: MerchantBulkuploadComponent
  },
  {
    path: 'merchant-bulkmdr',
    data: {breadcrumb: {alias: 'Merchant Bulk MDR'}},
    component: MerchantBulkmdrComponent
  },
  {
    path: 'merchant-status',
    component: MerchantstatusComponent
  },
  {
    path: 'merchants',
    component: MerchantsComponent
  },
  {
    path: 'banklive',
    component: MerchantCreateComponent
  },
  {
    path: 'dynamicreport/:Id' || 'dynamicreport',
    component: DynamicReportComponent
  },
  {
    path: 'invoiceReport',
    component: InvoiceReportComponent
  },
  {
    path: 'self-onboarding',
    component: SelfOnbaordingTimelineComponent
  }

]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [SidebarComponent]
})
export class MerchantListRoutingModule {
}
