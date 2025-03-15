import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ResellerBasicComponent} from './reseller-master/reseller-basic/reseller-basic.component';
import {ResellerAddComponent} from './reseller-master/reseller-add/reseller-add.component';
import {ResellerEditComponent} from './reseller-master/reseller-edit/reseller-edit.component';
import {ResellerMasterComponent} from "./reseller-master/reseller-master.component";
import {ResellerKycUploadComponent} from "./reseller-master/reseller-kyc-upload/reseller-kyc-upload.component";
import {SidebarComponent} from "../../layout/sidebar/sidebar.component";

const routes: Routes = [
  {
    path: '',
    component: ResellerMasterComponent,
    children: [
      {
        path: '',
        redirectTo: 'reseller-master',
        pathMatch: 'full'
      },
      {
        path: 'reseller-master',
        data: {breadcrumb: {alias: 'Reseller Master'}},
        component: ResellerMasterComponent
      },

    ]
  },
  {
    path: 'reseller-create',
    data: {breadcrumb: {alias: 'Reseller Create'}},
    // component: ResellerCreationComponent,
    loadChildren: () => import('./reseller-master/reseller-create/reseller-create.module').then(m => m.ResellerCreateModule)
  },
  {
    path: 'reseller-creation',
    data: {breadcrumb: {alias: 'Reseller Add'}},
    // component: ResellerCreationComponent,
    loadChildren: () => import('./reseller-master/reseller-creation/reseller-creation.module').then(m => m.ResellerCreationModule)
  },
  {
    path: 'reseller-kyc-upload',
    data: {breadcrumb: {alias: 'Kyc Upload'}},
    component: ResellerKycUploadComponent
  },
  {
    path: 'reseller-basic',
    data: {breadcrumb: {alias: 'Basic Setup'}},
    component: ResellerBasicComponent
  },
  {
    path: 'reseller-edit',
    data: {breadcrumb: {alias: 'Reseller Edit'}},
    component: ResellerEditComponent
  },
  {
    path: 'reseller-add',
    data: {breadcrumb: {alias: 'Reseller Add'}},
    component: ResellerAddComponent
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [SidebarComponent]
})
export class ResellerListRoutingModule {
}
