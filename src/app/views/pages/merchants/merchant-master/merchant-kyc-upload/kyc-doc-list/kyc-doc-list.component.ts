import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {MerchantService} from "../../merchant.service";
import {AlertService} from "../../../../../../_services/alert.service";
import {Subscription} from "rxjs";

const ALLOWED_EXTENSIONS = ["pdf", "PDF", "png", "PNG", "jpg", "JPG", "jpeg", "JPEG", 'BMP', 'bmp'];

@Component({
  selector: 'app-kyc-doc-list',
  templateUrl: './kyc-doc-list.component.html',
  styleUrls: ['./kyc-doc-list.component.scss']
})
export class KycDocListComponent implements OnInit, OnDestroy {
  @ViewChild('fileDropRef') fileDropRef: ElementRef;
  @Input('merchantId') merchantId: string;
  @Input('selectedKycData') selectedKycData: any;
  @Input('globalDisableFlag') globalDisableFlag: boolean;
  @Input('localDisableFlag') localDisableFlag: boolean;
  // @ts-ignore
  selectedFiles: any;
  progressInfos: any;
  message: any[];
  fileInfos: any;
  files: any[] = [];
  outIndex: number;
  innerIndex: number;
  type: string;
  private subscriber$: Subscription;

  constructor(private merchantService: MerchantService, private alertService: AlertService) {
  }

  ngOnInit(): void {
    this.message = [];
    console.log("SUb compo======> ", this.selectedKycData)
    this.subscriber$ = this.merchantService.kycUploadObserver.subscribe((data: any) => {
      if (data?.type == 'FILE_LISTING') {
        this.files = [];
        console.log("ListData===>", data?.listData)
        this.outIndex = data?.listData?.outIndex;
        this.innerIndex = data?.listData?.innerIndex;
        this.type = data?.listData?.type;
        this.selectedKycData = data?.listData?.currentFormGroup
        if(!isNaN(this.innerIndex)){
          const fileList = data?.listData?.currentFormGroup.get('docTypeList').controls[this.innerIndex].get('docList').controls;

          // const fileList = data?.listData?.currentFormGroup.get('docTypeList')['controls'][this.innerIndex].get('docList').value;
          if (fileList) {
            fileList.forEach((f: any) => {
              if (f.docPath !== '')
                this.files.push({
                  ...f.value,
                  progress: 100
                });
            })
          }
        }else{
          const fileList = data?.listData?.currentFormGroup.get('docList').value;
          if (fileList) {
            fileList.forEach((f: any) => {
              if (f.docPath !== '')
                this.files.push({
                  ...f,
                  progress: 100
                });
            })
          }
        }

      }
    })

  }

  ngOnDestroy() {
    console.log("Destroy KYC Upload called===>")
    this.subscriber$.unsubscribe()
  }

  /**
   * on file drop handler
   */
  onFileDropped($event: any[]) {
    // this.fileDropRef.nativeElement.value = '';
    this.prepareFilesList($event);
    this.fileDropRef.nativeElement.value = '';
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler($event: any) {
    // this.fileDropRef.nativeElement.value = '';
    this.prepareFilesList($event?.target?.files);
    this.fileDropRef.nativeElement.value = '';
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile(index: number) {
    this.merchantService.kycFileDeleteEvent({
      outIndex: this.outIndex,
      innerIndex: this.innerIndex,
      type: this.type,
      fileIndex: index
    })
    // this.files.splice(index, 1);
    delete this.fileDropRef.nativeElement.files[index];
    console.log("Delete File List", this.files);
  }

  /**
   * Simulate the upload process
   */
  uploadFilesSimulator(index: number) {
    setTimeout(() => {
      if (index === this.files.length) {
        return;
      } else {
        const progressInterval = setInterval(() => {
          if (this.files[index].progress === 100) {
            clearInterval(progressInterval);
            this.uploadFilesSimulator(index + 1);
          } else {
            this.files[index].progress += 5;
          }
        }, 200);
      }
    }, 1000);
  }

  uploadFiles(index: number) {

    // setTimeout(() => {
    if (index === this.files.length) {
      return;
    } else {
      const formData = new FormData();
      formData.append('imageFile', this.files[index]);
      formData.append('merchantId', this.merchantId);
      formData.append("docType", "");
      formData.append('docId', this.selectedKycData.currentFormGroup.value?.docId);
      this.merchantService.uploadKycFile(formData)
        // .pipe()
        .subscribe((data) => {
          this.files[index].progress = 100;
          delete this.files[index].fileName
          delete this.files[index].size
          this.files[index] = {
            ...this.files[index],
            ...data[0]
          }
          this.merchantService.kycFileUploadComplete({
            outIndex: this.outIndex,
            innerIndex: this.innerIndex,
            type: this.type,
            fileUploadDetails: data[0]
          })
          this.uploadFiles(index + 1);
        })
      // const progressInterval = setInterval(() => {
      //   if (this.files[index].progress === 100) {
      //     clearInterval(progressInterval);
      //     this.uploadFiles(index + 1);
      //   } else {
      //     this.files[index].progress += 5;
      //   }
      // }, 200);
    }
    // }, 1000);
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: Array<any>) {
    const startIndex = this.files.length;
    let extError = false;
    let fileSizeError = false;
    let fileMaxSizeError = false;
    for (const item of files) {
      const file = item;
      const fileProp = file.name?.split('.');
      const fileType = file.type?.split('/');

      console.log("File--->", file);
      console.log("FileProp--->", fileProp);
      console.log("FileType--->", file.type);
      if (!ALLOWED_EXTENSIONS.includes(fileProp[1]) && !ALLOWED_EXTENSIONS.includes(fileType[1])) {
        extError = true;

      }else if (item.size == 0) {
        fileSizeError = true;

      }else if (item.size > 10 * 1024 * 1024 ) {
        fileMaxSizeError = true;

      } else {
        item.progress = 0;
        this.files.push(item);
      }

    }
    extError && this.alertService.errorAlert({
      html: "Only PDF, PNG, JPG, JPEG, BMP files are allowed"
    })
    fileSizeError && this.alertService.errorAlert({
      html: "Empty files are not allowed"
    })
    fileMaxSizeError && this.alertService.errorAlert({
      html: "Maximum 10 MB file is allowed"
    })

    // if(!extError)
    this.uploadFiles(startIndex);
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes: number, decimals: number = 0) {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  downloadFile(i: number) {
    this.merchantService.kycFileDownloadEvent({
      outIndex: this.outIndex,
      innerIndex: this.innerIndex,
      type: this.type,
      fileIndex: i
    })
  }

  viewFile(i: number) {
    console.log("View got clicked for====>", i);
    return this.merchantService.kycFileViewEvent({
      outIndex: this.outIndex,
      innerIndex: this.innerIndex,
      type: this.type,
      fileIndex: i
    })
  }
}
