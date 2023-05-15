using Entites;
using System.Data;

namespace DAL
{
    public interface IFilterPanelRepository
    {
        DataSet GetFilterPanalData(string ModuleId);
        DataSet GetModuleSelection(int UserId);
        bool SaveModuleSelection(int UserId, int ModuleId, string Selection);
        DataSet AvailableTimePeriodData();
        DataSet AvailableBrandSegmentsData(bool IsSegement);
        DataSet GetMySelections(string userID, string ModuleId);
        bool SaveSelection(FilterSelectionRequest FObj);

        bool UserTrackingDetails(int userid, int moduleid, string selection);
        bool DeleteSelection(string SelectionId,bool IsStory, bool ISTagOrSelection);
        DataSet GetSubscriptionData(int UserId);
        bool SaveSubscriptionData(int UserId, DataTable dReport, DataTable dDataLoad);
        DataSet GetMarketCategoryData();
        DataSet GetCubeDDLData(string marketId, string categoryId, string cube, bool isHarmonized);
        DataSet GetDataExplorerTblData(ExcelSelectionData selectionData,int userId);
        string GetDataExplorerData(int ModuleId, int userId);
    }
}
