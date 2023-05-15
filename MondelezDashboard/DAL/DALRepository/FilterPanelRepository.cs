using System;
using System.Data;
using Entites;
using System.Data.SqlClient;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using System.Collections.Generic;

namespace DAL
{
    public class FilterPanelRepository : IFilterPanelRepository, IDisposable
    {
        internal readonly IConnectionFactory _connFactory;
        internal readonly IDbConnection _myConn;

        public FilterPanelRepository(IConnectionFactory connFatory)
        {
            _connFactory = connFatory;
            _myConn = connFatory.GetConnection;
        }

        #region Repository Methods        

        public DataSet GetFilterPanalData(string ModuleId)
        {
            DataSet dsData = new DataSet();
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.GetFilterData;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;
                cmd.Parameters.Add(getParameter("Id", ModuleId));
                #region Proc Log
                object[] param = new object[] {
                    ModuleId,
            };
                Log.LogProc(Constants.GetFilterData, param);
                #endregion


                using (SqlDataAdapter da = new SqlDataAdapter((SqlCommand)cmd))
                {
                    da.Fill(dsData);
                }
            }
            catch (Exception ex)
            {
                Log.LogException(ex);
            }
            return dsData;
        }

        public DataSet GetModuleSelection(int UserId)
        {
            DataSet dsData = new DataSet();
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.GetModule_Selections;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;
                var parameter = cmd.CreateParameter();
                parameter.ParameterName = "@userId";
                parameter.Value = UserId;
                cmd.Parameters.Add(parameter);

                #region Proc Log
                object[] param = new object[] {
                    UserId,
            };
                Log.LogProc(Constants.GetModule_Selections, param);
                #endregion

                using (SqlDataAdapter da = new SqlDataAdapter((SqlCommand)cmd))
                {
                    da.Fill(dsData);
                }
            }
            catch (Exception ex)
            {
                Log.LogException(ex);
            }
            return dsData;
        }

        public bool SaveModuleSelection(int UserId, int ModuleId, string Selection)
        {
            DataSet dsData = new DataSet();
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.SaveModuleSelections;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;
                var parameter = cmd.CreateParameter();
                parameter.ParameterName = "@userid";
                parameter.Value = UserId;
                cmd.Parameters.Add(parameter);
                parameter = cmd.CreateParameter();
                parameter.ParameterName = "@moduleId";
                parameter.Value = ModuleId;
                cmd.Parameters.Add(parameter);
                parameter = cmd.CreateParameter();
                parameter.ParameterName = "@selection";
                parameter.Value = Selection;
                cmd.Parameters.Add(parameter);

                #region Proc Log
                object[] param = new object[] {
                    UserId,ModuleId,Selection
            };
                Log.LogProc(Constants.SaveModuleSelections, param);
                #endregion

                _myConn.Open();
                cmd.ExecuteScalar();
                _myConn.Close();
                return true;
            }
            catch (Exception ex)
            {
                Log.LogException(ex);
                return false;
            }
        }
        public DataSet AvailableBrandSegmentsData(bool IsSegment)
        {
            DataSet dsData = new DataSet();
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.Available_Brand_Segment_Data;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;

                #region Proc Log
                object[] param = new object[] { };
                Log.LogProc(Constants.Available_TimePeriod_Data, param);
                #endregion

                using (SqlDataAdapter da = new SqlDataAdapter((SqlCommand)cmd))
                {
                    da.Fill(dsData);
                }
            }
            catch (Exception ex)
            {
                Log.LogException(ex);
            }
            return dsData;

        }
        public DataSet AvailableTimePeriodData()
        {
            DataSet dsData = new DataSet();
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.Available_TimePeriod_Data;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;

                #region Proc Log
                object[] param = new object[] { };
                Log.LogProc(Constants.Available_TimePeriod_Data, param);
                #endregion

                using (SqlDataAdapter da = new SqlDataAdapter((SqlCommand)cmd))
                {
                    da.Fill(dsData);
                }
            }
            catch (Exception ex)
            {
                Log.LogException(ex);
            }
            return dsData;
        }

        public DataSet GetMySelections(string userID, string ModuleId)
        {
            DataSet dsData = new DataSet();
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.Get_MySelections_Multiple;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;
                cmd.Parameters.Add(getParameter("@userId", userID));
                cmd.Parameters.Add(getParameter("@ModuleId", ModuleId));

                #region Proc Log
                object[] param = new object[] { userID, ModuleId };
                Log.LogProc(Constants.Get_MySelections_Multiple, param);
                #endregion

                using (SqlDataAdapter da = new SqlDataAdapter((SqlCommand)cmd))
                {
                    da.Fill(dsData);
                }
            }
            catch (Exception ex)
            {
                Log.LogException(ex);
            }
            return dsData;
        }

        public bool SaveSelection(FilterSelectionRequest FObj)
        {
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.SaveModule_Selections;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;
                cmd.Parameters.Add(getParameter("@userId", FObj.userId.ToString()));
                cmd.Parameters.Add(getParameter("@ModuleId", FObj.moduleId.ToString()));
                cmd.Parameters.Add(getParameter("@TagOrStoryId", FObj.TagOrStoryId.ToString()));
                cmd.Parameters.Add(getParameter("@TagName", FObj.TagName));
                cmd.Parameters.Add(getParameter("@IsTag", FObj.IsTag.ToString()));
                cmd.Parameters.Add(getParameter("@selectionTitle", FObj.selectionTitle));
                cmd.Parameters.Add(getParameter("@selection", FObj.selection));
                cmd.Parameters.Add(getParameter("@selectionParameters", FObj.selectionParameters));
                cmd.Parameters.Add(getParameter("@FooterText", FObj.FooterText));

                #region Proc Log
                object[] param = new object[] { FObj.userId, FObj.moduleId, FObj.selectionTitle, FObj.selection, FObj.selectionParameters, FObj.FooterText };
                Log.LogProc(Constants.SaveModule_Selections, param);
                #endregion

                _myConn.Open();
                cmd.ExecuteReader();
                _myConn.Close();

            }
            catch (Exception ex)
            {
                Log.LogException(ex);
                return false;
            }
            return true;

        }

        public DataSet GetSubscriptionData(int UserId)
        {
            DataSet dsData = new DataSet();
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.GetSubscriptionData;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;
                cmd.Parameters.Add(getParameter("@userId", UserId.ToString()));
                #region Proc Log
                object[] param = new object[] {
                    UserId,
            };
                Log.LogProc(Constants.GetSubscriptionData, param);
                #endregion


                using (SqlDataAdapter da = new SqlDataAdapter((SqlCommand)cmd))
                {
                    da.Fill(dsData);
                }
            }
            catch (Exception ex)
            {
                Log.LogException(ex);
            }
            return dsData;
        }

        public bool SaveSubscriptionData(int UserId, DataTable dReport, DataTable dDataLoad)
        {
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.SaveSubscriptionData;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;

                cmd.Parameters.Add(getParameter("@userId", UserId.ToString()));

                SqlParameter ReportData = new SqlParameter("@ReportSubscription", SqlDbType.Structured);
                ReportData.TypeName = "TVP_Subscription";
                ReportData.Value = dReport;
                cmd.Parameters.Add(ReportData);

                SqlParameter DataLoadData = new SqlParameter("@DataLoadSubscription", SqlDbType.Structured);
                DataLoadData.TypeName = "TVP_Subscription";
                DataLoadData.Value = dDataLoad;
                cmd.Parameters.Add(DataLoadData);

                #region Proc Log
                object[] param = new object[] { };
                Log.LogProc(Constants.SaveSubscriptionData, param);
                #endregion

                _myConn.Open();
                cmd.ExecuteReader();
                _myConn.Close();

            }
            catch (Exception ex)
            {
                Log.LogException(ex);
                return false;
            }
            return true;
        }

        public bool DeleteSelection(string SelectionId, bool IsStory, bool ISTagOrSelection)
        {
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.DeleteModule_Selections;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;
                cmd.Parameters.Add(getParameter("@ISTagORSELECTIONID", ISTagOrSelection.ToString()));
                cmd.Parameters.Add(getParameter("@TagOrSelectionId", SelectionId));
                cmd.Parameters.Add(getParameter("@IsStorySelection", IsStory.ToString()));

                #region Proc Log
                object[] param = new object[] { SelectionId };
                Log.LogProc(Constants.DeleteModule_Selections, param);
                #endregion

                _myConn.Open();
                cmd.ExecuteReader();
                _myConn.Close();

            }
            catch (Exception ex)
            {
                Log.LogException(ex);
                return false;
            }
            return true;

        }

        public SqlParameter getParameter(string name, string value)
        {
            SqlParameter param = new SqlParameter(name, SqlDbType.VarChar);
            if (string.IsNullOrEmpty(value))
                param.Value = DBNull.Value;
            else
                param.Value = value;
            return param;
        }


        public bool UserTrackingDetails(int userid, int moduleid, string selection)
        {
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.UserTrackingDetail;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;
                cmd.Parameters.Add(getParameter("@UserId", userid.ToString()));
                cmd.Parameters.Add(getParameter("@SessionId", userid.ToString()));

                cmd.Parameters.Add(getParameter("@ModuleId", moduleid.ToString()));

                cmd.Parameters.Add(getParameter("@Selections", selection));


                #region Proc Log
                //object[] param = new object[] { userid, userid, moduleid, selection };
                //Log.LogProc(Constants.SaveModule_Selections, param);
                #endregion

                _myConn.Open();
                cmd.ExecuteReader();
                _myConn.Close();

            }
            catch (Exception ex)
            {
                Log.LogException(ex);

                return false;
            }
            return true;

        }



        #endregion

        #region IDisposable Support
        private bool disposedValue = false; // To detect redundant calls

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    _myConn.Dispose();
                }

                disposedValue = true;
            }
        }

        // This code added to correctly implement the disposable pattern.
        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        public DataSet GetMarketCategoryData()
        {
            DataSet dsData = new DataSet();
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.GetMarketCategorynData;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;

                #region Proc Log
                object[] param = new object[] { };
                Log.LogProc(Constants.GetMarketCategorynData, param);
                #endregion



                using (SqlDataAdapter da = new SqlDataAdapter((SqlCommand)cmd))
                {
                    da.Fill(dsData);
                }
            }
            catch (Exception ex)
            {
                Log.LogException(ex);
            }
            return dsData;
        }

        public DataSet GetCubeDDLData(string marketId, string categoryId, string cube, bool isHarmonized)
        {
            DataSet dsData = new DataSet();
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.GetCubeDDLData;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;

                var parameter = cmd.CreateParameter();
                parameter.ParameterName = "@COUNTRY";
                parameter.Value = marketId;
                cmd.Parameters.Add(parameter);
                parameter = cmd.CreateParameter();
                parameter.ParameterName = "@CATEGORY";
                parameter.Value = categoryId;
                cmd.Parameters.Add(parameter);
                parameter = cmd.CreateParameter();
                parameter.ParameterName = "@CUBE";
                parameter.Value = cube;
                cmd.Parameters.Add(parameter);
                parameter = cmd.CreateParameter();
                parameter.ParameterName = "@ISHARMONIZED";
                parameter.Value = isHarmonized;
                cmd.Parameters.Add(parameter);

                #region Proc Log
                object[] param = new object[] {
                    marketId,categoryId,cube
            };
                Log.LogProc(Constants.GetCubeDDLData, param);
                #endregion



                using (SqlDataAdapter da = new SqlDataAdapter((SqlCommand)cmd))
                {
                    da.Fill(dsData);
                }
            }
            catch (Exception ex)
            {
                Log.LogException(ex);
            }
            return dsData;
        }

        public DataSet GetDataExplorerTblData(ExcelSelectionData selectionData, int userid)
        {
            DataSet dsData = new DataSet();
            //param creation
            JObject obj = JObject.Parse(selectionData.Selection);
            var marketId = String.Join("|", obj["marketId"]);
            var categoryId = String.Join("|", obj["categoryId"]);
            var KPIId = String.Join("|", obj["KPIId"]);
            var DemographicId = String.Join("|", obj["DemographicId"]);
            var TimePeriodId = String.Join("|", obj["TimePeriodId"]);
            var ChannelId = String.Join("|", obj["ChannelId"]);
            var cube = obj["cube"];
            var BrandId = obj["BrandId"];
            var Seg1Id = obj["Seg1Id"];
            var Seg2Id = obj["Seg2Id"];
            bool seg1totalselect = false;
            bool seg2totalselect = false;
            bool Brandstotalselect = false;
            var isHarmonized = obj["isHarmonized"];
            var tblBrandDetails = new DataTable();
            tblBrandDetails.Columns.Add("ID", typeof(Int32));
            tblBrandDetails.Columns.Add("COUNTRYID,", typeof(Int32));
            tblBrandDetails.Columns.Add("CATEGORYID", typeof(Int32));
            tblBrandDetails.Columns.Add("BRANDID", typeof(Int32));
            var tblseg1Details = new DataTable();
            tblseg1Details.Columns.Add("CATEGORYID", typeof(Int32));
            tblseg1Details.Columns.Add("BRANDID", typeof(Int32));
            var tblseg2Details = new DataTable();
            tblseg2Details.Columns.Add("CATEGORYID", typeof(Int32));
            tblseg2Details.Columns.Add("BRANDID", typeof(Int32));
            List<string> brandId = new List<string>();
            List<string> seg1Id = new List<string>();
            List<string> seg2Id = new List<string>();
            if (isHarmonized?.ToString() == "0")
            {
                int brandid = 1;
                foreach (string BC in BrandId)
                {
                    string[] BrandCat = BC.Split('|');

                    if (BrandCat[0]?.ToString() == "-1")
                    {
                        Brandstotalselect = true;
                    }
                    else
                    {
                        //tblBrandDetails.Rows.Add(Convert.ToInt32(BrandCat[1]), Convert.ToInt32(BrandCat[0]));
                        DataRow dRow = tblBrandDetails.NewRow();
                        dRow[0] = Convert.ToInt32(brandid);
                        dRow[1] = Convert.ToInt32(BrandCat[2]);
                        dRow[2] = Convert.ToInt32(BrandCat[1]);
                        dRow[3] = Convert.ToInt32(BrandCat[0]);
                        tblBrandDetails.Rows.Add(dRow);
                    }
                    brandid++;
                }
                foreach (string S1C in Seg1Id)
                {
                    string[] Seg1Cat = S1C.Split('|');
                    if (Seg1Cat[0]?.ToString() == "-1")
                    {
                        seg1totalselect = true;
                    }
                    else
                    {
                        //tblseg1Details.Rows.Add(Convert.ToInt32(Seg1Cat[1]), Convert.ToInt32(Seg1Cat[0]));
                        DataRow dRow = tblseg1Details.NewRow();
                        dRow[0] = Convert.ToInt32(Seg1Cat[1]);
                        dRow[1] = Convert.ToInt32(Seg1Cat[0]);
                        tblseg1Details.Rows.Add(dRow);
                    }
                }
                foreach (string S2C in Seg2Id)
                {
                    string[] Seg2Cat = S2C.Split('|');
                    if (Seg2Cat[0]?.ToString() == "-1")
                    {
                        seg2totalselect = true;
                    }
                    else
                    {
                        //tblseg2Details.Rows.Add(Convert.ToInt32(Seg2Cat[1]), Convert.ToInt32(Seg2Cat[0]));
                        DataRow dRow = tblseg2Details.NewRow();
                        dRow[0] = Convert.ToInt32(Seg2Cat[1]);
                        dRow[1] = Convert.ToInt32(Seg2Cat[0]);
                        tblseg2Details.Rows.Add(dRow);
                    }

                }
            }
            else
            {

                foreach (string BC in BrandId)
                {
                    string[] BrandCat = BC.Split('|');
                    if (BrandCat[0]?.ToString() == "-1")
                    {
                        Brandstotalselect = true;
                    }
                    else {
                        //tblBrandDetails.Rows.Add(Convert.ToInt32(BrandCat[1]), Convert.ToInt32(BrandCat[0]));
                        brandId.Add(BrandCat[0]);
                    }

                }
                foreach (string S1C in Seg1Id)
                {
                    string[] Seg1Cat = S1C.Split('|');
                    if (Seg1Cat[0]?.ToString() == "-1")
                    {
                        seg1totalselect = true;
                    }
                    else
                    {
                        seg1Id.Add(Seg1Cat[0]);
                    }


                }
                foreach (string S2C in Seg2Id)
                {
                    string[] Seg2Cat = S2C.Split('|');
                    if (Seg2Cat[0]?.ToString() == "-1")
                    {
                        seg2totalselect = true;
                    }
                    else
                    {
                        seg2Id.Add(Seg2Cat[0]);
                    }
                }
            }

            var tblselectionDetails = new DataTable();
            tblselectionDetails.Columns.Add("MODULEID", typeof(Int32));
            tblselectionDetails.Columns.Add("USERID", typeof(Int32));
            tblselectionDetails.Columns.Add("SELECTION", typeof(string));
            DataRow seldRow = tblselectionDetails.NewRow();
            seldRow[0] = Convert.ToInt32(7);
            seldRow[1] = Convert.ToInt32(userid);
            seldRow[2] = selectionData.Selection;
            tblselectionDetails.Rows.Add(seldRow);
            //tblselectionDetails.Columns.Add("MODULEID", typeof(Int32));
            //tblselectionDetails.Columns.Add("USERID", typeof(Int32));
            //tblselectionDetails.Columns.Add("SELECTION", typeof(string));
            //tblselectionDetails.Rows.Add(7, userid,selectionData.Selection);


            IDbCommand cmd = _myConn.CreateCommand();

            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandTimeout = Constants.Command_Timeout;

            cmd.Parameters.Add(getParameter("@COUNTRY", marketId));
            cmd.Parameters.Add(getParameter("@CATEGORY", categoryId));
            cmd.Parameters.Add(getParameter("@TIMEPERIOD", TimePeriodId));
            if (isHarmonized?.ToString() == "0")
            {
                cmd.CommandText = Constants.GetDataExplorerOutput;
                SqlParameter brandDetails = new SqlParameter("@BRAND", SqlDbType.Structured);
                brandDetails.TypeName = "TVP_Brand";
                brandDetails.Value = tblBrandDetails;
                cmd.Parameters.Add(brandDetails);
                if (seg1totalselect == true)
                {
                    SqlParameter seg1Details = new SqlParameter("@SEGMENT1", SqlDbType.Structured);
                    seg1Details.TypeName = "BRANDDETAILS";
                    seg1Details.Value = tblseg1Details;
                    cmd.Parameters.Add(seg1Details);
                }
                else
                {
                    SqlParameter seg1Details = new SqlParameter("@SEGMENT1", SqlDbType.Structured);
                    seg1Details.TypeName = "BRANDDETAILS";
                    seg1Details.Value = tblseg1Details;
                    cmd.Parameters.Add(seg1Details);
                }
                if (seg2totalselect == true)
                {
                    SqlParameter seg2Details = new SqlParameter("@SEGMENT2", SqlDbType.Structured);
                    seg2Details.TypeName = "BRANDDETAILS";
                    seg2Details.Value = tblseg2Details;
                    cmd.Parameters.Add(seg2Details);
                }
                else
                {
                    SqlParameter seg2Details = new SqlParameter("@SEGMENT2", SqlDbType.Structured);
                    seg2Details.TypeName = "BRANDDETAILS";
                    seg2Details.Value = tblseg2Details;
                    cmd.Parameters.Add(seg2Details);
                }
                    cmd.Parameters.Add(getParameter("@CHANNEL", ChannelId));
                    cmd.Parameters.Add(getParameter("@DEMOGRAPHIC", DemographicId));
                
            }
            else
            {
                cmd.CommandText = Constants.GetDataExplorerOutputHarmonized;
                cmd.Parameters.Add(getParameter("@BRAND", string.Join("|", brandId).Replace(",", "|")));
                cmd.Parameters.Add(getParameter("@SEGMENT1", string.Join("|", seg1Id).Replace(",", "|")));
                cmd.Parameters.Add(getParameter("@SEGMENT2", string.Join("|", seg2Id).Replace(",", "|")));
                cmd.Parameters.Add(getParameter("@CHANNEL", ChannelId.Replace(",", "|")));
                cmd.Parameters.Add(getParameter("@DEMOGRAPHIC", DemographicId.Replace(",", "|")));
            }
            cmd.Parameters.Add(getParameter("@KPI", KPIId));

            cmd.Parameters.Add(getParameter("@CUBE", cube.ToString()));
            SqlParameter selectionDetails = new SqlParameter("@SELECTION", SqlDbType.Structured);
            selectionDetails.TypeName = "Selections";
            selectionDetails.Value = tblselectionDetails;
            cmd.Parameters.Add(selectionDetails);
            cmd.Parameters.Add(getParameter("@ISHARMONIZED", isHarmonized?.ToString()));
            cmd.Parameters.Add(getParameter("@IsSave", selectionData.IsSave?.ToString() == null ? "1" : selectionData.IsSave?.ToString()));


            #region Proc Log
            object[] param = new object[] {
                    marketId,categoryId,TimePeriodId,KPIId,ChannelId,DemographicId,cube,tblBrandDetails,tblselectionDetails,tblseg1Details,tblseg2Details
            };
            Log.LogProc(Constants.GetDataExplorerOutput, param);
            #endregion



            using (SqlDataAdapter da = new SqlDataAdapter((SqlCommand)cmd))
            {
                da.Fill(dsData);
            }


            return dsData;
        }

        public string GetDataExplorerData(int ModuleId, int userId)
        {
            DataSet dsData = new DataSet();
            string selection = null;
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.GetUserDataExplorerModuleSelections;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;

                var parameter = cmd.CreateParameter();
                parameter.ParameterName = "@MODULEID";
                parameter.Value = ModuleId;
                cmd.Parameters.Add(parameter);
                parameter = cmd.CreateParameter();
                parameter.ParameterName = "@UserID";
                parameter.Value = userId;
                cmd.Parameters.Add(parameter);
                parameter = cmd.CreateParameter();
                parameter.ParameterName = "@SELECTION";
                parameter.Value = DBNull.Value;
                cmd.Parameters.Add(parameter);
                parameter = cmd.CreateParameter();
                parameter.ParameterName = "@INSERTORSELECT";
                parameter.Value = 0;
                cmd.Parameters.Add(parameter);

                #region Proc Log
                object[] param = new object[] {
                    ModuleId,userId,null,0
            };
                Log.LogProc(Constants.GetUserDataExplorerModuleSelections, param);
                #endregion

                DataTable dataTable = new DataTable();

                using (SqlDataAdapter da = new SqlDataAdapter((SqlCommand)cmd))
                {
                    da.Fill(dsData);
                }
                selection = dsData.Tables[0].Rows[0].Field<string>("SELECTION");

            }
            catch (Exception ex)
            {
                Log.LogException(ex);
            }

            return selection;
        }
        #endregion
    }
}