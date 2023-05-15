using System;
using System.Data;
using Entites;
using System.Data.SqlClient;
using System.Linq;

namespace DAL
{
    public class CrossTabRepository : ICrossTabRepository, IDisposable
    {
        internal readonly IConnectionFactory _connFactory;
        internal readonly IDbConnection _myConn;

        public CrossTabRepository(IConnectionFactory connFatory)
        {
            _connFactory = connFatory;
            _myConn = connFatory.GetConnection;
        }

        #region Repository Methods        
    
        public int GetUserId(string EmailId)
        {
            int iUserId = 0;
            IDbCommand cmd = _myConn.CreateCommand();
            cmd.CommandText = "USP_GetUserId";
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandTimeout = Constants.Command_Timeout;
            var parameter = cmd.CreateParameter();
            parameter.ParameterName = "@EmailId";
            parameter.Value = EmailId;
            cmd.Parameters.Add(parameter);
            _myConn.Open();
            iUserId = Convert.ToInt16(cmd.ExecuteScalar());
            _myConn.Close();
            return iUserId;
        }
        public DataSet GetData(CrossTabViewRequest request)
        {
            DataSet dsData = new DataSet();
            string tableTypeParameter = "DECLARE @A TVP_BRAND,@B TVP_BRAND,@C TVP_BRAND \n";
            int Id = 0;
            string CheckPrevName = "";
            try
            {
                #region Brand Mappings
                DataTable dt = new DataTable();
                DataColumn dc = new DataColumn("Id", typeof(Int32));
                dt.Columns.Add(dc);

                dc = new DataColumn("CountryId", typeof(Int32));
                dt.Columns.Add(dc);

                dc = new DataColumn("CategoryId", typeof(Int32));
                dt.Columns.Add(dc);

                dc = new DataColumn("BrandId", typeof(String));
                dt.Columns.Add(dc);

                if (request.BrandMappings != null && request.BrandMappings.Count > 0)
                {

                    foreach (BrandEntity brand in request.BrandMappings)
                    {
                        if(brand.BrandName!= CheckPrevName)
                        {
                            Id++;
                        }
                        DataRow dRow = dt.NewRow();
                        dRow[0] = Id;
                        dRow[1] = brand.CountryId;
                        dRow[2] = brand.CategoryId;
                        dRow[3] = brand.BrandId;
                        dt.Rows.Add(dRow);
                        tableTypeParameter += "INSERT INTO @A VALUES ( "+dRow[0]+ ",  " + dRow[1]+ ", " + dRow[2] + ", " + dRow[3]+")\n";
                        CheckPrevName = brand.BrandName;
                    }
                }
                #endregion

                #region Segment1 Mappings
                DataTable dSegment = new DataTable();
                DataColumn dcSegment = new DataColumn("Id", typeof(Int32));
                dSegment.Columns.Add(dcSegment);

                dcSegment = new DataColumn("CountryId", typeof(Int32));
                dSegment.Columns.Add(dcSegment);

                dcSegment = new DataColumn("CategoryId", typeof(Int32));
                dSegment.Columns.Add(dcSegment);

                dcSegment = new DataColumn("SegmentId", typeof(String));
                dSegment.Columns.Add(dcSegment);

                Id = 0; CheckPrevName = "";

                if (request.SegmentMappings != null && request.SegmentMappings.Count > 0)
                {
                    foreach (SegmentEntity segment in request.SegmentMappings)
                    {
                        if (segment.Type == 1) {
                            if (segment.SegmentName != CheckPrevName)
                            {
                                Id++;
                            }
                            DataRow dRow = dSegment.NewRow();
                            dRow[0] = Id;
                            dRow[1] = segment.CountryId;
                            dRow[2] = segment.CategoryId;
                            dRow[3] = segment.SegmentId;
                            dSegment.Rows.Add(dRow);
                            tableTypeParameter += "INSERT INTO @B VALUES ( " + dRow[0] + ",  " + dRow[1] + ", " + dRow[2] + ", " + dRow[3] + ")\n";
                            CheckPrevName = segment.SegmentName;
                        }
                    }
                }
                #endregion

                #region Segment2 Mappings
                DataTable dSegment2 = new DataTable();
                DataColumn dcSegment2 = new DataColumn("Id", typeof(Int32));
                dSegment2.Columns.Add(dcSegment2);

                dcSegment2 = new DataColumn("CountryId", typeof(Int32));
                dSegment2.Columns.Add(dcSegment2);

                dcSegment2 = new DataColumn("CategoryId", typeof(Int32));
                dSegment2.Columns.Add(dcSegment2);

                dcSegment2 = new DataColumn("SegmentId", typeof(String));
                dSegment2.Columns.Add(dcSegment2);

                if (request.SegmentMappings != null && request.SegmentMappings.Count > 0)
                {
                    foreach (SegmentEntity segment in request.SegmentMappings)
                    {
                        if (segment.Type == 2)
                        {
                            DataRow dRow = dSegment2.NewRow();
                            dRow[0] = dSegment2.Rows.Count + 1;
                            dRow[1] = segment.CountryId;
                            dRow[2] = segment.CategoryId;
                            dRow[3] = segment.SegmentId;
                            dSegment2.Rows.Add(dRow);
                            tableTypeParameter += "INSERT INTO @C VALUES ( " + dRow[0] + ",  " + dRow[1] + ", " + dRow[2] + ", " + dRow[3] + ")\n";
                        }
                    }
                }
                #endregion

                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.CrossTab_GetOutputData;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;
                cmd.Parameters.Add(getParameter("@col", request.ColumnId));
                cmd.Parameters.Add(getParameter("@row", request.RowId));
                cmd.Parameters.Add(getParameter("@country", request.MarketId));
                cmd.Parameters.Add(getParameter("@category", request.CategoryId));
                cmd.Parameters.Add(getParameter("@Timeperiod", request.TimePeriodId));
                //cmd.Parameters.Add(getParameter("@brand", request.BrandName));

                SqlParameter BrandData = new SqlParameter("@brand", SqlDbType.Structured);
                BrandData.TypeName = "TVP_Brand";
                BrandData.Value = dt;
                cmd.Parameters.Add(BrandData);

                //cmd.Parameters.Add(getParameter("@segment1", request.Segment1Id));
                SqlParameter SegmentData = new SqlParameter("@segment1", SqlDbType.Structured);
                SegmentData.TypeName = "TVP_Brand";
                SegmentData.Value = dSegment;
                cmd.Parameters.Add(SegmentData);

                //cmd.Parameters.Add(getParameter("@segment2", request.Segment2Id));
                SqlParameter SegmentData2 = new SqlParameter("@segment2", SqlDbType.Structured);
                SegmentData2.TypeName = "TVP_Brand";
                SegmentData2.Value = dSegment2;
                cmd.Parameters.Add(SegmentData2);
                cmd.Parameters.Add(getParameter("@kpi", request.KpiId));
                cmd.Parameters.Add(getParameter("@ischannel", request.isChannel ? "1" : "0"));
                cmd.Parameters.Add(getParameter("@isChannelOrDemog", request.isChannelOrDemog));
                cmd.Parameters.Add(getParameter("@channel", request.ChannelId));
                cmd.Parameters.Add(getParameter("@Demographic", request.DemographicId));


                #region Proc Log
                object[] param = new object[] {
                request.ColumnId,
                request.RowId,
                request.MarketId,
                request.CategoryId,
                request.TimePeriodId,
                "@A",
                "@B",
                "@C",
                request.KpiId,
                request.isChannelOrDemog,
                request.ChannelId,
                request.DemographicId,
                request.isChannel?"1":"0",
            };
                Log.LogMessage(tableTypeParameter);
                Log.LogProc(Constants.CrossTab_GetOutputData, param);

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
        public SqlParameter getParameter(string name, string value)
        {
            SqlParameter param = new SqlParameter(name, SqlDbType.VarChar);
            if (string.IsNullOrEmpty(value))
                param.Value = DBNull.Value;
            else
                param.Value = value;
            return param;
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


        #endregion
    }
}