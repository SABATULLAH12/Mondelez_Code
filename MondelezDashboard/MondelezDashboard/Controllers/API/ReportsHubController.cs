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
using System.Net.Mail;

namespace MondelezDashboard.Controllers.API
{
    [ApiAuthorizationFilter]
    public class ReportsHubController : ApiController
    {
        private static IReportsHub  _ReportObj;
        public ReportsHubController(IReportsHub _Obj)
        {
            try
            {
                _ReportObj = _Obj;
                Log.LogMessage("ReportsHub API initiated by User " + HttpContext.Current.Session["Email"].ToString());
            }
            catch
            {
                Log.LogMessage("User is not authorized");
            }
        }
        [HttpPost]
        public HttpResponseMessage GetReportHubData()
        {
            var response = _ReportObj.GetReportHubData();
            var UserId = (int)System.Web.HttpContext.Current.Session["UserId"];
            var res = _ReportObj.GetUserRole(UserId);
            response.UserROle = res;
            HttpResponseMessage _response = Request.CreateResponse(HttpStatusCode.OK, response);
            return _response;
        }
        [HttpPost]
        public string UploadFiles()
        {
            int uploadedCnt = 0;
            string sPath = "";
            sPath = System.Web.Hosting.HostingEnvironment.MapPath("~/Reports/");
            string currTime = "_" + (DateTime.Now.Year).ToString() + "_" + (DateTime.Now.Month).ToString() + "_" + (DateTime.Now.Day).ToString();
            string fileName = "";
            string fileNameFirst = "";
            string fileNameExt = "";
            int indexOfDot;
            int len;

            System.Web.HttpFileCollection hfc = System.Web.HttpContext.Current.Request.Files;

            for (int iCnt = 0; iCnt <= hfc.Count - 1; iCnt++)
            {
                System.Web.HttpPostedFile hpf = hfc[iCnt];

                if (hpf.ContentLength > 0 || hpf.FileName != null)
                {
                    if (!File.Exists(sPath + Path.GetFileName(hpf.FileName)))
                    {
                        hpf.SaveAs(sPath + Path.GetFileName(hpf.FileName));
                        uploadedCnt = uploadedCnt + 1;
                    }
                    else
                    {

                        if (File.Exists(sPath + Path.GetFileName(hpf.FileName)))
                        {
                            fileName = hpf.FileName;
                            indexOfDot = fileName.IndexOf('.');
                            len = fileName.Length;
                            fileNameFirst = fileName.Substring(0, indexOfDot);
                            fileNameExt = fileName.Substring(indexOfDot, (len - indexOfDot));
                            fileNameFirst = fileNameFirst + currTime;

                            fileName = fileNameFirst + fileNameExt;
                            hpf.SaveAs(sPath + Path.GetFileName(fileName));
                            uploadedCnt = uploadedCnt + 1;
                        }
                    }
                    //checkToSendMail(hpf.FileName); // removed by harsha
                }
            }
            if (uploadedCnt > 0)
            {
                return uploadedCnt + " Files Uploaded Successfully";
            }
            else
            {
                return "Upload Failed";
            }
        }
        public void checkToSendMail(string fileName)
        {
            string[] mData;
            mData = _ReportObj.GetMailIdsToSendMailForReport(fileName);
            for (int i = 0; i < mData.Length; i++)
            {
                string body = "";
                body += "<div style='background-color:#f0f1f3;font-family:'Helvetica Neue','Segoe UI',Helvetica,sans-serif;font-size:16px;line-height:28px;margin:0;color:#444'>";
                body += "    <div style='background-color:#fff;padding:30px;max-width:525px;margin:0 auto;border-radius:5px'>";
                body += "        <h3>Dear Subscriber,</h3>";
                body += "        <p>A File has been Uploaded to tool.</p>";
                body += "        <p>File Name: <span style='font-weight: bold;'>" + fileName + "</span></p>";
                body += "        <p><a href='https://mdlzpbs.aqinsights.com/' style='color:#888' target='_blank'>Click here</a> to access the Mondelez Purchase Behaviour System.</p>";
                body += "        <p>Regards,<br>Mondelez PBS team.</p>";
                body += "    </div>";
                body += "</div>";
                SendMail("harshavardhan.r@aqinsights.com", "@aqinsights.com", "", mData[i], "Report Upload", body, true);
            }

        }
        private void SendMail(string fromMail,string fromUserName,string fromPassWord,string toMail,string Subject,string body,bool isHtml=false)
        {
            try
            {
                MailMessage mail = new MailMessage();
                SmtpClient SmtpServer = new SmtpClient("smtp-mail.outlook.com ");

                mail.From = new MailAddress(fromMail);
                mail.To.Add(toMail);
                mail.Subject = Subject;
                mail.Body = body;
                mail.IsBodyHtml = isHtml;

                SmtpServer.Port = 25;
                SmtpServer.Credentials = new System.Net.NetworkCredential(fromUserName, fromPassWord);
                SmtpServer.EnableSsl = true;

                SmtpServer.SendMailAsync(mail);
                Log.LogMessage("Mail Sent to the Users. " + HttpContext.Current.Session["Email"].ToString());
            }
            catch (Exception ex)
            {
                Log.LogMessage("Error in sending. " + HttpContext.Current.Session["Email"].ToString());
                Log.LogMessage(ex.Message);
            }
        }
    }
}
