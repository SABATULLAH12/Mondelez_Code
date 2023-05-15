using System;
using Entites;
using System.Net;
using System.Web.Mvc;
using Newtonsoft.Json;
using System.IO;
using BAL.BALInterface;
using System.Threading.Tasks;
using System.Configuration;
using System.Net.Http;
using System.Net.Http.Headers;

namespace MondelezDashboard.Controllers
{
    public class HomeController : Controller
    {
        private static ILogin _loginObj;
        
        public HomeController(ILogin _Obj)
        {
            _loginObj = _Obj;
        }



        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        public ActionResult Locallogin()
        {
            Log.LogMessage("LocalLogin Action Accessed");
            if (Session["UserId"] != null && Session["UserId"].ToString() != "")
            {
                return RedirectToAction("Index");
            }
            else if (Convert.ToBoolean(ConfigurationManager.AppSettings["LocalLogin"]))
            {   Session.Timeout = Convert.ToInt32(ConfigurationManager.AppSettings["SessionTimeOut"]);
                ViewBag.LoginPage = ConfigurationManager.AppSettings["LocalLogin"];
                ViewBag.LoginPageURL = ConfigurationManager.AppSettings["LocalLoginUrl"];
                ViewBag.IsSSo = "false";
                return View();
            }
            else
            {
                Session.Clear();
                return Redirect(ConfigurationManager.AppSettings["LoginPageURL"].ToString() +ConfigurationManager.AppSettings["AuthLogout"].ToString());
            }
        }

        /// <summary>
        /// GET Home
        /// </summary>
        /// <param name="param"> Token Value and Time at which token generated</param>
        /// <returns></returns>
        public ActionResult Index(string param)
        {
            Log.LogMessage("Home Index Accessed, Param " + (string.IsNullOrEmpty(param) ? "null" : param));
            string UseGID = ConfigurationManager.AppSettings["UseGID"].ToString();
            if (UseGID != "")
            {
                ViewBag.GID = ConfigurationManager.AppSettings[UseGID];
            }
            else
            {
                ViewBag.GID = "";
            }

            string loginURl = ConfigurationManager.AppSettings["LoginPageURL"].ToString();
            int tokenValidity = Convert.ToInt32(ConfigurationManager.AppSettings["TokenValidity"]); // in minutes
            LoginInfo loginInfo = new LoginInfo();

            if (param != null && VerifyTokenFromAuthServer(param, tokenValidity, loginURl, Request))
            {
                // When Parameter is passed and Token is valid and came from Auth Server
                loginInfo = ValidateUser(param).GetAwaiter().GetResult();
                if (loginInfo!=null && loginInfo.IsAuthenticated)
                {
                    Session["LoginUrl"] = loginURl;
                    Session["RecivedToken"] = param;
                    Session["IsSSO"] = loginInfo.UserInfo.IsSSO;
                    Session["Email"] = loginInfo.UserInfo.Email;
                    Session["FirstName"] = loginInfo.UserInfo.FirstName;
                    Session["LastName"] = loginInfo.UserInfo.LastName;
                    Session["UserId"] = _loginObj.GetUserId(loginInfo.UserInfo);
                    Session.Timeout = Convert.ToInt32(ConfigurationManager.AppSettings["SessionTimeOut"]);
                    ViewBag.LoginPage = ConfigurationManager.AppSettings["LocalLogin"];
                    ViewBag.LoginPageURL = Session["LoginUrl"];
                    ViewBag.IsSSO = Session["IsSSO"];
                    Log.LogMessage("User Is Validated : " + (string.IsNullOrEmpty(loginInfo.UserInfo.Email) ? "" : loginInfo.UserInfo.Email));
                    return View();
                }
                else
                {
                    Session.Clear();
                    Log.LogMessage("request Is redirected to : " + loginURl);
                    return Redirect(loginURl);
                }
            }
            else
            {
                // When Parameter is not passed or Token is expired or token not from Auth Server
                if (Session["UserId"] !=null && Session["UserId"].ToString() != "")
                {
                    ViewBag.LoginPage = ConfigurationManager.AppSettings["LocalLogin"];
                    ViewBag.LoginPageURL = Session["LoginUrl"];
                    ViewBag.IsSSO = Session["IsSSO"];
                    Log.LogMessage("User Is already Validated : " + (string.IsNullOrEmpty(Session["Email"].ToString()) ? "" : Session["Email"].ToString()));
                    return View();
                }
                else if (Convert.ToBoolean(ConfigurationManager.AppSettings["LocalLogin"]))
                {
                    Log.LogMessage("request Is redirected to : " + loginURl);
                    return RedirectToAction("Locallogin");   
                    //return View();
                }
                else
                {
                    Session.Clear();
                    return Redirect(loginURl);
                }
            }
        }

        /// <summary>
        /// Verify Token for token time and domain name
        /// </summary>
        /// <param name="param"></param>
        /// <param name="tokenValidity"></param>
        /// <param name="AuthServer"></param>
        /// <param name="request"></param>
        /// <returns></returns>
        private bool VerifyTokenFromAuthServer(string param,int tokenValidity,string authServer, System.Web.HttpRequestBase request)
        {
            string plainParamValue = "";
            Token token = new Token();
            try
            {
                plainParamValue = AQ.Security.Cryptography.EncryptionHelper.Decryptdata(param);
                token = JsonConvert.DeserializeObject<Token>(plainParamValue);
                //Verify Epoch Time is Acceptable
                int currentTime = Convert.ToInt32((DateTime.UtcNow - new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc)).TotalSeconds);
                int EndTime = currentTime + 60 * tokenValidity; 
                if (token.epoch > EndTime)
                {
                    //token is expired
                    return false;
                }
                else
                {
                    if(authServer == "")    //Allow when AuthServer in webconfig is not defined. Will allow any URL to make request.
                    {
                        return true;
                    }
                    else if (request.UrlReferrer.Host != "" && request.UrlReferrer.Host == new Uri(authServer).Host)    //Check the request is genuine.
                    {
                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
                
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        /// <summary>
        /// Makes Post request to Auth server to validate and Get user related information
        /// </summary>
        /// <param name="token"></param>
        /// <returns></returns>
        static async Task<LoginInfo> ValidateUser(string token)
        {
            LoginInfo loginInfo = null;
            try
            {
                using (var client = new HttpClient())
                {
                    client.BaseAddress = new Uri(ConfigurationManager.AppSettings["LoginPageURL"]);

                    client.DefaultRequestHeaders.Accept.Clear();
                    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                    //GET Method                      
                    HttpResponseMessage response = client.PostAsJsonAsync(ConfigurationManager.AppSettings["VerifyUser"].ToString(), new { token = token }).Result;
                    if (response.IsSuccessStatusCode)
                    {
                        loginInfo = await response.Content.ReadAsAsync<LoginInfo>();
                    }
                    else
                    {
                        //Logger
                    }
                }
            }
            catch (Exception ex)
            {
                //Logger
            }
            return loginInfo;
        }

        public ActionResult Logout()
        {
            string[] myCookies = Request.Cookies.AllKeys;
            foreach (string cookie in myCookies)
            {
                Response.Cookies[cookie].Expires = DateTime.Now.AddDays(-1);
            }
            Session.Clear();
            return RedirectToAction("Locallogin");
        }
        
    }
}