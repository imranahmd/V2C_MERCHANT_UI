import {DatePipe} from '@angular/common';
import {Injectable} from '@angular/core';
import {environment} from 'src/environments/environment';
import {ApiHttpService} from "../../../../_services/api-http.service";

const {API_URL} = environment;

export interface InvoiceFilter {

  "iType"?: string,
  "iFDate"?: string,
  "iToDate"?: string,
  "iAmount"?: string,
  
  "iStatus"?: string,
  "pageRecords"?: number,
  "pageNumbe"?: number
}

@Injectable({
  providedIn: 'root'
})


export class InvoiceReportServiceService {
  myDate: any;


  constructor(private apiHttpService: ApiHttpService, private datepipe: DatePipe) {
  }

  getInvoiceReport(pageSize: number = 10, page: number = 0, filter?: InvoiceFilter) {
    this.myDate = new Date();
    this.myDate = this.datepipe.transform(this.myDate, 'dd-MM-yyyy');


    return this.apiHttpService
      .post(
        `${API_URL}/InvoiceReport?pageSize=${pageSize}&page=${page}`,
        {

          "iUserId":localStorage.getItem("user"),
          "iType": filter?.iType || "5",
          "iFDate": filter?.iFDate || "",
          "iToDate": filter?.iToDate || "",
         
          "iAmount": filter?.iAmount || "",
          "iStatus": filter?.iStatus || "",
          "pageRecords": pageSize || 10,
          "pageNumber": page || 0,
        }
      )
  }

  changeInvoiceStatus(data: any) {
    return this.apiHttpService
      .post(
        `${API_URL}/ActionInvoiceButton/`, data
      )
  }

}
