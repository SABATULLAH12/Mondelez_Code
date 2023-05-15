using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entites.EntityModel
{
     public  class DataExOutput
    {
        public List<Level> ColumnList { get; set; }
        public List<Level> RowList { get; set; }       
        public List<DataExOutputTable> DataExOutputTable { get; set; }
        public string Selection { get; set; }
        public bool SupressZero { get; set; }
        public string selectionTextExcel { get; set; }
    }
    public class DataExOutputTable
    {
        public int Id { get; set; }
        public string Market { get; set; }
        public string Category { get; set; }
        public string TimePeriod { get; set; }
        public string Brand { get; set; }        
        public string KPI { get; set; }
        public string DEMO { get; set; }
        public string Segment1 { get; set; }
        public string Segment2 { get; set; }
        public string Channel { get; set; }
        public double? MVal { get; set; }
        public string MetricValue { get; set; }
        public int Level_Brand { get; set; }
        public int Level_Channel { get; set; }
        public int Level_DEMO { get; set; }
        public int Level_Segment1 { get; set; }
        public int Level_Segment2 { get; set; }
        public double? RawBuyers { get; set; }
    }

    public class Level
    {
        public string LevelName { get; set; }
        public int LevelId { get; set; }
        public List<string> DistinctValues { get; set; }
        public List<string> DistinctLevelValues { get; set; }
        public int WidthTimes { get; set; }
        public int RepeatTimes { get; set; }
        public List<string> Values { get; set; }
    }
    public class DataExplorerTableDetails
    {
        public List<LevelTable> RowList { get; set; }
        public List<LevelTable> ColumnList { get; set; }
        public List<string> Data { get; set; }
        public List<double?> SampleSize { get; set; }
        public int DataRowCount { get; set; }
        public int DataColumnCount { get; set; }
        public List<DataExOutputTable> DataExOutputTable { get; set; }
        public string Selection { get; set; }
    }
    public class LevelTable
    {
        public string LevelName { get; set; }
        public int LevelId { get; set; }
        public List<HeaderTable> Values { get; set; }
    }
    public class HeaderTable
    {
        public string Name { get; set; }
        public int WidthCount { get; set; }
    }
    public class SelectionTextClass
    {
        public string selectionTextExcel { get; set; }
    }
}
