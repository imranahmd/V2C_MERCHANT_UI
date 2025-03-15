import {Injectable} from '@angular/core';
import {ApiHttpService} from "../../../../_services/api-http.service";
import {environment} from "../../../../../environments/environment";
import {Observable, Subject} from "rxjs";

const {API_URL} = environment;

export interface ResellerFilter {
  "rname"?: string,
  "rid"?: string,
  "startDate"?: string,
  "endDate"?: string,
  "sendDate"?: string,
  "pageRecords"?: number,
  "pageNumber"?: number,
  "Status"?: string
}

export interface AccountFilter {
  "resellerid": string
  "pageRecords": number,
  "pageNumber": number,
}

@Injectable({
  providedIn: 'root'
})
export class ResellerService {

  public kycUploadEvent: any;
  public kycUploadObserver: Observable<any>;

  constructor(private apiHttpService: ApiHttpService) {
    this.kycUploadEvent = new Subject();
    this.kycUploadObserver = this.kycUploadEvent.asObservable();
  }

  createReseller(data: any) {

    return this.apiHttpService
      .post(
        `${API_URL}/create-update-reseller`,
        {
          ...data
        }
      )
  }

  getReseller(id: any) {
    return this.apiHttpService
      .post(`${API_URL}/get-reseller-detail-by-resellerid`,
        {
          "resellerId": id
        })
  }

  getAllReseller(pageSize: number = 10, page: number = 0, filter?: ResellerFilter) {
    return this.apiHttpService
      .post(
        `${API_URL}/reseller-view-list?pageSize=${pageSize}&page=${page}`,
        {
          // "name": filter?.name || "",
          // "mid": filter?.mid || "",
          // "startDate": filter?.startDate || "",
          // "endDate": filter?.endDate || "",
          // "sendDate": filter?.sendDate || "",
          "rname": filter?.rname || "",
          "rid": filter?.rid || "",
          "startDate": filter?.startDate || "",
          "endDate": filter?.endDate || "",
          "Status": filter?.Status || "",
          "pageRecords": pageSize || 10,
          "pageNumber": page || 0,
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

  getResellerCategory() {
    return this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`,
        {
          "Type": "2",
          "Value": ""
        }
      )
  }

  getResellerSubCategory(categoryId: any) {
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

  getResellerStatus() {
    return this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`,
        {
          "Type": "8",
          "Value": "reseller_status"
        }
      )
  }

  //Account List Services
  createResellerAccount(data: any) {
    return this.apiHttpService
      .post(
        `${API_URL}/create-merchant-bank`,
        {
          ...data
        }
      )
  }

  checkAccountExists(accountDetails: any) {
    return this.apiHttpService.post(`${API_URL}/CheckAccountBank`, {
      "Product_Id": accountDetails?.productId == "DEFAULT" ? '' : accountDetails?.productId || '',
      "Account": accountDetails?.accountNumber || '',
    })
  }

  getResellerAccountList(pageSize: number = 10, page: number = 0, filter?: AccountFilter) {
    return this.apiHttpService
      .post(
        `${API_URL}/get-reseller-bankacc-by-resellerid?pageSize=${pageSize}&page=${page}`,
        {
          "resellerid": filter?.resellerid || "",
          "pageRecords": filter?.pageRecords || 10,
          "pageNumber": filter?.pageNumber || 10,

        }
      )
  }

  sendApproval(appObject: any) {
    return this.apiHttpService.post(`${API_URL}/ChangeResellerStatus`, appObject)
  }

  getMerchantStatus() {

    return this.apiHttpService
      .post(
        `${API_URL}/GetDropdown`,
        {
          "Type": "8",
          "Value": "merchant_status"
        }
      )
  }

  //kyc
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

  uploadKycFile(formData: FormData) {
    return this.apiHttpService
      .post(
        `${API_URL}/upload-image/`, formData
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
        `${API_URL}/delete-resellerupload-image/`, formData
      );
  }

  getResellerKycDetails(id: any) {
    const body = {
      "businesstypeId": 1,
      "resellerId": id
    }
    return this.apiHttpService
      .post(
        `${API_URL}/getResellerKyc-DocumentList/`, body
      )

  }

  getRiskRemark(mid: any, type: any, apptpye: any) {
    const data = {
      "Type": "1",
      "ModuleType": type,
      "merchant_id": mid,
      "AppType": apptpye
    }
    return this.apiHttpService.post(API_URL + '/GetRemarks', data);
  }

  uploadKycDocsData(resellerId: string, kycDocsData: any[]) {
    const formData = {
      resellerId: resellerId,
      documentDetails: kycDocsData
    }
    return this.apiHttpService
      .post(
        `${API_URL}/reseller-insertKycdocs-detailsV2/`, formData
      );
  }

}
