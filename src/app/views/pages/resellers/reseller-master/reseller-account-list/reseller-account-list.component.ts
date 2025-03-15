import {Component, EventEmitter, Input, OnInit, ViewChild} from '@angular/core';
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
  RowClickedEvent,
} from 'ag-grid-community';
import {debounceTime, distinctUntilChanged, map, Observable} from "rxjs";
// import { CellCustomComponent } from './cell-custom/cell-custom.component';
import {FormBuilder, FormControl, FormGroup, PatternValidator, Validators} from '@angular/forms';
import {BtnCellRenderer} from 'src/app/common/button-cell-renderer.component';
import {ModalComponent} from 'src/app/common/modal/modal.component';
import {ModalConfig} from 'src/app/common/modal/modal.config';
import {ActivatedRoute, Router} from '@angular/router';
import {ConfirmPasswordValidator} from "../resellers.validator";
import {environment} from "../../../../../../environments/environment";
import {ApiHttpService} from "../../../../../_services/api-http.service";
import {DatePipe, Location} from "@angular/common";
import {AlertService} from "../../../../../_services/alert.service";
import {ResellerService} from '../reseller.service';
import {ProvidersService} from 'src/app/_services/providers.service';
import {MenusService} from "../../../../../_services/menu.service";
import {moreThanOneWhiteSpaceValidator} from "../../../../../common/common.validators";

const {API_URL} = environment;

export interface IResellerData {
  "id": number,
  "resellerId": string,
  "productId": string,
  "accountNumber": string,
  "ifscCode": string,
  "bankName": string,
  "rodate": string
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

@Component({
  selector: 'app-reseller-account-list',
  templateUrl: './reseller-account-list.component.html',
  styleUrls: ['./reseller-account-list.component.scss']
})
export class ResellerAccountListComponent implements OnInit {

  @Input() resellerId: string;
  @Input() onResellerChange: EventEmitter<any> = new EventEmitter<any>();
  selectedreseller: number;
  accountform: FormGroup;
  isForm1Submitted: Boolean;
  currentURL: Boolean = false
  public detailCellRenderer = new DetailCellRenderer;
  modalConfigDelete: ModalConfig;
  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 150,
    filter: true,
  };
  public rowData!: IResellerData[];
  tablecolumn: any;
  currentPage: number = 1;
  pageSize: number = 10;
  globalSearch: string = '';
  collectionSize: number = 0;
  SingleRow: any;
  tableInfo: any;
  Resdata: any;
  Resdatas: any;
  isDisable: boolean = false;
  formData: any;
  isValid: string = 'N';
  isChecked: boolean = true;
  selectedAttributes: any
  arr: any = {}
  public IFSCValue: string = '';
  randomdata: { resellerid: string; };
  cities = [
    {id: 1, name: 'Vilnius'},
    {id: 2, name: 'Kaunas'},
    {id: 3, name: 'Pavilnys', disabled: true},
    {id: 4, name: 'Pabradė'},
    {id: 5, name: 'Klaipėda'}
  ];
  actionCol = {
    field: 'action', headerName: 'Action', resizable: true, cellRenderer: BtnCellRenderer, cellRendererParams: [
      {
        clicked: async (field: any, param: any) => {
          // console.log((`${field} was clicked` + param))
          // this.tableInfo = param.data
          // await this.modalDeleteComponent.open();
          this.alertService.confirmBox(this.DeleteAccount(param.data.id), {}, {
            html: "Record has been deleted.!"
          }, () => {
            this.refreshGrid(this.resellerId);
          })
        },
        buttonIconClass: 'icon-trash',
        // buttonDisable: !(this.permissions.includes('Add New') || this.permissions.includes('Edit'))
      }
    ]
  }
  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
  public columnDefs: ColDef[] = [
    {field: 'id', headerName: 'ID', hide: true},
    {field: 'resellerId', headerName: 'Reseller ID'},
    // { field: 'productId' },
    {field: 'accountNumber', headerName: 'Account Number'},
    {field: 'ifscCode', headerName: 'IFSC Code'},
    {field: 'accountHolderName', headerName: 'Account Holder Name'},
    {field: 'bankName', headerName: 'Bank Name'},
    {field: 'isActive', headerName: 'Is Active'},
    {field: 'isDeleted', headerName: 'Is Deleted'},
    {
      field: 'rodt', headerName: 'Ro Date',
      filter: 'agDateColumnFilter',
      filterParams: filterParams,
    }

  ];
  public tableSelectedColumn: ColDef[] = [...this.columnDefs.filter((c) => !c.hide)];
  arraydata: any[] = [];
  public permissions: any;

  Requestbody: any;
  Ress: any;
  isverify: string = 'N';
  errorMessage: any;
  public IFSCcheck: boolean;
  public IFSCData: any;
  public IFSCvalue: string;
  errorOccured: boolean = false;
  ValidAccount: boolean = true;
  newDate: any = new Date();
  @ViewChild('modalDelete') private modalDeleteComponent: ModalComponent
  private gridApi!: GridApi;
  private filterObj: any = {};
  private resellerValue: null;
  private resellerresponse: any;
  private queryParams: any = {};
  private validIFSC: any;
  private validationIFSC: boolean;

  constructor(private alertService: AlertService, private menuService: MenusService, private resellerService: ResellerService, private location: Location, private route: ActivatedRoute, private router: Router, private apiHttpService: ApiHttpService, fb: FormBuilder, private providerService: ProvidersService, private datePipe: DatePipe) {
    var URL = this.router.url

    if (URL.indexOf("reseller-master") > 0) {
      this.currentURL = true
    } else {
      this.currentURL = false

    }

    // this.MerchnatList()
    this.accountform = fb.group({
        resellerId: [this.resellerId || "", [Validators.required]],
        // productId: ["DEFAULT", Validators.required],
        accountNumber: ["", [moreThanOneWhiteSpaceValidator(), Validators.required, Validators.maxLength, Validators.minLength]],
        retypeaccountNumber: ["", [moreThanOneWhiteSpaceValidator(), Validators.required, Validators.maxLength, Validators.minLength]],
        ifscCode: ["", [moreThanOneWhiteSpaceValidator(), Validators.required, new PatternValidator, Validators.pattern]],
        bankName: ["", [Validators.required, Validators.pattern]],
        account_holder: ["", [moreThanOneWhiteSpaceValidator(), Validators.required, Validators.maxLength(200)]],
        mobile_number: ["", [Validators.required, Validators.maxLength]],
        email_address: ["", [Validators.required, Validators.email]],
        serviceprovider: ["DECENTRO"],
        // rodate: [""],

      },
      {
        validator: ConfirmPasswordValidator("accountNumber", "retypeaccountNumber")
      }
    );

    this.modalConfigDelete = {
      modalTitle: "Delete Confirmation",
      modalSize: 'sm',
      hideCloseButton(): boolean {
        return true
      },
      hideDismissButton(): boolean {
        return true
      }
    }
  }

  get form1() {
    return this.accountform.controls;
  }

  resetIFSC(event: any, control: any, checkcontrol: any) {

    var serviceprovider = event.target.value
    var data = {
      "serviceprovider": serviceprovider,
      "ifscCode": control.value
    }
    if (control.value?.length == 11 && control.valid) {

      this.providerService.IFSCValidate(data).subscribe((res: any) => {
        console.log(res)
        this.validIFSC = res

        if ((this.validIFSC?.status == 'valid') || this.validIFSC?.result.bank) {
          this.validationIFSC = true
          if (checkcontrol == 'IFSCcheck') {
            this.IFSCcheck = true
            this.IFSCData = this.validIFSC?.data?.branch || this.validIFSC?.result?.office
          }
        } else {
          this.validationIFSC = false
          if (checkcontrol == 'IFSCcheck') {
            this.IFSCcheck = false
            this.IFSCData = ""

          }
        }
      })
    } else {
      this.validIFSC = false
      if (checkcontrol == 'IFSCcheck') {
        this.IFSCcheck = false
        this.IFSCData = ""
      }
      return
    }
  }

  ValidateIFSC(event: any, serviceprovider: any, control: any, checkcontrol: any) {

    control.setValue(event.target.value.toUpperCase())
    this.IFSCvalue = event.target.value.toUpperCase()
    var data = {
      "serviceprovider": serviceprovider,
      "ifscCode": this.IFSCvalue
    }
    if (this.IFSCvalue.length == 11 && control.valid) {

      this.providerService.IFSCValidate(data).subscribe((res: any) => {
        console.log(res)
        this.validIFSC = res

        if ((this.validIFSC?.status == 'valid') || this.validIFSC?.result.bank) {
          this.validationIFSC = true
          if (checkcontrol == 'IFSCcheck') {
            this.IFSCcheck = true
            this.IFSCData = this.validIFSC?.data?.branch || this.validIFSC?.result?.office

          }
        } else {
          this.validationIFSC = false
          if (checkcontrol == 'IFSCcheck') {
            this.IFSCcheck = false
            this.IFSCData = ""
          }
        }
      })
    } else {
      this.validIFSC = false
      if (checkcontrol == 'IFSCcheck') {
        this.IFSCcheck = false
        this.IFSCData = ""
      }
      return
    }
  }

  updateSelectedColumn(event: any) {
    if (event.target.checked) {
      if (this.tableSelectedColumn.indexOf(this.columnDefs[parseInt(event.target.value)]) < 0) {
        // this.tableSelectedColumn.push(this.columnDefs[parseInt(event.target.value)]);
        this.tableSelectedColumn.splice(parseInt(event.target.value) - 1, 0, this.columnDefs[parseInt(event.target.value)]);

      }
    } else {
      if (this.tableSelectedColumn.indexOf(this.columnDefs[parseInt(event.target.value)]) > -1) {
        this.tableSelectedColumn.splice(this.tableSelectedColumn.indexOf(this.columnDefs[parseInt(event.target.value)]), 1);
      }
    }
    const actionCol = {
      field: 'action', headerName: 'Action', resizable: true, cellRenderer: BtnCellRenderer, cellRendererParams: [
        {
          clicked: async (field: any, param: any) => {
            // console.log((`${field} was clicked` + param))
            // this.tableInfo = param.data
            // await this.modalDeleteComponent.open();
            this.alertService.confirmBox(this.DeleteAccount(param.data.id), {}, {
              html: "Record has been deleted.!"
            }, () => {
              this.refreshGrid(this.resellerId);
            })
          },
          buttonIconClass: 'icon-trash'
        }
      ]
    }
    let colCnst;
    if (this.permissions.includes('Add New') || this.permissions.includes('Edit')) {
      colCnst = [...this.tableSelectedColumn, actionCol];
    } else {
      colCnst = [...this.tableSelectedColumn];
    }
    console.log("--------->>>>", colCnst);
    this.gridApi.setColumnDefs(colCnst);
    // this.gridApi.setColumnDefs(this.tableSelectedColumn)
  }

  ngOnInit(): void {
    let path = this.location.prepareExternalUrl(this.location.path());
    this.permissions = this.menuService.getPermissions(path);
    console.log("--------->", this.permissions)
    if (this.resellerId) {
      this.isDisable = !this.isDisable;
    }
    this.route.queryParams
      .subscribe(params => {
          console.log("account list params-------------->", params);
          this.queryParams = params;
          this.resellerId = params?.mid || null;
          this.isDisable = true;
          this.accountform.get('resellerId')?.setValue(this.resellerId);
          this.accountform.get('resellerId')?.disable();
          this.onResellerChange.emit(this.resellerId);
        }
      );

    this.isForm1Submitted = false;
    // @ts-ignore
    this.onResellerChange.subscribe((data) => (console.log("data=========>", data, this.resellerId), this.resellerId = data, <FormControl>this.accountform.get('resellerId').setValue(data), this.refreshGrid()))

    this.BanKName();
    if (!(this.permissions.includes('Add New') || this.permissions.includes('Edit'))) {
      this.accountform.disable()
    }
    // this.columnDefs.push(actionCol);

  }

  DeleteAccount(ID: any) {
    let data = {
      "id": ID.id || ID,
      "resellerId": this.resellerId
    }

    return this.apiHttpService
      .post(
        `${API_URL}/delete-resellerBank-byid`, data
      );

  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term: string) => term.length < 2 ? []
        : this.rowData.filter(v => (v.resellerId.toLowerCase().indexOf(term.toLowerCase()) > -1)).map(v => v.resellerId).slice(0, 10))
    );

  async closeModelAction($event: Event) {
    await this.modalDeleteComponent.dismiss();
    this.refreshGrid(this.resellerId);
  }

  refreshGrid(Mid: any) {

    if (this.accountform.controls['resellerId'].value === "") {
      this.resellerValue = null
    } else {
      this.resellerValue = this.accountform.controls['resellerId'].value
    }
    let data = {
      "resellerId": this.resellerId || this.resellerValue || Mid || ""
    }
    this.gridApi.showLoadingOverlay();

    return this.apiHttpService
      .post(
        `${API_URL}/get-reseller-bankacc-by-resellerid`, data
      )
      .subscribe((data: any) => {
          this.rowData = data?.id != null ? data?.data || Array.isArray(data) ? data : [data] : [];
          this.collectionSize = data?.totalCount || data?.length || this.rowData.length
        }
      );
  }

  loadDatabyMid() {

    //this.accountform.controls['resellerId'].setValue(mid)
    this.refreshGrid(this.resellerId);
  }

  onGridReady(params: GridReadyEvent<IResellerData>) {
    // let data = {
    //   "resellerid": this.resellerId || this.accountform.controls['resellerId'].value == "" ? null : this.accountform.controls['resellerId'].value
    // }
    if (this.accountform.controls['resellerId'].value === "") {
      this.resellerValue = null
    } else {
      this.resellerValue = this.accountform.controls['resellerId'].value
    }
    let data = {
      "resellerId": this.resellerId || this.resellerValue
    }
    this.gridApi = params.api;
    this.gridApi.getFilterInstance('age', (filterParam) => {
      console.log('asdasdad', filterParam);
    })
    this.gridApi.showLoadingOverlay();

    const actionCol = {
      field: 'action', headerName: 'Action', resizable: true, cellRenderer: BtnCellRenderer, cellRendererParams: [
        {
          clicked: async (field: any, param: any) => {
            // console.log((`${field} was clicked` + param))
            // this.tableInfo = param.data
            // await this.modalDeleteComponent.open();
            this.alertService.confirmBox(this.DeleteAccount(param.data.id), {}, {
              html: "Record has been deleted.!"
            }, () => {
              this.refreshGrid(this.resellerId);
            })
          },
          buttonIconClass: 'icon-trash',
          buttonDisable: !(this.permissions.includes('Add New') || this.permissions.includes('Edit'))
        }
      ]
    }
    let colCnst;
    if (this.permissions.includes('Add New') || this.permissions.includes('Edit')) {
      colCnst = [...this.tableSelectedColumn, actionCol];
    } else {
      colCnst = [...this.tableSelectedColumn];
    }
    console.log("--------->>>>", colCnst);
    this.gridApi.setColumnDefs(colCnst);
    return this.apiHttpService
      .post(
        `${API_URL}/get-reseller-bankacc-by-resellerid?pageSize=${this.pageSize}&page=${(this.currentPage - 1)}`, data
      )
      .subscribe((data: any) => {
        this.rowData = data?.id != null ? data?.data || Array.isArray(data) ? data : [data] : [];
        this.collectionSize = data?.totalCount || data?.length || this.rowData.length;
      });

  }

  onBtnC(e: Event) {
    e.preventDefault();
    console.log("asdasdas");
    // @ts-ignore
    var data = {
      "resellerid": this.resellerId || this.accountform.controls['resellerId'].value == "" ? null : this.accountform.controls['resellerId'].value
    }
    return this.apiHttpService
      .post(
        `${API_URL}/get-merchantbank`, data
      )
      // @ts-ignore
      .subscribe((data) => (this.gridApi.applyTransaction({add: data})));
  }

  onExportCSV() {
    console.log("asdasdas");
    // @ts-ignore
    var random3 = Math.floor(Math.random() * 10000000000 + 1);
    var today = new Date();
    var referenceId = today.getFullYear().toString() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2) + "_" + (("0" + today.getHours())).slice(-2) + "-" + (("0" + today.getMinutes())).slice(-2) + "-" + (("0" + today.getSeconds())).slice(-2)
    var fileName = 'Reseller_Account' + "_" + referenceId
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

  onPaginationChange(param: PaginationChangedEvent | any) {
    console.log("onPaginationChange----->", param, this.pageSize);
    this.gridApi.paginationGoToPage(param - 1)
    // let postdata = {
    //   "resellerid": "M0002"
    // }
    // // this.gridApi.paginationSetPageSize()
    // console.log("onPaginationChange----->", param, this.pageSize);
    // this.gridApi.applyTransaction({remove: this.rowData})
    // this.gridApi.showLoadingOverlay();
    //
    // this.apiHttpService
    //   .post(
    //     `${API_URL}/get-merchantbank?pageSize=` + this.pageSize + '&page=' + (param - 1), postdata
    //   )
    //   .subscribe((data) => (console.log("****onGridReady"), this.rowData = data?.data || data, this.collectionSize = data?.totalCount || data?.length));
  }

  async onRowClicked(param: RowClickedEvent | any) {
    console.log("Row Clicked123", param);
    this.SingleRow = param.data
    // await this.modalDeleteComponent.openData(this.SingleRow)

  }

  onRowDoubleClicked(param: RowClickedEvent | any) {
    console.log("Row Clicked321", param);
    param.node.setExpanded(!param.node.expanded);
  }

  onFilterChange(param: FilterChangedEvent | any) {
    let Requestbody = {
      "resellerId": this.resellerId || this.accountform.controls['resellerId'].value == "" ? null : this.accountform.controls['resellerId'].value
    }
    console.log("onFilterChange----->", param);
    console.log("this.filterObj----->", this.filterObj?.age?.appliedModel);
    // this.rowData.length = 0
    this.gridApi.applyTransaction({remove: this.rowData})
    this.gridApi.showLoadingOverlay();

    const self = this;
    // setTimeout(()=>{
    self.apiHttpService
      .post(
        `${API_URL}/get-reseller-bankacc-by-resellerid?pageSize=${this.pageSize}&page=${(this.currentPage - 1)}`, Requestbody
      )
      // @ts-ignore
      .subscribe((data) => (
        console.log("****onFilterChange"),
          self.gridApi.applyTransaction({
            add: data?.filter((dt: any) => {
              if (dt.age == self.filterObj?.age?.appliedModel.filter)
                return dt;
            })
          })));
    // }, 1000)

  }

  onFilterModified(param: FilterModifiedEvent | any) {
    // console.log("onFilterModified----->",param);
    const temp = param?.filterInstance;
    console.log("onFilterModified---values-->", param?.column?.colId, param?.filterInstance);
    // ;
    console.log("onFilterModified---values-->", temp);
    this.filterObj[param?.column?.colId] = temp;
  }

  onFilterOpened(param: FilterOpenedEvent | any) {
    console.log("onFilterOpened----->", param);
  }

  onPageSizeChanges($event: Event) {
    let Requestbody = {
      "resellerId": this.resellerId || this.accountform.controls['resellerId'].value == "" ? null : this.accountform.controls['resellerId'].value
    }

    console.log($event.preventDefault());
    this.gridApi.paginationSetPageSize(this.pageSize)
    this.gridApi.applyTransaction({remove: this.rowData})
    this.gridApi.showLoadingOverlay();
    this.apiHttpService
      .post(
        `${API_URL}/get-reseller-bankacc-by-resellerid?pageSize=` + this.pageSize + '&page=' + (this.currentPage - 1), Requestbody
      )
      .subscribe((data: any) => {
        this.rowData = data?.id != null ? data?.data || Array.isArray(data) ? data : [data] : [];
        this.collectionSize = data?.totalCount;
        this.gridApi.applyTransaction({add: this.rowData})
      });

  }

  onSubmit(formvalue: any) {

    console.log(this.accountform.valid, "check value")
    // if (this.accountform.controls['retypeaccountNumber'].invalid) {
    //   alert("Account number should match with retype account!")
    // }
    if (this.accountform.valid) {
      this.resellerId = this.resellerId || formvalue.resellerId

      var resellerdata = {
        // formvalue.resellerId //formvalue.rodate
        "resellerId": this.resellerId || formvalue.resellerId,
        // "productId": formvalue.productId,
        "accountNumber": formvalue.accountNumber,
        "ifscCode": formvalue.ifscCode,
        "bankName": formvalue.bankName,
        "accountHolderName": formvalue.account_holder,
        // "mobile_number": formvalue.mobile_number,
        // "email_address": formvalue.email_address,
        // "isVerified": this.isverify,
        //  "rodt":this.datePipe.transform(this.newDate.toString(), "yyyy-MM-dd")
      }
      this.apiHttpService
        .post(
          `${API_URL}/create-reseller-bank?pageSize=` + this.pageSize + '&page=' + (this.currentPage - 1), resellerdata
        )
        .subscribe((data: any) =>

          (console.log("****onGridReady" + data),
              data.status == 'false' ? this.alertService.simpleAlert(data.respMessage) : this.alertService.successAlert(data.respMessage),
              // data.length> 0 ? alert('Inserted Successfully') : alert("Data not inserted"),
              this.isverify = 'N',
              this.resellerresponse = data.resellerId,
              // data.forEach((element: any) => {
              //   this.resellerresponse = element.resellerId

              // }),
              this.refreshGrid(this.resellerresponse),
              // this.loadDatabyMid(),
              this.accountform.reset(),
              this.accountform.markAsUntouched(),
              this.accountform.updateValueAndValidity(),
              this.accountform.get('resellerId')?.setValue(this.resellerId),
              this.accountform.get('productId')?.setValue('DEFAULT'),
              this.accountform.get('resellerId')?.disable(),
              this.ValidAccount = true,
              (this.isForm1Submitted = false)

          ));

    }
    // this.reset();
    this.isForm1Submitted = true;


  }


  DECENTRO(data: any) {

    this.isForm1Submitted = true;
    this.formData = data
    if (this.accountform.valid) {

      this.providerService.BankValidate(this.formData, this.accountform.controls['serviceprovider'].value)
        .subscribe({
          next: data => {
            (


              this.Ress = data,
                (this.Ress?.accountStatus === 'valid' || this.Ress?.result?.bankTxnStatus === true) ? this.alertService.successAlert(data?.message || data?.result?.bankResponse) : this.isverify = 'N',
                (this.Ress?.accountStatus === 'valid' || this.Ress?.result?.bankTxnStatus === true) ? this.isverify = 'Y' : this.alertService.errorAlert({html: data?.message || `Error in verifying bank account details`}),
                (this.Ress?.accountStatus === 'valid' || this.Ress?.result?.bankTxnStatus === true) ? this.ValidAccount = false : this.ValidAccount = false,
                // (this.Ress?.accountStatus === 'valid' || this.Ress?.result?.bankTxnStatus === true) ? this.errorOccured=true:console.log(data?.message)

                (this.Ress?.accountStatus === 'invalid' || this.Ress?.result?.bankTxnStatus === false) ? this.ValidAccount = true : console.log(data?.message)
              // (this.Ress?.accountStatus === 'invalid' || this.Ress?.result?.bankTxnStatus === false) ? this.isverify = 'N' : this.errorOccured = false
              // (this.Ress?.accountStatus == 'valid' || this.Ress?.result.bankTxnStatus == true) ? this.ValidAccount = true  : this.ValidAccount = false

            )
          },
          error: err => {
            this.isverify = 'N';
            this.alertService.errorAlert({
              title: 'Something went wrong!',
            })
            this.errorMessage = err.error?.message;

          }

        });
      // this.resellerService.checkAccountExists({
      //   productId: data.productId,
      //   accountNumber: data.accountNumber,
      // }).subscribe((accStatusData: any) => {
      //   console.log(accStatusData, "------------->");
      //   if (accStatusData.Status=="false") {
      //     this.alertService.errorAlert({
      //       html: accStatusData?.Message || "Some error occurred please check after some time"
      //     })
      //     return;
      //   } else if (accStatusData?.Status=="true") {

      //   } else {
      //     this.isverify = 'N';
      //     console.error("Error: ", accStatusData);
      //     this.alertService.errorAlert({
      //       html: accStatusData?.Message || "Some error occurred please check after some time"
      //     })
      //   }

      // })


    } else {
      this.alertService.errorAlert({
        title: "Invalid Fields",
        html: "Please check the entered values"
      }).then(() => {
        // this.isForm1Submitted = false;
      })

    }


  }


  reset() {
    this.accountform.reset(); // Reset form data
  }


  upDate(data: any) {

    let req = {
      "resellerId": "R00004",
      "accountNumber": "009000999232099",
      "ifscCode": "ICICI00681",
      "bankName": "ICICI",
      "accountHolderName": "Bharat",
      "isActive": "Y",
      "isDeleted": "N"
    }


  }

  //call api serviceProvide dropdown
  BanKName() {

    let bankdata = {
      "Type": "13",
      "Value": ""
    }
    this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`, bankdata
      )
      .subscribe((res) =>
        (console.log("****onGridReady" + res),
            this.Resdatas = res,
            res.forEach((element: any, i: any) => {
              //   console.log(element.FieldValue);
              // this.arr.push({name:element.FieldValue, id:i+1})
              this.arr["id"] = element.FieldText
              this.arr["name"] = element.FieldValue
              console.log(this.arr);

            })
        ))
  }

  // end call api serviceProvide dropdown

  previousStep($event: MouseEvent) {
    this.router.navigate(['/resellers/reseller-creation/reseller-add'], {
      queryParams: {...this.queryParams}
    })
  }

  nextStep($event: MouseEvent) {
    this.router.navigate(['/resellers/reseller-creation/reseller-kyc'], {
      queryParams: {...this.queryParams}
    })
  }

  OnlyNumbersAllowed(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    return (charCode > 47 && charCode < 58) || charCode == 46;

  }

  OnlyNumbersAllowedWithoutDecimal(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    return (charCode > 47 && charCode < 58);

  }

  OnlySpecialAllowed(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    return (charCode >= 41 && charCode <= 57) && (charCode == 100) && (charCode >= 133 && charCode <= 140) && (charCode >= 173 && charCode <= 176);

  }

  OnlyCharacterNumberAllowed(event: { which: any; keyCode: any; }): boolean {

    const charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode >= 48 && charCode <= 57) || (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122) || (charCode == 32)) {
      // console.log('charCode restricted is' + charCode)
      return true;
    }
    return false;
  }

  OnlyCharacterAllowed(event: { which: any; keyCode: any; }): boolean {

    const charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122) || (charCode == 32)) {
      // console.log('charCode restricted is' + charCode)
      return true;
    }
    return false;
  }


  upperCase($event: Event): void {
    // this.IFSCValue = this.IFSCValue.toUpperCase();
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
