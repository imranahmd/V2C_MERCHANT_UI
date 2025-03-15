import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "../../environments/environment";
import { ApiHttpService } from "./api-http.service";

const API_URL = 'https://pg.payfi.co.in/Api';

@Injectable({
  providedIn: 'root'
})
export class ProvidersService {
  Requestbody: any;
  random3 = Math.floor(Math.random() * 10000000000 + 1);
  random4 = Math.floor(Math.random() * 10000000000 + 1);
  today = new Date();
  referenceId = this.today.getFullYear().toString() + "-" + ("0" + (this.today.getMonth() + 1)).slice(-2) + ("0" + this.today.getDate()).slice(-2) + "-" + this.random3.toString().slice(-4) + "-" + this.random4.toString().slice(-4);
  provider: any;

  constructor(private apiHttpService: ApiHttpService) {
  }

  BankValidate(data: any, source: any) {

    this.random3 = Math.floor(Math.random() * 10000000000 + 1);
    this.random4 = Math.floor(Math.random() * 10000000000 + 1);
    this.today = new Date();
    this.referenceId = this.today.getFullYear().toString() + "-" + ("0" + (this.today.getMonth() + 1)).slice(-2) + ("0" + this.today.getDate()).slice(-2) + "-" + this.random3.toString().slice(-4) + "-" + this.random4.toString().slice(-4);
    this.provider = data.serviceprovider || source
    if (data.serviceprovider == "DECENTRO" || source == "DECENTRO") {
      this.Requestbody = {
        "reference_id": this.referenceId,
        "purpose_message": "This is a penny drop transaction",
        "transfer_amount": "1",
        "beneficiary_details": {
          "name": data.account_holder,
          "mobile_number": data.mobile_number||data.mobileNo,
          "email_address": data.email_address||data.emailId,
          "account_number": data.accountNumber,
          "ifsc": data.ifscCode
        }
      }
    } else {
      if (data.serviceprovider == "KARZA" || source == "KARZA") {
        this.Requestbody = {
          "consent": "Y",
          "ifsc": data.ifscCode,
          "accountNumber": data.accountNumber
        }
      } else {
        this.Requestbody = {}
      }

    }

    return this.apiHttpService
      .post(
        `${API_URL}/bankAccount/validate?source=` + this.provider, this.Requestbody
      )
  }

  PANValidate(data: any) {
    this.random3 = Math.floor(Math.random() * 10000000000 + 1);
    this.random4 = Math.floor(Math.random() * 10000000000 + 1);
    this.today = new Date();
    this.referenceId = this.today.getFullYear().toString() + "-" + ("0" + (this.today.getMonth() + 1)).slice(-2) + ("0" + this.today.getDate()).slice(-2) + "-" + this.random3.toString().slice(-4) + "-" + this.random4.toString().slice(-4);

    if (data.serviceprovider == "DECENTRO") {
      this.Requestbody =
      {
        "reference_id": this.referenceId,
        "document_type": "PAN",
        "id_number": data.pan,
        "consent": "Y",
        "consent_purpose": "For bank account purpose only"
      }
    } else {
      this.Requestbody =
      {
        "pan": data.pan,
        "consent": "Y"
      }
    }
    return this.apiHttpService
      .post(
        `${API_URL}/kyc/validate?source=` + data.serviceprovider, this.Requestbody
      )
  }
  GSTValidate(data: any) {
    this.random3 = Math.floor(Math.random() * 10000000000 + 1);
    this.random4 = Math.floor(Math.random() * 10000000000 + 1);
    this.today = new Date();
    this.referenceId = this.today.getFullYear().toString() + "-" + ("0" + (this.today.getMonth() + 1)).slice(-2) + ("0" + this.today.getDate()).slice(-2) + "-" + this.random3.toString().slice(-4) + "-" + this.random4.toString().slice(-4);

    if (data.serviceprovider == "DECENTRO") {
      this.Requestbody =
      {
        "reference_id": this.referenceId,
        "document_type": "GSTIN",
        "id_number": data.gstin,
        "consent": "Y",
        "consent_purpose": "For bank account purpose only"
      }
    } else {
      this.Requestbody =
      {
        "consent": "Y",
        "gstin": data.gstin
      }
    }
    return this.apiHttpService
      .post(
        `${API_URL}/kyc/validate?source=` + data.serviceprovider, this.Requestbody
      )
  }
  CINValidate(data: any) {
    this.random3 = Math.floor(Math.random() * 10000000000 + 1);
    this.random4 = Math.floor(Math.random() * 10000000000 + 1);
    this.today = new Date();
    this.referenceId = this.today.getFullYear().toString() + "-" + ("0" + (this.today.getMonth() + 1)).slice(-2) + ("0" + this.today.getDate()).slice(-2) + "-" + this.random3.toString().slice(-4) + "-" + this.random4.toString().slice(-4);

    this.Requestbody =
    {
      "reference_id": this.referenceId,
      "document_type": "CIN",
      "id_number": data.cin,
      "consent": "Y",
      "consent_purpose": "For bank account purpose only"
    }
    return this.apiHttpService
      .post(
        `${API_URL}/kyc/validate?source=` + data.serviceprovider, this.Requestbody
      )
  }
  IFSCValidate(data: any) {
    if (data.serviceprovider == "DECENTRO") {
      this.Requestbody = {
        "ifsc": data.ifscCode
      }
    } else {
      this.Requestbody =
      {
        "consent": "Y",
        "ifsc": data.ifscCode
      }
    }
    return this.apiHttpService
      .post(
        `${API_URL}/IFSC/validate?source=` + data.serviceprovider, this.Requestbody
      )
  }

}
