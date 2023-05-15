using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entites
{
    public class OutputChartData
    {
        public IList<SeriesData> Series { get; set; }
        public List<string> Categories { get; set; }
        public string ChartName { get; set; }
        public bool IsPercentage { get; set; }
        public bool isLowSampleSize { get; set; }
        public OutputChartData()
        {
            Series = new List<SeriesData>();
        }
    }
    public class LTAData
    {
        public string market { get; set; }
        public string category { get; set; }
        public string LTA { get; set; }
        public string yearAgo { get; set; }
    }
    public class SeriesData
    {
        public string name { get; set; }
        public IList<DataPoint> data { get; set; }
        public string color { get; set; }
        public SeriesData()
        {
            data = new List<DataPoint>();
        }
    }

    public class DataPoint
    {
        public double? y { get; set; }
        public double? Value { get; set; }
        public int Significance { get; set; }
        public string color { get; set; }
        public double? SampleSize { get; set; }
        public string MetricType { get; set; }
        public string TimePeriod { get; set; }
    }
    public class OrderAndColor
    {
        public string Name { get; set; }
        public string color { get; set; }
        public int Order { get; set; }
    }
    public class ChartData
    {
        public IList<object> Series { get; set; }
        public List<string> Categories { get; set; }
        public string ChartName { get; set; }
        public bool IsPercentage { get; set; }
        public bool isLowSampleSize { get; set; }
        public ChartData()
        {
            Series = new List<object>();
            Categories = new List<string>(); 
        }
    }
    public class CombinationSeriesData
    {                              
        public string name { get; set; }
        public string type { get; set; }
        public int yAxis { get; set; }
        public int zIndex { get; set; }
        public IList<CombinationDataPoint> data { get; set; }
        public string color { get; set; }
        public CombinationToolTip tooltip { get; set; }
        public CombinationSeriesData()
        {
            data = new List<CombinationDataPoint>();
        }
    }
    public class CombinationToolTip
    {
        public string valueSuffix { get; set; }
    }
    public class CombinationDataPoint
    {
        public double? y { get; set; }
        public double? Value { get; set; }
        public int? SampleSize { get; set; }

    }
    public class BubbleSeriesData
    {
        public string name { get; set; }
        public int legendIndex { get; set; }
        public IList<BubbleDataPoint> data { get; set; }
        public string color { get; set; }
        public CombinationToolTip tooltip { get; set; }
        public BubbleSeriesData()
        {
            data = new List<BubbleDataPoint>();
        }
    }
    public class BubbleDataPoint
    {
        public double? x { get; set; }
        public double? y { get; set; }
        public double? z { get; set; }
        public double? SampleSize { get; set; }

    }
    public class TrendSeriesData
    {
        public string name { get; set; }
        public IList<TrendDataPoint> data { get; set; }
        public int legendIndex { get; set; }
        public string color { get; set; }
        public CombinationToolTip tooltip { get; set; }
        public TrendSeriesData()
        {
            data = new List<TrendDataPoint>();
        }
    }
    public class TrendDataPoint
    {
        public double? y { get; set; }
        public double? SampleSize { get; set; }
        public string TimePeriodId {get;set;}
        public string TimePeriodName { get; set; }

    }
    public class CategoryShareSeriesData
    {
        public string name { get; set; }
        public IList<CategoryShareDataPoint> data { get; set; }
        public int legendIndex { get; set; }
        public string color { get; set; }
        public CombinationToolTip tooltip { get; set; }
        public CategoryShareSeriesData()
        {
            data = new List<CategoryShareDataPoint>();
        }
    }
    public class CategoryShareDataPoint
    {
        public double? y { get; set; }
        public string name { get; set; }
        public double? SampleSize { get; set; }

    }
    public class ColumnBubbleTopSeriesData
    {
        public string name { get; set; }
        public IList<ColumnBubbleTopDataPoint> data { get; set; }
        public CombinationToolTip tooltip { get; set; }
        public ColumnBubbleTopSeriesData()
        {
            data = new List<ColumnBubbleTopDataPoint>();
        }
    }
    public class ColumnBubbleTopDataPoint
    {
        public double? y { get; set; }
        public string name { get; set; }
        public double? SampleSize { get; set; }
        public string color { get; set; }
    }
    public class TreeSeriesData
    {
        public string name { get; set; }
        public string color { get; set; }
        public IList<TreeDataPoint> data { get; set; }
        public TreeSeriesData()
        {
            data = new List<TreeDataPoint>();
        }
    }
    public class TreeDataPoint
    {
        public double? value { get; set; }
        public string suffix { get; set; }
        public string name { get; set; }
        public double? SampleSize { get; set; }
    }
}
