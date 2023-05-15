using DAL;
using Entites;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.IO;
using Aspose.Slides;
using System.Drawing;



namespace BAL
{
    public class GrowthOpportunity : IGrowthOpportunity
    {
        internal readonly IUnitOfWork _unitOfWork;
        
        string[] AllColorCodes = new string[] {
                        "#E18719", "#287819", "#623E23", "#A52323", "#2D6EAA", "#E6AF23",
            "#724D8D", "#EAAB5E", "#73A769", "#93785F", "#C97B7B", "#81A8CC", "#EDC765", "#858585",
            "#957AA9", "#F3CFA3", "#B4D0AF", "#BEADA0", "#E4BDBD", "#ABC5DD", "#F4DB9C", "#A3A3A3"
        };
        public GrowthOpportunity(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public List<object> GetChartOutput(GrowthOpportunityRequest request)
        {
            DataSet dSet = _unitOfWork.GetRepository<IGrowthOppotunityRepository>().GetChartOutput(request);

            List<object> OutputList = new List<object>();
            if (dSet.Tables.Count != 0)
            {
                OutputList.Add(tableToList(dSet.Tables[0]));
                OutputList.Add(tableToList(dSet.Tables[1]));
                OutputList.Add(tableToList(dSet.Tables[2]));
            }
            return OutputList.Cast<object>().ToList();
        }

        public string ExportPPT(GrowthOpportunityRequest request)
        {
            string fileName = string.Empty;
            var templatePath  = Constants.GROWTH_PPT_Template;

            string pptTemplate = HttpContext.Current.Server.MapPath(templatePath);
            Aspose.Slides.License license = new Aspose.Slides.License();
            license.SetLicense(HttpContext.Current.Server.MapPath("~/Aspose.Slides.lic"));
            Aspose.Slides.Presentation pres = new Aspose.Slides.Presentation(pptTemplate);

            ISlideCollection slds = pres.Slides;
            ISlide sld = slds[0];

            Shape shp = (Shape)sld.Shapes.FirstOrDefault(x => x.Name == "Screenshot");

            //((IAutoShape)sld.Shapes.FirstOrDefault(x => x.Name == "chart_header")).TextFrame.Text = request.ChartTitle;

            using (MemoryStream ms = new MemoryStream(Convert.FromBase64String(request.imgBase64)))
            {
                using (System.Drawing.Bitmap bm2 = new System.Drawing.Bitmap(ms))
                {
                    if (true)
                    {
                        Aspose.Slides.IPictureFrame pf = (Aspose.Slides.IPictureFrame)shp;
                        using (System.Drawing.Image img = bm2)
                        {
                            ReplaceImage(pres, sld, "Screenshot", img);
                        }
                    }
                }
            }

            ICommentAuthor author = pres.CommentAuthors.AddAuthor("Mondelez", "M");
            //Position of comments
            PointF point = new PointF();
            point.X = 4;
            point.Y = 90;
            string selectionText = GetSelectionText(request);
            author.Comments.AddComment(selectionText.Replace("||", "\n"), sld, point, DateTime.Now);

            //FooterText
            if (request.FooterText.Trim().Length > 0)
            {
                sld.AddNotesSlide().NotesTextFrame.Paragraphs[0].Portions[0].Text = request.FooterText;
            }


            string tempFolderName = GenerateRandomString(15);
            string tempFileName = "Mondelez_Growth_Opportunity(" + System.DateTime.Now.ToString("MM-dd-yyyy") + "_" + System.DateTime.Now.ToString("HH-mm-ss") + ").pptx";
            if (Directory.Exists(System.Web.HttpContext.Current.Server.MapPath(Constants.GrowthOpportunityDownloadPath + tempFolderName)))
                Directory.Delete(System.Web.HttpContext.Current.Server.MapPath(Constants.GrowthOpportunityDownloadPath + tempFolderName), true);
            Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath(Constants.GrowthOpportunityDownloadPath + tempFolderName));
            string tempFilePath = System.Web.HttpContext.Current.Server.MapPath(Constants.GrowthOpportunityDownloadPath + tempFolderName + "/" + tempFileName);
            pres.Save(tempFilePath, Aspose.Slides.Export.SaveFormat.Pptx);
            return (Constants.GrowthOpportunityDownloadPath.Replace("~", "..") + tempFolderName + "/" + tempFileName);

        }
        private List<GrowthOutputRow> tableToList(DataTable tbl)
        {
            var output = new List<GrowthOutputRow>();
            output = (from r in tbl.AsEnumerable()
                      select new GrowthOutputRow()
                      {
                          MarketName = tbl.Columns.Contains("Country") ? Convert.ToString(r["Country"]) : null,
                          CategoryName = tbl.Columns.Contains("Category") ? Convert.ToString(r["Category"]) : null,
                          TimePeriodName = tbl.Columns.Contains("TimeperiodName") ? Convert.ToString(r["TimeperiodName"]) : null,
                          TimePeriodId = tbl.Columns.Contains("TimeperiodId") ? Convert.ToString(r["TimeperiodId"]) : null,
                          BrandId = tbl.Columns.Contains("BrandId") ? Convert.ToString(r["BrandId"]) : null,
                          BrandName = tbl.Columns.Contains("Brand") ? Convert.ToString(r["Brand"]) : null,
                          MetricName = tbl.Columns.Contains("MetricName") ? Convert.ToString(r["MetricName"]) : null,
                          MetricVolume = r["MetricValue"] == DBNull.Value ? null : stringToDouble(r["MetricValue"].ToString()),
                          MetricType = tbl.Columns.Contains("MetricType") ? Convert.ToString(r["MetricType"]) : null,
                          MetricValueType = tbl.Columns.Contains("MetricValueType") ? Convert.ToString(r["MetricValueType"]) : null,
                          RoundBy = r["RoundBy"] == DBNull.Value ? 0 : Convert.ToInt32(r["RoundBy"].ToString()),
                          Quadrant = tbl.Columns.Contains("BG20_GFW_Name") ? Convert.ToString(r["BG20_GFW_Name"]) : null,
                      }).ToList();
            return output;
        }

        public string GetSelectionText(GrowthOpportunityRequest request)
        {
            string output = string.Empty;

            output += "Market : " + (request.MarketName.Split('|').Length > 1 ? "Multiple Market" : request.MarketName) + "||";
            output += "Category : " + (request.CategoryName.Split('|').Length > 1 ? "Multiple Category's" : request.CategoryName) + "||";
            output += "Time Period : " + request.GrowthTimePeriod + "||";
            output += "Brands : " + (request.BrandName.Split('|').Length > 1 ? "Multiple Brands" : request.BrandName) + "||";
            
            return output;
        }
        public void ReplaceImage(Aspose.Slides.Presentation pres, Aspose.Slides.ISlide sld, string CurrentImageName, Image imgToReplace)
        {
            for (int i = 0; i < sld.Shapes.Count; i++)
            {
                if (sld.Shapes[i] is Shape)
                {
                    Shape shp = (Shape)sld.Shapes[i];
                    string strname = (string)shp.Name;
                    if (strname == CurrentImageName)
                    {
                        Aspose.Slides.IPictureFrame pf = (Aspose.Slides.IPictureFrame)shp;
                        using (System.Drawing.Image img = imgToReplace)
                        {
                            IPPImage imgx = pres.Images.AddImage(img);
                            pf = sld.Shapes.AddPictureFrame(Aspose.Slides.ShapeType.Rectangle, shp.X, shp.Y, shp.Width, shp.Height, imgx);
                            pf.Name = CurrentImageName;
                            pf.PictureFormat.Picture.Image = imgx;
                            pf.LineFormat.FillFormat.FillType = FillType.Solid;
                            pf.LineFormat.FillFormat.SolidFillColor.Color = Color.DarkSlateGray;
                            pf.LineFormat.Width = 1;
                            shp.X = 0;
                            shp.Y = 0;
                            shp.Width = 0;
                            shp.Height = 0;
                            sld.Shapes.Remove(shp);
                        }
                        return;
                    }
                }
            }
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
        public double? stringToDouble(string inputText)
        {
            double outputValue = 0.0;
            if (!double.TryParse(inputText, out outputValue)) outputValue = 0.0;
            return outputValue;
        }
        private double? stringToDouble(string inputText, int roundBy)
        {
            double outputValue = 0.0;
            if (!double.TryParse(inputText, out outputValue)) outputValue = 0.0;
            return Math.Round(outputValue, roundBy);
        }
    }

}
