import {Component, OnInit} from '@angular/core';
import {environment} from 'src/environments/environment';
import {ApiHttpService} from "../../../../_services/api-http.service";
import {FormControl, FormGroup, Validators} from '@angular/forms'
import {AlertService} from "../../../../_services/alert.service";
import {ReconServiceService} from './../recon/recon-service.service';
import {ColDef, GridApi, GridReadyEvent, PaginationChangedEvent, RowClickedEvent,} from 'ag-grid-community';
import {DatePipe} from '@angular/common';


const {API_URL} = environment;

@Component({
  selector: 'app-recon-progress-report',
  templateUrl: './recon-progress-report.component.html',
  styleUrls: ['./recon-progress-report.component.scss']
})
export class ReconProgressReportComponent implements OnInit {
  ReconProgressReportform: FormGroup;
  public columnDefs: ColDef[] = [
    {field: 'fileId', headerName: 'file Id'},
    {field: 'fileName', headerName: 'file Name'},
    {field: 'totalRecordsInFile', headerName: 'Total Records In File'},
    {field: 'fileUploadPath', headerName: 'file Upload Path'},
    {field: 'serviceId', headerName: 'Service Id'},
    {field: 'uploadedOn', headerName: 'Uploaded On'},
    {field: 'noofException', headerName: 'Number Of Exception'},
    {field: 'statusCode', headerName: 'Status Code'},

    // {
    //   field: 'action', headerName: 'Action', resizable: true, cellRenderer: BtnCellRenderer, cellRendererParams: [
    //     {
    //       clicked: async (field: any, param: any) => {
    //


    //       },
    //       buttonIconClass: 'icon-trash'
    //     }
    //   ]
    // },


  ];
  public rowDatang: any = [];
  currentPage: number = 1;
  pageSize: number = 10;
  rowData: any[];
  collectionSize: number = 0;
  tableSelectedColumn: ColDef[] = [...this.columnDefs];
  Actiondata: any;
  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 170,
    filter: true,
    resizable: true
  };
  SingleRow: any;
  Resdata: any;
  ReconProgressResponse: any;
  reconProgressResponse: any;
  isForm1Submitted: Boolean = false;
  SPData: any;
  ReconDate: string | null;
  private gridApi!: GridApi;
  private filterObj: any = {};

  constructor(private apiHttpService: ApiHttpService, private datepipe: DatePipe, private alertService: AlertService, private reconservice: ReconServiceService) {
    this.ReconProgressReportform = new FormGroup({
      Sp: new FormControl(''),
      reconDate: new FormControl('', [Validators.required]),


    })
  }

  get form1() {
    return this.ReconProgressReportform.controls;
  }

  ngOnInit(): void {
    this.ServiceProvide();
    this.isForm1Submitted = false

  }

  onGridReady(params: GridReadyEvent<any>) {


    // let formData = {
    //   "ServiceId": "",
    //   "ReconDate": ""
    // }

    this.gridApi = params.api;
    this.gridApi.setColumnDefs(this.columnDefs);
    this.gridApi.getFilterInstance('age', (filterParam) => {
    })
    this.gridApi.showLoadingOverlay();
    this.rowData.length > 0 ? this.search({Sp: this.SPData, reconDate: this.ReconDate}) : []
    // this.collectionSize =0
    // return this.reconservice.getReconProgressReports(formData, this.pageSize, (this.currentPage - 1))

    //   .subscribe((data: any) => (this.rowData = data?.data || data, this.collectionSize = data?.totalCount || data?.length));

    // this.rowData=[{"statusCode":"0","id":0,"fileName":"HDFCNB_000955_HDFCNB_7.xlsx","fileId":"1","modified_On":null,"serviceId":"9","uploadedOn":"2022/12/01 00:22:01","fileUploadPath":"/home/recon/upload/HDFCNB_000955_HDFCNB_7.xlsx","totalRecordsInFile":"0","noOfBadRecords":"0","badRecordsFileName":"NA","badRecordsFilePath":"NA"},{"statusCode":"0","id":0,"fileName":"HDFCNB_000955_HDFCNB_10.xlsx","fileId":"2","modified_On":null,"serviceId":"9","uploadedOn":"2022/12/01 00:23:03","fileUploadPath":"/home/recon/upload/HDFCNB_000955_HDFCNB_10.xlsx","totalRecordsInFile":"5","noOfBadRecords":"0","badRecordsFileName":"NA","badRecordsFilePath":"NA"},{"statusCode":"0","id":0,"fileName":"HDFCNB_000955_HDFCNB_12.xlsx","fileId":"3","modified_On":null,"serviceId":"9","uploadedOn":"2022/12/01 00:23:27","fileUploadPath":"/home/recon/upload/HDFCNB_000955_HDFCNB_12.xlsx","totalRecordsInFile":"5","noOfBadRecords":"0","badRecordsFileName":"NA","badRecordsFilePath":"NA"},{"statusCode":"0","id":0,"fileName":"HDFCNB_000955_HDFCNB_14.xlsx","fileId":"4","modified_On":null,"serviceId":"9","uploadedOn":"2022/12/01 00:23:36","fileUploadPath":"/home/recon/upload/HDFCNB_000955_HDFCNB_14.xlsx","totalRecordsInFile":"0","noOfBadRecords":"0","badRecordsFileName":"NA","badRecordsFilePath":"NA"},{"statusCode":"0","id":0,"fileName":"HDFCNB_000955_HDFCNB_15.xlsx","fileId":"5","modified_On":null,"serviceId":"9","uploadedOn":"2022/12/01 00:24:00","fileUploadPath":"/home/recon/upload/HDFCNB_000955_HDFCNB_15.xlsx","totalRecordsInFile":"0","noOfBadRecords":"0","badRecordsFileName":"NA","badRecordsFilePath":"NA"},{"statusCode":"0","id":0,"fileName":"HDFCNB_000955_HDFCNB_16.xlsx","fileId":"6","modified_On":null,"serviceId":"9","uploadedOn":"2022/12/01 00:24:16","fileUploadPath":"/home/recon/upload/HDFCNB_000955_HDFCNB_16.xlsx","totalRecordsInFile":"4","noOfBadRecords":"0","badRecordsFileName":"NA","badRecordsFilePath":"NA"},{"statusCode":"0","id":0,"fileName":"HDFCNB_000955_HDFCNB_New5.xlsx","fileId":"7","modified_On":null,"serviceId":"9","uploadedOn":"2022/12/01 00:24:23","fileUploadPath":"/home/recon/upload/HDFCNB_000955_HDFCNB_New5.xlsx","totalRecordsInFile":"1","noOfBadRecords":"0","badRecordsFileName":"NA","badRecordsFilePath":"NA"}]


  }


  async onRowClicked(param: RowClickedEvent | any) {

    this.SingleRow = param.data
    // await this.modalDeleteComponent.openData(this.SingleRow)

  }

  onRowDoubleClicked(param: RowClickedEvent | any) {
    param.node.setExpanded(!param.node.expanded);
  }

  onPaginationChange(param: PaginationChangedEvent | any) {
    this.gridApi.paginationGoToPage(param - 1)
  }

  onPageSizeChanges($event: Event) {

    this.gridApi.paginationSetPageSize(this.pageSize)
    this.gridApi.applyTransaction({remove: this.rowData})
    this.gridApi.showLoadingOverlay();


    //  this.reconservice.getReconList(this.pageSize, (this.currentPage - 1))
    // .subscribe((data) => (console.log("****onPageSizeChange"), this.rowData = data.data || data.merchants || data, this.collectionSize = data.totalCount || data.totalRecords, this.gridApi.applyTransaction({add: this.rowData})));

  }

  //call api serviceProvide dropdown
  ServiceProvide() {

    let serviceprovidedata = {
      "Type": "5",
      "Value": ""
    }
    this.apiHttpService
      .post(`${API_URL}/GetDropdown`, serviceprovidedata)
      .subscribe((res) => {
        this.Resdata = res
      });
  }

  search(formdata: any) {
    if (this.ReconProgressReportform.valid) {
      this.SPData = formdata.Sp
      this.ReconDate = this.datepipe.transform(formdata.reconDate, 'yyyy/MM/dd')
      let Reconprogressdata = {
        "ServiceId": formdata.Sp,
        "ReconDate": this.datepipe.transform(formdata.reconDate, 'yyyy/MM/dd')
      }

      this.reconservice.getReconProgressReports(Reconprogressdata).subscribe((data: any) => {
        this.rowData = data
        this.reconProgressResponse = this.rowData;


      })
    }

    this.isForm1Submitted = true;

  }

  getToday(): string {
    return new Date().toISOString().split('T')[0]
  }


}
