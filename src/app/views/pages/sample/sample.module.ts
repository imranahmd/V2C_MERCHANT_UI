import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SampleComponent} from './sample.component';
import {CustomCommonModule} from "../../../common/common.module";
import {LayoutModule} from "../../layout/layout.module";
import {RouterModule} from "@angular/router";
import {AgGridModule} from "ag-grid-angular";
import {HttpClientModule} from "@angular/common/http";
import {HttpInterceptorProviders} from "../../../_helpers/http.interceptor";
import {ApiHttpService} from "../../../_services/api-http.service";
import {NgbDropdownModule, NgbPaginationModule, NgbTypeaheadModule} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule} from "@angular/forms";
import {NgSelectModule} from "@ng-select/ng-select";
import {TestComponent} from './test/test.component';
import {SampleRoutingModule} from "./sample-routing.module";


@NgModule({
  declarations: [
    SampleComponent,
    TestComponent
  ],
  imports: [
    CommonModule,
    SampleRoutingModule,
    CustomCommonModule,
    LayoutModule,
    RouterModule,
    AgGridModule, HttpClientModule, NgbDropdownModule, FormsModule, NgSelectModule, NgbPaginationModule, NgbTypeaheadModule
  ],
  providers: [ApiHttpService, HttpInterceptorProviders]
})
export class SampleModule {
}
