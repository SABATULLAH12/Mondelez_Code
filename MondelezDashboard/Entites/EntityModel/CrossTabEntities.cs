using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entites
{
    public class CrossTabViewRequest
    {
        public string RowId { get; set; }
        public string RowName { get; set; }
        public string ColumnId { get; set; }
        public string ColumnName { get; set; }
        public string MarketId { get; set; }
        public string MarketName { get; set; }
        public string CategoryId { get; set; }
        public string CategoryName { get; set; }
        public string TimePeriodId { get; set; }
        public string TimePeriodName { get; set; }
        public string BrandId { get; set; }
        public List<BrandEntity> BrandMappings { get; set; }
        public List<SegmentEntity> SegmentMappings { get; set; }
        public string BrandName { get; set; }
        public string Segment1Id { get; set; }
        public string Segment1Name { get; set; }
        public string Segment2Id { get; set; }
        public string Segment2Name { get; set; }
        public string KpiId { get; set; }
        public string KpiName { get; set; }
        public string ChannelId { get; set; }
        public string ChannelName { get; set; }
        public string DemographicId { get; set; }
        public string DemographicName { get; set; }
        public bool isChannel { get; set; }
        public string isChannelOrDemog { get; set; }
        public string FooterText { get; set; }
    }
    public class CrossTabViewResponse
    {
        public List<CrossTabOutputRow> CrossTabDataList { get; set; }
        public string ExcelPath { get; set; }
        public string Message { get; set; }
        public List<LatestTimePeriod> LatestTimePeriod { get; set; }
        public CrossTabViewResponse()
        {
            CrossTabDataList = new List<CrossTabOutputRow>();
        }
    }
   
    public class CrossTabOutputRow
    {
        public string RowName { get; set; }
        public string ColumnName { get; set; }
        public string MarketName { get; set; }
        public string CategoryName { get; set; }
        public string TimePeriodName { get; set; }
        public string BrandName { get; set; }
        public string Segment1Name { get; set; }
        public string Segment2Name { get; set; }
        public string MetricName { get; set; }
        public double? MetricVolume { get; set; }
        public string ChannelName { get; set; }
        public string DemographicName { get; set; }
        public bool IsPercentage { get; set; }
        public string MetricType { get; set; }
        public double? SampleSize { get; set; }
        public int RoundBy { get; set; }
    }
}

