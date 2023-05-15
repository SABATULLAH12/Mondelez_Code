using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http.Filters;

namespace MondelezDashboard.Utilities
{
    public class ApiAuthorizationFilter : AuthorizationFilterAttribute
    {
        private bool _Flag { get; set; }
        public ApiAuthorizationFilter()
        {
            _Flag = true;
        }
        public ApiAuthorizationFilter(bool flag)
        {
            _Flag = flag;
        }

        public static string Base64Decode(string base64EncodedData)
        {
            var base64EncodedBytes = System.Convert.FromBase64String(base64EncodedData);
            return System.Text.Encoding.UTF8.GetString(base64EncodedBytes);
        }

        public override void OnAuthorization(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            try
            {
                if (!_Flag)
                    return;
                
                if (HttpContext.Current.Session["UserId"] !=null && HttpContext.Current.Session["UserId"].ToString() != "")
                {
                    //pass
                }
                else
                {
                    // returns unauthorized error  
                    actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Unauthorized);
                }
                base.OnAuthorization(actionContext);
            }
            // Handling Authorize: Basic <base64(username:password)> format.
            catch (Exception e)
            {
                actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Unauthorized);
            }
        }
    }
}