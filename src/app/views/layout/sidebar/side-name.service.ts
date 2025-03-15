import {EventEmitter, Injectable} from '@angular/core';
// import { DrawerComponent } from './drawer/drawer.component';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class SideNavService {
  public toggelEvent$: EventEmitter<any>;
  public sideNavToggleSubject: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor() {
    this.toggelEvent$ = new EventEmitter();
  }

  public toggle($event: any) {
    console.log("-----Toggle");
    this.toggelEvent$.emit($event);
    return this.sideNavToggleSubject.next($event);
  }
}
