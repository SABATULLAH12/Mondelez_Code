using DAL;
using Entites;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace BAL
{
    public class ReportsHub : IReportsHub
    {
        internal readonly IUnitOfWork _unitOfWork;

        public ReportsHub(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public ReportsHubData GetReportHubData()
        {
            ReportsHubData filterData = new ReportsHubData();
            filterData.ReportLinks = _unitOfWork.GetRepository<IReportsHubRepository>().GetFileList();
            DataSet ds = _unitOfWork.GetRepository<IFilterPanelRepository>().GetFilterPanalData("5");
            filterData.Data = new List<LevelData>();
            filterData.Data.Add(new LevelData()
            {
                Name = "ReportHubFilter",
                Data = new List<FilterStructure>()
            });
            try
            {
                if (ds != null)
                {
                    filterData.Data[0].Data.Add(new FilterStructure()
                    {
                        Id = 3,
                        Name = "markets",
                        Data = FormatParentData(TableToList(ds.Tables[0]))
                    });

                    filterData.Data[0].Data.Add(new FilterStructure()
                    {
                        Id = 4,
                        Name = "category",
                        Data = FormatParentData(TableToList(ds.Tables[1]))
                    });

                    filterData.Data[0].Data.Add(new FilterStructure()
                    {
                        Id = 5,
                        Name = "timeperiod",
                        Data = TableToListDbStructure2(ds.Tables[2]).Cast<object>().ToList()
                    });
                }
            }
            catch (Exception ex)
            {
                Log.LogException(ex);
            }
            return filterData;
        }
        public UserRoleData GetUserRole(int id)
        {
            UserRoleData usrRole = new UserRoleData();
            usrRole.User_Role = _unitOfWork.GetRepository<IReportsHubRepository>().GetUserRoleDAL(id);
            return usrRole;

        }
        public string[] GetMailIdsToSendMailForReport(string fileName)
        {
            DataSet dt  = _unitOfWork.GetRepository<IReportsHubRepository>().GetMailIdsToSendMailForReport(fileName);
            DataTable tbl = dt.Tables[0];
            string[] arrrayOfMails = tbl.Rows.OfType<DataRow>().Select(k => k[0].ToString()).ToArray();
            return arrrayOfMails;
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
                    brandTabId = dataTable.Columns.Contains("brandTabId") ? item["brandTabId"] == DBNull.Value ? -1 : Convert.ToInt32(item["brandTabId"]) : 0,
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
                    SegmentType = dataTable.Columns.Contains("SegmentType") ? Convert.ToInt32(item["SegmentType"]) : -1,
                    Austria = SplitString(item["Austria"].ToString(), ','),
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
                    UK = SplitString(item["UK"].ToString(), ',')
                }).ToList();
            }

            catch (Exception ex)
            {
                return null;
            }

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
        public IList<int> SplitString(string stringlist, char identifier)
        {
            var completelist = stringlist.Split(identifier).ToList<string>();
            IList<int> RevisedList = new List<int>();
            foreach (var i in completelist)
            {
                int x;
                if (int.TryParse(i, out x))
                {
                    RevisedList.Add(x);
                }
            }
            return RevisedList;
        }
    }

}
