import {DatePipe} from '@angular/common';
import {Component, OnInit, ViewChild} from '@angular/core';
import {FormGroup} from '@angular/forms';
import {ColDef, GridApi, GridReadyEvent, PaginationChangedEvent} from "ag-grid-community";
import {InvoiceFilter, InvoiceReportServiceService} from '../../merchant-master/invoice-report-service.service';
import {AlertService} from 'src/app/_services/alert.service';
import {environment} from 'src/environments/environment';
import {BtnCellRenderer} from 'src/app/common/button-cell-renderer.component';
import {NgSelectComponent} from '@ng-select/ng-select';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { Validators } from '@angular/forms';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx'


const {API_URL, defaultPageSizeArr, defaultPageSize} = environment;

@Component({
  selector: 'app-invoice-report',
  templateUrl: './invoice-report.component.html',
  styleUrls: ['./invoice-report.component.scss']
})
export class InvoiceReportComponent implements OnInit {
  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 170,
    filter: true,
    resizable: true
  };
  MasterReportform: FormGroup
  quickFilterShow: boolean;
  showhide: boolean;
  pastDate: any = new Date("2000-01-01");
  loading: boolean = false;
  dynamicDate: any = this.getToday()
  today = new Date();
  newDate: any = new Date();
  public searchFromDate: string;
  public searchToDate: string;
  public SearchAmount: string = ""
  public invoiceStatus: any
  public columnDefs: ColDef[] = [
    {field: 'id', headerName: 'ID'},
    {field: 'payment_Link_ID', headerName: 'Payment Link ID'},
    {field: 'invoice_Number', headerName: 'Invoice Number'},
    {field: 'amount', headerName: 'Amount'},
    {field: 'validity', headerName: 'Validity'},
    {field: 'dateTime', headerName: 'Created On'},
    {field: 'customer_Name', headerName: 'Customer Name'},
    {field: 'link', headerName: 'Link'},
    {field: 'status', headerName: 'Status'},
    {
      field: 'action', headerName: 'Action', resizable: true, cellRenderer: BtnCellRenderer, cellRendererParams: [
        {
          clicked: async (field: any, param: any) => {debugger

            console.log(param)
            this.showhide = param.data.status
            // await this.modalDeleteComponent.open();
            this.alertService.cancelBox(this.cancelInvoice(param.data.id), {}, {
              html: "Record has been cancelled.!"
            }, () => {
              this.refreshGrid();
            })
          },
          buttonIconClass: 'icon-x-circle',
          buttonVisible: "('${status}'=='Created')",

        },


      ]
    },


  ];
  currentPage: number = 1;
  pageSize: number = defaultPageSize;
  public rowData!: any[];
  collectionSize: number = 0;
  tableSelectedColumn: ColDef[] = [...this.columnDefs];
  public pageSizeArr: any = defaultPageSizeArr;
  response: any;
  totalRecords: number;
  grid: any = true;
  maxDate: any
  @ViewChild('filSearchAmount') private filSearchAmount: any;
  @ViewChild('filinvoiceStatus') private filinvoiceStatus: NgSelectComponent;
  private gridApi!: GridApi;
  private filterObj: any = {};
somePlaceholder: any;
currentNewDate: any= new Date();

  constructor(private datepipe: DatePipe, private invoiceservice: InvoiceReportServiceService, private alertService: AlertService) {
    this.loading = false
  }

  quickFilterShowAction($event: Event) {

    this.quickFilterShow = !this.quickFilterShow
    if (!this.quickFilterShow) {
      this.searchToDate = '';
      this.searchFromDate = '';
      this.SearchAmount = '';
      this.invoiceStatus = '';
      // this.filinvoiceStatus.handleClearClick()
      // this.filSearchAmount.handleClearClick()

      const filter: InvoiceFilter = {}


      if (this.searchFromDate) filter.iFDate = this.searchFromDate;
      if (this.searchToDate) filter.iToDate = this.searchToDate;
      if (this.SearchAmount) filter.iAmount = this.SearchAmount;
      if (this.invoiceStatus) filter.iStatus = this.invoiceStatus

      //  this.invoiceservice.getInvoiceReport(this.pageSize, 0,filter)
      // .subscribe((data) => (console.log("****onGridReady", data),
      //   this.rowData = data?.invoices || data,
      //   this.collectionSize = data?.totalRecords || data?.length));
      this.invoiceservice.getInvoiceReport(this.pageSize, 0, filter)
        .subscribe((data) => (console.log("****onPageSizeChange"), this.rowData = data.invoices || data.merchants || data,
          this.collectionSize = data.totalCount || data.totalRecords,
          this.gridApi.applyTransaction({add: this.rowData})));

    }

  }

  ngOnInit(): void {
    // this.showhide = false;
  document.getElementById("SearchAmount")?.setAttribute("maxlength","10")
    this.grid = false;
  }

  onExportCSV() {
    console.log("asdasdas");
    // @ts-ignore
    var random3 = Math.floor(Math.random() * 10000000000 + 1);
    var today = new Date();
    var referenceId = today.getFullYear().toString() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2) + "_" + (("0" + today.getHours())).slice(-2) + "-" + (("0" + today.getMinutes())).slice(-2) + "-" + (("0" + today.getSeconds())).slice(-2)
    var fileName = 'Invoice_Report' + "_" + referenceId
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
    const filter: InvoiceFilter = {}


    if (this.searchFromDate) filter.iFDate = this.searchFromDate;
    if (this.searchToDate) filter.iToDate = this.searchToDate;
    if (this.SearchAmount) filter.iAmount = this.SearchAmount;
    if (this.invoiceStatus) filter.iStatus = this.invoiceStatus
    this.invoiceservice.getInvoiceReport(this.totalRecords + 3, 0, filter)
      .subscribe((data) => {
        console.log(data)
        const expData: any[] = [];
        (data?.data || data?.invoices
          || data || []).forEach((curr: any) => {
          const tempRec: any = {}
          // this.tableSelectedColumn.forEach((col) => {
          //   if (col?.field) tempRec[col?.field] = curr[col?.field]
          // })
          this.tableSelectedColumn.forEach((col) => {
            if (!(col?.field == "actions")) {
              if (col?.field) tempRec[col?.field] = curr[col?.field]

            }
          })
          expData.push(tempRec);
        })

        // this.JSONToCSVConvertor(data?.data || data?.merchants || data || [],fileName, "Report");
        this.exportAsExcelFile(expData, fileName);
      })
  }

  public exportAsExcelFile(json: any[], excelFileName: string): void {

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([], {
      // @ts-ignore
      header: [...this.tableSelectedColumn.map((col) => col.headerName)]
    });
    // const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
    const wb = XLSX.utils.book_new();
    XLSX.utils.sheet_add_aoa(worksheet, [[...this.tableSelectedColumn.map((col) => col.headerName)]]);
    XLSX.utils.sheet_add_json(worksheet, json, {origin: 'A2', skipHeader: true});
    XLSX.utils.book_append_sheet(wb, worksheet, 'Sheet1');
    const excelBuffer: any = XLSX.write(wb, {bookType: 'xlsx', type: 'buffer'});
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.getFilterInstance('age', (filterParam) => {
      console.log('asdasdad', filterParam);
    })
    this.gridApi.showLoadingOverlay();
    this.rowData=[];
    this.collectionSize = 0;
    // this.gridApi.setQuickFilter(this.globalSearch);

    // return this.invoiceservice.getInvoiceReport(this.pageSize, (this.currentPage - 1))
    //   .subscribe((data) => (console.log("****onGridReady", data),
    //     this.rowData = data?.invoices || data,
    //     this.collectionSize = data?.totalRecords || data?.length,
    //     this.totalRecords = data?.totalRecords || data?.length
    //   ));
  }
  setmaxlength(f:any){
f.form.controls.SearchAmount.setValidators(Validators.maxLength(10))

  }
  onSearchBtnClick($event: Event,f:any) {debugger
    if ((2000 > new Date(this.searchFromDate).getFullYear() ||  new Date(this.searchFromDate) >this.currentNewDate)||(2000>   new Date(this.searchToDate).getFullYear() ||  new Date(this.searchToDate) >this.currentNewDate)) 
    {

      this.alertService.errorAlert({                                                 
        text: "Date out of Range!"
      })
      this.grid = false;                                                                                          
      return
    }
    // this.grid = true;
    if (new Date(this.searchFromDate) > new Date(this.searchToDate)) {
      this.alertService.errorAlert({
        text: "From Date can not be greater than To Date"
      })
      this.rowData = []
      this.collectionSize =0
      return 
    }
    
    // if (f.form.controls.searchFromDate.value != '') {
      f.form.controls.searchToDate.setValidators([Validators.required])
      f.form.controls.searchToDate.updateValueAndValidity()
    // }
    // if (f.form.controls.searchToDate.value != '') {
      f.form.controls.searchFromDate.setValidators([Validators.required])
      f.form.controls.searchFromDate.updateValueAndValidity()
    // }
if(f.form.valid){



    const filter: InvoiceFilter = {}


    if (this.searchFromDate) filter.iFDate = this.searchFromDate;
    if (this.searchToDate) filter.iToDate = this.searchToDate;
    if (this.SearchAmount) filter.iAmount = this.SearchAmount;
    if (this.invoiceStatus) filter.iStatus = this.invoiceStatus;

    this.loading = true
    document?.getElementById('loading')?.classList.add("spinner-border")
    document?.getElementById('loading')?.classList.add("spinner-border-sm")
     this.invoiceservice.getInvoiceReport(this.pageSize, (this.currentPage - 1), filter)
      .subscribe((data) => (console.log("****onSearchBtnClick", data),
          this.loading = false,
          document?.getElementById('loading')?.classList.remove("spinner-border"),
          document?.getElementById('loading')?.classList.remove("spinner-border-sm"),
          data?.message ? this.alertService.simpleAlert(data?.message || 'No Data found') : console.log(data.message),
          data?.message ? this.rowData=[] : console.log(data.message),
          data?.message ? this.collectionSize=0 : console.log(data.message),
          this.rowData = data?.invoices ? data?.invoices : [],
          this.grid = this.rowData,
          //  this.rowData = data?.Details?data?.Details: this.alertService.simpleAlert(data?.message||'No Data found'),
         

          this.collectionSize = data?.totalRecords || data?.TotalRecords || data?.length || 0,
          this.totalRecords = data?.totalRecords || data?.TotalRecords || data?.length
          

          // this.rowData.length <= 0 ? this.alertService.errorAlert({
          //   text: "No data found!"
            
      
           
          // }) 
          // : console.log(this.rowData)
          
      ))

    }
    f.submitted = true;
  }
 
  onPaginationChange(param: PaginationChangedEvent | any) {debugger


    const filter: InvoiceFilter = {}


    if (this.searchFromDate) filter.iFDate = this.searchFromDate;
    if (this.searchToDate) filter.iToDate = this.searchToDate;
    if (this.SearchAmount) filter.iAmount = this.SearchAmount;
    if (this.invoiceStatus) filter.iStatus = this.invoiceStatus;

    // this.gridApi.paginationSetPageSize()
    console.log("onPaginationChange----->", this.pageSize);
    // this.gridApi.applyTransaction({remove: this.rowData})
    // this.gridApi.showLoadingOverlay();
    this.invoiceservice.getInvoiceReport(this.pageSize, (param - 1), filter)
      .subscribe((data) => (this.rowData = data?.invoices || data,
        this.collectionSize = data?.totalCount || data.totalRecords || data.length
        // this.gridApi.applyTransaction({add: this.rowData})
        ));
  }

  // onPageSizeChanges($event: Event) {
  //   console.log($event.preventDefault());
  //   this.gridApi.paginationSetPageSize(this.pageSize)
  //   this.gridApi.applyTransaction({remove: this.rowData})
  //   this.gridApi.showLoadingOverlay();
  //   this.Services.getRisk(this.pageSize, (this.currentPage - 1))
  //     .subscribe((data) => (console.log("****onPageSizeChange"), this.rowData = data.data || data.merchants || data, this.collectionSize = data.totalCount || data.totalRecords, this.gridApi.applyTransaction({add: this.rowData})));

  // }

  // }
  onPageSizeChanges($event: Event) {debugger
    const filter: InvoiceFilter = {}


    if (this.searchFromDate) filter.iFDate = this.searchFromDate;
    if (this.searchToDate) filter.iToDate = this.searchToDate;
    if (this.SearchAmount) filter.iAmount = this.SearchAmount;
    if (this.invoiceStatus) filter.iStatus = this.invoiceStatus;

    this.gridApi.paginationSetPageSize(this.pageSize)
    this.gridApi.applyTransaction({remove: this.rowData})
    this.gridApi.showLoadingOverlay();
    // this.invoiceservice.getInvoiceReport(this.pageSize, (this.currentPage - 1))
    this.invoiceservice.getInvoiceReport(this.pageSize, (this.currentPage - 1), filter)
      .subscribe((data) => (console.log("****onPageSizeChange"), this.rowData = data.invoices || data.merchants || data,
        this.collectionSize = data.totalCount || data.totalRecords,
        this.gridApi.applyTransaction({add: this.rowData})));

  }

  // onPaginationChange(param: PaginationChangedEvent | any) {
  //   this.gridApi.paginationGoToPage(param - 1)

  cancelInvoice(Id: any) {

    let canceldata = {
      "id": Id.toString()
    }
    return this.invoiceservice.changeInvoiceStatus(canceldata)
  }

  resetform(event: any) {
    //
    // this.invoiceStatus = null;
    this.filinvoiceStatus.handleClearClick()
    this.SearchAmount = '';
    this.searchToDate = '';
    this.searchFromDate = '';
    this.grid = false;
    this.rowData = [];
    this.collectionSize = 0;
    this.totalRecords = 0;
 
  }

  refreshGrid() {debugger

    const filter: InvoiceFilter = {}


    if (this.searchFromDate) filter.iFDate = this.searchFromDate;
    if (this.searchToDate) filter.iToDate = this.searchToDate;
    if (this.SearchAmount) filter.iAmount = this.SearchAmount;
    if (this.invoiceStatus) filter.iStatus = this.invoiceStatus;

    return this.invoiceservice.getInvoiceReport(this.pageSize, (this.currentPage - 1),filter)
      .subscribe((data) => (console.log("****onGridReady", data),
        this.rowData = data?.invoices || data,

        this.collectionSize = data?.totalRecords || data?.length));
  }

  getToday(): string {
    return new Date().toISOString().split('T')[0]
  }
  OnlyNumbersAllowed(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    return (charCode > 47 && charCode < 58);

  }
  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + new Date().getTime() + EXCEL_EXTENSION);
  }
  changeDate(event: any,f:any) {
    // this.currentDate = this.searchFromDate
    if (this.searchFromDate === '') {
      f.form.controls.searchToDate.clearValidators();
      f.form.controls.searchToDate.updateValueAndValidity()
    }
  }
  changeEndDate(event: any, f: any) {

    // this.currentDate = this.searchToDate
    if (this.searchToDate === '') {
      f.form.controls.searchFromDate.clearValidators();
      f.form.controls.searchFromDate.updateValueAndValidity()
    }

    // if (this.searchToDate != '') {
    //   this.dynamicDate = this.searchToDate
    // } else {
    this.dynamicDate = this.getToday()
    // }
  }
}
