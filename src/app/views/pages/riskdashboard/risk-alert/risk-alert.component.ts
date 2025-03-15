import {Component, OnInit} from '@angular/core';
import {ColDef, GridApi, GridReadyEvent, PaginationChangedEvent} from "ag-grid-community";
import {ApiHttpService} from "../../../../_services/api-http.service";
import {environment} from "../../../../../environments/environment";
import {RiskdashboardFilter, RiskdashboardService} from '../riskdashboard.service';
import {AlertService} from 'src/app/_services/alert.service';

const {API_URL, defaultPageSizeArr, defaultPageSize} = environment;

// const API_URL = 'http://localhost:8000'
export interface IRiskData {

}

@Component({
  selector: 'app-risk-alert',
  templateUrl: './risk-alert.component.html',
  styleUrls: ['./risk-alert.component.scss']
})
export class RiskAlertComponent implements OnInit {
  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 170,
    filter: true,
    resizable: true
  };
  public quickFilterShow: boolean = false;
  public searchMID: string;
  public searchFromDate: string;
  public searchToDate: string;
  public searchRiskCode: string = ""
  public searchRiskStage: string = ""
  public searchRiskFlag: string
  // Each Column Definition results in one Column.
  public columnDefs: ColDef[] = [
    {field: 'MID', headerName: 'MID'},
    {field: 'merchant_name', headerName: 'Merchant Name'},
    {field: 'RiskCode', headerName: 'Risk Code'},
    {field: 'RiskMessage', headerName: 'Risk Message'},
    {field: 'RiskPercentage', headerName: 'Risk Percentage'},
    {field: 'RiskStage', headerName: 'Risk Stage'},
    {field: 'TransactionTime', headerName: 'Transaction Time'},
    {field: 'EstimatedValue', headerName: 'Estimated Value'},
    {field: 'ObservedValue', headerName: 'Observed Value'},
    // {field: 'RiskFlag',headerName: 'Risk Flag'},
    // {field: 'rid',headerName: 'Rid'},
  ];
  public rowDatang: any = [];
  currentPage: number = 1;
  pageSize: number = defaultPageSize;
  public rowData: IRiskData[] = [];
  collectionSize: number = 0;
  tableSelectedColumn: ColDef[] = [...this.columnDefs];
  Resdata: any;
  Riskdatadata: any;
  RiskFlagdatadata: any;
  Resultdata: any;
  public pageSizeArr: any = defaultPageSizeArr;
  private gridApi!: GridApi;
  private filterObj: any = {};

  constructor(private Services: RiskdashboardService, private alertService: AlertService, private apiHttpService: ApiHttpService) {
  }

  quickFilterShowAction($event: Event) {
    this.quickFilterShow = !this.quickFilterShow
    if (!this.quickFilterShow) {
      this.searchToDate = '';
      this.searchFromDate = '';
      this.searchMID = '';
      this.searchRiskCode = '';
      this.searchRiskStage = '';
      this.searchRiskFlag = '';

      // this.refreshGrid();
    }

  }

  ngOnInit(): void {

    this.RiskCodes();
    this.RiskStages()
    this.RiskFlag()
    this.MerchnatList()

  }

  onExportCSV() {
    console.log("asdasdas");
    // @ts-ignore
    var random3 = Math.floor(Math.random() * 10000000000 + 1);
    var today = new Date();
    var referenceId = today.getFullYear().toString() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2) + "_" + (("0" + today.getHours())).slice(-2) + "-" + (("0" + today.getMinutes())).slice(-2) + "-" + (("0" + today.getSeconds())).slice(-2)
    var fileName = 'Risk_Alert' + "_" + referenceId
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

  onGridReady(params: GridReadyEvent<IRiskData>) {
    this.gridApi = params.api;
    this.gridApi.getFilterInstance('age', (filterParam) => {
      console.log('asdasdad', filterParam);
    })
    this.gridApi.showLoadingOverlay();
    // this.gridApi.setQuickFilter(this.globalSearch);

    return this.Services.getRisk(this.pageSize, (this.currentPage - 1))
      .subscribe((data) => {
        console.log("****onGridReady", data)
          ,
          this.rowData = data?.Details || data || [],
          this.collectionSize = data?.TotalRecords || data?.length
        if (this.rowData.length <= 0) {
          this.alertService.errorAlert({text: "No data found!"})
          return
        }
      });
  }

  onSearchBtnClick($event: Event) {
    const filter: RiskdashboardFilter = {}
    if (this.searchMID) filter.Mid = this.searchMID;
    if (this.searchFromDate) filter.From = this.searchFromDate;
    if (this.searchToDate) filter.ToDate = this.searchToDate;
    if (this.searchRiskCode) filter.RiskCode = this.searchRiskCode;
    if (this.searchRiskStage) filter.RiskStage = this.searchRiskStage;
    if (this.searchRiskFlag) filter.RiskFlag = this.searchRiskFlag;

    return this.Services.getRisk(this.pageSize, (this.currentPage - 1), filter)
      .subscribe((data) => {
        console.log("****onSearchBtnClick", data),
          this.rowData = data?.Details ? data?.Details : [],
          //  this.rowData = data?.Details?data?.Details: this.alertService.simpleAlert(data?.message||'No Data found'),
          //  data?.message?this.alertService.simpleAlert(data?.message||'No Data found'):console.log(data.message),
          this.collectionSize = data?.totalCount || data?.TotalRecords || data?.length || 0
        if (this.rowData.length <= 0) {
          this.alertService.errorAlert({text: "No data found!"})
          return
        }
      });
  }

  // onPageSizeChanges($event: Event) {
  //   console.log($event.preventDefault());
  //   this.gridApi.paginationSetPageSize(this.pageSize)
  //   this.gridApi.applyTransaction({remove: this.rowData})
  //   this.gridApi.showLoadingOverlay();
  //   this.Services.getRisk(this.pageSize, (this.currentPage - 1))
  //     .subscribe((data) => (console.log("****onPageSizeChange"), this.rowData = data.data || data.merchants || data, this.collectionSize = data.totalCount || data.totalRecords, this.gridApi.applyTransaction({add: this.rowData})));

  // }

  onPaginationChange(param: PaginationChangedEvent | any) {
    const filter: RiskdashboardFilter = {}
    if (this.searchMID) filter.Mid = this.searchMID;
    if (this.searchFromDate) filter.From = this.searchFromDate;
    if (this.searchToDate) filter.ToDate = this.searchToDate;
    if (this.searchRiskCode) filter.RiskCode = this.searchRiskCode;
    if (this.searchRiskStage) filter.RiskStage = this.searchRiskStage;
    if (this.searchRiskFlag) filter.RiskFlag = this.searchRiskFlag;
    // this.gridApi.paginationSetPageSize()
    console.log("onPaginationChange----->", this.pageSize);
    this.gridApi.applyTransaction({remove: this.rowData})
    this.gridApi.showLoadingOverlay();
    this.Services.getRisk(this.pageSize, (param - 1), filter)
      .subscribe((data) => (this.rowData = data?.Details || data,
        this.collectionSize = data?.totalCount || data.TotalRecords || data.length,
        this.gridApi.applyTransaction({add: this.rowData})));
  }

  // onPaginationChange(param: PaginationChangedEvent | any) {
  //   this.gridApi.paginationGoToPage(param - 1)
  // }
  onPageSizeChanges($event: Event) {

    this.gridApi.paginationSetPageSize(this.pageSize)
    this.gridApi.applyTransaction({remove: this.rowData})
    this.gridApi.showLoadingOverlay();
    this.Services.getRisk(this.pageSize, (this.currentPage - 1))
      .subscribe((data) => (console.log("****onPageSizeChange"), this.rowData = data.Details || data.merchants || data, this.collectionSize = data.totalCount || data.TotalRecords, this.gridApi.applyTransaction({add: this.rowData})));

  }

  RiskCodes() {
    let riskcodelist = {
      "Type": "9",
      "Value": ""
    }

    this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`, riskcodelist
      )
      .subscribe((res) =>
        (console.log("****onGridReady" + res), this.Resdata = res));
  }

  RiskStages() {
    let RiskStageslist = {
      "Type": "10",
      "Value": ""
    }

    this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`, RiskStageslist
      )
      .subscribe((res) =>
        (console.log("****onGridReady" + res), this.Riskdatadata = res));
  }

  RiskFlag() {
    let RiskFlaglist = {
      "Type": "11",
      "Value": ""
    }

    this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`, RiskFlaglist
      )
      .subscribe((res) =>
        (console.log("****onGridReady" + res), this.RiskFlagdatadata = res));
  }

  //get merchant By Name
  MerchnatList() {
    let reqData = {
      "name": ""
    }
    console.log("request body", reqData)
    this.Services.getMerchantBYName(reqData).subscribe((res: any) => {
      this.Resultdata = res
      console.log("merchant mid", res)
    });
  }


}




