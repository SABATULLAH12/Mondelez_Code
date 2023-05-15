using DAL;
using Entites;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System;
using System.Threading.Tasks;
using System.Web;
using System.IO;
using System.Drawing;
using Newtonsoft.Json;
using Aspose.Slides;

namespace BAL
{
    public class StoryBoard  : IStoryBoard
    {
        private const string SLIDE_PREFIX = "slide_";
        private const string IMAGE_EXTENSION = ".png";
        private const string COMMON_SLIDE_IMAGE_SAVE_PATH = "~/StoryBoardImages/";
        private const string COMMON_STORY_IMAGES_SAVE_PATH = "~/StoryBoardImages/";
        private const string EMPTY_TEMPLATE_PATH = "~/ExportTemplates/StoryBoard/StoryBoard_Template.pptx";

        internal readonly IUnitOfWork _unitOfWork;
        internal readonly IDeepDive _DeepDiveObj;
        internal readonly ISnapShot _SnapShotObj;
        public StoryBoard(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
            _DeepDiveObj = new DeepDive(unitOfWork);
            _SnapShotObj = new SnapShot(unitOfWork);
        }
        public int GetUserId(string EmailId)
        {
            int userid = _unitOfWork.GetRepository<IStoryBoardRepository>().GetUserId(EmailId);

            return userid;
        }
        public object StoriesToSave(StoryBoardRequest request)
        {
            List<StoryDetail> stories = new List<StoryDetail>();
            DataSet dSet = _unitOfWork.GetRepository<IStoryBoardRepository>().StoriesToSave(request);
            object dataList = null;

            var tbl = dSet.Tables[0];
            stories = (from r in tbl.AsEnumerable()
                       select new StoryDetail()
                       {
                           StoryID = tbl.Columns.Contains("StoryID") ? Convert.ToInt32(r["StoryID"]) : -1,
                           StoryName = tbl.Columns.Contains("StoryName") ? Convert.ToString(r["StoryName"]) : null,
                           CreUserId = tbl.Columns.Contains("CreatedBy") ? Convert.ToString(r["CreatedBy"]) : null,
                           IsShared = tbl.Columns.Contains("IsShared") ? Convert.ToBoolean(r["IsShared"]) : false,
                           CurUserId = tbl.Columns.Contains("CurrentUser") ? Convert.ToString(r["CurrentUser"]) : null,
                           CreUser = tbl.Columns.Contains("CreatedUserName") ? Convert.ToString(r["CreatedUserName"]) : null,
                       }).ToList();

            dataList = stories.Select(x => new { StoryID = x.StoryID, StoryName = x.StoryName, CreUserId = x.CreUserId, IsShared = x.IsShared, CurUserId = x.CurUserId , CreUser = x.CreUser }).Distinct().ToList();           
            return dataList;
        }
        public object SavedStories(StoryBoardRequest request)
        {
            List<StoryDetail> stories = new List<StoryDetail>();
            DataSet dSet = _unitOfWork.GetRepository<IStoryBoardRepository>().SavedStories(request);
            object dataList = null;

            var tbl = dSet.Tables[0];
            stories = (from r in tbl.AsEnumerable()
                       select new StoryDetail()
                       {
                           StoryID = tbl.Columns.Contains("StoryID") ? Convert.ToInt32(r["StoryID"]) : -1,
                           StoryName = tbl.Columns.Contains("StoryName") ? Convert.ToString(r["StoryName"]) : null,
                       }).ToList();

            dataList = stories.Select(x => new { StoryID = x.StoryID, StoryName = x.StoryName }).Distinct().ToList();
            return dataList;
        }
        public bool AddSlide(StoryBoardRequest request)
        {
            DataSet dSet = _unitOfWork.GetRepository<IStoryBoardRepository>().AddSlide(request);
            try
            {
                var row = dSet.Tables[0].Rows[0];
                bool isImageSaved = SaveSlideImage(request.base64, row["SlideId"].ToString(), row["SlidePath"].ToString());
                if (isImageSaved)
                    return true;
                else
                    return false;
            }
            catch (Exception ex)
            {
                return false;
            }
        }
        public bool AddStory(StoryBoardRequest request)
        {
            DataSet dSet = _unitOfWork.GetRepository<IStoryBoardRepository>().AddStory(request);
            try
            {
                var row = dSet.Tables[1].Rows[0];
                bool isImageSaved = SaveSlideImage(request.base64, row["SlideId"].ToString(), row["SlidePath"].ToString());
                if (isImageSaved)
                    return true;
                else
                    return false;
            }
            catch(Exception ex)
            {
                return false;
            }
        }
        public List<StorySlide> GetStorySlides(int storyId)
        {
            List<StorySlide> slides = new List<StorySlide>();
            DataSet dSet = _unitOfWork.GetRepository<IStoryBoardRepository>().GetStorySlides(storyId);

            var tbl = dSet.Tables[0];
            slides = (from r in tbl.AsEnumerable()
                       select new StorySlide()
                       {
                           SlideID = tbl.Columns.Contains("SlideId") ? Convert.ToInt32(r["SlideId"]) : -1,
                           StoryID= storyId,
                           StoryName = tbl.Columns.Contains("StoryName") ? Convert.ToString(r["StoryName"]) : string.Empty,
                           ModuleId = tbl.Columns.Contains("ModuleId") ? Convert.ToInt32(r["ModuleId"]) : -1,
                           SelectionJSON = tbl.Columns.Contains("SelectionJSON") ? Convert.ToString(r["SelectionJSON"]) : null,
                           AddtionalInfo = tbl.Columns.Contains("AdditionalInfo") ? Convert.ToString(r["AdditionalInfo"]) : null,
                           SlidePath = tbl.Columns.Contains("SlidePath") ? Convert.ToString(r["SlidePath"]) : null
                       }).ToList();

            return slides;
        }
        public bool DeleteStory(int storyId)
        {
            try
            {
                DataSet dSet = _unitOfWork.GetRepository<IStoryBoardRepository>().DeleteStory(storyId);
                var row = dSet.Tables[0].Rows[0];
                string storyPath = row["storyPath"].ToString();
                if (!string.IsNullOrEmpty(storyPath) && Directory.Exists(System.Web.HttpContext.Current.Server.MapPath(COMMON_SLIDE_IMAGE_SAVE_PATH + storyPath)))
                    Directory.Delete(System.Web.HttpContext.Current.Server.MapPath(COMMON_SLIDE_IMAGE_SAVE_PATH + storyPath), true);

                return true;
            }
            catch(Exception ex)
            {
                Log.LogException(ex);
                return false;
            }

        }
        public bool DeleteSlide(string slideIds)
        {
            try
            {
                DataSet dSet = _unitOfWork.GetRepository<IStoryBoardRepository>().DeleteSlide(slideIds);

                string storyPath = "";
                for (var i = 0; i < dSet.Tables[0].Rows.Count; i++)
                {
                    var row = dSet.Tables[0].Rows[i];
                    string slidePath = row["SlidePath"].ToString();
                    if (i == 0)
                    {
                        storyPath = slidePath.Substring(0, slidePath.IndexOf("slide") - 1);
                    }
                    if (!string.IsNullOrEmpty(slidePath) && File.Exists(System.Web.HttpContext.Current.Server.MapPath(COMMON_SLIDE_IMAGE_SAVE_PATH + slidePath)))
                        File.Delete(System.Web.HttpContext.Current.Server.MapPath(COMMON_SLIDE_IMAGE_SAVE_PATH + slidePath));
                }

                if (!string.IsNullOrEmpty(storyPath) && Directory.Exists(System.Web.HttpContext.Current.Server.MapPath(COMMON_SLIDE_IMAGE_SAVE_PATH + storyPath)))
                {
                    if(Directory.GetFiles(System.Web.HttpContext.Current.Server.MapPath(COMMON_SLIDE_IMAGE_SAVE_PATH + storyPath)).Length == 0)
                    {
                        Directory.Delete(System.Web.HttpContext.Current.Server.MapPath(COMMON_SLIDE_IMAGE_SAVE_PATH + storyPath), true);
                    }
                }                    
                return true;
            }
            catch (Exception ex)
            {
                Log.LogException(ex);
                return false;
            }
        }
        public bool EditStoryName(int storyId,string storyName,string userId)
        {
            DataSet dSet = _unitOfWork.GetRepository<IStoryBoardRepository>().EditStoryName(storyId, storyName, userId);
            var row = dSet.Tables[0].Rows[0];
            return Convert.ToBoolean(row["isUpdated"].ToString() == "1");
        }
        public bool ShareStory(string storyId, string userIdsToShare, string curUserID)
        {
            return _unitOfWork.GetRepository<IStoryBoardRepository>().ShareStory(storyId, userIdsToShare, curUserID);
        }
        public object GetUsers(int storyId, string userId)
        {
            DataSet dSet = _unitOfWork.GetRepository<IStoryBoardRepository>().GetUsers(storyId);
            object dataList = null;

            var tbl = dSet.Tables[0];
            dataList = (from r in tbl.AsEnumerable()
                       select new 
                       {
                           UserId = tbl.Columns.Contains("UserId") ? Convert.ToInt32(r["UserId"]) : -1,
                           UserName = tbl.Columns.Contains("UserName") ? Convert.ToString(r["UserName"]) : null,
                           EmailId = tbl.Columns.Contains("EmailId") ? Convert.ToString(r["EmailId"]) : null,
                           isShared = tbl.Columns.Contains("isShared") ? Convert.ToBoolean(r["isShared"]) : false,
                       }).Where(x=>x.UserId.ToString() != userId).ToList();

            return dataList;
        }
        public object SharedStories(string userId, bool isSharedWithMe)
        {
            List<StoryDetail> stories = new List<StoryDetail>();
            DataSet dSet = _unitOfWork.GetRepository<IStoryBoardRepository>().SharedStories(userId, isSharedWithMe);
            object dataList = null;

            var tbl = dSet.Tables[0];
            stories = (from r in tbl.AsEnumerable()
                       select new StoryDetail()
                       {
                           StoryID = tbl.Columns.Contains("StoryID") ? Convert.ToInt32(r["StoryID"]) : -1,
                           StoryName = tbl.Columns.Contains("StoryName") ? Convert.ToString(r["StoryName"]) : null,
                           CreUser = tbl.Columns.Contains("CreUserName") ? Convert.ToString(r["CreUserName"]) : null,
                       }).ToList();

            dataList = stories.Select(x => new { StoryID = x.StoryID, StoryName = x.StoryName, CreUser = x.CreUser }).Distinct().ToList();
            return dataList;
        }
        public bool saveASNewStory(int? storyID, string storyName, string userId)
        {
            List<StoryDetail> stories = new List<StoryDetail>();
            DataSet dSet = _unitOfWork.GetRepository<IStoryBoardRepository>().saveASNewStory(storyID, storyName, userId);

            try
            {
                for(var i = 0; i < dSet.Tables[0].Rows.Count; i++)
                {
                    var row = dSet.Tables[0].Rows[i];
                    string oldPath = System.Web.HttpContext.Current.Server.MapPath(COMMON_SLIDE_IMAGE_SAVE_PATH + row["SlideOldPath"].ToString());
                    string path = System.Web.HttpContext.Current.Server.MapPath(COMMON_SLIDE_IMAGE_SAVE_PATH + row["SlidePath"].ToString());
                    if (i == 0)
                    {
                        if (!Directory.Exists(path.Substring(0, path.LastIndexOf("\\"))))
                            Directory.CreateDirectory(path.Substring(0, path.LastIndexOf("\\")));
                    }
                    System.IO.File.Copy(oldPath, path, true);
                }
                return true;
            }
            catch(Exception ex)
            {
                Log.LogException(ex);
                return false;
            }
        }
        public string PrepareStoryBoardPPT(List<StorySlide> Slides, string userName)
        {
            Aspose.Slides.License license = new Aspose.Slides.License();
            license.SetLicense(HttpContext.Current.Server.MapPath("~/Aspose.Slides.lic"));
            string emptyTemplatePath = System.Web.HttpContext.Current.Server.MapPath(EMPTY_TEMPLATE_PATH);
            Presentation mainPres = new Presentation(emptyTemplatePath);
            Presentation barPres=null; Presentation colPres = null; Presentation linePres = null; Presentation picPres = null;
            int slideIncrmt = 0;
            var slidePositions = new List<Tuple<int, ISlide>>();

            #region Slide 1 Title and user details Update
            ISlide sld = mainPres.Slides[0];
            ((IAutoShape)sld.Shapes.FirstOrDefault(x => x.Name == "storyName")).TextFrame.Text = Slides[0].StoryName.ToUpper();
            ((IAutoShape)sld.Shapes.FirstOrDefault(x => x.Name == "userName")).TextFrame.Text = userName;
            #endregion

            //using (mainPres)
            //{
            //    var tasks = new List<Task>();
            //    foreach (StorySlide slide in Slides)
            //    {
            //        tasks.Add(Task.Factory.StartNew(new Action<object>((args) =>
            //        {
            //            var paramsArr = (object[])args;
            //            var newSlide = (StorySlide)paramsArr[0];
            //            var newSlideIncrmt = (int)paramsArr[1];

            //            if (newSlide.ModuleId == 1) //sanpshot
            //                {

            //            }
            //            else if (newSlide.ModuleId == 2) //deepdive
            //                {
            //                StoryBoardDeepDiveParms request = JsonConvert.DeserializeObject<StoryBoardDeepDiveParms>(newSlide.AddtionalInfo);
            //                string tempPPT = HttpContext.Current.Server.MapPath(_DeepDiveObj.ExportPPTExcel(request.SlideParameters).Replace("..", "~"));
            //                Presentation tempPres = new Presentation(tempPPT);
            //                slidePositions.Add(new Tuple<int, ISlide>(newSlideIncrmt, tempPres.Slides[0]));
            //            }

            //        }), new object[] { slide, slideIncrmt, _DeepDiveObj }));
            //        slideIncrmt++;
            //    }
            //    Task.WaitAll(tasks.ToArray());
            //}


            foreach (StorySlide slide in Slides)
            {
                if (slide.ModuleId == 1) //sanpshot
                {
                    if (picPres == null)
                    {
                        picPres = new Presentation(System.Web.HttpContext.Current.Server.MapPath(Constants.Snapshot_PPT_Template));
                    }
                    StoryBoardSnapShotParms request = JsonConvert.DeserializeObject<StoryBoardSnapShotParms>(slide.AddtionalInfo);
                    request.SlideParameters.SlidePath = System.Web.HttpContext.Current.Server.MapPath(COMMON_SLIDE_IMAGE_SAVE_PATH + slide.SlidePath);
                    picPres = _SnapShotObj.StoryBoardPPT(request.SlideParameters, picPres);
                    mainPres.Slides.AddClone(picPres.Slides[0]);
                }
                else if (slide.ModuleId == 2) //deepdive
                {
                    StoryBoardDeepDiveParms request = JsonConvert.DeserializeObject<StoryBoardDeepDiveParms>(slide.AddtionalInfo);

                    if (request.SlideParameters.ChartType.ToLower() == Constants.Column_Text && colPres == null)
                        colPres = new Presentation(System.Web.HttpContext.Current.Server.MapPath(Constants.DeepDive_Column_Template_PPT));
                    else if (request.SlideParameters.ChartType.ToLower() == Constants.Bar_Text && barPres == null)
                        barPres = new Presentation(System.Web.HttpContext.Current.Server.MapPath(Constants.DeepDive_Bar_Template_PPT));
                    else if (request.SlideParameters.ChartType.ToLower() == Constants.Line_Text && linePres == null)
                        linePres = new Presentation(System.Web.HttpContext.Current.Server.MapPath(Constants.DeepDive_Line_Template_PPT));

                    if (request.SlideParameters.ChartType.ToLower() == Constants.Column_Text)
                    {
                        colPres = _DeepDiveObj.StoryBoardPPT(request.SlideParameters, colPres);
                        mainPres.Slides.AddClone(colPres.Slides[0]);
                    }
                    else if (request.SlideParameters.ChartType.ToLower() == Constants.Bar_Text)
                    {
                        barPres = _DeepDiveObj.StoryBoardPPT(request.SlideParameters, barPres);
                        mainPres.Slides.AddClone(barPres.Slides[0]);
                    }
                    else if (request.SlideParameters.ChartType.ToLower() == Constants.Line_Text)
                    {
                        linePres = _DeepDiveObj.StoryBoardPPT(request.SlideParameters, linePres);
                        mainPres.Slides.AddClone(linePres.Slides[0]);
                    }
                }
            }

            string relativeFolderPath = Constants.StoryBoardbDownloadPath + "/" + GenerateRandomString(15);
            string fileName = "Mondelez_StoryBoard(" + System.DateTime.Now.ToString("MM-dd-yyyy") + "_" + System.DateTime.Now.ToString("HH-mm-ss") + ").pptx";

            if (Directory.Exists(System.Web.HttpContext.Current.Server.MapPath(relativeFolderPath)))
                Directory.Delete(System.Web.HttpContext.Current.Server.MapPath(relativeFolderPath), true);
            Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath(relativeFolderPath));
            string tempFilePath = System.Web.HttpContext.Current.Server.MapPath(relativeFolderPath + "/" + fileName);
            mainPres.Save(tempFilePath, Aspose.Slides.Export.SaveFormat.Pptx);

            return relativeFolderPath.Replace("~", "..") + "/" + fileName;
        }
        public bool UpdateSlides(List<StorySlide> slides)
        {
            var returnFlag = false;
            try
            {
                for (var i = 0; i < slides.Count; i++)
                {
                    returnFlag = _unitOfWork.GetRepository<IStoryBoardRepository>().UpdateSlides(slides[i]);
                    if (returnFlag)
                    {
                        if(!SaveSlideImage(slides[i].base64, slides[i].SlideID.ToString(), slides[i].SlidePath.Substring(0, slides[i].SlidePath.LastIndexOf("\\") + 1)))
                            throw new Exception("something went wrong");
                    }
                    else
                    {
                        throw new Exception("something went wrong");
                    }
                }
            }
            catch (Exception ex)
            {
                return false;
            }
            return true;
        }
        public StoryLock GetLockStatus(string StoryID)
        {
            StoryLock lockStatus = new StoryLock();
            DataSet dSet = _unitOfWork.GetRepository<IStoryBoardRepository>().GetLockStatus(StoryID);

            var tbl = dSet.Tables[0];
            lockStatus = (from r in tbl.AsEnumerable()
                       select new StoryLock()
                       {
                           StoryID = tbl.Columns.Contains("StoryID") ? Convert.ToString(r["StoryID"]) : string.Empty,
                           LockedBy = tbl.Columns.Contains("LockedBy") ? Convert.ToString(r["LockedBy"]) : string.Empty,
                           IsLocked = tbl.Columns.Contains("IsLocked") ? Convert.ToBoolean(r["IsLocked"]) : false,
                       }).FirstOrDefault();

            return lockStatus;
        }
        public bool SetLock(StoryLock data)
        {
            return _unitOfWork.GetRepository<IStoryBoardRepository>().SetLock(data);
        }
        public bool SaveSlideImage(string base64,string slideId , string SlidePath)
        {
            string SlideName = SLIDE_PREFIX + slideId.ToString() + IMAGE_EXTENSION;
            string FolderPath = COMMON_SLIDE_IMAGE_SAVE_PATH + SlidePath;

            byte[] imageBytes = Convert.FromBase64String(base64);

            using (var ms = new MemoryStream(imageBytes, 0, imageBytes.Length))
            {
                ms.Write(imageBytes, 0, imageBytes.Length);
                ms.Seek(0, SeekOrigin.Begin);

                var img = new Bitmap(Image.FromStream(ms));
                System.Drawing.Image image = img.GetThumbnailImage(260, 140, null, IntPtr.Zero);
                string absolutePath = System.Web.HttpContext.Current.Server.MapPath(FolderPath);

                if (!Directory.Exists(System.Web.HttpContext.Current.Server.MapPath(FolderPath)))
                    Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath(FolderPath));

                byte[] buffer = Convert.FromBase64String(base64);
                System.Drawing.Bitmap.FromStream(new MemoryStream(buffer)).Save(string.Format("{0}", Path.Combine(absolutePath, SlideName)));
            }


            return true;
        }
        public static string GenerateRandomString(int length)
        {
            var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            var result = new string(
                Enumerable.Repeat(chars, Convert.ToInt32(length))
                          .Select(s => s[random.Next(s.Length)])
                          .ToArray());
            return result.ToString();

        }
    }
}