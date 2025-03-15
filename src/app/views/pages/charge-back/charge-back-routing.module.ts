import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChargeBackListComponent } from './charge-back-list/charge-back-list.component';
import { ChargeBackComponent } from './charge-back/charge-back.component';

const routes: Routes = [
  {
    path: '',
    data: {breadcrumb: {alias: 'Chargeback'}},
    children: [
      {path: '', data: {breadcrumb: {alias: 'ChargeBack Management'}}, component: ChargeBackComponent},
      {path: 'chargeBackList', data: {breadcrumb: {alias: 'Chargeback List'}}, component: ChargeBackListComponent},
      


    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChargeBackRoutingModule { }
