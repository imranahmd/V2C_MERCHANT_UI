import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MerchantCreationComponent} from "./merchant-creation.component";
import {MerchantAddComponent} from "../merchant-add/merchant-add.component";
import {RouterModule, Routes} from "@angular/router";
import {MerchantBasicComponent} from "../merchant-basic/merchant-basic.component";
import {MerchantKycUploadComponent} from "../merchant-kyc-upload/merchant-kyc-upload.component";
import {LayoutModule} from "../../../../layout/layout.module";
import {SidebarComponent} from "../../../../layout/sidebar/sidebar.component";
import {MerchantAccountListComponent} from "../merchant-account-list/merchant-account-list.component";
import {MerchantMDRComponent} from "../merchant-mdr/merchant-mdr.component";
import {MerchantRiskConfigComponent} from "../merchant-risk-config/merchant-risk-config.component";
import {MerchantBankLiveComponent} from "../merchant-bank-live/merchant-bank-live.component";

const routes: Routes = [
  {
    path: '',
    component: MerchantCreationComponent,
    children: [
      {
        path: '',
        redirectTo: 'merchant-add',
        pathMatch: 'full'
      },
      {
        path: 'merchant-add',
        component: MerchantAddComponent,
      },
      {
        path: 'merchant-account',
        component: MerchantAccountListComponent,
      }, {
        path: 'merchant-basic-setup',
        component: MerchantBasicComponent,
      }, {
        path: 'merchant-mdr',
        component: MerchantMDRComponent,
      }, {
        path: 'merchant-kyc',
        component: MerchantKycUploadComponent,
      }, {
        path: 'merchant-risk',
        component: MerchantRiskConfigComponent
      }, {
        path: 'merchant-bank-live',
        component: MerchantBankLiveComponent
      }
    ]
  }
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    LayoutModule
  ],
  providers: [SidebarComponent]
})
export class MerchantCreationModule {
}
