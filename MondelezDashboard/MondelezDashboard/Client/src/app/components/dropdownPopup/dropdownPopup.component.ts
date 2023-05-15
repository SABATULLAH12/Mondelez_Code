import { Component, ElementRef, HostListener, Injectable, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { DownlineTreeviewItem, TreeviewComponent, TreeviewConfig, TreeviewHelper, TreeviewItem, TreeviewEventParser, OrderDownlineTreeviewEventParser, TreeviewI18n } from 'ngx-treeview';
import { DataexplorerService } from '../../core/service/dataexplorer.service';
import { delay } from 'rxjs/operators';



@Component({
  selector: 'app-dropdownPopup',
  templateUrl: './dropdownPopup.component.html',
  styleUrls: ['./dropdownPopup.component.css'],
  providers: [

    { provide: TreeviewEventParser, useClass: OrderDownlineTreeviewEventParser }
  ]

})
export class dropdownPopupComponent implements OnInit {
  @ViewChild('lbl') lbl: ElementRef;
  dropdownEnabled = true;
  @ViewChild(TreeviewComponent, { static: false }) treeviewComponent: TreeviewComponent;
  items: TreeviewItem[];
  filterText: string;
  validationMessage: string
  @Input() dropDownPopupOpen: boolean;
  valCatMar: string
  categoryMessage: string
  values!: number[];
  isSelectAll: boolean = false;
  rows: string[];
  disableUpdate: boolean = false;
  disablecheckbox: boolean = false;
  disableonhover: boolean = false;
  collapseExpandRequired:boolean = true;
  config = TreeviewConfig.create({
    hasAllCheckBox: false,
    hasFilter: true,
    hasCollapseExpand: true,
    decoupleChildFromParent: true,
    maxHeight: 300
  });
  selectedText: string;
  Checked: boolean;
  buttonClasses = [
    'btn-outline-primary',
    'btn-outline-secondary',
    'btn-outline-success',
    'btn-outline-danger',
    'btn-outline-warning',
    'btn-outline-info',
    'btn-outline-light',
    'btn-outline-dark'
  ];
  buttonClass = this.buttonClasses[0];
  constructor(public dataexplorerService: DataexplorerService, public activeModal: NgbActiveModal, private configg: NgbModalConfig, private modalService: NgbModal, public i18n: TreeviewI18n) {

    configg.backdrop = 'static';
    configg.keyboard = false
  }
  ngOnInit(): void {

    console.log("Items received",this.itemss);
    this.collapseExpandRequired = this.itemss.filter(e=> e.children!=undefined && e.children.length>0).length>0?true:false;
    //this.config.hasCollapseExpand = this.collapseExpandRequired;
    console.log(this.itemss.filter(e=>e.children!=undefined && e.children.length>0))
    console.log(this.config.hasCollapseExpand);
    this.items = this.itemss;
    console.log("total_", this.items);
    if (this.dropdownType == 'Market' && this.disable == true && this.dropDownPopupOpen == true) {
      this.disableonhover = true;
      this.validationMessage = "Markets can’t be edited in Rows and Columns.Please edit it in the “Select - Market” Panel."

    }
    else if (this.dropdownType == 'Category' && this.disable == true && this.dropDownPopupOpen == true) {
      this.disableonhover = true;
      this.validationMessage = "Categories can't be edited in rows or columns. Please edit it in the “Select - Category” Panel."
    }
    else {
      this.validationMessage = null;
      this.disableonhover = false;
    }

    this.disableUpdate = this.disable;
    this.disablecheckbox = this.disable;

  }
  //@HostListener("window:mouseup", ["$event"]) clickedOut(event) {
  //  if (this.lbl.nativeElement.contains(event.target)) {
  //  }
  //  else {
  //    this.activeModal.dismiss('Cross click');
  //    this.dataexplorerService.dropDownPopupOpen = false;

  //  }

  //  //when click outside other than this.hostElement remove the component
  //}
  @Input() itemss!: TreeviewItem[];
  @Input() dropdownType!: any;

  @Input() disable: any;
  onFilterChange(value: string) {
  }
  updatevalue() {
    console.log("drpdwn type", this.dropdownType);
    switch (this.dropdownType) {
      
      case 'Market':

        this.dataexplorerService.updateCubeddlOnMarketChange(this.values);

      /*  this.dataexplorerService.resetCubeForSegment();*/

        break;
      case 'Category':
        this.dataexplorerService.updateCubeddlOnCategoryChange(this.values);
     /*   this.dataexplorerService.resetCubeForSegment();*/

        break;
      case 'Brand':

        this.dataexplorerService.selectedValue.BrandId = this.values;
        break;

      case 'Demo':
        this.dataexplorerService.selectedValue.DemographicId = this.values;
        break;
      case 'KPI':
        this.dataexplorerService.selectedValue.KPIId = this.values;
        break;
      case 'Segment Filter':
        this.dataexplorerService.selectedValue.Seg1Id = this.values;
        console.log("segupdatedvalue", this.dataexplorerService.selectedValue.Seg1Id);
        break;
      case 'Segment':
        this.dataexplorerService.selectedValue.Seg2Id = this.values;
        break;
      case 'Time Period':
        this.dataexplorerService.selectedValue.TimePeriodId = this.values;
        break;
      case 'Channel':
        this.dataexplorerService.selectedValue.ChannelId = this.values;
        break;
    }
    this.dataexplorerService.getRowColCount();
    this.activeModal.close();

  }
  
  onSelectedChange(checkedItem: any): void {
    if (this.dropdownType == "Brand" || this.dropdownType == "Segment Filter" || this.dropdownType == "Segment") {
      if (this.selectedText! = null) {
        this.checkSameNameItem(this.items, this.selectedText, this.Checked);
      }
    }
    this.values = [];
    if (this.dropdownType == 'Market') {
      this.dataexplorerService.selectedValue.marketName = [];
    }
    this.getcheckeditem(this.items)
    if (this.dropdownType == 'Market' && this.values.length == 0) {
      this.disable = true;
      this.disableUpdate = true;
    }
    else if (this.dropdownType == 'Category' && this.values.length == 0) {
      this.disable = true;
      this.disableUpdate = true;
    }
    else {
      this.disable = false;
      this.disableUpdate = false;
    }
    if (this.values.length == 0) {
      this.isSelectAll = false;
    }
    this.isSelectAll = true;
    if (this.checkSelectAll(this.items) == true) {
      this.isSelectAll = false;
    
    }
    else { this.isSelectAll = true }
  }
  select(item) {

    this.selectedText = item.text;
    this.Checked = item.checked;
    console.log("selectedtext-",this.selectedText);
      
  }
  checkSameNameItem(itemarray: TreeviewItem[], text, check: boolean) {
    itemarray.forEach(e => {


      if (e.text?.toLowerCase() == text?.toLowerCase()) {
          e.checked = check;
        
      }
      if (e.children && e.children.length > 0) {
        this.checkSameNameItem(e.children,text,check);
      }
    });
  }
  getcheckeditem(itemarray: TreeviewItem[]) {

    itemarray.forEach(e => {

      if (e.checked) {
        if (e.value.IsSelectable == 0) {

        } else {
          this.values.push(e.value.value);
          if (this.dropdownType == 'Market') {

            this.dataexplorerService.selectedValue.marketName.push(e.text);
          }

        }

      }
      if (e.children && e.children.length > 0) {
        this.getcheckeditem(e.children);
      }
    });

    return this.values;
  }
 
  parentSelectAll(itemarray: TreeviewItem[]) {
    this.isSelectAll = !this.isSelectAll;
    this.values = [];
    this.SelectAll(itemarray);
  }
  SelectAll(itemarray: TreeviewItem[]) {


    if (this.isSelectAll == true) {
      
      itemarray.forEach(e => {
        if (e.value.IsSelectable == 0) {

        }
        else {
          e.checked = true;
          this.values.push(e.value.value);
        }

        if (e.children && e.children.length > 0) {
          this.SelectAll(e.children);
        }
      });
      if (this.values.length > 0) {
        this.disable = false;
      }
    }
    else {
      this.values = [];
      if (this.dropdownType == 'Market' || this.dropdownType == 'Category') {
        this.disableUpdate = true;
        this.disable = true;
      }
      else { this.disable = false }

      itemarray.forEach(e => {

        e.checked = false;
        if (e.children && e.children.length > 0) {
          this.SelectAll(e.children);
        }
      });
    }
  }
  checkforKPI(item: any) {
    if (this.dropdownType == 'KPI' && item.text == 'Absolute') {

      return true;
    }
    if (this.dropdownType == 'KPI' && item.text == 'Change') {
      return true;
    }
    else { return false; }
  }

  checkSelectAll(itemarray: TreeviewItem[]) {
    let check: boolean = false;
    itemarray.forEach(e => {

      if (e.checked == false) {
        check = true;
        this.isSelectAll = false;
        return true;
      }
      if (e.children && e.children.length > 0) {
        if (this.checkSelectAll(e.children) == true) {
          check = true;
          this.isSelectAll = false;
          return true;
        }
      }
    });
    return check;
  }
  CheckMarketType(item: any) {

    if (this.dropdownType == 'Category' || this.dropdownType == 'Market' && item == false) {
      return true;
    }
    else {
      return item;
    }
  }
  CheckMarket() {

    if (this.dropdownType == 'Category' || this.dropdownType == 'Market') {
      return true;
    }
    else {
      return false;
    }
  }
 
  marketCatSelValMsg() {
    if (this.dropdownType == 'Market' && this.values?.length == 0 && this.dropDownPopupOpen != true) {
      this.valCatMar = 'Please select at least one market to proceed';
      return true;
    }
    else if (this.dropdownType == 'Category' && this.values?.length == 0 && this.dropDownPopupOpen != true) {
      this.valCatMar = 'Please select at least one category to proceed';
      return true;
    }
    else {

      this.valCatMar = '';
      return false;
    }
  }
}
