import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {environment} from "../../../../../../environments/environment";
import {ApiHttpService} from "../../../../../_services/api-http.service";
import {AlertService} from 'src/app/_services/alert.service';
import {StorageService} from 'src/app/_services/storage.service';
import {moreThanOneWhiteSpaceValidator} from 'src/app/common/common.validators';

const {API_URL} = environment;

@Component({
  selector: 'app-merchant-blocked',
  templateUrl: './merchant-blocked.component.html',
  styleUrls: ['./merchant-blocked.component.scss']
})
export class MerchantBlockedComponent implements OnInit {
  @Output() closeModal: EventEmitter<any> = new EventEmitter<any>();
  merchatstatusform: FormGroup;
  isForm1Submitted: boolean;
  @Input() merchantStatusConfig: any;
  @Input() onMerchantMId: EventEmitter<any> = new EventEmitter<any>();
  data: any;
  Resdata: any;
  merchantId: any
  loading: boolean = false;

  constructor(private services: ApiHttpService, private alertService: AlertService, private formbuilder: FormBuilder, private storage: StorageService) {

    this.data = this.merchantStatusConfig
    this.merchatstatusform = formbuilder.group({
      Status: ["", [Validators.required]],
      Remark: ["", [Validators.required, moreThanOneWhiteSpaceValidator(), Validators.maxLength(200)]],
    })
  }

  get form1() {
    return this.merchatstatusform.controls;
  }

  ngOnInit(): void {
    this.merchantStatusDropdown();

    this.onMerchantMId.subscribe((res) => (this.merchantId = res,
        this.merchatstatusform.controls['Status'].setValue(''),
        this.loading = false,
        this.reset(),
        this.isForm1Submitted = false
    ))
  }

  MerchantStatus(formvalue: any) {
    if (this.merchatstatusform.valid) {
      let data = {
        "Mid": this.merchantId,
        "Status": formvalue.Status,
        "Remark": formvalue.Remark,
        "Approvel_type": "",
        "Added_By": this.storage.getUserName().toString()
      }
      this.loading = true
      document?.getElementById('loading')?.classList.add("spinner-border")
      document?.getElementById('loading')?.classList.add("spinner-border-sm")
      this.services
        .post(
          `${API_URL}/ChangeMerchantStatus`, data
        )
        .subscribe((data) => {
          if (data.length > 0) {
            if (data[0].status != "false") {
              this.alertService.successAlert(
                "Status successfully updated"
              )
              this.reset();
              this.isForm1Submitted = false;
              this.closeModal.emit({
                showModal: false
              })
            } else {
              this.alertService.errorAlert({
                html: `Can not change the status, ${data[0].Message}`
              }).then(() => {
                this.reset();
                this.isForm1Submitted = false;
                this.closeModal.emit({
                  showModal: false
                });
              })

            }
          }
          this.loading = false
          document?.getElementById('loading')?.classList.remove("spinner-border")
          document?.getElementById('loading')?.classList.remove("spinner-border-sm")
        });

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
    this.merchatstatusform.updateValueAndValidity(); // Reset form data
  }

}
