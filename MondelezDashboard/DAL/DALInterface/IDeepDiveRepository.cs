using System.Data;
using Entites;

namespace DAL
{
    public interface IDeepDiveRepository
    {
        int GetUserId(string EmailId);
        DataSet GetChartOutput(DeepdiveViewRequest request);
    }
}
