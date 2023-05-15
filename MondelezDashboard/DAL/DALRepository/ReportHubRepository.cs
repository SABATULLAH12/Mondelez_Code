using System;
using System.Data;
using Entites;
using System.Data.SqlClient;
using System.Collections.Generic;
using System.IO;
using System.Web;

namespace DAL
{
    public class ReportsHubRepository : IReportsHubRepository, IDisposable
    {
        internal readonly IConnectionFactory _connFactory;
        internal readonly IDbConnection _myConn;

        public ReportsHubRepository(IConnectionFactory connFatory)
        {
            _connFactory = connFatory;
            _myConn = connFatory.GetConnection;
        }

        #region Repository Methods        

        public IList<string> GetFileList()
        {
            string Folder = HttpContext.Current.Server.MapPath("~/Reports");
            string[] filePaths = Directory.GetFiles(Folder);
            string[] Paths = new string[filePaths.Length];
            for (int i = 0; i < filePaths.Length; i++)
            {
                var path = new FileInfo(filePaths[i]);
                Paths[i] = path.Name;
            }
            return Paths;
        }
        public AuthUserRole GetUserRoleDAL(int UserId)
        {
            AuthUserRole userRoleObj = new AuthUserRole();
            string con = _myConn.ConnectionString;
            string spName = Constants.GetUserRole;
            using (var sqlconn = new SqlConnection(con))
            {
                using (var sqlcommand = new SqlCommand(spName))
                {
                    sqlcommand.Connection = sqlconn;
                    sqlcommand.CommandType = CommandType.StoredProcedure;
                    sqlcommand.Parameters.Add("@UserId", SqlDbType.VarChar).Value = UserId;

                    sqlcommand.CommandTimeout = Constants.Command_Timeout;
                    sqlconn.Open();
                    SqlDataReader dataReader = sqlcommand.ExecuteReader();

                    while (dataReader.Read())
                    {
                        userRoleObj.User_ROLE = Convert.ToString(dataReader["User_ROLE"]);
                    }
                }
                return userRoleObj;
            }
        }
        public DataSet GetMailIdsToSendMailForReport(string fileName)
        {
            DataSet dsData = new DataSet();
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.GetMailIdsToSendMailForReport;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;
                cmd.Parameters.Add(getParameter("@fileName", fileName));
                #region Proc Log
                object[] param = new object[] {
                    fileName,
            };
                Log.LogProc(Constants.GetMailIdsToSendMailForReport, param);
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

        #endregion
        public SqlParameter getParameter(string name, string value)
        {
            SqlParameter param = new SqlParameter(name, SqlDbType.VarChar);
            if (string.IsNullOrEmpty(value))
                param.Value = DBNull.Value;
            else
                param.Value = value;
            return param;
        }

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