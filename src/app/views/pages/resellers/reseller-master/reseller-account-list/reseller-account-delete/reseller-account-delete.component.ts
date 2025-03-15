import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ApiHttpService} from "../../../../../../_services/api-http.service";
import {environment} from "../../../../../../../environments/environment";

const {API_URL} = environment

@Component({
  selector: 'app-reseller-account-delete',
  templateUrl: './reseller-account-delete.component.html',
  styleUrls: ['./reseller-account-delete.component.scss']
})
export class ResellerAccountDeleteComponent implements OnInit {

  @Input() deleteConfig: any;
  @Output() closeModal: EventEmitter<any> = new EventEmitter<any>();
  data: any;

  constructor(private modalService: NgbModal, private apiHttpService: ApiHttpService,) {
    this.data = this.deleteConfig

  }

  ngOnInit(): void {

  }


  DeleteAccount(ID: any) {
    let data = {
      "Pid": ID.id
    }

    return this.apiHttpService
      .post(
        `${API_URL}/delete-merchantbank-byid`, data
      )
      .subscribe((data) => (console.log("****onGridReady"), this.closeModal.emit(true)));

  }

}
