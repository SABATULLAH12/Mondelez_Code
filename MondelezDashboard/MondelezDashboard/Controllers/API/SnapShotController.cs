using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

using BAL;
using Entites;
using MondelezDashboard.Utilities;
using System.IO;
using System.Web;

namespace MondelezDashboard.Controllers.API
{
    [ApiAuthorizationFilter]
    public class SnapShotController : ApiController
    {
        private static ISnapShot _SnapShotObj;
        public SnapShotController(ISnapShot _Obj)
        {
            try
            {
                _SnapShotObj = _Obj;
                Log.LogMessage("SnapShot API initiated by User " + HttpContext.Current.Session["Email"].ToString());
            }
            catch
            {
                Log.LogMessage("User is not authorized");
            }
        }
        [HttpPost]
        public HttpResponseMessage GetChartOutput(SnapshotRequest request)
        {
            var response = _SnapShotObj.GetChartOutput(request);
            HttpResponseMessage _response = Request.CreateResponse(HttpStatusCode.OK, response);
            return _response;
        }
        [HttpPost]
        public HttpResponseMessage ExportPPTExcel(SnapshotRequest request)
        {
            var response = _SnapShotObj.ExportPPTExcel(request);
            HttpResponseMessage _response = Request.CreateResponse(HttpStatusCode.OK, response);
            return _response;
        }
        //[HttpGet]
        //public HttpResponseMessage DeleteFile(string FilePath)
        //{
        //    HttpResponseMessage _response = null;
        //    if (Directory.Exists(System.Web.HttpContext.Current.Server.MapPath(FilePath)))
        //    {
        //        Directory.Delete(System.Web.HttpContext.Current.Server.MapPath(FilePath), true);
        //        _response = Request.CreateResponse(HttpStatusCode.OK, true);
        //    }
        //    _response= Request.CreateResponse(HttpStatusCode.OK, false);
        //    return _response;
        //}
    }
}
