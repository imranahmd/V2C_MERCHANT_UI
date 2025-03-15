import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

// Ng-ApexCharts
import {NgApexchartsModule} from "ng-apexcharts";

// Ng2-charts
import {NgChartsModule} from 'ng2-charts';

import {ChartGraphsComponent} from './chart-graphs.component';
import {ApexchartsComponent} from './apexcharts/apexcharts.component';
import {ChartjsComponent} from './chartjs/chartjs.component';
import {ChartGraphsRoutingModule} from './chart-graphs-routing.module';
import {ApiHttpService} from 'src/app/_services/api-http.service';
import {HttpInterceptorProviders} from 'src/app/_helpers/http.interceptor';
import {NgSelectModule} from '@ng-select/ng-select';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SweetAlert2Module} from "@sweetalert2/ngx-sweetalert2";
// import {AlertComponent} from "../../../common/alert/alert.component";
import {AlertService} from "../../../_services/alert.service";
import {MerchantsModule} from '../merchants/merchants.module';
import {TransactionRiskChartComponent} from './transaction-risk-chart/transaction-risk-chart.component';
import {CustomCommonModule} from 'src/app/common/common.module';

import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import {
  NgbDropdownModule,
  NgbPaginationModule,
  NgbTimepickerModule,
  NgbTypeaheadModule
} from "@ng-bootstrap/ng-bootstrap";
import {AgGridModule} from "ag-grid-angular";

import {ArchwizardModule} from "angular-archwizard";
import {FeatherIconModule} from '../../../core/feather-icon/feather-icon.module';

// import { ChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [ChartGraphsComponent, ApexchartsComponent, ChartjsComponent, TransactionRiskChartComponent],
  imports: [
    CommonModule,
    ChartGraphsRoutingModule,
    NgApexchartsModule, // Ng-ApexCharts
    NgChartsModule, // Ng2-charts
    NgSelectModule,
    FormsModule, ReactiveFormsModule,
    SweetAlert2Module.forRoot(),
    CustomCommonModule,
    NgxDatatableModule,
    NgSelectModule,
    FormsModule,
    NgApexchartsModule,
    NgbDropdownModule,
    NgbTypeaheadModule,
    AgGridModule,
    NgbPaginationModule,
    // MerchantBlockedComponent,
    ArchwizardModule,
    ReactiveFormsModule,
    FeatherIconModule,
    NgbTimepickerModule,
    MerchantsModule

    //   RiskTransactionComponent,
    //  RiskdashboardModule
    // TransactionRiskChartComponent
  ],
  providers: [ApiHttpService, HttpInterceptorProviders, AlertService],
  // exports: [TransactionRiskChartComponent]
})
export class ChartsGraphsModule {
}
