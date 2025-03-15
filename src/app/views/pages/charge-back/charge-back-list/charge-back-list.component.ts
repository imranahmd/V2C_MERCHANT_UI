import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ColDef, GridApi, PaginationChangedEvent, RowClickedEvent } from 'ag-grid-community';
import { environment } from 'src/environments/environment';
import { ChargeBackServiceService } from '../charge-back-service.service';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { ExcelExportParams } from "ag-grid-community/dist/lib/interfaces/iExcelCreator";
import * as moment from "moment";
import { ModalComponent } from 'src/app/common/modal/modal.component';
import { ModalConfig } from 'src/app/common/modal/modal.config';
import { BtnCellRenderer } from 'src/app/common/button-cell-renderer.component';
import { AlertService } from 'src/app/_services/alert.service';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx'
const { API_URL, defaultPageSizeArr, defaultPageSize } = environment;

@Component({
  selector: 'app-charge-back-list',
  templateUrl: './charge-back-list.component.html',
  styleUrls: ['./charge-back-list.component.scss']
})
export class ChargeBackListComponent implements OnInit {
  chargeBackForm: FormGroup

  @Output() BlockedmerchantSelectEvent: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('modalbloked') private modalblockedComponent: ModalComponent;

  public columnDefs: ColDef[] = [
    { field: 'CBID', headerName: 'Chargeback ID' },
    { field: 'MID', headerName: 'AUTH ID' },
    { field: 'TxnId', headerName: 'Transaction Id' },
    { field: 'Amount', headerName: 'Amount' },
    { field: 'Remarks', headerName: 'Remarks' },
    { field: 'CB_Date', headerName: 'Chargeback Date' },
    { field: 'Merch_CutOff_Date', headerName: 'Merchant CutOff Date' },
    { field: 'Status_Description', headerName: 'Status Description' },
    { field: 'File_Name', headerName: 'File Name' },


    {
      field: 'action', headerName: 'Action', resizable: true, cellRenderer: BtnCellRenderer, cellRendererParams: [
        {
          clicked: async (field: any, param: any) => {debugger

            this.download = param.data.File_Name

            if(this.download=="No Document")
            {
              this.alertService.errorAlert({html:this.download})
              return
            }
            else{
              this.download1(this.download)

            }


           


          },
          buttonIconClass: ' icon-download-cloud'
        }
      ]
    },


  ];
  currentPage: number = 1;
  pageSize: number = defaultPageSize || 10;
  public rowData!: any[];
  pageSizeArr: any = defaultPageSizeArr;
  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 150,
    filter: true,
    resizable: true
  };
  // public columnDefs: ColDef[] = []
  modalConfigBlocked: ModalConfig;
  columnDefsCopy: ColDef[] = [...(this.columnDefs.filter((col) => !col?.hide))];
  tableSelectedColumn: ColDef[] = [...(this.columnDefs.filter((col) => !col?.hide))];
  collectionSize: number = 0;
  private gridApi!: GridApi;
  display: any = false;
  loading: boolean = false;
  Data: any;
  formValue: any;
  currDate: any = new Date();
  download: any;
  constructor(private chargebackservie: ChargeBackServiceService, private alertService: AlertService,) {
    this.chargeBackForm = new FormGroup({
      transactionid: new FormControl('',[Validators.maxLength(45)]),
      formdate: new FormControl('', [Validators.required]),
      todate: new FormControl('', [Validators.required]),


    })
    this.loading = false
  }

  ngOnInit(): void {

    this.modalConfigBlocked = {
      modalTitle: "ChargeBack Details",
      modalSize: 'lg',
      hideDismissButton(): boolean {
        return true
      },
      hideCloseButton(): boolean {
        return true
      }
    }

  }


  onExportCSV() {
    // @ts-ignore
    var today = new Date();
    var referenceId = today.getFullYear().toString() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2) + "_" + (("0" + today.getHours())).slice(-2) + "-" + (("0" + today.getMinutes())).slice(-2) + "-" + (("0" + today.getSeconds())).slice(-2)
    var fileName = 'Chargeback_List' + "_" + referenceId
    var params = {
      skipHeader: false,
      skipFooters: true,
      allColumns: true,
      onlySelected: false,
      suppressQuotes: true,
      columnSeparator: ','
    };
    // this.gridApi.exportDataAsCsv(params)

    const csvSTring = this.gridApi.getDataAsCsv(params);
    console.log("------------->", csvSTring);
    const convJson = this.csvJSON(csvSTring)
    console.log(convJson)
    const expData: any[] = [];
    (convJson || []).forEach((curr: any) => {
      const tempRec: any = {}
      // this.tableSelectedColumn.forEach((col) => {
      //   if (col?.field) tempRec[col?.field] = curr[col?.field]
      // })
      this.tableSelectedColumn.forEach((col) => {
        // console.log(col, "*********************?>>>>>>>")
        if (col?.field != "actions" && col?.headerName != 'Select' && col?.headerName != 'Amount') {
          if (col?.field) { // @ts-ignore
            tempRec[col?.field] = curr[col?.field] || curr[col?.headerName]
          }

        }
      })
      expData.push(tempRec);
    })

    console.log("---------->>>>>>", expData)
    // this.JSONToCSVConvertor(data?.data || data?.merchants || data || [],fileName, "Report");
    this.exportAsExcelFile(expData, fileName);

  }

  public exportAsExcelFile(json: any[], excelFileName: string): void {

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([], {
      // @ts-ignore
      header: [...this.tableSelectedColumn.filter((col) => col?.field != "actions" && col?.headerName != 'Select' && col?.headerName != 'Amount').map((col) => col.headerName)]
    });
    // const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
    const wb = XLSX.utils.book_new();
    XLSX.utils.sheet_add_aoa(worksheet, [[...this.tableSelectedColumn.filter((col) => col?.field != "actions" && col?.headerName != 'Select' && col?.headerName != 'Amount').map((col) => col.headerName)]]);
    XLSX.utils.sheet_add_json(worksheet, json, { origin: 'A2', skipHeader: true });
    XLSX.utils.book_append_sheet(wb, worksheet, 'Sheet1');
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  onGridReady(params: any) {
    this.gridApi = params.api;

    // let data = {
    //   "iMerchantId":"M00005353",
    //   "iTxnId":"1002231916290292691",
    //   "FromDate":"2023-03-05",
    //   "ToDate":"2023-03-05"


    // }
    // this.chargebackservie.getMerchantAccountList(this.pageSize ,(this.currentPage - 1),data).subscribe(data=>{
    //   var res=data;


    // })



  }



  dataRendered(params: any) {
    params.api.sizeColumnsToFit();
  }

  onSubmit(formvalue: any) {
    debugger
    this.formValue = formvalue

    let data = {
      // "iMerchantId":"M0002",
      "iMerchantId": localStorage.getItem("user"),
      "iTxnId": formvalue.transactionid || "",
      "FromDate": formvalue.formdate || "",
      "ToDate": formvalue.todate || ""


    }

    if (((2000 > new Date(this.chargeBackForm.controls["formdate"]?.value).getFullYear() || new Date(this.chargeBackForm.controls["formdate"]?.value) > this.currDate) || (2000 > new Date(this.chargeBackForm.controls["todate"]?.value).getFullYear() || new Date(this.chargeBackForm.controls["todate"]?.value) > this.currDate)) && (new Date(this.chargeBackForm.controls["formdate"]?.value).getFullYear() != 1970)) {
      this.alertService.errorAlert({
        text: "Date out of Range!"
      })



      this.display = false
      return
    }
    if (this.chargeBackForm.controls['formdate']?.value > this.chargeBackForm.controls['todate']?.value) {
      this.alertService.errorAlert({
        text: "From Date can not be greater than To Date!"
      })

      this.rowData = []
      return
    }
    this.loading = true
    document?.getElementById('loading')?.classList.add("spinner-border")
    document?.getElementById('loading')?.classList.add("spinner-border-sm")
    this.chargebackservie.getMerchantAccountList(this.pageSize, (this.currentPage - 1), data).subscribe(data => {
      this.loading = false
      document?.getElementById('loading')?.classList.remove("spinner-border")
      document?.getElementById('loading')?.classList.remove("spinner-border-sm")
      if (data?.Error && data?.Error[0]) {
        this.alertService.errorAlert({ html: data?.Error[0] })
        this.display = false
        return
      }
      this.rowData = data
      this.display = this.rowData

      this.collectionSize = data?.totalCount || data?.length

    })
  }

  reset() {
    this.chargeBackForm.reset()
    this.display = false

  }

  onPaginationChange(param: PaginationChangedEvent | any) {
    this.gridApi.paginationGoToPage(param - 1)
  }

  onPageSizeChanges($event: Event) {
    $event.preventDefault();
    this.gridApi.paginationSetPageSize(this.pageSize)
    this.gridApi.refreshCells()
  }

  updateSelectedColumn(event: any) {
    console.log("event.target.value====>", event.target.value)
    if (event.target.checked) {
      console.log("columnDefsCopyCheked====>", this.columnDefsCopy[parseInt(event.target.value)])
      if (this.tableSelectedColumn.indexOf(this.columnDefsCopy[parseInt(event.target.value)]) < 0) {
        // this.tableSelectedColumn.push(this.columnDefs[parseInt(event.target.value)]);
        this.tableSelectedColumn.splice(parseInt(event.target.value), 0, this.columnDefsCopy[parseInt(event.target.value)]);
      }
    } else {
      console.log("columnDefsCopyUnCheked====>", this.columnDefsCopy[parseInt(event.target.value)])
      if (this.tableSelectedColumn.indexOf(this.columnDefsCopy[parseInt(event.target.value)]) > -1) {
        this.tableSelectedColumn.splice(this.tableSelectedColumn.indexOf(this.columnDefsCopy[parseInt(event.target.value)]), 1);
      }
    }
    this.gridApi.setColumnDefs(this.tableSelectedColumn)
    this.gridApi.setDefaultColDef(this.defaultColDef);
  }


  getToday(): string {
    return new Date().toISOString().split('T')[0]
  }

  private csvJSON(csvText: string | undefined) {
    if (!csvText) {
      return []
    }
    let lines: any[] = [];
    const linesArray = csvText.split('\n');
    // for trimming and deleting extra space
    linesArray.forEach((e: any) => {
      const row = e.replace(/[\s]+[,]+|[,]+[\s]+/g, ',').trim();
      lines.push(row);
    });
    console.log("-Lines------>", lines);
    // for removing empty record
    // lines.splice(lines.length - 1, 1);
    const result = [];
    const headers = lines[0].split(",");

    for (let i = 1; i < lines.length; i++) {

      const obj = {};
      const currentline = lines[i].split(",");

      for (let j = 0; j < headers.length; j++) {
        // @ts-ignore
        obj[headers[j]] = currentline[j];
      }
      result.push(obj);
    }
    return result;
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + new Date().getTime() + EXCEL_EXTENSION);
  }

  async onRowDoubleClicked(param: RowClickedEvent | any) {
    debugger
    this.Data = param.data
    this.BlockedmerchantSelectEvent.emit(this.Data);
    return await this.modalblockedComponent.open();
  }

  closeModalBlocked($event: any) {
    debugger
    if (!$event.showModal) {
      this.modalblockedComponent.close();
      this.refreshGrid();
    }
  }

  refreshGrid() {
    let data = {
      // "iMerchantId":"M0002",
      "iMerchantId": localStorage.getItem("user"),
      "iTxnId": this.formValue.transactionid || "",
      "FromDate": this.formValue.formdate || "",
      "ToDate": this.formValue.todate || ""


    }
    this.loading = true
    document?.getElementById('loading')?.classList.add("spinner-border")
    document?.getElementById('loading')?.classList.add("spinner-border-sm")
    this.chargebackservie.getMerchantAccountList(this.pageSize, (this.currentPage - 1), data).subscribe(data => {
      this.loading = false
      document?.getElementById('loading')?.classList.remove("spinner-border")
      document?.getElementById('loading')?.classList.remove("spinner-border-sm")
      if(data.Error)
      {
        // this.alertService.errorAlert({
        //   text:data?.Error[0]
        // })
        this.display=false
        return
      }
      this.rowData = data
      this.display = this.rowData
      if (data?.Error[0]) {
        this.display = false
      }
      this.collectionSize = data?.totalCount || data?.length

    })
  }


  download1(data: any) {
    debugger
    this.chargebackservie.downloadZipFile(data).subscribe((res: any) => {
      var blob = new Blob([res], {
        type: 'application/zip',
        // filename: this.fileName,
      });
      const url = window.URL.createObjectURL(blob);
      // window.open(url);
      // let url = window.URL.createObjectURL(res.blob());
      let a = document.createElement('a');
      document.body.appendChild(a);
      a.setAttribute('style', 'display: none');
      a.href = url;
      a.download = data;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    })

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


}
