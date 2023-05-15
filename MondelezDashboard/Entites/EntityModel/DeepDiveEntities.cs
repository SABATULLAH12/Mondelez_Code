using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entites
{
    public class DeepdiveViewResponse
    {
        public List<DeepdiveOutputRow> DeepdiveDataList { get; set; }
        public DeepdiveViewResponse()
        {
            DeepdiveDataList = new List<DeepdiveOutputRow>();
        }
    }
    public class DeepdiveOutputRow
    {
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
    public class DeepdiveViewRequest
    {
        public string CompareId { get; set; }
        public string CompareName { get; set; }
        public string CompareTabName { get; set; }
        public string MarketId { get; set; }
        public string MarketName { get; set; }
        public string CategoryId { get; set; }
        public string CategoryName { get; set; }
        public string TimePeriodId { get; set; }
        public string TimePeriodName { get; set; }
        public string BrandId { get; set; }
        public List<BrandEntity> BrandMappings { get; set; }
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
        public bool isTrend { get; set; }
        public bool isChannel { get; set; }
        public string isChannelOrDemog { get; set; }        
        public string ExportsType { get; set; }
        public string ChartType { get; set; }
        public string ChartTitle { get; set; }
        public string FooterText { get; set; }
    }
    public class DeepDiveFilterPanelItem
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public bool IsSelectable { get; set; }
        public int? MapID { get; set; }
        public IList<DeepDiveFilterPanelItem> Data { get; set; }
        public bool IsMulti { get; set; }
    }
}
