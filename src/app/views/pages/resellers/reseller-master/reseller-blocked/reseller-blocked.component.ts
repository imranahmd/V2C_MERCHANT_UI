import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {environment} from "../../../../../../environments/environment";
import {ApiHttpService} from "../../../../../_services/api-http.service";
import {AlertService} from "../../../../../_services/alert.service";
import {StorageService} from 'src/app/_services/storage.service';

const {API_URL} = environment;

@Component({
  selector: 'app-reseller-blocked',
  templateUrl: './reseller-blocked.component.html',
  styleUrls: ['./reseller-blocked.component.scss']
})
export class ResellerBlockedComponent implements OnInit {
  @Output() closeModal: EventEmitter<any> = new EventEmitter<any>();
  merchatstatusform: FormGroup;
  isForm1Submitted: boolean;
  @Input() resellerStatusConfig: any;
  @Input() onResellerMId: EventEmitter<any> = new EventEmitter<any>();
  data: any;
  Resdata: any;
  resellerId: any
  loading: boolean = false;

  constructor(private services: ApiHttpService, private storage: StorageService, private formbuilder: FormBuilder, private alertService: AlertService) {

    this.data = this.resellerStatusConfig
    this.merchatstatusform = formbuilder.group({
      Status: ["", Validators.required],
      Remark: ["", Validators.required],
    })
  }

  get form1() {
    return this.merchatstatusform.controls;
  }

  ngOnInit(): void {
    this.resellerStatusDropdown();

    this.onResellerMId.subscribe((res) => (console.log("data=========>",
      this.merchatstatusform.controls['Status'].setValue(''),
      this.loading = false,
      this.reset(),
      this.isForm1Submitted = false,
      this.resellerId = res)))

  }

  ResellerStatus(formvalue: any) {
    if (this.merchatstatusform.valid) {
      let data = {
        "Rid": this.resellerId,
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
          `${API_URL}/ChangeResellerStatus`, data
        )
        .subscribe((data) => {
          if (data.length > 0) {
            if (data[0].status != "false") {
              this.alertService.successAlert(
                "Status successfully updated"
              )
              this.reset();
              this.closeModal.emit({
                showModal: false
              })
            } else {
              this.alertService.errorAlert({
                html: `Can not change the status, ${data[0].Message}`
              }).then(() => {
                this.reset();
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


  resellerStatusDropdown() {

    let postdata = {
      "Type": "8",
      "Value": "reseller_status"
    }

    return this.services
      .post(
        `${API_URL}/GetDropdown`, postdata
      )
      .subscribe((res) => (console.log("****Resellerstatus"), this.Resdata = res));
  }

  reset() {
    this.merchatstatusform.reset(); // Reset form data
    this.merchatstatusform.markAsUntouched(); // Reset form data
  }

}
