import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
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
import {environment} from "../../../../../../environments/environment";
import {ActivatedRoute, Router} from "@angular/router";
import {ApiHttpService} from "../../../../../_services/api-http.service";
import {MenusService} from "../../../../../_services/menu.service";

const {API_URL} = environment;

export interface ResellerMDR {
  "merchantId": string,
  "spId": string,
  "bankId": string,
  "instrumentId": string,
  "minAmt": 2.0,
  "maxAmt": 2000.0,
  "mdrType": "Percentage",
  "aggrMdr": 1.0,
  "resellerMdr": 1.0,
  "baseRate": string,
  "minBaseRate": string,
  "maxBaseRate": string,
  "minMdr": string,
  "maxMdr": string,
  "mid": string,
  "tid": string,
  "startDate": string,
  "endDate": string,
  "prefrences": string,
  "surcharge": string,
  "payout": string,
  "cardVariantName": string,
  "network": string,
  "bankMdrType": string,
  "minResellerMdr": string,
  "maxResellerMdr": string

}


@Component({
  selector: 'app-reseller-mdr',
  templateUrl: './reseller-mdr.component.html',
  styleUrls: ['./reseller-mdr.component.scss']
})
export class ResellerMDRComponent implements OnInit {
  resellerMDRform: FormGroup;
  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 170,
    filter: true,
  };
  public rowData!: ResellerMDR[];
  tablecolumn: any;
  currentPage: number = 1;
  pageSize: number = 10;
  globalSearch: string = '';
  collectionSize: number = 0;
  SingleRow: any;
  tableInfo: any;
  selectedResellerID: any;
  isForm1Submitted: Boolean;
  public columnDefs: ColDef[] = [
    {field: 'id', headerName: 'ID', hide: true},

    {field: 'sp_id', headerName: 'Service Provider ID', filter: 'agNumberColumnFilter'},
    {field: 'instrument_id', headerName: 'Instrument ID', filter: 'agNumberColumnFilter'},
    {field: 'bank_id', headerName: 'Bank ID', filter: 'agNumberColumnFilter'},
    {field: 'min_amt', headerName: 'Minimum Amount'},
    {field: 'max_amt', headerName: 'Maximum Amount', filter: 'agNumberColumnFilter'},
    {field: 'mdr_type', headerName: 'MDR Type', filter: 'agNumberColumnFilter'},
    {field: 'aggr_mdr', headerName: 'Aggregate MDR', filter: 'agNumberColumnFilter'},
    {field: 'reseller_mdr', headerName: 'Reseller MDR', filter: 'agNumberColumnFilter'},
    {field: 'min_mdr', headerName: 'Minimum MDR', filter: 'agNumberColumnFilter'},
    {field: 'max_mdr', headerName: 'Maximum MDR', filter: 'agNumberColumnFilter'},
    {field: 'base_rate', headerName: 'Base Rate', filter: 'agNumberColumnFilter'},
    {field: 'min_base_rate', headerName: 'Minimum Base Rate', filter: 'agNumberColumnFilter'},
    {field: 'max_base_rate', headerName: 'Maximum Base Rate', filter: 'agNumberColumnFilter'},
    {field: 'start_date', headerName: 'Start Date', filter: 'agNumberColumnFilter'},
    {field: 'end_date', headerName: 'End Date', filter: 'agNumberColumnFilter'},
    {field: 'reseller_mdr_type', headerName: 'Reseller MDR Type', filter: 'agNumberColumnFilter'},
    {field: 'instrument_brand', headerName: 'Instrument Brand'},
    {
      field: 'Action', resizable: true, cellRenderer: BtnCellRenderer, cellRendererParams: [
        // {
        //   clicked: async (field: any) => {

        //   },
        //   buttonIconClass: 'icon-edit-2'
        // },
        {
          clicked: async (field: any, param: any) => {
            this.tableInfo = param.data
            this.delete(this.tableInfo)
          },
          buttonIconClass: 'icon-trash'
        },

        {
          clicked: async (field: any, param: any) => {
            this.tableInfo = param.data
            this.Edit(this.tableInfo)
          },
          buttonIconClass: 'icon-edit-2'
        }
      ]
    }
  ];
  tableSelectedColumn: ColDef[] = [...this.columnDefs];
  Resdata: any;
  Resdatas: any;
  code: any;
  bankdata: any;
  Resbank: any;
  resellerId: string;
  bodydata: any;
  randomdata: any;
  Resultdata: any;
  resellerValue: null;
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
  @ViewChild('acc') private acc: NgbAccordion;
  private gridApi!: GridApi;
  private filterObj: any = {};

  // randomdata: { resellerid: string; };
  private permissions: any;

  constructor(private location: Location, private menuService: MenusService, private route: ActivatedRoute, private formbuilder: FormBuilder, private datePipe: DatePipe, private apiHttpService: ApiHttpService, private router: Router) {
    this.bankselect = false
    this.Instrumentselect = false
    this.resellerMDRform = formbuilder.group({
      resellerId: ["", Validators.required],
      minAmt: ["", [Validators.required, Validators.pattern(new RegExp('^10000000000.00$|^\\d{0,10}(\\.\\d{1,2})? *%?$'))]],
      maxAmt: ["", [Validators.required, Validators.pattern(new RegExp('^10000000000.00$|^\\d{0,10}(\\.\\d{1,2})? *%?$'))]],
      mdrType: ["", Validators.required],
      aggrMdr: ["", [Validators.required]],
      resellerMdr: ["", Validators.required],
      baseRate: ["", Validators.required],
      minBaseRate: ["", [Validators.required, Validators.pattern, Validators.pattern(new RegExp('^10000.00$|^\\d{0,4}(\\.\\d{1,2})? *%?$'))]],
      maxBaseRate: ["", [Validators.required, Validators.pattern(new RegExp('^10000.00$|^\\d{0,4}(\\.\\d{1,2})? *%?$'))]],
      minMdr: ["", [Validators.required, Validators.pattern(new RegExp('^10000.00$|^\\d{0,4}(\\.\\d{1,2})? *%?$'))]],
      maxMdr: ["", [Validators.required, Validators.pattern(new RegExp('^10000.00$|^\\d{0,4}(\\.\\d{1,2})? *%?$'))]],
      mid: ["", Validators.required],
      startDate: ["", Validators.required],
      endDate: ["", Validators.required],
      prefrences: ["0", Validators.required],
      spId: ["", Validators.required],
      instrument_id: ["", Validators.required],
      bank_id: ["", Validators.required],
      // resellerId:["", Validators.required],
      payout: ["", Validators.required],
      surcharge: ["", Validators.required],
      tid: ["", Validators.required],
      minResellerMdr: ["", [Validators.required, Validators.pattern(new RegExp('^10000.00$|^\\d{0,4}(\\.\\d{1,2})? *%?$'))]],
      maxResellerMdr: ["", [Validators.required, Validators.pattern(new RegExp('^10000.00$|^\\d{0,4}(\\.\\d{1,2})? *%?$'))]],
      resellerMdrType: ["", Validators.required],
      bankMdrType: ["", Validators.required],
      instrumentBrand: ["", Validators.required]
    });
  }

  get form1() {
    return this.resellerMDRform.controls;
  }

  instrumentselection() {
    if (this.bankselect == false) {
      return
    }

  }

  bankselection() {

    if (this.Instrumentselect == false) {
      return
    }
  }

  // checkMinMax(formCtr1, formCtr2){
  //
  // }

  ngOnInit(): void {
    const path = this.location.prepareExternalUrl(this.location.path());
    this.permissions = this.menuService.getPermissions(path);
    this.route.queryParams
      .subscribe(params => {
          this.queryParams = params;
          this.resellerId = params?.mid// { orderby: "price" }
          if (this.resellerId) {
            this.resellerMDRform.get('resellerId')?.patchValue(this.resellerId);
            this.resellerMDRform.get('resellerId')?.disable();
          }
        }
      );
    // simple array
    this.isForm1Submitted = false;
    this.MerchnatList();

    // @ts-ignore
    //  this.onResellerChange.subscribe((data) => (console.log("data=========>", data, this.resellerId), this.resellerId = data, <FormControl>this.accountform.get('resellerId').setValue(data), this.refreshGrid()))
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
    this.activeIds = ['pan-1'];
    const mdrTypeCtrl = <FormControl>this.resellerMDRform.get('mdrType');
    const aggrMdrCtrl = <FormControl>this.resellerMDRform.get('aggrMdr');
    const bankMdrTypeCtrl = <FormControl>this.resellerMDRform.get('bankMdrType');
    const baseRateCtrl = <FormControl>this.resellerMDRform.get('baseRate');
    const resellerMdrTypeCtrl = <FormControl>this.resellerMDRform.get('resellerMdrType');
    const resellerMdrCtrl = <FormControl>this.resellerMDRform.get('resellerMdr');

    mdrTypeCtrl.valueChanges.subscribe(value => {
      if (value == '1') {
        aggrMdrCtrl.setValidators([Validators.required, Validators.pattern(new RegExp('^100.00$|^\\d{0,2}(\\.\\d{1,2})? *%?$'))])
      } else {
        aggrMdrCtrl.setValidators([Validators.required, Validators.pattern(new RegExp('^1000$|^\\d{0,3}(\\.\\d{1,2})? *%?$'))])
      }
      aggrMdrCtrl.updateValueAndValidity();
    });

    bankMdrTypeCtrl.valueChanges.subscribe(value => {
      if (value == '1') {
        baseRateCtrl.setValidators([Validators.required, Validators.pattern(new RegExp('^100$|^\\d{0,2}(\\.\\d{1,2})? *%?$'))])
      } else {
        baseRateCtrl.setValidators([Validators.required, Validators.pattern(new RegExp('^1000$|^\\d{0,3}(\\.\\d{1,2})? *%?$'))])
      }
      baseRateCtrl.updateValueAndValidity();
    });
    resellerMdrTypeCtrl.valueChanges.subscribe(value => {
      if (value == '1') {
        resellerMdrCtrl.setValidators([Validators.required, Validators.pattern(new RegExp('^100$|^\\d{0,2}(\\.\\d{1,2})? *%?$'))])
      } else {
        resellerMdrCtrl.setValidators([Validators.required, Validators.pattern(new RegExp('^1000$|^\\d{0,3}(\\.\\d{1,2})? *%?$'))])
      }
      resellerMdrCtrl.updateValueAndValidity();
    });
  }

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

    //this.accountform.controls['resellerId'].setValue(mid)
    this.refreshGrid(this.resellerId);
    this.bankselect = false
    this.Instrumentselect = false
  }

  onGridReady(params: GridReadyEvent<ResellerMDR>) {
    if (this.resellerMDRform.controls['resellerId'].value === "") {
      this.resellerValue = null
    } else {
      this.resellerValue = this.resellerMDRform.controls['resellerId'].value
    }
    let data = {
      "resellerId": this.resellerId || this.resellerValue
      // "resellerid": this.resellerId || "M0003"
    }


    this.gridApi = params.api;
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
    if (this.resellerMDRform.controls['resellerId'].value === "") {
      this.resellerValue = null
    } else {
      this.resellerValue = this.resellerMDRform.controls['resellerId'].value
    }
    let data = {
      "resellerId": this.resellerId || this.resellerValue
      // "resellerid": this.resellerId || "M0003"
    }
    return this.apiHttpService
      .post(
        `${API_URL}/get-merchantmdrlist`, data
      )
      // @ts-ignore
      .subscribe((data) => (
        this.gridApi.applyTransaction({add: data}),
          this.collectionSize = data?.totalCount || data?.length
      ));
  }

  onExportCSV() {
    // @ts-ignore
    var random3 = Math.floor(Math.random() * 10000000000 + 1);
    var today = new Date();
    var referenceId = today.getFullYear().toString() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + "-" + ("0" + today.getDate()).slice(-2) + "_" + (("0" + today.getHours())).slice(-2) + "-" + (("0" + today.getMinutes())).slice(-2) + "-" + (("0" + today.getSeconds())).slice(-2)
    var fileName = 'Reseller-Mdr' + referenceId
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
    this.SingleRow = param.data
    // await this.modalDeleteComponent.openData(this.SingleRow)

  }

  onRowDoubleClicked(param: RowClickedEvent | any) {
    console.log("Row Clicked321", param);
    param.node.setExpanded(!param.node.expanded);
  }

  onFilterChange(param: FilterChangedEvent | any) {


    if (this.resellerMDRform.controls['resellerId'].value === "") {
      this.resellerValue = null
    } else {
      this.resellerValue = this.resellerMDRform.controls['resellerId'].value
    }
    let Requestbody = {
      // "resellerid": this.resellerId || "M0003"
      "resellerId": this.resellerId || this.resellerValue

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
        `${API_URL}/get-merchantmdrlist?pageSize=${this.pageSize}&page=${(this.currentPage - 1)}`, Requestbody
      )
      // @ts-ignore
      .subscribe((data) => (console.log("****onFilterChange"), self.gridApi.applyTransaction({
          add: data?.filter((dt: any) => {
            if (dt.age == self.filterObj?.age?.appliedModel.filter)
              return dt;
          })
        })
          ,
          this.collectionSize = data?.totalCount || data?.length
        // ,
        // Object.keys(data[0]).forEach((elements,i) => {
        //   this.columnDefs.push(
        //     { field: elements, filter: 'agNumberColumnFilter' }
        //   )
        // }),
        // this.columnDefs.push(
        //   {
        //     field: 'action', resizable: true, cellRenderer: BtnCellRenderer, cellRendererParams: [

        //       {
        //         clicked: async (field: any, param: any) => {
        //


        //           alert(`${field} was clicked` + param);
        //           this.tableInfo = param.data
        //           this.delete(this.tableInfo)
        //         },
        //         buttonIconClass: 'icon-trash'
        //       },

        //       {
        //         clicked: async (field: any, param: any) => {
        //


        //           alert(`${field} was clicked` + param);
        //           this.tableInfo = param.data
        //           this.Edit(this.tableInfo)
        //         },
        //         buttonIconClass: 'icon-edit-2'
        //       }

        //     ]


        //   },

        // ),
        // this.gridApi.setColumnDefs( this.columnDefs),
        // this.gridApi.setRowData(data)
      ));
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

    if (this.resellerMDRform.controls['resellerId'].value === "") {
      this.resellerValue = null
    } else {
      this.resellerValue = this.resellerMDRform.controls['resellerId'].value
    }
    let Requestbody = {
      // "resellerid": this.resellerId || "M0002",
      "resellerId": this.resellerId || this.resellerValue
    }

    console.log($event.preventDefault());
    this.gridApi.paginationSetPageSize(this.pageSize)
    this.gridApi.applyTransaction({remove: this.rowData})
    this.gridApi.showLoadingOverlay();
    this.apiHttpService
      .post(
        `${API_URL}/get-merchantmdrlist?pageSize=` + this.pageSize + '&page=' + (this.currentPage - 1), Requestbody
      )
      .subscribe((data) => (console.log("****onPageSizeChange"), this.rowData = data?.data, this.collectionSize = data?.totalCount, this.gridApi.applyTransaction({add: this.rowData})
        // ,
        // this.collectionSize = data?.totalCount || data?.length,
        // Object.keys(this.rowData[0]).forEach((elements,i) => {
        //   this.columnDefs.push(
        //     { field: elements, filter: 'agNumberColumnFilter' }
        //   )
        // }),
        // this.columnDefs.push(
        //   {
        //     field: 'action', resizable: true, cellRenderer: BtnCellRenderer, cellRendererParams: [
        //       // {
        //       //   clicked: async (field: any) => {

        //       //   },
        //       //   buttonIconClass: 'icon-edit-2'
        //       // },
        //       {
        //         clicked: async (field: any, param: any) => {
        //


        //           alert(`${field} was clicked` + param);
        //           this.tableInfo = param.data
        //           this.delete(this.tableInfo)
        //         },
        //         buttonIconClass: 'icon-trash'
        //       },

        //       {
        //         clicked: async (field: any, param: any) => {
        //


        //           alert(`${field} was clicked` + param);
        //           this.tableInfo = param.data
        //           this.Edit(this.tableInfo)
        //         },
        //         buttonIconClass: 'icon-edit-2'
        //       }

        //     ]


        //   },

        // ),
        // this.gridApi.setColumnDefs( this.columnDefs),
        // this.gridApi.setRowData(data)

      ));

  }

  //call create reseller MDR api
  onSubmit(formvalue: any) {

    if (this.resellerMDRform.valid) {
      this.closeOthers = true;
      this.selectedResellerID = this.resellerId || formvalue.resellerId
      this.spID = formvalue.spId
      this.bankID = formvalue.bank_id
      let MDRADD = {
        "resellerId": this.resellerId || formvalue.resellerId,
        "spId": formvalue.spId,
        "bankId": formvalue.bank_id,
        "instrumentId": formvalue.instrument_id,
        "minAmt": formvalue.minAmt,
        "maxAmt": formvalue.maxAmt,
        "mdrType": formvalue.mdrType,
        "aggrMdr": formvalue.aggrMdr,

        "baseRate": formvalue.baseRate,
        "minBaseRate": formvalue.minBaseRate,
        "maxBaseRate": formvalue.maxBaseRate,
        "minMdr": formvalue.minMdr,
        "maxMdr": formvalue.maxMdr,
        "mid": formvalue.mid,
        "tid": formvalue.tid,
        "startDate": formvalue.startDate,
        "endDate": formvalue.endDate,
        "prefrences": formvalue.prefrences,
        "surcharge": formvalue.surcharge,
        "payout": formvalue.payout,
        "cardVariantName": "",
        "network": "",
        "bankMdrType": formvalue.bankMdrType,
        "resellerMdr": formvalue.resellerMdr,
        "minResellerMdr": formvalue.minResellerMdr,
        "maxResellerMdr": formvalue.maxResellerMdr,
        "resellerMdrType": formvalue.resellerMdrType,
        "instrumentBrand": formvalue.instrumentBrand,

      }
      this.apiHttpService
        .post(
          `${API_URL}/createorupdate-merchantmdrlist?pageSize=` + this.pageSize + '&page=' + (this.currentPage - 1), MDRADD
        )
        .subscribe((data) =>

          (console.log("****onSubmit" + data),
              this.rowData = data.data || data,
              this.collectionSize = data.totalCount || data.length,

              this.randomdata = {
                "resellerId": (this.resellerId || this.resellerMDRform.controls['resellerId'].value == "" ? null : this.resellerMDRform.controls['resellerId'].value) || this.selectedResellerID
              },
              this.resellerMDRform.reset(),
              this.resellerMDRform.markAsUntouched(),
              this.resellerMDRform.updateValueAndValidity(),
              this.isForm1Submitted = false,
              this.resellerMDRform.get('resellerId')?.patchValue(this.resellerId),
              this.resellerMDRform.get('resellerId')?.disable(),

              this.apiHttpService
                .post(
                  `${API_URL}/get-merchantmdrlist?pageSize=${this.pageSize}&page=${(this.currentPage - 1)}`, this.randomdata
                )
                .subscribe((data) => (console.log("****onGridReady"), this.rowData = data?.data || data, this.collectionSize = data?.totalCount || data?.length,
                    this.e = {
                      "target": {'value': this.spID.toString()}
                    },
                    this.x = {
                      "target": {'value': this.bankID.toString()}
                    },
                    this.seletservice(this.e),
                    this.selectinstrument(this.x),
                    console.log("SPID::::" + this.spID),
                    this.bankselect = false,
                    this.Instrumentselect = false
                ))
          ));


      this.reset()
      this.resellerMDRform.get('resellerId')?.patchValue(this.resellerId);
      this.resellerMDRform.get('resellerId')?.disable();
      this.refreshGrid(this.selectedResellerID || this.resellerId);
      this.bankselect = false
      this.Instrumentselect = false
    } else {
      this.closeOthers = false;
      this.acc.expandAll();
    }

    this.isForm1Submitted = true;
  }

  //get reseller By Name
  MerchnatList() {


    var resellerdata = {
      "name": ""
    }
    this.apiHttpService
      .post(
        `${API_URL}/GetMerchant/`, resellerdata
      )
      .subscribe((res) =>
        (console.log("****onGridReady" + res), this.Resultdata = res));


  }

  Edit(Editvalue: any) {
    this.bankselect = true
    this.Instrumentselect = true
    setTimeout(() => {
      this.resellerMDRform.patchValue({
        "resellerId": Editvalue.reseller_id,
        "spId": Editvalue.sp_id.toString(),
        "bank_id": Editvalue.bank_id,
        "instrument_id": Editvalue.instrument_id
        ,
        "minAmt": Editvalue.min_amt
        ,
        "maxAmt": Editvalue.max_amt,
        "mdrType": Editvalue.mdr_type
        ,
        "aggrMdr": Editvalue.aggr_mdr
        ,
        "resellerMdr": Editvalue.reseller_mdr
        ,
        "baseRate": Editvalue.base_rate,
        "minBaseRate": Editvalue.min_base_rate
        ,
        "maxBaseRate": Editvalue.max_base_rate
        ,
        "minMdr": Editvalue.min_mdr
        ,
        "maxMdr": Editvalue.max_mdr,
        "mid": Editvalue.mid
        ,
        "tid": Editvalue.tid
        ,

        "startDate": this.datePipe.transform(Editvalue.start_date, "yyyy-MM-dd")
        ,
        "endDate": this.datePipe.transform(Editvalue.end_date, "yyyy-MM-dd"),
        "prefrences": Editvalue.prefrences
        ,
        "surcharge": Editvalue.surcharge
        ,
        "payout": Editvalue.payout,
        "cardVariantName": Editvalue.card_variant_name
        ,
        "network": Editvalue.network
        ,
        "bankMdrType": Editvalue.bank_mdr_type
        ,
        "resellerMdrType": Editvalue.reseller_mdr_type,
        "minResellerMdr": Editvalue.min_reseller_mdr,
        "maxResellerMdr": Editvalue.max_reseller_mdr,
        "instrumentBrand": Editvalue.instrument_brand,


      })


    }, 0);

  }

  reset() {
    this.resellerMDRform.reset(); // Reset form data
    this.resellerMDRform.markAsUntouched(); // Reset form data
    this.resellerMDRform.updateValueAndValidity(); // Reset form data
  }

  // end call api serviceProvide dropdown

  //call api serviceProvide dropdown
  ServiceProvide() {

    let serviceprovidedata = {
      "Type": "5",
      "Value": ""
    }
    this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`, serviceprovidedata
      )
      .subscribe((res) =>
        (console.log("****onGridReady" + res), this.Resdata = res));
  }

  // end call api instrument dropdown

  // call api instrument dropdown
  seletservice(e: any) {
    this.Instrumentselect = true
    console.log(e.target.value)
    this.code = e.target.value;
    let serviceprovidedata = {
      "Type": "6",
      "Value": this.code
    }
    this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`, serviceprovidedata
      )
      .subscribe((res) =>
        (console.log("****onGridReady" + res), this.Resdatas = res));


  }

  // end api call  for bank select dropdown

  // call api for bank select dropdown
  selectinstrument(e: any) {
    this.bankselect = true
    console.log(e.target.value)
    this.bankdata = e.target.value;
    let serviceprovidedata = {
      "Type": "7",
      "Value": this.bankdata
    }
    this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`, serviceprovidedata
      )
      .subscribe((res) =>
        (console.log("****onGridReady" + res), this.Resbank = res));


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
      .subscribe((res) =>
        (console.log("****onGridReady" + res), this.ResinstrumentBrand = res));


  }

  delete(deletedata: any) {


    let data = {
      "id": deletedata.id
    }

    return this.apiHttpService
      .post(
        `${API_URL}/delete-merchantmdrlist`, data
      )
      .subscribe((data) => (console.log("****onGridReady"),
          //      this.refreshGrid(),
          this.bodydata = {
            "resellerId": this.resellerId || (this.resellerMDRform.controls['resellerId'].value == "" ? null : this.resellerMDRform.controls['resellerId'].value)
          },
          this.gridApi.showLoadingOverlay()

          , this.apiHttpService
          .post(
            `${API_URL}/get-merchantmdrlist?pageSize=${this.pageSize}&page=${(this.currentPage - 1)}`, this.bodydata
          )
          .subscribe((data) => (console.log("****onGridReady"), this.rowData = data?.data || data, this.collectionSize = data?.totalCount || data?.length

          ))

      ))


  }

  refreshGrid(Mid?: any) {

    if (this.resellerMDRform.controls['resellerId'].value === "") {
      this.resellerValue = null
    } else {
      this.resellerValue = this.resellerMDRform.controls['resellerId'].value
    }
    let data = {
      "resellerId": this.resellerId || this.resellerValue || Mid
    }
    this.gridApi.showLoadingOverlay();

    return this.apiHttpService
      .post(
        `${API_URL}/get-merchantmdrlist?pageSize=${this.pageSize}&page=${(this.currentPage - 1)}`, data
      )
      .subscribe((data) => (console.log("****onGridReady"), this.rowData = data?.data || data, this.collectionSize = data?.totalCount || data?.length
        // ,
        // this.collectionSize = data?.totalCount || data?.length,
        // Object.keys(this.rowData[0]).forEach((elements,i) => {
        //   this.columnDefs.push(
        //     { field: elements, filter: 'agNumberColumnFilter' }
        //   )
        // }),
        // this.columnDefs.push(
        //   {
        //     field: 'action', resizable: true, cellRenderer: BtnCellRenderer, cellRendererParams: [
        //       // {
        //       //   clicked: async (field: any) => {

        //       //   },
        //       //   buttonIconClass: 'icon-edit-2'
        //       // },
        //       {
        //         clicked: async (field: any, param: any) => {
        //


        //           alert(`${field} was clicked` + param);
        //           this.tableInfo = param.data
        //           this.delete(this.tableInfo)
        //         },
        //         buttonIconClass: 'icon-trash'
        //       },

        //       {
        //         clicked: async (field: any, param: any) => {
        //


        //           alert(`${field} was clicked` + param);
        //           this.tableInfo = param.data
        //           this.Edit(this.tableInfo)
        //         },
        //         buttonIconClass: 'icon-edit-2'
        //       }

        //     ]


        //   },

        // ),
        // this.gridApi.setColumnDefs( this.columnDefs),
        // this.gridApi.setRowData(data)
      ));
  }

  //validation for number only
  OnlyNumbersAllowed(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    return (charCode > 47 && charCode < 58) || charCode == 46;
  }

  //end the validtion


  previousStep($event: MouseEvent) {
    this.router.navigate(['/resellers/reseller-creation/reseller-basic-setup'], {
      queryParams: {...this.queryParams}
    })
  }

  nextStep($event: MouseEvent) {
    this.router.navigate(['/resellers/reseller-creation/reseller-risk'], {
      queryParams: {...this.queryParams}
    })
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
