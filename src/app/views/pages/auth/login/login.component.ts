import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from "../auth.service";
import {StorageService} from "../../../../_services/storage.service";
import * as CryptoJS from 'crypto-js';
import {MenusService} from "../../../../_services/menu.service";
import {AlertService} from "../../../../_services/alert.service";
import {environment} from "../../../../../environments/environment";
import {MerchantService} from "../../merchants/merchant-master/merchant.service";

const {API_URL} = environment

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  returnUrl: any;
  form: any = {
    username: null,
    password: null
  };
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];
  checked: boolean = false;
  type: any;
  mode: string | null;
  images: any;
  dataArray:any;
  dataSliderTextArray:any;
  activeSlide = 0;

  constructor(private menuService: MenusService, private alertService: AlertService, private router: Router, private route: ActivatedRoute, private authService: AuthService, private storageService: StorageService, private merchantService: MerchantService) {
     localStorage.setItem("mode","1")
     this.images = ["/assets/images/image3.png", "/assets/images/images2.png", "/assets/images/image3.png"];
     this.dataArray = ["Expand globally and expand diverse" + `<br /> `+ " payment for different customer","Strengthen transaction security for"  + `<br /> `+ "heightened protection and customer trust.","Integrate payment systems effortlessly to"  + `<br /> `+ "drive business growth."];
     this.dataSliderTextArray  = ["Global Transaction","Smooth Integration","Fortified Security"]
  }
  ngAfterViewInit(){
  this.authService.getProfile().subscribe({
    next: data => {debugger
      // const {Menu} = data;
      // localStorage.setItem("mode","1")
      if(data?.GROUPID?.split('#')[1]=="Payin"||data?.GROUPID?.split('#')[1]=="Both"){
        localStorage.setItem("mode","1")
      }else if(data?.GROUPID?.split('#')[1]=="Payout"){
        localStorage.setItem("mode","2")
      }}})
}
  getCookie(name: any): any {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts;
  }

  Remember(event: any) {

    //  this.checked = event.checked

    function setCookie(key: any, value: any) {
      document.cookie = key + "=" + escape(value) +
        ";domain=" + window.location.hostname +
        ";path=/";
    }

    // delete cookie
    function deleteCookie(name: any) {
      // setCookie(name, "");
      document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

    // var remember_me_check_box = $("#authCheck")
    // handle click and add & delete cookie

    if (this.checked) {
      deleteCookie('authCheck');
      // localStorage.removeItem('authCheck');
      //  localStorage.removeItem('authCheck');
      var username = this.form.username
      var password = this.form.password
      var data = {[username]: password}
      var dataString = JSON.stringify(data)
      var encData = btoa(dataString)
      setCookie('authCheck', encData);
      //   localStorage.setItem('authCheck', btoa(this.f.username.value+","+ this.f.password.value));
      //   localStorage.setItem('authCheck', btoa(this.f.username.value+","+ this.f.password.value));

    }
    // else {
    //   deleteCookie('authCheck');
    //   localStorage.removeItem('authCheck');
    //   localStorage.removeItem('authCheck');

    //   setCookie('authCheck', 'no');
    //   localStorage.setItem('authCheck', 'no');
    //   localStorage.setItem('authCheck', 'no');
    // }
  }

  toggle(event: any) {

    this.checked = event.target.checked
  }

  ngOnInit(): void {

    if (this.getCookie('authCheck')) {
      var w = this.getCookie('authCheck')[1]
      var x = atob(decodeURIComponent(w))
      var y = JSON.parse(x)

      if (y) {

        var user = Object.keys(y)[0]
        var pass = Object.values(y)[0]
        //y[1].split(',')[1]
        this.form.username = user
        this.form.password = pass

      }
    }

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    if (this.storageService.isLoggedIn()) {
      this.isLoggedIn = true;
      this.roles = this.storageService.getUser().roles;
      this.router.navigate([this.returnUrl]);
    }
  }

  // onLoggedin(e: Event) {
  //   e.preventDefault();
  //   localStorage.setItem('isLoggedin', 'true');
  //   if (localStorage.getItem('isLoggedin')) {
  //     this.router.navigate([this.returnUrl]);
  //   }
  // }

  onLoggedin(e: Event, f: any): void {debugger
    e.preventDefault();

    if (f.form.status == 'VALID') {
      var {username, password} = this.form;
      localStorage.setItem("user", username)
      var key = CryptoJS.enc.Base64.parse('QmFyMTIzNDVCYXIxMjM0NQ==');
      var initVector = CryptoJS.enc.Base64.parse('UmFuZG9tSW5pdFZlY3Rvcg==');

      //alert($("#password").val());

      var encryptedPassword = CryptoJS.AES.encrypt(password, key,
        {
          iv: initVector,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        });

      var encryptedPasswordString = encryptedPassword.ciphertext.toString(CryptoJS.enc.Base64);
      var button = document.getElementById('password') as HTMLElement;

      button.setAttribute('value', encryptedPasswordString);
      //$("#password").val(encryptedPasswordString)
      password = encryptedPasswordString

      this.authService.login(username, password).subscribe({
        next: data => {debugger
          if (data == undefined) {
            this.alertService.toastErrorMessageAlert({
              title: 'Invalid Username or Password!',
            })
            return
          }
         
          this.Remember(''),
            this.alertService.toastSuccessMessageAlert({
              title: 'Login successfully',
              html: '<b>Welcome...</b>'
            })
          this.storageService.saveUser(data);
          this.authService.getProfile().subscribe({
            next: data => {debugger
              // const {Menu} = data;
              if(data?.GROUPID?.split('#')[1]=="Payin"||data?.GROUPID?.split('#')[1]=="Both"){
                localStorage.setItem("mode","1")
                this.mode = localStorage.getItem("mode")||"1"
              }else if(data?.GROUPID?.split('#')[1]=="Payout"){
                localStorage.setItem("mode","2")
                this.mode = localStorage.getItem("mode")||"2"
              }
              let Menu
              localStorage.setItem("type",data?.GROUPID?.split('#')[1])
               localStorage.setItem('logo', data.Data);
               if(data?.GROUPID?.split('#')[1]=='Payout'||this.mode =='2'){debugger
                this.authService.getTypeMenus("2").subscribe((data) => {debugger
                  Menu = data;
                  // alert(Menu)
                  localStorage.setItem('menuItemsFormatted', JSON.stringify(Menu));
                  this.menuService.structuredMenu(Menu).then((menuData)=>{debugger
                    if (menuData.finalMenus[0].ROLENAME != "Merchant") {
                      this.alertService.errorAlert({
                        title: "No Access! Contact Administrator",
                        backdrop: true,
                        toast: true,
                        timer: 2000, position: 'top-end'
                      })
                      this.authService.logout();
                      return;    
                    }
                  })
                })
              }else{debugger
                    Menu = data.Menu;
                    // alert(Menu)
                    this.menuService.structuredMenu(Menu).then((menuData)=>{debugger

                      localStorage.setItem('menuItemsFormatted', JSON.stringify(menuData));
                      if (menuData.finalMenus[0].ROLENAME != "Merchant") {
                        this.alertService.errorAlert({
                          title: "No Access! Contact Administrator",
                          backdrop: true,
                          toast: true,
                          timer: 2000, position: 'top-end'
                        })
                        this.authService.logout();
                        return;
      
                      }
                    })
                  }
              

            }
          })
          this.isLoginFailed = false;
          this.isLoggedIn = true;
          this.roles = this.storageService.getUser().roles;
          if (this.storageService.isLoggedIn()) {
            this.merchantService.getMerchant(username)
              .subscribe((data)=>{debugger
                console.log("Merchant Data---->", data)
                if(data && (data[0]?.status === 'Self-Initiated' || !data[0]?.status)){
                  this.router.navigate(['/merchants/self-onboarding'])
                }else{
                  this.router.navigate([this.returnUrl || '/']).then(() => {
                    window.location.reload();
                  });
                }

              })

            // .then(() => {
            //   this.router.navigate(['/merchants/merchant-master']);
            //   });
            // console.log("==========>", this.returnUrl)
            // this.router.navigate(['/']);
          }
          // this.reloadPage();
          // this.router.navigate(['/']);
        },
        error: err => {
          localStorage.clear();
          this.alertService.toastErrorMessageAlert({
            title: 'Something went wrong!',
          })

          // Swal.fire({
          //   icon: 'error',
          //   title: 'Oops...',
          //   text: 'Something went wrong!',
          //   // footer: '<a href>Why do I have this issue?</a>'
          // })
          console.log("err====>", err);
          this.errorMessage = err.error?.message;
          this.isLoginFailed = true;
        }
      });

    }
    f.submitted = true
// f.form.status=='INVALID'


  }


  onSlideChange(event: any) {
    console.log("abc")
    this.activeSlide = +event.current;
    console.log(this.activeSlide);
  }

  reloadPage(): void {
    window.location.reload();
  }


}
