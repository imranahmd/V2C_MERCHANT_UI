import {Component, EventEmitter, HostListener, OnInit, Output, ViewChild} from '@angular/core';
import {
  ColDef,
  Column,
  FilterChangedEvent,
  FilterModifiedEvent,
  FilterOpenedEvent,
  GridApi,
  GridReadyEvent,
  ICellRendererComp,
  ICellRendererParams,
  PaginationChangedEvent,
  RowClickedEvent
} from "ag-grid-community";
import {debounceTime, distinctUntilChanged, map, Observable} from "rxjs";
import {environment} from "../../../../../environments/environment";
import {ModalConfig} from "../../../../common/modal/modal.config";
import {ModalComponent} from "../../../../common/modal/modal.component";
import {MerchantFilter, MerchantService} from "./merchant.service";
import {NgbTypeaheadSelectItemEvent} from "@ng-bootstrap/ng-bootstrap";
import {Router} from "@angular/router";
import {SidebarComponent} from "../../../layout/sidebar/sidebar.component";
import {SideNavService} from "../../../layout/sidebar/side-name.service";
import {StorageService} from "../../../../_services/storage.service";
import {Location} from "@angular/common";
import {AlertService} from "../../../../_services/alert.service";
import {MenusService} from "../../../../_services/menu.service";
import {NgSelectComponent} from "@ng-select/ng-select";
import {FormControl, Validators} from "@angular/forms";
// import { Workbook } from 'exceljs';
// import * as fs from 'file-saver';
// import * as logo from './mylogo.js';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx'
const MERCHANT_STATUS = [
  {
    "FieldValue": "approved",
    "FieldText": "Approved"
  },
  {
    "FieldValue": "rejected",
    "FieldText": "Rejected"
  },
  {
    "FieldValue": "suspended",
    "FieldText": "Suspended"
  },
  {
    "FieldValue": "hold",
    "FieldText": "Hold"
  },
  {
    "FieldValue": "active",
    "FieldText": "Active"
  }
];

const {API_URL, defaultPageSizeArr, defaultPageSize} = environment;

// const API_URL = 'http://localhost:8000'
export interface IMerchantData {
  "name": string,
  "merchantId": string,
  "businessName": string,
  "contactperson": string,
  "id": number,
  "contactno": string,
  "emailid": string,
  "state": string,
  "city": string,
  "isdeleted": string
}

export class DetailCellRenderer implements ICellRendererComp {
  eGui!: HTMLElement;

  init(params: ICellRendererParams) {
    this.eGui = document.createElement('div');
    this.eGui.innerHTML = '<h1 style="padding: 20px;">My Custom Detail</h1>';
  }

  getGui() {
    return this.eGui;
  }

  refresh(params: ICellRendererParams): boolean {
    return false;
  }
}

const dateFormatter = (param: any) => {
  const date = param.data.created_on;
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString();
}

const statusFormatter = (param: any) => {
  const sta = param.data.status;
  // @ts-ignore
  const staObj = MERCHANT_STATUS.find((d) => d.FieldValue == sta);
  return staObj?.FieldText || 'Pending';
}

@Component({
  selector: 'app-merchant-master',
  templateUrl: './merchant-master.component.html',
  styleUrls: ['./merchant-master.component.scss']
})
export class MerchantMasterComponent implements OnInit {
  @Output() merchantSelectEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() merchantConfigEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() BlockedmerchantSelectEvent: EventEmitter<any> = new EventEmitter<any>();
  // @Output() isEdit: EventEmitter<any> = new EventEmitter<any>();
  public quickFilterShow: boolean = false;
  public pageSize: number = defaultPageSize;
  public pageSizeArr: any = defaultPageSizeArr;
  public searchMerName: any;
  public searchMID: any;
  public resellerPartnerId: string;
  public Status: string;
  public searchFromDate: string;
  public searchToDate: string;
  public selectedMerchant: string;
  merchantStatus: any;
  public detailCellRenderer = new DetailCellRenderer;
  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 150,
    resizable: true,
    // suppressSizeToFit: true,
    // suppressAutoSize: true,
    filter: true,
    autoHeight: true
  };
  dynamicDate: any = this.getToday()
  public rowData!: IMerchantData[];
  tablecolumn: any;
  currentPage: number = 1;
  globalSearch: string = '';
  collectionSize: number = 0;
  modalConfigAdd: ModalConfig;
  modalConfigEdit: ModalConfig;
  modalConfigMerchant: ModalConfig;
  Merchantdata: any;
  modalConfigBlocked: ModalConfig;
  public menuItems: any;
  public permissions: any = '';
  currentDate: any = new Date();
  tableInfo: any;
  public columnDefs: ColDef[] = [
    {
      field: 'name',
      tooltipField: 'name',
      headerName: 'Legal Name',
      resizable: true,
      cellRenderer: 'agGroupCellRenderer'
    },
    {field: 'merchantId', tooltipField: 'merchantId', headerName: 'Merchant ID',},
    {field: 'businessName', tooltipField: 'businessName', headerName: 'Trade Name',},
    {field: 'contactperson', tooltipField: 'contactperson', headerName: 'Contact Person',},
    {field: 'id', tooltipField: 'id', headerName: 'ID', hide: true},
    {field: 'contactno', tooltipField: 'contactno', headerName: 'Contact No',},
    {field: 'emailid', tooltipField: 'emailid', headerName: 'Email ID',},
    // {field: 'state',tooltipField: 'state',headerName: 'State',},
    // {field: 'dateCorporation_on',tooltipField: 'dateCorporation_on',headerName: 'Date Of Incorporation',},
    {field: 'reseller_Id', tooltipField: 'reseller_Id', headerName: 'Reseller ID',},
    {field: 'reseller_Name', tooltipField: 'reseller_Name', headerName: 'Reseller Name',},
    {field: 'created_on', tooltipField: 'created_on', headerName: 'Created On',},
    {field: 'riskApproval', tooltipField: 'riskApproval', headerName: 'Risk Approval',},
    // {field: 'basicSetupApproval',headerName: 'Basic Setup Approval',},
    {field: 'kycapproval', tooltipField: 'kycapproval', headerName: 'KYC Approval',},
    {field: 'status', tooltipField: 'status', headerName: 'Status',},
    {field: 'city', tooltipField: 'city', headerName: 'City', hide: true},
    // {field: 'created_on', headerName: 'Created On Formatted',  filter: 'agDateColumnFilter', valueFormatter: dateFormatter},
    // {field: 'status', headerName: 'Status Formatted', minWidth: 120, valueFormatter: statusFormatter},
    // {
    //   field: 'actions',headerName: 'Actions', width: 30, pinned: 'right', cellRenderer: BtnCellRenderer, cellRendererParams: [
    //     /*{
    //       clicked: async (event: any, param:any) => {
    //         this.selectedMerchant = param.data.merchantId
    //         console.log("ad--------------->",this.selectedMerchant,  param.data.merchantId)
    //         this.merchantSelectEvent.emit(this.selectedMerchant);
    //         return await this.modalMerchantBankComponent.open();
    //       },
    //       buttonIconClass: 'icon-settings'
    //     },*/{
    //       clicked: async (event: any, param: any) => {
    //         this.tableInfo = param.data.merchantId
    //         this.BlockedmerchantSelectEvent.emit(this.tableInfo);
    //         return await this.modalblockedComponent.open();
    //       },
    //       buttonIconClass: 'icon-settings',
    //       buttonVisible: {
    //         'basicSetupApproval':'Pending',
    //         'businessName':'sss',
    //       }
    //     },
    //     /*{
    //       clicked: async (field: any, param:any) => {
    //         console.log((`${field} was clicked`))
    //         this.Merchantdata = param.data.merchantId
    //         console.log("ad--------------->",this.Merchantdata,  param.data.merchantId)
    //         this.merchantConfigEvent.emit(this.Merchantdata);
    //         await this.modalMerchantComponent.open()
    //       },
    //       buttonIconClass: 'icon-edit-2'
    //     }*/
    //   ]
    // }
  ];
  columnDefsCopy: ColDef[] = [...(this.columnDefs.filter((col) => !col?.hide))];
  tableSelectedColumn: ColDef[] = [...(this.columnDefs.filter((col) => !col?.hide))];
  filterData: any;
  Resultdata: any;
  totalRecords: any = 0;
  ResultdataName: any;
  maxSize: number;
  ellipses: boolean = true;
  merchantStatusdata: any;
  form: any = {
    // searchFromDate:null,
    // searchToDate:null,
  };
  @ViewChild('filSearchMerName') private filSearchMerName: NgSelectComponent;
  @ViewChild('filSearchMID') private filSearchMID: NgSelectComponent;
  @ViewChild('filResellerPartnerId') private filResellerPartnerId: NgSelectComponent;
  @ViewChild('filStatus') private filStatus: NgSelectComponent;
  @ViewChild('filSearchToDate') private filSearchToDate: FormControl;
  @ViewChild('filSearchFromDate') private filSearchFromDate: FormControl;
  @ViewChild('modalbloked') private modalblockedComponent: ModalComponent;
  private gridApi!: GridApi;
  private filterObj: any = {};
  @ViewChild('modalEdit') private modalEditComponent: ModalComponent
  @ViewChild('modalAdd') private modalAddComponent: ModalComponent
  @ViewChild('modalMerchant') private modalMerchantComponent: ModalComponent
  @ViewChild('modalMerchantBank') private modalMerchantBankComponent: ModalComponent
  private innerWidth: number;
  private _event: any;
  private resellerId: any;
  private resellerListOptions: any;

  constructor(
    private menuService: MenusService,
    private location: Location,
    private alertService: AlertService,
    private sideNavService: SideNavService,
    private merchantService: MerchantService,
    private router: Router,
    private sidebarComponent: SidebarComponent,
    private storageService: StorageService
  ) {
    this.resellerId = this.storageService.getUserName() || '';
    this.merchantService.getBusinessType().subscribe((data) => this.merchantStatus = data)

  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term: string) => term.length < 2 ? []
        : this.rowData.filter(v => (v.name.toLowerCase().indexOf(term.toLowerCase()) > -1)).map(v => v.name).slice(0, 10))
    );

  async ngOnInit(): Promise<void> {
    // this.dynamicDate = this.searchToDate
    this.MerchnatList();
    this.innerWidth = window.innerWidth;
    this.setPageSize();
    const path = this.location.prepareExternalUrl(this.location.path());
    this.permissions = this.menuService.getPermissions(path);
    if (this.permissions == null || this.permissions == '' || !this.permissions) {
      this.alertService.errorAlert({
        title: "No Access",
        backdrop: true,
        toast: true,
        timer: 1500
      })
      await this.router.navigateByUrl('/');
    }

    this.modalConfigBlocked = {
      modalTitle: "Merchant Status",
      modalSize: 'lg',
      hideDismissButton(): boolean {
        return true
      },
      hideCloseButton(): boolean {
        return true
      }
    }
    this.modalConfigAdd = {
      modalTitle: "Add Merchant",
      modalSize: 'xl',
      hideCloseButton(): boolean {
        return true;
      },
      hideDismissButton(): boolean {
        return true
      }
    }

    this.modalConfigEdit = {
      modalTitle: "Edit Merchant",
      modalSize: 'xl',
      hideCloseButton(): boolean {
        return true;
      },
      hideDismissButton(): boolean {
        return true
      }
    }
    this.modalConfigMerchant = {
      modalTitle: "Merchant RMS Configuration",
      modalSize: 'xl',
      hideCloseButton(): boolean {
        return true;
      },
      hideDismissButton(): boolean {
        return true
      }
    }

    this.merchantService.getResellerList().subscribe((data) => this.resellerListOptions = data)
    this.merchantStatusDropdown()
    this.MerchnatList()
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    console.log(this.innerWidth, "------->");
    this._event = event;
    this.innerWidth = window.innerWidth;
    this.setPageSize();
  }

  fun(id: any) {

    document?.getElementById(id)?.classList.add("hey")
  }

  funover(id: any) {

    document?.getElementById(id)?.classList.remove("hey")
  }

  changeDate(event: any, f: any) {

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

  noKeyInput($event: any) {
    return false
  }

  setPageSize() {
    // this.columnDefs = this.columnDefs.map((col)=>{
    //   if(col.field == 'actions'){
    //     col.pinned = "right";
    //   }
    //   return col;
    // });
    if (this.innerWidth <= 1600 && this.innerWidth >= 1200) {
      this.maxSize = 5;
    } else if (this.innerWidth <= 1199 && this.innerWidth >= 768) {
      this.maxSize = 3;
      this.ellipses = false;
    } else if (this.innerWidth < 768) {
      this.maxSize = 2;
      this.ellipses = false;
      // this.columnDefs = this.columnDefs.map((col)=>{
      //   if(col.field == 'actions'){
      //     col.pinned = null;
      //   }
      //   return col;
      // });
    }
    // this.gridApi.setColumnDefs(this.columnDefs)
  }

  updateSelectedTimeslots(event: any) {
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

  quickFilterShowAction($event: Event) {
    this.quickFilterShow = !this.quickFilterShow
    if (!this.quickFilterShow) {
      // this.searchToDate = '';
      // this.searchFromDate = '';
      // this.searchMID = '';
      // this.searchMerName = '';
      // this.resellerPartnerId= '',
      // this.Status= ''
      this.filSearchMerName.handleClearClick();
      this.filSearchMID.handleClearClick();
      this.filResellerPartnerId.handleClearClick();
      this.filStatus.handleClearClick();
      this.searchFromDate = '';
      this.searchToDate = '';
      this.refreshGrid();
    }
  }

  onSearchBtnClick($event: Event, f: any) {
    if (new Date(this.searchFromDate) > new Date(this.searchToDate)) {
      this.alertService.errorAlert({
        text: "From Date can not be greater the To Date!"
      })
      this.rowData = []
      return
    }
    const filter: MerchantFilter = {
      Status: ''
    }
    if (this.Status != "") {
      filter.name = this.searchMerName ? this.searchMerName : '' + this.Status ? this.Status : '';
    } else {
      if (this.searchMerName || '') filter.name = this.searchMerName || '';
    }
    if (this.searchMerName) filter.name = this.searchMerName ? this.searchMerName['$ngOptionLabel'].trim() || this.searchMerName : "";
    if (this.searchMID) filter.mid = this.searchMID ? this.searchMID['$ngOptionLabel'].trim() || this.searchMID : "";
    if (this.Status) filter.Status = this.Status || '';
    if (this.searchFromDate) filter.startDate = this.searchFromDate;

    if (this.searchToDate) filter.endDate = this.searchToDate;
    if ((this.searchToDate == undefined || '') && (this.searchFromDate != undefined || '')) {
      this.alertService.toastSuccessMessageAlertCenter({
        title: 'Please select                       ',
        html: '<b>To Date                       </b>'
      })
      this.rowData = []
      return false
    }
    if ((this.searchToDate != undefined || '') && (this.searchFromDate == undefined || '')) {
      this.alertService.toastSuccessMessageAlertCenter({
        title: 'Please select                     ',
        html: '<b>From Date                       </b>'
      })
      // this.alertService.simpleAlert("Please select From Date" )
      this.rowData = []
      return false
    }
    return this.merchantService.getAllMerchant(this.pageSize, 0, filter, this.resellerId)
      .subscribe((data) => {
        this.rowData = data?.data || data?.merchants || data || [],
          this.collectionSize = data?.totalCount || data?.totalrecords || data?.totalRecords || data?.length || 0
        if (this.rowData.length <= 0) {
          this.alertService.errorAlert({
            text: "No data found!"
          })
          return
        }
      });
  }

  closeModalAdd($event: any) {
    if (!$event.showModal) {
      this.modalAddComponent.close();
      this.refreshGrid();
    }

  }

  refreshGrid() {
    this.gridApi.setColumnDefs(this.tableSelectedColumn)
    this.gridApi.setDefaultColDef(this.defaultColDef);
    this.gridApi.applyTransaction({remove: this.rowData});
    return this.merchantService.getAllMerchant(this.pageSize, (this.currentPage - 1), {}, this.resellerId)
      .subscribe((data) => (this.rowData = data.data || data.merchants || data, this.collectionSize = data.totalCount || data.totalrecords || data.totalRecords || data.length));
  }

  onGridReady(params: GridReadyEvent<IMerchantData>) {
    this.gridApi = params.api;
    this.gridApi.getFilterInstance('age', (filterParam) => {
    })
    this.gridApi.showLoadingOverlay();
    this.gridApi.setQuickFilter(this.globalSearch);
    const allColumnIds: (string | Column)[] = [];
    params?.columnApi?.getColumns()?.forEach((column) => {
      allColumnIds.push(column.getId());
    });
    params?.columnApi?.autoSizeColumns(allColumnIds, false);

    return this.merchantService.getAllMerchant(this.pageSize, (this.currentPage - 1), {}, this.resellerId)
      .subscribe((data) => {
        this.rowData = data.data || data.merchants || data || [];
        this.filterData = this.rowData;
        this.collectionSize = data.totalCount || data.totalrecords || data.totalRecords || data.length,
          this.totalRecords = data?.totalRecords
        if (this.rowData.length <= 0) {
          this.alertService.errorAlert({
            text: "No data found!"
          })
          return
        }
      });
  }

  onBtnC(e: Event) {
    e.preventDefault();
    // @ts-ignore
    return this.apiHttpService
      .get(
        `${API_URL}/get-merchant`
      )
      // @ts-ignore
      .subscribe((data) => (this.gridApi.applyTransaction({add: data})));
  }

  onExportCSV() {
    // @ts-ignore
    const random3 = Math.floor(Math.random() * 10000000000 + 1);
    const today = new Date();
    const referenceId = today.getFullYear().toString() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2) + "-" + (("0" + today.getHours())).slice(-2) + "-" + (("0" + today.getMinutes())).slice(-2) + "-" + (("0" + today.getSeconds())).slice(-2)

    const fileName = 'Payments_' + referenceId

    const filter: MerchantFilter = {
      Status: ''
    }
    if (this.Status != "") {
      filter.name = this.searchMerName ? this.searchMerName : '' + this.Status ? this.Status : '';
    } else {
      if (this.searchMerName || '') filter.name = this.searchMerName || '';
    }
    if (this.searchMerName) filter.name = this.searchMerName ? this.searchMerName['$ngOptionLabel'].trim() || this.searchMerName : "";
    if (this.searchMID) filter.mid = this.searchMID ? this.searchMID['$ngOptionLabel'].trim() || this.searchMID : "";
    if (this.Status) filter.Status = this.Status || '';
    if (this.searchFromDate) filter.startDate = this.searchFromDate;

    if (this.searchToDate) filter.endDate = this.searchToDate;
    filter.columns = {};
    this.tableSelectedColumn.forEach((col) => {
      if (col?.field) filter['columns'][col?.field] = col?.headerName
    })
    return this.merchantService.getAllMerchant(this.totalRecords + 3, 0, filter, this.resellerId)
      .subscribe((data) => {
        const expData: any[] = [];
        (data?.data || data?.merchants || data || []).forEach((curr: any) => {
          const tempRec: any = {}
          this.tableSelectedColumn.forEach((col) => {
            if (col?.field) tempRec[col?.field] = curr[col?.field]
          })
          expData.push(tempRec);
        })

        // this.JSONToCSVConvertor(data?.data || data?.merchants || data || [],fileName, "Report");
        this.exportAsExcelFile(data?.data || data?.merchants || data || [], fileName);
      })


    // var params = {
    //   skipHeader: false,
    //   skipFooters: true,
    //   allColumns: true,
    //   onlySelected: false,
    //   suppressQuotes: true,
    //   fileName: fileName+'.csv',
    //   columnSeparator: ','
    // };
    // this.gridApi.exportDataAsCsv(params)
  }

  searchQuickFilter($event?: NgbTypeaheadSelectItemEvent) {
    this.gridApi.setQuickFilter($event?.item);
  }

  onGlobalSearchChange($event: any) {
    if ($event == '' || $event == null) {
      this.gridApi.setQuickFilter($event);
    }
  }

  async onAddNew($event: any) {
    // this.sidebarComponent.sidebarToggler.nativeElement.click();
    await this.sideNavService.toggelEvent$.emit($event)
    // await this.sideNavService.toggle($event);
    await this.router.navigate(['/merchants/merchant-creation'])
    // return await this.modalAddComponent.open();
  }

  async MerchantNew() {
    return await this.modalMerchantComponent.open();
  }

  onPaginationChange(param: PaginationChangedEvent | any) {

    this.gridApi.applyTransaction({remove: this.rowData})
    this.gridApi.showLoadingOverlay();
    const filter: MerchantFilter = {
      Status: ''
    }
    if (this.Status != "") {
      filter.name = this.searchMerName ? this.searchMerName : '' + this.Status ? this.Status : '';
    } else {
      if (this.searchMerName || '') filter.name = this.searchMerName || '';
    }
    if (this.searchMerName) filter.name = this.searchMerName ? this.searchMerName['$ngOptionLabel'].trim() || this.searchMerName : "";
    if (this.searchMID) filter.mid = this.searchMID ? this.searchMID['$ngOptionLabel'].trim() || this.searchMID : "";
    if (this.Status) filter.Status = this.Status || '';
    if (this.searchFromDate) filter.startDate = this.searchFromDate;
    if (this.searchToDate) filter.endDate = this.searchToDate;
    this.merchantService.getAllMerchant(this.pageSize, (param - 1), filter, this.resellerId)
      .subscribe((data) => {

          this.rowData = data.data || data.merchants || data;
          this.collectionSize = data.totalCount || data.totalRecords || data.length;
          this.gridApi.applyTransaction({add: this.rowData});

        }
      );
  }

  onRowClicked(param: RowClickedEvent | any) {
    console.log("Row Clicked", param);
  }

  async onRowDoubleClicked(param: RowClickedEvent | any) {
    if (this.permissions.includes('Edit')) {
      // this.isEdit.emit(true);
      return await this.router.navigate(['/merchants/merchant-creation'], {
        queryParams: {
          mid: param?.data?.merchantId,
          action: 'edit'
        }
      })
    }
    return false
  }

  getToday(): string {
    return new Date().toISOString().split('T')[0]
  }

  onLoggedin(e: Event, f: any): void {

    if (f.form.controls.searchFromDate.value != '') {
      f.form.controls.searchToDate.setValidators([Validators.required])
      f.form.controls.searchToDate.updateValueAndValidity()
    }
    if (f.form.controls.searchToDate.value != '') {
      f.form.controls.searchFromDate.setValidators([Validators.required])
      f.form.controls.searchFromDate.updateValueAndValidity()
    }
    if (f.form.status == 'VALID') {
      const filter: MerchantFilter = {
        Status: ''
      }
      if (this.Status != "") {
        filter.name = this.searchMerName ? this.searchMerName : '' + this.Status ? this.Status : '';
      } else {
        if (this.searchMerName || '') filter.name = this.searchMerName || '';
      }
      if (this.searchMerName) filter.name = this.searchMerName ? this.searchMerName['$ngOptionLabel'].trim() || this.searchMerName : "";
      if (this.searchMID) filter.mid = this.searchMID ? this.searchMID['$ngOptionLabel'].trim() || this.searchMID : "";
      if (this.Status) filter.Status = this.Status || '';
      if (this.searchFromDate) filter.startDate = this.searchFromDate;

      if (this.searchToDate) filter.endDate = this.searchToDate;

      this.merchantService.getAllMerchant(this.pageSize, 0, filter, this.resellerId)
        .subscribe((data) => {
          this.rowData = data?.data || data?.merchants || data || [],
            this.collectionSize = data?.totalCount || data?.totalrecords || data?.totalRecords || data?.length || 0
          if (this.rowData.length <= 0) {
            this.alertService.errorAlert({
              text: "No data found!"
            })
            return
          }
        });
    }
    f.submitted = true
  }

  MerchnatList() {

    this.merchantService.getResellerMerchant(localStorage.getItem("user")).subscribe((res: any) => {
      this.Resultdata = res
      console.log("merchant mid", res)
    });
    this.merchantService.getResellerMerchantName(localStorage.getItem("user")).subscribe((res: any) => {
      this.ResultdataName = res
      console.log("merchant mid", res)
    });

  }

  onFilterChange(param: FilterChangedEvent | any) {
    console.log("onFilterChange----->", param);
    console.log("this.filterObj----->", this.filterObj?.age?.appliedModel);
//     // this.rowData.length = 0
//     this.gridApi.applyTransaction({remove: this.rowData})
//     this.gridApi.showLoadingOverlay();
// var body = {
//   "name":"",
//   "mid" : "",
//   "startDate": "",
//   "endDate": ""
// }
//     const self= this;
//     // setTimeout(()=>{
//     this.merchantService.getAllMerchant(this.pageSize, (this.currentPage-1))
//       // @ts-ignore
//       .subscribe((data) => ( console.log("****onFilterChange"),self.gridApi.applyTransaction({add:data.filter((dt)=>{
//           if(dt.age == self.filterObj?.age?.appliedModel.filter)
//             return dt;
//         })
//       })));
//     // }, 1000)
//

  }

  onFilterModified(param: FilterModifiedEvent | any) {
    // console.log("onFilterModified----->",param);
    const temp = param?.filterInstance;
    this.filterObj[param?.column?.colId] = temp;
  }

  onFilterOpened(param: FilterOpenedEvent | any) {
    console.log("onFilterOpened----->", param);
  }

  onPageSizeChanges($event: Event) {
    this.gridApi.paginationSetPageSize(this.pageSize)
    this.gridApi.applyTransaction({remove: this.rowData})
    this.gridApi.showLoadingOverlay();
    const filter: MerchantFilter = {
      Status: ''
    }
    if (this.Status != "") {
      filter.name = this.searchMerName ? this.searchMerName : '' + this.Status ? this.Status : '';
    } else {
      if (this.searchMerName || '') filter.name = this.searchMerName || '';
    }
    if (this.searchMerName) filter.name = this.searchMerName ? this.searchMerName['$ngOptionLabel'].trim() || this.searchMerName : "";
    if (this.searchMID) filter.mid = this.searchMID ? this.searchMID['$ngOptionLabel'].trim() || this.searchMID : "";
    if (this.Status) filter.Status = this.Status || '';
    if (this.searchFromDate) filter.startDate = this.searchFromDate;
    if (this.searchToDate) filter.endDate = this.searchToDate;
    this.merchantService.getAllMerchant(this.pageSize, (this.currentPage - 1), filter, this.resellerId)
      // this.merchantService.getAllMerchant(this.pageSize, (this.currentPage - 1), {}, this.resellerId)
      .subscribe((data) => (this.rowData = data.data || data.merchants || data, this.collectionSize = data.totalCount || data.totalRecords, this.gridApi.applyTransaction({add: this.rowData})));

  }

  closeModalBlocked($event: any) {
    if (!$event.showModal) {
      this.modalblockedComponent.close();
      this.refreshGrid();
    }
  }

  merchantStatusDropdown() {
    return this.merchantService.getMerchantStatus()
      // .post(
      //   `${API_URL}/GetDropdown`, postdata
      // )
      .subscribe((res) => (this.merchantStatusdata = res, console.log("res", this.merchantStatusdata)));

  }

  // exportExcel(excelData) {

  //   //Title, Header & Data
  //   const title = excelData.title;
  //   const header = excelData.headers
  //   const data = excelData.data;

  //   //Create a workbook with a worksheet
  //   let workbook = new Workbook();
  //   let worksheet = workbook.addWorksheet('Sales Data');


  //   //Add Row and formatting
  //   worksheet.mergeCells('C1', 'F4');
  //   let titleRow = worksheet.getCell('C1');
  //   titleRow.value = title
  //   titleRow.font = {
  //     name: 'Calibri',
  //     size: 16,
  //     underline: 'single',
  //     bold: true,
  //     color: { argb: '0085A3' }
  //   }
  //   titleRow.alignment = { vertical: 'middle', horizontal: 'center' }

  //   // Date
  //   worksheet.mergeCells('G1:H4');
  //   let d = new Date();
  //   let date = d.getDate() + '-' + d.getMonth() + '-' + d.getFullYear();
  //   let dateCell = worksheet.getCell('G1');
  //   dateCell.value = date;
  //   dateCell.font = {
  //     name: 'Calibri',
  //     size: 12,
  //     bold: true
  //   }
  //   dateCell.alignment = { vertical: 'middle', horizontal: 'center' }

  //   //Add Image
  //   let myLogoImage = workbook.addImage({
  //     base64: logo.imgBase64,
  //     extension: 'png',
  //   });
  //   worksheet.mergeCells('A1:B4');
  //   worksheet.addImage(myLogoImage, 'A1:B4');

  //   //Blank Row
  //   worksheet.addRow([]);

  //   //Adding Header Row
  //   let headerRow = worksheet.addRow(header);
  //   headerRow.eachCell((cell, number) => {
  //     cell.fill = {
  //       type: 'pattern',
  //       pattern: 'solid',
  //       fgColor: { argb: '4167B8' },
  //       bgColor: { argb: '' }
  //     }
  //     cell.font = {
  //       bold: true,
  //       color: { argb: 'FFFFFF' },
  //       size: 12
  //     }
  //   })

  //   // Adding Data with Conditional Formatting
  //   data.forEach(d => {
  //     let row = worksheet.addRow(d);

  //     let sales = row.getCell(6);
  //     let color = 'FF99FF99';
  //     if (+sales.value < 200000) {
  //       color = 'FF9999'
  //     }

  //     sales.fill = {
  //       type: 'pattern',
  //       pattern: 'solid',
  //       fgColor: { argb: color }
  //     }
  //   }
  //   );

  //   worksheet.getColumn(3).width = 20;
  //   worksheet.addRow([]);

  //   //Footer Row
  //   let footerRow = worksheet.addRow(['Employee Sales Report Generated from example.com at ' + date]);
  //   footerRow.getCell(1).fill = {
  //     type: 'pattern',
  //     pattern: 'solid',
  //     fgColor: { argb: 'FFB050' }
  //   };

  //   //Merge Cells
  //   worksheet.mergeCells(`A${footerRow.number}:F${footerRow.number}`);

  //   //Generate & Save Excel File
  //   workbook.xlsx.writeBuffer().then((data) => {
  //     let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //     fs.saveAs(blob, title + '.xlsx');
  //   })

  // }


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
    fileName += ReportTitle.replace(/ /g, "_");

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

  OnlyCharacterAllowed(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122) || (charCode == 32)) {
      // console.log('charCode restricted is' + charCode)
      return true;
    }
    return false;
  }

  allowAlfanumeric($event: Event): void {

    this.searchMerName = this.searchMerName.replace(/[^a-z0-9]/gi, '') || this.searchMerName['$ngOptionLabel'].trim().replace(/[^a-z0-9]/gi, '') || '';
    this.searchMID = this.searchMID.replace(/[^a-z0-9]/gi, '') || this.searchMID['$ngOptionLabel'].trim().replace(/[^a-z0-9]/gi, '') || '';
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + new Date().getTime() + EXCEL_EXTENSION);
  }
}
