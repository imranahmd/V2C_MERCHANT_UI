import {Component, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {LoaderService} from "./_services/loader.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  title = 'merchant-portal-fe';
  isLoading: boolean;
  private subscriber$: Subscription;

  constructor(private loaderService: LoaderService) {
  }

  ngOnInit(): void {
    this.subscriber$ = this.loaderService.spinnerLoadingObserver.subscribe((val) => {
      this.isLoading = val as boolean;
    })
  }

  ngOnDestroy(): void {
    this.subscriber$.unsubscribe()
  }
}
