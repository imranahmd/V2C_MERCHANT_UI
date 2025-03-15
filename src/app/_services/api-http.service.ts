import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Router} from "@angular/router";
import {catchError, Observable, of} from "rxjs";
import {StorageService} from "./storage.service";

@Injectable()
export class ApiHttpService {
  constructor(
    private http: HttpClient, private router: Router, private storageService: StorageService
  ) {
  }

  public get(url: string, options?: any): Observable<any> {
    return this.http.get(url, options).pipe(catchError(this.handleError()));
  }

  public post(url: string, data: any, options?: any): Observable<any> {
    return this.http.post(url, data, options).pipe(catchError(this.handleError()));
  }

  public put(url: string, data: any, options?: any): Observable<any> {
    return this.http.put(url, data, options).pipe(catchError(this.handleError()));
  }

  public delete(url: string, options?: any): Observable<any> {
    return this.http.delete(url, options).pipe(catchError(this.handleError()));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      if (error.status == 401) {
        this.storageService.clean()
        this.router.navigate(['/auth/login']);
      }


      // TODO: send the error to remote logging infrastructure
      // console.error("Error: --->",error); // log to console instead
      // this.storageService.clean()
      // this.router.navigate(['/']);
      // TODO: better job of transforming error for user consumption
      // console.error(`${operation} failed: ${error.message}`);

      // throw new Error(error.message);
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
