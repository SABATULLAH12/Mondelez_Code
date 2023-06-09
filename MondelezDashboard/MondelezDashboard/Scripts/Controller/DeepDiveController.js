﻿define(['app', 'angular','Highcharts', 'ajaxservice', 'constants'], function (app, angular, Highcharts) {
    app.register.controller("DeepDiveController", ['$scope', '$css', '$sce', 'AjaxService', 'Constants', function ($scope, $css, $sce, AjaxService, Constants) {
        ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/deepdive.min.css' }, $scope) : $css.bind({ href: '../Content/Css/deepdive.css' }, $scope);
        let filterPanelScope = $scope.$parent;
        let layoutScope = $scope.$parent.$parent.$parent;
        let topMenuScope = $scope.$parent.$parent;
        let selectedModule = topMenuScope.modules[1];
        filterPanelScope.clearAll();
        filterPanelScope.openFilterPanel(false);
        selectedModule.isActive = true;
        //chart variables
        $scope.IsDataLabelVisible = false;
        $scope.showOutput = false;
        $scope.chartTitle = "Metric Name";
        let chart = null;
        $scope.animation = true;
        $scope.outputData = {};
        $scope.isColumnChart = true;
        $scope.ModuleRequestToDB = {};
        $scope.IsTrend = false;
       
        //chart data and functions
        const chartTypes = { simpleBar: 1, simpleColumn: 2, simpleLine: 3, stackedColumn: 4 };

        let getOutput = function (data) {
            try {
                if (chart !== null)
                    chart.destroy();
            } catch (e) {
                console.log(e);
            }
            data.CompareName = getColumnName(data.CompareId);
            $scope.ModuleRequestToDB = data;
            $scope.IsTrend = data.isTrend;
            AjaxService.AjaxPost(data, apiUrl + "/" + selectedModule.ModuleName.toLowerCase() + "/" + "GetChartOutput", buildChart, errorFunction);
            $scope.showOutput = true;
            filterPanelScope.setIsSelectedFiltersChanged(false);
        }

        let buildChart = function (response) {
            if (response != undefined && response.data.Categories.length > 0) {           
                if (topMenuScope.isSlideUpdate) {
                    $scope.isColumnChart = topMenuScope.SlideDetails[0].AddtionalInfo.isColumnChart;
                    $scope.animation = false;
                    $scope.IsDataLabelVisible = topMenuScope.SlideDetails[0].AddtionalInfo.isShowDataLabel;
                }
                else {
                    $scope.IsTrend = $scope.IsTrend || filterPanelScope.IsTrend;
                }
                let chartData = response.data;
                var chartTypeValue = (($scope.IsTrend) ? chartTypes.simpleLine : ($scope.isColumnChart ? chartTypes.simpleColumn : chartTypes.simpleBar));
                $scope.outputData = response.data;
                let chartObj = new Chart(chartData.Series, chartData.Categories, chartData.IsPercentage, chartTypeValue);
                chart = chartObj.drawChart();
                $scope.chartTitle = getChartHeader($scope.ModuleRequestToDB);
                topMenuScope.chart = chart;
                filterPanelScope.setLowSampleSizeFlag(response.data.isLowSampleSize);
                $scope.showOutput = true;
                layoutScope.setLoader(false);
                filterPanelScope.openFilterPanel(false);
            }
            else {
                layoutScope.customAlert(Constants.NO_OUTPUT_TEXT_ON_SUBMIT, Constants.ALERT_HEADER_TEXT);
                $scope.showOutput = false;
                layoutScope.setLoader(false);
                filterPanelScope.openFilterPanel(false);
            }
            if (topMenuScope.isSlideUpdate)
                setTimeout(function () { filterPanelScope.ApplyModuleCustomizationStoryBoard() }, 10);
            if (layoutScope.StoryBoardSlideNavigationDetails.isNavigated) {
                if (!layoutScope.StoryBoardSlideNavigationDetails.AddtionalInfo.SlideParameters.isTrend && !layoutScope.StoryBoardSlideNavigationDetails.AddtionalInfo.isColumnChart) {
                    $scope.changeChartType('bar');
                }           
                layoutScope.StoryBoardSlideNavigationDetails.isNavigated = false;
                layoutScope.StoryBoardSlideNavigationDetails.Selection = [];
                layoutScope.StoryBoardSlideNavigationDetails.AddtionalInfo = {};
            }
        }

        function Chart(series, categories, IsPercentage, chartType) {
            this.container = "chart_container";
            topMenuScope.outputContainer = this.container;
            this.series = series;

            this.categories = categories,
            this.chartType = chartType;
            this.IsPercentage = IsPercentage;
            this.animation = $scope.animation;
            this.style = {
                fontFamily: "'Montserrat'"
            };
            this.drawChart = function () {
                switch (this.chartType) {
                    case chartTypes.simpleLine:
                        return Highcharts.chart(this.container, {
                            chart: { style: this.style },
                            title: { text: '' },
                            xAxis: {
                                categories: this.categories,
                                alternateGridColor: this.categories.length == 1 ? '' : '#f9f9f9',
                                lables: { style: { fontWeight: 'bold' }, }
                            },
                            yAxis: {
                                gridLineWidth: 1,
                                minorGridLineWidth: 1,
                                gridLineDashStyle: 'dot',
                                gridLineColor: 'lightgray',
                                title: { text: '' },
                                //min: 0,
                                //max: storedItems.MaxYaxisValue,
                                labels: {
                                    formatter: function () {
                                        if (IsPercentage)
                                            return this.value + "%";
                                        else
                                            return this.value / 1000000 > 1 ? (this.value / 1000000) + "M" : this.value;
                                    },
                                    style: { fontWeight: 'bold' },
                                },
                                tickPositioner: function () {
                                    //var maxDeviation = Math.ceil(Math.max(Math.abs(this.dataMax), Math.abs(this.dataMin)));
                                    //var halfMaxDeviation = Math.ceil(maxDeviation / 2);
                                    //if (this.dataMax == null) { return [0]; }
                                    if (this.dataMax == 0 && this.dataMin == 0) { return [0, 0.5, 1]; }
                                    //else { return [-maxDeviation, -halfMaxDeviation, 0, halfMaxDeviation, maxDeviation]; }
                                },
                                plotLines: [{
                                    color: 'rgb(204, 214, 235)',
                                    width: 1,
                                    value: 0
                                }]
                            },
                            plotOptions: {
                                series: {
                                    label: {
                                        connectorAllowed: false
                                    },
                                    marker: {
                                        symbol: 'circle'
                                    },
                                    dataLabels: {
                                        enabled: $scope.IsDataLabelVisible,
                                        style: {
                                            fontWeight: 'normal'
                                        },
                                        color: 'black',
                                        crop: false,
                                        overflow: 'none',
                                        backgroundColor: 'rgba(252, 255, 255, 0.8)',
                                        padding: 3,
                                        borderWidth: 1,
                                        allowOverlap: true,
                                        borderColor: '#AAA',
                                        useHTML: true,
                                        formatter: function () {
                                            let returnHTML = "";
                                            if (this.point.Value != null) {
                                                returnHTML += "<div style='" + getSampleSizeStyle(this.point.SampleSize) + "'>" + getLableText(this.point, IsPercentage) + "</div>";
                                            }
                                            return returnHTML;
                                        }
                                    },
                                    stickyTracking: false,
                                    animation: this.animation
                                }
                            },
                            tooltip: {
                                useHTML: true,
                                formatter: function () {
                                    let returnHTML = "";
                                    var style = getSampleSizeStyle(this.point.SampleSize);
                                    //returnHTML += "<div>" + (this.series.name.indexOf("Series") >= 0 ? this.point.category : this.series.name) + "</div>";
                                    if (this.point.Value != null) {
                                        returnHTML += "<div style='" + style + "'>" + getLableText(this.point, this.percentage) + "</div>";
                                    }
                                    return "<div class='chart-tooltip'>" + returnHTML + "</div>";
                                },
                                snap: 0
                            },
                            series: this.series,
                            legend: { enabled: true, symbolRadius: 1, symbol: 'circle' },
                            credits: { enabled: false },
                            exporting: {
                                enabled: false
                            }
                        });
                        break;
                    case chartTypes.simpleBar:
                        return Highcharts.chart(this.container, {
                            chart: { type: 'bar', style: this.style },
                            title: { text: '' },
                            xAxis: {
                                categories: this.categories,
                                alternateGridColor: this.categories.length == 1 ? '' : '#f9f9f9',
                                labels: { autoRotation: false, style: { fontWeight: 'bold' }, },

                            },
                            yAxis: {
                                gridLineWidth: 1,
                                minorGridLineWidth: 1,
                                gridLineDashStyle: 'dot',
                                gridLineColor: 'lightgray',
                                labels: {
                                    enabled: true, style: { fontWeight: 'bold' },
                                    formatter: function () {
                                        if (IsPercentage)
                                            return this.value + "%";
                                        else
                                            return this.value / 1000000 > 1 ? (this.value / 1000000) + "M" : this.value;
                                    },
                                },
                                tickPositioner: function () {
                                    //var maxDeviation = Math.ceil(Math.max(Math.abs(this.dataMax), Math.abs(this.dataMin)));
                                    //var halfMaxDeviation = Math.ceil(maxDeviation / 2);
                                    //if (this.dataMax == null) { return [0]; }
                                    if (this.dataMax == 0 && this.dataMin == 0) { return [0, 0.5, 1]; }
                                    //else { return [-maxDeviation, -halfMaxDeviation, 0, halfMaxDeviation, maxDeviation]; }
                                },
                                title: { text: '' },
                                minRange: 0.01,
                                plotLines: [{
                                    color: 'rgb(204, 214, 235)',
                                    width: 1,
                                    value: 0
                                }]
                            },
                            tooltip: {
                                useHTML: true,
                                formatter: function () {
                                    let returnHTML = "";
                                    var style = getSampleSizeStyle(this.point.SampleSize);
                                    //returnHTML += "<div>" + (this.series.name.indexOf("Series") >= 0 ? this.point.category : this.series.name) + "</div>";
                                    if (this.point.Value != null) {
                                        returnHTML += "<div style='" + style + "'>" + getLableText(this.point, IsPercentage) + "</div>";
                                    }
                                    return "<div class='chart-tooltip'>" + returnHTML + "</div>";
                                },
                                snap: 0
                            },
                            plotOptions: {
                                bar: {
                                    borderWidth: 0,
                                    dataLabels: {
                                        enabled: $scope.IsDataLabelVisible,
                                        style: {
                                            fontWeight: 'normal'
                                        },
                                        backgroundColor: 'rgba(252, 255, 255, 0.8)',
                                        color: 'black',
                                        crop: false,
                                        allowOverlap: true,
                                        padding: 2,
                                        borderWidth: 1,
                                        inside: true,
                                        borderColor: '#AAA',
                                        overflow: 'none',
                                        zIndex: 10,
                                        useHTML: true,
                                        formatter: function () {
                                            let returnHTML = "";
                                            if (this.point.Value != null) {
                                                returnHTML += "<div style='" + getSampleSizeStyle(this.point.SampleSize) + "'>" + getLableText(this.point, IsPercentage) + "</div>";
                                            }
                                            return returnHTML;
                                        }
                                    },
                                    animation: this.animation
                                },
                                series: {
                                    animation: this.animation
                                }
                            },
                            series: this.series,
                            legend: { enabled: false, symbolRadius: 0 },
                            credits: { enabled: false },
                            exporting: {
                                enabled: false
                            }
                        });
                        break;
                    case chartTypes.simpleColumn:
                        return Highcharts.chart(this.container, {
                            chart: { type: 'column', style: this.style },
                            title: { text: '' },
                            xAxis: {
                                categories: this.categories,
                                alternateGridColor: this.categories.length == 1 ? '' : '#f9f9f9',
                                labels: { autoRotation: false, style: { fontWeight: 'bold' }, }
                            },
                            yAxis: {
                                gridLineWidth: 1,
                                minorGridLineWidth: 1,
                                gridLineDashStyle: 'dot',
                                gridLineColor: 'lightgray',
                                labels: {
                                    enabled: true, style: { fontWeight: 'bold' },
                                    formatter: function () {
                                        if (IsPercentage)
                                            return this.value + "%";
                                        else
                                            return this.value / 1000000 > 1 ? (this.value / 1000000) + "M" : this.value;
                                    },
                                },
                                tickPositioner: function () {
                                    //var maxDeviation = Math.ceil(Math.max(Math.abs(this.dataMax), Math.abs(this.dataMin)));
                                    //var halfMaxDeviation = Math.ceil(maxDeviation / 2);
                                    //if (this.dataMax == null) { return [0]; }
                                    if (this.dataMax == 0 && this.dataMin == 0) { return [0, 0.5, 1]; }
                                    //else { return [-maxDeviation, -halfMaxDeviation, 0, halfMaxDeviation, maxDeviation]; }
                                },
                                title: { text: '' },
                                minRange: 0.01,
                                plotLines: [{
                                    color: 'rgb(204, 214, 235)',
                                    width: 1,
                                    value: 0
                                }]
                            },
                            tooltip: {
                                useHTML: true,
                                formatter: function () {
                                    let returnHTML = "";
                                    var style = getSampleSizeStyle(this.point.SampleSize);
                                    //returnHTML += "<div>" + (this.series.name.indexOf("Series") >= 0 ? this.point.category : this.series.name) + "</div>";
                                    if (this.point.Value != null) {
                                        returnHTML += "<div style='" + style + "'>" + getLableText(this.point, IsPercentage) + "</div>";
                                    }
                                    return "<div class='chart-tooltip'>" + returnHTML + "</div>";
                                },
                                snap: 0
                            },
                            plotOptions: {
                                column: {
                                    pointWidth: 40,
                                    borderWidth: 0,
                                    dataLabels: {
                                        enabled: $scope.IsDataLabelVisible,
                                        style: {
                                            fontWeight: 'normal'
                                        },
                                        backgroundColor: 'rgba(252, 255, 255, 0.8)',
                                        color: 'black',
                                        crop: false,
                                        allowOverlap: true,
                                        padding: 2,
                                        borderWidth: 1,
                                        borderColor: '#AAA',
                                        overflow: 'none',
                                        zIndex: 10,
                                        useHTML: true,
                                        inside: true,
                                        formatter: function () {
                                            let returnHTML = "";
                                            if (this.point.Value != null) {
                                                returnHTML += "<div style='" + getSampleSizeStyle(this.point.SampleSize) + "'>" + getLableText(this.point, IsPercentage) + "</div>";
                                            }
                                            return  returnHTML;
                                        }
                                    },
                                    animation: this.animation
                                },
                                series: {
                                    animation: this.animation
                                }
                            },
                            series: this.series,
                            legend: { enabled: false, symbolRadius: 0 },
                            credits: { enabled: false },
                            exporting: {
                                enabled: false
                            }
                        });
                        break;
                    default:
                        return null;
                }
            }
        }

        $scope.changeChartType = function (chartType) {
            let chartTypeValue = null;
            if (chartType.toLowerCase() == 'line') {
                chartTypeValue = chartTypes.simpleLine;
            }
            else {
                chartTypeValue = chartType == 'bar' ? chartTypes.simpleBar : chartTypes.simpleColumn;
                $scope.isColumnChart = (chartType == 'bar' ? false : true);
            }
            let chartObj = new Chart($scope.outputData.Series, $scope.outputData.Categories, $scope.outputData.IsPercentage, chartTypeValue);
            chart = chartObj.drawChart();
            topMenuScope.chart = chart;
        }

        $scope.ShowHideDataLabel = function () {
            $scope.IsDataLabelVisible = !$scope.IsDataLabelVisible
            if ($scope.IsTrend) {
                $scope.changeChartType('line');
            }
            else if ($scope.isColumnChart) {
                $scope.changeChartType('column');
            }
            else {
                $scope.changeChartType('bar');
            }
        }

        filterPanelScope.callChildGetOutput(getOutput);

        let errorFunction = function (error) {
            console.log(error);
            layoutScope.customAlert("Something went wrong. Please refresh the screen and try. If it is occuring again, please contact support team.");
            $scope.showOutput = false;
            layoutScope.setLoader(false);
            filterPanelScope.openFilterPanel(true);
        }

        let getColumnName = function (compareId) {
            var cName = '';
            if (compareId == "1")   //Markets
                cName = 'MarketName';
            else if (compareId == "3")  //Category's
                cName = 'CategoryName';
            else if (compareId == "2" || compareId == "6")  //Brands or Top 15 Brands
                cName = 'BrandName';
            else if (compareId == "4")  //Channel's
                cName = 'ChannelName';
            else if (compareId == "5")  //Demographics
                cName = 'DemographicName';
            return cName;
        }

        let getLableText = function (point, IsPercentage) {
            var text = '';
            text = IsPercentage ? (point.Value + "%") : (Number(point.Value).toLocaleString() + point.options.MetricType);
            return text;
        }

        $scope.ExportToPPT = function () {
            if (filterPanelScope.isSelectedFiltersChanged) {
                layoutScope.customAlert(Constants.EXPORT_SELECTIONS_CHANGED, Constants.EXPORT_ALERT_HEADER, null, null, Constants.OK_TEXT);
                return;
            }
            layoutScope.setLoader(true);
            var data = {};
            data = $scope.ModuleRequestToDB;
            data.ChartType = data.isTrend ? Constants.LINE_TEXT : ($scope.isColumnChart ? Constants.COLUMN_TEXT : Constants.BAR_TEXT);
            data.ExportsType = Constants.PPT_TEXT;
            data.ChartTitle = $scope.chartTitle;
            data.FooterText = topMenuScope.getFooterText();
            if (!layoutScope.validateSession()) {
                return;
            }
            AjaxService.AjaxPost(data, apiUrl + "/" + selectedModule.ModuleName.toLowerCase() + "/" + "ExportPPTExcel", layoutScope.DownloadFile, layoutScope.ErrorDownloading);
        }

        $scope.ExportToExcel = function () {
            if (filterPanelScope.isSelectedFiltersChanged) {
                layoutScope.customAlert(Constants.EXPORT_SELECTIONS_CHANGED, Constants.EXPORT_ALERT_HEADER, null, null, Constants.OK_TEXT);
                return;
            }
            var request = {};
            request = $scope.ModuleRequestToDB;
            request.ExportsType = Constants.EXCEL_TEXT;
            request.FooterText = topMenuScope.getFooterText();
            layoutScope.setLoader(true);
            layoutScope.validateSession();
            AjaxService.AjaxPost(request, apiUrl + '/DeepDive/ExportPPTExcel', layoutScope.DownloadFile, layoutScope.ErrorDownloading);
        }

        let getChartHeader = function (data) {
            var chartHeader = "";
            if (data.CompareId == 1)
                chartHeader = Constants.DEEPDIVE_MARKET_CHART_HEADER;
            else if (data.CompareId == 2)
                chartHeader = Constants.DEEPDIVE_BRAND_CHART_HEADER;
            else if (data.CompareId == 3)
                chartHeader = Constants.DEEPDIVE_CATEGORY_CHART_HEADER;
            else if (data.CompareId == 4)
                chartHeader = Constants.DEEPDIVE_CHANNEL_CHART_HEADER;
            else if (data.CompareId == 5)
                chartHeader = Constants.DEEPDIVE_DEMOGRAPHICS_CHART_HEADER;
            else if (data.CompareId == 6)
                chartHeader = Constants.DEEPDIVE_TOPWORST_PERFORMING_BRAND_CHART_HEADER;

            chartHeader = chartHeader.replace("SELECTED KPI", data.KpiName).replace("SELECTED MARKET", data.MarketName).replace("SELECTED CATEGORY", data.CategoryName).replace("COMPARETAB", data.CompareTabName);
            if (data.CompareId == 3) {
                chartHeader = chartHeader.replace("SELECTED BRAND", data.CategoryName.split('|').length > 1 ? "Multiple Category" : data.CategoryName);
            }
            else {
                chartHeader = chartHeader.replace("SELECTED BRAND", data.BrandId.split('|').length > 1 ? "Multiple Brands" : data.BrandName);
            }
            return chartHeader;
        }

        let getSampleSizeStyle = function (SampleSize) {
            var output = "";
            if (SampleSize < Constants.SampleSize_Value) {
                output = 'color:grey;font-weight:normal;';
            }
            return output;
        }

        $scope.showStoryBoardSave = function () {
            var outputContainer = "#chart_container";
            var AdditionalInfo = {};
         
            $scope.ModuleRequestToDB.ChartType = $scope.ModuleRequestToDB.isTrend ? Constants.LINE_TEXT : ($scope.isColumnChart ? Constants.COLUMN_TEXT : Constants.BAR_TEXT);
            $scope.ModuleRequestToDB.ExportsType = Constants.PPT_TEXT;
            $scope.ModuleRequestToDB.ChartTitle = $scope.chartTitle;
            $scope.ModuleRequestToDB.FooterText = topMenuScope.getFooterText();
            $scope.ModuleRequestToDB.CompareName = getColumnName($scope.ModuleRequestToDB.CompareId);

            AdditionalInfo.isColumnChart = $scope.isColumnChart;
            AdditionalInfo.isTrend = $scope.isTrend;
            AdditionalInfo.isShowDataLabel = $scope.IsDataLabelVisible;
            AdditionalInfo.SlideName = $scope.chartTitle + " - DeepDive";
            AdditionalInfo.SlideParameters = $scope.ModuleRequestToDB;
            topMenuScope.showStoryBoardSave(outputContainer, $scope.ModuleRequestToDB, AdditionalInfo);
        }

        filterPanelScope.FillFilterPanal();

    }]);
})