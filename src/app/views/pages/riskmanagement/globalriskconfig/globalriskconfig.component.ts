import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AlertService} from 'src/app/_services/alert.service';
import {ApiHttpService} from 'src/app/_services/api-http.service';
import {environment} from 'src/environments/environment';

const {API_URL} = environment;

@Component({
  selector: 'app-globalriskconfig',
  templateUrl: './globalriskconfig.component.html',
  styleUrls: ['./globalriskconfig.component.scss']
})
export class GlobalriskconfigComponent implements OnInit {

  controls: any = {};
  //    field = {

  //       "Fields": [
  //           {
  //               "level": "0",
  //               "datatype": "textarea",
  //               "field_label": "Pincode (Possibility to check on Pincode during Merchant Onboarding",
  //               "length": "500",
  //               "id": 1,
  //               "field_name": "pincode",
  //               "status": "1"
  //           }
  //       ]

  // }
  field: any
  name = 'Angular';
  fieldData: any
  // fields = [
  //   {
  //     type: "input",
  //     label: "Username",
  //     inputType: "text",
  //     name: "name",
  //     validations: [
  //       {
  //         name: "required",
  //         validator: "required",
  //         message: "Name Required"
  //       },
  //       {
  //         name: "pattern",
  //         validator: "^[a-zA-Z]+$",
  //         message: "Accept only text"
  //       }
  //     ]
  //   }, {
  //     type: "password",
  //     label: "Password",
  //     inputType: "text",
  //     name: "name",
  //     validations: [
  //       {
  //         name: "required",
  //         validator: "required",
  //         message: "Password Required"
  //       }
  //     ]
  //   },
  //   {
  //     type: "radio",
  //     label: "Password",
  //     inputType: "text",
  //     name: "name",
  //     validations: [
  //       {
  //         name: "required",
  //         validator: "required",
  //         message: "Password Required"
  //       }
  //     ]
  //   },
  //   {
  //     type: "checkbox",
  //     label: "Password",
  //     inputType: "text",
  //     name: "name",
  //     validations: [
  //       {
  //         name: "required",
  //         validator: "required",
  //         message: "Password Required"
  //       }
  //     ]
  //   },
  //   {
  //     type: "color",
  //     label: "Password",
  //     inputType: "text",
  //     name: "name",
  //     validations: [
  //       {
  //         name: "required",
  //         validator: "required",
  //         message: "Password Required"
  //       }
  //     ]
  //   },
  //   {
  //     type: "month",
  //     label: "Password",
  //     inputType: "text",
  //     name: "name",
  //     validations: [
  //       {
  //         name: "required",
  //         validator: "required",
  //         message: "Password Required"
  //       }
  //     ]
  //   },
  //   {
  //     type: "range",
  //     label: "Password",
  //     inputType: "text",
  //     name: "name",
  //     validations: [
  //       {
  //         name: "required",
  //         validator: "required",
  //         message: "Password Required"
  //       }
  //     ]
  //   },
  //   {
  //     type: "week",
  //     label: "Password",
  //     inputType: "text",
  //     name: "name",
  //     validations: [
  //       {
  //         name: "required",
  //         validator: "required",
  //         message: "Password Required"
  //       }
  //     ]
  //   },
  //   {
  //     type: "date",
  //     label: "Password",
  //     inputType: "text",
  //     name: "name",
  //     validations: [
  //       {
  //         name: "required",
  //         validator: "required",
  //         message: "Password Required"
  //       }
  //     ]
  //   },
  //   {
  //     type: "time",
  //     label: "Password",
  //     inputType: "text",
  //     name: "name",
  //     validations: [
  //       {
  //         name: "required",
  //         validator: "required",
  //         message: "Password Required"
  //       }
  //     ]
  //   },
  //   {
  //     type: "file",
  //     label: "Password",
  //     inputType: "text",
  //     name: "name",
  //     validations: [
  //       {
  //         name: "required",
  //         validator: "required",
  //         message: "Password Required"
  //       }
  //     ]
  //   }
  // ];
  dynamicForm: FormGroup;
  rowData: any;
  body: any = {};
  listdata: any;
  valuebody: { type: string; Mid: string; };
  isForm6Submitted: boolean = false;
  JSONvalue: any;

  constructor(private apiHttpService: ApiHttpService, private alertService: AlertService) {
    this.isForm6Submitted = false
    this.apiHttpService
      .get(
        `${API_URL}/GetBlockPin`
      )
      .subscribe((data) => (console.log("****Get", data), this.listdata = data,


          this.valuebody = {
            "type": "1",
            "Mid": "M0002"
          },
          this.apiHttpService
            .post(
              `${API_URL}/GetRmsFiled`, this.valuebody
            )
            .subscribe((data) => {

              console.log("****data", data),
                this.field = data,
                this.fieldData = this.field.Fields,


                this.fieldData.forEach((res: any) => {
                  const validationsArray: any = [];
                  if (res.Validator) {
                    var JSONvalue = JSON.parse(res.Validator)
                    this.JSONvalue = JSONvalue
                    // Object.keys(JSONvalue).forEach((val: any) => {
                    //
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
                  }

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
                  this.controls[res.field_name] = new FormControl(res.field_value, validationsArray);

                }),
                console.log(this.controls, "------------->>>>>>>"),
                this.dynamicForm = new FormGroup(
                  this.controls
                )

            })

      ))
    // this.apiHttpService
    //   .get(
    //     `${API_URL}/GetBlockPin`
    //   )
    //   .subscribe((data) => (console.log("****Get", data), this.listdata = data
    //   ))

  }

  get form6() {
    return this.dynamicForm.controls;
  }

  ngOnInit(): void {

    // this.fieldData.forEach((res:any) => {
    //   const validationsArray:any= [];
    //   // res.validations.forEach(val => {
    //   //   if (val.name === 'required') {
    //   //     validationsArray.push(
    //   //       Validators.required
    //   //     );
    //   //   }
    //   //   if (val.name === 'pattern') {
    //   //     validationsArray.push(
    //   //       Validators.pattern(val.validator)
    //   //     );
    //   //   }
    //   // });
    //   this.controls[res.field_name] = this.listdata.field_value;
    // })
    //   var body = {
    //     "type":"3",
    //     "Mid":"M00005013"
    // }
    //   this.apiHttpService
    //     .post(
    //       `${API_URL}/GetRmsFiled`,body
    //     )
    //     .subscribe((data) => (console.log("****onPageSizeChange",data),this.fieldData = data,console.log("****onPageSizeChange",this.fieldData)));

  }

  onSubmit() {

    console.log(this.dynamicForm.value);
    console.log(this.dynamicForm.value);
    var y = this.dynamicForm.value
    // this.body = {"Mid":"M000855"};
    if (this.dynamicForm.valid) {
      Object.keys(this.dynamicForm.value).forEach((element) => {

        this.body[element] = y[element];
        // this.body["Pincodes"] = y[element]
        //     this.body = {
        //       element :y[element],
        // }
      });

      this.apiHttpService
        .post(
          `${API_URL}/Create_BlockPin`, this.body
        )
        .subscribe((data) => {

          console.log("****Create_BlockPin", data.status);

          this.alertService.successAlert(
            "Configuration saved Successfully!"
          );
          // window.location.reload();
          // alert("Data Inserted Successfully!");
          this.fieldData = data;
          console.log("****onPageSizeChange", this.fieldData);
        });
    }

    this.isForm6Submitted = true
  }


  OnlyNumbersAllowed(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    return (charCode > 47 && charCode < 58);

  }
}
