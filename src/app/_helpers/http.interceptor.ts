import { Injectable } from '@angular/core';
import {
  HTTP_INTERCEPTORS,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { StorageService } from "../_services/storage.service";
import { environment } from "../../environments/environment";

const { API_URL, appSystem } = environment;

@Injectable()
export abstract class JsonParser {
  abstract parse(text: string): any;
}

@Injectable()
export class SecurityHeadersInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const secureReq = req.clone({
      setHeaders: {
        'X-Frame-Options': 'DENY',  // Custom header
        'X-XSS-Protection': '1; mode=block',  // Custom header
        'Content-Security-Policy': "default-src 'self'; script-src 'self' https://pg.payfi.co.in; style-src 'self' https://pg.payfi.co.in;",  // Custom header
        'Referrer-Policy': 'no-referrer',  // Custom header
      }
    });
    return next.handle(secureReq);
  }
}

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  constructor(private storageService: StorageService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.storageService.getToken();
    // const isApiUrl = req.url.startsWith(API_URL);
    const isApiUrl = true;
    const headers: any ={};
    if (token && isApiUrl) {
      // if (req.url.includes('http://54.90.122.218:8080/')&&(window.location.href.includes('http://54.90.122.218:8080/')||window.location.href.includes('http://54.90.122.218:8080/')||window.location.href.includes('http://localhost:'))) {
      //   headers['Authorization'] = `Basic YXBpdXNlcjpBcGlAMTIz`;
      // } else {
       
      // }
       headers['Authorization'] = `Bearer ${token}`;
    }
    //TODO:need to set appSystem once headers set at server
    headers['x-request-src'] = appSystem || '';
    req = req.clone({
      setHeaders: headers
    });
    req = req.clone({
      // withCredentials: true,
    });

    return next.handle(req);
  }

  /*private handleJsonResponse(httpRequest: HttpRequest<any>, next: HttpHandler) {
    // Override the responseType to disable the default JSON parsing.
    httpRequest = httpRequest.clone({responseType: 'text'});
    // Handle the response using the custom parser.
    return next.handle(httpRequest).pipe(map((event: HttpEvent<any>) => this.parseJsonResponse(event)));
  }

  private parseJsonResponse(event: HttpEvent<any>) {
    if (event instanceof HttpResponse && typeof event.body === 'string') {
      return event.clone({body: this.jsonParser.parse(event.body)});
    } else {
      return event;
    }
  }*/
}

export const HttpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: HttpRequestInterceptor, multi: true },
];
