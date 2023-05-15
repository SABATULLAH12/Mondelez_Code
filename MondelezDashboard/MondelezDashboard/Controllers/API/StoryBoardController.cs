using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

using BAL;
using Entites;
using MondelezDashboard.Utilities;
using System.Web;

namespace MondelezDashboard.Controllers.API
{
    [ApiAuthorizationFilter]
    public class StoryBoardController : ApiController
    {
        private static IStoryBoard _StoryBoardObj;
        public StoryBoardController(IStoryBoard _Obj)
        {
            try
            {
                _StoryBoardObj = _Obj;
                Log.LogMessage("StoryBoard API initiated by User " + HttpContext.Current.Session["Email"].ToString());
            }
            catch
            {
                Log.LogMessage("User is not authorized");
            }
        }
        [HttpPost]
        public object StoriesToSave(StoryBoardRequest request)
        {
            request.UserId = HttpContext.Current.Session["UserId"].ToString();
            return _StoryBoardObj.StoriesToSave(request);
        }
        [HttpPost]
        public object SavedStories(StoryBoardRequest request)
        {
            request.UserId = HttpContext.Current.Session["UserId"].ToString();
            return _StoryBoardObj.SavedStories(request);
        }
        [HttpPost]
        public bool AddSlide(StoryBoardRequest request)
        {
            request.UserId = HttpContext.Current.Session["UserId"].ToString();
            return _StoryBoardObj.AddSlide(request);
        }
        [HttpPost]
        public bool AddStory(StoryBoardRequest request)
        {
            request.UserId = HttpContext.Current.Session["UserId"].ToString();
            return _StoryBoardObj.AddStory(request);
        }
        [HttpPost]
        public bool DeleteStory(object Id)
        {
            return _StoryBoardObj.DeleteStory(Convert.ToInt32(Id));
        }
        [HttpPost]
        public bool DeleteSlide(StoryBoardRequest request)
        {
            return _StoryBoardObj.DeleteSlide(request.SelectedSlides);
        }
        [HttpPost]
        public bool EditStoryName(StoryBoardRequest request)
        {
            return _StoryBoardObj.EditStoryName(request.StoryID ?? -1, request.StoryName, HttpContext.Current.Session["UserId"].ToString());
        }
        [HttpPost]
        public List<StorySlide> GetStorySlides(object storyId)
        {
            return _StoryBoardObj.GetStorySlides(Convert.ToInt32(storyId));
        }
        [HttpPost]
        public object GetUsers(object storyId)
        {
            return _StoryBoardObj.GetUsers(Convert.ToInt32(storyId), HttpContext.Current.Session["UserId"].ToString());
        }
        [HttpPost]
        public bool ShareStory(StoryBoardRequest request)
        {
            request.UserId = HttpContext.Current.Session["UserId"].ToString();
            return _StoryBoardObj.ShareStory(Convert.ToString(request.StoryID ?? 0), request.UserIdsToShare,request.UserId);
        }
        [HttpPost]
        public object SharedStories(StoryBoardRequest request)
        {
            request.UserId = HttpContext.Current.Session["UserId"].ToString();
            return _StoryBoardObj.SharedStories(request.UserId, request.isSharedWithMe);
        }
        [HttpPost]
        public string PrepareStoryBoardPPT(List<StorySlide> request)
        {
            return _StoryBoardObj.PrepareStoryBoardPPT(request, HttpContext.Current.Session["FirstName"].ToString() + " " + HttpContext.Current.Session["LastName"].ToString());
        }
        [HttpPost]
        public bool saveASNewStory(StoryBoardRequest request)
        {
            request.UserId = HttpContext.Current.Session["UserId"].ToString();
            return _StoryBoardObj.saveASNewStory(request.StoryID,request.StoryName,request.UserId);
        }
        [HttpPost]
        public bool UpdateSlides(List<StorySlide> request)
        {
            return _StoryBoardObj.UpdateSlides(request);
        }
        [HttpPost]
        public StoryLock GetLockStatus(object StoryID)
        {
            return _StoryBoardObj.GetLockStatus(StoryID.ToString());
        }
        [HttpPost]
        public bool SetLock(StoryLock request)
        {
            request.LockedBy = HttpContext.Current.Session["UserId"].ToString();
            return _StoryBoardObj.SetLock(request);
        }
    }
}
