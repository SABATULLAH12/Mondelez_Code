import { Component, OnInit,Input, OnChanges, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { isNil } from 'lodash';
import { DropdownTreeviewComponent, TreeviewConfig, TreeviewHelper, TreeviewI18n, TreeviewItem } from 'ngx-treeview';
import { DataExplorerTable, DataExplorerTableDetails, HeaderTable, LevelTable } from 'src/app/core/models/DataExplorerTable';
import { DataexplorerService } from 'src/app/core/service/dataexplorer.service';
import { AlertComponent } from '../common/alert/alert.component';
import { MySelectionComponent } from '../my-selection/my-selection.component';
import { PivotComponent } from '../pivot/pivot.component';
import { SaveSelectionComponent } from '../save-selection/save-selection.component';
@Component({
  selector: 'app-dataexplorertable',
  templateUrl: './dataexplorertable.component.html',
  styleUrls: ['./dataexplorertable.component.css']
})
export class DataexplorerTableComponent implements OnInit {
  @Input() OutputData: DataExplorerTable = new DataExplorerTable();
  @Input() excelOutputData: DataExplorerTable = new DataExplorerTable();

columnListCount:number=-1
rowListCount:number=-1
numOfColumnsInRowHeader:number=0
numOfRowsInColumnHeader:number=0
cellWidth:string='15vw'
cellheight:string='3vh'
tableWidth:number=0
tableHeight:number=0
rowHeight:number=0
rowWidth:number=0
data: any[] = [];;
datarowNumber: number;
datacolNumber: number;
rowHeightInfo: any[]=[];
suppressZero:boolean=false;
  tableData: any[][] = [];
  samplesizeData: any[][] = [];
tableDataColumnCount:number=-1;
tableDataRowCount:number=-1;
 hideTable: boolean = false;
 showtable: boolean = false;
 htmlTable:string = "";
 scrollYTimes:number=1;
  scrollXTimes: number = 1;
  Low_SampleSize_Value:number = 20;
  SampleSize_Value: number = 70;
  lowsamplesize: string = "*";
  constructor(private dataexplorerService: DataexplorerService, private modalService: NgbModal) {
    this.dataexplorerService.datatableComp = this;
  }
  ngOnInit(): void {





  }
 index = 0;
  getdata() {

    let val = this.data[this.index];

    this.index = this.index + 1;
    return val;
  }
  currentNumber = 0;
  num(first: boolean) {
    if (first) { this.currentNumber = 0 };

    return this.currentNumber++;
  }

  onTrackByGroupId(index: any, item: number) {
    return index;  // replace this one with the unique value from the item
  }

  onTrackByItemId(index: any, item: number) {
    return index;   // replace this one with the unique value from the item
  }
  reInitialize(){
    this.columnListCount = -1
    this.rowListCount = -1
    this.numOfColumnsInRowHeader = 0
    this.numOfRowsInColumnHeader = 0
    this.cellWidth = '15vw'
    this.cellheight = '3vh'
    this.tableWidth = 0
    this.tableHeight = 0
    this.rowHeight = 0
    this.rowWidth = 0
    this.data = [];;
    this.datarowNumber=0;
    this.datacolNumber=0;
    this.rowHeightInfo= [];
    this.suppressZero = false;
    this.tableData= [];
    this.tableDataColumnCount = -1;
    this.tableDataRowCount = -1;
    this.hideTable = false;
}
  ngOnChanges() {

    this.showtable = false;
    this.reInitialize();

      //const modalRef = this.modalService.open(AlertComponent, { windowClass: "modal-content-alert" })
      //modalRef.componentInstance.validationMessage = 'No Data available for the given selection, Please change your selection and try again.';

    if (this.OutputData?.DataExOutputTable != null || this.OutputData.DataExOutputTable.length > 0) {
      this.processData();

      if (this.hideTable == true || this.OutputData.DataExOutputTable.length == 0) {
        const modalRef = this.modalService.open(AlertComponent, { windowClass: "modal-content-alert" })
        modalRef.componentInstance.validationMessage = 'No Data available for the given selection, Please change your selection and try again.';

      }
      else {

        this.dataexplorerService.pivotComp?.activeModal.dismiss('Cross click')


      }
    }
    else {
      const modalRef = this.modalService.open(AlertComponent, { windowClass: "modal-content-alert" })
      modalRef.componentInstance.validationMessage = 'No Data available for the given selection, Please change your selection and try again.';

      this.dataexplorerService.pivotComp?.activeModal.dismiss('Cross click')
    }
  }
  processData() {
    console.log("outputdata:-", this.OutputData);
    this.suppressZero = this.OutputData.SupressZero;
    this.rowHeightInfo=[];
    this.hideTable=true;
    this.OutputData.RowList.forEach(e=>{
      e.DistinctValues.forEach(f=>{
        for(let i=1;i<=e.RepeatTimes;i++){
          let obj = {
            "LevelId":e.LevelId,
            "RepeatSequence":i,
            "Values":f,
            "Width":e.WidthTimes
          }
          this.rowHeightInfo.push(obj)
        }
      })
    })

    this.numOfRowsInColumnHeader = this.OutputData.ColumnList.length;
    this.numOfColumnsInRowHeader = this.OutputData.RowList.length;

    this.columnListCount = this.OutputData.ColumnList.length>0?this.OutputData.ColumnList[0].Values.length:-1;
    this.rowListCount = this.OutputData.RowList.length > 0 ? this.OutputData.RowList[0].Values.length : -1;
    let value = 0;
    this.tableData = [];
    this.samplesizeData=[];
    for(let i=0;i<this.rowListCount;i++){
      let allZero=true;
      let tempDataRow:any[]=[];
      let sampleDataRow:any[]=[];
      for(let j=0;j<this.columnListCount;j++){
        let a ={};
        for(let k=0;k<this.OutputData.RowList.length;k++){
          a[this.OutputData.RowList[k].LevelName] = this.OutputData.RowList[k].Values[i];

        }
        for(let l=0;l<this.OutputData.ColumnList.length;l++){
          a[this.OutputData.ColumnList[l].LevelName] = this.OutputData.ColumnList[l].Values[j];

        }
        let val: any;
        val = _.filter(this.OutputData.DataExOutputTable, a)[0];
        if(val.MetricValue!=null && val.MetricValue!=undefined){
          allZero=false;
        }
        this.data.push((val.MetricValue == null || val.MetricValue == undefined || val.MetricValue =="")?'NA':val.MetricValue);
        tempDataRow.push((val.MetricValue == null || val.MetricValue == undefined|| val.MetricValue == "")?'NA':val.MetricValue);
        sampleDataRow.push((val.RawBuyers==null||val.RawBuyers==undefined)?null:val.RawBuyers);
        //this.data.push(value);
        //value++;
      }

      if(allZero && this.suppressZero){
        this.OutputData.RowList.forEach(e=>{
          let levId=e.LevelId;
          let values = e.Values[i];
          let RepeatSequence = Math.ceil((i+1)/(e.DistinctValues.length*e.WidthTimes));
          let obj = {
            "LevelId":levId,
            "RepeatSequence":RepeatSequence,
            "Values":values
          }
          let filteredObj = _.filter(this.rowHeightInfo,obj)[0];
          let indx = _.findIndex(this.rowHeightInfo,obj,0);

          if(indx!=-1)
          this.rowHeightInfo[indx].Width = this.rowHeightInfo[indx].Width - 1;
        })

      }
      else{
        this.hideTable=false;

        this.tableData.push(tempDataRow);
        this.samplesizeData.push(sampleDataRow);
        this.showtable = true;
      }
    }

    this.tableDataColumnCount = this.OutputData.ColumnList[this.OutputData.ColumnList.length - 1].Values.length;
    this.tableDataRowCount = this.tableData.length;


    this.datacolNumber = this.OutputData.ColumnList[this.OutputData.ColumnList.length - 1].Values.length;
    this.datarowNumber = this.OutputData.RowList[this.OutputData.RowList.length - 1].Values.length;

    /*this.tableWidth = Math.min(90, (this.columnListCount + this.numOfColumnsInRowHeader) * 15);
    this.tableHeight = Math.min(50, (this.rowListCount + this.numOfRowsInColumnHeader) * 5);
    this.rowHeight = Math.max(100 / (this.rowListCount + this.numOfRowsInColumnHeader), 10)
    this.rowWidth = Math.max(100 / (this.columnListCount + this.numOfColumnsInRowHeader), 100.0 / 6)*/

    this.tableWidth = Math.min(90, (this.columnListCount + this.numOfColumnsInRowHeader) * 15);
    this.tableHeight = Math.min(51, (this.tableDataRowCount + this.numOfRowsInColumnHeader) * 3);
    this.rowHeight = Math.max(100 / (this.tableDataRowCount + this.numOfRowsInColumnHeader), 100.0/17)
    this.rowWidth = Math.max(100 / (this.columnListCount + this.numOfColumnsInRowHeader), 100.0 / 6);
    /*if(this.tableDataRowCount>250 && this.tableDataRowCount<500){
      this.scrollYTimes=5;
    }
    else if(this.tableDataRowCount>500 && this.tableDataRowCount<1000){
      this.scrollYTimes=10
    }
    else{
      this.scrollYTimes=20;
    }*/
    //this.setExcelData();
    /*    this.setExcelDataNew(this.OutputData,this.tableDataColumnCount,this.tableDataRowCount,this.tableData,this.rowHeightInfo,true,sampleSizeData);*/
    //this.getExcelData(this.excelOutputData);
  }
  processExcelData(OutputData:any){
    let suppressZero = OutputData.SupressZero;
    let rowHeightInfo=[];
    OutputData.RowList.forEach(e=>{
      e.DistinctValues.forEach(f=>{
        for(let i=1;i<=e.RepeatTimes;i++){
          let obj = {
            "LevelId":e.LevelId,
            "RepeatSequence":i,
            "Values":f,
            "Width":e.WidthTimes
          }
          rowHeightInfo.push(obj)
        }
      })
    })

    let columnListCount = OutputData.ColumnList.length>0?OutputData.ColumnList[0].Values.length:-1;
    let rowListCount = OutputData.RowList.length > 0 ? OutputData.RowList[0].Values.length : -1;
    let value = 0;
    let tableData:any[][] = [];
    let sampleSizeData:any[][]=[];
    let tableDataColumnCount:number=-1;
    let tableDataRowCount:number=-1;
    for(let i=0;i<rowListCount;i++){
      let allZero=true;
      let tempDataRow:any[]=[];
      let sampleDataRow:any[]=[];
      for(let j=0;j<columnListCount;j++){
        let a ={};
        for(let k=0;k<OutputData.RowList.length;k++){
          a[OutputData.RowList[k].LevelName] = OutputData.RowList[k].Values[i];

        }
        for(let l=0;l<OutputData.ColumnList.length;l++){
          a[OutputData.ColumnList[l].LevelName] = OutputData.ColumnList[l].Values[j];

        }
        let val: any;
        val = _.filter(OutputData.DataExOutputTable, a)[0];
        if(val.MetricValue!=null && val.MetricValue!=undefined){
          allZero=false;
        }
        tempDataRow.push((val.MetricValue==null||val.MetricValue==undefined)?'NA':val.MetricValue);
        sampleDataRow.push((val.RawBuyers==null||val.RawBuyers==undefined)?null:val.RawBuyers);
        //this.data.push(value);
        //value++;
      }

      if(allZero && suppressZero){
        OutputData.RowList.forEach(e=>{
          let levId=e.LevelId;
          let values = e.Values[i];
          let RepeatSequence = Math.ceil((i+1)/(e.DistinctValues.length*e.WidthTimes));
          let obj = {
            "LevelId":levId,
            "RepeatSequence":RepeatSequence,
            "Values":values
          }
          let filteredObj = _.filter(rowHeightInfo,obj)[0];
          let indx = _.findIndex(rowHeightInfo,obj,0);

          if(indx!=-1)
          rowHeightInfo[indx].Width = rowHeightInfo[indx].Width - 1;
        })

      }
      else{

        tableData.push(tempDataRow);
        sampleSizeData.push(sampleDataRow);
      }
    }
    tableDataColumnCount = OutputData.ColumnList[OutputData.ColumnList.length - 1].Values.length;
    tableDataRowCount = tableData.length;
    let excelObject = this.setExcelDataNew(OutputData,tableDataColumnCount,tableDataRowCount,tableData,rowHeightInfo,false,sampleSizeData);

    this.dataexplorerService.getExcelDataDownload(excelObject).subscribe(e=>{

      window.location.href=e;
    });
  }
  getExcelData(OutputData: any) {
    let suppressZero = OutputData.SupressZero;
    let rowHeightInfo = [];
    OutputData.RowList.forEach(e => {
      e.DistinctValues.forEach(f => {
        for (let i = 1; i <= e.RepeatTimes; i++) {
          let obj = {
            "LevelId": e.LevelId,
            "RepeatSequence": i,
            "Values": f,
            "Width": e.WidthTimes
          }
          rowHeightInfo.push(obj)
        }
      })
    })

    let columnListCount = OutputData.ColumnList.length > 0 ? OutputData.ColumnList[0].Values.length : -1;
    let rowListCount = OutputData.RowList.length > 0 ? OutputData.RowList[0].Values.length : -1;
    let value = 0;
    let tableData: any[][] = [];
    let sampleSizeData: any[][] = [];
    let tableDataColumnCount: number = -1;
    let tableDataRowCount: number = -1;
    for (let i = 0; i < rowListCount; i++) {
      let allZero = true;
      let tempDataRow: any[] = [];
      let sampleDataRow: any[] = [];
      for (let j = 0; j < columnListCount; j++) {
        let a = {};
        for (let k = 0; k < OutputData.RowList.length; k++) {
          a[OutputData.RowList[k].LevelName] = OutputData.RowList[k].Values[i];

        }
        for (let l = 0; l < OutputData.ColumnList.length; l++) {
          a[OutputData.ColumnList[l].LevelName] = OutputData.ColumnList[l].Values[j];

        }
        let val: any;
        val = _.filter(OutputData.DataExOutputTable, a)[0];
        if (val.MetricValue != null && val.MetricValue != undefined) {
          allZero = false;
        }
        tempDataRow.push((val.MetricValue == null || val.MetricValue == undefined) ? 'NA' : val.MetricValue);
        sampleDataRow.push((val.RawBuyers == null || val.RawBuyers == undefined) ? null : val.RawBuyers);
        //this.data.push(value);
        //value++;
      }

      if (allZero && suppressZero) {
        OutputData.RowList.forEach(e => {
          let levId = e.LevelId;
          let values = e.Values[i];
          let RepeatSequence = Math.ceil((i + 1) / (e.DistinctValues.length * e.WidthTimes));
          let obj = {
            "LevelId": levId,
            "RepeatSequence": RepeatSequence,
            "Values": values
          }
          let filteredObj = _.filter(rowHeightInfo, obj)[0];
          let indx = _.findIndex(rowHeightInfo, obj, 0);

          if (indx != -1)
            rowHeightInfo[indx].Width = rowHeightInfo[indx].Width - 1;
        })

      }
      else {

        tableData.push(tempDataRow);
        sampleSizeData.push(sampleDataRow);
      }
    }
    tableDataColumnCount = OutputData.ColumnList[OutputData.ColumnList.length - 1].Values.length;
    tableDataRowCount = tableData.length;
    let excelObject = this.setExcelDataNew(OutputData, tableDataColumnCount, tableDataRowCount, tableData, rowHeightInfo, true, sampleSizeData);
  }
  getExcelDataNew(OutputData: any):DataExplorerTableDetails {
    console.log("Excel Processing started")
    let suppressZero = OutputData.SupressZero;
    let rowHeightInfo = [];
    OutputData.RowList.forEach(e => {
      e.DistinctValues.forEach(f => {
        for (let i = 1; i <= e.RepeatTimes; i++) {
          let obj = {
            "LevelId": e.LevelId,
            "RepeatSequence": i,
            "Values": f,
            "Width": e.WidthTimes
          }
          rowHeightInfo.push(obj)
        }
      })
    })

    let columnListCount = OutputData.ColumnList.length > 0 ? OutputData.ColumnList[0].Values.length : -1;
    let rowListCount = OutputData.RowList.length > 0 ? OutputData.RowList[0].Values.length : -1;
    let value = 0;
    let tableData: any[][] = [];
    let sampleSizeData: any[][] = [];
    let tableDataColumnCount: number = -1;
    let tableDataRowCount: number = -1;
    for (let i = 0; i < rowListCount; i++) {
      let allZero = true;
      let tempDataRow: any[] = [];
      let sampleDataRow: any[] = [];
      for (let j = 0; j < columnListCount; j++) {
        let a = {};
        for (let k = 0; k < OutputData.RowList.length; k++) {
          a[OutputData.RowList[k].LevelName] = OutputData.RowList[k].Values[i];

        }
        for (let l = 0; l < OutputData.ColumnList.length; l++) {
          a[OutputData.ColumnList[l].LevelName] = OutputData.ColumnList[l].Values[j];

        }
        let val: any;
        val = _.filter(OutputData.DataExOutputTable, a)[0];
        if (val.MetricValue != null && val.MetricValue != undefined) {
          allZero = false;
        }
        tempDataRow.push((val.MetricValue == null || val.MetricValue == undefined) ? 'NA' : val.MetricValue);
        sampleDataRow.push((val.RawBuyers == null || val.RawBuyers == undefined) ? null : val.RawBuyers);
        //this.data.push(value);
        //value++;
      }

      if (allZero && suppressZero) {
        OutputData.RowList.forEach(e => {
          let levId = e.LevelId;
          let values = e.Values[i];
          let RepeatSequence = Math.ceil((i + 1) / (e.DistinctValues.length * e.WidthTimes));
          let obj = {
            "LevelId": levId,
            "RepeatSequence": RepeatSequence,
            "Values": values
          }
          let filteredObj = _.filter(rowHeightInfo, obj)[0];
          let indx = _.findIndex(rowHeightInfo, obj, 0);

          if (indx != -1)
            rowHeightInfo[indx].Width = rowHeightInfo[indx].Width - 1;
        })

      }
      else {

        tableData.push(tempDataRow);
        sampleSizeData.push(sampleDataRow);
      }
    }
    tableDataColumnCount = OutputData.ColumnList[OutputData.ColumnList.length - 1].Values.length;
    tableDataRowCount = tableData.length;
    let excelObject = this.setExcelDataNew(OutputData, tableDataColumnCount, tableDataRowCount, tableData, rowHeightInfo, false, sampleSizeData);
    console.log("excel preparation finished");
    return excelObject;
  }

  /*setExcelData(){
    let excelTable:DataExplorerTableDetails = new DataExplorerTableDetails();
    let columnList:LevelTable[]=[];
    let rowList:LevelTable[]=[];
    excelTable.DataExOutputTable = this.OutputData.DataExOutputTable;
    //excelTable.Selection = this.dataexplorerService.selectionTextForExportToExcel();
    excelTable.DataColumnCount = this.tableDataColumnCount;
    excelTable.DataRowCount = this.tableDataRowCount;
    excelTable.Selection = this.OutputData.selectionTextExcel;
    //ColumnList
    this.OutputData.ColumnList.forEach(col=>{
      let colLevel:LevelTable = new LevelTable();
      colLevel.LevelId = col.LevelId;
      colLevel.LevelName = col.LevelName;
      for(let i=1;i<=col.RepeatTimes;i++){
        col.DistinctValues.forEach(val=>{
          let rowItem:HeaderTable=new HeaderTable();
          rowItem.Name=val;rowItem.WidthCount=col.WidthTimes;
        colLevel.Values.push(rowItem)
        })
      }
      columnList.push(colLevel);
    })
    excelTable.ColumnList = columnList;
    //End
    //RowList
    this.OutputData.RowList.forEach(col=>{
      let rowLevel:LevelTable = new LevelTable();
      rowLevel.LevelId = col.LevelId;
      rowLevel.LevelName = col.LevelName;
      for(let i=1;i<=col.RepeatTimes;i++){
        col.DistinctValues.forEach(val=>{
          let rowItem:HeaderTable=new HeaderTable();
          rowItem.Name=val;rowItem.WidthCount=this.getRowHeaderHeightCount(rowLevel.LevelId,i,val);
          rowLevel.Values.push(rowItem)
        })
      }
      rowList.push(rowLevel);
    })
    excelTable.RowList = rowList;
    //End
    //Data
    excelTable.Data = [];
    for(let i=0;i<this.tableData.length;i++){
      for(let j=0;j<this.tableData[i].length;j++){
        excelTable.Data.push(this.tableData[i][j]);
      }
    }
    //End
   
    this.dataexplorerService.setExcelDataObj(excelTable);
    //this.dataexplorerService.getExcelData(excelTable);
    // this.dataexplorerService.getExcelData(excelTable).subscribe(e=>{
    //   console.log(e)
    // })
    //this.dataexplorerService.getExcelData(new DataExplorerTableDetails());
  }*/
  setExcelDataNew(OutputData:any,tableDataColumnCount:number,tableDataRowCount:number,tableData:any,rowHeightInfo:any,setExcelObject:boolean,sampleSizeData:any):DataExplorerTableDetails{
    let excelTable:DataExplorerTableDetails = new DataExplorerTableDetails();
    let columnList:LevelTable[]=[];
    let rowList:LevelTable[]=[];
    excelTable.DataExOutputTable = OutputData.DataExOutputTable;
    //excelTable.Selection = this.dataexplorerService.selectionTextForExportToExcel();
    excelTable.DataColumnCount = tableDataColumnCount;
    excelTable.DataRowCount = tableDataRowCount;
    excelTable.Selection = OutputData.selectionTextExcel;
    //ColumnList
    OutputData.ColumnList.forEach(col=>{
      let colLevel:LevelTable = new LevelTable();
      colLevel.LevelId = col.LevelId;
      colLevel.LevelName = col.LevelName;
      for(let i=1;i<=col.RepeatTimes;i++){
        col.DistinctValues.forEach(val=>{
          let rowItem:HeaderTable=new HeaderTable();
          rowItem.Name=val;rowItem.WidthCount=col.WidthTimes;
        colLevel.Values.push(rowItem)
        })
      }
      columnList.push(colLevel);
    })
    excelTable.ColumnList = columnList;
    //End
    //RowList
    OutputData.RowList.forEach(col=>{
      let rowLevel:LevelTable = new LevelTable();
      rowLevel.LevelId = col.LevelId;
      rowLevel.LevelName = col.LevelName;
      for(let i=1;i<=col.RepeatTimes;i++){
        col.DistinctValues.forEach(val=>{
          let rowItem:HeaderTable=new HeaderTable();
          rowItem.Name=val;rowItem.WidthCount=this.getRowHeaderHeightCountNew(rowLevel.LevelId,i,val,rowHeightInfo);
          rowLevel.Values.push(rowItem)
        })
      }
      rowList.push(rowLevel);
    })
    excelTable.RowList = rowList;
    //End
    //Data
    excelTable.Data = [];
    for(let i=0;i<tableData.length;i++){
      for(let j=0;j<tableData[i].length;j++){
        excelTable.Data.push(tableData[i][j]);
      }
    }
    excelTable.SampleSize = [];
    for(let i=0;i<sampleSizeData.length;i++){
      for(let j=0;j<sampleSizeData[i].length;j++){
        excelTable.SampleSize.push(sampleSizeData[i][j]);
      }
    }
    //End

    if(setExcelObject){
      this.dataexplorerService.setExcelDataObj(excelTable);
    }

    return excelTable;
    //this.dataexplorerService.getExcelData(excelTable);
    // this.dataexplorerService.getExcelData(excelTable).subscribe(e=>{
    //   console.log(e)
    // })
    //this.dataexplorerService.getExcelData(new DataExplorerTableDetails());
  }
  numSequence(n: number): Array<number> {
    return Array(n);
  }
  getRowHeaderHeightCount(levelId:number,RepeatSequence:number,values:string):number{
    let obj = {
      "LevelId":levelId,
      "RepeatSequence":RepeatSequence,
      "Values":values
    }
    let filteredObj = _.filter(this.rowHeightInfo,obj)[0];
    return Math.max(filteredObj.Width,0);
  }
  getRowHeaderHeightCountNew(levelId:number,RepeatSequence:number,values:string,rowHeightInfo:any):number{
    let obj = {
      "LevelId":levelId,
      "RepeatSequence":RepeatSequence,
      "Values":values
    }
    let filteredObj = _.filter(rowHeightInfo,obj)[0];
    return Math.max(filteredObj.Width,0);
  }
  onScrollX(rightBody: string, rightHeader: string, event): void{
    document.getElementById(rightBody).scrollLeft = event.target.scrollLeft;
    document.getElementById(rightHeader).scrollLeft = event.target.scrollLeft;
  }
  onScrollY(rightBody: string, leftBody: string, event): void{
   
    document.getElementById(rightBody).scrollTop = event.target.scrollTop*this.scrollYTimes;
    document.getElementById(leftBody).scrollTop = event.target.scrollTop*this.scrollYTimes;
  }

  checkSamplesize(samplesize: number) {
    if (samplesize >= this.Low_SampleSize_Value && samplesize < this.SampleSize_Value) {
      return true;
    }
    else {
      return false;
    }
  }
}
