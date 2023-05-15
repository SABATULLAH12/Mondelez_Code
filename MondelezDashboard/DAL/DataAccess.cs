using Microsoft.Practices.EnterpriseLibrary.Data.Sql;
using System;
using System.Data;

namespace DAL
{
    public class DataAccess
    {
        public DataSet GetData(IDbConnection conn, string strSPName)
        {
            DataSet dsData = new DataSet();

            SqlDatabase database = new SqlDatabase(conn.ConnectionString);
            dsData = database.ExecuteDataSet(strSPName);

            return dsData;
        }
    }
}
