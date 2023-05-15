import { ChangeDetectorRef, Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LoaderService } from './core/service/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'clientApp';
  constructor(private loader: LoaderService, private cdref: ChangeDetectorRef) {
  }
  isLoading = new BehaviorSubject<boolean>(false);
  ngAfterContentChecked() {
    this.isLoading = this.loader.isLoading;
    this.cdref.detectChanges();
  }}

