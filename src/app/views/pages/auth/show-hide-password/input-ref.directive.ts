import {Directive, ElementRef, HostListener} from "@angular/core";

@Directive({
  selector: '[inputRef]'
})
export class InputRefDirective {
  focus = false;
  inRef: ElementRef;

  constructor(private el: ElementRef) {
    this.inRef = el;
  }

  @HostListener("focus")
  onFocus() {
    this.focus = true;
  }

  @HostListener("blur")
  onBlur() {
    this.focus = false;
  }
}
