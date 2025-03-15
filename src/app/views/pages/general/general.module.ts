import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';

import {FeatherIconModule} from '../../../core/feather-icon/feather-icon.module';

import {NgbAccordionModule, NgbDatepickerModule, NgbDropdownModule, NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';

import {GeneralComponent} from './general.component';
import {BlankComponent} from './blank/blank.component';
import {ProfileComponent} from './profile/profile.component';
import {RouterModule, Routes} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
// Ng-ApexCharts
import {NgApexchartsModule} from "ng-apexcharts";
import { PayoutComponent } from './payout/payout.component';
import { UpiComponent } from './upi/upi.component';
import { AreachartComponent } from './areachart/areachart.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { PayComponent } from './pay/pay.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';

// import { PaymentComponent } from './blank/payment/payment.component';

const routes: Routes = [
  {
    path: '',
    component: GeneralComponent,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        component: BlankComponent,
        data: {breadcrumb: {alias: 'Home'}},
      },
      {
        path: 'profile',
        component: ProfileComponent,
        data: {breadcrumb: {alias: 'Profile'}},
      },
      {
        path: 'pay',
        component: PayComponent,
        data: {breadcrumb: {alias: 'Pay'}},
      },
    ]
  }
]

@NgModule({
  declarations: [GeneralComponent, BlankComponent, ProfileComponent, PayoutComponent, UpiComponent, AreachartComponent, LandingPageComponent, PayComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FeatherIconModule,
    NgbAccordionModule,
    NgbDropdownModule,
    NgbTooltipModule,
    FormsModule,
    FeatherIconModule,
    NgbDropdownModule,
    NgbDatepickerModule,
    NgApexchartsModule,
    NgxDatatableModule,
    NgxDaterangepickerMd.forRoot(),
    HttpClientModule,
    ReactiveFormsModule

  ],
  providers: [DatePipe]


})
export class GeneralModule {
}
