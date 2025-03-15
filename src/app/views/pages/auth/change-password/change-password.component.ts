import {Component, OnInit} from '@angular/core';
import {AuthService} from "../auth.service";
import {AlertService} from "../../../../_services/alert.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  isChangePassword: boolean;
  changePasswordForm: any = {
    currentPassword: null,
    newPassword: null,
    confirmPassword: null,
  };
  strongPassword: Event| boolean | undefined;
  errorMessage: any;
  isChangePasswordFailed: boolean;
  loaderInit: boolean=false;

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  onPasswordStrengthChanged($event: boolean) {
    this.strongPassword = $event;
    console.log($event)
  }

  changePassword(e: MouseEvent) {
    e.preventDefault();

    let {newPassword, currentPassword} = this.changePasswordForm;
    try {
      this.loaderInit = true;
      this.authService.resetPasswordLogin(currentPassword, newPassword).subscribe({
        // @ts-ignore
        next: data => {
          this.loaderInit = false;
          if (data == undefined || (data?.Status && data?.Status !== 'Success')) {
            this.alertService.toastErrorMessageAlert({
              title: data?.Message || 'Something went wrong!',
            })
            this.isChangePassword = false;
            // this.isChangePasswordFailed = true;
            return false;
          }
          this.alertService.toastSuccessMessageAlert({
            title: 'Password change successfully',
            html: ''
          }).then(() => {
            this.authService.logout();
            return this.router.navigate(['/']);
          })
          // this.setPasswordFailed = false;
          this.isChangePassword = true;
        },
        error: err => {
          this.loaderInit = false;
          this.alertService.toastErrorMessageAlert({
            title: err?.Message || 'Something went wrong!',
          })
          console.log("err====>", err);
          this.errorMessage = err.error?.message || err?.message;
          this.isChangePasswordFailed = true;
        }
      });
    } catch (e: any) {
      this.loaderInit = false;
      this.alertService.toastErrorMessageAlert({
        title: e?.Message || 'Something went wrong!',
      })
      this.errorMessage = e.error?.message || e?.message;
      this.isChangePasswordFailed = true;
    }
  }

  getNewPasswordValidity(){
    return (this.changePasswordForm.newPassword == '' || !this.changePasswordForm.newPassword || !this.strongPassword)
  }
}
