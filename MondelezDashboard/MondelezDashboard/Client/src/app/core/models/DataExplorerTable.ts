export class DataExplorerTable{
RowList:LevelInfo[]=[];
ColumnList:LevelInfo[]=[];
DataExOutputTable:DataExplorerTableData[]=[];
Selection:string;
SupressZero:boolean;
selectionTextExcel:string="";
}
export class LevelInfo{
  LevelId:number;
  LevelName:string;
  DistinctValues:string[]=[];
  DistinctLevelValues:string[]=[];
  WidthTimes:number;
  RepeatTimes:number;
  Values:string[]=[];
}
export class DataExplorerTableData{
Brand : string;
Category : string;
Channel : string;
DEMO : string;
Id : number;
KPI : string;
Market : string;
MetricValue : number;
Segment1 : string;
Segment2 : string;
Level_Brand : number;
Level_Channel : number;
Level_DEMO : number;
Level_Segment1 : number;
Level_Segment2 : number;
TimePeriod : string;
RawBuyers : number;
MVal:number;
}
export class DataExplorerTableDetails
{
    RowList:LevelTable[]=[];
    ColumnList:LevelTable[]=[];
    Data:string[]=[];
    SampleSize:number[]=[];
    DataRowCount:number;
    DataColumnCount:number;
    DataExOutputTable:DataExplorerTableData[]=[];
    Selection:String;
}
export class LevelTable
{
    LevelName:string;
    LevelId:number;
    Values:HeaderTable[]=[];
}
export class HeaderTable
{
    Name:string;
    WidthCount:number
}

