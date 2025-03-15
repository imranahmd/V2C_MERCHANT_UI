import {Component, OnInit} from '@angular/core';
import {environment} from 'src/environments/environment';
import {ApiHttpService} from "../../../../_services/api-http.service";
import {FormControl, FormGroup, Validators} from '@angular/forms'

import {RiskdashboardService} from '../../riskdashboard/riskdashboard.service';
import {AlertService} from "../../../../_services/alert.service";
import {ReconServiceService} from './recon-service.service';
import {BtnCellRenderer} from 'src/app/common/button-cell-renderer.component';
import {ColDef, GridApi, GridReadyEvent, PaginationChangedEvent, RowClickedEvent,} from 'ag-grid-community';
import {DatePipe} from '@angular/common';


const {API_URL} = environment;

@Component({
  selector: 'app-recon',
  templateUrl: './recon.component.html',
  styleUrls: ['./recon.component.scss']
})
export class ReconComponent implements OnInit {
  Resdata: any;
  uploadFileForm: FormGroup;
  isForm1Submitted: Boolean;

  // Each Column Definition results in one Column.
  public columnDefs: ColDef[] = [
    {field: 'fileId', headerName: 'file Id'},
    {field: 'fileName', headerName: 'file Name'},
    {field: 'totalRecordsInFile', headerName: 'Total Records In File'},
    {field: 'fileUploadPath', headerName: 'file Upload Path'},
    {field: 'serviceId', headerName: 'Service Id'},
    {field: 'uploadedOn', headerName: 'Uploaded On'},
    {
      field: 'action', headerName: 'Action', resizable: true, cellRenderer: BtnCellRenderer, cellRendererParams: [
        {
          clicked: async (field: any, param: any) => {


            // this.alertService.confirmBox(this.deleteRecon(param.data.fileUploadPath), {}, {
            //   html: "Record has been deleted.!"
            // }, () => {
            // //  this.refreshGrid(this.merchantId);
            // })
            this.deleteRecon(param.data.fileId)
            console.log("reconlist", param)

          },
          buttonIconClass: 'icon-trash'
        }
      ]
    },


  ];
  public rowDatang: any = [];
  currentPage: number = 1;
  pageSize: number = 10;
  rowData: any[];
  collectionSize: number = 0;
  tableSelectedColumn: ColDef[] = [...this.columnDefs];
  Actiondata: any;
  fileName: any;
  fileExtension: any;
  fileExtensionError: boolean;
  fileResponse: any;
  submitBtnDisable: boolean;
  loading: boolean;
  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 170,
    filter: true,
    resizable: true
  };
  SingleRow: any;
  file: any;
  Date: any;
  tableData: any[];
  Response: any;
  addResponse: any;
  deleteResponse: any;
  message: any = "Please click on button start recon.";
  private gridApi!: GridApi;
  private filterObj: any = {};

  constructor(private apiHttpService: ApiHttpService, private datepipe: DatePipe, private Services: RiskdashboardService, private alertService: AlertService, private reconservice: ReconServiceService) {
    this.uploadFileForm = new FormGroup({
      Sp: new FormControl('', [Validators.required]),
      reconDate: new FormControl('', [Validators.required]),
      file: new FormControl('', [Validators.required]),


    })
  }

  get form1() {
    return this.uploadFileForm.controls;
  }

  ngOnInit(): void {
    this.ServiceProvide();
  }


  noKeyInput($event: any) {
    return false
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

  // onSubmit(formvalue: any) {
  //
  //   this.isForm1Submitted = true;
  // }

  // onGridReady(params: GridReadyEvent<any>) {
  //   this.gridApi = params.api;
  //   this.gridApi.getFilterInstance('age', (filterParam) => {
  //     console.log('asdasdad', filterParam);
  //   })
  //   this.gridApi.showLoadingOverlay();

  //   return this.Services.GetRiskActionLogs(this.pageSize, (this.currentPage - 1))
  //     .subscribe((data) => (console.log("****onGridReady", data), this.rowData = data?.data || data, this.collectionSize = data?.totalCount || data?.length));
  // }


  onGridReady(params: GridReadyEvent<any>) {

    var date = new Date()
    let formData = {
      // "ReconDate":"2022/12/10",
      "ReconDate": this.datepipe.transform(date, 'yyyy/MM/dd'),
      // "ReconDate":this.reconDate
    }
    this.gridApi = params.api;
    this.gridApi.setColumnDefs(this.columnDefs);
    this.gridApi.getFilterInstance('age', (filterParam) => {
    })
    this.gridApi.showLoadingOverlay();

    return this.reconservice.getReconList(formData, this.pageSize, (this.currentPage - 1))

      .subscribe((data: any) => (this.rowData = data?.data || data, this.collectionSize = data?.totalCount || data?.length));

    // this.rowData=[{"statusCode":"0","id":0,"fileName":"HDFCNB_000955_HDFCNB_7.xlsx","fileId":"1","modified_On":null,"serviceId":"9","uploadedOn":"2022/12/01 00:22:01","fileUploadPath":"/home/recon/upload/HDFCNB_000955_HDFCNB_7.xlsx","totalRecordsInFile":"0","noOfBadRecords":"0","badRecordsFileName":"NA","badRecordsFilePath":"NA"},{"statusCode":"0","id":0,"fileName":"HDFCNB_000955_HDFCNB_10.xlsx","fileId":"2","modified_On":null,"serviceId":"9","uploadedOn":"2022/12/01 00:23:03","fileUploadPath":"/home/recon/upload/HDFCNB_000955_HDFCNB_10.xlsx","totalRecordsInFile":"5","noOfBadRecords":"0","badRecordsFileName":"NA","badRecordsFilePath":"NA"},{"statusCode":"0","id":0,"fileName":"HDFCNB_000955_HDFCNB_12.xlsx","fileId":"3","modified_On":null,"serviceId":"9","uploadedOn":"2022/12/01 00:23:27","fileUploadPath":"/home/recon/upload/HDFCNB_000955_HDFCNB_12.xlsx","totalRecordsInFile":"5","noOfBadRecords":"0","badRecordsFileName":"NA","badRecordsFilePath":"NA"},{"statusCode":"0","id":0,"fileName":"HDFCNB_000955_HDFCNB_14.xlsx","fileId":"4","modified_On":null,"serviceId":"9","uploadedOn":"2022/12/01 00:23:36","fileUploadPath":"/home/recon/upload/HDFCNB_000955_HDFCNB_14.xlsx","totalRecordsInFile":"0","noOfBadRecords":"0","badRecordsFileName":"NA","badRecordsFilePath":"NA"},{"statusCode":"0","id":0,"fileName":"HDFCNB_000955_HDFCNB_15.xlsx","fileId":"5","modified_On":null,"serviceId":"9","uploadedOn":"2022/12/01 00:24:00","fileUploadPath":"/home/recon/upload/HDFCNB_000955_HDFCNB_15.xlsx","totalRecordsInFile":"0","noOfBadRecords":"0","badRecordsFileName":"NA","badRecordsFilePath":"NA"},{"statusCode":"0","id":0,"fileName":"HDFCNB_000955_HDFCNB_16.xlsx","fileId":"6","modified_On":null,"serviceId":"9","uploadedOn":"2022/12/01 00:24:16","fileUploadPath":"/home/recon/upload/HDFCNB_000955_HDFCNB_16.xlsx","totalRecordsInFile":"4","noOfBadRecords":"0","badRecordsFileName":"NA","badRecordsFilePath":"NA"},{"statusCode":"0","id":0,"fileName":"HDFCNB_000955_HDFCNB_New5.xlsx","fileId":"7","modified_On":null,"serviceId":"9","uploadedOn":"2022/12/01 00:24:23","fileUploadPath":"/home/recon/upload/HDFCNB_000955_HDFCNB_New5.xlsx","totalRecordsInFile":"1","noOfBadRecords":"0","badRecordsFileName":"NA","badRecordsFilePath":"NA"}]


  }

  async onRowClicked(param: RowClickedEvent | any) {

    this.SingleRow = param.data
    // await this.modalDeleteComponent.openData(this.SingleRow)

  }

  onRowDoubleClicked(param: RowClickedEvent | any) {
    param.node.setExpanded(!param.node.expanded);
  }

  isInArray(array: any, word: any) {
    return array.indexOf(word.toLowerCase()) > -1;
  }

  onFileSelect(event: any) {

    // type = type || 'single'
    // if (event.target.files[0].size < 1048576) {
    if (event.target.files.length > 0) {


      var allowedExtensions = ["xlsx", "XLSX", "CSV", "csv"];
      var file = event.target.files[0];
      this.file = file
      this.fileName = file.name;
      this.fileExtension = this.fileName.split('.').pop();

      if (this.isInArray(allowedExtensions, this.fileExtension)) {
        this.fileExtensionError = false;

      } else {
        // alert("Only " + "Image, Document, Excel and PDF" + " files are allowed");
        this.alertService.errorAlert({
          html: "Only " + "XLSX and CSV" + " files are allowed"
        })
        this.fileExtensionError = true;
        return
      }
      // this.fileExtension
      if (this.fileExtensionError == false) {
        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          this.apiHttpService
            .post(
              `${API_URL}/uploadreconfile/`, formData
            )
            .subscribe((data: any) => {

              this.fileResponse = data;


            })

        } else {
          this.alertService.errorAlert({
            html: "Failed to load file"
          })
        }
      }
    }


  }

  deleteRecon(data: any) {

    // const reconDeleteData = new FormData();
    // reconDeleteData.append('file', data);
    let reconDeleteData =
      {
        "FileId": data
      }
    this.reconservice.deleteRecons(reconDeleteData).subscribe((data: any) => {
      this.deleteResponse = data;
      if (this.deleteResponse.length > 0) {
        this.alertService.successAlert(this.deleteResponse[0].message);
      }
      this.refreshGrid(this.Date);

    })
  }

  onPaginationChange(param: PaginationChangedEvent | any) {
    this.gridApi.paginationGoToPage(param - 1)
  }

  onPageSizeChanges($event: Event) {

    // this.gridApi.paginationSetPageSize(this.pageSize)
    // this.gridApi.applyTransaction({ remove: this.rowData })
    // this.gridApi.showLoadingOverlay();
    // this.apiHttpService
    //   .post(
    //     `${API_URL}/get-merchantmdrlist?pageSize=` + this.pageSize + '&page=' + (this.currentPage - 1), Requestbody
    //   )
    //   .subscribe((data) => (
    //     this.rowData = data?.data || Array.isArray(data) ? data:[],
    //       this.collectionSize = data?.totalCount,
    //       this.gridApi.applyTransaction({add: this.rowData})
    //   ));

    // this.reconservice.getReconList(this.pageSize, (this.currentPage - 1))
    //   .subscribe((data) => (console.log("****onPageSizeChange"), this.rowData = data.data || data.merchants || data, this.collectionSize = data.totalCount || data.totalRecords, this.gridApi.applyTransaction({ add: this.rowData })));
    console.log($event.preventDefault());
    this.gridApi.paginationSetPageSize(this.pageSize)
    this.gridApi.applyTransaction({remove: this.rowData})
    this.gridApi.showLoadingOverlay();
    this.gridApi.applyTransaction({add: this.rowData})

  }


  onSubmit(formvalue: any) {


    //  const reconAddData = new FormData();
    //  reconAddData.append('serviceId',formvalue.Sp);
    //   reconAddData.append('ReconDate',formvalue.reconDate);
    //  reconAddData.append('fileName',this.fileName)

    this.Date = this.datepipe.transform(formvalue.reconDate, 'yyyy/MM/dd');
    // this.refreshGrid(this.Date);
    let reconAddData = {
      "serviceId": formvalue.Sp,
      "ReconDate": this.Date,
      "fileName": this.fileName
      // "fileName":"HDFCNB_0687876_HDFCNB_8.xlsx"
    }

    if (this.uploadFileForm.valid) {
      this.reconservice.addReconFile(reconAddData).subscribe((data: any) => {
        this.addResponse = data;
        this.uploadFileForm.reset();
        this.uploadFileForm.controls['Sp'].setValue("")

        this.isForm1Submitted = false;
        if (this.addResponse.length > 0) {
          this.alertService.successAlert(this.addResponse[0].message);
        }
        this.refreshGrid(this.Date)
      })
    }
    this.isForm1Submitted = true;

  }


  refreshGrid(Mid: any) {


    let data = {
      "ReconDate": Mid,
    }

    return this.apiHttpService
      .post(
        `${API_URL}/GetReconFileList`, data
      )
      .subscribe((data: any) => (
        this.rowData = data?.data || data,
          this.tableData = this.rowData,
          this.collectionSize = data?.totalCount || data?.length
      ));
  }

  dateSelect() {

    let FormControlvalue = this.uploadFileForm.controls['reconDate'].value
    let date = this.datepipe.transform(FormControlvalue, 'yyyy/MM/dd');
    this.refreshGrid(this.Date)
  }

  startRecon() {
    this.loading = true;
    let startreconprocess = {}

    this.reconservice.startRecons(startreconprocess).subscribe((data: any) => {
      this.Response = data;
      if (this.Response) {
        this.alertService.successAlert(this.Response[0].message);
        this.message = this.Response[0].message
      }
      this.loading = false;

    })
  }

  getToday(): string {
    return new Date().toISOString().split('T')[0]
  }


}
