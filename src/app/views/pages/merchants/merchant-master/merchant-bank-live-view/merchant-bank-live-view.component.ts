import {Component, EventEmitter, Input, OnInit} from '@angular/core';
import {environment} from 'src/environments/environment';
import {ApiHttpService} from "../../../../../_services/api-http.service";

const {API_URL} = environment;

@Component({
  selector: 'app-merchant-bank-live-view',
  templateUrl: './merchant-bank-live-view.component.html',
  styleUrls: ['./merchant-bank-live-view.component.scss']
})
export class MerchantBankLiveViewComponent implements OnInit {
  @Input() onMerchantMId: EventEmitter<any> = new EventEmitter<any>();
  @Input() merchantStatusConfig: any;
  data: any;
  bankres: any;
  col1: string[];
  col2: any;
  bankdata: any;


  constructor(private apiHttpService: ApiHttpService,) {
  }

  ngOnInit(): void {
    this.onMerchantMId.subscribe((res) => (this.data = res, this.GetYesBankResponses()))

  }


  GetYesBankResponses() {
    let yesbank = {
      "MerchantId": this.data.MerchantId,
      "SpID": this.data.SPId,
      "InstrumentId": this.data.InstrumentId
    }

    this.apiHttpService
      .post(
        `${API_URL}/GetYesBankResponse`, yesbank
      )
      .subscribe((res) => {
        this.bankres = res
      });


    this.bankdata = this.bankres.response
    this.col1 = Object.keys(this.bankres.response)
    this.col2 = Object.values(this.bankres.response)

  }

}
