import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-recon-management',
  templateUrl: './recon-management.component.html',
  styleUrls: ['./recon-management.component.scss']
})
export class ReconManagementComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
  }

  noKeyInput($event: any) {
    return false
  }

}
