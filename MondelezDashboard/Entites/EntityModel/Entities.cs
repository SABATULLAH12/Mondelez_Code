using System.Collections.Generic;

namespace Entites
{
    public class ErrorMessage
    {
        public string message { get; set; }
    }
    public class Token
    {
        public string value { get; set; }
        public int epoch { get; set; }
    }
    public class LoginInfo
    {
        public bool IsAuthenticated { get; set; }
        public AuthUserDetails UserInfo { get; set; }
        public LoginInfo()
        {
            IsAuthenticated = false;
            UserInfo = new AuthUserDetails();
        }
        public LoginInfo(bool isAuthenticated, AuthUserDetails user)
        {
            IsAuthenticated = isAuthenticated;
            UserInfo = user;
        }
    }

    public class AuthUserDetails
    {
        public AuthUserDetails()
        {
            IsSSO = false;
        }
        public string FirstName { get; set; }
        public int UserId { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public bool IsSSO { get; set; }
    }

    public class AuthUserRole
    {
        public string User_ROLE { get; set; }
    }
    public class LoginRequest
    {
        public string UserName { get; set; }
    }

    public class LoginResponse
    {
        public bool isValidUser { get; set; }
    }

    public class LatestTimePeriod
    {
        public string MarketName { get; set; }
        public string CategoryName { get; set; }
        public string TimePeriodName { get; set; }
    }
    public class FilterDeletionRequest
    {
        public bool IsStory{ get; set; }
        public string SelectionId { get; set; }
        public bool IsTagOrSelection { get; set; }
    }
    

    public class FilterSelectionRequest
    {
        public int moduleId { get; set; }
        public string moduleName { get; set; }
        public int userId { get; set; }
        public int? TagOrStoryId { get; set; }
        public bool IsTag { get; set; }
        public string TagName { get; set; }
        public string selection { get; set; }
        public string selectionTitle { get; set; }
        public string selectionParameters { get; set; }
        public string FooterText { get; set; }
    }

    public class FilterData
    {
        public IList<LevelData> Data { get; set; }
        public IList<SelectionData> SelectionData { get; set; }
    }
    public class LevelData
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public IList<FilterStructure> Data { get; set; }
        public bool IsSelectable { get; set; }
        public int MapId { get; set; }
    }
    public class SelectionData
    {
        public string Name { get; set; }

        public string Selection { get; set; }

    }
    public class FilterStructure
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public IList<object> Data { get; set; }
    }
    public class Level2Structure
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public bool IsSelectable { get; set; }
        public bool IsOpen { get; set; }
        public int? ParentId { get; set; }
        public IList<Level2Structure> Data { get; set; }
        public bool IsLeaf { get; set; }
        public int CountryId { get; set; }
        public int CategoryId { get; set; }
        public bool IsHarmonized { get; set; }
        public bool OnlyInCrossTab { get; set; }
        public bool IsChannelOnlyMetric { get; set; }
    }
    public class DBStructure
    {
        public int Id { get; set; }
        public int IsHidden { get; set; }
        public int IsLastLevel { get; set; }
        public int IsSelectable { get; set; }
        public string DisplayName { get; set; }
        public string Name { get; set; }
        public int ParentId { get; set; }
        public int CategoryId { get; set; }
        public int CountryId { get; set; }
        public int IsOpen { get; set; }
        public int IsHarmonized { get; set; }
        public int OnlyInCrossTab { get; set; }
        public int IsChannelOnlyMetric { get; set; }
        public int type { get; set; }
        public int brandTabId { get; set; }
    }
    public class DBStructure2
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public int IsSelectable { get; set; }
        public int IsLastLevel { get; set; }
        public int IsHidden { get; set; }
        public int IsHarmonized { get; set; }
        public int OnlyInCrossTab { get; set; }
        public string DisplayName { get; set; }
        public int ParentId { get; set; }
        public int SegmentType { get; set; }
        public IList<int> Austria { get; set; }
        public IList<int> Belgium { get; set; }
        public IList<int> CzechRepublic { get; set; }
        public IList<int> France { get; set; }
        public IList<int> Germany { get; set; }
        public IList<int> Ireland { get; set; }
        public IList<int> Italy { get; set; }
        public IList<int> Netherlands { get; set; }
        public IList<int> Norway { get; set; }
        public IList<int> Poland { get; set; }
        public IList<int> Russia { get; set; }
        public IList<int> Spain { get; set; }
        public IList<int> Sweden { get; set; }
        public IList<int> UK { get; set; }
        public int SortID { get; set; }
    }
    public class Brand
    {
        public List<BrandEntity> Brands { get; set; }
        public Brand()
        {
            Brands = new List<BrandEntity>();
        }
    }
    public class BrandEntity
    {
        public string CountryId { get; set; }
        public string CategoryId { get; set; }
        public string BrandId { get; set; }
        public string BrandName { get; set; }
    }
    public class SegmentEntity
    {
        public string CountryId { get; set; }
        public string CategoryId { get; set; }
        public string SegmentId { get; set; }
        public int Type { get; set; }
        public string SegmentName { get; set; }
    }
    public class BrandLevelData
    {
        public string MarketName { get; set; }
        public string CategoryName { get; set; }
        public List<BrandLevel> Data { get; set; }
    }
    public class BrandLevel
    {
        public string BrandName { get; set; }
        public string LevelId { get; set; }
    }
    public class ReportsHubData
    {
        public IList<LevelData> Data { get; set; }
        public IList<string> ReportLinks { get; set; }
        public object UserROle { get; set; }
    }
    public class UserRoleData
    {
        public object User_Role { get; set; }
    }
    public class ModuleMultiSelection
    {
        public IList<TagList> Tags { get; set; }
        public IList<StoryList> Storys { get; set; }
        public IList<TagStoryMappingList> TagSelectionMapping { get; set; }
        public IList<TagStoryMappingList> StorySelectionMapping { get; set; }
    }
    public class TagList
    {
        public int Id { get; set; }
        public string TagName { get; set; }
    }
    public class StoryList
    {
        public int Id { get; set; }
        public string StoryName { get; set; }
        public int CurUserId { get; set; }
        public string CreatedUserName { get; set; }
        public int CreatedBy { get; set; }
        public bool IsShared { get; set; }
    }
    public class TagStoryMappingList
    {
        public string TagName { get; set; }
        public int TagId { get; set; }
        public int SelectionId { get; set; }
        public int UserId { get; set; }
        public int ModuleId { get; set; }
        public string SelectionTitle { get; set; }
        public string Selection { get; set; }
        public string SelectionParameters { get; set; }
        public string FooterText { get; set; }
    }
    public class SubscriptionEntity
    {
        public string CountryId { get; set; }
        public string CategoryId { get; set; }
        public string DisplayName { get; set; }
        public bool IsSubscribedToReport { get; set; }
        public bool IsSubscribedToDataLoad { get; set; }
    }
    public class SubscriptionData
    {
        public List<SubscriptionEntity> SubscriptionDataList { get; set; }
    }
    public class CubeReq
    {
        public string marketId { get; set; }
        public string categoryId { get; set; }
        public string cube { get; set; }
        public bool isHarmonized { get; set; }

    }
    public class ExcelSelectionData
    {
        public string Name { get; set; }

        public string Selection { get; set; }
        public string   IsSave { get; set; }

    }
    //public class UserTrackingDetails
    //{

    //    public int moduleId { get; set; }
    //    public int sessionId { get; set; }
    //    public string Email { get; set; }
    //    public string FirstName { get; set; }
    //    public string LastName { get; set; }
    //    public string selection { get; set; }

    //}
}
