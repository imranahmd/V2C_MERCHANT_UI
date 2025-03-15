import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {MenusService} from "../../../../_services/menu.service";
import {AlertService} from "../../../../_services/alert.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../auth.service";
import {StorageService} from "../../../../_services/storage.service";

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss'],
})
export class ForgetPasswordComponent implements OnInit {

  returnUrl: any;
  form: any = {
    username: null,
  };
  setPasswordForm: any = {
    password: null,
    confirmPassword: null,
  };
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];
  checked: boolean = false;
  isResetPasswordFailed: boolean;
  isResetPassword: boolean;
  setPassword: boolean = false;
  strongPassword = false;
  setPasswordFailed: boolean;
  loaderInit: boolean = false;
  private token: any;

  constructor(private menuService: MenusService, private alertService: AlertService, private router: Router, private route: ActivatedRoute, private authService: AuthService, private storageService: StorageService) {
    this.route.queryParams
      .subscribe(params => {
          console.log("=======>", params);
          if (params.token) {
            this.token = params.token
            this.setPassword = true;
            this.isResetPassword = false;
            this.isResetPasswordFailed = false
          }
        }
      );
  }


  ngOnInit(): void {
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    if (this.storageService.isLoggedIn()) {
      this.isLoggedIn = true;
      this.roles = this.storageService.getUser().roles;
      this.router.navigate([this.returnUrl]);
    }
  }

  onForgotPassword(e: Event): void {
    e.preventDefault();

    let {username} = this.form;

    try {
      this.loaderInit = true;
      this.authService.forgotPassword(username).subscribe({
        next: data => {
          this.loaderInit = false;
          if (data == undefined || (data?.Status && data?.Status !== 'Success')) {
            this.alertService.toastErrorMessageAlert({
              title: data?.Message || 'Something went wrong!',
            })
            return
          }
          this.alertService.toastSuccessMessageAlert({
            title: data?.Message || 'Verification link sent successfully',
            html: '<b>Please check your e-mail...</b>'
          }).then(()=>{
            this.router.navigate(['/']);
          })
          this.isResetPasswordFailed = false;
          this.isResetPassword = true;

        },
        error: err => {
          this.loaderInit = false;
          this.alertService.toastErrorMessageAlert({
            title: err?.Message || 'Something went wrong!',
          })
          console.log("err====>", err);
          this.errorMessage = err.error?.message;
          this.isResetPasswordFailed = true;
        }
      });
    }catch (e: any){
      this.loaderInit = false;
      this.alertService.toastErrorMessageAlert({
        title: e?.Message || 'Something went wrong!',
      })
      return;
    }

  }

  onResetPassword(e: Event):void{
    e.preventDefault();

    let {password, confirmPassword} = this.setPasswordForm;
    try{
      this.loaderInit = true;
      this.authService.resetPassword(this.token, password).subscribe({
        // @ts-ignore
        next: data => {
          this.loaderInit = false;
          if (data == undefined || (data?.Status && data?.Status !== 'Success')) {
            this.alertService.toastErrorMessageAlert({
              title: data?.Message || 'Something went wrong!',
            })
            // this.setPassword = false;
            this.setPasswordFailed = true;
            return false
            return this.router.navigate(['/auth/forgot-password']);
          }
          this.alertService.toastSuccessMessageAlert({
            title: 'Password change successfully',
            html: ''
          }).then(()=>{
            return this.router.navigate(['/']);
          })
          this.setPasswordFailed = false;
          this.setPassword = true;
        },
        error: err => {
          this.loaderInit = false;
          this.alertService.toastErrorMessageAlert({
            title: err?.Message || 'Something went wrong!',
          })
          console.log("err====>", err);
          this.errorMessage = err.error?.message || err?.message;
          this.setPasswordFailed = true;
      }
    });
    }catch (e: any){
      this.loaderInit = false;
      this.alertService.toastErrorMessageAlert({
        title: e?.Message || 'Something went wrong!',
      })
      return;
    }
  }

  onPasswordStrengthChanged(event: boolean) {
    this.strongPassword = event;
  }

  reloadPage(): void {
    window.location.reload();
  }

}
