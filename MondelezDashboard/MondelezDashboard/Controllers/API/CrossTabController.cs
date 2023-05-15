using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Net.Http;
using System.Web.Http;
using Entites;
using BAL;
using MondelezDashboard.Utilities;
using Entites.EntityModel;

namespace MondelezDashboard.Controllers.API
{
    [ApiAuthorizationFilter]
    public class CrossTabController : ApiController
    {
        private static ICrossTab _CrossTabObj;
        private static IFilterPanel _FilterPanelobj;
        public CrossTabController(ICrossTab _Obj,IFilterPanel _filterObj)
        {
            try
            {
                _CrossTabObj = _Obj;
                _FilterPanelobj = _filterObj;
                Log.LogMessage("CrossTab API initiated by User " + HttpContext.Current.Session["Email"].ToString());
            }
            catch
            {
                Log.LogMessage("User is not authorized");
            }
        }
        
        [HttpPost]
        public HttpResponseMessage GetData(CrossTabViewRequest request)
        {
            var response = _CrossTabObj.GetData(request);
            HttpResponseMessage _response = Request.CreateResponse(HttpStatusCode.OK, response);
            return _response;
        }
        [HttpPost]
        public HttpResponseMessage ExportToExcel(CrossTabViewRequest request)
        {
            var response = _CrossTabObj.ExportToExcel(request);
            HttpResponseMessage _response = Request.CreateResponse(HttpStatusCode.OK, response);
            return _response;
        }
        [HttpPost]
        public HttpResponseMessage ExportToExcelDataExplorer(DataExplorerTableDetails request)
        {
            var response = _CrossTabObj.ExportToExcelDataExplorer(request);
            HttpResponseMessage _response = Request.CreateResponse(HttpStatusCode.OK, response);
            return _response;
        }
        
        [HttpPost]
        public HttpResponseMessage ExportToExcelDataExplorerNew([FromBody]SelectionTextClass selectionTextExcel)
        {
            var tbdata = HttpContext.Current.Session["ExcelData"] as DataExOutput;
            tbdata.selectionTextExcel = selectionTextExcel.selectionTextExcel;
            var data = _FilterPanelobj.GetExcelData(tbdata);
            var request = _FilterPanelobj.ProcessExcelData(data);
            var response = _CrossTabObj.ExportToExcelDataExplorer(request);
            HttpResponseMessage _response = Request.CreateResponse(HttpStatusCode.OK, response);
            return _response;
        }
        [HttpPost]
        public HttpResponseMessage DownloadExcelDataSave(ExcelSelectionData selectionData)
        {
            var tbdata = _FilterPanelobj.GetDataByFilter(selectionData);
            var data = _FilterPanelobj.GetExcelData(tbdata);
            var request = _FilterPanelobj.ProcessExcelData(data);
            var response = _CrossTabObj.ExportToExcelDataExplorer(request);
            HttpResponseMessage _response = Request.CreateResponse(HttpStatusCode.OK, response);
            return _response;
        }
    }
}
