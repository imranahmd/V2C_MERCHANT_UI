import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { GeneralService } from '../general.service';
import { environment } from 'src/environments/environment';

const {PAY_URL} = environment;

@Component({
  selector: 'app-pay',
  templateUrl: './pay.component.html',
  styleUrls: ['./pay.component.scss']
})
export class PayComponent implements OnInit {
  settlementForm: FormGroup;
  Resdataone: any;
  merchantId: string = '';
  transactionKey: string = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private services: GeneralService) {
    this.settlementForm = this.fb.group({
      merchantId: ['', Validators.required],
      transactionKey: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      mobile: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      // mobile: ['', [Validators.required, Validators.pattern(/^\d{1,12}$/)]],
      email: ['', [Validators.required, Validators.email]],
      refNumber: [this.generateRefNumber(), Validators.required]
    });
  }

  ngOnInit(): void {
    let userdataone = {
      "Mid": localStorage.getItem("user")
    };

    this.services.businessdetails(userdataone).subscribe((res: any) => {
      this.Resdataone = res[0];

      this.merchantId = this.Resdataone?.MerchantId || '';
      this.transactionKey = this.Resdataone?.transaction_key || '';

      this.settlementForm.patchValue({
        merchantId: this.merchantId,
        transactionKey: this.transactionKey,
        mobile: this.Resdataone?.contact_number || '',
        email: this.Resdataone?.email_id || ''
      });

      console.log(res);
    });
  }

  onSubmit(): void {
    if (this.settlementForm.valid) {
      this.settlementForm.patchValue({
        refNumber: this.generateRefNumber()
      });

      const formData = this.settlementForm.value;

      formData.amount = parseFloat(formData.amount).toFixed(2);

      this.http.post(`${PAY_URL}/linkBasedPayment`, formData, { responseType: 'text' })
        .subscribe(response => {
          const responseString = response as string;
          const parser = new DOMParser();
          const doc = parser.parseFromString(responseString, 'text/html');

          const authIdInput = doc.querySelector('input[name="AuthID"]') as HTMLInputElement | null;
          const encDataInput = doc.querySelector('input[name="encData"]') as HTMLInputElement | null;

          if (authIdInput && encDataInput) {
            const authId = authIdInput.value;
            const encData = encDataInput.value;

            const form = document.createElement('form');
            form.action = `${PAY_URL}/paymentinit`;
            form.method = 'POST';
            form.target = '_blank';

            const authIdField = document.createElement('input');
            authIdField.type = 'hidden';
            authIdField.name = 'AuthID';
            authIdField.value = authId;
            form.appendChild(authIdField);

            const encDataField = document.createElement('input');
            encDataField.type = 'hidden';
            encDataField.name = 'encData';
            encDataField.value = encData;
            form.appendChild(encDataField);

            const refNumberField = document.createElement('input');
            refNumberField.type = 'hidden';
            refNumberField.name = 'refNumber';
            refNumberField.value = formData.refNumber;
            form.appendChild(refNumberField);

            document.body.appendChild(form);
            form.submit();

            document.body.removeChild(form);
          } else {
            console.error('AuthID or encData input element not found.');
          }
        }, error => {
          console.error('Error creating payment link:', error);
        });
    }
  }


  generateRefNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
    let hours = date.getHours().toString().padStart(2, '0');
    let minutes = date.getMinutes().toString().padStart(2, '0');
    let seconds = date.getSeconds().toString().padStart(2, '0');
  
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }
  
}
