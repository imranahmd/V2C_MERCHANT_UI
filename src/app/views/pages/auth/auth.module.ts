import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {LoginComponent} from './login/login.component';
import {RegisterComponent} from './register/register.component';
import {RouterModule, Routes} from '@angular/router';
import {AuthComponent} from './auth.component';
import {ProfileComponent} from './profile/profile.component';
import {FormsModule} from "@angular/forms";
import {SweetAlert2Module} from "@sweetalert2/ngx-sweetalert2";
import {HttpInterceptorProviders} from "../../../_helpers/http.interceptor";
import {AlertService} from "../../../_services/alert.service";
import {ForgetPasswordComponent} from './forget-password/forget-password.component';
import {ChangePasswordComponent} from './change-password/change-password.component';
import {PasswordStrengthComponent} from './password-strength/password-strength.component';
import {ShowHidePasswordComponent} from './show-hide-password/show-hide-password.component';
import {InputRefDirective} from "./show-hide-password/input-ref.directive";
import {CustomCommonModule} from "../../../common/common.module";
import {NgbTooltipModule,NgbCarouselModule} from "@ng-bootstrap/ng-bootstrap";

const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      },
      {
        path: 'login',
        component: LoginComponent,
        data: {breadcrumb: {alias: 'Login'}},
      },
      {
        path: 'register',
        component: RegisterComponent,
        data: {breadcrumb: {alias: 'Register'}}
      },
      {
        path: 'forgot-password',
        component: ForgetPasswordComponent,
        data: {breadcrumb: {alias: 'Forgot Password'}}
      }
    ]
  },
]

@NgModule({
    declarations: [LoginComponent, RegisterComponent, AuthComponent, ProfileComponent, ForgetPasswordComponent, ChangePasswordComponent, PasswordStrengthComponent, ShowHidePasswordComponent, InputRefDirective],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        FormsModule,
        SweetAlert2Module.forRoot(),
        CustomCommonModule,
        NgbTooltipModule,
        NgbCarouselModule,

    ],
  exports: [
    ShowHidePasswordComponent,
    InputRefDirective,
    PasswordStrengthComponent
  ],
    providers: [HttpInterceptorProviders, AlertService]
})
export class AuthModule {
  constructor() {
  }
}
