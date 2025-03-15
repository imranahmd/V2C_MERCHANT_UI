import {Injectable} from '@angular/core';
import {ApiHttpService} from 'src/app/_services/api-http.service';
import {environment} from 'src/environments/environment';

const {API_URL} = environment;


@Injectable({
  providedIn: 'root'
})

export class MasterService {


  constructor(private apiHttpService: ApiHttpService) {
  }


  getinvoicestatus(data: any) {

    return this.apiHttpService
      .post(
        `${API_URL}/CreateInvoice`, data
      )
  }

  getDisableSMSAndMail(data: any) {

    return this.apiHttpService
      .post(
        `${API_URL}/DisableSMSAndMail`, data
      )
  }
  getbenificirylist(data: any) {

    return this.apiHttpService
      .post(
        `${API_URL}/GetBaneDetails`, data
      )
  }
  getbenificiry(data: any) {

    return this.apiHttpService
      .post(
        `${API_URL}/AddBeneDeatails`, data
      )
  }

}
