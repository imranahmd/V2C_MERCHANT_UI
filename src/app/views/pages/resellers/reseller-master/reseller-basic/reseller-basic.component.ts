import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ApiHttpService} from 'src/app/_services/api-http.service';
import {environment} from 'src/environments/environment';
import {ActivatedRoute, Router} from "@angular/router";
import {MenusService} from "../../../../../_services/menu.service";
import {Location} from "@angular/common";
import {AlertService} from "../../../../../_services/alert.service";
import {ResellerService} from "../reseller.service";
import {moreThanOneWhiteSpaceValidator} from "../../../../../common/common.validators";

const {API_URL} = environment;

@Component({
  selector: 'app-reseller-basic',
  templateUrl: './reseller-basic.component.html',
  styleUrls: ['./reseller-basic.component.scss']
})
export class ResellerBasicComponent implements OnInit {
  resellerBasic: FormGroup;
  isForm6Submitted: boolean = false;
  field: any;
  datafield: any;
  pushURLvalue: boolean = false;
  Resdata: any;
  Resultdata: any;
  refundval: boolean = false;
  queryParams: any = {};
  public permissions: any;
  public status: any;
  // private merchantId: any;
  errorRemarks: any = 0;
  private resellerId: any;

  constructor(
    private alertService: AlertService,
    private menuService: MenusService,
    private location: Location,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private apiHttpService: ApiHttpService,
    private resellerService: ResellerService
  ) {

    this.resellerBasic = this.formBuilder.group({
      ResellerID: ['', [Validators.required]],
      resellerReturnUrl: ['', [moreThanOneWhiteSpaceValidator(), Validators.required, Validators.maxLength(500)]],
      autoRefund: ['', []],
      autoRefundHours: ['',],
      autoRefundMin: ['',],
      pushUrl: ['', []],
      enterpushUrl: ['',],
      settlementUrl: ['', []],
      disableRefundDashboard: ['', []],
      disableRefundApi: ['', []],
      integrationType: ['', [Validators.required]],
      paymentRetry: ['', []],
      linkPaymentEmail: ['', []],
      linkPaymentSms: ['', []],
      invoiceMainReminder: ['', []],
      reportingCycle: ['', [Validators.required]],
      mdDisableRefundCc: ['',],
      mdDisableRefundDc: ['',],
      mdDisableRefundNb: ['',],
      mdDisableRefundUpi: ['',],
      mdDisableRefundWallet: ['',],
      refundApiDisableCc: ['',],
      refundApiDisableDc: ['',],
      refundApiDisableNb: ['',],
      refundApiDisableUpi: ['',],
      refundApiDisableWallet: ['',],
      remarks: ['',],
    });
  }

  get form6() {
    return this.resellerBasic.controls;
  }

  ngOnInit(): void {
    const path = this.location.prepareExternalUrl(this.location.path());
    this.permissions = this.menuService.getPermissions(path);

    if (!(this.permissions.includes('Add New') || this.permissions.includes('Edit'))) {
      this.resellerBasic.disable({
        onlySelf: this.permissions.includes('Add New', 'Edit'),
        emitEvent: this.permissions.includes('Add New', 'Edit')
      })
      // this.resellerBasic.controls['autoRefundHours'].disable()
      // this.resellerBasic.controls['autoRefundMin'].disable()
      // this.resellerBasic.controls['enterpushUrl'].disable()
      this.resellerBasic.controls['remarks'].enable();
    }
    this.refundval = false
    // this.MerchnatList()
    this.route.queryParams
      .subscribe(params => {
          console.log("Basic setup params-------------->", params);
          this.queryParams = params;
          if (params?.mid) {
            this.resellerId = params?.mid;
            this.resellerBasic.get('ResellerID')?.patchValue(params?.mid);
            this.resellerBasic.get('ResellerID')?.disable();
            this.midSubmit();
            this.resellerService.getReseller(this.resellerId)
              .subscribe((data: any) => {
                console.log('--details-----', data, data.length)
                // if (data.length > 0) {
                this.status = Number(data?.oprations_approvel)
                if (this.status != "0")
                  this.resellerBasic.controls['remarks'].disable();
                // }
              })
          }
        }
      );

    this.isForm6Submitted = false;
  }

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

  midSubmit() {


    var body = {

      "ressellerId": this.resellerId,
      "returnUrl": "",
      "isAutoRefund": "",
      "hours": "",
      "minutes": "",
      "isPushUrl": "",
      "pushUrl": "",
      "settlementCycle": "",
      "resellerDashboardRefund": "",
      "rsDisableRefundCc": "",
      "rsDisableRefundDc": "",
      "rsDisableRefundNb": "",
      "rsDisableRefundUpi": "",
      "rsDisableRefundWallet": "",
      "refundApi": "",
      "refundApiDisableCc": "",
      "refundApiDisableDc": "",
      "refundApiDisableNb": "",
      "refundApiDisableUpi": "",
      "refundApiDisableWallet": "",
      "integrationType": "",
      "isretryAllowed": "1",
      "bpsEmailNotification": "",
      "bpsSmsNotification": "",
      "bpsEmailReminder": "",
      "reportCycling": "0",
    }

    this.apiHttpService
      .post(
        `${API_URL}/update-Reseller-BasicSetup`, body
      )
      .subscribe((data) => (console.log("****data", data), this.datafield = data,

          // data.length>0?  alert("Success"):  alert("Not Success")
          // ,
          //[{"merReturnUrl":"http://54.90.122.218:8080/payVAS/resellerResponse.jsp,https://paypgtest.in/payVAS/resellerResponse.jsp,http://localhost:8082/payVAS/resellerResponse.jsp,https://paypgtest.in/payVASPAY/resellerResponse.jsp","isAutoRefund":"0","hours":"01","minutes":"05","isPushUrl":"0","pushUrl":"","settlementCycle":"T+4","resellerDashboardRefund":"1","mdDisableRefundCc":"","mdDisableRefundDc":"0","mdDisableRefundNb":"0","imdDisableRefundUpi":"1","imdDisableRefundWallet":"1","refundApi":"1","refundApiDisableCc":"0","refundApiDisableDc":"0","refundApiDisableNb":"0","refundApiDisableUpi":"0","refundApiDisableWallet":"0","integrationType":"1","isretryAllowed":"true","ibpsEmailNotification":"","ibpsSmsNotification":"","resellerId":"M00005013"}]
          this.datafield.length > 0 ?
            this.resellerBasic.patchValue({
              resellerReturnUrl: data[0].returnUrl,
              autoRefund: data[0].isAutoRefund,
              autoRefundHours: data[0].hours,
              autoRefundMin: data[0].minutes,
              pushUrl: data[0].isPushUrl,
              enterpushUrl: data[0].pushUrl,
              settlementUrl: data[0].settlementCycle,
              disableRefundDashboard: data[0].resellerDashboardRefund,
              disableRefundApi: data[0].refundApi,
              integrationType: data[0].integrationType === null ? '' : data[0].integrationType,
              paymentRetry: data[0].isretryAllowed ? "1" : "0",
              linkPaymentEmail: data[0].ibpsEmailNotification,
              linkPaymentSms: data[0].ibpsSmsNotification,
              invoiceMainReminder: data[0].ibpsMailReminder,
              reportingCycle: data[0].reportCycling,
              mdDisableRefundCc: data[0].mdDisableRefundCc == "1" ? true : false,
              mdDisableRefundDc: data[0].mdDisableRefundDc == "1" ? true : false,
              mdDisableRefundNb: data[0].mdDisableRefundNb == "1" ? true : false,
              mdDisableRefundUpi: data[0].imdDisableRefundUpi == "1" ? true : false,
              mdDisableRefundWallet: data[0].imdDisableRefundWallet == "1" ? true : false,
              refundApiDisableCc: data[0].refundApiDisableCc == "1" ? true : false,
              refundApiDisableDc: data[0].refundApiDisableDc == "1" ? true : false,
              refundApiDisableNb: data[0].refundApiDisableNb == "1" ? true : false,
              refundApiDisableUpi: data[0].refundApiDisableUpi == "1" ? true : false,
              refundApiDisableWallet: data[0].refundApiDisableWallet == "1" ? true : false,

            })

            :

            this.resellerBasic.patchValue({
              resellerReturnUrl: "",
              autoRefund: "",
              autoRefundHours: "",
              autoRefundMin: "",
              pushUrl: "",
              enterpushUrl: "",
              settlementUrl: "",
              disableRefundDashboard: "",
              disableRefundApi: "",
              integrationType: null || "",
              paymentRetry: "",
              linkPaymentEmail: "",
              linkPaymentSms: "",
              invoiceMainReminder: "",
              reportingCycle: "",
              mdDisableRefundCc: "",
              mdDisableRefundDc: "",
              mdDisableRefundNb: "",
              mdDisableRefundUpi: "",
              mdDisableRefundWallet: "",
              refundApiDisableCc: "",
              refundApiDisableDc: "",
              refundApiDisableNb: "",
              refundApiDisableUpi: "",
              refundApiDisableWallet: "",

            })


      ))

  }

  ResellerList() {


    var resellerdata = {
      "name": ""
    }
    this.apiHttpService
      .post(
        `${API_URL}/GetMerchant/`, resellerdata
      )
      .subscribe((res) =>
        (console.log("****onGridReady" + res), this.Resdata = res));


  }

  loadDatabyMid() {

    //this.accountform.controls['resellerId'].setValue(mid)
    // this.refreshGrid(this.resellerId);
  }

  pushData() {

    if (this.resellerBasic.controls['pushUrl'].value == 0) {
      this.pushURLvalue = true
      // this.resellerBasic.controls['enterpushUrl'].setValue('')
      // this.resellerBasic.controls['enterpushUrl'].disable()
      // this.resellerBasic.controls['enterpushUrl'].clearValidators();
      // this.resellerBasic.controls['enterpushUrl'].updateValueAndValidity()
    } else {
      this.pushURLvalue = false
      // this.resellerBasic.controls['enterpushUrl'].enable();
      // this.resellerBasic.controls['enterpushUrl'].setValidators([Validators.required]);
      // this.resellerBasic.controls['enterpushUrl'].updateValueAndValidity();
      if (!(this.permissions.includes('Add New') || this.permissions.includes('Edit'))) {
        // this.resellerBasic.controls['enterpushUrl'].disable()
      }
    }

  }

  resetAutorefund(val: any) {
    if (val == 0) {
      // this.resellerBasic.controls['autoRefundHours'].setValue('')
      // this.resellerBasic.controls['autoRefundMin'].setValue('')
      // this.resellerBasic.controls['autoRefundHours'].disable()
      // this.resellerBasic.controls['autoRefundMin'].disable()
      //
      // this.resellerBasic.controls['autoRefundHours'].clearValidators();
      // this.resellerBasic.controls['autoRefundHours'].updateValueAndValidity();
      // this.resellerBasic.controls['autoRefundMin'].clearValidators();
      // this.resellerBasic.controls['autoRefundMin'].updateValueAndValidity();
      this.refundval = true
    } else {
      // this.resellerBasic.controls['autoRefundHours'].enable()
      // this.resellerBasic.controls['autoRefundMin'].enable()
      // this.resellerBasic.controls['autoRefundHours'].setValidators([Validators.required])
      // this.resellerBasic.controls['autoRefundHours'].updateValueAndValidity();
      // this.resellerBasic.controls['autoRefundMin'].setValidators([Validators.required]);
      // this.resellerBasic.controls['autoRefundMin'].updateValueAndValidity();
      this.refundval = false
      if (!(this.permissions.includes('Add New') || this.permissions.includes('Edit'))) {
        // this.resellerBasic.controls['autoRefundHours'].disable()
        // this.resellerBasic.controls['autoRefundMin'].disable()
      }
    }

  }

  resetMinutes() {
    if (this.resellerBasic.controls['autoRefund'].value == 0) {
      // this.resellerBasic.controls['autoRefundHours'].setValue('')
      // this.resellerBasic.controls['autoRefundMin'].setValue('')
    }
  }

  resellerSubmit() {
    console.log('00000------>', this.resellerBasic.valid);
    if (this.resellerBasic.valid) {
      var data = this.resellerBasic.value
      // if(this.resellerBasic.valid){}
      // this.isForm6Submitted = true;

      var body = {

        "ressellerId": this.resellerId || data.ResellerID,
        "returnUrl": data.resellerReturnUrl || "",
        "isAutoRefund": data.autoRefund || "",
        "hours": data.autoRefundHours || "",
        "minutes": data.autoRefundMin || "",
        "isPushUrl": data.pushUrl || "",
        "pushUrl": data.enterpushUrl || "",
        "settlementCycle": data.settlementUrl || "",
        "resellerDashboardRefund": data.disableRefundDashboard || "",
        "rsDisableRefundCc": this.resellerBasic.value.mdDisableRefundCc ? "1" : "0" || "",
        "rsDisableRefundDc": this.resellerBasic.value.mdDisableRefundDc ? "1" : "0" || "",
        "rsDisableRefundNb": this.resellerBasic.value.mdDisableRefundNb ? "1" : "0" || "",
        "rsDisableRefundUpi": this.resellerBasic.value.mdDisableRefundUpi ? "1" : "0" || "",
        "rsDisableRefundWallet": this.resellerBasic.value.mdDisableRefundWallet ? "1" : "0" || "",
        "refundApi": data.disableRefundApi || "",
        "refundApiDisableCc": this.resellerBasic.value.refundApiDisableCc ? "1" : "0" || "",
        "refundApiDisableDc": this.resellerBasic.value.refundApiDisableDc ? "1" : "0" || "",
        "refundApiDisableNb": this.resellerBasic.value.refundApiDisableNb ? "1" : "0" || "",
        "refundApiDisableUpi": this.resellerBasic.value.refundApiDisableUpi ? "1" : "0" || "",
        "refundApiDisableWallet": this.resellerBasic.value.refundApiDisableWallet ? "1" : "0" || "",
        "integrationType": data.integrationType || "",
        "isretryAllowed": '0',
        "bpsEmailNotification": data.linkPaymentEmail || "",
        "bpsSmsNotification": data.linkPaymentSms || "",
        "bpsEmailReminder": data.invoiceMainReminder || "",
        "reportCycling": data.reportingCycle || "0",
      }

      this.apiHttpService
        .post(
          `${API_URL}/update-Reseller-BasicSetup`, body
        )
        .subscribe((data) => (
          console.log("****data", data),
            this.field = data,
            data.length > 0 ? this.alertService.successAlert("Data saved successfully") :
              this.alertService.errorAlert({
                title: "Error occurred."
              })

        ))
    }
    this.isForm6Submitted = true

  }

  // @ts-ignore
  statusApproval(status: number, event: Event) {
    event.preventDefault()
    let appRequestBody;
    let responseMsg: string;
    const remarks = this.resellerBasic.controls['remarks'].value;
    // return;
    if (remarks.trim() == '') {
      this.errorRemarks = 1;
      this.alertService.errorAlert({
        text: "Please enter remarks"
      })
      return false
    }
    if (status == 1) {
      responseMsg = "Basic setup Successfully approved";
      appRequestBody = {
        "Rid": this.resellerId,
        "Status": "Approval",
        "Remark": remarks,
        "Approvel_type": "Opration"
      }
    } else {
      responseMsg = "Basic setup Successfully rejected";
      appRequestBody = {
        "Rid": this.resellerId,
        "Status": "Approval",
        "Remark": remarks,
        "Approvel_type": "ROpration"
      }
    }

    this.resellerService.sendApproval(appRequestBody)
      .subscribe(
        (data) => {
          if (data?.length > 0) {
            this.status = data[0]['oprations_approvel']
            if (this.status != 0)
              this.resellerBasic.controls['remarks'].disable();
            // this.alertService.toastSuccessMessageAlert({
            //   title: responseMsg
            // })
            this.alertService.successAlert(responseMsg)
          } else {
            this.alertService.errorAlert({
              text: "Some error occurred"
            })
          }

        },
        (error) => {
          this.alertService.errorAlert()
        }
      )
    this.errorRemarks = 0;

  }

}
