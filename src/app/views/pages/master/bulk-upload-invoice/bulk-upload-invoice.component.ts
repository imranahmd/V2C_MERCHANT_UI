import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from "../../../../_services/alert.service";
import { ApiHttpService } from 'src/app/_services/api-http.service';
import { environment } from 'src/environments/environment';
import { DataTable } from 'simple-datatables';
import * as XLSX from 'xlsx';

const { API_URL } = environment;

@Component({
  selector: 'app-bulk-upload-invoice',
  templateUrl: './bulk-upload-invoice.component.html',
  styleUrls: ['./bulk-upload-invoice.component.scss']
})
export class BulkUploadInvoiceComponent implements OnInit {
  Bulkuploadform: FormGroup
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
  merchantid: any;
  loading: boolean = false;

  constructor(private fb: FormBuilder, private alertService: AlertService, private apiHttpService: ApiHttpService) {
    this.Bulkuploadform = fb.group({
      file: ['', [Validators.required]],


    },
    );


  }

  get form1() {
    return this.Bulkuploadform.controls;
  }

  isInArray(array: any, word: any) {
    return array.indexOf(word.toLowerCase()) > -1;
  }

  ngOnInit(): void {
    this.loading = false;
    this.isForm1Submitted = false
  }

  onFileSelect(event: any) {

    //
    // if (event.target.files[0].size < 1048576) {
    if (event.target.files.length > 0) {
      var allowedExtensions = ["xlsx", "XLSX"];
      this.file = event.target.files[0];
      this.photoName = this.file.name;

      this.fileExtension = this.photoName.split('.').pop();

      if (this.isInArray(allowedExtensions, this.fileExtension)) {
        this.fileExtensionError = false;

      } else {
        // this.alertService.successAlert("Only " + " Excel and CSV" + " files are allowed");
        this.alertService.errorAlert({
          title: "Only " + "XLSX" + " files are allowed",
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


    if (this.fileExtensionError == false && this.Bulkuploadform.valid) {
      var userid: any = localStorage?.getItem('user')
      if (this.file) {
        //
        this.merchantid = localStorage.getItem('user')
        const formData = new FormData();
        formData.append('file', this.file);
        formData.append('MerchantId', this.merchantid);
        formData.append('status', "0");
        this.loading = true
        document?.getElementById('loading')?.classList.add("spinner-border")
        document?.getElementById('loading')?.classList.add("spinner-border-sm")

        this.apiHttpService
          .post(
            `${API_URL}/CreateBulkInvoice`, formData
            // , {  responseType: 'text'}
          )
          .subscribe((data: any) => {
            // this.rowData ? this.alertService.successAlert('Uploaded bulk Invoice file successfully') : this.alertService.errorAlert({ html: 'Unable to upload CSV file' }),
            if (data.status == true) {
              this.alertService.successAlert(data.message)

            } else {
              this.alertService.errorAlert({ html: data.message })
            }
            this.loading = false
            document?.getElementById('loading')?.classList.remove("spinner-border")
            document?.getElementById('loading')?.classList.remove("spinner-border-sm")

            this.rowData = data.result,
              this.dataTable ? this.dataTable.destroy() : console.log(this.rowData)
            this.rowData ? this.dataTable = new DataTable("#dataTableExample") : this.dataTable.destroy(),

              this.BulkResponse = this.rowData
              this.Bulkuploadform.controls['file'].setValue('')
              this.isForm1Submitted = false;

            if (this.rowData) {
              this.rowData.forEach((element: any, i: number) => {
                console.log(element)
                this.dataTable.rows().add(Object.values(element));
                // this.dataTable.rows().add([i+1+'',element]);
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

}
