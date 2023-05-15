using Entites;
using System.Collections.Generic;

namespace BAL
{
    public interface IGrowthOpportunity
    {
        List<object> GetChartOutput(GrowthOpportunityRequest request);
        string ExportPPT(GrowthOpportunityRequest request);
    }
}
