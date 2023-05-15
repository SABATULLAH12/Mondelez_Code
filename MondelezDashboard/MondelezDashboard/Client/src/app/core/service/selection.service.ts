
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import * as _ from 'lodash';
import { MySelectionComponent } from '../../components/my-selection/my-selection.component';
import { DataexplorerService } from './dataexplorer.service';
@Injectable({
  providedIn: 'root'
})
export class SelectionService {
  _baseUrl: string;
  private headers: HttpHeaders;
  mySelection: any;
  selectionComp: MySelectionComponent;
  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string, private dataExplorerServ: DataexplorerService) {
    this._baseUrl = baseUrl;
    this.headers = new HttpHeaders().set("Token", '');
  }
  saveSelectionData(tagName: any, tableName: any, istag: any, tagIdStoryId:any) {
    var request: any = {};
    this.dataExplorerServ.selectedValue.selectionTextExcel = this.dataExplorerServ.selectionTextExcel;
    let deepClone = JSON.stringify(this.dataExplorerServ.selectedValue);
    this.dataExplorerServ.dbselectedValue = JSON.parse(deepClone);
    request.moduleId = 0;
    request.moduleName = 'DataExplorer';
    request.TagOrStoryId = tagIdStoryId;    
    
    request.selection = JSON.stringify(this.dataExplorerServ.selectedValue);
    
    request.IsTag = istag;
    request.TagName = tagName;
    request.selectionTitle = tableName;
    request.selectionParameters = JSON.stringify(this.dataExplorerServ.selectedValue);;
    request.FooterText = '';

    return this.http.post<any>(document.location.origin + '/api/FilterPanel/DataExplorerTabSaveSelection', request, { headers: this.headers })

  }
  getMySelection() {
    return this.http.post<any>(document.location.origin + '/api/FilterPanel/GetDataExplorerMySelections', { headers: this.headers });
  }
  deleteSelection(IsStory, SelectionId, IsTagOrSelection) {
    var request: any = {};
    request.IsStory = IsStory;
    request.SelectionId = SelectionId;
    request.IsTagOrSelection = IsTagOrSelection;
    return this.http.post<any>(document.location.origin + '/api/FilterPanel/DataExplorerDeleteSelection', request, { headers: this.headers })
  }
}
