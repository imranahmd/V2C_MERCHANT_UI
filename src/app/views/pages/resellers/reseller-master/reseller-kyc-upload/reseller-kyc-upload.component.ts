import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AlertService} from "../../../../../_services/alert.service";
import {MenusService} from "../../../../../_services/menu.service";
import {Location} from "@angular/common";
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {DomSanitizer} from '@angular/platform-browser';
import {ResellerService} from "../reseller.service";
import {ActivatedRoute, Params} from "@angular/router";
import {lastValueFrom} from "rxjs";
import {DataTable} from "simple-datatables";
import {StorageService} from "../../../../../_services/storage.service";
import {ModalComponent} from "../../../../../common/modal/modal.component";
import {ModalConfig} from "../../../../../common/modal/modal.config";

@Component({
  selector: 'app-reseller-kyc-upload',
  templateUrl: './reseller-kyc-upload.component.html',
  styleUrls: ['./reseller-kyc-upload.component.scss']
})
export class ResellerKycUploadComponent implements OnInit {
  @ViewChild('waverError') waverError: ElementRef
  kycUploadModalConfig: ModalConfig;
  kycViewModalConfig: ModalConfig;
  resellerId: any;
  resellerDetails: any;
  resellerKycDetails: any;
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
  kycFileSrc: any;
  @ViewChild('kycUploadModal') private kycUploadModal: ModalComponent;
  @ViewChild('kycFileViewModal') private kycFileViewModal: ModalComponent;
  private queryParams: Params;
  private documentId: any;

  constructor(
    private alertService: AlertService,
    private menuService: MenusService,
    private location: Location,
    private route: ActivatedRoute,
    public formBuilder: FormBuilder,
    private resellerService: ResellerService,
    private storage: StorageService,
    private sanitizer: DomSanitizer
  ) {
    const path = this.location.prepareExternalUrl(this.location.path());
    this.permissions = this.menuService.getPermissions(path);
    this.route.queryParams
      .subscribe(params => {
          this.queryParams = params;
          this.resellerId = params?.mid;
          try {
            this.resellerService.getRiskRemark(this.resellerId, 'R', 'Kyc')
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

  get isWavier() {
    return this.allKycDataFormGroup.get('isWavier');
  }

  get wavierRemarks() {
    return this.allKycDataFormGroup.get('wavierRemarks');
  }

  get wavierOffDate() {
    return this.allKycDataFormGroup.get('wavierOffDate');
  }

  get resellerKycData(): FormArray {
    return this.allKycDataFormGroup.get('resellerKycData') as FormArray;
  }

  resellerKycDataArr(): any {
    return (this.allKycDataFormGroup.get('resellerKycData') as FormArray)?.controls;
  }

  docTypArr(docType: FormControl): any {
    return (docType.get('docTypeList') as FormArray)?.controls;
  }

  async ngOnInit(): Promise<void> {
    const self = this;
    const resellerDetails$ = this.resellerService.getReseller(this.resellerId)
    this.resellerDetails = await lastValueFrom(resellerDetails$);
    this.status = this.resellerDetails[0]?.kyc_approvel

    this.kycUploadModalConfig = {
      modalTitle: "Reseller Status",
      modalSize: 'lg',
      hideDismissButton(): boolean {
        return true
      },
      hideCloseButton(): boolean {
        return true
      }
    }

    this.kycViewModalConfig = {
      modalTitle: "Reseller Status",
      modalSize: 'sm',
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

    this.resellerService.kycUploadObserver.subscribe((data: any) => {
      if (data?.type == 'FILE_UPLOAD') {
        const {outIndex, innerIndex, type, fileUploadDetails} = data?.fileData;
        if (!isNaN(innerIndex)) {
          const controls = ((this.resellerKycDataArr()[outIndex]?.get('docTypeList') as FormArray)?.controls[innerIndex]?.get('docList') as FormArray)?.controls;
          if (controls && controls[0]?.get('docPath')?.value == '' && controls[0]?.get('kycId')?.value != 0) {
            controls[0].patchValue({
              docName: fileUploadDetails?.docName || fileUploadDetails?.docname || '',
              docPath: fileUploadDetails?.docPath || fileUploadDetails?.docpath || '',
            })
          } else {
            controls.push(this.addDocList(fileUploadDetails));
          }
          ((this.resellerKycDataArr()[outIndex]?.get('docTypeList') as FormArray)?.controls[innerIndex]?.get('docList') as FormArray).updateValueAndValidity();
        } else {
          const controls = this.resellerKycDataArr()[outIndex]?.get('docList').controls;
          if (controls[0]?.get('docPath').value == '' && controls[0]?.get('kycId').value != 0) {
            controls[0].patchValue({
              docName: fileUploadDetails?.docName || fileUploadDetails?.docname || '',
              docPath: fileUploadDetails?.docPath || fileUploadDetails?.docpath || '',
            })
          } else {
            controls.push(this.addDocList(fileUploadDetails));
          }
          this.resellerKycDataArr()[outIndex]?.get('docList').updateValueAndValidity();
        }
      }

      if (data?.type == 'FILE_DELETE') {
        const {outIndex, innerIndex, type, fileIndex} = data?.fileData;
        if (!isNaN(innerIndex)) {
          const controls = ((this.resellerKycDataArr()[outIndex]?.get('docTypeList') as FormArray)?.controls[innerIndex]?.get('docList') as FormArray)?.controls;
          this.deleteFileService(
            controls[fileIndex]?.get('docPath')?.value,
            controls[fileIndex]?.get('kycId')?.value,
            controls[fileIndex]?.get('docName')?.value
          )
        } else {
          const controls = this.resellerKycDataArr()[outIndex]?.get('docList').controls;
          this.deleteFileService(
            controls[fileIndex]?.get('docPath')?.value,
            controls[fileIndex]?.get('kycId')?.value,
            controls[fileIndex]?.get('docName')?.value
          )
        }
      }
      if (data?.type == 'FILE_DOWNLOAD') {
        const {outIndex, innerIndex, type, fileIndex} = data?.fileData;
        if (!isNaN(innerIndex)) {
          const controls = ((this.resellerKycDataArr()[outIndex]?.get('docTypeList') as FormArray)?.controls[innerIndex]?.get('docList') as FormArray)?.controls;
          this.downloadFileService(controls[fileIndex]?.get('docName')?.value, controls[fileIndex]?.get('docPath')?.value)
        } else {
          const controls = this.resellerKycDataArr()[outIndex]?.get('docList').controls;
          this.downloadFileService(controls[fileIndex]?.get('docName')?.value, controls[fileIndex]?.get('docPath')?.value)
        }
      }
      if (data?.type == 'FILE_VIEWED') {
        const {outIndex, innerIndex, type, fileIndex} = data?.fileData;
        if (!isNaN(innerIndex)) {
          const controls = ((this.resellerKycDataArr()[outIndex]?.get('docTypeList') as FormArray)?.controls[innerIndex]?.get('docList') as FormArray)?.controls;
          this.kycViewModalConfig = {
            ...this.kycViewModalConfig,
            modalTitle: `${controls[fileIndex]?.get('docName')?.value}`
          }
          this.kycFileViewModal.open()
          this.viewFileService(controls[fileIndex]?.get('docName')?.value, controls[fileIndex]?.get('docPath')?.value)
        } else {
          const controls = this.resellerKycDataArr()[outIndex]?.get('docList').controls;
          this.kycViewModalConfig = {
            ...this.kycViewModalConfig,
            modalTitle: `${controls[fileIndex]?.get('docName')?.value}`
          }
          this.kycFileViewModal.open()
          this.viewFileService(controls[fileIndex]?.get('docName')?.value, controls[fileIndex]?.get('docPath')?.value)
        }
      }
    })

    if (!this.isApprovalEnable) {
      this.kycApprovalForm.disable();
    }

  }

  async setKycData() {
    const resellerKycDetails$ = this.resellerService.getResellerKycDetails(this.resellerId)
    this.resellerKycDetails = await lastValueFrom(resellerKycDetails$);

    const kycDetails = this.reformatKycData(this.resellerKycDetails);

    console.log("this.resellerKycDetails------>", this.resellerKycDetails)
    console.log("kycDetails------>", kycDetails)


    const {allow_wavier, wavier_date, wavier_remark, businessTypeId} = kycDetails[0]
    this.documentId = businessTypeId

    this.allKycDataFormGroup = new FormGroup({
      resellerId: new FormControl(this.resellerId),
      isWavier: new FormControl(!!(allow_wavier == 'Y' || (wavier_remark && wavier_remark != ''))),
      wavierRemarks: new FormControl(wavier_remark || ''),
      wavierOffDate: new FormControl(wavier_date || ''),
      resellerKycData: new FormArray(this.loadKycData(kycDetails))
    });

    this.allKycDataFormGroup.updateValueAndValidity();

    this.onChangeWavier();

    if (this.permissions.includes('KYC_APPROVE') && !(this.permissions.includes('ADD') || this.permissions.includes('EDIT')) || this.permissions == '') {
      this.globalDisableFlag = true;
      this.allKycDataFormGroup.disable();
      this.allKycDataFormGroup.get('wavierRemarks')?.disable()
      this.allKycDataFormGroup.get('wavierOffDate')?.disable()
    }
  }

  getDocList(index: number) {
    return this.resellerKycData.controls[index].get('docList') as FormArray
  }

  getDocListItem(index: number, listIndex: number) {
    return this.getDocList(index).controls[listIndex] as FormGroup
  }

  getDocListError(index: number) {
    let error: any | null = null;
    const type = this.resellerKycData.controls[index].get('type')?.value
    if (type == 'other' || type == 'multi') {
      let allFalse = true;
      (this.resellerKycData.controls[index].get('docTypeList') as FormArray)?.controls.forEach((listItem, innIndex) => {
        if (listItem.get('isSelected')?.value) {
          allFalse = false;
        }
      })
      if (allFalse && !this.isWavier?.value) {
        if (!error) error = {};
        error['required'] = true;
      }
    }

    if (type == 'multi' || type == 'other') {
      (this.resellerKycData.controls[index].get('docTypeList') as FormArray)?.controls.forEach((listItem, innIndex) => {
        // console.log("In Error===>", this.getDocTypeListError(index, innIndex)?.errors);
        const listItemPathError = this.getDocTypeListError(index, innIndex)?.errors;
        if (listItemPathError) {
          if (!error) error = {};
          Object.keys(listItemPathError || {}).forEach((key) => {
            error[key] = listItemPathError[key];
          })
        }
      });
    }
    this.getDocList(index).controls.forEach((listItem, listIndex) => {
      const listItemPathError = this.getDocListItem(index, listIndex).get('docPath')?.errors
      const listItemNameError = this.getDocListItem(index, listIndex).get('docName')?.errors
      // const listItemErrorNew= this.getDocListItem(index, listIndex)


      if (listItemPathError) {
        if (!error) error = {};
        Object.keys(listItemPathError || {}).forEach((key) => {
          error[key] = listItemPathError[key];
        })
      }
      if (listItemNameError) {
        if (!error) error = {};
        Object.keys(listItemNameError || {}).forEach((key) => {
          error[key] = listItemNameError[key];
        })
      }
    });
    return error ? {errors: error} : error;
  }

  getDocTypeList(index: number, rad: number) {
    return (this.resellerKycData?.controls[index]?.get('docTypeList') as FormArray)?.controls[rad]?.get('docList') as FormArray
  }

  getDocTypeListItem(index: number, rad: number, listIndex: number) {
    return this.getDocTypeList(index, rad).controls[listIndex] as FormGroup
  }

  getDocTypeListError(index: number, rad: number) {
    let error: any | null = null;
    this.getDocTypeList(index, rad).controls.forEach((listItem, listIndex) => {
      const listItemPathError = this.getDocTypeListItem(index, rad, listIndex).get('docPath')?.errors
      const listItemNameError = this.getDocTypeListItem(index, rad, listIndex).get('docName')?.errors

      if (listItemPathError) {
        if (!error) error = {};
        Object.keys(listItemPathError || {}).forEach((key) => {
          error[key] = listItemPathError[key];
        })
      }
      if (listItemNameError) {
        if (!error) error = {};
        Object.keys(listItemNameError || {}).forEach((key) => {
          error[key] = listItemNameError[key];
        })
      }
    });
    const listItemError = this.getDocTypeList(index, rad)?.errors
    if (listItemError) {
      if (!error) error = {};
      Object.keys(listItemError || {}).forEach((key) => {
        error[key] = listItemError[key];
      })
    }
    return error ? {errors: error} : error;
  }

  onDocTypeChangeSingle(index: number, rad?: number) {
    let status = true;
    const controls = this.resellerKycDataArr()[index].get('docTypeList').controls;

    if (!isNaN(<number>rad)) {
      // @ts-ignore
      const control = this.resellerKycDataArr()[index].get('docTypeList').controls[rad];
      const val = control.get('isSelected').value;
      if (val) {
        status = false
      }

      if (!status) {
        control.get('docType')?.setValidators([Validators.required])
        control?.updateValueAndValidity();
        this.getDocTypeList(index, <number>rad)?.setValidators([Validators.required, Validators.minLength(1)])
        this.getDocTypeList(index, <number>rad)?.updateValueAndValidity()
        this.getDocTypeList(index, <number>rad).controls.forEach((docListItem, listIndex) => {
          this.getDocTypeListItem(index, <number>rad, listIndex).get('docPath')?.setValidators([Validators.required])
          this.getDocTypeListItem(index, <number>rad, listIndex).get('docName')?.setValidators([Validators.required])
          this.getDocTypeListItem(index, <number>rad, listIndex).get('docPath')?.updateValueAndValidity()
          this.getDocTypeListItem(index, <number>rad, listIndex).get('docName')?.updateValueAndValidity()
          // console.log(`${listIndex}===>>>>>`, this.getDocTypeListError(index, <number>rad)?.errors)
        });
      } else {
        this.getDocTypeList(index, <number>rad)?.setValidators([])
        this.getDocTypeList(index, <number>rad)?.updateValueAndValidity()
        this.getDocTypeList(index, <number>rad).controls.forEach((docListItem, listIndex) => {
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
      const val = control.get('isSelected').value;
      if (val) {
        status = false
      }
    })
    if (!status) {
      this.getDocList(index).controls.forEach((docListItem, listIndex) => {
        this.getDocListItem(index, listIndex).get('docPath')?.setValidators([Validators.required])
        this.getDocListItem(index, listIndex).get('docName')?.setValidators([Validators.required])
        this.getDocListItem(index, listIndex).get('docPath')?.updateValueAndValidity()
        this.getDocListItem(index, listIndex).get('docName')?.updateValueAndValidity()

      });
    } else {
      this.getDocList(index).controls.forEach((docListItem, listIndex) => {
        this.getDocListItem(index, listIndex).get('docPath')?.setValidators([])
        this.getDocListItem(index, listIndex).get('docName')?.setValidators([])
        this.getDocListItem(index, listIndex).get('docPath')?.updateValueAndValidity()
        this.getDocListItem(index, listIndex).get('docName')?.updateValueAndValidity()

      });
    }
    return status;
  }

  onChangeWavier($event?: Event) {
    // console.log("onWaiverChange---->", this.isWavier?.value)
    if (this.isWavier?.value) {
      this.wavierRemarks?.setValidators([Validators.required])
      this.wavierOffDate?.setValidators([Validators.required])
      this.wavierRemarks?.updateValueAndValidity()
      this.wavierOffDate?.updateValueAndValidity()
      this.resellerKycData.controls.forEach((listItem, index) => {
        // console.log("++===>", listItem?.get('type')?.value)
        this.getDocList(index).controls.forEach((docListItem, listIndex) => {
          this.getDocListItem(index, listIndex).get('docPath')?.setValidators([])
          this.getDocListItem(index, listIndex).get('docName')?.setValidators([])
          this.getDocListItem(index, listIndex).get('docPath')?.updateValueAndValidity()
          this.getDocListItem(index, listIndex).get('docName')?.updateValueAndValidity()

          // console.log(`${listIndex}===>>>>>`, this.getDocListItem(index, listIndex)?.errors)
        });
      })
    } else {
      this.wavierRemarks?.setValidators([])
      this.wavierOffDate?.setValidators([])
      this.wavierRemarks?.updateValueAndValidity()
      this.wavierOffDate?.updateValueAndValidity()
      this.resellerKycData.controls.forEach((listItem, index) => {
        // console.log("++===>", listItem?.get('type')?.value)
        this.getDocList(index).controls.forEach((docListItem, listIndex) => {
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
    if (this.wavierRemarks?.errors) status = false;
    if (this.wavierOffDate?.errors) status = false;
    this.resellerKycData.controls.forEach((kycItem, ind) => {
      if (this.getDocListError(ind)?.errors) status = false;
    })

    return status
  }

  reformatKycData(kycData: any[]) {
    const formatted: any[] = [];
    kycData.forEach((kyc) => {

      if (kyc.docpath && kyc.docpath !== '') {
        this.isApprovalEnable = true
      }
      if (kyc.document == 'Additional Documents') {
        kyc.type = 'other'
      }

      const fil = formatted.filter((d) => d.docid == kyc.docid)
      // console.log("fil===>", fil);
      if (fil.length == 0) {
        if (kyc.type == 'single' || !kyc.type) {
          const singleDocTypeList = kycData.filter((d) => d.docid == kyc.docid && d.type == kyc.type);

          formatted.push({
            ...kyc,
            type: kyc.type || 'single',
            docList: singleDocTypeList || [],
            documentDescriptionType: []
          })
        } else if (kyc.type == 'multi' || kyc.type == 'other') {
          const filOt = kycData.filter((d) => d.docid == kyc.docid && d.type == kyc.type && d.docType)
          const def = {
            allow_wavier: kyc.allow_wavier,
            businessType: kyc.businessType,
            businessTypeId: kyc.businessTypeId,
            docType: "",
            docid: kyc.docid,
            docname: "",
            docpath: "",
            document: kyc.document,
            documentDescription: kyc.documentDescription,
            kycId: 0,
            type: kyc.type || 'other',
            wavier_date: kyc.wavier_date,
            wavier_remark: kyc.wavier_remark
          };
          const des: any[] = [];
          kyc.documentDescription.forEach((de: string) => {
            if (de !== '') {
              const dType = filOt.findIndex((d) => d.docType == de);
              const dTypeDocList = filOt.filter((d) => d.docType == de);

              if (dType !== -1) {
                des.push({
                  ...filOt[dType],
                  docList: dTypeDocList || [],
                });
                // filOt.splice(dType, 1)
                filOt.forEach((d, index) => {
                  d.docType == de && filOt.splice(index, 1)
                });
              } else {
                des.push({
                  ...def,
                  docList: [],
                  docType: de
                })
              }
              // console.log(de, "=---->", dType, [...filOt])
            }
          })
          // des.push(...filOt);
          filOt.forEach((dT) => {
            const dType = filOt.findIndex((d) => d.docType == dT.docType);
            const dTypeDocList = filOt.filter((d) => d.docType == dT.docType);

            if (dType !== -1) {
              des.push({
                ...filOt[dType],
                docList: dTypeDocList || [],
              });
              // filOt.splice(dType, 1)
              filOt.forEach((d, index) => {
                d.docType == dT.docType && filOt.splice(index, 1)
              });
            }
          })

          formatted.push({
            ...kyc,
            documentDescriptionType: des
          })
        }

      }
    })
    return formatted;
  }

  loadKycData(kycData: any) {
    let data: any = [];
    (kycData ?? []).forEach((item: any) => {
      if (item.type == 'other') {
        data.push(
          new FormGroup({
            docTypeList: new FormArray(this.loadOtherDocType(item.documentDescriptionType, item)),
            docList: new FormArray(this.loadDocList(item.docList || [])),
            document: new FormControl(item.document),
            docName: new FormControl(item.docname),
            docPath: new FormControl(item.docpath),
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

    let data: any = [];
    (Array.isArray(docTypes) ? docTypes : []).forEach((docType: any) => {
      if (docType !== '') {
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
    let data: any = [];
    (Array.isArray(docTypes) ? docTypes : []).forEach((docType: any) => {
      if (docType !== '') {
        data.push(
          new FormGroup({
            docList: new FormArray([]),
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

  kycUploadFormSelect(type: string, selectedGroup: FormGroup, outIndex: number, innerIndex?: number) {
    this.currentSelectedGroup = {
      outIndex,
      innerIndex,
      type,
      currentFormGroup: selectedGroup
    };
    this.resellerService.uploadKycBrowseButton(this.currentSelectedGroup);
    this.kycUploadModalConfig = {
      ...this.kycUploadModalConfig,
      modalTitle: `${selectedGroup?.get('document')?.value}`
    }
    this.kycUploadModal.open();
  }

  loadOtherDocType(docTypes: any, item: any) {
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
            isSelected: new FormControl((docType.docList || []).length > 0 ? docType.docType : false),
            uploadSuccess: new FormControl(false),
            inputDisabled: new FormControl(docType.documentDescription.includes(docType.docType)),
          })
        );
      }
    });
    return data;
  }

  loadDocList(docTypes: any) {
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
      const controls = this.resellerKycDataArr()[i];
      const docListControls = this.resellerKycDataArr()[i].get('docTypeList').controls;
      const allowedExtensions = ["pdf", "PDF", "png", "PNG", "jpg", "JPG", "jpeg", "JPEG"];
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
          formData.append('resellerId', this.resellerId);
          formData.append("docType", "");
          formData.append('docId', docid);
          this.resellerService.uploadKycFile(formData)
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
      const controls = this.resellerKycDataArr()[i].get('docTypeList').controls[rad];
      const docType = controls.get('docType').value
      // const docListControls = this.resellerKycDataArr()[i].get('docTypeList').controls;
      const allowedExtensions = ["pdf", "PDF", "png", "PNG", "jpg", "JPG", "jpeg", "JPEG"];
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
          formData.append('resellerId', this.resellerId);
          formData.append("docType", docType || type);
          formData.append('docId', docid);
          this.resellerService.uploadKycFile(formData)
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
    const controls = this.resellerKycDataArr()[i];
    const docListControls = this.resellerKycDataArr()[i].get('docTypeList').controls;
    const length = docListControls.length;
    docListControls.push(this.addOtherDocType())
    this.getDocTypeList(i, length).updateValueAndValidity();
    this.onDocTypeChangeSingle(i, length);
    // console.log("Doc Listing---->",this.resellerKycDataArr()[i])
  }

  removeCustomDocType(index: number, inIndex: number) {
    const docTypeListControls = (this.resellerKycData.controls[index]?.get('docTypeList') as FormArray);
    docTypeListControls.removeAt(inIndex, {emitEvent: true})
  }

  addCustomDocList(i: number, u: any) {
    const controls = this.resellerKycDataArr()[i];
    const docListControls = this.resellerKycDataArr()[i].get('docList').controls;
    docListControls.push(this.addDocList())
  }

  resetSelection($event: MouseEvent, i: number, u: any) {
    this.resellerKycDataArr()[i].get('docTypeList').controls.forEach((control: any, i: number) => {
      control.get('isSelected').patchValue(false)
    });
    this.onDocTypeChangeSingle(i)
  }

  downloadFileService(docname: any, docpath: any) {
    let fileType = docname.split('.').pop();
    let fileInitial = docname.split('.')[0]
    const formData = new FormData();
    formData.append('urlfile', docpath);
    formData.append('docname', docname);
    this.resellerService.downloadKycFile(formData)
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
    this.resellerService.downloadKycFile(formData)
      .subscribe((res: any) => {
        var response = res;
        var random = Math.floor(Math.random() * 10000000000 + 1);

        var today = new Date();

        const linkSource = 'data:application/' + fileType + ';base64,' + response.Data;

        this.kycFileSrc = {
          type: fileType == 'pdf' ? 'FILE' : 'IMAGE',
          src: this.sanitizer.bypassSecurityTrustResourceUrl(linkSource)
        }
        // const downloadLink = document.createElement("a");
        // const NewfileName = "Payments_" + today.getFullYear().toString() + "-" + ("0" + (today.getMonth() + 1)).slice(-2) + ("0" + today.getDate()).slice(-2) + "-" + random.toString().slice(-4) + fileInitial + "." + fileType;
        //
        // downloadLink.href = linkSource;
        // downloadLink.download = NewfileName;
        // downloadLink.click();
      })

  }

  deleteFileService(docpath: any, kycId: any, docname: any) {
    const formData = {
      "resellerId": this.resellerId,
      "path": docpath,
      "id": kycId || 0
    }
    this.alertService.confirmBox(this.resellerService.deleteKycFile(formData), {
      html: `Are you sure to delete <b>${docname}</b>`
    }, {
      html: "File has been deleted successfully.!"
    }, () => {
      this.setKycData();
    });
  }

  onRadioSelect($event: Event, i: number, rad: number, radio: any, docType?: any, docId?: any) {
    this.resellerKycDataArr()[i].get('docTypeList').controls.forEach((control: any, i: number) => {
      if (rad !== i) control.get('isSelected').patchValue(false)
    })

    this.onDocTypeChangeSingle(i);
  }


  getSubDocError(i: number, rad: number, docid: any, radio: any) {
    return false;
  }


  submitKycData($event: MouseEvent, value: any) {
    $event.preventDefault();
    this.isKycFormSubmitted = true;
    const finalData: any[] = []
    if (this.isKycValid()) {
      // this.waverError.nativeElement.focus();
      // console.log("===>kyc Form====>", this.allKycDataFormGroup.get('resellerKycData')?.value)
      this.resellerKycDataArr().forEach((l1Control: FormGroup) => {
        if (l1Control.get('type')?.value == 'single') {
          (l1Control.get('docList') as FormArray)?.controls.forEach((l3Control) => {
            // console.log("Single Type:", l3Control.value)
            const fileSplit = l3Control.value?.docName.split('.')
            finalData.push({
              "documentId": this.documentId,
              "docid": l1Control.get('docId')?.value,
              "docname": l3Control.value?.docName || '',
              "docpath": l3Control.value?.docPath || '',
              "doctype": l1Control.get('docTypeList')?.value?.find((dtl: any) => dtl.isSelected)?.docType || (fileSplit.length > 0 ? fileSplit[fileSplit.length - 1] : 'default'),
              "kycid": l3Control.value?.kycId || 0,
              "allow_wavier": this.allKycDataFormGroup.get('isWavier')?.value ? 'Y' : 'N',
              "wavier_date": this.allKycDataFormGroup.get('wavierOffDate')?.value || '',
              "wavier_remark": this.allKycDataFormGroup.get('wavierRemarks')?.value || '',
              "type": "single"
            })
          })

        } else if (['multi', 'other'].includes(l1Control.get('type')?.value)) {
          // console.log(`${l1Control.get('type')?.value} Type:`, l1Control.get('docList')?.value);
          // @ts-ignore
          (l1Control.get('docTypeList') as FormArray).controls.forEach((l2Control: FormGroup, ctInd) => {
            // console.log("Other Type:",ctInd, l2Control.get('docType')?.value);
            const currentDocType = l2Control.get('docType')?.value;
            (l2Control.get('docList') as FormArray)?.controls.forEach((l4Control) => {
              // console.log("Other Type:", l4Control.value)
              // console.log("2--->", l2Control);
              if (l2Control.get('isSelected')?.value) {
                const fileSplit = l4Control.value?.docName.split('.')
                // console.log("1--->", l1Control.get('docTypeList')?.value?.find((dtl: any)=> dtl.isSelected)?.docType);

                finalData.push({
                  "documentId": this.documentId,
                  "docid": l1Control.get('docId')?.value,
                  "docname": l4Control.value?.docName || '',
                  "docpath": l4Control.value?.docPath || '',
                  "doctype": currentDocType || l1Control.get('docTypeList')?.value?.find((dtl: any) => dtl.isSelected)?.docType || (fileSplit.length > 0 ? fileSplit[fileSplit.length - 1] : 'default'),
                  "kycid": l4Control.value?.kycId || 0,
                  "allow_wavier": this.allKycDataFormGroup.get('isWavier')?.value ? 'Y' : 'N',
                  "wavier_date": this.allKycDataFormGroup.get('wavierOffDate')?.value || '',
                  "wavier_remark": this.allKycDataFormGroup.get('wavierRemarks')?.value || '',
                  "type": l1Control.get('type')?.value
                })
              }
            })
          })
        }
      });

      this.resellerService.uploadKycDocsData(this.resellerId, finalData)
        .subscribe((data) => {
          if (data) {
            this.alertService.successAlert('KYC documents Submitted Successfully!', '');
            this.setKycData();
          }
        })
    }
    // console.log('Final Array ====>', finalData, this.isKycValid())
  }

  isButtonDisable(i: number, rad?: number | undefined) {
    let status = true;
    const controls = this.resellerKycDataArr()[i].get('docTypeList').controls;
    if (!isNaN(<number>rad)) {
      // @ts-ignore
      const control = this.resellerKycDataArr()[i].get('docTypeList').controls[rad];
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
          "Mid": this.resellerId,
          "Status": "Approval",
          "Remark": remarks,
          "Approvel_type": "Kyc",
          "Added_By": this.storage.getUserName().toString()

        }
      } else {
        responseMsg = "Kyc Successfully rejected";
        appRequestBody = {
          "Mid": this.resellerId,
          "Status": "Approval",
          "Remark": remarks,
          "Approvel_type": "RKyc",
          "Added_By": this.storage.getUserName().toString()

        }
      }

      this.resellerService.sendApproval(appRequestBody)
        .subscribe(
          (data) => {
            if (data?.length > 0) {
              this.status = data[0]['kyc_approvel']
              if (this.status != 0)
                this.kycApprovalForm.controls['remarks'].disable();
              // this.alertService.toastSuccessMessageAlert({
              //   title: responseMsg
              // })
              this.resellerService.getRiskRemark(this.resellerId, 'R', 'Kyc')
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
}

