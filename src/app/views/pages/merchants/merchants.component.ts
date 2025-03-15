import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbAccordion} from '@ng-bootstrap/ng-bootstrap';
import {debounceTime, distinctUntilChanged, map, Observable} from "rxjs";
import {DatePipe, Location} from '@angular/common';

import {
  ColDef,
  FilterChangedEvent,
  FilterModifiedEvent,
  FilterOpenedEvent,
  GridApi,
  GridReadyEvent,
  PaginationChangedEvent,
  RowClickedEvent,
} from 'ag-grid-community';
import {BtnCellRenderer} from 'src/app/common/button-cell-renderer.component';
import {environment} from "../../../../environments/environment";
import {ActivatedRoute, Router} from "@angular/router";
import {ApiHttpService} from "../../../_services/api-http.service";
import {MenusService} from "../../../_services/menu.service";
import {AlertService} from "../../../_services/alert.service";
//import { PercentageDirective } from '../../percentage.directive';

const {API_URL} = environment;

@Component({
  selector: 'app-merchants',
  templateUrl: './merchants.component.html',
  styleUrls: ['./merchants.component.scss']
})
export class MerchantsComponent implements OnInit {

  merchantMDRform: FormGroup;
  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 170,
    filter: true,
  };
  public rowData!: any[];
  // Allow key codes for special events. Reflect :
  tablecolumn: any;
  currentPage: number = 1;
  pageSize: number = 10;
  globalSearch: string = '';
  collectionSize: number = 0;
  SingleRow: any;
  tableInfo: any;
  selectedMerchantID: any;
  isForm1Submitted: Boolean;
  public permissions: any = '';
  public columnDefs: ColDef[] = [
    // { field: 'id', headerName: 'ID', hide: true },
    // { field: 'sp_id', headerName: 'Service Provider', filter: 'agNumberColumnFilter' },
    {field: 'sp_name', headerName: 'Service Provider'},
    {field: 'instrument_id', headerName: 'Instrument', filter: 'agNumberColumnFilter'},
    {field: 'bankName', headerName: 'Bank Name'},
    {field: 'indstrument_brand', headerName: 'Instrument Brand'},
    {field: 'status', headerName: 'Status', filter: 'agNumberColumnFilter'},
    {field: 'remark', headerName: 'Remark'}
    // {
    //   field: 'Action', resizable: true, cellRenderer: BtnCellRenderer, cellRendererParams: [
    //     {
    //       clicked: async (field: any, param: any) => {
    //         this.tableInfo = param.data
    //         this.delete(this.tableInfo)
    //       },
    //       buttonIconClass: 'icon-trash',
    //       buttonDisable: (this.permissions.includes('Add New') || this.permissions.includes('Edit'))
    //     },
    //
    //     {
    //       clicked: async (field: any, param: any) => {
    //         this.tableInfo = param.data
    //         this.Edit(this.tableInfo)
    //       },
    //       buttonIconClass: 'icon-edit-2'
    //     }
    //   ]
    // }
  ];
  tableSelectedColumn: ColDef[] = [...this.columnDefs];
  Resdata: any;
  Resdatas: any;
  code: any;
  bankdata: any;
  Resbank: any;
  merchantId: string;
  bodydata: any;
  randomdata: any;
  Resultdata: any;
  merchantValue: null;
  e: { target: { value: any; }; };
  x: { target: { value: any; }; };
  spID: any;
  bankID: any;
  bankselect: boolean = false;
  Instrumentselect: boolean = false;
  ResinstrumentBrand: any;
  activeIds: string[];
  closeOthers: boolean = true;
  queryParams: any = {};
  toggleDirective = false;
  currentDate: any = new Date();
  private regex: RegExp = new RegExp(/^\d{0,2}\.?\d{0,2}$/g);
  // Backspace, tab, end, home
  private specialKeys: Array<string> = [
    "Backspace",
    "Tab",
    "End",
    "Home",
    "-",
    "ArrowLeft",
    "ArrowRight",
    "Del",
    "Delete"
  ];
  @ViewChild('acc') private acc: NgbAccordion;
  private gridApi!: GridApi;
  private filterObj: any = {};

  // randomdata: { merchantid: string; };

  constructor(private menuService: MenusService, private el: ElementRef, private alertService: AlertService, private location: Location, private route: ActivatedRoute, private formbuilder: FormBuilder, private datePipe: DatePipe, private apiHttpService: ApiHttpService, private router: Router) {
    this.bankselect = false
    this.Instrumentselect = false
    this.merchantMDRform = formbuilder.group({
      merchantId: ["", Validators.required],
      status: ["", Validators.required],
      remark: ["", Validators.required],
      spId: ["", Validators.required],
      instrument_id: ["", Validators.required],
      bank_id: ["", Validators.required],
      instrumentBrand: ["", Validators.required]
    });
  }

  get form1() {
    return this.merchantMDRform.controls;
  }

  changeDate(value: any) {
    this.currentDate = value
  }

  changeEndDate(value: any) {
    this.currentDate = value
  }

  ngOnInit(): void {
    const path = this.location.prepareExternalUrl(this.location.path());
    this.permissions = this.menuService.getPermissions(path);
    this.route.queryParams
      .subscribe(params => {
          this.queryParams = params;
          this.merchantId = params?.mid// { orderby: "price" }
          if (this.merchantId) {
            this.merchantMDRform.get('merchantId')?.patchValue(this.merchantId);
            this.merchantMDRform.get('merchantId')?.disable();
          }
        }
      );
    // simple array
    this.isForm1Submitted = false;
    this.MerchnatList();

    // @ts-ignore
    //  this.onMerchantChange.subscribe((data) => (console.log("data=========>", data, this.merchantId), this.merchantId = data, <FormControl>this.accountform.get('merchantId').setValue(data), this.refreshGrid()))
    this.ServiceProvide()
    this.selectinstrumentBrand();


    var e = {
      "target": {'value': ""}
    }
    var x = {
      "target": {'value': ""}
    }
    this.seletservice(e)
    this.selectinstrument(x)
    this.bankselect = false
    this.Instrumentselect = false
    this.activeIds = [];

    if (!(this.permissions.includes('Add New') || this.permissions.includes('Edit'))) {

      this.merchantMDRform.disable({
        onlySelf: true,
        emitEvent: true
      })
      this.columnDefs.push({
        field: 'Action', resizable: true, cellRenderer: BtnCellRenderer, cellRendererParams: [
          {
            clicked: async (field: any, param: any) => {
              this.tableInfo = param.data
              this.Edit(this.tableInfo)
            },
            buttonIconClass: 'icon-eye'
          }
        ]
      })
    } else {
      this.columnDefs.push({
        field: 'Action', resizable: true, cellRenderer: BtnCellRenderer, cellRendererParams: [
          {
            clicked: async (field: any, param: any) => {
              this.tableInfo = param.data
              this.delete(this.tableInfo)
              this.alertService.confirmBox(this.delete(this.tableInfo), {}, {
                html: "Record has been deleted.!"
              }, () => {
                this.refreshGrid(this.merchantId);
              })
              // this.alertService.confirmBox(this.delete(param.data.id))
              // this.alertService.confirmBox(this.delete(param.data.id), {}, {
              //   html: "Record has been deleted.!"
              // }, () => {
              //   this.refreshGrid(this.merchantId);
              // })
            },
            buttonIconClass: 'icon-trash',
            buttonDisable: (this.permissions.includes('Add New') || this.permissions.includes('Edit'))
          },

          {
            clicked: async (field: any, param: any) => {
              this.tableInfo = param.data
              this.Edit(this.tableInfo)
            },
            buttonIconClass: 'icon-edit-2'
          }
        ]
      })
    }
  }

  instrumentselection() {
    if (this.bankselect == false) {
      return
    }

  }

  // mdrtype(){
  //   document.getElementById('percent')?.removeAttribute('appPercentageDirective')
  // }
  bankselection() {
    //
    if (this.Instrumentselect == false) {
      return
    }
  }

  // checkMinMax(formCtr1, formCtr2){
  //
  // }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term: string) => term.length < 2 ? []
        : this.rowData.filter(v => (v.merchantId.toLowerCase().indexOf(term.toLowerCase()) > -1)).map(v => v.merchantId).slice(0, 10))
    );

  async closeModelAction($event: Event) {
    // await this.modalDeleteComponent.dismiss();
    // this.refreshGrid();
  }

  loadDatabyMid() {

    //this.accountform.controls['merchantId'].setValue(mid)
    this.refreshGrid(this.merchantId);
    this.bankselect = false
    this.Instrumentselect = false
  }

  onGridReady(params: GridReadyEvent<any>) {
    if (this.merchantMDRform.controls['merchantId'].value === "") {
      this.merchantValue = null
    } else {
      this.merchantValue = this.merchantMDRform.controls['merchantId'].value
    }
    let data = {
      "merchantId": this.merchantId || this.merchantValue
    }

    this.gridApi = params.api;
    this.gridApi.setColumnDefs(this.columnDefs);
    this.gridApi.getFilterInstance('age', (filterParam) => {
    })
    this.gridApi.showLoadingOverlay();

    return this.apiHttpService
      .post(
        `${API_URL}/get-merchantmdrlist?pageSize=${this.pageSize}&page=${(this.currentPage - 1)}`, data
      )
      .subscribe((data) => (this.rowData = data?.data || Array.isArray(data) ? data : [], this.collectionSize = data?.totalCount || data?.length));

  }

  onBtnC(e: Event) {
    e.preventDefault();
    // @ts-ignore
    if (this.merchantMDRform.controls['merchantId'].value === "") {
      this.merchantValue = null
    } else {
      this.merchantValue = this.merchantMDRform.controls['merchantId'].value
    }
    let data = {
      "merchantId": this.merchantId || this.merchantValue
      // "merchantid": this.merchantId || "M0003"
    }
    return this.apiHttpService
      .post(
        `${API_URL}/get-merchantmdrlist`, data
      )
      // @ts-ignore
      .subscribe((data) => {
        this.rowData = data?.data || Array.isArray(data) ? data : [];
        this.collectionSize = data?.totalCount || data?.length
        this.gridApi.applyTransaction({add: this.rowData});
        // this.collectionSize = data?.totalCount || data?.length

      });
  }

  onExportCSV() {
    // @ts-ignore
    var random3 = Math.floor(Math.random() * 10000000000 + 1);
    var today = new Date();
    var referenceId = today.getFullYear().toString() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2) + "_" + (("0" + today.getHours())).slice(-2) + "-" + (("0" + today.getMinutes())).slice(-2) + "-" + (("0" + today.getSeconds())).slice(-2)
    var fileName = 'Payments_' + referenceId
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
  }

  onPaginationChange(param: PaginationChangedEvent | any) {
    this.gridApi.paginationGoToPage(param - 1)
  }

  async onRowClicked(param: RowClickedEvent | any) {
    this.SingleRow = param.data
    // await this.modalDeleteComponent.openData(this.SingleRow)

  }

  onRowDoubleClicked(param: RowClickedEvent | any) {
    param.node.setExpanded(!param.node.expanded);
  }

  onFilterChange(param: FilterChangedEvent | any) {
    if (this.merchantMDRform.controls['merchantId'].value === "") {
      this.merchantValue = null
    } else {
      this.merchantValue = this.merchantMDRform.controls['merchantId'].value
    }
    let Requestbody = {
      "merchantId": this.merchantId || this.merchantValue
    }

    // this.rowData.length = 0
    this.gridApi.applyTransaction({remove: this.rowData})
    this.gridApi.showLoadingOverlay();

    const self = this;
    // setTimeout(()=>{
    self.apiHttpService
      .post(
        `${API_URL}/get-merchantmdrlist?pageSize=${this.pageSize}&page=${(this.currentPage - 1)}`, Requestbody
      )
      // @ts-ignore
      .subscribe((data) => {
        self.gridApi.applyTransaction({
          add: data?.filter((dt: any) => {
            if (dt.age == self.filterObj?.age?.appliedModel.filter)
              return dt;
          })
        });

        this.collectionSize = data?.totalCount || data?.length
      });
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

    if (this.merchantMDRform.controls['merchantId'].value === "") {
      this.merchantValue = null
    } else {
      this.merchantValue = this.merchantMDRform.controls['merchantId'].value
    }
    let Requestbody = {
      // "merchantid": this.merchantId || "M0002",
      "merchantId": this.merchantId || this.merchantValue
    }

    this.gridApi.paginationSetPageSize(this.pageSize)
    this.gridApi.applyTransaction({remove: this.rowData})
    this.gridApi.showLoadingOverlay();
    this.apiHttpService
      .post(
        `${API_URL}/get-merchantmdrlist?pageSize=` + this.pageSize + '&page=' + (this.currentPage - 1), Requestbody
      )
      .subscribe((data) => (this.rowData = data?.data, this.collectionSize = data?.totalCount, this.gridApi.applyTransaction({add: this.rowData})
      ));

  }

  //call create merchant MDR api
  onSubmit(formvalue: any) {


    if (this.merchantMDRform.valid) {
      this.closeOthers = true;
      this.selectedMerchantID = this.merchantId || formvalue.merchantId
      this.spID = formvalue.spId
      this.bankID = formvalue.bank_id
      let MDRADD = {
        "merchantId": this.merchantId || formvalue.merchantId,
        "spId": formvalue.spId,
        "bankId": formvalue.bank_id,
        "instrumentId": formvalue.instrument_id,
        "status": formvalue.status,
        "remark": formvalue.remark,
        "instrumentBrand": formvalue.instrumentBrand,

      }
      this.apiHttpService
        .post(
          `${API_URL}/createorupdate-merchantmdrlist`, MDRADD
        )
        .subscribe((data) => {
          if (data) {
            this.alertService.successAlert(data.msg);
          }
          this.rowData = data.data || data;
          this.collectionSize = data.totalCount || data.length;

          this.randomdata = {
            "merchantId": (this.merchantId || this.merchantMDRform.controls['merchantId'].value == "" ? null : this.merchantMDRform.controls['merchantId'].value) || this.selectedMerchantID
          };
          this.merchantMDRform.reset();
          this.merchantMDRform.controls['spId'].setValue("")
          this.merchantMDRform.controls['instrument_id'].setValue("")
          this.merchantMDRform.controls['bank_id'].setValue("")
          this.merchantMDRform.controls['instrumentBrand'].setValue("")
          this.merchantMDRform.controls['status'].setValue("")
          this.merchantMDRform.controls['remark'].setValue("")
          this.merchantMDRform.markAsUntouched();
          this.merchantMDRform.updateValueAndValidity();
          this.isForm1Submitted = false;
          this.merchantMDRform.get('merchantId')?.patchValue(this.merchantId);
          this.merchantMDRform.get('merchantId')?.disable();

          this.apiHttpService
            .post(
              `${API_URL}/get-merchantmdrlist?pageSize=${this.pageSize}&page=${(this.currentPage - 1)}`, this.randomdata
            )
            .subscribe((data) => {
              this.rowData = data?.data || data;
              this.collectionSize = data?.totalCount || data?.length;

              this.e = {"target": {'value': this.spID.toString()}};
              this.x = {"target": {'value': this.bankID.toString()}};
              this.seletservice(this.e);
              this.selectinstrument(this.x);
              this.bankselect = false;
              this.Instrumentselect = false
            })

        }, (error) => {
          console.log("Error------>", error);
        });

      this.reset()
      this.merchantMDRform.controls['spId'].setValue("")
      this.merchantMDRform.controls['instrument_id'].setValue("")
      this.merchantMDRform.controls['bank_id'].setValue("")
      this.merchantMDRform.controls['instrumentBrand'].setValue("")
      this.merchantMDRform.controls['remark'].setValue("")
      this.merchantMDRform.controls['status'].setValue("")


      this.merchantMDRform.get('merchantId')?.patchValue(this.merchantId);
      this.merchantMDRform.get('merchantId')?.disable();
      this.refreshGrid(this.selectedMerchantID || this.merchantId);
      this.bankselect = false
      this.Instrumentselect = false
    } else {
      this.closeOthers = false;
      this.acc.expandAll();
    }
    this.isForm1Submitted = true;
  }

  //get merchant By Name
  MerchnatList() {
    let merchantdata = {"name": ""}
    this.apiHttpService
      .post(`${API_URL}/GetMerchant/`, merchantdata)
      .subscribe((res) => {
        this.Resultdata = res
      });
  }

  Edit(Editvalue: any) {
    this.bankselect = true
    this.Instrumentselect = true
    setTimeout(() => {
      this.merchantMDRform.patchValue({
        "merchantId": Editvalue.merchant_id,
        "spId": Editvalue.sp_id.toString(),
        "bank_id": Editvalue.bank_id,
        "instrument_id": Editvalue.instrument_id,
        "status": Editvalue.instrument_id,
        "remark": Editvalue.instrument_id,
        "instrumentBrand": Editvalue.instrument_brand,
      })
    }, 0);

  }

  reset() {
    this.merchantMDRform.reset(); // Reset form data
    this.merchantMDRform.markAsUntouched(); // Reset form data
    this.merchantMDRform.updateValueAndValidity(); // Reset form data
  }

  // end call api serviceProvide dropdown

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

  // end call api instrument dropdown

  // call api instrument dropdown
  seletservice(e: any) {

    this.Instrumentselect = true
    this.code = e.target.value;
    let serviceprovidedata = {
      "Type": "6",
      "Value": this.code
    }
    this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`, serviceprovidedata
      )
      .subscribe((res) => {
        this.Resdatas = res
      });
  }

  // end api call  for bank select dropdown

  // call api for bank select dropdown
  selectinstrument(e: any) {
    this.bankselect = true
    this.bankdata = e.target.value;
    let serviceprovidedata = {
      "Type": "7",
      "Value": this.bankdata
    }
    this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`, serviceprovidedata
      )
      .subscribe((res) => {
        this.Resbank = res
      });
  }

  selectinstrumentBrand() {
    let serviceprovidedata = {
      "Type": "14",
      "Value": ""
    }
    this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`, serviceprovidedata
      )
      .subscribe((res) => {
        this.ResinstrumentBrand = res
      });
  }

  delete(deletedata: any) {
    let data = {
      "id": deletedata.id
    }

    return this.apiHttpService
      .post(
        `${API_URL}/delete-merchantmdrlist`, data
      )
    // .subscribe((data) => {
    //   data.status=='true' ? this.alertService.simpleAlert(data.msg):this.alertService.successAlert(data.msg);
    //   //      this.refreshGrid(),
    //   this.bodydata = {
    //     "merchantId": this.merchantId || (this.merchantMDRform.controls['merchantId'].value=="" ? null:this.merchantMDRform.controls['merchantId'].value)
    //   };
    //   this.gridApi.showLoadingOverlay();
    //   this.apiHttpService
    //     .post(
    //       `${API_URL}/get-merchantmdrlist`, this.bodydata
    //     )
    //     .subscribe((data) => {
    //       this.rowData = data?.data || data;
    //       this.collectionSize = data?.totalCount || data?.length
    //     })
    // })
  }

  refreshGrid(Mid?: any) {
    if (this.merchantMDRform.controls['merchantId'].value === "") {
      this.merchantValue = null
    } else {
      this.merchantValue = this.merchantMDRform.controls['merchantId'].value
    }
    let data = {
      "merchantId": this.merchantId || this.merchantValue || Mid
    }
    this.gridApi.showLoadingOverlay();

    return this.apiHttpService
      .post(
        `${API_URL}/get-merchantmdrlist?pageSize=${this.pageSize}&page=${(this.currentPage - 1)}`, data
      )
      .subscribe((data) => {
        this.rowData = data?.data || Array.isArray(data) ? data : [];
        this.collectionSize = data?.totalCount || data?.length
      });
  }

  noKeyInput($event: any) {
    return false
  }

  //validation for number only
  onlyNumbersAllowed(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    return (charCode > 47 && charCode < 58) || charCode == 46;
  }

}
