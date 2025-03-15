import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';

import {MasterRoutingModule} from './master-routing.module';
import {MasterComponent} from './master/master.component';
import {CreateInvoiceComponent} from './create-invoice/create-invoice.component';
import {BulkUploadInvoiceComponent} from './bulk-upload-invoice/bulk-upload-invoice.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AlertService} from 'src/app/_services/alert.service';
import {ApiHttpService} from 'src/app/_services/api-http.service';
import {HttpInterceptorProviders} from 'src/app/_helpers/http.interceptor';
import {MasterService} from './master.service';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { BenificiriesacountoneComponent } from './benificiriesacountone/benificiriesacountone.component';
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
import { BenificiriesPopupComponent } from './benificiries-popup/benificiries-popup.component';
import { CustomCommonModule } from 'src/app/common/common.module';
import { NgSelectModule } from '@ng-select/ng-select';
@NgModule({
  declarations: [
    MasterComponent,
    CreateInvoiceComponent,
    BulkUploadInvoiceComponent,
    BenificiriesacountoneComponent,
    BenificiriesPopupComponent,
    
  ],
  imports: [
    CommonModule,
    MasterRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxDatatableModule,
    NgbAccordionModule,
    NgbAlertModule,
    NgbCollapseModule,
    NgbDropdownModule,
    NgbModule,
    NgbNavModule,
    NgbPaginationModule,
    NgbTimepickerModule,
    NgbTypeaheadModule,
    AgGridModule,
    CustomCommonModule,
    NgSelectModule,
  ],
  providers: [ApiHttpService, HttpInterceptorProviders, DatePipe, AlertService, MasterService]


})

export class MasterModule {
}
