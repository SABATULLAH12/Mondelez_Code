import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpRequest, HttpHandler,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { LoaderService } from '../service/loader.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertComponent } from '../../components/common/alert/alert.component';

@Injectable()
export class ServerErrorInterceptor implements HttpInterceptor {
  constructor(private loader: LoaderService, private modalService: NgbModal) {

  }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request).pipe(
      retry(1),
      catchError((error: HttpErrorResponse) => {
        this.loader.hide();
        if (error.status === 401) {
          const modalRef = this.modalService.open(AlertComponent, { windowClass: "modal-content-alert" })
          modalRef.componentInstance.type = 'logout'
          modalRef.componentInstance.header = 'ALERT'
          modalRef.componentInstance.validationMessage = 'Session Timeout';
        } else {
          console.log('server error');
          const modalRef = this.modalService.open(AlertComponent, { windowClass: "modal-content-alert" })          
          modalRef.componentInstance.header = 'ALERT'
          modalRef.componentInstance.validationMessage = 'Something went wrong. Please refresh the screen and try. If it is occuring again, please contact support team.';
          return throwError(error);
        }
      })
    );
  }
}
