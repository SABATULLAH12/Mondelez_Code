import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  isLoading = new BehaviorSubject<boolean>(false);
  shown = 0;
  show() {
    this.shown += 1;
    this.isLoading.next(true);
  }
  hide() {
    this.shown -= 1;
    if (this.shown === 0) {
      this.isLoading.next(false);
    }
  }
}
