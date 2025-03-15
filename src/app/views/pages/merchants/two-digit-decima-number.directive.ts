import {Directive, ElementRef, HostListener} from '@angular/core';

@Directive({
  selector: '[appTwoDigitDecimaNumber]'
})
export class TwoDigitDecimaNumberDirective {
  // Allow decimal numbers and negative values
  private regex: RegExp = new RegExp(/^\d*.?\d{0,2}$/g);
  // Allow key codes for special events. Reflect :
  // Backspace, tab, end, home
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', '-', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];
  private editKeys: Array<string> = ['Meta', 'Ctrl', 'Control', 'v', 'c'];

  constructor(private el: ElementRef) {
  }

  @HostListener('keydown', ['$event'])
  @HostListener('input', ['$event'])
  @HostListener('input', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Allow Backspace, tab, end, and home keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    if (event.type == 'keydown') {
      console.log("---====---====->>>>>>>>", event, event.key, !String(event.key).match(this.regex))
      if (!String(event.key).match(this.regex) && !(event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        return;
      }
    }
    let current: string = this.el.nativeElement.value;
    const position = this.el.nativeElement.selectionStart;
    const next: string = [current.slice(0, position), event.key == 'Decimal' ? '.' : (this.editKeys.indexOf(event.key) !== -1 || !event.key ? '' : event.key), current.slice(position)].join('');
    console.log(current, next, "----->", event, next && !String(next).match(this.regex));
    if (next && !String(next).match(this.regex)) {
      // this.el.nativeElement.value = ''
      event.preventDefault();
    }
  }
}
