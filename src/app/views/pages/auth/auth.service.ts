import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from "../../../../environments/environment";
import {ApiHttpService} from "../../../_services/api-http.service";
import { StorageService } from '../../../_services/storage.service';
import { Router } from '@angular/router';

const {API_URL} = environment;
const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
};


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private apiHttpService: ApiHttpService, private storageService: StorageService, private router: Router) {
  }

  login(username: string, password: string): Observable<any> {
    return this.apiHttpService.post(
      API_URL + '/token',
      {
        username,
        password,
      },
      httpOptions
    );
  }

  forgotPassword(username: string): Observable<any>{
    return this.apiHttpService.post(
      API_URL + '/forgetPassword',
      {
        userId: username,
      },
      httpOptions
    );
  }

  resetPassword(token: string, password: string): Observable<any>{
    return this.apiHttpService.post(
      API_URL + '/reset-password',
      {
        token,
        password
      },
      httpOptions
    );
  }

  resetPasswordLogin(currentPassword: string, newPassword: string): Observable<any>{
    return this.apiHttpService.post(
      API_URL + '/reset-password-internal',
      {
        "oldpassword":currentPassword,
        "newpassword":newPassword
      },
      httpOptions
    );
  }

  getProfile(): Observable<any>{
    return this.apiHttpService.get(
      // API_URL + '/GetDetails',
      API_URL + '/GetDetailsApi',
      httpOptions
    );
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.apiHttpService.post(
      API_URL + 'auth/register',
      {
        username,
        email,
        password,
      },
      httpOptions
    );
  }
  getTypeMenus(RoleID:any){
    let riskcodelist = {
      "Type": "44",
      "Value": RoleID.toString()
    }
   return this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`, riskcodelist
      )
  
  }
  logout(){
    // e.preventDefault();
    this.storageService.clean()

    if (!this.storageService.isLoggedIn()) {
      this.router.navigate(['/auth/login'])
      .then(() => {
        window.location.reload();
      });;
    }
    // return this.apiHttpService.post(API_URL + 'auth/signout', {}, httpOptions);
  }
}
