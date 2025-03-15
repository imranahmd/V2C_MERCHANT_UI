import {Component, EventEmitter, Input, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiHttpService} from 'src/app/_services/api-http.service';
import {environment} from 'src/environments/environment';
import {MenusService} from "../../../../../_services/menu.service";
import {Location} from "@angular/common";

const {API_URL} = environment;

@Component({
  selector: 'app-reseller-risk-config',
  templateUrl: './reseller-risk-config.component.html',
  styleUrls: ['./reseller-risk-config.component.scss']
})
export class ResellerRiskConfigComponent implements OnInit {
  @Input() ConfigData: any;
  @Input() resellerId: string;
  @Input() onConfigChange: EventEmitter<any> = new EventEmitter<any>();

  controls: any = {};
  tickets: any = {}
  field: any

  name = 'Angular';

  ResellerForm: FormGroup;
  dynamicForm: FormGroup;
  dynamicNewForm: FormGroup;
  rowData: any;
  body: any = {};
  newbody: any = {};
  fieldData: any;
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
  private permissions: any;

  constructor(private location: Location, private menuService: MenusService, private route: ActivatedRoute, private apiHttpService: ApiHttpService, private formBuilder: FormBuilder, private router: Router) {

    this.ResellerForm = this.formBuilder.group({
      Mid: [this.resellerId || '', [Validators.required]]
    })
    var URL = this.router.url
    if (URL.indexOf("reseller-master") > 0) {
      this.currentURL = false
    } else {
      this.currentURL = true

    }
  }

  ngOnInit(): void {
    const path = this.location.prepareExternalUrl(this.location.path());
    this.permissions = this.menuService.getPermissions(path);
    this.MerchnatList()
    this.ResellerForm.get('Mid')?.enable()
    this.route.queryParams.subscribe((params) => {
      this.queryParams = params;
      if (params?.mid) {
        this.resellerId = params.mid;
        this.ResellerForm.get('Mid')?.patchValue(this.resellerId);
        this.ResellerForm.get('Mid')?.disable()
        setTimeout(() => {
          this.onSubmit(this.resellerId);
        }, 1000);

      }
    })

    // this.ResellerForm = this.formBuilder.group({
    //   Mid: ['', [Validators.required]]
    // })

    this.onConfigChange.subscribe((data) => {
      this.resellerId = data;
      this.loadFieldsAndValues();


      this.ResellerForm.controls['Mid'].setValue(this.resellerId)

    })
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
        (this.Resultdata = res));


  }

  ngAfterViewInit() {
    this.ResellerForm.get('Mid')?.patchValue(this.resellerId);
    // this.ResellerForm.get('Mid')?.disable()

  }

  changeProject(event: any, control: any) {
    this.dynamicForm.controls[control].setValue(event.target.value)
  }

  onNewSubmit(mid: any) {
    var x = this.dynamicNewForm.value
    var y = this.dynamicForm.value
    Object.keys(this.dynamicForm.value).forEach((element) => {
      this.body[element] = y[element]
      //     this.body = {
      //       element :y[element],
      // }
      Object.keys(this.dynamicNewForm.value).forEach((elements, i) => {
        this.subelement = elements.split(/_(.*)/s)[1];

        if (element == this.subelement)
          this.newbody[element][elements] = x[elements];
        //     this.body = {
        //       element :y[element],
        // }
        // this.elementData = element
      });
    });

    Object.keys(this.newbody).forEach((elements, i) => {
      this.body[elements] = this.newbody[elements]
    })
    this.body["Mid"] = this.resellerId || mid.Mid;

    this.apiHttpService
      .post(
        `${API_URL}/AddRmsConfig`, this.body
      )
      .subscribe((data) => {
        alert('Data Inserted Successfully!');
        this.fieldData = data;
        this.onSubmit(this.resellerId);
      });

  }

  setvalue(dy: any, control: any, value: any) {
    this.dynamicForm.controls[control].setValue(value)
  }

  loadFieldsAndValues() {
    this.getbody = {
      "type": "3",
      "Mid": this.resellerId.toString()
    },
      this.apiHttpService
        .post(
          `${API_URL}/GetRmsFiled`, this.getbody
        )
        .subscribe((data) => {
          this.field = data;
          this.fieldData = this.field.Fields;

          this.Beneficernce = this.field.Beneficernce,

            this.databody = {
              "name": this.resellerId
            }

          this.apiHttpService
            .post(
              `${API_URL}/GetConfigData`, this.databody
            )
            .subscribe((data) => {
              this.fieldResponse = data;

              this.fieldData.forEach((res: any) => {
                const validationsArray: any = [];
                // res.validations.forEach(val => {
                //   if (val.name === 'required') {
                //     validationsArray.push(
                //       Validators.required
                //     );
                //   }
                //   if (val.name === 'pattern') {
                //     validationsArray.push(
                //       Validators.pattern(val.validator)
                //     );
                //   }
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
                this.controls,
                // this.tickets

              );
              this.dynamicNewForm = new FormGroup(
                //this.controls,
                this.tickets
              );


            })

        })
  }

  // resetform(event: any) {
  //   this.dynamicForm.controls['Mid'].setValue(event.target.value)

  // }

  onSubmit(mid: any) {
    if (!(mid)) {
      return
    }
    this.instrumentvalues = ""
    this.fieldvalues = ""
    // localStorage.setItem("Mid", mid.Mid)

    this.getbody = {
      "type": "3",
      "Mid": mid.Mid || this.resellerId
    },
      this.apiHttpService
        .post(
          `${API_URL}/GetRmsFiled`, this.getbody
        )
        .subscribe((data) => (this.field = data, this.fieldData = this.field.Fields,
            this.Beneficernce = this.field.Beneficernce,


            this.fieldData.forEach((res: any) => {
              const validationsArray: any = [];
              // res.validations.forEach(val => {
              //   if (val.name === 'required') {
              //     validationsArray.push(
              //       Validators.required
              //     );
              //   }
              //   if (val.name === 'pattern') {
              //     validationsArray.push(
              //       Validators.pattern(val.validator)
              //     );
              //   }
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
            }),

            this.dynamicForm = new FormGroup(
              this.controls,
              // this.tickets

            ),
            this.dynamicNewForm = new FormGroup(
              //this.controls,
              this.tickets
            )

          // this.ResellerForm.controls['Mid'].patchValue(this.resellerId )

        ))
  }


  previousStep($event: MouseEvent) {
    this.router.navigate(['/resellers/reseller-creation/reseller-mdr'], {
      queryParams: {...this.queryParams}
    })
  }

  // nextStep($event: MouseEvent) {
  //   this.router.navigate(['/resellers/reseller-creation/reseller-kyc'], {
  //     queryParams: { ...this.queryParams}
  //   })
  // }
}


