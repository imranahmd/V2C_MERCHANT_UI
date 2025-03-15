import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { moreThanOneWhiteSpaceValidator } from 'src/app/common/common.validators';

import { AlertService } from 'src/app/_services/alert.service';
import { ApiHttpService } from 'src/app/_services/api-http.service';
import { environment } from 'src/environments/environment';
import { MasterService } from '../master.service';

const { API_URL } = environment;

@Component({
  selector: 'app-create-invoice',
  templateUrl: './create-invoice.component.html',
  styleUrls: ['./create-invoice.component.scss']
})
export class CreateInvoiceComponent implements OnInit {
  CreateInvoiceform: FormGroup
  isForm1Submitted: boolean;
  myDate: any;
  currentDate: any;
  currentnewDate: any = new Date();
  maxDate: any;
  loading: boolean = false;
  NotificationData: any;


  constructor(private fb: FormBuilder, private alertService: AlertService, private Masterservice: MasterService, private apiHttpService: ApiHttpService, private datePipe: DatePipe) {

    this.CreateInvoiceform = fb.group({
      Invoice: ['', [Validators.required, Validators.maxLength(20),Validators.pattern("[a-zA-Z0-9 ]+"), Validators.minLength(3)]],
      Amount: ['', [Validators.required, Validators.maxLength(10)]],
      Valid: ["", [Validators.required]],
      Remark: ["", [Validators.required, Validators.maxLength(500)]],
      Name: ["", [Validators.required, moreThanOneWhiteSpaceValidator(), Validators.pattern("[a-zA-Z][a-zA-Z ]+"), Validators.maxLength(100)]],
      Email: ["", [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]],
      Contact: ["", [Validators.required, Validators.pattern("[123456789][0-9]{9}"), Validators.minLength(10)]],
      InvoiceMail: ["", [Validators.required,]],
      InvoiceNotification: ["", [Validators.required,]],


    },
    );

  }

  get form1() {
    return this.CreateInvoiceform.controls;
  }

  ngOnInit(): void {
    var d = new Date();
    d.setDate(d.getDate() + 365);
    console.log(d)
    this.maxDate = this.datePipe.transform(d, 'yyyy-MM-dd')
    var mid = localStorage.getItem("user")
    var data = { "Merchant_id": mid }

    this.isForm1Submitted = false;
    this.loading = false;
    this.Masterservice.getDisableSMSAndMail(data)
      // .post(
      //   `${API_URL}/CreateInvoice`,invoiceData
      // )
      .subscribe((data: any) => {
        this.NotificationData = data.result.map;
        if (data.result.map.smsNotification == "0") {
          this.CreateInvoiceform.controls.InvoiceNotification.clearValidators()
          this.CreateInvoiceform.controls.InvoiceNotification.updateValueAndValidity()
        }
        if (data.result.map.mailNotification == "0") {
          this.CreateInvoiceform.controls.InvoiceMail.clearValidators()
          this.CreateInvoiceform.controls.InvoiceMail.updateValueAndValidity()
        }


        this.CreateInvoiceform.patchValue({
          InvoiceNotification: data.result.map.smsNotification,
          InvoiceMail: data.result.map.mailNotification,

        })
      })


  }

  onSubmit(form: any) {


    var date = new Date();
    this.myDate = this.datePipe.transform(form.Valid, 'dd-MM-yyyy');
    //this.currentDate = new Date();
    this.currentDate = this.datePipe.transform(date, 'yyyy-MM-dd hh:mm:ss');
    if (this.CreateInvoiceform.valid) {
      let invoiceData = {
        "invoice_no": form.Invoice,
        "amount": form.Amount,
        "date_time": this.currentDate,
        "valid_upto": this.myDate,
        "cust_name": form.Name,
        "email_id": form.Email,
        "contact_number": form.Contact,
        "remarks": form.Remark,
        "status": "0",
        "CreatedOn": this.currentDate,
        "CreatedBy": localStorage.getItem("user"),
        "merchant_id": localStorage.getItem("user"),
        "ModifiedOn": this.currentDate,
        "ModifiedBy": localStorage.getItem("user"),
        "Mail_Notification": form.InvoiceMail,
        "SMS_Notification": form.InvoiceNotification
        // localStorage.getItem("user")
      }
      this.loading = true
      document?.getElementById('loading')?.classList.add("spinner-border")
      document?.getElementById('loading')?.classList.add("spinner-border-sm")
      this.Masterservice.getinvoicestatus(invoiceData)
        // .post(
        //   `${API_URL}/CreateInvoice`,invoiceData
        // )
        .subscribe((data) => {

          let res = data
          if (res.Status == "success") {
            this.alertService.successAlert(data.Reason)
          } else {
            this.alertService.errorAlert({ html: data.Reason })

          }
          this.loading = false
          document?.getElementById('loading')?.classList.remove("spinner-border")
          document?.getElementById('loading')?.classList.remove("spinner-border-sm")
          this.CreateInvoiceform.reset()
          this.isForm1Submitted = false;
          this.CreateInvoiceform.controls['InvoiceMail'].setValue("")
          this.CreateInvoiceform.controls['InvoiceNotification'].setValue("")

        });

    }


    this.isForm1Submitted = true;// console.log(form)


  }


  reset() {
    this.loading = false
    document?.getElementById('loading')?.classList.remove("spinner-border")
    document?.getElementById('loading')?.classList.remove("spinner-border-sm")
    this.CreateInvoiceform.reset();
    this.CreateInvoiceform.controls['Invoice'].setValue("")
    this.CreateInvoiceform.controls['Amount'].setValue("")
    this.CreateInvoiceform.controls['Valid'].setValue("")
    this.CreateInvoiceform.controls['Remark'].setValue("")
    this.CreateInvoiceform.controls['Name'].setValue("")
    this.CreateInvoiceform.controls['Email'].setValue("")
    this.CreateInvoiceform.controls['Contact'].setValue("")
    this.CreateInvoiceform.controls['InvoiceMail'].setValue("")
    this.CreateInvoiceform.controls['InvoiceNotification'].setValue("")


  }

  OnlyNumbersAllowed(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    return (charCode > 47 && charCode < 58);

  }

  OnlyCharacterNumberAllowed(event: { which: any; keyCode: any; }): boolean {

    const charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode >= 48 && charCode <= 57) || (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122)) {
      // console.log('charCode restricted is' + charCode)
      return true;
    }
    return false;
  }

  fun(id: any) {

    document?.getElementById(id)?.classList.add("hey")
  }

  funover(id: any) {

    document?.getElementById(id)?.classList.remove("hey")
  }


}
