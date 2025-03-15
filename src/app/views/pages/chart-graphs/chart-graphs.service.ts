import {Injectable} from '@angular/core';
import {ApiHttpService} from "../../../_services/api-http.service";
import {environment} from "../../../../environments/environment";

const {API_URL} = environment;

export interface RiskMerchantFilter {

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
export class ChartGraphsService {


  constructor(private services: ApiHttpService) {
  }

  getTransationList(pageSize: number = 10, page: number = 0, data: any) {
    return this.services
      .post(
        `${API_URL}/GetRiskTransaction?pageSize=${pageSize}&page=${page}`,
        data
      )

  }

  getRisk(pageSize: number = 10, page: number = 0, filter?: RiskMerchantFilter) {
    return this.services
      .post(
        `${API_URL}/GetRiskTransaction?pageSize=${pageSize}&page=${page}`,
        {


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

  getMerchant(id: any) {
    return this.services
      .post(`${API_URL}/MerchantCreationDetails`,
        {
          "Mid": id
        })
  }
}
