using DAL;
using Entites;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Drawing;
using OfficeOpenXml.Style;
using OfficeOpenXml;
using System.Web;
using System.IO;
using Entites.EntityModel;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Reflection;

namespace BAL
{
    public class FilterPanel : IFilterPanel
    {
        internal readonly IUnitOfWork _unitOfWork;
        public FilterPanel(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public bool SubmitFilterData(int ModuleId,string Selection,int UserId)
        {
            bool Success = _unitOfWork.GetRepository<IFilterPanelRepository>().SaveModuleSelection(UserId, ModuleId, Selection);
            return Success;
        }

        public FilterData FilterPanalData(int UserId)
        {
            FilterData filterData = new FilterData();
            DataSet ModuleSelection = _unitOfWork.GetRepository<IFilterPanelRepository>().GetModuleSelection(UserId);
            try
            {
                if (ModuleSelection != null)
                {
                    filterData.SelectionData = new List<SelectionData>();
                    filterData.SelectionData = ModuleSelection.Tables[0].AsEnumerable().Select(item => new SelectionData
                    {
                        Name = item["ModuleName"].ToString(),
                        Selection = item["Selection"].ToString()
                    }).ToList();
                }
            }
            catch (Exception ex)
            {

            }
            DataSet ds = _unitOfWork.GetRepository<IFilterPanelRepository>().GetFilterPanalData(null);
            filterData.Data = new List<LevelData>();
            filterData.Data.Add(new LevelData()
            {
                Name = "Level1",
                Data = { }
            });
            filterData.Data.Add(new LevelData()
            {
                Name = "Level2",
                Data = new List<FilterStructure>()
            });
            try
            {
                if (ds != null)
                {
                    filterData.Data[1].Data.Add(new FilterStructure()
                    {
                        Id = 0,
                        Name = "snapshottype",
                        Data = FormatParentData(TableToList(ds.Tables[0]))
                    });

                    filterData.Data[1].Data.Add(new FilterStructure()
                    {
                        Id = 1,
                        Name = "compare",
                        Data = FormatParentData(TableToList(ds.Tables[1]))
                    });

                    filterData.Data[1].Data.Add(new FilterStructure()
                    {
                        Id = 3,
                        Name = "markets",
                        Data = FormatParentData(TableToList(ds.Tables[2]))
                    });

                    filterData.Data[1].Data.Add(new FilterStructure()
                    {
                        Id = 4,
                        Name = "category",
                        Data = FormatParentData(TableToList(ds.Tables[3]))
                    });

                    filterData.Data[1].Data.Add(new FilterStructure()
                    {
                        Id = 5,
                        Name = "timeperiod",
                        Data = TableToListDbStructure2(ds.Tables[4]).Cast<object>().ToList()
                    });

                    filterData.Data[1].Data.Add(new FilterStructure()
                    {
                        Id = 6,
                        Name = "Brands",
                        Data = TableToList(ds.Tables[5]).Cast<object>().ToList()
                    });

                    filterData.Data[1].Data.Add(new FilterStructure()
                    {
                        Id = 7,
                        Name = "segments",
                        Data = TableToList(ds.Tables[6]).Cast<object>().ToList()
                    });

                    filterData.Data[1].Data.Add(new FilterStructure()
                    {
                        Id = 8,
                        Name = "kpi",
                        Data = FormatParentData(TableToList(ds.Tables[7]))
                    });

                    filterData.Data[1].Data.Add(new FilterStructure()
                    {
                        Id = 9,
                        Name = "channel",
                        Data = TableToListDbStructure2(ds.Tables[8]).Cast<object>().ToList()
                    });

                    filterData.Data[1].Data.Add(new FilterStructure()
                    {
                        Id = 10,
                        Name = "demographics",
                        Data = TableToListDbStructure2(ds.Tables[9]).Cast<object>().ToList()
                    });

                    filterData.Data[1].Data.Add(new FilterStructure()
                    {
                        Id = 11,
                        Name = "rows",
                        Data = FormatParentData(TableToList(ds.Tables[10]))
                    });
                    //only for growth opportunity
                    filterData.Data[1].Data.Add(new FilterStructure()
                    {
                        Id = 12,
                        Name = "Brand",
                        Data = TableToList(ds.Tables[11]).Cast<object>().ToList()
                    });

                    filterData.Data[1].Data.Add(new FilterStructure()
                    {
                        Id = 13,
                        Name = "column",
                        Data = FormatParentData(TableToList(ds.Tables[12]))
                    });
                }
            }
            catch (Exception ex)
            {
                Log.LogException(ex);
            }
            return filterData;
        }

        public IList<DBStructure> TableToList(DataTable dataTable)
        {
            try
            {
                return dataTable.AsEnumerable().Select(item => new DBStructure
                {
                    Id = Convert.ToInt32(item["Id"]),
                    Name = item["Name"].ToString(),
                    DisplayName = item["DisplayName"].ToString(),
                    IsLastLevel = Convert.ToInt32(item["IsLastLevel"]),
                    IsSelectable = Convert.ToInt32(item["IsSelectable"]),
                    ParentId = Convert.ToInt32(item["ParentId"]),
                    IsHidden = dataTable.Columns.Contains("IsHidden") ? Convert.ToInt32(item["IsHidden"]) : 0,
                    type = dataTable.Columns.Contains("type") ? Convert.ToInt32(item["type"]) : -1,
                    CountryId = dataTable.Columns.Contains("CountryId") ? Convert.ToInt32(item["CountryId"]) : 0,
                    CategoryId = dataTable.Columns.Contains("CategoryId") ? Convert.ToInt32(item["CategoryId"]) : 0,
                    IsHarmonized = dataTable.Columns.Contains("IsHarmonized") ? Convert.ToInt32(item["IsHarmonized"]) : 0,
                    brandTabId = dataTable.Columns.Contains("brandTabId") ? item["brandTabId"]==DBNull.Value?-1:Convert.ToInt32(item["brandTabId"]) : 0,
                    OnlyInCrossTab = dataTable.Columns.Contains("OnlyInCrossTab") ? Convert.ToInt32(item["OnlyInCrossTab"]) : 0,
                    IsChannelOnlyMetric = dataTable.Columns.Contains("IsChannelOnlyMetric") ? Convert.ToInt32(item["IsChannelOnlyMetric"]) : 0
                }).ToList();
            }

            catch (Exception ex)
            {
                return null;
            }

        }
        

        public IList<DBStructure2> TableToListDbStructure2(DataTable dataTable)
        {
            try
            {
                return dataTable.AsEnumerable().Select(item => new DBStructure2
                {
                    Id = Convert.ToInt32(item["ID"]),
                    Name = item["Name"].ToString(),
                    DisplayName = item["DisplayName"].ToString(),
                    IsLastLevel = Convert.ToInt32(item["IsLastLevel"]),
                    IsSelectable = Convert.ToInt32(item["IsSelectable"]),
                    ParentId = Convert.ToInt32(item["ParentId"]),
                    IsHarmonized = dataTable.Columns.Contains("IsHarmonized") ? Convert.ToInt32(item["IsHarmonized"]) : 0,
                    IsHidden = dataTable.Columns.Contains("IsHidden") ? Convert.ToInt32(item["IsHidden"]) : 0,
                    SegmentType = dataTable.Columns.Contains("SegmentType") ? Convert.ToInt32(item["SegmentType"]):-1,
                    Austria = SplitString(item["Austria"].ToString(),','),
                    Belgium = SplitString(item["Belgium"].ToString(), ','),
                    France = SplitString(item["France"].ToString(), ','),
                    CzechRepublic = SplitString(item["Czech Republic"].ToString(), ','),
                    Germany = SplitString(item["Germany"].ToString(), ','),
                    Ireland = SplitString(item["Ireland"].ToString(), ','),
                    Italy = SplitString(item["Italy"].ToString(), ','),
                    Netherlands = SplitString(item["Netherlands"].ToString(), ','),
                    Norway = SplitString(item["Norway"].ToString(), ','),
                    Poland = SplitString(item["Poland"].ToString(), ','),
                    Russia = SplitString(item["Russia"].ToString(), ','),
                    Spain = SplitString(item["Spain"].ToString(), ','),
                    Sweden = SplitString(item["Sweden"].ToString(), ','),
                    UK = SplitString(item["UK"].ToString(), ','),
                    SortID = Convert.ToInt32(item["SortID"]),
                }).ToList();
            }

            catch (Exception ex)
            {
                return null;
            }

        }
        public IList<int> SplitString(string stringlist, char identifier)
        {
            var completelist = stringlist.Split(identifier).ToList<string>();
            IList<int> RevisedList = new List<int>();
            foreach(var i in completelist)
            {
                int x;
                if(int.TryParse(i, out x)){
                    RevisedList.Add(x);
                }
            }
            return RevisedList;
        } 

        public List<object> FormatParentData(IList<DBStructure> data)
        {
            IList<Level2Structure> List = new List<Level2Structure>();

            try
            {
                int index = 0, Datacount = data.Count;
                for (index = 0; index < Datacount; index++)
                {
                    if (data[index].Id == data[index].ParentId)
                    {
                        List.Add(new Level2Structure()
                        {
                            Id = data[index].Id,
                            Name = data[index].Name,
                            IsSelectable = data[index].IsSelectable == 1,
                            IsOpen = false,
                            ParentId = data[index].ParentId,
                            DisplayName = data[index].DisplayName,
                            Data = data[index].IsLastLevel == 0 ? FormatChildData(data[index].Id, data) : null,
                            IsLeaf = data[index].IsLastLevel == 1,
                            CategoryId = data[index].CategoryId,
                            CountryId = data[index].CountryId,
                            IsChannelOnlyMetric = data[index].IsChannelOnlyMetric == 1,
                            IsHarmonized = data[index].IsHarmonized == 1,
                            OnlyInCrossTab = data[index].OnlyInCrossTab == 1
                        });
                    }

                }
            }
            catch (Exception ex)
            {

            }
            return List.Cast<object>().ToList();

        }
        public IList<Level2Structure> FormatChildData(int parentid, IList<DBStructure> data)
        {
            IList<Level2Structure> List = new List<Level2Structure>();
            int index = 0, Datacount = data.Count;
            for (index = 0; index < Datacount; index++)
            {
                if (parentid == data[index].ParentId && data[index].Id != data[index].ParentId)
                {
                    List.Add(new Level2Structure()
                    {
                        Id = data[index].Id,
                        Name = data[index].Name,
                        IsSelectable = data[index].IsSelectable == 1,
                        ParentId = data[index].ParentId,
                        DisplayName = data[index].DisplayName,
                        Data = data[index].IsLastLevel == 0 ? FormatChildData(data[index].Id, data) : null,
                        IsLeaf = data[index].IsLastLevel == 1,
                        CategoryId = data[index].CategoryId,
                        CountryId = data[index].CountryId,
                        IsChannelOnlyMetric = data[index].IsChannelOnlyMetric == 1,
                        IsHarmonized = data[index].IsHarmonized == 1,
                        OnlyInCrossTab = data[index].OnlyInCrossTab == 1
                    });
                }

            }
            return List;
        }
        public string BrandHierarchyExcel(BrandLevelData request)
        {
            string fileName = string.Empty;
            var templatePath = Constants.BRAND_HIERARCHY_EXCEL_Template;

            fileName = GenerateBrandHierarchyExcel(request, templatePath);

            return fileName;
        }
        public string AvailableBrandSegmentsData(bool IsSegement)
        {
            string fileName = string.Empty;
            var templatePath = "";
            string tempFolderName = GenerateRandomString(15);
            string tempFileName = "";
            if (IsSegement)
            {
                templatePath = Constants.AVAILABLE_BRAND_SEGMENT_EXCEL_Template;
                tempFileName = "Mondelez_Available_Brand_Segment(" + System.DateTime.Now.ToString("MM-dd-yyyy") + "_" + System.DateTime.Now.ToString("HH-mm-ss") + ").xlsx";
            }
            else
            {
                templatePath = Constants.AVAILABLE_BRAND_EXCEL_Template;
                tempFileName = "Mondelez_Available_Brand(" + System.DateTime.Now.ToString("MM-dd-yyyy") + "_" + System.DateTime.Now.ToString("HH-mm-ss") + ").xlsx";
            }
            templatePath = HttpContext.Current.Server.MapPath(templatePath);
            if (Directory.Exists(System.Web.HttpContext.Current.Server.MapPath(Constants.AvailableTimePeriodDataDownloadPath + tempFolderName)))
                Directory.Delete(System.Web.HttpContext.Current.Server.MapPath(Constants.AvailableTimePeriodDataDownloadPath + tempFolderName), true);
            Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath(Constants.AvailableTimePeriodDataDownloadPath + tempFolderName));
            string tempFilePath = System.Web.HttpContext.Current.Server.MapPath(Constants.AvailableTimePeriodDataDownloadPath + tempFolderName + "/" + tempFileName);

            File.Copy(templatePath, tempFilePath);
            var file = new FileInfo(tempFilePath);

            DataSet dSet = _unitOfWork.GetRepository<IFilterPanelRepository>().AvailableBrandSegmentsData(IsSegement);
            DataTable brandsTable = dSet.Tables[0],Segment1Table = new DataTable(), Segment2Table = new DataTable();
            if (IsSegement)
            {
                Segment1Table = dSet.Tables[1];
                Segment2Table = dSet.Tables[2];
            }
            int _row = 2, _col = 2;

            using (ExcelPackage package = new ExcelPackage(file))
            {
                ExcelWorksheet ws1 = package.Workbook.Worksheets[1];
                var r1 = ws1.Cells[_row, _col];
                int rowCount = brandsTable.Rows.Count;

                #region Brand Table values
                _row = 2;
                _col = 2;

                for (int i = 0; i < rowCount; i++)
                {
                    DataRow dRow = brandsTable.Rows[i];
                    
                    //Country Update
                    _col = 2;
                    r1 = ws1.Cells[_row, _col];
                    r1.RichText.Clear();
                    ws1.Cells[_row, _col].Value = dRow["COUNTRYDISPNAME"].ToString();

                    //Category Update
                    _col = _col + 1;
                    r1 = ws1.Cells[_row, _col];
                    r1.RichText.Clear();
                    ws1.Cells[_row, _col].Value = dRow["CATEGORYDISPNAME"].ToString();

                    //TimePeriod Name Update
                    _col = _col + 1;
                    r1 = ws1.Cells[_row, _col];
                    r1.RichText.Clear();
                    ws1.Cells[_row, _col].Value = dRow["PARENT"].ToString();
                    
                    //BrandName
                    _col = _col + 1;
                    r1 = ws1.Cells[_row, _col];
                    r1.RichText.Clear();
                    ws1.Cells[_row, _col].Value = dRow["NAME"].ToString();

                    _row = _row + 1;
                }
                #endregion

                #region Segment

                rowCount = Segment1Table.Rows.Count;

                if (IsSegement)
                {
                    #region Segment 1 Table values
                    _row = 2;
                    _col = 8;

                    for (int i = 0; i < rowCount; i++)
                    {
                        DataRow dRow = Segment1Table.Rows[i];

                        //Country Update
                        _col = 8;
                        r1 = ws1.Cells[_row, _col];
                        r1.RichText.Clear();
                        ws1.Cells[_row, _col].Value = dRow["COUNTRYDISPNAME"].ToString();

                        //Category Update
                        _col = _col + 1;
                        r1 = ws1.Cells[_row, _col];
                        r1.RichText.Clear();
                        ws1.Cells[_row, _col].Value = dRow["CATEGORYDISPNAME"].ToString();

                        //TimePeriod Name Update
                        _col = _col + 1;
                        r1 = ws1.Cells[_row, _col];
                        r1.RichText.Clear();
                        ws1.Cells[_row, _col].Value = dRow["PARENT"].ToString();

                        //BrandName
                        _col = _col + 1;
                        r1 = ws1.Cells[_row, _col];
                        r1.RichText.Clear();
                        ws1.Cells[_row, _col].Value = dRow["NAME"].ToString();

                        _row = _row + 1;
                    }
                    #endregion

                    #region segment2 Table values
                    _row = 2;
                    _col = 14;
                    rowCount = Segment2Table.Rows.Count;

                    for (int i = 0; i < rowCount; i++)
                    {
                        DataRow dRow = Segment2Table.Rows[i];

                        //Country Update
                        _col = 14;
                        r1 = ws1.Cells[_row, _col];
                        r1.RichText.Clear();
                        ws1.Cells[_row, _col].Value = dRow["COUNTRYDISPNAME"].ToString();

                        //Category Update
                        _col = _col + 1;
                        r1 = ws1.Cells[_row, _col];
                        r1.RichText.Clear();
                        ws1.Cells[_row, _col].Value = dRow["CATEGORYDISPNAME"].ToString();

                        //TimePeriod Name Update
                        _col = _col + 1;
                        r1 = ws1.Cells[_row, _col];
                        r1.RichText.Clear();
                        ws1.Cells[_row, _col].Value = dRow["PARENT"].ToString();

                        //BrandName
                        _col = _col + 1;
                        r1 = ws1.Cells[_row, _col];
                        r1.RichText.Clear();
                        ws1.Cells[_row, _col].Value = dRow["NAME"].ToString();

                        _row = _row + 1;
                    }
                    #endregion
                }
                #endregion

                ws1.Hidden = eWorkSheetHidden.Hidden;

                package.Save();
            }
            return (Constants.AvailableTimePeriodDataDownloadPath.Replace("~", "..") + tempFolderName + "/" + tempFileName);
        }
        public string GenerateBrandHierarchyExcel(BrandLevelData request, string templatePath)
        {
            string tempFolderName = GenerateRandomString(15);
            string tempFileName = "Mondelez_BrandHierarchy(" + System.DateTime.Now.ToString("MM-dd-yyyy") + "_" + System.DateTime.Now.ToString("HH-mm-ss") + ").xlsx";
            templatePath = HttpContext.Current.Server.MapPath(templatePath);
            if (Directory.Exists(System.Web.HttpContext.Current.Server.MapPath(Constants.BrandHierarchyDownloadPath + tempFolderName)))
                Directory.Delete(System.Web.HttpContext.Current.Server.MapPath(Constants.BrandHierarchyDownloadPath + tempFolderName), true);
            Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath(Constants.BrandHierarchyDownloadPath + tempFolderName));
            string tempFilePath = System.Web.HttpContext.Current.Server.MapPath(Constants.BrandHierarchyDownloadPath + tempFolderName + "/" + tempFileName);

            File.Copy(templatePath, tempFilePath);
            var file = new FileInfo(tempFilePath);

            int _row = 0, _col = 0;
            using (ExcelPackage package = new ExcelPackage(file))
            {
                ExcelWorksheet ws1 = package.Workbook.Worksheets[1]; ws1.Name = request.MarketName + " - " + request.CategoryName;

                #region Market and Category Name's update
                _row = 2;
                _col = 4;
                
                //Market
                var r1 = ws1.Cells[_row, _col];
                r1.RichText.Clear();
                r1.RichText.Add(request.MarketName);
                r1.Style.Font.Bold = true;

                //Category
                _row = _row + 1;
                r1 = ws1.Cells[_row, _col];
                r1.RichText.Clear();
                r1.RichText.Add(request.CategoryName);
                r1.Style.Font.Bold = true;              
                #endregion

                #region Table values
                _row = 6;
                _col = 3;

                for (int i = 0; i < request.Data.Count; i++)
                {
                    //LevelId Update
                    _col = 3;
                    r1 = ws1.Cells[_row, _col];
                    r1.RichText.Clear();
                    ws1.Cells[_row, _col].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    ws1.Cells[_row, _col].Value = Convert.ToInt32(request.Data[i].LevelId);
                    ws1.Cells[_row, _col].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    r1.Style.Numberformat.Format = "#,##0";
                    r1.Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));

                    //Brand Name Update
                    _col = _col + 1;
                    r1 = ws1.Cells[_row, _col];
                    r1.RichText.Clear();
                    ws1.Cells[_row, _col].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    ws1.Cells[_row, _col].Value = request.Data[i].BrandName;
                    r1.Style.Indent = Convert.ToInt32(request.Data[i].LevelId) - 1;
                    ws1.Cells[_row, _col].Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                    r1.Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));

                    _row = _row + 1;
                }

                #endregion

                ws1.Cells.AutoFitColumns();
                package.Save();
            }
            return (Constants.BrandHierarchyDownloadPath.Replace("~", "..") + tempFolderName + "/" + tempFileName);
        }
        public string AvailableTimePeriodData(int ModuleId)
        {
            string fileName = string.Empty;
            var templatePath = Constants.AVAILABLE_TIMEPERIOD_DATA_EXCEL_Template;

            string tempFolderName = GenerateRandomString(15);
            string tempFileName = "Mondelez_Market-Category-TimePeriod(" + System.DateTime.Now.ToString("MM-dd-yyyy") + "_" + System.DateTime.Now.ToString("HH-mm-ss") + ").xlsx";
            templatePath = HttpContext.Current.Server.MapPath(templatePath);
            if (Directory.Exists(System.Web.HttpContext.Current.Server.MapPath(Constants.AvailableTimePeriodDataDownloadPath + tempFolderName)))
                Directory.Delete(System.Web.HttpContext.Current.Server.MapPath(Constants.AvailableTimePeriodDataDownloadPath + tempFolderName), true);
            Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath(Constants.AvailableTimePeriodDataDownloadPath + tempFolderName));
            string tempFilePath = System.Web.HttpContext.Current.Server.MapPath(Constants.AvailableTimePeriodDataDownloadPath + tempFolderName + "/" + tempFileName);

            File.Copy(templatePath, tempFilePath);
            var file = new FileInfo(tempFilePath);

            DataSet dSet = _unitOfWork.GetRepository<IFilterPanelRepository>().AvailableTimePeriodData();
            DataTable dTable = dSet.Tables[0];
            int _row = 2, _col = 2;

            using (ExcelPackage package = new ExcelPackage(file))
            {
                ExcelWorksheet ws1 = package.Workbook.Worksheets[1];
                var r1 = ws1.Cells[_row, _col];
                int rowCount = dTable.Rows.Count;

                #region Table values
                _row = 2;
                _col = 2;

                for (int i = 0; i < rowCount; i++)
                {
                    DataRow dRow = dTable.Rows[i];

                    //if ((ModuleId == 1 || ModuleId == 2) && dRow["IsCrossTabOnly"].ToString() == "1")
                    //{
                    //    continue;
                    //}

                    //Country Update
                    _col = 2;
                    r1 = ws1.Cells[_row, _col];
                    r1.RichText.Clear();
                    ws1.Cells[_row, _col].Value = dRow["Country"].ToString();

                    //Category Update
                    _col = _col + 1;
                    r1 = ws1.Cells[_row, _col];
                    r1.RichText.Clear();
                    ws1.Cells[_row, _col].Value = dRow["Category"].ToString();

                    //TimePeriod Type Update
                    _col = _col + 1;
                    r1 = ws1.Cells[_row, _col];
                    r1.RichText.Clear();
                    ws1.Cells[_row, _col].Value = dRow["Type"].ToString();

                    //TimePeriod Name Update
                    _col = _col + 1;
                    r1 = ws1.Cells[_row, _col];
                    r1.RichText.Clear();
                    ws1.Cells[_row, _col].Value = dRow["Name"].ToString();

                    _row = _row + 1;
                }
                ws1.Hidden = eWorkSheetHidden.Hidden;
                #endregion
                package.Save();
            }
            return (Constants.AvailableTimePeriodDataDownloadPath.Replace("~", "..") + tempFolderName + "/" + tempFileName);
        }
        public static string GenerateRandomString(int length)
        {
            var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            var result = new string(
                Enumerable.Repeat(chars, Convert.ToInt32(length))
                          .Select(s => s[random.Next(s.Length)])
                          .ToArray());
            return result.ToString();

        }
        public ModuleMultiSelection GetMySelections(string userID,string ModuleId)
        {
            DataSet dSet = _unitOfWork.GetRepository<IFilterPanelRepository>().GetMySelections(userID,ModuleId);
            ModuleMultiSelection moduleMultiSelection = new ModuleMultiSelection();
            DataTable tbl = dSet.Tables[0];
            moduleMultiSelection.Tags = (from r in tbl.AsEnumerable()
                        select new TagList
                        {
                            Id = tbl.Columns.Contains("Id") ? Convert.ToInt32(r["Id"]):-1,
                            TagName = tbl.Columns.Contains("TagName") ? r["TagName"].ToString():null,
                        }).ToList();
            tbl = dSet.Tables[1];
            moduleMultiSelection.Storys = (from r in tbl.AsEnumerable()
                                           select new StoryList
                                           {
                                               Id = tbl.Columns.Contains("storyId") ? Convert.ToInt32(r["storyId"]) : -1,
                                               StoryName = tbl.Columns.Contains("StoryName") ? r["StoryName"].ToString() : null,
                                               CreatedUserName = tbl.Columns.Contains("CreatedUserName") ? r["CreatedUserName"].ToString() : null,
                                               CurUserId = tbl.Columns.Contains("CURRENTUSER") ? Convert.ToInt32(r["CURRENTUSER"]) : -1,
                                               CreatedBy = tbl.Columns.Contains("CreatedBy") ? Convert.ToInt32(r["CreatedBy"]) : -1,
                                               IsShared = Convert.ToBoolean(r["IsShared"]),
                                           }).ToList();
            tbl = dSet.Tables[2];
            moduleMultiSelection.TagSelectionMapping = (from r in tbl.AsEnumerable()
                                           select new TagStoryMappingList
                                           {
                                              ModuleId = tbl.Columns.Contains("ModuleId") ? Convert.ToInt32(r["ModuleId"]) : -1,
                                              Selection = tbl.Columns.Contains("Selection") ? r["Selection"].ToString() : null,
                                              SelectionId = tbl.Columns.Contains("SelectionId") ? Convert.ToInt32(r["SelectionId"]) : -1,
                                              SelectionParameters = tbl.Columns.Contains("SelectionParameters") ? r["SelectionParameters"].ToString() : null,
                                              SelectionTitle = tbl.Columns.Contains("SelectionTitle") ? r["SelectionTitle"].ToString() : null,
                                              TagId = tbl.Columns.Contains("TagId") ? Convert.ToInt32(r["TagId"]) : -1,
                                              TagName = tbl.Columns.Contains("TagName") ? r["TagName"].ToString() : null,
                                              UserId = tbl.Columns.Contains("UserId") ? Convert.ToInt32(r["UserId"]) : -1,
                                               FooterText = tbl.Columns.Contains("FooterText") ? r["FooterText"].ToString() : null,
                                           }).ToList();
            tbl = dSet.Tables[3];
            moduleMultiSelection.StorySelectionMapping = (from r in tbl.AsEnumerable()
                                                        select new TagStoryMappingList
                                                        {
                                                            ModuleId = tbl.Columns.Contains("ModuleId") ? Convert.ToInt32(r["ModuleId"]) : -1,
                                                            Selection = tbl.Columns.Contains("Selection") ? r["Selection"].ToString() : null,
                                                            SelectionId = tbl.Columns.Contains("SelectionId") ? Convert.ToInt32(r["SelectionId"]) : -1,
                                                            SelectionParameters = tbl.Columns.Contains("SelectionParameters") ? r["SelectionParameters"].ToString() : null,
                                                            SelectionTitle = tbl.Columns.Contains("SelectionTitle") ? r["SelectionTitle"].ToString() : null,
                                                            TagId = tbl.Columns.Contains("storyId") ? Convert.ToInt32(r["storyId"]) : -1,
                                                            TagName = tbl.Columns.Contains("storyName") ? r["storyName"].ToString() : null,
                                                            UserId = tbl.Columns.Contains("UserId") ? Convert.ToInt32(r["UserId"]) : -1,
                                                            FooterText = tbl.Columns.Contains("FooterText") ? r["FooterText"].ToString() : null,
                                                        }).ToList();
            return moduleMultiSelection;
        }
        public bool SaveSelection(FilterSelectionRequest FObj)
        {
            return _unitOfWork.GetRepository<IFilterPanelRepository>().SaveSelection(FObj);
        }
        public bool DeleteSelection(string SelectionId,bool IsStory,bool ISTagOrSelection)
        {
            return _unitOfWork.GetRepository<IFilterPanelRepository>().DeleteSelection(SelectionId, IsStory, ISTagOrSelection);
        }
        public SubscriptionData GetSubscriptionData(int UserId)
        {
            SubscriptionData sData = new SubscriptionData();
            sData.SubscriptionDataList = new List<SubscriptionEntity>();
            DataSet dt = _unitOfWork.GetRepository<IFilterPanelRepository>().GetSubscriptionData(UserId);
            var tbl = dt.Tables[0];

            sData.SubscriptionDataList = (from r in tbl.AsEnumerable()
                      select new SubscriptionEntity()
                      {
                          CountryId = tbl.Columns.Contains("CountryId") ? Convert.ToString(r["CountryId"]) : null,
                          CategoryId = tbl.Columns.Contains("CategoryId") ? Convert.ToString(r["CategoryId"]) : null,
                          DisplayName = tbl.Columns.Contains("DisplayName") ? Convert.ToString(r["DisplayName"]) : null,
                          IsSubscribedToReport = tbl.Columns.Contains("IsSubscribedToReport") ? Convert.ToBoolean(r["IsSubscribedToReport"]) : false,
                          IsSubscribedToDataLoad = tbl.Columns.Contains("IsSubscribedToDataLoad") ? Convert.ToBoolean(r["IsSubscribedToDataLoad"]) : false,
                      }).ToList();

            return sData;
        }
        public bool SaveSubscriptionData(int UserId, SubscriptionData request)
        {
            DataTable dReport = CreateTable();
            DataTable dDataLoad = CreateTable();

            for(int i = 0; i < request.SubscriptionDataList.Count; i++)
            {
                DataRow dReportRow = dReport.NewRow();
                DataRow dDLRow = dDataLoad.NewRow();

                if(request.SubscriptionDataList[i].IsSubscribedToReport)
                {
                    dReportRow[0] = UserId;
                    dReportRow[1] = request.SubscriptionDataList[i].CountryId;
                    dReportRow[2] = request.SubscriptionDataList[i].CategoryId;
                    dReportRow[3] = request.SubscriptionDataList[i].IsSubscribedToReport;
                    dReport.Rows.Add(dReportRow);
                }
                if (request.SubscriptionDataList[i].IsSubscribedToDataLoad)
                {
                    dDLRow[0] = UserId;
                    dDLRow[1] = request.SubscriptionDataList[i].CountryId;
                    dDLRow[2] = request.SubscriptionDataList[i].CategoryId;
                    dDLRow[3] = request.SubscriptionDataList[i].IsSubscribedToDataLoad;
                    dDataLoad.Rows.Add(dDLRow);
                }
            }

            return _unitOfWork.GetRepository<IFilterPanelRepository>().SaveSubscriptionData(UserId, dReport, dDataLoad);
        }

        public DataTable CreateTable()
        {
            DataTable dt = new DataTable();
            DataColumn dc = new DataColumn("UserID", typeof(Int32));
            dt.Columns.Add(dc);

            dc = new DataColumn("CountryID", typeof(Int32));
            dt.Columns.Add(dc);

            dc = new DataColumn("CategoryID", typeof(Int32));
            dt.Columns.Add(dc);

            dc = new DataColumn("IsSubscribed", typeof(bool));
            dt.Columns.Add(dc);

            return dt;
        }

        public bool UserTrackingDetails(int userid,int moduleid,string selection)
        {
             return _unitOfWork.GetRepository<IFilterPanelRepository>().UserTrackingDetails(userid,moduleid, selection);
            
        }

        public MarketCategoryModel MarketCategoryData()
        {
            DataSet dSet = _unitOfWork.GetRepository<IFilterPanelRepository>().GetMarketCategoryData();
            MarketCategoryModel marketCategoryModel = new MarketCategoryModel();
            DataTable markettbl = dSet.Tables[0];
            DataTable categorytbl = dSet.Tables[1];
            
            marketCategoryModel.marketddl = (from r in markettbl.AsEnumerable()
                                         select new Marketddl
                                         {
                                             CountryId =  Convert.ToInt32(r["COUNTRYID"]) ,
                                             CountryName = r["COUNTRYDISPNAME"].ToString(),
                                             IsSelectable = Convert.ToInt32(r["IsSelectable"])
                                         }).ToList();
            marketCategoryModel.categoryddl = (from r in categorytbl.AsEnumerable()
                                             select new Categoryddl
                                             {
                                                 CategoryId = Convert.ToInt32(r["CATEGORYID"]),
                                                 CategoryName = r["CATEGORYDISPNAME"].ToString(),
                                                 CountryId = Convert.ToInt32(r["COUNTRYID"]),
                                                 IsSelectable = Convert.ToInt32(r["IsSelectable"])
                                             }).ToList();
            return marketCategoryModel;
        }

        public CubeDDL CubeDDLData(string marketId, string categoryId, string cube,bool isHarmonized)
        {
            DataSet dSet = _unitOfWork.GetRepository<IFilterPanelRepository>().GetCubeDDLData(marketId, categoryId,cube,isHarmonized);
            CubeDDL cubeDDL = new CubeDDL();
            switch (cube){
                case "Segment":
                    cubeDDL.Brands = JsonConvert.SerializeObject(dSet.Tables[0]);
                    cubeDDL.Segment1 = JsonConvert.SerializeObject(dSet.Tables[1]);
                    cubeDDL.Segment2 = JsonConvert.SerializeObject(dSet.Tables[2]);
                    cubeDDL.TimePeriod = JsonConvert.SerializeObject(dSet.Tables[3]);
                    cubeDDL.KPI = JsonConvert.SerializeObject(dSet.Tables[4]);
                    break;
                case "Demographics":
                    cubeDDL.Brands = JsonConvert.SerializeObject(dSet.Tables[0]);
                    cubeDDL.Segment1 = JsonConvert.SerializeObject(dSet.Tables[1]);
                    cubeDDL.Demographics = JsonConvert.SerializeObject(dSet.Tables[2]);
                    cubeDDL.TimePeriod = JsonConvert.SerializeObject(dSet.Tables[3]);
                    cubeDDL.KPI = JsonConvert.SerializeObject(dSet.Tables[4]);                    
                    break;
                case "Channel":
                    cubeDDL.Brands = JsonConvert.SerializeObject(dSet.Tables[0]);
                    cubeDDL.Segment1 = JsonConvert.SerializeObject(dSet.Tables[1]);
                    cubeDDL.Channel = JsonConvert.SerializeObject(dSet.Tables[2]);
                    cubeDDL.TimePeriod = JsonConvert.SerializeObject(dSet.Tables[3]);
                    cubeDDL.KPI = JsonConvert.SerializeObject(dSet.Tables[4]);
                    break;
            }
            

            return cubeDDL;
        }
        public DataExOutput GetDataByFilter(ExcelSelectionData selectionData)
        {
            DataSet dSet = _unitOfWork.GetRepository<IFilterPanelRepository>().GetDataExplorerTblData(selectionData, Convert.ToInt32(HttpContext.Current.Session["UserId"]));
            DataExOutput dataExOutput = new DataExOutput();
            dataExOutput.Selection = selectionData.Selection;
            JObject obj = JObject.Parse(selectionData.Selection);
            dataExOutput.selectionTextExcel = obj["selectionTextExcel"]?.ToString();
            JArray rowlist = (JArray)obj["rowList"];
            dataExOutput.RowList = SetLevel(rowlist);
            JArray columnlist = (JArray)obj["columnList"];
            dataExOutput.ColumnList = SetLevel(columnlist);
            var supress = string.IsNullOrEmpty(obj["supressZero"].ToString()) ? false : Convert.ToBoolean(obj["supressZero"]);
            dataExOutput.SupressZero = supress == true ? true : false;
            dataExOutput.DataExOutputTable = new List<DataExOutputTable>();
            foreach (DataRow dtRow in dSet.Tables[0].Rows)
            {
                DataExOutputTable dataExOutputTable = new DataExOutputTable();
                // On all tables' columns
                foreach (DataColumn dc in dSet.Tables[0].Columns)
                {
                    int roundby;
                    switch (dc.ColumnName.ToUpper())
                    {
                        case "ID":
                            dataExOutputTable.Id = Convert.ToInt32(dtRow[dc]);
                            break;
                        case "COUNTRY":
                            dataExOutputTable.Market = dtRow[dc].ToString();
                            break;
                        case "CATEGORY":
                            dataExOutputTable.Category = dtRow[dc].ToString();
                            break;
                        case "TIMEPERIODNAME":
                            dataExOutputTable.TimePeriod = dtRow[dc].ToString();
                            break;
                        case "BRAND":
                            dataExOutputTable.Brand = dtRow[dc].ToString();
                            break;
                        case "SEGMENT1":
                            dataExOutputTable.Segment1 = dtRow[dc].ToString();
                            break;
                        case "METRICNAME":
                            dataExOutputTable.KPI = dtRow[dc].ToString();
                            break;
                        //case "DIVISOR":
                        //   var  DIVISOR = Convert.ToInt32(dtRow[dc]);
                        //    dataExOutputTable.MVal = dataExOutputTable.MVal != null ? (double)dataExOutputTable.MVal/DIVISOR : dataExOutputTable.MVal;
                        //    break;
                        case "ROUNDBY":
                            checkRoundBy(dtRow, dc, dataExOutputTable);
                            break;
                        case "SYMBOLAPPENDED":
                            checksymbol(dtRow, dc, dataExOutputTable);
                            break;
                        case "LEVEL_BRAND":
                            dataExOutputTable.Level_Brand = Convert.ToInt32(dtRow[dc]);
                            break;
                        case "LEVEL_CHANNEL":
                            dataExOutputTable.Level_Channel = Convert.ToInt32(dtRow[dc]);
                            break;
                        case "LEVEL_DEMOG":
                            dataExOutputTable.Level_DEMO = Convert.ToInt32(dtRow[dc]);
                            break;
                        case "LEVEL_SEGMENT1":
                            dataExOutputTable.Level_Segment1 = Convert.ToInt32(dtRow[dc]);
                            break;
                        case "LEVEL_SEGMENT2":
                            dataExOutputTable.Level_Segment2 = Convert.ToInt32(dtRow[dc]);
                            break;

                    }
                    if (dc.ColumnName.ToUpper() == "CUBE_SELECTED")
                    {
                        switch (obj["cube"].ToString().ToUpper())
                        {
                            case "DEMOGRAPHICS":
                                dataExOutputTable.DEMO = dtRow[dc].ToString();
                                break;
                            case "SEGMENT":
                                dataExOutputTable.Segment2 = dtRow[dc].ToString();
                                break;
                            case "CHANNEL":
                                dataExOutputTable.Channel = dtRow[dc].ToString();
                                break;
                        }
                    }
                    else if (dc.ColumnName.ToUpper() == "METRICVALUE")
                    {
                        if (dtRow[dc] == DBNull.Value)
                        {
                            dataExOutputTable.MVal = null;
                        }
                        else
                        {
                            dataExOutputTable.MVal = Convert.ToDouble(dtRow[dc]);


                        }
                    }
                    else if (dc.ColumnName.ToUpper() == "RAWBUYERS")
                    {
                        if (dtRow[dc] == DBNull.Value)
                        {
                            dataExOutputTable.RawBuyers = null;
                        }
                        else
                        {
                            dataExOutputTable.RawBuyers = Convert.ToDouble(dtRow[dc]);


                        }
                    }
                }

                dataExOutput.DataExOutputTable.Add(dataExOutputTable);
            }

            return dataExOutput;
        }
        private void checkRoundBy(DataRow dtRow, DataColumn dc, DataExOutputTable dataExOutputTable)
        {
            if (dtRow[dc] == DBNull.Value || dtRow[dc]?.ToString() == string.Empty)
            {

            }
            else
            {
                int roundby = Convert.ToInt32(dtRow[dc]);
                dataExOutputTable.MVal = dataExOutputTable.MVal != null ? Math.Round((double)dataExOutputTable.MVal, roundby) : dataExOutputTable.MVal;
            }
        }
        private void checksymbol(DataRow dtRow, DataColumn dc, DataExOutputTable dataExOutputTable)
        {
            if (dtRow[dc] == DBNull.Value | dtRow[dc]?.ToString() == string.Empty)
            {
                dataExOutputTable.MetricValue = dataExOutputTable.MVal.ToString();
            }
            else
            {
                var symbol = dtRow[dc]?.ToString();
                dataExOutputTable.MetricValue = dataExOutputTable.MVal != null ? dataExOutputTable.MVal.ToString() + symbol : dataExOutputTable.MVal?.ToString();

            }
        }


        private List<Level> SetLevel(JArray levelArray )
        {
            int levelId = 0;
            List<Level> levels = new List<Level>();
            foreach (JObject x in levelArray)
            {
                levelId = levelId + 1;
                string lvlname = x.GetValue("name").ToString();
                if(lvlname =="Time Period")
                {
                    lvlname = "TimePeriod";
                }
                else if(lvlname == "Brands")
                {
                    lvlname = "Brand";
                }
                else if (lvlname == "Segment Filter")
                {
                    lvlname = "Segment1";
                }
                else if (lvlname == "Segment")
                {
                    lvlname = "Segment2";
                }
                else if (lvlname == "Demo")
                {
                    lvlname = "DEMO";

                }
                Level level = new Level() { LevelId = levelId, LevelName = lvlname };
                levels.Add(level);
            }           
           
            return levels;
        }
        public DataExOutput GetDataExplorerData(int ModuleId, string userId)
        {
            string selection = _unitOfWork.GetRepository<IFilterPanelRepository>().GetDataExplorerData(7, Convert.ToInt32(HttpContext.Current.Session["UserId"]));
            ExcelSelectionData selectionData = new ExcelSelectionData();
            selectionData.Selection = selection;
            if (selection != null)
            {
                return GetDataByFilter(selectionData);
            }
            else
            {
                DataExOutput dataExOutput = new DataExOutput();
                dataExOutput.Selection = null;
                return new DataExOutput();
            }
             
        }

        public DataExOutput GetExcelData(DataExOutput tbdata)
        {
            //console.log("table_data_new", tbdata);
            var result = tbdata;
            var data = new DataExOutput();
            data.Selection = result.Selection;
            data.selectionTextExcel = result.selectionTextExcel;
            data.SupressZero = result.SupressZero;
            var rowLevel = new List<Level>();
            var colLevel = new List<Level>();
            var tableData = new List<DataExOutputTable>();
            foreach (var e in result.DataExOutputTable)
            {
                var tableRowData = new DataExOutputTable();
                tableRowData.Brand = e.Brand;
                tableRowData.Category = e.Category;
                tableRowData.Channel = e.Channel;
                tableRowData.DEMO = e.DEMO;
                tableRowData.Id = e.Id;
                tableRowData.KPI = e.KPI;
                tableRowData.Market = e.Market;
                tableRowData.MetricValue = e.MetricValue;
                tableRowData.Segment1 = e.Segment1;
                tableRowData.Segment2 = e.Segment2;
                tableRowData.TimePeriod = e.TimePeriod;
                tableRowData.Level_Brand = e.Level_Brand;
                tableRowData.Level_Channel = e.Level_Channel;
                tableRowData.Level_DEMO = e.Level_DEMO;
                tableRowData.Level_Segment1 = e.Level_Segment1;
                tableRowData.Level_Segment2 = e.Level_Segment2;
                tableRowData.RawBuyers = e.RawBuyers;
                tableData.Add(tableRowData);
            }
            data.DataExOutputTable = tableData;
            foreach (var e in result.RowList)
            {
                var TableRow = new Level();
                TableRow.LevelId = e.LevelId;
                TableRow.LevelName = e.LevelName;
                TableRow.DistinctValues = GetDistinctValues(data.DataExOutputTable, TableRow.LevelName);
                var levelName = e.LevelName;
                var levelKey = ("Level_" + levelName);
                if (new List<string> { "Brand", "Channel", "Demo", "Segment1", "Segment2" }.IndexOf(e.LevelName) != -1)
                {
                    TableRow.DistinctLevelValues = GetDistinctLevelValues(data.DataExOutputTable, levelName);
                }
                else
                {
                    TableRow.DistinctLevelValues = TableRow.DistinctValues;
                }
                rowLevel.Add(TableRow);
            }
            foreach (var e in result.ColumnList)
            {
                var TableRow = new Level();
                TableRow.LevelId = e.LevelId;
                TableRow.LevelName = e.LevelName;
                TableRow.DistinctValues = GetDistinctValues(data.DataExOutputTable, TableRow.LevelName);
                TableRow.DistinctLevelValues = TableRow.DistinctValues;
                colLevel.Add(TableRow);
            }
            var repeatTimes = 1;
            for (var i = 0; i < colLevel.Count; i++)
            {
                colLevel[i].RepeatTimes = repeatTimes;
                repeatTimes = repeatTimes * colLevel[i].DistinctValues.Count;
            }
            repeatTimes = 1;
            for (var i = 0; i < rowLevel.Count; i++)
            {
                rowLevel[i].RepeatTimes = repeatTimes;
                repeatTimes = repeatTimes * rowLevel[i].DistinctValues.Count;
            }
            var widthCount = 1;
            for (var i = colLevel.Count - 1; i >= 0; i--)
            {
                colLevel[i].WidthTimes = widthCount;
                widthCount = widthCount * colLevel[i].DistinctValues.Count;
            }
            widthCount = 1;
            for (var i = rowLevel.Count - 1; i >= 0; i--)
            {
                rowLevel[i].WidthTimes = widthCount;
                widthCount = widthCount * rowLevel[i].DistinctValues.Count;
            }
            for (var i = 0; i < colLevel.Count; i++)
            {
                colLevel[i].Values = new List<string>();
                for (var j = 1; j <= colLevel[i].RepeatTimes; j++)
                {
                    for (var k = 0; k < colLevel[i].DistinctValues.Count; k++)
                    {
                        for (var l = 1; l <= colLevel[i].WidthTimes; l++)
                        {
                            colLevel[i].Values.Add(colLevel[i].DistinctValues[k]);
                        }
                    }
                }
            }
            for (var i = 0; i < rowLevel.Count; i++)
            {
                rowLevel[i].Values = new List<string>();
                for (var j = 1; j <= rowLevel[i].RepeatTimes; j++)
                {
                    for (var k = 0; k < rowLevel[i].DistinctValues.Count; k++)
                    {
                        for (var l = 1; l <= rowLevel[i].WidthTimes; l++)
                        {
                            rowLevel[i].Values.Add(rowLevel[i].DistinctValues[k]);
                        }
                    }
                }
            }
            data.RowList = rowLevel;
            data.ColumnList = colLevel;

            /*let t:DataExplorerTableDetails = new DataExplorerTableDetails();
            t.DataExOutputTable = data.DataExOutputTable;
              this.getExcelData(t).subscribe(e=>{
                console.log(e)
              })*/
            return data;
            //return _FilterPanelobj.GetDataExplorerData(7, "");
        }
        public DataExOutput GetTableData(DataExOutput tbdata)
        {
            //console.log("table_data_new", tbdata);
            var result = tbdata;
            var data = new DataExOutput();
            data.Selection = result.Selection;
            data.selectionTextExcel = result.selectionTextExcel;
            data.SupressZero = result.SupressZero;
            var rowLevel = new List<Level>();
            var colLevel = new List<Level>();
            var tableData = new List<DataExOutputTable>();
            foreach (var e in result.DataExOutputTable)
            {
                var tableRowData = new DataExOutputTable();
                tableRowData.Brand = e.Brand;
                tableRowData.Category = e.Category;
                tableRowData.Channel = e.Channel;
                tableRowData.DEMO = e.DEMO;
                tableRowData.Id = e.Id;
                tableRowData.KPI = e.KPI;
                tableRowData.Market = e.Market;
                tableRowData.MetricValue = e.MetricValue;
                tableRowData.Segment1 = e.Segment1;
                tableRowData.Segment2 = e.Segment2;
                tableRowData.TimePeriod = e.TimePeriod;
                tableRowData.Level_Brand = e.Level_Brand;
                tableRowData.Level_Channel = e.Level_Channel;
                tableRowData.Level_DEMO = e.Level_DEMO;
                tableRowData.Level_Segment1 = e.Level_Segment1;
                tableRowData.Level_Segment2 = e.Level_Segment2;
                tableRowData.RawBuyers = e.RawBuyers;
                tableData.Add(tableRowData);
            }
            data.DataExOutputTable = tableData;
            foreach (var e in result.RowList)
            {
                var TableRow = new Level();
                TableRow.LevelId = e.LevelId;
                TableRow.LevelName = e.LevelName;
                TableRow.DistinctValues = GetDistinctValues(data.DataExOutputTable, TableRow.LevelName);
                var levelName = e.LevelName;
                var levelKey = ("Level_" + levelName);
                if (new List<string> { "Brand", "Channel", "Demo", "Segment1", "Segment2" }.IndexOf(e.LevelName) != -1)
                {
                    TableRow.DistinctLevelValues = GetDistinctLevelValues(data.DataExOutputTable, levelName);
                }
                else
                {
                    TableRow.DistinctLevelValues = TableRow.DistinctValues;
                }
                rowLevel.Add(TableRow);
            }
            foreach (var e in result.ColumnList)
            {
                var TableRow = new Level();
                TableRow.LevelId = e.LevelId;
                TableRow.LevelName = e.LevelName;
                TableRow.DistinctValues = GetDistinctValues(data.DataExOutputTable, TableRow.LevelName);
                TableRow.DistinctLevelValues = TableRow.DistinctValues;
                colLevel.Add(TableRow);
            }
            var maxCount = 60;
            var mulRowsCount = 1;
            for (var i = colLevel.Count - 1; i >= 0; i--)
            {
                var maxCountConsidered = (int)Math.Floor((double)maxCount / mulRowsCount);
                if (colLevel[i].DistinctValues.Count > maxCountConsidered)
                {
                    colLevel[i].DistinctValues.RemoveRange(maxCountConsidered, colLevel[i].DistinctValues.Count - maxCountConsidered);
                    colLevel[i].DistinctLevelValues.RemoveRange(maxCountConsidered, colLevel[i].DistinctLevelValues.Count - maxCountConsidered);
                    mulRowsCount *= maxCountConsidered;
                }
                else
                {
                    mulRowsCount *= colLevel[i].DistinctValues.Count;
                }
            }
            mulRowsCount = 1;
            for (var i = rowLevel.Count - 1; i >= 0; i--)
            {
                var maxCountConsidered = (int)Math.Floor((double)maxCount / mulRowsCount);
                if (rowLevel[i].DistinctValues.Count > maxCountConsidered)
                {
                    rowLevel[i].DistinctValues.RemoveRange(maxCountConsidered, rowLevel[i].DistinctValues.Count - maxCountConsidered);
                    rowLevel[i].DistinctLevelValues.RemoveRange(maxCountConsidered, rowLevel[i].DistinctLevelValues.Count - maxCountConsidered);
                    mulRowsCount *= maxCountConsidered;
                }
                else
                {
                    mulRowsCount *= rowLevel[i].DistinctValues.Count;
                }
            }
            var repeatTimes = 1;
            for (var i = 0; i < colLevel.Count; i++)
            {
                colLevel[i].RepeatTimes = repeatTimes;
                repeatTimes = repeatTimes * colLevel[i].DistinctValues.Count;
            }
            repeatTimes = 1;
            for (var i = 0; i < rowLevel.Count; i++)
            {
                rowLevel[i].RepeatTimes = repeatTimes;
                repeatTimes = repeatTimes * rowLevel[i].DistinctValues.Count;
            }
            var widthCount = 1;
            for (var i = colLevel.Count - 1; i >= 0; i--)
            {
                colLevel[i].WidthTimes = widthCount;
                widthCount = widthCount * colLevel[i].DistinctValues.Count;
            }
            widthCount = 1;
            for (var i = rowLevel.Count - 1; i >= 0; i--)
            {
                rowLevel[i].WidthTimes = widthCount;
                widthCount = widthCount * rowLevel[i].DistinctValues.Count;
            }
            for (var i = 0; i < colLevel.Count; i++)
            {
                colLevel[i].Values = new List<string>();
                for (var j = 1; j <= colLevel[i].RepeatTimes; j++)
                {
                    for (var k = 0; k < colLevel[i].DistinctValues.Count; k++)
                    {
                        for (var l = 1; l <= colLevel[i].WidthTimes; l++)
                        {
                            colLevel[i].Values.Add(colLevel[i].DistinctValues[k]);
                        }
                    }
                }
            }
            for (var i = 0; i < rowLevel.Count; i++)
            {
                rowLevel[i].Values = new List<string>();
                for (var j = 1; j <= rowLevel[i].RepeatTimes; j++)
                {
                    for (var k = 0; k < rowLevel[i].DistinctValues.Count; k++)
                    {
                        for (var l = 1; l <= rowLevel[i].WidthTimes; l++)
                        {
                            rowLevel[i].Values.Add(rowLevel[i].DistinctValues[k]);
                        }
                    }
                }
            }
            data.RowList = rowLevel;
            data.ColumnList = colLevel;

            /*let t:DataExplorerTableDetails = new DataExplorerTableDetails();
            t.DataExOutputTable = data.DataExOutputTable;
              this.getExcelData(t).subscribe(e=>{
                console.log(e)
              })*/
            return data;
            //return _FilterPanelobj.GetDataExplorerData(7, "");
        }
        public List<string> GetDistinctValues(List<DataExOutputTable> table, string column)
        {
            if (column.Equals("Brand", StringComparison.OrdinalIgnoreCase))
            {
                return table.Select(a => a.Brand).Distinct().ToList(); ;
            }
            else if (column.Equals("Category", StringComparison.OrdinalIgnoreCase))
            {
                return table.Select(a => a.Category).Distinct().ToList();
            }
            else if (column.Equals("Channel", StringComparison.OrdinalIgnoreCase))
            {
                return table.Select(a => a.Channel).Distinct().ToList();
            }
            else if (column.Equals("DEMO", StringComparison.OrdinalIgnoreCase))
            {
                return table.Select(a => a.DEMO).Distinct().ToList();
            }
            else if (column.Equals("KPI", StringComparison.OrdinalIgnoreCase))
            {
                return table.Select(a => a.KPI).Distinct().ToList();
            }
            else if (column.Equals("Market", StringComparison.OrdinalIgnoreCase))
            {
                return table.Select(a => a.Market).Distinct().ToList();
            }
            else if (column.Equals("Segment1", StringComparison.OrdinalIgnoreCase))
            {
                return table.Select(a => a.Segment1).Distinct().ToList();
            }
            else if (column.Equals("Segment2", StringComparison.OrdinalIgnoreCase))
            {
                return table.Select(a => a.Segment2).Distinct().ToList();
            }
            else if (column.Equals("TimePeriod", StringComparison.OrdinalIgnoreCase))
            {
                return table.Select(a => a.TimePeriod).Distinct().ToList();
            }
            else
            {
                return new List<string>();
            }
        }
        public List<string> GetDistinctLevelValues(List<DataExOutputTable> table, string column)
        {
            if (column.Equals("Brand", StringComparison.OrdinalIgnoreCase))
            {
                var data = table.Select(a => new { a.Brand, a.Level_Brand }).Distinct();
                return data.Select(a => (GetTabSpaces(a.Level_Brand) + (a.Level_Brand >= 1 ? "" : "") + a.Brand)).Distinct().ToList();
            }
            else if (column.Equals("Channel", StringComparison.OrdinalIgnoreCase))
            {
                var data = table.Select(a => new { a.Channel, a.Level_Channel }).Distinct();
                return data.Select(a => (GetTabSpaces(a.Level_Channel) + (a.Level_Channel >= 1 ? "" : "") + a.Channel)).Distinct().ToList();
            }
            else if (column.Equals("DEMO", StringComparison.OrdinalIgnoreCase))
            {
                var data = table.Select(a => new { a.DEMO, a.Level_DEMO }).Distinct();
                return data.Select(a => (GetTabSpaces(a.Level_DEMO) + (a.Level_DEMO >= 1 ? "" : "") + a.DEMO)).Distinct().ToList();
            }
            else if (column.Equals("Segment1", StringComparison.OrdinalIgnoreCase))
            {
                var data = table.Select(a => new { a.Segment1, a.Level_Segment1 }).Distinct();
                return data.Select(a => (GetTabSpaces(a.Level_Segment1) + (a.Level_Segment1 >= 1 ? "" : "") + a.Segment1)).Distinct().ToList();
            }
            else if (column.Equals("Segment2", StringComparison.OrdinalIgnoreCase))
            {
                var data = table.Select(a => new { a.Segment2, a.Level_Segment2 }).Distinct();
                return data.Select(a => (GetTabSpaces(a.Level_Segment2) + (a.Level_Segment2 >= 1 ? "" : "") + a.Level_Segment2)).Distinct().ToList();
            }
            else
            {
                return new List<string>();
            }
        }
        public string GetTabSpaces(int n)
        {
            return string.Concat(Enumerable.Repeat("  ", n));
        }
        public DataExplorerTableDetails ProcessExcelData(DataExOutput OutputData)
        {
            var suppressZero = OutputData.SupressZero;
            var rowHeightInfo = new List<Dictionary<string, object>>();
            foreach (var e in OutputData.RowList)
            {
                foreach (var f in e.DistinctValues)
                {
                    for (var i = 1; i <= e.RepeatTimes; i++)
                    {
                        var obj = new Dictionary<string, object>();
                        obj.Add("LevelId", e.LevelId);
                        obj.Add("RepeatSequence", i);
                        obj.Add("Values", f);
                        obj.Add("Width", e.WidthTimes);
                        rowHeightInfo.Add(obj);
                    }
                }
            }


            var columnListCount = OutputData.ColumnList.Count > 0 ? OutputData.ColumnList[0].Values.Count : -1;
            var rowListCount = OutputData.RowList.Count > 0 ? OutputData.RowList[0].Values.Count : -1;
            var value = 0;
            var tableData = new List<List<object>>();
            var sampleSizeData = new List<List<object>>();
            var tableDataColumnCount = -1;
            var tableDataRowCount = -1;
            DataTable data = ToDataTable<DataExOutputTable>(OutputData.DataExOutputTable);
            for (var i = 0; i < rowListCount; i++)
            {
                var allZero = true;
                var tempDataRow = new List<object>();
                var sampleDataRow = new List<object>();
                for (var j = 0; j < columnListCount; j++)
                {
                    var a = new Dictionary<string, string>();
                    string whereCondition = "";
                    for (var k = 0; k < OutputData.RowList.Count; k++)
                    {
                        a.Add(OutputData.RowList[k].LevelName, OutputData.RowList[k].Values[i]);
                        whereCondition += OutputData.RowList[k].LevelName+"='"+ OutputData.RowList[k].Values[i].Replace("'","''") + "' and ";
                        //a[OutputData.RowList[k].LevelName] = OutputData.RowList[k].Values[i];

                    }
                    for (var l = 0; l < OutputData.ColumnList.Count; l++)
                    {
                        a.Add(OutputData.ColumnList[l].LevelName, OutputData.ColumnList[l].Values[j]);
                        whereCondition += OutputData.ColumnList[l].LevelName + "='" + OutputData.ColumnList[l].Values[j].Replace("'", "''") + "' ";
                        if (l != (OutputData.ColumnList.Count - 1))
                        {
                            whereCondition += " and ";
                        }
                    }
                    //var val = new DataExOutputTable();
                    //val = FilterTableObject(OutputData.DataExOutputTable, a);
                    var val = data.Select(whereCondition)[0];
                    string MetricValue = val.Field<string>("MetricValue");
                    double? RawBuyers = val.Field<object>("RawBuyers")==DBNull.Value?null: val.Field<double?>("RawBuyers");
                    /*if (val.MetricValue != null && val.MetricValue != "")
                    {
                        allZero = false;
                    }
                    tempDataRow.Add((val.MetricValue == null) ? "NA" : val.MetricValue);
                    sampleDataRow.Add((val.RawBuyers == null) ? null : val.RawBuyers);*/
                    if (MetricValue != null && MetricValue != "")
                    {
                        allZero = false;
                    }
                    tempDataRow.Add((MetricValue == null) ? "NA" : MetricValue);
                    sampleDataRow.Add((RawBuyers == null) ? null : RawBuyers);
                    //this.data.push(value);
                    //value++;
                }
                if (allZero && suppressZero)
                {
                    foreach (var e in OutputData.RowList)
                    {
                        var levId = e.LevelId;
                        var values = e.Values[i];
                        var RepeatSequence = (int)Math.Ceiling((double)(i + 1) / (e.DistinctValues.Count * e.WidthTimes));
                        var obj = new Dictionary<string, object>();
                        obj.Add("LevelId", levId);
                        obj.Add("RepeatSequence", RepeatSequence);
                        obj.Add("Values", values);
                        var indx = rowHeightInfo.FindIndex(a => a["LevelId"].Equals(levId) && a["RepeatSequence"].Equals(RepeatSequence) && a["Values"].Equals(values));

                        if (indx != -1)
                            rowHeightInfo[indx]["Width"] = (int)rowHeightInfo[indx]["Width"] - 1;
                    }


                }
                else
                {

                    tableData.Add(tempDataRow);
                    sampleSizeData.Add(sampleDataRow);
                }

            }
            tableDataColumnCount = OutputData.ColumnList[OutputData.ColumnList.Count - 1].Values.Count;
            tableDataRowCount = tableData.Count;
            var excelObject = SetExcelDataNew(OutputData, tableDataColumnCount, tableDataRowCount, tableData, rowHeightInfo, sampleSizeData);
            return excelObject;
        }
        public DataExOutputTable FilterTableObject(List<DataExOutputTable> data, Dictionary<string, string> searchObj)
        {
            var filteredData = data;
            foreach (var column in searchObj.Keys)
            {
                var value = searchObj[column];
                if (column.Equals("Brand", StringComparison.OrdinalIgnoreCase))
                {
                    filteredData = filteredData.Where(a => a.Brand == value.ToString()).ToList();
                }
                else if (column.Equals("Category", StringComparison.OrdinalIgnoreCase))
                {
                    filteredData = filteredData.Where(a => a.Category == value.ToString()).ToList();
                }
                else if (column.Equals("Channel", StringComparison.OrdinalIgnoreCase))
                {
                    filteredData = filteredData.Where(a => a.Channel == value.ToString()).ToList();
                }
                else if (column.Equals("DEMO", StringComparison.OrdinalIgnoreCase))
                {
                    filteredData = filteredData.Where(a => a.DEMO == value.ToString()).ToList();
                }
                else if (column.Equals("KPI", StringComparison.OrdinalIgnoreCase))
                {
                    filteredData = filteredData.Where(a => a.KPI == value.ToString()).ToList();
                }
                else if (column.Equals("Market", StringComparison.OrdinalIgnoreCase))
                {
                    filteredData = filteredData.Where(a => a.Market == value.ToString()).ToList();
                }
                else if (column.Equals("Segment1", StringComparison.OrdinalIgnoreCase))
                {
                    filteredData = filteredData.Where(a => a.Segment1 == value.ToString()).ToList();
                }
                else if (column.Equals("Segment2", StringComparison.OrdinalIgnoreCase))
                {
                    filteredData = filteredData.Where(a => a.Segment2 == value.ToString()).ToList();
                }
                else if (column.Equals("TimePeriod", StringComparison.OrdinalIgnoreCase))
                {
                    filteredData = filteredData.Where(a => a.TimePeriod == value.ToString()).ToList();
                }
            }
            var ob = filteredData.Take(1).ToList();
            return ob.Count == 0 ? new DataExOutputTable() : ob[0];
        }

        public DataExplorerTableDetails SetExcelDataNew(DataExOutput OutputData, int tableDataColumnCount, int tableDataRowCount, List<List<object>> tableData, List<Dictionary<string, object>> rowHeightInfo, List<List<object>> sampleSizeData)
        {
            var excelTable = new DataExplorerTableDetails();
            var columnList = new List<LevelTable>();
            var rowList = new List<LevelTable>();
            excelTable.DataExOutputTable = OutputData.DataExOutputTable;
            //excelTable.Selection = this.dataexplorerService.selectionTextForExportToExcel();
            excelTable.DataColumnCount = tableDataColumnCount;
            excelTable.DataRowCount = tableDataRowCount;
            excelTable.Selection = OutputData.selectionTextExcel;
            //ColumnList

            foreach (var col in OutputData.ColumnList)
            {
                var colLevel = new LevelTable();
                colLevel.LevelId = col.LevelId;
                colLevel.LevelName = col.LevelName;
                colLevel.Values = new List<HeaderTable>();
                for (var i = 1; i <= col.RepeatTimes; i++)
                {

                    foreach (var val in col.DistinctValues)
                    {
                        var rowItem = new HeaderTable();
                        rowItem.Name = val; rowItem.WidthCount = col.WidthTimes;
                        colLevel.Values.Add(rowItem);
                    }
                }
                columnList.Add(colLevel);
            }
            excelTable.ColumnList = columnList;
            //End
            //RowList

            foreach (var col in OutputData.RowList)
            {
                var rowLevel = new LevelTable();
                rowLevel.LevelId = col.LevelId;
                rowLevel.LevelName = col.LevelName;
                rowLevel.Values = new List<HeaderTable>();
                for (var i = 1; i <= col.RepeatTimes; i++)
                {
                    foreach (var val in col.DistinctValues)
                    {
                        var rowItem = new HeaderTable();
                        rowItem.Name = val;
                        var filteredRow = rowHeightInfo.Where(a => a["LevelId"].Equals(rowLevel.LevelId) && a["RepeatSequence"].Equals(i) && a["Values"].Equals(val)).Take(1).ToList()[0];
                        rowItem.WidthCount = Math.Max((int)filteredRow["Width"], 0);
                        rowLevel.Values.Add(rowItem);
                    }
                }
                rowList.Add(rowLevel);
            }
            excelTable.RowList = rowList;
            //End
            //Data
            excelTable.Data = new List<string>();
            for (var i = 0; i < tableData.Count; i++)
            {
                for (var j = 0; j < tableData[i].Count; j++)
                {
                    excelTable.Data.Add(tableData[i][j].ToString());
                }
            }
            excelTable.SampleSize = new List<double?>();
            for (var i = 0; i < sampleSizeData.Count; i++)
            {
                for (var j = 0; j < sampleSizeData[i].Count; j++)
                {
                    excelTable.SampleSize.Add((double?)sampleSizeData[i][j]);
                }
            }
            //End


            return excelTable;
        }
        public static DataTable ToDataTable<T>(List<T> items)
        {
            DataTable dataTable = new DataTable(typeof(T).Name);

            //Get all the properties
            PropertyInfo[] Props = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
            foreach (PropertyInfo prop in Props)
            {
                //Defining type of data column gives proper data table 
                var type = (prop.PropertyType.IsGenericType && prop.PropertyType.GetGenericTypeDefinition() == typeof(Nullable<>) ? Nullable.GetUnderlyingType(prop.PropertyType) : prop.PropertyType);
                //Setting column names as Property names
                dataTable.Columns.Add(prop.Name, type);
            }
            foreach (T item in items)
            {
                var values = new object[Props.Length];
                for (int i = 0; i < Props.Length; i++)
                {
                    //inserting property values to datatable rows
                    values[i] = Props[i].GetValue(item, null);
                }
                dataTable.Rows.Add(values);
            }
            //put a breakpoint here and check datatable
            return dataTable;
        }
    }
}
