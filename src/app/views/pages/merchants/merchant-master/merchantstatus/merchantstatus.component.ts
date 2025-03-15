import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {environment} from "../../../../../../environments/environment";
import {ApiHttpService} from "../../../../../_services/api-http.service";
import {AlertService} from 'src/app/_services/alert.service';
import {MerchantService} from '../merchant.service';

const {API_URL} = environment;

@Component({
  selector: 'app-merchantstatus',
  templateUrl: './merchantstatus.component.html',
  styleUrls: ['./merchantstatus.component.scss']
})
export class MerchantstatusComponent implements OnInit {

  @Output() closeModal: EventEmitter<any> = new EventEmitter<any>();
  merchatstatusform: FormGroup;
  isForm1Submitted: boolean;
  @Input() merchantStatusConfig: any;
  @Input() onMerchantMId: EventEmitter<any> = new EventEmitter<any>();
  data: any;
  Resdata: any;
  merchantId: any
  datetype: boolean = false;
  status: any;

  constructor(private merchantService: MerchantService, private alertService: AlertService, private services: ApiHttpService, private formbuilder: FormBuilder) {

    this.data = this.merchantStatusConfig
    this.merchatstatusform = formbuilder.group({
      Status: [""],
      Remark: ["", Validators.required],
    })
  }

  get form1() {
    return this.merchatstatusform.controls;
  }

  ngOnInit(): void {
    //
    this.merchantStatusDropdown();

    this.onMerchantMId.subscribe((res) => (
      this.merchantId = res,
        this.merchantId.Status == 'Suspended' ? this.datetype = true : this.datetype = false,
        this.merchantId.Status == 'Suspended' ? this.merchatstatusform.controls["Status"].setValidators([Validators.required]) : this.merchatstatusform.controls["Status"].clearValidators(),
        this.merchantId.Status == 'Suspended' ? this.merchatstatusform.controls["Status"].updateValueAndValidity() : this.merchatstatusform.controls["Status"].updateValueAndValidity()
    ))
    this.isForm1Submitted = false;
  }

  MerchantStatus(formvalue: any) {
    //
    if (this.merchatstatusform.valid) {
      // let data = {
      //   "Mid": this.merchantId,
      //   "Status": formvalue.Status,
      //   "Remark": formvalue.Remark,
      // }
      this.merchantId['Remark'] = formvalue.Remark
      this.merchantId['Date'] = formvalue.Status || ''

      this.services
        .post(
          `${API_URL}/ChangeMerchantStatus`, this.merchantId
        )
        .subscribe((data) => (
          this.reset(),
            data ? this.alertService.successAlert('Merchant ' + this.merchantId.Status) : this.alertService.simpleAlert('Data not Inserted'),
            this.closeModal.emit({
              showModal: false
            })
        ));

    }
    this.isForm1Submitted = true;
  }


  merchantStatusDropdown() {
    let postdata = {
      "Type": "8",
      "Value": "merchant_status"
    }

    return this.services
      .post(
        `${API_URL}/GetDropdown`, postdata
      )
      .subscribe((res) => (this.Resdata = res));
  }

  reset() {
    this.merchatstatusform.reset(); // Reset form data
    this.merchatstatusform.markAsUntouched(); // Reset form data
  }


}
