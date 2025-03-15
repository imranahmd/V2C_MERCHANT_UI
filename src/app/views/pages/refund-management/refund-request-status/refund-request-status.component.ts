import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RefundManagementService } from '../refund-management.service';
import {
  ColDef,
  GridReadyEvent,
  PaginationChangedEvent,
  FilterModifiedEvent,
  FilterOpenedEvent,
  GridApi,
  ICellRendererComp,
  ICellRendererParams,

  RowClickedEvent,
} from 'ag-grid-community';
import { environment } from 'src/environments/environment';
import { AlertService } from 'src/app/_services/alert.service';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { csvToJson } from 'src/app/util/csvjson';
import { moreThanOneWhiteSpaceValidator } from 'src/app/common/common.validators';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx'
const { API_URL, defaultPageSizeArr, defaultPageSize } = environment;
@Component({
  selector: 'app-refund-request-status',
  templateUrl: './refund-request-status.component.html',
  styleUrls: ['./refund-request-status.component.scss']
})
export class RefundRequestStatusComponent implements OnInit {
  refundStatusForm: FormGroup
  Resdata: any;
  gridApi: any;
  collectionSize: number = 0;
  currentPage: number = 1;
  //pageSize: number = 10;
  pageSize: number = defaultPageSize || 10;

  pageSizeArr: any = defaultPageSizeArr;
  public rowData!: any[];
  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 150,
    filter: false,
    resizable: true
  };
  public columnDefs: ColDef[] = []
  
  refundTypeData: any;
  refundStatusData: any;
  Search_By: any = [];
  refundStatusdata: any = false;
  submitForm1: boolean = false
  loading: boolean = false;
  currDate: any = new Date();
  pastDate: any = new Date("2000-01-01");
  columnDefsCopy: ColDef[] = [...(this.columnDefs.filter((col) => !col?.hide))];
  tableSelectedColumn: ColDef[] = [...(this.columnDefs.filter((col) => !col?.hide))];
  merchantID: any;


  constructor(private fb: FormBuilder, private refundService: RefundManagementService, private alertService: AlertService,) {


    this.refundStatusForm = fb.group({
      SearchBy: [, [Validators.maxLength(50),Validators.required]],
      FromDate: ['', [Validators.required]],
      ToDate: ['', [Validators.required]],
      transactionId: ['', [Validators.maxLength(40)]],
      merchantTransactionId: ['', [Validators.maxLength(40),moreThanOneWhiteSpaceValidator()]],
      refundId: ['', [Validators.maxLength(40)]],
      refundType: [, [Validators.maxLength(50)]],
      refundStatus: [, [Validators.maxLength(50)]]

    })
    this.refundStatusdata = false
  }


  get refundListFilter() {
    return this.refundStatusForm as FormGroup;
  }

  ngOnInit(): void {debugger
    this.MerchnatList()
    this.RefundType()
    this.RefundStatus()
    this.Search_By = [{ FieldValue: 'Transaction Date', FieldText: 'Transaction Date' },
    { FieldValue: 'Refund Date', FieldText: 'Refund Date' },]
    this.columnDefs = [
      { field: 'Refund Id', tooltipField: 'Refund Id', headerName: 'Refund Id' },
      { field: 'Agg Transaction Id', tooltipField: 'Agg Transaction Id', headerName: 'Agg Transaction Id' },
      { field: 'Merchant Transaction Id', tooltipField: 'Merchant Transaction Id', headerName: 'Merchant Transaction Id' },
      // { field: 'Merchant Id', tooltipField: 'Merchant Id', headerName: 'Merchant Id' },
      { field: 'Transaction Amount', tooltipField: 'Transaction Amount', headerName: 'Transaction Amount' },
      { field: 'Refund Amount', tooltipField: 'Refund Amount', headerName: 'Refund Amount' },
      { field: 'Refund_Process_date', tooltipField: 'Refund_Process_date', headerName: 'Refund Process Date' },
      { field: 'Refund Type', tooltipField: 'Refund Type', headerName: 'Refund Type' },
      { field: 'Refund Status', tooltipField: 'Refund Status', headerName: 'Refund Status' },
      // { field: 'Added_On', tooltipField: 'Added_On', headerName: 'Added On' },

    ];
    
    this.columnDefsCopy = [...(this.columnDefs.filter((col) => !col?.hide))];
    this.tableSelectedColumn = [...(this.columnDefs.filter((col) => !col?.hide))];
    
   
     }
    



  updateSelectedTimeslots(event: any) {
    if (event.target.checked) {
      if (this.tableSelectedColumn.indexOf(this.columnDefs[parseInt(event.target.value)]) < 0) {
        // this.tableSelectedColumn.push(this.columnDefs[parseInt(event.target.value)]);
        this.tableSelectedColumn.splice(parseInt(event.target.value), 0, this.columnDefs[parseInt(event.target.value)]);
      }
    } else {
      if (this.tableSelectedColumn.indexOf(this.columnDefs[parseInt(event.target.value)]) > -1) {
        this.tableSelectedColumn.splice(this.tableSelectedColumn.indexOf(this.columnDefs[parseInt(event.target.value)]), 1);
      }
    }
    this.gridApi.setColumnDefs(this.tableSelectedColumn)
    this.gridApi.setDefaultColDef(this.defaultColDef);
  }


  onExportCSV() {
    // @ts-ignore
    var random3 = Math.floor(Math.random() * 10000000000 + 1);
    var today = new Date();
    var referenceId = today.getFullYear().toString() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2) + "_" + (("0" + today.getHours())).slice(-2) + "-" + (("0" + today.getMinutes())).slice(-2) + "-" + (("0" + today.getSeconds())).slice(-2)
    var fileName = '1Pay_' + referenceId
    var params = {
      skipHeader: false,
      skipFooters: true,
      allColumns: true,
      onlySelected: false,
      suppressQuotes: true,
      fileName: fileName + '.csv',
      columnSeparator: ','
    };

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
            tempRec[col?.field.trim()] = (curr[`"${col?.field.trim()}"`] || curr[`"${col?.headerName?.trim()}"`]).replace(/\"/g, '')
          }

        }
      })
      expData.push(tempRec);
    })
    this.exportAsExcelFile(expData,fileName)
  }

  dataRendered(params: any) {
    params.api.sizeColumnsToFit();
  }




  MerchnatList() {
    const merchantdata = {
      "name": ""
    };
    this.refundService.getAllMerchantList(merchantdata).subscribe((res: any) => {
      this.Resdata = res

    })
  }

  RefundType() {
    let data = {
      "Type": "30",
      "Value": ""
    }
    this.refundService.getRefundType(data).subscribe((res: any) => {
      this.refundTypeData = res

    })

  }

  RefundStatus() {
    let data = {
      "Type": "31",
      "Value": ""
    }
    this.refundService.getRefundType(data).subscribe((res: any) => {
      this.refundStatusData = res

    })

  }

  onGridReady(params: any) {
    this.gridApi = params.api;
  }

  onPaginationChange(param: PaginationChangedEvent | any) {
    console.log(param)
    this.gridApi.paginationGoToPage(param - 1)
  }

  onPageSizeChanges($event: Event) {
    $event.preventDefault();
    this.gridApi.paginationSetPageSize(this.pageSize)
    this.gridApi.refreshCells()
  }



  onSubmit(formvalue: any) {debugger
    console.log("formvalue", formvalue)
    this.merchantID=localStorage.getItem('user')
    let refundRrquest = {
      "MerchantId": this.merchantID,
      "Paymentsid": formvalue.transactionId || "",
      "merchanTransactionId": formvalue.merchantTransactionId || "",
      "fromDate": formvalue.FromDate || "",
      "toDate": formvalue.ToDate || "",
      "refundId": formvalue.refundId || "",
      "refundType": formvalue.refundType || "",
      "refundStatus": formvalue.refundStatus || ""
      ,
      "count": "100",
      "pageNo": 0,
      "Type": 0,
      "SearchBy": formvalue.SearchBy || ""

    }
    if (this.refundStatusForm.valid) {
      if ((2000 > new Date(this.refundStatusForm.controls["FromDate"].value).getFullYear() || new Date(this.refundStatusForm.controls["FromDate"].value) > this.currDate) || (2000 > new Date(this.refundStatusForm.controls["ToDate"].value).getFullYear() || new Date(this.refundStatusForm.controls["ToDate"].value) > this.currDate)) {
        this.alertService.errorAlert({
          text: "Date out of Range!"
        })



        this.refundStatusdata = false
        return
      }
      if (this.refundStatusForm.controls['FromDate'].value > this.refundStatusForm.controls['ToDate'].value) {
        this.alertService.errorAlert({
          text: "From Date can not be greater than To Date!"
        })
        this.rowData = []
        return
      }
      this.loading = true
      document?.getElementById('loading')?.classList.add("spinner-border")
      document?.getElementById('loading')?.classList.add("spinner-border-sm")
      this.refundService.getRefundRequestStatus(refundRrquest).subscribe((data: any) => {
        this.loading = false
        document?.getElementById('loading')?.classList.remove("spinner-border")
        document?.getElementById('loading')?.classList.remove("spinner-border-sm")
        if(data.Status=="Error")
        {
          this.alertService.errorAlert({
            text:data.Message
          })
          this.refundStatusdata=false
          return
        }

        this.refundStatusdata = data
        this.rowData = data?.data || data;
        this.collectionSize = data?.totalCount || data?.data?.length || data?.length;
      })
    }
    else{
      if (this.refundStatusForm.controls['SearchBy'].invalid ) {
        document?.getElementById('SearchBy')?.classList.add("hello")
      } 

      else {
        document?.getElementById('SearchBy')?.classList.remove("hello")
      }
    }

    this.submitForm1 = true
  }

  resetform() {
    this.refundStatusForm.reset()
    this.refundStatusdata = false
    this.submitForm1 = false
    document?.getElementById('SearchBy')?.classList.remove("hello")
  }

  getToday(): string {
    return new Date().toISOString().split('T')[0]
  }

  OnlyCharacterAllowed(event: { which: any; keyCode: any; }): boolean {

    const charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122) || (charCode == 32)) {
      // console.log('charCode restricted is' + charCode)
      return true;
    }
    return false;
  }

  OnlyNumbersAllowed(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    return (charCode > 47 && charCode < 58) || charCode == 46;

  }

  OnlyCharacterNumberAllowed(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode >= 48 && charCode <= 57) || (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122) || (charCode == 32)) {
      // console.log('charCode restricted is' + charCode)
      return true;
    }
    return false;
  }

  public exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
    const excelBuffer: any = XLSX.write(workbook, {bookType: 'xlsx', type: 'buffer'});
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + new Date().getTime() + EXCEL_EXTENSION);
  }

  NoDoubleSpace(event:any){debugger
    var val = event.target.value
    var len = event.target.value.length
    
    const charCode = (event.which) ? event.which : event.keyCode;
    if((val.charCodeAt(len-1)===charCode) &&(len >0)&&(charCode==32)){
     return false
    }
    return true;
    // this.elementRef.nativeElement.querySelector('my-element')
  }



}
