using DAL.DALInterface;
using Entites;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace DAL.DALRepository
{
    public class LoginRepository:ILoginRepository
    {

        internal readonly IConnectionFactory _connFactory;
        internal readonly IDbConnection _myConn;

        public LoginRepository(IConnectionFactory connFatory)
        {
            _connFactory = connFatory;
            _myConn = connFatory.GetConnection;
        }

        public int GetUserId(AuthUserDetails userDetails)
        {
            int userID = -1;
            IDbCommand cmd = _myConn.CreateCommand();
            cmd.CommandText = Constants.InsertNewUser;
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.CommandTimeout = Constants.Command_Timeout;
            var parameter = cmd.CreateParameter();
            parameter.ParameterName = "@Email";
            parameter.Value = userDetails.Email;
            cmd.Parameters.Add(parameter);
            parameter = cmd.CreateParameter();
            parameter.ParameterName = "@FirstName";
            parameter.Value = userDetails.FirstName;
            cmd.Parameters.Add(parameter);
            parameter = cmd.CreateParameter();
            parameter.ParameterName = "@LastName";
            parameter.Value = userDetails.LastName;
            cmd.Parameters.Add(parameter);
            parameter = cmd.CreateParameter();
            parameter.ParameterName = "@IsSSO";
            parameter.Value = userDetails.IsSSO;
            cmd.Parameters.Add(parameter);
            _myConn.Open();
            userID = Convert.ToInt32(cmd.ExecuteScalar());
            _myConn.Close();
            return userID;
        }

        public LoginResponse CheckUser(LoginRequest request)
        {
            LoginResponse response = new LoginResponse();
            #region Proc Log
            object[] param = new object[] {
                request.UserName
            };
            Log.LogProc(Constants.VerifyUser, param);
            #endregion
            string con = _myConn.ConnectionString;
            string spName = Constants.VerifyUser;
            using (var sqlconn = new SqlConnection(con))
            {
                using (var sqlcommand = new SqlCommand(spName))
                {
                    sqlcommand.Connection = sqlconn;
                    sqlcommand.CommandType = CommandType.StoredProcedure;
                    sqlcommand.Parameters.Add("@USERNAME", SqlDbType.VarChar).Value = request.UserName;

                    sqlcommand.CommandTimeout = 5000;
                    sqlconn.Open();
                    SqlDataReader dataReader = sqlcommand.ExecuteReader();

                    while (dataReader.Read())
                    {
                        response.isValidUser = Convert.ToBoolean(dataReader["USER_STATUS"]);
                    }
                }
                return response;
            }
        }
        public AuthUserDetails GetUserDetails(string UserName)
        {
            AuthUserDetails userDetailsObj = new AuthUserDetails();
            string con = _myConn.ConnectionString;
            string spName = Constants.GetUserDetails;
            using (var sqlconn = new SqlConnection(con))
            {
                using (var sqlcommand = new SqlCommand(spName))
                {
                    sqlcommand.Connection = sqlconn;
                    sqlcommand.CommandType = CommandType.StoredProcedure;
                    sqlcommand.Parameters.Add("@UserName", SqlDbType.VarChar).Value = UserName;

                    sqlcommand.CommandTimeout = 5000;
                    sqlconn.Open();
                    SqlDataReader dataReader = sqlcommand.ExecuteReader();

                    while (dataReader.Read())
                    {
                        userDetailsObj.Email = Convert.ToString(dataReader["Email"]);
                        userDetailsObj.UserId = Convert.ToInt32(dataReader["UserId"]);
                        userDetailsObj.FirstName = Convert.ToString(dataReader["FirstName"]);
                        userDetailsObj.LastName = Convert.ToString(dataReader["LastName"]);
                        userDetailsObj.IsSSO = false;
                    }
                }
                return userDetailsObj;
            }
        }
    }
}
