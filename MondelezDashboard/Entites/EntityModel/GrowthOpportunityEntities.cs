using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entites
{
    public class GrowthOpportunityRequest
    {
        public string MarketId { get; set; }
        public string MarketName { get; set; }
        public string CategoryId { get; set; }
        public string CategoryName { get; set; }
        public string BrandId { get; set; }
        public string GrowthTimePeriod { get; set; }
        public List<BrandEntity> BrandMappings { get; set; }
        public string BrandName { get; set; }
        public string imgBase64 { get; set; }
        public string FooterText { get; set; }
    }
    public class GrowthOutputRow
    {
        public string MarketName { get; set; }
        public string CategoryName { get; set; }
        public string TimePeriodId { get; set; }
        public string TimePeriodName { get; set; }
        public string BrandName { get; set; }
        public string BrandId { get; set; }
        public string MetricName { get; set; }
        public double? MetricVolume { get; set; }
        public string MetricType { get; set; }
        public string MetricValueType { get; set; }
        public int RoundBy { get; set; }
        public string Quadrant { get; set; }
    }
}
