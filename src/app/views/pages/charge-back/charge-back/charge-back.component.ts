import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChargeBackServiceService } from '../charge-back-service.service';
import { AlertService } from 'src/app/_services/alert.service';

@Component({
  selector: 'app-charge-back',
  templateUrl: './charge-back.component.html',
  styleUrls: ['./charge-back.component.scss']
})
export class ChargeBackComponent implements OnInit {
  @Input() onMerchantMId: EventEmitter<any> = new EventEmitter<any>();
  @Output() closeModal: EventEmitter<any> = new EventEmitter<any>();
  chargeBackRaiseForm: FormGroup
  isForm1Submitted: boolean = false
  data: any;

  files: any;
  fileName: any;
  fileExtension: any;
  fileExtensionError: boolean;
  fileResponse: any;

  constructor(private fb: FormBuilder, private chargebackservie: ChargeBackServiceService, private alertService: AlertService,) {
    this.chargeBackRaiseForm = fb.group({
      RefNo: [, [Validators.required,Validators.maxLength(45)]],
      Remarks: [, [Validators.required,Validators.maxLength(500)]],
      file: [, [Validators.required]]
    })
  }

  ngOnInit(): void {
    debugger
    this.onMerchantMId.subscribe((res: any) => {
      debugger
      this.chargeBackRaiseForm.reset()
      this.isForm1Submitted = false
      this.data = res
      this.resetform()
      // this.chargeBackRaiseForm.controls['emailId'].setValue(this.data.Merchant_Email_ID)
      // this.chargeBackRaiseForm.controls['emailId'].disable()
    })

  }

  isInArray(array: any, word: any) {
    return array.indexOf(word.toLowerCase()) > -1;
  }



  // onFileSelect(event: any) {
  //   debugger


  //   if (event.target.files.length > 0) {




  //     var allowedExtensions = ["CSV", "csv"];
  //     var file = event.target.files;
  //     this.files = file
  //     this.fileName = file.name;
  //     this.fileExtension = this.fileName.split('.').pop();





  //     this.fileExtensionError = false;
  //     if (this.fileExtensionError == false) {
  //       if (file) {



  //       } else {
  //         this.alertService.errorAlert({
  //           html: "Failed to load file"
  //         })
  //       }
  //     }
  //   }


  // }

  onFileSelect(event: any) {
    debugger

    // type = type || 'single'
    // if (event.target.files[0].size < 1048576) {
    if (event.target.files.length > 0) {
      let i
      var file = event.target.files;
      for (i = 0; i < file?.length; i++) {
        var allowedExtensions = ["ZIP", "zip"];
     
     
      this.fileName = file[i].name;
      this.fileExtension = this.fileName.split('.').pop();

      if (this.isInArray(allowedExtensions, this.fileExtension)) {
        
        this.alertService.errorAlert({
          html: "ZIP " + " files are not allowed"
        })
        this.fileExtensionError = true;
        this.files=[]
        this.chargeBackRaiseForm.controls['file'].reset()
        return

      }
      else {
        // alert("Only " + "Image, Document, Excel and PDF" + " files are allowed");
        this.fileExtensionError = false;

      }

      if (this.fileExtensionError == false) {
        if (file) {
          // const formData = new FormData();

          // formData.append('file', file);

          // this.reconservice.uploadMPRfile(formData).subscribe((res: any) => {
          //   this.fileResponse = res[0].fileName;
          // })
          this.files = file


        } 
        else {
          this.alertService.errorAlert({
            html: "Failed to load file"
          })
          this.files =null
        }
      }
       
      }


      



      // this.fileExtensionError = false;
     
    }


  }




  onSubmit(formvalue: any) {
    debugger
    // const formData = new FormData();
    
    // let i;
    // if (this.files) {
    //   for (i = 0; i < this.files?.length; i++) {
    //     formData.append('files', this.files[i])
    //   }
    // }
    const formData = new FormData();
    // var AddedBy: any = localStorage.getItem("user")
    let i;
    // let f:any="/path/to/file";
    var f = new File([""], "faildToNam", { type: 'text/html' });
    if(this.files.length>0){
       for (i = 0; i < this.files?.length; i++) {
      formData.append('files', this.files[i])
    }
    }
    else{
      formData.append('files',f)
   }

    formData.append('CBId', this.data.CBID)
    formData.append('TranId', this.data.TxnId)
    formData.append('refNo', formvalue.RefNo)
    formData.append('commenMerchant', formvalue.Remarks)
    formData.append('merchantId', this.data.MID)


    if (this.chargeBackRaiseForm.valid) {
      this.chargebackservie.RaisedchargebackinsertMerchant(formData).subscribe((res: any) => {

        if (res.Status == 'success') {
          this.alertService.successAlert(res.Reason)

          this.alertService.successAlert(res.Reason)
          this.closeModal.emit({
            showModal: false
          });
          this.isForm1Submitted = false
        }

      })


    }

    this.isForm1Submitted = true

  }

  resetform() {
    this.chargeBackRaiseForm.reset()
    this.isForm1Submitted = false

  }

  OnlyCharacterNumberAllowed(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode >= 48 && charCode <= 57) || (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122) || (charCode == 32)) {
      // console.log('charCode restricted is' + charCode)
      return true;
    }
    return false;
  }

  OnlyNumbersAllowed(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    return (charCode > 47 && charCode < 58) || charCode == 46;

  }

}
