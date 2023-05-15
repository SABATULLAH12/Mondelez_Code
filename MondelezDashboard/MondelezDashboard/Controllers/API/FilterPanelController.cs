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
using Entites.EntityModel;

namespace MondelezDashboard.Controllers.API
{
    [ApiAuthorizationFilter]
    public class FilterPanelController : ApiController
    {
        private static IFilterPanel _FilterPanelobj;
        public FilterPanelController(IFilterPanel _Obj)
        {
            try
            {
                _FilterPanelobj = _Obj;
                Log.LogMessage("FilterPanel API initiated by User " + HttpContext.Current.Session["Email"].ToString());
            }
            catch
            {
                Log.LogMessage("User is not authorized");
            }

        }
        [HttpPost]
        public void LogError(ErrorMessage obj)
        {
            Log.LogMessage("Special Logger for " + HttpContext.Current.Session["Email"].ToString() + obj.message);
        }
        [HttpPost]
        public bool SaveSelection(FilterSelectionRequest Obj)
        {
            return _FilterPanelobj.SubmitFilterData(Obj.moduleId, Obj.selection, Convert.ToInt32(HttpContext.Current.Session["UserId"]));
        }
        [HttpPost]
        public FilterData GetSelection()
        {
            return _FilterPanelobj.FilterPanalData(Convert.ToInt32(HttpContext.Current.Session["UserId"]));
        }
        [HttpPost]
        public HttpResponseMessage BrandHierarchyExcel(BrandLevelData request)
        {
            var response = _FilterPanelobj.BrandHierarchyExcel(request);
            HttpResponseMessage _response = Request.CreateResponse(HttpStatusCode.OK, response);
            return _response;
        }
        [HttpPost]
        public HttpResponseMessage AvailableBrandSegmentData(object IsSegment)
        {
            var response = _FilterPanelobj.AvailableBrandSegmentsData(Convert.ToBoolean(IsSegment));
            HttpResponseMessage _response = Request.CreateResponse(HttpStatusCode.OK, response);
            return _response;
        }
        [HttpPost]
        public HttpResponseMessage AvailableTimePeriodData(object ModuleId)
        {
            var response = _FilterPanelobj.AvailableTimePeriodData(Convert.ToInt32(ModuleId));
            HttpResponseMessage _response = Request.CreateResponse(HttpStatusCode.OK, response);
            return _response;
        }
        [HttpPost]
        public HttpResponseMessage GetCrossTabMySelections()
        {
            var response = _FilterPanelobj.GetMySelections(HttpContext.Current.Session["UserId"].ToString(), "3");
            HttpResponseMessage _response = Request.CreateResponse(HttpStatusCode.OK, response);
            return _response;
        }
        [HttpPost]
        public HttpResponseMessage CrossTabSaveSelection(FilterSelectionRequest request)
        {
            request.userId = Convert.ToInt32(HttpContext.Current.Session["UserId"].ToString());
            request.moduleId = 3;
            var response = _FilterPanelobj.SaveSelection(request);
            HttpResponseMessage _response = Request.CreateResponse(HttpStatusCode.OK, response);
            return _response;
        }
        [HttpPost]
        public HttpResponseMessage CrossTabDeleteSelection(FilterDeletionRequest request)
        {
            var response = _FilterPanelobj.DeleteSelection(request.SelectionId.ToString(), request.IsStory, request.IsTagOrSelection);
            HttpResponseMessage _response = Request.CreateResponse(HttpStatusCode.OK, response);
            return _response;
        }
        [HttpPost]
        public HttpResponseMessage GetSubscriptionData()
        {
            var response = _FilterPanelobj.GetSubscriptionData(Convert.ToInt32(HttpContext.Current.Session["UserId"]));
            HttpResponseMessage _response = Request.CreateResponse(HttpStatusCode.OK, response);
            return _response;
        }
        [HttpPost]
        public HttpResponseMessage SaveSubscriptionData(SubscriptionData request)
        {
            var response = _FilterPanelobj.SaveSubscriptionData(Convert.ToInt32(HttpContext.Current.Session["UserId"]), request);
            HttpResponseMessage _response = Request.CreateResponse(HttpStatusCode.OK, response);
            return _response;
        }
        public bool UserTrackingDetails(FilterSelectionRequest fObj)
        {

            int id = Convert.ToInt32(HttpContext.Current.Session["UserId"]);
            string selection = fObj.selection;
            int moduleId = Convert.ToInt32(fObj.moduleId);
            if (id != 0 && moduleId != 0)
            {
                return _FilterPanelobj.UserTrackingDetails(id, moduleId, selection);
            }
            return false;

        }
        [HttpPost]
        public MarketCategoryModel GetMarketCategory()
        {
            return _FilterPanelobj.MarketCategoryData();
        }

        [HttpPost]
        public CubeDDL GetCubeddlData(CubeReq cubeReq)
        {
            return _FilterPanelobj.CubeDDLData(cubeReq.marketId, cubeReq.categoryId, cubeReq.cube, cubeReq.isHarmonized);
        }
        [HttpPost]
        public DataExOutput GetDataByFilter(ExcelSelectionData selectionData)
        {
            var data = _FilterPanelobj.GetDataByFilter(selectionData);
            var k = HttpContext.Current.Session["ExcelData"] as DataExOutput;
            if(k == null)
            {
                HttpContext.Current.Session.Add("ExcelData", data);
            }
            else
            {
                HttpContext.Current.Session["ExcelData"] = data;
            }
            return data;
        }
        [HttpPost]
        public DataExOutput GetDataExplorerData()
        {
            var data = _FilterPanelobj.GetDataExplorerData(7, "");
            var k = HttpContext.Current.Session["ExcelData"] as DataExOutput;
            if (k == null)
            {
                HttpContext.Current.Session.Add("ExcelData", data);
            }
            else
            {
                HttpContext.Current.Session["ExcelData"] = data;
            }
            return data;
        }
        
        [HttpPost]
        public HttpResponseMessage DataExplorerTabSaveSelection(FilterSelectionRequest request)
        {
            request.userId = Convert.ToInt32(HttpContext.Current.Session["UserId"].ToString());
            request.moduleId = 7;
            var response = _FilterPanelobj.SaveSelection(request);
            HttpResponseMessage _response = Request.CreateResponse(HttpStatusCode.OK, response);
            return _response;
        }
        [HttpPost]
        public HttpResponseMessage GetDataExplorerMySelections()
        {
            var response = _FilterPanelobj.GetMySelections(HttpContext.Current.Session["UserId"].ToString(), "7");
            HttpResponseMessage _response = Request.CreateResponse(HttpStatusCode.OK, response);
            return _response;
        }
        [HttpPost]
        public HttpResponseMessage DataExplorerDeleteSelection(FilterDeletionRequest request)
        {
            var response = _FilterPanelobj.DeleteSelection(request.SelectionId.ToString(), request.IsStory, request.IsTagOrSelection);
            HttpResponseMessage _response = Request.CreateResponse(HttpStatusCode.OK, response);
            return _response;
        }
    }
}
