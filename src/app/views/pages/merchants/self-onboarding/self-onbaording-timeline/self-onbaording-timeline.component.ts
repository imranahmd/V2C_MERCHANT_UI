import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {StorageService} from "../../../../../_services/storage.service";
import {LoaderService} from "../../../../../_services/loader.service";
import {MerchantService} from "../../merchant-master/merchant.service";

@Component({
  selector: 'app-self-onbaording-timeline',
  templateUrl: './self-onbaording-timeline.component.html',
  styleUrls: ['./self-onbaording-timeline.component.scss']
})
export class SelfOnbaordingTimelineComponent implements OnInit {
  private username: any;
  private merchantDetails: any;
  progressCount=10;

  constructor(private router: Router, private storageService: StorageService, private merchantService: MerchantService) { }

  ngOnInit(): void {
    this.username = this.storageService.getUserName()
    this.merchantDetails = this.merchantService.getMerchant(this.username)
      .subscribe((res)=>{
        this.merchantDetails = res;
        console.log("---------->", this.merchantDetails);
        // test
        if(this.merchantDetails[0].status =='Self-Initiated'){
          this.progressCount = 10
        }
        if((['Pending' ,'Initiated' ,'Re-Initiated']).includes(this.merchantDetails[0].status?.trim())){
          this.progressCount = 20
        }
        if(this.merchantDetails[0].status =='Pending' && (!this.merchantDetails[0].kyc_approvel || !this.merchantDetails[0].risk_approvel )){
          this.progressCount = 20
        }
        if( this.merchantDetails[0].status =='Active' ){
          this.progressCount = 40
        }
        console.log("---------->", this.progressCount);
      }, (err)=>{
        console.error(err);
      })
  }

  async onCompleteApplication($event: MouseEvent) {

    return await this.router.navigate(['/merchants/merchant-creation'], {
      queryParams: {
        mid: this.username,
        action: 'edit'
      }
    })
  }
}
