import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {ResellerMasterComponent} from './reseller-master/reseller-master.component';
import {ResellersComponent} from './resellers.component';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import {NgSelectModule} from "@ng-select/ng-select";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {
  NgbAccordionModule,
  NgbAlertModule,
  NgbCollapseModule,
  NgbDropdownModule,
  NgbNavModule,
  NgbPaginationModule,
  NgbTimepickerModule,
  NgbTypeaheadModule
} from "@ng-bootstrap/ng-bootstrap";
import {AgGridModule} from "ag-grid-angular";
import {ApiHttpService} from "../../../_services/api-http.service";
import {HttpInterceptorProviders} from "../../../_helpers/http.interceptor";
import {ResellerAddComponent} from './reseller-master/reseller-add/reseller-add.component';
import {ResellerEditComponent} from './reseller-master/reseller-edit/reseller-edit.component';
import {ResellerListRoutingModule} from "./resellers-routing.module";
import {CustomCommonModule} from "../../../common/common.module";
import {ArchwizardModule} from "angular-archwizard";
import {FeatherIconModule} from '../../../core/feather-icon/feather-icon.module';
import {ResellerService} from "./reseller-master/reseller.service";
import {RiskmanagementModule} from '../riskmanagement/riskmanagement.module';
import {ResellerBasicComponent} from './reseller-master/reseller-basic/reseller-basic.component';
import {ResellerKycUploadComponent} from './reseller-master/reseller-kyc-upload/reseller-kyc-upload.component';
import {ResellerCreationComponent} from './reseller-master/reseller-creation/reseller-creation.component';
import {SideNavService} from "../../layout/sidebar/side-name.service";
import {LayoutModule} from "../../layout/layout.module";
import {ResellerAccountListComponent} from './reseller-master/reseller-account-list/reseller-account-list.component';
import {
  ResellerAccountDeleteComponent
} from './reseller-master/reseller-account-list/reseller-account-delete/reseller-account-delete.component';
import {ResellerMDRComponent} from "./reseller-master/reseller-mdr/reseller-mdr.component";
import {TwoDigitDecimaNumberDirective} from "./two-digit-decima-number.directive";
import {ResellerBlockedComponent} from "./reseller-master/reseller-blocked/reseller-blocked.component";
import {ResellerRiskConfigComponent} from "./reseller-master/reseller-risk-config/reseller-risk-config.component";
import {AlertService} from "../../../_services/alert.service";
import {ProvidersService} from 'src/app/_services/providers.service';
import {KycDocListComponent} from "./reseller-master/reseller-kyc-upload/kyc-doc-list/kyc-doc-list.component";

@NgModule({
  declarations: [
    TwoDigitDecimaNumberDirective,
    ResellerMasterComponent,
    ResellersComponent,
    ResellerAddComponent,
    ResellerEditComponent,
    ResellerBasicComponent,
    ResellerKycUploadComponent,
    ResellerCreationComponent,
    ResellerAccountListComponent,
    ResellerAccountDeleteComponent,
    ResellerMDRComponent,
    ResellerBlockedComponent,
    ResellerRiskConfigComponent,
    KycDocListComponent
  ],
  imports: [
    CommonModule,
    ResellerListRoutingModule,
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
    NgbAlertModule
  ],
  providers: [ApiHttpService, HttpInterceptorProviders, ResellerService, SideNavService, DatePipe, AlertService, ProvidersService]
})
export class ResellersModule {
}
