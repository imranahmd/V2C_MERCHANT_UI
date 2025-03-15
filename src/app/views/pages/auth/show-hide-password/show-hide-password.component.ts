import {AfterViewInit, Component, ContentChild, ElementRef, OnInit} from '@angular/core';
import {InputRefDirective} from "./input-ref.directive";

@Component({
  selector: 'app-show-hide-password',
  templateUrl: './show-hide-password.component.html',
  styleUrls: ['./show-hide-password.component.scss']
})
export class ShowHidePasswordComponent implements OnInit, AfterViewInit {
  showPassword = false;
  @ContentChild('input') input: ElementRef;
  @ContentChild(InputRefDirective)
  inputPass: InputRefDirective;

  constructor() {
  }

  ngOnInit(): void {
  }

  toggleShow() {
    const self = this;
    console.log(this.inputPass.inRef.nativeElement.type);
    if (!this.showPassword) {
      setTimeout(() => {
        this.showPassword = false;
        // this.input.type = this.showPassword ? 'text' : 'password';
        this.inputPass.inRef.nativeElement.type = this.showPassword ? 'text' : 'password';
      }, 10000)
    }

    this.showPassword = !this.showPassword;
    // this.input.type = this.showPassword ? 'text' : 'password';
    this.inputPass.inRef.nativeElement.type = this.showPassword ? 'text' : 'password';

  }

  ngAfterViewInit(): void {
    // this.inputPass?.inRef?.nativeElement?.setAttribute('style', 'padding-right: 30px!important');
    this.inputPass?.inRef?.nativeElement?.classList.add('sh-control');
  }
}
