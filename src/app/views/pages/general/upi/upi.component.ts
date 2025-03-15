import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ApiHttpService } from 'src/app/_services/api-http.service';
import { environment } from 'src/environments/environment';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { DaterangepickerDirective } from 'ngx-daterangepicker-material';

const { API_URL } = environment;
@Component({
  selector: 'app-upi',
  templateUrl: './upi.component.html',
  styleUrls: ['./upi.component.scss']
})
export class UpiComponent implements OnInit {
  TransactionData: any;
  Result: any;
  currentDate: any
  newcurrentDate: any
  newDate: any
  newMinDate: any
  availablebalance: any;
  public monthlySalesChartOptions: any = {};
  public pieChartOptions: any = {};
  obj = {
    primary: "#6571ff",
    secondary: "#7987a1",
    // success: "#05a34a",
    success: "#0BDA51",
    info: "#66d1d1",
    // warning: "#fbbc06",
    warning: "#ff7c00",
    // danger: "#ff3366",
    danger: "#E0115F",
    light: "#e9ecef",
    dark: "#060c17",
    muted: "#7987a1",
    gridBorder: "rgba(77, 138, 240, .15)",
    bodyColor: "#000",
    cardBg: "#fff",
    fontFamily: "'Roboto', Helvetica, sans-serif"
  }
  barchart: any;
  TransactionDate: any;
  TotalRevenue: any;
  NetSettlement: any;
  piechart: any;
  Labels: any;
  selectedDate: NgbDateStruct;
  date: {year: number, month: number};
  customDate :any= false
  DateCustom :any= false
  defaultDatepickerCode: any;
  inPopupCode: any;
  rangeSelectionCode: any;
  rangeSelectionPopupCode: any;
  selected: { startDate: Dayjs, endDate: Dayjs };
  hoveredDate: NgbDate | null = null;

  fromDate:any ;
  toDate: any;
  currentWeek: number;
  currentMonth: any=[];
  month: any;
  firstDate:any={};
  currentYear: number;
  active: boolean[]= [true,false,false];
  monthName : any =[ "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December" ] 

  constructor(private apiservice: ApiHttpService, private datePipe: DatePipe,private calendar: NgbCalendar, public formatter: NgbDateParserFormatter) { 
    // this.fromDate = calendar.getNext(calendar.getToday(), 'd', -10);
    // this.toDate = calendar.getToday();
    this.TodayDate()
  }

  ngOnInit(): void {
    debugger
    var date = new Date()
    this.currentDate = this.datePipe.transform(date, 'yyyy-MM-dd')
    this.newcurrentDate = this.datePipe.transform(date, 'yyyy-MM-dd')
    this.getData().subscribe((res: any) => {
      debugger
      this.Result = res[0]
      this.TransactionData = Object.keys(res[0])
    })
    this.getBarData()
    this.getPieData()

    this.getDatatwo()
   
    // this.defaultDatepickerCode = defaultDatepicker;
    // this.inPopupCode = inPopup;
    // this.rangeSelectionCode = rangeSelection;
    // this.rangeSelectionPopupCode = rangeSelectionPopup;


  }



  selectToday(): void {
    this.selectedDate = this.calendar.getToday()
  }

  scrollTo(element: any) {
    element.scrollIntoView({behavior: 'smooth'});
  }



  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
      if ( this.toDate !=''|| this.toDate !=null) {
        this.DateCustom = false
      }
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }



  getData() {
    var date = new Date()
    this.currentDate = this.datePipe.transform(date, 'yyyy-MM-dd')
    return this.apiservice
      .post(
        `${API_URL}/GetDropdown`,
        {
          "Type": "35",
          "Value": localStorage.getItem('user') + '#' + this.currentDate+'#'+this.newcurrentDate
        }
      )
  }
  getBarData() {debugger
    // var date = new Date()
    // this.currentDate = this.datePipe.transform(date, 'yyyy-MM-dd')
    return this.apiservice
      .post(
        `${API_URL}/GetDropdown`,
        {
          "Type": "41",
          "Value": localStorage.getItem('user') + '#' + this.currentDate+'#'+this.newcurrentDate
        }
      ).subscribe((res: any) => {
        debugger
        this.barchart = res[0]
        this.TransactionDate = this.barchart.TransactionDate
        // this.currentDate.setDate(this.currentDate.getDate() - 365);
        // this.TransactionDate = [
        //   this.datePipe.transform(date, 'yyyy-MM-dd')
        // ]
        // this.TransactionDate = this.barchart.TransactionDate
        this.TotalRevenue = this.barchart.TotalRevenue
        this.NetSettlement = this.barchart.NetSettlement
        this.monthlySalesChartOptions = this.getMonthlySalesChartOptions(this.obj, this.TransactionDate, this.TotalRevenue, this.NetSettlement);
      })
  }
  getPieData() {debugger
    // var date = new Date()
    // this.currentDate = this.datePipe.transform(date, 'yyyy-MM-dd')
    return this.apiservice
      .post(
        `${API_URL}/GetDropdown`,
        {
          "Type": "42",
          "Value": localStorage.getItem('user') + '#' + this.currentDate+'#'+this.newcurrentDate
        }
      ).subscribe((res: any) => {
        debugger
        this.piechart = res[0]
        this.Labels = Object.keys(this.piechart)
        this.pieChartOptions = this.getPieChartOptions(this.obj,this.piechart,this.Labels);
      })
  }
  addRtlOptions() {

    this.monthlySalesChartOptions.yaxis.labels.offsetX = -10;
    this.monthlySalesChartOptions.yaxis.title.offsetX = -70;
  }
  getDatatwo() {
    // var date = new Date()
    // this.currentDate = this.datePipe.transform(date, 'yyyy-MM-dd')
      this.apiservice
      .post(
        `${API_URL}/GetDropdown`,
        {
          "Type": "37",
          "Value": localStorage.getItem('user') + '#' + this.currentDate+'#'+this.newcurrentDate
        }
      ) .subscribe((res: any) => {
        debugger
        this.availablebalance = res[0].Pending_Settlement
      })
  

  }
  OnlyNumbersAllowed(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    return (charCode > 47 && charCode < 58);

  }
  search() {
    debugger
    this.DateCustom=false
    this.currentDate = this.fromDate.year + "-" + this.fromDate.month + "-" + this.fromDate.day  
    this.newcurrentDate = this.toDate.year + "-" + this.toDate.month + "-" + this.toDate.day 
    this.apiservice
      .post(
        `${API_URL}/GetDropdown`,
        {
          "Type": "35",
          "Value": localStorage.getItem('user') + '#' + this.currentDate+'#'+this.newcurrentDate
        }
      ).subscribe((res: any) => {
        debugger
        this.Result = res[0]
        this.TransactionData = Object.keys(res[0])
        this.getBarData()
        this.getPieData()
        this.getDatatwo() 
      })
  }

  datechange(event: any) {
    debugger
    var startday = {
      day: event?.startDate?.$D||event?.start?.$D,
      month: (event?.startDate?.$M + 1)||(event?.start?.$M + 1),
      year: event?.startDate?.$y||event?.start?.$y
    }
    var endday = {
      day: event?.endDate?.$D||event?.end?.$D,
      month: (event?.endDate?.$M + 1)||(event?.end?.$M + 1),
      year: event?.endDate?.$y||event?.end?.$y
    }
    this.fromDate = startday
    this.toDate = endday
  }
  TodayDate() {
    debugger
    this.active = [true, false, false, false]
    // this.fromDate =  this.calendar.getToday();
    // var startday:any=new Date(this.calendar.getToday().year, this.calendar.getToday().month - 1, this.calendar.getToday().day);
    //  var newdayjs ={
    //   $D: this.calendar.getToday().day,
    //   $H: 23,
    //   $L: "en",
    //   $M: this.calendar.getToday().month-1,
    //   $W: 3,
    //   $d: {

    //   },
    //   $isDayjsObject: true,
    //   $m: 59,
    //   $ms: 0,
    //   $s: 59,
    //   $u: true,
    //   $x: {

    //   },
    //   $y: this.calendar.getToday().year
    // }
    //   this.selected.startDate = moment().subtract(4, 'days').startOf('day');
    // this.selected.endDate = moment().subtract(1, 'days').startOf('day');
    this.selected = {
      startDate: dayjs(),
      endDate: dayjs()
    }
    this.datechange(this.selected);
    // this.toDate = this.calendar.getToday();
    this.search();
    this.getDatatwo()

  }

  WeekDate() {
    debugger
    this.active = [false, true, false, false]
    // alert (this.calendar.getWeekday(this.calendar.getToday()))
    // this.currentWeek = this.calendar.getWeekday(this.calendar.getToday());
    // this.fromDate = this.calendar.getNext(this.calendar.getToday(), 'd', -this.currentWeek + 1);
    // this.toDate = this.calendar.getToday();
    this.selected = {
      startDate: dayjs().startOf('week'),
      endDate: dayjs()
    }
    this.datechange(this.selected);
    this.search();
    this.getDatatwo() 

  }

  MonthDate() {
    debugger
    this.active = [false, false, true, false]

    // this.currentMonth=this.calendar.getToday().month
    // this.currentYear=this.calendar.getToday().year
    // this.firstDate={

    // }
    this.selected = {
      startDate: dayjs().startOf('month'),
      endDate: dayjs()
    }
    this.datechange(this.selected);
    // this.fromDate = this.calendar.getNext(this.calendar.getToday(), 'd', -this.calendar.getToday().day + 1);
    // this.toDate = this.calendar.getToday();
    this.search();
    this.getDatatwo() 
  }

  CustomDate() {
    debugger
    this.active = [false, false, false, true]
    this.DateCustom = true
    // document.getElementById('datePickerElement')?.click()
    // openDatepicker() 
    // this.pickerDirective.open()
    // this.ref?.click()
    let element: HTMLElement = document.getElementsByClassName('datePickerElement')[0] as HTMLElement;
    element.click();
    this.search();

    // this.fromDate = this.calendar.getNext(this.calendar.getToday(), 'd', -10);
    // this.toDate = this.calendar.getToday();
  }

  getMonthName(param:any){
    return this.monthName[param-1].substring(0,3)
  }
 



  getMonthlySalesChartOptions(obj: any, date: any, data1: any, data2: any) {
    debugger
    return {
      series: [
        {
          name: 'Net Settlement',
          data: data2.split(',')
        },{
        name: 'Total Revenue',
        data: data1.split(',')
      }],

      chart: {
        type: 'bar',
        height: '318',
        parentHeightOffset: 0,
        foreColor: obj.bodyColor,
        background: obj.cardBg,
        toolbar: {
          show: false
        },
      },
      colors: [obj.primary, obj.secondary],
      fill: {
        opacity: .9
      },
      grid: {
        padding: {
          bottom: -4
        },
        borderColor: obj.gridBorder,
        xaxis: {
          lines: {
            show: true
          }
        }
      },
      xaxis: {
        type: 'datetime',
        categories: date.split(","),
        axisBorder: {
          color: obj.gridBorder,
        },
        axisTicks: {
          color: obj.gridBorder,
        },
      },
      yaxis: {
        title: {
          // text: 'Number of Sales',
          style: {
            size: 9,
            color: obj.muted
          }
        },
        labels: {
          offsetX: 0,
        },
      },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: 'center',
        fontFamily: obj.fontFamily,
        itemMargin: {
          horizontal: 8,
          vertical: 0
        },
      },
      stroke: {
        width: 0
      },
      dataLabels: {
        enabled: false,
        style: {
          fontSize: '10px',
          fontFamily: obj.fontFamily,
        },
        offsetY: -27
      },
      plotOptions: {
        bar: {
          columnWidth: "50%",
          borderRadius: 4,
          dataLabels: {
            position: 'top',
            orientation: 'vertical',
          }
        },
      }
    }
  }
  getPieChartOptions(obj: any, data:any,labels: any) {debugger
    return {
      series: Object.values(data),
      chart: {
        height: 300,
        type: "pie",
        foreColor: obj.bodyColor,
        background: obj.cardBg,
        toolbar: {
          show: false
        },
      },
      labels:  ["Success","Pending","Failed"],
      colors: [obj.success, obj.warning, obj.danger],
      stroke: {
        colors: ['rgba(0,0,0,0)']
      },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: 'center',
        fontFamily: obj.fontFamily,
        itemMargin: {
          horizontal: 8,
          vertical: 0
        },
      },
      dataLabels: {
        enabled: false
      }
    }
  };
}

