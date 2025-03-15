import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChargeBackRoutingModule } from './charge-back-routing.module';
import { ChargeBackComponent } from './charge-back/charge-back.component';
import { ChargeBackListComponent } from './charge-back-list/charge-back-list.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  NgbAccordionModule,
  NgbAlertModule,
  NgbCollapseModule,
  NgbDropdownModule,
  NgbModule,
  NgbNavModule,
  NgbPaginationModule,
  NgbTimepickerModule,
  NgbTypeaheadModule
} from "@ng-bootstrap/ng-bootstrap";
import { AgGridModule } from "ag-grid-angular";
import { CustomCommonModule } from 'src/app/common/common.module';

@NgModule({
  declarations: [
    ChargeBackComponent,
    ChargeBackListComponent
  ],
  imports: [
    CommonModule,
    ChargeBackRoutingModule,
    FormsModule, ReactiveFormsModule,
    AgGridModule,
    NgbAccordionModule,
    NgbAlertModule,
    NgbCollapseModule,
    NgbDropdownModule,
    NgbModule,
    NgbNavModule,
    NgbPaginationModule,
    NgbTimepickerModule,
    NgbTypeaheadModule,
    CustomCommonModule]
})
export class ChargeBackModule { }
