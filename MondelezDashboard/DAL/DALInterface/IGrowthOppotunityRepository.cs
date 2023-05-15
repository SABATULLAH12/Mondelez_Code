using Entites;
using System.Data;

namespace DAL
{
    public interface IGrowthOppotunityRepository
    {
        DataSet GetChartOutput(GrowthOpportunityRequest request);
    }
}
