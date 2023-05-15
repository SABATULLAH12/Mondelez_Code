import { Component, OnInit, OnChanges, ViewChild, AfterViewInit,Output,EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { isNil } from 'lodash';
import { DropdownTreeviewComponent, TreeviewConfig, TreeviewHelper, TreeviewI18n, TreeviewItem } from 'ngx-treeview';
import { elementAt } from 'rxjs/operators';
import { DataExplorerTable, DataExplorerTableDetails } from 'src/app/core/models/DataExplorerTable';
import { DataexplorerService } from 'src/app/core/service/dataexplorer.service';
import { AlertComponent } from '../common/alert/alert.component';
import { MySelectionComponent } from '../my-selection/my-selection.component';
import { PivotComponent } from '../pivot/pivot.component';
import { SaveSelectionComponent } from '../save-selection/save-selection.component';
import { LoaderService } from 'src/app/core/service/loader.service';
@Component({
  selector: 'app-dataexplorer',
  templateUrl: './dataexplorer.component.html',
  styleUrls: ['./dataexplorer.component.css']
})
export class DataexplorerComponent implements OnInit  {
  marketVal: any;
  Maincontainer = 'container-btn';
  Pivotcontainer = 'Pvt-btn'
  Icontainer = 'btn-rightIcon'
  Myselectionbtn = 'output_header_button_container'
  saveselectionbtn = 'output_header_button_container'
  selectionExpanded: boolean = false;



  constructor(private modalService: NgbModal, private dataexplorerService: DataexplorerService, public i18n: TreeviewI18n,private loader: LoaderService) {
    this.config = TreeviewConfig.create({
      hasAllCheckBox: false,
      hasCollapseExpand: true,
      hasFilter: true,
      maxHeight: 200,
      decoupleChildFromParent: true,
    });
    this.dropdownTreeviewSelectI18n = i18n;

    
  }
  @ViewChild(DropdownTreeviewComponent, { static: false }) dropdownTreeviewComponent: DropdownTreeviewComponent;
  ddlList: any = [];
  selectionText: string;
  markettxt: string ='market 11'
  brandfilterText: string;
  demofilterText: string;
  kpifilterText: string
  seg1filterText: string;
  seg2filterText: string;
  tpfilterText: string;
  channelfilterText: string;
  marketText: string;
  brandItem: TreeviewItem[];
  seg1Item: TreeviewItem[];
  seg2Item: TreeviewItem[];
  kpiItem: TreeviewItem[];
  demoItem: TreeviewItem[];
  channelItem: TreeviewItem[];
  timeperiodItem: TreeviewItem[];
   dropdownTreeviewSelectI18n:any
  config : TreeviewConfig;
  tableData: DataExplorerTable;
  excelTableData: DataExplorerTable;

  marketitem: TreeviewItem[];
  categoryitem: TreeviewItem[];
   excelDataObject:DataExplorerTableDetails;


  ngOnInit(): void {
    this.dataexplorerService.getExcelDataObj().subscribe(e=>{
      this.excelDataObject = e;
    })
    this.dataexplorerService.dataexplorerComp = this;
    this.dataexplorerService.getDataExplorerData();
    
  }
  selectionExpand() {
    this.selectionExpanded=!this.selectionExpanded;
  }
  isSelectionOverflown() {
    return document.getElementsByClassName("top_selection_bar_inner")[0].scrollWidth > document.getElementsByClassName("top_selection_bar")[0].clientWidth;
  }
  openPivot() {
    if (this.dataexplorerService.datatableComp?.showtable != undefined) {
      this.dataexplorerService.datatableComp.showtable = false;
    }
    
    this.Maincontainer = 'container-btn-onclick';
    this.Pivotcontainer = 'Pvt-btn-onclick';
    this.Icontainer = 'btn-rightIcon-Onclick';
    const modalRef = this.modalService.open(PivotComponent, { windowClass: "add-user-content", keyboard: false, backdrop: 'static' })
    //this.Maincontainer = 'container-btn';
    //this.Pivotcontainer = 'Pvt-btn';
    //this.Icontainer = 'btn-rightIcon';
  }
  selectItem(item: TreeviewItem): void {
    if (this.dropdownTreeviewSelectI18n.selectedItem !== item) {
      this.dropdownTreeviewSelectI18n.selectedItem = item;
      if (this.dropdownTreeviewComponent) {
        
        this.dropdownTreeviewComponent.onSelectedChange([item]);
      }
    }
  }

  onSelectedChange(checkedItem: any): void {

    this.dataexplorerService.selectedValue.BrandId = [];
    this.getcheckeditem(this.brandItem)


  }
  getcheckeditem(itemarray: TreeviewItem[]) {

    itemarray.forEach(e => {

      if (e.checked) {
        if (e.value.IsSelectable == 0) {

        } else { this.dataexplorerService.selectedValue.BrandId.push(e.value.value); }

      }
      if (e.children && e.children.length > 0) {
        this.getcheckeditem(e.children);
      }
    });

  }
  DownloadExcel(){
  //this.excelDataObject.Selection = this.dataexplorerService.selectionTextExcel;
 this.loader.show();
 window.setTimeout(()=>this.dataexplorerService.getExcelData().subscribe(e=>{
  this.loader.hide();
    window.location.href=e;
  }),1000)
  }
  getText(name: any) {
    return this.marketText;
  }

  select(item: TreeviewItem, name: any) {

    switch (name) {
      case ('Market'):
        (<HTMLInputElement>document.getElementsByClassName('marketddl-dropdown')[0].firstElementChild.firstElementChild.firstElementChild).click();
        break;
      case ('Category'):
        (<HTMLInputElement>document.getElementsByClassName('categoryddl-dropdown')[0].firstElementChild.firstElementChild.firstElementChild).click();
        break;
      case ('Brands'):
        if (item.value.IsSelectable == true) {

          this.dataexplorerService.selectedValue.BrandId = item.value.value.toString().split();
          console.log("brandid", this.dataexplorerService.selectedValue.BrandId);
          this.selectionText = this.dataexplorerService.createOuterSelectionText();
          this.dataexplorerService.selectedValue.selectionText = this.selectionText;
          this.dataexplorerService.getDatbyOuterFilterSelection();
          this.dataexplorerService.setddlSlectedText(name, this.dataexplorerService.brandtext);
          
          (<HTMLInputElement>document.getElementsByClassName('brand-dropdown')[0].firstElementChild.firstElementChild.firstElementChild).click();
        }

        break;
      case ('Demo'):
        if (item.value.IsSelectable == true) {
          this.dataexplorerService.selectedValue.DemographicId = item.value.value.toString().split();
          this.selectionText = this.dataexplorerService.createOuterSelectionText();
          this.dataexplorerService.selectedValue.selectionText = this.selectionText;
          this.dataexplorerService.getDatbyOuterFilterSelection();
          this.dataexplorerService.setddlSlectedText(name, this.dataexplorerService.demotext);
          (<HTMLInputElement>document.getElementsByClassName('demo-dropdown')[0].firstElementChild.firstElementChild.firstElementChild).click();
          }

        break;
      case ('KPI'):
        if (item.value.IsSelectable == true) {
         
          this.dataexplorerService.selectedValue.KPIId = item.value.value.toString().split();
          this.selectionText = this.dataexplorerService.createOuterSelectionText();
          this.dataexplorerService.selectedValue.selectionText = this.selectionText;
          this.dataexplorerService.getDatbyOuterFilterSelection();
          this.dataexplorerService.setddlSlectedText(name, this.dataexplorerService.kpitext);
          (<HTMLInputElement>document.getElementsByClassName('kpi-dropdown')[0].firstElementChild.firstElementChild.firstElementChild).click();

          }

        break;
      case ('Segment Filter'):
        if (item.value.IsSelectable == true) {
          this.dataexplorerService.selectedValue.Seg1Id = item.value.value.toString().split();
          console.log("segid", this.dataexplorerService.selectedValue.Seg1Id);
          this.selectionText = this.dataexplorerService.createOuterSelectionText();
          this.dataexplorerService.selectedValue.selectionText = this.selectionText;
          this.dataexplorerService.getDatbyOuterFilterSelection();
          this.dataexplorerService.setddlSlectedText(name, this.dataexplorerService.seg1text);
          (<HTMLInputElement>document.getElementsByClassName('seg1-dropdown')[0].firstElementChild.firstElementChild.firstElementChild).click();

          }

        break;
      case ('Segment'):
        if (item.value.IsSelectable == true) {
          this.dataexplorerService.selectedValue.Seg2Id = item.value.value.toString().split();
          this.selectionText = this.dataexplorerService.createOuterSelectionText();
          this.dataexplorerService.selectedValue.selectionText = this.selectionText;
          this.dataexplorerService.getDatbyOuterFilterSelection();
          this.dataexplorerService.setddlSlectedText(name, this.dataexplorerService.seg2text);
          (<HTMLInputElement>document.getElementsByClassName('seg2-dropdown')[0].firstElementChild.firstElementChild.firstElementChild).click();

             }

        break;
      case ('Time Period'):
        if (item.value.IsSelectable == true) {
          this.dataexplorerService.selectedValue.TimePeriodId = item.value.value.toString().split();
          this.selectionText = this.dataexplorerService.createOuterSelectionText();
          this.dataexplorerService.selectedValue.selectionText = this.selectionText;
          this.dataexplorerService.getDatbyOuterFilterSelection();
          this.dataexplorerService.setddlSlectedText(name, this.dataexplorerService.tptext);
          (<HTMLInputElement>document.getElementsByClassName('tp-dropdown')[0].firstElementChild.firstElementChild.firstElementChild).click();

           }

        break;
      case ('Channel'):
        if (item.value.IsSelectable == true) {
          this.dataexplorerService.selectedValue.ChannelId = item.value.value.toString().split();
          this.selectionText = this.dataexplorerService.createOuterSelectionText();
          this.dataexplorerService.selectedValue.selectionText = this.selectionText;
          this.dataexplorerService.getDatbyOuterFilterSelection();
          this.dataexplorerService.setddlSlectedText(name, this.dataexplorerService.chtext);
          (<HTMLInputElement>document.getElementsByClassName('ch-dropdown')[0].firstElementChild.firstElementChild.firstElementChild).click();

          }

        break;
    }

  }
  setBrandcheckeditem(itemarray: TreeviewItem[]) {
    let brandid = this.dataexplorerService.selectedValue?.BrandId;
    itemarray.forEach(e => {

      if (brandid?.includes(e.value.value)) {
        e.checked = true;
      }
      if (e.children && e.children.length > 0) {
        this.setBrandcheckeditem(e.children);
      }
    });
    return itemarray;
  }
  setDropdownData(name: any) {

    switch (name) {

      case ('Brands'):
        this.brandItem = this.dataexplorerService.getBranddata();
        this.dataexplorerService.getSelText(name, this.brandItem)

        break;
      case ('Demo'):
        //console.log(name, 'demo', this.dataexplorerService.dbselectedValue.DemographicId);

        this.demoItem = this.dataexplorerService.getDemodata();
        this.dataexplorerService.getSelText(name, this.demoItem)
        break;
      case ('KPI'):
        this.kpiItem = this.dataexplorerService.getKPIdata();
        this.dataexplorerService.getSelText(name, this.kpiItem)
        break;
      case ('Segment Filter'):
        this.seg1Item = this.dataexplorerService.getSegmentdata(1);
        this.dataexplorerService.getSelText(name, this.seg1Item)
        break;
      case ('Segment'):
        this.seg2Item = this.dataexplorerService.getSegmentdata(2);
        this.dataexplorerService.getSelText(name, this.seg2Item)
        break;
      case ('Time Period'):
        this.timeperiodItem = this.dataexplorerService.getTimePerioddata();
        this.dataexplorerService.getSelText(name, this.timeperiodItem)
        break;
      case ('Channel'):
        this.channelItem = this.dataexplorerService.getChanneldata();
        this.dataexplorerService.getSelText(name, this.channelItem)
        break;
      case ('Market'):

        this.dataexplorerService.getMarketdata();
        this.dataexplorerService.getSelText(name, this.dataexplorerService.marketddlItem)
        break;
      case ('Category'):
        
        this.dataexplorerService.getCategorydata();
        this.dataexplorerService.getSelText(name, this.dataexplorerService.categoryIddlItem)
        break;
    }
  }
  isVisible(name: any) {

    if (this.dataexplorerService?.selectedValue?.dropdownList?.some(e => e.name === name) == true) {

      return true;
    }
    else { return false; }
  }
  isMarketVisible() {
    if (this.dataexplorerService?.selectedValue?.dropdownList?.some(e => e.name === name) == true && this.dataexplorerService.selectedValue?.marketId?.length == 1) {
      return true;
    }
    else {
      return false;
    }
  }
  setMarketDefaultValue() {
    this.brandItem.every((e) => {
      if (e.value.IsSelectable == 1) {
        this.marketText = e.text;
        this.marketVal = e.value.value;
        return false;
      }
      if (e.children && e.children.length > 0) {
        this.setMarketDefaultValue();
      }
    })
  }
  openSaveSelection() {
    this.Myselectionbtn = '';
    this.saveselectionbtn = 'output_header_button_container_clicked'

    if (this.dataexplorerService.selectedValue.marketId != null && this.dataexplorerService.selectedValue.marketId.length != 0) {
     
      const modalRef = this.modalService.open(SaveSelectionComponent, { windowClass: "modal-content-savesel" })
    }
    else {
      const modalRef = this.modalService.open(AlertComponent, { windowClass: "modal-content-alert" })
      modalRef.componentInstance.validationMessage = 'Please make a selection';
      return;
    }
    this.saveselectionbtn = ''
  }
  openMySelection() {
    this.saveselectionbtn = ''
    this.Myselectionbtn = 'output_header_button_container_clicked';

     
    const modalRef = this.modalService.open(MySelectionComponent, { windowClass: "modal-content-savesel" })

    this.Myselectionbtn=''

  }

  loadtable() {
    if (this.tableData != undefined && this.tableData != null && this.tableData.DataExOutputTable.length > 0) {
      return true;
    }
    else {
      return false;
    }
  }




}
