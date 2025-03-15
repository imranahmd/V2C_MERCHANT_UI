import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { StorageService } from "../../../_services/storage.service";
import { UserService } from 'src/app/_services/user.service';
import { MenusService } from 'src/app/_services/menu.service';
import { AlertService } from 'src/app/_services/alert.service';
import { AuthService } from 'src/app/views/pages/auth/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  profileData: any;
  Name: any;
  progressPercent = 0;
  checked: any;
  Mode: any = false
  modeValue = 'Payout'
  switchMode = 'on'
  type: string | null;
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    private router: Router,
    private storageService: StorageService,
    private userService: UserService,
    private menuService: MenusService,
    private alertService: AlertService,
    private authService: AuthService
  ) {
  }

  ngOnInit(): void {
    debugger
    var mode = localStorage.getItem("mode")
    const element = <HTMLElement>document.getElementById("formSwitch1");

    if (mode == "2") {
      element.setAttribute("checked", "");
      this.modeValue = "Payin"
      this.switchMode = "off"
    } else {
      element.removeAttribute("checked");
      this.modeValue = "Payout"
      this.switchMode = "on"
    }

    this.userService.getUserProfileNew().subscribe((data) => {
      debugger
      this.profileData = data;
      localStorage.setItem("type", data?.GROUPID?.split('#')[1])
      if(data?.GROUPID?.split('#')[1]=="Payin"||data?.GROUPID?.split('#')[1]=="Both"){
        localStorage.setItem("mode","1") 
      }else if(data?.GROUPID?.split('#')[1]=="Payout"){
        localStorage.setItem("mode","2")
       }
      this.type == data?.GROUPID?.split('#')[1] || localStorage.getItem("type")
      // if (data?.GROUPID?.split('#')[1] == "Payout") {
      //   localStorage.setItem("mode", "1")
      // } else if (data?.GROUPID?.split('#')[1] == "Payin") {
      //   localStorage.setItem("mode", "2")
      // }
      var a = this.profileData?.fullName?.split(' ')[0]
      var b = this.profileData?.fullName?.split(' ')[1]
      this.Name = (this.profileData?.fullName?.split(' ')[1]) ? (a?.substring(0, 1) + b?.substring(0, 1)).toUpperCase() : a?.substring(0, 2)?.toUpperCase() || 'UN'
      localStorage.setItem("user", this.profileData?.USERID)
      const { Menu } = data;
      this.menuService.structuredMenu(Menu).then((structMenu) => {
        localStorage.setItem("user", this.profileData?.USERID)
        if (structMenu.finalMenus[0].ROLENAME != "Merchant") {
          this.alertService.errorAlert({
            title: "No Access! Contact Administrator",
            backdrop: true,
            toast: true,
            timer: 1800,
            position: 'top-end'
          })
          this.authService.logout();
        }
      });

    })
    this.menuService.getProgress().then((proPer) => {
      this.progressPercent = proPer;
    })
  }

  /**
   * Sidebar toggle on hamburger button click
   */
  toggleSidebar(e: Event) {
    e.preventDefault();
    this.document.body.classList.toggle('sidebar-open');
  }

  /**
   * Logout
   */
  onLogout(e: Event) {
    e.preventDefault();
    this.storageService.clean()

    if (!this.storageService.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
    }
  }

  onChangePassword(e: Event) {
    e.preventDefault();
    this.router.navigate(['/change-password']);
  }
  onchange(event: any) {
    debugger
   
    
    const element = <HTMLElement>document.getElementById("formSwitch1");
    if (element.hasAttribute("checked")) {
      element.removeAttribute("checked");
      localStorage.setItem("mode", "1")
      this.modeValue = "Payout"
      this.switchMode = "on"
    } else {
      element.setAttribute("checked", "");
      localStorage.setItem("mode", "2")
      this.modeValue = "Payin"
      this.switchMode = "off"
    }
    // this.checked=event.checked
    // if(this.checked){
    //   localStorage.setItem("mode","2")
    // }
    if(this.router.url =='/general/home'){
      window.location.reload() 
    }else{
      this.router.navigate([  '/']).then(() => {
        window.location.reload();
      });
    }
      }

}
