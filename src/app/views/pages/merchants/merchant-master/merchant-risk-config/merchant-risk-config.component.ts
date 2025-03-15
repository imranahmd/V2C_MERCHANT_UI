import {Component, EventEmitter, Input, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiHttpService} from 'src/app/_services/api-http.service';
import {environment} from 'src/environments/environment';
import {Location} from "@angular/common";
import {AlertService} from "../../../../../_services/alert.service";
import {MenusService} from "../../../../../_services/menu.service";
import {MerchantService} from "../merchant.service";
import {StorageService} from 'src/app/_services/storage.service';
import {UserService} from 'src/app/_services/user.service';
import {DataTable} from 'simple-datatables';
import {lastValueFrom} from 'rxjs';

const {API_URL} = environment;

@Component({
  selector: 'app-merchant-risk-config',
  templateUrl: './merchant-risk-config.component.html',
  styleUrls: ['./merchant-risk-config.component.scss']
})
export class MerchantRiskConfigComponent implements OnInit {
  @Input() ConfigData: any;
  @Input() merchantId: string;
  @Input() onConfigChange: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('mccSelect') mccSelect: any;
  @ViewChild('rsk') rsk: any;
  controls: any = {};
  tickets: any = {}
  field: any

  name = 'Angular';
  isForm6Submitted: boolean = false;
  MerchantForm: FormGroup;
  dynamicForm: FormGroup;
  dynamicNewForm: FormGroup;
  approvalForm: FormGroup;
  rowData: any;
  body: any = {};
  newbody: any = {};
  fieldData: any;
  fieldDataModified: any = {};
  Beneficernce: any;
  getbody: any
  fieldResponse: any;
  databody: { name: string; };
  tablelistdata: any[];
  myarr: any = [];
  kycStatusData: any;
  kycstatusvalues: any;
  currentURL: boolean;
  selectdata: any;
  instrumentdata: any;
  instrumentvalues: any;
  elementData: string;
  subelement: string;
  fieldvalues: any;
  selectedProject: any;
  selectedProperty: any;
  Resultdata: any;
  queryParams: any = {};
  // fieldData: any;
  // Beneficernce: any;
  public permissions: any;
  public status: any;
  riskTypeOptions: any = [];
  mccOptions: any;
  mcc: any;
  riskType: any;
  remarkData: any = [];
  dataTable: DataTable;
  errorRemarks: number;
  JSONvalue: any;
  loading: boolean = false;

  constructor(
    private alertService: AlertService,
    private menuService: MenusService,
    private userService: UserService,
    private merchantService: MerchantService,
    private location: Location,
    private route: ActivatedRoute,
    private apiHttpService: ApiHttpService,
    private storage: StorageService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    // this.getMccOptions();
    this.loading = false
    this.MerchantForm = this.formBuilder.group({
      Mid: [this.merchantId || '', [Validators.required]]
    })
    this.approvalForm = this.formBuilder.group({
      remarks: ['', [Validators.required]]
    })
    var URL = this.router.url
    if (URL.indexOf("reseller-master") > 0) {
      this.currentURL = false
    } else {
      this.currentURL = true

    }
  }

  get form6() {
    return this.dynamicForm.controls;
  }

  get form6keys() {
    return Object.keys(this.dynamicForm.controls);
  }

  get form5() {
    return this.dynamicNewForm.controls;
  }

  ngOnInit(): void {
    const path = this.location.prepareExternalUrl(this.location.path());
    this.permissions = this.menuService.getPermissions(path);
    this.MerchnatList()
    this.getRiskTypeOptions();
    this.MerchantForm.get('Mid')?.enable()
    this.route.queryParams.subscribe((params) => {

      this.queryParams = params;
      if (params?.mid) {
        this.merchantId = params.mid;
        this.MerchantForm.get('Mid')?.patchValue(this.merchantId);
        this.MerchantForm.get('Mid')?.disable()
        // setTimeout(() => {
        //   this.onSubmit(this.merchantId);
        // }, 1000);
        this.merchantService.getMerchant(this.merchantId).subscribe((data: any) => {
          if (data?.length > 0) {
            this.status = data[0]?.risk_approvel
            if (this.status != 0)
              this.approvalForm.controls['remarks'].disable();
          }
          this.onSubmit(this.merchantId);
        })

        this.userService.getRiskRemark(this.merchantId, 'M', 'Risk').subscribe((data: any) => {
            this.remarkData = data || []
            this.dataTable ? this.dataTable.destroy() : console.log(this.remarkData)
            this.remarkData ? this.dataTable = new DataTable("#dataTableExample") : this.dataTable.destroy()
            if (this.remarkData) {
              this.remarkData.forEach((element: any) => {
                this.dataTable.rows().add(Object.values(element));
              })
            }
          }
        )
      }

    })

    // this.MerchantForm = this.formBuilder.group({
    //   Mid: ['', [Validators.required]]
    // })

    this.onConfigChange.subscribe((data) => {
      this.merchantId = data;
      this.loadFieldsAndValues();


      this.MerchantForm.controls['Mid'].setValue(this.merchantId)

    })
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

  ngAfterViewInit() {
    this.MerchantForm.get('Mid')?.patchValue(this.merchantId);
    // this.MerchantForm.get('Mid')?.disable()

  }

  changeProject(event: any, control: any) {
    this.dynamicForm.controls[control].setValue(event.target.value)
  }

  setNgSelectFieldValue(event: any, value: any) {

    // @ts-ignore
    // let selected = event.target['id'];
    console.log(event, value, "----------->")
    this.mcc = event?.FieldValue || event || value[0]?.FieldValue || ""
    // @ts-ignore
    // this[selected] = value
  }

  setFieldValue(event: any, value: any) {
    // @ts-ignore
    // let selected = event.target['id'];
    console.log(event, value, "----------->")
    this.rsk = event?.FieldValue || event || value[0]?.FieldValue || ""
    this.riskType = event?.FieldValue || event || value[0]?.FieldValue || ""
    // this.mcc = event.FieldValue
    // @ts-ignore
    // this[selected] = value
  }

  onNewSubmit(mid: any) {

    var x = this.dynamicNewForm.value
    var y = this.dynamicForm.value

    console.log(!!this.form6.riskType?.errors?.required, !this.riskType, "--------->>>");
    console.log((!!this.form6.riskType?.errors?.required || !this.riskType), "--------->>>");
    console.log(this.isForm6Submitted, "--------->>>");

    Object.keys(this.dynamicForm.value).forEach((element) => {
      this.body[element] = y[element]
      //     this.body = {
      //       element :y[element],
      // }
      Object.keys(this.dynamicNewForm.value).forEach((elements, i) => {
        this.subelement = elements.split(/_(.*)/s)[1];

        if (element == this.subelement) {
          if (x[elements] === '') {
            this.dynamicForm.controls[element].clearValidators();
            this.dynamicForm.controls[element].updateValueAndValidity();
            this.dynamicNewForm.controls["_" + element]?.clearValidators();
            this.dynamicNewForm.controls["_" + element]?.updateValueAndValidity();
          } else {
            this.dynamicForm.controls[element].setValue(x[elements]);
          }

          this.newbody[element][elements] = x[elements];
        }

        //     this.body = {
        //       element :y[element],
        // }
        // this.elementData = element
      });
    });

    Object.keys(this.newbody).forEach((elements, i) => {
      this.body[elements] = this.newbody[elements]
    })
    this.body["Mid"] = this.merchantId || mid.Mid;
    this.body["Mcc"] = this.mcc || this.dynamicForm.controls['mcc']?.value || '';
    this.body["RiskType"] = this.riskType || this.dynamicForm.controls['riskType']?.value || '';

    if (this.dynamicForm.valid) {
      if (this.dynamicNewForm.valid) {
        if (this.mcc && this.riskType) {
          try {
            this.loading = true
            document?.getElementById('loading')?.classList.add("spinner-border")
            document?.getElementById('loading')?.classList.add("spinner-border-sm")
            this.apiHttpService
              .post(
                `${API_URL}/AddRmsConfig`, this.body
              )
              .subscribe((data) => {
                this.loading = false
                document?.getElementById('loading')?.classList.remove("spinner-border")
                document?.getElementById('loading')?.classList.remove("spinner-border-sm")
                console.log("----->", data);
                if (data) {
                  this.alertService.successAlert(
                    "Configuration saved Successfully!",
                    ""
                  );
                  // this.fieldData = data;
                  // let iL = 1;
                  // this.fieldData?.map((f: any, i: any) => {
                  //   if (i <= iL) {
                  //     this.fieldDataModified[iL] = [];
                  //     this.fieldDataModified[iL].push(f);
                  //   }
                  //   if (i==iL) {
                  //     iL++;
                  //   }
                  // })
                  // this.onSubmit(this.merchantId);
                  this.loadFieldsAndValues();
                } else {
                  this.alertService.errorAlert({
                      title: "Error occurred.!",
                      html: ""
                    }
                  )
                }

              });
          } catch (e) {
            console.error("Error:-->", e)
            this.alertService.errorAlert({
                title: "Error occurred.!",
                html: ""
              }
            )
          }

        }

      }
    }
    this.isForm6Submitted = true

  }

  setvalue(dy: any, control: any, value: any) {
    this.dynamicForm.controls[control].setValue(value)
  }

  loadFieldsAndValues() {
    this.getbody = {
      "type": "3",
      "Mid": this.merchantId.toString()
    },
      this.apiHttpService
        .post(
          `${API_URL}/GetRmsFiled`, this.getbody
        )
        .subscribe((data) => {
          this.field = data;
          this.fieldData = this.field.Fields;
          let iL = 1;
          this.fieldData?.map((f: any, i: any) => {
            if (i <= iL) {
              this.fieldDataModified[iL] = [];
              this.fieldDataModified[iL].push(f);
            }
            if (i == iL) {
              iL++;
            }
          })

          console.log("---------+++++++++========>>>>>>", this.fieldDataModified);

          this.Beneficernce = this.field.Beneficernce;

          this.databody = {
            "name": this.merchantId
          }

          this.apiHttpService
            .post(
              `${API_URL}/GetConfigData`, this.databody
            )
            .subscribe((data) => {
              this.fieldResponse = data;

              this.fieldData.forEach((res: any) => {
                const validationsArray: any = [];
                var JSONvalue = JSON.parse(res.Validator)
                // Object.keys(JSONvalue).forEach((val: any) => {
                //
                this.JSONvalue = JSONvalue
                console.log(":::::::::jsonvalue" + JSON.stringify(this.JSONvalue) + this.JSONvalue.maxLength)
                if (JSONvalue['required'] === "true") {
                  validationsArray.push(
                    Validators.required
                  );
                }
                if (JSONvalue['min']) {
                  validationsArray.push(
                    Validators.min(JSONvalue['min'])
                  );
                }
                if (JSONvalue['max']) {
                  validationsArray.push(
                    Validators.max(JSONvalue['max'])
                  );
                }
                if (JSONvalue['maxLength']) {
                  validationsArray.push(
                    Validators.maxLength(JSONvalue['maxLength'])
                  );
                }
                if (JSONvalue['minLength']) {
                  validationsArray.push(
                    Validators.minLength(JSONvalue['minLength'])
                  );
                }
                if (JSONvalue['email'] === "true") {
                  validationsArray.push(
                    Validators.email
                  );
                }
                if (JSONvalue['pattern']) {
                  validationsArray.push(
                    Validators.pattern(JSONvalue['pattern'])
                  );
                }
                // });
                if (res.level == "2") {
                  var z = res.field_name
                  // this.newbody = {
                  //   z:{}
                  // }
                  this.newbody[z] = {}
                  this.instrumentdata = res.instruments.split(",")

                  this.instrumentdata.forEach((result: any) => {
                    if (res.field_value) {
                      this.instrumentvalues = JSON.parse(res.field_value)[result + "_" + res.field_name]
                    } else {
                      this.instrumentvalues = ""
                    }
                    this.tickets[result + "_" + res.field_name] = new FormControl(this.instrumentvalues, validationsArray);
                  })
                }
                // this.controls['Mid'] = new FormControl(this.dynamicForm.controls['Mid'].value)
                if (res.datatype == 'select') {
                  this.selectdata = JSON.parse(res.length)
                }
                if (res.field_value == undefined || res.field_value == null || res.field_value == "undefined" || res.field_value == "null") {
                  this.fieldvalues = ""
                } else {
                  if (res.field_value) {
                    this.fieldvalues = res.field_value.replaceAll('\\', '').replaceAll('\"', '').replaceAll('"', '')
                  }
                }
                this.controls[res.field_name] = new FormControl(this.fieldvalues, validationsArray);
              })


              this.dynamicForm = new FormGroup(
                {
                  ...this.controls,
                  // mcc: new FormControl(''),
                  // riskType: new FormControl(''),
                }
                // this.tickets

              );
              this.dynamicNewForm = new FormGroup(
                //this.controls,
                this.tickets
              );
              if (!(this.permissions.includes('Add New') || this.permissions.includes('Edit'))) {
                this.MerchantForm.disable({
                  onlySelf: true,
                  emitEvent: true
                });
                this.dynamicForm.disable({
                  onlySelf: true,
                  emitEvent: true
                })
                this.dynamicNewForm.disable({
                  onlySelf: true,
                  emitEvent: true
                })
                // document.getElementById('mcc')?.removeAttribute('enabled')
                document.getElementById('mcc')?.setAttribute('disabled', '')
                this.mccSelect.readonly = true;
                this.rsk.readonly = true;
                // document.getElementById('riskType')?.removeAttribute('enabled')
                document.getElementById('riskType')?.setAttribute('disabled', '')
              }

            })

        })
  }

  // resetform(event: any) {
  //   this.dynamicForm.controls['Mid'].setValue(event.target.value)

  // }

  async onSubmit(mid: any) {
    if (!(mid)) {
      return
    }
    const mccCategory$ = this.getMccOptions()
    this.mccOptions = await lastValueFrom(mccCategory$);

    // const riskOptions$ = this.getRiskTypeOptions()
    // this.riskTypeOptions = await lastValueFrom(riskOptions$);

    console.log("mccOptions--->", this.mccOptions)

    this.instrumentvalues = ""
    this.fieldvalues = ""
    // localStorage.setItem("Mid", mid.Mid)

    this.getbody = {
      "type": "3",
      "Mid": mid.Mid || this.merchantId
    };
    this.apiHttpService
      .post(
        `${API_URL}/GetRmsFiled`, this.getbody
      )
      .subscribe((data) => {
        this.mcc = data.Fields[0].mcc_code;
        console.log("mcc_code--->", data.Fields[0].mcc_code)
        console.log("mcc_code option--->", this.mccOptions.find((m: any) => m.FieldValue == this.mcc))
        const valMcc = this.mccOptions?.find((m: any) => m.FieldValue == this.mcc)
        if (valMcc) {
          this.mccSelect.select({value: valMcc?.FieldValue, label: valMcc.FieldText},)
          this.mcc = valMcc?.FieldValue
        }
        // document.getElementById("mcc")?.setAttribute('value', this.mcc)
        this.riskType = data.Fields[0].risk_type;
        const riskTyp = this.riskTypeOptions?.find((m: any) => m.FieldValue == this.riskType)
        if (riskTyp) {
          this.rsk.select({value: riskTyp?.FieldValue, label: riskTyp.FieldText},)
          this.riskType = riskTyp?.FieldValue
        }
        this.field = data;
        this.fieldData = this.field.Fields;
        let iL = 1;
        this.fieldData?.map((f: any, i: number, arr: any) => {
          // console.log("-------->In Map=======", i, iL * 2, f);
          if (i < iL * 2) {

            if (this.fieldDataModified[iL]) {
              this.fieldDataModified[iL].push(f);
            } else {
              this.fieldDataModified[iL] = [];
            }

          }
          if (i == (iL * 2 - 1)) {
            iL++;
          }
        })

        // console.log("---------+++++++++========>>>>>>", this.fieldDataModified);

        this.Beneficernce = this.field.Beneficernce;

        this.fieldData.forEach((res: any) => {
          const validationsArray: any = [];
          var JSONvalue = JSON.parse(res.Validator)
          // Object.keys(JSONvalue).forEach((val: any) => {
          //
          this.JSONvalue = JSONvalue
          console.log(":::::::::jsonvalue" + JSON.stringify(this.JSONvalue) + this.JSONvalue.maxLength)
          if (JSONvalue['required'] === "true") {
            validationsArray.push(
              Validators.required
            );
          }
          if (JSONvalue['min']) {
            validationsArray.push(
              Validators.min(JSONvalue['min'])
            );
          }
          if (JSONvalue['max']) {
            validationsArray.push(
              Validators.max(JSONvalue['max'])
            );
          }
          if (JSONvalue['maxLength']) {
            validationsArray.push(
              Validators.maxLength(JSONvalue['maxLength'])
            );
          }
          if (JSONvalue['minLength']) {
            validationsArray.push(
              Validators.minLength(JSONvalue['minLength'])
            );
          }
          if (JSONvalue['email'] === "true") {
            validationsArray.push(
              Validators.email
            );
          }
          if (JSONvalue['pattern']) {
            validationsArray.push(
              Validators.pattern(JSONvalue['pattern'])
            );
          }
          // });
          if (res.level == "2") {
            var z = res.field_name
            // this.newbody = {
            //   z:{}
            // }
            this.newbody[z] = {}
            this.instrumentdata = res.instruments.split(",")

            this.instrumentdata.forEach((result: any) => {
              if (res.field_value) {
                this.instrumentvalues = JSON.parse(res.field_value)[result + "_" + res.field_name]
              } else {
                this.instrumentvalues = ""
              }
              this.tickets[result + "_" + res.field_name] = new FormControl(this.instrumentvalues, validationsArray);
            })
          }
          // this.controls['Mid'] = new FormControl(this.dynamicForm.controls['Mid'].value)
          if (res.datatype == 'select') {
            this.selectdata = JSON.parse(res.length)
          }
          if (res.field_value == undefined || res.field_value == null || res.field_value == "undefined" || res.field_value == "null") {
            this.fieldvalues = ""
          } else {
            if (res.field_value) {
              this.fieldvalues = res.field_value.replaceAll('\\', '').replaceAll('\"', '').replaceAll('"', '')
            }
          }
          this.controls[res.field_name] = new FormControl(this.fieldvalues, validationsArray);
          console.log("field_name---->", res.field_name)
          console.log("this.fieldvalues---->", this.fieldvalues)
          console.log("validationsArray---->", validationsArray)

        });
        this.dynamicForm = new FormGroup(
          {
            ...this.controls,
            // mcc: new FormControl('',),
            // riskType: new FormControl(''),
          }
          // this.tickets

        );
        this.dynamicNewForm = new FormGroup(
          //this.controls,
          this.tickets
        )
        if (!(this.permissions.includes('Add New') || this.permissions.includes('Edit'))) {
          this.MerchantForm.disable({
            onlySelf: true,
            emitEvent: true
          });
          this.dynamicForm.disable({
            onlySelf: true,
            emitEvent: true
          })
          this.dynamicNewForm.disable({
            onlySelf: true,
            emitEvent: true
          })
          // document.getElementById('mcc')?.removeAttribute('enabled')
          // document.getElementById('mcc')?.setAttribute('disabled', '')
          console.log(this.mccSelect, "++++++++++++++++==================---------->")
          this.mccSelect.readonly = true;
          this.rsk.readonly = true;
          // document.getElementById('riskType')?.removeAttribute('enabled')
          document.getElementById('riskType')?.setAttribute('disabled', '')
        }


        // this.MerchantForm.controls['Mid'].patchValue(this.merchantId )


      })

  }

  OnlyNumbersAllowed(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    return (charCode > 47 && charCode < 58);

  }

  previousStep($event: MouseEvent) {
    this.router.navigate(['/merchants/merchant-creation/merchant-mdr'], {
      queryParams: {...this.queryParams}
    })
  }

  // nextStep($event: MouseEvent) {
  //   this.router.navigate(['/merchants/merchant-creation/merchant-kyc'], {
  //     queryParams: { ...this.queryParams}
  //   })
  // }
  statusApproval(status: number) {
    let appRequestBody;
    let responseMsg: string;
    const remarks = this.approvalForm.controls['remarks'].value;

    if (this.approvalForm.valid) {
      if (status == 1) {
        responseMsg = "Risk Successfully approved";
        appRequestBody = {
          "Mid": this.merchantId,
          "Status": "Approval",
          "Remark": remarks,
          "Approvel_type": "Risk",
          "Added_By": this.storage.getUserName().toString()
        }
      } else {
        responseMsg = "Risk Successfully rejected";
        appRequestBody = {
          "Mid": this.merchantId,
          "Status": "Approval",
          "Remark": remarks,
          "Approvel_type": "RRisk",
          "Added_By": this.storage.getUserName().toString()
        }
      }

      this.merchantService.sendApproval(appRequestBody)
        .subscribe(
          (data) => {
            if (data?.length > 0) {
              this.status = data[0]['risk_approvel'];
              if (this.status != 0)
                this.approvalForm.controls['remarks'].disable();
              this.alertService.successAlert(responseMsg)
              this.userService.getRiskRemark(this.merchantId, 'M', 'Risk')
                .subscribe((data: any) => {
                    this.remarkData = data || []
                    this.dataTable ? this.dataTable.destroy() : console.log(this.remarkData)
                    this.remarkData ? this.dataTable = new DataTable("#dataTableExample") : this.dataTable.destroy()
                    if (this.remarkData) {
                      this.remarkData.forEach((element: any) => {
                        this.dataTable.rows().add(Object.values(element));
                      })
                    }
                  }
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


    if (remarks.trim() == '') {
      this.errorRemarks = 1;
      this.alertService.errorAlert({
        text: "Please enter remarks"
      })

    }
    this.errorRemarks = 0;

  }

  removeQuotes(field_value: any) {
    return field_value.replace(/"/g, '')
  }

  getMccOptions(): any {
    let serviceprovidedata = {
      "Type": "16",
      "Value": ""
    }
    return this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`, serviceprovidedata
      )
    // .subscribe((res) => {
    //   return this.mccOptions = res
    // });
  }

  getRiskTypeOptions() {
    let serviceprovidedata = {
      "Type": "18",
      "Value": ""
    }
    this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`, serviceprovidedata
      )
      .subscribe((res) => {
        this.riskTypeOptions = res || []
      });
  }
}


