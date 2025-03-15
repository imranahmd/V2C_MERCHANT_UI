import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MerchantCreateComponent} from './merchant-create.component';
import {RouterModule, Routes} from "@angular/router";

const routes: Routes = [
  {
    path: '',
    component: MerchantCreateComponent
  }
];

@NgModule({
  declarations: [
    MerchantCreateComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ]
})
export class MerchantCreateModule {
}
