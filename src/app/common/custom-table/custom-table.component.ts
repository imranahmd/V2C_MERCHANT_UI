import {Component, Input, OnInit} from '@angular/core';
import {
  ColDef,
  FilterChangedEvent,
  FilterModifiedEvent,
  FilterOpenedEvent,
  GridApi,
  GridReadyEvent,
  PaginationChangedEvent,
  RowClickedEvent
} from "ag-grid-community";
import {debounceTime, distinctUntilChanged, map, Observable} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {ApiHttpService} from "../../_services/api-http.service";
import {DetailCellRenderer, IOlympicData} from "../../views/pages/sample/sample.component";
import {NgbTypeaheadSelectItemEvent} from "@ng-bootstrap/ng-bootstrap";
import {environment} from "../../../environments/environment";

const { defaultPageSizeArr, defaultPageSize } = environment
@Component({
  selector: 'app-custom-table',
  templateUrl: './custom-table.component.html',
  styleUrls: ['./custom-table.component.scss']
})
export class CustomTableComponent implements OnInit {
  @Input('pageSizeArr') pageSizeArr: number[] = defaultPageSizeArr;
  @Input('pageSize') pageSize: number = defaultPageSize;
  @Input('renderType') renderType: 'client' | 'server' | undefined;
  public apiUrl = '';
  public detailCellRenderer = new DetailCellRenderer;
  public columnDefs: ColDef[] = [
    {field: 'athlete', cellRenderer: 'agGroupCellRenderer'},
    {field: 'age', filter: 'agNumberColumnFilter', maxWidth: 100},
    {field: 'country'},
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
  ];
  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 150,
    filter: false,
  };
  public rowData!: IOlympicData[];
  tablecolumn: any;
  tableSelectedColumn: ColDef[] = [...this.columnDefs];
  currentPage: number = 1;
  globalSearch: string = '';
  collectionSize: number = 0;
  private gridApi!: GridApi;
  private filterObj: any = {};

  constructor(private http: HttpClient, private apiHttpService: ApiHttpService) {
  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term: string) => term.length < 2 ? []
        : this.rowData.filter(v => (v.athlete.toLowerCase().indexOf(term.toLowerCase()) > -1)).map(v => v.athlete).slice(0, 10))
    );
  quickFilterShow: any;
  permissions: any;
  searchMerName: any;
  searchMID: any;
  searchFromDate: any;
  searchToDate: any;

  onGridReady(params: GridReadyEvent<IOlympicData>) {
    this.gridApi = params.api;
    this.gridApi.getFilterInstance('age', (filterParam) => {
      console.log('asdasdad', filterParam);
    })
    this.gridApi.showLoadingOverlay();
    const queryparams = new HttpParams()
      .set('pageSize', this.pageSize)
      .set('page', this.currentPage - 1);

    return this.apiHttpService
      .get(
        `${this.apiUrl}`,
        {params: queryparams}
      )
      .subscribe((data) => (console.log("****onGridReady"), this.rowData = data.data, this.collectionSize = data.totalCount));
  }

  onBtnC(e: Event) {
    e.preventDefault();
    console.log("asdasdas");
    // @ts-ignore
    const queryparams = new HttpParams()
      .set('pageSize', this.pageSize)
      .set('page', this.currentPage - 1);
    return this.apiHttpService
      .get(
        `${this.apiUrl}`,
        {params: queryparams}
      )
      // @ts-ignore
      .subscribe((data) => (this.gridApi.applyTransaction({add: data})));
  }

  onExportCSV() {
    console.log("asdasdas");
    // @ts-ignore
    var random3 = Math.floor(Math.random() * 10000000000 + 1);
    var today = new Date();
    var referenceId = today.getFullYear().toString() + "-" +("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2) + "_" + (("0" + today.getHours())).slice(-2)+"-" +(("0" + today.getMinutes())).slice(-2) +"-" +(("0" + today.getSeconds())).slice(-2)
    var fileName = 'Payments_'+ referenceId
    var params = {
      skipHeader: false,
      skipFooters: true,
      allColumns: true,
      onlySelected: false,
      suppressQuotes: true,
      fileName: fileName+'.csv',
      columnSeparator: ','
    };
    this.gridApi.exportDataAsCsv(params)
  }

  onPaginationChange(param: PaginationChangedEvent | any) {

    // this.gridApi.paginationSetPageSize()
    console.log("onPaginationChange----->", param, this.pageSize);
    this.gridApi.applyTransaction({remove: this.rowData})
    this.gridApi.showLoadingOverlay();
    const queryparams = new HttpParams()
      .set('pageSize', this.pageSize)
      .set('page', this.currentPage - 1);
    this.apiHttpService
      .get(
        `${this.apiUrl}`,
        {params: queryparams}
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
    const queryparams = new HttpParams()
      .set('pageSize', this.pageSize)
      .set('page', this.currentPage - 1);
    const self = this;
    // setTimeout(()=>{
    self.apiHttpService
      .get(
        `${this.apiUrl}`,
        {params: queryparams}
      )
      // @ts-ignore
      .subscribe((data) => (console.log("****onFilterChange"), self.gridApi.applyTransaction({
        add: data.filter((dt:any) => {
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
    $event.preventDefault();
    this.gridApi.paginationSetPageSize(this.pageSize)
    this.gridApi.applyTransaction({remove: this.rowData})
    this.gridApi.showLoadingOverlay();
    if(this.renderType =="server"){
      const queryparams = new HttpParams()
        .set('pageSize', this.pageSize)
        .set('page', this.currentPage - 1);
      this.apiHttpService
        .get(
          `${this.apiUrl}`,
          {params: queryparams}
        )
        .subscribe((data) => (console.log("****onPageSizeChange"), this.rowData = data.data, this.collectionSize = data.totalCount, this.gridApi.applyTransaction({add: this.rowData})));

    }

  }

  quickFilterShowAction($event: MouseEvent) {

  }

  updateSelectedTimeslots($event: Event) {

  }

  onAddNew($event: MouseEvent) {

  }

  searchQuickFilter($event: NgbTypeaheadSelectItemEvent<any>) {

  }

  onGlobalSearchChange($event: any) {

  }

  onSearchBtnClick($event: MouseEvent) {

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
