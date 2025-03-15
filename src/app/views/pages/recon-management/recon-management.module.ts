import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';

import {ReconManagementRoutingModule} from './recon-management-routing.module';
import {ReconManagementComponent} from './recon-management/recon-management.component';
import {ReconComponent} from './recon/recon.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AgGridModule} from "ag-grid-angular";
import {AlertService} from "../../../_services/alert.service";
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
import {ApiHttpService} from 'src/app/_services/api-http.service';
import {HttpInterceptorProviders} from 'src/app/_helpers/http.interceptor';
import {ReconProgressReportComponent} from './recon-progress-report/recon-progress-report.component';

@NgModule({
  declarations: [
    ReconManagementComponent,
    ReconComponent,
    ReconProgressReportComponent
  ],
  imports: [
    CommonModule,
    ReconManagementRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AgGridModule,
    NgbAccordionModule, NgbAlertModule,
    NgbCollapseModule,
    NgbDropdownModule,
    NgbNavModule,
    NgbPaginationModule,
    NgbTimepickerModule,
    NgbTypeaheadModule
  ],
  providers: [ApiHttpService, HttpInterceptorProviders, DatePipe, AlertService]

})
export class ReconManagementModule {
}
