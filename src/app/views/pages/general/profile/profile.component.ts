import { Component, OnInit } from '@angular/core';
import { GeneralService } from '../general.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  Resdata: any;
  payin: any;
  payout: any;
  Resdataone: any
  constructor(private services: GeneralService) {
  }

  ngOnInit(): void {
    debugger
    let userdata = {
      "merchantid": localStorage.getItem("user")



    }

    this.services.showprofile(userdata).subscribe((res: any) => {
      // this.Resdata = res,
      res.forEach((element: any) => {
        if (element.productId == 'DEFAULT') {
          this.Resdata = element
        }
      }),
        console.log(res)
    });
    let userdataone = {
      "Mid": localStorage.getItem("user")
      
    }
    this.services.businessdetails(userdataone).subscribe((res: any) => {
      this.Resdataone = res[0]
      if (this.Resdataone.partners_type === '0') {
        this.payin = true
        this.payout = false
      } else if (this.Resdataone.partners_type === '1') {
        this.payout = true
        this.payin = false
      } else {
        this.payin = true
        this.payout = true
      }
      this.payin = this.Resdataone.partners_type == "0" ? true : false
      this.payout = this.Resdataone.partners_type == "1" ? true : false
      this.payin = this.Resdataone.partners_type == "2" ? true : false
      this.payout = this.Resdataone.partners_type == "2" ? true : false

      // res.forEach((element: any) => {
      //   if (element.productId == 'DEFAULT') {
      //     this.Resdata = element
      //   }
      // }),
      console.log(res)
    });



  }




}
