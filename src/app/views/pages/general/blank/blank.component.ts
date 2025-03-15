import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from 'src/app/_services/alert.service';
import { AuthService } from 'src/app/views/pages/auth/auth.service';
import { MenusService } from 'src/app/_services/menu.service';
import { UserService } from 'src/app/_services/user.service';
import { GeneralService } from '../general.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-blank',
  templateUrl: './blank.component.html',
  styleUrls: ['./blank.component.scss'],
  preserveWhitespaces: true

})
export class BlankComponent implements OnInit {
  UserType: any

  /**
   * Apex chart
   */
  public customersChartOptions: any = {};
  public ordersChartOptions1: any = {};
  public ordersChartOptions2: any = {};
  public ordersChartOptions3: any = {};
  public growthChartOptions: any = {};
  public revenueChartOptions: any = {};

  public monthlySalesChartOptions1: any = {};
  public monthlySalesChartOptions2: any = {};
  public monthlySalesChartOptions3: any = {};

  public cloudStorageChartOptions: any = {};

  // colors and font variables for apex chart
  obj = {
    primary: "#6571ff",
    secondary: "#7987a1",
    success: "#05a34a",
    info: "#66d1d1",
    warning: "#fbbc06",
    danger: "#ff3366",
    light: "#e9ecef",
    dark: "#060c17",
    muted: "#7987a1",
    gridBorder: "rgba(77, 138, 240, .15)",
    bodyColor: "#000",
    cardBg: "#fff",
    fontFamily: "'Roboto', Helvetica, sans-serif"
  }

  /**
   * NgbDatepicker
   */
  MinDate: any = {
    day: (this.calendar.getToday().day - 30) > 0 ? (this.calendar.getToday().day - 30) : this.calendar.getToday().day,
    month: (this.calendar.getToday().day - 30) > 0 ? this.calendar.getToday().month : this.calendar.getToday().month - 1,
    year: (this.calendar.getToday().month - 1) == 0 ? this.calendar.getToday().year - 1 : this.calendar.getToday().year
  }
  newMinDate: any = this.calendar.getToday()
  currentDate: any;
  admindata: {};
  result: any;
  date: any;
  value: any = 10;
  userData: any;
  currentNewDate: any;

  newDate: any = this.calendar.getToday();
  mode: string | null;
  data: any;

  constructor(private calendar: NgbCalendar,private userService:UserService, private menuService: MenusService, private user: UserService, private general: GeneralService, private datepipe: DatePipe, private authService: AuthService, private alertService: AlertService,) {
  }

  ngOnInit(): void {debugger
    
    if (localStorage.getItem("type") == "Payout") {
      // localStorage.setItem("mode", "1")
      this.mode = "2"
    }else if(localStorage.getItem("type") == "Payin"){
      // localStorage.setItem("mode", "2")
      this.mode = "1"
    }else{
      this.mode = localStorage.getItem("mode")
    }
  }
  cycle() {
    debugger
    // this.lifecycle = true
    // this.bulkfile = false
    document.getElementById("home")?.classList.add("show")
    document.getElementById("profile")?.classList.remove("show")
    document.getElementById("home")?.classList.add("active")
    document.getElementById("profile")?.classList.remove("active")

    document.getElementById("home-line-tab")?.classList.add("active")
    document.getElementById("profile-line-tab")?.classList.remove("active")
    // this.refundData = false
    // this.resetform()
    // this.resetBulkform()
    // this.array =[]
  }
  bulk() {
    debugger
    // this.bulkfile = true
    // this.lifecycle = false
    document.getElementById("profile")?.classList.add("show")
    document.getElementById("home")?.classList.remove("show")
    document.getElementById("profile")?.classList.add("active")
    document.getElementById("home")?.classList.remove("active")

    document.getElementById("profile-line-tab")?.classList.add("active")
    document.getElementById("home-line-tab")?.classList.remove("active")
    // this.refundData = false
    // this.resetform()
    // this.resetBulkform()
    // this.array =[]
  }

}