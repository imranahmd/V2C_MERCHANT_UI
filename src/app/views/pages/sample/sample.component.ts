import {Component, OnInit} from '@angular/core';
import {
  ColDef,
  FilterChangedEvent,
  FilterModifiedEvent,
  FilterOpenedEvent,
  GridApi,
  GridReadyEvent,
  ICellRendererComp,
  ICellRendererParams,
  PaginationChangedEvent,
  RowClickedEvent,
} from 'ag-grid-community';
import {environment} from "../../../../environments/environment";
import {ApiHttpService} from "../../../_services/api-http.service";
import {debounceTime, distinctUntilChanged, map, Observable} from "rxjs";
import {BtnCellRenderer} from "../../../common/button-cell-renderer.component";

const {API_URL} = environment;

export interface IOlympicData {
  athlete: string;
  age: number;
  country: string;
  year: number;
  date: string;
  sport: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}


export class DetailCellRenderer implements ICellRendererComp {
  eGui!: HTMLElement;

  init(params: ICellRendererParams) {
    this.eGui = document.createElement('div');
    this.eGui.innerHTML = '<h1 style="padding: 20px;">My Custom Detail</h1>';
  }

  getGui() {
    return this.eGui;
  }

  refresh(params: ICellRendererParams): boolean {
    return false;
  }
}


@Component({
  selector: 'app-sample',
  templateUrl: './sample.component.html',
  styleUrls: ['./sample.component.scss']
})
export class SampleComponent implements OnInit {
  public detailCellRenderer = new DetailCellRenderer;
  public columnDefs: ColDef[] = [
    {field: 'athlete', cellRenderer: 'agGroupCellRenderer'},
    {field: 'age', filter: 'agNumberColumnFilter', maxWidth: 100},
    {field: 'country', resizable: true},
    {field: 'year', maxWidth: 100},
    {
      field: 'date',
      filter: 'agDateColumnFilter',
      filterParams: filterParams,
    },
    {field: 'sport'},
    {field: 'gold', filter: 'agNumberColumnFilter'},
    {field: 'silver', filter: 'agNumberColumnFilter'},
    {field: 'bronze', filter: 'agNumberColumnFilter'},
    {field: 'total', filter: false},
    {
      field: 'Actions',
      minWidth: 200,
      filter: false,
      resizable: true,
      cellRenderer: BtnCellRenderer,
      cellRendererParams: [
        {
          clicked: (field: any) => {
            alert(`${field} was clicked`);
          },
          buttonIconClass: 'icon-download'
        }, {
          clicked: (field: any) => {
            alert(`${field} was clicked`);
          },
          buttonIconClass: 'icon-plus'
        }, {
          clicked: (field: any) => {
            alert(`${field} was clicked`);
          },
          buttonIconClass: 'icon-eye'
        }, {
          clicked: (field: any) => {
            alert(`${field} was clicked`);
          },
          buttonIconClass: 'icon-eye'
        }, {
          clicked: (field: any) => {
            alert(`${field} was clicked download`);
          },
          buttonIconClass: 'icon-user'
        }
      ]
    },
  ];
  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    filter: true,
  };
  public rowData!: IOlympicData[];
  tablecolumn: any;
  tableSelectedColumn: ColDef[] = [...this.columnDefs];
  currentPage: number = 1;
  pageSize: number = 10;
  globalSearch: string = '';
  collectionSize: number = 0;
  private gridApi!: GridApi;
  private filterObj: any = {};

  constructor(private apiHttpService: ApiHttpService) {
  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term: string) => term.length < 2 ? []
        : this.rowData.filter(v => (v.athlete.toLowerCase().indexOf(term.toLowerCase()) > -1)).map(v => v.athlete).slice(0, 10))
    );

  onGridReady(params: GridReadyEvent<IOlympicData>) {
    this.gridApi = params.api;
    this.gridApi.getFilterInstance('age', (filterParam) => {
      console.log('asdasdad', filterParam);
    })
    this.gridApi.showLoadingOverlay();

    return this.apiHttpService
      .get(
        `${API_URL}/getData?pageSize=${this.pageSize}&page=${(this.currentPage - 1)}`
      )
      .subscribe((data) => (console.log("****onGridReady"), this.rowData = data.data, this.collectionSize = data.totalCount));
  }

  onBtnC(e: Event) {
    e.preventDefault();
    console.log("asdasdas");
    // @ts-ignore
    return this.apiHttpService
      .get(
        `${API_URL}/getData`
      )
      // @ts-ignore
      .subscribe((data) => (this.gridApi.applyTransaction({add: data})));
  }

  onExportCSV() {
    console.log("asdasdas");
    // @ts-ignore
    var random3 = Math.floor(Math.random() * 10000000000 + 1);
    var today = new Date();
    var referenceId = today.getFullYear().toString() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2) + "_" + (("0" + today.getHours())).slice(-2) + "-" + (("0" + today.getMinutes())).slice(-2) + "-" + (("0" + today.getSeconds())).slice(-2)
    var fileName = 'Payments_' + referenceId
    var params = {
      skipHeader: false,
      skipFooters: true,
      allColumns: true,
      onlySelected: false,
      suppressQuotes: true,
      fileName: fileName + '.csv',
      columnSeparator: ','
    };
    this.gridApi.exportDataAsCsv(params)
  }

  onPaginationChange(param: PaginationChangedEvent | any) {

    // this.gridApi.paginationSetPageSize()
    console.log("onPaginationChange----->", param, this.pageSize);
    this.gridApi.applyTransaction({remove: this.rowData})
    this.gridApi.showLoadingOverlay();
    this.apiHttpService
      .get(
        `${API_URL}/getData?pageSize=` + this.pageSize + '&page=' + (param - 1)
      )
      .subscribe((data) => (console.log("****onGridReady"), this.rowData = data.data, this.collectionSize = data.totalCount, this.gridApi.applyTransaction({add: this.rowData})));
  }

  onRowClicked(param: RowClickedEvent | any) {
    console.log("Row Clicked", param);
  }

  onRowDoubleClicked(param: RowClickedEvent | any) {
    console.log("Row Clicked", param);
    param.node.setExpanded(!param.node.expanded);
  }

  onFilterChange(param: FilterChangedEvent | any) {
    console.log("onFilterChange----->", param);
    console.log("this.filterObj----->", this.filterObj?.age?.appliedModel);
    // this.rowData.length = 0
    this.gridApi.applyTransaction({remove: this.rowData})
    this.gridApi.showLoadingOverlay();

    const self = this;
    // setTimeout(()=>{
    self.apiHttpService
      .get(
        `${API_URL}/getData?pageSize=${this.pageSize}&page=${(this.currentPage - 1)}`
      )
      // @ts-ignore
      .subscribe((data) => (console.log("****onFilterChange"), self.gridApi.applyTransaction({
        add: data.filter((dt: any) => {
          if (dt.age == self.filterObj?.age?.appliedModel.filter)
            return dt;
        })
      })));
    // }, 1000)

  }

  onFilterModified(param: FilterModifiedEvent | any) {
    // console.log("onFilterModified----->",param);
    const temp = param?.filterInstance;
    console.log("onFilterModified---values-->", param?.column?.colId, param?.filterInstance);
    // ;
    console.log("onFilterModified---values-->", temp);
    this.filterObj[param?.column?.colId] = temp;
  }

  onFilterOpened(param: FilterOpenedEvent | any) {
    console.log("onFilterOpened----->", param);
  }

  ngOnInit(): void {
  }

  onPageSizeChanges($event: Event) {
    console.log($event.preventDefault());
    this.gridApi.paginationSetPageSize(this.pageSize)
    this.gridApi.applyTransaction({remove: this.rowData})
    this.gridApi.showLoadingOverlay();
    this.apiHttpService
      .get(
        `${API_URL}/getData?pageSize=` + this.pageSize + '&page=' + (this.currentPage - 1)
      )
      .subscribe((data) => (console.log("****onPageSizeChange"), this.rowData = data.data, this.collectionSize = data.totalCount, this.gridApi.applyTransaction({add: this.rowData})));

  }
}

var filterParams = {
  // @ts-ignore
  comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
    var dateAsString = cellValue;
    if (dateAsString == null) return -1;
    var dateParts = dateAsString.split('/');
    var cellDate = new Date(
      Number(dateParts[2]),
      Number(dateParts[1]) - 1,
      Number(dateParts[0])
    );
    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
      return 0;
    }
    if (cellDate < filterLocalDateAtMidnight) {
      return -1;
    }
    if (cellDate > filterLocalDateAtMidnight) {
      return 1;
    }
  },
  browserDatePicker: true,
};
