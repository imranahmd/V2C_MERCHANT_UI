import {Component, Input, OnInit, TemplateRef, ViewChild} from '@angular/core'
import {ModalConfig} from './modal.config'
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap'


@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

  @Input() public modalConfig: ModalConfig
  @ViewChild('modal') private modalContent: TemplateRef<ModalComponent>
  private modalRef: NgbModalRef
  isModalOpen: boolean = false;

  constructor(private modalService: NgbModal) {}

  ngOnInit(): void {}

  isOpen(){
    return this.isModalOpen;
  }

  open(): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      console.log("In Modal", this.modalConfig)
      this.modalRef = this.modalService.open(this.modalContent, {size: this.modalConfig.modalSize, fullscreen: this.modalConfig.fullscreen || false})
      this.modalRef.result.then(resolve, resolve)
      this.isModalOpen = true;
    })
  }

  // openData(data:any): Promise<boolean> {
  //   return new Promise<boolean>(resolve => {
  //     this.modalRef = this.modalService.open(data, {size: this.modalConfig.modalSize})
  //     this.modalRef.result.then(resolve, resolve)
  //   })
  // }

  async close(): Promise<void> {
    if (this.modalConfig.shouldClose === undefined || (await this.modalConfig.shouldClose())) {
      const result = this.modalConfig.onClose === undefined || (await this.modalConfig.onClose())
      this.modalRef.close(result);
      this.isModalOpen = false;
    }
  }

  async topClose(): Promise<void> {
    if (this.modalConfig.shouldTopClose === undefined || (await this.modalConfig.shouldTopClose())) {
      const result = this.modalConfig.onTopClose === undefined || (await this.modalConfig.onTopClose())
      this.modalRef.close(result);
      this.isModalOpen = false;
    }
  }

  async dismiss(): Promise<void> {
    if (this.modalConfig.shouldDismiss === undefined || (await this.modalConfig.shouldDismiss())) {
      const result = this.modalConfig.onDismiss === undefined || (await this.modalConfig.onDismiss())
      this.modalRef.dismiss(result);
      this.isModalOpen = false;
    }
  }
}
