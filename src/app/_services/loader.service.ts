import {Injectable} from "@angular/core";
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LoaderService{

  public spinnerLoadingEvent =  new Subject();
  public spinnerLoadingObserver= this.spinnerLoadingEvent.asObservable();

  showLoader(){
    this.spinnerLoadingEvent.next(true);
  }

  hideLoader(){
    this.spinnerLoadingEvent.next(false);
  }

}
