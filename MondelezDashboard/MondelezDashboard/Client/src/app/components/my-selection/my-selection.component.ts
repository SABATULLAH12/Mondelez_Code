import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { DataexplorerService } from '../../core/service/dataexplorer.service';

import { SelectionService } from '../../core/service/selection.service';
import { AlertComponent } from '../common/alert/alert.component';
import { AlterSelectionDeleteComponent } from './alter-selection-delete/alter-selection-delete.component';

@Component({
  selector: 'app-my-selection',
  templateUrl: './my-selection.component.html',
  styleUrls: ['./my-selection.component.css']
})
export class MySelectionComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal, private dataexplorerService: DataexplorerService, private configg: NgbModalConfig, private modalService: NgbModal, public saveSelectionService: SelectionService) {
    configg.backdrop = 'static';
    configg.keyboard = false
    this.saveSelectionService.selectionComp = this;

  }
  @Input() validationMessage: string
  ngOnInit(): void {
    this.saveSelectionService.getMySelection().subscribe(data => { this.tagItem = data.Tags; this.storyItem = data.Storys; this.selectionObject = data; });
    this.isTag = true;
    this.viewType ='Tag View'
  }
  selectionObject: any;
  viewType: string;
  searchTextstory: string;
  searchTextTag: string;
  searchTextTable: string;
  tableName: string;
  tagItem: any;
  storyItem: any;
  tableItem: any= null
  storytableItem: any
  tagName: string;
  isNewTag: boolean = true;
  isTag: boolean = false;
  isStory: boolean = false;
  selection: any = null;
  tagClick(tag) {
    this.tableItem = null;
    this.tableItem = this.selectionObject.TagSelectionMapping.filter(x => x.TagId == tag.Id);

  }
  storyClick(story) {
    this.tableItem = null;
    this.tableItem = this.selectionObject.StorySelectionMapping.filter(x => x.TagId == story.Id);
  }
  onSelectChange(event: Event) {
    let id = parseInt((event.target as HTMLInputElement).value);
    this.selection = null;
    if (id == 1) {

      this.viewType = 'Tag View'
      this.isTag = true;
      this.isStory = false
      this.tableItem = null;
    }
    else {
      this.viewType = 'Story View'
      this.isStory = true
      this.isTag = false;
      this.tableItem = null;
    }
  }
  tableClick(table) {

    this.selection = table.Selection;
   
  }
  viewClick() {


    if (this.selection == null) {
      const modalRef = this.modalService.open(AlertComponent, { windowClass: "modal-content-alert" })
      modalRef.componentInstance.validationMessage = 'Please select valid Table Name.';
      return;
    }
    else {
      this.dataexplorerService.selectedValue = JSON.parse(this.selection);
      let deepClone = JSON.stringify(this.dataexplorerService.selectedValue);
      this.dataexplorerService.dbselectedValue = JSON.parse(deepClone);
      //this.dataexplorerService.getDataForSelectionText();
      //this.dataexplorerService.dataexplorerComp.selectionText = this.dataexplorerService.createOuterSelectionText();
      this.dataexplorerService.ViewSelection();
      this.activeModal.close();
    }
  }
  downloadClick(){
    if (this.selection == null) {
      const modalRef = this.modalService.open(AlertComponent, { windowClass: "modal-content-alert" })
      modalRef.componentInstance.validationMessage = 'Please select valid Table Name.';
      return;
    }
    else {
      let selectedValue = JSON.parse(this.selection);
      this.dataexplorerService.downloadSelection(selectedValue);
      this.activeModal.close();
    }
  }

  tagDelete(tag) {
    const modalRef = this.modalService.open(AlterSelectionDeleteComponent, { windowClass: "modal-content-alert" })
    modalRef.componentInstance.validationMessage = 'Delete Tag ' + tag.TagName+'?';

    modalRef.componentInstance.IsStory = false;
    modalRef.componentInstance.SelectionId = tag.Id;
    modalRef.componentInstance.IsTagOrSelection = true;

  }
  tableDelete(table) {
    if (this.isStory == true) {
      const modalRef = this.modalService.open(AlterSelectionDeleteComponent, { windowClass: "modal-content-alert" })
      modalRef.componentInstance.validationMessage = 'Delete table ' + table.SelectionTitle + '?';
      modalRef.componentInstance.IsStory = true;
      modalRef.componentInstance.SelectionId = table.SelectionId;
      modalRef.componentInstance.IsTagOrSelection = false;


    }
    else {
      const modalRef = this.modalService.open(AlterSelectionDeleteComponent, { windowClass: "modal-content-alert" })
      modalRef.componentInstance.validationMessage = 'Delete table ' + table.SelectionTitle + '?';
      modalRef.componentInstance.IsStory = false;
      modalRef.componentInstance.SelectionId = table.SelectionId;
      modalRef.componentInstance.IsTagOrSelection = false;
    }

  }
}
