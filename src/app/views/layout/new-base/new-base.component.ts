import { Component, OnInit } from '@angular/core';
import {RouteConfigLoadEnd, RouteConfigLoadStart, Router} from '@angular/router';
import {  Inject,  Renderer2} from '@angular/core';
import {DOCUMENT} from '@angular/common';
 import {StorageService} from "../../../_services/storage.service";
import {UserService} from 'src/app/_services/user.service';
import {MenusService} from 'src/app/_services/menu.service';
import {AlertService} from 'src/app/_services/alert.service';
import {AuthService} from 'src/app/views/pages/auth/auth.service';
@Component({
  selector: 'app-new-base',
  templateUrl: './new-base.component.html',
  styleUrls: ['./new-base.component.scss']
})
export class NewBaseComponent implements OnInit {

  isLoading: boolean;

  constructor(private router: Router, @Inject(DOCUMENT) private document: Document,
  private renderer: Renderer2,
   private storageService: StorageService,
  private userService: UserService,
  private menuService: MenusService,
  private alertService: AlertService,
  private authService: AuthService) {
    // Spinner for lazyload modules
    router.events.forEach((event) => {
      if (event instanceof RouteConfigLoadStart) {
        this.isLoading = true;
      } else if (event instanceof RouteConfigLoadEnd) {
        this.isLoading = false;
      }
    });


  }
  profileData: any;
  Name: any;

  progressPercent=0;

  

  ngOnInit(): void {
    this.userService.getUserProfileNew().subscribe((data) => {
      this.profileData = data;
      var a = this.profileData?.fullName?.split(' ')[0]
      var b = this.profileData?.fullName?.split(' ')[1]
      this.Name = (this.profileData?.fullName?.split(' ')[1]) ? (a?.substring(0, 1) + b?.substring(0, 1)).toUpperCase() : a?.substring(0, 2)?.toUpperCase() || 'UN'
      localStorage.setItem("user", this.profileData?.USERID)
      const {Menu} = data;
      this.menuService.structuredMenu(Menu).then((structMenu)=>{
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
    this.menuService.getProgress().then((proPer)=>{
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


}
