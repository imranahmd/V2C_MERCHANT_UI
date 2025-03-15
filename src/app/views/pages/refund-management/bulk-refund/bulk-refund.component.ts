import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators,} from '@angular/forms';
import {AlertService} from "../../../../_services/alert.service";
import {ApiHttpService} from 'src/app/_services/api-http.service';
import {environment} from 'src/environments/environment';
import {DataTable} from 'simple-datatables';
import * as XLSX from 'xlsx';

const {API_URL} = environment;

@Component({
  selector: 'app-bulk-refund',
  templateUrl: './bulk-refund.component.html',
  styleUrls: ['./bulk-refund.component.scss']
})
export class BulkRefundComponent implements OnInit {
  RefundBulkForm: FormGroup
  fileExtension: any;
  fileExtensionError: boolean;
  file: any = false;
  photoName: any;
  isForm1Submitted: boolean;
  rowData: any;
  fileResponse: any;
  BulkResponse: boolean;
  dataTable: DataTable;
  todayWithPipe: string;
  fileName: string;

  constructor(private fb: FormBuilder, private alertService: AlertService, private apiHttpService: ApiHttpService) {
    this.RefundBulkForm = fb.group({
        file: ["", [Validators.required]],

      }
    );
  }

  get form1() {
    return this.RefundBulkForm.controls;
  }

  isInArray(array: any, word: any) {
    return array.indexOf(word.toLowerCase()) > -1;
  }

  ngOnInit(): void {
    this.isForm1Submitted = false
  }


  onFileSelect(event: any) {

    //
    // if (event.target.files[0].size < 1048576) {
    if (event.target.files.length > 0) {
      var allowedExtensions = ["csv", "CSV", "xlsx", "XLSX"];
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

  onsubmit(val: any) {


    if (this.fileExtensionError == false && this.RefundBulkForm.valid) {
      var userid: any = localStorage?.getItem('user')
      if (this.file) {
        //
        const formData = new FormData();
        formData.append('file', this.file);
        formData.append('userId', userid);

        this.apiHttpService
          .post(
            `${API_URL}/BulkRefund`, formData
            // , {  responseType: 'text'}
          )
          .subscribe((data: any) => {
              this.rowData = data[0],
                this.rowData ? this.alertService.successAlert('Uploaded bulk Refund file successfully') : this.alertService.errorAlert({html: 'Unable to upload CSV file'}),
                this.dataTable ? this.dataTable.destroy() : console.log(this.rowData)
              this.rowData ? this.dataTable = new DataTable("#dataTableExample") : this.dataTable.destroy(),

                this.BulkResponse = this.rowData

              if (this.rowData) {
                Object.values(this.rowData).forEach((element: any, i: number) => {
                  console.log(element)
                  this.dataTable.rows().add([i + 1 + '', element]);
                })
              }


              //,
              // this.page =
              //,
              // this.onVerify()
              // this.refreshGrid()
            },
            (error) => {
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

}
