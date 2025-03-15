import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ResellerCreationComponent} from "./reseller-creation.component";
import {ResellerAddComponent} from "../reseller-add/reseller-add.component";
import {RouterModule, Routes} from "@angular/router";
import {ResellerBasicComponent} from "../reseller-basic/reseller-basic.component";
import {ResellerKycUploadComponent} from "../reseller-kyc-upload/reseller-kyc-upload.component";
import {LayoutModule} from "../../../../layout/layout.module";
import {SidebarComponent} from "../../../../layout/sidebar/sidebar.component";
import {ResellerAccountListComponent} from "../reseller-account-list/reseller-account-list.component";
import {ResellerMDRComponent} from "../reseller-mdr/reseller-mdr.component";
import {ResellerRiskConfigComponent} from "../reseller-risk-config/reseller-risk-config.component";

const routes: Routes = [
  {
    path: '',
    component: ResellerCreationComponent,
    children: [
      {
        path: '',
        redirectTo: 'reseller-add',
        pathMatch: 'full'
      },
      {
        path: 'reseller-add',
        component: ResellerAddComponent,
      },
      {
        path: 'reseller-account',
        component: ResellerAccountListComponent,
      },
      {
        path: 'reseller-basic-setup',
        component: ResellerBasicComponent,
      },
      {
        path: 'reseller-mdr',
        component: ResellerMDRComponent,
      },
      {
        path: 'reseller-kyc',
        component: ResellerKycUploadComponent,
      },
      {
        path: 'reseller-risk',
        component: ResellerRiskConfigComponent,
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
export class ResellerCreationModule {
}
