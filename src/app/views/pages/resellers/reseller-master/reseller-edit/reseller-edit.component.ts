import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {WizardComponent as BaseWizardComponent} from "angular-archwizard/lib/components/wizard.component";
import {Subscription} from "rxjs";
import {ResellerService} from "../reseller.service";

const URL_REG = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
const PAN_REG = /^[A-Z]{5}\d{4}[A-Z]$/;

interface DropDownValues {
  FieldValue: any,
  FieldText: string
}

@Component({
  selector: 'app-reseller-edit',
  templateUrl: './reseller-edit.component.html',
  styleUrls: ['./reseller-edit.component.scss']
})
export class ResellerEditComponent implements OnInit {

  @Input() editData: any;
  @Input() resellerId: any;
  @Input() onResellerChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() closeModal: EventEmitter<any> = new EventEmitter<any>();
  @Output() resellerSelectEvent: EventEmitter<any> = new EventEmitter<any>();

  public businessTypeOptions: DropDownValues[];
  public resellerCategoryOptions: DropDownValues[];
  public instrumentMasterOptions: DropDownValues[];
  public resellerListOptions: DropDownValues[];
  public pgInstruments: any;
  public resellerPartner: any;
  public giveTestAccess: any;
  public selectedReseller: string;
  resellerSubscription: Subscription;
  testAccessSubscription: Subscription;

  validationForm1: FormGroup;
  validationForm2: FormGroup;
  validationForm3: FormGroup;

  isForm1Submitted: Boolean;
  isForm2Submitted: Boolean;
  isForm3Submitted: Boolean;

  @ViewChild('wizardForm') wizardForm: BaseWizardComponent;
  private allFields: any = {};

  constructor(public formBuilder: FormBuilder, private resellerService: ResellerService) {
  }

  get form1() {
    return this.validationForm1.controls;
  }

  get form2() {
    return this.validationForm2.controls;
  }

  get form3() {
    return this.validationForm3.controls;
  }

  ngOnInit(): void {
    this.resellerService.getBusinessType().subscribe((data) => this.businessTypeOptions = data)
    this.resellerService.getResellerCategory().subscribe((data) => this.resellerCategoryOptions = data)
    this.resellerService.getInstrumentMaster().subscribe((data) => this.instrumentMasterOptions = data)
    this.resellerService.getResellerList().subscribe((data) => this.resellerListOptions = data)

    /**
     * form1 value validation
     */
    this.validationForm1 = this.formBuilder.group({
      contactName: ['', Validators.required],
      contactNumber: ['', Validators.required],
      emailId: ['', [Validators.required, Validators.email]]
    });

    /**
     * formw value validation
     */
    this.validationForm2 = this.formBuilder.group({
      pan: ['', [Validators.required, Validators.pattern(PAN_REG)]],
      legalName: ['', Validators.required],
      brandName: ['', Validators.required],
      businessType: ['', Validators.required],
      businessCategory: ['', Validators.required],
      subCategory: ['', Validators.required],
      businessModel: ['', Validators.required],
      turnOverLastFinYear: ['', Validators.required],
      expMonthlyTurnOver: ['', Validators.required],
      avgAmountPerTransaction: ['', Validators.required],
      authPersonPan: ['', [Validators.required, Validators.pattern(PAN_REG)]],
      authPersonPanName: ['', Validators.required],
      address: ['', Validators.required],
      pincode: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      gstin: ['', Validators.required],
      websiteUrl: ['', [Validators.required, Validators.pattern(URL_REG)]],
    });

    this.validationForm3 = this.formBuilder.group({
      // paymentDone : ['', [Validators.required]]
      resellerPartner: ['no', [Validators.required]],
      resellerPartnerId: ['', []],
      giveTestAccess: ['no', [Validators.required]],
      pgInstruments: ['', []],
    });

    const resellerPartnerCtrl = <FormControl>this.validationForm3.get('resellerPartner');
    const resellerPartnerIdCtrl = <FormControl>this.validationForm3.get('resellerPartnerId');
    const testAccessCtrl = <FormControl>this.validationForm3.get('giveTestAccess');
    const pgInstrumentsCtrl = <FormControl>this.validationForm3.get('pgInstruments');

    this.resellerSubscription = resellerPartnerCtrl.valueChanges.subscribe(value => {
      if (value == 'yes') {
        resellerPartnerIdCtrl.setValidators([Validators.required,])
      } else {
        resellerPartnerIdCtrl.setValidators(null);
      }

      resellerPartnerIdCtrl.updateValueAndValidity();
    });

    this.testAccessSubscription = testAccessCtrl.valueChanges.subscribe(value => {
      if (value == 'yes') {
        pgInstrumentsCtrl.setValidators([Validators.required,])
      } else {
        pgInstrumentsCtrl.setValidators(null);
      }

      pgInstrumentsCtrl.updateValueAndValidity();
    });

    this.isForm1Submitted = false;
    this.isForm2Submitted = false;
    this.isForm3Submitted = false;

    this.onResellerChange.subscribe((data) => {

      this.resellerId = data;
      this.resellerService.getReseller(this.resellerId).subscribe((data: any) => {
        this.validationForm1.get('contactName')?.setValue(data[0]?.contact_person)
        this.validationForm1.get('contactNumber')?.setValue(data[0]?.contact_number)
        this.validationForm1.get('emailId')?.setValue(data[0]?.email_id)

        this.validationForm2.get('pan')?.setValue(data[0]?.CompanyPAN)
        this.validationForm2.get('legalName')?.setValue(data[0]?.reseller_name)
        this.validationForm2.get('brandName')?.setValue(data[0]?.business_name)
        this.validationForm2.get('businessType')?.setValue(Number(data[0]?.BusinessType))
        this.validationForm2.get('businessCategory')?.setValue(Number(data[0]?.reseller_category_code))
        this.validationForm2.get('subCategory')?.setValue(data[0]?.reseller_sub_category)
        this.validationForm2.get('businessModel')?.setValue(data[0]?.BusinessModel)
        this.validationForm2.get('turnOverLastFinYear')?.setValue(data[0]?.TurnoverinlastFinancialYear)
        this.validationForm2.get('expMonthlyTurnOver')?.setValue(data[0]?.ExpectedMonthlyIncome)
        this.validationForm2.get('avgAmountPerTransaction')?.setValue(data[0]?.AverageAmountPerTransaction)
        this.validationForm2.get('authPersonPan')?.setValue(data[0]?.AuthorisedSignatoryPAN)
        this.validationForm2.get('authPersonPanName')?.setValue(data[0]?.NameAsPerPAN)
        this.validationForm2.get('address')?.setValue(data[0]?.RegisteredAddress)
        this.validationForm2.get('pincode')?.setValue(data[0]?.Pincode)
        this.validationForm2.get('city')?.setValue(data[0]?.City)
        this.validationForm2.get('state')?.setValue(data[0]?.State)
        this.validationForm2.get('gstin')?.setValue(data[0]?.GSTINNo)
        this.validationForm2.get('websiteUrl')?.setValue(data[0]?.website)

        this.validationForm3.get('resellerPartner')?.setValue(data[0]?.reseller_id ? 'yes' : 'no')
        this.validationForm3.get('resellerPartnerId')?.setValue(data[0]?.reseller_id)
        this.validationForm3.get('giveTestAccess')?.setValue(data[0]?.IsTestAccess)
        this.validationForm3.get('pgInstruments')?.setValue(data[0]?.Instruments.split(',').map((val: any) => {
          return this.instrumentMasterOptions.find((inOpt: DropDownValues) => inOpt.FieldValue == val)
        }))
      })
      // <FormControl>this.validationForm1.get('resellerId').setValue(data)
    })
  }

  finishFunction() {
    if (this.resellerId && this.resellerId !== '') {
      this.resellerService.createReseller({
        "resellerId": this.resellerId,
        "contactperson": this.allFields.contactName || '',
        "contactNumber": this.allFields.contactNumber || '',
        "companypan": this.allFields.pan || '',
        "resellername": this.allFields.legalName || '',
        "businessname": this.allFields.brandName || '',
        "businesstype": this.allFields.businessType || '',
        "resellercatagorycode": this.allFields.businessCategory || '',
        "resellersubcatagory": this.allFields.subCategory || '',
        "businessmodal": this.allFields.businessModel || '',
        "turnoverfyear": this.allFields.turnOverLastFinYear || '',
        "monthlyincome": this.allFields.expMonthlyTurnOver || '',
        "avgamtpertransaction": this.allFields.avgAmountPerTransaction || '',
        "authorisedpan": this.allFields.authPersonPan || '',
        "nameaspan": this.allFields.authPersonPanName || '',
        "registeraddress": this.allFields.address || '',
        "pincode": this.allFields.pincode || '',
        "city": this.allFields.city || '',
        "State": this.allFields.state || '',
        "gstno": this.allFields.gstin || '',
        "website": this.allFields.websiteUrl || '',
        "emailId": this.allFields.emailId || '',
        // "resellerId": this.allFields.resellerPartnerId || '',
        "testaccess": this.allFields.giveTestAccess || 'no',
        "instruments": this.allFields.pgInstruments?.map((d: DropDownValues) => d.FieldValue).join(',') || '',
        "isPANVerified": false
      }).subscribe((response: any) => {
        if (response) {
          alert('Successfully added reseller')
          this.closeModal.emit({
            showModal: false
          })
        }
        this.closeModal.emit({
          showModal: false
        })

      })
    }

  }

  form1Submit() {
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

  form3Submit() {
    if (this.validationForm3.valid) {
      this.wizardForm.goToNextStep();
    }
    this.allFields = {...this.allFields, ...this.validationForm3.value}
    this.isForm3Submitted = true;
  }

}
