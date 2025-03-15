import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';

import {RefundManagementRoutingModule} from './refund-management-routing.module';
import {RefundManagementComponent} from './refund-management.component';
import {RefundListComponent} from './refund-list/refund-list.component';
// import {MerchantMasterComponent} from './merchant-master/merchant-master.component';
// import {MerchantsComponent} from './merchants.component';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import {NgSelectModule} from "@ng-select/ng-select";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
// import {MerchantAccountListComponent} from './merchant-master/merchant-account-list/merchant-account-list.component';
// import {MerchantMDRComponent} from "./merchant-master/merchant-mdr/merchant-mdr.component";
// import {TwoDigitDecimaNumberDirective} from "./two-digit-decima-number.directive";
// import {MerchantBlockedComponent} from "./merchant-master/merchant-blocked/merchant-blocked.component";
// import {AlertService} from "../../../_services/alert.service";
// import {MerchantBulkuploadComponent} from './merchant-bulkupload/merchant-bulkupload.component';
// import {MerchantstatusComponent} from './merchant-master/merchantstatus/merchantstatus.component';
// import {MerchantRiskConfigComponent} from "./merchant-master/merchant-risk-config/merchant-risk-config.component";
// import { MerchantBulkmdrComponent } from './merchant-bulkmdr/merchant-bulkmdr.component';
// import { PercentageDirective } from './percentage.directive';
import {
  NgbAccordionModule,
  NgbAlertModule,
  NgbCollapseModule,
  NgbDropdownModule,
  NgbModule,
  NgbNavModule,
  NgbPaginationModule,
  NgbTimepickerModule,
  NgbTypeaheadModule
} from "@ng-bootstrap/ng-bootstrap";
import {AgGridModule} from "ag-grid-angular";
import {ApiHttpService} from "../../../_services/api-http.service";
import {HttpInterceptorProviders} from "../../../_helpers/http.interceptor";
// import {MerchantAddComponent} from './merchant-master/merchant-add/merchant-add.component';
// import {MerchantEditComponent} from './merchant-master/merchant-edit/merchant-edit.component';
// import {MerchantListRoutingModule} from "./merchants-routing.module";
import {CustomCommonModule} from "../../../common/common.module";
import {ArchwizardModule} from "angular-archwizard";
import {FeatherIconModule} from '../../../core/feather-icon/feather-icon.module';
// import {MerchantService} from "./merchant-master/merchant.service";
import {RiskmanagementModule} from '../riskmanagement/riskmanagement.module';
// import {MerchantBasicComponent} from './merchant-master/merchant-basic/merchant-basic.component';
// import {MerchantKycUploadComponent} from './merchant-master/merchant-kyc-upload/merchant-kyc-upload.component';
// import {MerchantCreationComponent} from './merchant-master/merchant-creation/merchant-creation.component';
import {SideNavService} from "../../layout/sidebar/side-name.service";
import {LayoutModule} from "../../layout/layout.module";
// import { MerchantBankLiveComponent } from './merchant-master/merchant-bank-live/merchant-bank-live.component';
// import { MISReportComponent } from './misreport/misreport.component';
// import { DynamicReportComponent } from './misreport/dynamic-report/dynamic-report.component';
// import { MerchantBankLiveViewComponent } from './merchant-master/merchant-bank-live-view/merchant-bank-live-view.component';
import {RefundManagementService} from './refund-management.service';
import {AlertService} from 'src/app/_services/alert.service';
import {ReusableGridComponent} from './reusable-grid/reusable-grid.component';
import {BulkRefundComponent} from './bulk-refund/bulk-refund.component';
import { RefundRequestStatusComponent } from './refund-request-status/refund-request-status.component';


@NgModule({
  declarations: [
    RefundManagementComponent,
    RefundListComponent,
    ReusableGridComponent,
    BulkRefundComponent,
    RefundRequestStatusComponent,
    // TwoDigitDecimaNumberDirective,
    // MerchantMasterComponent,
    // MerchantsComponent,
    // MerchantAddComponent,
    // MerchantEditComponent,
    // MerchantBasicComponent,
    // MerchantKycUploadComponent,
    // MerchantCreationComponent,
    // MerchantAccountListComponent,
    // MerchantMDRComponent,
    // MerchantBlockedComponent,
    // MerchantBulkuploadComponent,
    // MerchantstatusComponent,
    // MerchantRiskConfigComponent,
    // MerchantBulkmdrComponent,
    // PercentageDirective,
    // MerchantBankLiveComponent,
    // MISReportComponent,
    // DynamicReportComponent,
    // MerchantBankLiveViewComponent,

  ],
  imports: [
    CommonModule,
    // MerchantListRoutingModule,
    NgxDatatableModule,
    NgSelectModule,
    FormsModule,
    NgbDropdownModule,
    NgbTypeaheadModule,
    AgGridModule,
    NgbPaginationModule,
    CustomCommonModule,
    ArchwizardModule,
    ReactiveFormsModule,
    FeatherIconModule,
    NgbTimepickerModule,
    RiskmanagementModule,
    NgbNavModule,
    NgbCollapseModule,
    LayoutModule,
    NgbAccordionModule,
    NgbAlertModule,
    NgbModule,
    RefundManagementRoutingModule
  ],
  // exports: [MerchantBlockedComponent, MerchantstatusComponent],
  providers: [ApiHttpService, HttpInterceptorProviders, RefundManagementService, SideNavService, DatePipe, AlertService]
})

// @NgModule({
//   declarations: [
//     RefundManagementComponent,
//     RefundListComponent
//   ],
//   imports: [
//     CommonModule,
//     RefundManagementRoutingModule
//   ]
// })
export class RefundManagementModule {
}
