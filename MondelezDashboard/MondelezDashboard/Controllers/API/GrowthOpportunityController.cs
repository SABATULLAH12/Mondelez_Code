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
    public class GrowthOpportunityController : ApiController
    {
        private static IGrowthOpportunity _GrowthOppObj;
        public GrowthOpportunityController(IGrowthOpportunity _Obj)
        {
            try
            {

                _GrowthOppObj = _Obj;
                Log.LogMessage("GrowthOpportunity API initiated by User " + HttpContext.Current.Session["Email"].ToString());
            }
            catch 
            {
                Log.LogMessage("User is not authorized");
            }
        }
        [HttpPost]
        public HttpResponseMessage GetChartOutput(GrowthOpportunityRequest request)
        {
            var response = _GrowthOppObj.GetChartOutput(request);
            HttpResponseMessage _response = Request.CreateResponse(HttpStatusCode.OK, response);
            return _response;
        }
        [HttpPost]
        public HttpResponseMessage ExportPPT(GrowthOpportunityRequest request)
        {
            var response = _GrowthOppObj.ExportPPT(request);
            HttpResponseMessage _response = Request.CreateResponse(HttpStatusCode.OK, response);
            return _response;
        }
        //public HttpResponseMessage DeleteFile(string FilePath)
        //{
        //    HttpResponseMessage _response = null;
        //    if (Directory.Exists(System.Web.HttpContext.Current.Server.MapPath(FilePath)))
        //    {
        //        Directory.Delete(System.Web.HttpContext.Current.Server.MapPath(FilePath), true);
        //        _response = Request.CreateResponse(HttpStatusCode.OK, true);
        //    }
        //    _response = Request.CreateResponse(HttpStatusCode.OK, false);
        //    return _response;
        //}
    }
}
