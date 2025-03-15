import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiHttpService } from 'src/app/_services/api-http.service';
import { environment } from 'src/environments/environment';
import {DataTable} from "simple-datatables";
import * as XLSX from 'xlsx';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { DaterangepickerDirective } from 'ngx-daterangepicker-material';

const {API_URL} = environment;
@Component({
  selector: 'app-payout',
  templateUrl: './payout.component.html',
  styleUrls: ['./payout.component.scss']
})
export class PayoutComponent implements OnInit {
  public areaChartOptions: any = {};
  Message: string='';
  TransactionData: any;
  TransactionDate: any;
  Result: any;
  currentDate:any
  newcurrentDate:any
  newDate:any
  newMinDate:any
  availablebalance: any;
  public monthlySalesChartOptions: any = {};
  response :any =  {
	
    "fromDate":"20 May 2023",
    
    "toDate":"03 Jun 2023",
    
    todatalDays:"15",
    
    values:[
    [
        4,3,10,9,29,19,25,9,12,7,19,5,13,9,17,2
      ], [
        2,3,8,7,22,16,23,7,11,5,12,5,10,4,15,2
      ],
    [
        4,3,10,9,29,19,25,9,12,7,19,5,13,9,17,2
      ], [
        2,3,8,7,22,16,23,7,11,5,12,5,10,4,15,2
      ]
    ],
    name : [
    'Success ',' Failed','Pending','Completed']	
    }

  obj = {
    primary        : "#6571ff",
    secondary      : "#7987a1",
    // success: "#05a34a",
    success: "#0BDA51",
    info           : "#66d1d1",
     // warning: "#fbbc06",
     warning: "#ff7c00",
    // danger: "#ff3366",
    danger: "#E0115F",
    light          : "#e9ecef",
    dark           : "#060c17",
    muted          : "#7987a1",
    gridBorder     : "rgba(77, 138, 240, .15)",
    bodyColor      : "#000",
    cardBg         : "#fff",
    fontFamily     : "'Roboto', Helvetica, sans-serif"
  }
  barchart: any;
  TotalPending: any;
  TotalSuccess: any;
  TotalFailed: any;
  reportData: any;
  dataTable: DataTable;
  rowData: any=[];
  todayWithPipe: string;
  fileName: string;

  selectedDate: NgbDateStruct;
  date: {year: number, month: number};
  selected: { startDate: Dayjs, endDate: Dayjs };
  customDate :any= false
  DateCustom :any= false
  defaultDatepickerCode: any;
  inPopupCode: any;
  rangeSelectionCode: any;
  rangeSelectionPopupCode: any;

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

  constructor(private apiservice: ApiHttpService,private datePipe: DatePipe,private calendar: NgbCalendar, public formatter: NgbDateParserFormatter) {
    // this.fromDate = calendar.getNext(calendar.getToday(), 'd', -10);
    // this.toDate = calendar.getToday();
    this.TodayDate()
   }

  ngOnInit(): void {debugger
    // this.areaChartOptions = this.getAreaChartOptions(this.obj);
    var date = new Date()
    this.currentDate = this.datePipe.transform(date, 'yyyy-MM-dd')
    this.newcurrentDate = this.datePipe.transform(date, 'yyyy-MM-dd')
    this.getData().subscribe((res:any)=>{debugger
      this.Result = res[0]
      this.TransactionData = Object.keys(res[0])
    })

    this.getDatatwo().subscribe((res:any)=>{debugger
     this.availablebalance=res[0].AvailableBalance
    })
    this.getBarData()
    this.getReport(this.currentDate+'#'+this.newcurrentDate)
    
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



  getData(){
    var date=new Date()
    this.currentDate = this.datePipe.transform(date, 'yyyy-MM-dd')
    return this.apiservice
    .post(
      `${API_URL}/GetDropdown`,
      {
        "Type": "36",
        "Value": localStorage.getItem('user')+'#'+this.currentDate+'#'+this.newcurrentDate
      }
    )
  }
  getReport(date:any){
    return this.apiservice
    .post(
      `${API_URL}/GetDropdown`,
      {
        "Type": "45",
        "Value": localStorage.getItem('user')+'#'+date
      }
    ).subscribe((res:any)=>{debugger
      if (!res  ) {
        this.Message = "No Recharge Data Found!"
        // this.alertService.errorAlert({
        //   title: "No Recharge Data Found!",
        //   // backdrop: true,
        //   toast: true,
        //   timer: 2000, position: 'top-end'
        // })
      }else{
        this.Message = ""
      }

      this.reportData=res
      this.rowData=res
      this.dataTable ? this.dataTable.destroy() : console.log(this.rowData)
      this.rowData ? this.dataTable = new DataTable("#dataTableExample", {
        info: false,
        ordering: false,
        paging: false,
        searchable: false,
    }) : this.dataTable.destroy()

      // this.dataTable.columns().add(data);
      if (this.rowData) {
        this.rowData.forEach((element: any) => {
          this.dataTable.rows().add(Object.values(element));
        })
      }

     })
  }
  getKeys(data:any){
return Object.keys(data[0])
  }
  getDatatwo()
  {
    var date=new Date()
    this.currentDate = this.datePipe.transform(date, 'yyyy-MM-dd')
    return this.apiservice
    .post(
      `${API_URL}/GetDropdown`,
      {
        "Type": "38",
        "Value": localStorage.getItem('user')+'#'+this.currentDate+'#'+this.newcurrentDate
      }
    )

  }
  OnlyNumbersAllowed(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    return (charCode > 47 && charCode < 58);

  }
  search()
  {debugger
    this.DateCustom=false
    this.currentDate = this.fromDate.year + "-" + this.fromDate.month + "-" + this.fromDate.day  
    this.newcurrentDate = this.toDate.year + "-" + this.toDate.month + "-" + this.toDate.day 
      this.apiservice
    .post(
      `${API_URL}/GetDropdown`,
      {
        "Type": "36",
        "Value": localStorage.getItem('user')+'#'+this.currentDate+'#'+this.newcurrentDate
      }
    ).subscribe((res:any)=>{debugger
      this.Result = res[0]
      this.TransactionData = Object.keys(res[0])
      this.getBarData()
      this.getReport(this.currentDate+'#'+this.newcurrentDate)
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
 


  exportexcel(): void {
    /* pass here the table id */
    let element = document.getElementById('dataTableExample');
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    var random = Math.floor(Math.random() * 10000000000 + 1);

    var today = new Date();
    this.todayWithPipe = today.getFullYear().toString() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + ("0" + today.getDate()).slice(-2) + "-" + random.toString().slice(-4);
    this.fileName = 'Report_' + this.todayWithPipe + '.xlsx';
    XLSX.writeFile(wb, this.fileName);

  }
  getBarData() {
    // var date = new Date()
    // this.currentDate = this.datePipe.transform(date, 'yyyy-MM-dd')
    return this.apiservice
      .post(
        `${API_URL}/GetDropdown`,
        {
          "Type": "43",
          "Value": localStorage.getItem('user')+'#'+this.currentDate+'#'+this.newcurrentDate
        }
      ).subscribe((res: any) => {
        debugger
        this.barchart = res[0]
        this.TransactionDate = this.barchart.TransactionDate
        this.TotalSuccess = this.barchart.TotalSuccess
        this.TotalPending = this.barchart.TotalPending
        this.TotalFailed = this.barchart.TotalFailed
        this.monthlySalesChartOptions = this.getMonthlySalesChartOptions(this.obj, this.TransactionDate, this.TotalSuccess, this.TotalPending,this.TotalFailed);
      })
  }
  getMonthlySalesChartOptions(obj: any, date: any, data1: any, data2: any,data3:any) {
    debugger
    return {
      series: [{
        name: 'Total Success',
        data: data1.split(',')
      },
      {
        name: 'Total Pending',
        data: data2.split(',')
      },
      {
        name: 'Total Failed',
        data: data2.split(',')
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
      colors: [obj.success, obj.warning, obj.danger],
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
  generateDayWiseTimeSeries(s: number, count: number) {
    var values = [[
      4,3,10,9,29,19,25,9,12,7,19,5,13,9,17,2,7,5
    ], [
      2,3,8,7,22,16,23,7,11,5,12,5,10,4,15,2,6,2
    ],
    [
      2,3,8,7,22,16,23,7,11,5,12,5,10,4,15,2,6,2
    ],
    [
      2,3,8,7,22,16,23,7,11,5,12,5,10,4,15,2,6,2
    ],
    
  ];
    var i = 0;
    var series: any[] = [];
    var x = new Date("15 May 2023").getTime();
    while (i < count) {
      series.push([x, values[s][i]]);
      x += 86400000;
      i++;
      console.log(x,"::::::",s,"::::",i,":::::::::::"+values[s][i])
    }
    console.log(series)
    return series;
  }
 
 
   getAreaChartOptions(obj: any) {
    return {
      series: [
        {
          name: 'Total Transaction',
          data: this.generateDayWiseTimeSeries(0, 18)
        },
        {
          name: 'Success',
          data: this.generateDayWiseTimeSeries(3, 18)
        },
        {
          name: 'Pending',
          data: this.generateDayWiseTimeSeries(2, 18)
        },
       {
          name: 'Failed',
          data: this.generateDayWiseTimeSeries(1, 18)
        }
       
      
      ],
      chart: {
        type: "area",
        height: 300,
        parentHeightOffset: 0,
        foreColor: obj.bodyColor,
        background: obj.cardBg,
        toolbar: {
          show: false
        },
        stacked: true,
      },
      colors: [obj.primary,obj.info,obj.warning,obj.danger ],
      stroke: {
        curve: "smooth",
        width: 3
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        type: "datetime",
        axisBorder: {
          color: obj.gridBorder,
        },
        axisTicks: {
          color: obj.gridBorder,
        },
      },
      yaxis: {
        title: {
          text: 'Transaction Count',
        },
        tickAmount: 4,
        min: 0,
        labels: {
          offsetX: 0,
        },
        tooltip: {
          enabled: true
        }
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
      tooltip: {
        x: {
          format: "dd MMM yyyy"
        },
      },
      fill: {
        type: 'solid',
        opacity: [0.4,0.25],
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
    }
  };
 


}
