using Entites;
using System.Data;

namespace DAL
{
    public interface ISnapShotRepository
    {
        int GetUserId(string EmailId);
        DataSet GetChartOutput(SnapshotRequest request);
    }
}
