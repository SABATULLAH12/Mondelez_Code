using Entites;
using Entites.EntityModel;
using System;
using System.Collections.Generic;

namespace BAL
{
    public interface IFilterPanel
    {
        FilterData FilterPanalData(int UserId);
        bool SubmitFilterData(int ModuleId, string Selection,int UserId);
        string BrandHierarchyExcel(BrandLevelData request);
        string AvailableTimePeriodData(int ModuleId);
        string AvailableBrandSegmentsData(bool IsSegement);
        ModuleMultiSelection GetMySelections(string userID,string ModuleId);
        bool SaveSelection(FilterSelectionRequest FObj);
        bool DeleteSelection(string SelectionId,bool IsStory,bool ISTagOrSelection);
        SubscriptionData GetSubscriptionData(int UserId);
        bool SaveSubscriptionData(int UserId, SubscriptionData request);
        bool UserTrackingDetails(int userid, int moduleid, string selection);
        MarketCategoryModel MarketCategoryData();
        CubeDDL CubeDDLData(string marketId, string categoryId, string cube,bool isHarmonized);
        DataExOutput GetDataByFilter(ExcelSelectionData selectionData);
        DataExOutput GetDataExplorerData(int ModuleId, string userId);
        DataExOutput GetExcelData(DataExOutput tbdata);
        DataExOutput GetTableData(DataExOutput tbdata);
        List<string> GetDistinctValues(List<DataExOutputTable> table, string column);
        List<string> GetDistinctLevelValues(List<DataExOutputTable> table, string column);
        string GetTabSpaces(int n);
        DataExplorerTableDetails ProcessExcelData(DataExOutput OutputData);
        DataExOutputTable FilterTableObject(List<DataExOutputTable> data, Dictionary<string, string> searchObj);
        DataExplorerTableDetails SetExcelDataNew(DataExOutput OutputData, int tableDataColumnCount, int tableDataRowCount, List<List<object>> tableData, List<Dictionary<string, object>> rowHeightInfo, List<List<object>> sampleSizeData);
    }
}
