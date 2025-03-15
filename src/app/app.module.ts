import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppRoutingModule} from './app-routing.module';

import {LayoutModule} from './views/layout/layout.module';
import {AuthGuard} from './core/guard/auth.guard';

import {AppComponent} from './app.component';
import {ErrorPageComponent} from './views/pages/error-page/error-page.component';

import {HIGHLIGHT_OPTIONS} from 'ngx-highlightjs';
import {HttpInterceptorProviders, SecurityHeadersInterceptor} from "./_helpers/http.interceptor";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
// import {KeysPipe} from "ng-otp-input/lib/pipes/keys.pipe";
// import {NgOtpInputModule} from "ng-otp-input";
import {AlertService} from "./_services/alert.service";

@NgModule({
  declarations: [
    AppComponent,
    ErrorPageComponent
    ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    HttpClientModule,
    // NgOtpInputModule
    //RouterModule.forRoot(routes, { useHash: true })
  ],
  entryComponents: [],
  providers: [
    AuthGuard, HttpInterceptorProviders,
    {
      provide: HIGHLIGHT_OPTIONS, // https://www.npmjs.com/package/ngx-highlightjs
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        languages: {
          xml: () => import('highlight.js/lib/languages/xml'),
          typescript: () => import('highlight.js/lib/languages/typescript'),
          scss: () => import('highlight.js/lib/languages/scss'),
        }
      }
    },
    { provide: HTTP_INTERCEPTORS, useClass: SecurityHeadersInterceptor, multi: true },
    {provide: LocationStrategy, useClass: HashLocationStrategy},
AlertService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor() {
  }
}
