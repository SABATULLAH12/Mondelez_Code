import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { SelectionService } from '../../../core/service/selection.service';


@Component({
  selector: 'app-alter-selection-delete',
  templateUrl: './alter-selection-delete.component.html',
  styleUrls: ['./alter-selection-delete.component.css']
})
export class AlterSelectionDeleteComponent implements OnInit {

  constructor(public activeModal: NgbActiveModal, private configg: NgbModalConfig, private modalService: NgbModal, public saveSelectionService: SelectionService) {

    configg.backdrop = 'static';
    configg.keyboard = false
  }
  @Input() validationMessage: string
  
  @Input() IsStory: Boolean; @Input() SelectionId: number; @Input() IsTagOrSelection: boolean
  ngOnInit(): void {
    
  }
  deleteConfirm() {
   
    this.saveSelectionService.deleteSelection(this.IsStory, this.SelectionId, this.IsTagOrSelection)
      //.subscribe(data => { if (data == true) { this.activeModal.close() } })
      .subscribe(data => {
       
        if (data == true) {
          if (this.IsStory == false && this.IsTagOrSelection == true) {
           
            this.saveSelectionService.selectionComp.selectionObject.Tags = this.saveSelectionService.selectionComp.selectionObject.Tags.filter(x => x.Id != this.SelectionId)
            this.saveSelectionService.selectionComp.tagItem = this.saveSelectionService.selectionComp.selectionObject.Tags; this.saveSelectionService.selectionComp.storyItem = this.saveSelectionService.selectionComp.selectionObject.Storys;
          }
          else if (this.IsStory == true && this.IsTagOrSelection == false) {
           
           
            this.saveSelectionService.selectionComp.selectionObject.StorySelectionMapping = this.saveSelectionService.selectionComp.selectionObject.StorySelectionMapping.filter(x => x.SelectionId != this.SelectionId)
            
            this.saveSelectionService.selectionComp.tableItem = this.saveSelectionService.selectionComp.tableItem.filter(x => x.SelectionId != this.SelectionId);

          }
          else {
           
            this.saveSelectionService.selectionComp.selectionObject.TagSelectionMapping = this.saveSelectionService.selectionComp.selectionObject.TagSelectionMapping.filter(x => x.SelectionId != this.SelectionId)
            
            this.saveSelectionService.selectionComp.tableItem = this.saveSelectionService.selectionComp.tableItem.filter(x => x.SelectionId != this.SelectionId);
          }

          this.activeModal.close()

        }
        
      })
  }
}
