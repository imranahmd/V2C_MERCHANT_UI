import {Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ConfigurableNavigationMode, WizardComponent as BaseWizardComponent} from 'angular-archwizard';
import {ResellerService} from "../reseller.service";
import {lastValueFrom, Subscription} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {DatePipe, Location} from "@angular/common";
import {AlertService} from "../../../../../_services/alert.service";
import {MenusService} from "../../../../../_services/menu.service";
import {ProvidersService} from "../../../../../_services/providers.service";
import {MerchantService} from "../../../merchants/merchant-master/merchant.service";
import {moreThanOneWhiteSpaceValidator} from "../../../../../common/common.validators";

const URL_REG = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
const PAN_REG = /^[A-Z]{5}\d{4}[A-Z]$/;

interface DropDownValues {
  FieldValue: number,
  FieldText: string
}

@Component({
  selector: 'app-reseller-add',
  templateUrl: './reseller-add.component.html',
  styleUrls: ['./reseller-add.component.scss']
})
export class ResellerAddComponent implements OnInit {
  @Output() closeModal: EventEmitter<any> = new EventEmitter<any>();
  date: any;
  public businessTypeOptions: DropDownValues[];
  public resellerCategoryOptions: DropDownValues[];
  public instrumentMasterOptions: DropDownValues[];
  public resellerListOptions: DropDownValues[];
  public pgInstruments: any;
  public resellerPartner: any;
  public giveTestAccess: any;
  resellerSubscription: Subscription;
  testAccessSubscription: Subscription;
  navigationMode: any;
  resellerSubCategoryOptions: any;

  selectedAttributesCategorydata: any;
  validationForm1: FormGroup;
  validationForm2: FormGroup;
  isForm1Submitted: Boolean;
  // validationForm3: FormGroup;
  // validationForm4: FormGroup;
  // validationForm5: FormGroup;
  // validationForm6: FormGroup;
  isForm2Submitted: Boolean;
  // isForm6Submitted: Boolean;
  resellerId: string;
  // isForm3Submitted: Boolean;
  // isForm4Submitted: Boolean;
  // isForm5Submitted: Boolean;
  @ViewChild('wizardForm') wizardForm: BaseWizardComponent;
  public permissions: any;
  validPAN: any = false;
  validationPAN: boolean = false;
  PANvalue: any;
  pancheck: boolean = false;
  authpancheck: boolean = false;
  validGST: any;
  validationGST: boolean;
  gstcheck: boolean;
  GSTvalue: any;
  public PANValue: string = '';
  public authPANValue: string = '';
  public GSTValue: string = '';
  GSTData: any;
  selectedAttributes: any;
  private queryParams: any = {};
  private allFields: any = {};
  private subCategoryData: string;
  private arr: any = {};

  constructor(
    private datePipe: DatePipe,
    private alertService: AlertService,
    private KYCService: ProvidersService,
    private resellerService: ResellerService,
    private menuService: MenusService,
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    public formBuilder: FormBuilder,
    private merchantService: MerchantService) {
    this.validationForm1 = this.formBuilder.group({
      resellerName: ['', [Validators.required, moreThanOneWhiteSpaceValidator(), Validators.pattern('^[a-zA-Z \-\']+')]],
      contactPerson: ['', [Validators.required, moreThanOneWhiteSpaceValidator(), Validators.pattern('^[a-zA-Z \-\']+')]],
      contactNumber: ['', [Validators.required, Validators.pattern("[0-9 ]{10}")]],
      emailId: ['', [Validators.required, Validators.email]]
    });

    /**
     * formw value validation
     */
    this.validationForm2 = this.formBuilder.group({
      // pan: ['', [Validators.required, Validators.pattern(PAN_REG)]],
      dateOfIncorporation: ["", Validators.required],
      legalName: ['', [Validators.required, moreThanOneWhiteSpaceValidator(), Validators.pattern("^(?!(0))[ 0-9a-zA-Z$&+,:;=?@#|'<>.^*()%!-]+$")]],
      brandName: ['', [moreThanOneWhiteSpaceValidator(), Validators.pattern("^(?!(0))[ 0-9a-zA-Z$&+,:;=?@#|'<>.^*()%!-]+$"), Validators.maxLength(200)]],
      businessType: ['', Validators.required],
      businessCategory: ['', [Validators.required, moreThanOneWhiteSpaceValidator(), Validators.maxLength(50)]],
      subCategory: ['', [moreThanOneWhiteSpaceValidator(), Validators.maxLength(50)]],
      businessModel: ['', [moreThanOneWhiteSpaceValidator(), Validators.required]],
      turnOverLastFinYear: ['', [Validators.pattern("^[1-9]\\d*(\\.\\d+)?$"), Validators.maxLength(10)]],
      expMonthlyTurnOver: ['', [Validators.pattern("^[1-9]\\d*(\\.\\d+)?$"), Validators.maxLength(10)]],
      avgAmountPerTransaction: ['', [Validators.pattern("^[1-9]\\d*(\\.\\d+)?$"), Validators.maxLength(10)]],
      // authPersonPan: ['', [Validators.required, Validators.pattern(PAN_REG)]],
      // authPersonPanName: ['', Validators.required],
      address: ['', [moreThanOneWhiteSpaceValidator(), Validators.required]],
      pincode: ['', [Validators.required, Validators.pattern("([1-9]{1}[0-9]{5}|[1-9]{1}[0-9]{3}\\s[0-9]{3})"), Validators.maxLength]],
      city: ['', [moreThanOneWhiteSpaceValidator(), Validators.required, Validators.pattern("[a-zA-Z][a-zA-Z ]+"), Validators.maxLength]],
      state: ['', [moreThanOneWhiteSpaceValidator(), Validators.required, Validators.pattern("[a-zA-Z][a-zA-Z ]+")]],
      // gstin: ['', [Validators.required, Validators.pattern('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9]{1}Z[a-zA-Z0-9]{1}$')]],
      // websiteUrl: ['', [Validators.required, Validators.pattern(URL_REG)]],
    });

    // this.validationForm3 = this.formBuilder.group({
    //   // paymentDone : ['', [Validators.required]]
    //   resellerPartner: ['n', [Validators.required]],
    //   resellerPartnerId: ['', []],
    //   giveTestAccess: ['n', [Validators.required]],
    //   pgInstruments: ['', []],
    // });
  }

  get form1() {
    return this.validationForm1.controls;
  }

  get form2() {
    return this.validationForm2.controls;
  }

  async ngOnInit(): Promise<void> {
    this.date = new Date().toISOString().slice(0, 10);
    const path = this.location.prepareExternalUrl(this.location.path());
    this.permissions = this.menuService.getPermissions(path);

    this.navigationMode = new ConfigurableNavigationMode("deny", "deny")

    // this.resellerService.getBusinessType().subscribe((data) => this.businessTypeOptions = data)
    // this.resellerService.getResellerCategory().subscribe((data) => this.resellerCategoryOptions = data)
    // this.resellerService.getInstrumentMaster().subscribe((data) => this.instrumentMasterOptions = data)
    // this.resellerService.getResellerList().subscribe((data) => this.resellerListOptions = data)
    const businessType$ = this.resellerService.getBusinessType();
    this.businessTypeOptions = await lastValueFrom(businessType$);
    const resellerCategory$ = this.resellerService.getResellerCategory()
    this.resellerCategoryOptions = await lastValueFrom(resellerCategory$);
    const instrumentMaster$ = this.resellerService.getInstrumentMaster()
    this.instrumentMasterOptions = await lastValueFrom(instrumentMaster$);
    const resellerList$ = this.resellerService.getResellerList()
    this.resellerListOptions = await lastValueFrom(resellerList$);
    this.route.queryParams
      .subscribe(params => {
          this.queryParams = params;
          console.log("params in reseller add componant-------------->", params);
          if (params?.mid) {
            this.navigationMode = new ConfigurableNavigationMode("allow", "allow")
            this.resellerId = params?.mid;
            this.resellerService.getReseller(params?.mid).subscribe((res) => {
              this.setFormValues(res);
            });
          }
        }
      );
    /**
     * form1 value validation
     */


    // const resellerPartnerCtrl = <FormControl>this.validationForm3.get('resellerPartner');
    // const resellerPartnerIdCtrl = <FormControl>this.validationForm3.get('resellerPartnerId');
    // const testAccessCtrl = <FormControl>this.validationForm3.get('giveTestAccess');
    // const pgInstrumentsCtrl = <FormControl>this.validationForm3.get('pgInstruments');

    // this.resellerSubscription = resellerPartnerCtrl.valueChanges.subscribe(value => {
    //   if (value == 'y') {
    //     resellerPartnerIdCtrl.setValidators([Validators.required,])
    //   } else {
    //     resellerPartnerIdCtrl.setValidators(null);
    //   }
    //
    //   resellerPartnerIdCtrl.updateValueAndValidity();
    // });
    //
    // this.testAccessSubscription = testAccessCtrl.valueChanges.subscribe(value => {
    //   console.log(this.instrumentMasterOptions, "==================++++++++++++++");
    //   if (value == 'y') {
    //     pgInstrumentsCtrl.setValidators([Validators.required])
    //   } else {
    //     pgInstrumentsCtrl.setValidators(null);
    //   }
    //
    //   pgInstrumentsCtrl.updateValueAndValidity();
    // });

    this.isForm1Submitted = false;
    this.isForm2Submitted = false;
    // this.isForm3Submitted = false;
    // this.isForm4Submitted = false;
    // this.isForm5Submitted = false;
    // this.isForm6Submitted = false;
    if (!(this.permissions.includes('Add New') || this.permissions.includes('Edit'))) {
      this.validationForm1.disable()
      this.validationForm1.disable()
      this.validationForm2.disable()
    }
  }

  // get form3() {
  //   return this.validationForm3.controls;
  // }

  async setFormValues(data: any) {
    const valueObj = Array.isArray(data) ? data[0] : data || {};
    const resellerSubCategory$ = this.resellerService.getResellerSubCategory(valueObj?.businessCategory)
    this.resellerSubCategoryOptions = await lastValueFrom(resellerSubCategory$);
    console.log('this.resellerSubCategoryOptions----', this.resellerSubCategoryOptions);
    console.log('valueObj?.subCategory----', valueObj?.subCategory);
    // this.resellerSubCategoryOptions.forEach((element: any, i: any) => {
    //   this.arr["id"] = element.FieldText,
    //     this.arr["name"] = element.FieldValue,
    //     console.log(this.arr);
    // })

    this.validationForm1.get('contactPerson')?.patchValue(valueObj?.contactPerson)
    this.validationForm1.get('contactNumber')?.patchValue(valueObj?.contactNumber)
    this.validationForm1.get('emailId')?.patchValue(valueObj?.emailId)
    this.validationForm1.get('resellerName')?.patchValue(valueObj?.resellerName)

    // this.validationForm2.get('pan')?.setValue(valueObj?.CompanyPAN)
    console.log('------->asdasdsa', new Date(valueObj?.dateOfIncorporation.split('T')[0]));
    this.validationForm2.get('dateOfIncorporation')?.patchValue(new Date(valueObj?.dateOfIncorporation.split('T')[0]))
    this.validationForm2.get('dateOfIncorporation')?.patchValue(this.datePipe.transform(valueObj?.dateOfIncorporation.split('T')[0], "yyyy-MM-dd"),)
    this.validationForm2.get('legalName')?.patchValue(valueObj?.legalName)
    this.validationForm2.get('brandName')?.patchValue(valueObj?.brandName)
    this.validationForm2.get('businessType')?.patchValue(Number(valueObj?.businessType))
    this.validationForm2.get('businessCategory')?.patchValue(Number(valueObj?.businessCategory))
    this.validationForm2.get('subCategory')?.patchValue(Number(valueObj?.subCategory))
    this.validationForm2.get('businessModel')?.patchValue(valueObj?.businessModel)
    this.validationForm2.get('turnOverLastFinYear')?.patchValue(valueObj?.turnoverLastFinancialYear)
    this.validationForm2.get('expMonthlyTurnOver')?.patchValue(valueObj?.turnoverMonthlyExpeced)
    this.validationForm2.get('avgAmountPerTransaction')?.patchValue(valueObj?.avgAmountPerTxn)
    // this.validationForm2.get('authPersonPan')?.setValue(valueObj?.AuthorisedSignatoryPAN)
    // this.validationForm2.get('authPersonPanName')?.setValue(valueObj?.NameAsPerPAN)
    this.validationForm2.get('address')?.patchValue(valueObj?.registeredAddress)
    this.validationForm2.get('pincode')?.patchValue(valueObj?.pinCode)
    this.validationForm2.get('city')?.patchValue(valueObj?.city)
    this.validationForm2.get('state')?.patchValue(valueObj?.state)
    // this.validationForm2.get('gstin')?.setValue(valueObj?.GSTINNo)
    // this.validationForm2.get('websiteUrl')?.setValue(valueObj?.website)

    // this.validationForm3.get('resellerPartner')?.setValue(valueObj?.reseller_id ? 'y' : 'n')
    // this.validationForm3.get('resellerPartnerId')?.setValue(valueObj?.reseller_id)
    // this.validationForm3.get('giveTestAccess')?.setValue(valueObj?.IsTestAccess)
    // valueObj?.Instruments && valueObj?.Instruments != '' ? this.validationForm3.get('pgInstruments')?.setValue(valueObj?.Instruments?.split(',').map((val: any) => {
    //   return this.instrumentMasterOptions.find((inOpt: DropDownValues) => inOpt.FieldValue == val)
    // })) : ''
  }

  finishFunction() {

    // alert('Successfully Completed');
    if (this.validationForm1.valid && this.validationForm2.valid) {
      this.allFields = {...this.allFields, ...this.validationForm1.value}
      this.allFields = {...this.allFields, ...this.validationForm2.value}
      console.log("All fields ======>", this.allFields);
      const resellerObj: any = {
        "resellerId": this.allFields.resellerId || "",
        "resellerName": this.allFields.resellerName || "",
        "contactPerson": this.allFields.contactPerson || "",
        "emailId": this.allFields.emailId || '',
        "contactNumber": this.allFields.contactNumber || '',
        "legalName": this.allFields.legalName || '',
        "brandName": this.allFields.brandName || '',
        "businessType": this.allFields.businessType || '',
        "dateOfIncorporation": this.allFields.dateOfIncorporation || '',
        "businessCategory": this.allFields.businessCategory || '',
        "subCategory": this.allFields.subCategory || '',
        "businessModel": this.allFields.businessModel || '',
        "turnoverLastFinancialYear": this.allFields.turnOverLastFinYear || '',
        "turnoverMonthlyExpeced": this.allFields.expMonthlyTurnOver || '',
        "avgAmountPerTxn": this.allFields.avgAmountPerTransaction || '',
        "registeredAddress": this.allFields.address || '',
        "pinCode": this.allFields.pincode || '',
        "city": this.allFields.city || '',
        "state": this.allFields.state || '',
        "Remark": "Use while updating something",
        "invoiceCycle": "Weekly",
        "createdBy": "SessionId"
      };
      if (this.resellerId) {
        resellerObj.resellerId = this.resellerId
      }

      this.resellerService.createReseller(resellerObj).subscribe((response: any) => {
        if (response) {
          if (response?.resellerId) {
            this.queryParams = {mid: response?.resellerId, ...this.queryParams}
          }
          if (this.resellerId) {
            this.queryParams.mid = this.resellerId;
            this.alertService.successAlert("Reseller Updated Successfully.!", "")
          } else {
            this.alertService.successAlert("Reseller Added Successfully.!", "")
          }


          this.router.navigate(['/reseller/reseller-creation/reseller-account'], {
            queryParams: {...this.queryParams}
          })
          // this.closeModal.emit({
          //   showModal: false
          // })
        }
        // this.closeModal.emit({
        //   showModal: false
        // })


      })
    } else {
      this.validationForm1.markAsTouched()
      this.validationForm2.markAsTouched()
      // this.validationForm3.markAsTouched()
      if (!this.validationForm1.valid) {
        this.wizardForm.canGoToStep(1)
      } else if (!this.validationForm2.valid) {
        this.wizardForm.canGoToStep(2)
        // } else if (!this.validationForm3.valid) {
        //   this.wizardForm.canGoToStep(3)
      }
    }

  }

  /*get form4() {
    return this.validationForm4.controls;
  }
  get form5() {
    return this.validationForm5.controls;
  }
  get form6() {
    return this.validationForm6.controls;
  }*/
  resetsubcategory() {
    this.validationForm2.controls['subCategory'].setValue('')
    this.resellerSubCategoryOptions = []
  }

  async subCategory(e: any) {
    if (e && e !== '') {
      this.resetsubcategory();
      this.subCategoryData = (e).toString();
      const resellerSubCategory$ = this.resellerService.getResellerSubCategory(this.subCategoryData)
      this.resellerSubCategoryOptions = await lastValueFrom(resellerSubCategory$);
    }
  }

  form1Submit() {
    console.log('asdasdada-------------', this.validationForm1.errors)
    if (this.validationForm1.valid) {
      this.wizardForm.goToNextStep();
    }
    this.allFields = {...this.allFields, ...this.validationForm1.value}
    this.isForm1Submitted = true;
  }

  form2Submit() {
    if (this.validationForm2.valid) {
      this.wizardForm.goToNextStep();
    }
    this.allFields = {...this.allFields, ...this.validationForm2.value}
    this.isForm2Submitted = true;
  }

  // form3Submit() {
  // console.log('=============>', this.validationForm3.value)
  // if (this.validationForm3.valid) {
  //   this.wizardForm.goToNextStep();
  // }
  // this.allFields = {...this.allFields, ...this.validationForm3.value}
  // this.isForm3Submitted = true;
  // }

  /*form4Submit() {
    if(this.validationForm4.valid) {
      this.wizardForm.goToNextStep();
    }
    this.isForm4Submitted = true;
  }
  form5Submit() {
    if(this.validationForm5.valid) {
      this.wizardForm.goToNextStep();
    }
    this.isForm5Submitted = true;
  }

  form6Submit() {
    if(this.validationForm6.valid) {
      this.wizardForm.goToNextStep();
    }
    this.isForm6Submitted = true;
  }*/

  OnlyNumbersAllowed(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    return (charCode > 47 && charCode < 58) || charCode == 46;
  }

  OnlyCharacterAllowed(event: { which: any; keyCode: any; }): boolean {

    const charCode = (event.which) ? event.which : event.keyCode;
    if ((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122) || (charCode == 32)) {
      // console.log('charCode restricted is' + charCode)
      return true;
    }
    return false;
  }
}
