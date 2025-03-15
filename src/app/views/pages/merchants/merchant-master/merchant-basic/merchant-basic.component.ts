import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ApiHttpService} from 'src/app/_services/api-http.service';
import {environment} from 'src/environments/environment';
import {ActivatedRoute, Router} from "@angular/router";
import {MenusService} from "../../../../../_services/menu.service";
import {Location} from "@angular/common";
import {MerchantService} from "../merchant.service";
import {AlertService} from "../../../../../_services/alert.service";

const {API_URL} = environment;

@Component({
  selector: 'app-merchant-basic',
  templateUrl: './merchant-basic.component.html',
  styleUrls: ['./merchant-basic.component.scss']
})
export class MerchantBasicComponent implements OnInit {
  merchantBasic: FormGroup;
  isForm6Submitted: boolean = false;
  highlight: boolean;
  field: any;
  datafield: any;
  pushURLvalue: boolean = false;
  Resdata: any;
  Resultdata: any;
  refundval: boolean = false;
  queryParams: any = {};
  public permissions: any;
  public status: any;
  loading: boolean = false;
  private merchantId: any;

  constructor(private merchantService: MerchantService, private alertService: AlertService, private menuService: MenusService, private location: Location, private route: ActivatedRoute, private formBuilder: FormBuilder, private router: Router, private apiHttpService: ApiHttpService) {
    this.loading = false
    this.merchantBasic = this.formBuilder.group({
      MerchantID: ['', [Validators.required]],
      merchantReturnUrl: ['', [Validators.maxLength(1000)]],
      autoRefund: ['', [Validators.required, Validators.maxLength]],
      autoRefundHours: ['',],
      autoRefundMin: ['',],
      pushUrl: ['', [Validators.required]],
      enterpushUrl: ['',],
      settlementUrl: ['', [Validators.required]],
      disableRefundDashboard: ['', [Validators.required]],
      disableRefundApi: ['', [Validators.required]],
      integrationType: ["0", [Validators.required]],
      paymentRetry: ["1", [Validators.required]],
      linkPaymentEmail: ['', [Validators.required]],
      linkPaymentSms: ['', [Validators.required]],
      invoiceMainReminder: ['', [Validators.required]],
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
      Intent: ['',],
      Collect: ['',],
      remarks: ['',],
      upi: [''],
    });


  }

  get form6() {
    return this.merchantBasic.controls;
  }

  ngOnInit(): void {
    const path = this.location.prepareExternalUrl(this.location.path());
    this.permissions = this.menuService.getPermissions(path);


    if (!(this.permissions.includes('Add New') || this.permissions.includes('Edit'))) {
      this.merchantBasic.disable({
        onlySelf: this.permissions.includes('Add New', 'Edit'),
        emitEvent: this.permissions.includes('Add New', 'Edit')
      })
      this.merchantBasic.controls['autoRefundHours'].disable()
      this.merchantBasic.controls['autoRefundMin'].disable()
      this.merchantBasic.controls['enterpushUrl'].disable()
      this.merchantBasic.controls['remarks'].enable();
    }
    this.refundval = false
    this.MerchnatList()
    this.route.queryParams
      .subscribe(params => {
          this.queryParams = params;
          if (params?.mid) {
            this.merchantId = params?.mid;
            this.merchantBasic.get('MerchantID')?.patchValue(params?.mid);
            this.merchantBasic.get('MerchantID')?.disable();
            this.midSubmit();
            this.merchantService.getMerchant(this.merchantId).subscribe((data: any) => {
              if (data.length > 0) {
                this.status = data[0]?.oprations_approvel
                if (this.status != 0)
                  this.merchantBasic.controls['remarks'].disable();
              }
            })
          }
        }
      );

    this.isForm6Submitted = false;
  }

  MerchnatList() {


    var merchantdata = {
      "name": ""
    }
    this.apiHttpService
      .post(
        `${API_URL}/GetMerchant/`, merchantdata
      )
      .subscribe((res) =>
        (this.Resultdata = res));


  }

  midSubmit() {


    var body = {
      "merchantid": this.merchantId || this.merchantBasic.controls['MerchantID'].value
    }

    this.apiHttpService
      .post(
        `${API_URL}/getMerchant-BasicSetupbyId`, body
      )
      .subscribe((data) => (this.datafield = data,

          // data.length>0?  alert("Success"):  alert("Not Success")
          // ,
          this.datafield.length > 0 ?
            this.merchantBasic.patchValue({
              merchantReturnUrl: data[0].merReturnUrl,
              autoRefund: data[0].isAutoRefund,
              autoRefundHours: data[0].hours,
              autoRefundMin: data[0].minutes,
              pushUrl: data[0].isPushUrl,
              enterpushUrl: data[0].pushUrl,
              settlementUrl: data[0].settlementCycle,
              disableRefundDashboard: data[0].merchantDashboardRefund,
              disableRefundApi: data[0].refundApi,
              integrationType: data[0].integrationType,
              paymentRetry: data[0].isretryAllowed == '1' ? "1" : "0",
              linkPaymentEmail: data[0].ibpsEmailNotification,
              linkPaymentSms: data[0].ibpsSmsNotification,
              invoiceMainReminder: data[0].ibpsMailReminder,
              reportingCycle: data[0].reporting_cycle,
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
              Intent: data[0].upi_intent == "1" ? true : false,
              Collect: data[0].upi_collect == "1" ? true : false,
              upi: data[0].upi_loader

            })
            :
            this.merchantBasic.patchValue({
              merchantReturnUrl: "",
              autoRefund: "",
              autoRefundHours: "",
              autoRefundMin: "",
              pushUrl: "",
              enterpushUrl: "",
              settlementUrl: "",
              disableRefundDashboard: "",
              disableRefundApi: "",
              integrationType: "0",
              paymentRetry: "1",
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
              Intent: "",
              Collect: "",
              upi: "",

            }),
          this.pushData(),
          this.resetAutorefund()
      ))

  }

  MerchantList() {


    var merchantdata = {
      "name": ""
    }
    this.apiHttpService
      .post(
        `${API_URL}/GetMerchant/`, merchantdata
      )
      .subscribe((res) =>
        (this.Resdata = res));


  }

  loadDatabyMid() {

    //this.accountform.controls['merchantId'].setValue(mid)
    // this.refreshGrid(this.merchantId);
  }

  pushData() {
    //
    if (this.merchantBasic.controls['pushUrl'].value == 0) {
      this.pushURLvalue = true
      this.merchantBasic.controls['enterpushUrl'].setValue('')
      this.merchantBasic.controls['enterpushUrl'].disable()
      this.merchantBasic.controls['enterpushUrl'].clearValidators();
      this.merchantBasic.controls['enterpushUrl'].updateValueAndValidity();
    } else {
      this.pushURLvalue = false
      this.merchantBasic.controls['enterpushUrl'].enable();
      this.merchantBasic.controls['enterpushUrl'].setValidators([Validators.required]);
      this.merchantBasic.controls['enterpushUrl'].updateValueAndValidity();
      if (!(this.permissions.includes('Add New') || this.permissions.includes('Edit'))) {
        this.merchantBasic.controls['enterpushUrl'].disable()
      }
    }

  }

  resetAutorefund($event?: any) {
    if (this.merchantBasic.controls['autoRefund'].value == 0) {
      this.merchantBasic.controls['autoRefundHours'].setValue('')
      this.merchantBasic.controls['autoRefundMin'].setValue('')
      this.merchantBasic.controls['autoRefundHours'].disable()
      this.merchantBasic.controls['autoRefundMin'].disable()

      this.merchantBasic.controls['autoRefundHours'].clearValidators();
      this.merchantBasic.controls['autoRefundHours'].updateValueAndValidity();
      this.merchantBasic.controls['autoRefundMin'].clearValidators();
      this.merchantBasic.controls['autoRefundMin'].updateValueAndValidity();
      this.refundval = true
    } else {
      this.merchantBasic.controls['autoRefundHours'].enable()
      this.merchantBasic.controls['autoRefundMin'].enable()
      this.merchantBasic.controls['autoRefundHours'].setValidators([Validators.required])
      this.merchantBasic.controls['autoRefundHours'].updateValueAndValidity();
      this.merchantBasic.controls['autoRefundMin'].setValidators([Validators.required]);
      this.merchantBasic.controls['autoRefundMin'].updateValueAndValidity();
      this.refundval = false
      if (!(this.permissions.includes('Add New') || this.permissions.includes('Edit'))) {
        this.merchantBasic.controls['autoRefundHours'].disable()
        this.merchantBasic.controls['autoRefundMin'].disable()
      }
    }


  }

  resetHours() {
    if (this.merchantBasic.controls['autoRefund'].value == 0) {
      this.merchantBasic.controls['autoRefundHours'].setValue('')
      this.merchantBasic.controls['autoRefundMin'].setValue('')
    }
  }

  resetMinutes() {
    if (this.merchantBasic.controls['autoRefund'].value == 0) {
      this.merchantBasic.controls['autoRefundHours'].setValue('')
      this.merchantBasic.controls['autoRefundMin'].setValue('')
    }
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.merchantBasic.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    return invalid;
  }

  merchantSubmit() {

    setTimeout(() => {
      //
      if (this.merchantBasic.valid) {
        var data = this.merchantBasic.value
        // if(this.merchantBasic.valid){}
        // this.isForm6Submitted = true;

        var body = {

          "merchantid": this.merchantId || data.MerchantID,
          "merReturnUrl": data.merchantReturnUrl || "",
          "isAutoRefund": data.autoRefund || "",
          "hours": (data.autoRefund ? data.autoRefundHours : "") || "",
          "minutes": (data.autoRefund ? data.autoRefundMin : "") || "",
          "isPushUrl": data.pushUrl || "",
          "pushUrl": (data.pushUrl ? data.enterpushUrl : "") || "",
          "settlementCycle": data.settlementUrl || "",
          "merchantDashboardRefund": data.disableRefundDashboard || "",
          "mdDisableRefundCc": this.merchantBasic.value.mdDisableRefundCc ? "1" : "0" || "",
          "mdDisableRefundDc": this.merchantBasic.value.mdDisableRefundDc ? "1" : "0" || "",
          "mdDisableRefundNb": this.merchantBasic.value.mdDisableRefundNb ? "1" : "0" || "",
          "mdDisableRefundUpi": this.merchantBasic.value.mdDisableRefundUpi ? "1" : "0" || "",
          "mdDisableRefundWallet": this.merchantBasic.value.mdDisableRefundWallet ? "1" : "0" || "",
          "refundApi": data.disableRefundApi || "",
          "refundApiDisableCc": this.merchantBasic.value.refundApiDisableCc ? "1" : "0" || "",
          "refundApiDisableDc": this.merchantBasic.value.refundApiDisableDc ? "1" : "0" || "",
          "refundApiDisableNb": this.merchantBasic.value.refundApiDisableNb ? "1" : "0" || "",
          "refundApiDisableUpi": this.merchantBasic.value.refundApiDisableUpi ? "1" : "0" || "",
          "refundApiDisableWallet": this.merchantBasic.value.refundApiDisableWallet ? "1" : "0" || "",

          "integrationType": data.integrationType || "0",
          "isretryAllowed": data.paymentRetry || "",
          "bpsEmailNotification": data.linkPaymentEmail || "",
          "bpsSmsNotification": data.linkPaymentSms || "",
          "ibpsMailReminder": data.invoiceMainReminder || "",
          "reporting_cycle": data.reportingCycle || "",
          "upi_loader": data.upi || "",
          "upi_intent": this.merchantBasic.value.Intent ? "1" : "0" || "",
          "upi_collect": this.merchantBasic.value.Collect ? "1" : "0" || "",
          // "imdDisableRefundUpi": "0",
          // "imdDisableRefundWallet": "0",
          // "ibpsEmailNotification": data.linkPaymentEmail,
          // "ibpsSmsNotification": data.linkPaymentSms,
        }
        // var body={
        //   "merReturnUrl": "http://localhost:8080/payVAS/merchantResponse.jsp,https://paypgtest.in/payVAS/merchantResponse.jsp,http://localhost:8082/payVAS/merchantResponse.jsp,https://paypgtest.in/payVASPAY/merchantResponse.jsp",
        //         "isAutoRefund": "0",
        //         "hours": "01",
        //         "minutes": "05",
        //         "isPushUrl": "0",
        //         "pushUrl": "",
        //         "settlementCycle": data.settlementUrl,
        //         "merchantDashboardRefund": "1",
        //         "mdDisableRefundCc": "",
        //         "mdDisableRefundDc": "0",
        //         "mdDisableRefundNb": "0",
        //         "imdDisableRefundUpi": "0",
        //         "imdDisableRefundWallet": "0",
        //         "refundApi": "1",
        //         "refundApiDisableCc": "0",
        //         "refundApiDisableDc": "0",
        //         "refundApiDisableNb": "0",
        //         "refundApiDisableUpi": "0",
        //         "refundApiDisableWallet": "0",
        //         "integrationType": data.integrationType,
        //         "isretryAllowed": "1",
        //         "ibpsEmailNotification": "0",
        //         "ibpsSmsNotification": "0",
        //         "merchantid":"M00005013",
        //         "mdDisableRefundUpi":"1",
        //         "mdDisableRefundWallet":"1",
        //         "bpsEmailNotification":data.linkPaymentEmail,
        //         "bpsSmsNotification":data.linkPaymentSms
        // }
        this.loading = true
        document?.getElementById('loading')?.classList.add("spinner-border")
        document?.getElementById('loading')?.classList.add("spinner-border-sm")
        this.apiHttpService
          .post(
            `${API_URL}/update-Merchant-BasicSetup`, body
          )
          .subscribe((data) => (
            this.loading = false,
              document?.getElementById('loading')?.classList.remove("spinner-border"),
              document?.getElementById('loading')?.classList.remove("spinner-border-sm"),
              this.field = data,
              data?.length > 0 ? this.alertService.successAlert("Data successfully added") : this.alertService.errorAlert({
                html: "Error while processing data"
              })

          ))
      }
      this.isForm6Submitted = true
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });

      this.highlight = false;
      // this.accPan.nativeElement.focus();
      document?.getElementById(this.findInvalidControls()[0])?.focus();
      console.log("hhhhhh" + this.findInvalidControls()[0]?.toString())
      // document.getElementsByClassName('ng-invalid')?.focus();
      setTimeout(() => {
        this.highlight = true;

      }, 1000);
    }, 0);

  }

  statusApproval(status: number) {
    let appRequestBody;
    let responseMsg: string;
    const remarks = this.merchantBasic.controls['remarks'].value;
    // return;
    if (status == 1) {
      responseMsg = "Basic setup Successfully approved";
      appRequestBody = {
        "Mid": this.merchantId,
        "Status": "Approval",
        "Remark": remarks,
        "Approvel_type": "Opration"
      }
    } else {
      responseMsg = "Basic setup Successfully rejected";
      appRequestBody = {
        "Mid": this.merchantId,
        "Status": "Approval",
        "Remark": remarks,
        "Approvel_type": "ROpration"
      }
    }

    this.merchantService.sendApproval(appRequestBody)
      .subscribe(
        (data) => {
          if (data.length >= 1) {
            this.status = data[0]['oprations_approvel']
            if (this.status != 0)
              this.merchantBasic.controls['remarks'].disable();
            this.alertService.successAlert(responseMsg
            )
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
  }
}
