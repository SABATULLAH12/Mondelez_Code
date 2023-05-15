namespace DAL
{
    public class Constants
    {

        #region SP Names

        public static string InsertNewUser = "[USP_MDLZ_INSERTNEWUSER]";

        public static string GetFilterData = "[USP_mdlz_filter]";

        public static string GetModule_Selections = "[USP_mdlz_GetModule_Selections]";

        public static string SaveModuleSelections = "[USP_mdlz_StoreModule_Selections]";

        public static string DeepDive_GetOutputData = "[USP_mdlz_deepdive]";

        public static string CrossTab_GetOutputData = "[USP_mdlz_crosstab_nested]";

        public static string Snapshot_GetOutputData = "[USP_mdlz_snapshot]";

        public static string GrowthOpportunity_GetOutputData = "[USP_mdlz_growthOpportunity]";

        public static string VerifyUser = "[USP_MDLZ_Check_local_User]";

        public static string GetUserDetails = "[USP_MDLZ_local_GetUserDetails]";

        public static string GetUserRole = "[USP_GetUserDetails]";

        public static string StoryBoard_GetStories = "[USP_MDLZ_StoryBoard_GetAllStories]";

        public static string StoryBoard_SavedStories = "[USP_MDLZ_StoryBoard_GetSavedStories]";

        public static string StoryBoard_GetSharedStories = "[USP_MDLZ_StoryBoard_GetSharedStories]";

        public static string StoryBoard_AddSlide = "[USP_MDLZ_StoryBoard_CreateNewSlide]";

        public static string StoryBoard_AddStory = "[USP_MDLZ_StoryBoard_CreateNewStory]";

        public static string StoryBoard_GetStorySlides = "[USP_MDLZ_StoryBoard_GetStorySlides]";

        public static string StoryBoard_GetUsers = "[USP_MDLZ_StoryBoard_GetUsers]";

        public static string StoryBoard_DeleteStory = "[USP_MDLZ_StoryBoard_DeleteStory]";

        public static string StoryBoard_DeleteSlide = "[USP_MDLZ_StoryBoard_DeleteSlide]";

        public static string StoryBoard_EditStoryName = "[USP_MDLZ_StoryBoard_EditStoryName]";

        public static string StoryBoard_ShareStory = "[USP_MDLZ_StoryBoard_ShareStory]";

        public static string StoryBoard_SaveASNewStory = "[USP_MDLZ_StoryBoard_SaveASNewStory]";

        public static string StoryBoard_UpdateSlide = "[USP_MDLZ_StoryBoard_UpdateSlide]";

        public static string StoryBoard_SetLock = "[USP_MDLZ_StoryBoard_SetLock]";

        public static string StoryBoard_GetLockStatus = "[USP_MDLZ_StoryBoard_GetLockStatus]";

        public static string Available_TimePeriod_Data = "[USP_MDLZ_GET_AVAILABLE_TIMEPERIOD_DATA]";

        public static string Available_Brand_Segment_Data = "[USP_mdlz_AvailableBrandSegment]";

        public static string Get_MySelections_Multiple = "[USP_mdlz_GetModule_Selections_Multiple]";

        public static string SaveModule_Selections = "[USP_mdlz_SaveModule_Selections]";

        public static string DeleteModule_Selections = "[USP_mdlz_DeleteModule_Selections]";

        public static string GetSubscriptionData = "[USP_mdlz_GetSubscriptionData]";

        public static string SaveSubscriptionData = "[USP_mdlz_SaveSubscriptionData]";

        public static string GetMailIdsToSendMailForReport = "[USP_MDLZ_GetMailIdsToSendMailForReport]";

        public static string UserTrackingDetail = "[USP_MDLZ_User_Tracking_InsertLog]";
        public static string GetMarketCategorynData = "[USP_mdlz_filter_Dataexplorer_MarketCategory]";
        //public static string GetCubeDDLData = "[USP_mdlz_filter_Dataexplorer_DependentOnMarketCategory]"; 
        public static string GetCubeDDLData = "[USP_mdlz_filter_Dataexplorer_DependentOnMarketCategory_test]";
        public static string GetCubeDDLDataHarmonized = "[USP_mdlz_filter_Dataexplorer_Harmonized]";
        //public static string GetDataExplorerOutput = "[USP_mdlz_dataexplorer_output_optimized]";
        public static string GetDataExplorerOutput = "[USP_mdlz_dataexplorer_output_optimized_new]";
        public static string GetDataExplorerOutputHarmonized = "[USP_mdlz_dataexplorer_output_Harmonized_optimized]";
        public static string GetUserDataExplorerModuleSelections = "[USP_mdlz_dataexplorer_GetLatestSelection]";
        public static int Command_Timeout =180;//default 30

        #endregion

        #region DB Parameters

        #endregion

        #region Other Constants
        public static string PPT_Text = "ppt";
        public static string Excel_Text = "excel";

        public static string Snapshot_Multi_Text = "Multi";
        public static string Snapshot_Single_Text = "Single";
        public static string Snapshot_Demog_Text = "Demog";
        
        public static string Snapshot_PPT_Template = "~/ExportTemplates/Snapshot/Snapshot_PPT_Template.pptx";
        public static string Snapshot_Multi_Excel_Template = "~/ExportTemplates/Snapshot/Snapshot_Multi_Excel_Template.xlsx";
        public static string Snapshot_Single_Excel_Template = "~/ExportTemplates/Snapshot/Snapshot_Single_Excel_Template.xlsx";
        public static string Snapshot_Demog_Single_Excel_Template = "~/ExportTemplates/Snapshot/Snapshot_Demog_Single_Excel_Template.xlsx";

        public static string DeepDive_Column_Template_PPT = "~/ExportTemplates/Deepdive/Deepdive_Column_Chart.pptx";
        public static string DeepDive_Bar_Template_PPT = "~/ExportTemplates/Deepdive/Deepdive_Bar_Chart.pptx";
        public static string DeepDive_Line_Template_PPT = "~/ExportTemplates/Deepdive/Deepdive_Line_Chart.pptx";
        public static string DeepDive_Top15_Column_Template_PPT = "~/ExportTemplates/Deepdive/Deepdive_Column_Top15.pptx";
        public static string DeepDive_Top15_Bar_Template_PPT = "~/ExportTemplates/Deepdive/Deepdive_Bar_Top15.pptx";
        public static string DeepDive_Top15_Line_Template_PPT = "~/ExportTemplates/Deepdive/Deepdive_Line_Top15.pptx";
        public static string DeepDive_PIT_Excel = "~/ExportTemplates/Deepdive/Deepdive_PIT.xlsx";
        public static string DeepDive_Trend_Excel = "~/ExportTemplates/Deepdive/Deepdive_Trend.xlsx";
        public static string CrossTab_Excel = "~/ExportTemplates/CrossTab/CrossTab_Excel_Template.xlsx";

        public static string GROWTH_PPT_Template = "~/ExportTemplates/GrowthOpportunity/GrowthOpportunity_PPT_Template.pptx";

        public static string BRAND_HIERARCHY_EXCEL_Template = "~/ExportTemplates/BrandHierarchy/Market_Category_Hierarchy.xlsx";
        public static string AVAILABLE_TIMEPERIOD_DATA_EXCEL_Template = "~/ExportTemplates/TimePeriodData/Available_TimePeriod_Data.xlsx";
        public static string AVAILABLE_BRAND_EXCEL_Template = "~/ExportTemplates/AvailableBrandSegment/Available Brands.xlsx";
        public static string AVAILABLE_BRAND_SEGMENT_EXCEL_Template = "~/ExportTemplates/AvailableBrandSegment/Available Brands & Segments.xlsx";

        public static string Column_Text = "column";
        public static string Bar_Text = "bar";
        public static string Line_Text = "line";

        public static string DeepdiveDownloadPath = "~/Temp/Deepdive/";
        public static string SnapshotDownloadPath = "~/Temp/Snapshot/";
        public static string CrossTabDownloadPath = "~/Temp/CrossTab/";
        public static string GrowthOpportunityDownloadPath = "~/Temp/Growth_Opportunity/";
        public static string StoryBoardbDownloadPath = "~/Temp/StoryBoard/";
        public static string BrandHierarchyDownloadPath = "~/Temp/BrandHierarchy/";
        public static string AvailableTimePeriodDataDownloadPath = "~/Temp/TimePeriodData/";

        public static string Snapshot_Contribution_Widget_Footer_Text="* Contribution (000)\n";
        public static string Snapshot_Map_Widget_Footer_Text = "* Size of channel/retailer denotes the Value (000 €)\n";

        public static int Low_SampleSize_Value = 20;
        public static int SampleSize_Value = 70;

        public static string DBNullValueExcel = "NA";
        public static int CrossTab_UILITMIT = 50000;
        public static string CrossTab_UILITMITExceeded = "Limit Exceeded";
        public static string CrossTab_FailedDataLoad = "Data Load Failed";
        public static string Contribution_Text = "Contib.";
        public static string Map_Text = "Map";
        public static string Share_Text = "Share";
        public static string Trend_Text = "Trend";
        public static string Brand_TimePeriod_Text = "Brand/Time Period";
        public static string MeasureTree_Text = "Measure Tree";
        public static string Value_Text = "Value";
        public static string Penetration_Text = "Penetration";
        public static string Volume_Text = "Volume";
        public static string Frequency_Text = "Frequency";
        public static string Snapshot_Excel_Title_Penetration_Text = "Penetration Percentage across the years";
        public static string Snapshot_Excel_Title_Euros_Text = "Value (000 €)";
        public static string Split_Drive_Text = "Splits Drive";
        public static string Value_Split_Text = "Value (000 €) Splits";
        public static string LowSampleSizeFotter = "Sample size less than 20: * (low sample), Sample size 20 – 70: Numbers in Grey.";
        public static string MarketGermanyFotter = "Panel data is not consistent in Germany with Cheese having Household Panel data and Chocolate & Biscuits having individual panel data.";
        #endregion

    }
}
