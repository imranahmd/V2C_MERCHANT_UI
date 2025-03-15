import {Injectable} from '@angular/core';
import {ApiHttpService} from "../../../../_services/api-http.service";
import {environment} from "../../../../../environments/environment";

const {API_URL} = environment;

export interface RiskdashboardFilter {

  "From"?: string,
  "ToDate"?: string,
  "Mid"?: string,
  "RiskCode"?: string,
  "RiskStage"?: string,
  "RiskFlag"?: string
  "Action"?: string
}

@Injectable({
  providedIn: 'root'
})
export class DynamicreportService {

  apiHttpService: any;

  constructor(private services: ApiHttpService) {
  }

  getRisk(pageSize: number = 10, page: number = 0, filter?: RiskdashboardFilter) {
    return this.services
      .post(
        `${API_URL}/GetRiskAlertDetails?pageSize=${pageSize}&page=${page}`,
        {
          // "name":filter?.name || "",
          // "mid" : filter?.mid || "",
          // "startDate": filter?.startDate || "",
          // "endDate": filter?.endDate || "",
          // "sendDate":filter?.sendDate || "",
          // "pageRecords":pageSize || 10,
          // "pageNumber":page || 0,

          "From": filter?.From || "",
          "ToDate": filter?.ToDate || "",
          "Mid": filter?.Mid || "",
          "RiskCode": filter?.RiskCode || "",
          "RiskStage": filter?.RiskStage || "",
          "RiskFlag": filter?.RiskFlag || "",
          "pageRecords": pageSize || 10,
          "pageNumber": page || 0,
        }
      )
  }

  getDynamicData(data: any, pageSize: number = 10, page: number = 0, filter?: RiskdashboardFilter) {
    return this.services
      .post(
        //  `https://pphadmin.Paymentspg.in/PPAdminDReportAPI/reports/`,data
        `${API_URL}/reports?pageSize=${pageSize}&page=${page}`, data
        // `http://52.66.171.80:8100/crm/reports?pageSize=${pageSize}&page=${page}`,data
      )
  }

  GetRiskActionLogs(pageSize: number = 10, page: number = 0, filter?: RiskdashboardFilter) {
    return this.services
      .post(
        `${API_URL}/GetRiskActionLogs?pageSize=${pageSize}&page=${page}`,
        {
          // "name":filter?.name || "",
          // "mid" : filter?.mid || "",
          // "startDate": filter?.startDate || "",
          // "endDate": filter?.endDate || "",
          // "sendDate":filter?.sendDate || "",
          // "pageRecords":pageSize || 10,
          // "pageNumber":page || 0,

          "From": filter?.From || "",
          "ToDate": filter?.ToDate || "",
          "Mid": filter?.Mid || "",
          "RiskCode": filter?.RiskCode || "",
          "Action": filter?.RiskStage || "",
          "pageRecords": pageSize || 10,
          "pageNumber": page || 0,
        }
      )
  }

  getMerchantBYName(data: any) {

    return this.services
      .post(
        `${API_URL}/GetMerchant/`, data
      )
  }

}
