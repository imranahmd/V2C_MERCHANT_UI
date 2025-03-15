import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FilterChangedEvent, GridApi } from "ag-grid-community";
import { GridReadyEvent, PaginationChangedEvent } from 'ag-grid-community';
import { MasterService } from '../master.service';
import { ColDef } from 'ag-grid-community';
import { environment } from 'src/environments/environment';
import { csvToJson } from 'src/app/util/csvjson';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { ModalComponent } from 'src/app/common/modal/modal.component';
import { ModalConfig } from 'src/app/common/modal/modal.config';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx'
const { API_URL, defaultPageSizeArr, defaultPageSize } = environment;

@Component({
  selector: 'app-benificiriesacountone',
  templateUrl: './benificiriesacountone.component.html',
  styleUrls: ['./benificiriesacountone.component.scss']
})
export class BenificiriesacountoneComponent implements OnInit {
  @Output() AddmerchantSelectEvent: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('modalbloked') private modalblockedComponent: ModalComponent;
  @Output() BlockedmerchantSelectEvent: EventEmitter<any> = new EventEmitter<any>();
  constructor(private benificiryservice: MasterService) { }
  private gridApi!: GridApi;
  public rowData: any[] = [];
  modalConfigBlocked: ModalConfig;
  currentPage: number = 1;
  tableInfo: any;
  pageSize: number = defaultPageSize;
  public columnDefs: ColDef[] = [
    // { field: 'pid', headerName: 'Service Provider ID' },
    // { field: 'merchant_id', headerName: 'Service Provider Name' },
    { field: 'account_number', headerName: 'Account Number',filter:true },

    { field: 'ifsc_code', headerName: 'IFSC-Code',filter:true  },
    { field: 'bank_name', headerName: 'Bank-Name',filter:true  },
    { field: 'createdOn', headerName: 'CreatedOn',filter:true  },
    { field: 'account_holder', headerName: 'AccountHolder',filter:true  },
    { field: 'mobile_no', headerName: 'Mobile Number',filter:true  },
    { field: 'email_id', headerName: 'Email-ID',filter:true  },
    { field: 'Is_Approve', headerName: 'Is-Approve',filter:true  },
    { field: 'Customer_Id', headerName: 'CustomerId',filter:true  },
    // { field: 'Customer_Id', headerName: 'Ageing' },
  
  
   


    
  ];
  tableSelectedColumn: ColDef[] = [...this.columnDefs];
  collectionSize: number = 0;
  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 170,
    filter: false,
    resizable: true
  };

  ngOnInit(): void {

    this.modalConfigBlocked = {
      modalTitle: "Add Beneficiary Account",
      modalSize: 'lg',
      hideDismissButton(): boolean {
        return true
      },
      hideCloseButton(): boolean {
        return true
      }
    }
  }
  onGridReady(params: GridReadyEvent<any>) {debugger
  this.gridApi = params.api;
   this.gridApi.getFilterInstance('age', (filterParam) => {
     console.log('asdasdad', filterParam);
   })
   this.gridApi.showLoadingOverlay();
   var data = {
    "merchant_id":localStorage.getItem("user"),
   
   }
   this.benificiryservice.getbenificirylist(data).subscribe((res: any) => {
     this.rowData=res;
     this.rowData = res ,
     this.collectionSize = res?.TotalRecords || res?.length


   })


 


 }
 onPaginationChange(param: PaginationChangedEvent | any) {
  debugger

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
onFilterChange(param: FilterChangedEvent | any) {
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
onExportCSV() {debugger

  console.log("asdasdas");
  // @ts-ignore
  var random3 = Math.floor(Math.random() * 10000000000 + 1);
  var today = new Date();
  var referenceId = today.getFullYear().toString() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2)
  // + "_" + (("0" + today.getHours())).slice(-2)+"-" +(("0" + today.getMinutes())).slice(-2) +"-" +(("0" + today.getSeconds())).slice(-2)
  var fileName = referenceId + " Report.xlsx"

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
  const csvString:any = this.gridApi.getDataAsCsv();
  console.log("=======>", csvString);
  const convJson = csvToJson(csvString);
  // const convJson = this.rowData;
  console.log("=======>", convJson);
  const expData: any[] = [];
  (convJson || []).forEach((curr: any) => {
    const tempRec: any = {}
    this.tableSelectedColumn.forEach((col) => {
      console.log(col?.field, "-------------->", Object.keys(curr))
      // @ts-ignore
      if (col?.field != "actions") {
        if (col?.field) {
          // @ts-ignore
          // tempRec[col?.field.trim()] = (curr[`"${col?.field.trim()}"`] || curr[`"${col?.headerName?.trim()}"`])
          tempRec[col?.field] = (curr[col?.field] || curr[col?.headerName])
        }

      }
    })
    expData.push(tempRec);
  })

  console.log("asdas", expData);
  this.exportAsExcelFile(this.rowData, fileName);
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
refreshGrid() {debugger
  var data = {
    "merchant_id":localStorage.getItem("user"),
   
   }
   this.benificiryservice.getbenificirylist(data).subscribe((res: any) => {
     this.rowData=res;
     this.rowData = res ,
     this.collectionSize = res?.TotalRecords || res?.length


   })
  

}
closeModalBlocked($event: any) {debugger
  if (!$event.showModal) {
    this.modalblockedComponent.close();
    this.refreshGrid();
  }
}
async onAddNew($event: any) {
  // this.sidebarComponent.sidebarToggler.nativeElement.click();
  // await this.sideNavService.toggelEvent$.emit($event)
  // await this.sideNavService.toggle($event);
  this.AddmerchantSelectEvent.emit('');
  this.modalblockedComponent.open();
  // await this.router.navigate(['/merchants/merchant-creation'])
  // return await this.modalAddComponent.open();
}

}
