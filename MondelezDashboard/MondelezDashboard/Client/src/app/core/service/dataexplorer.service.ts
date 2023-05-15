import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ElementRef, Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import * as _ from 'lodash';
import { TreeviewItem } from 'ngx-treeview';
import { DataexplorerTableComponent } from '../../components/dataexplorerTable/dataexplorertable.component';
import { DataExplorerTable, DataExplorerTableData, DataExplorerTableDetails, LevelInfo } from '../models/DataExplorerTable';
import { BehaviorSubject,Observable } from 'rxjs';
import { AlertComponent } from '../../components/common/alert/alert.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoaderService } from './loader.service';
@Injectable({
  providedIn: 'root'
})
export class DataexplorerService {
  _baseUrl: string;
  private headers: HttpHeaders;

  selectedValue: any = {
    marketId: null,marketName:null, categoryId: null, supressZero: null, KPIId: null, DemographicId: null, BrandId: null, TimePeriodId: null,
    Seg1Id: null, Seg2Id: null, ChannelId: null, columnList: null, rowList: null, dropdownList: null, cube: null, isHarmonized: 0, selectionText: null, selectionTextExcel:null
  }
  previousValue: any = {
    marketId: null,marketName:null, categoryId: null, supressZero: null, KPIId: null, DemographicId: null, BrandId: null, TimePeriodId: null,
    Seg1Id: null, Seg2Id: null, ChannelId: null, columnList: null, rowList: null, dropdownList: null, cube: null, isHarmonized: 0, selectionText: null, selectionTextExcel:null
  }
  dbselectedValue: any = {
    marketId: null, marketName: null, categoryId: null, supressZero: null, KPIId: null, DemographicId: null, BrandId: null, TimePeriodId: null,
    Seg1Id: null, Seg2Id: null, ChannelId: null, columnList: null, rowList: null, dropdownList: null, cube: null, isHarmonized: 0, selectionText: null, selectionTextExcel:null
  }
  excelDataObj:DataExplorerTableDetails=new DataExplorerTableDetails();
  excelDataObjSelection = new BehaviorSubject<DataExplorerTableDetails>(this.excelDataObj);
  getExcelDataObj():Observable<DataExplorerTableDetails>{
    return this.excelDataObjSelection.asObservable();
  }

  setExcelDataObj(obj:DataExplorerTableDetails){
    this.excelDataObjSelection.next(obj);
  }

  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string, @Inject(DOCUMENT) document: Document, private modalService: NgbModal,private loader: LoaderService) {
    this._baseUrl = baseUrl;
    this.headers = new HttpHeaders().set("Token", '');
  }
  selectionData: any;
  cubeddlData: any;
  datatableComp: DataexplorerTableComponent
  pivotComp: any
  dataexplorerComp: any;
  marketddlItem: any;
  categoryIddlItem: any;
  kpiddlItem: any;
  demoddlItem: any;
  brandddlItem: any;
  timeperiodddleItem: any;
  seg1ddlItem: any;
  seg2ddlItem: any;
  channelddlItem: any;
  dropDownPopupOpen: boolean = false;
  brandtext: string;
  demotext: string;
  kpitext: string;
  tptext: string;
  chtext: string;
  seg1text: string;
  seg2text: string;
  selectionTextExcel:string="";
  excelData:any;

  getselection() {

   return this.http.post<any>(document.location.origin + '/api/FilterPanel/GetMarketCategory', { headers: this.headers });

  }
  getMarketdata(val: any = null) {


    let ddldata = this.selectionData.marketddl;
    const items: TreeviewItem[] = [];
    var self = this;
    ddldata.forEach(function (value: any) {

      let chk = true;
      if (self.selectedValue.marketId?.includes(value.CountryId)) {

        chk = true;
      }
      else {
        chk = false
      }

      const item = new TreeviewItem({
        text: value.CountryName,
        value: { value: value.CountryId, IsSelectable: value.IsSelectable },
        checked: chk,
        disabled: val
      });
      items.push(item);
    });
    this.marketddlItem = items;
    return items;
  }
  getCategorydata(val: any = null) {

    let ddldata: any = this.selectionData.categoryddl;
    ddldata = ddldata.filter((x: { CountryId: any; }) => this.selectedValue.marketId?.includes(x.CountryId))

    ddldata = ddldata.filter((a: { CategoryId: any; }, i: any) => ddldata.findIndex((s: { CategoryId: any; }) => a.CategoryId === s.CategoryId) === i)

    const items: TreeviewItem[] = [];
    var self = this;
    ddldata.forEach(function (value: any) {

      let chk = true;
      if (self.selectedValue.categoryId?.includes(value.CategoryId)) {

        chk = true;
      }
      else {
        chk = false
      }

      const item = new TreeviewItem({
        text: value.CategoryName,
        value: { value: value.CategoryId, IsSelectable: value.IsSelectable },
        checked: chk,
        disabled: val
      });
      items.push(item);
    });
    this.categoryIddlItem = items;
    return items;
  }
  getBranddata(treeview=false) {

   
    const items: TreeviewItem[] = [];
    //let ddldata: any = this.createBrandsItems(JSON.parse(this.cubeddlData.Brands));

    //ddldata.forEach(item => {


    //  items.push(new TreeviewItem(item))
    //});
    ////items.push(new TreeviewItem(JSON.parse(ddldata.substring(1, ddldata.length - 1))))

    //this.getBrandcheckeditem(items);
    //this.brandddlItem = items;
    //return items;
     let ddldata: any;
    let data;
    if (treeview == true && this.selectedValue.isHarmonized==0){
      data = JSON.parse(this.cubeddlData.Brands).filter(x => x.NAME.toLowerCase().indexOf("total manufacture") === -1);
    }
    else {
      data = JSON.parse(this.cubeddlData.Brands);
    }
    ddldata = this.createBrandsItems(data);
    console.log("ddldata", ddldata);
    ddldata.forEach(item => {
      items.push(new TreeviewItem(item))
    });
    this.getBrandcheckeditem(items);
    this.brandddlItem = items;
    return items;
  }
  getBrandcheckeditem(itemarray: TreeviewItem[]) {
    let self = this;
    itemarray.forEach(e => {

      if (self.selectedValue.BrandId?.includes(e.value.value)) {
        e.checked = true;
      }
      else { e.checked = false; }
      if (e.children && e.children.length > 0) {
        this.getBrandcheckeditem(e.children);
      }
    });

  }
  getTPcheckeditem(itemarray: TreeviewItem[]) {
    let self = this;
    itemarray.forEach(e => {

      if (self.selectedValue.TimePeriodId?.includes(e.value.value)) {
        e.checked = true;
      }
      else { e.checked = false; }
      if (e.children && e.children.length > 0) {
        this.getTPcheckeditem(e.children);
      }
    });

  }
  getDemodata() {
    const items: TreeviewItem[] = [];
    let ddldata: any = this.createDemoItems(JSON.parse(this.cubeddlData.Demographics));
    ddldata.forEach(item => {

      items.push(new TreeviewItem(item))
    });

    this.getDemocheckeditem(items);
    this.demoddlItem = items;
    return items;
  }
  getKPIdata() {
    const items: TreeviewItem[] = [];

    let ddldata: any = this.createKPIItems(JSON.parse(this.cubeddlData.KPI));
    ddldata.forEach(item => {

      items.push(new TreeviewItem(item))
    });
    this.getKPICheckeditem(items);
    this.kpiddlItem = items;
    return items;

  }
  getSegmentdata(type: any, treeview = false) {
    const items: TreeviewItem[] = [];
    let ddldata: any
    if (type == 1) {
      let data;
      if (treeview == true) {


        data = JSON.parse(this.cubeddlData.Segment1).filter(x => x.NAME.toLowerCase().indexOf("total segments") === -1);
      }
      else {
        data = JSON.parse(this.cubeddlData.Segment1);
      }
      ddldata = this.createSeg1Items(data);
    }
    else {
      let data;
      if (treeview == true) {


        data = JSON.parse(this.cubeddlData.Segment2).filter(x => x.NAME.toLowerCase().indexOf("total segments") === -1);
      }
      else {
        data = JSON.parse(this.cubeddlData.Segment2);
      }
      ddldata = this.createSeg2Items(data);
    }

    ddldata.forEach(item => {

      items.push(new TreeviewItem(item))
    });
    if (type == 1) {
      this.getSeg1IdCheckeditem(items);
      this.seg1ddlItem = items;
    }
    else {
      this.getSeg2IdCheckeditem(items);
      this.seg2ddlItem = items;
    }

    return items;

  }
  getTimePerioddata(treeview=false) {

    const items: TreeviewItem[] = [];
    let tpdata;
    
    if (treeview == true) {
      
      
      tpdata = JSON.parse(this.cubeddlData.TimePeriod).filter(x => x.TIMEPERIODNAME.toLowerCase().indexOf("latest") === -1);
    }
    else {
      tpdata = JSON.parse(this.cubeddlData.TimePeriod);
    }
    let ddldata: any = this.createTimePeriodItems(tpdata);

    ddldata.forEach(item => {


      items.push(new TreeviewItem(item))
    });
    //items.push(new TreeviewItem(JSON.parse(ddldata.substring(1, ddldata.length - 1))))
    this.getTPcheckeditem(items);
    this.timeperiodddleItem = items;
    return items;

  }
  getChanneldata() {
    const items: TreeviewItem[] = [];
    let ddldata: any = this.createChannelItems(JSON.parse(this.cubeddlData.Channel));
   
    ddldata.forEach(item => {

      items.push(new TreeviewItem(item))
    });
    this.getChannelIdCheckeditem(items);
    this.channelddlItem = items;
    return items;

  }
  createBrandsItems(array: any) {
    console.log("brands", array);
    var self = this;
    let formatTreeParent = function (compareArray) {
      let Data = [];

      compareArray.forEach((element) => {
        let chk = true;

        if (self.selectedValue.BrandId?.includes(element.OrderKey + '|' + element.CategoryID+'|'+element.CountryID)) {

          chk = true;

        }
        else {
          chk = false
        }
        if (element.OrderKey == element.PARENT) {
          var obj = {
            children: element.IsLastLevel == 0 ? formatTreechild(compareArray, element.OrderKey, element.CategoryID,element.CountryID) : [],
            text: element.NAME,
            value: { value: element.OrderKey + '|' + element.CategoryID+'|'+element.CountryID, CategoryID: element.CategoryID, IsSelectable: element.IsSelectable },
            collapsed: true,
            checked: chk
          }
          Data.push(obj);
        }
      })
      console.log("pre_brands", Data);
      return Data;
    };

    let formatTreechild = function (List, parentid, categoryid,CountryId) {

      let Data = [];
      List.forEach((element) => {
        let chk = true;

        if (self.selectedValue.BrandId?.includes(element.OrderKey + '|' + element.CategoryID+'|'+element.CountryID)) {

          chk = true;

        }
        else {
          chk = false
        }
       
        
        if (element.OrderKey != parentid
          && element.PARENT.toString().split(',').some(r => parentid.toString().split(',').includes(r)) == true
          && element.CategoryID.toString().split(',').some(r => categoryid.toString().split(',').includes(r)) == true
          && element.CountryID.toString().split(',').some(r => CountryId.toString().split(',').includes(r)) == true
        ) {
          
          var obj = {
            children: element.IsLastLevel == 0 ? formatTreechild(List, element.OrderKey, element.CategoryID, element.CountryID) : [],
            text: element.NAME,
            value: { value: element.OrderKey + '|' + element.CategoryID+'|'+element.CountryID, CategoryID: element.CategoryID, IsSelectable: element.IsSelectable },
            collapsed: true,
            checked: chk
          }
          Data.push(obj);
        }
      })
      return Data;
    }
    return formatTreeParent(array)
  }


  createTimePeriodItems(array: any) {
 

    var self = this;
    let formatTreeParent = function (compareArray) {
      let Data = [];

      compareArray.forEach((element) => {
        let chk = true;

        if (self.selectedValue.TimePeriodId?.includes(element.TIMEPERIODID)) {

          chk = true;

        }
        else {
          chk = false
        }
        if (element.TIMEPERIODID == element.PARENTID) {
          var obj = {
            children: element.IsLastLevel == 0 ? formatTreechild(compareArray, element.TIMEPERIODID) : [],
            text: element.TIMEPERIODNAME,
            value: { value: element.TIMEPERIODID, IsSelectable: element.IsSelectable },
            collapsed: true,
            checked: chk
          }
          Data.push(obj);
        }
      })
      return Data;
    };

    let formatTreechild = function (List, parentid) {

      let Data = [];
      List.forEach((element) => {
        let chk = true;

        if (self.selectedValue.TimePeriodId?.includes(element.TIMEPERIODID)) {

          chk = true;

        }
        else {
          chk = false
        }
        if (element.TIMEPERIODID != parentid && element.PARENTID == parentid) {
          var obj = {
            children: element.IsLastLevel == 0 ? formatTreechild(List, element.TIMEPERIODID) : [],
            text: element.TIMEPERIODNAME,
            value: { value: element.TIMEPERIODID, IsSelectable: element.IsSelectable },collapsed: true,
            checked: chk
          }
          Data.push(obj);
        }
      })
      return Data;
    }
    return formatTreeParent(array)
  }
  createDemoItems(array: any) {

   

    var self = this;
    let formatTreeParent = function (compareArray) {
      let Data = [];

      compareArray.forEach((element) => {
        let chk = true;

        if (self.selectedValue.DemographicId?.includes(element.DemographicId)) {

          chk = true;

        }
        else {
          chk = false
        }
        if (element.DemographicId == element.PARENTID) {
          var obj = {
            children: element.IsLastLevel == 0 ? formatTreechild(compareArray, element.DemographicId) : [],
            text: element.DemogName,
            value: { value: element.DemographicId, IsSelectable: element.IsSelectable },
            collapsed: true,
            checked: chk
          }
          Data.push(obj);
        }
      })
      return Data;
    };

    let formatTreechild = function (List, parentid) {

      let Data = [];
      List.forEach((element) => {
        let chk = true;

        if (self.selectedValue.DemographicId?.includes(element.DemographicId)) {

          chk = true;

        }
        else {
          chk = false
        }

        if (element.DemographicId != parentid && element.PARENTID.toString().split(',').some(r => parentid.toString().split(',').includes(r)) == true) {
          var obj = {
            children: element.IsLastLevel == 0 ? formatTreechild(List, element.DemographicId) : [],
            text: element.DemogName,
            value: { value: element.DemographicId, IsSelectable: element.IsSelectable }
            , collapsed: true,
            checked: chk
          }
          Data.push(obj);
        }
      })
      return Data;
    }
    return formatTreeParent(array)


  }
  createKPIItems(array: any) {

    
    var self = this;
    let formatTreeParent = function (compareArray) {
      let Data = [];

      compareArray.forEach((element) => {
        let chk = true;

        if (self.selectedValue.KPIId?.includes(element.METRICID)) {

          chk = true;

        }
        else {
          chk = false
        }
        if (element.METRICID == element.PARENTID) {
          var obj = {
            children: element.IsLastLevel == 0 ? formatTreechild(compareArray, element.METRICID) : [],
            text: element.METRICNAME,
            value: { value: element.METRICID, IsSelectable: element.IsSelectable, outputName: element.METRICOUTPUTNAME },
            collapsed: true,
            checked: chk
          }
          Data.push(obj);
        }
      })
      return Data;
    };

    let formatTreechild = function (List, parentid) {

      let Data = [];
      List.forEach((element) => {
        let chk = true;

        if (self.selectedValue.KPIId?.includes(element.METRICID)) {

          chk = true;

        }
        else {
          chk = false
        }
        if (element.METRICID != parentid && element.PARENTID == parentid) {
          var obj = {
            children: element.IsLastLevel == 0 ? formatTreechild(List, element.METRICID) : [],
            text: element.METRICNAME,
            value: { value: element.METRICID, IsSelectable: element.IsSelectable, outputName: element.METRICOUTPUTNAME }
            , collapsed: true,
            checked: chk
          }
          Data.push(obj);
        }
      })
      return Data;
    }
    return formatTreeParent(array)


  }
  createSeg1Items(array: any) {

    

    var self = this;
    let formatTreeParent = function (compareArray) {
      let Data = [];

      compareArray.forEach((element) => {
        let chk = true;

        if (self.selectedValue.Seg1Id?.includes(element.OrderKey + '|' + element.CategoryID)) {

          chk = true;

        }
        else {
          chk = false
        }
        if (element.OrderKey == element.PARENT) {
          var obj = {
            children: element.IsLastLevel == 0 ? formatTreechild(compareArray, element.OrderKey, element.CategoryID) : [],
            text: element.NAME,
            value: { value: element.OrderKey + '|' + element.CategoryID, CategoryID: element.CategoryID, IsSelectable: element.IsSelectable },
            collapsed: true,
            checked: chk
          }
          Data.push(obj);
        }
      })
      return Data;
    };

    let formatTreechild = function (List, parentid, categoryid) {

      let Data = [];
      List.forEach((element) => {
        let chk = true;

        if (self.selectedValue.Seg1Id?.includes(element.OrderKey + '|' + element.CategoryID)) {

          chk = true;

        }
        else {
          chk = false
        }

        if (element.OrderKey != parentid
          && element.PARENT.toString().split(',').some(r => parentid.toString().split(',').includes(r)) == true
          && element.CategoryID.toString().split(',').some(r => categoryid.toString().split(',').includes(r)) == true) {
          var obj = {
            children: element.IsLastLevel == 0 ? formatTreechild(List, element.OrderKey, element.CategoryID) : [],
            text: element.NAME,

            value: { value: element.OrderKey + '|' + element.CategoryID, CategoryID: element.CategoryID, IsSelectable: element.IsSelectable },
            collapsed: true,
            checked: chk
          }
          Data.push(obj);
        }
      })
      return Data;
    }
    return formatTreeParent(array)
  }
  createSeg2Items(array: any) {
    
   
    var self = this;
    let formatTreeParent = function (compareArray) {
      let Data = [];

      compareArray.forEach((element) => {
        let chk = true;

        if (self.selectedValue.Seg2Id?.includes(element.OrderKey + '|' + element.CategoryID)) {

          chk = true;

        }
        else {
          chk = false
        }
        if (element.OrderKey == element.PARENT) {
          var obj = {
            children: element.IsLastLevel == 0 ? formatTreechild(compareArray, element.OrderKey, element.CategoryID) : [],
            text: element.NAME,
            value: { value: element.OrderKey + '|' + element.CategoryID, CategoryID: element.CategoryID, IsSelectable: element.IsSelectable },
            collapsed: true,
            checked: chk
          }
          Data.push(obj);
        }
      })
      return Data;
    };

    let formatTreechild = function (List, parentid, categoryid) {

      let Data = [];
      List.forEach((element) => {
        let chk = true;

        if (self.selectedValue.Seg2Id?.includes(element.OrderKey + '|' + element.CategoryID)) {

          chk = true;

        }
        else {
          chk = false
        }
        if (element.OrderKey != parentid
          && element.PARENT.toString().split(',').some(r => parentid.toString().split(',').includes(r)) == true
          && element.CategoryID.toString().split(',').some(r => categoryid.toString().split(',').includes(r)) == true) {
          var obj = {
            children: element.IsLastLevel == 0 ? formatTreechild(List, element.OrderKey, element.CategoryID) : [],
            text: element.NAME,

            value: { value: element.OrderKey + '|' + element.CategoryID, CategoryID: element.CategoryID, IsSelectable: element.IsSelectable },
            collapsed: true,
            checked: chk
          }
          Data.push(obj);
        }
      })
      return Data;
    }
    return formatTreeParent(array)
  }
  createChannelItems(array: any) {

    

    var self = this;
    let formatTreeParent = function (compareArray) {
      let Data = [];

      compareArray.forEach((element) => {
        let chk = true;

        if (self.selectedValue.ChannelId?.includes(element.ChannelID)) {

          chk = true;

        }
        else {
          chk = false
        }
        if (element.ChannelID == element.PARENTID) {
          var obj = {
            children: element.IsLastLevel == 0 ? formatTreechild(compareArray, element.ChannelID) : [],
            text: element.ChannelName,
            value: { value: element.ChannelID, IsSelectable: element.IsSelectable },
            collapsed: true,
            checked: chk
          }
          Data.push(obj);
        }
      })
      return Data;
    };

    let formatTreechild = function (List, parentid) {

      let Data = [];
      List.forEach((element) => {
        let chk = true;

        if (self.selectedValue.ChannelId?.includes(element.ChannelID)) {

          chk = true;

        }
        else {
          chk = false
        }
       
        if (element.ChannelID != parentid && element.PARENTID.toString().split(',').some(r => parentid.toString().split(',').includes(r)) == true) {
          var obj = {
            children: element.IsLastLevel == 0 ? formatTreechild(List, element.ChannelID) : [],
            text: element.ChannelName,
            value: { value: element.ChannelID, IsSelectable: element.IsSelectable },
            collapsed: true,
            checked: chk
          }
          Data.push(obj);
        }
      })
      return Data;
    }
    return formatTreeParent(array)


  }
  updateCategoryByMarketSelection() {
    let ddldata: any = this.selectionData.categoryddl;
    let category = ddldata.filter((x: { CountryId: any; }) => this.selectedValue.marketId?.includes(x.CountryId));
    let categoryid = [...new Set(category.map((item: { CategoryId: any; }) => item.CategoryId))];

    this.selectedValue.categoryId = this.selectedValue.categoryId?.filter((x: any) => categoryid.includes(x))
    if (this.selectedValue.categoryId?.length == 0) {
      this.selectedValue.cube = null;
      this.cubeddlData = null;
      this.pivotComp.dragdropList = [
        [],
        [],
        []
      ];
    }
  }
  getCubeddlData() {
    
    let previousState = (this.previousValue?.marketId?.length > 1 || this.previousValue?.categoryId?.length>1)?"multi":"single";
    let currentState = (this.selectedValue?.marketId?.length > 1 || this.selectedValue?.categoryId?.length>1)?"multi":"single";
    console.log("previousState",previousState);
    console.log("currentState",currentState);
    if(previousState!=currentState){
      if(currentState=="multi"){
        this.selectedValue.isHarmonized = 1;
      }
      else{
        this.selectedValue.isHarmonized = 0;
      }
    }
    this.previousValue = JSON.parse(JSON.stringify(this.selectedValue)) ;
    /*if (this.selectedValue?.marketId?.length > 1) {
      this.selectedValue.isHarmonized = 1;
    }*/
    
    var request: any = {};
   
    request.marketId = this.selectedValue.marketId?.join('|');
    request.categoryId = this.selectedValue.categoryId?.join('|');
    request.cube = this.selectedValue.cube;
    request.isHarmonized = this.selectedValue.isHarmonized == null ? false : this.selectedValue.isHarmonized;
    this.http.post<any>(document.location.origin + '/api/FilterPanel/GetCubeddlData', request, { headers: this.headers }).subscribe(data => {
      this.cubeddlData = data

      this.getDataForSelectionText();
      this.updateSelectedDDLByCubeData();
    });

  }
  updateCubeddlOnMarketChange(val: any) {
    if (val?.length == 0) {
      this.selectedValue.marketId = val;
      this.cubeddlData = null;
    }
    else {
      let mar = this.selectedValue;
      let value = val;
      if (mar?.marketId?.sort()?.toString() != value?.sort()?.toString()) {
        this.selectedValue.marketId = val;

        this.updateCategoryByMarketSelection();
        this.maketCatMovementByHarmonized();

        if (this.selectedValue?.categoryId?.length > 0 && this.selectedValue?.cube) {
          this.getCubeddlData();

        }
      }
    }
    let previousState = (this.previousValue?.marketId?.length > 1 || this.previousValue?.categoryId?.length > 1) ? "multi" : "single";
    let currentState = (this.selectedValue?.marketId?.length > 1 || this.selectedValue?.categoryId?.length > 1) ? "multi" : "single";
    console.log("previousState", previousState);
    console.log("currentState", currentState);
    if (previousState != currentState) {
      if (currentState == "multi") {
        this.selectedValue.isHarmonized = 1;
      }
      else {
        this.selectedValue.isHarmonized = 0;
      }
    }
    this.previousValue = JSON.parse(JSON.stringify(this.selectedValue));
  }
  updateCubeddlOnCategoryChange(val: any) {
    if (val?.length == 0) {
      this.selectedValue.categoryId = val;
      this.cubeddlData = null;
    }
    else {
      let cat = this.selectedValue;
      let value = val;
      if (cat?.categoryId?.sort()?.toString() != value?.sort()?.toString()) {
        this.selectedValue.categoryId = val;
        this.maketCatMovementByHarmonized();

        if (this.selectedValue?.marketId?.length > 0 && this.selectedValue?.cube) {
          this.getCubeddlData();

        }
      }
    }
    let previousState = (this.previousValue?.marketId?.length > 1 || this.previousValue?.categoryId?.length > 1) ? "multi" : "single";
    let currentState = (this.selectedValue?.marketId?.length > 1 || this.selectedValue?.categoryId?.length > 1) ? "multi" : "single";
    console.log("previousState", previousState);
    console.log("currentState", currentState);
    if (previousState != currentState) {
      if (currentState == "multi") {
        this.selectedValue.isHarmonized = 1;
      }
      else {
        this.selectedValue.isHarmonized = 0;
      }
    }
    this.previousValue = JSON.parse(JSON.stringify(this.selectedValue));
  }
  resetCubeForSegment() {
    if (this.selectedValue?.marketId?.length > 1 && this.selectedValue?.categoryId?.length > 1 && this.selectedValue?.cube == "Segment") {
      this.pivotComp.dragdropList = [
        [],
        [],
        []
      ];
      this.pivotComp.rowcount = null;
      this.pivotComp.columncount = null;     
      this.pivotComp.channelActive = false;
      this.pivotComp.demogActive = false;
      this.pivotComp.segmentActive = false;
    }
      
  }
  updateSelectedCubeddl(val) {
    switch (val) {
      case 'Demographics':

        this.selectedValue.Seg2Id = null;
        this.selectedValue.ChannelId = null;
        break;
      case 'Segment':
        this.selectedValue.ChannelId = null;
        this.selectedValue.DemographicId = null;
        break;
      case 'Channel':

        this.selectedValue.Seg2Id = null;
        this.selectedValue.DemographicId = null;
        break;
    }
  }
  updateSelectedDDLByCubeData() {
    let cubedata = this.cubeddlData
    if (this.selectedValue?.BrandId?.length > 0) {
      let ddldata: any = JSON.parse(cubedata.Brands);
      let brand = ddldata.filter((x: { OrderKey: any; CategoryID: any }) => this.selectedValue.BrandId?.includes(x.OrderKey + '|' + x.CategoryID));
      let brandid = [...new Set(brand.map((item: { OrderKey: any; CategoryID: any }) => item.OrderKey + '|' + item.CategoryID))];

      this.selectedValue.BrandId = this.selectedValue.BrandId?.filter((x: any) => brandid.includes(x));
    }
    if (this.selectedValue?.DemographicId?.length > 0) {
      let ddldata: any = JSON.parse(cubedata.Demographics);
      let demo = ddldata.filter((x: { DemographicId: any; }) => this.selectedValue.DemographicId?.includes(x.DemographicId));
      let demoid = [...new Set(demo.map((item: { DemographicId: any; }) => item.DemographicId))];

      this.selectedValue.DemographicId = this.selectedValue.DemographicId?.filter((x: any) => demoid.includes(x));
    }
    if (this.selectedValue?.KPIId?.length > 0) {
      let ddldata: any = JSON.parse(cubedata.KPI);
      let KPI = ddldata.filter((x: { METRICID: any; }) => this.selectedValue.KPIId?.includes(x.METRICID));
      let kpiid = [...new Set(KPI.map((item: { METRICID: any; }) => item.METRICID))];

      this.selectedValue.KPIId = this.selectedValue.KPIId?.filter((x: any) => kpiid.includes(x));
    }
    if (this.selectedValue?.Seg1Id?.length > 0) {
      let ddldata: any = JSON.parse(cubedata.Segment1);
      let seg1 = ddldata.filter((x: { OrderKey: any; CategoryID: any }) => this.selectedValue.Seg1Id?.includes(x.OrderKey + '|' + x.CategoryID));
      let segid = [...new Set(seg1.map((item: { OrderKey: any; CategoryID: any }) => item.OrderKey + '|' + item.CategoryID))];

      this.selectedValue.Seg1Id = this.selectedValue.Seg1Id?.filter((x: any) => segid.includes(x));
    }
    if (this.selectedValue?.Seg2Id?.length > 0) {
      let ddldata: any = JSON.parse(cubedata.Segment2);
      let seg2 = ddldata.filter((x: { OrderKey: any; CategoryID: any }) => this.selectedValue.Seg2Id?.includes(x.OrderKey + '|' + x.CategoryID));
      let segid = [...new Set(seg2.map((item: { OrderKey: any; CategoryID: any }) => item.OrderKey + '|' + item.CategoryID))];

      this.selectedValue.Seg2Id = this.selectedValue.Seg2Id?.filter((x: any) => segid.includes(x));
    }
    if (this.selectedValue?.TimePeriodId?.length > 0) {
      let ddldata: any = JSON.parse(cubedata.TimePeriod);
      let timeperiod = ddldata.filter((x: { TIMEPERIODID: any; }) => this.selectedValue.TimePeriodId?.includes(x.TIMEPERIODID));
      let tpid = [...new Set(timeperiod.map((item: { TIMEPERIODID: any; }) => item.TIMEPERIODID))];

      this.selectedValue.TimePeriodId = this.selectedValue.TimePeriodId?.filter((x: any) => tpid.includes(x));

    }
    if (this.selectedValue?.ChannelId?.length > 0) {
      let ddldata: any = JSON.parse(cubedata.Channel);
      let channel = ddldata.filter((x: { ChannelID: any; }) => this.selectedValue.ChannelId?.includes(x.ChannelID));
      let channelid = [...new Set(channel.map((item: { ChannelID: any; }) => item.ChannelID))];

      this.selectedValue.ChannelId = this.selectedValue.ChannelId?.filter((x: any) => channelid.includes(x));
    }

  }
  maketCatMovementByHarmonized() {

    if (this.selectedValue?.marketId?.length > 1 && this.selectedValue?.cube) {



      this.pivotComp.dragdropList[0] = this.pivotComp.dragdropList[0].filter(function (obj) {
        return obj.name !== 'Market';
      });
      if (this.pivotComp.dragdropList[1].filter(x => x.name == 'Market').length == 0 && this.pivotComp.dragdropList[2].filter(x => x.name == 'Market').length == 0) {
        this.pivotComp.dragdropList[1].unshift({ 'name': 'Market' });
      }


    }

    if (this.selectedValue?.categoryId?.length > 1 && this.selectedValue?.cube) {

      let drag0 = this.pivotComp.dragdropList[0];

      this.pivotComp.dragdropList[0] = drag0.filter(function (obj) {
        return obj.name !== 'Category';
      });

      if (this.pivotComp.dragdropList[1].filter(x => x.name == 'Category').length == 0 && this.pivotComp.dragdropList[2].filter(x => x.name == 'Category').length == 0) {
        this.pivotComp.dragdropList[2].unshift({ 'name': 'Category' });
      }

    }

    this.getRowColCount();
  }
  private getDemocheckeditem(itemarray: TreeviewItem[]) {
    let self = this;
    itemarray.forEach(e => {

      if (self.selectedValue?.DemographicId?.includes(e.value.value)) {
        e.checked = true;
      }
      else { e.checked = false; }
      if (e.children && e.children.length > 0) {
        this.getDemocheckeditem(e.children);
      }
    });

  }
  private getKPICheckeditem(itemarray: TreeviewItem[]) {
    let self = this;
    itemarray.forEach(e => {

      if (self.selectedValue?.KPIId?.includes(e.value.value)) {
        e.checked = true;
      }
      else { e.checked = false; }
      if (e.children && e.children.length > 0) {
        this.getKPICheckeditem(e.children);
      }
    });

  }
  private getSeg1IdCheckeditem(itemarray: TreeviewItem[]) {
    let self = this;
    itemarray.forEach(e => {

      if (self.selectedValue?.Seg1Id?.includes(e.value.value)) {
        e.checked = true;
      }
      else { e.checked = false; }
      if (e.children && e.children.length > 0) {
        this.getSeg1IdCheckeditem(e.children);
      }
    });

  }
  private getSeg2IdCheckeditem(itemarray: TreeviewItem[]) {
    let self = this;
    itemarray.forEach(e => {

      if (self.selectedValue?.Seg2Id?.includes(e.value.value)) {
        e.checked = true;
      }
      else { e.checked = false; }
      if (e.children && e.children.length > 0) {
        this.getSeg2IdCheckeditem(e.children);
      }
    });

  }
  private getChannelIdCheckeditem(itemarray: TreeviewItem[]) {
    let self = this;
    itemarray.forEach(e => {

      if (self.selectedValue?.ChannelId?.includes(e.value.value)) {
        e.checked = true;
      }
      else { e.checked = false; }
      if (e.children && e.children.length > 0) {
        this.getChannelIdCheckeditem(e.children);
      }
    });

  }
  ViewSelection() {
    var request: any = {};
    /*if (this.selectedValue?.marketId?.length > 1) {
      this.selectedValue.isHarmonized = 1;
    }*/
    request.marketId = this.selectedValue.marketId?.join('|');
    request.categoryId = this.selectedValue.categoryId?.join('|');
    request.cube = this.selectedValue.cube;
    request.isHarmonized = this.selectedValue.isHarmonized == null ? false : this.selectedValue.isHarmonized;
    this.http.post<any>(document.location.origin + '/api/FilterPanel/GetCubeddlData', request, { headers: this.headers }).subscribe(data => {
      this.cubeddlData = data

      var request: any = {};
      this.getDataForSelectionText();



      this.dataexplorerComp.selectionText = this.createOuterSelectionText();
      this.selectedValue.selectionText = this.dataexplorerComp.selectionText;
      let deepClone = JSON.stringify(this.selectedValue);
      this.dbselectedValue = JSON.parse(deepClone);
      this.selectedValue?.dropdownList?.forEach((e) => {

        this.dataexplorerComp.setDropdownData(e.name);
      });

      request.Name = 'DataExplorer';
      request.Selection = JSON.stringify(this.selectedValue);
      this.selectedValue.selectionTextExcel = this.selectionTextExcel;
      this.http.post<any>(document.location.origin + '/api/FilterPanel/GetDataByFilter', request, { headers: this.headers }).subscribe(data => {
        
        this.dataexplorerComp.tableData = this.getTableData(data);
        //this.dataexplorerComp.excelTableData = this.getExcelTableData(data);
        this.excelData = data;
        this.datatableComp.OutputData = this.dataexplorerComp.tableData;
        this.datatableComp.excelOutputData = this.dataexplorerComp.excelTableData;


        this.selectedValue = JSON.parse(data.Selection);
        let deepClone = JSON.stringify(this.selectedValue);
        this.dbselectedValue = JSON.parse(deepClone);

        this.dataexplorerComp.ddlList = this.selectedValue.dropdownList;
      });

    });

    //this.createOuterSelectionText();
  }
  downloadSelection(selectedValue:any){
    var request: any = {};
    request.Name = 'DataExplorer';
    request.IsSave='0';
      request.Selection = JSON.stringify(selectedValue);
      /*this.http.post<any>(document.location.origin + '/api/FilterPanel/GetDataByFilter', request, { headers: this.headers }).subscribe(data => {
       
        this.loader.show();
        window.setTimeout(()=>{
        let tableData = this.getExcelTableData(data);
        let OutputData = tableData;
        this.datatableComp.processExcelData(OutputData);
        this.loader.hide();
        },1000)
        
      });*/
      this.http.post<any>(document.location.origin + '/api/Crosstab/DownloadExcelDataSave', request, { headers: this.headers }).subscribe(data => {
       
        window.location.href=data;
        
      })
  }
  SaveSelection() {
    var request: any = {};



    this.selectedValue.selectionTextExcel = this.selectionTextExcel;
    this.setSelectionOfDropdownList();
    this.dataexplorerComp.selectionText = this.createOuterSelectionText();
    this.selectedValue.selectionText = this.dataexplorerComp.selectionText;
    let deepClone = JSON.stringify(this.selectedValue);
    this.dbselectedValue = JSON.parse(deepClone);
    this.selectedValue?.dropdownList?.forEach((e) => {

      this.dataexplorerComp.setDropdownData(e.name);
    });

    request.Name = 'DataExplorer';
    request.Selection = JSON.stringify(this.selectedValue);

    this.http.post<any>(document.location.origin + '/api/FilterPanel/GetDataByFilter', request, { headers: this.headers }).subscribe(data => {
      let datafromapi = data;
      console.log(datafromapi);
      this.dataexplorerComp.tableData = this.getTableData(data);
      this.excelData = data;
      //this.dataexplorerComp.excelTableData = this.getExcelTableData(data);
      
      if (this.dataexplorerComp.tableData.DataExOutputTable == null || this.dataexplorerComp.tableData.DataExOutputTable.length == 0) {

        
        this.datatableComp.OutputData = this.dataexplorerComp.tableData;

        this.selectedValue = JSON.parse(data.Selection);
        let deepClone = JSON.stringify(this.selectedValue);
        this.dbselectedValue = JSON.parse(deepClone);

        this.dataexplorerComp.ddlList = this.selectedValue.dropdownList;
        const modalRef = this.modalService.open(AlertComponent, { windowClass: "modal-content-alert" })
        modalRef.componentInstance.validationMessage = 'No Data available for the given selection, Please change your selection and try again.';

      }
    });

  }
  getDatbyOuterFilterSelection() {

    var request: any = {};
    this.selectedValue.selectionTextExcel = this.selectionTextExcel;
    request.Name = 'DataExplorer';
    request.Selection = JSON.stringify(this.selectedValue);

    let deepClone = JSON.stringify(this.selectedValue);
    this.dbselectedValue = JSON.parse(deepClone);
   
    this.http.post<any>(document.location.origin + '/api/FilterPanel/GetDataByFilter', request, { headers: this.headers }).subscribe(data => {


      this.dataexplorerComp.tableData = this.getTableData(data);
      //this.dataexplorerComp.excelTableData = this.getExcelTableData(data);
      this.excelData = data;
      this.datatableComp.OutputData = this.dataexplorerComp.tableData;
      this.datatableComp.excelOutputData = this.dataexplorerComp.excelTableData;
    });

  }
  getRowColCount() {

    let rowCount: number = 1;
    let colCount: number = 1;
    this.pivotComp.dragdropList[2]?.forEach(e => {
      rowCount = rowCount * this.getCountrc(e)
    });
    this.pivotComp.dragdropList[1]?.forEach(e => {
      colCount = colCount * this.getCountrc(e)
    });
    this.pivotComp.rowcount = this.pivotComp.dragdropList[2].length == 0?0:rowCount;
    this.pivotComp.columncount = this.pivotComp.dragdropList[1].length == 0 ? 0 :colCount;
  }


  getCountrc(e: any) {
    let i: number = 0;
    switch (e.name) {
      case ('Market'):

        (this.selectedValue?.marketId != undefined || this.selectedValue?.marketId != null) ? i = this.selectedValue?.marketId?.length : i = 1
        break;
      case ('Category'):
        (this.selectedValue?.categoryId != undefined || this.selectedValue?.categoryId != null) ? i = this.selectedValue?.categoryId?.length : i = 1
        break;
      case ('Brands'):
        (this.selectedValue?.BrandId != undefined || this.selectedValue?.BrandId != null) ? i = this.selectedValue?.BrandId?.length : i = 1
        break;
      case ('Demo'):

        (this.selectedValue?.DemographicId != undefined || this.selectedValue?.DemographicId != null) ? i = this.selectedValue?.DemographicId?.length : i = 1

        break;
      case ('KPI'):
        (this.selectedValue?.KPIId != undefined || this.selectedValue?.KPIId != null) ? i = this.selectedValue?.KPIId?.length : i = 1;

        break;
      case ('Segment Filter'):
        (this.selectedValue?.Seg1Id != undefined || this.selectedValue?.Seg1Id != null) ? i = this.selectedValue?.Seg1Id?.length : i = 1
        break;
      case ('Segment'):
        (this.selectedValue?.Seg2Id != undefined || this.selectedValue?.Seg2Id != null) ? i = this.selectedValue?.Seg2Id?.length : i = 1
        break;
      case ('Time Period'):
        (this.selectedValue?.TimePeriodId != undefined || this.selectedValue?.TimePeriodId != null) ? i = this.selectedValue?.TimePeriodId?.length : i =1
        break;
      case ('Channel'):
        (this.selectedValue?.ChannelId != undefined || this.selectedValue?.ChannelId != null) ? i = this.selectedValue?.ChannelId?.length : i = 1
        break;

    }

    return i;
  }

  resetDropdownListSelection(e: any) {
    switch (e.name) {

      case ('Brands'):
        this.selectedValue.BrandId = []
        break;
      case ('Demo'):

        this.selectedValue.DemographicId = []

        break;
      case ('KPI'):
        this.selectedValue.KPIId = []

        break;
      case ('Segment Filter'):
        this.selectedValue.Seg1Id = []
        break;
      case ('Segment'):
        this.selectedValue.Seg2Id = []
        break;
      case ('Time Period'):
        this.selectedValue.TimePeriodId = []
        break;
      case ('Channel'):
        this.selectedValue.ChannelId = []
        break;

    }
  }
  getDataExplorerData() {

    this.selectedValue.selectionTextExcel = this.selectionTextExcel;
    this.http.post<any>(document.location.origin + '/api/FilterPanel/GetDataExplorerData', { headers: this.headers }).subscribe(data => {

      let isSel = data.Selection;
      if (isSel != null) {
       
        this.selectedValue = JSON.parse(data.Selection);
        this.previousValue = JSON.parse(JSON.stringify(this.selectedValue));
        let deepClone = JSON.stringify(this.selectedValue);
        this.dbselectedValue = JSON.parse(deepClone);
        this.dataexplorerComp.selectionText = this.selectedValue.selectionText;
        this.dataexplorerComp.tableData = this.getTableData(data);
        //this.dataexplorerComp.excelTableData = this.getExcelTableData(data);
        this.excelData = data;
      }


        this.getselection().subscribe(data => {
          this.selectionData = data

          if (isSel != null) {
            this.getCubeddlDataInit();

          }

        });


      });

  }
  getCubeddlDataInit() {
    var request: any = {};
    /*if (this.selectedValue?.marketId?.length > 1) {
      this.selectedValue.isHarmonized = 1;
    }*/
    request.marketId = this.selectedValue.marketId?.join('|');
    request.categoryId = this.selectedValue.categoryId?.join('|');
    request.cube = this.selectedValue.cube;
    request.isHarmonized = this.selectedValue.isHarmonized == null ? false : this.selectedValue.isHarmonized;
    this.http.post<any>(document.location.origin + '/api/FilterPanel/GetCubeddlData', request, { headers: this.headers }).subscribe(data => {
      this.cubeddlData = data
      this.selectedValue?.dropdownList?.forEach((e) => {

        this.dataexplorerComp.setDropdownData(e.name);

      });
      this.getDataForSelectionText();
      this.createOuterSelectionText();
      this.dataexplorerComp.ddlList = this.selectedValue.dropdownList;
    });

  }
  getCubeddlDataPivotInit() {
    var request: any = {};
    /*if (this.selectedValue?.marketId?.length > 1) {
      this.selectedValue.isHarmonized = 1;
    }*/
    request.marketId = this.selectedValue.marketId?.join('|');
    request.categoryId = this.selectedValue.categoryId?.join('|');
    request.cube = this.selectedValue.cube;
    request.isHarmonized = this.selectedValue.isHarmonized == null ? false : this.selectedValue.isHarmonized;
    this.http.post<any>(document.location.origin + '/api/FilterPanel/GetCubeddlData', request, { headers: this.headers }).subscribe(data => {
      this.cubeddlData = data
      this.updateSelectedDDLByCubeData();
      this.getDataForSelectionText();

    });

  }
  getDataForSelectionText() {
    let arr = ['Market', 'Category', 'KPI', 'Demo', 'Brands', 'Time Period', 'Segment Filter', 'Segment', 'Channel']
    arr.forEach(x => {
      if (x == 'Market' && this.selectedValue?.marketId?.length > 0) {
        this.getMarketdata();
      }
      if (x == 'Category' && this.selectedValue?.categoryId?.length > 0) {
        this.getCategorydata();
      }
      if (x == 'Brands' && this.selectedValue?.BrandId?.length > 0) {
        this.getBranddata();
      }
      if (x == 'Demo' && this.selectedValue?.DemographicId?.length > 0) {
        this.getDemodata();
      }
      if (x == 'KPI' && this.selectedValue?.KPIId?.length > 0) {
        this.getKPIdata();
      }
      if (x == 'Segment Filter' && this.selectedValue?.Seg1Id?.length > 0) {
        this.getSegmentdata(1);
      }
      if (x == 'Segment' && this.selectedValue?.Seg2Id?.length > 0) {
        this.getSegmentdata(2);
      }
      if (x == 'Time Period' && this.selectedValue?.TimePeriodId?.length > 0) {
        this.getTimePerioddata();
      }
      if (x == 'Channel' && this.selectedValue?.ChannelId?.length > 0) {
        this.getChanneldata();
      }


    });
  }
  createOuterSelectionText() {
    
    
    let arr = ['Market', 'Category', 'KPI', 'Demo', 'Brands', 'Time Period', 'Segment Filter', 'Segment', 'Channel']
    let marketSel;
    let categorySel;
    let brandSel;
    let demoSel;
    let kpiSel;
    let seg1Sel;
    let seg2Sel;
    let channnelSel;
    let tpSel;
      arr.forEach(x => {
        if (x == 'Market' && this.selectedValue?.marketId?.length == 1) {
          console.log("selected value", this.selectedValue);
          this.marketddlItem.forEach(x => {
            let arr = this.searchTree(x, this.selectedValue.marketId[0]);
            if (arr != undefined) {
              marketSel = arr

            }


          });
        }
        else if (x == 'Market' && this.selectedValue?.marketId?.length > 1) {
          marketSel = 'Multi Market';

        }
        if (x == 'Category' && this.selectedValue?.categoryId?.length == 1) {
          this.categoryIddlItem.forEach(x => {
            let arr = this.searchTree(x, this.selectedValue.categoryId[0]);
            if (arr != undefined) {
              categorySel = arr

            }

          });

        }
        else if (x == 'Category' && this.selectedValue?.categoryId?.length > 1) {
          categorySel = 'Multi Category'
        }
        if (x == 'Brands' && this.selectedValue?.BrandId?.length == 1) {
        this.brandddlItem.forEach(x => {
          let arr = this.searchTree(x, this.selectedValue.BrandId[0]);
        
          if (arr != undefined) {
            brandSel = arr
            this.brandtext = brandSel;
          }

        });
        }
        else if (x == 'Brands' && this.selectedValue?.BrandId?.length > 1) {
        console.log("brand id",this.selectedValue?.BrandId);
          //console.log("brands_:", JSON.parse(this.cubeddlData.brands));
          console.log("selection_:", this.selectedValue);
          console.log("selection_:cate", this.categoryIddlItem);
          console.log("selection_:brand", this.brandddlItem);
          brandSel = 'Multi Brands'

        }
        if (x == 'Demo' && this.selectedValue?.DemographicId?.length == 1) {
        this.demoddlItem.forEach(x => {
          let arr = this.searchTree(x, this.selectedValue.DemographicId[0]);
          if (arr != undefined) {
            demoSel = arr
            this.demotext = demoSel;
          }

        });
        }
        else if (x == 'Demo' && this.selectedValue?.DemographicId?.length > 1) {
        demoSel = 'Multi Demo';
        }
      if (x == 'KPI' && this.selectedValue?.KPIId?.length == 1) {
        this.kpiddlItem.forEach(x => {
          let arr = this.searchTree(x, this.selectedValue.KPIId[0],'KPI');
          if (arr != undefined) {
            kpiSel = arr


          }

        });
        }
      else if (x == 'KPI' && this.selectedValue?.KPIId?.length > 1) {

        kpiSel = 'Multi KPI';

      }
        if (x == 'Segment Filter' && this.selectedValue?.Seg1Id?.length == 1) {
        this.seg1ddlItem.forEach(x => {
          let arr = this.searchTree(x, this.selectedValue.Seg1Id[0]);
          if (arr != undefined) {
            seg1Sel = arr
            this.seg1text = seg1Sel;
          }

        });
        }
        else if (x == 'Segment Filter' && this.selectedValue?.Seg1Id?.length > 1) {
          seg1Sel ='Multi Segment Filter'
      }
        if (x == 'Segment' && this.selectedValue?.Seg2Id?.length == 1) {
          this.seg2ddlItem.forEach(x => {
            let arr = this.searchTree(x, this.selectedValue.Seg2Id[0]);
            if (arr != undefined) {
              seg2Sel = arr
              this.seg2text = seg2Sel;
            }

          });
        }
        else if (x == 'Segment' && this.selectedValue?.Seg2Id?.length > 1) {
          seg2Sel = 'Multi Segment'
        }
      if (x == 'Time Period' && this.selectedValue?.TimePeriodId?.length == 1) {
        this.timeperiodddleItem.forEach(x => {
          let arr = this.findParents(x, this.selectedValue?.TimePeriodId[0]);
          if (arr != undefined) {
            arr.unshift(x.text);
            tpSel = arr.join('-');
            this.tptext = arr[arr.length - 1];
          }

        });
        }
        else if (x == 'Time Period' && this.selectedValue?.TimePeriodId?.length > 1) {
        tpSel = 'Multi Time Period';
        }
      if (x == 'Channel' && this.selectedValue?.ChannelId?.length ==1) {
        this.channelddlItem.forEach(x => {
          let arr = this.searchTree(x, this.selectedValue.ChannelId[0]);
          if (arr != undefined) {
            channnelSel = arr
            this.chtext = channnelSel;
          }

        });
        }
      else if (x == 'Channel' && this.selectedValue?.ChannelId?.length > 1) {
        channnelSel ='Multi Channel'
      }


    });

    let columnText:string[]=[];
    this.selectedValue.columnList.forEach(x => {
      columnText.push(x.name);
    });;
    let rowText: string[] = [];
    this.selectedValue.rowList.forEach(x => {
      rowText.push(x.name);
    });;
    let selectText: string[]=[];
    selectText.push(columnText.join(' '));
    selectText.push(rowText.join(' '));
    selectText.push(this.selectedValue.cube);
    selectText.push(marketSel);
    selectText.push(categorySel);
    if (tpSel !=null)
      selectText.push(tpSel)
    if (brandSel != null)
      selectText.push(brandSel)
    if (seg1Sel != null)
      selectText.push(seg1Sel)
    if (seg2Sel != null)
      selectText.push(seg2Sel)
    if (kpiSel != null)
      selectText.push(kpiSel)
    if (demoSel != null)
      selectText.push(demoSel)
    if (channnelSel != null)
      selectText.push(channnelSel)
    this.selectionTextExcel = this.selectionTextForExportToExcel();
    console.log(this.selectionTextExcel);
    return selectText.join(' || ');
  }
  selectionTextForExportToExcel() {
    let arr = ['Market', 'Category', 'KPI', 'Demo', 'Brands', 'Time Period', 'Segment Filter', 'Segment', 'Channel']
    let marketSel;
    let categorySel;
    let brandSel;
    let demoSel;
    let kpiiSel;
    let seg1Sel;
    let seg2Sel;
    let channnelSel;
    let tpSel;
      arr.forEach(x => {
        if (x == 'Market' && this.selectedValue?.marketId?.length == 1) {
          this.marketddlItem.forEach(x => {
            let arr = this.searchTree(x, this.selectedValue.marketId[0]);
            if (arr != undefined) {
              marketSel = arr

            }


          });
        }
        else if (x == 'Market' && this.selectedValue?.marketId?.length > 1) {
          marketSel = 'Multiple Market';

        }
        if (x == 'Category' && this.selectedValue?.categoryId?.length == 1) {
          this.categoryIddlItem.forEach(x => {
            let arr = this.searchTree(x, this.selectedValue.categoryId[0]);
            if (arr != undefined) {
              categorySel = arr

            }

          });

        }
        else if (x == 'Category' && this.selectedValue?.categoryId?.length > 1) {
          categorySel = 'Multiple category\'s'
        }
        if (x == 'Brands' && this.selectedValue?.BrandId?.length == 1) {
      
          let Categoryname;
        this.brandddlItem.forEach(x => {
          let arr = this.searchTree(x, this.selectedValue.BrandId[0]);
          if (arr != undefined) {
            brandSel = arr
            this.brandtext = brandSel;
          }
        });
          if (this.selectedValue.isHarmonized == 0) {
            var brandId: string = this.selectedValue.BrandId[0];
            let CategoryID = brandId.split('|');
            this.categoryIddlItem.forEach(x => {
              let temp = this.searchTree(x, CategoryID[1]);
              if (temp != undefined) {
                Categoryname = temp;
              }
            });
            brandSel = brandSel + "(" + Categoryname + ")";
          }

        }
        else if (x == 'Brands' && this.selectedValue?.BrandId?.length > 1) {
        let total_brands;
        let Categoryname;
        for (let i = 0; i < this.selectedValue?.BrandId?.length; i++) {

          this.brandddlItem.forEach(x => {
            let arr = this.searchTree(x, this.selectedValue.BrandId[i]);
            if (total_brands == undefined) {
              total_brands = arr;
            }
            else {
              if (arr != undefined) {
                total_brands = total_brands + "," + arr;
              }
            }
          });
          if (this.selectedValue.isHarmonized == 0) {
            var brandId: string = this.selectedValue.BrandId[i];
            let CategoryID = brandId.split('|');
            console.log("CategoryId", CategoryID[1]);
            this.categoryIddlItem.forEach(x => {
              let temp = this.searchTree(x, CategoryID[1]);
              if (temp != undefined) {
                Categoryname = temp
                console.log("catname:-", Categoryname);
              }
            });
            total_brands = total_brands + "(" + Categoryname + ")";
          }
        }
        console.log("multi_brand", total_brands);
        brandSel = total_brands;
      /*    brandSel ='Multiple Brands'*/
        }
        if (x == 'Demo' && this.selectedValue?.DemographicId?.length == 1) {
        this.demoddlItem.forEach(x => {
          let arr = this.searchTree(x, this.selectedValue.DemographicId[0]);
          if (arr != undefined) {
            demoSel = arr
            this.demotext = demoSel;
          }

        });
        }
        else if (x == 'Demo' && this.selectedValue?.DemographicId?.length > 1) {
        demoSel = 'Multi Demo';
        }
      if (x == 'KPI' && this.selectedValue?.KPIId?.length == 1) {
        this.kpiddlItem.forEach(x => {
          let arr = this.searchTree(x, this.selectedValue.KPIId[0],'KPI');
          if (arr != undefined) {
            
            kpiiSel = arr


          }

        });
        }
      else if (x == 'KPI' && this.selectedValue?.KPIId?.length > 1) {

        kpiiSel = 'Multiple KPI';

      }
        if (x == 'Segment Filter' && this.selectedValue?.Seg1Id?.length == 1) {
          let Categoryname;
        this.seg1ddlItem.forEach(x => {
          let arr = this.searchTree(x, this.selectedValue.Seg1Id[0]);
          if (arr != undefined) {
            seg1Sel = arr
            this.seg1text = seg1Sel;
          }
        });
          var seg1Id: string = this.selectedValue.Seg1Id[0];
          let CategoryID = seg1Id.split('|');
          this.categoryIddlItem.forEach(x => {
            let temp = this.searchTree(x, CategoryID[1]);
            if (temp != undefined) {
              Categoryname = temp;
            }
          });
          if (Categoryname != undefined) {
            seg1Sel = seg1Sel + "(" + Categoryname + ")";
          }
        }
        else if (x == 'Segment Filter' && this.selectedValue?.Seg1Id?.length > 1) {
        let Segment1_Text;
        let Categoryname;
        for (let i = 0; i < this.selectedValue?.Seg1Id?.length; i++) {
          this.seg1ddlItem.forEach(x => {
            let arr = this.searchTree(x, this.selectedValue.Seg1Id[i]);
            if (Segment1_Text == undefined) {
              Segment1_Text = arr;
            }
            else {
              if (arr != undefined) {
                Segment1_Text = Segment1_Text + "," + arr;
              }
            }
          });
       /*   if (this.selectedValue.isHarmonized == 0) {*/
          var seg1Id: string = this.selectedValue.Seg1Id[i];
          let CategoryID = seg1Id.split('|');
            this.categoryIddlItem.forEach(x => {
              let temp = this.searchTree(x, CategoryID[1]);
              if (temp != undefined) {
                Categoryname = temp
              }
            });
          if (Categoryname != undefined) {
            Segment1_Text = Segment1_Text + "(" + Categoryname + ")";
          }
       /*   }*/
        }
        console.log("Segment1_Text", Segment1_Text);
          seg1Sel = Segment1_Text;
     /*   seg1Sel='Multi Segment 1'*/
      }
        if (x == 'Segment' && this.selectedValue?.Seg2Id?.length == 1) {
          let Categoryname;
          this.seg2ddlItem.forEach(x => {
            let arr = this.searchTree(x, this.selectedValue.Seg2Id[0]);
            if (arr != undefined) {
              seg2Sel = arr
              this.seg2text = seg2Sel;
            }

          });
          var seg2Id: string = this.selectedValue.Seg2Id[0];
          let CategoryID = seg2Id.split('|');
          this.categoryIddlItem.forEach(x => {
            let temp = this.searchTree(x, CategoryID[1]);
            if (temp != undefined) {
              Categoryname = temp
            }
          });
          if (Categoryname != undefined) {
            seg2Sel = seg2Sel + "(" + Categoryname + ")";
          }
        }
        else if (x == 'Segment' && this.selectedValue?.Seg2Id?.length > 1) {
          let Segment2_Text;
          let Categoryname;
          for (let i = 0; i < this.selectedValue?.Seg2Id?.length; i++) {
            this.seg2ddlItem.forEach(x => {
              let arr = this.searchTree(x, this.selectedValue.Seg2Id[i]);
              if (Segment2_Text == undefined) {
                Segment2_Text = arr;
              }
              else {
                if (arr != undefined) {
                  Segment2_Text = Segment2_Text + "," + arr;
                }
              }
            });
            /*   if (this.selectedValue.isHarmonized == 0) {*/
            var seg2Id: string = this.selectedValue.Seg2Id[i];
            let CategoryID = seg2Id.split('|');
            this.categoryIddlItem.forEach(x => {
              let temp = this.searchTree(x, CategoryID[1]);
              if (temp != undefined) {
                Categoryname = temp;
              }
            });

            if (Categoryname != undefined) {
              Segment2_Text = Segment2_Text + "(" + Categoryname + ")";
            }
          }
        
          seg2Sel = Segment2_Text;

         /* seg2Sel = 'Multi Segment 2'*/
        }
      if (x == 'Time Period' && this.selectedValue?.TimePeriodId?.length == 1) {
        this.timeperiodddleItem.forEach(x => {
          let arr = this.findParents(x, this.selectedValue?.TimePeriodId[0]);
          if (arr != undefined) {
            arr.unshift(x.text);
            tpSel = arr.join('-');
            this.tptext = arr[arr.length - 1];
          }

        });
        }
        else if (x == 'Time Period' && this.selectedValue?.TimePeriodId?.length > 1) {
        tpSel = 'Multiple Time Period';
        }
      if (x == 'Channel' && this.selectedValue?.ChannelId?.length ==1) {
        this.channelddlItem.forEach(x => {
          let arr = this.searchTree(x, this.selectedValue.ChannelId[0]);
          if (arr != undefined) {
            channnelSel = arr
            this.chtext = channnelSel;
          }

        });
        }
      else if (x == 'Channel' && this.selectedValue?.ChannelId?.length > 1) {
        channnelSel ='Multi Channel'
      }


    });

    let columnText:string[]=[];
    this.selectedValue.columnList.forEach(x => {
      columnText.push(x.name);
    });;
    let rowText: string[] = [];
    this.selectedValue.rowList.forEach(x => {
      rowText.push(x.name);
    });;
    let selectText: string[]=[];
    selectText.push("Column : "+columnText.join(' - '));
    selectText.push("Row : "+rowText.join(' - '));
    selectText.push("Market : "+marketSel);
    selectText.push("Category : "+categorySel);
    if (tpSel != null) {
      selectText.push("Time Period : " + tpSel)
    }
    //else{
    //  selectText.push("Time Period : Total")
    //}
    if (brandSel != null) {
      selectText.push("Brand/s : " + brandSel)
    }
    //else{
    //  selectText.push("Brand/s : Total")
    //}
    let segText = ""
    if (seg1Sel != null) {
      segText = seg1Sel
    }
    //else{
    //  segText = "Total"
    //}
    if (seg2Sel != null) {
      segText += " | " + seg2Sel
    }
    //else{
    //  segText += " | "+"Total"
    //}
    selectText.push("Segment : "+segText)
    if (kpiiSel != null) {
      selectText.push("KPI : " + kpiiSel)
    }
    //else{
    //  selectText.push("KPI : Total")
    //}
    if (demoSel != null) {
      selectText.push("Demographics : " + demoSel)
    }
    //else{
    //  selectText.push("Demographics : Total Demographics")
    //}
    if (channnelSel != null) {
      selectText.push("Channel : " + channnelSel)
    }
    return selectText.join('||');
  }
  private findParents(node, id) {

    // If current node name matches the search name, return
    // empty array which is the beginning of our parent result

    if (node?.value.value == id) {
      return []
    }

    // Otherwise, if this node has a tree field/value, recursively
    // process the nodes in this tree array
    if (Array.isArray(node?.children)) {

      for (var treeNode of node.children) {

        // Recursively process treeNode. If an array result is
        // returned, then add the treeNode.name to that result
        // and return recursively
        const childResult = this.findParents(treeNode, id)

        if (Array.isArray(childResult)) {

          return [treeNode.text].concat(childResult);
        }

      }

    }
  }
  getExcelData(): Observable<any>{
    /*let data = this.getExcelTableData(this.excelData);
    let excelDataVal = this.datatableComp.getExcelDataNew(data);
    this.selectedValue.selectionTextExcel = this.selectionTextExcel;
    excelDataVal.Selection = this.selectionTextExcel;
    console.log(excelDataVal);
    console.log(this.selectedValue.selectionTextExcel);*/
    let excelObj = this.excelData;
    excelObj.selectionTextExcel = this.selectionTextExcel;
    return this.http.post<any>(document.location.origin + '/api/CrossTab/ExportToExcelDataExplorerNew',{"selectionTextExcel":this.selectionTextExcel}, { headers: this.headers });
  }
  getExcelDataDownload(request:DataExplorerTableDetails): Observable<any>{
    this.selectedValue.selectionTextExcel = this.selectionTextExcel;
    //request.Selection = this.selectionTextExcel;
    console.log(this.selectedValue.selectionTextExcel);
    return this.http.post<any>(document.location.origin + '/api/CrossTab/ExportToExcelDataExplorer',request, { headers: this.headers });
  }
  getTableData(tbdata):DataExplorerTable{
   
    let result = tbdata;
  let data=new DataExplorerTable();
  data.Selection=result.Selection;
  data.selectionTextExcel = result.selectionTextExcel;
  data.SupressZero = result.SupressZero;
  let rowLevel:LevelInfo[]=[];
  let colLevel:LevelInfo[]=[];
  let tableData:DataExplorerTableData[]=[];
  result.DataExOutputTable.forEach(e=>{
    let tableRowData = new DataExplorerTableData()
    tableRowData.Brand=e.Brand;
    tableRowData.Category=e.Category;
    tableRowData.Channel=e.Channel;
    tableRowData.DEMO=e.DEMO;
    tableRowData.Id = e.Id;
    tableRowData.KPI=e.KPI;
    tableRowData.Market = e.Market;
    tableRowData.MetricValue = e.MetricValue;
    tableRowData.Segment1=e.Segment1;
    tableRowData.Segment2=e.Segment2;
    tableRowData.TimePeriod=e.TimePeriod;
    tableRowData.Level_Brand= e.Level_Brand;
    tableRowData.Level_Channel = e.Level_Channel;
    tableRowData.Level_DEMO= e.Level_DEMO;
    tableRowData.Level_Segment1= e.Level_Segment1;
    tableRowData.Level_Segment2= e.Level_Segment2;
    tableRowData.RawBuyers = e.RawBuyers;
    tableData.push(tableRowData);
  })
  data.DataExOutputTable=tableData;
  result.RowList.forEach(e=>{
    let TableRow = new LevelInfo();
    TableRow.LevelId = e.LevelId;
    TableRow.LevelName=e.LevelName;
    TableRow.DistinctValues = _.uniq(_.map(data.DataExOutputTable,TableRow.LevelName));
    let levelName:string = e.LevelName;
    let levelKey:string = ("Level_"+levelName);
    if(["Brand","Channel","Demo","Segment1","Segment2"].indexOf(e.LevelName)!=-1)
    {
      let a= _.uniqWith(_.map(data.DataExOutputTable,(f)=>{return {levelName:f[levelName],levelKey:f[levelKey]}}),_.isEqual);
      TableRow.DistinctLevelValues = _.map(a, (f) => { return "  ".repeat(f.levelKey) + (f.levelKey >= 1 ? "" : "") + f.levelName });
      console.log("distinctvalue", TableRow.DistinctLevelValues);
    }
    else{
      TableRow.DistinctLevelValues = TableRow.DistinctValues;
    }
    rowLevel.push(TableRow);
  })
  result.ColumnList.forEach(e=>{
    let TableRow = new LevelInfo();
    TableRow.LevelId = e.LevelId;
    TableRow.LevelName=e.LevelName;
    TableRow.DistinctValues = _.uniq(_.map(data.DataExOutputTable,TableRow.LevelName));
    TableRow.DistinctLevelValues = TableRow.DistinctValues;
    colLevel.push(TableRow);
  })
    //new 
    let maxCount = 60;
    let mulRowsCount = 1;
    for (let i = colLevel.length - 1; i >= 0; i--) {
      let maxCountConsidered = Math.floor(maxCount / mulRowsCount);
      if (colLevel[i].DistinctValues.length > maxCountConsidered) {
        colLevel[i].DistinctValues.splice(maxCountConsidered, colLevel[i].DistinctValues.length - maxCountConsidered);
        colLevel[i].DistinctLevelValues.splice(maxCountConsidered, colLevel[i].DistinctLevelValues.length - maxCountConsidered);
        mulRowsCount *= maxCountConsidered;
      }
      else {
        mulRowsCount *= colLevel[i].DistinctValues.length;
      }
    }
    mulRowsCount = 1;
    for (let i = rowLevel.length - 1; i >= 0; i--) {
      let maxCountConsidered = Math.floor(maxCount / mulRowsCount);
      if (rowLevel[i].DistinctValues.length > maxCountConsidered) {
        rowLevel[i].DistinctValues.splice(maxCountConsidered, rowLevel[i].DistinctValues.length - maxCountConsidered);
        rowLevel[i].DistinctLevelValues.splice(maxCountConsidered, rowLevel[i].DistinctLevelValues.length - maxCountConsidered);
        mulRowsCount *= maxCountConsidered;
      }
      else {
        mulRowsCount *= rowLevel[i].DistinctValues.length;
      }
    }

  let repeatTimes=1;
  for(let i=0;i<colLevel.length;i++){
    colLevel[i].RepeatTimes=repeatTimes;
    repeatTimes = repeatTimes*colLevel[i].DistinctValues.length;
  }
  repeatTimes=1;
  for(let i=0;i<rowLevel.length;i++){
    rowLevel[i].RepeatTimes=repeatTimes;
    repeatTimes = repeatTimes*rowLevel[i].DistinctValues.length;
  }
  let widthCount=1;
  for(let i=colLevel.length-1;i>=0;i--){
    colLevel[i].WidthTimes=widthCount;
    widthCount = widthCount*colLevel[i].DistinctValues.length;
  }
  widthCount=1;
  for(let i=rowLevel.length-1;i>=0;i--){
    rowLevel[i].WidthTimes=widthCount;
    widthCount = widthCount*rowLevel[i].DistinctValues.length;
  }
  for(let i=0;i<colLevel.length;i++){
    colLevel[i].Values=[];
    for(let j=1;j<=colLevel[i].RepeatTimes;j++){
      for(let k=0;k<colLevel[i].DistinctValues.length;k++){
        for(let l=1;l<=colLevel[i].WidthTimes;l++){
          colLevel[i].Values.push(colLevel[i].DistinctValues[k]);
        }
      }
    }
  }
  for(let i=0;i<rowLevel.length;i++){
    rowLevel[i].Values=[];
    for(let j=1;j<=rowLevel[i].RepeatTimes;j++){
      for(let k=0;k<rowLevel[i].DistinctValues.length;k++){
        for(let l=1;l<=rowLevel[i].WidthTimes;l++){
          rowLevel[i].Values.push(rowLevel[i].DistinctValues[k]);
        }
      }
    }
  }
  let tableNewData:DataExplorerTableData[]=[];
  let filteredData = data.DataExOutputTable;
  for(let i=0;i<rowLevel.length;i++){
    
    filteredData = filteredData.filter(a=>rowLevel[i].DistinctValues.indexOf(a[rowLevel[i].LevelName])!=-1 )
  }
  for(let i=0;i<colLevel.length;i++){
    
    filteredData = filteredData.filter(a=>colLevel[i].DistinctValues.indexOf(a[colLevel[i].LevelName])!=-1 )
  }
  data.RowList=rowLevel;
  data.ColumnList=colLevel;
  data.DataExOutputTable = filteredData;

  /*let t:DataExplorerTableDetails = new DataExplorerTableDetails();
  t.DataExOutputTable = data.DataExOutputTable;
    this.getExcelData(t).subscribe(e=>{
      console.log(e)
    })*/
  
  return data;
  }
  getExcelTableData(tbdata): DataExplorerTable {
    console.log("table_data_new",tbdata);
    let result = tbdata;
    let data = new DataExplorerTable();
    data.Selection = result.Selection;
    data.selectionTextExcel = result.selectionTextExcel;
    data.SupressZero = result.SupressZero;
    let rowLevel: LevelInfo[] = [];
    let colLevel: LevelInfo[] = [];
    let tableData: DataExplorerTableData[] = [];
    result.DataExOutputTable.forEach(e => {
      let tableRowData = new DataExplorerTableData()
      tableRowData.Brand = e.Brand;
      tableRowData.Category = e.Category;
      tableRowData.Channel = e.Channel;
      tableRowData.DEMO = e.DEMO;
      tableRowData.Id = e.Id;
      tableRowData.KPI = e.KPI;
      tableRowData.Market = e.Market;
      tableRowData.MetricValue = e.MetricValue;
      tableRowData.Segment1 = e.Segment1;
      tableRowData.Segment2 = e.Segment2;
      tableRowData.TimePeriod = e.TimePeriod;
      tableRowData.Level_Brand = e.Level_Brand;
      tableRowData.Level_Channel = e.Level_Channel;
      tableRowData.Level_DEMO = e.Level_DEMO;
      tableRowData.Level_Segment1 = e.Level_Segment1;
      tableRowData.Level_Segment2 = e.Level_Segment2;
      tableRowData.RawBuyers = e.RawBuyers;
      tableData.push(tableRowData);
    })
    data.DataExOutputTable = tableData;
    result.RowList.forEach(e => {
      let TableRow = new LevelInfo();
      TableRow.LevelId = e.LevelId;
      TableRow.LevelName = e.LevelName;
      TableRow.DistinctValues = _.uniq(_.map(data.DataExOutputTable, TableRow.LevelName));
      let levelName: string = e.LevelName;
      let levelKey: string = ("Level_" + levelName);
      if (["Brand", "Channel", "Demo", "Segment1", "Segment2"].indexOf(e.LevelName) != -1) {
        let a = _.uniqWith(_.map(data.DataExOutputTable, (f) => { return { levelName: f[levelName], levelKey: f[levelKey] } }), _.isEqual);
        TableRow.DistinctLevelValues = _.map(a, (f) => { return "  ".repeat(f.levelKey) + (f.levelKey >= 1 ? "| " : "") + f.levelName });
      }
      else {
        TableRow.DistinctLevelValues = TableRow.DistinctValues;
      }
      rowLevel.push(TableRow);
    })
    result.ColumnList.forEach(e => {
      let TableRow = new LevelInfo();
      TableRow.LevelId = e.LevelId;
      TableRow.LevelName = e.LevelName;
      TableRow.DistinctValues = _.uniq(_.map(data.DataExOutputTable, TableRow.LevelName));
      TableRow.DistinctLevelValues = TableRow.DistinctValues;
      colLevel.push(TableRow);
    })
    let repeatTimes = 1;
    for (let i = 0; i < colLevel.length; i++) {
      colLevel[i].RepeatTimes = repeatTimes;
      repeatTimes = repeatTimes * colLevel[i].DistinctValues.length;
    }
    repeatTimes = 1;
    for (let i = 0; i < rowLevel.length; i++) {
      rowLevel[i].RepeatTimes = repeatTimes;
      repeatTimes = repeatTimes * rowLevel[i].DistinctValues.length;
    }
    let widthCount = 1;
    for (let i = colLevel.length - 1; i >= 0; i--) {
      colLevel[i].WidthTimes = widthCount;
      widthCount = widthCount * colLevel[i].DistinctValues.length;
    }
    widthCount = 1;
    for (let i = rowLevel.length - 1; i >= 0; i--) {
      rowLevel[i].WidthTimes = widthCount;
      widthCount = widthCount * rowLevel[i].DistinctValues.length;
    }
    for (let i = 0; i < colLevel.length; i++) {
      colLevel[i].Values = [];
      for (let j = 1; j <= colLevel[i].RepeatTimes; j++) {
        for (let k = 0; k < colLevel[i].DistinctValues.length; k++) {
          for (let l = 1; l <= colLevel[i].WidthTimes; l++) {
            colLevel[i].Values.push(colLevel[i].DistinctValues[k]);
          }
        }
      }
    }
    for (let i = 0; i < rowLevel.length; i++) {
      rowLevel[i].Values = [];
      for (let j = 1; j <= rowLevel[i].RepeatTimes; j++) {
        for (let k = 0; k < rowLevel[i].DistinctValues.length; k++) {
          for (let l = 1; l <= rowLevel[i].WidthTimes; l++) {
            rowLevel[i].Values.push(rowLevel[i].DistinctValues[k]);
          }
        }
      }
    }
    data.RowList = rowLevel;
    data.ColumnList = colLevel;

    /*let t:DataExplorerTableDetails = new DataExplorerTableDetails();
    t.DataExOutputTable = data.DataExOutputTable;
      this.getExcelData(t).subscribe(e=>{
        console.log(e)
      })*/
    console.log("Data returned", data);
    return data;
  }
  private searchTree(element, id, ddltype = '') {
   
    if (element.value.value == id) {
      if (ddltype == 'KPI') {
        this.kpitext = element.text;
        return element.value.outputName;
      }
      else { return element.text;}

  } else if (element.children != null) {
    var i;
    var result = null;
    for (i = 0; result == null && i < element.children.length; i++) {
      result = this.searchTree(element.children[i], id, ddltype);
    }
    return result;
  }
  return null;
  }
  private searchFirtSelectableItemTree(element) {
    if (element.value.IsSelectable == true) {
      return element.value.value;

    } else if (element.children != null) {
      var i;
      var result = null;
      for (i = 0; result == null && i < element.children.length; i++) {
        result = this.searchFirtSelectableItemTree(element.children[i]);
      }
      return result;
    }
    return null;
  }

  setSelectionOfDropdownList() {

    this.selectedValue.dropdownList?.forEach(e => {
      switch (e.name) {
        case ('Brands'):
          //this.selectedValue.BrandId = this.brandddlItem.filter(x => x.value.IsSelectable == 1)[0].value.value
          let brandVal = false;
          this.getBranddata();
          this.brandddlItem?.forEach(x => {
            if (brandVal == false) {
              let arr = this.searchFirtSelectableItemTree(x);
              if (arr != undefined || arr != null) {

                this.selectedValue.BrandId = [];
                this.selectedValue.BrandId.push(arr);
                brandVal = true;
                return false;
              }
            }
          });
          break;
        case ('Demo'):

         // this.selectedValue.DemographicId = this.values;
          let demoVal = false;
          this.getDemodata();
          this.demoddlItem?.forEach(x => {
            if (demoVal == false) {
              let arr = this.searchFirtSelectableItemTree(x);
              if (arr != undefined || arr != null) {

                this.selectedValue.DemographicId = [];
                this.selectedValue.DemographicId.push(arr);
                demoVal = true;
                return false;
              }
            }
          });
          break;


        case ('KPI'):
          let kpival = false;
          this.getKPIdata();
          this.kpiddlItem?.forEach(x => {
            if (kpival == false) {
              let arr = this.searchFirtSelectableItemTree(x);
              if (arr != undefined || arr != null) {

                this.selectedValue.KPIId = [];
                this.selectedValue.KPIId.push(arr);
                kpival = true;
                return false;
              }
            }
          });


          break;
        case ('Segment Filter'):
          //this.dataexplorerService.selectedValue.Seg1Id = this.values;
          let seg1Val = false;
          this.getSegmentdata(1);
          this.seg1ddlItem?.forEach(x => {
            if (seg1Val == false) {
              let arr = this.searchFirtSelectableItemTree(x);
              if (arr != undefined || arr != null) {

                this.selectedValue.Seg1Id = [];
                this.selectedValue.Seg1Id.push(arr);
                seg1Val = true;
                return false;
              }
            }
          });
          break;
        case ('Segment'):
          let seg2Val = false;
          this.getSegmentdata(2);
          this.seg2ddlItem?.forEach(x => {
            if (seg2Val == false) {
              let arr = this.searchFirtSelectableItemTree(x);
              if (arr != undefined || arr != null) {

                this.selectedValue.Seg2Id = [];
                this.selectedValue.Seg2Id.push(arr);
                seg2Val = true;
                return false;
              }
            }
          });
          break;
        case ('Time Period'):
          //this.dataexplorerService.selectedValue.TimePeriodId = this.values;
          let tpVal = false;
          this.getTimePerioddata();
          this.timeperiodddleItem?.forEach(x => {
            if (tpVal == false) {
              let arr = this.searchFirtSelectableItemTree(x);
              if (arr != undefined || arr != null) {

                this.selectedValue.TimePeriodId = [];
                this.selectedValue.TimePeriodId.push(arr);
                tpVal = true;
                return false;
              }
            }
          });
          break;
        case ('Channel'):
          //this.dataexplorerService.selectedValue.ChannelId = this.values;
          let chVal = false;
          this.getChanneldata();
          this.channelddlItem?.forEach(x => {
            if (chVal == false) {
              let arr = this.searchFirtSelectableItemTree(x);
              if (arr != undefined || arr != null) {

                this.selectedValue.ChannelId = [];
                this.selectedValue.ChannelId.push(arr);
                chVal = true;
                return false;
              }
            }
          });
          break;

      }
    });
  }

  setddlSlectedText(name,text) {


      switch (name) {
        case ('Brands'):

          (<HTMLInputElement>document.getElementsByClassName('brand-dropdown')[0].firstElementChild.firstElementChild.firstElementChild).innerText = text;
          break;
        case ('Demo'):

          (<HTMLInputElement>document.getElementsByClassName('demo-dropdown')[0].firstElementChild.firstElementChild.firstElementChild).innerText = text;
          break;


        case ('KPI'):
          (<HTMLInputElement>document.getElementsByClassName('kpi-dropdown')[0].firstElementChild.firstElementChild.firstElementChild).innerText = text;

          break;
        case ('Segment Filter'):
          (<HTMLInputElement>document.getElementsByClassName('seg1-dropdown')[0].firstElementChild.firstElementChild.firstElementChild).innerText = text;
          break;
        case ('Segment'):
          (<HTMLInputElement>document.getElementsByClassName('seg2-dropdown')[0].firstElementChild.firstElementChild.firstElementChild).innerText = text;
          break;
        case ('Time Period'):
          (<HTMLInputElement>document.getElementsByClassName('tp-dropdown')[0].firstElementChild.firstElementChild.firstElementChild).innerText = text;
          break;
        case ('Channel'):
          (<HTMLInputElement>document.getElementsByClassName('ch-dropdown')[0].firstElementChild.firstElementChild.firstElementChild).innerText = text;
          break;

      }

  }
  setSelectionText() {
    this.selectedValue?.dropdownList?.forEach((x) => {
      switch (x.name) {

        case ('Brands'):

          this.setddlSlectedText(name, this.brandtext);
          break;
        case ('Demo'):

          this.setddlSlectedText(name, this.demotext);

          break;
        case ('KPI'):
          this.setddlSlectedText(name, this.kpitext);

          break;
        case ('Segment Filter'):
          this.setddlSlectedText(name, this.seg1text);
          break;
        case ('Segment'):
          this.setddlSlectedText(name, this.seg2text);
          break;
        case ('Time Period'):
          this.setddlSlectedText(name, this.tptext);
          break;
        case ('Channel'):
          this.setddlSlectedText(name, this.chtext);
          break;

      }
    }
    )
  };

  getSelText(x,item) {
    {
      if (x == 'Market' && this.selectedValue?.marketId?.length == 1) {

        item.forEach(x => {
          let arr = this.searchTree(x, this.selectedValue.marketId[0]);
          if (arr != undefined) {
            (<HTMLInputElement>document.getElementsByClassName('marketddl-dropdown')[0].firstElementChild.firstElementChild.firstElementChild).innerText = arr;
            this.dataexplorerComp.marketitem = [new TreeviewItem({
              text: arr,
              value: null
            })];
          }


        });
      }

      if (x == 'Category' && this.selectedValue?.categoryId?.length == 1) {
        item.forEach(x => {
          let arr = this.searchTree(x, this.selectedValue.categoryId[0]);

          if (arr != undefined) {
            (<HTMLInputElement>document.getElementsByClassName('categoryddl-dropdown')[0].firstElementChild.firstElementChild.firstElementChild).innerText = arr;
            this.dataexplorerComp.categoryitem = [new TreeviewItem({
              text: arr,
              value: null
            })];
          }

        });

      }
      if (x == 'Brands' && this.dbselectedValue?.BrandId?.length == 1) {
        item.forEach(x => {
          let arr = this.searchTree(x, this.dbselectedValue.BrandId[0]);
          if (arr != undefined) {

              (<HTMLInputElement>document.getElementsByClassName('brand-dropdown')[0].firstElementChild.firstElementChild.firstElementChild).innerText = arr;


            return false;

          }

        });
      }

      if (x == 'Demo' && this.dbselectedValue?.DemographicId?.length == 1) {

        item.forEach(x => {
          let arr = this.searchTree(x, this.dbselectedValue.DemographicId[0]);
          if (arr != undefined) {


              (<HTMLInputElement>document.getElementsByClassName('demo-dropdown')[0].firstElementChild.firstElementChild.firstElementChild).innerText = arr;

              return false;
          }

        });
      }

      if (x == 'KPI' && this.dbselectedValue?.KPIId?.length == 1) {
        item.forEach(x => {
          let arr = this.searchTree(x, this.dbselectedValue.KPIId[0], 'KPI');
          if (arr != undefined) {

              (<HTMLInputElement>document.getElementsByClassName('kpi-dropdown')[0].firstElementChild.firstElementChild.firstElementChild).innerText = this.kpitext;

            return false;
          }

        });
      }

      if (x == 'Segment Filter' && this.dbselectedValue?.Seg1Id?.length == 1) {

        item.forEach(x => {
          let arr = this.searchTree(x, this.dbselectedValue.Seg1Id[0]);
          if (arr != undefined) {

              (<HTMLInputElement>document.getElementsByClassName('seg1-dropdown')[0].firstElementChild.firstElementChild.firstElementChild).innerText = arr;

              return false;
          }

        });
      }

      if (x == 'Segment' && this.dbselectedValue?.Seg2Id?.length == 1) {
        item.forEach(x => {
          let arr = this.searchTree(x, this.dbselectedValue.Seg2Id[0]);
          if (arr != undefined) {

              (<HTMLInputElement>document.getElementsByClassName('seg2-dropdown')[0].firstElementChild.firstElementChild.firstElementChild).innerText = arr;

              return false;
          }

        });
      }

      if (x == 'Time Period' && this.dbselectedValue?.TimePeriodId?.length == 1) {
        item.forEach(x => {
          let arr = this.findParents(x, this.dbselectedValue?.TimePeriodId[0]);
          if (arr != undefined) {
            arr.unshift(x.text);

              (<HTMLInputElement>document.getElementsByClassName('tp-dropdown')[0].firstElementChild.firstElementChild.firstElementChild).innerText = arr[arr.length - 1];;

              return false;
          }

        });
      }

      if (x == 'Channel' && this.dbselectedValue?.ChannelId?.length == 1) {
        item.forEach(x => {
          let arr = this.searchTree(x, this.dbselectedValue.ChannelId[0]);
          if (arr != undefined) {

              (<HTMLInputElement>document.getElementsByClassName('ch-dropdown')[0].firstElementChild.firstElementChild.firstElementChild).innerText = arr;

              return false;
          }

        });
      }



    }
  }
}
