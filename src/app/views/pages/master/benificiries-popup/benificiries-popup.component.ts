import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, PatternValidator, Validators } from '@angular/forms';
import { ModalComponent } from 'src/app/common/modal/modal.component';
import { MasterService } from '../master.service';
import { AlertService } from 'src/app/_services/alert.service';
import { moreThanOneWhiteSpaceValidator } from 'src/app/common/common.validators';

@Component({
  selector: 'app-benificiries-popup',
  templateUrl: './benificiries-popup.component.html',
  styleUrls: ['./benificiries-popup.component.scss']
})
export class BenificiriesPopupComponent implements OnInit {
  @Input() merchantStatusConfig: any;
  @Output() closeModal: EventEmitter<any> = new EventEmitter<any>();
  @Input() onMerchantAdd: EventEmitter<any> = new EventEmitter<any>();
  @Input() onMerchantMId: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('modalDelete') private modalDeleteComponent: ModalComponent
  serviceForm: FormGroup
  resdata: any;
  isForm1Submitted: boolean = false;
  highlight: boolean;
  loading: boolean;
  res: string;
  ID: any;
  getbankdata: any;
  constructor(private fb: FormBuilder, private masterservice: MasterService, private alertService: AlertService,) {
    this.serviceForm = fb.group({
      AccountNumber: ['', [Validators.required, Validators.maxLength, Validators.minLength]],
      RetypeAccountNumber: ['', [Validators.required, Validators.maxLength, Validators.minLength]],
      IFSCCode: ['', [Validators.required, new PatternValidator, Validators.pattern]],
      BankName:['', [Validators.required, Validators.pattern]],
      AccountHolder: [, [Validators.required, Validators.maxLength, moreThanOneWhiteSpaceValidator()]],

      Mobileno: [, [Validators.required, Validators.maxLength, Validators.pattern("[123456789][0-9]{9}")]],
      EMAILID: ['', [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]],
    


    })
  }

  ngOnInit(): void {

    debugger
    this.serviceProviderDropdown()
    this.serviceForm

    // this.getBankList()
    // this.onMerchantAdd.subscribe((res: any) => {
    //   debugger
    //   this.res = ''

    //   this.resetForm()
    //   // document?.getElementById('Banks')?.classList.remove("hello")
    //   // document?.getElementById('Instruments')?.classList.remove("hello")

    // })
    // this.onMerchantMId.subscribe((res: any) => {
    //   debugger
    //   this.res = res

    //   var e = {
    //     "target": { 'value': "" }
    //   }
    //   var x = {
    //     "target": { 'value': "" }
    //   }
    //   this.serviceProviderDropdown()
    //   // this.getBankList()
    //   // this.selectinstrument(x)
    //   if (res) {
    //     this.setValues(res)

    //     this.serviceForm.controls['Instruments'].setValue(res.instrumentIds)
    //     this.serviceForm.controls['Banks'].setValue(res.bankIds)

    //   }

    // })
  }

  setValues(res: any) {
    debugger
    debugger
    this.ID = res.sp_id
    this.serviceForm.patchValue({
      // mid: res.mid,
      serviceProviderName: res.sp_name,
      serviceClassInvoker: res.sp_class_invoker,
      Instruments: res.TEXT_SEPERATOR,
      Banks: res.api_key,
      MasterMID: res.master_mid,
      MasterTID: res.master_tid,
      APIKey: res.api_key,
      UDF1: res.udf_1,
      UDF2: res.udf_2,
      UDF3: res.udf_3,
      UDF4: res.udf_4,
      UDF5: res.udf_5,
      RefundProcessor: res.refund_processor,
      CutOffTime: res.cutoff


    })

  }

  resetForm() {
    debugger
    this.serviceForm.patchValue({
      // mid: res.mid,
      serviceProviderName: '',
      serviceClassInvoker: '',
      Instruments: null,
      Banks: null,
      MasterMID: '',
      MasterTID: '',
      APIKey: '',
      UDF1: '',
      UDF2: '',
      UDF3: '',
      UDF4: '',
      UDF5: '',
      RefundProcessor: '',
      CutOffTime: ''

    })

    this.isForm1Submitted = false
    this.serviceForm.controls['Instruments'].clearValidators()
    this.serviceForm.controls['Instruments'].updateValueAndValidity()
    this.serviceForm.controls['Banks'].clearValidators()
    this.serviceForm.controls['Banks'].updateValueAndValidity()
    // document?.getElementById('Banks')?.classList.add("hi")
    // document?.getElementById('Instruments')?.classList.add("hi")
    // $("Banks").removeClass("hello");
    // $("Instruments").removeClass("hello");
  }



  serviceProviderDropdown() {
    debugger
    let data = {

      "Type": "3",
      "Value": ""

    }
    this.masterservice.getbenificiry(data).subscribe((res: any) => {
      this.resdata = res
    })
  }
  

 

  onGenerate() {
    debugger
    var formvalue= this.serviceForm.value
    // this.serviceForm.controls['AccountNumber'].setValidators([])
    // this.serviceForm.controls['RetypeAccountNumber'].updateValueAndValidity()
    // this.serviceForm.controls['IFSCCode'].setValidators([Validators.required, Validators.maxLength(50)])
    // this.serviceForm.controls['AccountHolder'].updateValueAndValidity()
    // this.serviceForm.controls['Mobileno'].updateValueAndValidity()
    // this.serviceForm.controls['EMAILID'].updateValueAndValidity()
    // // this.serviceForm.controls['EMAIL-ID'].updateValueAndValidity()
    // this.serviceForm.controls['ID'].updateValueAndValidity()

    setTimeout(() => {
      if (this.serviceForm.valid) {
        this.loading = true
        document?.getElementById('gloading')?.classList.add("spinner-border")
        document?.getElementById('gloading')?.classList.add("spinner-border-sm")
        //  this.merchantId = this.merchantId || formvalue.merchantId
        //this.merchantId = formvalue.merchantId
        var merchantdata: any = {}
        if (!this.res) {
          merchantdata =
          {
            "merchant_id":localStorage.getItem('user'),
            "account_num":formvalue.AccountNumber,
            "retype_accountnum":formvalue.RetypeAccountNumber,
            "ifsc_code":formvalue.IFSCCode,
            "bank_name":formvalue.BankName,
            "account_holder":formvalue.AccountHolder,
            "mobile_no":formvalue.Mobileno,
            "email_id":formvalue.EMAILID
            
           
         
              // "merchant_id":"M00005353",
              // "account_num":formvalue.AccountNumber,
              // "retype_accountnum":formvalue.RetypeAccountNumber,
              // "ifsc_code":formvalue.IFSCCode,
              // "bank_name":formvalue.BankName,
              // "account_holder":formvalue.AccountHolder,
              // "mobile_no":formvalue.Mobileno,
              // "email_id":formvalue.EMAILID,
            
          }

          this.masterservice. getbenificiry(merchantdata).subscribe((res: any) => {

            this.loading = false
            document?.getElementById('gloading')?.classList.remove("spinner-border")
            document?.getElementById('gloading')?.classList.remove("spinner-border-sm")
            if (res[0].RespStatus == 'true') {
              this.alertService.successAlert(res[0].RespMassge)
              this.closeModal.emit({
                showModal: false
              });
            }
            else
            {
            this.alertService.errorAlert({html:res[0].RespMassge})
            }

          })


        }
      


      }

      else {
        if (this.serviceForm.controls['Instruments'].invalid) {
          document?.getElementById('Instruments')?.classList.add("hello")
        }

        else {
          document?.getElementById('Instruments')?.classList.remove("hello")
        }

        if (this.serviceForm.controls['Banks'].invalid) {
          document?.getElementById('Banks')?.classList.add("hello")
        }

        else {
          document?.getElementById('Banks')?.classList.remove("hello")
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
      // document?.getElementById(this.findInvalidControls()[0])?.focus();
      // console.log("hhhhhh" + this.findInvalidControls()[0].toString())
      // document.getElementsByClassName('ng-invalid')?.focus();
      setTimeout(() => {
        this.highlight = true;

      }, 1000);
    }, 0);

  }

  async closeModelAction($event: Event) {
    await this.modalDeleteComponent.dismiss();
    // this.refreshGrid(this.merchantId);
  }

  OnlyCharacterNumberAllowed(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode >= 48 && charCode <= 57) || (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122) || (charCode == 32)) {
      // console.log('charCode restricted is' + charCode)
      return true;
    }
    return false;
  }

  NoDoubleSpace(event: any) {
    debugger
    var val = event.target.value
    var len = event.target.value.length

    const charCode = (event.which) ? event.which : event.keyCode;
    if ((val.charCodeAt(len - 1) === charCode) && (len > 0) && (charCode == 32)) {
      return false
    }
    return true;
    // this.elementRef.nativeElement.querySelector('my-element')
  }
  NoSpaceAllowed(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode == 32) {
      return false
    } else {
      return true
    }

  }
  upperCase($event: Event): void {
    // this.IFSCValue = this.IFSCValue.toUpperCase();
  }
  OnlyCharacterAllowed(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122) || (charCode == 32)) {
      // console.log('charCode restricted is' + charCode)
      return true;
    }
    return false;
  }
  OnlyNumbersAllowed(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    return (charCode > 47 && charCode < 58) || charCode == 46;

  }

}

