import {Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import {ApiHttpService} from 'src/app/_services/api-http.service';
import {environment} from 'src/environments/environment';

const {API_URL} = environment;

@Injectable({
  providedIn: 'root'
})
export class GeneralService {

  constructor(private apiHttpService: ApiHttpService) {
  }

  getTxnAmtVolume(data: any) {
    return this.apiHttpService
      .post(
        `${API_URL}/TxnAmtVolume`, data
      )
  }
  showprofile(data:any): Observable<any>{
    
    return this.apiHttpService
      .post(
        `${API_URL}/get-merchantbank`, data
      )
  }
  businessdetails(data:any){
    return this.apiHttpService
    .post(
      `${API_URL}/MerchantCreationDetails`, data
    )
  }

  // getMerchant(){
  //   return this.apiHttpService
  //   .post(
  //     `${API_URL}/TxnAmtVolume`,
  //     {
  //       "Type": "1",
  //       "Value": ""
  //     }
  //   )

  // }
  // getReseller(){
  //   return this.apiHttpService
  //   .post(
  //     `${API_URL}/TxnAmtVolume`,
  //     {
  //       "Type": "2",
  //       "Value": ""
  //     }
  //   )

}

// }
