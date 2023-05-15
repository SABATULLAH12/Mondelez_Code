import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { config } from 'rxjs';
import { DataexplorerService } from '../../../core/service/dataexplorer.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal, private configg: NgbModalConfig, private modalService: NgbModal, public dataexplorerService: DataexplorerService) {
    configg.backdrop = 'static';
    configg.keyboard = false
  }
  @Input() validationMessage: string
  @Input() type: string
  @Input() header: string ='Alert'
  ngOnInit(): void {
    this.configg.keyboard = false;
  }
  okClick() {
    if (this.type == 'logout') {
      this.activeModal.dismiss('Cross click') 
      window.location.href = '../Home/logout';
    }
    else if (this.type == "CountValidation")
    {
      this.activeModal.dismiss('Cross click')
      this.dataexplorerService.SaveSelection();
    }
    else {
      this.activeModal.dismiss('Cross click')
    }
  }
  okCloseClick() {
    if (this.type == 'logout') {
      this.activeModal.dismiss('Cross click')
      window.location.href = '../Home/logout';
    }
    else if (this.type == "CountValidation") {
      this.activeModal.dismiss('Cross click');
      
    }
    else {
      this.activeModal.dismiss('Cross click')
    }
  }
}
