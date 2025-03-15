import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms'

@Component({
  selector: 'app-hdfcpayout',
  templateUrl: './hdfcpayout.component.html',
  styleUrls: ['./hdfcpayout.component.scss']
})
export class HDFCPayoutComponent implements OnInit {
  hdfcForm: FormGroup;
  isForm1Submitted: Boolean;

  constructor() {
    this.hdfcForm = new FormGroup({
      payoutDate: new FormControl('', [Validators.required]),


    })
  }

  get form1() {
    return this.hdfcForm.controls;
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
