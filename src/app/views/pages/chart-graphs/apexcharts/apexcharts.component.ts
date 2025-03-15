import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {environment} from 'src/environments/environment';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
  ApexTitleSubtitle,
  ApexXAxis,
  ApexYAxis,
  ChartComponent
} from "ng-apexcharts";
import {MenusService} from "../../../../_services/menu.service";
import {AlertService} from "../../../../_services/alert.service";
import {ModalConfig} from "../../../../common/modal/modal.config";
import {ModalComponent} from 'src/app/common/modal/modal.component';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from "@angular/common";
import {ApiHttpService} from 'src/app/_services/api-http.service';

const {API_URL} = environment;

export type newBarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  title: ApexTitleSubtitle;
};
export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  colors: any;
}

@Component({
  selector: 'app-apexcharts',
  templateUrl: './apexcharts.component.html',
  styleUrls: ['./apexcharts.component.scss']
})
export class ApexchartsComponent implements OnInit {
  @ViewChild("chart") chart: ChartComponent;
  @Output() RiskSelectEvent: EventEmitter<any> = new EventEmitter<any>();
  public chartOptions!: Partial<ChartOptions> | any;
  @ViewChild("barchart") barchart: ChartComponent;
  public newchartOptions!: Partial<ChartOptions> | any;
  public chartQuarterOptions!: Partial<ChartOptions> | any;
  configdata: any = false;
  public lineChartOptions: any = {};
  public barChartOptions: any = {};
  public areaChartOptions: any = {};
  public mixedChartOptions: any = {};
  public donutChartOptions: any = {};
  public pieChartOptions: any = {};
  public heatMapChartOptions: any = {};
  public radarChartOptions: any = {};
  public scatterChartOptions: any = {};
  public radialBarChartOptions: any = {};
  RiskChartForm: FormGroup;
  merchantList: ModalConfig;
  riskFlagData = {
    "green": "20.00",
    "Orange": "30.00",
    "red": "10.00",
    "voilet": "40.00",
  }
  obj = {
    blue: "#6fc6ff",
    voilet: '#8f00ff',
    Orange: "#fea501",
    red: "#ff0000",
    green: "#008000",
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
  colors = [
    "#fea501",
    "#8f00ff",
    "#008000",
    "#ff0000",
    "#775DD0",
    "#00D9E9",
    "#FF66C3"
  ];
  Resultdata: any;
  PieChartdata: any;
  piechart: boolean;
  newBarChartOptions: any = false;
  Mid: any;
  BarChartdata: any = '';
  IndexColor: any;
  newarr: any[] = []
  count: any = 0;
  queryParams: any;
  series: any[] = [];
  // colors: any[] = [];
  xaxis: any = {};
  public categoryDefaultValue: any; //set the default value(id)
  permissions: any;
  titletext: {};
  newcolor: any;
  colorarr: any[] = [];
  @ViewChild('modalRisk') private RiskTransactionComponent: ModalComponent;

  constructor(private formBuilder: FormBuilder, private apiHttpService: ApiHttpService, private location: Location, private router: Router, private route: ActivatedRoute, private menuService: MenusService, private alertService: AlertService) {
    this.RiskChartForm = this.formBuilder.group({
      Mid: ['', [Validators.required]]
    })
    this.barChartOptions = false
    this.MerchnatList()

    this.defaultbarchart()


  }

  newPiechart() {
    var arr: any[] = []
    var riskflag = this.PieChartdata
    var obj = {
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
    Object.values(riskflag).forEach(element => {
      arr.push(Number(element))
    });
    Object.keys(riskflag).forEach(element => {
      switch (element) {
        case "red": {
          this.colorarr.push(this.obj.red)
          break;
        }
        case "voilet": {
          this.colorarr.push(this.obj.voilet)
          break;
        }
        case "green": {
          this.colorarr.push(this.obj.green)
          break;
        }
        case "Orange": {
          this.colorarr.push(this.obj.Orange)
          break;
        }
        default: {
          this.colorarr.push(this.obj.blue)
          break;
        }
      }
    });
    this.chartOptions = {
      series: arr,
      chart: {
        width: 468,
        type: "pie",
        foreColor: obj.bodyColor,
        background: obj.cardBg,
        events: {
          // dataPointSelection: (event: any, chartContext: any, config: any) => {
          //   this.configdata = Object.keys(riskflag)[config.dataPointIndex]
          //   console.log(config.dataPointIndex, Object.keys(riskflag)[config.dataPointIndex]);

          // },
          dataPointSelection: (e: any, chart: any, opts: any) => {

            var quarterChartEl = <HTMLElement>document.querySelector("#chart-quarter");
            var yearChartEl = <HTMLElement>document.querySelector("#chart");
            this.newBarChartOptions = true

            if (opts.selectedDataPoints[0].length === 1) {
              if (quarterChartEl.classList.contains("active")) {
                this.updateQuarterChart(chart, "barQuarter");
              } else {
                yearChartEl.classList.add("chart-quarter-activated");
                quarterChartEl.classList.add("active");
                this.updateQuarterChart(chart, "barQuarter");
              }
            } else {
              this.updateQuarterChart(chart, "barQuarter");
            }

            if (opts.selectedDataPoints[0].length === 0) {
              yearChartEl.classList.remove("chart-quarter-activated");
              quarterChartEl.classList.remove("active");
            }
          },
          updated: (chart: any) => {
            this.updateQuarterChart(chart, "barQuarter");
          }

        },
      },
      legend: {
        show: false
      },
      labels: Object.keys(riskflag),
      colors: this.colorarr,
      // responsive: [
      //   {
      //     breakpoint: 10,
      //     options: {
      //       plotOptions: {
      //         bar: {
      //           horizontal: false
      //         }
      //       },
      //       legend: {
      //         position: "bottom"
      //       }
      //     }
      //   }
      // ]
      responsive: [
        {
          breakpoint: 415,
          options: {
            chart: {
              width: 319
            },
            legend: {
              position: "bottom",
              show: false
            }
          }
        }
      ]
    };
  }

  defaultbarchart() {
    this.chartQuarterOptions = {
      series: [
        {
          name: "Risk Code",
          data: []
        }
      ],
      chart: {
        id: "barQuarter",
        height: 400,
        width: "100%",
        type: "bar",
        stacked: true,
        events: {
          dataPointSelection: (event: any, chartContext: any, config: any) => {

            console.log(config.dataPointIndex);
            var newdata = {
              "MerchantId": this.Mid,
              "level": this.IndexColor,
              "RiskCode": Object.keys(this.BarChartdata)[config.dataPointIndex] ? Object.keys(this.BarChartdata)[config.dataPointIndex] : ""
            }
            this.RiskSelectEvent.emit(newdata);
            this.router.navigate(['/dashboard/transactionrisk'], {
              queryParams: {...newdata}
            })
              .then(() => {
                window.location.reload();
              });
            // return await this.RiskTransactionComponent.open();
          },
        }
      },
      plotOptions: {
        bar: {
          columnWidth: "50%",
          horizontal: false
        }
      },
      legend: {
        show: false
      },
      grid: {
        yaxis: {
          lines: {
            show: false
          }
        },
        xaxis: {
          lines: {
            show: false
          }
        }
      },
      yaxis: {
        labels: {
          show: false
        }
      },
      xaxis: {
        categories: []
      },
      title: {
        text: "",
        offsetX: 10
      },
      tooltip: {
        x: {
          formatter: function (val: any, opts: any) {
            return opts.w.globals.seriesNames[opts.seriesIndex];
          }
        },
        y: {
          title: {
            formatter: function (val: any, opts: any) {
              return opts.w.globals.labels[opts.dataPointIndex];
            }
          }
        }
      }
    };
  }


  public updateQuarterChart(sourceChart: any, destChartIDToUpdate: any) {

    // this.newBarChart(this.IndexColor||'')
    this.series = [];
    var seriesIndex = 0;
    // this.colors = [];
    this.xaxis = []
    if (sourceChart.w.globals.selectedDataPoints[0]) {
      var selectedPoints = sourceChart.w.globals.selectedDataPoints;
      for (var i = 0; i < selectedPoints[seriesIndex].length; i++) {
        var selectedIndex = selectedPoints[seriesIndex][i];
        var yearSeriesindex = sourceChart.w.config.series[selectedIndex];
        var yearSeries = sourceChart.w.config.labels[selectedIndex];
        this.IndexColor = yearSeries
        this.newarr = []
        this.IndexColor = yearSeries
        var merchantdata = {
          "level": yearSeries,
          "MerchantId": this.Mid
        }
        this.getdownload(`${API_URL}/getRiskCountData/`, merchantdata).subscribe((res: any) => {

          this.BarChartdata = res;
          // Object.values(this.BarChartdata).forEach(element => {
          //   // this.newarr.push(Number(element))
          //   this.series.push({
          //     name: yearSeries.data[selectedIndex].x,
          //     data: element
          //   });
          // })

          // Object.keys(this.BarChartdata).forEach(key => {
          //   console.log(key, this.BarChartdata[key]);

          // });
          this.titletext = {
            text: this.IndexColor,
            offsetX: 10
          }
          this.series.push({
            name: "Risk Code",
            data: Object.values(this.BarChartdata)
          });
          this.xaxis = {
            "categories": Object.keys(this.BarChartdata)
          }

          if (this.series.length === 0)
            this.series = [
              {
                data: []
              }
            ];

          switch (this.IndexColor) {
            case "red": {
              this.newcolor = this.obj.red
              break;
            }
            case "voilet": {
              this.newcolor = this.obj.voilet
              break;
            }
            case "green": {
              this.newcolor = this.obj.green
              break;
            }
            case "Orange": {
              this.newcolor = this.obj.Orange
              break;
            }
            default: {
              this.newcolor = "#6fc6ff"
              break;
            }
          }
          // if (this.xaxis.length === 0)
          // this.xaxis = [
          //   {
          //     categories: []
          //   }
          // ];
          // this.newcolors.push(this.colors[selectedIndex]);
          return window.ApexCharts.exec(destChartIDToUpdate, "updateOptions", {
            series: this.series,
            xaxis: this.xaxis,
            colors: this.newcolor,
            title: this.titletext,
            fill: {
              colors: this.newcolor
            }
          });
        })
        // series.push({
        //   name: yearSeries.data[selectedIndex].x,
        //   data: yearSeries.data[selectedIndex].quarters
        // });


      }


      // return window.ApexCharts.exec(destChartIDToUpdate, "updateOptions", {
      //   series: this.series,
      //   colors: colors,
      //   fill: {
      //     colors: colors
      //   }
      // });
    }
  }


  ngOnInit(): void {

    const path = this.location.prepareExternalUrl(this.location.path());
    this.permissions = this.menuService.getPermissions(path);

    this.route.queryParams
      .subscribe(params => {
        console.log("account list params-------------->", params);
        this.queryParams = params;
        var midreq = {
          "$ngOptionLabel": params.MerchantId
        }
        this.onSubmit(midreq)
        this.IndexColor = params.level
        this.newBarChart(params.level)
        this.newBarChartOptions = true
        // this.BarChartVisibility = true
        // this.getBarChartOptions(this.obj, params.level)
      })
    // if(!(this.queryParams.MerchantId)){
    //   this.onSubmit('')
    // }
    if (!(this.queryParams.MerchantId) || this.queryParams.MerchantId == '') {
      this.categoryDefaultValue = "All"
    } else {
      this.categoryDefaultValue = this.queryParams.MerchantId
      // this.RiskChartForm.controls['Mid'].setValue(this.queryParams.MerchantId)

    }
    this.merchantList = {
      modalTitle: "Transaction List",
      modalSize: 'lg',
      hideCloseButton(): boolean {
        return true;
      },
      hideDismissButton(): boolean {
        return true
      }
    }

  }

  onSubmit(value: any) {

    var Mid
    if (value) {
      this.Mid = value.$ngOptionLabel ? value.$ngOptionLabel.trim() : ""
    } else {
      this.Mid = ''
    }
    var merchantdata = {
      "MerchantId": this.Mid
    }
    this.getdownload(`${API_URL}/getRiskLevelData/`, merchantdata).subscribe((res: any) => {

      this.PieChartdata = res;

      if (this.PieChartdata.error) {
        this.piechart = false
        this.defaultbarchart()
      } else {
        this.piechart = true
        this.newPiechart()
        this.defaultbarchart()
      }

    })

  }


  getdownload(url: string, data: any) {
    return this.apiHttpService.post(url, data)
  }

  MerchnatList() {


    var merchantdata = {
      "name": ""
    }
    this.getdownload(`${API_URL}/getRiskMid/`, merchantdata).subscribe((res: any) => {

      this.Resultdata = res;

    })


  }


  newBarChart(IndexColor: any) {


    this.newarr = []
    this.IndexColor = IndexColor
    var merchantdata = {
      "level": IndexColor,
      "MerchantId": this.Mid
    }
    this.getdownload(`${API_URL}/getRiskCountData/`, merchantdata).subscribe((res: any) => {

      this.BarChartdata = res;
      // Object.values(this.BarChartdata).forEach(element => {
      //   // this.newarr.push(Number(element))
      //   this.series.push({
      //     name: yearSeries.data[selectedIndex].x,
      //     data: element
      //   });
      // })

      // Object.keys(this.BarChartdata).forEach(key => {
      //   console.log(key, this.BarChartdata[key]);

      // });
      this.titletext = {
        text: this.IndexColor,
        offsetX: 10
      }
      this.series.push({
        name: "Risk Code",
        data: Object.values(this.BarChartdata)
      });
      this.xaxis = {
        "categories": Object.keys(this.BarChartdata)
      }

      if (this.series.length === 0)
        this.series = [
          {
            data: []
          }
        ];
      // if (this.xaxis.length === 0)
      // this.xaxis = [
      //   {
      //     categories: []
      //   }
      // ];
      switch (this.IndexColor) {
        case "red": {
          this.newcolor = this.obj.red
          break;
        }
        case "voilet": {
          this.newcolor = this.obj.voilet
          break;
        }
        case "green": {
          this.newcolor = this.obj.green
          break;
        }
        case "Orange": {
          this.newcolor = this.obj.Orange
          break;
        }
        default: {
          this.newcolor = this.obj.blue
          break;
        }
      }
      // this.colors.push(IndexColor);
      return window.ApexCharts.exec("barQuarter", "updateOptions", {
        series: this.series,
        xaxis: this.xaxis,
        colors: this.newcolor,
        title: this.titletext,
        fill: {
          colors: this.newcolor
        }
      });
    })


  }


}

