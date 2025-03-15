import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import {environment} from "../../environments/environment";
import {ApiHttpService} from "./api-http.service";

const {API_URL} = environment;

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: ApiHttpService) {
  }

  getUserProfile(): Observable<any> {
    return this.http.get(API_URL + '/GetDetails', {});
  }
  getUserProfileNew(): Observable<any> {
    return this.http.get(API_URL + '/GetDetailsApi', {});
  }
  getTypeMenus(RoleID:any){
    let riskcodelist = {
      "Type": "44",
      "Value": RoleID.toString()
    }
   return this.http
      .post(
        `${API_URL}/GetDropdown`, riskcodelist
      )
  
  }
  getRiskRemark(mid:any,type:any,apptpye:any){
   var data=  {
      "Type":"1",
      "ModuleType":type,
      "merchant_id":mid,
      "AppType":apptpye
   }
   return this.http.post(API_URL + '/GetRemarks', data);
  }
}
