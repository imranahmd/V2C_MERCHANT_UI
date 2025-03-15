import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { ColDef, FilterChangedEvent, FilterModifiedEvent, FilterOpenedEvent, GridApi, GridReadyEvent, PaginationChangedEvent } from "ag-grid-community";
import { ApiHttpService } from "../../../../../_services/api-http.service";
import { environment } from "../../../../../../environments/environment";
import { DynamicreportService, RiskdashboardFilter } from '../../misreport/dynamicreport.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
// import {ApiHttpService} from 'src/app/_services/api-http.service';
// import {environment} from 'src/environments/environment';
import { DatePipe, Location } from "@angular/common";
import { AlertService } from "../../../../../_services/alert.service";
import { MenusService } from "../../../../../_services/menu.service";
import { MerchantService } from "../../merchant-master/merchant.service";
import { StorageService } from 'src/app/_services/storage.service';
import { UserService } from 'src/app/_services/user.service';
import { DataTable } from 'simple-datatables';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { csvToJson } from 'src/app/util/csvjson';
import { camelize, camelToTile } from "../../../../../util/common";

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx'
const { API_URL, defaultPageSizeArr, defaultPageSize } = environment;

// export interface IRiskActionData {
//   "reason": string,
// }
const statusFormatter = (param: any) => {
  // const sta = param.data.status;
  // @ts-ignore
  // const staObj = param.data.txn_Id.find((d) => d.FieldValue == sta);
  return param?.data?.txn_Id?.replace("'", "");
}

@Component({
  selector: 'app-dynamic-report',
  templateUrl: './dynamic-report.component.html',
  styleUrls: ['./dynamic-report.component.scss']
})
export class DynamicReportComponent implements OnInit {

  public quickFilterShow: boolean = false;
  public searchMID: string;
  public searchFromDate: string;
  public searchToDate: string;
  public searchRiskCode: string
  public searchActionType: string
  // Each Column Definition results in one Column.
  public columnDefs: ColDef[] = [
    // {field: 'reason',headerName: 'Reason'},
  ];
  public rowDatang: any = [];
  currentPage: number = 1;
  public pageSize: number = defaultPageSize;
  public pageSizeArr: any = defaultPageSizeArr;

  // pageSize: number = 10;

  collectionSize: number = 0;

  columnDefsCopy: ColDef[] = [...(this.columnDefs.filter((col) => !col?.hide))];
  tableSelectedColumn: ColDef[] = [...(this.columnDefs.filter((col) => !col?.hide))];
  Resdata: any;
  Actiondata: any;
  Resultdata: any;
  @Input() ConfigData: any;
  @Input() merchantId: string;
  @Input() onConfigChange: EventEmitter<any> = new EventEmitter<any>();
  controls: any = {};
  tickets: any = {}
  field: any
  name = 'Angular';
  isForm6Submitted: boolean = false;
  MerchantForm: FormGroup;
  dynamicForm: FormGroup;
  // dynamicNewForm: FormGroup;
  approvalForm: FormGroup;
  rowData: any;
  body: any = {};
  newbody: any = {};
  fieldData: any;
  fieldDataModified: any = {};
  Beneficernce: any;
  getbody: any
  fieldResponse: any;
  databody: { name: string; };
  tablelistdata: any[];
  myarr: any = [];
  kycStatusData: any;
  kycstatusvalues: any;
  currentURL: boolean;
  // selectdata: any=[];
  instrumentdata: any;
  instrumentvalues: any;
  elementData: string;
  subelement: string;
  fieldvalues: any;
  selectedProject: any;
  selectedProperty: any;
  //   Resultdata: any;
  queryParams: any = {};
  // Beneficernce: any;
  public permissions: any;
  public status: any;
  // fieldData: any;
  riskTypeOptions: any;
  mccOptions: any;
  mcc: any;
  riskType: any;
  remarkData: any;
  dataTable: DataTable;
  errorRemarks: number;
  DynamicData: any;
  inputParameters: any;
  DynamicValues: any;
  FilterInputs: any;
  selectedAttributes: any;
  Id: any;
  userType: any;
  LocalUser: any;
  currentDate: any;
  newDate: any = new Date();
  pastDate: any = new Date("2000-01-01");
  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 150,
    resizable: true,
    // suppressSizeToFit: true,
    // suppressAutoSize: true,
    filter: true,
    autoHeight: true
  };
  loading: boolean = false;
  today: Date;
  random3: any;
  gridColumnApi: any;
  date: Date;
  dt: any = new Date();
  currentNewDate: any = new Date();
  fileName: string;
  ExcelData: any;
  private gridApi!: GridApi;
  private filterObj: any = {};
  totalAmount: any = false;
  Header: any = false;
  JSONData: any = [];
  debitAmout: any=0;
  creditAmout: any=0;
  failedAmout: number=0;
  successAmout: number=0;
  pendingAmout: number=0;

  constructor(private Services: DynamicreportService, private datepipe: DatePipe, private apiHttpService: ApiHttpService,
    private alertService: AlertService,
    private menuService: MenusService,
    private userService: UserService,
    private merchantService: MerchantService,
    private location: Location,
    private route: ActivatedRoute,
    // private apiHttpService: ApiHttpService,
    private storage: StorageService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.loading = false
    route.params.subscribe(val => {
      this.Id = this.route.snapshot.params.Id || "1"
      this.DynamicValues = false;
      this.loadFieldsAndValues(this.Id);

      // this.MerchantForm.get('Mid')?.enable()
      this.isForm6Submitted = false;
    });

  }

  get form6() {
    return this.dynamicForm.controls;
  }

  get form6keys() {
    return Object.keys(this.dynamicForm.controls);
  }

  quickFilterShowAction($event: Event) {
    this.quickFilterShow = !this.quickFilterShow
    if (!this.quickFilterShow) {
      this.searchToDate = '';
      this.searchFromDate = '';
      this.searchMID = '';
      this.searchRiskCode = '';
      this.searchActionType = '';
    }

  }
  onFilterChange(param: FilterChangedEvent | any) {
    debugger
    const filterObj = this.gridApi.getFilterModel();
    this.collectionSize = this.gridApi.getDisplayedRowCount();
    const reqFilterArr: any[] = [];
    Object.keys(filterObj).forEach((field) => {
      reqFilterArr.push({
        filterName: field,
        ...filterObj[field]
      })
    })
    console.log("filterObj=======>", JSON.stringify(reqFilterArr))
  }
  onFilterModified(param: FilterModifiedEvent | any) {
    debugger
    // console.log("onFilterModified----->",param);
    const temp = param?.filterInstance;
    this.filterObj[param?.column?.colId] = temp;
    console.log(temp, ":modified::::::::::::", this.filterObj[param?.column?.colId])
  }

  onFilterOpened(param: FilterOpenedEvent | any) {
    debugger
    console.log("onFilterOpened----->", param);
  }

  onSortChange(event: any) {
    const listOfSortModel = this?.gridColumnApi?.getColumnState().filter((s: any) => s.sort !== null)
    console.log("==Sort===>", JSON.stringify(listOfSortModel));

  }


  JSONToCSVConvertor(JSONData: any, ReportTitle: any, ShowLabel: any) {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

    var CSV = '';
    //Set Report title in first row or line

    CSV += ReportTitle + '\r\n\n';

    //This condition will generate the Label/Header
    if (ShowLabel) {
      var row = "";

      //This loop will extract the label from 1st index of on array
      for (var index in arrData[0]) {

        //Now convert each value to string and comma-seprated
        row += index + ',';
      }

      row = row.slice(0, -1);

      //append Label row with line break
      CSV += row + '\r\n';
    }

    //1st loop is to extract each row
    for (var i = 0; i < arrData.length; i++) {
      var row = "";

      //2nd loop will extract each column and convert it in string comma-seprated
      for (var index in arrData[i]) {
        row += '"' + arrData[i][index] + '",';
      }

      row.slice(0, row.length - 1);

      //add a line break after each row
      CSV += row + '\r\n';
    }

    if (CSV == '') {
      alert("Invalid data");
      return;
    }

    //Generate a file name
    var fileName = "MyReport_";
    //this will remove the blank-spaces from the title and replace it with an underscore
    fileName += ReportTitle?.replace(/ /g, "_");

    //Initialize file format you want csv or xls
    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension

    //this trick will generate a temp <a /> tag
    var link = document.createElement("a");
    link.href = uri;

    //set the visibility hidden so it will not effect on your web-layout
    // link.style = "visibility:hidden";
    link.download = fileName + ".csv";

    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  updateSelectedTimeslots(event: any) {
    if (event.target.checked) {
      if (this.tableSelectedColumn.indexOf(this.columnDefsCopy[parseInt(event.target.value)]) < 0) {
        // this.tableSelectedColumn.push(this.columnDefs[parseInt(event.target.value)]);
        this.tableSelectedColumn.splice(parseInt(event.target.value), 0, this.columnDefsCopy[parseInt(event.target.value)]);

      }
    } else {
      if (this.tableSelectedColumn.indexOf(this.columnDefsCopy[parseInt(event.target.value)]) > -1) {
        this.tableSelectedColumn.splice(this.tableSelectedColumn.indexOf(this.columnDefsCopy[parseInt(event.target.value)]), 1);
      }
    }
    this.gridApi.setColumnDefs(this.tableSelectedColumn);
    this.gridApi.setDefaultColDef(this.defaultColDef);
  }

  public exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  decimalFilter(event: any) {
    const reg = /^-?\d*(\.\d{0,2})?$/;
    let input = event.target.value + String.fromCharCode(event.charCode);

    if (!reg.test(input)) {
      event.preventDefault();
    }
  }

  // onExportCSV() {

  //   console.log("asdasdas");
  //   // @ts-ignore
  //   var random3 = Math.floor(Math.random() * 10000000000 + 1);
  //   var today = new Date();
  //   var referenceId = today.getFullYear().toString() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2)
  //   // + "_" + (("0" + today.getHours())).slice(-2)+"-" +(("0" + today.getMinutes())).slice(-2) +"-" +(("0" + today.getSeconds())).slice(-2)
  //   var fileName = this.dynamicForm?.value?.fromDate == this.dynamicForm?.value?.toDate ? this.FilterInputs?.DisplayName?.replace(' ', '_') + "_" + referenceId : this.FilterInputs?.DisplayName?.replace(' ', '_') + "_" + this.dynamicForm?.value?.fromDate + "_" + this.dynamicForm?.value?.toDate
  //   this.fileName = fileName
  //   // this.JSONToCSVConvertor( this.rowData, this.fileName , 'Report')

  //   var params = {
  //     skipHeader: false,
  //     skipFooters: true,
  //     allColumns: true,
  //     onlySelected: false,
  //     suppressQuotes: true,
  //     fileName: fileName + '.csv',
  //     columnSeparator: ','
  //   };
  //   // this.gridApi.exportDataAsCsv(params)
  //   var fileName = this.dynamicForm?.value?.fromDate == this.dynamicForm?.value?.toDate ? this.FilterInputs?.DisplayName?.replace(' ', '_') + "_" + referenceId : this.FilterInputs?.DisplayName?.replace(' ', '_') + "_" + this.dynamicForm?.value?.fromDate + "_" + this.dynamicForm?.value?.toDate
  //   const expData: any[] = [];
  //   (this.ExcelData || []).forEach((curr: any) => {
  //     const tempRec: any = {}
  //     this.tableSelectedColumn.forEach((col) => {
  //       if (col?.field) tempRec[col?.field] = curr[col?.field]
  //     })
  //     expData.push(tempRec);
  //   })
  //   this.exportAsExcelFile(expData, fileName);
  // }
  onExportCSV() {

    console.log("asdasdas");
    // @ts-ignore
    var random3 = Math.floor(Math.random() * 10000000000 + 1);
    var today = new Date();
    var referenceId = today.getFullYear().toString() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2)
    // + "_" + (("0" + today.getHours())).slice(-2)+"-" +(("0" + today.getMinutes())).slice(-2) +"-" +(("0" + today.getSeconds())).slice(-2)
    var fileName = this.dynamicForm?.value?.fromDate == this.dynamicForm?.value?.toDate ? this.FilterInputs?.DisplayName?.replace(' ', '_') + "_" + referenceId : this.FilterInputs?.DisplayName?.replace(' ', '_') + "_" + this.dynamicForm?.value?.fromDate + "_" + this.dynamicForm?.value?.toDate
    this.fileName = fileName

    var params = {
      skipHeader: false,
      skipFooters: true,
      allColumns: true,
      onlySelected: false,
      suppressQuotes: true,
      fileName: fileName + '.csv',
      columnSeparator: ','
    };
    // this.gridApi.exportDataAsCsv(params)
    const csvString = this.gridApi.getDataAsCsv();
    console.log("=======>", csvString);
    const convJson = csvToJson(csvString);
    console.log("=======>", convJson);
    const expData: any[] = [];
    (convJson || []).forEach((curr: any) => {
      const tempRec: any = {}
      this.tableSelectedColumn.forEach((col) => {
        // @ts-ignore
        if (col?.field != "actions") {
          if (col?.field) {
            // @ts-ignore
            tempRec[col?.field.trim()] = (curr[`"${col?.field.trim()}"`] || curr[`"${col?.headerName?.trim()}"`])
          }

        }
      })
      expData.push(tempRec);
    })

    this.exportAsExcelFile(this.rowData, fileName);
  }


  reformatString(elements: string) {
    return (elements?.replace(/\_/g, " ").charAt(0).toUpperCase() + elements?.replace(/\_/g, " ").slice(1))?.replace(/([A-Z]+)/g, ' $1')?.replace(/^ /, '')
  }

  onGridReady(params: GridReadyEvent<any>) {
    this.gridColumnApi = params.columnApi;
    const allColumnIds: string[] = [];
    this.gridColumnApi.getColumns()!.forEach((column: any) => {
      allColumnIds.push(column.getId());
    });
    this.gridColumnApi.autoSizeColumns(allColumnIds, false);
    params.api.sizeColumnsToFit();
    this.gridApi = params.api;
    this.gridApi.getFilterInstance('age', (filterParam) => {
      console.log('asdasdad', filterParam);
    })
    this.gridApi.showLoadingOverlay();
    // this.gridApi.setQuickFilter(this.globalSearch);
    this.LocalUser = localStorage.getItem("menuItems")
    this.userType = JSON.parse(this.LocalUser).finalMenus[0].ROLENAME
    var d = new Date();
    d.setDate(d.getDate() - 365);
    let data =
    {
      "reportType": "2",
      "reportId": this.Id || "1",
      "userType": this.userType,
      "userId": localStorage.getItem("user"),
      "inputParameters": "merchantName|##amount|##fromDate|" + this.datepipe.transform(d, 'yyyy-MM-dd') + "##toDate|" + this.datepipe.transform(this.newDate, 'yyyy-MM-dd')+ "##Header|Y"
    }
    // {
    //   "reportType": "1",
    //   "reportId": "1",
    //   "inputParameters": ""
    // }
    // return this.Services.getDynamicData(data, this.pageSize, (this.currentPage - 1))
    //   .subscribe((data: any) => {
    //     const self = this;
    //     console.log("****onGridReady", data);
    //     this.rowData = data?.data || data;
    //     this.collectionSize = data?.totalCount || data?.length;
    //     Object.keys(this.rowData[0]).forEach((elements, i) => {
    //       this.columnDefs.push(
    //         {
    //           field: elements,
    //           headerValueGetter: (params) => this.reformatString(elements),
    //           valueFormatter: statusFormatter,
    //           filter: true,
    //           resizable: true,
    //           suppressSizeToFit: false
    //         }
    //       )
    //     });
    //     // this.tableSelectedColumn = [...this.columnDefs];
    //     this.columnDefsCopy = [...(this.columnDefs.filter((col) => !col?.hide))];
    //     this.tableSelectedColumn = [...(this.columnDefs.filter((col) => !col?.hide))];
    //     this.gridApi.setColumnDefs(this.tableSelectedColumn);
    //
    //     setTimeout(() => {
    //       self.gridApi.setRowData(self.rowData)
    //     }, 0)
    //
    //   });

  }

  onSearchBtnClick($event: Event) {
    const filter: RiskdashboardFilter = {}
    if (this.searchMID) filter.Mid = this.searchMID;
    if (this.searchFromDate) filter.From = this.searchFromDate;
    if (this.searchToDate) filter.ToDate = this.searchToDate;
    if (this.searchRiskCode) filter.RiskCode = this.searchRiskCode;
    if (this.searchActionType) filter.RiskStage = this.searchActionType;

    // return this.Services.GetRiskActionLogs(this.pageSize, (this.currentPage - 1), filter)
    //   .subscribe((data:any) => (console.log("****onSearchBtnClick", data), this.rowData = data?.data || data?.merchants || data || [], this.collectionSize = data?.totalCount || data?.totalrecords || data?.totalRecords || data?.length || 0));

  }

  onPaginationChange(param: PaginationChangedEvent | any) {

    this.gridApi.paginationGoToPage(param - 1)
  }

  onPageSizeChanges($event: Event) {
    // const allColumnIds: string[] = [];
    // this.gridColumnApi.getColumns()!.forEach((column:any) => {
    //   allColumnIds.push(column.getId());
    // });
    // this.gridColumnApi.autoSizeColumns(allColumnIds, false);
    console.log($event.preventDefault());
    this.gridApi.paginationSetPageSize(this.pageSize)
    this.gridApi.applyTransaction({ remove: this.rowData })
    this.gridApi.showLoadingOverlay();
    this.gridApi.applyTransaction({ add: this.rowData })
    // this.Services.GetRiskActionLogs(this.pageSize, (this.currentPage - 1))
    //   .subscribe((data) => (console.log("****onPageSizeChange"), this.rowData = data.data || data.merchants || data,
    //    this.collectionSize = data.totalCount || data.totalRecords,

    //     ));

  }

  ngOnInit(): void {
    console.log("======>", camelToTile(camelize('Payments Transaction Id')))
    console.log("======>", camelize('Payments Transaction Id'))
    console.log("======>", camelToTile('Payments Transaction Id'))
  }

  // get form5() {
  //   return this.dynamicNewForm.controls;
  // }

  type(event: any) {
    if (document?.getElementById('amount')?.setAttribute('(keypress)', "decimalFilter($event)")) {
      const reg = /^-?\d*(\.\d{0,2})?$/;
      let input = event.target.value + String.fromCharCode(event.charCode);

      if (!reg.test(input)) {
        event.preventDefault();
      }
      return true
    } else {
      return true
    }


  }

  MerchnatList() {


    var merchantdata = {
      "name": ""
    }
    this.apiHttpService
      .post(
        `${API_URL}/GetMerchant/`, merchantdata
      )
      .subscribe((res) =>
        (this.Resultdata = res));


  }

  ngAfterViewInit() {
    // this.MerchantForm.get('Mid')?.patchValue(this.merchantId);
    // this.MerchantForm.get('Mid')?.disable()

  }

  changeProject(event: any, control: any) {
    this.dynamicForm.controls[control].setValue(event.target.value)
  }

  setFieldValue(event: Event, value: any) {
    // @ts-ignore
    let selected = event.target['id'];
    // console.log(event.target['id'] , value, "----------->")
    // @ts-ignore
    this[selected] = value
  }

  onNewSubmit(mid: any) {
    this.gridApi.setFilterModel({})
    this.JSONData = []
    // var x = this.dynamicNewForm.value
    var y = this.dynamicForm.value
    this.inputParameters = ""
    this.rowData = []
    this.collectionSize = 0

    Object.keys(this.dynamicForm.value).forEach((element, index: any) => {
      this.body[element] = y[element]
      this.DynamicData.forEach((elements: any) => {
        if (elements.seq == index + 1) {
          this.inputParameters += elements.id + '|' + mid[elements.id] + '##'
        }
      });
    });

    this.LocalUser = localStorage.getItem("menuItems")
    this.userType = JSON.parse(this.LocalUser).finalMenus[0].ROLENAME
    const invalid = [];
    const valid = [];

    const controls = this.dynamicForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    for (const name in controls) {
      if (controls[name].valid) {
        valid.push(name);
      }
    }

    if (this.dynamicForm.invalid) {
      invalid.forEach(element => {
        document?.getElementById(element)?.classList.add("hello")
        document?.getElementById(element)?.classList.add("hello")
      });
    } else {
      valid.forEach(element => {
        document?.getElementById(element)?.classList.remove("hello")
        document?.getElementById(element)?.classList.remove("hello")
      });

    }


    if (this.dynamicForm.valid) {

      if ((2000 > new Date(this.dynamicForm.controls["fromDate"].value).getFullYear() ) || (2000 > new Date(this.dynamicForm.controls["toDate"].value).getFullYear() )) {
        // || new Date(this.dynamicForm.controls["fromDate"].value) > this.currentNewDate
        // || new Date(this.dynamicForm.controls["toDate"].value) > this.currentNewDate
        this.alertService.errorAlert({
          text: "Date out of Range!"
        })
        // this.rowData = []
        // this.collectionSize=0

        this.DynamicValues = false
        return
      }
      if (new Date(this.dynamicForm.controls["fromDate"].value) > new Date(this.dynamicForm.controls["toDate"].value)) {
        this.alertService.errorAlert({
          text: "From Date can not be greater than To Date!"
        })
        this.rowData = []
        this.collectionSize = 0
        return
      }

      // if (this.dynamicNewForm.valid) {
      let data =
      {
        "reportType": "2",
        "reportId": this.Id || "1",
        "userType": this.userType,
        "userId": localStorage.getItem("user"),
        "inputParameters":
          this.inputParameters.slice(0, -2)
        //+ '##toDate|2022-11-30'
        // "merchantName|M0002##amount|##fromDate|2022-07-30##toDate|2022-11-30"
      }
      this.loading = true
      document?.getElementById('loading')?.classList.add("spinner-border")
      document?.getElementById('loading')?.classList.add("spinner-border-sm")
      this.Services.getDynamicData(data, this.pageSize, (this.currentPage - 1))
        .subscribe((data: any) => {
          this.loading = false
          document?.getElementById('loading')?.classList.remove("spinner-border")
          document?.getElementById('loading')?.classList.remove("spinner-border-sm")
          console.log("****onGridReady", data)
          this.DynamicValues = data?.data || data;
          this.collectionSize = data?.totalCount || data?.length
          if (this.DynamicValues?.length > 0) {
            console.log("========>")
            this.columnDefs = [];
            this.rowData = data?.data || data, this.collectionSize = data?.totalCount || data?.length
            this.ExcelData = data?.data || data
            this.debitAmout = 0
            this.creditAmout = 0
            this.failedAmout = 0
            this.successAmout = 0
            this.pendingAmout = 0
              this.rowData.forEach((element: any) => {debugger
                // this.Header = elements
                if (element.transferType == 'CREDIT' && this.Id == '3') {
                  this.creditAmout += parseInt(element['transAmount'])
                }
                if (element.transferType == 'DEBIT' && this.Id == '3') {
                  this.debitAmout += parseInt(element['transAmount'])
                }
                if (element.Status == 'Pending' && this.Id == '2') {
                  this.pendingAmout += parseInt(element['Amount'])
                }
                if (element.Status == 'Success' && this.Id == '2') {
                  this.successAmout += parseInt(element['Amount'])
                }
                if (element.Status == 'Failed' && this.Id == '2') {
                  this.failedAmout += parseInt(element['Amount'])
                }
  

              });
            Object.keys(this.rowData[0]).forEach((elements, i) => {
              debugger
              var totalAmount: any = 0
              if (elements.includes('Amount') || elements.includes('amount')) {
                this.rowData.forEach((element: any) => {

                  // this.Header = elements
                  totalAmount += parseInt(element[elements])
                });
                this.JSONData.push({ "Key": elements, "Value": totalAmount })
              }

              this.columnDefs.push(
                {
                  field: elements,
                  headerName: camelToTile(camelize(elements)),
                  headerValueGetter: (params) => this.reformatString(elements),
                  filter: true,
                  // filterParams: {
                  //   buttons: ['reset', 'apply'],
                  // },
                  sortable: true,
                  resizable: true,
                  suppressSizeToFit: false,
                  cellClassRules: {
                    "text-warning": (params) => {
                      debugger
                      return (params.value == 'Pending' || params.value == 'To')
                    },
                    "text-danger": (params) => {
                      debugger
                      return (params.value == 'Failed' || params.value == 'F')
                    },
                    "text-success": (params) => {
                      debugger
                      return (params.value == 'Success' || params.value == 'Ok')
                    }
                  }
                }
              )
            });
            console.log(this.JSONData)

            // this.tableSelectedColumn = [...this.columnDefs];
            this.columnDefsCopy = [...(this.columnDefs.filter((col) => !col?.hide))];
            this.tableSelectedColumn = [...(this.columnDefs.filter((col) => !col?.hide))];
            this.gridApi.setColumnDefs(this.tableSelectedColumn);
            // this.gridApi.setRowData(this.rowData)
          } else {
            this.DynamicValues = false
            this.alertService.errorAlert({
              text: "No data found!"
            })
          }

        })

    }
    this.isForm6Submitted = true

  }

  setvalue(dy: any, control: any, value: any) {
    this.dynamicForm.controls[control].setValue(value)
  }

  loadFieldsAndValues(Id: any) {
    this.LocalUser = localStorage.getItem("menuItems")
    this.userType = JSON.parse(this.LocalUser).finalMenus[0].ROLENAME
    var data = {
      "reportType": "1",
      "reportId": Id || "1",
      "userType": this.userType,
      "userId": localStorage.getItem("user"),
      "inputParameters": ""
    }
    this.Services.getDynamicData(data, this.pageSize, (this.currentPage - 1))
      .subscribe((data: any) => {
        console.log("****onGridReady", data)
        this.FilterInputs = data || Array.isArray(data) ? data[0] : {}
        this.DynamicData = JSON.parse(data[0].Inputparameters)
        console.log("****onGridReady", this.DynamicData)
        let controls: any = {}
        this.DynamicData.forEach((res: any) => {

          let validationsArray: any = [];
          // var JSONvalue = JSON.parse(res.Validator)
          // Object.keys(JSONvalue).forEach((val: any) => {
          //
          if (res.optional === "N") {
            validationsArray.push(
              Validators.required
            );
          } else {
            validationsArray = []
          }
          // this.dt = new Date()
          // var Datevalue= this.datepipe.transform(this.dt, 'dd-MM-yyyy')
          // if (res.data_type == 'date') {
          //   controls[res.id] = new FormControl(Datevalue, validationsArray);

          // } else {
          controls[res.id] = new FormControl(null, validationsArray);

          // }
        })


        this.dynamicForm = new FormGroup(
          {
            ...controls,
            // mcc: new FormControl(''),
            // riskType: new FormControl(''),
          }
          // this.tickets

        );
      })


  }
  OnlyCharacterAllowed(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122) || (charCode == 32)) {
      // console.log('charCode restricted is' + charCode)
      return true;
    }
    return false;
  }

  resetform(event: any) {
    this.dynamicForm.reset()
    this.DynamicValues = false
    document.querySelectorAll('input[type="date"]').forEach(element => {
      element?.setAttribute('min', '')
    });
    // document.getElementById('toDate')?.setAttribute('min','')
    this.dynamicForm.markAsUntouched(); // Reset form data
    this.dynamicForm.updateValueAndValidity(); // Reset form data
  }

  changeDate(value: any) {

    if (value == 'fromDate') {
      // this.currentDate = this.dynamicForm.controls[value].value
      // document.getElementById('toDate')?.setAttribute('min', this.dynamicForm.controls[value].value)

    }
    if (value == 'toDate') {
      // this.currentDate = this.dynamicForm.controls[value].value
      if (this.dynamicForm.controls[value].value == '') {
        var d = this.dt.getFullYear().toString() + "-" + ("0" + (this.dt.getMonth() + 1)).slice(-2) + "-" + ("0" + this.dt.getDate()).slice(-2)
        document.getElementById('fromDate')?.setAttribute('max', d)
      } else {
        // document.getElementById('fromDate')?.setAttribute('max', this.dynamicForm.controls[value].value)
      }
    }
    // if(value =='toDate' ){
    //   this.currentNewDate = ''
    // }
  }

  onSubmit(mid: any) {
    if (!(mid)) {
      return
    }
    this.instrumentvalues = ""
    this.fieldvalues = ""
    this.LocalUser = localStorage.getItem("menuItems")
    this.userType = JSON.parse(this.LocalUser).finalMenus[0].ROLENAME
    // localStorage.setItem("Mid", mid.Mid)
    var data = {
      "reportType": "1",
      "reportId": this.Id || "1",
      "userType": this.userType,
      "userId": localStorage.getItem("user"),
      "inputParameters": ""
    }
    this.Services.getDynamicData(data, this.pageSize, (this.currentPage - 1))
      .subscribe((data: any) => {
        console.log("****onGridReady", data);
        this.DynamicData = JSON.parse(data[0].Inputparameters);
        console.log("****onGridReady", this.DynamicData)
        let controls: any = {}
        this.DynamicData.forEach((res: any) => {

          const validationsArray: any = [];
          // var JSONvalue = JSON.parse(res.Validator)
          // Object.keys(JSONvalue).forEach((val: any) => {
          //
          if (res.optional === "N") {
            validationsArray.push(
              Validators.required
            );
          }
          controls[res.id] = new FormControl(null, validationsArray);
        })


        this.dynamicForm = new FormGroup(
          {
            ...controls,
            // mcc: new FormControl(''),
            // riskType: new FormControl(''),
          }
          // this.tickets

        );
      })


  }

  OnlyNumbersAllowed(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    return (charCode > 47 && charCode < 58);

  }

  noInputAllowed(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    return false;

  }

  removeQuotes(field_value: any) {
    return field_value?.replace(/"/g, '')
  }

  fun(id: any) {
    document?.getElementById(id)?.classList.add("hey")
  }

  funover(id: any) {
    document?.getElementById(id)?.classList.remove("hey")
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + new Date().getTime() + EXCEL_EXTENSION);
  }
}
