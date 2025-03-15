import {Component, OnInit, TemplateRef} from '@angular/core';
import {ICellRendererParams} from 'ag-grid-community';

@Component({
  selector: 'app-reusable-grid',
  templateUrl: './reusable-grid.component.html',
  styleUrls: ['./reusable-grid.component.scss'],
})
export class ReusableGridComponent implements OnInit {
  public template: TemplateRef<any>;
  public context: any = {};

  constructor() {
  }

  ngOnInit() {
  }

  // gets called once before the renderer is used
  agInit(params: ICellRendererParams) {
    this.setTemplateAndParams(params);
  }

  // gets called whenever the cell refreshes
  refresh(params: ICellRendererParams) {
    this.setTemplateAndParams(params);
  }

  setTemplateAndParams(params: any) {
    this.template = params['ngTemplate'];
    this.context = {
      rowInfo: {
        rowData: params.data,
        rowId: params.node.id,
        columnName: params.colDef.headerName,
      },
    };
  }
}
