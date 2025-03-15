import {Injectable} from '@angular/core';
import {ApiHttpService} from "../../../../_services/api-http.service";
import {environment} from "../../../../../environments/environment";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {FormGroup} from "@angular/forms";

const {API_URL} = environment;

export interface RiskMerchantFilter {

  // "From"?: string,
  // "ToDate"?: string,
  // "Mid"?: string,
  // "RiskCode"?: string,
  // "RiskStage"?: string,
  // "RiskFlag"?: string
  // "Action"?: string
}

export interface MerchantFilter {
  "name"?: string,
  "mid"?: string,
  "rid"?: string,
  "startDate"?: string,
  "endDate"?: string,
  "sendDate"?: string,
  "pageRecords"?: number,
  "pageNumber"?: number,
  "Status"?:string
  "columns"?:any
}

export interface AccountFilter {
  "merchantid": string
  "pageRecords": number,
  "pageNumber": number,
  "status":string
}

@Injectable({
  providedIn: 'root'
})
export class MerchantService {
  public kycUploadEvent: any;
  public kycUploadObserver: Observable<any>;
  // @ts-ignore
  private node: Subject<Node> = new BehaviorSubject<Node>([]);

  constructor(private apiHttpService: ApiHttpService) {
    this.kycUploadEvent = new Subject();
    this.kycUploadObserver = this.kycUploadEvent.asObservable();
  }

  get node$() {
    return this.node.asObservable();
  }

  uploadKycBrowseButton(data: any) {
    this.kycUploadEvent.next({
      type: 'FILE_LISTING',
      listData: data
    });
  }

  kycFileUploadComplete(fileDetails: any) {
    this.kycUploadEvent.next({
      type: 'FILE_UPLOAD',
      fileData: fileDetails
    });
  }

  kycFileDeleteEvent(fileDetails: any) {
    this.kycUploadEvent.next({
      type: 'FILE_DELETE',
      fileData: fileDetails
    });
  }

  kycFileDownloadEvent(fileDetails: any) {
    this.kycUploadEvent.next({
      type: 'FILE_DOWNLOAD',
      fileData: fileDetails
    });
  }

  kycFileViewEvent(fileDetails: any) {
    this.kycUploadEvent.next({
      type: 'FILE_VIEWED',
      fileData: fileDetails
    });
  }

  addNode(data: Node) {
    this.node.next(data);
  }

  createMerchant(data: any) {
    return this.apiHttpService
      .post(
        `${API_URL}/create-merchant`,
        {
          ...data
        }
      )
  }

  getdownload(url: string, data: any) {
    return this.apiHttpService.post(url, data)
  }

  getMerchant(id: any) {
    return this.apiHttpService
      .post(`${API_URL}/MerchantCreationDetails`,
        {
          "Mid": id
        })
  }

  getAllMerchant(pageSize: number = 10, page: number = 0, filter?: MerchantFilter, rid?: any) {
    return this.apiHttpService
      .post(
        `${API_URL}/get-merchant?pageSize=${pageSize}&page=${page}`,
        {
          "name": filter?.name || "",
          "mid": filter?.mid || "",
          "rid": filter?.rid || rid || "",
          "startDate": filter?.startDate || "",
          "endDate": filter?.endDate || "",
          "sendDate": filter?.sendDate || "",
          "pageRecords": pageSize || 10,
          "pageNumber": page || 0,
          "Status": filter?.Status|| "",
          "columns": filter?.columns|| {},
        }
      )
  }

  getBusinessType() {
    return this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`,
        {
          "Type": "1",
          "Value": ""
        }
      )
  }
  getResellerMerchant(val:any){
    return this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`,
        {
          "Type": "21",
          "Value": val
        }
      )
  }

  getResellerMerchantName(val: any) {
    return this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`,
        {
          "Type": "22",
          "Value": val
        }
      )
  }

  subCategoryType(data: any) {
    return this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`, data
      )
  }

  getMerchantCategory() {
    return this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`,
        {
          "Type": "2",
          "Value": ""
        }
      )
  }

  getMerchantSubCategory(categoryId: any) {
    return this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`,
        {
          "Type": "19",
          "Value": categoryId
        }
      )
  }

  getInstrumentMaster() {
    return this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`,
        {
          "Type": "3",
          "Value": ""
        }
      )
  }

  getResellerList() {
    return this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`,
        {
          "Type": "4",
          "Value": ""
        }
      )
  }

  getMerchantStatus() {
    return this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`,
        {
          "Type": "8",
          "Value": "global_status"
        }
      )
  }

  //MDR Setup
  getServiceProvider() {
    const reqData = {
      "Type": "5",
      "Value": ""
    }
    return this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`, reqData
      )
  }

  getService(spId?: any) {
    const reqData = {
      "Type": "6",
      "Value": spId || ''
    }
    return this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`, reqData
      )
  }

  getInstruments(serId?: any) {
    const reqData = {
      "Type": "7",
      "Value": serId || ''
    }
    return this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`, reqData
      )
  }

  getInstrumentBrand() {
    const reqData = {
      "Type": "14",
      "Value": ""
    }
    return this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`, reqData
      )
  }

  //Account List Services
  createMerchantAccount(data: any) {
    return this.apiHttpService
      .post(
        `${API_URL}/create-merchant-bank`,
        {
          ...data
        }
      )
  }

  getMerchantAccountList(pageSize: number = 10, page: number = 0, filter?: AccountFilter) {
    return this.apiHttpService
      .post(
        `${API_URL}/get-merchantbank?pageSize=${pageSize}&page=${page}`,
        {
          "merchantid": filter?.merchantid || "",
          "pageRecords": filter?.pageRecords || 10,
          "pageNumber": filter?.pageNumber || 10,

        }
      )
  }


  sendApproval(appObject: any) {
    return this.apiHttpService.post(`${API_URL}/ChangeMerchantStatus`, appObject)
  }

  getTransationList(pageSize: number = 10, page: number = 0, data: any) {
    return this.apiHttpService
      .post(
        `${API_URL}/Verify-CreateMerchantRecords?pageSize=${pageSize}&page=${page}`,
        data
      )
  }

  getRisk(pageSize: number = 10, page: number = 0, filter?: RiskMerchantFilter) {
    return this.apiHttpService
      .post(
        `${API_URL}/Verify-CreateMerchantRecords?pageSize=${pageSize}&page=${page}`, filter
        // {


        //   "From": filter?.From || "",
        //   "ToDate": filter?.ToDate || "",
        //   "Mid": filter?.Mid || "",
        //   "RiskCode": filter?.RiskCode || "",
        //   "RiskStage": filter?.RiskStage || "",
        //   "RiskFlag": filter?.RiskFlag || "",
        //   "pageRecords": pageSize || 10,
        //   "pageNumber": page || 0,
        // }
      )
  }

  checkAccountExists(accountDetails: any) {
    return this.apiHttpService.post(`${API_URL}/CheckAccountBank`, {
      "Product_Id": accountDetails?.productId == "DEFAULT" ? '' : accountDetails?.productId || '',
      "Account": accountDetails?.accountNumber || '',
    })
  }

  getMerchantBYName(data: any) {

    return this.apiHttpService
      .post(
        `${API_URL}/GetMerchant/`, data
      )
  }


  // kyc
  getMerchantKycDetails(id: any) {
    const body = {
      "businesstypeId": 1,
      "merchantId": id
    }
    return this.apiHttpService
      .post(
        `${API_URL}/getKyc-DocumentList/`, body
      )

  }

  uploadKycFile(formData: FormData) {
    return this.apiHttpService
      .post(
        `${API_URL}/upload-image/`, formData
      );
  }

  uploadKycDocsData(merchantId: string, kycDocsData: any[]) {
    const formData = {
      merchantId: merchantId,
      docType: kycDocsData
    }
    return this.apiHttpService
      .post(
        `${API_URL}/upload-KycdocsV2/`, formData
      );
  }

  downloadKycFile(formData: FormData) {
    return this.apiHttpService
      .post(
        `${API_URL}/download-uploadfiles/`, formData
      );
  }

  deleteKycFile(formData: any) {
    return this.apiHttpService
      .post(
        `${API_URL}/delete-upload-image/`, formData
      );
  }

  getRiskRemark(mid: any, type: any, apptpye: any) {
    var data = {
      "Type": "1",
      "ModuleType": type,
      "merchant_id": mid,
      "AppType": apptpye
    }
    return this.apiHttpService.post(API_URL + '/GetRemarks', data);
  }

}
