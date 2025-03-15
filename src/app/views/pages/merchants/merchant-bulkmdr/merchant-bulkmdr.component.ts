import {Component, OnInit} from '@angular/core';
import {ApiHttpService} from 'src/app/_services/api-http.service';
import {environment} from 'src/environments/environment';
import {AlertService} from "../../../../_services/alert.service";
import {DataTable} from "simple-datatables";
import * as XLSX from 'xlsx';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

const {API_URL} = environment;
const stringFormatter = (params: any) => {
  const newdata = params.data
  return newdata.toString()
}

// const API_URL = 'http://localhost:8000'
export interface IRiskData {

}

@Component({
  selector: 'app-merchant-bulkmdr',
  templateUrl: './merchant-bulkmdr.component.html',
  styleUrls: ['./merchant-bulkmdr.component.scss']
})
export class MerchantBulkmdrComponent implements OnInit {

  photoName: any;
  fileExtension: any;
  fileExtensionError: boolean;
  fileResponse: any;
  file: any = false;
  rowData: any;
  MerchantResponse: any;
  dataTable: DataTable;
  todayWithPipe: string;
  fileName: string;
  merchantform: FormGroup;
  isForm1Submitted: Boolean;
  loading: boolean;

  // dataTable = new DataTable("#myTable");

  constructor(private apiHttpService: ApiHttpService, private alertService: AlertService, private fb: FormBuilder) {

    this.merchantform = fb.group({
      file: ["", Validators.required]
    })
  }

  get form1() {
    return this.merchantform.controls;
  }

  isInArray(array: any, word: any) {
    return array.indexOf(word.toLowerCase()) > -1;
  }

  ngOnInit(): void {
    // this.dataTable = new DataTable("#dataTableExample");
  }

  onsubmit() {

    if (this.fileExtensionError == false && this.merchantform.valid) {
      if (this.file) {
        //
        const formData = new FormData();
        formData.append('file', this.file);
        this.loading = true
        document?.getElementById('loading')?.classList.add("spinner-border")
        document?.getElementById('loading')?.classList.add("spinner-border-sm")
        this.apiHttpService
          .post(
            `${API_URL}/create-merchantmdr-bulkupload`, formData
          )
          .subscribe((data: any) => {
            this.loading = false
            document?.getElementById('loading')?.classList.remove("spinner-border")
            document?.getElementById('loading')?.classList.remove("spinner-border-sm")
            this.rowData = data,
              this.rowData ? this.alertService.successAlert('Uploaded bulk MDR file successfully') : this.alertService.errorAlert({html: 'Unable to upload CSV file'}),
              this.dataTable ? this.dataTable.destroy() : console.log(this.rowData)
            this.rowData ? this.dataTable = new DataTable("#dataTableExample") : this.dataTable.destroy(),

              this.MerchantResponse = this.rowData

            if (this.rowData) {
              this.rowData.forEach((element: any) => {
                this.dataTable.rows().add(Object.values(element));
              })
            }


            //,
            // this.page =
            //,
            // this.onVerify()
            // this.refreshGrid()
          }, (error) => {
            console.log("****Error------>", error)
          })

        //   var reader = new FileReader();
        //   reader.onloadend = (e: any) => {
        //
        //     var contents = e.target.result;
        //     this.photoContent = contents.split(',')[1];
        //  }
        //   reader.readAsDataURL(file);
        //   this.addCorpForm.get('UploadFile').setValue(file);
        //   this.submitFile()
        //  this.UploagePageForm.patchValue({
        //   "Doc":"Done",
        // });
        //  this.UploagePageForm.get('Doc').setValue('Done');
      } else {
        this.alertService.toastErrorMessageAlert({
          html: "Failed to load file"
        })
      }
    } else {
      this.rowData = false;
    }
    this.isForm1Submitted = true;

  }


  onVerify() {


    // this.gridApi = this.params.api;
    // this.gridApi.getFilterInstance('age', (filterParam) => {
    // })
    // this.gridApi.showLoadingOverlay();
    // // this.gridApi.setQuickFilter(this.globalSearch);
    // const allColumnIds: (string)[] = [];
    // this.params?.columnApi?.getColumns()?.forEach((column) => {
    //   allColumnIds.push(column.getId());
    // });
    // this.params?.columnApi?.autoSizeColumns(allColumnIds, false);


    // // this.gridApi = params.api;
    // this.gridApi.getFilterInstance('age', (filterParam) => {
    // })
    // var formData = {
    //   "username": localStorage.getItem("user")
    // }
    // this.gridApi.showLoadingOverlay();
    var formData = {
      "username": localStorage.getItem("user")
    }
    this.apiHttpService
      .post(
        `${API_URL}/Verify-CreateMerchantRecords`, formData
      )
      .subscribe((data: any) => {
        this.rowData = data,
          this.MerchantResponse = this.rowData,
          //
          // this.dataTable.columns().add(data);
          this.rowData.forEach((element: any) => {
            this.dataTable.rows().add(Object.values(element));
          });

        // this.rows =  this.rowData ,
        setTimeout(() => {
          // this.loadingIndicator = false;
          // this.myTable = document.getElementById("#myTable"),
          // this.dataTable = new DataTable(this.myTable)
          // new DataTable("#dataTableExample")
        }, 1500)
        // this.posts = this.rowData
      })
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
    this.fileName = 'Bulk_Upload_' + this.todayWithPipe + '.csv';
    XLSX.writeFile(wb, this.fileName);

  }

  //    addNewColumn = function() {

  //     let columnData = "remote/data/url";

  //     let xhr = new XMLHttpRequest();

  //     xhr.addEventListener("load", function(e) {
  //         if (xhr.readyState === 4) {
  //             if (xhr.status === 200) {
  //                 // Parse the JSON string
  //                 let data = JSON.parse(xhr.responseText);

  //                 // Insert the new column
  //                 // this.dataTable.columns().add(data);
  //             }
  //         }
  //     });

  //     xhr.open('GET', columnData);
  //     xhr.send();
  // };
  onFileSelect(event: any) {
    //
    // if (event.target.files[0].size < 1048576) {
    if (event.target.files.length > 0) {
      var allowedExtensions = ["csv", "CSV"];
      this.file = event.target.files[0];
      this.photoName = this.file.name;
      this.fileExtension = this.photoName.split('.').pop();

      if (this.isInArray(allowedExtensions, this.fileExtension)) {
        this.fileExtensionError = false;

      } else {
        // this.alertService.successAlert("Only " + " Excel and CSV" + " files are allowed");
        this.alertService.errorAlert({
          title: "Only " + " CSV" + " files are allowed",
          backdrop: true,
          toast: false,
        });

        this.fileExtensionError = true;
        // this.InputVar.nativeElement.value = "";
        // this.formarraycontrol = this.t.controls[control].reset()
        return
        // let setvalue =  (<HTMLInputElement>document.getElementById('File1'))
        // setvalue.value = "";
        // file = null;
      }


    }

  }


}
