using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entites
{

    public class SnapShotExportResponse
    {
        public List<List<OutputRow>> ExportData { get; set; }
        public List<OutputRow> LatestTimePeriod { get; set; }
    }

    public class OutputRow
    {
        public string MarketName { get; set; }
        public string CategoryName { get; set; }
        public string TimePeriodId { get; set; }
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
        public string MetricValueType { get; set; }
        public double? SampleSize { get; set; }
        public int RoundBy { get; set; }
    }
    public class SnapshotRequest
    {
        public int[] WidgetIds { get; set; }
        public string SnapshotTypeId { get; set; }
        public string SnapshotTypeName { get; set; }
        public string CompareName { get; set; }
        public string MarketId { get; set; }
        public string MarketName { get; set; }
        public string CategoryId { get; set; }
        public string CategoryName { get; set; }
        public string TimePeriodId { get; set; }
        public string TimePeriodName { get; set; }
        public string BrandId { get; set; }
        public List<BrandEntity> BrandMappings { get; set; }
        public List<BrandEntity> PrimaryBrandMappings { get; set; }
        public List<BrandEntity> SecondaryBrandMappings { get; set; }
        public string BrandName { get; set; }
        public string PrimaryBrandName { get; set; }
        public string SecondaryBrandName { get; set; }
        public string Segment1Id { get; set; }
        public string Segment1Name { get; set; }
        public string Segment2Id { get; set; }
        public string Segment2Name { get; set; }
        public string ChannelId { get; set; }
        public string ChannelName { get; set; }
        public string DemographicId { get; set; }
        public string DemographicName { get; set; }
        public bool isTrend { get; set; }
        public bool isChannel { get; set; }
        public string isChannelOrDemog { get; set; }
        public string ExportsType { get; set; }
        public string[] ChartTitles { get; set; }
        public string[] SheetNames { get; set; }
        public string imgBase64 { get; set; }
        public string FooterText { get; set; }
        public string SlidePath { get; set; }
    }
}
