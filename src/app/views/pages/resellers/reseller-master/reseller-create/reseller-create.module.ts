import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ResellerCreateComponent} from './reseller-create.component';
import {RouterModule, Routes} from "@angular/router";

const routes: Routes = [
  {
    path: '',
    component: ResellerCreateComponent
  }
];

@NgModule({
  declarations: [
    ResellerCreateComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ]
})
export class ResellerCreateModule {
}
