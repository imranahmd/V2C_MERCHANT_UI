import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms'

@Component({
  selector: 'app-yes-bank-payout',
  templateUrl: './yes-bank-payout.component.html',
  styleUrls: ['./yes-bank-payout.component.scss']
})
export class YesBankPayoutComponent implements OnInit {
  yesbankForm: FormGroup;
  isForm1Submitted: Boolean;

  constructor() {
    this.yesbankForm = new FormGroup({
      payoutDate: new FormControl('', [Validators.required]),


    })
  }

  get form1() {
    return this.yesbankForm.controls;
  }

  ngOnInit(): void {
  }

  onSubmit(formavalue: any) {
    this.isForm1Submitted = true;
  }

  noKeyInput($event: any) {
    return false
  }


}
