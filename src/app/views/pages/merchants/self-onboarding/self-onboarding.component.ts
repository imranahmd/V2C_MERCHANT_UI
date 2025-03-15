import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {AlertService} from "../../../../_services/alert.service";
import {SelfOnboardingService} from "./self-onboarding.service";
import {LoaderService} from "../../../../_services/loader.service";
import {Router} from "@angular/router";
// import {NgOtpInputConfig} from "ng-otp-input";
import {noWhiteSpaceValidator} from "../../../../common/common.validators";

@Component({
  selector: 'app-self-onboarding',
  templateUrl: './self-onboarding.component.html',
  styleUrls: ['./self-onboarding.component.scss']
})
export class SelfOnboardingComponent implements OnInit {

  registrationForm: FormGroup;
  otpForm: FormGroup;
  confirmForm: FormGroup;
  showOtpForm: boolean=false
  showConfirmForm: boolean= false;
  private accessToken: any;
  loading: boolean = false;
  strongPassword = false;
  otpFormSubmitted: boolean = false;
  disTimerEmail:any
  disTimerMobile:any
  defaultConfig: any;
  enableResend: boolean = false;
  private emailTimer: any;
  private mobTimer: any;

  constructor(
    private router: Router,
    public fb: FormBuilder,
    private alertService: AlertService,
    private sefService: SelfOnboardingService,
    private loaderService: LoaderService
  ) {
    this.defaultConfig = {
      length: 6,
      allowNumbersOnly: true,
      inputStyles: {
        width: '50px',
        height: '50px',
        'border-radius': '4px',
        'border': 'solid 1px #c5c5c5',
        'text-align': 'center',
        'font-size': '18px',
      }
    }
    this.registrationForm = this.fb.group({
      legalName: ['', [Validators.required, this.noWhitespaceValidator]],
      mobileNumber: ['', [Validators.required, Validators.pattern("[123456789][0-9]{9}")]],
      email: ['', [Validators.required,  noWhiteSpaceValidator(), Validators.email,]],
      termsCheck: ['', [Validators.required]],
    })

    this.otpForm = this.fb.group({
      otpEmail: ['', [Validators.required, Validators.pattern("[0-9]{6}")]],
      otpMobile: ['', [Validators.required, Validators.pattern("[0-9]{6}")]],
    })
    this.confirmForm = this.fb.group({
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    })
  }

  ngOnInit(): void {

    this.loading = false;

  }

  get getRegistrationForm(){
    return this.registrationForm as FormGroup
  }

  get legalName() {
    return this.registrationForm.get('legalName') as FormControl;
  }

  get mobileNumber() {
    return this.registrationForm.get('mobileNumber') as FormControl;
  }

  get email() {
    return this.registrationForm.get('email') as FormControl;
  }

  get getPassword() {
    return this.confirmForm.get('password') as FormControl;
  }

  get getConfirmPassword() {
    return this.confirmForm.get('confirmPassword') as FormControl;
  }

  get termsCheck() {
    return this.registrationForm.get('termsCheck') as FormControl;
  }

  get otpMobile() {
    return this.otpForm.get('otpMobile') as FormControl;
  }

  get otpEmail() {
    return this.otpForm.get('otpEmail') as FormControl;
  }

  onRegister($event: MouseEvent) {
    try{
      this.loading = true
      document?.getElementById('loading')?.classList.add("spinner-border")
      document?.getElementById('loading')?.classList.add("spinner-border-sm")
      this.loaderService.showLoader();
      this.sefService.getOtp({
        emailId: this.email.value,
        mobile: this.mobileNumber.value,
        fullName: this.legalName.value,
      })
        .subscribe((data: any)=>{
        this.loaderService.hideLoader();
        if(data.Status && data.Status === 'Success'){
          this.alertService.successAlert(`<h5>${(data?.Message || 'OTP has been sent to your Mobile and Email ID')}</h5>`, '')
            .then(()=>{
              this.showOtpForm = !this.showOtpForm;
              this.emailTimer = this.timer(3, 'email')
              this.mobTimer = this.timer(3, 'mob')
            })
        }else{
          this.alertService.errorAlert({
            title: data?.Message || 'Something went wrong, please try after some time',
            html:''
          })
        }
        this.loading = false
          document?.getElementById('loading')?.classList.remove("spinner-border")
          document?.getElementById('loading')?.classList.remove("spinner-border-sm")
      })
    }catch (e){
      this.loaderService.hideLoader()
    }

    this.loaderService.hideLoader();

  }

  // @ts-ignore
  onOtpValidate($event: MouseEvent) {
    $event.preventDefault();
    try {
      this.otpFormSubmitted = true;
      if (!this.otpForm.valid) {
        return false;
      }
      this.loading = true
      document?.getElementById('loading')?.classList.add("spinner-border")
      document?.getElementById('loading')?.classList.add("spinner-border-sm")
      this.loaderService.showLoader();
      this.sefService.validateOpt({
        emailOTP: this.otpEmail.value,
        mobileOTP: this.otpMobile.value
      }).subscribe((data: any) => {

        this.loaderService.hideLoader();
        if (data.Status && data.Status === 'Success') {
          this.accessToken = data.Authorization
          this.alertService.successAlert(data?.Message || 'OTP Verified', '')
            .then(() => {
              this.showConfirmForm = true
            })
        } else {
          this.alertService.errorAlert({
            title: 'Please enter received OTP',
            html: ''
          })
        }
        this.loading = false
          document?.getElementById('loading')?.classList.remove("spinner-border")
          document?.getElementById('loading')?.classList.remove("spinner-border-sm")
      })
    } catch (e) {

      this.loaderService.hideLoader()
    }

    this.loaderService.hideLoader()
    // this.showOtpForm = !this.showOtpForm;
    // this.alertService.successAlert(`Successfully submitted OTP ${this.otpMobile.value}`, '').then(()=>{
    //   this.showConfirmForm = true
    // })
  }

  onCreatePassword($event: MouseEvent) {
    try{
      this.loading = true
      document?.getElementById('loading')?.classList.add("spinner-border")
      document?.getElementById('loading')?.classList.add("spinner-border-sm")
      this.loaderService.showLoader();
      this.sefService.completeRegistration({
        password: this.getPassword.value,
        token: this.accessToken
      }).subscribe((data) => {
        this.loaderService.hideLoader();
        if (data.Status && data.Status === 'Success') {
          this.accessToken = data.Authorization
          this.alertService.successAlert(data?.Message || 'Account Verified and Created', '')
            .then(() => {
              this.showConfirmForm = true
              return this.router.navigate(['/auth/login'], {
                // queryParams: {...this.queryParams}
              })
            })
        } else {
          this.alertService.errorAlert({
            title: data?.Message || 'Something went wrong, please try after some time',
            html: ''
          })
        }
        this.loading = false
          document?.getElementById('loading')?.classList.remove("spinner-border")
          document?.getElementById('loading')?.classList.remove("spinner-border-sm")
      })
    } catch (e) {
      this.loaderService.showLoader();
    }
    this.loaderService.showLoader();
    // this.showOtpForm = !this.showOtpForm;
    // this.alertService.successAlert(`Successfully Register`, 'Please login to portal').then(()=>{
    //   this.showConfirmForm = true
    // })
  }

  onPasswordStrengthChanged(event: any) {
    this.strongPassword = event;
  }

  onEditInfo($event: MouseEvent) {
    this.showOtpForm = !this.showOtpForm;
    this.stopTimer(this.emailTimer);
    this.stopTimer(this.mobTimer);
  }

  timer(minute: number, field: string) {
    // let minute = 1;
    let seconds: number = minute * 60;
    let textSec: any = "0";
    let statSec: number = 60;

    const prefix = minute < 10 ? "0" : "";

    const timer = setInterval(() => {
      seconds--;
      if (statSec != 0) statSec--;
      else statSec = 59;

      if (statSec < 10) {
        textSec = "0" + statSec;
      } else textSec = statSec;

      if (field == 'email') this.disTimerEmail = `${prefix}${Math.floor(seconds / 60)}:${textSec}`;
      if (field == 'mob') this.disTimerMobile = `${prefix}${Math.floor(seconds / 60)}:${textSec}`;
      // this.display = `${prefix}${Math.floor(seconds / 60)}:${textSec}`;

      if (seconds == 0) {
        console.log("finished");
        this.enableResend = true;
        clearInterval(timer);
      }
    }, 1000);

    return timer;
  }

  // @ts-ignore
  stopTimer(startedInterval: any){
    clearInterval(startedInterval);
  }

  showTermsAndCondition() {
    this.alertService.simpleAlert('Terms and Conditions', '<div style="scroll-behavior: auto; height: 250px; border: 1px black">' +
      '"<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>"\n' +
      '\n' +
      'Section 1.10.32 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC\n' +
      '"Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"\n' +
      '\n' +
      '1914 translation by H. Rackham\n' +
      '"But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?"' +
      '</div>', 700)
  }

  resendOtp(event: Event){
    event.preventDefault()
    try{
      this.loading = true
      document?.getElementById('loading')?.classList.add("spinner-border")
      document?.getElementById('loading')?.classList.add("spinner-border-sm")
      this.loaderService.showLoader();
      this.sefService.getOtp({
        emailId: this.email.value,
        mobile: this.mobileNumber.value,
        fullName: this.legalName.value,
      })
        .subscribe((data: any)=>{
          this.loaderService.hideLoader();
          if(data.Status && data.Status === 'Success'){
            this.alertService.successAlert(`<h5>${(data?.Message || 'OTP has been resent to your Mobile and Email ID')}</h5>`, '')
              .then(()=>{
                this.enableResend = !this.enableResend;
                this.emailTimer = this.timer(3, 'email')
                this.mobTimer = this.timer(3, 'mob')
              })
          }else{
            this.alertService.errorAlert({
              title: data?.Message || 'Something went wrong, please try after some time',
              html:''
            })
          }
          this.loading = false
          document?.getElementById('loading')?.classList.remove("spinner-border")
          document?.getElementById('loading')?.classList.remove("spinner-border-sm")
        })
    }catch (e){
      this.loaderService.hideLoader()
    }

    this.loaderService.hideLoader();

  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }
}
