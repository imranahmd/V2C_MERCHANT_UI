import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {FormsModule} from '@angular/forms';

import {BaseComponent} from './base/base.component';
import {NavbarComponent} from './navbar/navbar.component';
import {SidebarComponent} from './sidebar/sidebar.component';
import {FooterComponent} from './footer/footer.component';

import {ContentAnimateDirective} from '../../core/content-animate/content-animate.directive';

import {NgbCollapseModule, NgbDropdownModule} from '@ng-bootstrap/ng-bootstrap';

import {FeatherIconModule} from '../../core/feather-icon/feather-icon.module';

import {PERFECT_SCROLLBAR_CONFIG, PerfectScrollbarConfigInterface, PerfectScrollbarModule} from 'ngx-perfect-scrollbar';
import {ApiHttpService} from "../../_services/api-http.service";
import {HttpInterceptorProviders} from "../../_helpers/http.interceptor";
import {UserService} from "../../_services/user.service";
import {SideNavService} from "./sidebar/side-name.service";
import { NewBaseComponent } from './new-base/new-base.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};


@NgModule({
  declarations: [BaseComponent, NavbarComponent, SidebarComponent, FooterComponent, ContentAnimateDirective, NewBaseComponent],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    NgbDropdownModule,
    NgbCollapseModule,
    PerfectScrollbarModule,
    FeatherIconModule
  ],
  exports: [
    SidebarComponent,
    NavbarComponent
  ],
  providers: [ApiHttpService, HttpInterceptorProviders, UserService, SideNavService,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ]
})
export class LayoutModule {
  constructor() {
  }
}
