import { Injectable, NgZone } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertComponent } from '../../components/common/alert/alert.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private modalService: NgbModal,
   ) { }

  showSuccess(message: string): void {
    // Had an issue with the snackbar being ran outside of angular's zone.
    const modalRef = this.modalService.open(AlertComponent, { windowClass: "modal-content-alert" })
    modalRef.componentInstance.validationMessage = 'Some error occured';
  }

  showError(message: string): void {
    const modalRef = this.modalService.open(AlertComponent, { windowClass: "modal-content-alert" })
    modalRef.componentInstance.validationMessage = 'Some error occured';
  }
}
