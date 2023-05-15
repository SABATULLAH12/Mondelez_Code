import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { PivotComponent } from '../app/components/pivot/pivot.component';
import { DataexplorerComponent } from '../app/components/dataexplorer/dataexplorer.component';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { dropdownPopupComponent } from './components/dropdownPopup/dropdownPopup.component';
import { getBaseUrl } from '../main';
import { DataexplorerService } from './core/service/dataexplorer.service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TreeviewModule } from 'ngx-treeview';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoaderInterceptor } from './core/interceptor/loader.interceptor';
import { DragDropCubeService } from './core/service/dragdropcube.service';
import { DndListModule } from 'ngx-drag-and-drop-lists';
import { AlertComponent } from './components/common/alert/alert.component';
import { MySelectionComponent } from './components/my-selection/my-selection.component';
import { SaveSelectionComponent } from './components/save-selection/save-selection.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { AlterSelectionDeleteComponent } from './components/my-selection/alter-selection-delete/alter-selection-delete.component';
import { GlobalErrorHandler } from './core/global-error-handler';
import { ServerErrorInterceptor } from './core/interceptor/server-error.interceptor';
import { DataexplorerTableComponent } from './components/dataexplorerTable/dataexplorertable.component';
@NgModule({
  declarations: [

    AppComponent,
    PivotComponent,
    DataexplorerComponent,
    dropdownPopupComponent,
    AlertComponent,
    MySelectionComponent,
    SaveSelectionComponent,
    AlterSelectionDeleteComponent,
    DataexplorerTableComponent
  ],
  imports: [

    TreeviewModule.forRoot(), BrowserModule, FormsModule, ReactiveFormsModule,
    NgbModule,
    DndListModule,
    HttpClientModule, Ng2SearchPipeModule,

  ],
  providers: [DragDropCubeService, DataexplorerService, NgbActiveModal, { provide: HTTP_INTERCEPTORS, useClass: ServerErrorInterceptor, multi: true }, { provide: 'BASE_URL', useFactory: getBaseUrl }, { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
