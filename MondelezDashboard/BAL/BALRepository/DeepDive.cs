using DAL;
using Entites;
using System.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.IO;
using Aspose.Slides;
using AsposeChart = Aspose.Slides.Charts;
using System.Drawing;
using OfficeOpenXml.Style;
using OfficeOpenXml;

namespace BAL
{
    public class DeepDive : IDeepDive
    {
        internal readonly IUnitOfWork _unitOfWork;
        string[] colorCodes = new string[] {
            "#4F2170", "#E18719", "#287819", "#623E23", "#A52323", "#2D6EAA", "#E6AF23", "#666666",
            "#724D8D", "#EAAB5E", "#73A769", "#93785F", "#C97B7B", "#81A8CC", "#EDC765", "#858585",
            "#957AA9", "#F3CFA3", "#B4D0AF", "#BEADA0", "#E4BDBD", "#ABC5DD", "#F4DB9C", "#A3A3A3"
        };
        public DeepDive(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public int GetUserId(string EmailId)
        {
            int userid = _unitOfWork.GetRepository<IDeepDiveRepository>().GetUserId(EmailId);

            return userid;
        }
        public OutputChartData GetChartOutput(DeepdiveViewRequest request)
        {
            DataSet dSet = _unitOfWork.GetRepository<IDeepDiveRepository>().GetChartOutput(request);
            List<DeepdiveOutputRow> deepDiveOutput = tableToList(dSet.Tables[0]);
            OutputChartData response = new OutputChartData();
            List<string> columns = null;
            List<string> rows = null;
            bool isTrend = request.isTrend;
            bool isLowSampleSize = false;

            if (isTrend)
            {
                columns = deepDiveOutput.Select(r => r.TimePeriodName).Distinct().ToList();
                rows = deepDiveOutput.Select(r => r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString()).Distinct().ToList();
            }
            else
            {
                columns = deepDiveOutput.Select(r => r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString()).Distinct().ToList();
                rows = deepDiveOutput.Select(r => r.MetricName).Distinct().ToList();
            }

            int i = 0;
            foreach (var row in rows)
            {
                //Series
                SeriesData series = new SeriesData { name = row, color = colorCodes[i++] };
                if (i == 1)
                {
                    response.ChartName = deepDiveOutput[0].MetricName;
                    response.IsPercentage = deepDiveOutput[0].MetricType.ToLower() == "%" ? true : false;
                }
                int k = 0;
                for (int idx = 0; idx < columns.Count; idx++)
                {
                    var column = columns[idx];
                    DataPoint pointData = null;
                    IEnumerable<DeepdiveOutputRow> _chartSeriesData = null;
                    if (isTrend)
                        _chartSeriesData = deepDiveOutput.Where(r => r.TimePeriodName == column && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == row);
                    else
                        _chartSeriesData = deepDiveOutput.Where(r => r.MetricName == row && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == column);

                    pointData = _chartSeriesData.Select(x =>
                    {
                        var value = x.MetricVolume == null ? null : (double?)(Math.Round((double)x.MetricVolume, x.RoundBy, MidpointRounding.AwayFromZero));
                        var yValue = isTrend
                            ? (x.SampleSize < Constants.Low_SampleSize_Value ? null : value)
                            : (x.SampleSize < Constants.Low_SampleSize_Value ? 0 : value ?? 0);
                        isLowSampleSize = isLowSampleSize || x.SampleSize < Constants.SampleSize_Value;
                        return new DataPoint
                        {
                            y = yValue,
                            Value = response.IsPercentage ? (double?)((decimal?)x.MetricVolume) : x.MetricVolume,
                            SampleSize = x.SampleSize == null ? null : Convert.ToDouble(x.SampleSize) as double?,
                            color = request.isTrend ? colorCodes[i - 1] : colorCodes[k++],
                            MetricType = x.MetricType,
                            TimePeriod = x.TimePeriodName
                        };
                    }
                    ).FirstOrDefault();
                    if(request.TimePeriodId=="-1001"|| request.TimePeriodId == "-1002" || request.TimePeriodId == "-1003" || request.TimePeriodId == "-1004")
                    {
                        columns[idx] += "<br/> " + pointData.TimePeriod;
                    }
                    series.data.Add(pointData);
                }
                response.Series.Add(series);
            }
            response.Categories = columns;
            response.isLowSampleSize = isLowSampleSize;
            return response;
        }
        public DeepdiveViewResponse GetDataForExports(DeepdiveViewRequest request)
        {
            DataSet dSet = _unitOfWork.GetRepository<IDeepDiveRepository>().GetChartOutput(request);
            DeepdiveViewResponse response = new DeepdiveViewResponse();
            response.DeepdiveDataList = tableToList(dSet.Tables[0]);
            return response;
        }
        private List<DeepdiveOutputRow> tableToList(DataTable tbl)
        {
            var output = new List<DeepdiveOutputRow>();
            output = (from r in tbl.AsEnumerable()
                      select new DeepdiveOutputRow()
                      {
                          MarketName = tbl.Columns.Contains("Country") ? Convert.ToString(r["Country"]) : null,
                          CategoryName = tbl.Columns.Contains("Category") ? Convert.ToString(r["Category"]) : null,
                          TimePeriodName = tbl.Columns.Contains("TimeperiodName") ? Convert.ToString(r["TimeperiodName"]) : null,
                          BrandName = tbl.Columns.Contains("Brand") ? Convert.ToString(r["Brand"]) : null,
                          Segment1Name = tbl.Columns.Contains("Segment1") ? Convert.ToString(r["Segment1"]) : null,
                          Segment2Name = tbl.Columns.Contains("Segment2") ? Convert.ToString(r["Segment2"]) : null,
                          MetricName = tbl.Columns.Contains("MetricName") ? Convert.ToString(r["MetricName"]) : null,
                          MetricVolume = r["MetricValue"] == DBNull.Value ? null : stringToDouble(r["MetricValue"].ToString(), Convert.ToInt32(r["RoundBy"].ToString())),
                          ChannelName = tbl.Columns.Contains("Channel") ? Convert.ToString(r["Channel"]) : null,
                          DemographicName = tbl.Columns.Contains("Demographic") ? Convert.ToString(r["Demographic"]) : null,
                          MetricType = tbl.Columns.Contains("MetricType") ? Convert.ToString(r["MetricType"]) : null,
                          SampleSize = r["RawBuyers"] == DBNull.Value ? null : stringToDouble(r["RawBuyers"].ToString()),
                          RoundBy = r["RoundBy"] == DBNull.Value ? 0 : Convert.ToInt32(r["RoundBy"].ToString()),
                      }).ToList();

            return output;
        }
        public string ExportPPTExcel(DeepdiveViewRequest request)
        {
            string fileName = string.Empty;
            var response = GetDataForExports(request);

            var templatePath = GetTemplatePath(request);

            if (request.ExportsType.ToLower().Equals(Constants.PPT_Text))
            {
                fileName = GenerateDeepdivePPT(request, response, templatePath);
            }
            else if (request.ExportsType.ToLower().Equals(Constants.Excel_Text))
            {
                fileName = GenerateDeepdiveExcel(request, response, templatePath);
            }
            return fileName;
        }
        public string GenerateDeepdivePPT(DeepdiveViewRequest request, DeepdiveViewResponse response, string templatePath)
        {
            string pptTemplate = HttpContext.Current.Server.MapPath(templatePath);
            Aspose.Slides.License license = new Aspose.Slides.License();
            license.SetLicense(HttpContext.Current.Server.MapPath("~/Aspose.Slides.lic"));
            Aspose.Slides.Presentation pres = new Aspose.Slides.Presentation(pptTemplate);

            ISlideCollection slds = pres.Slides;
            ISlide sld = slds[0];

            ((IAutoShape)sld.Shapes.FirstOrDefault(x => x.Name == "chart_header")).TextFrame.Text = request.ChartTitle;

            ICommentAuthor author = pres.CommentAuthors.AddAuthor("Mondelez", "M");
            //Position of comments
            PointF point = new PointF();
            point.X = 4;
            point.Y = 90;
            string selectionText = GetSelectionText(request);
            author.Comments.AddComment(selectionText.Replace("||", "\n"), sld, point, DateTime.Now);
            //UpdateSelectionText(request, sld, "selectionText");

            //FooterText
            if (request.FooterText.Trim().Length > 0)
            {
                sld.AddNotesSlide().NotesTextFrame.Paragraphs[0].Portions[0].Text = request.FooterText;
            }
            var isLTD = false;
            if (request.TimePeriodId == "-1001" || request.TimePeriodId == "-1002" || request.TimePeriodId == "-1003" || request.TimePeriodId == "-1004")
            {
                isLTD = true;
            }

            if (request.ChartType == Constants.Bar_Text)
            {
                response.DeepdiveDataList.Reverse();
                Array.Reverse(colorCodes, 0, response.DeepdiveDataList.Count);
                UpdateBarOrColumnChart(sld, response.DeepdiveDataList, "chart", request.CompareName, isLTD);
                response.DeepdiveDataList.Reverse();
                Array.Reverse(colorCodes, 0, response.DeepdiveDataList.Count);
            }
            else if (request.ChartType == Constants.Column_Text)
            {
                UpdateBarOrColumnChart(sld, response.DeepdiveDataList, "chart", request.CompareName, isLTD);
            }
            else if (request.ChartType == Constants.Line_Text)
            {
                UpdateLineChart(sld, response.DeepdiveDataList, "chart", request.CompareName);
            }

            string tempFolderName = GenerateRandomString(15);
            string tempFileName = "Mondelez_DeepDive(" + System.DateTime.Now.ToString("MM-dd-yyyy") + "_" + System.DateTime.Now.ToString("HH-mm-ss") + ").pptx";
            if (Directory.Exists(System.Web.HttpContext.Current.Server.MapPath(Constants.DeepdiveDownloadPath + tempFolderName)))
                Directory.Delete(System.Web.HttpContext.Current.Server.MapPath(Constants.DeepdiveDownloadPath + tempFolderName), true);
            Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath(Constants.DeepdiveDownloadPath + tempFolderName));
            string tempFilePath = System.Web.HttpContext.Current.Server.MapPath(Constants.DeepdiveDownloadPath + tempFolderName + "/" + tempFileName);
            pres.Save(tempFilePath, Aspose.Slides.Export.SaveFormat.Pptx);
            return (Constants.DeepdiveDownloadPath.Replace("~", "..") + tempFolderName + "/" + tempFileName);
        }
        public string GenerateDeepdiveExcel(DeepdiveViewRequest request, DeepdiveViewResponse response, string templatePath)
        {
            string tempFolderName = GenerateRandomString(15);
            string tempFileName = "Mondelez_DeepDive(" + System.DateTime.Now.ToString("MM-dd-yyyy") + "_" + System.DateTime.Now.ToString("HH-mm-ss") + ").xlsx";
            templatePath = HttpContext.Current.Server.MapPath(templatePath);
            if (Directory.Exists(System.Web.HttpContext.Current.Server.MapPath(Constants.DeepdiveDownloadPath + tempFolderName)))
                Directory.Delete(System.Web.HttpContext.Current.Server.MapPath(Constants.DeepdiveDownloadPath + tempFolderName), true);
            Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath(Constants.DeepdiveDownloadPath + tempFolderName));
            string tempFilePath = System.Web.HttpContext.Current.Server.MapPath(Constants.DeepdiveDownloadPath + tempFolderName + "/" + tempFileName);


            File.Copy(templatePath, tempFilePath);
            var file = new FileInfo(tempFilePath);

            int _row = 0, _col = 0;
            using (ExcelPackage package = new ExcelPackage(file))
            {
                ExcelWorksheet ws1 = package.Workbook.Worksheets[1]; ws1.Name = request.isTrend ? "Trended" : "Point in Time";
                List<string> columns = null;
                List<string> rows = null;
                bool isTrend = request.isTrend;
                if (isTrend)
                {
                    columns = response.DeepdiveDataList.Select(r => r.TimePeriodName).Distinct().ToList();
                    rows = response.DeepdiveDataList.Select(r => r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString()).Distinct().ToList();
                }
                else
                {
                    rows = response.DeepdiveDataList.Select(r => r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString()).Distinct().ToList();
                    columns = response.DeepdiveDataList.Select(r => r.MetricName).Distinct().ToList();
                }
                var selectionText = GetSelectionText(request);
                var selectionNames = selectionText.Split(new String[] { "||" }, StringSplitOptions.None);

                #region Selection Summary
                _row = 2;
                _col = 1;
                var r1 = ws1.Cells[_row, _col];
                for (int i = 0; i < selectionNames.Length; i++)
                {
                    r1 = ws1.Cells[_row, _col];
                    r1.RichText.Clear();
                    r1.RichText.Add(selectionNames[i]).Color = Color.FromArgb(79, 33, 112);
                    r1.Style.Font.Bold = true;
                    _row = _row + 1;
                }
                #endregion

                #region Table Title
                _row = 12;
                r1 = ws1.Cells[_row, _col];
                r1.RichText.Clear();
                r1.Style.Fill.PatternType = ExcelFillStyle.Solid;
                r1.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(203, 210, 214));
                ws1.Cells[_row, _col].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                r1.RichText.Add(request.isTrend ? "Trended" : "Point in Time").Color = Color.Black;
                //ws1.Row(_row).Height = 20.25;
                if (request.isTrend)
                {
                    _col = 2;
                    r1 = ws1.Cells[_row, _col];
                    r1.RichText.Clear();
                    r1.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    r1.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    r1.Style.Fill.BackgroundColor.SetColor(Color.White);
                    ws1.Cells[_row, _col, _row, _col + columns.Count - 1].Merge = true;
                    ws1.Cells[_row, _col, _row + 1, _col].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    ws1.Cells[_row, _col, _row, _col + columns.Count - 1].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                    r1.RichText.Add(response.DeepdiveDataList[0].MetricName).Color = Color.Black;
                }
                #endregion

                #region Table Header
                _row = 13;
                _col = 2;
                r1 = ws1.Cells[_row, _col];
                r1.RichText.Clear();
                //ws1.Row(_row).Height = 15;
                ws1.Cells[_row, _col].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                if (request.isTrend)
                {
                    var headerColumns = response.DeepdiveDataList.Select(r => r.TimePeriodName).Distinct().ToList();
                    for (int i = 0; i < headerColumns.Count; i++)
                    {
                        r1 = ws1.Cells[_row, _col];
                        r1.RichText.Clear();
                        r1.Style.Font.Size = 11;
                        r1.Style.Font.Bold = true;
                        r1.Style.Font.Name = "Calibri";
                        // ws1.Row(_row).Height = 15;
                        //ws1.Column(_col).Width = 17.71;
                        ws1.Cells[_row, _col].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                        ws1.Cells[_row, _col].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                        r1.RichText.Add(headerColumns[i]).Color = Color.Black;
                        _col = _col + 1;
                    }
                }
                else
                {
                    r1.RichText.Add(response.DeepdiveDataList[0].MetricName).Color = Color.Black;
                    r1.Style.Font.Bold = true;
                }
                #endregion

                #region Table values
                _row = 14;
                _col = 1;

                #region First Level Rows
                for (int i = 0; i < rows.Count; i++)
                {
                    r1 = ws1.Cells[_row, _col, _row + 1, _col];
                    r1.RichText.Clear();
                    ws1.Cells[_row, _col, _row + 1, _col].Merge = true;
                    ws1.Cells[_row, _col, _row + 1, _col].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    ws1.Cells[_row, _col].Value = rows[i].ToUpper();
                    ws1.Cells[_row, _col].Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;
                    ws1.Cells[_row, _col, _row + 1, _col].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                    r1.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    if (i % 2 == 0)
                    {
                        r1.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(203, 210, 214));
                    }
                    else
                    {
                        r1.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(237, 241, 242));
                    }
                    r1.Style.Font.Bold = true;
                    _row = _row + 2;
                }
                #endregion

                #region Main Table Values
                _row = 14;
                _col = 2;
                double metricSampleSize = 0;
                int _footerRow = 0;

                for (int i = 0; i < columns.Count; i++)
                {
                    for (int j = 0; j < rows.Count; j++)
                    {
                        var data = new DeepdiveOutputRow();
                        if (request.isTrend)
                        {
                            data = response.DeepdiveDataList.Where(r => r.TimePeriodName == columns[i] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == rows[j]).FirstOrDefault();
                        }
                        else
                        {
                            data = response.DeepdiveDataList.Where(r => r.MetricName == columns[i] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == rows[j]).FirstOrDefault();
                        }
                        if (request.TimePeriodId == "-1001" || request.TimePeriodId == "-1002" || request.TimePeriodId == "-1003" || request.TimePeriodId == "-1004")
                        {
                            ws1.Cells[_row, _col - 1].Value += " - " + data.TimePeriodName;
                        }
                        r1 = ws1.Cells[_row, _col];
                        ws1.Cells[_row, _col, _row + 1, _col].Merge = true;
                        ws1.Cells[_row, _col, _row + 1, _col].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                        ws1.Cells[_row, _col].Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;
                        r1.RichText.Clear();
                        r1.Style.Fill.PatternType = ExcelFillStyle.Solid;
                        ws1.Cells[_row, _col, _row + 1, _col].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                        ws1.Cells[_row, _col, _row + 1, _col].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                        if (j % 2 == 0)
                        {
                            r1.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(203, 210, 214));
                        }
                        else
                        {
                            r1.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(237, 241, 242));
                        }

                        if (data!=null && data.MetricVolume == null)
                        {
                            r1.Value = Constants.DBNullValueExcel;
                        }
                        else if (data != null && data.MetricVolume!=null)
                        {

                            var format = new String('0', data.RoundBy);
                            if (!string.IsNullOrEmpty(format))
                                format = "." + format;
                            if (data.MetricType == "%")
                            {
                                r1.Style.Numberformat.Format = "0" + format + "\\%";
                            }
                            else if (data.MetricType == "pp")
                            {
                                r1.Style.Numberformat.Format = "#,##0" + format + "\\pp";
                            }
                            else
                            {
                                r1.Style.Numberformat.Format = "#,##0" + format;
                            }
                            double.TryParse(Convert.ToString(data.SampleSize), out metricSampleSize);
                            if (metricSampleSize >= Constants.SampleSize_Value)
                            {
                                r1.Value = data.MetricVolume;
                                r1.Style.Font.Color.SetColor(Color.Black);
                            }
                            else if (metricSampleSize >= Constants.Low_SampleSize_Value && metricSampleSize < Constants.SampleSize_Value)
                            {
                                r1.Value = data.MetricVolume;
                                r1.Style.Font.Color.SetColor(Color.Gray);
                            }
                            else if (metricSampleSize < Constants.Low_SampleSize_Value)
                            {
                                r1.Value = "*";
                                r1.Style.Font.Color.SetColor(Color.Black);
                            }
                        }
                        else
                        {
                            r1.Value = Constants.DBNullValueExcel;
                            r1.Style.Font.Color.SetColor(Color.Black);
                        }
                        _row = _row + 2;
                        _footerRow = _row;
                    }
                    _row = 14;
                    _col = _col + 1;
                }
                #endregion

                #endregion

                #region Footer Text
                if (request.FooterText != null && request.FooterText.Length > 0)
                {
                    _row = _footerRow + 2;
                    var _footerText = request.FooterText.Split('\n');
                    _col = 1;
                    r1 = ws1.Cells[_row, _col, _row + _footerText.Length, _col + 10];
                    r1.Merge = true;
                    r1.RichText.Clear();
                    r1.Value = request.FooterText;
                    r1.Style.Font.Color.SetColor(Color.FromArgb(79, 33, 112));
                    r1.Style.WrapText = true;
                    r1.Style.Border.BorderAround(ExcelBorderStyle.Dotted, Color.Black);
                    r1.Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                    r1.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    r1.Style.Font.Bold = false;
                }
                #endregion

                ws1.Cells.AutoFitColumns();
                package.Save();
            }
            return (Constants.DeepdiveDownloadPath.Replace("~", "..") + tempFolderName + "/" + tempFileName);
        }
        public Presentation StoryBoardPPT(DeepdiveViewRequest request, Presentation pres)
        {
            var response = GetDataForExports(request);

            ISlideCollection slds = pres.Slides;
            ISlide sld = slds[0];
            ICommentAuthor author = pres.CommentAuthors.FindByName("Mondelez").FirstOrDefault();

            ((IAutoShape)sld.Shapes.FirstOrDefault(x => x.Name == "chart_header")).TextFrame.Text = request.ChartTitle;

            if (author != null)
            {
                author.Comments.RemoveAt(0);
            }
            else
            {
                author = pres.CommentAuthors.AddAuthor("Mondelez", "M");
            }
            //Position of comments
            PointF point = new PointF();
            point.X = 4;
            point.Y = 90;
            string selectionText = GetSelectionText(request);
            author.Comments.AddComment(selectionText.Replace("||", "\n"), sld, point, DateTime.Now);
            //UpdateSelectionText(request, sld, "selectionText");

            //FooterText
            if (sld.NotesSlide != null)
            {
                sld.NotesSlide.NotesTextFrame.Paragraphs[0].Portions[0].Text = "";
            }
            if (request.FooterText.Trim().Length > 0)
            {
                sld.AddNotesSlide().NotesTextFrame.Paragraphs[0].Portions[0].Text = request.FooterText;
            }
            var isLTD = false;
            if (request.TimePeriodId == "-1001" || request.TimePeriodId == "-1002" || request.TimePeriodId == "-1003" || request.TimePeriodId == "-1004")
            {
                isLTD = true;
            }

            if (request.ChartType == Constants.Bar_Text)
            {
                response.DeepdiveDataList.Reverse();
                Array.Reverse(colorCodes, 0, response.DeepdiveDataList.Count);
                UpdateBarOrColumnChart(sld, response.DeepdiveDataList, "chart", request.CompareName, isLTD);
                response.DeepdiveDataList.Reverse();
                Array.Reverse(colorCodes, 0, response.DeepdiveDataList.Count);
            }
            else if (request.ChartType == Constants.Column_Text)
            {
                UpdateBarOrColumnChart(sld, response.DeepdiveDataList, "chart", request.CompareName, isLTD);
            }
            else if (request.ChartType == Constants.Line_Text)
            {
                UpdateLineChart(sld, response.DeepdiveDataList, "chart", request.CompareName);
            }

            return pres;
        }
        public string GetTemplatePath(DeepdiveViewRequest request)
        {
            string tempPath = string.Empty;

            if (request.ExportsType.ToLower().Equals(Constants.PPT_Text))
            {
                if (request.ChartType.ToLower().Equals(Constants.Column_Text))
                {
                    tempPath = Constants.DeepDive_Column_Template_PPT;
                }
                else if (request.ChartType.ToLower().Equals(Constants.Bar_Text))
                {
                    tempPath = Constants.DeepDive_Bar_Template_PPT;
                }
                else if (request.ChartType.ToLower().Equals(Constants.Line_Text))
                {
                    tempPath = Constants.DeepDive_Line_Template_PPT;
                }
            }
            else
            {
                if (!request.isTrend)
                {
                    tempPath = Constants.DeepDive_PIT_Excel;
                }
                else
                {
                    tempPath = Constants.DeepDive_Trend_Excel;
                }
            }
            return tempPath;
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
            return Math.Round(outputValue, roundBy, MidpointRounding.AwayFromZero);
        }
        public int? stringToInt(string inputText)
        {
            int outputValue = 0;
            if (!int.TryParse(inputText, out outputValue)) outputValue = 0;
            return outputValue;
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
        public void UpdateBarOrColumnChart(ISlide sld, List<DeepdiveOutputRow> dt, string chartname, string dynamicColumn,bool iSLTD=false)
        {
            Aspose.Slides.Charts.IChart chart;
            chart = (AsposeChart.IChart)sld.Shapes.Where(x => x.Name == chartname).FirstOrDefault();
            if (chart == null)
                return;
            bool isPercentage = false;
            try
            {
                double metricSampleSize, metricVolume;

                //Setting Chart Titile
                chart.HasTitle = true;
                chart.ChartTitle.AddTextFrameForOverriding("");
                IPortion chartTitle = chart.ChartTitle.TextFrameForOverriding.Paragraphs[0].Portions[0];
                chartTitle.Text = "";

                int defaultWorksheetIndex = 0;

                //Getting the chart data worksheet
                Aspose.Slides.Charts.IChartDataWorkbook fact = chart.ChartData.ChartDataWorkbook;
                chart.ChartData.Series.Clear();
                chart.ChartData.Categories.Clear();
                chart.ChartData.ChartDataWorkbook.Clear(defaultWorksheetIndex);
                chart.TextFormat.PortionFormat.LatinFont = new Aspose.Slides.FontData("Montserrat");
                //chart.TextFormat.PortionFormat.FontHeight = 8;

                //Add series
                chart.ChartData.Series.Add(fact.GetCell(defaultWorksheetIndex, 0, 1, dt[0].MetricName), chart.Type);

                for (int i = 0; i < dt.Count; i++)
                {
                    var seriesName = dt[i].GetType().GetProperty(dynamicColumn).GetValue(dt[i], null).ToString();
                    if (iSLTD)
                    {
                        seriesName += " - " + dt[i].TimePeriodName;
                    }
                    chart.ChartData.Categories.Add(fact.GetCell(defaultWorksheetIndex, i + 1, 0, seriesName));
                }


                //series
                Aspose.Slides.Charts.IChartSeries series = chart.ChartData.Series[0];
                Aspose.Slides.Charts.IDataLabel lbl;
                double max = 0.0;

                //Now populating series data
                for (int i = 0; i < dt.Count; i++)
                {
                    series = chart.ChartData.Series[0];
                    chart.Axes.VerticalAxis.TickLabelRotationAngle = 0;
                    chart.Axes.HorizontalAxis.TickLabelRotationAngle = 0;
                    chart.Axes.HorizontalAxis.IsAutomaticTickLabelSpacing = false;

                    double.TryParse(Convert.ToString(dt[i].SampleSize), out metricSampleSize);
                    double.TryParse(Convert.ToString(dt[i].MetricVolume), out metricVolume);
                    if (dt[i].MetricType == "%")
                        metricVolume = metricVolume / 100;

                    series.DataPoints.AddDataPointForBarSeries(fact.GetCell(defaultWorksheetIndex, i + 1, 1, metricSampleSize < Constants.Low_SampleSize_Value ? 0 : metricVolume));
                    lbl = series.DataPoints[i].Label;
                    lbl.DataLabelFormat.ShowValue = true;
                    lbl.TextFrameForOverriding.TextFrameFormat.WrapText = NullableBool.False;

                    var format = new String('0', dt[i].RoundBy);
                    if (!string.IsNullOrEmpty(format))
                        format = "." + format;
                    if (dt[i].MetricType == "%")
                    {
                        lbl.DataLabelFormat.NumberFormat = "0" + format + "%";
                        lbl.DataLabelFormat.ShowPercentage = true;
                        series.Labels.DefaultDataLabelFormat.NumberFormat = "0" + format + "%";
                        series.DataPoints[i].Value.AsCell.CustomNumberFormat = "0" + format + "%";
                        isPercentage = true;
                        if (max < Math.Round(metricVolume, dt[i].RoundBy))  //To calculate y-axis max value
                        {
                            max = Math.Round(metricVolume, dt[i].RoundBy);
                            max = max + (0.1 - max % 0.1);
                            max = max > 1 ? 1 : max;
                        }
                    }
                    else
                    {
                        series.Labels.DefaultDataLabelFormat.NumberFormat = "#,##0" + format;
                        series.DataPoints[i].Value.AsCell.CustomNumberFormat = "#,##0" + format;

                        if (max < Math.Round(metricVolume, dt[i].RoundBy))  //To calculate y-axis max value
                        {
                            max = Math.Round(metricVolume, dt[i].RoundBy);
                        }
                    }

                    series.Format.Fill.FillType = FillType.Solid;
                    series.Labels.DefaultDataLabelFormat.TextFormat.ParagraphFormat.MarginLeft = 0;
                    series.Labels.DefaultDataLabelFormat.TextFormat.ParagraphFormat.MarginRight = 0;
                    series.Labels.DefaultDataLabelFormat.TextFormat.TextBlockFormat.MarginBottom = 0;
                    series.Labels.DefaultDataLabelFormat.TextFormat.TextBlockFormat.MarginLeft = 0;
                    series.Labels.DefaultDataLabelFormat.TextFormat.TextBlockFormat.MarginTop = 0;
                    series.Labels.DefaultDataLabelFormat.TextFormat.TextBlockFormat.MarginRight = 0;
                    series.Labels.DefaultDataLabelFormat.TextFormat.TextBlockFormat.WrapText = NullableBool.False;
                    series.DataPoints[i].Format.Fill.FillType = FillType.Solid;
                    series.DataPoints[i].Format.Fill.SolidFillColor.Color = ColorTranslator.FromHtml(colorCodes[i]);
                    lbl.DataLabelFormat.TextFormat.PortionFormat.FillFormat.FillType = FillType.Solid;
                    if (dt[i].MetricType.ToLower() == "pp")
                    {
                        lbl.TextFrameForOverriding.Text = String.Format("{0:n" + format.Replace(".","").Length.ToString() + "}pp", metricVolume) ;
                    }
                    if (metricSampleSize >= Constants.SampleSize_Value)
                    {
                        lbl.DataLabelFormat.TextFormat.PortionFormat.FillFormat.SolidFillColor.Color = Color.Black;
                    }
                    else if (metricSampleSize >= Constants.Low_SampleSize_Value && metricSampleSize < Constants.SampleSize_Value)
                    {
                        lbl.DataLabelFormat.TextFormat.PortionFormat.FillFormat.SolidFillColor.Color = Color.Gray;
                    }
                    else if (metricSampleSize < Constants.Low_SampleSize_Value)
                    {
                        lbl.DataLabelFormat.TextFormat.PortionFormat.FillFormat.SolidFillColor.Color = Color.Transparent;
                    }
                }
                chart.HasLegend = false;
                chart.Axes.HorizontalAxis.TickLabelPosition = AsposeChart.TickLabelPositionType.Low;
                chart.Axes.VerticalAxis.TickLabelPosition = AsposeChart.TickLabelPositionType.Low;

                if (isPercentage)
                {
                    chart.Axes.VerticalAxis.NumberFormat = "0" + (chart.Axes.VerticalAxis.MinValue == 0 && chart.Axes.VerticalAxis.MaxValue == 0 ? ".00" : ".00") + "%";
                    chart.Axes.VerticalAxis.IsNumberFormatLinkedToSource = false;
                    chart.Axes.HorizontalAxis.NumberFormat = "0" + (chart.Axes.VerticalAxis.MinValue == 0 && chart.Axes.VerticalAxis.MaxValue == 0 ? ".00" : ".00") + "%";
                    chart.Axes.HorizontalAxis.IsNumberFormatLinkedToSource = false;
                }
                else
                {
                    chart.Axes.VerticalAxis.NumberFormat = "#,##0" + (chart.Axes.VerticalAxis.MinValue == 0 && chart.Axes.VerticalAxis.MaxValue == 0 ? ".00" : ".00");
                    chart.Axes.VerticalAxis.IsNumberFormatLinkedToSource = false;
                    chart.Axes.HorizontalAxis.NumberFormat = "#,##0" + (chart.Axes.VerticalAxis.MinValue == 0 && chart.Axes.VerticalAxis.MaxValue == 0 ? ".00" : ".00");
                    chart.Axes.HorizontalAxis.IsNumberFormatLinkedToSource = false;
                }

            }
            catch (Exception ex)
            {
            }
        }
        public void UpdateLineChart(ISlide sld, List<DeepdiveOutputRow> dt, string chartname, string dynamicColumn)
        {
            Aspose.Slides.Charts.IChart chart;
            chart = (AsposeChart.IChart)sld.Shapes.Where(x => x.Name == chartname).FirstOrDefault();
            if (chart == null)
                return;
            bool isPercentage = false;
            try
            {
                int defaultWorksheetIndex = 0;

                //Getting the chart data worksheet
                Aspose.Slides.Charts.IChartDataWorkbook fact = chart.ChartData.ChartDataWorkbook;
                chart.ChartData.Series.Clear();
                chart.ChartData.Categories.Clear();
                chart.ChartData.ChartDataWorkbook.Clear(defaultWorksheetIndex);
                chart.TextFormat.PortionFormat.LatinFont = new Aspose.Slides.FontData("Montserrat");
                chart.TextFormat.PortionFormat.FontHeight = 10;
                Aspose.Slides.Charts.IChartSeries Series;
                Aspose.Slides.Charts.IDataLabel lbl;

                var dSeries = dt.Select(x => x.GetType().GetProperty(dynamicColumn.ToString()).GetValue(x, null)).Distinct().ToList();
                for (int i = 0; i < dSeries.Count(); i++)
                {
                    chart.ChartData.Series.Add(fact.GetCell(defaultWorksheetIndex, 0, (i + 1), dSeries[i]), chart.Type);
                }

                var dCategories = dt.Select(x => x.TimePeriodName).Distinct().ToList();
                for (int i = 0; i < dCategories.Count(); i++)
                {
                    chart.ChartData.Categories.Add(fact.GetCell(defaultWorksheetIndex, (i + 1), 0, dCategories[i]));
                }
                double max = 0.0;
                bool sampleSizeFlag = false;
                for (int i = 0; i < dSeries.Count(); i++)
                {
                    sampleSizeFlag = false;
                    string sName = dSeries[i].ToString();
                    Series = chart.ChartData.Series[i];
                    for (int j = 0; j < dCategories.Count(); j++)
                    {
                        var sData = dt.Where(x => x.GetType().GetProperty(dynamicColumn).GetValue(x, null).ToString() == sName && x.TimePeriodName == dCategories[j]).FirstOrDefault();
                        if (sData != null)
                        {
                            int sampleSize = (int)(sData.SampleSize ?? 0);
                            double metricValue = (double)(sData.MetricVolume ?? 0);
                            if (sData.MetricType == "%")
                            {
                                metricValue = metricValue / 100;
                                if (max < Math.Round(metricValue, sData.RoundBy))  //To calculate y-axis max value
                                {
                                    max = Math.Round(metricValue, sData.RoundBy);
                                    max = max + (0.1 - max % 0.1);
                                    max = max > 1 ? 1 : max;
                                }
                                isPercentage = true;
                            }
                            else
                            {
                                if (max < Math.Round(metricValue, sData.RoundBy))  //To calculate y-axis max value
                                {
                                    max = Math.Round(metricValue, sData.RoundBy);
                                }
                            }


                            if (sampleSize >= Constants.Low_SampleSize_Value && sData.MetricVolume != null)
                            {
                                Series.DataPoints.AddDataPointForLineSeries(fact.GetCell(defaultWorksheetIndex, (j + 1), (i + 1), metricValue));

                                //Get color
                                string sColor = string.Empty;
                                sColor = colorCodes[i];

                                //Marker
                                Series.Marker.Format.Fill.FillType = FillType.Solid;
                                Series.Marker.Format.Fill.SolidFillColor.Color = ColorTranslator.FromHtml(sColor);
                                Series.Marker.Size = 7;
                                Series.Marker.Symbol = Aspose.Slides.Charts.MarkerStyleType.Circle;
                                //Series.Marker.Format.Line.FillFormat.FillType = FillType.NoFill;
                                //Series.Marker.Format.Line.Width = 0;

                                Series.Labels.DefaultDataLabelFormat.ShowValue = true;
                                Series.Labels.DefaultDataLabelFormat.IsNumberFormatLinkedToSource = false;

                                var format = new String('0', sData.RoundBy);
                                if (!string.IsNullOrEmpty(format))
                                    format = "." + format;
                                if (sData.MetricType == "%")
                                {
                                    Series.Labels.DefaultDataLabelFormat.NumberFormat = "0" + format + "%";
                                    Series.DataPoints[j].Value.AsCell.CustomNumberFormat = "0" + format + "%";
                                }
                                else
                                {
                                    Series.Labels.DefaultDataLabelFormat.NumberFormat = "#,##0" + format;
                                    Series.DataPoints[j].Value.AsCell.CustomNumberFormat = "#,##0" + format;
                                }

                                if (sampleSizeFlag)
                                {
                                    Series.DataPoints[j].Format.Line.FillFormat.FillType = FillType.Solid;
                                    Series.DataPoints[j].Format.Line.FillFormat.SolidFillColor.Color = Color.Transparent;
                                    sampleSizeFlag = false;
                                }
                                else
                                {
                                    Series.Format.Line.FillFormat.FillType = FillType.Solid;
                                    Series.Format.Line.FillFormat.SolidFillColor.Color = ColorTranslator.FromHtml(sColor);
                                    sampleSizeFlag = false;
                                }

                                //Set Data Point Label Style
                                lbl = Series.DataPoints[j].Label;
                                lbl.DataLabelFormat.Position = Aspose.Slides.Charts.LegendDataLabelPosition.Top;
                                lbl.DataLabelFormat.ShowValue = true;
                                lbl.DataLabelFormat.TextFormat.PortionFormat.FillFormat.FillType = FillType.Solid;
                                if (sData.MetricType.ToLower() == "pp")
                                {
                                    lbl.TextFrameForOverriding.Text = String.Format("{0:n" + format.Replace(".", "").Length.ToString() + "}pp", metricValue);
                                }
                                if (sampleSize >= Constants.SampleSize_Value)
                                {
                                    lbl.DataLabelFormat.TextFormat.PortionFormat.FillFormat.SolidFillColor.Color = Color.Black;
                                }
                                else if (sampleSize >= Constants.Low_SampleSize_Value && sampleSize < Constants.SampleSize_Value)
                                {
                                    lbl.DataLabelFormat.TextFormat.PortionFormat.FillFormat.SolidFillColor.Color = Color.Gray;
                                }
                            }
                            else
                            {
                                sampleSizeFlag = true;
                                Series.DataPoints.AddDataPointForLineSeries(fact.GetCell(defaultWorksheetIndex, (j + 1), (i + 1), DBNull.Value));

                                Series.DataPoints[j].Format.Line.FillFormat.FillType = FillType.NoFill;
                                Series.DataPoints[j].Format.Line.FillFormat.SolidFillColor.Color = Color.Transparent;

                                Series.DataPoints[j].Marker.Format.Fill.FillType = FillType.Solid;
                                Series.DataPoints[j].Marker.Format.Fill.SolidFillColor.Color = Color.Transparent;
                                Series.DataPoints[j].Marker.Size = 0;
                                Series.DataPoints[j].Marker.Format.Line.FillFormat.FillType = FillType.NoFill;
                                //Series.Labels.DefaultDataLabelFormat.ShowValue = false;

                                lbl = Series.DataPoints[j].Label;
                                lbl.DataLabelFormat.Position = Aspose.Slides.Charts.LegendDataLabelPosition.Top;
                                lbl.DataLabelFormat.ShowValue = true;
                                lbl.DataLabelFormat.TextFormat.PortionFormat.FillFormat.FillType = FillType.Solid;
                                lbl.DataLabelFormat.TextFormat.PortionFormat.FillFormat.SolidFillColor.Color = Color.Transparent;

                                lbl.DataLabelFormat.TextFormat.PortionFormat.FontBold = NullableBool.False;
                            }
                        }
                        else
                        {
                            sampleSizeFlag = true;
                            Series.DataPoints.AddDataPointForLineSeries(fact.GetCell(defaultWorksheetIndex, (j + 1), (i + 1), DBNull.Value));

                            Series.DataPoints[j].Format.Line.FillFormat.FillType = FillType.NoFill;
                            Series.DataPoints[j].Format.Line.FillFormat.SolidFillColor.Color = Color.Transparent;

                            Series.DataPoints[j].Marker.Format.Fill.FillType = FillType.Solid;
                            Series.DataPoints[j].Marker.Format.Fill.SolidFillColor.Color = Color.Transparent;
                            Series.DataPoints[j].Marker.Size = 0;
                            Series.DataPoints[j].Marker.Format.Line.FillFormat.FillType = FillType.NoFill;
                            //Series.Labels.DefaultDataLabelFormat.ShowValue = false;

                            lbl = Series.DataPoints[j].Label;
                            lbl.DataLabelFormat.Position = Aspose.Slides.Charts.LegendDataLabelPosition.Top;
                            lbl.DataLabelFormat.ShowValue = true;
                            lbl.DataLabelFormat.TextFormat.PortionFormat.FillFormat.FillType = FillType.Solid;
                            lbl.DataLabelFormat.TextFormat.PortionFormat.FillFormat.SolidFillColor.Color = Color.Transparent;

                            lbl.DataLabelFormat.TextFormat.PortionFormat.FontBold = NullableBool.False;
                        }

                    }
                }

                #region Setting Value and Category Text Properties
                //Setting Value Axis Text Properties         
                Aspose.Slides.Charts.IChartPortionFormat YaxisVal = chart.Axes.VerticalAxis.TextFormat.PortionFormat;

                //Setting Category Axis Text Properties
                Aspose.Slides.Charts.IChartPortionFormat XAxisVal = chart.Axes.HorizontalAxis.TextFormat.PortionFormat;
                XAxisVal.FontBold = NullableBool.True;
                #endregion

                #region Set Chart Axis Properties
                chart.Axes.VerticalAxis.MajorGridLinesFormat.Line.FillFormat.FillType = FillType.NoFill;
                chart.Axes.VerticalAxis.MinorGridLinesFormat.Line.FillFormat.FillType = FillType.NoFill;

                chart.Axes.HorizontalAxis.MajorGridLinesFormat.Line.FillFormat.FillType = FillType.NoFill;
                chart.Axes.HorizontalAxis.MinorGridLinesFormat.Line.FillFormat.FillType = FillType.NoFill;

                //chart.Axes.VerticalAxis.IsAutomaticMinValue = false;
                //chart.Axes.VerticalAxis.IsAutomaticMaxValue = false;

                //chart.Axes.VerticalAxis.MinValue = 0;
                //chart.Axes.VerticalAxis.MaxValue = max;

                if (isPercentage)
                {
                    chart.Axes.VerticalAxis.NumberFormat = "0" + (chart.Axes.VerticalAxis.MinValue == 0 && chart.Axes.VerticalAxis.MaxValue == 0 ? ".00" : ".00") + "%";
                    chart.Axes.VerticalAxis.IsNumberFormatLinkedToSource = false;
                    chart.Axes.HorizontalAxis.NumberFormat = "0" + (chart.Axes.VerticalAxis.MinValue == 0 && chart.Axes.VerticalAxis.MaxValue == 0 ? ".00" : ".00") + "%";
                    chart.Axes.HorizontalAxis.IsNumberFormatLinkedToSource = false;
                }
                else
                {
                    chart.Axes.VerticalAxis.NumberFormat = "#,##0" + (chart.Axes.VerticalAxis.MinValue == 0 && chart.Axes.VerticalAxis.MaxValue == 0 ? ".00" : ".00");
                    chart.Axes.VerticalAxis.IsNumberFormatLinkedToSource = false;
                    chart.Axes.HorizontalAxis.NumberFormat = "#,##0" + (chart.Axes.VerticalAxis.MinValue == 0 && chart.Axes.VerticalAxis.MaxValue == 0 ? ".00" : ".00");
                    chart.Axes.HorizontalAxis.IsNumberFormatLinkedToSource = false;
                }
                #endregion

                #region Set Legend
                //Set Legend Style
                chart.HasLegend = true;
                chart.Legend.Position = Aspose.Slides.Charts.LegendPositionType.Bottom;
                #endregion
            }
            catch (Exception ex)
            {
            }
        }
        public string GetSelectionText(DeepdiveViewRequest request)
        {
            string output = string.Empty;
            output += "Chart Type : " + (request.isTrend ? "Trend" : "Point in Time") + "||";
            output += "Compare : " + request.CompareTabName + "||";
            output += "Market : " + (request.MarketName.Split('|').Length > 1 ? "Multiple Market" : request.MarketName) + "||";
            output += "Category : " + (request.CategoryName.Split('|').Length > 1 ? "Multiple Category's" : request.CategoryName) + "||";
            output += "Time Period : " + request.TimePeriodName + "||";
            output += "Brand/s : " + (request.BrandName.Split('|').Length > 1 ? "Multiple Brands" : request.BrandName) + "||";
            output += "Segment : " + (request.Segment1Name) + (string.IsNullOrEmpty(request.Segment2Name) ? "" : (" | " + request.Segment2Name)) + "||";
            output += "KPI : " + request.KpiName + "||";
            output += (request.isChannel ? "Channel/Retailer : " : "Demographics : ") + (request.isChannel ? (request.ChannelName.Split('|').Length > 1 ? "Multiple Channel/Retailer" : request.ChannelName) : (request.DemographicName.Split('|').Length > 1 ? "Multiple Demographics" : request.DemographicName));
            return output;
        }
        public void UpdateSelectionText(DeepdiveViewRequest request, ISlide sld, string textBoxName)
        {
            IAutoShape shape;
            IPortion port;
            shape = (IAutoShape)sld.Shapes.FirstOrDefault(x => x.Name == textBoxName);
            shape.TextFrame.Text = "";

            IParagraph para = shape.TextFrame.Paragraphs[0];
            port = new Portion("Selection");
            port.PortionFormat.FontBold = NullableBool.True;
            port.PortionFormat.FontHeight = 20;
            para.Portions.Add(port);

            port = new Portion("\n Market : ");
            port.PortionFormat.FontBold = NullableBool.True;
            port.PortionFormat.FontHeight = 20;
            para.Portions.Add(port);
            port = new Portion((request.MarketName.Split('|').Length > 1 ? "Multiple Market" : request.MarketName) + ";");
            port.PortionFormat.FontBold = NullableBool.False;
            port.PortionFormat.FontHeight = 20;
            para.Portions.Add(port);

            port = new Portion(" Category : ");
            port.PortionFormat.FontBold = NullableBool.True;
            port.PortionFormat.FontHeight = 20;
            para.Portions.Add(port);
            port = new Portion((request.CategoryName.Split('|').Length > 1 ? "Multiple Category's" : request.CategoryName) + ";");
            port.PortionFormat.FontBold = NullableBool.False;
            port.PortionFormat.FontHeight = 20;
            para.Portions.Add(port);

            port = new Portion(" Time Period : ");
            port.PortionFormat.FontBold = NullableBool.True;
            port.PortionFormat.FontHeight = 20;
            para.Portions.Add(port);
            port = new Portion(request.TimePeriodName + ";");
            port.PortionFormat.FontBold = NullableBool.False;
            port.PortionFormat.FontHeight = 20;
            para.Portions.Add(port);

            port = new Portion("\n Brand/s : ");
            port.PortionFormat.FontBold = NullableBool.False;
            port.PortionFormat.FontHeight = 12;
            para.Portions.Add(port);
            port = new Portion((request.BrandName.Split('|').Length > 1 ? "Multiple Brands" : request.BrandName) + ";");
            port.PortionFormat.FontBold = NullableBool.False;
            port.PortionFormat.FontHeight = 12;
            para.Portions.Add(port);

            port = new Portion("\n Segment : ");
            port.PortionFormat.FontBold = NullableBool.False;
            port.PortionFormat.FontHeight = 12;
            para.Portions.Add(port);
            port = new Portion((request.Segment1Name) + (string.IsNullOrEmpty(request.Segment2Name) ? "" : (" | " + request.Segment2Name)) + ";");
            port.PortionFormat.FontBold = NullableBool.False;
            port.PortionFormat.FontHeight = 12;
            para.Portions.Add(port);

            port = new Portion("\n KPI : ");
            port.PortionFormat.FontBold = NullableBool.False;
            port.PortionFormat.FontHeight = 12;
            para.Portions.Add(port);
            port = new Portion(request.KpiName + ";");
            port.PortionFormat.FontBold = NullableBool.False;
            port.PortionFormat.FontHeight = 12;
            para.Portions.Add(port);

            port = new Portion("\n " + ((request.isChannel ? "Channel/Retailer" : "Demographics")) + " : ");
            port.PortionFormat.FontBold = NullableBool.False;
            port.PortionFormat.FontHeight = 12;
            para.Portions.Add(port);
            port = new Portion((request.isChannel ? (request.ChannelName.Split('|').Length > 1 ? "Multiple Channel/Retailer" : request.ChannelName) : (request.DemographicName.Split('|').Length > 1 ? "Multiple Demographics" : request.DemographicName)) + ";");
            port.PortionFormat.FontBold = NullableBool.False;
            port.PortionFormat.FontHeight = 12;
            para.Portions.Add(port);
        }
        public string CommaSeparatedValues(string value)
        {
            string decimaval = "0";
            if (!string.IsNullOrEmpty(value))
            {
                decimaval = Convert.ToString(String.Format("{0:#,###}", Convert.ToDouble(value)));
            }
            return decimaval;
        }
    }
}
