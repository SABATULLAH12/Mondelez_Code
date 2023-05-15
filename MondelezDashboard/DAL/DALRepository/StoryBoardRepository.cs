using System;
using System.Data;
using Entites;
using System.Data.SqlClient;

namespace DAL
{
    public class StoryBoardRepository : IStoryBoardRepository, IDisposable
    {
        internal readonly IConnectionFactory _connFactory;
        internal readonly IDbConnection _myConn;

        public StoryBoardRepository(IConnectionFactory connFatory)
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
        public  DataSet StoriesToSave(StoryBoardRequest request)
        {
            DataSet dsData = new DataSet();
            try
            {            
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.StoryBoard_GetStories;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;
                cmd.Parameters.Add(getParameter("@UserId", request.UserId));

                #region Proc Log
                object[] param = new object[] {
                request.UserId,
            };
                Log.LogProc(Constants.StoryBoard_GetStories, param);
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
        public DataSet SavedStories(StoryBoardRequest request)
        {
            DataSet dsData = new DataSet();
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.StoryBoard_SavedStories;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;
                cmd.Parameters.Add(getParameter("@UserId", request.UserId));

                #region Proc Log
                object[] param = new object[] {
                request.UserId,
            };
                Log.LogProc(Constants.StoryBoard_SavedStories, param);
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
        public DataSet AddSlide(StoryBoardRequest request)
        {
            DataSet dsData = new DataSet();
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.StoryBoard_AddSlide;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;
                cmd.Parameters.Add(getParameter("@StoryId", request.StoryID.ToString()));
                cmd.Parameters.Add(getParameter("@UserId", request.UserId));
                cmd.Parameters.Add(getParameter("@SlideName", request.SlideName));
                cmd.Parameters.Add(getParameter("@ModuleId", request.ModuleId));
                cmd.Parameters.Add(getParameter("@Selection", request.Selection));
                cmd.Parameters.Add(getParameter("@AdditionalInfo", request.AddtionalInfo));

                #region Proc Log
                object[] param = new object[] {
                request.StoryID.ToString(),
                request.UserId,
                request.SlideName,
                request.ModuleId,
                request.Selection,
                request.AddtionalInfo
            };
                Log.LogProc(Constants.StoryBoard_AddSlide, param);
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
        public DataSet AddStory(StoryBoardRequest request)
        {
            DataSet dsData = new DataSet();
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.StoryBoard_AddStory;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;
                cmd.Parameters.Add(getParameter("@UserId", request.UserId));
                cmd.Parameters.Add(getParameter("@StoryName", request.StoryName));
                cmd.Parameters.Add(getParameter("@SlideName", request.SlideName));
                cmd.Parameters.Add(getParameter("@ModuleId", request.ModuleId));
                cmd.Parameters.Add(getParameter("@Selection", request.Selection));
                cmd.Parameters.Add(getParameter("@AdditionalInfo", request.AddtionalInfo));

                #region Proc Log
                object[] param = new object[] {
                request.UserId,
                request.StoryName,
                request.SlideName,
                request.ModuleId,
                request.Selection,
                request.AddtionalInfo
            };
                Log.LogProc(Constants.StoryBoard_AddStory, param);
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
        public DataSet DeleteStory(int storyId)
        {
            DataSet dsData = new DataSet();
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.StoryBoard_DeleteStory;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;
                cmd.Parameters.Add(getParameter("@storyId", storyId.ToString()));

                #region Proc Log
                object[] param = new object[] { storyId };
                Log.LogProc(Constants.StoryBoard_DeleteStory, param);
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
        public DataSet DeleteSlide(string slideIds)
        {
            DataSet dsData = new DataSet();
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.StoryBoard_DeleteSlide;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;
                cmd.Parameters.Add(getParameter("@slideId", slideIds.Replace(',','|')));

                #region Proc Log
                object[] param = new object[] { slideIds };
                Log.LogProc(Constants.StoryBoard_DeleteSlide, param);
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
        public DataSet GetStorySlides(int storyId)
        {
            DataSet dsData = new DataSet();
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.StoryBoard_GetStorySlides;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;

                cmd.Parameters.Add(getParameter("@StoryId", storyId.ToString()));

                #region Proc Log
                object[] param = new object[] {
                storyId.ToString()
            };
                Log.LogProc(Constants.StoryBoard_GetStorySlides, param);
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
        public DataSet EditStoryName(int storyId,string storyName,string userId)
        {
            DataSet dsData = new DataSet();
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.StoryBoard_EditStoryName;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;
                cmd.Parameters.Add(getParameter("@storyId", storyId.ToString()));
                cmd.Parameters.Add(getParameter("@storyName", storyName));
                cmd.Parameters.Add(getParameter("@userId", userId));

                #region Proc Log
                object[] param = new object[] { storyId, storyName };
                Log.LogProc(Constants.StoryBoard_EditStoryName, param);
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
        public DataSet GetUsers(int storyId)
        {
            DataSet dsData = new DataSet();
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.StoryBoard_GetUsers;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;
                cmd.Parameters.Add(getParameter("@StoryId", storyId.ToString()));

                #region Proc Log
                object[] param = new object[] {
                storyId.ToString()
            };
                Log.LogProc(Constants.StoryBoard_GetUsers, param);
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
        public bool ShareStory(string storyId, string userIdsToShare, string curUserID)
        {
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.StoryBoard_ShareStory;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;
                cmd.Parameters.Add(getParameter("@storyId", storyId));
                cmd.Parameters.Add(getParameter("@userIdsToShare", userIdsToShare));
                cmd.Parameters.Add(getParameter("@sharedBy", curUserID));

                #region Proc Log
                object[] param = new object[] { storyId, userIdsToShare, curUserID };
                Log.LogProc(Constants.StoryBoard_ShareStory, param);
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
        public DataSet SharedStories(string userId, bool isSharedWithMe)
        {
            DataSet dsData = new DataSet();
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.StoryBoard_GetSharedStories;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;
                cmd.Parameters.Add(getParameter("@UserId", userId));
                cmd.Parameters.Add(getParameter("@isSharedWithMe", (isSharedWithMe ? 1 : 0).ToString()));

                #region Proc Log
                object[] param = new object[] {
                userId,isSharedWithMe
            };
                Log.LogProc(Constants.StoryBoard_GetSharedStories, param);
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
        public DataSet saveASNewStory(int? storyID, string storyName, string userId)
        {
            DataSet dsData = new DataSet();
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.StoryBoard_SaveASNewStory;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;
                cmd.Parameters.Add(getParameter("@storyID", storyID.ToString()));
                cmd.Parameters.Add(getParameter("@storyName", storyName));
                cmd.Parameters.Add(getParameter("@userId", userId));

                #region Proc Log
                object[] param = new object[] {
                storyID,
                storyName,
                userId,
            };
                Log.LogProc(Constants.StoryBoard_SaveASNewStory, param);
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
        public DataSet GetLockStatus(string StoryID)
        {
            DataSet dsData = new DataSet();
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.StoryBoard_GetLockStatus;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;
                cmd.Parameters.Add(getParameter("@StoryId", StoryID));

                #region Proc Log
                object[] param = new object[] {
                StoryID,
            };
                Log.LogProc(Constants.StoryBoard_GetLockStatus, param);
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
        public bool SetLock(StoryLock data)
        {
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.StoryBoard_SetLock;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;
                cmd.Parameters.Add(getParameter("@StoryId", data.StoryID));
                cmd.Parameters.Add(getParameter("@IsLocked", data.IsLocked ? "1" : "0"));
                cmd.Parameters.Add(getParameter("@LockedBy", data.LockedBy));

                #region Proc Log
                object[] param = new object[] { data.StoryID, data.IsLocked , data.LockedBy };
                Log.LogProc(Constants.StoryBoard_SetLock, param);
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
        public bool UpdateSlides(StorySlide slide)
        {
            try
            {
                IDbCommand cmd = _myConn.CreateCommand();
                cmd.CommandText = Constants.StoryBoard_UpdateSlide;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = Constants.Command_Timeout;
                cmd.Parameters.Add(getParameter("@slideId", slide.SlideID.ToString()));
                cmd.Parameters.Add(getParameter("@SelectionJSON", slide.SelectionJSON));
                cmd.Parameters.Add(getParameter("@AddtionalInfo", slide.AddtionalInfo));

                #region Proc Log
                object[] param = new object[] { slide.SlideID.ToString(), slide.SelectionJSON, slide.AddtionalInfo };
                Log.LogProc(Constants.StoryBoard_UpdateSlide, param);
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

        #endregion
    }
}