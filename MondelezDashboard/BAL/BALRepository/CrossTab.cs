using DAL;
using Entites;
using System.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.IO;
using System.Drawing;
using OfficeOpenXml.Style;
using OfficeOpenXml;
using Entites.EntityModel;

namespace BAL
{
    public class CrossTab : ICrossTab
    {
        internal readonly IUnitOfWork _unitOfWork;
        public CrossTab(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public int GetUserId(string EmailId)
        {
            int userid = _unitOfWork.GetRepository<ICrossTabRepository>().GetUserId(EmailId);

            return userid;
        }
        public CrossTabViewResponse GetData(CrossTabViewRequest request)
        {
            CrossTabViewResponse response = new CrossTabViewResponse();
            response = FetchData(request);
            return response;
        }
        public string ExportToExcel(CrossTabViewRequest request)
        {
            string fileName = string.Empty;
            var response = FetchData(request);
            var templatePath = Constants.CrossTab_Excel;
            if (response.Message == Constants.CrossTab_FailedDataLoad) return "";
            for (int i = 0; i < response.CrossTabDataList.Count; i++)
            {
                if (response.CrossTabDataList[i].SampleSize < 20)
                {
                    request.FooterText = Constants.LowSampleSizeFotter;
                    break;
                }
            }
            if (request.MarketName.ToLower().Split('|').Contains("germany")) {
                if(request.FooterText!=null && request.FooterText.Length>0)
                    request.FooterText += "\n" + Constants.MarketGermanyFotter;
                else
                    request.FooterText = Constants.MarketGermanyFotter;
            }
            fileName = GenerateCrossTabExcel(request, response, templatePath);
            return fileName;
        }
        public string ExportToExcelDataExplorer(DataExplorerTableDetails request)
        {
            string fileName = string.Empty;
            var templatePath = Constants.CrossTab_Excel;
            
            /*var response = FetchData(request);
            var templatePath = Constants.CrossTab_Excel;
            if (response.Message == Constants.CrossTab_FailedDataLoad) return "";
            for (int i = 0; i < response.CrossTabDataList.Count; i++)
            {
                if (response.CrossTabDataList[i].SampleSize < 20)
                {
                    request.FooterText = Constants.LowSampleSizeFotter;
                    break;
                }
            }
            if (request.MarketName.ToLower().Split('|').Contains("germany"))
            {
                if (request.FooterText != null && request.FooterText.Length > 0)
                    request.FooterText += "\n" + Constants.MarketGermanyFotter;
                else
                    request.FooterText = Constants.MarketGermanyFotter;
            }
            fileName = GenerateCrossTabExcel(request, response, templatePath);*/
            fileName = GenerateCrossTabExcelDataExplorer(templatePath,request);
            return fileName;
        }
        public CrossTabViewResponse FetchData(CrossTabViewRequest request)
        {
            DataSet dSet = _unitOfWork.GetRepository<ICrossTabRepository>().GetData(request);
            CrossTabViewResponse response = new CrossTabViewResponse();
            if (dSet.Tables.Count > 0)
            {
                response.CrossTabDataList = tableToList(dSet.Tables[0]);
            }
            else
            {
                response.Message = Constants.CrossTab_FailedDataLoad;
            }
            if(request.TimePeriodId == "-1001" || request.TimePeriodId == "-1002"|| request.TimePeriodId == "-1003"|| request.TimePeriodId == "-1004")
            {
                DataTable tbl = new DataTable();
                tbl = dSet.Tables[1];
                response.LatestTimePeriod = (from r in tbl.AsEnumerable()
                                             select new LatestTimePeriod
                                             {
                                                 MarketName = tbl.Columns.Contains("Country") ? Convert.ToString(r["Country"]) : null,
                                                 CategoryName = tbl.Columns.Contains("Category") ? Convert.ToString(r["Category"]) : null,
                                                 TimePeriodName = tbl.Columns.Contains("TimeperiodName") ? Convert.ToString(r["TimeperiodName"]) : null,
                                             }).ToList();

            }
            return response;
        }
        public string GenerateCrossTabExcel(CrossTabViewRequest request, CrossTabViewResponse response, string templatePath)
        {
            string tempFolderName = GenerateRandomString(15);
            string tempFileName = "Mondelez_CrossTab(" + System.DateTime.Now.ToString("MM-dd-yyyy") + "_" + System.DateTime.Now.ToString("HH-mm-ss") + ").xlsx";
            templatePath = HttpContext.Current.Server.MapPath(templatePath);
            if (Directory.Exists(System.Web.HttpContext.Current.Server.MapPath(Constants.CrossTabDownloadPath + tempFolderName)))
                Directory.Delete(System.Web.HttpContext.Current.Server.MapPath(Constants.CrossTabDownloadPath + tempFolderName), true);
            Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath(Constants.CrossTabDownloadPath + tempFolderName));
            string tempFilePath = System.Web.HttpContext.Current.Server.MapPath(Constants.CrossTabDownloadPath + tempFolderName + "/" + tempFileName);


            File.Copy(templatePath, tempFilePath);
            var file = new FileInfo(tempFilePath);

            int _row = 0, _col = 0, _levelCol = 0;
            int levlCount = request.RowId.Split('|').Length;
            string columnName = getColumn(request.ColumnId);

            using (ExcelPackage package = new ExcelPackage(file))
            {
                ExcelWorksheet ws1 = package.Workbook.Worksheets[1]; ws1.Name = "Cross Tab";
                List<string> columns = null;
                List<string> rows = new List<string>();

                for(int i=0;i< levlCount; i++)
                {
                    rows.Add(getColumn(request.RowId.Split('|')[i]));
                }

                columns = response.CrossTabDataList.Select(r => r.GetType().GetProperty(columnName).GetValue(r, null).ToString()).Distinct().ToList();

                var selectionText = GetSelectionText(request);
                var selectionNames = selectionText.Split(new String[] { "||" }, StringSplitOptions.None);
               
                #region Latest Time period 
                if (request.TimePeriodId == "-1001" || request.TimePeriodId == "-1002" || request.TimePeriodId == "-1003" || request.TimePeriodId == "-1004")
                {
                    _row = 4;
                    _col = 5;

                    var r = ws1.Cells[_row - 1, _col];
                    r.RichText.Add("Latest Time Period Mappings").Color = Color.Black;
                    r.Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                    r.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    r.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(203, 210, 214));
                    r.Style.Font.Size = 11;
                    r.Style.Font.Bold = true;
                    r.Style.Font.Name = "Calibri";

                    r = ws1.Cells[_row, _col];
                    r.RichText.Add("Market").Color = Color.FromArgb(79, 33, 112);
                    r.Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                    r.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    r.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(237, 241, 242));
                    r.Style.Font.Bold = true;
                    r.Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;

                    r = ws1.Cells[_row + 1, _col];
                    r.RichText.Add("Category").Color = Color.FromArgb(79, 33, 112);
                    r.Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                    r.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    r.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(237, 241, 242));
                    r.Style.Font.Bold = true;
                    r.Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;

                    r = ws1.Cells[_row + 2, _col];
                    r.RichText.Add("Latest Time Period").Color = Color.FromArgb(79, 33, 112);
                    r.Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                    r.Style.Fill.PatternType = ExcelFillStyle.Solid;
                    r.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(237, 241, 242));
                    r.Style.Font.Bold = true;
                    r.Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;

                    for (int i = 0; i < response.LatestTimePeriod.Count; i++)
                    {
                        _col++;

                        r = ws1.Cells[_row, _col];
                        r.RichText.Add(response.LatestTimePeriod[i].MarketName);
                        r.Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                        r.Style.Fill.PatternType = ExcelFillStyle.Solid;
                        r.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(203, 210, 214));
                        r = ws1.Cells[_row + 1, _col];
                        r.RichText.Add(response.LatestTimePeriod[i].CategoryName);
                        r.Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                        r.Style.Fill.PatternType = ExcelFillStyle.Solid;
                        r.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(237, 241, 242));
                        r = ws1.Cells[_row + 2, _col];
                        r.RichText.Add(response.LatestTimePeriod[i].TimePeriodName == string.Empty ? "NA" : response.LatestTimePeriod[i].TimePeriodName);
                        r.Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                        r.Style.Fill.PatternType = ExcelFillStyle.Solid;
                        r.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(203, 210, 214));
                    }

                }
                #endregion                
                
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
                r1 = ws1.Cells[_row, _col, _row, _col + levlCount - 1];
                r1.Merge = true;
                r1.RichText.Clear();
                r1.Style.Fill.PatternType = ExcelFillStyle.Solid;
                r1.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(203, 210, 214));
                ws1.Cells[_row, _col].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                r1.RichText.Add(request.RowName + " vs " + request.ColumnName).Color = Color.Black;
                #endregion

                #region Table Header
                _row = 13;
                _col = 1 + levlCount;
                r1 = ws1.Cells[_row, _col];
                r1.RichText.Clear();
                //ws1.Row(_row).Height = 15;
                ws1.Cells[_row, _col].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                for (int i = 0; i < columns.Count; i++)
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
                    r1.RichText.Add(columns[i]).Color = Color.Black;
                    _col = _col + 1;
                }
                #endregion

                #region Table values
                _row = 14;
                _col = 1;

                #region Row Headers
                _row = 14;
                _levelCol = 0;

                for (int i = 0; i < 1; i++)
                {
                    for(int k = 0; k < rows.Count; k++)
                    {
                        List<CrossTabOutputRow> colData = new List<CrossTabOutputRow>();
                        _levelCol = _levelCol + i + 1;
                        colData = response.CrossTabDataList.Where(r => r.GetType().GetProperty(columnName).GetValue(r, null).ToString() == columns[i]).ToList();
                        int repeatCount = 0;
                        string prevValue = "";
                        for (int j = 0; j < colData.Count + 1; j++)
                        {
                            var data = new CrossTabOutputRow();
                            try
                            {
                                data = colData[j];
                            }
                            catch(Exception ex)
                            {
                                if (repeatCount > 1)
                                {
                                    r1 = ws1.Cells[_row - repeatCount, _levelCol, _row - 1, _levelCol];
                                    r1.Merge = true;
                                    r1.Style.Fill.PatternType = ExcelFillStyle.Solid;
                                    r1.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(237, 241, 242));
                                    r1.Style.Font.Bold = true;
                                    r1.Style.Font.Color.SetColor(Color.FromArgb(79, 33, 112));
                                    r1.Style.WrapText = true;
                                }
                                break;
                            }
                            string value = data.GetType().GetProperty(rows[k]).GetValue(data, null).ToString().ToUpper();
                            r1 = ws1.Cells[_row, _levelCol];
                            r1.RichText.Clear();
                            if (j == 0)
                            {
                                prevValue = value;
                                repeatCount = 1;
                            }
                            else if (prevValue != value)
                            {
                                prevValue = value;
                                if (repeatCount > 1 )
                                {
                                    r1 = ws1.Cells[_row - repeatCount , _levelCol, _row - 1, _levelCol];
                                    r1.Merge = true;
                                }
                                repeatCount = 1;
                            }
                            else if (prevValue == value)
                            {
                                repeatCount++;
                            }
                            if (repeatCount == 1)
                            {
                                ws1.Cells[_row, _levelCol].Value = value;
                            }
                            ws1.Cells[_row, _levelCol].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                            ws1.Cells[_row, _levelCol].Style.HorizontalAlignment = k == levlCount - 1 ? ExcelHorizontalAlignment.Right : ExcelHorizontalAlignment.Center;
                            ws1.Cells[_row, _levelCol].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                            r1.Style.Fill.PatternType = ExcelFillStyle.Solid;
                            r1.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(237, 241, 242));
                            r1.Style.Font.Bold = true;
                            r1.Style.Font.Color.SetColor(Color.FromArgb(79, 33, 112));
                            r1.Style.WrapText = true;
                            _row = _row + 1;
                        }
                        _row = 14;
                        ws1.Column(_levelCol).Width = 30;
                    }
                }
                #endregion

                #region Main Table Values
                _row = 14;
                _col = 1 + levlCount;
                double metricSampleSize = 0;
                int _footerRow = 0;

                for (int i = 0; i < columns.Count; i++)
                {
                    List<CrossTabOutputRow> colData = new List<CrossTabOutputRow>();
                    colData = response.CrossTabDataList.Where(r => r.GetType().GetProperty(columnName).GetValue(r, null).ToString() == columns[i]).ToList();

                    for (int j = 0; j < colData.Count; j++)
                    {
                        var data = new CrossTabOutputRow();
                        data = colData[j];

                        r1 = ws1.Cells[_row, _col];
                        ws1.Cells[_row, _col].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                        ws1.Cells[_row, _col].Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;
                        r1.RichText.Clear();
                        r1.Style.Fill.PatternType = ExcelFillStyle.Solid;
                        ws1.Cells[_row, _col].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                        ws1.Cells[_row, _col].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                        if (j % 2 == 0)
                        {
                            r1.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(203, 210, 214));
                        }
                        else
                        {
                            r1.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(237, 241, 242));
                        }

                        if (data != null && data.MetricVolume == null)
                        {
                            r1.Value = Constants.DBNullValueExcel;
                        }
                        else if (data != null && data.MetricVolume != null)
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
                        _row = _row + 1;
                        _footerRow = _row;
                    }
                    ws1.Column(_col).AutoFit();
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

                //ws1.Cells.AutoFitColumns();               
                package.Save();
            }
            return (Constants.CrossTabDownloadPath.Replace("~", "..") + tempFolderName + "/" + tempFileName);
        }
        public string GenerateCrossTabExcelDataExplorer(string templatePath, DataExplorerTableDetails outputData)
        {
            string tempFolderName = GenerateRandomString(15);
            string tempFileName = "Mondelez_CrossTab(" + System.DateTime.Now.ToString("MM-dd-yyyy") + "_" + System.DateTime.Now.ToString("HH-mm-ss") + ").xlsx";
            templatePath = HttpContext.Current.Server.MapPath(templatePath);
            if (Directory.Exists(System.Web.HttpContext.Current.Server.MapPath(Constants.CrossTabDownloadPath + tempFolderName)))
                Directory.Delete(System.Web.HttpContext.Current.Server.MapPath(Constants.CrossTabDownloadPath + tempFolderName), true);
            Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath(Constants.CrossTabDownloadPath + tempFolderName));
            string tempFilePath = System.Web.HttpContext.Current.Server.MapPath(Constants.CrossTabDownloadPath + tempFolderName + "/" + tempFileName);

            File.Copy(templatePath, tempFilePath);
            var file = new FileInfo(tempFilePath);

            int _row = 0, _col = 0, _levelCol = 0;
            int rowLevlCount = outputData.RowList.Count;
            int colLevlCount = outputData.ColumnList.Count;

            using (ExcelPackage package = new ExcelPackage(file))
            {
                ExcelWorksheet ws1 = package.Workbook.Worksheets[1]; ws1.Name = "Cross Tab";

                var selectionNames = outputData.Selection.Split(new String[] { "||" }, StringSplitOptions.None);
                #region Selection Summary
                _row = 2;
                _col = 1;
                var r = ws1.Cells[_row, _col];
                for (int i = 0; i < selectionNames.Length; i++)
                {
                    r = ws1.Cells[_row, _col];
                    r.RichText.Clear();
                    r.RichText.Add(selectionNames[i]).Color = Color.FromArgb(79, 33, 112);
                    r.Style.Font.Bold = true;
                    _row = _row + 1;
                }
                r = ws1.Cells[12, _col];
                r.RichText.Clear();
                r.RichText.Add(selectionNames[0].Replace("Column : ", "")+" vs "+ selectionNames[1].Replace("Row : ", "")).Color = Color.FromArgb(0, 0, 0);
                r.Style.Fill.PatternType = ExcelFillStyle.Solid;
                r.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(203, 210, 214));
                r.Style.Font.Bold = true;
                r = ws1.Cells[12, _col, 12, rowLevlCount];
                r.Merge = true;
                r.Style.Fill.PatternType = ExcelFillStyle.Solid;
                r.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(203, 210, 214));
                #endregion
                _row = 13;
                _col = 1 + rowLevlCount;
                var r1 = ws1.Cells[_row, _col];
                for (int i = 0; i < outputData.ColumnList.Count; i++)
                {
                    int tempRow = _row + i;
                    int tempCol = _col;
                    for(int j = 0; j < outputData.ColumnList[i].Values.Count; j++)
                    {
                        if (outputData.ColumnList[i].Values[j].WidthCount <= 1)
                        {
                            ws1.Cells[tempRow, tempCol].Value = outputData.ColumnList[i].Values[j].Name;
                            r1 = ws1.Cells[tempRow, tempCol];
                        }
                        else
                        {
                            ws1.Cells[tempRow, tempCol].Value = outputData.ColumnList[i].Values[j].Name;
                            r1 = ws1.Cells[tempRow, tempCol, tempRow, tempCol + outputData.ColumnList[i].Values[j].WidthCount - 1];
                        }
                        r1.Merge = true;
                        r1.Style.Font.Size = 11;
                        r1.Style.Font.Bold = true;
                        r1.Style.Font.Name = "Calibri";
                        r1.Style.Font.Color.SetColor(Color.FromArgb(0, 0, 0));
                        r1.Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                        r1.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                        r1.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                        r1.Style.Fill.PatternType = ExcelFillStyle.Solid;
                        r1.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(255, 255, 255));
                        r1.Style.WrapText = true;
                        tempCol = tempCol + outputData.ColumnList[i].Values[j].WidthCount;
                    }
                }
                var footerRow = 0;
                for (int i = 0; i < outputData.RowList.Count; i++)
                {
                    int tempRow = _row + outputData.ColumnList.Count;
                    int tempCol = i+1;
                    for (int j = 0; j < outputData.RowList[i].Values.Count; j++)
                    {
                        if (outputData.RowList[i].Values[j].WidthCount <= 0)
                        {
                            continue;
                        }
                        ws1.Cells[tempRow, tempCol].Value = outputData.RowList[i].Values[j].Name.ToUpper();
                        if (outputData.RowList[i].Values[j].WidthCount == 1)
                        {
                            r1 = ws1.Cells[tempRow, tempCol];
                        }
                            r1 = ws1.Cells[tempRow, tempCol, tempRow + outputData.RowList[i].Values[j].WidthCount - 1, tempCol ];
                        r1.Merge = true;
                        r1.Style.Font.Size = 11;
                        r1.Style.Font.Bold = true;
                        r1.Style.Font.Name = "Calibri";
                        r1.Style.Font.Color.SetColor(Color.FromArgb(79, 33, 112));
                        r1.Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                        r1.Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                        r1.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                        r1.Style.Fill.PatternType = ExcelFillStyle.Solid;
                        r1.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(237, 241, 242));
                        r1.Style.WrapText = true;
                        tempRow = tempRow + outputData.RowList[i].Values[j].WidthCount;
                        if (i == 0)
                        {
                            footerRow = tempRow;
                        }
                        ws1.Column(tempCol).Width = 30;
                    }
                }
                _row = 13+outputData.ColumnList.Count;
                _col = outputData.RowList.Count+1;
                for(int i = 0; i < outputData.DataRowCount; i++)
                {
                    for (int j = 0; j < outputData.DataColumnCount; j++)
                    {
                        r1 = ws1.Cells[_row+i, _col+j];
                        ws1.Cells[_row + i, _col + j].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                        ws1.Cells[_row + i, _col + j].Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;
                        r1.RichText.Clear();
                        r1.Style.Fill.PatternType = ExcelFillStyle.Solid;
                        ws1.Cells[_row + i, _col + j].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                       
                        var format = new String('0', 1);
                        if (!string.IsNullOrEmpty(format))
                            format = "." + format;
                        if (outputData.Data[i * outputData.DataColumnCount + j].Contains("%"))
                        {
                            r1.Style.Numberformat.Format = "0" + format + "\\%";

                        }
                        else if (outputData.Data[i * outputData.DataColumnCount + j].Contains("pp"))
                        {
                            r1.Style.Numberformat.Format = "#,##0" + format + "\\pp";
                        }
                        else
                        {
                            r1.Style.Numberformat.Format = "#,##0" + format;
                        }
                        if (i % 2 == 0)
                        {
                            r1.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(203, 210, 214));
                        }
                        else
                        {
                            r1.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(237, 241, 242));
                        }
                        if (outputData.Data[i * outputData.DataColumnCount + j] == "" || outputData.SampleSize[i * outputData.DataColumnCount + j] == null)
                        {
                            //r1.Value = outputData.Data[i * outputData.DataColumnCount + j];
                            r1.Value = "NA";
                            r1.Style.Font.Color.SetColor(Color.Black);
                        }
                        else
                        {
                            double metricSampleSize;
                            var sampleSize = outputData.SampleSize[i * outputData.DataColumnCount + j];
                            double.TryParse(Convert.ToString(sampleSize), out metricSampleSize);
                            if (metricSampleSize >= Constants.SampleSize_Value)
                            {
                                if (outputData.Data[i * outputData.DataColumnCount + j].Contains("%"))
                                {
                                    var temp = outputData.Data[i * outputData.DataColumnCount + j].IndexOf('%');
                                    string val = outputData.Data[i * outputData.DataColumnCount + j].Remove(temp);
                                    double OutVal;
                                    double.TryParse(val, out OutVal);
                                    r1.Value = OutVal;
                                }
                                else if (outputData.Data[i * outputData.DataColumnCount + j].Contains("pp"))
                                {
                                    r1.Value = outputData.Data[i * outputData.DataColumnCount + j];
                                }
                                else
                                {
                                    string val = outputData.Data[i * outputData.DataColumnCount + j];
                                    double OutVal;
                                    double.TryParse(val, out OutVal);
                                    r1.Value = OutVal;
                                }
                               
                                r1.Style.Font.Color.SetColor(Color.Black);
                            }
                            else if (metricSampleSize >= Constants.Low_SampleSize_Value && metricSampleSize < Constants.SampleSize_Value)
                            {
                                if (outputData.Data[i * outputData.DataColumnCount + j].Contains("%"))
                                {
                                    var temp = outputData.Data[i * outputData.DataColumnCount + j].IndexOf('%');
                                    string val = outputData.Data[i * outputData.DataColumnCount + j].Remove(temp);
                                    double OutVal;
                                    double.TryParse(val, out OutVal);
                                    r1.Value = OutVal;
                                }
                                else if (outputData.Data[i * outputData.DataColumnCount + j].Contains("pp"))
                                {
                                    r1.Value = outputData.Data[i * outputData.DataColumnCount + j];
                                }
                                else
                                {
                                    string val = outputData.Data[i * outputData.DataColumnCount + j];
                                    double OutVal;
                                    double.TryParse(val, out OutVal);
                                    r1.Value = OutVal;
                                }



                                r1.Style.Font.Color.SetColor(Color.Gray);
                            }
                            else if (metricSampleSize < Constants.Low_SampleSize_Value)
                            {
                                r1.Value = "*";
                                r1.Style.Font.Color.SetColor(Color.Black);
                            }
                        }
                       
                    }
                }

                _row = footerRow + 2;
                var footerText = Constants.LowSampleSizeFotter;
                var _footerText = footerText.Split('\n');
                _col = 1;
                r1 = ws1.Cells[_row, _col, _row + _footerText.Length, _col + 10];
                r1.Merge = true;
                r1.RichText.Clear();
                r1.Value = footerText;
                r1.Style.Font.Color.SetColor(Color.FromArgb(79, 33, 112));
                r1.Style.WrapText = true;
                r1.Style.Border.BorderAround(ExcelBorderStyle.Dotted, Color.Black);
                r1.Style.HorizontalAlignment = ExcelHorizontalAlignment.Left;
                r1.Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                r1.Style.Font.Bold = false;


                //ws1.Cells.AutoFitColumns();               
                package.Save();
            }
            return (Constants.CrossTabDownloadPath.Replace("~", "..") + tempFolderName + "/" + tempFileName);
        }
        private List<CrossTabOutputRow> tableToList(DataTable tbl)
        {
            var output = new List<CrossTabOutputRow>();
            output = (from r in tbl.AsEnumerable()
                      select new CrossTabOutputRow()
                      {
                          RowName = tbl.Columns.Contains("RowName") ? Convert.ToString(r["RowName"]) : null,
                          ColumnName = tbl.Columns.Contains("ColumnName") ? Convert.ToString(r["ColumnName"]) : null,
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
        public string GetSelectionText(CrossTabViewRequest request)
        {
            string output = string.Empty;
            output += "Column : " + request.ColumnName + "||";
            output += "Row : " + (request.RowName) + "||";
            output += "Market : " + (request.MarketName.Split('|').Length > 1 ? "Multiple Market" : request.MarketName) + "||";
            output += "Category : " + (request.CategoryName.Split('|').Length > 1 ? "Multiple Category's" : request.CategoryName) + "||";
            output += "Time Period : " + (request.TimePeriodId.Split('|').Length > 1 ? request.TimePeriodName + " Time Periods" : request.TimePeriodName)  + "||";
            output += "Brand/s : " + (request.BrandName.Split('|').Length > 1 ? "Multiple Brands" : string.IsNullOrEmpty(request.BrandName) ? "Total" :request.BrandName) + "||";
            output += "Segment : " + (string.IsNullOrEmpty(request.Segment1Name) ? "Total " :(request.Segment1Name)) + (string.IsNullOrEmpty(request.Segment2Name) ? " | Total" : (" | " + request.Segment2Name)) + "||";
            output += "KPI : " + (request.KpiName.Split('|').Length > 1 ? "Multiple KPI" : request.KpiName) + "||";
            output += (request.isChannel ? "Channel/Retailer : " : "Demographics : ") + (request.isChannel ? (string.IsNullOrEmpty(request.ChannelName) ? "Total Channel":request.ChannelName.Split('|').Length > 1 ? "Multiple Channel/Retailer" : request.ChannelName) : (string.IsNullOrEmpty(request.DemographicName) ? "Total Demographics" : request.DemographicName.Split('|').Length > 1 ? "Multiple Demographics" : request.DemographicName));
            return output;
        }
        public string  getColumn(string compareId)
        {
            string cName = "";
            if (compareId == "1")   //Markets
                cName = "MarketName";
            else if (compareId == "2")  //Brands or Top 15 Brands
                cName = "BrandName";
            else if (compareId == "3")  //Category's
                cName = "CategoryName";
            else if (compareId == "4")  //Channel's
                cName = "ChannelName";
            else if (compareId == "5")  //Demographics
                cName = "DemographicName";
            else if (compareId == "6")
                cName = "TimePeriodName";
            else if (compareId == "7")
                cName = "MetricName";
            else if (compareId == "8")
                cName = "Segment1Name";
            return cName;
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
