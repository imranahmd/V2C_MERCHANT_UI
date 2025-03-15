import {NgModule} from '@angular/core';
import {CustomTableComponent} from "./custom-table/custom-table.component";
import {CommonComponent} from './common.component';
import {NgSelectModule} from "@ng-select/ng-select";
import {FormsModule} from "@angular/forms";
import {AgGridModule} from "ag-grid-angular";
import {NgbDropdownModule, NgbPaginationModule, NgbTypeaheadModule} from "@ng-bootstrap/ng-bootstrap";
import {ModalComponent} from './modal/modal.component';
import {BtnCellRenderer} from "./button-cell-renderer.component";
import {CommonModule} from "@angular/common";
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import {BlockCopyPasteDirective} from "./block-copy-paste.directive";
import {DisableControlDirective} from "./disable-control.directive";
import {DropzoneDirective} from "./dropzone.directive";
import {DndDirective} from "./dnd.directive";
import {ProgressComponent} from "./progress/progress.component";
import { CustomAgTextFilterComponent } from './custom-ag-text-filter/custom-ag-text-filter.component';
import { CustomAgNumberFilterComponent } from './custom-ag-number-filter/custom-ag-number-filter.component';
import { CustomAgDateFilterComponent } from './custom-ag-date-filter/custom-ag-date-filter.component';


@NgModule({
  declarations: [
    CustomTableComponent,
    CommonComponent,
    ModalComponent,
    BtnCellRenderer,
    BlockCopyPasteDirective,
    DisableControlDirective,
    DropzoneDirective,
    DndDirective,
    ProgressComponent,
    CustomAgTextFilterComponent,
    CustomAgNumberFilterComponent,
    CustomAgDateFilterComponent
  ],
  imports: [
    NgSelectModule,
    FormsModule,
    AgGridModule,
    NgbPaginationModule,
    NgbDropdownModule,
    NgbTypeaheadModule,
    CommonModule,
    SweetAlert2Module.forRoot()
  ],
  exports: [
    CustomTableComponent,
    ModalComponent,
    BtnCellRenderer,
    BlockCopyPasteDirective,
    DisableControlDirective,
    DropzoneDirective,
    DndDirective,
    ProgressComponent
  ]
})
export class CustomCommonModule {
  constructor() {
  }
}
