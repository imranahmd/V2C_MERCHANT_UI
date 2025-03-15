import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AlertService} from "../../../../../_services/alert.service";
import {MenusService} from "../../../../../_services/menu.service";
import {Location} from "@angular/common";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors, ValidatorFn,
  Validators
} from "@angular/forms";
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {MerchantService} from "../merchant.service";
import {ActivatedRoute, Params} from "@angular/router";
import {lastValueFrom, Subscriber, Subscription} from "rxjs";
import {DataTable} from "simple-datatables";
import {StorageService} from "../../../../../_services/storage.service";
import {ModalComponent} from "../../../../../common/modal/modal.component";
import {ModalConfig} from "../../../../../common/modal/modal.config";
import {SweetAlertResult} from "sweetalert2";
import {LoaderService} from "../../../../../_services/loader.service";

const allowedExtensions = ["pdf", "PDF", "png", "PNG", "jpg", "JPG", "jpeg", "JPEG", "BMP", "bmp"];

@Component({
  selector: 'app-merchant-kyc-upload',
  templateUrl: './merchant-kyc-upload.component.html',
  styleUrls: ['./merchant-kyc-upload.component.scss']
})
export class MerchantKycUploadComponent implements OnInit, OnDestroy {
  @ViewChild('waverError') waverError: ElementRef
  @ViewChild('isWavierSelector') isWavierSelector: ElementRef
  @ViewChild('merchantKycDataSelector') merchantKycDataSelector: ElementRef
  kycUploadModalConfig: ModalConfig;
  kycViewModalConfig: ModalConfig;
  merchantId: any;
  merchantDetails: any;
  merchantKycDetails: any;
  allKycDataFormGroup: FormGroup;
  kycApprovalForm: FormGroup;
  permissions: any;
  isKycFormSubmitted: boolean
  currentDate = new Date();
  status: any;
  isApprovalEnable: boolean = false;
  dataTable: DataTable;
  remarkData: any;
  currentSelectedGroup: any;
  globalDisableFlag: boolean = false;
  localDisableFlag: boolean = false;
  kycFileSrc: any;
  loader: any = false;
  merchantListData: any = [];
  @ViewChild('kycUploadModal') private kycUploadModal: ModalComponent;
  @ViewChild('kycFileViewModal') private kycFileViewModal: ModalComponent;
  private queryParams: Params;
  private documentId: any;
  private subscriber$: Subscription;

  constructor(
    private alertService: AlertService,
    private menuService: MenusService,
    private location: Location,
    private route: ActivatedRoute,
    public formBuilder: FormBuilder,
    private merchantService: MerchantService,
    private storage: StorageService,
    private sanitizer: DomSanitizer,
    private loaderService: LoaderService
  ) {
    const path = this.location.prepareExternalUrl(this.location.path());
    this.permissions = this.menuService.getPermissions(path);
    this.route.queryParams
      .subscribe(params => {
          this.queryParams = params;
          this.merchantId = params?.mid;
          try {
            this.merchantService.getRiskRemark(this.merchantId, 'M', 'Kyc')
              .subscribe((data: any) => {
                  this.remarkData = data
                  this.dataTable ? this.dataTable.destroy() : console.log(this.remarkData)
                  this.remarkData ? this.dataTable = new DataTable("#dataTableExample") : this.dataTable.destroy()
                  if (this.remarkData) {
                    this.remarkData.forEach((element: any) => {
                      this.dataTable.rows().add(Object.values(element));
                    })
                  }
                }
              )
            this.merchantService.getMerchant(this.merchantId).subscribe((mData)=>{

              this.merchantListData.push({
                merchant_name : mData[0]?.merchant_name,
                MerchantId : this.merchantId
              })
            })
          } catch (e) {
            this.remarkData = []
          }
        }
      );
    this.kycApprovalForm = new FormGroup({
      remarks: new FormControl('', [Validators.required]),
    })
  }

  get kycForm(): any {
    return this.allKycDataFormGroup.controls;
  }

  merchantKycDataArr(): any {
    return (this.allKycDataFormGroup.get('merchantKycData') as FormArray)?.controls;
  }

  docTypArr(docType: FormControl): any {
    return (docType.get('docTypeList') as FormArray)?.controls;
  }

  async ngOnInit(): Promise<void> {
    const self = this;
    const merchantDetails$ = this.merchantService.getMerchant(this.merchantId)
    this.merchantDetails = await lastValueFrom(merchantDetails$);
    this.status = this.merchantDetails[0]?.kyc_approvel

    this.kycUploadModalConfig = {
      modalTitle: "Merchant Status",
      modalSize: 'lg',
      hideDismissButton(): boolean {
        return true
      },
      hideCloseButton(): boolean {
        return true
      }
    }

    this.kycViewModalConfig = {
      modalTitle: "Merchant Status",
      modalSize: 'xl',
      fullscreen: true,
      hideDismissButton(): boolean {
        return true
      },
      hideCloseButton(): boolean {
        return true
      },
      onClose(): Promise<boolean> | boolean {
        self.kycFileSrc = null;
        return true
      },
      onTopClose(): Promise<boolean> | boolean {
        self.kycFileSrc = null;
        return true
      },
      onDismiss(): Promise<boolean> | boolean {
        self.kycFileSrc = null;
        return true
      }
    }

    await this.setKycData();

    this.subscriber$ = this.merchantService.kycUploadObserver.subscribe(async (data: any) => {
      // console.log("File Upload===========>>>>>>", data)
      try{
        if (data?.type == 'FILE_UPLOAD') {
          const {outIndex, innerIndex, type, fileUploadDetails} = data?.fileData;
          // console.log("File Upload===========>>>>>>", outIndex, innerIndex, type, fileUploadDetails, !isNaN(innerIndex))
          if (!isNaN(innerIndex)) {
            // const controls = this.merchantKycDataArr()[outIndex];
            // console.log("===>", this.merchantKycDataArr()[outIndex].get('docTypeList'))
            // console.log("===>", this.merchantKycDataArr()[outIndex].get('docTypeList').controls[innerIndex])
            // console.log("===>", this.merchantKycDataArr()[outIndex].get('docTypeList').controls[innerIndex].get('docList'))
            const controls = ((this.merchantKycDataArr()[outIndex]?.get('docTypeList') as FormArray)?.controls[innerIndex]?.get('docList') as FormArray)?.controls;
            if (controls && controls[0]?.get('docPath')?.value == '' && controls[0]?.get('kycId')?.value != 0) {
              controls[0].patchValue({
                docName: fileUploadDetails?.docName || fileUploadDetails?.docname || '',
                docPath: fileUploadDetails?.docPath || fileUploadDetails?.docpath || '',
              })
            } else if(controls?.filter((u:any) => u.get('docPath')?.value == '').length >0){
              const cnt = controls?.find((u:any) => u.get('docPath')?.value == '')
              cnt?.patchValue({
                docName: fileUploadDetails?.docName || fileUploadDetails?.docname || '',
                docPath: fileUploadDetails?.docPath || fileUploadDetails?.docpath || '',
              })
            } else {
              controls.push(this.addDocList(fileUploadDetails));
            }
            ((this.merchantKycDataArr()[outIndex]?.get('docTypeList') as FormArray)?.controls[innerIndex]?.get('docList') as FormArray).updateValueAndValidity();
          } else {
            const controls = this.merchantKycDataArr()[outIndex]?.get('docList').controls;
            // console.log("List Controls===========>>>>>>", controls)
            if (controls[0]?.get('docPath').value == '') {
              controls[0].patchValue({
                docName: fileUploadDetails?.docName || fileUploadDetails?.docname || '',
                docPath: fileUploadDetails?.docPath || fileUploadDetails?.docpath || '',
              })
            } else if(controls?.filter((u:any) => u.get('docPath')?.value == '').length >0){
              const cnt = controls?.find((u:any) => u.get('docPath')?.value == '')
              cnt?.patchValue({
                docName: fileUploadDetails?.docName || fileUploadDetails?.docname || '',
                docPath: fileUploadDetails?.docPath || fileUploadDetails?.docpath || '',
              })
            } else {
              controls.push(this.addDocList(fileUploadDetails));
            }
            this.merchantKycDataArr()[outIndex]?.get('docList').updateValueAndValidity();
          }
          // console.log("File Upload Form===========>>>>>>", this.merchantKycDataArr()[outIndex])
        }

        if (data?.type == 'FILE_DELETE') {
          const {outIndex, innerIndex, type, fileIndex} = data?.fileData;
          if (!isNaN(innerIndex)) {
            const docListFArr = ((this.merchantKycDataArr()[outIndex]?.get('docTypeList') as FormArray)?.controls[innerIndex]?.get('docList') as FormArray);
            const controls = docListFArr?.controls;
            // console.log("Delete---<", controls);
            this.deleteFileService(
              controls[fileIndex]?.get('docPath')?.value,
              controls[fileIndex]?.get('kycId')?.value,
              controls[fileIndex]?.get('docName')?.value
            ).then((dataDel: any)=>{
              if(!dataDel?.isDismissed){
                docListFArr.removeAt(fileIndex, {emitEvent: true})
              }
              this.currentSelectedGroup = {
                outIndex,
                innerIndex,
                type,
                currentFormGroup: this.merchantKycDataArr()[outIndex]
              };
              // this.merchantService.uploadKycBrowseButton(this.currentSelectedGroup);
            })
          } else {
            // const controls = this.merchantKycDataArr()[outIndex]?.get('docList').controls;
            const docListFArr = (this.merchantKycDataArr()[outIndex]?.get('docList') as FormArray);
            const controls = docListFArr?.controls;
            this.deleteFileService(
              controls[fileIndex]?.get('docPath')?.value,
              controls[fileIndex]?.get('kycId')?.value,
              controls[fileIndex]?.get('docName')?.value
            ).then((dataDel: any)=>{
              if(!dataDel?.isDismissed){
                docListFArr.removeAt(fileIndex, {emitEvent: true})
              }
              this.currentSelectedGroup = {
                outIndex,
                innerIndex,
                type,
                currentFormGroup: this.merchantKycDataArr()[outIndex]
              };
              // this.merchantService.uploadKycBrowseButton(this.currentSelectedGroup);
            })

          }
          // console.log("Out delete---<", this.merchantKycDataArr()[outIndex]);
        }

        if (data?.type == 'FILE_DOWNLOAD') {
          const {outIndex, innerIndex, type, fileIndex} = data?.fileData;
          if (!isNaN(innerIndex)) {
            const controls = ((this.merchantKycDataArr()[outIndex]?.get('docTypeList') as FormArray)?.controls[innerIndex]?.get('docList') as FormArray)?.controls;
            // console.log("In---<", controls);
            this.downloadFileService(controls[fileIndex]?.get('docName')?.value, controls[fileIndex]?.get('docPath')?.value)
          } else {
            const controls = this.merchantKycDataArr()[outIndex]?.get('docList').controls;
            this.downloadFileService(controls[fileIndex]?.get('docName')?.value, controls[fileIndex]?.get('docPath')?.value)
            // console.log("Out---<", controls);
          }
        }

        if (data?.type == 'FILE_VIEWED') {
          this.loader = true;
          this.loaderService.showLoader();
          const {outIndex, innerIndex, type, fileIndex} = data?.fileData;
          if (!isNaN(innerIndex)) {
            const controls = ((this.merchantKycDataArr()[outIndex]?.get('docTypeList') as FormArray)?.controls[innerIndex]?.get('docList') as FormArray)?.controls;
            this.kycViewModalConfig = {
              ...this.kycViewModalConfig,
              modalTitle: `${controls[fileIndex]?.get('docName')?.value}`
            }
            const viewResp: any = await this.viewFileService(controls[fileIndex]?.get('docName')?.value, controls[fileIndex]?.get('docPath')?.value)
              .catch((err) => {
                this.alertService.toastErrorMessageAlert({html: `Error occurred while showing file ${controls[fileIndex]?.get('docName')?.value}`})
                return null;
              });
            console.log("======>", viewResp);
            this.loaderService.hideLoader();
            if (!this.kycFileViewModal.isModalOpen && viewResp?.src) {
              await this.kycFileViewModal.open()
            }
            // this.loaderService.hideLoader();
            // console.log("In---<", controls);
            // this.downloadFileService(controls[fileIndex]?.get('docName')?.value, controls[fileIndex]?.get('docPath')?.value)
          } else {
            const controls = this.merchantKycDataArr()[outIndex]?.get('docList').controls;
            this.kycViewModalConfig = {
              ...this.kycViewModalConfig,
              modalTitle: `${controls[fileIndex]?.get('docName')?.value}`
            }
            const viewResp: any = await this.viewFileService(controls[fileIndex]?.get('docName')?.value, controls[fileIndex]?.get('docPath')?.value)
              .catch((err) => {
                this.alertService.toastErrorMessageAlert({html: `Error occurred while showing file ${controls[fileIndex]?.get('docName')?.value}`})
                return null;
              });
            console.log("======>", viewResp);
            this.loaderService.hideLoader();
            if (!this.kycFileViewModal.isModalOpen && viewResp?.src) {
              await this.kycFileViewModal.open()
            }
          }
          this.loaderService.hideLoader();
        }
      }catch (e) {
        this.loaderService.hideLoader();
        console.error(e);
      }

    })

    // console.log('Kyc Form Group--->', this.allKycDataFormGroup)
    if (!this.isApprovalEnable) {
      this.kycApprovalForm.disable();
    }

  }

  ngOnDestroy() {
    console.log("Destroy called===>")
    this.subscriber$.unsubscribe()
  }

  async setKycData() {
    const merchantKycDetails$ = this.merchantService.getMerchantKycDetails(this.merchantId)
    this.merchantKycDetails = await lastValueFrom(merchantKycDetails$);

    const kycDetails = this.reformatKycData(this.merchantKycDetails);


    const {allow_wavier, wavier_date, wavier_remark, businessTypeId} = kycDetails[0] || {}
    this.documentId = businessTypeId

    console.log('Waive Kyc===>', kycDetails)

    this.allKycDataFormGroup = new FormGroup({
      merchantId: new FormControl(this.merchantId),
      isWavier: new FormControl(!!(allow_wavier == 'Y' || (wavier_remark && wavier_remark != ''))),
      wavierRemarks: new FormControl(wavier_remark || ''),
      wavierOffDate: new FormControl(wavier_date || ''),
      merchantKycData: new FormArray(this.loadKycData(kycDetails))
    });

    console.log("++++++++======>", this.allKycDataFormGroup.value);
    this.allKycDataFormGroup.updateValueAndValidity();

    this.onChangeWavier();

    if (this.permissions.includes('KYC_APPROVE') && !(this.permissions.includes('ADD') || this.permissions.includes('EDIT')) || this.permissions == '') {
      this.globalDisableFlag = true;
      // console.log('------------======+)))))========------>')
      this.allKycDataFormGroup.disable();
      this.allKycDataFormGroup.get('wavierRemarks')?.disable()
      // document.getElementById('wavierRemarks')?.setAttribute('disabled', 'disabled')
      this.allKycDataFormGroup.get('wavierOffDate')?.disable()
      // document.getElementById('wavierOffDate')?.setAttribute('disabled', 'disabled')
    }
  }

  get isWavier() { return this.allKycDataFormGroup.get('isWavier'); }
  get wavierRemarks() { return this.allKycDataFormGroup.get('wavierRemarks'); }
  get wavierOffDate() { return this.allKycDataFormGroup.get('wavierOffDate'); }
  get merchantKycData(): FormArray { return this.allKycDataFormGroup.get('merchantKycData') as FormArray; }

  getDocList(index: number){
    return this.merchantKycData.controls[index].get('docList') as FormArray
  }

  getDocCount(u: FormGroup) {
    return (u?.get('docList') as FormArray)?.controls?.filter((cnt) => cnt?.get('docPath')?.value !== '')?.length || 0
  }

  getDocListItem(index: number, listIndex: number) {
    return this.getDocList(index).controls[listIndex] as FormGroup
  }

  getDocListError(index: number){
    let error: any | null = null;
    const type = this.merchantKycData.controls[index].get('type')?.value
    if(type == 'other' || type== 'multi'){
      let allFalse = true;
      // console.log(index,'---', this.merchantKycData.controls[index]);
      (this.merchantKycData.controls[index].get('docTypeList') as FormArray)?.controls.forEach((listItem, innIndex)=>{
        // console.log(index,'---', listItem.get('isSelected')?.value);
        if(listItem.get('isSelected')?.value){
          allFalse = false;
        }
      })
      if(allFalse && !this.isWavier?.value){
        if(!error) error={};
        error['required'] = true;
      }
    }

    if(type == 'multi' || type== 'other'){
      (this.merchantKycData.controls[index].get('docTypeList') as FormArray)?.controls.forEach((listItem, innIndex)=> {
        // console.log("In Error===>", this.getDocTypeListError(index, innIndex)?.errors);
        const listItemPathError = this.getDocTypeListError(index, innIndex)?.errors;
        if(listItemPathError){
          if(!error) error={};
          Object.keys(listItemPathError || {}).forEach((key)=>{
            error[key] = listItemPathError[key];
          })
        }
      });
    }
    this.getDocList(index).controls.forEach(( listItem, listIndex)=>{
      const listItemPathError= this.getDocListItem(index, listIndex).get('docPath')?.errors
      const listItemNameError= this.getDocListItem(index, listIndex).get('docName')?.errors
      // const listItemErrorNew= this.getDocListItem(index, listIndex)


      if(listItemPathError){
        if(!error) error={};
        Object.keys(listItemPathError || {}).forEach((key)=>{
          error[key] = listItemPathError[key];
        })
      }
      if(listItemNameError){
        if(!error) error={};
        Object.keys(listItemNameError || {}).forEach((key)=>{
          error[key] = listItemNameError[key];
        })
      }
    });
    return error ? { errors: error} : error ;
  }

  getDocTypeList(index: number, rad: number){
    return (this.merchantKycData?.controls[index]?.get('docTypeList') as FormArray)?.controls[rad]?.get('docList') as FormArray
  }

  getDocTypeListItem(index: number, rad: number, listIndex: number){
    return this.getDocTypeList(index, rad).controls[listIndex] as FormGroup
  }

  getDocTypeListError(index: number, rad: number){
    let error: any | null = null;
    this.getDocTypeList(index, rad).controls.forEach(( listItem, listIndex)=>{
      const listItemPathError= this.getDocTypeListItem(index, rad, listIndex).get('docPath')?.errors
      const listItemNameError= this.getDocTypeListItem(index, rad, listIndex).get('docName')?.errors
      // const listItemErrorNew= this.getDocListItem(index, listIndex)

      if(listItemPathError){
        if(!error) error={};
        Object.keys(listItemPathError || {}).forEach((key)=>{
          error[key] = { docPath: listItemPathError[key]};
        })
      }
      if(listItemNameError){
        if(!error) error={};
        Object.keys(listItemNameError || {}).forEach((key)=>{
          error[key] = {docName: listItemNameError[key]};
        })
      }
    });
    const listItemError= this.getDocTypeList(index, rad)?.errors
    if(listItemError){
      if(!error) error={};
      Object.keys(listItemError || {}).forEach((key)=>{
        error[key] = listItemError[key];
      })
    }
    return error ? { errors: error} : error ;
  }

  onDocTypeChangeSingle(index: number, rad?: number){
    let status = true;
    const controls = this.merchantKycDataArr()[index].get('docTypeList').controls;

    if (!isNaN(<number>rad)) {
      // @ts-ignore
      const control = this.merchantKycDataArr()[index].get('docTypeList').controls[rad];
      // console.log("---In Rad---->", control)
      const val = control.get('isSelected').value;
      if (val) {
        status = false
      }

      console.log("//////////======>",this.getDocTypeList(index, <number>rad));
      if(!status){
        control.get('docType')?.setValidators([Validators.required])
        control?.updateValueAndValidity();
        this.getDocTypeList(index, <number>rad)?.setValidators([Validators.required, Validators.minLength(1)])
        this.getDocTypeList(index, <number>rad)?.updateValueAndValidity()
        this.getDocTypeList(index, <number>rad).controls.forEach((docListItem, listIndex)=>{
          this.getDocTypeListItem(index, <number>rad, listIndex).get('docPath')?.setValidators([Validators.required])
          this.getDocTypeListItem(index, <number>rad, listIndex).get('docName')?.setValidators([Validators.required])
          this.getDocTypeListItem(index, <number>rad, listIndex).get('docPath')?.updateValueAndValidity()
          this.getDocTypeListItem(index, <number>rad, listIndex).get('docName')?.updateValueAndValidity()
          // console.log(`${listIndex}===>>>>>`, this.getDocTypeListError(index, <number>rad)?.errors)
        });
      }
      else{
        this.getDocTypeList(index, <number>rad)?.setValidators([])
        this.getDocTypeList(index, <number>rad)?.updateValueAndValidity()
        this.getDocTypeList(index, <number>rad).controls.forEach((docListItem, listIndex)=>{
          this.getDocTypeListItem(index, <number>rad, listIndex).get('docPath')?.setValidators([])
          this.getDocTypeListItem(index, <number>rad, listIndex).get('docName')?.setValidators([])
          this.getDocTypeListItem(index, <number>rad, listIndex).get('docPath')?.updateValueAndValidity()
          this.getDocTypeListItem(index, <number>rad, listIndex).get('docName')?.updateValueAndValidity()

          // console.log(`${listIndex}=++++==>>>>>`, this.getDocTypeListError(index, <number>rad)?.errors)
        });
      }
      return status;
    }
    if (controls.length == 0) return false;
    controls.forEach((control: any, ind: number) => {
      // console.log("Onchange Raido------>", control?.value);
      const val = control.get('isSelected').value;
      if (val) {
        status = false
      }
    })
    if(!status){
      this.getDocList(index).controls.forEach((docListItem, listIndex)=>{
        this.getDocListItem(index, listIndex).get('docPath')?.setValidators([Validators.required])
        this.getDocListItem(index, listIndex).get('docName')?.setValidators([Validators.required])
        this.getDocListItem(index, listIndex).get('docPath')?.updateValueAndValidity()
        this.getDocListItem(index, listIndex).get('docName')?.updateValueAndValidity()

        // console.log(`${listIndex}===>>>>>`, this.getDocListError(index)?.errors)
      });
    }
    else{
      this.getDocList(index).controls.forEach((docListItem, listIndex)=>{
        this.getDocListItem(index, listIndex).get('docPath')?.setValidators([])
        this.getDocListItem(index, listIndex).get('docName')?.setValidators([])
        this.getDocListItem(index, listIndex).get('docPath')?.updateValueAndValidity()
        this.getDocListItem(index, listIndex).get('docName')?.updateValueAndValidity()

        // console.log(`${listIndex}=+++++==>>>>>`, this.getDocListError(index)?.errors)
      });
    }
    return status;
  }
  public wavierValidator(): ValidatorFn {
    return (controls: AbstractControl) => {
      const isWavier = controls.get('isWavier');
      const wavierOffDate = controls.get('wavierOffDate');
      const wavierRemarks = controls.get('wavierRemarks');
      const merchantKycData = controls.get('merchantKycData') as FormArray;

      // console.log("In validator===>", isWavier?.value)
      // console.log(merchantKycData?.controls);
      let waiverError = true;

      if (isWavier?.value) {
        waiverError = !waiverError;
        wavierOffDate?.addValidators([Validators.required])
        wavierRemarks?.addValidators([Validators.required])
      } else {
        wavierOffDate?.addValidators([])
        wavierRemarks?.addValidators([])
      }
      // wavierOffDate?.updateValueAndValidity()
      // wavierRemarks?.updateValueAndValidity()
      merchantKycData?.controls.forEach((fbControl: any) => {
        if (fbControl.get('type')?.value == 'single') {
          if (fbControl.get('docTypeList').length == 0) {
            fbControl?.setValidators([this.noDocTypeValidator(controls as FormGroup, isWavier?.value)])
          } else {
            fbControl?.setValidators([this.singleDocTypeValidator(controls as FormGroup, isWavier?.value)])
          }
        }
        if (fbControl.get('type')?.value == 'other') {
          fbControl?.setValidators([this.otherDocTypeValidator(controls as FormGroup, isWavier?.value)])
        }
        if (fbControl.get('type')?.value == 'multi') {
          fbControl?.setValidators([this.multiDocTypeValidator(controls as FormGroup, isWavier?.value)])
        }
      })

      return waiverError ? {waiverError: true} : null;
    };
  }

  onChangeWavier($event?: Event) {
    // console.log("onWaiverChange---->", this.isWavier?.value)
    if(this.isWavier?.value){
      this.wavierRemarks?.setValidators([Validators.required])
      this.wavierOffDate?.setValidators([Validators.required])
      this.wavierRemarks?.updateValueAndValidity()
      this.wavierOffDate?.updateValueAndValidity()
      this.merchantKycData.controls.forEach((listItem, index)=>{
        // console.log("++===>", listItem?.get('type')?.value)
        this.getDocList(index).controls.forEach((docListItem, listIndex)=>{
          this.getDocListItem(index, listIndex).get('docPath')?.setValidators([])
          this.getDocListItem(index, listIndex).get('docName')?.setValidators([])
          this.getDocListItem(index, listIndex).get('docPath')?.updateValueAndValidity()
          this.getDocListItem(index, listIndex).get('docName')?.updateValueAndValidity()

          // console.log(`${listIndex}===>>>>>`, this.getDocListItem(index, listIndex)?.errors)
        });
      })
    }else{
      this.wavierRemarks?.setValidators([])
      this.wavierOffDate?.setValidators([])
      this.wavierRemarks?.updateValueAndValidity()
      this.wavierOffDate?.updateValueAndValidity()
      this.merchantKycData.controls.forEach((listItem, index)=>{
        // console.log("++===>", listItem?.get('type')?.value)
        this.getDocList(index).controls.forEach((docListItem, listIndex)=>{
          this.getDocListItem(index, listIndex).get('docPath')?.setValidators([Validators.required])
          this.getDocListItem(index, listIndex).get('docName')?.setValidators([Validators.required])
          this.getDocListItem(index, listIndex).get('docPath')?.updateValueAndValidity()
          this.getDocListItem(index, listIndex).get('docName')?.updateValueAndValidity()

          // console.log(`${listIndex}===>>>>>`, this.getDocListItem(index, listIndex)?.errors)
        });
      })
    }
  }

  isKycValid(): boolean {
    let status = true;
    if (this.wavierRemarks?.errors) {
      status = false;
      this.isWavierSelector.nativeElement.focus();
    }
    if (this.wavierOffDate?.errors) {
      status = false;
      this.isWavierSelector.nativeElement.focus();
    }
    this.merchantKycData.controls.forEach((kycItem, ind) => {
      if (this.getDocListError(ind)?.errors) status = false;
    })

    return status
  }

  public noDocTypeValidator(kycForm: FormGroup, waiverValue: any): ValidatorFn {
    return (controls: AbstractControl) => {
      const docType = controls.get('docTypeList');
      const docList = controls.get('docList') as FormArray;
      const document = controls.get('document');
      const docName = controls.get('docName');
      const docPath = controls.get('docPath');
      const type = controls.get('type');

      // console.log("In noDocTypeValidator===>",kycForm, waiverValue)
      // console.log("In noDocTypeValidator Val===>",docType, docList, document, docName, docPath, type)

      if(waiverValue){
        docList.controls.forEach((listItem)=>{
          listItem.get('docName')?.addValidators([Validators.required]);
          listItem.get('docPath')?.addValidators([Validators.required]);
        })
      }else{
        docList.controls.forEach((listItem)=>{
          listItem.get('docName')?.clearValidators()
          listItem.get('docPath')?.clearValidators();
        })
      }

      let waiverError = true;

      return waiverError ? {waiverError: true} : null;
    };
  }

  public singleDocTypeValidator(kycForm: FormGroup, waiverValue: any): ValidatorFn {
    return (controls: AbstractControl) => {
      const isWavier = controls.get('isWavier');
      const docType = controls.get('docTypeList');
      const docList = controls.get('docList');
      const document = controls.get('document');
      const docName = controls.get('docName');
      const docPath = controls.get('docPath');
      const type = controls.get('type');

      // console.log("In singleDocTypeValidator===>",kycForm, waiverValue)
      // console.log("In singleDocTypeValidator Val===>",docType, docList, document, docName, docPath, type)

      let waiverError = true;

      return waiverError ? {waiverError: true} : null;
    };
  }

  public multiDocTypeValidator(kycForm: FormGroup, waiverValue: any): ValidatorFn {
    return (controls: AbstractControl) => {
      const isWavier = controls.get('isWavier');
      const docType = controls.get('docTypeList');
      const docList = controls.get('docList');
      const document = controls.get('document');
      const docName = controls.get('docName');
      const docPath = controls.get('docPath');
      const type = controls.get('type');

      // console.log("In multiDocTypeValidator===>",kycForm, waiverValue)
      // console.log("In multiDocTypeValidator Val===>",docType, docList, document, docName, docPath, type)

      let waiverError = true;

      return waiverError ? {waiverError: true} : null;
    };
  }

  public otherDocTypeValidator(kycForm: FormGroup, waiverValue: any): ValidatorFn {
    return (controls: AbstractControl) => {
      const isWavier = controls.get('isWavier');
      const docType = controls.get('docTypeList');
      const docList = controls.get('docList');
      const document = controls.get('document');
      const docName = controls.get('docName');
      const docPath = controls.get('docPath');
      const type = controls.get('type');

      // console.log("In otherDocTypeValidator===>",kycForm, waiverValue)
      // console.log("In otherDocTypeValidator Val===>",docType, docList, document, docName, docPath, type)

      let waiverError = true;

      return waiverError ? {waiverError: true} : null;
    };
  }

  reformatKycData(kycData: any[]) {
    const formatted: any[] = [];
    kycData.forEach((kyc) => {
      // console.log("Start====>>>>>>>>>>", kyc.docpath);

      if (kyc.docpath && kyc.docpath !== '') {
        this.isApprovalEnable = true
      }

      const fil = formatted.filter((d) => d.docid == kyc.docid)
      // console.log("fil===>", fil);
      if (fil.length == 0) {
        if(kyc.type == 'single'){
          const singleDocTypeList = kycData.filter((d) => d.docid == kyc.docid && d.type == kyc.type);

          formatted.push({
            ...kyc,
            docList : singleDocTypeList || [],
            documentDescriptionType: []
          })
        }else if(kyc.type == 'multi' ||kyc.type == 'other'){
          // console.log("KYC------>", kyc)
          let filOt = kycData.filter((d) => d.docid == kyc.docid && d.type == kyc.type && d.docType).sort((a, b)=> a.docType == b.docType ? 1: 0)
          const def = {
            allow_wavier: kyc.allow_wavier,
            businessType: kyc.businessType,
            businessTypeId: kyc.businessTypeId,
            docType: "",
            docid: kyc.docid,
            docname: "",
            docpath: "",
            document: kyc.document,
            subtext: kyc?.subtext,
            documentDescription: kyc.documentDescription,
            kycId: 0,
            type: kyc.type,
            wavier_date: kyc.wavier_date,
            wavier_remark: kyc.wavier_remark
          };
          // console.log("KYC Fil------>", [...filOt])
          const des: any[] = [];
          //based on doc description
          kyc.documentDescription.forEach((de: string) => {
            if (de !== '') {
              const dType = filOt.findIndex((d) => d.docType == de);
              const dTypeDocList = filOt.filter((d) => d.docType == de);
              console.log("========----->>>>", de, dTypeDocList)


              if (dType !== -1) {
                des.push({
                  ...filOt[dType],
                  docList : dTypeDocList || [],
                });
                // filOt.splice(dType, 1)
                filOt.forEach((d, index) => {
                  d.docType == de && filOt.splice(index, 1)
                });
                filOt = filOt.filter((d) => d.docType != de);
              }
              else {
                des.push({
                  ...def,
                  docList : [],
                  docType: de
                })
              }
              // console.log(de, "=---->", dType, [...filOt])
            }
          })
          console.log("========----->>>>", [...filOt])
          // des.push(...filOt);
          // filOt.forEach((dT)=>{
          let counter = 0;
          let removeItmes=[];
          while (filOt[counter]) {
            const dT=filOt[counter];
            const dType = filOt.findIndex((d) => d.docType == dT.docType);
            const dTypeDocList = filOt.filter((d) => d.docType == dT.docType);

            // console.log("KYC Fil Type------>", dT.docType, dTypeDocList)

            if (dType !== -1) {
              des.push({
                ...filOt[dType],
                docList: dTypeDocList || [],
              });
              // filOt.splice(dType, 1)
              const indexRm: number[] = [];
              filOt.forEach((d, index) => {
                // console.log("KYC Fil Before SPlice------>", [...filOt])
                if(d.docType == dT.docType){
                  indexRm.push(index);
                }
              });
              indexRm.forEach((ind, index)=>{
                removeItmes.push(...filOt.splice((ind - index), 1));
              })
              console.log("indexRm--->", indexRm);
            }
            if(filOt.length > 1 && removeItmes.length ==0) counter++;
            else counter=0;
            console.log("Pointer--->", counter, [...filOt]);
          }
          // })

          // des.push({
          //   ...filOt[dType],
          //   docList : dTypeDocList || [],
          // });

          formatted.push({
            ...kyc,
            documentDescriptionType: des
          })
        }

      }
      // console.log("End====>>>>>>>>>>");
    })
    // console.log("formatted===>", formatted)
    return formatted;
  }

  loadKycData(kycData: any) {
    let data: any = [];
    (kycData ?? []).forEach((item: any) => {
      // console.log("========>", item);
      if (item.type == 'other') {
        data.push(
          new FormGroup({
            docTypeList: new FormArray(this.loadOtherDocType(item.documentDescriptionType, item)),
            docList: new FormArray(this.loadDocList(item.docList || [])),
            document: new FormControl(item.document),
            docName: new FormControl(item.docname),
            docPath: new FormControl(item.docpath),
            subtext: new FormControl(item.subtext),
            type: new FormControl(item.type),
            docId: new FormControl(item.docId || item.docid),
            kycId: new FormControl(item.kycId || 0),
            uploadSuccess: new FormControl(false),
          })
        );
      } else if (item.type == 'multi') {
        data.push(
          new FormGroup({
            docTypeList: new FormArray(this.loadMultiDocType(item.documentDescriptionType, item)),
            docList: new FormArray(this.loadDocList(item.docList || [])),
            document: new FormControl(item.document),
            docName: new FormControl(item.docname),
            docPath: new FormControl(item.docpath),
            subtext: new FormControl(item.subtext),
            type: new FormControl(item.type),
            docId: new FormControl(item.docId || item.docid),
            kycId: new FormControl(item.kycId || 0),
            uploadSuccess: new FormControl(false),
          })
        );
      } else {
        data.push(
          new FormGroup({
            docTypeList: new FormArray(this.loadSingleDocType(item.documentDescription, item)),
            docList: new FormArray(this.loadDocList(item.docList || [])),
            document: new FormControl(item.document),
            docName: new FormControl(item.docname),
            docPath: new FormControl(item.docpath),
            subtext: new FormControl(item.subtext),
            type: new FormControl(item.type),
            docId: new FormControl(item.docId || item.docid),
            kycId: new FormControl(item.kycId || 0),
            uploadSuccess: new FormControl(false),
          })
        );
      }

    })
    return data;
  }

  loadSingleDocType(docTypes: any, item: any) {
    // console.log("=====>Single===>", docTypes)

    let data: any = [];
    (Array.isArray(docTypes) ? docTypes : []).forEach((docType: any) => {
      if (docType !== '') {
        // console.log("=====>Single===>", item.docType == docType)
        data.push(
          new FormGroup({
            docList: new FormArray(this.loadDocList(item.docList || [])),
            docType: new FormControl(docType.docType || docType),
            docName: new FormControl(docType.docname || ''),
            docPath: new FormControl(docType.docpath || ''),
            type: new FormControl(docType.type || ''),
            docId: new FormControl(docType.docid || ''),
            kycId: new FormControl(docType.kycId || 0),
            isSelected: new FormControl(item.docType == docType ? docType : false),
            uploadSuccess: new FormControl(false),
            inputDisabled: new FormControl(true),

          })
        );
      }

    });
    return data;
  }

  loadMultiDocType(docTypes: any, item: any) {
    console.log("=====>Multi===>", docTypes)
    let data: any = [];
    (Array.isArray(docTypes) ? docTypes : []).forEach((docType: any) => {
      if (docType !== '') {
        data.push(
          new FormGroup({
            docList: new FormArray(this.loadDocList(docType.docList || [])),
            docType: new FormControl(docType.docType || docType),
            docName: new FormControl(docType.docname || ''),
            docPath: new FormControl(docType.docpath || ''),
            type: new FormControl(docType.type || ''),
            docId: new FormControl(docType.docid || ''),
            kycId: new FormControl(docType.kycId || 0),
            isSelected: new FormControl((docType.docList || []).length >0 ? docType.docType : false),
            uploadSuccess: new FormControl(false),
            inputDisabled: new FormControl(docType.documentDescription.includes(docType.docType)),
          })
        );
      }
    });
    return data;
  }

  kycUploadFormSelect(type: string, selectedGroup: FormGroup, outIndex: number, innerIndex?: number, actionType = 'browse') {
    this.currentSelectedGroup = {
      outIndex,
      innerIndex,
      type,
      currentFormGroup: selectedGroup
    };
    this.merchantService.uploadKycBrowseButton(this.currentSelectedGroup);
    // console.log(selectedGroup)
    this.localDisableFlag = actionType == "view"? true: this.isButtonDisable(outIndex, innerIndex)
    this.kycUploadModalConfig = {
      ...this.kycUploadModalConfig,
      modalTitle: `${selectedGroup?.get('document')?.value}`
    }
    this.kycUploadModal.open();
  }

  loadOtherDocType(docTypes: any, item: any) {
    // console.log("=====>Other===>", docTypes, item)
    let data: any = [];
    (Array.isArray(docTypes) ? docTypes : []).forEach((docType: any) => {
      if (docType !== '') {
        data.push(
          new FormGroup({
            docList: new FormArray(this.loadDocList(docType.docList || [])),
            docType: new FormControl(docType.docType || docType),
            docName: new FormControl(docType.docname || ''),
            docPath: new FormControl(docType.docpath || ''),
            type: new FormControl(docType.type || ''),
            docId: new FormControl(docType.docid || ''),
            kycId: new FormControl(docType.kycId || 0),
            isSelected: new FormControl((docType.docList || []).length >0 ? docType.docType : false),
            uploadSuccess: new FormControl(false),
            inputDisabled: new FormControl(docType.documentDescription.includes(docType.docType)),
          })
        );
        // console.log("Other------->", data, item.docList)
      }
    });
    return data;
  }
  loadDocList(docTypes: any) {
    // console.log("=====>Other===>", docTypes)
    let data: any = [];
    (Array.isArray(docTypes) ? docTypes : []).forEach((docType: any) => {
      if (docType !== '') {
        data.push(
          this.addDocList(docType)
        );
      }
    });
    return data;
  }

  addOtherDocType(docTypes?: any) {
    return new FormGroup({
      docList: new FormArray([]),
      docType: new FormControl(''),
      docName: new FormControl(''),
      docPath: new FormControl(''),
      type: new FormControl(''),
      docId: new FormControl(''),
      kycId: new FormControl(0),
      isSelected: new FormControl(true),
      uploadSuccess: new FormControl(false),
      inputDisabled: new FormControl(false),
    });
  }

  addDocList(docType?: any) {
    return new FormGroup({
      docName: new FormControl(docType?.docname || docType?.docName || '', [Validators.required]),
      docPath: new FormControl(docType?.docpath || docType?.docPath || '', [Validators.required]),
      kycId: new FormControl(docType?.kycId || 0),
      isSelected: new FormControl(true),
      uploadSuccess: new FormControl(false)
    });
  }


  onFileSelect($event: any, i: number, docid: any, kycId: any, type?: string) {
    type = type || 'single'
    if ($event?.target?.files.length > 0) {
      const controls = this.merchantKycDataArr()[i];
      const docListControls = this.merchantKycDataArr()[i].get('docTypeList').controls;

      const file = $event.target.files[0];
      const fileProp = file.name?.split('.');

      // console.log("File--->", file);
      // console.log("FileProp--->", fileProp);
      if (!allowedExtensions.includes(fileProp[1])) {
        this.alertService.errorAlert({
          html: "Only PDF, PNG, JPG, JPEG, BMP, PNG files are allowed"
        })
        return false;
      } else {
        if (file) {
          const formData = new FormData();
          formData.append('imageFile', file);
          formData.append('merchantId', this.merchantId);
          formData.append("docType", "");
          formData.append('docId', docid);
          this.merchantService.uploadKycFile(formData)
            .subscribe((data: any) => {
              data.forEach((element: any) => {
                controls.patchValue({
                    "docId": docid,
                    "docName": element.docName,
                    "docPath": element.docpath,
                    // "doctype": docListControls.doctype.value || this.fileExtension,
                    "kycId": kycId || 0,
                    "type": type,
                    "uploadSuccess": true
                  }
                )

              });
            })
        }
        return true;
      }

    }
    return false;
  }


  onFileSelectMulti($event: any, i: number, docid: any, kycId: any, type: any, rad: number) {
    type = type || 'other'
    if ($event?.target?.files.length > 0) {
      const controls = this.merchantKycDataArr()[i].get('docTypeList').controls[rad];
      const docType = controls.get('docType').value
      // const docListControls = this.merchantKycDataArr()[i].get('docTypeList').controls;
      // const allowedExtensions = ["pdf", "PDF", "png", "PNG", "jpg", "JPG", "jpeg", "JPEG"];
      const file = $event.target.files[0];
      const fileProp = file.name?.split('.');

      // console.log("File--->", file);
      // console.log("FileProp--->", fileProp);
      if (!allowedExtensions.includes(fileProp[1])) {
        this.alertService.errorAlert({
          html: "Only " + "PDF" + "PNG" + "JPG" + "JPEG" + " files are allowed"
        })
        return false;
      } else {
        if (file) {
          const formData = new FormData();
          formData.append('imageFile', file);
          formData.append('merchantId', this.merchantId);
          formData.append("docType", docType || type);
          formData.append('docId', docid);
          this.merchantService.uploadKycFile(formData)
            .subscribe((data: any) => {
              data.forEach((element: any) => {
                controls.patchValue({
                    "docId": docid,
                    "docName": element.docName,
                    "docPath": element.docpath,
                    // "doctype": docListControls.doctype.value || this.fileExtension,
                    "kycId": kycId || 0,
                    "type": type,
                    "uploadSuccess": true
                  }
                )

              });
            })
        }
        return true;
      }

    }
    return false;
  }

  addCustomDocType(i: number, u: any) {
    const controls = this.merchantKycDataArr()[i];
    const docListControls = this.merchantKycDataArr()[i].get('docTypeList').controls;
    const length = docListControls.length;
    docListControls.push(this.addOtherDocType())
    this.getDocTypeList(i, length).updateValueAndValidity();
    this.onDocTypeChangeSingle(i, length);
    // console.log("Doc Listing---->",this.merchantKycDataArr()[i])
  }

  removeCustomDocType(index: number, inIndex: number){
    // this.loaderService.showLoader();
    const docTypeListControls = (this.merchantKycData.controls[index]?.get('docTypeList') as FormArray);
    const docListControls = (docTypeListControls?.controls[inIndex]?.get('docList') as FormArray)

    if(docListControls?.controls.length == 0){
      docTypeListControls.removeAt(inIndex, {emitEvent: true})
      this.loaderService.hideLoader();
      return ;
    }
    return this.alertService.confirmBox(
      async () => {
        console.log('________________=====>');
        this.loaderService.showLoader();
        return Promise.all(docListControls?.controls.map((ctrl) => {
          console.log(ctrl?.get('docPath')?.value,
            ctrl?.get('kycId')?.value,
            ctrl?.get('docName')?.value);
          return new Promise((resolve, reject) => {
            // setTimeout(() => {
            //   reject({
            //     docPath: ctrl?.get('docPath')?.value,
            //     kycId: ctrl?.get('kycId')?.value,
            //     docName: ctrl?.get('docName')?.value
            //   })
            // }, 2000)
            this.merchantService.deleteKycFile({
              merchantId: this.merchantId,
              path: ctrl?.get('docPath')?.value,
              id: ctrl?.get('kycId')?.value || 0,
              // docName: ctrl?.get('docName')?.value
            }).subscribe((respData)=>{
              resolve(respData)
            }, (err)=>{
              reject(err)
            })

          })
        }))
          .then((data) => {
            console.log(data);
            this.loaderService.hideLoader();
          }).catch(() => {
            console.log('Conf action catch');
            throw new Error('Conf action error')
          })
      },
      {
        title: `<h4>Are you sure to remove uploaded files?</h4>`,
        html: ``,
        text: ``,
      },
      {
        html: "Files have been deleted successfully.!"
      },
      async () => {
        docTypeListControls.removeAt(inIndex, {emitEvent: true})
        this.loaderService.hideLoader();
        //   console.log("'''''---->", da)
        //   docTypeListControls.removeAt(inIndex, {emitEvent: true})
        //   this.loaderService.hideLoader();
      },
      async (err: any) => {
        this.loaderService.hideLoader();
        console.log("--->Error Action Log");
        console.log(err);
      },
      {
        html: "Your documents are safe."
      })
  }

  addCustomDocList(i: number, u: any) {
    const controls = this.merchantKycDataArr()[i];
    const docListControls = this.merchantKycDataArr()[i].get('docList').controls;
    docListControls.push(this.addDocList())
  }

  resetSelection($event: MouseEvent, i: number, u: any) {
    const docListControls = (this.merchantKycData.controls[i]?.get('docList') as FormArray);

    if(docListControls?.controls.length == 0){
      this.merchantKycDataArr()[i].get('docTypeList').controls.forEach((control: any, i: number) => {
        control.get('isSelected').patchValue(false)
      });
      this.onDocTypeChangeSingle(i)
      this.loaderService.hideLoader();
      return ;
    }else if(docListControls?.controls.length > 0 && docListControls?.controls[0]?.get('docPath')?.value == '' ){
      this.merchantKycDataArr()[i].get('docTypeList').controls.forEach((control: any, i: number) => {
        control.get('isSelected').patchValue(false)
      });
      this.onDocTypeChangeSingle(i)
      this.loaderService.hideLoader();
      return ;
    }
    return this.alertService.confirmBox(
      async () => {
        this.loaderService.showLoader();
        return Promise.all(docListControls?.controls.map((ctrl, fileIndex) => {

          return new Promise((resolve, reject) => {
            this.merchantService.deleteKycFile({
              merchantId: this.merchantId,
              path: ctrl?.get('docPath')?.value,
              id: ctrl?.get('kycId')?.value || 0,
              // docName: ctrl?.get('docName')?.value
            }).subscribe((respData) => {
              docListControls.removeAt(fileIndex, {emitEvent: true})
              resolve(respData)
            }, (err) => {
              reject(err)
            })

          })
        }))
          .then((data) => {
            console.log(data);
            this.loaderService.hideLoader();
          }).catch(() => {
            console.log('Conf action catch');
            throw new Error('Conf action error')
          })
      },
      {
        title: `<h4>Are you sure to remove uploaded files?</h4>`,
        html: ``,
        text: ``,
      },
      {
        html: "Files have been deleted successfully.!"
      },
      async () => {
        this.merchantKycDataArr()[i].get('docTypeList').controls.forEach((control: any, i: number) => {
          control.get('isSelected').patchValue(false)
        });
        this.onDocTypeChangeSingle(i)
        this.loaderService.hideLoader();
      },
      async (err: any) => {
        this.loaderService.hideLoader();
        console.log("--->Error Action Log");
        console.log(err);
      },
      {
        html: "Your documents are safe."
      })
  }

  downloadFileService(docname: any, docpath: any) {
    let fileType = docname.split('.').pop();
    let fileInitial = docname.split('.')[0]
    const formData = new FormData();
    formData.append('urlfile', docpath);
    formData.append('docname', docname);
    this.merchantService.downloadKycFile(formData)
      .subscribe((res: any) => {
        const response = res;
        const random = Math.floor(Math.random() * 10000000000 + 1);

        const today = new Date();

        const linkSource = 'data:application/' + fileType + ';base64,' + response.Data;
        const downloadLink = document.createElement("a");
        const NewfileName = "Payments_" + today.getFullYear().toString() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + ("0" + today.getDate()).slice(-2) + "-" + random.toString().slice(-4) + fileInitial + "." + fileType;

        downloadLink.href = linkSource;
        downloadLink.download = NewfileName;
        downloadLink.click();
      })

  }
  viewFileService(docname: any, docpath: any) {
    let fileType = docname.split('.').pop();
    let fileInitial = docname.split('.')[0]
    const formData = new FormData();
    formData.append('urlfile', docpath);
    formData.append('docname', docname);
    return new Promise((resolve, reject) => {
      this.merchantService.downloadKycFile(formData)
        .subscribe((res) => {
          // const size = res.headers.get('Content-Length')
          const sizeInBytes = 4 * Math.ceil((res?.Data?.length / 3))*0.5624896334383812;
          const sizeInKb=sizeInBytes/1000;
          console.log(sizeInKb, this.detectBrowserName(),"======++++++++++++===>");
          if (!res?.Data){
            return reject(res);
          }

          const linkSource = 'data:application/' + fileType + ';base64,' + res?.Data;
          let temp_url;
          if (sizeInKb > 1024) {
            const blob = this.dataURLtoBlob(linkSource);
            temp_url = window.URL.createObjectURL(blob);
          }


          this.kycFileSrc = {
            type: fileType == 'pdf' ? 'FILE' : 'IMAGE',
            src: this.sanitizer.bypassSecurityTrustResourceUrl(temp_url || linkSource)
          }
          return resolve(this.kycFileSrc);
        })
    })


  }

  deleteFileService(docpath: any, kycId: any, docname: any) {
    const formData = {
      "merchantId": this.merchantId,
      "path": docpath,
      "id": kycId || 0
    }
    return this.alertService.confirmBox(this.merchantService.deleteKycFile(formData), {
      title: `<h4>Are you sure to remove <b>${docname}</b> ?</h4>`,
      html: ``,
      text: ``
    }, {
      html: "File has been deleted successfully.!"
    }, async () => {
      // await this.setKycData();
      this.currentSelectedGroup = {
        ...this.currentSelectedGroup,
        currentFormGroup: this.merchantKycDataArr()[this.currentSelectedGroup.outIndex]
      };
      this.merchantService.uploadKycBrowseButton(this.currentSelectedGroup);
    }, null, {
      html: "Your document is safe."
    });
  }

  onRadioSelect($event: Event, i: number, rad: number, radio: any, docType?: any, docId?: any) {
    // console.log("=====>");
    // console.log($event, i, rad, radio, docType, docId);
    // console.log(this.merchantKycDataArr()[i].get('docTypeList').controls[rad].get('isSelected'))

    this.merchantKycDataArr()[i].get('docTypeList').controls.forEach((control: any, i: number) => {
      if (rad !== i) control.get('isSelected').patchValue(false)
    })

    this.onDocTypeChangeSingle(i);

    // console.log("=====>");
  }

  onRadioReset(i: number) {

  }

  // @ts-ignore
  isSubDocChecked(documentDescriptionDetails: any, radio: any): boolean {

  }

  getSubDocError(i: number, rad: number, docid: any, radio: any) {
    return false;
  }


  getSubCatDoc(documentDescriptionDetails: any, radio: any, docid?: any): any {

  }

  // toggleRadio(bookTypeIndex, authorIndex) {
  //   (this.allKycDataFormGroup?.get('merchantKycData')?.controls || []).forEach((control: any, controlIndex:number) => {
  //     if (controlIndex === bookTypeIndex) {
  //       control.get('authorsList').controls.forEach((authControl: any,
  //                                                    authControlIndex: any) => {
  //         if (authControlIndex === authorIndex) {
  //           authControl.get('isSelected').patchValue(true);
  //         } else {
  //           authControl.get('isSelected').patchValue(false);
  //         }
  //       });
  //     }
  //   });
  // }


  submitKycData($event: MouseEvent, value: any) {
    const allow_wavier = this.allKycDataFormGroup.get('isWavier')?.value;
    const wavier_date = this.allKycDataFormGroup.get('wavierOffDate')?.value
    const wavier_remark = this.allKycDataFormGroup.get('wavierRemarks')?.value

    console.log(allow_wavier, wavier_date, wavier_remark);
    // return;
    $event.preventDefault();
    this.isKycFormSubmitted = true;
    const finalData: any[] = []
    if(this.isKycValid()){
      // this.waverError.nativeElement.focus();
      // console.log("===>kyc Form====>", this.allKycDataFormGroup.get('merchantKycData')?.value)
      this.merchantKycDataArr().forEach((l1Control: FormGroup)=>{
        if(l1Control.get('type')?.value == 'single'){
          (l1Control.get('docList') as FormArray)?.controls.forEach((l3Control)=>{
            // console.log("Single Type:", l3Control.value)
            const fileSplit = l3Control.value?.docName.split('.')
            finalData.push({
              "documentId": this.documentId,
              "docid": l1Control.get('docId')?.value,
              "docname": l3Control.value?.docName || '',
              "docpath": l3Control.value?.docPath || '',
              "doctype": l1Control.get('docTypeList')?.value?.find((dtl: any)=> dtl.isSelected)?.docType || (fileSplit.length > 0 ? fileSplit[fileSplit.length -1] : 'default'),
              "kycid": l3Control.value?.kycId || 0,
              "allow_wavier": this.allKycDataFormGroup.get('isWavier')?.value ? 'Y': 'N',
              "wavier_date": this.allKycDataFormGroup.get('wavierOffDate')?.value || '',
              "wavier_remark": this.allKycDataFormGroup.get('wavierRemarks')?.value || '',
              "type": "single"
            })
          })

        } else if(['multi', 'other'].includes(l1Control.get('type')?.value)){
          // console.log(`${l1Control.get('type')?.value} Type:`, l1Control.get('docList')?.value);
          // @ts-ignore
          (l1Control.get('docTypeList') as FormArray).controls.forEach((l2Control: FormGroup, ctInd)=>{
            // console.log("Other Type:",ctInd, l2Control.get('docType')?.value);
            const currentDocType = l2Control.get('docType')?.value;
            (l2Control.get('docList') as FormArray)?.controls.forEach((l4Control)=>{
              // console.log("Other Type:", l4Control.value)
              // console.log("2--->", l2Control);
              if(l2Control.get('isSelected')?.value){
                const fileSplit = l4Control.value?.docName.split('.')
                // console.log("1--->", l1Control.get('docTypeList')?.value?.find((dtl: any)=> dtl.isSelected)?.docType);

                finalData.push({
                  "documentId": this.documentId,
                  "docid": l1Control.get('docId')?.value,
                  "docname": l4Control.value?.docName || '',
                  "docpath": l4Control.value?.docPath || '',
                  "doctype": currentDocType || l1Control.get('docTypeList')?.value?.find((dtl: any)=> dtl.isSelected)?.docType || (fileSplit.length > 0 ? fileSplit[fileSplit.length -1] : 'default'),
                  "kycid": l4Control.value?.kycId || 0,
                  "allow_wavier": this.allKycDataFormGroup.get('isWavier')?.value ? 'Y': 'N',
                  "wavier_date": this.allKycDataFormGroup.get('wavierOffDate')?.value || '',
                  "wavier_remark": this.allKycDataFormGroup.get('wavierRemarks')?.value || '',
                  "type": l1Control.get('type')?.value
                })
              }
            })
          })
        }
      });

      this.merchantService.uploadKycDocsData(this.merchantId, finalData)
        .subscribe((data)=>{
          if(data){
            this.alertService.successAlert('KYC documents Submitted Successfully!', '');
            this.setKycData();
          }
        })
    }
    // console.log('Final Array ====>', finalData, this.isKycValid())
  }

  isButtonDisable(i: number, rad?: number | undefined) {
    let status = true;
    const controls = this.merchantKycDataArr()[i].get('docTypeList').controls;
    if (!isNaN(<number>rad)) {
      // @ts-ignore
      const control = this.merchantKycDataArr()[i].get('docTypeList').controls[rad];
      const val = control.get('isSelected').value;
      if (val) {
        status = false
      }
      return status;
    }
    if (controls.length == 0) return false;
    controls.forEach((control: any, ind: number) => {
      const val = control.get('isSelected').value;
      if (val) {
        status = false
      }
    })
    return status;
  }

  statusApproval(status: number) {
    let appRequestBody;
    let responseMsg: string;
    const remarks = this.kycApprovalForm.controls['remarks'].value;
    // return;
    if (remarks.trim() == '') {
      // this.errorRemarks = 1;
      this.alertService.errorAlert({
        text: "Please enter remarks"
      });
      return false;
    }

    if (this.kycApprovalForm.valid) {
      if (status == 1) {
        responseMsg = "Kyc Successfully approved";
        appRequestBody = {
          "Mid": this.merchantId,
          "Status": "Approval",
          "Remark": remarks,
          "Approvel_type": "Kyc",
          "Added_By": this.storage.getUserName().toString()

        }
      } else {
        responseMsg = "Kyc Successfully rejected";
        appRequestBody = {
          "Mid": this.merchantId,
          "Status": "Approval",
          "Remark": remarks,
          "Approvel_type": "RKyc",
          "Added_By": this.storage.getUserName().toString()

        }
      }

      this.merchantService.sendApproval(appRequestBody)
        .subscribe(
          (data) => {
            if (data?.length > 0) {
              this.status = data[0]['kyc_approvel']
              if (this.status != 0)
                this.kycApprovalForm.controls['remarks'].disable();
              // this.alertService.toastSuccessMessageAlert({
              //   title: responseMsg
              // })
              this.merchantService.getRiskRemark(this.merchantId, 'M', 'Kyc')
                .subscribe((data: any) => {
                  this.remarkData = data
                  this.dataTable ? this.dataTable.destroy() : console.log(this.remarkData)
                  this.remarkData ? this.dataTable = new DataTable("#dataTableExample") : this.dataTable.destroy()
                  if (this.remarkData) {
                    this.remarkData.forEach((element: any) => {
                      this.dataTable.rows().add(Object.values(element));
                    })
                  }
                }
              )

              this.alertService.successAlert(responseMsg)
            } else {
              this.alertService.errorAlert({
                text: "Some error occurred"
              })
            }

          },
          (error) => {
            this.alertService.errorAlert()
          }
        )
      return true;
    }
    if (remarks.trim() == '') {
      // this.errorRemarks = 1;
      this.alertService.errorAlert({
        text: "Please enter remarks"
      })
      return true;
    }
    // this.errorRemarks = 0;
    return true;
  }

  detectBrowserName() {
    const agent = window.navigator.userAgent.toLowerCase()
    switch (true) {
      case agent.indexOf('edge') > -1:
        return 'edge';
      case agent.indexOf('opr') > -1 && !!(<any>window).opr:
        return 'opera';
      case agent.indexOf('chrome') > -1 && !!(<any>window).chrome:
        return 'chrome';
      case agent.indexOf('trident') > -1:
        return 'ie';
      case agent.indexOf('firefox') > -1:
        return 'firefox';
      case agent.indexOf('safari') > -1:
        return 'safari';
      default:
        return 'other';
    }
  }
  dataURLtoBlob(dataurl: string) {
    let arr = dataurl.split(',') || [];
      // @ts-ignore
    let mime = arr[0]?.match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
  }
}

