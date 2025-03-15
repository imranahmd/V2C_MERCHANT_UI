import { AfterViewInit, Component, EventEmitter, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ColDef, GridApi, PaginationChangedEvent, ValueFormatterParams, } from 'ag-grid-community';
import { debounceTime, distinctUntilChanged, map, Observable } from "rxjs";
// import { CellCustomComponent } from './cell-custom/cell-custom.component';
import { FormArray, FormBuilder, FormControl, FormGroup, RequiredValidator, Validators } from '@angular/forms';
import { ModalComponent } from 'src/app/common/modal/modal.component';
import { ModalConfig } from 'src/app/common/modal/modal.config';
import { ActivatedRoute, Router } from '@angular/router';
// import { ConfirmPasswordValidator } from "../merchants.validator";
import { environment } from "../../../../environments/environment";
import { ApiHttpService } from "../../../_services/api-http.service";
import { DatePipe, formatNumber, Location } from "@angular/common";
import { MenusService } from "../../../_services/menu.service";
import { AlertService } from "../../../_services/alert.service";
import { RefundManagementService } from "./refund-management.service";
import { ProvidersService } from 'src/app/_services/providers.service';
import { ReusableGridComponent } from './reusable-grid/reusable-grid.component';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { ExcelExportParams } from "ag-grid-community/dist/lib/interfaces/iExcelCreator";
import * as moment from "moment";
import { moreThanOneWhiteSpaceValidator } from 'src/app/common/common.validators';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx'

const { API_URL, defaultPageSizeArr, defaultPageSize } = environment;

export interface IMerchantData {
  "id": number,
  "merchantId": string,
  "merchanTransactionId": string,
  "searchFromDate": string,
  "ifscCode": string,
  "bankName": string,
  "rodate": string,
  "emailId": string,
  "mobileNo": string,
  "account_holder": string
}


@Component({
  selector: 'app-refund-management',
  templateUrl: './refund-management.component.html',
  styleUrls: ['./refund-management.component.scss']
})
export class RefundManagementComponent implements OnInit, AfterViewInit {

  public searchFromDate: string = '';
  public searchToDate: string = '';
  @ViewChild('authorList', { static: true }) authorList: TemplateRef<any>;
  @ViewChild('amountEle', { static: true }) amountEle: TemplateRef<any>;

  public refundListFormGroup: FormGroup;
  formcontrols: any;
  @Input() merchantId: any;
  @Input() onMerchantChange: EventEmitter<any> = new EventEmitter<any>();
  selectedmerchant: number;
  refundListFilterGroup: FormGroup;
  isForm1Submitted: Boolean = false;
  currentURL: Boolean = false
  modalConfigDelete: ModalConfig;
  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 150,
    filter: true,
    resizable: true
  };
  public rowData!: any[];
  tablecolumn: any;
  currentPage: number = 1;
  pageSize: number = defaultPageSize || 10;

  pageSizeArr: any = defaultPageSizeArr;
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
  public columnDefs: ColDef[] = []
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
  param: IMerchantData;
  highlight: boolean;
  refundData: any = false;
  refundRaiseLog: any = {};
  excelData: any;
  @ViewChild('modalDelete') private modalDeleteComponent: ModalComponent
  private gridApi!: GridApi;
  private filterObj: any = {};
  private merchantValue: null;
  private merchantresponse: any;
  private queryParams: any = {};
  currDate: any = new Date();
  tooltips: any = 'Amount is Required';
  loading: boolean = false;
  ;
  pastDate: any = new Date("2000-01-01");
  constructor(
    private alertService: AlertService,
    private datePipe: DatePipe,
    private providerService: ProvidersService,
    private merchantService: RefundManagementService,
    private menuService: MenusService,
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private apiHttpService: ApiHttpService,
    fb: FormBuilder) {
    var URL = this.router.url
    this.refundData = false
    if (URL.indexOf("merchant-master") > 0) {
      this.currentURL = true
    } else {
      this.currentURL = false

    }

    this.MerchnatList()
    // Validators.required
    this.refundListFilterGroup = fb.group({
      // merchantId: [this.merchantId || "",],
      merchantId: [],
      merchanTransactionId: ["", [Validators.maxLength(40), moreThanOneWhiteSpaceValidator()]],
      searchFromDate: ["", [Validators.required]],
      searchToDate: ["", [Validators.required]],
      payid: ["", [Validators.maxLength(40)]],
      bankId: ["", [Validators.maxLength(40)]],
      spId: [null, []],
      custMail: ["", [Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]],
      custMobile: ["", [Validators.pattern("[123456789][0-9]{9}"), Validators.maxLength(10)]],
    }
    );


  }

  get refundListFilter() {
    return this.refundListFilterGroup as FormGroup;
  }

  get refundListForm() {
    debugger
    return this.refundListFormGroup.get('allTransactions') as FormArray
  }

  payIdFormatter(params: ValueFormatterParams) {
    // @ts-ignore
    return params.value + 'n';
  }

  ngAfterViewInit(): void {

  }

  loadData() {

    let data: any = [];

    this.rowData.forEach((item) => {
      data.push(
        new FormGroup({
          MerchantId: new FormControl(item.MerchantId),
          Transaction_Id: new FormControl(item.TxnId),
          TransactionAmount: new FormControl(item.TransactionAmount || 0),
          Amount: new FormControl(),
          Select: new FormControl(false),
        })
      );
    });
    return data;
  }

  loadBooks(bookList: any) {

    let data: any = [];
    bookList.forEach((book: any) => {
      data.push(
        new FormGroup({
          bookName: new FormControl(''),
          bookPrice: new FormControl(book.price),
        })
      );
    });
    return data;
  }


  toggleRadio(bookTypeIndex: any, authorIndex?: any) {
    //
    const currentControl = (this.refundListFormGroup?.get('allTransactions') as FormArray).controls[bookTypeIndex];

    console.log("--------->", currentControl);
    // currentControl.get('Amount')?.disable();
    const TransactionAmount = currentControl.get('TransactionAmount')?.value;
    if (currentControl.get('Select')?.value) {
      this.refundRaiseLog[bookTypeIndex] = true
      currentControl.get('Amount')?.enable();
      currentControl.get('Amount')?.setValidators([Validators.required, Validators.min(1), Validators.max(TransactionAmount), Validators.maxLength(TransactionAmount.length)]);
    } else {
      delete this.refundRaiseLog[bookTypeIndex]
      currentControl.get('Amount')?.setValue(null);
      currentControl.get('Amount')?.disable();
      currentControl.get('Amount')?.setValidators([]);
    }
    currentControl.get('Amount')?.updateValueAndValidity();
  }

  canShow(bookTypeIndex: any, bookDetail: any) {
    let canShow = false;
    let selectedAuthor: any = {};
    this.formcontrols = this.refundListFormGroup?.get('allTransactions');
    let allBookDetails = this.formcontrols?.controls; //both book types
    allBookDetails.forEach((formGroup: any, formGroupIndex: any) => {
      if (formGroupIndex === bookTypeIndex) {
        selectedAuthor = formGroup
          .get('authorsList')
          .value.find((item: any) => item.isSelected);
      }
    });
    if (selectedAuthor) {
      //checking if 2 arrays are equal or not
      canShow =
        Array.isArray(selectedAuthor.bookList) &&
        Array.isArray(bookDetail.value) &&
        selectedAuthor.bookList.length === bookDetail.value.length &&
        selectedAuthor.bookList.every(
          (val: any, index: any) => val === bookDetail.value[index]
        );
    }
    return canShow;
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.refundListFilterGroup.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  ngOnInit(): void {

    //this.reset() 
    this.merchantId = localStorage.getItem("user")

    this.refundListFilterGroup.controls['merchantId'].setValue(this.merchantId)
    this.refundListFilterGroup.controls['merchantId'].disable()

    // books.books.forEach((data) => {
    //   data.authors.forEach((author: any) => {
    //     author.isSelected = false;
    //   });
    // });

    // this.rowData = books.books
    console.log(this.rowData)

    const path = this.location.prepareExternalUrl(this.location.path());
    this.permissions = this.menuService.getPermissions(path);

    // if (this.merchantId) {
    //   this.isDisable = !this.isDisable;
    // }
    this.route.queryParams
      .subscribe(params => {
        this.queryParams = params;
        this.merchantId = params?.mid || null;
        this.isDisable = true;
        // this.refundListFilterGroup.get('merchantId')?.setValue(this.merchantId);
        // this.refundListFilterGroup.get('merchantId')?.disable();
        this.onMerchantChange.emit(this.merchantId);
      }
      );

    this.isForm1Submitted = false;
    // @ts-ignore
    // this.onMerchantChange.subscribe((data) => {
    //   this.merchantId = data;
    //   <FormControl><unknown>this.refundListFilterGroup.get('merchantId')?.patchValue(data);
    //   this.refreshGrid(this.merchantId);
    // })

    // if (!(this.permissions.includes('Add New') || this.permissions.includes('Edit'))) {
    //   this.refundListFilterGroup.disable()
    // }


    // this.rowData = books.books;


    this.columnDefs = [
      // { field: 'Transaction_Id', tooltipField: 'Transaction_Id', headerName: 'Transaction_Id', hide: true },
      {
        headerName: 'Select',
        cellRendererFramework: ReusableGridComponent,
        cellRendererParams: {
          ngTemplate: this.authorList,
        },
      },
      {
        headerName: 'Amount',
        cellRendererFramework: ReusableGridComponent,
        cellRendererParams: {
          ngTemplate: this.authorList,
        },
      },
      { field: 'TransactionId', tooltipField: 'Transaction ID', headerName: 'Agg Transaction ID' },
      { field: 'TxnId', tooltipField: 'Txn ID', headerName: 'Merchant Transaction ID' },
      { field: 'TransactionAmount', tooltipField: 'Transaction Amount', headerName: 'Transaction Amount' },
      { field: 'ReconStatus', tooltipField: 'Recon Status', headerName: 'Recon Status' },
      { field: 'BalanceAmount', tooltipField: 'Balance Amount', headerName: 'Balance Amount' },
      { field: 'MerchantId', tooltipField: 'Merchant ID', headerName: 'Auth ID' },
      { field: 'TransactionDate', tooltipField: 'Date Time', headerName: 'Date Time' },
      { field: 'ServiceRRN', tooltipField: 'Service RRN', headerName: 'Service RRN' },
      { field: 'BankId', tooltipField: 'Bank ID', headerName: 'Bank ID' },
      { field: 'ProcessId', tooltipField: 'Process ID', headerName: 'Process ID' },
      { field: 'EmailId', tooltipField: 'EmailId', headerName: 'Email Id' },
      { field: 'MobileNo', tooltipField: 'MobileNo', headerName: 'Mobile Number' },

    ];

    this.columnDefsCopy = [...(this.columnDefs.filter((col) => !col?.hide))];
    this.tableSelectedColumn = [...(this.columnDefs.filter((col) => !col?.hide))];
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
    // this.refreshGrid(this.merchantId);
  }

  refreshGrid(formvalue: any) {
    debugger

    let data = {
      "merchantId": this.merchantId || formvalue.merchantId || '',
      "merchanTransactionId": formvalue.merchanTransactionId || '',
      "searchFromDate": formvalue.searchFromDate || '',
      "Paymentsid": formvalue.payid || '',
      "fromDate": formvalue.searchFromDate || '',
      "toDate": formvalue.searchToDate || '',
      "bankId": formvalue.bankId || '',
      "custMail": formvalue.custMail || '',
      "custMobile": formvalue.custMobile || '',
      "spId": formvalue?.spId?.toString()||''


    }

    this.apiHttpService
      .post(
        `${API_URL}/GetRaiseRefundTranssaction-List?pageSize=${this.pageSize}&page=${(this.currentPage - 1)}`, data
      )
      .subscribe((data: any) => {
        debugger
        this.rowData = data?.data || data;
        this.collectionSize = data?.totalCount || data?.data?.length || data?.length;
        this.refundListFormGroup = new FormGroup({
          allTransactions: new FormArray(this.loadData()),
        });
        this.formcontrols = this.refundListFormGroup?.get('allTransactions');

        (this.refundListFormGroup.get('allTransactions') as FormArray).controls.forEach((con: any) => {
          con.get('Amount')?.disable();
        })

      })
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

  loadDatabyMid() {
    //this.refundListFilterGroup.controls['merchantId'].setValue(mid)
    // this.refreshGrid(this.merchantId);
  }

  onGridReady(params: any) {
    this.gridApi = params.api;

    let refunddata = {
      "Paymentsid": "",
      "merchanTransactionId": "",
      "fromDate": "",
      "toDate": "",
      "merchantId": "",
      "bankId": "",
      "custMail": "",
      "custMobile": "",
      "spId": ''
    }

    // this.apiHttpService
    //   .post(
    //     `${API_URL}/GetRaiseRefundTranssaction-List?pageSize=${this.pageSize}&page=${(this.currentPage - 1)}`, refunddata
    //   )
    //   .subscribe((data: any) => {
    //
    //     this.rowData = data?.data || data;
    //     // this.rowData.push(books.books);
    //     // console.log(this.rowData)
    //     this.collectionSize = data?.totalCount || data?.data?.length|| data?.length;
    //     this.refundListFormGroup = new FormGroup({
    //       allTransactions: new FormArray(this.loadData()),
    //     });
    //     console.log("Hello")
    //
    //     console.log(this.loadData())
    //     this.formcontrols = this.refundListFormGroup?.get('allTransactions');
    //     // console.log("=------===>", this.refundListFormGroup.get('allTransactions'));
    //
    //     (this.refundListFormGroup.get('allTransactions') as FormArray).controls.forEach((con: any) => {
    //       con.get('Amount')?.disable();
    //     })
    //
    //   })

  }

  dataRendered(params: any) {
    params.api.sizeColumnsToFit();
  }

  reformatString(elements: any) {
    return (elements.replace(/\_/g, " ").charAt(0).toUpperCase() + elements.replace(/\_/g, " ").slice(1)).replace(/([A-Z]+)/g, ' $1').replace(/^ /, '')
  }

  onExportCSV() {
    // @ts-ignore
    var random3 = Math.floor(Math.random() * 10000000000 + 1);
    var today = new Date();
    var referenceId = today.getFullYear().toString() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2) + "_" + (("0" + today.getHours())).slice(-2) + "-" + (("0" + today.getMinutes())).slice(-2) + "-" + (("0" + today.getSeconds())).slice(-2)
    var fileName = 'Refund_Report' + "_" + referenceId
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
    // console.log("------------->", csvSTring);
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

    // console.log("---------->>>>>>", expData)
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

  // onPaginationChange(param: PaginationChangedEvent | any) {
  //   this.gridApi.paginationGoToPage(param - 1)
  // }

  // onPageSizeChanges($event: Event) {
  //   $event.preventDefault();
  //   this.gridApi.paginationSetPageSize(this.pageSize)
  //   this.gridApi.refreshCells()
  // }

  onPaginationChange(param: PaginationChangedEvent | any) {
    this.gridApi.paginationGoToPage(param - 1)
  }

  onPageSizeChanges($event: Event) {
    $event.preventDefault();
    this.gridApi.paginationSetPageSize(this.pageSize)
    this.gridApi.refreshCells()
  }

  onSubmit(formvalue: any) {
    debugger
    //
    // if (this.refundListFilterGroup.controls['retypesearchFromDate'].invalid) {
    //   alert("Account number should match with retype account!")
    // }
    setTimeout(() => {
      if (this.refundListFilterGroup.valid) {

        if ((2000 > new Date(this.refundListFilterGroup.controls["searchFromDate"].value).getFullYear() || new Date(this.refundListFilterGroup.controls["searchFromDate"].value) > this.currDate) || (2000 > new Date(this.refundListFilterGroup.controls["searchToDate"].value).getFullYear() || new Date(this.refundListFilterGroup.controls["searchToDate"].value) > this.currDate)) {
          this.alertService.errorAlert({
            text: "Date out of Range!"
          })



          // this.DynamicValues = false
          return
        }
        if (new Date(this.searchFromDate) > new Date(this.searchToDate)) {
          this.alertService.errorAlert({
            text: "From Date can not be greater than To Date!"
          })
          this.rowData = []
          return
        }


        //  this.merchantId = this.merchantId || formvalue.merchantId
        // this.merchantId = formvalue.merchantId
        this.merchantId = localStorage.getItem("user")


        var merchantdata = {
          "merchantId": localStorage.getItem("user") || '',
          "merchanTransactionId": formvalue.merchanTransactionId || '',
          "searchFromDate": formvalue.searchFromDate || '',
          "Paymentsid": formvalue.payid || '',
          "fromDate": formvalue.searchFromDate || '',
          "toDate": formvalue.searchToDate || '',
          "bankId": formvalue.bankId || '',
          "custMail": formvalue.custMail || '',
          "custMobile": formvalue.custMobile || '',
          "spId": formvalue?.spId?.toString()||''

        }
        this.loading = true
        document?.getElementById('loading')?.classList.add("spinner-border")
        document?.getElementById('loading')?.classList.add("spinner-border-sm")
        this.apiHttpService
          .post(
            `${API_URL}/GetRaiseRefundTranssaction-List?pageSize=` + this.pageSize + '&page=' + (this.currentPage - 1), merchantdata
          )
          .subscribe((data: any) => {
            this.loading = false
            document?.getElementById('loading')?.classList.remove("spinner-border")
            document?.getElementById('loading')?.classList.remove("spinner-border-sm")
            if (data.Status == "Error") {
              this.alertService.errorAlert({
                text: data.Message
              })
              this.refundData = false
              return
            }
            this.excelData = data
            this.rowData = data
            this.refundData = this.rowData
            this.collectionSize = data?.data?.totalCount || data?.data?.length || data?.length;
            // data?.status == 'false' ? console.log(JSON.parse(data[0].error).Error) : this.refundListFilterGroup.reset();

            this.refundListFilterGroup.get('merchantId')?.setValue(this.merchantId);
            this.ValidAccount = true;
            (this.isForm1Submitted = false)

            this.rowData = data?.data || data;
            console.log("---->", this.rowData)
            this.collectionSize = data?.totalCount || data?.data?.length || data?.length;
            this.refundListFormGroup = new FormGroup({
              allTransactions: new FormArray(this.loadData()),
            });
            this.formcontrols = this.refundListFormGroup?.get('allTransactions');

            // console.log("*************---->",this.formcontrols);

            (this.refundListFormGroup.get('allTransactions') as FormArray).controls.forEach((con: any) => {
              con.get('Amount')?.disable();
            })
          });

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
      // console.log("hhhhhh" + this.findInvalidControls()[0].toString())
      // document.getElementsByClassName('ng-invalid')?.focus();
      setTimeout(() => {
        this.highlight = true;

      }, 1000);
    }, 0);

  }

  reset() {
    this.refundListFilterGroup.reset(); // Reset form data
    this.merchantId = localStorage.getItem("user")

    this.refundListFilterGroup.controls['merchantId'].setValue(this.merchantId)
    this.refundListFilterGroup.controls['merchantId'].disable()
    this.refundListFilterGroup.controls.searchFromDate.setValue('');
    this.refundListFilterGroup.controls.searchToDate.setValue('');
    // this.refundListFilterGroup.controls.searchFromDate.clearValidators();
    // this.refundListFilterGroup.controls.searchFromDate.updateValueAndValidity()
    // this.refundListFilterGroup.controls.searchToDate.clearValidators();
    //   this.refundListFilterGroup.controls.searchToDate.updateValueAndValidity()
    this.refundData = false
    this.isForm1Submitted = false


  }

  //get merchant By Name
  MerchnatList() {
    const merchantdata = {
      "name": ""
    };
    this.apiHttpService
      .post(
        `${API_URL}/GetMerchant/`, merchantdata
      )
      .subscribe((res: any) => (this.Resdata = res));
  }

  OnlyNumbersAllowed(event: any): boolean {
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

  updateRefund() {
    debugger

    if (this.refundListFormGroup.valid) {
      const data = this.refundListFormGroup.get('allTransactions')?.value?.filter((ref: any) => ref.Select).map((ref: any) => {
        return {
          "TransId": ref.Transaction_Id.toString(),
          "RefundAmt": ref.Amount,
          "Merchant_Id": ref.MerchantId
        }
      })
      if (data.length <= 0) {
        this.alertService.errorAlert({
          text: "Select atleast one checkbox"
        })



        // this.DynamicValues = false
        //this.loading=false
        return
      }
      console.log("===>", data)
      this.loading = true
      document?.getElementById('loading')?.classList.add("spinner-border")
      document?.getElementById('loading')?.classList.add("spinner-border-sm")
      this.merchantService.raiseRefundService(data).subscribe((res) => {
        this.loading = false
        document?.getElementById('loading')?.classList.remove("spinner-border")
        document?.getElementById('loading')?.classList.remove("spinner-border-sm")
        if (res) {
          this.alertService
            .simpleAlerts(
              'Raised Refund request status',
              this.formattedResponse(res.data || res), 'info'
            ).then((d) => {
              this.refreshGrid(this.refundListFilter.value)
            });
        } else {
          this.alertService.errorAlert({
            html: ''
          })
        }
      })


    }
  }

  formattedResponse(data: any) {
    let html = '<div class="table-responsive">\n' +
      '    <table class="table table-hover">\n' +
      '        <thead>\n' +
      '        <tr>\n' +
      '            <th>#</th>\n' +
      '            <th>Merchant Id</th>\n' +
      '            <th>Transaction ID</th>\n' +
      '            <th>Response</th>\n' +
      '        </tr>\n' +
      '        </thead>\n' +
      '        <tbody>\n';
    data.forEach((d: any, i: number) => {
      html += `<tr>
<th>${i + 1}</th>
<th>${d.MerchantId}</th>
<td>${d.Id}</td>
<td>${d.respMessage}</td>
</tr>`;
    });

    html += '</tbody>\n' +
      '    </table>\n' +
      '</div>';
    return html;
  }

  isRaiseRefBtnDisable() {
    return Object.keys(this.refundRaiseLog).length > 0 && this.refundListFormGroup.valid;
  }

  // convert csv to json
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

  searchFromDateChange() {
    console.log(this.searchFromDate)
    console.log(moment(this.searchFromDate, 'YYYY-MM-DD').toString())
    // this.refundListFilterGroup.controls.searchToDate.setValidators([Validators.required]);
    //   this.refundListFilterGroup.controls.searchToDate.updateValueAndValidity()
  }
  getToday(): string {
    return new Date().toISOString().split('T')[0]
  }

  // changeEndDate()
  // {debugger
  //   this.refundListFilterGroup.controls.searchFromDate.setValidators([Validators.required]);
  //   this.refundListFilterGroup.controls.searchFromDate.updateValueAndValidity()

  // }

  placeHolder(event: any, error: any, amount: any) {
    debugger

    if (error?.min) {
      this.tooltips = 'Can put minimum amount of 1 only'
      // document.getElementById('ngb-tooltip-0')?.setAttribute('display','block')
      // this.tooltip.open();
    }
    else if (error?.max) {
      this.tooltips = 'Can put maximum amount of ' + amount + ' only'
      // this.tooltip.open();
    }
    else if (error?.required) {
      this.tooltips = 'Amount is Required'
      // this.tooltip.open();
    }
    else {
      this.tooltips = ''
    }
    // if(error){
    //   this.tooltip.open();
    // }


  }

  // searchEndDateChange()
  // {
  //   this.refundListFilterGroup.controls.searchFromDate.setValidators([Validators.required]);
  //   this.refundListFilterGroup.controls.searchFromDate.updateValueAndValidity()
  // }
}
