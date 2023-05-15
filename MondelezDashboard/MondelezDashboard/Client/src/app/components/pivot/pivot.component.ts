import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgbActiveModal, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { DataexplorerService } from '../../core/service/dataexplorer.service';
import { DragDropCubeService } from '../../core/service/dragdropcube.service';
import { AlertComponent } from '../common/alert/alert.component';
import { dropdownPopupComponent } from '../dropdownPopup/dropdownPopup.component';

@Component({
  selector: 'app-pivot',
  templateUrl: './pivot.component.html',
  styleUrls: ['./pivot.component.css']
})
export class PivotComponent implements OnInit {
  @ViewChild('txt') txt: ElementRef;
  pivotFilterForm!: FormGroup;
  harmonized: boolean = false;
  footerMessage: any;
  demogActive: boolean = false;
  segmentActive: boolean = false;
  channelActive: boolean = false;


  dragdropList: any = [
    [],
    [],
    []
  ];
  list: any = [];
  supressZero: boolean = false;
  rowcount: number = 0
  columncount: number = 0

  constructor(public activeModal: NgbActiveModal, private config: NgbModalConfig, private modalService: NgbModal, public dataexplorerService: DataexplorerService, public dragdropCubeService: DragDropCubeService) {
       
    config.backdrop = 'static';
    config.keyboard = false
    this.dataexplorerService.pivotComp = this;
  }
  ddldndLinked(item: any) {

  }
  //@HostListener("window:mouseup", ["$event"]) clickedOut(event) {
  //  if (this.txt.nativeElement.contains(event.target)) {
  //  }
  //  else {
  //    if (this.dataexplorerService.dropDownPopupOpen == false)
  //    {
  //      this.exitClick();
  //    }
  //  }
  //  //when click outside other than this.hostElement remove the component
  //}
 removeItem1(item: any, list: any[]): void {
    
    if (this.dragdropList[1].length == 3) {
      this.dragdropList[1] = this.dragdropList[1].filter(x => x.name != item.name)
      const modalRef = this.modalService.open(AlertComponent, { windowClass: "modal-content-alert" })
      modalRef.componentInstance.validationMessage = 'Can not add more than 2 items in Column List.';
      return;
    }
    if (this.dragdropList[2].length == 4) {
      this.dragdropList[2] = this.dragdropList[2].filter(x => x.name != item.name)
      const modalRef = this.modalService.open(AlertComponent, { windowClass: "modal-content-alert" })
      modalRef.componentInstance.validationMessage = 'Can not add more than 3 items in Row List.';
      return;
   }
  
   
   if (this.dragdropList[1].filter(x => x.name == item.name).length > 0) {
    
     this.dragdropList[1] = this.dragdropList[1].filter(x => x.name != item.name);
     this.dragdropList[1].push(item);
   
   }
   if (this.dragdropList[2].filter(x => x.name == item.name).length > 0) {
     this.dragdropList[2] = this.dragdropList[2].filter(x => x.name != item.name);
     this.dragdropList[2].push(item);
   }
   
   list.splice(list.indexOf(item), 1);
   if (this.dragdropList[2].some(x => x.name.toLowerCase() == "time period") == true || this.dragdropList[1].some(x => x.name.toLowerCase() == "time period") == true) {
     let latestArray = JSON.parse(this.dataexplorerService.cubeddlData.TimePeriod)
       .filter(x => x.TIMEPERIODNAME.toLowerCase() == "latest time period available")
       .map(({ TIMEPERIODID }) => ({ TIMEPERIODID }));
     latestArray.forEach(x => {
       this.dataexplorerService.selectedValue.TimePeriodId = this.dataexplorerService.selectedValue.TimePeriodId.filter(y => y != x.TIMEPERIODID);
     })
   }

   if (this.dragdropList[2].some(x => x.name.toLowerCase() == "Segment Filter") == true || this.dragdropList[1].some(x => x.name.toLowerCase() == "Segment Filter") == true) {
     console.log(this.dataexplorerService.selectedValue.Seg1Id);
     if (this.dataexplorerService.selectedValue?.Seg1Id?.includes("-1|-1") == true) {
       this.dataexplorerService.selectedValue.Seg1Id = [];
     }
   }
   if (this.dragdropList[2].some(x => x.name.toLowerCase() == "Segment") == true || this.dragdropList[1].some(x => x.name.toLowerCase() == "Segment") == true) {
     if (this.dataexplorerService.selectedValue?.Seg2Id?.includes("-1|-1") == true) {
       this.dataexplorerService.selectedValue.Seg2Id = [];
     }
   }
   if (this.dragdropList[2].some(x => x.name.toLowerCase() == "Brands") == true || this.dragdropList[1].some(x => x.name.toLowerCase() == "Brands") == true) {
     console.log("brands-s",this.dataexplorerService.selectedValue.BrandId);
     if (this.dataexplorerService.selectedValue?.BrandId?.includes("-1|-1") == true) {
       this.dataexplorerService.selectedValue.BrandId = [];
       console.log("updatedbrand",this.dataexplorerService.selectedValue.BrandId);
     }
   }
    this.dataexplorerService.getRowColCount();
  }
  removeItem2(item: any, list: any[]): void {

    if (this.dragdropList[2].length == 4) {
     
      this.dragdropList[2] = this.dragdropList[2].filter(x => x.name != item.name)
      const modalRef = this.modalService.open(AlertComponent, { windowClass: "modal-content-alert" })
      modalRef.componentInstance.validationMessage = 'Can not add more than 3 items in Row List.';
      return;
    }
    if (item.name == 'Market' && this.dragdropList[0].filter(x => x.name == 'Market').length > 0 && this.dataexplorerService.selectedValue?.marketId.length > 1) {
      this.dragdropList[0] = this.dragdropList[0].filter(function (obj) {
        return obj.name !== 'Market';
      });
      const modalRef = this.modalService.open(AlertComponent, { windowClass: "modal-content-alert" })
      modalRef.componentInstance.validationMessage = 'Multiple markets are selected and they cannot be removed from  Rows/Columns.';
      return;
   }
    if (item.name == 'Category' && this.dragdropList[0].filter(x => x.name == 'Category').length > 0 && this.dataexplorerService.selectedValue?.categoryId.length > 1) {
      this.dragdropList[0] = this.dragdropList[0].filter(function (obj) {
        return obj.name !== 'Category';
      });
      const modalRef = this.modalService.open(AlertComponent, { windowClass: "modal-content-alert" })
      modalRef.componentInstance.validationMessage = 'Multiple Category are selected and they cannot be removed from  Rows/Columns.';
      return;
    }
    if (this.dragdropList[2].filter(x => x.name == item.name).length > 0) {
      this.dragdropList[2] = this.dragdropList[2].filter(x => x.name != item.name);
      this.dragdropList[2].push(item);
    }
    
    list.splice(list.indexOf(item), 1);
    //if (this.dragdropList[2].some(x => x.name.toLowerCase() == "time period") == true || this.dragdropList[1].some(x => x.name.toLowerCase() == "time period") == true) {
    //  console.log(true);
    //}
    this.dataexplorerService.getRowColCount();
  }
  removeItem3(item: any, list: any[]): void {
    if (this.dragdropList[1].length == 3) {
      this.dragdropList[1] = this.dragdropList[1].filter(x => x.name != item.name)
      const modalRef = this.modalService.open(AlertComponent, { windowClass: "modal-content-alert" })
      modalRef.componentInstance.validationMessage = 'Can not add more than 2 items in Column List.';
      return;
    }

    if (item.name == 'Market' && this.dragdropList[0].filter(x => x.name == 'Market').length > 0 && this.dataexplorerService.selectedValue?.marketId.length > 1) {
      this.dragdropList[0] = this.dragdropList[0].filter(function (obj) {
        return obj.name !== 'Market';
      });
      const modalRef = this.modalService.open(AlertComponent, { windowClass: "modal-content-alert" })
      modalRef.componentInstance.validationMessage = 'Multiple markets are selected and they cannot be removed from  Rows/Columns.';
      return;
    }
    if (item.name == 'Category' && this.dragdropList[0].filter(x => x.name == 'Category').length > 0 && this.dataexplorerService.selectedValue?.categoryId.length > 1) {
      this.dragdropList[0] = this.dragdropList[0].filter(function (obj) {
        return obj.name !== 'Category';
      });
      const modalRef = this.modalService.open(AlertComponent, { windowClass: "modal-content-alert" })
      modalRef.componentInstance.validationMessage = 'Multiple Category are selected and they cannot be removed from  Rows/Columns.';
      return;
    }
    if (this.dragdropList[1].filter(x => x.name == item.name).length > 0) {
      this.dragdropList[1] = this.dragdropList[1].filter(x => x.name != item.name);
      this.dragdropList[1].push(item);
    }
    
    list.splice(list.indexOf(item), 1);
    //if (this.dragdropList[2].some(x => x.name.toLowerCase() == "time period") == true || this.dragdropList[1].some(x => x.name.toLowerCase() == "time period") == true) {
    //  console.log(true);
    //}
    this.dataexplorerService.getRowColCount();
  }
  ngOnInit(): void {
    if (this?.dataexplorerService.selectedValue.marketId?.length > 0 && this?.dataexplorerService.selectedValue.categoryId?.length > 0 && this?.dataexplorerService.selectedValue.cube) {

      this.dragdropList[0] = this.dataexplorerService.selectedValue.dropdownList;
      this.dragdropList[1] = this.dataexplorerService.selectedValue.columnList;
      this.dragdropList[2] = this.dataexplorerService.selectedValue.rowList;
      let cube = this.dataexplorerService.selectedValue.cube;
      this.checkCubeActiveElement(cube);
      this.dataexplorerService.getRowColCount();
      this.harmonized = (this.dataexplorerService.selectedValue.isHarmonized == null || this.dataexplorerService.selectedValue.isHarmonized == 0) ? false : true;
     
    }
    else { this.harmonized = false; this.dataexplorerService.selectedValue.isHarmonized =0 }
    this.supressZero = this.dataexplorerService.selectedValue?.supressZero;


  }
  openMarketDropdownPopup(val: any = null) {
    const modalRef = this.modalService.open(dropdownPopupComponent, { windowClass: "add-dropdown-content" })
    modalRef.componentInstance.itemss = this.dataexplorerService.getMarketdata(val);
    modalRef.componentInstance.dropdownType = "Market"
    modalRef.componentInstance.disable = val;
    modalRef.componentInstance.dropDownPopupOpen = val;
    this.dataexplorerService.dropDownPopupOpen = true;

  }
  openCategoryDropdownPopup(val: any = null) {

    const modalRef = this.modalService.open(dropdownPopupComponent, { windowClass: "add-dropdown-content" })
    modalRef.componentInstance.itemss = this.dataexplorerService.getCategorydata(val);
    modalRef.componentInstance.dropdownType = "Category"
    modalRef.componentInstance.disable = val;
    modalRef.componentInstance.dropDownPopupOpen = val;
    this.dataexplorerService.dropDownPopupOpen = true;
  }
  openBrandDropdownPopup() {

    const modalRef = this.modalService.open(dropdownPopupComponent, { windowClass: "add-dropdown-content" })
    modalRef.componentInstance.itemss = this.dataexplorerService.getBranddata(true);
    
    modalRef.componentInstance.dropdownType = "Brand"
    this.dataexplorerService.dropDownPopupOpen = true;
  }
  openDemoDropdownPopup() {

    const modalRef = this.modalService.open(dropdownPopupComponent, { windowClass: "add-dropdown-content" })
    modalRef.componentInstance.itemss = this.dataexplorerService.getDemodata();
    modalRef.componentInstance.dropdownType = "Demo"
    this.dataexplorerService.dropDownPopupOpen = true;
  }
  openKPIDropdown() {
    const modalRef = this.modalService.open(dropdownPopupComponent, { windowClass: "add-dropdown-content" })
    modalRef.componentInstance.itemss = this.dataexplorerService.getKPIdata();
    modalRef.componentInstance.dropdownType = "KPI"
    this.dataexplorerService.dropDownPopupOpen = true;
  }
  openSEG1Dropdown() {
    const modalRef = this.modalService.open(dropdownPopupComponent, { windowClass: "add-dropdown-content" })
    modalRef.componentInstance.itemss = this.dataexplorerService.getSegmentdata(1,true);
    modalRef.componentInstance.dropdownType = "Segment Filter"
    this.dataexplorerService.dropDownPopupOpen = true;
  }
  openSEG2Dropdown() {
    const modalRef = this.modalService.open(dropdownPopupComponent, { windowClass: "add-dropdown-content" })
    modalRef.componentInstance.itemss = this.dataexplorerService.getSegmentdata(2,true);
    modalRef.componentInstance.dropdownType = "Segment"
    this.dataexplorerService.dropDownPopupOpen = true;
  }
  openTimeperiodDropdown() {
    const modalRef = this.modalService.open(dropdownPopupComponent, { windowClass: "add-dropdown-content" })
    modalRef.componentInstance.itemss = this.dataexplorerService.getTimePerioddata(true);
    modalRef.componentInstance.dropdownType = "Time Period"
    this.dataexplorerService.dropDownPopupOpen = true;
  }
  openChannelDropdown() {
    const modalRef = this.modalService.open(dropdownPopupComponent, { windowClass: "add-dropdown-content" })
    modalRef.componentInstance.itemss = this.dataexplorerService.getChanneldata();
    modalRef.componentInstance.dropdownType = "Channel"
    this.dataexplorerService.dropDownPopupOpen = true;
  }
  harmonizedchanged() {
    this.harmonized = !this.harmonized;

    if (this.harmonized == true) {
      this.dataexplorerService.selectedValue.isHarmonized = 1
    }
    else {
      this.dataexplorerService.selectedValue.isHarmonized = 0
    }
    let val = this.dataexplorerService.selectedValue?.cube;
    if (val != null || val != '') {
      this.dataexplorerService.getCubeddlData();
      this.dataexplorerService.updateSelectedCubeddl(val);
    }

  }

  checkCubeActiveElement(val: any) {
    if (this.dataexplorerService.selectedValue?.marketId?.length > 0 && this.dataexplorerService.selectedValue?.categoryId?.length > 0) {
      switch (val) {
        case 'Demographics':
          this.segmentActive = false;
          this.channelActive = false;
          this.demogActive = true;
          break;

        case 'Segment':

          this.channelActive = false;
          this.demogActive = false;
          this.segmentActive = true;
          break;

        case 'Channel':
          this.demogActive = false;
          this.segmentActive = false;
          this.channelActive = true;
          break;

        default:
          break;
      }
    }

  }
  disableCategorry() {
    if (this.dataexplorerService.selectedValue?.marketId?.length > 0) {
      return false;
    }
    else { return true }
  }
  checkCubeEnable() {
    if (this.dataexplorerService.selectedValue?.marketId?.length > 0 && this.dataexplorerService.selectedValue?.categoryId?.length > 0) {
      return true
    }
    else { return false; }
  }
  toggleDisable() {
    if(this.dataexplorerService.selectedValue.isHarmonized){
      this.harmonized = true;
    }
    else{
      this.harmonized = false;
    }
    return false;
    /*if (this.dataexplorerService.selectedValue?.marketId?.length > 1) {
      this.harmonized = true;
      this.dataexplorerService.selectedValue.isHarmonized = 1;
      return true;
    }
    else {
      return false;
    }*/
  }
  getDropDowns(val: any) {

    if (this.dataexplorerService.selectedValue?.cube != val) {
      this.dataexplorerService.selectedValue.cube = val;
      this.dataexplorerService.getCubeddlData();
      this.dataexplorerService.updateSelectedCubeddl(val);
      this.dragdropList[0] = this.dragdropCubeService.updateDropdownLabel(val);
      this.checkCubeActiveElement(val);

      let drag0 = this.dragdropList[0];
      let drag1 = this.dragdropList[1];
      let drag2 = this.dragdropList[2];
      this.dataexplorerService.selectedValue.dropdownList = [];

      if (drag1.length == 0 && drag2.length == 0) {
        if (this.dataexplorerService.selectedValue?.marketId.length > 1) {
          this.dragdropList[0] = this.dragdropList[0].filter(function (obj) {
            return obj.name !== 'Market';
          });
          this.dragdropList[1].unshift({ 'name': 'Market' });
        }
        if (this.dataexplorerService.selectedValue?.categoryId.length > 1) {
          this.dragdropList[0] = this.dragdropList[0].filter(function (obj) {
            return obj.name !== 'Category';
          });

          this.dragdropList[2].unshift({ 'name': 'Category' });
        }


      }
      else {
        if (drag1?.length > 0) {

          //find unmatched
          let array1 = drag1.filter(function (entry1) {
            return !drag0.some(function (entry2) { return entry1.name === entry2.name; })
          });

          drag0 = drag0?.filter(({ name: id1 }) => !drag1.some(({ name: id2 }) => id2 === id1));
          drag1 = drag1?.filter(({ name: id1 }) => !array1.some(({ name: id2 }) => id2 === id1));
          this.dragdropList[1] = drag1;
          this.dragdropList[0] = drag0;
        }
        if (drag2.length > 0) {
          //find unmatched
          let array1 = drag2.filter(function (entry1) {
            return !drag0.some(function (entry2) { return entry1.name === entry2.name; })
          });

          drag0 = drag0?.filter(({ name: id1 }) => !drag2.some(({ name: id2 }) => id2 === id1));
          drag2 = drag2?.filter(({ name: id1 }) => !array1.some(({ name: id2 }) => id2 === id1));
          this.dragdropList[2] = drag2;
          this.dragdropList[0] = drag0;
        }
      }
    }
    else {

    }
    this.dataexplorerService.selectedValue.dropdownList = this.dragdropList[0];
    this.dataexplorerService.getRowColCount();

  }
  onSubmit() {

  }
  openPopupbyName(val: any) {
    switch (val) {
      case 'Brands':
        this.openBrandDropdownPopup();
        break;
      case 'Demo':
        this.openDemoDropdownPopup();
        break;
      case 'KPI':
        this.openKPIDropdown();
        break;
      case 'Segment Filter':
        this.openSEG1Dropdown();
        break;
      case 'Segment':
        this.openSEG2Dropdown();
        break;
      case 'Time Period':
        this.openTimeperiodDropdown();
        break;
      case 'Channel':
        this.openChannelDropdown();
        break;
      case 'Market':
        this.openMarketDropdownPopup(true);
        break;
      case 'Category':
        this.openCategoryDropdownPopup(true);
        break;

    }

  }
  disabledropdown() {
    if (this.dataexplorerService.selectedValue?.marketId?.length == 0 || this.dataexplorerService.selectedValue?.CategoryId?.length == 0) {
      return true;
    }

    return false;
  }
  getcount(val: any) {


    switch (val) {
      case 'Market':

        return this.dataexplorerService.selectedValue?.marketId?.length || 0;

      case 'Category':
        return this.dataexplorerService.selectedValue?.categoryId?.length || 0;

      case 'KPI':
        return this.dataexplorerService.selectedValue?.KPIId?.length || 0;

      case 'Demo':
        return this.dataexplorerService.selectedValue?.DemographicId?.length || 0;

      case 'Brands':

        return this.dataexplorerService.selectedValue?.BrandId?.length || 0;

      case 'Time Period':
        return this.dataexplorerService.selectedValue?.TimePeriodId?.length || 0;

      case 'Segment Filter':
        return this.dataexplorerService.selectedValue?.Seg1Id?.length || 0;

      case 'Segment':
        return this.dataexplorerService.selectedValue?.Seg2Id?.length || 0;

      case 'Channel':
        return this.dataexplorerService.selectedValue?.ChannelId?.length || 0;


    }
    return '';
  }
  updateSupressZero() {

    this.dataexplorerService.selectedValue.supressZero = this.supressZero

  }
  ApplyFilter() {
    
    this.list = [];
    this.dataexplorerService.selectedValue.dropdownList = this.dragdropList[0];
    this.dataexplorerService.selectedValue.columnList = this.dragdropList[1];
    this.dataexplorerService.selectedValue.rowList = this.dragdropList[2]

    //validation of selection
    console.log("final_selec", this.dataexplorerService.selectedValue);

    this.dataexplorerService.selectedValue.columnList.forEach(e => {
      this.validateRowCol(e)
    });
    this.dataexplorerService.selectedValue.rowList.forEach(e => {

      this.validateRowCol(e)
    });

    if (this.dragdropList[1]?.length > 2 || this.dragdropList[2]?.length > 3) {
      const modalRef = this.modalService.open(AlertComponent, { windowClass: "modal-content-alert" })
      modalRef.componentInstance.validationMessage = 'Please note that we cannot have more than 3 levels of nesting in row and more than 2 in column. Please adjust your selections accordingly.';
      return;
    }
    if (this.list?.length > 0) {
      const modalRef = this.modalService.open(AlertComponent, { windowClass: "modal-content-alert" })
      modalRef.componentInstance.validationMessage = 'Please select the variable in the: ' + this.list.join(', ');;
      return;
    }
    if (this.rowcount > 60 || this.columncount > 60) {
      const modalRef = this.modalService.open(AlertComponent, { windowClass: "modal-content-alert" })
      modalRef.componentInstance.type = "CountValidation"
      modalRef.componentInstance.validationMessage = "Due to the table containing a large number of rows and columns exceeding 60," +
        "only a preview of the table can be displayed on the output screen. To access the complete data, kindly utilize the export to excel functionality to download the table"
    }
    else {
      this.dataexplorerService.SaveSelection();
    }

    




  }

  validateRowCol(e: any) {

    switch (e.name) {
      case ('Market'):

        (this.dataexplorerService.selectedValue?.marketId == null || this.dataexplorerService.selectedValue?.marketId?.length == 0) ? this.list.push('Market') : this.list
        break;
      case ('Category'):
        (this.dataexplorerService.selectedValue?.categoryId == null || this.dataexplorerService.selectedValue?.categoryId?.length == 0) ? this.list.push('Category') : this.list
        break;
      case ('Brands'):
        (this.dataexplorerService.selectedValue?.BrandId == null || this.dataexplorerService.selectedValue?.BrandId?.length == 0) ? this.list.push('Brands') : this.list
        break;
      case ('Demo'):
        (this.dataexplorerService.selectedValue?.DemographicId == null || this.dataexplorerService.selectedValue?.DemographicId?.length == 0) ? this.list.push('Demo') : this.list
        break;
      case ('KPI'):
        (this.dataexplorerService.selectedValue?.KPIId == null || this.dataexplorerService.selectedValue?.KPIId?.length == 0) ? this.list.push('KPI') : this.list
        break;
      case ('Segment Filter'):
        (this.dataexplorerService.selectedValue?.Seg1Id == null || this.dataexplorerService.selectedValue?.Seg1Id?.length == 0) ? this.list.push('Segment Filter') : this.list
        break;
      case ('Segment'):
        (this.dataexplorerService.selectedValue?.Seg2Id == null || this.dataexplorerService.selectedValue?.Seg2Id?.length == 0) ? this.list.push('Segment') : this.list
        break;
      case ('Time Period'):
        (this.dataexplorerService.selectedValue?.TimePeriodId == null || this.dataexplorerService.selectedValue?.TimePeriodId?.length == 0) ? this.list.push('Time Period') : this.list
        break;
      case ('Channel'):
        (this.dataexplorerService.selectedValue?.ChannelId == null || this.dataexplorerService.selectedValue?.ChannelId?.length == 0) ? this.list.push('Channel') : this.list
        break;

    }
  }

  applyDisable() {
    if (this.dragdropList[1].length == 0 || this.dragdropList[2] == 0) {
      return true;
    }

    else { return false; }
  }
  exitClick() {
    if (this.dataexplorerService.datatableComp?.showtable != undefined) {
      this.dataexplorerService.datatableComp.showtable = true;
    }
    let deepClone = JSON.stringify(this.dataexplorerService.dbselectedValue);
    this.dataexplorerService.selectedValue = JSON.parse(deepClone);

    this.activeModal.dismiss('Cross click')
  }
  checkGermany() {
    return this.dataexplorerService.selectedValue?.marketName?.includes('Germany');
  }
  clearClick() {
    this.dataexplorerService.selectedValue = {
      marketId: null, marketName: null, categoryId: null, supressZero: null, KPIId: null, DemographicId: null, BrandId: null, TimePeriodId: null,
      Seg1Id: null, Seg2Id: null, ChannelId: null, columnList: null, rowList: null, dropdownList: null, cube: null, isHarmonized: 0, selectionText: null
    }
    this.dataexplorerService.previousValue = JSON.parse(JSON.stringify(this.dataexplorerService.selectedValue))
    this.dragdropList = [
      [],
      [],
      []
    ];
    this.rowcount = null;
    this.columncount = null;
    this.supressZero = false;
    this.channelActive = false;
    this.demogActive = false;
    this.segmentActive = false;
    this.harmonized = false;
    
  }
  checkForSegmentClick() {
    if (this.dataexplorerService.selectedValue?.marketId?.length > 1 && this.dataexplorerService.selectedValue?.categoryId?.length > 1) {
      console.log(false);
      return false;
    }
    else {
      console.log(true);
      return true;
    }
  }
}
