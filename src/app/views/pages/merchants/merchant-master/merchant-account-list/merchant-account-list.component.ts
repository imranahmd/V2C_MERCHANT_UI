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
import { debounceTime, distinctUntilChanged, map, Observable } from "rxjs";
// import { CellCustomComponent } from './cell-custom/cell-custom.component';
import { FormBuilder, FormControl, FormGroup, PatternValidator, Validators } from '@angular/forms';
import { BtnCellRenderer } from 'src/app/common/button-cell-renderer.component';
import { ModalComponent } from 'src/app/common/modal/modal.component';
import { ModalConfig } from 'src/app/common/modal/modal.config';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmPasswordValidator } from "../merchants.validator";
import { environment } from "../../../../../../environments/environment";
import { ApiHttpService } from "../../../../../_services/api-http.service";
import { DatePipe, Location } from "@angular/common";
import { MenusService } from "../../../../../_services/menu.service";
import { AlertService } from "../../../../../_services/alert.service";
import { MerchantService } from "../merchant.service";
import { ProvidersService } from 'src/app/_services/providers.service';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx'


const { API_URL } = environment;

export interface IMerchantData {
  "id": number,
  "merchantId": string,
  "productId": string,
  "accountNumber": string,
  "ifscCode": string,
  "bankName": string,
  "rodate": string,
  "emailId": string,
  "mobileNo": string,
  "account_holder": string
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
  selector: 'app-merchant-account-list',
  templateUrl: './merchant-account-list.component.html',
  styleUrls: ['./merchant-account-list.component.scss']
})
export class MerchantAccountListComponent implements OnInit {

  @Input() merchantId: string;
  @Input() onMerchantChange: EventEmitter<any> = new EventEmitter<any>();
  selectedmerchant: number;
  accountform: FormGroup;
  isForm1Submitted: Boolean;
  currentURL: Boolean = false
  public detailCellRenderer = new DetailCellRenderer;
  modalConfigDelete: ModalConfig;
  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 150,
    filter: true,
    resizable: true
  };
  loading: boolean = false
  public rowData!: IMerchantData[];
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
  isverify: string = 'N';
  isValid: string = 'N';
  isChecked: boolean = true;
  newDate: any = new Date()

  selectedAttributes: any
  arr: any = {}
  public IFSCValue: string = '';
  randomdata: { merchantid: string; };
  public columnDefs: ColDef[] = [
    {field: 'id', tooltipField: 'id', headerName: 'ID', hide: true,filter:true},
    {field: 'merchantId', tooltipField: 'merchantId', headerName: 'Merchant ID',filter:true},
    {field: 'productId', tooltipField: 'productId', headerName: 'Product ID',filter:true},
    {field: 'accountNumber', tooltipField: 'accountNumber', headerName: 'Account Number',filter:true},
    {field: 'ifscCode', tooltipField: 'ifscCode', headerName: 'IFSC Code',filter:true},
    {field: 'account_holder', tooltipField: 'account_holder', headerName: 'Account Holder',filter:true},
    {field: 'bankName', tooltipField: 'bankName', headerName: 'Bank Name',filter:true},
    {field: 'isVerified', tooltipField: 'isVerified', headerName: 'Is Verified',filter:true},
    {
      field: 'rodate', tooltipField: 'rodate', headerName: 'Ro Date',
      filterParams: filterParams, filter: 'agDateColumnFilter',
    },

    {
      field: 'mobileNo', tooltipField: 'mobileNo', headerName: 'Mobile Number',
      filterParams: filterParams,filter:true ,
    },
    {
      field: 'emailId', tooltipField: 'emailId', headerName: 'Email Id',
      filterParams: filterParams,filter:true ,
    },


    {
      field: 'action', headerName: 'Action', resizable: true, cellRenderer: BtnCellRenderer, cellRendererParams: [
        {
          clicked: async (field: any, param: any) => {
            // this.tableInfo = param.data
            // await this.modalDeleteComponent.open();
            this.alertService.confirmBox(this.DeleteAccount(param.data.id), {}, {
              html: "Record has been deleted.!"
            }, () => {
              this.refreshGrid(this.merchantId);
            })

          },
          buttonIconClass: 'icon-trash'
        },
        {
          clicked: async (field: any, param: any) => {
            // console.log((`${field} was clicked`))
            this.editData(param.data);
            // console.log("ad--------------->",this.Merchantdata,  param.data.merchantId)
            // this.merchantConfigEvent.emit(this.Merchantdata);
            // await this.modalMerchantComponent.open()
          },
          buttonIconClass: 'icon-edit-2'
        }

      ]
    },
  ];
  param: IMerchantData;
  highlight: boolean;
  columnDefsCopy: ColDef[] = [...(this.columnDefs.filter((col) => !col?.hide))];
  tableSelectedColumn: ColDef[] = [...(this.columnDefs.filter((col) => !col?.hide))];
  public permissions: any;
  Requestbody: any;
  Ress: any;
  errorMessage: any;
  formData: any;
  IFSCvalue: any;
  validIFSC: any;
  validationIFSC: boolean;
  IFSCcheck: boolean;
  ValidAccount: boolean = true;
  errorOccured: boolean = false;
  IFSCData: any;
  merchantDetails: any;
  IFSCBank: any;
  BankValue: any;
  AccountUserName: any = '';
  @ViewChild('modalDelete') private modalDeleteComponent: ModalComponent
  private gridApi!: GridApi;
  private filterObj: any = {};
  private merchantValue: null;
  private merchantresponse: any;
  private queryParams: any = {};

  constructor(private alertService: AlertService, private datePipe: DatePipe, private providerService: ProvidersService, private merchantService: MerchantService, private menuService: MenusService, private location: Location, private route: ActivatedRoute, private router: Router, private apiHttpService: ApiHttpService, fb: FormBuilder) {
    var URL = this.router.url
    this.loading = false
    if (URL.indexOf("merchant-master") > 0) {
      this.currentURL = true
    } else {
      this.currentURL = false

    }

    this.MerchnatList()
    this.accountform = fb.group({
        merchantId: [this.merchantId || "", Validators.required],
        productId: ["DEFAULT", Validators.required],
        accountNumber: ["", [Validators.required, Validators.maxLength, Validators.minLength]],
        retypeaccountNumber: ["", [Validators.required, Validators.maxLength, Validators.minLength]],
        ifscCode: ["", [Validators.required, new PatternValidator, Validators.pattern]],
        bankName: ["", [Validators.required, Validators.pattern]],
        account_holder: ["", [Validators.required, Validators.maxLength]],
        mobile_number: ["", [Validators.required, Validators.maxLength, Validators.pattern("[123456789][0-9]{9}")]],
        email_address: ["", [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]],
        serviceprovider: ["DECENTRO"],

        rodate: [""],

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
    // var data = {
    //   "serviceprovider": serviceprovider,
    //   "ifscCode": this.IFSCvalue
    // }
    // if (this.IFSCvalue.length == 11 && control.valid) {
    //
    //   this.providerService.IFSCValidate(data).subscribe((res: any) => {
    //     console.log(res)
    //     this.validIFSC = res

    //     if ((this.validIFSC?.status == 'valid') || this.validIFSC?.result.bank) {
    //       this.validationIFSC = true
    //       if (checkcontrol == 'IFSCcheck') {
    //         this.IFSCcheck = true
    //         this.IFSCData = this.validIFSC?.data?.branch||this.validIFSC?.result?.office

    //       }
    //     } else {
    //       this.validationIFSC = false
    //       if (checkcontrol == 'IFSCcheck') {
    //         this.IFSCcheck = false
    //         this.IFSCData = ""
    //       }
    //     }
    //   })
    // } else {
    //   this.validIFSC = false
    //   if (checkcontrol == 'IFSCcheck') {
    //     this.IFSCcheck = false
    //     this.IFSCData = ""
    //   }
    //   return
    // }
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.accountform.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  editData(param: any) {

    if (param.isVerified == 'Y') {
      this.alertService.errorAlert({html: "Editing verified Account is not allowed!"})
      return
    }
    // this.rowData.forEach(element => {
    //   if(element.id == param.id){
    //     this.param = element
    //   }

    // });
    this.param = param

    this.accountform.patchValue({
      // formvalue.merchantId //formvalue.rodate
      "merchantId": this.merchantId || param.merchantId,
      "productId": this.param.productId,
      "accountNumber": this.param.accountNumber,
      "retypeaccountNumber": this.param.accountNumber,
      "ifscCode": this.param.ifscCode,
      "bankName": this.param.bankName,
      "account_holder": this.param.account_holder,
      "mobile_number": this.param.mobileNo,
      "email_address": this.param.emailId
      ,
      "isVerified": this.isverify,
      "rodate": this.datePipe.transform(this.newDate.toString(), "yyyy-MM-dd")
    })
  }

  ngOnInit(): void {
    this.loading = false
    const path = this.location.prepareExternalUrl(this.location.path());
    this.permissions = this.menuService.getPermissions(path);

    if (this.merchantId) {
      this.isDisable = !this.isDisable;
    }
    this.route.queryParams
      .subscribe(params => {
          this.queryParams = params;
          this.merchantId = params?.mid || null;
          this.isDisable = true;
          this.accountform.get('merchantId')?.setValue(this.merchantId);
          this.accountform.get('merchantId')?.disable();
          this.onMerchantChange.emit(this.merchantId);
        }
      );

    this.isForm1Submitted = false;
    // @ts-ignore
    this.onMerchantChange.subscribe((data) => {
      this.merchantId = data;
      <FormControl><unknown>this.accountform.get('merchantId')?.patchValue(data);
      this.refreshGrid(this.merchantId);
    })

    this.BanKName();

    if (!(this.permissions.includes('Add New') || this.permissions.includes('Edit'))) {
      this.accountform.disable()
    }
  }

  DeleteAccount(ID: any) {
    let data = {
      "Pid": ID.id || ID
    }

    return this.apiHttpService
      .post(
        `${API_URL}/delete-merchantbank-byid`, data
      );

  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term: string) => term.length < 2 ? []
        : this.rowData.filter(v => (v.merchantId.toLowerCase().indexOf(term.toLowerCase()) > -1)).map(v => v.merchantId).slice(0, 10))
    );

  async closeModelAction($event: Event) {
    await this.modalDeleteComponent.dismiss();
    this.refreshGrid(this.merchantId);
  }

  refreshGrid(Mid: any) {

    if (this.accountform.controls['merchantId'].value === "") {
      this.merchantValue = null
    } else {
      this.merchantValue = this.accountform.controls['merchantId'].value
    }
    let data = {
      "merchantid": this.merchantId || this.merchantValue || Mid || ""
    }
    this.gridApi.showLoadingOverlay();

    return this.apiHttpService
      .post(
        `${API_URL}/get-merchantbank`, data
      )
      .subscribe((data: any) => (this.rowData = data?.data || data, this.collectionSize = data?.totalCount || data?.length));
  }

  updateSelectedTimeslots(event: any) {
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


  loadDatabyMid() {

    //this.accountform.controls['merchantId'].setValue(mid)
    this.refreshGrid(this.merchantId);
  }

  onGridReady(params: GridReadyEvent<IMerchantData>) {

    // let data = {
    //   "merchantid": this.merchantId || this.accountform.controls['merchantId'].value == "" ? null : this.accountform.controls['merchantId'].value
    // }
    if (this.accountform.controls['merchantId'].value === "") {
      this.merchantValue = null
    } else {
      this.merchantValue = this.accountform.controls['merchantId'].value
    }
    let data = {
      "merchantid": this.merchantId || this.merchantValue
    }
    this.gridApi = params.api;
    this.gridApi.setColumnDefs(this.columnDefs);
    this.gridApi.getFilterInstance('age', (filterParam) => {
    })
    this.gridApi.showLoadingOverlay();

    return this.apiHttpService
      .post(
        `${API_URL}/get-merchantbank?pageSize=${this.pageSize}&page=${(this.currentPage - 1)}`, data
      )
      .subscribe((data: any) => (
        this.rowData = data?.data || data,
          this.collectionSize = data?.totalCount || data?.length)
      );

  }

  onBtnC(e: Event) {
    e.preventDefault();
    // @ts-ignore
    var data = {
      "merchantid": this.merchantId || this.accountform.controls['merchantId'].value == "" ? null : this.accountform.controls['merchantId'].value
    }
    return this.apiHttpService
      .post(
        `${API_URL}/get-merchantbank`, data
      )
      // @ts-ignore
      .subscribe((data) => (this.gridApi.applyTransaction({add: data})));
  }

  // onExportCSV() {
  //   // @ts-ignore
  //   var random3 = Math.floor(Math.random() * 10000000000 + 1);
  //   var today = new Date();
  //       var referenceId = today.getFullYear().toString() + "-" +("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2) + "-" + (("0" + today.getHours())).slice(-2)+"-" +(("0" + today.getMinutes())).slice(-2) +"-" +(("0" + today.getSeconds())).slice(-2)

  //   var fileName = 'Payments_'+ referenceId
  //   var params = {
  //     skipHeader: false,
  //     skipFooters: true,
  //     allColumns: true,
  //     onlySelected: false,
  //     suppressQuotes: true,
  //     fileName: fileName+'.csv',
  //     columnSeparator: ','
  //   };
  //   this.gridApi.exportDataAsCsv(params)
  //   // this.gridApi.exportDataAsExcel();

  // }

  onPaginationChange(param: PaginationChangedEvent | any) {
    this.gridApi.paginationGoToPage(param - 1)
    // let postdata = {
    //   "merchantid": "M0002"
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
    this.SingleRow = param.data
    // await this.modalDeleteComponent.openData(this.SingleRow)

  }

  onRowDoubleClicked(param: RowClickedEvent | any) {
    param.node.setExpanded(!param.node.expanded);
  }

  onFilterChange(param: FilterChangedEvent | any) {
    let Requestbody = {
      "merchantid": this.merchantId || this.accountform.controls['merchantId'].value == "" ? null : this.accountform.controls['merchantId'].value
    }
    // this.rowData.length = 0
    this.gridApi.applyTransaction({remove: this.rowData})
    this.gridApi.showLoadingOverlay();

    const self = this;
    // setTimeout(()=>{
    self.apiHttpService
      .post(
        `${API_URL}/get-merchantbank?pageSize=${this.pageSize}&page=${(this.currentPage - 1)}`, Requestbody
      )
      // @ts-ignore
      .subscribe((data) => (self.gridApi.applyTransaction({
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
    this.filterObj[param?.column?.colId] = temp;
  }

  onFilterOpened(param: FilterOpenedEvent | any) {
    console.log("onFilterOpened----->", param);
  }

  onPageSizeChanges($event: Event) {
    let Requestbody = {
      "merchantid": this.merchantId || this.accountform.controls['merchantId'].value == "" ? null : this.accountform.controls['merchantId'].value
    }

    this.gridApi.paginationSetPageSize(this.pageSize)
    this.gridApi.applyTransaction({remove: this.rowData})
    this.gridApi.showLoadingOverlay();
    this.apiHttpService
      .post(
        `${API_URL}/get-merchantbank?pageSize=` + this.pageSize + '&page=' + (this.currentPage - 1), Requestbody
      )
      .subscribe((data: any) => (this.rowData = data?.data, this.collectionSize = data?.totalCount, this.gridApi.applyTransaction({add: this.rowData})));

  }

  onSubmit(formvalue: any) {
    //
    // if (this.accountform.controls['retypeaccountNumber'].invalid) {
    //   alert("Account number should match with retype account!")
    // }
    setTimeout(() => {
      if (this.accountform.valid) {
        document?.getElementById('bankName')?.classList.remove("hello")
        this.merchantId = this.merchantId || formvalue.merchantId

        var merchantdata = {
          // formvalue.merchantId //formvalue.rodate
          "id": this.param?.id || '',
          "merchantId": this.merchantId || formvalue.merchantId,
          "productId": formvalue.productId,
          "accountNumber": formvalue.accountNumber,
          "ifscCode": formvalue.ifscCode,
          "bankName": formvalue.bankName,
          "account_holder": formvalue.account_holder,
          "mobileNo": formvalue.mobile_number,
          "emailId": formvalue.email_address,
          "isVerified": this.isverify,
          "rodate": this.datePipe.transform(this.newDate.toString(), "yyyy-MM-dd")
        }
        this.loading = true
        document?.getElementById('submitloading')?.classList.add("spinner-border")
        document?.getElementById('submitloading')?.classList.add("spinner-border-sm")
        this.apiHttpService
          .post(
            `${API_URL}/create-merchant-bank?pageSize=` + this.pageSize + '&page=' + (this.currentPage - 1), merchantdata
          )
          .subscribe((data: any) =>
            (
              this.loading = false,
                document?.getElementById('submitloading')?.classList.remove("spinner-border"),
                document?.getElementById('submitloading')?.classList.remove("spinner-border-sm"),
                data[0].status == 'false' ? console.log(JSON.parse(data[0].error).Error) : this.accountform.reset(),
                data[0].status == 'false' ? console.log(JSON.parse(data[0].error).Error) : this.accountform.markAsUntouched(),
                data[0].status == 'false' ? console.log(JSON.parse(data[0].error).Error) : this.accountform.updateValueAndValidity(),
                data[0].status == 'false' ? console.log(JSON.parse(data[0].error).Error) : this.IFSCcheck = false,
                data[0].status == 'false' ? console.log(JSON.parse(data[0].error).Error) : this.isverify = 'N',
                data[0].status == 'false' ? this.alertService.errorAlert({html: JSON.parse(data[0].error).Error}) : this.alertService.successAlert('Inserted Successfully'),
                // data.length> 0 ? alert('Inserted Successfully') : alert("Data not inserted"),

                data.forEach((element: any) => {
                  this.merchantresponse = element.merchantId

                }),
                this.refreshGrid(this.merchantresponse),

                this.accountform.get('merchantId')?.setValue(this.merchantId),
                this.accountform.get('productId')?.setValue('DEFAULT'),
                this.accountform.get('merchantId')?.disable(),
                this.accountform.get('serviceprovider')?.setValue('DECENTRO'),
                this.ValidAccount = true,
                (this.isForm1Submitted = false)

            ));

      }else{
        if(this.accountform.controls['bankName'].invalid||this.accountform.controls['bankName'].invalid){
          document?.getElementById('bankName')?.classList.add("hello")
        }else{
          document?.getElementById('bankName')?.classList.remove("hello")
        }
      }
      // this.reset();
      this.isForm1Submitted = true;
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });

      this.highlight = false;
      // this.accPan.nativeElement.focus();
      document?.getElementById(this.findInvalidControls()[0])?.focus();
      console.log("hhhhhh" + this.findInvalidControls()[0].toString())
      // document.getElementsByClassName('ng-invalid')?.focus();
      setTimeout(() => {
        this.highlight = true;

      }, 1000);
    }, 0);

  }

  /*DECENTRO(data: any) {

    this.isForm1Submitted = true;
    this.formData = data
    setTimeout(() => {
      if (this.accountform.valid) {

        this.loading = true
        document?.getElementById('loading')?.classList.add("spinner-border")
        document?.getElementById('loading')?.classList.add("spinner-border-sm")
        this.providerService.BankValidate(this.formData, this.accountform.controls['serviceprovider'].value)
          .subscribe({
            next: data => {
              (
                // data == undefined ? this.alertService.errorAlert({ html: `Error in verifying account details` }) : console.log(data?.message),
                // data == undefined ? this.isverify = 'N' : console.log(data?.message),
                // data == undefined ? this.errorOccured = true  : this.errorOccured = false,
                this.Ress = data,
                  this.loading = false,
                  document?.getElementById('loading')?.classList.remove("spinner-border"),
                  document?.getElementById('loading')?.classList.remove("spinner-border-sm"),
                  (this.Ress?.accountStatus === 'valid' || this.Ress?.result?.bankTxnStatus === true) ? this.alertService.successAlert(data?.message || data?.result?.bankResponse) : this.isverify = 'N',
                  (this.Ress?.accountStatus === 'valid' || this.Ress?.result?.bankTxnStatus === true) ? this.AccountUserName = this.Ress?.beneficiaryName : this.isverify = 'N',
                  (this.Ress?.accountStatus === 'valid' || this.Ress?.result?.bankTxnStatus === true) ? this.AccountUserName = this.Ress?.result?.accountName : this.isverify = 'N',
                  (this.Ress?.accountStatus === 'valid' || this.Ress?.result?.bankTxnStatus === true) ? this.isverify = 'Y' : this.alertService.errorAlert({html: data?.message || `Error in verifying bank account details`}),
                  (this.Ress?.accountStatus === 'valid' || this.Ress?.result?.bankTxnStatus === true) ? this.ValidAccount = false : this.ValidAccount = false,
                  // (this.Ress?.accountStatus === 'valid' || this.Ress?.result?.bankTxnStatus === true) ? this.errorOccured=true:console.log(data?.message)

                  (this.Ress?.accountStatus === 'invalid' || this.Ress?.result?.bankTxnStatus === false) ? this.ValidAccount = true : console.log(data?.message)
                // (this.Ress?.accountStatus === 'invalid' || this.Ress?.result?.bankTxnStatus === false) ? this.isverify = 'N' : this.errorOccured = false
                // (this.Ress?.accountStatus == 'valid' || this.Ress?.result.bankTxnStatus == true) ? this.ValidAccount = true  : this.ValidAccount = false

              )
            },
            error: err => {
              this.alertService.errorAlert({
                title: 'Something went wrong!',
              })
              this.errorMessage = err.error?.message;

            }

          });


        // this.merchantService.checkAccountExists({
        //   productId: data.productId,
        //   accountNumber: data.accountNumber,
        // }).subscribe((accStatusData) => {
        //   console.log(accStatusData, "------------->");
        //   if (accStatusData.Status == "false") {
        //     this.alertService.errorAlert({
        //       html: accStatusData?.Message || "Some error occurred please check after some time"
        //     })
        //     return;
        //   } else if (accStatusData?.Status == "true") {

        //   } else {
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
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });

      this.highlight = false;
      // this.accPan.nativeElement.focus();
      document?.getElementById(this.findInvalidControls()[0])?.focus();
      console.log("hhhhhh" + this.findInvalidControls()[0].toString())
      // document.getElementsByClassName('ng-invalid')?.focus();
      setTimeout(() => {
        this.highlight = true;

      }, 1000);
    }, 0);


  }*/


  reset() {
    this.accountform.reset(); // Reset form data
  }

  //get merchant By Name
  MerchnatList() {


    var merchantdata = {
      "name": ""
    }
    this.apiHttpService
      .post(
        `${API_URL}/GetMerchant/`, merchantdata
      )
      .subscribe((res: any) =>
        (this.Resdata = res));


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
    this.router.navigate(['/merchants/merchant-creation/merchant-add'], {
      queryParams: {...this.queryParams}
    })
  }

  nextStep($event: MouseEvent) {
    this.router.navigate(['/merchants/merchant-creation/merchant-kyc'], {
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

  fun(id:any){
    document?.getElementById(id)?.classList.add("hey")
  }
  funover(id:any){
    document?.getElementById(id)?.classList.remove("hey")
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
  onExportCSV() {
    // @ts-ignore
    const random3 = Math.floor(Math.random() * 10000000000 + 1);
    const today = new Date();
    const referenceId = today.getFullYear().toString() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2) + "-" + (("0" + today.getHours())).slice(-2) + "-" + (("0" + today.getMinutes())).slice(-2) + "-" + (("0" + today.getSeconds())).slice(-2)
    let data = {
      "merchantid": this.merchantId || this.merchantValue
    }
    const fileName = 'Payments_' + referenceId
    this.apiHttpService
    .post(
      `${API_URL}/get-merchantbank?pageSize=${this.pageSize}&page=${(this.currentPage - 1)}`, data
    )
    .subscribe((data: any) => {
      this.rowData = data?.data || data;
      const expData: any[] = [];
      (data?.data || data?.merchants || data || []).forEach((curr: any) => {
        const tempRec: any = {}
        this.tableSelectedColumn.forEach((col) => {
          if(!(col?.field=="id"||col?.field=="action"))

          {
          if (col?.field) tempRec[col?.field] = curr[col?.field]

        }})

        expData.push(tempRec);
      })

      // this.JSONToCSVConvertor(data?.data || data?.merchants || data || [],fileName, "Report");
      this.exportAsExcelFile(expData, fileName);
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
   exportAsExcelFile(json: any[], excelFileName: string): void {
    const tempRec: any = []

    var index=0;
    this.tableSelectedColumn.forEach((col) => {
      if(!( col?.field=="id"||col?.field=="action"))



      {


       tempRec[index] = col
       index++;

    }})


    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet([], {

      // @ts-ignore
      header: [...tempRec.map((col) => col.headerName)]
    });
    // const workbook: XLSX.WorkBook = {Sheets: {'data': worksheet}, SheetNames: ['data']};
    const wb = XLSX.utils.book_new();
    XLSX.utils.sheet_add_aoa(worksheet, [[...tempRec.map((col:any) => col.headerName)]]);
    XLSX.utils.sheet_add_json(worksheet, json, { origin: 'A2', skipHeader: true });
    XLSX.utils.book_append_sheet(wb, worksheet, 'Sheet1');
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }
   saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + new Date().getTime() + EXCEL_EXTENSION);
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
