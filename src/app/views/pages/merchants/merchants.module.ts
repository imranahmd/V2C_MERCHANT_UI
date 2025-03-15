import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {MerchantMasterComponent} from './merchant-master/merchant-master.component';
import {MerchantsComponent} from './merchants.component';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import {NgSelectModule} from "@ng-select/ng-select";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
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
import {MerchantAddComponent} from './merchant-master/merchant-add/merchant-add.component';
import {MerchantEditComponent} from './merchant-master/merchant-edit/merchant-edit.component';
import {MerchantListRoutingModule} from "./merchants-routing.module";
import {CustomCommonModule} from "../../../common/common.module";
import {ArchwizardModule} from "angular-archwizard";
import {FeatherIconModule} from '../../../core/feather-icon/feather-icon.module';
import {MerchantService} from "./merchant-master/merchant.service";
import {RiskmanagementModule} from '../riskmanagement/riskmanagement.module';
import {MerchantBasicComponent} from './merchant-master/merchant-basic/merchant-basic.component';
import {MerchantKycUploadComponent} from './merchant-master/merchant-kyc-upload/merchant-kyc-upload.component';
import {MerchantCreationComponent} from './merchant-master/merchant-creation/merchant-creation.component';
import {SideNavService} from "../../layout/sidebar/side-name.service";
import {LayoutModule} from "../../layout/layout.module";
import {MerchantAccountListComponent} from './merchant-master/merchant-account-list/merchant-account-list.component';
import {MerchantMDRComponent} from "./merchant-master/merchant-mdr/merchant-mdr.component";
import {TwoDigitDecimaNumberDirective} from "./two-digit-decima-number.directive";
import {MerchantBlockedComponent} from "./merchant-master/merchant-blocked/merchant-blocked.component";
import {AlertService} from "../../../_services/alert.service";
import {MerchantBulkuploadComponent} from './merchant-bulkupload/merchant-bulkupload.component';
import {MerchantstatusComponent} from './merchant-master/merchantstatus/merchantstatus.component';
import {MerchantRiskConfigComponent} from "./merchant-master/merchant-risk-config/merchant-risk-config.component";
import {MerchantBulkmdrComponent} from './merchant-bulkmdr/merchant-bulkmdr.component';
import {PercentageDirective} from './percentage.directive';
import {MerchantBankLiveComponent} from './merchant-master/merchant-bank-live/merchant-bank-live.component';
import {MISReportComponent} from './misreport/misreport.component';
import {DynamicReportComponent} from './misreport/dynamic-report/dynamic-report.component';
import {
  MerchantBankLiveViewComponent
} from './merchant-master/merchant-bank-live-view/merchant-bank-live-view.component';
import {InvoiceReportComponent} from './misreport/invoice-report/invoice-report.component';
import {KycDocListComponent} from "./merchant-master/merchant-kyc-upload/kyc-doc-list/kyc-doc-list.component";
import { InvoiceReportServiceService } from './merchant-master/invoice-report-service.service';
import { SelfOnboardingComponent } from './self-onboarding/self-onboarding.component';
// import {NgOtpInputModule} from "ng-otp-input";
import {AuthModule} from "../auth/auth.module";
import { SelfOnbaordingTimelineComponent } from './self-onboarding/self-onbaording-timeline/self-onbaording-timeline.component';


@NgModule({
  declarations: [
    TwoDigitDecimaNumberDirective,
    MerchantMasterComponent,
    MerchantsComponent,
    MerchantAddComponent,
    MerchantEditComponent,
    MerchantBasicComponent,
    MerchantKycUploadComponent,
    MerchantCreationComponent,
    MerchantAccountListComponent,
    MerchantMDRComponent,
    MerchantBlockedComponent,
    MerchantBulkuploadComponent,
    MerchantstatusComponent,
    MerchantRiskConfigComponent,
    MerchantBulkmdrComponent,
    PercentageDirective,
    MerchantBankLiveComponent,
    MISReportComponent,
    DynamicReportComponent,
    MerchantBankLiveViewComponent,
    InvoiceReportComponent,
    KycDocListComponent,
    SelfOnboardingComponent,
    SelfOnbaordingTimelineComponent

  ],
    imports: [
        CommonModule,
        MerchantListRoutingModule,
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
        // NgOtpInputModule,
        AuthModule
    ],
  exports: [MerchantBlockedComponent, MerchantstatusComponent],
  providers: [ApiHttpService, HttpInterceptorProviders, MerchantService, SideNavService, DatePipe, AlertService, InvoiceReportServiceService]
})
export class MerchantsModule {
}
