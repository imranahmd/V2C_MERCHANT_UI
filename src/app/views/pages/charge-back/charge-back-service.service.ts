import { Injectable } from '@angular/core';
import {ApiHttpService} from "../../../_services/api-http.service";
import {environment} from "../../../../environments/environment";

const {API_URL} = environment;


@Injectable({
  providedIn: 'root'
})
export class ChargeBackServiceService {

  constructor(private apiHttpService: ApiHttpService) { }

  getMerchantAccountList(pageSize: number = 10, page: number = 0, data:any) {
    return this.apiHttpService
      .post(
        `${API_URL}/getChargeBackMerList`,data

      )
  }

  RaisedchargebackinsertMerchant(data:any)
  {
    return this.apiHttpService
      .post(
        `${API_URL}/RaisedchargebackinsertMerchant`,data

      )
  }


  downloadZipFile(data:any)
  {
    return this.apiHttpService
    .get(
      `${API_URL}/downloadZipFile?name=`+data, {
        responseType: 'arraybuffer'
      }
    )
  }


}
