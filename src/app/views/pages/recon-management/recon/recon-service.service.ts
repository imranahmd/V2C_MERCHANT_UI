import {Injectable} from '@angular/core';
import {ApiHttpService} from "../../../../_services/api-http.service";
import {environment} from "../../../../../environments/environment";
import {BehaviorSubject, Subject} from "rxjs";

const {API_URL} = environment;

@Injectable({
  providedIn: 'root'
})
export class ReconServiceService {
// @ts-ignore
  private node: Subject<Node> = new BehaviorSubject<Node>([]);

  constructor(private apiHttpService: ApiHttpService) {
  }

  getReconList(data: any, pageSize: number = 10, page: number = 0,) {
    return this.apiHttpService
      .post(
        `${API_URL}/GetReconFileList?pageSize=${pageSize}&page=${page}`, data
      )

  }

  deleteRecons(data: any) {
    return this.apiHttpService
      .post(
        `${API_URL}/deletereconfile`, data
      )
  }

  addReconFile(data: any) {
    return this.apiHttpService
      .post(
        `${API_URL}/validateReconFile`, data
      )
  }

  getReconProgressReports(data: any, pageSize: number = 10, page: number = 0,) {
    return this.apiHttpService
      .post(
        `${API_URL}/getReconProgressReport?pageSize=${pageSize}&page=${page}`, data
      )

  }

  startRecons(data: any) {
    return this.apiHttpService
      .get(
        `${API_URL}/startRecon?`, data
      )

  }

}
