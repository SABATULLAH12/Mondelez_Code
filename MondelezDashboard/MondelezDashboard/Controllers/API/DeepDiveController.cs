using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Entites;
using BAL;
using System.Web;
using MondelezDashboard.Utilities;

namespace MondelezDashboard.Controllers.API
{
    [ApiAuthorizationFilter]
    public class DeepDiveController : ApiController
    {
        private static IDeepDive _DeepDiveObj;
        public DeepDiveController(IDeepDive _Obj)
        {
            try
            {
                _DeepDiveObj = _Obj;
                Log.LogMessage("Deepdive API initiated by User " + HttpContext.Current.Session["Email"].ToString());
            }
            catch 
            {
                Log.LogMessage("User is not authorized");
            }
        }
        [HttpPost]
        public HttpResponseMessage GetChartOutput(DeepdiveViewRequest request)
        {
            var response = _DeepDiveObj.GetChartOutput(request);
            HttpResponseMessage _response = Request.CreateResponse(HttpStatusCode.OK, response);
            return _response;
        }
        [HttpPost]
        public HttpResponseMessage ExportPPTExcel(DeepdiveViewRequest request)
        {
            var response = _DeepDiveObj.ExportPPTExcel(request);
            HttpResponseMessage _response = Request.CreateResponse(HttpStatusCode.OK, response);
            return _response;
        }

    }
}
