import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { __importStar } from 'tslib';
import { SelectionService } from '../../core/service/selection.service';
import { AlertComponent } from '../common/alert/alert.component';


@Component({
  selector: 'app-save-selection',
  templateUrl: './save-selection.component.html',
  styleUrls: ['./save-selection.component.css']
})
export class SaveSelectionComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal, private configg: NgbModalConfig, private modalService: NgbModal, public saveSelectionService: SelectionService) {
    configg.backdrop = 'static';
    configg.keyboard = false
    this.radioItems = ['NEW TAG', 'ADD TO TAG', 'ADD TO STORY'];
  }
  @Input() validationMessage: string
  ngOnInit(): void {
    this.isNewTag = true;
    this.saveSelectionService.getMySelection().subscribe(data => {  this.tagItem = data.Tags; this.storyItem = data.Storys });
   
    
  }
  selectedText: string;
  selectedProp: string;
  tableName: string;
  tagName: string;
  isNewTag: boolean = true;
  isAddToTag: boolean = false;
  isAddToStory: boolean = false;
  textactivecolor = '';
  radioItems: Array<string>;
  model = { option: 'NEW TAG' };
  tagIdStoryId: number = null;
  tagItem: any;
  storyItem: any;
  saveSelection() {
    if (this.model.option == 'NEW TAG' || this.model.option == 'ADD TO TAG') {
      this.isNewTag = true;
    }
   
    else { this.isNewTag = false; }
    if (this.tableName == null || this.tableName== '')
    {
      const modalRef = this.modalService.open(AlertComponent, { windowClass: "modal-content-alert" })
      modalRef.componentInstance.validationMessage = 'Please select valid Table Name.';
      return;
    }
    if (this.model.option != 'ADD TO TAG' && this.model.option != 'ADD TO STORY') {
      if (this.tagName == null || this.tagName == '') {
        const modalRef = this.modalService.open(AlertComponent, { windowClass: "modal-content-alert" })
        modalRef.componentInstance.validationMessage = 'Please select valid Tag Name.';
        return;
      }
    }
    
    if (this.model.option == 'ADD TO TAG' && this.tagIdStoryId == null) {
      const modalRef = this.modalService.open(AlertComponent, { windowClass: "modal-content-alert" })
      modalRef.componentInstance.validationMessage = 'Please select Tag';
      return;
    }
    if (this.model.option == 'ADD TO STORY' && this.tagIdStoryId == null) {
      const modalRef = this.modalService.open(AlertComponent, { windowClass: "modal-content-alert" })
      modalRef.componentInstance.validationMessage = 'Please select Story'; 
      return;
    }
    this.saveSelectionService.saveSelectionData(this.tagName, this.tableName, this.isNewTag, this.tagIdStoryId).subscribe(x => {
      if (x == true) {
        this.activeModal.dismiss('Cross click')
      }
    });
  }

  radioChange(radiobutton: any) {
    this.textactivecolor ='radio-btn-container_colored'
    this.model.option = radiobutton;
    this.selectedProp = null;
    this.selectedText = null;
    if (this.model.option == 'NEW TAG') {
      this.tagName = null;
      this.isNewTag = true;
      this.isAddToTag = false;
      this.isAddToStory = false;
    }
    else if (this.model.option == 'ADD TO TAG') {
      this.tagName = null;
      this.isAddToTag = true;
      this.isAddToStory = false;
      this.isNewTag = false;
    }
    else if (this.model.option == 'ADD TO STORY') {
      this.tagName = null;
      this.isAddToStory = true;
      this.isNewTag = false;
      this.isAddToTag = false; 
    }
  }

  ontagChange(event: any) {
    this.tagIdStoryId = parseInt((event.target as HTMLInputElement).value);
   
    if (this.isAddToTag == true) {
      this.tagName = this.tagItem.filter(x => x.Id == this.tagIdStoryId)[0]?.TagName;
      
    }
    if (this.isAddToStory == true) {
      this.tagName = this.storyItem.filter(x => x.Id == this.tagIdStoryId)[0]?.StoryName;
    }
   
    
  }
}
