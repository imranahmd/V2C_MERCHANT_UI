import {Component, EventEmitter, HostListener, OnInit, Output, ViewChild} from '@angular/core';
import {
  ColDef,
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
import {ResellerFilter, ResellerService} from "./reseller.service";
import {BtnCellRenderer} from "../../../../common/button-cell-renderer.component";
import {NgbTypeaheadSelectItemEvent} from "@ng-bootstrap/ng-bootstrap";
import {Router} from "@angular/router";
import {SidebarComponent} from "../../../layout/sidebar/sidebar.component";
import {SideNavService} from "../../../layout/sidebar/side-name.service";
import {StorageService} from "../../../../_services/storage.service";
import {Location} from "@angular/common";
import {MenusService} from 'src/app/_services/menu.service';
import {AlertService} from 'src/app/_services/alert.service';

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

const {API_URL} = environment;

// const API_URL = 'http://localhost:8000'
export interface IResellerData {
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
  selector: 'app-reseller-master',
  templateUrl: './reseller-master.component.html',
  styleUrls: ['./reseller-master.component.scss']
})
export class ResellerMasterComponent implements OnInit {
  @Output() resellerSelectEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() resellerConfigEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() BlockedresellerSelectEvent: EventEmitter<any> = new EventEmitter<any>();
  public quickFilterShow: boolean = false;
  public searchMerName: string;
  public searchMID: string;
  public searchFromDate: string;
  public searchToDate: string;
  public selectedReseller: string;
  public Status: string;
  resellerStatus: any;
  public detailCellRenderer = new DetailCellRenderer;
  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 150,
    filter: true,
    resizable: true
  };
  public rowData!: IResellerData[];
  tablecolumn: any;
  currentPage: number = 1;
  pageSize: number = 10;
  globalSearch: string = '';
  collectionSize: number = 0;
  modalConfigAdd: ModalConfig;
  modalConfigEdit: ModalConfig;
  modalConfigReseller: ModalConfig;
  Resellerdata: any;
  modalConfigBlocked: ModalConfig;
  public menuItems: any;
  public permissions: any = '';
  currentDate: any = new Date();

  tableInfo: any;
  resellerListOptions: any;
  tableData: any[];
  resellerStatusdata: any;
  maxSize: number;
  ellipses: boolean = true;
  @ViewChild('modalbloked') private modalblockedComponent: ModalComponent;
  public columnDefs: ColDef[] = [
    {field: 'resellerName', resizable: true, cellRenderer: 'agGroupCellRenderer'},
    {field: 'resellerId'},
    // {field: 'businessName'},
    {field: 'contactPerson'},
    {field: 'id', hide: true},
    {field: 'contactNumber'},
    {field: 'emailId'},
    //{field: 'state'},
    {field: 'createdOn'},
    {field: 'kyc_Approvel', headerName: 'KYC Approval'},
    {field: 'status'},
    // {field: 'legalName'},
    //{field: 'brandName'},
    // {field: 'businessType'},
    //{field: 'dateOfIncorporation'},
    // {field: 'businessCategory'},
    // {field: 'subCategory'},
    // {field: 'businessModel'},
    //{field: 'turnoverLastFinancialYear'},
    // {field: 'turnoverMonthlyExpeced'},
    // {field: 'turnoverMonthlyExpeced'},
    //{field: 'avgAmountPerTxn'},
    //{field: 'registeredAddress'},
    //{field: 'pinCode'},


    {field: 'city', hide: true},
    // {field: 'created_on',valueFormatter: dateFormatter},
    // {field: 'status', valueFormatter: statusFormatter},
    {
      field: 'Actions', width: 30, pinned: 'right', cellRenderer: BtnCellRenderer, cellRendererParams: [
        /*{
          clicked: async (event: any, param:any) => {
            this.selectedReseller = param.data.resellerId
            console.log("ad--------------->",this.selectedReseller,  param.data.resellerId)
            this.resellerSelectEvent.emit(this.selectedReseller);
            return await this.modalResellerBankComponent.open();
          },
          buttonIconClass: 'icon-settings'
        },*/{
          clicked: async (event: any, param: any) => {
            this.tableInfo = param.data.resellerId
            this.BlockedresellerSelectEvent.emit(this.tableInfo);
            return await this.modalblockedComponent.open();
          },
          buttonIconClass: 'icon-settings'
        },
        /*{
          clicked: async (field: any, param:any) => {
            console.log((`${field} was clicked`))
            this.Resellerdata = param.data.resellerId
            console.log("ad--------------->",this.Resellerdata,  param.data.resellerId)
            this.resellerConfigEvent.emit(this.Resellerdata);
            await this.modalResellerComponent.open()
          },
          buttonIconClass: 'icon-edit-2'
        }*/
      ]
    }


  ];
  tableSelectedColumn: ColDef[] = [...this.columnDefs];
  private gridApi!: GridApi;
  private filterObj: any = {};
  @ViewChild('modalEdit') private modalEditComponent: ModalComponent
  @ViewChild('modalAdd') private modalAddComponent: ModalComponent
  @ViewChild('modalReseller') private modalResellerComponent: ModalComponent
  @ViewChild('modalResellerBank') private modalResellerBankComponent: ModalComponent
  private innerWidth: number;
  private _event: any;

  constructor(private menuService: MenusService, private location: Location, private sideNavService: SideNavService, private resellerService: ResellerService, private router: Router, private sidebarComponent: SidebarComponent, private storageService: StorageService, private alertService: AlertService) {
    this.resellerService.getBusinessType().subscribe((data) => this.resellerStatus = data)

  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term: string) => term.length < 2 ? []
        : this.rowData.filter(v => (v.name.toLowerCase().indexOf(term.toLowerCase()) > -1)).map(v => v.name).slice(0, 10))
    );

  ngOnInit(): void {

    this.resellerService.getResellerList().subscribe((data) => this.resellerListOptions = data)
    this.ResellerStatusDropdown()
    // var path = this.location.prepareExternalUrl(this.location.path());
    // if (path.charAt(0) === '#') {
    //   path = path.slice(1);
    // }
    // if (path.indexOf(";") > -1) {
    //   path = path.substr(0, path.indexOf(";"));
    // }
    // console.log("=====>-------------------", path);
    // this.menuItems = this.storageService.getMenuItems();
    // if(this.menuItems){
    //   const currentMenuDetails = this.menuItems?.['Reseller Master']?.find((m:any) => m.submenu == 'Reseller List');
    //   this.permissions = currentMenuDetails?.Permission?.permissions || ''
    // }
    const path = this.location.prepareExternalUrl(this.location.path());
    this.permissions = this.menuService.getPermissions(path);

    this.modalConfigBlocked = {
      modalTitle: "Reseller Status",
      modalSize: 'lg',
      hideCloseButton(): boolean {
        return true;
      },
      hideDismissButton(): boolean {
        return true
      }
    }
    this.modalConfigAdd = {
      modalTitle: "Add Reseller",
      modalSize: 'xl',
      hideCloseButton(): boolean {
        return true;
      },
      hideDismissButton(): boolean {
        return true
      }
    }

    this.modalConfigEdit = {
      modalTitle: "Edit Reseller",
      modalSize: 'xl',
      hideCloseButton(): boolean {
        return true;
      },
      hideDismissButton(): boolean {
        return true
      }
    }
    this.modalConfigReseller = {
      modalTitle: "Reseller RMS Configuration",
      modalSize: 'xl',
      hideCloseButton(): boolean {
        return true;
      },
      hideDismissButton(): boolean {
        return true
      }
    }


  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    console.log(this.innerWidth, "------->");
    this._event = event;
    this.innerWidth = window.innerWidth;
    this.setPageSize();
  }


  changeDate() {
    this.currentDate = this.searchFromDate
  }

  changeEndDate() {
    this.currentDate = this.searchToDate
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

  quickFilterShowAction($event: Event) {
    this.quickFilterShow = !this.quickFilterShow
    if (!this.quickFilterShow) {
      // this.searchToDate = '';
      // this.searchFromDate = '';
      // this.searchMID = '';
      // this.searchMerName = '';
      this.refreshGrid();
    }
  }

  onSearchBtnClick($event: Event) {
    const filter: ResellerFilter = {}
    if (this.Status != "") {
      filter.rname = this.searchMerName ? this.searchMerName : '' + this.Status ? this.Status : '';
    } else {
      if (this.searchMerName || '') filter.rname = this.searchMerName || '';
    }
    // if (this.searchMerName) filter.rname = this.searchMerName;
    if (this.searchMID) filter.rid = this.searchMID;
    if (this.searchFromDate) filter.startDate = this.searchFromDate;
    if (this.searchToDate) filter.endDate = this.searchToDate;
    if (this.Status) filter.Status = this.Status;
    return this.resellerService.getAllReseller(this.pageSize, 0, filter)
      .subscribe((data) => {

          this.rowData = data?.data || data?.resellers || data || [];
          this.collectionSize = data?.totalCount || data?.totalrecords || data?.totalRecords || data?.length || 0
          if (this.rowData.length <= 0) {
            this.alertService.errorAlert({text: "No data found!"})
            return
          }
        }
      );

  }

  closeModalAdd($event: any) {
    if (!$event.showModal) {
      this.modalAddComponent.close();
      this.refreshGrid();
    }

  }

  reformatString(elements: any) {
    return (elements.replace(/\_/g, " ").charAt(0).toUpperCase() + elements.replace(/\_/g, " ").slice(1)).replace(/([A-Z]+)/g, ' $1').replace(/^ /, '')
  }

  refreshGrid() {
    this.gridApi.applyTransaction({remove: this.rowData});
    return this.resellerService.getAllReseller(this.pageSize, (this.currentPage - 1))
      .subscribe((data) => (this.rowData = data.data || data.resellers || data, this.collectionSize = data.totalCount || data.totalrecords || data.totalRecords || data.length));
  }

  onGridReady(params: GridReadyEvent<IResellerData>) {
    this.gridApi = params.api;
    this.gridApi.getFilterInstance('age', (filterParam) => {
    })
    this.gridApi.showLoadingOverlay();
    this.gridApi.setQuickFilter(this.globalSearch);

    return this.resellerService.getAllReseller(this.pageSize, (this.currentPage - 1))
      .subscribe((data) => {

        this.rowData = data.data || data.resellers || data;
        this.collectionSize = data.totalCount || data.totalrecords || data.totalRecords || data.length;
        this.tableData = data.data || data.resellers || data;
        // Object.keys(this.rowData[0]).forEach((elements, i) => {
        //   this.columnDefs.push(
        //     {
        //       field: elements,
        //       headerValueGetter: (params) => this.reformatString(elements),
        //       filter: 'agNumberColumnFilter'
        //     }
        //   )
        // });
        // this.columnDefs.push(
        //   {
        //     field: 'Actions', cellRenderer: BtnCellRenderer, cellRendererParams: [
        //       {
        //         clicked: async (event: any, param: any) => {
        //           this.tableInfo = param.data.resellerId
        //           this.BlockedresellerSelectEvent.emit(this.tableInfo);
        //           return await this.modalblockedComponent.open();
        //         },
        //         buttonIconClass: 'icon-settings'
        //       },
        //     ]
        //   }
        // );
        // this.tableSelectedColumn = [...this.columnDefs];
        // this.gridApi.setColumnDefs(this.tableSelectedColumn);
        // this.gridApi.setRowData(this.rowData)
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
    var random3 = Math.floor(Math.random() * 10000000000 + 1);
    var today = new Date();
    var referenceId = today.getFullYear().toString() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2) + "_" + (("0" + today.getHours())).slice(-2) + "-" + (("0" + today.getMinutes())).slice(-2) + "-" + (("0" + today.getSeconds())).slice(-2)
    var fileName = 'Reseller_Master' + "_" + referenceId
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
    await this.router.navigate(['/reseller/reseller-creation'])
    // return await this.modalAddComponent.open();
  }

  async ResellerNew() {
    return await this.modalResellerComponent.open();
  }

  onPaginationChange(param: PaginationChangedEvent | any) {

    // this.gridApi.paginationSetPageSize()
    console.log("onPaginationChange----->", param, this.pageSize);
    this.gridApi.applyTransaction({remove: this.rowData})
    this.gridApi.showLoadingOverlay();
    const filter: ResellerFilter = {}
    if (this.Status != "") {
      filter.rname = this.searchMerName ? this.searchMerName : '' + this.Status ? this.Status : '';
    } else {
      if (this.searchMerName || '') filter.rname = this.searchMerName || '';
    }
    // if (this.searchMerName) filter.rname = this.searchMerName;
    if (this.searchMID) filter.rid = this.searchMID;
    if (this.searchFromDate) filter.startDate = this.searchFromDate;
    if (this.searchToDate) filter.endDate = this.searchToDate;
    if (this.Status) filter.Status = this.Status;
    this.resellerService.getAllReseller(this.pageSize, (param - 1), filter)
      .subscribe((data) => (console.log("****onGridReady", data),
        this.rowData = data.data || data.resellers || data,
        this.collectionSize = data.totalCount || data.totalRecords || data.length,
        this.gridApi.applyTransaction({add: this.rowData})));
  }

  onRowClicked(param: RowClickedEvent | any) {
    console.log("Row Clicked", param);
  }

  async onRowDoubleClicked(param: RowClickedEvent | any) {

    console.log("Row Clicked", this.permissions);
    if (this.permissions.includes('Edit')) {
      return await this.router.navigate(['/reseller/reseller-creation'], {queryParams: {mid: param?.data?.resellerId}})
    }
    return false
  }

  onFilterChange(param: FilterChangedEvent | any) {
//     console.log("onFilterChange----->",param);
//     console.log("this.filterObj----->",this.filterObj?.age?.appliedModel);
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
//     this.resellerService.getAllReseller(this.pageSize, (this.currentPage-1))
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
    console.log($event.preventDefault());
    this.gridApi.paginationSetPageSize(this.pageSize)
    this.gridApi.applyTransaction({remove: this.rowData})
    this.gridApi.showLoadingOverlay();
    this.resellerService.getAllReseller(this.pageSize, (this.currentPage - 1))
      .subscribe((data) => {
          this.rowData = data.data || data.resellers || data;
          this.collectionSize = data.totalCount || data.totalRecords;
          this.gridApi.applyTransaction({add: this.rowData});
        }
      );

  }

  closeModalBlocked($event: any) {
    if (!$event.showModal) {
      this.modalblockedComponent.close();
      this.refreshGrid();
    }
  }

  ResellerStatusDropdown() {
    return this.resellerService.getMerchantStatus()
      // .post(
      //   `${API_URL}/GetDropdown`, postdata
      // )
      .subscribe((res) => (this.resellerStatusdata = res, console.log("res", this.resellerStatusdata)));

  }

  updateSelectedColumn(event: any) {
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

    this.searchMerName = this.searchMerName;
    this.searchMID = this.searchMID;
  }
}

var filterParams = {
  // @ts-ignore
  comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
    var dateAsString = cellValue;
    if (dateAsString == null) return -1;
    var dateParts = dateAsString.split('/');
    var cellDate = new Date(
      Number(dateParts[2]),
      Number(dateParts[1]) - 1,
      Number(dateParts[0])
    );
    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
      return 0;
    }
    if (cellDate < filterLocalDateAtMidnight) {
      return -1;
    }
    if (cellDate > filterLocalDateAtMidnight) {
      return 1;
    }
  },
  browserDatePicker: true,
};
