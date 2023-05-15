using BAL.BALInterface;
using Entites;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;

namespace MondelezDashboard.Controllers.API
{
    public class LoginController : ApiController
    {
        private static ILogin _loginObj;

        public LoginController(ILogin loginObj)
        {
            _loginObj = loginObj;
        }

        public HttpResponseMessage CheckUser(LoginRequest request)
        {
            HttpResponseMessage _response = null;

            if (Convert.ToBoolean(ConfigurationManager.AppSettings["LocalLogin"]))
            {
                LoginResponse response = _loginObj.CheckUser(request);
                if (response.isValidUser)
                {
                    AuthUserDetails userDetailsObject = _loginObj.GetUserDetails(request.UserName);

                    if (userDetailsObject != null)
                    {
                        HttpContext.Current.Session["IsSSO"] = userDetailsObject.IsSSO;
                        HttpContext.Current.Session["Email"] = userDetailsObject.Email;
                        HttpContext.Current.Session["FirstName"] = userDetailsObject.FirstName;
                        HttpContext.Current.Session["LastName"] = userDetailsObject.LastName;
                        HttpContext.Current.Session["UserId"] = userDetailsObject.UserId;
                        HttpContext.Current.Session["LoginUrl"] = ConfigurationManager.AppSettings["LocalLoginUrl"].ToString();
                        HttpContext.Current.Session.Timeout = Convert.ToInt32(ConfigurationManager.AppSettings["SessionTimeOut"].ToString());
                        _response = Request.CreateResponse(HttpStatusCode.OK, response.isValidUser);
                    }
                }
                else
                {
                    response.isValidUser = false;
                    _response = Request.CreateResponse(HttpStatusCode.Unauthorized, response.isValidUser);
                }
            }
            return _response;
                
        }
    }
}
 