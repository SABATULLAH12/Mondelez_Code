using DAL;
using Entites;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web;
using System.IO;
using Aspose.Slides;
using AsposeChart = Aspose.Slides.Charts;
using System.Drawing;
using OfficeOpenXml.Style;
using OfficeOpenXml;
using Newtonsoft.Json;

namespace BAL
{
    public class SnapShot : ISnapShot
    {
        internal readonly IUnitOfWork _unitOfWork;

        string[] colorCodes = new string[] {
            "#724D8D","#EAAB5E","#73A769","#93785F","#C97B7B","#81A8CC","#EDC765"
        };
        string[] AllColorCodes = new string[] {
                        "#E18719", "#287819", "#623E23", "#A52323", "#2D6EAA", "#E6AF23",
            "#724D8D", "#EAAB5E", "#73A769", "#93785F", "#C97B7B", "#81A8CC", "#EDC765", "#858585",
            "#957AA9", "#F3CFA3", "#B4D0AF", "#BEADA0", "#E4BDBD", "#ABC5DD", "#F4DB9C", "#A3A3A3"
        };
        string[] SnapshotSingleColumnColors = new string[]
        {
            "#81A8CC","#EDC765"
        };

        IDictionary<string, string> Widgit7ColorList = new Dictionary<string, string>();
        int Widgit7ColorsUsed = 0;

        public SnapShot(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public int GetUserId(string EmailId)
        {
            int userid = _unitOfWork.GetRepository<ISnapShotRepository>().GetUserId(EmailId);

            return userid;
        }
        public List<object> GetChartOutput(SnapshotRequest request)
        {
            DataSet dSet = _unitOfWork.GetRepository<ISnapShotRepository>().GetChartOutput(request);

            List<ChartData> OutputList = new List<ChartData>();
            List<OrderAndColor> orderAndColor = new List<OrderAndColor>();
            if (dSet.Tables.Count != 0 && request.SnapshotTypeName.Split('-')[1].ToLower() == "multi")
            {
                orderAndColor = GetOrderAndColor(tableToList(dSet.Tables[4]), request);

                OutputList.Add(Widget1(tableToList(dSet.Tables[0]), orderAndColor, request));

                OutputList.Add(Widget2(tableToList(dSet.Tables[1]), orderAndColor, request));

                OutputList.Add(Widget3(tableToList(dSet.Tables[2]), orderAndColor, request));

                OutputList.Add(Widget4(tableToList(dSet.Tables[3]), orderAndColor, request));

                if (request.TimePeriodId == "-1001" || request.TimePeriodId == "-1002" || request.TimePeriodId == "-1003" || request.TimePeriodId == "-1004")
                {
                    OutputList.Add(LTP(tableToList(dSet.Tables[5]), request));
                }
            }
            else if (dSet.Tables.Count != 0 && request.SnapshotTypeName.Split('-')[0].ToLower() != "demographics" && request.SnapshotTypeName.Split('-')[1].ToLower() == "single")
            {
                OutputList.Add(Widget5(tableToList(dSet.Tables[0]), request));

                OutputList.Add(Widget6(tableToList(dSet.Tables[1]), request));

                OutputList.Add(Widget7(tableToList(dSet.Tables[2]), request));

                OutputList.Add(Widget8(tableToList(dSet.Tables[3]), request));

                OutputList.Add(Widget9(tableToList(dSet.Tables[4]), request));

                OutputList.Add(Widget10(tableToList(dSet.Tables[5]), request));

                OutputList.Add(Widget11(tableToList(dSet.Tables[6]), request));
            }
            else if (dSet.Tables.Count != 0 && request.SnapshotTypeName.Split('-')[0].ToLower() == "demographics" && request.SnapshotTypeName.Split('-')[1].ToLower() == "single")
            {

                OutputList.Add(Widget12(tableToList(dSet.Tables[0]), request));

                OutputList.Add(Widget13(tableToList(dSet.Tables[1]), request));

                OutputList.Add(Widget14(tableToList(dSet.Tables[2]), request));
            }
            return OutputList.Cast<object>().ToList();
        }
        private List<OrderAndColor> GetOrderAndColor(List<OutputRow> WidgitOutput, SnapshotRequest request)
        {
            List<OrderAndColor> orderAndColorList = new List<OrderAndColor>();
            List<string> columns = WidgitOutput.Select(r => r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString()).Distinct().ToList();
            for (var i = 0; i < columns.Count; i++)
            {
                OrderAndColor orderAndColor = new OrderAndColor();
                orderAndColor.Name = columns[i];
                orderAndColor.color = colorCodes[i];
                orderAndColor.Order = i;
                orderAndColorList.Add(orderAndColor);
            }
            return orderAndColorList;
        }
        private ChartData Widget1(List<OutputRow> WidgitOutput, List<OrderAndColor> orderAndColor, SnapshotRequest request)
        {
            var Colorlist = new Dictionary<string, string>();
            Colorlist.Add("Penetration Contribution", "#4F2170");
            Colorlist.Add("Population Contribution", "#A52323");
            Colorlist.Add("Frequency Contribution", "#2D6EAA");
            Colorlist.Add("Avg. Price Contribution", "#287819");
            Colorlist.Add("Volume Per Trip Contribution", "#E18719");
            Colorlist.Add("Val. Percent Change", "#666666");
            ChartData response = new ChartData();
            List<string> columns = null;
            List<string> rows = null;
            columns = WidgitOutput.Select(r => r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString()).Distinct().ToList();
            rows = WidgitOutput.Select(r => r.MetricName).Distinct().ToList();
            response.isLowSampleSize = false;
            int i = 0;
            foreach (var row in rows)
            {

                string metrictype = "";
                //Series
                CombinationSeriesData series = new CombinationSeriesData
                {
                    name = row,
                    color = Colorlist[row],
                    yAxis = row == "Val. Percent Change" ? 1 : 0,
                    type = row == "Val. Percent Change" ? "line" : "column",
                    zIndex = row == "Val. Percent Change" ? 1 : 0,
                };

                foreach (var column in columns)
                {

                    CombinationDataPoint pointData = null;
                    IEnumerable<OutputRow> _chartSeriesData = null;
                    _chartSeriesData = WidgitOutput.Where(r => r.MetricName == row && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == column);

                    pointData = _chartSeriesData.Select(x =>
                    {
                        var value = x.MetricVolume == null ? null : (double?)(Math.Round((double)x.MetricVolume, x.RoundBy));
                        var yValue = (x.SampleSize < Constants.Low_SampleSize_Value ? null : value);
                        response.isLowSampleSize = response.isLowSampleSize || x.SampleSize < Constants.SampleSize_Value;
                        if (value != null) metrictype = x.MetricType;
                        return new CombinationDataPoint
                        {
                            y = yValue,
                            Value = response.IsPercentage ? (double?)((decimal?)x.MetricVolume) : x.MetricVolume,
                            SampleSize = x.SampleSize == null ? null : Convert.ToInt32(x.SampleSize) as int?,

                        };
                    }
                     ).FirstOrDefault();
                    series.data.Add(pointData);
                }
                series.tooltip = new CombinationToolTip { valueSuffix = metrictype };
                response.Series.Add(series);
            }
            response.Categories = columns;
            return response;
        }
        private ChartData Widget2(List<OutputRow> WidgitOutput, List<OrderAndColor> orderAndColor, SnapshotRequest request)
        {
            ChartData response = new ChartData();
            List<string> columns = null;
            List<string> rows = null;

            columns = WidgitOutput.Select(r => r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString()).Distinct().ToList();
            rows = WidgitOutput.Select(r => r.MetricName).Distinct().ToList();
            response.isLowSampleSize = false;
            for (var i = 0; i < columns.Count; i++)
            {
                string metrictype = "";
                BubbleSeriesData series = new BubbleSeriesData();
                series.name = columns[i];
                series.legendIndex = orderAndColor.Where(r => r.Name == columns[i]).Select(x => x.Order).FirstOrDefault();
                series.color = orderAndColor.Where(r => r.Name == columns[i]).Select(x => x.color).FirstOrDefault();
                BubbleDataPoint data = new BubbleDataPoint();
                for (var j = 0; j < rows.Count; j++)
                {
                    var value = WidgitOutput.Where(r => r.MetricName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i]).Select(x => x.MetricVolume).FirstOrDefault();
                    var roundBy = WidgitOutput.Where(r => r.MetricName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i]).Select(x => x.RoundBy).FirstOrDefault();
                    value = (value == null ? null : (double?)(Math.Round((decimal)value, roundBy)));
                    data.SampleSize = WidgitOutput.Where(r => r.MetricName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i]).Select(x => x.SampleSize).FirstOrDefault();
                    if (rows[j] == "Penetration")
                    {
                        data.x = (data.SampleSize < Constants.Low_SampleSize_Value ? 0 : value ?? 0);
                    }
                    else if (rows[j] == "Value (000 EUR)" && data.SampleSize > Constants.Low_SampleSize_Value)
                    {
                        data.z = (data.SampleSize < Constants.Low_SampleSize_Value ? null : value);
                        metrictype = WidgitOutput.Where(r => r.MetricName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i]).Select(x => x.MetricType).FirstOrDefault();
                    }
                    else if (rows[j] == "Frequency")
                    {
                        data.y = (data.SampleSize < Constants.Low_SampleSize_Value ? 0 : value ?? 0);
                    }
                    response.isLowSampleSize = response.isLowSampleSize || data.SampleSize < Constants.SampleSize_Value;
                }
                series.tooltip = new CombinationToolTip { valueSuffix = metrictype };
                series.data.Add(data);
                response.Series.Add(series);

            }

            return response;
        }
        private ChartData Widget3(List<OutputRow> WidgitOutput, List<OrderAndColor> orderAndColor, SnapshotRequest request)
        {
            ChartData response = new ChartData();
            List<string> columns = null;
            List<string> rows = null;
            List<string> timePeriods = null;

            columns = WidgitOutput.Select(r => r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString()).Distinct().ToList();
            rows = WidgitOutput.Select(r => r.MetricName).Distinct().ToList();
            timePeriods = WidgitOutput.Select(r => r.TimePeriodName).Distinct().ToList();
            if (timePeriods.Count == 1)
            {
                response.Categories.Add(timePeriods[0]);
                response.Categories.Add(timePeriods[0]);
            }
            else if (timePeriods.Count > 1)
            {
                response.Categories.Add(timePeriods[0]);
                response.Categories.Add(timePeriods[1]);
                response.Categories.Add(timePeriods[0]);
                response.Categories.Add(timePeriods[1]);
            }
            response.isLowSampleSize = false;
            for (var i = 0; i < columns.Count; i++)
            {
                CategoryShareSeriesData series = new CategoryShareSeriesData();
                series.name = columns[i];
                series.legendIndex = orderAndColor.Where(r => r.Name == columns[i]).Select(x => x.Order).FirstOrDefault();
                series.color = orderAndColor.Where(r => r.Name == columns[i]).Select(x => x.color).FirstOrDefault();
                string metrictype = "";
                List<CategoryShareDataPoint> DataList = new List<CategoryShareDataPoint>();
                for (var j = 0; j < rows.Count; j++)
                {
                    for (var k = 0; k < timePeriods.Count; k++)
                    {
                        CategoryShareDataPoint data = new CategoryShareDataPoint();
                        var value = WidgitOutput.Where(r => r.MetricName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i] && r.TimePeriodName == timePeriods[k]).Select(x => x.MetricVolume).FirstOrDefault();
                        var roundBy = WidgitOutput.Where(r => r.MetricName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i] && r.TimePeriodName == timePeriods[k]).Select(x => x.RoundBy).FirstOrDefault();
                        value = (value == null ? null : (double?)(Math.Round((decimal)value, roundBy)));
                        data.SampleSize = WidgitOutput.Where(r => r.MetricName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i] && r.TimePeriodName == timePeriods[k]).Select(x => x.SampleSize).FirstOrDefault();
                        data.y = (data.SampleSize < Constants.Low_SampleSize_Value ? 0 : value ?? 0);
                        response.isLowSampleSize = response.isLowSampleSize || data.SampleSize < Constants.SampleSize_Value;
                        data.name = rows[j];
                        if (value != null) metrictype = WidgitOutput.Where(r => r.MetricName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i] && r.TimePeriodName == timePeriods[k]).Select(x => x.MetricType).FirstOrDefault();
                        DataList.Add(data);
                    }
                }
                series.tooltip = new CombinationToolTip { valueSuffix = metrictype };
                series.data = DataList;
                response.Series.Add(series);
            }

            return response;
        }
        private ChartData Widget4(List<OutputRow> WidgitOutput, List<OrderAndColor> orderAndColor, SnapshotRequest request)
        {
            ChartData response = new ChartData();
            List<string> columns = null;
            List<string> rows = null;
            columns = WidgitOutput.Select(r => r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString()).Distinct().ToList(); ;
            rows = WidgitOutput.Select(r => r.TimePeriodName).Distinct().ToList();
            response.isLowSampleSize = false;
            for (var i = 0; i < columns.Count; i++)
            {
                string metrictype = "";
                TrendSeriesData series = new TrendSeriesData();
                series.name = columns[i];
                series.legendIndex = orderAndColor.Where(r => r.Name == columns[i]).Select(x => x.Order).FirstOrDefault();
                series.color = orderAndColor.Where(r => r.Name == columns[i]).Select(x => x.color).FirstOrDefault();
                List<TrendDataPoint> data = new List<TrendDataPoint>();
                for (var j = 0; j < rows.Count; j++)
                {
                    TrendDataPoint point = new TrendDataPoint();
                    var value = WidgitOutput.Where(r => r.TimePeriodName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i]).Select(x => x.MetricVolume).FirstOrDefault();
                    var roundBy = WidgitOutput.Where(r => r.TimePeriodName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i]).Select(x => x.RoundBy).FirstOrDefault();
                    value = (value == null ? null : (double?)(Math.Round((decimal)value, roundBy)));
                    point.SampleSize = WidgitOutput.Where(r => r.TimePeriodName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i]).Select(x => x.SampleSize).FirstOrDefault();
                    point.y = (point.SampleSize < Constants.Low_SampleSize_Value ? null : value);
                    point.TimePeriodId = WidgitOutput.Where(r => r.TimePeriodName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i]).Select(x => x.TimePeriodId).FirstOrDefault();
                    point.TimePeriodName = WidgitOutput.Where(r => r.TimePeriodName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i]).Select(x => x.TimePeriodName).FirstOrDefault();
                    data.Add(point);
                    response.isLowSampleSize = response.isLowSampleSize || point.SampleSize < Constants.SampleSize_Value;
                    if (value != null) metrictype = WidgitOutput.Where(r => r.TimePeriodName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i]).Select(x => x.MetricType).FirstOrDefault();
                }
                series.tooltip = new CombinationToolTip { valueSuffix = metrictype };
                series.data = data;
                response.Series.Add(series);
            }
            response.Categories = rows;
            return response;
        }
        private ChartData Widget5(List<OutputRow> WidgitOutput, SnapshotRequest request)
        {
            var Colorlist = new Dictionary<string, string>();
            Colorlist.Add("Average Price", "#287819");
            Colorlist.Add("Buyers", "black");
            Colorlist.Add("Frequency", "#2D6EAA");
            Colorlist.Add("Penetration", "#4F2170");
            Colorlist.Add("Spend", "#666666");
            Colorlist.Add("Total Households", "#A52323");
            Colorlist.Add("Volume", "black");
            Colorlist.Add("Volume per Buyer", "black");
            Colorlist.Add("Volume Per trip", "#E18719");
            ChartData response = new ChartData();
            List<string> columns = null;
            List<string> rows = null;

            columns = WidgitOutput.Select(r => r.MetricName).Distinct().ToList();
            rows = WidgitOutput.Select(r => r.MetricValueType).Distinct().ToList();
            for (int i = 0; i < columns.Count; i++)
            {
                TreeSeriesData Series = new TreeSeriesData();
                Series.name = columns[i];
                Series.color = Colorlist[columns[i]];
                for (int j = 0; j < rows.Count; j++)
                {
                    TreeDataPoint data = new TreeDataPoint();
                    data.name = rows[j];
                    var value = WidgitOutput.Where(r => r.MetricValueType == rows[j] && r.MetricName == columns[i]).Select(x => x.MetricVolume).FirstOrDefault();
                    var roundBy = WidgitOutput.Where(r => r.MetricValueType == rows[j] && r.MetricName == columns[i]).Select(x => x.RoundBy).FirstOrDefault();
                    value = (value == null ? null : (double?)(Math.Round((decimal)value, roundBy)));
                    data.suffix = WidgitOutput.Where(r => r.MetricValueType == rows[j] && r.MetricName == columns[i]).Select(x => x.MetricType).FirstOrDefault();
                    data.SampleSize = WidgitOutput.Where(r => r.MetricValueType == rows[j] && r.MetricName == columns[i]).Select(x => x.SampleSize).FirstOrDefault();
                    data.value = (data.SampleSize < Constants.Low_SampleSize_Value ? null : value);
                    Series.data.Add(data);
                }
                response.Series.Add(Series);
            }
            return response;
        }
        private ChartData Widget6(List<OutputRow> WidgitOutput, SnapshotRequest request)
        {
            var Colorlist = new Dictionary<string, string>();
            Colorlist.Add("Penetration Contribution", "#4F2170");
            Colorlist.Add("Population Contribution", "#A52323");
            Colorlist.Add("Frequency Contribution", "#2D6EAA");
            Colorlist.Add("Avg. Price Contribution", "#287819");
            Colorlist.Add("Volume Per Trip Contribution", "#E18719");
            Colorlist.Add("Val. Percent Change", "#666666");
            ChartData response = new ChartData();
            List<string> columns = null;
            List<string> rows = null;
            columns = WidgitOutput.Select(r => r.TimePeriodName).Distinct().ToList();
            rows = WidgitOutput.Select(r => r.MetricName).Distinct().ToList();
            response.isLowSampleSize = false;
            foreach (var row in rows)
            {

                string metrictype = "";
                //Series
                CombinationSeriesData series = new CombinationSeriesData
                {
                    name = row,
                    color = Colorlist[row],
                    yAxis = row == "Val. Percent Change" ? 1 : 0,
                    type = row == "Val. Percent Change" ? "line" : "column",
                    zIndex = row == "Val. Percent Change" ? 1 : 0,
                };

                foreach (var column in columns)
                {

                    CombinationDataPoint pointData = null;
                    IEnumerable<OutputRow> _chartSeriesData = null;
                    _chartSeriesData = WidgitOutput.Where(r => r.MetricName == row && r.TimePeriodName == column);

                    pointData = _chartSeriesData.Select(x =>
                    {
                        var value = x.MetricVolume == null ? null : (double?)(Math.Round((double)x.MetricVolume, x.RoundBy));
                        var yValue = (x.SampleSize < Constants.Low_SampleSize_Value ? null : value);
                        response.isLowSampleSize = response.isLowSampleSize || x.SampleSize < Constants.SampleSize_Value;
                        metrictype = x.MetricType;
                        return new CombinationDataPoint
                        {
                            y = yValue,
                            Value = response.IsPercentage ? (double?)((decimal?)x.MetricVolume) : x.MetricVolume,
                            SampleSize = x.SampleSize == null ? null : Convert.ToInt32(x.SampleSize) as int?,

                        };
                    }
                     ).FirstOrDefault();
                    series.data.Add(pointData);
                }
                series.tooltip = new CombinationToolTip { valueSuffix = metrictype };
                response.Series.Add(series);
            }
            response.Categories = columns;
            return response;
        }
        private ChartData Widget7(List<OutputRow> WidgitOutput, SnapshotRequest request)
        {
            ChartData response = new ChartData();
            List<string> columns = null;
            List<string> rows = null;

            columns = WidgitOutput.Select(r => r.TimePeriodName).Distinct().ToList();
            rows = WidgitOutput.Select(r => r.MetricName).Distinct().ToList();
            response.isLowSampleSize = false;
            for (var i = 0; i < columns.Count; i++)
            {
                string metrictype = "";
                BubbleSeriesData series = new BubbleSeriesData();
                series.name = columns[i];
                series.color = colorCodes[i];
                Widgit7ColorList.Add(columns[i], colorCodes[i]);
                Widgit7ColorsUsed = i + 1;
                BubbleDataPoint data = new BubbleDataPoint();
                for (var j = 0; j < rows.Count; j++)
                {
                    var value = WidgitOutput.Where(r => r.MetricName == rows[j] && r.TimePeriodName == columns[i]).Select(x => x.MetricVolume).FirstOrDefault();
                    var roundBy = WidgitOutput.Where(r => r.MetricName == rows[j] && r.TimePeriodName == columns[i]).Select(x => x.RoundBy).FirstOrDefault();
                    value = (value == null ? null : (double?)(Math.Round((decimal)value, roundBy)));
                    data.SampleSize = WidgitOutput.Where(r => r.MetricName == rows[j] && r.TimePeriodName == columns[i]).Select(x => x.SampleSize).FirstOrDefault();
                    if (rows[j] == "Penetration")
                    {
                        data.x = (data.SampleSize < Constants.Low_SampleSize_Value ? 0 : value ?? 0);
                    }
                    else if (rows[j] == "Value (000 EUR)" && data.SampleSize > Constants.Low_SampleSize_Value)
                    {
                        data.z = (data.SampleSize < Constants.Low_SampleSize_Value ? null : value);
                        metrictype = WidgitOutput.Where(r => r.MetricName == rows[j] && r.TimePeriodName == columns[i]).Select(x => x.MetricType).FirstOrDefault();
                    }
                    else if (rows[j] == "Frequency")
                    {
                        data.y = (data.SampleSize < Constants.Low_SampleSize_Value ? 0 : value ?? 0);
                    }
                    response.isLowSampleSize = response.isLowSampleSize || data.SampleSize < Constants.SampleSize_Value;
                }
                series.tooltip = new CombinationToolTip { valueSuffix = metrictype };
                series.data.Add(data);
                response.Series.Add(series);
            }
            return response;
        }
        private ChartData Widget8(List<OutputRow> WidgitOutput, SnapshotRequest request)
        {
            ChartData response = new ChartData();
            List<string> columns = null;
            List<string> rows = null;
            columns = WidgitOutput.Select(r => r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString()).Distinct().ToList();
            rows = WidgitOutput.Select(r => r.TimePeriodName).Distinct().ToList();
            response.Categories = rows;
            response.isLowSampleSize = false;
            for (var i = 0; i < columns.Count; i++)
            {
                int ColorFrom = Widgit7ColorsUsed;
                ColumnBubbleTopSeriesData series = new ColumnBubbleTopSeriesData();
                series.name = columns[i];
                string metrictype = "";
                List<ColumnBubbleTopDataPoint> DataList = new List<ColumnBubbleTopDataPoint>();
                for (var j = 0; j < rows.Count; j++)
                {
                    ColumnBubbleTopDataPoint data = new ColumnBubbleTopDataPoint();
                    var value = WidgitOutput.Where(r => r.TimePeriodName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i]).Select(x => x.MetricVolume).FirstOrDefault();
                    var roundBy = WidgitOutput.Where(r => r.TimePeriodName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i]).Select(x => x.RoundBy).FirstOrDefault();
                    value = (value == null ? null : (double?)(Math.Round((decimal)value, roundBy)));
                    data.SampleSize = WidgitOutput.Where(r => r.TimePeriodName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i]).Select(x => x.SampleSize).FirstOrDefault();
                    data.y = (data.SampleSize < Constants.Low_SampleSize_Value ? 0 : value ?? 0);
                    response.isLowSampleSize = response.isLowSampleSize || data.SampleSize < Constants.SampleSize_Value;
                    data.name = rows[j];
                    if (Widgit7ColorList.ContainsKey(rows[j]))
                    {
                        data.color = Widgit7ColorList[rows[j]];
                    }
                    else
                    {
                        data.color = colorCodes[ColorFrom++];
                    }
                    metrictype = WidgitOutput.Where(r => r.TimePeriodName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i]).Select(x => x.MetricType).FirstOrDefault();
                    DataList.Add(data);
                }
                series.tooltip = new CombinationToolTip { valueSuffix = metrictype };
                series.data = DataList;
                response.Series.Add(series);
            }
            return response;
        }
        private ChartData Widget9(List<OutputRow> WidgitOutput, SnapshotRequest request)
        {
            ChartData response = new ChartData();
            List<string> columns = null;
            List<string> rows = null;

            columns = WidgitOutput.Select(r => r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString()).Distinct().ToList();
            rows = WidgitOutput.Select(r => r.TimePeriodName).Distinct().ToList();
            response.Categories = rows;
            response.isLowSampleSize = false;
            for (var i = 0; i < columns.Count; i++)
            {
                int ColorFrom = Widgit7ColorsUsed;
                ColumnBubbleTopSeriesData series = new ColumnBubbleTopSeriesData();
                series.name = columns[i];
                string metrictype = "";
                List<ColumnBubbleTopDataPoint> DataList = new List<ColumnBubbleTopDataPoint>();
                for (var j = 0; j < rows.Count; j++)
                {
                    ColumnBubbleTopDataPoint data = new ColumnBubbleTopDataPoint();
                    var value = WidgitOutput.Where(r => r.TimePeriodName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i]).Select(x => x.MetricVolume).FirstOrDefault();
                    var roundBy = WidgitOutput.Where(r => r.TimePeriodName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i]).Select(x => x.RoundBy).FirstOrDefault();
                    value = (value == null ? null : (double?)(Math.Round((decimal)value, roundBy)));
                    data.SampleSize = WidgitOutput.Where(r => r.TimePeriodName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i]).Select(x => x.SampleSize).FirstOrDefault();
                    data.y = (data.SampleSize < Constants.Low_SampleSize_Value ? 0 : value ?? 0);
                    response.isLowSampleSize = response.isLowSampleSize || data.SampleSize < Constants.SampleSize_Value;
                    data.name = rows[j];
                    if (Widgit7ColorList.ContainsKey(rows[j]))
                    {
                        data.color = Widgit7ColorList[rows[j]];
                    }
                    else
                    {
                        data.color = colorCodes[ColorFrom++];
                    }
                    if (value != null) metrictype = WidgitOutput.Where(r => r.TimePeriodName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i]).Select(x => x.MetricType).FirstOrDefault();
                    DataList.Add(data);
                }
                series.tooltip = new CombinationToolTip { valueSuffix = metrictype };
                series.data = DataList;
                response.Series.Add(series);
            }
            return response;
        }
        private ChartData Widget10(List<OutputRow> WidgitOutput, SnapshotRequest request)
        {
            ChartData response = new ChartData();
            List<string> columns = null;
            List<string> rows = null;

            columns = WidgitOutput.Select(r => r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString()).Distinct().ToList();
            rows = WidgitOutput.Select(r => r.TimePeriodName).Distinct().ToList();
            response.Categories = rows;
            response.isLowSampleSize = false;
            for (var i = 0; i < columns.Count; i++)
            {
                int ColorFrom = Widgit7ColorsUsed;
                ColumnBubbleTopSeriesData series = new ColumnBubbleTopSeriesData();
                series.name = columns[i];
                string metrictype = "";
                List<ColumnBubbleTopDataPoint> DataList = new List<ColumnBubbleTopDataPoint>();
                for (var j = 0; j < rows.Count; j++)
                {
                    ColumnBubbleTopDataPoint data = new ColumnBubbleTopDataPoint();
                    var value = WidgitOutput.Where(r => r.TimePeriodName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i]).Select(x => x.MetricVolume).FirstOrDefault();
                    var roundBy = WidgitOutput.Where(r => r.TimePeriodName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i]).Select(x => x.RoundBy).FirstOrDefault();
                    value = (value == null ? null : (double?)(Math.Round((decimal)value, roundBy)));
                    data.SampleSize = WidgitOutput.Where(r => r.TimePeriodName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i]).Select(x => x.SampleSize).FirstOrDefault();
                    data.y = (data.SampleSize < Constants.Low_SampleSize_Value ? 0 : value ?? 0);
                    response.isLowSampleSize = response.isLowSampleSize || data.SampleSize < Constants.SampleSize_Value;
                    data.name = rows[j];
                    if (Widgit7ColorList.ContainsKey(rows[j]))
                    {
                        data.color = Widgit7ColorList[rows[j]];
                    }
                    else
                    {
                        data.color = colorCodes[ColorFrom++];
                    }
                    if (value != null) metrictype = WidgitOutput.Where(r => r.TimePeriodName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i]).Select(x => x.MetricType).FirstOrDefault();
                    DataList.Add(data);
                }
                series.tooltip = new CombinationToolTip { valueSuffix = metrictype };
                series.data = DataList;
                response.Series.Add(series);
            }
            return response;
        }
        private ChartData Widget11(List<OutputRow> WidgitOutput, SnapshotRequest request)
        {
            ChartData response = new ChartData();
            List<string> columns = null;
            List<string> rows = null;

            columns = WidgitOutput.Select(r => r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString()).Distinct().ToList();
            rows = WidgitOutput.Select(r => r.TimePeriodName).Distinct().ToList();
            response.Categories = rows;
            response.isLowSampleSize = false;
            for (var i = 0; i < columns.Count; i++)
            {
                int ColorFrom = Widgit7ColorsUsed;
                ColumnBubbleTopSeriesData series = new ColumnBubbleTopSeriesData();
                series.name = columns[i];
                string metrictype = "";
                List<ColumnBubbleTopDataPoint> DataList = new List<ColumnBubbleTopDataPoint>();
                for (var j = 0; j < rows.Count; j++)
                {
                    ColumnBubbleTopDataPoint data = new ColumnBubbleTopDataPoint();
                    var value = WidgitOutput.Where(r => r.TimePeriodName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i]).Select(x => x.MetricVolume).FirstOrDefault();
                    var roundBy = WidgitOutput.Where(r => r.TimePeriodName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i]).Select(x => x.RoundBy).FirstOrDefault();
                    value = (value == null ? null : (double?)(Math.Round((decimal)value, roundBy)));
                    data.SampleSize = WidgitOutput.Where(r => r.TimePeriodName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i]).Select(x => x.SampleSize).FirstOrDefault();
                    data.y = (data.SampleSize < Constants.Low_SampleSize_Value ? 0 : value ?? 0);
                    response.isLowSampleSize = response.isLowSampleSize || data.SampleSize < Constants.SampleSize_Value;
                    data.name = rows[j];
                    if (Widgit7ColorList.ContainsKey(rows[j]))
                    {
                        data.color = Widgit7ColorList[rows[j]];
                    }
                    else
                    {
                        data.color = colorCodes[ColorFrom++];
                    }
                    if (value != null) metrictype = WidgitOutput.Where(r => r.TimePeriodName == rows[j] && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columns[i]).Select(x => x.MetricType).FirstOrDefault();
                    DataList.Add(data);
                }
                series.tooltip = new CombinationToolTip { valueSuffix = metrictype };
                series.data = DataList;
                response.Series.Add(series);
            }
            return response;
        }
        private ChartData Widget12(List<OutputRow> WidgitOutput, SnapshotRequest request)
        {
            ChartData response = new ChartData();
            List<string> columns = null;
            List<string> rows = null;

            columns = WidgitOutput.Select(r => r.ChannelName).Distinct().ToList();
            rows = WidgitOutput.Select(r => r.TimePeriodName).Distinct().ToList();
            response.isLowSampleSize = false;
            for (var i = 0; i < columns.Count; i++)
            {
                string metrictype = "";
                TrendSeriesData series = new TrendSeriesData();
                series.name = columns[i];
                series.color = AllColorCodes[(i) % AllColorCodes.Count()];
                List<TrendDataPoint> data = new List<TrendDataPoint>();
                for (var j = 0; j < rows.Count; j++)
                {
                    TrendDataPoint point = new TrendDataPoint();
                    var value = WidgitOutput.Where(r => r.TimePeriodName == rows[j] && r.ChannelName == columns[i]).Select(x => x.MetricVolume).FirstOrDefault();
                    var roundBy = WidgitOutput.Where(r => r.TimePeriodName == rows[j] && r.ChannelName == columns[i]).Select(x => x.RoundBy).FirstOrDefault();
                    value = (value == null ? null : (double?)(Math.Round((decimal)value, roundBy)));
                    point.SampleSize = WidgitOutput.Where(r => r.TimePeriodName == rows[j] && r.ChannelName == columns[i]).Select(x => x.SampleSize).FirstOrDefault();
                    point.y = (point.SampleSize < Constants.Low_SampleSize_Value ? null : value);
                    point.TimePeriodId = WidgitOutput.Where(r => r.TimePeriodName == rows[j] && r.ChannelName == columns[i]).Select(x => x.TimePeriodId).FirstOrDefault();
                    point.TimePeriodName = WidgitOutput.Where(r => r.TimePeriodName == rows[j] && r.ChannelName == columns[i]).Select(x => x.TimePeriodName).FirstOrDefault();
                    data.Add(point);
                    response.isLowSampleSize = response.isLowSampleSize || point.SampleSize < Constants.SampleSize_Value;
                    if (value != null) metrictype = WidgitOutput.Where(r => r.TimePeriodName == rows[j] && r.ChannelName == columns[i]).Select(x => x.MetricType).FirstOrDefault();
                }
                series.tooltip = new CombinationToolTip { valueSuffix = metrictype };
                series.data = data;
                response.Series.Add(series);
            }
            response.Categories = rows;
            return response;
        }
        private ChartData Widget13(List<OutputRow> WidgitOutput, SnapshotRequest request)
        {
            var Colorlist = new Dictionary<string, string>();
            Colorlist.Add("Val. Percent Change", "#666666");
            Colorlist.Add("Val. Actual Change", "#4F2170");
            ChartData response = new ChartData();
            List<string> columns = null;
            List<string> rows = null;
            columns = WidgitOutput.Select(r => r.ChannelName).Distinct().ToList();
            rows = WidgitOutput.Select(r => r.MetricName).Distinct().ToList();
            response.isLowSampleSize = false;
            int i = 0;
            foreach (var row in rows)
            {

                string metrictype = "";
                //Series
                CombinationSeriesData series = new CombinationSeriesData
                {
                    name = row,
                    color = Colorlist[row],
                    yAxis = row == "Val. Percent Change" ? 1 : 0,
                    type = row == "Val. Percent Change" ? "line" : "column",
                    zIndex = row == "Val. Percent Change" ? 1 : 0,
                };

                foreach (var column in columns)
                {

                    CombinationDataPoint pointData = null;
                    IEnumerable<OutputRow> _chartSeriesData = null;
                    _chartSeriesData = WidgitOutput.Where(r => r.MetricName == row && r.ChannelName == column);

                    pointData = _chartSeriesData.Select(x =>
                    {
                        var value = x.MetricVolume == null ? null : (double?)(Math.Round((double)x.MetricVolume, x.RoundBy));
                        var yValue = (x.SampleSize < Constants.Low_SampleSize_Value ? null : value);
                        response.isLowSampleSize = response.isLowSampleSize || x.SampleSize < Constants.SampleSize_Value;
                        if (value != null) metrictype = x.MetricType;
                        return new CombinationDataPoint
                        {
                            y = yValue,
                            Value = response.IsPercentage ? (double?)((decimal?)x.MetricVolume) : x.MetricVolume,
                            SampleSize = x.SampleSize == null ? null : Convert.ToInt32(x.SampleSize) as int?,

                        };
                    }
                     ).FirstOrDefault();
                    series.data.Add(pointData);
                }
                series.tooltip = new CombinationToolTip { valueSuffix = metrictype };
                response.Series.Add(series);
            }
            response.Categories = columns;
            return response;
        }
        private ChartData Widget14(List<OutputRow> WidgitOutput, SnapshotRequest request)
        {
            ChartData response = new ChartData();
            List<string> columns = null;
            List<string> rows = null;
            columns = WidgitOutput.Select(r => r.BrandName).Distinct().ToList();
            rows = WidgitOutput.Select(r => r.ChannelName).Distinct().ToList();
            response.isLowSampleSize = false;
            int i = 0;
            foreach (var row in rows)
            {

                string metrictype = "";
                //Series
                CombinationSeriesData series = new CombinationSeriesData
                {
                    name = row,
                    color = AllColorCodes[i],
                    yAxis = 0,
                    type = "column",
                    zIndex = 0,
                };
                i = (i + 1) % AllColorCodes.Count();
                foreach (var column in columns)
                {

                    CombinationDataPoint pointData = null;
                    IEnumerable<OutputRow> _chartSeriesData = null;
                    _chartSeriesData = WidgitOutput.Where(r => r.ChannelName == row && r.BrandName == column);

                    pointData = _chartSeriesData.Select(x =>
                    {
                        var value = x.MetricVolume == null ? null : (double?)(Math.Round((double)x.MetricVolume, x.RoundBy));
                        var yValue = (x.SampleSize < Constants.Low_SampleSize_Value ? null : value);
                        response.isLowSampleSize = response.isLowSampleSize || x.SampleSize < Constants.SampleSize_Value;
                        if (value != null) metrictype = x.MetricType;
                        return new CombinationDataPoint
                        {
                            y = yValue,
                            Value = response.IsPercentage ? (double?)((decimal?)x.MetricVolume) : x.MetricVolume,
                            SampleSize = x.SampleSize == null ? null : Convert.ToInt32(x.SampleSize) as int?,

                        };
                    }
                     ).FirstOrDefault();
                    series.data.Add(pointData);
                }
                series.tooltip = new CombinationToolTip { valueSuffix = metrictype };
                response.Series.Add(series);
            }
            response.Categories = columns;
            return response;
        }
        private ChartData LTP(List<OutputRow> WidgitOutput, SnapshotRequest request)
        {
            ChartData response = new ChartData();
            foreach (var x in WidgitOutput)
            {
                response.Series.Add(new LTAData
                {
                    market = x.MarketName.ToString(),
                    category = x.CategoryName.ToString(),
                    LTA = x.TimePeriodName.ToString(),
                    yearAgo = x.BrandName.ToString()
                });
            }
            return response;
        }
        public string ExportPPTExcel(SnapshotRequest request)
        {
            string fileName = string.Empty;
            Log.LogMessage("ExportPPTExcel snapshot" + JsonConvert.SerializeObject(request));
            var templatePath = GetTemplatePath(request);

            if (request.ExportsType.ToLower().Equals(Constants.PPT_Text))
            {
                if (request.SnapshotTypeName.ToLower() == "category-multi" && (request.TimePeriodId == "-1001" || request.TimePeriodId == "-1002" || request.TimePeriodId == "-1003" || request.TimePeriodId == "-1004"))
                {
                    var response = GetOnlyLTADataForExports(request);
                    fileName = GenerateSnapshotPPT(request, response, templatePath);
                }
                else
                {
                    fileName = GenerateSnapshotPPT(request, null, templatePath);
                }
            }
            else if (request.ExportsType.ToLower().Equals(Constants.Excel_Text))
            {
                var response = GetDataForExports(request);
                fileName = GenerateSnapshotExcel(request, response, templatePath);
            }
            return fileName;
        }
        public string GetTemplatePath(SnapshotRequest request)
        {
            string tempPath = string.Empty;

            if (request.ExportsType == Constants.PPT_Text)
            {
                tempPath = Constants.Snapshot_PPT_Template;
            }

            else if (request.ExportsType == Constants.Excel_Text)
            {
                if (request.SnapshotTypeName.Contains(Constants.Snapshot_Demog_Text))
                {
                    tempPath = Constants.Snapshot_Demog_Single_Excel_Template;
                }
                else if (request.SnapshotTypeName.Contains(Constants.Snapshot_Single_Text))
                {
                    tempPath = Constants.Snapshot_Single_Excel_Template;
                }
                else if (request.SnapshotTypeName.Contains(Constants.Snapshot_Multi_Text))
                {
                    tempPath = Constants.Snapshot_Multi_Excel_Template;
                }
            }
            return tempPath;
        }
        public string GenerateSnapshotPPT(SnapshotRequest request, SnapShotExportResponse response, string templatePath)
        {
            string pptTemplate = HttpContext.Current.Server.MapPath(templatePath);
            Aspose.Slides.License license = new Aspose.Slides.License();
            license.SetLicense(HttpContext.Current.Server.MapPath("~/Aspose.Slides.lic"));
            Aspose.Slides.Presentation pres = new Aspose.Slides.Presentation(pptTemplate);

            ISlideCollection slds = pres.Slides;
            ISlide sld = slds[0];

            Shape shp = (Shape)sld.Shapes.FirstOrDefault(x => x.Name == "Screenshot");

            //((IAutoShape)sld.Shapes.FirstOrDefault(x => x.Name == "chart_header")).TextFrame.Text = request.ChartTitle;

            if (!string.IsNullOrEmpty(request.SlidePath))
            {
                System.Drawing.Image img = Image.FromFile(request.SlidePath);
                ReplaceImage(pres, sld, "Screenshot", img);
            }
            else
            {
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
            }

            ICommentAuthor author = pres.CommentAuthors.AddAuthor("Mondelez", "M");
            //Position of comments
            PointF point = new PointF();
            point.X = 4;
            point.Y = 90;
            string selectionText = GetSelectionText(request);
            author.Comments.AddComment(selectionText.Replace("||", "\n"), sld, point, DateTime.Now);
            //UpdateSelectionText(request, sld, "selectionText");
            if (request.SnapshotTypeName.ToLower() == "category-multi" && (request.TimePeriodId == "-1001" || request.TimePeriodId == "-1002" || request.TimePeriodId == "-1003" || request.TimePeriodId == "-1004"))
            {
                var CText = "Latest Time Period Mappings\nMarket -> Category -> Latest Time Period -> Year Ago\n";
                for (var i = 0; i < response.LatestTimePeriod.Count(); i++)
                {
                    CText += response.LatestTimePeriod[i].MarketName + " -> " +
                        response.LatestTimePeriod[i].CategoryName + " -> " +
                         (response.LatestTimePeriod[i].TimePeriodName == string.Empty ? "NA" : request.TimePeriodName.Split('-')[0] + "- " + response.LatestTimePeriod[i].TimePeriodName) + " -> " +
                         (response.LatestTimePeriod[i].BrandName == string.Empty ? "NA" : request.TimePeriodName.Split('-')[0] + "- " + response.LatestTimePeriod[i].BrandName) + "\n";
                }
                author.Comments.AddComment(CText, sld, point, DateTime.Now);

            }
            //FooterText
            if (request.FooterText.Trim().Length > 0)
            {
                sld.AddNotesSlide().NotesTextFrame.Paragraphs[0].Portions[0].Text = request.FooterText;
            }


            string tempFolderName = GenerateRandomString(15);
            string tempFileName = "Mondelez_Snapshot(" + System.DateTime.Now.ToString("MM-dd-yyyy") + "_" + System.DateTime.Now.ToString("HH-mm-ss") + ").pptx";
            if (Directory.Exists(System.Web.HttpContext.Current.Server.MapPath(Constants.SnapshotDownloadPath + tempFolderName)))
                Directory.Delete(System.Web.HttpContext.Current.Server.MapPath(Constants.SnapshotDownloadPath + tempFolderName), true);
            Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath(Constants.SnapshotDownloadPath + tempFolderName));
            string tempFilePath = System.Web.HttpContext.Current.Server.MapPath(Constants.SnapshotDownloadPath + tempFolderName + "/" + tempFileName);
            pres.Save(tempFilePath, Aspose.Slides.Export.SaveFormat.Pptx);
            return (Constants.SnapshotDownloadPath.Replace("~", "..") + tempFolderName + "/" + tempFileName);
        }
        public Presentation StoryBoardPPT(SnapshotRequest request, Presentation pres)
        {
            ISlideCollection slds = pres.Slides;
            ISlide sld = slds[0];
            ICommentAuthor author = pres.CommentAuthors.FindByName("Mondelez").FirstOrDefault();

            Shape shp = (Shape)sld.Shapes.FirstOrDefault(x => x.Name == "Screenshot");

            //((IAutoShape)sld.Shapes.FirstOrDefault(x => x.Name == "chart_header")).TextFrame.Text = request.ChartTitle;

            if (!string.IsNullOrEmpty(request.SlidePath))
            {
                System.Drawing.Image img = Image.FromFile(request.SlidePath);
                ReplaceImage(pres, sld, "Screenshot", img);
            }

            if (author != null)
            {
                try
                {
                    author.Comments.RemoveAt(0);
                    author.Comments.RemoveAt(0);
                }
                catch (Exception ex)
                {

                }
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
            if (request.SnapshotTypeName.ToLower() == "category-multi" && (request.TimePeriodId == "-1001" || request.TimePeriodId == "-1002" || request.TimePeriodId == "-1003" || request.TimePeriodId == "-1004"))
            {
                var response = GetOnlyLTADataForExports(request);
                var CText = "Latest Time Period Mappings\nMarket -> Category -> Latest Time Period -> Year Ago\n";
                for (var i = 0; i < response.LatestTimePeriod.Count(); i++)
                {
                    CText += response.LatestTimePeriod[i].MarketName + " -> " +
                        response.LatestTimePeriod[i].CategoryName + " -> " +
                         (response.LatestTimePeriod[i].TimePeriodName == string.Empty ? "NA" : request.TimePeriodName.Split('-')[0] + "- " + response.LatestTimePeriod[i].TimePeriodName) + " -> " +
                         (response.LatestTimePeriod[i].BrandName == string.Empty ? "NA" : request.TimePeriodName.Split('-')[0] + "- " + response.LatestTimePeriod[i].BrandName) + "\n";
                }
                author.Comments.AddComment(CText, sld, point, DateTime.Now);

            }
            //FooterText
            if (sld.NotesSlide != null)
            {
                sld.NotesSlide.NotesTextFrame.Paragraphs[0].Portions[0].Text = "";
            }
            if (request.FooterText.Trim().Length > 0)
            {
                sld.AddNotesSlide().NotesTextFrame.Paragraphs[0].Portions[0].Text = request.FooterText;
            }

            return pres;
        }
        public string GenerateSnapshotExcel(SnapshotRequest request, SnapShotExportResponse response, string templatePath)
        {
            string tempFolderName = GenerateRandomString(15);
            string tempFileName = "Mondelez_Snapshot(" + System.DateTime.Now.ToString("MM-dd-yyyy") + "_" + System.DateTime.Now.ToString("HH-mm-ss") + ").xlsx";
            templatePath = HttpContext.Current.Server.MapPath(templatePath);
            if (Directory.Exists(System.Web.HttpContext.Current.Server.MapPath(Constants.SnapshotDownloadPath + tempFolderName)))
                Directory.Delete(System.Web.HttpContext.Current.Server.MapPath(Constants.SnapshotDownloadPath + tempFolderName), true);
            Directory.CreateDirectory(System.Web.HttpContext.Current.Server.MapPath(Constants.SnapshotDownloadPath + tempFolderName));
            string tempFilePath = System.Web.HttpContext.Current.Server.MapPath(Constants.SnapshotDownloadPath + tempFolderName + "/" + tempFileName);

            File.Copy(templatePath, tempFilePath);
            var file = new FileInfo(tempFilePath);

            try
            {
                for (var i = 0; i < request.WidgetIds.Length; i++)
                {
                    int _row = 0, _col = 0; int _footerRow = 0;
                    using (ExcelPackage package = new ExcelPackage(file))
                    {
                        ExcelWorksheet ws1 = package.Workbook.Worksheets[request.WidgetIds[i]];
                        var ExcelSheetName = "";
                        if (request.WidgetIds.Length > 1)
                        {
                            ExcelSheetName = request.SheetNames[request.WidgetIds[i] - 1];
                        }
                        else
                        {
                            ExcelSheetName = request.SheetNames[0];
                        }
                        ws1.Name = ExcelSheetName;
                        ws1.Name = ws1.Name.Trim();
                        var selectionText = GetSelectionText(request);
                        var selectionNames = selectionText.Split(new String[] { "||" }, StringSplitOptions.None);
                        List<string> columns = GetHeaderColumns(request, response, ExcelSheetName);
                        List<string> rows = GetRows(request, response, ExcelSheetName);
                        List<string> deleteSheets = new List<string>();

                        #region Selection Summary Title
                        //_row = 1;
                        //_col = 1;
                        //var r1 = ws1.Cells[_row, _col];
                        //ws1.Row(_row).Height = 18.75;
                        //ws1.Cells[_row, _col, _row, _col + 14].Merge = true;
                        //ws1.Cells[_row, _col, _row, _col + 14].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                        //ws1.Cells[_row, _col, _row, _col + 14].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                        //r1.RichText.Clear();
                        //r1.RichText.Add("SELECTION SUMMARY").Color = Color.FromArgb(79, 33, 112);
                        //r1.Style.Fill.PatternType = ExcelFillStyle.Solid;
                        //r1.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(255, 135, 25));
                        //r1.Style.Font.Bold = true;
                        //r1.Style.Font.Size = 14;
                        //r1.Style.Font.Name = "Calibri";
                        //r1.Style.Font.Color.SetColor(Color.White);
                        #endregion

                        #region Selection Summary
                        _row = 2;
                        _col = 1;
                        var r1 = ws1.Cells[_row, _col];
                        //ws1.Column(_col).Width = 37.14;
                        for (int j = 0; j < selectionNames.Length; j++)
                        {
                            r1 = ws1.Cells[_row, _col];
                            r1.RichText.Clear();
                            r1.RichText.Add(selectionNames[j]).Color = Color.FromArgb(79, 33, 112);
                            r1.Style.Font.Bold = true;
                            _row = _row + 1;
                        }
                        #endregion

                        #region Table Title
                        _row = request.SnapshotTypeName.Contains(Constants.Snapshot_Demog_Text) ? 11 : 10;
                        _col = 1;
                        r1 = ws1.Cells[_row, _col];
                        r1.RichText.Clear();
                        r1.Style.Fill.PatternType = ExcelFillStyle.Solid;
                        r1.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(203, 210, 214));
                        ws1.Cells[_row, _col].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                        r1.RichText.Add(request.ChartTitles[i].ToUpper()).Color = Color.Black;
                        r1.Style.Font.Size = 12;
                        r1.Style.Font.Name = "Calibri";
                        ws1.Row(_row).Height = 20.25;
                        if (ws1.Name.Contains(Constants.Trend_Text) || (ws1.Name.Contains(Constants.Value_Text) && ws1.Name.Contains(Constants.Snapshot_Demog_Text)))
                        {
                            _col = _col + 1;
                            r1 = ws1.Cells[_row, _col];
                            r1.RichText.Clear();
                            if (columns.Count > 1)
                                ws1.Cells[_row, _col, _row, _col + columns.Count - 1].Merge = true;
                            ws1.Cells[_row, _col, _row, _col + columns.Count - 1].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                            ws1.Cells[_row, _col, _row, _col + columns.Count - 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                            ws1.Cells[_row, _col, _row, _col + columns.Count - 1].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                            r1.Style.Font.Bold = false;
                            r1.Style.Font.Size = 12;
                            r1.Style.Font.Name = "Calibri";
                            r1.RichText.Add(ws1.Name.Contains(Constants.Trend_Text) == true ? Constants.Snapshot_Excel_Title_Penetration_Text : Constants.Snapshot_Excel_Title_Euros_Text).Color = Color.Black;
                            r1.Style.WrapText = false;
                            r1.AutoFitColumns();
                        }
                        #endregion

                        #region LatestTimePeriodTable
                        if (request.SnapshotTypeName.ToLower() == "category-multi" && (request.TimePeriodId == "-1001" || request.TimePeriodId == "-1002" || request.TimePeriodId == "-1003" || request.TimePeriodId == "-1004"))
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

                            r = ws1.Cells[_row + 3, _col];
                            r.RichText.Add("Year Ago").Color = Color.FromArgb(79, 33, 112);
                            r.Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                            r.Style.Fill.PatternType = ExcelFillStyle.Solid;
                            r.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(237, 241, 242));
                            r.Style.Font.Bold = true;
                            r.Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;

                            for (int j = 0; j < response.LatestTimePeriod.Count; j++)
                            {
                                _col++;

                                r = ws1.Cells[_row, _col];
                                r.RichText.Add(response.LatestTimePeriod[j].MarketName);
                                r.Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                                r.Style.Fill.PatternType = ExcelFillStyle.Solid;
                                r.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(203, 210, 214));
                                r = ws1.Cells[_row + 1, _col];
                                r.RichText.Add(response.LatestTimePeriod[j].CategoryName);
                                r.Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                                r.Style.Fill.PatternType = ExcelFillStyle.Solid;
                                r.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(237, 241, 242));
                                r = ws1.Cells[_row + 2, _col];
                                r.RichText.Add(response.LatestTimePeriod[j].TimePeriodName == string.Empty ? "NA" : response.LatestTimePeriod[j].TimePeriodName);
                                r.Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                                r.Style.Fill.PatternType = ExcelFillStyle.Solid;
                                r.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(203, 210, 214));
                                r = ws1.Cells[_row + 3, _col];
                                r.RichText.Add(response.LatestTimePeriod[j].BrandName == string.Empty ? "NA" : response.LatestTimePeriod[j].BrandName);
                                r.Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                                r.Style.Fill.PatternType = ExcelFillStyle.Solid;
                                r.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(237, 241, 242));
                            }
                        }
                        #endregion

                        #region Table Header
                        _row = request.SnapshotTypeName.Contains(Constants.Snapshot_Demog_Text) ? 12 : 11;
                        _col = 2;
                        if (ExcelSheetName.Contains(Constants.MeasureTree_Text))
                        {
                            _col = 3;
                        }
                        for (int j = 0; j < columns.Count; j++)
                        {
                            r1 = ws1.Cells[_row, _col];
                            r1.RichText.Clear();
                            ws1.Row(_row).Height = 15;
                            ws1.Cells[_row, _col].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                            ws1.Cells[_row, _col].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                            ws1.Cells[_row, _col].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                            r1.Style.Font.Size = 11;
                            r1.Style.Font.Name = "Calibri";
                            r1.Style.Font.Bold = true;
                            r1.RichText.Add(columns[j]).Color = Color.Black;
                            _col = _col + 1;
                        }

                        #endregion

                        #region Table Values
                        _row = request.SnapshotTypeName.Contains(Constants.Snapshot_Demog_Text) ? 13 : 12;
                        _col = 1;

                        #region First Level Rows
                        var _nestedRows = GetNestedRows(request, response, ExcelSheetName);
                        int _nestedRowsCount = 0;
                        if (_nestedRows == null)
                        {
                            _nestedRowsCount = 0;
                        }
                        else
                        {
                            _nestedRowsCount = _nestedRows.Count;
                        }
                        var _mergeCount = _nestedRows == null ? 0 : (_nestedRows.Count) - 1;
                        for (int j = 0; j < rows.Count; j++)
                        {
                            r1 = ws1.Cells[_row, _col, _row + _mergeCount, _col];
                            r1.RichText.Clear();
                            ws1.Cells[_row, _col, _row + _mergeCount, _col].Merge = true;
                            ws1.Cells[_row, _col, _row + _mergeCount, _col].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                            ws1.Cells[_row, _col].Value = rows[j].ToUpper();
                            ws1.Cells[_row, _col].Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;
                            ws1.Cells[_row, _col, _row + _mergeCount, _col].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                            r1.Style.Fill.PatternType = ExcelFillStyle.Solid;
                            if (_nestedRowsCount >= 1)
                            {
                                for (int k = 0; k < _nestedRowsCount; k++)
                                {
                                    ws1.Row(_row + k).Height = 30;
                                }
                            }
                            else
                            {
                                ws1.Row(_row).Height = 30;
                            }
                            if (j % 2 == 0)
                            {
                                r1.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(203, 210, 214));
                            }
                            else
                            {
                                r1.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(237, 241, 242));
                            }
                            r1.Style.Font.Bold = true;
                            _row = _row + (_mergeCount + 1);
                            _footerRow = _row;
                        }
                        #endregion

                        #region Second Level Rows
                        if (ExcelSheetName.Contains(Constants.Share_Text) || ExcelSheetName.Contains(Constants.MeasureTree_Text))
                        {
                            _row = 12;
                            _col = 2;

                            for (int k = 0; k < rows.Count; k++)
                            {
                                for (int j = 0; j < _nestedRows.Count; j++)
                                {
                                    r1 = ws1.Cells[_row, _col];
                                    r1.RichText.Clear();
                                    ws1.Cells[_row, _col].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                                    ws1.Cells[_row, _col].Value = _nestedRows[j].ToUpper();
                                    ws1.Cells[_row, _col].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                    ws1.Cells[_row, _col].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                                    ws1.Cells[_row, _col].AutoFitColumns();
                                    r1.Style.Fill.PatternType = ExcelFillStyle.Solid;
                                    if (j % 2 == 0)
                                    {
                                        r1.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(203, 210, 214));
                                    }
                                    else
                                    {
                                        r1.Style.Fill.BackgroundColor.SetColor(Color.FromArgb(237, 241, 242));
                                    }
                                    r1.Style.Font.Bold = true;
                                    _row = _row + 1;
                                }
                            }
                        }
                        #endregion

                        #region Main Table Values
                        double metricSampleSize = 0;
                        #region Sheets except share sheet and Measure Tree sheet
                        if (!((ExcelSheetName.Contains(Constants.Share_Text)) || (ExcelSheetName.Contains(Constants.MeasureTree_Text))))
                        {
                            _row = request.SnapshotTypeName.Contains(Constants.Snapshot_Demog_Text) ? 13 : 12;
                            _col = 2;

                            for (int j = 0; j < columns.Count; j++)
                            {
                                for (int k = 0; k < rows.Count; k++)
                                {
                                    var data = new OutputRow();
                                    data = GetDataToPopulate(request, response, ExcelSheetName, columns[j], rows[k]);
                                    r1 = ws1.Cells[_row, _col];
                                    ws1.Cells[_row, _col].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                                    ws1.Cells[_row, _col].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                    r1.RichText.Clear();
                                    r1.Style.Fill.PatternType = ExcelFillStyle.Solid;
                                    ws1.Cells[_row, _col, _row, _col].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                                    ws1.Cells[_row, _col, _row, _col].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                    if (k % 2 == 0)
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
                                }
                                _row = request.SnapshotTypeName.Contains(Constants.Snapshot_Demog_Text) ? 13 : 12; ;
                                _col = _col + 1;
                            }
                        }
                        #endregion

                        #region Share sheet And Measure Tree sheet
                        else if (ExcelSheetName.Contains(Constants.Share_Text) || ExcelSheetName.Contains(Constants.MeasureTree_Text))
                        {
                            _row = 12;
                            _col = 3;

                            for (int j = 0; j < columns.Count; j++)
                            {
                                int index = ExcelSheetName.Contains(Constants.Share_Text) ? j + 1 : j;
                                for (int k = 0; k < rows.Count; k++)
                                {
                                    for (int l = 0; l < _nestedRowsCount; l++)
                                    {
                                        if (index < columns.Count)
                                        {
                                            var data = new OutputRow();
                                            data = GetDataToPopulate(request, response, ExcelSheetName, columns[index], rows[k], _nestedRows[l]);
                                            r1 = ws1.Cells[_row, _col];
                                            ws1.Cells[_row, _col].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                                            ws1.Cells[_row, _col].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                            r1.RichText.Clear();
                                            r1.Style.Fill.PatternType = ExcelFillStyle.Solid;
                                            ws1.Cells[_row, _col, _row, _col].Style.Border.BorderAround(ExcelBorderStyle.Thin, Color.FromArgb(179, 188, 184));
                                            ws1.Cells[_row, _col, _row, _col].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                                            if (l % 2 == 0)
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
                                            }
                                            _row = _row + 1;
                                        }
                                    }
                                }
                                _row = 12;
                                _col = _col + 1;
                            }
                        }
                        #endregion

                        #endregion

                        #endregion

                        #region Footer Text
                        if (request.FooterText != null && request.FooterText.Length > 0 && columns.Count > 0)
                        {
                            _row = _footerRow + 2;
                            var _footerText = request.FooterText.Split('\n');
                            _col = 1;
                            r1 = ws1.Cells[_row, _col, _row + _footerText.Length - 1, _col + 10];
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

                        #region Delete Extra Sheets
                        int WorkSheetCount = package.Workbook.Worksheets.Count;
                        for (int j = 1; j <= WorkSheetCount - request.WidgetIds.Length; j++)
                        {
                            if (true)
                            {
                                var sheetName = request.SheetNames[i].ToString().Length > 31 ? RemoveSpecialChar(request.SheetNames[i].ToString().Substring(0, 31).Trim()) : RemoveSpecialChar(request.SheetNames[i]);
                                var deleteList = package.Workbook.Worksheets.Where(r => r.Name != sheetName).ToList();

                                for (var k = 0; k < deleteList.Count; k++)
                                {
                                    package.Workbook.Worksheets.Delete(deleteList[k]);
                                }

                            }
                        }
                        #endregion

                        ws1.Cells.AutoFitColumns();
                        package.Save();
                    }
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return (Constants.SnapshotDownloadPath.Replace("~", "..") + tempFolderName + "/" + tempFileName);

        }
        public SnapShotExportResponse GetDataForExports(SnapshotRequest request)
        {
            DataSet dSet = _unitOfWork.GetRepository<ISnapShotRepository>().GetChartOutput(request);
            SnapShotExportResponse response = new SnapShotExportResponse();
            response.ExportData = new List<List<OutputRow>>();
            for (int i = 0; i < request.WidgetIds.Length; i++)
            {
                response.ExportData.Add(tableToList(dSet.Tables[Convert.ToInt32(request.WidgetIds[i]) - 1]));
            }
            if (request.SnapshotTypeName.ToLower() == "category-multi" && (request.TimePeriodId == "-1001" || request.TimePeriodId == "-1002" || request.TimePeriodId == "-1003" || request.TimePeriodId == "-1004"))
            {
                response.LatestTimePeriod = new List<OutputRow>();
                response.LatestTimePeriod = tableToList(dSet.Tables[5]);
            }
            return response;
        }
        public SnapShotExportResponse GetOnlyLTADataForExports(SnapshotRequest request)
        {
            DataSet dSet = _unitOfWork.GetRepository<ISnapShotRepository>().GetChartOutput(request);
            SnapShotExportResponse response = new SnapShotExportResponse();
            response.ExportData = new List<List<OutputRow>>();
            if (request.SnapshotTypeName.ToLower() == "category-multi" && (request.TimePeriodId == "-1001" || request.TimePeriodId == "-1002" || request.TimePeriodId == "-1003" || request.TimePeriodId == "-1004"))
            {
                response.LatestTimePeriod = new List<OutputRow>();
                response.LatestTimePeriod = tableToList(dSet.Tables[5]);
            }
            return response;
        }
        public List<string> GetHeaderColumns(SnapshotRequest request, SnapShotExportResponse response, string sheetName)
        {
            var columnHeaders = new List<String>();
            if (request.WidgetIds.Length > 1)
            {
                if (sheetName.Contains(Constants.Contribution_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Multi_Text))
                {
                    columnHeaders = response.ExportData[0].Select(r => r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString()).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Map_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Multi_Text))
                {
                    columnHeaders = response.ExportData[1].Select(r => r.MetricName).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Share_Text))
                {
                    columnHeaders.Add(Constants.Brand_TimePeriod_Text);
                    var headers = response.ExportData[2].Select(r => r.TimePeriodName).Distinct().ToList();
                    for (int i = 0; i < headers.Count; i++)
                    {
                        columnHeaders.Add(headers[i]);
                    }
                }
                if (sheetName.Contains(Constants.Trend_Text))
                {
                    columnHeaders = response.ExportData[3].Select(r => r.TimePeriodName).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.MeasureTree_Text))
                {
                    columnHeaders = response.ExportData[0].Select(r => r.TimePeriodName).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Contribution_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Single_Text))
                {
                    columnHeaders = response.ExportData[1].Select(r => r.TimePeriodName).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Map_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Single_Text))
                {
                    columnHeaders = response.ExportData[2].Select(r => r.TimePeriodName).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Value_Text) && !(request.SnapshotTypeName.Contains(Constants.Snapshot_Demog_Text)))
                {
                    columnHeaders = response.ExportData[3].Select(r => r.TimePeriodName).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Penetration_Text))
                {
                    columnHeaders = response.ExportData[4].Select(r => r.TimePeriodName).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Volume_Text))
                {
                    columnHeaders = response.ExportData[5].Select(r => r.TimePeriodName).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Frequency_Text))
                {
                    columnHeaders = response.ExportData[6].Select(r => r.TimePeriodName).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Value_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Demog_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Single_Text))
                {
                    columnHeaders = response.ExportData[0].Select(r => r.TimePeriodName).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Split_Drive_Text))
                {
                    columnHeaders = response.ExportData[1].Select(r => r.MetricName).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Value_Split_Text))
                {
                    columnHeaders = response.ExportData[2].Select(r => r.BrandName).Distinct().ToList();
                }
            }
            else
            {
                if (sheetName.Contains(Constants.Contribution_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Multi_Text))
                {
                    columnHeaders = response.ExportData[0].Select(r => r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString()).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Map_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Multi_Text))
                {
                    columnHeaders = response.ExportData[0].Select(r => r.MetricName).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Share_Text))
                {
                    columnHeaders.Add(Constants.Brand_TimePeriod_Text);
                    var headers = response.ExportData[0].Select(r => r.TimePeriodName).Distinct().ToList();
                    for (int i = 0; i < headers.Count; i++)
                    {
                        columnHeaders.Add(headers[i]);
                    }
                }
                if (sheetName.Contains(Constants.Trend_Text))
                {
                    columnHeaders = response.ExportData[0].Select(r => r.TimePeriodName).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.MeasureTree_Text))
                {
                    columnHeaders = response.ExportData[0].Select(r => r.TimePeriodName).Distinct().ToList();
                }
                if ((sheetName.Contains(Constants.Contribution_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Single_Text)) || (sheetName.Contains(Constants.Map_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Single_Text)))
                {
                    columnHeaders = response.ExportData[0].Select(r => r.TimePeriodName).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Value_Text) || sheetName.Contains(Constants.Penetration_Text) || sheetName.Contains(Constants.Volume_Text) || sheetName.Contains(Constants.Frequency_Text))
                {
                    columnHeaders = response.ExportData[0].Select(r => r.TimePeriodName).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Value_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Demog_Text))
                {
                    columnHeaders = response.ExportData[0].Select(r => r.TimePeriodName).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Split_Drive_Text))
                {
                    columnHeaders = response.ExportData[0].Select(r => r.MetricName).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Value_Split_Text))
                {
                    columnHeaders = response.ExportData[0].Select(r => r.BrandName).Distinct().ToList();
                }
            }
            return columnHeaders;
        }
        public List<string> GetRows(SnapshotRequest request, SnapShotExportResponse response, string sheetName)
        {
            var rowValues = new List<string>();
            if (request.WidgetIds.Length > 1)
            {
                if (sheetName.Contains(Constants.Contribution_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Multi_Text))
                {
                    rowValues = response.ExportData[0].Select(r => r.MetricName).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Map_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Multi_Text))
                {
                    rowValues = response.ExportData[1].Select(r => r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString()).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Share_Text))
                {
                    rowValues = response.ExportData[2].Select(r => r.MetricName).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Trend_Text))
                {
                    rowValues = response.ExportData[3].Select(r => r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString()).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.MeasureTree_Text))
                {
                    rowValues = response.ExportData[0].Select(r => r.MetricName).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Contribution_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Single_Text))
                {
                    rowValues = response.ExportData[1].Select(r => r.MetricName).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Map_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Single_Text))
                {
                    rowValues = response.ExportData[2].Select(r => r.MetricName).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Value_Text) && !(request.SnapshotTypeName.Contains(Constants.Snapshot_Demog_Text)))
                {
                    rowValues = response.ExportData[3].Select(r => r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString()).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Penetration_Text))
                {
                    rowValues = response.ExportData[4].Select(r => r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString()).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Volume_Text))
                {
                    rowValues = response.ExportData[5].Select(r => r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString()).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Frequency_Text))
                {
                    rowValues = response.ExportData[6].Select(r => r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString()).Distinct().ToList();
                }
                if ((sheetName.Contains(Constants.Value_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Demog_Text)) || (sheetName.Contains(Constants.Split_Drive_Text)) || (sheetName.Contains(Constants.Value_Split_Text)))
                {
                    rowValues = response.ExportData[0].Select(r => r.ChannelName).Distinct().ToList();
                }
            }
            else
            {
                if (sheetName.Contains(Constants.Contribution_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Multi_Text))
                {
                    rowValues = response.ExportData[0].Select(r => r.MetricName).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Map_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Multi_Text))
                {
                    rowValues = response.ExportData[0].Select(r => r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString()).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Share_Text))
                {
                    rowValues = response.ExportData[0].Select(r => r.MetricName).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.Trend_Text))
                {
                    rowValues = response.ExportData[0].Select(r => r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString()).Distinct().ToList();
                }
                if (sheetName.Contains(Constants.MeasureTree_Text) || (sheetName.Contains(Constants.Contribution_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Single_Text)) || (sheetName.Contains(Constants.Map_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Single_Text)))
                {
                    rowValues = response.ExportData[0].Select(r => r.MetricName).Distinct().ToList();
                }
                if ((sheetName.Contains(Constants.Value_Text) && !(request.SnapshotTypeName.Contains(Constants.Snapshot_Demog_Text))) || sheetName.Contains(Constants.Penetration_Text) || sheetName.Contains(Constants.Volume_Text) || sheetName.Contains(Constants.Frequency_Text))
                {
                    rowValues = response.ExportData[0].Select(r => r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString()).Distinct().ToList();
                }
                if ((sheetName.Contains(Constants.Value_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Demog_Text)) || (sheetName.Contains(Constants.Split_Drive_Text)) || (sheetName.Contains(Constants.Value_Split_Text)))
                {
                    rowValues = response.ExportData[0].Select(r => r.ChannelName).Distinct().ToList();
                }
            }
            return rowValues;
        }
        public List<string> GetNestedRows(SnapshotRequest request, SnapShotExportResponse response, string sheetName)
        {
            var _nestedRows = new List<string>();
            if (request.WidgetIds.Length > 1)
            {
                if (sheetName.Contains(Constants.Share_Text))
                {
                    _nestedRows = response.ExportData[2].Select(r => r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString()).Distinct().ToList();
                }
                else if (sheetName.Contains(Constants.MeasureTree_Text))
                {
                    _nestedRows = response.ExportData[0].Select(r => r.MetricValueType).Distinct().ToList();
                }
                else
                {
                    _nestedRows = null;
                }
            }
            else
            {
                if (sheetName.Contains(Constants.Share_Text))
                {
                    _nestedRows = response.ExportData[0].Select(r => r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString()).Distinct().ToList();
                }
                else if (sheetName.Contains(Constants.MeasureTree_Text))
                {
                    _nestedRows = response.ExportData[0].Select(r => r.MetricValueType).Distinct().ToList();
                }
                else
                {
                    _nestedRows = null;
                }
            }
            return _nestedRows;
        }
        public OutputRow GetDataToPopulate(SnapshotRequest request, SnapShotExportResponse response, string sheetName, string columnName, string rowName)
        {
            var data = new OutputRow();
            if (request.WidgetIds.Length > 1)
            {
                if (sheetName.Contains(Constants.Contribution_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Multi_Text))
                {
                    data = response.ExportData[0].Where(r => r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columnName && r.MetricName == rowName).FirstOrDefault();
                }
                if (sheetName.Contains(Constants.Map_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Multi_Text))
                {
                    data = response.ExportData[1].Where(r => r.MetricName == columnName && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == rowName).FirstOrDefault();
                }
                if (sheetName.Contains(Constants.Trend_Text))
                {
                    data = response.ExportData[3].Where(r => r.TimePeriodName == columnName && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == rowName).FirstOrDefault();
                }
                if (sheetName.Contains(Constants.Contribution_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Single_Text))
                {
                    data = response.ExportData[1].Where(r => r.TimePeriodName == columnName && r.MetricName == rowName).FirstOrDefault();
                }
                if (sheetName.Contains(Constants.Map_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Single_Text))
                {
                    data = response.ExportData[2].Where(r => r.TimePeriodName == columnName && r.MetricName == rowName).FirstOrDefault();
                }
                if (sheetName.Contains(Constants.Value_Text) && !(request.SnapshotTypeName.Contains(Constants.Snapshot_Demog_Text)))
                {
                    data = response.ExportData[3].Where(r => r.TimePeriodName == columnName && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == rowName).FirstOrDefault();
                }
                if (sheetName.Contains(Constants.Penetration_Text))
                {
                    data = response.ExportData[4].Where(r => r.TimePeriodName == columnName && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == rowName).FirstOrDefault();
                }
                if (sheetName.Contains(Constants.Volume_Text))
                {
                    data = response.ExportData[5].Where(r => r.TimePeriodName == columnName && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == rowName).FirstOrDefault();
                }
                if (sheetName.Contains(Constants.Frequency_Text))
                {
                    data = response.ExportData[6].Where(r => r.TimePeriodName == columnName && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == rowName).FirstOrDefault();
                }
                if (sheetName.Contains(Constants.Value_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Demog_Text))
                {
                    data = response.ExportData[0].Where(r => r.TimePeriodName == columnName && r.ChannelName == rowName).FirstOrDefault();
                }
                if (sheetName.Contains(Constants.Split_Drive_Text))
                {
                    data = response.ExportData[1].Where(r => r.MetricName == columnName && r.ChannelName == rowName).FirstOrDefault();
                }
                if (sheetName.Contains(Constants.Value_Split_Text))
                {
                    data = response.ExportData[2].Where(r => r.BrandName == columnName && r.ChannelName == rowName).FirstOrDefault();
                }
            }
            else
            {
                if (sheetName.Contains(Constants.Contribution_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Multi_Text))
                {
                    data = response.ExportData[0].Where(r => r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == columnName && r.MetricName == rowName).FirstOrDefault();
                }
                if (sheetName.Contains(Constants.Map_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Multi_Text))
                {
                    data = response.ExportData[0].Where(r => r.MetricName == columnName && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == rowName).FirstOrDefault();
                }
                if (sheetName.Contains(Constants.Trend_Text))
                {
                    data = response.ExportData[0].Where(r => r.TimePeriodName == columnName && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == rowName).FirstOrDefault();
                }
                if ((sheetName.Contains(Constants.Contribution_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Single_Text)) || (sheetName.Contains(Constants.Map_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Single_Text)))
                {
                    data = response.ExportData[0].Where(r => r.TimePeriodName == columnName && r.MetricName == rowName).FirstOrDefault();
                }
                if ((sheetName.Contains(Constants.Value_Text) && !(request.SnapshotTypeName.Contains(Constants.Snapshot_Demog_Text))) || sheetName.Contains(Constants.Penetration_Text) || sheetName.Contains(Constants.Volume_Text) || sheetName.Contains(Constants.Frequency_Text))
                {
                    data = response.ExportData[0].Where(r => r.TimePeriodName == columnName && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == rowName).FirstOrDefault();
                }
                if (sheetName.Contains(Constants.Value_Text) && request.SnapshotTypeName.Contains(Constants.Snapshot_Demog_Text))
                {
                    data = response.ExportData[0].Where(r => r.TimePeriodName == columnName && r.ChannelName == rowName).FirstOrDefault();
                }
                if (sheetName.Contains(Constants.Split_Drive_Text))
                {
                    data = response.ExportData[0].Where(r => r.MetricName == columnName && r.ChannelName == rowName).FirstOrDefault();
                }
                if (sheetName.Contains(Constants.Value_Split_Text))
                {
                    data = response.ExportData[0].Where(r => r.BrandName == columnName && r.ChannelName == rowName).FirstOrDefault();
                }
            }
            return data;
        }
        public OutputRow GetDataToPopulate(SnapshotRequest request, SnapShotExportResponse response, string sheetName, string columnName, string rowName, string nestedRowName)
        {
            var data = new OutputRow();
            if (request.WidgetIds.Length > 1)
            {
                if (sheetName.Contains(Constants.Share_Text))
                {
                    data = response.ExportData[2].Where(r => r.MetricName == rowName && r.TimePeriodName == columnName && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == nestedRowName).FirstOrDefault();
                }
                if (sheetName.Contains(Constants.MeasureTree_Text))
                {
                    data = response.ExportData[0].Where(r => r.MetricName == rowName && r.TimePeriodName == columnName && r.MetricValueType == nestedRowName).FirstOrDefault();
                }
            }
            else
            {
                if (sheetName.Contains(Constants.Share_Text))
                {
                    data = response.ExportData[0].Where(r => r.MetricName == rowName && r.TimePeriodName == columnName && r.GetType().GetProperty(request.CompareName).GetValue(r, null).ToString() == nestedRowName).FirstOrDefault();
                }
                if (sheetName.Contains(Constants.MeasureTree_Text))
                {
                    data = response.ExportData[0].Where(r => r.MetricName == rowName && r.TimePeriodName == columnName && r.MetricValueType == nestedRowName).FirstOrDefault();
                }
            }
            return data;
        }
        public string GetSelectionText(SnapshotRequest request)
        {
            string output = string.Empty;
            if (request.SnapshotTypeName.Contains(Constants.Snapshot_Demog_Text))
            {
                output += "Snapshot type : " + request.SnapshotTypeName.Replace("Name", "") + "||";
                output += "Market : " + (request.MarketName.Split('|').Length > 1 ? "Multiple Market" : request.MarketName) + "||";
                output += "Category : " + (request.CategoryName.Split('|').Length > 1 ? "Multiple Category's" : request.CategoryName) + "||";
                output += "Time Period : " + request.TimePeriodName + "||";
                output += "Primary Brand : " + request.PrimaryBrandName + "||";
                output += "Secondary Brand : " + request.SecondaryBrandName + "||";
                output += "Segments : " + (request.Segment1Name) + (string.IsNullOrEmpty(request.Segment2Name) ? "" : (" | " + request.Segment2Name)) + "||";
                output += (request.isChannel ? "Channel/Retailer : " : "Demographics : ") + (request.isChannel ? (request.ChannelName.Split('|').Length > 1 ? "Multiple Channel/Retailer" : request.ChannelName) : (request.DemographicName.Split('|').Length > 1 ? "Multiple Demographics" : request.DemographicName));
            }
            else
            {
                output += "Snapshot type : " + request.SnapshotTypeName.Replace("Name", "") + "||";
                output += "Market : " + (request.MarketName.Split('|').Length > 1 ? "Multiple Market" : request.MarketName) + "||";
                output += "Category : " + (request.CategoryName.Split('|').Length > 1 ? "Multiple Category's" : request.CategoryName) + "||";
                output += "Time Period : " + request.TimePeriodName + "||";
                output += "Brands : " + (request.BrandName.Split('|').Length > 1 ? "Multiple Brands" : request.BrandName) + "||";
                output += "Segments : " + (request.Segment1Name) + (string.IsNullOrEmpty(request.Segment2Name) ? "" : (" | " + request.Segment2Name)) + "||";
                output += (request.isChannel ? "Channel/Retailer : " : "Demographics : ") + (request.isChannel ? (request.ChannelName.Split('|').Length > 1 ? "Multiple Channel/Retailer" : request.ChannelName) : (request.DemographicName.Split('|').Length > 1 ? "Multiple Demographics" : request.DemographicName));
            }
            return output;
        }
        public void UpdateSelectionText(SnapshotRequest request, ISlide sld, string textBoxName)
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

            if (request.SnapshotTypeName.Contains(Constants.Snapshot_Demog_Text))
            {
                port = new Portion("\n Primary Brand : ");
                port.PortionFormat.FontBold = NullableBool.False;
                port.PortionFormat.FontHeight = 12;
                para.Portions.Add(port);
                port = new Portion(request.PrimaryBrandName + ";");
                port.PortionFormat.FontBold = NullableBool.False;
                port.PortionFormat.FontHeight = 12;
                para.Portions.Add(port);

                port = new Portion("\n Secondary Brand : ");
                port.PortionFormat.FontBold = NullableBool.False;
                port.PortionFormat.FontHeight = 12;
                para.Portions.Add(port);
                port = new Portion(request.SecondaryBrandName + ";");
                port.PortionFormat.FontBold = NullableBool.False;
                port.PortionFormat.FontHeight = 12;
                para.Portions.Add(port);
            }
            else
            {
                port = new Portion("\n Brand/s : ");
                port.PortionFormat.FontBold = NullableBool.False;
                port.PortionFormat.FontHeight = 12;
                para.Portions.Add(port);
                port = new Portion((request.BrandName.Split('|').Length > 1 ? "Multiple Brands" : request.BrandName) + ";");
                port.PortionFormat.FontBold = NullableBool.False;
                port.PortionFormat.FontHeight = 12;
                para.Portions.Add(port);
            }

            port = new Portion("\n Segment : ");
            port.PortionFormat.FontBold = NullableBool.False;
            port.PortionFormat.FontHeight = 12;
            para.Portions.Add(port);
            port = new Portion((request.Segment1Name) + (string.IsNullOrEmpty(request.Segment2Name) ? "" : (" | " + request.Segment2Name)) + ";");
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
        private List<OutputRow> tableToList(DataTable tbl)
        {
            var output = new List<OutputRow>();
            output = (from r in tbl.AsEnumerable()
                      select new OutputRow()
                      {
                          MarketName = tbl.Columns.Contains("Country") ? Convert.ToString(r["Country"]) : null,
                          CategoryName = tbl.Columns.Contains("Category") ? Convert.ToString(r["Category"]) : null,
                          TimePeriodName = tbl.Columns.Contains("TimeperiodName") ? Convert.ToString(r["TimeperiodName"]) : null,
                          TimePeriodId = tbl.Columns.Contains("TimeperiodId") ? Convert.ToString(r["TimeperiodId"]) : null,
                          BrandName = tbl.Columns.Contains("Brand") ? Convert.ToString(r["Brand"]) : null,
                          Segment1Name = tbl.Columns.Contains("Segment1") ? Convert.ToString(r["Segment1"]) : null,
                          Segment2Name = tbl.Columns.Contains("Segment2") ? Convert.ToString(r["Segment2"]) : null,
                          MetricName = tbl.Columns.Contains("MetricName") ? Convert.ToString(r["MetricName"]) : null,
                          MetricVolume = r["MetricValue"] == DBNull.Value ? null : stringToDouble(r["MetricValue"].ToString(), Convert.ToInt32(r["RoundBy"].ToString())),
                          ChannelName = tbl.Columns.Contains("Channel") ? Convert.ToString(r["Channel"]) : null,
                          DemographicName = tbl.Columns.Contains("Demographic") ? Convert.ToString(r["Demographic"]) : null,
                          MetricType = tbl.Columns.Contains("MetricType") ? Convert.ToString(r["MetricType"]) : null,
                          MetricValueType = tbl.Columns.Contains("MetricValueType") ? Convert.ToString(r["MetricValueType"]) : null,
                          SampleSize = r["RawBuyers"] == DBNull.Value ? null : stringToDouble(r["RawBuyers"].ToString()),
                          RoundBy = r["RoundBy"] == DBNull.Value ? 0 : Convert.ToInt32(r["RoundBy"].ToString()),
                      }).ToList();

            return output;
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

        public string RemoveSpecialChar(string input)
        {
            string QuestionMark = "?";
            return input.Replace(QuestionMark, "");
        }
    }

}
