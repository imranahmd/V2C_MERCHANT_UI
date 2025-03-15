import {Injectable} from '@angular/core';
import {ApiHttpService} from "../../../_services/api-http.service";
import {environment} from "../../../../environments/environment";

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
  "startDate"?: string,
  "endDate"?: string,
  "sendDate"?: string,
  "pageRecords"?: number,
  "pageNumber"?: number,
  "rid"?: string,
  "Status"?: string
}

export interface AccountFilter {
  "merchantid": string
  "pageRecords": number,
  "pageNumber": number,
}

@Injectable({
  providedIn: 'root'
})
export class RefundManagementService {

  // private node: Subject<Node> = new BehaviorSubject<Node>([]);

  constructor(private apiHttpService: ApiHttpService) {
  }

  // get node$() {
  //   return this.node.asObservable();
  // }

  // addNode(data: Node) {
  //   this.node.next(data);
  // }

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

  getAllMerchant(pageSize: number = 10, page: number = 0, filter?: MerchantFilter) {
    return this.apiHttpService
      .post(
        `${API_URL}/get-merchant?pageSize=${pageSize}&page=${page}`,
        {
          "name": filter?.name || "",
          "mid": filter?.mid || "",
          "rid": filter?.rid || "",
          "Status": filter?.Status || "",
          "startDate": filter?.startDate || "",
          "endDate": filter?.endDate || "",
          "sendDate": filter?.sendDate || "",
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
          "Value": "merchant_status"
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

  raiseRefundService(data: any) {
    return this.apiHttpService
      .post(
        `${API_URL}/RaiseRefund/`, data
      )
  }
  getRefundRequestStatus(data:any)
  {
    return this.apiHttpService
    .post(
      `${API_URL}/RefundRequestStatusMerchant/`,data
    )

  }

  getAllMerchantList(data:any)
  {  return this.apiHttpService
    .post(
      `${API_URL}/GetMerchant/`,data
    )

  }


  getRefundType(data:any)
  {  return this.apiHttpService
    .post(
      `${API_URL}/GetDropdown/`,data
    )

  }



  
}
