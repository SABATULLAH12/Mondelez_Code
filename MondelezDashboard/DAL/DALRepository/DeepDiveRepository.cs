using System;
using System.Data;
using Entites;
using System.Data.SqlClient;
using System.Linq;

namespace DAL
{
    public class DeepDiveRepository : IDeepDiveRepository, IDisposable
    {
        internal readonly IConnectionFactory _connFactory;
        internal readonly IDbConnection _myConn;

        public DeepDiveRepository(IConnectionFactory connFatory)
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
       
        public DataSet GetChartOutput(DeepdiveViewRequest request)
        {
            DataSet dsData = new DataSet();
            string tableTypeParameter = "DECLARE @A TVP_BRAND\n";

            try
            {
                DataTable dt = new DataTable();
                DataColumn dc = new DataColumn("Id", typeof(Int32));
                dt.Columns.Add(dc);

                dc = new DataColumn("CountryId", typeof(Int32));
                dt.Columns.Add(dc);

                dc = new DataColumn("CategoryId", typeof(Int32));
                dt.Columns.Add(dc);

                dc = new DataColumn("BrandId", typeof(String));
                dt.Columns.Add(dc);

                if (request.BrandMappings != null && request.BrandMappings.Count>0)
                {
                    foreach (BrandEntity brand in request.BrandMappings)
                    {
                        DataRow dRow = dt.NewRow();
                        dRow[0] = dt.Rows.Count + 1;
                        dRow[1] = brand.CountryId;
                        dRow[2] = brand.CategoryId;
                        dRow[3] = brand.BrandId;
                        dt.Rows.Add(dRow);
                        tableTypeParameter += "INSERT INTO @A VALUES ( " + dRow[0] + ",  " + dRow[1] + ", " + dRow[2] + ", " + dRow[3] + ")\n";
                    }
                }

                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.DeepDive_GetOutputData;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;
                cmd.Parameters.Add(getParameter("@compareid", request.CompareId));
                cmd.Parameters.Add(getParameter("@country", request.MarketId));
                cmd.Parameters.Add(getParameter("@category", request.CategoryId));
                cmd.Parameters.Add(getParameter("@Timeperiod", request.TimePeriodId));
                //cmd.Parameters.Add(getParameter("@brand", request.BrandName));

                SqlParameter BrandData = new SqlParameter("@brand", SqlDbType.Structured);
                BrandData.TypeName = "TVP_Brand";
                BrandData.Value = dt;
                cmd.Parameters.Add(BrandData);

                cmd.Parameters.Add(getParameter("@segment1", request.Segment1Id));
                cmd.Parameters.Add(getParameter("@segment2", request.Segment2Id));
                cmd.Parameters.Add(getParameter("@kpi", request.KpiId));
                cmd.Parameters.Add(getParameter("@isChannelOrDemog", request.isChannelOrDemog));
                cmd.Parameters.Add(getParameter("@channel", request.ChannelId));
                cmd.Parameters.Add(getParameter("@Demographic", request.DemographicId));


                #region Proc Log
                object[] param = new object[] {
                request.CompareId,
                request.MarketId,
                request.CategoryId,
                request.TimePeriodId,
                "@A",
                request.Segment1Id,
                request.Segment2Id,
                request.KpiId,
                request.isChannelOrDemog,
                request.ChannelId,
                request.DemographicId,
            };
                Log.LogMessage(tableTypeParameter);
                Log.LogProc(Constants.DeepDive_GetOutputData, param);
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

        public SqlParameter getParameter(string name,string value)
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