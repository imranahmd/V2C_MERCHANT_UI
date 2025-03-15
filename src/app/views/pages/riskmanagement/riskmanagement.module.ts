import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {RiskmanagementRoutingModule} from './riskmanagement-routing.module';
import {RiskmanagementComponent} from './riskmanagement.component';
import {GlobalriskconfigComponent} from './globalriskconfig/globalriskconfig.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ApiHttpService} from 'src/app/_services/api-http.service';
import {HttpInterceptorProviders} from 'src/app/_helpers/http.interceptor';
import {NgSelectModule} from '@ng-select/ng-select';
import {NgbAlertModule} from "@ng-bootstrap/ng-bootstrap";
import {AlertService} from 'src/app/_services/alert.service';

@NgModule({
  declarations: [
    RiskmanagementComponent,
    GlobalriskconfigComponent
  ],
  imports: [
    CommonModule,
    RiskmanagementRoutingModule,
    FormsModule, ReactiveFormsModule,
    NgSelectModule, NgbAlertModule
  ],
  exports: [],
  providers: [ApiHttpService, HttpInterceptorProviders, AlertService]
  ,
})
export class RiskmanagementModule {
}
