import { NgControl } from '@angular/forms';
import {Directive, Input} from "@angular/core";

@Directive({
  selector: '[disableControl]'
})
export class DisableControlDirective {

  @Input() set disableControl( condition : boolean ) {
    const action = condition ? 'disable' : 'enable';
    // @ts-ignore
    // this.ngControl?.control[action]();
    if(this.ngControl?.control){
      this.ngControl.control[action](
        {
          onlySelf: true,
          emitEvent: true
        }
      );
    }
    // this.ngControl.control?.disable({
    //   onlySelf: true,
    //   emitEvent: true
    // })
    console.log(this.ngControl)
  }

  constructor( private ngControl : NgControl ) {
  }

}
