import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ColDef, GridApi, GridReadyEvent, PaginationChangedEvent} from "ag-grid-community";
import {ApiHttpService} from "../../../../_services/api-http.service";
import {environment} from "../../../../../environments/environment";
import {ChartGraphsService, RiskMerchantFilter} from '../chart-graphs.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ModalConfig} from 'src/app/common/modal/modal.config';
import {ModalComponent} from 'src/app/common/modal/modal.component';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AlertService} from 'src/app/_services/alert.service';

const {API_URL} = environment;

// const API_URL = 'http://localhost:8000'
export interface IRiskData {

}

@Component({
  selector: 'app-transaction-risk-chart',
  templateUrl: './transaction-risk-chart.component.html',
  styleUrls: ['./transaction-risk-chart.component.scss']
})
export class TransactionRiskChartComponent implements OnInit {
  @Input() onMerchantRisk: EventEmitter<any> = new EventEmitter<any>();
  Merchantdata: any;

  // constructor() {
  //   this.onMerchantRisk.subscribe((res) => (console.log("data=========>", this.Merchantdata = res)))
  // }

  // ngOnInit(): void {
  //
  //   this.onMerchantRisk.subscribe((res) => (console.log("data=========>", this.Merchantdata = res)))

  // }

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
  public searchRiskCode: string
  public searchRiskStage: string
  public searchRiskFlag: string
  // Each Column Definition results in one Column.
  public columnDefs: ColDef[] = [
    // {field: 'RiskCode'},
    // {field: 'ObservedValue'},
    // {field: 'RiskPercentage'},
    // {field: 'RiskMessage'},
    // {field: 'MID'},
    // {field: 'merchant_name'},
    // {field: 'RiskFlag'},
    // {field: 'EstimatedValue'},
    // {field: 'rid'},
    // {field: 'TransTime'},
    // {field: 'RiskStage'},
  ];
  public rowDatang: any = [];
  currentPage: number = 1;
  pageSize: number = 10;
  public rowData!: IRiskData[];
  collectionSize: number = 0;
  tableSelectedColumn: ColDef[] = [...this.columnDefs];
  Resdata: any;
  Riskdatadata: any;
  RiskFlagdatadata: any;
  Resultdata: any;
  headerdata: string[];
  rowDatas: any;
  queryParams: any;
  merchantList: ModalConfig;
  @Output() RiskSelectEvent: EventEmitter<any> = new EventEmitter<any>();
  Mid: any;
  ParamMID: any;
  RiskChartForm: FormGroup;
  public categoryDefaultValue: any
  status: any;
  statusButton: any;
  private gridApi!: GridApi;
  private filterObj: any = {};
  @ViewChild('modalRisk') private RiskTransactionComponent: ModalComponent;

  constructor(private Services: ChartGraphsService, private alertService: AlertService, private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, private apiHttpService: ApiHttpService) {
    this.RiskChartForm = this.formBuilder.group({
      Mid: ['', [Validators.required]]
    })
    this.MerchnatList()
    this.route.queryParams
      .subscribe(params => {
        console.log("account list params-------------->", params);
        this.queryParams = params;
        this.Mid = params.MerchantId
        if (this.Mid) {
          this.currentStatus()
        }
        this.RiskChartForm.controls['Mid'].setValue(this.Mid)
        this.Merchantdata = {
          "MerchantId": params.MerchantId,
          "level": params.level,
          "RiskCode": params.RiskCode
        }
        this.apiHttpService
          .post(
            `${API_URL}/GetRiskTransaction`, this.Merchantdata
          )
          .subscribe((data) =>
            (console.log("****onGridReady" + data), this.rowData = data,
              this.rowData = data?.data || data))
      })
    if (!(this.queryParams.MerchantId) || this.queryParams.MerchantId == '') {
      this.categoryDefaultValue = "All"
    } else {
      this.categoryDefaultValue = this.queryParams.MerchantId
      // this.RiskChartForm.controls['Mid'].setValue(this.queryParams.MerchantId)

    }
  }

  closeModalRisk($event: any) {
    if (!$event.showModal) {
      this.RiskTransactionComponent.close();
      this.currentStatus()
    }
  }

  async MerchantStatus(event: any, status: any) {

    // if(  this.status ==status){
    //   this.statusButton = true
    // }else{
    //   this.statusButton = false
    // }
    // this.statusButton = status
    var newdata = {
      "Mid": this.Mid,
      "Status": status,
      "Remark": "",
      "Approvel_type": status,
      "Date": "",
      "Added_By": localStorage.getItem("user")
    }
    this.RiskSelectEvent.emit(newdata);
    return await this.RiskTransactionComponent.open();

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


    //  this.onMerchantRisk.subscribe((res) => (console.log("data=========>", this.Merchantdata = res),
    //  this.apiHttpService
    //  .post(
    //    `${API_URL}/GetRiskTransaction`, this.Merchantdata
    //  )
    //  .subscribe((res) =>
    //    (console.log("****onGridReady" + res), this.Resultdata = res))

    //  ))

    this.RiskCodes();
    this.RiskStages()
    this.RiskFlag()

    this.merchantList = {
      modalTitle: "Approval Status",
      modalSize: 'lg',
      hideCloseButton(): boolean {
        return true;
      },
      hideDismissButton(): boolean {
        return true
      }
    }
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

  //   ngAfterViewInit(){
  //      this.onMerchantRisk.subscribe((res) => (console.log("data=========>", this.Merchantdata = res),
  //  this.apiHttpService
  //  .post(
  //    `${API_URL}/GetRiskTransaction`, this.Merchantdata
  //  )
  //  .subscribe((res) =>
  //    (console.log("****onGridReady" + res), this.rowDatas = res,
  //    this.headerdata = Object.keys(this.rowDatas[0])

  //    ))

  //  ))
  //   }
  getdownload(url: string, data: any) {
    return this.apiHttpService.post(url, data)
  }

  MerchnatList() {


    var merchantdata = {
      "name": ""
    }
    this.getdownload(`${API_URL}/getRiskMid/`, merchantdata).subscribe((res: any) => {

      this.Resultdata = res;

    })
    // this.apiHttpService
    //   .post(
    //     `${API_URL}/getRiskMid/`, merchantdata
    //   )
    //   .subscribe((res:any) =>
    //     (console.log("****onGridReady" + res),
    //      this.Resultdata = res));


  }

  merchantlistdata(event: any) {

    if (event.target.innerText.replace(/\s/g, '') == "" || event.target.innerText.replace(/\s/g, '') == '×') {
      return
    }
    this.Mid = event.target.innerText.replace(/\s/g, '') || this.ParamMID
    console.log(event.target.innerText.replace(/\s/g, ''))
    this.Merchantdata = {
      "MerchantId": event.target.innerText.replace(/\s/g, ''),
      "level": this.queryParams.level,
      "RiskCode": this.queryParams.RiskCode
    }
    this.apiHttpService
      .post(
        `${API_URL}/GetRiskTransaction`, this.Merchantdata
      )
      .subscribe((data) =>
        (console.log("****onGridReady" + data), this.rowData = data,
            this.rowData = data?.data || data,
            this.currentStatus()

        ))
  }

  currentStatus() {

    this.Services.getMerchant(this.Mid).subscribe((newdata) =>
      (console.log("****onGridReady" + newdata), this.status = newdata[0].status,
          this.statusButton = this.status
      ))

  }

  previousStep(event: any) {
    this.router.navigate(['/dashboard/riskanalysis'], {
      queryParams: {
        "MerchantId": this.queryParams.MerchantId,
        "level": this.queryParams.level
      }
    })
  }

  reformatString(elements: any) {
    return (elements.replace(/\_/g, " ").charAt(0).toUpperCase() + elements.replace(/\_/g, " ").slice(1)).replace(/([A-Z]+)/g, ' $1').replace(/^ /, '')
  }

  onGridReady(params: GridReadyEvent<IRiskData>) {

    this.gridApi = params.api;
    this.gridApi.getFilterInstance('age', (filterParam) => {
      console.log('asdasdad', filterParam);
    })
    this.gridApi.showLoadingOverlay();
    // this.gridApi.setQuickFilter(this.globalSearch);
    // this.onMerchantRisk.subscribe((res: any) => (console.log("data=4=====>", this.Merchantdata = res),
    this.apiHttpService
      .post(
        `${API_URL}/GetRiskTransaction`, this.Merchantdata
      )
      .subscribe((data) =>
        (console.log("****onGridReady" + data), this.rowData = data,
            this.rowData = data?.data || data,
            this.collectionSize = data?.totalCount || data?.length,
            Object.keys(this.rowData[0]).forEach((elements, i) => {
              this.columnDefs.push(
                {
                  field: elements,
                  headerValueGetter: (params) => this.reformatString(elements),
                  filter: 'agNumberColumnFilter'
                }
              )
            }),
            // this.columnDefs.push(
            //   {
            //     field: 'action', resizable: true, cellRenderer: BtnCellRenderer, cellRendererParams: [
            //       {
            //         // clicked: async (field: any, param: any) => {
            //         //   console.log((`${field} was clicked` + param))
            //         //   this.tableInfo = param.data
            //         //   await this.modalblockedComponent.open();

            //         // },

            //         clicked: async (event: any, param:any) => {
            //           this.tableInfo = param.data.MID

            //           console.log("ad--------------->",this.tableInfo,  param.data.MID
            //           )
            //           this.BlockedmerchantSelectEvent.emit(this.tableInfo);
            //           return await this.modalblockedComponent.open();
            //         },
            //         buttonIconClass: 'icon-edit-2'
            //       }


            //     ]


            //   },
            //     ),
            this.tableSelectedColumn = this.columnDefs
            ,
            this.gridApi.setColumnDefs(this.columnDefs),
            this.gridApi.setRowData(data)


        ))


    // ))


  }

  onSearchBtnClick($event: Event) {
    const filter: RiskMerchantFilter = {}
    if (this.searchMID) filter.Mid = this.searchMID;
    if (this.searchFromDate) filter.ToDate = this.searchFromDate;
    if (this.searchToDate) filter.From = this.searchToDate;
    if (this.searchRiskCode) filter.RiskCode = this.searchRiskCode;
    if (this.searchRiskStage) filter.RiskStage = this.searchRiskStage;
    if (this.searchRiskFlag) filter.RiskFlag = this.searchRiskStage;

    return this.Services.getRisk(this.pageSize, (this.currentPage - 1), filter)
      .subscribe((data) => {
        console.log("****onSearchBtnClick", data),
          this.rowData = data?.data || data?.merchants || data || [],
          this.collectionSize = data?.totalCount || data?.totalrecords || data?.totalRecords || data?.length || 0
        if (this.rowData.length <= 0) {
          this.alertService.errorAlert({text: "No data found!"})
          return
        }

      });
  }

  onPageSizeChanges($event: Event) {
    console.log($event.preventDefault());
    this.gridApi.paginationSetPageSize(this.pageSize)
    this.gridApi.applyTransaction({remove: this.rowData})
    this.gridApi.showLoadingOverlay();
    this.Services.getRisk(this.pageSize, (this.currentPage - 1))
      .subscribe((data) => (console.log("****onGridReady", data), this.rowData = data.data || data.merchants || data, this.collectionSize = data.totalCount || data.totalRecords || data.length, this.gridApi.applyTransaction({add: this.rowData})));
  }

  onPaginationChange(param: PaginationChangedEvent | any) {
    this.gridApi.paginationGoToPage(param - 1)
    // this.gridApi.paginationSetPageSize()
    // console.log("onPaginationChange----->", param, this.pageSize);
    // this.gridApi.applyTransaction({remove: this.rowData})
    // this.gridApi.showLoadingOverlay();
    // this.Services.getRisk(this.pageSize, (param - 1))
    //   .subscribe((data) => (console.log("****onGridReady", data), this.rowData = data.data || data.merchants || data, this.collectionSize = data.totalCount || data.totalRecords || data.length, this.gridApi.applyTransaction({add: this.rowData})));
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


}
