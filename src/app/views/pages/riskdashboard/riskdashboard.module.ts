import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {RiskdashboardRoutingModule} from './riskdashboard-routing.module';
import {RiskdashboardComponent} from './riskdashboard/riskdashboard.component';
import {RiskAlertComponent} from './risk-alert/risk-alert.component';
import {RiskActionComponent} from './risk-action/risk-action.component';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import {NgSelectModule} from "@ng-select/ng-select";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {
  NgbDropdownModule,
  NgbPaginationModule,
  NgbTimepickerModule,
  NgbTypeaheadModule
} from "@ng-bootstrap/ng-bootstrap";
import {AgGridModule} from "ag-grid-angular";
import {ApiHttpService} from "../../../_services/api-http.service";
import {HttpInterceptorProviders} from "../../../_helpers/http.interceptor";

import {ArchwizardModule} from "angular-archwizard";
import {FeatherIconModule} from '../../../core/feather-icon/feather-icon.module';
import {RiskHomeComponent} from './risk-home/risk-home.component';
import {RiskTransactionComponent} from './risk-transaction/risk-transaction.component';
import {NgApexchartsModule} from "ng-apexcharts";
import {AlertService} from 'src/app/_services/alert.service';
import {RiskdashboardService} from "./riskdashboard.service";

@NgModule({
  declarations: [
    RiskdashboardComponent,
    RiskAlertComponent,
    RiskActionComponent,
    RiskHomeComponent,
    RiskTransactionComponent
  ],
  imports: [
    CommonModule,
    RiskdashboardRoutingModule,
    NgxDatatableModule,
    NgSelectModule,
    FormsModule,
    NgApexchartsModule,
    NgbDropdownModule,
    NgbTypeaheadModule,
    AgGridModule,
    NgbPaginationModule,
    ArchwizardModule,
    ReactiveFormsModule,
    FeatherIconModule,
    NgbTimepickerModule,
  ],
  exports: [RiskTransactionComponent],
  providers: [ApiHttpService, HttpInterceptorProviders, AlertService, RiskdashboardService]
})
export class RiskdashboardModule {}
