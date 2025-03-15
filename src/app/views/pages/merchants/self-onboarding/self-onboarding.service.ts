import {Injectable} from "@angular/core";
import {ApiHttpService} from "../../../../_services/api-http.service";
import { environment } from "../../../../../environments/environment";
const { API_URL } = environment

interface GetOtp{
  fullName: String,
  mobile: String,
  emailId: String,
}

interface ValidateOtp{
  mobileOTP: Number,
  emailOTP?: Number,
}

interface RegData{
  token: String,
  password?: String,
}
interface Registration{
  newpassword: String,
}
@Injectable({
  providedIn: 'root'
})
export class SelfOnboardingService{
  constructor(private apiService: ApiHttpService) {
  }

  getOtp(data: GetOtp){
    return this.apiService.post(
      `${API_URL}/get-Signup`,
      data
    )
  }

  validateOpt(otpData: ValidateOtp){
    return this.apiService.post(
      `${API_URL}/verified-OTP`,
      otpData
    )
  }

  completeRegistration(regData: RegData ){
    return this.apiService.post(
      `${API_URL}/create-passwordSelf`,
      {newpassword: regData.password},
      { 'headers':{ 'Authorization': `Bearer ${regData.token}`}}
    )
  }
}
