/*----------------------------------------------------------------------------------------------------*/
/*          Author: Rahul Kumar (Software Engineer, F&B)                                              */
/*          Date: 26-02-2019                                                                          */
/*          Discription: This Script contains Snapshot Controller definition for Filter state         */
/*----------------------------------------------------------------------------------------------------*/

"use strict";

define(['app', 'angular', 'Highcharts', 'html2canvas', 'highcharts-more', 'ajaxservice', 'constants'], function (app, angular, Highcharts, html2canvas) {
    app.register.controller("SnapshotController", ['$scope', '$css', '$sce', 'AjaxService', 'Constants', function ($scope, $css, $sce, AjaxService, Constants) {
        ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/snapshot.min.css' }, $scope) : $css.bind({ href: '../Content/Css/snapshot.css' }, $scope);
        let filterPanelScope = $scope.$parent;
        let layoutScope = $scope.$parent.$parent.$parent;
        let topMenuScope = $scope.$parent.$parent;
        let selectedModule = topMenuScope.modules[0];
        selectedModule.isActive = true;
        filterPanelScope.clearAll();
        filterPanelScope.openFilterPanel(false);
        $scope.PopUpActive = false;
        $scope.ModuleRequestToDB = {}
        $scope.popupData = {};
        $scope.WidgetIds = [1, 2, 3, 4];
        $scope.IsDataLabelVisible = false;
        $scope.IsDataLabelVisiblePopUp = false;
        $scope.OutputCompareName = "";
        $scope.IsMultiSnapshot = true;
        $scope.IsDemographicSingle = false;
        $scope.IsLTAPOPUpOpen = false;
        $scope.animation = true;

        $scope.SnapShotMultiRePlot = function () {
            if ($scope.IsMultiSnapshot) {
                DrawChart("Widget1", 1, $scope.widgetData[0].WidgetData.Series, $scope.widgetData[0].WidgetData.Categories, $scope.widgetData[0].WidgetData.isLowSampleSize, $scope.IsDataLabelVisible, $scope.OutputCompareName, false);
                DrawChart("Widget2", 2, $scope.widgetData[1].WidgetData.Series, $scope.widgetData[1].WidgetData.Categories, $scope.widgetData[1].WidgetData.isLowSampleSize, $scope.IsDataLabelVisible, $scope.OutputCompareName, false);
                DrawChart("Widget3", 3, $scope.widgetData[2].WidgetData.Series, $scope.widgetData[2].WidgetData.Categories, $scope.widgetData[2].WidgetData.isLowSampleSize, $scope.IsDataLabelVisible, $scope.OutputCompareName, false);
                DrawChart("Widget4", 4, $scope.widgetData[3].WidgetData.Series, $scope.widgetData[3].WidgetData.Categories, $scope.widgetData[3].WidgetData.isLowSampleSize, $scope.IsDataLabelVisible, $scope.OutputCompareName, false);
            }
        };

        $scope.SnapShotSingleRePlot = function () {
            if (!$scope.IsMultiSnapshot && !$scope.IsDemographicSingle) {
                DrawChart("Widget5", 5, $scope.widgetData[0].WidgetData.Series, $scope.widgetData[0].WidgetData.Categories, $scope.widgetData[0].WidgetData.isLowSampleSize, $scope.IsDataLabelVisible, $scope.OutputCompareName, false);
                DrawChart("Widget6", 6, $scope.widgetData[1].WidgetData.Series, $scope.widgetData[1].WidgetData.Categories, $scope.widgetData[1].WidgetData.isLowSampleSize, $scope.IsDataLabelVisible, $scope.OutputCompareName, false);
                DrawChart("Widget7", 7, $scope.widgetData[2].WidgetData.Series, $scope.widgetData[2].WidgetData.Categories, $scope.widgetData[2].WidgetData.isLowSampleSize, $scope.IsDataLabelVisible, $scope.OutputCompareName, false);
                DrawChart("Widget8", 8, $scope.widgetData[3].WidgetData.Series, $scope.widgetData[3].WidgetData.Categories, $scope.widgetData[3].WidgetData.isLowSampleSize, $scope.IsDataLabelVisible, $scope.OutputCompareName, false);
                DrawChart("Widget9", 9, $scope.widgetData[4].WidgetData.Series, $scope.widgetData[4].WidgetData.Categories, $scope.widgetData[4].WidgetData.isLowSampleSize, $scope.IsDataLabelVisible, $scope.OutputCompareName, false);
                DrawChart("Widget10", 10, $scope.widgetData[5].WidgetData.Series, $scope.widgetData[5].WidgetData.Categories, $scope.widgetData[5].WidgetData.isLowSampleSize, $scope.IsDataLabelVisible, $scope.OutputCompareName, false);
                DrawChart("Widget11", 11, $scope.widgetData[6].WidgetData.Series, $scope.widgetData[6].WidgetData.Categories, $scope.widgetData[6].WidgetData.isLowSampleSize, $scope.IsDataLabelVisible, $scope.OutputCompareName, false);
            }
        };

        $scope.SnapshotDemoSingleRePlot = function () {
            if (!$scope.IsMultiSnapshot && $scope.IsDemographicSingle) {
                DrawChart("Widget12", 12, $scope.widgetData[0].WidgetData.Series, $scope.widgetData[0].WidgetData.Categories, $scope.widgetData[0].WidgetData.isLowSampleSize, $scope.IsDataLabelVisible, $scope.OutputCompareName, false);
                DrawChart("Widget13", 13, $scope.widgetData[1].WidgetData.Series, $scope.widgetData[1].WidgetData.Categories, $scope.widgetData[1].WidgetData.isLowSampleSize, $scope.IsDataLabelVisible, $scope.OutputCompareName, false);
                DrawChart("Widget14", 14, $scope.widgetData[2].WidgetData.Series, $scope.widgetData[2].WidgetData.Categories, $scope.widgetData[2].WidgetData.isLowSampleSize, $scope.IsDataLabelVisible, $scope.OutputCompareName, false);
            }
        }

        let getColumnName = function (CompareName, TimePeriod, PrimaryBrandName, CategoryName, BrandName, ChannelName) {
            let Compare = CompareName.split('-');
            var cName = '';
            if (Compare[1].toLowerCase() == 'single') {
                if (Compare[0].toLowerCase() == "category")  //Category's
                {
                    cName = 'CategoryName';
                    $scope.OutputCompareName = "category";
                    $scope.widgetData[0].WidgetTitle = "Measure Tree - " + CategoryName+" (" + ((TimePeriod != null && TimePeriod != "") ? TimePeriod : "") + ") ";
                    $scope.widgetData[1].WidgetTitle = "Contribution - " + CategoryName + " (By Time Period)";
                    $scope.widgetData[2].WidgetTitle = "Category Map";
                    $scope.widgetData[3].WidgetTitle = "Value (000 €)";
                    $scope.widgetData[5].WidgetTitle = "Volume (000 Kg)";
                    $scope.widgetData[4].WidgetTitle = "Penetration";
                    $scope.widgetData[6].WidgetTitle = "Frequency";

                }
                else if (Compare[0].toLowerCase() == "brands")  //Brands
                {
                    $scope.OutputCompareName = "brands";
                    cName = 'BrandName';
                    $scope.widgetData[0].WidgetTitle = "Measure Tree - " + BrandName+" (" + ((TimePeriod != null && TimePeriod != "") ? TimePeriod : "") + ")";
                    $scope.widgetData[1].WidgetTitle = "Contribution - " + BrandName+" (By Time Period)";
                    $scope.widgetData[2].WidgetTitle = "Brand Map";
                    $scope.widgetData[3].WidgetTitle = "Value (000 €)";
                    $scope.widgetData[5].WidgetTitle = "Volume (000 Kg)";
                    $scope.widgetData[4].WidgetTitle = "Penetration";
                    $scope.widgetData[6].WidgetTitle = "Frequency";

                }
                else if (Compare[0].toLowerCase() == "channel/retailer") {  //Channel's
                    cName = 'ChannelName';
                    $scope.OutputCompareName = "channel/retailer";
                    $scope.widgetData[0].WidgetTitle = "Measure Tree - " + ChannelName+" (" + ((TimePeriod != null && TimePeriod != "") ? TimePeriod : "") + ")";
                    $scope.widgetData[1].WidgetTitle = "Contribution - " + ChannelName+" (By Time Period) ";
                    $scope.widgetData[2].WidgetTitle = "Channel/Retailer Map";
                    $scope.widgetData[3].WidgetTitle = "Value (000 €)";
                    $scope.widgetData[5].WidgetTitle = "Volume (000 Kg)";
                    $scope.widgetData[4].WidgetTitle = "Penetration";
                    $scope.widgetData[6].WidgetTitle = "Frequency";
                }
                else if (Compare[0].toLowerCase() == "demographics") {  //Demographics
                    cName = 'DemographicName';
                    $scope.OutputCompareName = "demographics";
                    $scope.widgetData[0].WidgetTitle = "Value (000 €) By Demog Splits - " + PrimaryBrandName;
                    $scope.widgetData[1].WidgetTitle = "Which Splits Drive Growth? - " + PrimaryBrandName;
                    $scope.widgetData[2].WidgetTitle = "Value (000 €) Splits"// - " + TimePeriod;
                }
            }
            else if (Compare[1].toLowerCase() == 'multi') {
                if (Compare[0].toLowerCase() == "category")  //Category's
                {
                    cName = 'CategoryName';
                    $scope.OutputCompareName = "category";
                    $scope.widgetData[0].WidgetTitle = "Contribution by Category";
                    $scope.widgetData[1].WidgetTitle = "Category Map";
                    $scope.widgetData[2].WidgetTitle = "Category Share of Selection";
                    $scope.widgetData[3].WidgetTitle = "Trended Performance";
                }
                else if (Compare[0].toLowerCase() == "brands")  //Brands
                {
                    $scope.OutputCompareName = "brands";
                    $scope.widgetData[0].WidgetTitle = "Contribution by Brand";
                    $scope.widgetData[1].WidgetTitle = "Product Map";
                    $scope.widgetData[2].WidgetTitle = "Brand Share of Category";
                    $scope.widgetData[3].WidgetTitle = "Trended Performance";
                    cName = 'BrandName';

                }
                else if (Compare[0].toLowerCase() == "channel/retailer") {  //Channel's
                    cName = 'ChannelName';
                    $scope.OutputCompareName = "channel/retailer";
                    $scope.widgetData[0].WidgetTitle = "Contribution by Channel/Retailer";
                    $scope.widgetData[1].WidgetTitle = "Channel/Retailer Map";
                    $scope.widgetData[2].WidgetTitle = "Channel/Retailer Share of Total Channel/Retailer";
                    $scope.widgetData[3].WidgetTitle = "Trended Performance";
                }
            }
            return cName;
        }

        let Fill_WidgetData = function (data, response) {
            if ($scope.IsMultiSnapshot) {
                if (data == null) {
                    data = [{}, {}, {}, {}]
                    return [{ widgetId: 1, WidgetName: "Widget1", WidgetData: data[0], WidgetTitle: "Title of this widget" },
                    { widgetId: 2, WidgetName: "Widget2", WidgetData: data[1], WidgetTitle: "Title of this widget" },
                    { widgetId: 3, WidgetName: "Widget3", WidgetData: data[2], WidgetTitle: "Title of this widget" },
                    { widgetId: 4, WidgetName: "Widget4", WidgetData: data[3], WidgetTitle: "Title of this widget" }];
                }
                else {
                    $scope.widgetData[0].WidgetData = data[0];
                    $scope.widgetData[1].WidgetData = data[1];
                    $scope.widgetData[2].WidgetData = data[2];
                    $scope.widgetData[3].WidgetData = data[3];
                    return $scope.widgetData;
                }
            }
            else {
                if ($scope.IsDemographicSingle) {
                    if (data == null) {
                        data = [{}, {}, {}]
                        return [{ widgetId: 12, WidgetName: "Widget12", WidgetData: data[0], WidgetTitle: "Title of this widget" },
                        { widgetId: 13, WidgetName: "Widget13", WidgetData: data[1], WidgetTitle: "Title of this widget" },
                        { widgetId: 14, WidgetName: "Widget14", WidgetData: data[2], WidgetTitle: "Title of this widget" },
                        ];
                    }
                    else {
                        $scope.widgetData[0].WidgetData = data[0];
                        $scope.widgetData[1].WidgetData = data[1];
                        $scope.widgetData[2].WidgetData = data[2];
                        return $scope.widgetData;
                    }
                }
                else {
                    if (data == null) {
                        data = [{}, {}, {}, {}, {}, {}, {}]
                        return [{ widgetId: 5, WidgetName: "Widget5", WidgetData: data[0], WidgetTitle: "Title of this widget" },
                        { widgetId: 6, WidgetName: "Widget6", WidgetData: data[1], WidgetTitle: "Title of this widget" },
                        { widgetId: 7, WidgetName: "Widget7", WidgetData: data[2], WidgetTitle: "Title of this widget" },
                        { widgetId: 8, WidgetName: "Widget8", WidgetData: data[3], WidgetTitle: "Title of this widget" },
                        { widgetId: 9, WidgetName: "Widget9", WidgetData: data[4], WidgetTitle: "Title of this widget" },
                        { widgetId: 10, WidgetName: "Widget10", WidgetData: data[5], WidgetTitle: "Title of this widget" },
                        { widgetId: 11, WidgetName: "Widget11", WidgetData: data[6], WidgetTitle: "Title of this widget" }];
                    }
                    else {
                        $scope.widgetData[0].WidgetData = data[0];
                        $scope.widgetData[1].WidgetData = data[1];
                        $scope.widgetData[2].WidgetData = data[2];
                        $scope.widgetData[3].WidgetData = data[3];
                        $scope.widgetData[4].WidgetData = data[4];
                        $scope.widgetData[5].WidgetData = data[5];
                        $scope.widgetData[6].WidgetData = data[6];
                        return $scope.widgetData;
                    }
                }

            }
        }

        let getOutput = function (data) {
            $scope.showOutput = true;
            layoutScope.setLoader(true);
            filterPanelScope.openFilterPanel(false);
            $scope.IsMultiSnapshot = data.SnapshotTypeName.split("-")[1].toLowerCase() == "multi";
            $scope.IsDemographicSingle = data.SnapshotTypeName.toLowerCase() == "demographics-single";
            $scope.IsCategoryMultiLTA = ((data.SnapshotTypeName.toLowerCase() == "category-multi") && (data.TimePeriodId == "-1001" || data.TimePeriodId == "-1002" || data.TimePeriodId == "-1003" || data.TimePeriodId == "-1004"));
            $scope.IsLTAPOPUpOpen = false;
            $scope.widgetData = Fill_WidgetData(null, data);
            data.CompareName = getColumnName(data.SnapshotTypeName, data.TimePeriodName, data.PrimaryBrandName, data.CategoryName, data.BrandName, data.ChannelName);
            AjaxService.AjaxPost(data, apiUrl + "/" + selectedModule.Name.replace(" ", "") + "/" + "GetChartOutput", PrepareChartOutput, errorFunction);
            $scope.ModuleRequestToDB = data;
        }



        let PrepareChartOutput = function (response) {
            if (topMenuScope.isSlideUpdate) {
                $scope.animation = false;
                if (topMenuScope.SlideDetails[0].AddtionalInfo.popupId != -1) {
                    $scope.IsDataLabelVisiblePopUp = topMenuScope.SlideDetails[0].AddtionalInfo.isShowDataLabel;
                }
                else {
                    $scope.IsDataLabelVisible = topMenuScope.SlideDetails[0].AddtionalInfo.isShowDataLabel;
                }
            }
            layoutScope.setLoader(true);
            $scope.outputData = response.data;
            $scope.widgetData = Fill_WidgetData(response.data, response);
            filterPanelScope.setIsSelectedFiltersChanged(false);
            if ($scope.IsMultiSnapshot) {
                $scope.WidgetIds = [1, 2, 3, 4];
                if (response.data.length > 0) {
                    filterPanelScope.setLowSampleSizeFlag($scope.widgetData[0].WidgetData.isLowSampleSize || $scope.widgetData[1].WidgetData.isLowSampleSize || $scope.widgetData[2].WidgetData.isLowSampleSize || $scope.widgetData[3].WidgetData.isLowSampleSize);
                    $scope.SnapShotMultiRePlot();
                    layoutScope.setLoader(false);
                }
                else {
                    DrawChart("Widget1", 1, [], [], null, $scope.IsDataLabelVisible, $scope.OutputCompareName, false);
                    DrawChart("Widget2", 2, [], [], null, $scope.IsDataLabelVisible, $scope.OutputCompareName, false);
                    DrawChart("Widget3", 3, [], [], null, $scope.IsDataLabelVisible, $scope.OutputCompareName, false);
                    DrawChart("Widget4", 4, [], [], null, $scope.IsDataLabelVisible, $scope.OutputCompareName, false);
                    layoutScope.customAlert("Something went wrong. Please refresh the screen and try. If it is occuring again, please contact support team.");
                    layoutScope.setLoader(false);
                }
            }
            else if (!$scope.IsMultiSnapshot && !$scope.IsDemographicSingle) {
                $scope.WidgetIds = [5, 6, 7, 8, 9, 10, 11];
                if (response.data.length > 0) {
                    filterPanelScope.setLowSampleSizeFlag($scope.widgetData[0].WidgetData.isLowSampleSize || $scope.widgetData[1].WidgetData.isLowSampleSize || $scope.widgetData[2].WidgetData.isLowSampleSize || $scope.widgetData[3].WidgetData.isLowSampleSize || $scope.widgetData[4].WidgetData.isLowSampleSize || $scope.widgetData[5].WidgetData.isLowSampleSize || $scope.widgetData[6].WidgetData.isLowSampleSize);
                    $scope.SnapShotSingleRePlot();
                    layoutScope.setLoader(false);
                }
                else {
                    DrawChart("Widget5", 5, [], [], null, $scope.IsDataLabelVisible, $scope.OutputCompareName, false);
                    DrawChart("Widget6", 6, [], [], null, $scope.IsDataLabelVisible, $scope.OutputCompareName, false);
                    DrawChart("Widget7", 7, [], [], null, $scope.IsDataLabelVisible, $scope.OutputCompareName, false);
                    DrawChart("Widget8", 8, [], [], null, $scope.IsDataLabelVisible, $scope.OutputCompareName, false);
                    DrawChart("Widget9", 9, [], [], null, $scope.IsDataLabelVisible, $scope.OutputCompareName, false);
                    DrawChart("Widget10", 10, [], [], null, $scope.IsDataLabelVisible, $scope.OutputCompareName, false);
                    DrawChart("Widget11", 11, [], [], null, $scope.IsDataLabelVisible, $scope.OutputCompareName, false);
                    layoutScope.customAlert("Something went wrong. Please refresh the screen and try. If it is occuring again, please contact support team.");
                    layoutScope.setLoader(false);
                }
            }
            else if (!$scope.IsMultiSnapshot && $scope.IsDemographicSingle) {
                $scope.WidgetIds = [12, 13, 14];
                if (response.data.length > 0) {
                    filterPanelScope.setLowSampleSizeFlag($scope.widgetData[0].WidgetData.isLowSampleSize || $scope.widgetData[1].WidgetData.isLowSampleSize || $scope.widgetData[2].WidgetData.isLowSampleSize);
                    $scope.SnapshotDemoSingleRePlot();
                    layoutScope.setLoader(false);
                }
                else {
                    DrawChart("Widget12", 12, [], [], null, $scope.IsDataLabelVisible, $scope.OutputCompareName, false);
                    DrawChart("Widget13", 13, [], [], null, $scope.IsDataLabelVisible, $scope.OutputCompareName, false);
                    DrawChart("Widget14", 14, [], [], null, $scope.IsDataLabelVisible, $scope.OutputCompareName, false);
                    layoutScope.customAlert("Something went wrong. Please refresh the screen and try. If it is occuring again, please contact support team.");
                    layoutScope.setLoader(false);
                }
            }
            else {
                layoutScope.setLoader(false);
            }
            if (topMenuScope.isSlideUpdate) {
                if (topMenuScope.SlideDetails[0].AddtionalInfo.popupId != -1) {
                    var index = _.findIndex($scope.widgetData, function (obj) { return obj.widgetId == topMenuScope.SlideDetails[0].AddtionalInfo.popupId });
                    $scope.OpenPopUp($scope.widgetData[index]);
                }
                setTimeout(function () { filterPanelScope.ApplyModuleCustomizationStoryBoard(); $scope.PopUpActive = false }, 1000);
            }
            if (layoutScope.StoryBoardSlideNavigationDetails.isNavigated) {
                if (layoutScope.StoryBoardSlideNavigationDetails.AddtionalInfo.popupId != -1) {
                    var index = _.findIndex($scope.widgetData, function (obj) { return obj.widgetId == layoutScope.StoryBoardSlideNavigationDetails.AddtionalInfo.popupId });
                    $scope.OpenPopUp($scope.widgetData[index]);
                }
                layoutScope.StoryBoardSlideNavigationDetails.isNavigated = false;
                layoutScope.StoryBoardSlideNavigationDetails.Selection = [];
                layoutScope.StoryBoardSlideNavigationDetails.AddtionalInfo = {};
            }
        }

        $scope.ShowHideDataLabel = function () {
            $scope.IsDataLabelVisible = !$scope.IsDataLabelVisible
            if ($scope.IsMultiSnapshot) {
                $scope.SnapShotMultiRePlot();
            }
            else if (!$scope.IsMultiSnapshot && !$scope.IsDemographicSingle) {
                $scope.SnapShotSingleRePlot();
            }
            else if (!$scope.IsMultiSnapshot && $scope.IsDemographicSingle) {
                $scope.SnapshotDemoSingleRePlot();
            }
        }

        let errorFunction = function (error) {
            console.log(error);
            layoutScope.customAlert("Something went wrong. Please refresh the screen and try. If it is occuring again, please contact support team.");
            $scope.showOutput = false;
            layoutScope.setLoader(false);
            filterPanelScope.openFilterPanel(true);
        }

        filterPanelScope.callChildGetOutput(getOutput);

        $scope.ExportToPPT = function (id) {
            if (filterPanelScope.isSelectedFiltersChanged) {
                layoutScope.customAlert(Constants.EXPORT_SELECTIONS_CHANGED, Constants.EXPORT_ALERT_HEADER, null, null, Constants.OK_TEXT);
                return;
            }
            layoutScope.setLoader(true);
            var data = {};
            data = $scope.ModuleRequestToDB;
            data.ExportsType = Constants.PPT_TEXT;
            data.FooterText = topMenuScope.getFooterText();
            if (!layoutScope.validateSession()) {
                return;
            }
            var sContainer = angular.element(id);
            var svgElements = angular.element('svg');

            //Replacing warning icon svg with png
            angular.element(id).find('.Warning_Icon').addClass('Warning_Icon_png');

            //svg to canvas conversion
            svgElements.each(function () {
                var canvas, xml;
                canvas = document.createElement("canvas");

                //convert SVG into a XML string
                xml = (new XMLSerializer()).serializeToString(this);

                // Removing the name space as IE throws an error
                xml = xml.replace(/xmlns=\"http:\/\/www\.w3\.org\/2000\/svg\"/, '');
                xml = xml.replace(/xlink:href/g, '');

                //draw the SVG onto a canvas
                canvg(canvas, xml);

                $(canvas).insertAfter(this);
                //hide the SVG element
                $(this).hide();
            });

            //canvas to Base64 encoding
            html2canvas($(sContainer), {
                allowTaint: true,
                letterRendering: true,
                onrendered: function (canvas) {
                    var base64 = canvas.toDataURL();
                    base64 = base64.replace('data:image/png;base64,', '');
                    data.imgBase64 = base64;
                    AjaxService.AjaxPost(data, apiUrl + "/" + selectedModule.ModuleName.toLowerCase() + "/" + "ExportPPTExcel", layoutScope.DownloadFile, layoutScope.ErrorDownloading);
                    $(sContainer).find('canvas').remove();
                    //Removing png image of warning icon
                    angular.element(id).find('.Warning_Icon').removeClass('Warning_Icon_png');
                    $('svg').show();
                }
            });

        }

        $scope.ExportToExcel = function () {
            if (filterPanelScope.isSelectedFiltersChanged) {
                layoutScope.customAlert(Constants.EXPORT_SELECTIONS_CHANGED, Constants.EXPORT_ALERT_HEADER, null, null, Constants.OK_TEXT);
                return;
            }
            var request = {};
            request = $scope.ModuleRequestToDB;
            request.ExportsType = Constants.EXCEL_TEXT;
            request.ChartTitles = [];
            request.SheetNames = [];
            for (var i = 0; i < $scope.WidgetIds.length; i++) {
                request.ChartTitles[i] = $scope.widgetData.filter(function (d) { return d.widgetId == Number($scope.WidgetIds[i]) })[0].WidgetTitle;
                request.SheetNames[i] = $scope.widgetData.filter(function (d) { return d.widgetId == Number($scope.WidgetIds[i]) })[0].WidgetTitle;;
            }
            for (var i = 0; i < request.SheetNames.length; i++) {
                if (request.SheetNames[i].indexOf(Constants.CONTRIBUTION_TEXT) != -1) {
                    request.SheetNames[i] = request.SheetNames[i].replace(Constants.CONTRIBUTION_TEXT, Constants.CONTRIBUTION_TEXT_SHORT);
                }
                if (request.SheetNames[i].indexOf(Constants.CHANNEL_RETAILER_SLASH_TEXT) != -1) {
                    request.SheetNames[i] = request.SheetNames[i].replace(Constants.CHANNEL_RETAILER_SLASH_TEXT, Constants.CHANNEL_RETAILER_UNDERSCORE_TEXT);
                }
            }
            request.WidgetIds = angular.copy($scope.WidgetIds);

            //Adjusting widget ids from 1 so as to pick excel sheets easily on server side and chart titles
            if (request.SnapshotTypeName.indexOf(Constants.SNAPSHOT_DEMOG_TEXT) != -1 && request.SnapshotTypeName.indexOf(Constants.SNAPSHOT_SINGLE_TEXT) != -1) {
                for (var i = 0; i < request.WidgetIds.length; i++) {
                    request.WidgetIds[i] = request.WidgetIds[i] - 11;
                }
                for (var i = 0; i < request.ChartTitles.length; i++) {
                    if (request.ChartTitles[i].indexOf(Constants.SPLITS_DRIVE_TEXT) != -1) {
                        request.ChartTitles[i] = Constants.PRODUCT_MAP_TEXT;
                    }
                    if (request.ChartTitles[i].indexOf(Constants.VALUE_SPLIT_TEXT) != -1) {
                        request.ChartTitles[i] = Constants.PRODUCT_VALUE_SPLIT_TEXT;
                    }
                }
                //Adjusting sheetnames so as to delete if single widget id is selected
                for (var i = 0; i < request.SheetNames.length; i++) {
                    request.SheetNames[i] = request.SheetNames[i].split(' - ')[0];
                }
            }
            else if (request.SnapshotTypeName.indexOf(Constants.SNAPSHOT_SINGLE_TEXT) != -1) {
                for (var i = 0; i < request.WidgetIds.length; i++) {
                    request.WidgetIds[i] = request.WidgetIds[i] - 4;
                }
            }

            request.FooterText = topMenuScope.getFooterText();
            layoutScope.setLoader(true);
            if (!layoutScope.validateSession()) {
                return;
            }
            AjaxService.AjaxPost(request, apiUrl + "/" + selectedModule.ModuleName.toLowerCase() + "/" + "ExportPPTExcel", layoutScope.DownloadFile, layoutScope.ErrorDownloading);
        }

        $scope.TrimString = function (str, len) {
            let maxLength = len === null ? 25 : len;
            if (str != null && str != '' && str.length - 2 > maxLength) {
                return str.slice(0, maxLength) + "...";
            }
            return str;
        }

        let numberWithCommas = function (x) {
            var parts = x.toString().split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return parts.join(".");
        }

        let DrawChart = function (container, chartType, Series, Categories, isLowSampleSize, ShowDataLabel, OutputCompareName, InExpandPopUp) {
            var reflow = false;
            var chart = {
                reflow: reflow,
                style: {
                    fontFamily: "Montserrat"
                }
            };
            var title = {
                text: ''
            };
            var subtitle = {
                text: ''
            };
            var xAxis = {};
            var yAxis = {};
            var tooltip = {};
            var legend = {};
            var series = [];
            var plotOptions = {};
            var credits = { enabled: false };
            var annotations = [];
            let additionalfunction = function () {

            }
            switch (chartType) {
                case 1:
                    chart = {
                        reflow: reflow,
                        style: {
                            fontFamily: "Montserrat"
                        },
                        marginTop: 25,
                        paddingTop: 0
                    };
                    xAxis = {
                        categories: _.cloneDeep(Categories),
                        labels: {
                            useHTML: true,
                            formatter: function () {
                                let labelText = '<div class="labelMain"> \
                                <div class="labelText" title="' + this.value + '">' + this.value + '</div> \
                                <div class="labelLine"></div></div>';
                                if ($scope.IsCategoryMultiLTA == true) {
                                    let t = _.find($scope.outputData[4].Series, { 'category': this.value });
                                    if (t != undefined) labelText += "<div class='labelText labelMain 'title='" + t.LTA + "'>" + t.LTA + "</div>";
                                }
                                return labelText;
                            },
                            autoRotationLimit: 40
                        },
                        shadow: true,
                        startOnTick: false,
                        endOnTick: false,
                        minorTickLength: 0,
                        tickLength: 0,
                        lineWidth: 0,
                        minorGridLineWidth: 0,
                    };
                    yAxis = [{ // prime yAxis
                        gridLineColor: 'rgba(183, 183, 183, 0.5)',
                        gridLineDashStyle: 'Dot',
                        title: {
                            text: 'CONTRIBUTION INDEX vs YA',
                        },
                        tickPositioner: function () {
                            var maxDeviation = Math.ceil(Math.max(Math.abs(this.dataMax), Math.abs(this.dataMin)));
                            var halfMaxDeviation = Math.ceil(maxDeviation / 2);

                            if (this.dataMax == null) { return []; }
                            else if (this.dataMax == 0 && this.dataMin == 0) { return [0.2, 0.1, 0, -0.1, -0.2]; }
                            else { return [-maxDeviation, -halfMaxDeviation, 0, halfMaxDeviation, maxDeviation]; }
                        },
                        plotLines: [{
                            color: 'rgba(183, 183, 183, 0.9)',
                            width: 1,
                            value: 0
                        }],
                        labels: {
                            formatter: function () {
                                return numberWithCommas(this.value) + '%';
                            },
                            style: {
                                "font-family": "Montserrat"
                            }
                        }
                    }, { // second yAxis
                        gridLineWidth: 0,
                        title: {
                            text: '% CHANGE IN SPEND vs YA',
                            style: {
                                color: Highcharts.getOptions().colors[1]
                            }
                        },
                        tickPositioner: function () {
                            var maxDeviation = Math.ceil(Math.max(Math.abs(this.dataMax), Math.abs(this.dataMin)));
                            var halfMaxDeviation = Math.ceil(maxDeviation / 2);
                            if (this.dataMax == null) { return []; }
                            else if (this.dataMax == 0 && this.dataMin == 0) { return [0.2, 0.1, 0, -0.1, -0.2]; }
                            else { return [-maxDeviation, -halfMaxDeviation, 0, halfMaxDeviation, maxDeviation]; }
                        },
                        labels: {
                            formatter: function () {
                                return numberWithCommas(this.value) + '%';
                            },
                            style: {
                                "font-family": "Montserrat"
                            }
                        },
                        opposite: true,
                    }];
                    series = _.cloneDeep(Series);
                    plotOptions = {
                        column: {
                            stacking: 'normal',
                            dataLabels: {
                                enabled: ShowDataLabel,
                                style: {
                                    fontWeight: 'normal'
                                },
                                backgroundColor: 'rgba(252, 255, 255, 0.8)',
                                color: 'black',
                                crop: false,
                                padding: 3,
                                borderWidth: 1,
                                overflow: 'justify',
                                borderColor: '#AAA',
                                allowOverlap: true,
                                useHTML: true,
                                formatter: function () {
                                    var html = "";
                                    var minSampleSize = Constants.Low_SampleSize_Value;
                                    var maxSampleSize = Constants.SampleSize_Value;
                                    if (this.point.SampleSize < minSampleSize || this.point.y == null) {
                                        return null;
                                    }
                                    else if (this.point.y == 0) {
                                        return null;
                                    }
                                    else if (this.point.SampleSize >= minSampleSize && this.point.SampleSize < maxSampleSize) {
                                        html += '<span style="color:grey;">' + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    else {
                                        html += '<span style="color:black;">' + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    return html;
                                }
                            }
                        },
                        line: {
                            dataLabels: {
                                enabled: ShowDataLabel,
                                style: {
                                    fontWeight: 'normal'
                                },
                                backgroundColor: 'rgba(252, 255, 255, 0.8)',
                                color: 'black',
                                crop: false,
                                padding: 3,
                                borderWidth: 1,
                                allowOverlap: true,
                                borderColor: '#AAA',
                                overflow: 'justify',
                                useHTML: true,
                                formatter: function () {
                                    var html = "";
                                    var minSampleSize = Constants.Low_SampleSize_Value;
                                    var maxSampleSize = Constants.SampleSize_Value;
                                    if (this.point.SampleSize < minSampleSize || this.point.y == null) {
                                        return null;
                                    }
                                    else if (this.point.SampleSize >= minSampleSize && this.point.SampleSize < maxSampleSize) {
                                        html += '<span style="color:grey;">' + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    else {
                                        html += '<span style="color:black;">' + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    return html;
                                }
                            }
                        },
                        series: {
                            animation: $scope.animation
                        }
                    };
                    tooltip = {
                        useHTML: true,
                        formatter: function () {
                            let returnHTML = "";
                            if (this.point.SampleSize < 70) {
                                returnHTML += "<div style='color:grey;font-weight:normal;'>" + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + "</div>";
                            }
                            else {
                                returnHTML += "<div>" + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + "</div>";
                            }
                            return "<div class='chart-tooltip'>" + returnHTML + "</div>";
                        },
                        snap: 0,
                    };
                    legend = {
                        align: 'center',
                        useHTML: true,
                        labelFormatter: function () {
                            if (InExpandPopUp) {
                                return '<div title="' + this.name + '">' + this.name + '</div>';
                            }
                            else {
                                return '<div title="' + this.name + '">' + $scope.TrimString(this.name) + '</div>';
                            }
                        }
                    };
                    additionalfunction = function (chart) {
                        if (chart.series.length > 0) {
                            if (isLowSampleSize) chart.renderer.html('<div class="Warning_Icon" title="Low Sample Size"></div>', 0, chart.chartHeight - 7).attr({ zIndex: 5 }).add();
                        }
                        else {
                            chart.renderer.text('No Data Available', (chart.chartWidth / 2) - 100, chart.chartHeight / 2)
                            .css({
                                color: '#303030',
                                fontSize: '16px'
                            })
                            .add();
                        }
                    }
                    break;
                case 2:
                    chart = {
                        type: 'bubble',
                        reflow: reflow,
                        style: {
                            fontFamily: "Montserrat"
                        }
                    };
                    xAxis = {
                        title: {
                            text: 'PENETRATION',
                        },
                        labels: {
                            format: '{value}%',
                            style: {
                                "font-family": "Montserrat",
                            }
                        },
                        shadow: true,
                        alternateGridColor: '#f9f9f9',
                    };
                    yAxis = {
                        labels: {
                            formatter: function () {
                                return numberWithCommas(this.value);
                            },
                            style: {
                                "font-family": "Montserrat",
                            }
                        },
                        title: {
                            text: 'FREQUENCY'
                        },
                        gridLineColor: 'rgba(183, 183, 183, 0.5)',
                        gridLineDashStyle: 'dot'
                    };
                    legend = {
                        align: 'center',
                        useHTML: true,
                        labelFormatter: function () {
                            let labelText = "";
                            if (InExpandPopUp) {
                                labelText = '<div title="' + this.name + '">' + this.name + '</div>';
                            }
                            else {
                                labelText = '<div title="' + this.name + '">' + $scope.TrimString(this.name, 20) + '</div>';
                            }
                            if ($scope.IsCategoryMultiLTA == true) {
                                let t = _.find($scope.outputData[4].Series, { 'category': this.name });
                                if (t != undefined) labelText += "<div class='labelText labelMain 'title='" + t.LTA + "'>" + t.LTA + "</div>";
                            }
                            return labelText;
                        }
                    };
                    plotOptions = {
                        series: {
                            animation: $scope.animation
                        },
                        bubble: {
                            marker: {
                                fillOpacity: 1
                            },
                            dataLabels: {
                                enabled: ShowDataLabel,
                                style: {
                                    fontWeight: 'normal'
                                },
                                backgroundColor: 'rgba(252, 255, 255, 0.8)',
                                color: 'black',
                                crop: false,
                                padding: 3,
                                inside: false,
                                borderWidth: 1,
                                borderColor: '#AAA',
                                overflow: 'justify',
                                shape: 'callout',
                                allowOverlap: true,
                                useHTML: true,
                                formatter: function () {
                                    var html = "";
                                    var minSampleSize = Constants.Low_SampleSize_Value;
                                    var maxSampleSize = Constants.SampleSize_Value;
                                    if (this.series.name == 'AqHacks') {
                                        return null;
                                    }
                                    else if (this.point.SampleSize < minSampleSize || this.point.z == null) {
                                        return null;
                                    }
                                    else if (this.point.SampleSize >= minSampleSize && this.point.SampleSize < maxSampleSize) {
                                        html += '<span style="color:grey;">' + numberWithCommas(this.point.z) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    else {
                                        html += '<span style="color:black;">' + numberWithCommas(this.point.z) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    return html;
                                }
                            }
                        }

                    };
                    tooltip = {
                        useHTML: true,
                        formatter: function () {
                            let returnHTML = "";
                            if (this.point.SampleSize < 70) {
                                returnHTML += "<div style='color:grey;font-weight:normal;'>" + numberWithCommas(this.point.z) + "</div>";
                            }
                            else {
                                returnHTML += "<div>" + numberWithCommas(this.point.z) + "</div>";
                            }
                            return "<div class='chart-tooltip'>" + returnHTML + "</div>";
                        },
                        snap: 0,
                    };
                    series = _.cloneDeep(Series);
                    if (series.length > 0) {
                        var obj = {
                            name: 'AqHacks',
                            data: [{
                                x: series[0].data[0].x,
                                y: series[0].data[0].y,
                                z: 0,
                                "SampleSize": 71
                            }],
                            showInLegend: false,
                            color: 'rgb(255,255,255,0)',
                            marker: {
                                fillOpacity: 0.0,
                                stroke: 'rgb(255,255,255,0)',
                            },
                            enableMouseTracking: false
                        };
                        series.push(obj);
                    }
                    additionalfunction = function (chart) {
                        if (chart.series.length > 0) {
                            if (isLowSampleSize) chart.renderer.html('<div class="Warning_Icon" title="Low Sample Size"></div>', 0, chart.chartHeight - 7).attr({ zIndex: 5 }).add();
                            chart.renderer.html('<div class="ss-widget-note">* Size of ' + OutputCompareName + ' denotes the Value (000 EUR)</div>', 30, chart.chartHeight - 3).attr({ zIndex: 5 }).add();
                        }
                        else {
                            chart.renderer.text('No Data Available', (chart.chartWidth / 2) - 100, chart.chartHeight / 2)
                            .css({
                                color: '#303030',
                                fontSize: '16px'
                            })
                            .add();
                        }
                    }
                    break;
                case 3:
                    chart = {
                        type: 'column',
                        reflow: reflow,
                        style: {
                            fontFamily: "Montserrat"
                        }
                    };

                    if (OutputCompareName.toLowerCase() == "category") {
                        yAxis = {
                            gridLineDashStyle: 'dot',
                            title: { text: '' },
                            labels: {
                                formatter: function () {
                                    return numberWithCommas(this.value) + '%';
                                },
                                style: {
                                    "font-family": "Montserrat",
                                }
                            }
                        }
                    }
                    else {
                        yAxis = {
                            gridLineDashStyle: 'dot',
                            title: { text: '' },
                            labels: {
                                formatter: function () {
                                    return numberWithCommas(this.value);
                                },
                                style: {
                                    "font-family": "Montserrat",
                                }
                            }
                        }
                    }
                    xAxis = {
                        categories: _.cloneDeep(Categories),
                        labels: {
                            format: '{value}',
                            style: {
                                "font-family": "Montserrat",
                            }
                        }
                    }
                    plotOptions = {
                        column: {
                            stacking: 'normal',
                            dataLabels: {
                                enabled: ShowDataLabel,
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
                                formatter: function () {
                                    var html = "";
                                    var minSampleSize = Constants.Low_SampleSize_Value;
                                    var maxSampleSize = Constants.SampleSize_Value;
                                    if (this.point.SampleSize < minSampleSize || this.point.y == null) {
                                        return null;
                                    }
                                    else if (this.point.y == 0) {
                                        return null;
                                    }
                                    else if (this.point.SampleSize >= minSampleSize && this.point.SampleSize < maxSampleSize) {
                                        html += '<span style="color:grey;">' + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    else {
                                        html += '<span style="color:black;">' + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    return html;
                                }
                            }
                        },
                        series: {
                            animation: $scope.animation
                        }
                    };
                    series = _.cloneDeep(Series);
                    tooltip = {
                        useHTML: true,
                        formatter: function () {
                            let returnHTML = "";
                            if (this.point.SampleSize < 70) {
                                returnHTML += "<div style='color:grey;font-weight:normal;'>" + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + "</div>";
                            }
                            else {
                                returnHTML += "<div>" + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + "</div>";
                            }
                            return "<div class='chart-tooltip'>" + returnHTML + "</div>";
                        },
                        snap: 0,
                    };
                    legend = {
                        align: 'center',
                        useHTML: true,
                        labelFormatter: function () {
                            let labelText = "";
                            if (InExpandPopUp) {
                                labelText = '<div title="' + this.name + '">' + this.name + '</div>';
                            }
                            else {
                                labelText = '<div title="' + this.name + '">' + $scope.TrimString(this.name, 20) + '</div>';
                            }
                            if ($scope.IsCategoryMultiLTA == true) {
                                let t = _.find($scope.outputData[4].Series, { 'category': this.name });
                                if (t != undefined) labelText += "<div class='labelText labelMain 'title='" + t.LTA + "'>" + t.LTA + "</div>";
                            }
                            return labelText;
                        }
                    };
                    additionalfunction = function (chart) {
                        if (chart.series.length == 0) {
                            chart.renderer.text('No Data Available', (chart.chartWidth / 2) - 100, chart.chartHeight / 2)
                            .css({
                                color: '#303030',
                                fontSize: '16px'
                            })
                            .add();
                        }
                        else if (chart.series.length > 0) {
                            if (isLowSampleSize) chart.renderer.html('<div class="Warning_Icon" title="Low Sample Size"></div>', 0, chart.chartHeight - 7).attr({ zIndex: 5 }).add();
                            if (chart.series[0].data.length == 2) {
                                var point1 = chart.series[0].data[0]
                                var point2 = chart.series[0].data[1]
                                chart.renderer.html('<div class="labelMain"><div class="labelText" title="VALUE SHARE">VALUE SHARE</div><div class="labelLine"></div></div>',
                                point1.plotX + chart.plotLeft - 40,
                                chart.plotTop + 1).attr({
                                    zIndex: 5
                                }).add();
                                chart.renderer.html('<div class="labelMain"><div class="labelText" title="VOLUME SHARE">VOLUME SHARE</div><div class="labelLine"></div></div>',
                                    point2.plotX + chart.plotLeft - 40,
                                    chart.plotTop + 1).attr({
                                        zIndex: 5
                                    }).add();
                                chart.renderer.html('<div style="height:' + chart.plotHeight + 'px" class="shadow1"></div>',
                                (point1.plotX + point2.plotX) / 2 + chart.plotLeft - 10,
                                chart.plotTop + 1).attr({
                                }).add();

                            }
                            else if (chart.series[0].data.length == 4) {
                                var point1 = chart.series[0].data[0]
                                var point2 = chart.series[0].data[1]
                                var point3 = chart.series[0].data[2]
                                var point4 = chart.series[0].data[3]
                                chart.renderer.html('<div class="labelMain"><div class="labelText" title="VALUE SHARE">VALUE SHARE</div><div class="labelLine"></div></div>',
                                (point1.plotX + point2.plotX) / 2 + chart.plotLeft - 40,
                                chart.plotTop + 1).attr({
                                    zIndex: 5
                                }).add();
                                chart.renderer.html('<div class="labelMain"><div class="labelText" title="VOLUME SHARE">VOLUME SHARE</div><div class="labelLine"></div></div>',
                                    (point3.plotX + point4.plotX) / 2 + chart.plotLeft - 40,
                                    chart.plotTop + 1).attr({
                                        zIndex: 5
                                    }).add();
                                chart.renderer.html('<div style="height:' + chart.plotHeight + 'px" class="shadow1"></div>',
                                (point2.plotX + point3.plotX) / 2 + chart.plotLeft - 10,
                                chart.plotTop + 1).attr({
                                }).add();

                            }
                        }
                    }
                    break;
                case 4:
                    chart = {
                        type: 'line',
                        reflow: reflow,
                        style: {
                            fontFamily: "Montserrat"
                        }
                    };
                    xAxis = {
                        categories: _.cloneDeep(Categories),
                        alternateGridColor: '#f9f9f9',
                        labels: {
                            useHTML: true,
                            formatter: function () {
                                return '<div class="labelMain"> \
                                <div class="labelText" title="' + this.value + '">' + this.value + '</div> </div>';
                            },
                            autoRotationLimit: 20
                        },
                        minorTickLength: 0,
                        lineWidth: 0,
                        minorGridLineWidth: 0,
                        tickLength: 0,
                    };
                    yAxis = {
                        gridLineWidth: 1,
                        minorGridLineWidth: 1,
                        gridLineDashStyle: 'dot',
                        gridLineColor: 'lightgray',
                        title: { text: 'PENETRATION' },
                        //min: 0,
                        //max: storedItems.MaxYaxisValue,
                        labels: {
                            formatter: function () {
                                return numberWithCommas(this.value) + '%';
                            },
                            style: {
                                "font-family": "Montserrat",
                            }

                        }
                    };
                    plotOptions = {
                        series: {
                            label: {
                                connectorAllowed: false
                            },
                            marker: {
                                symbol: 'circle'
                            },
                            dataLabels: {
                                enabled: ShowDataLabel,
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
                                    var html = "";
                                    var minSampleSize = Constants.Low_SampleSize_Value;
                                    var maxSampleSize = Constants.SampleSize_Value;
                                    if (this.point.SampleSize < minSampleSize || this.point.y == null) {
                                        return null;
                                    }
                                    else if (this.point.y == 0) {
                                        return null;
                                    }
                                    else if (this.point.SampleSize >= minSampleSize && this.point.SampleSize < maxSampleSize) {
                                        html += '<span style="color:grey;">' + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    else {
                                        html += '<span style="color:black;">' + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    return html;
                                }
                            },
                            stickyTracking: false,
                            animation: $scope.animation
                        }
                    };
                    legend = {
                        enabled: true,
                        symbolRadius: 1,
                        symbol: 'circle',
                        align: 'center',
                        useHTML: true,
                        labelFormatter: function () {
                            let labelText = "";
                            if (InExpandPopUp) {
                                labelText = '<div title="' + this.name + '">' + this.name + '</div>';
                            }
                            else {
                                labelText = '<div title="' + this.name + '">' + $scope.TrimString(this.name, 20) + '</div>';
                            }
                            if ($scope.IsCategoryMultiLTA == true) {
                                let t = _.find($scope.outputData[4].Series, { 'category': this.name });
                                if (t != undefined) labelText += "<div class='labelText labelMain 'title='" + t.LTA + "'>" + t.LTA + "</div>";
                            }
                            return labelText;
                        }
                    };
                    series = _.cloneDeep(Series);
                    tooltip = {
                        useHTML: true,
                        formatter: function () {
                            let returnHTML = "";
                            if (this.point.SampleSize < 70) {
                                returnHTML += "<div style='color:grey;font-weight:normal;'>" + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + "</div>";
                            }
                            else {
                                returnHTML += "<div>" + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + "</div>";
                            }
                            return "<div class='chart-tooltip'>" + returnHTML + "</div>";
                        },
                        snap: 0,
                    };
                    additionalfunction = function (chart) {
                        if (chart.series.length > 0) {
                            if (isLowSampleSize) chart.renderer.html('<div class="Warning_Icon" title="Low Sample Size"></div>', 0, chart.chartHeight - 7).attr({ zIndex: 5 }).add();
                        }
                        else {
                            chart.renderer.text('No Data Available', (chart.chartWidth / 2) - 100, chart.chartHeight / 2)
                            .css({
                                color: '#303030',
                                fontSize: '16px'
                            })
                            .add();
                        }
                    }
                    break;
                case 5:
                    chart = {
                        backgroundColor: 'white',
                        reflow: reflow,
                        style: {
                            fontFamily: "Montserrat"
                        }
                    };
                    additionalfunction = function (chart) {
                        if (Series.length > 0) {
                            if (isLowSampleSize) chart.renderer.html('<div class="Warning_Icon" title="Low Sample Size"></div>', 0, chart.chartHeight - 7).attr({ zIndex: 5 }).add();
                            let getx = function (per) { return (chart.chartWidth * per) / 100 }
                            let gety = function (per) { return (chart.chartHeight * per) / 100 }
                            let connect3Box = function (b1, b2, b3, animation) {
                                if (animation) {
                                    let animationtime = 500;
                                    let path1 = chart.renderer.path(['M', b1.x + b1.element.offsetWidth / 2, b1.y + b1.yCorr + b1.element.offsetHeight, 'L', b1.x + b1.element.offsetWidth / 2, b1.y + b1.yCorr + b1.element.offsetHeight]).attr({ 'stroke-width': 1, stroke: 'silver' }).add().animate({ d: ['M', b1.x + b1.element.offsetWidth / 2, b1.y + b1.yCorr + b1.element.offsetHeight, 'L', b1.x + b1.element.offsetWidth / 2, b2.y + b2.yCorr - gety(3)] }, { duration: animationtime });
                                    let path2 = chart.renderer.path(['M', b2.x + b2.element.offsetWidth / 2, b2.y + b2.yCorr - gety(3), 'L', b2.x + b2.element.offsetWidth / 2, b2.y + b2.yCorr - gety(3)]).attr({ 'stroke-width': 1, stroke: 'silver' }).add().animate({ d: ['M', b2.x + b2.element.offsetWidth / 2, b2.y + b2.yCorr - gety(3), 'L', b3.x + b3.element.offsetWidth / 2, b3.y + b3.yCorr - gety(3)] }, { duration: animationtime });
                                    let path3 = chart.renderer.path(['M', b2.x + b2.element.offsetWidth / 2, b2.y + b2.yCorr - gety(3), 'L', b2.x + b2.element.offsetWidth / 2, b2.y + b2.yCorr - gety(3)]).attr({ 'stroke-width': 1, stroke: 'silver' }).add().animate({ d: ['M', b2.x + b2.element.offsetWidth / 2, b2.y + b2.yCorr - gety(3), 'L', b2.x + b2.element.offsetWidth / 2, b2.y + b2.yCorr] }, { duration: animationtime });
                                    let path4 = chart.renderer.path(['M', b3.x + b3.element.offsetWidth / 2, b3.y + b3.yCorr - gety(3), 'L', b3.x + b3.element.offsetWidth / 2, b3.y + b3.yCorr - gety(3)]).attr({ 'stroke-width': 1, stroke: 'silver' }).add().animate({ d: ['M', b3.x + b3.element.offsetWidth / 2, b3.y + b3.yCorr - gety(3), 'L', b3.x + b3.element.offsetWidth / 2, b3.y + b3.yCorr] }, { duration: animationtime });
                                    let path5 = chart.renderer.path(['M', b2.x + b2.element.offsetWidth / 2, b2.y + b2.yCorr, 'L', b2.x + b2.element.offsetWidth / 2, b2.y + b2.yCorr]).attr({ 'stroke-width': 1, stroke: 'silver', fill: "silver" }).add().animate({ d: ['M', b2.x + b2.element.offsetWidth / 2, b2.y + b2.yCorr, 'L', b2.x - gety(1) + b2.element.offsetWidth / 2, b2.y + b2.yCorr - gety(1), 'L', b2.x + gety(1) + b2.element.offsetWidth / 2, b2.y + b2.yCorr - gety(1), 'Z'] }, { duration: animationtime });
                                    let path6 = chart.renderer.path(['M', b3.x + b3.element.offsetWidth / 2, b3.y + b3.yCorr, 'L', b3.x + b3.element.offsetWidth / 2, b3.y + b3.yCorr]).attr({ 'stroke-width': 1, stroke: 'silver', fill: "silver" }).add().animate({ d: ['M', b3.x + b3.element.offsetWidth / 2, b3.y + b3.yCorr, 'L', b3.x - gety(1) + b3.element.offsetWidth / 2, b3.y + b3.yCorr - gety(1), 'L', b3.x + gety(1) + b3.element.offsetWidth / 2, b3.y + b3.yCorr - gety(1), 'Z'] }, { duration: animationtime });
                                }
                                else {
                                    let path1 = chart.renderer.path(['M', b1.x + b1.element.offsetWidth / 2, b1.y + b1.yCorr + b1.element.offsetHeight, 'L', b1.x + b1.element.offsetWidth / 2, b2.y + b2.yCorr - gety(3)]).attr({ 'stroke-width': 1, stroke: 'silver' }).add();
                                    let path2 = chart.renderer.path(['M', b2.x + b2.element.offsetWidth / 2, b2.y + b2.yCorr - gety(3), 'L', b3.x + b3.element.offsetWidth / 2, b3.y + b3.yCorr - gety(3)]).attr({ 'stroke-width': 1, stroke: 'silver' }).add();
                                    let path3 = chart.renderer.path(['M', b2.x + b2.element.offsetWidth / 2, b2.y + b2.yCorr - gety(3), 'L', b2.x + b2.element.offsetWidth / 2, b2.y + b2.yCorr]).attr({ 'stroke-width': 1, stroke: 'silver' }).add();
                                    let path4 = chart.renderer.path(['M', b3.x + b3.element.offsetWidth / 2, b3.y + b3.yCorr - gety(3), 'L', b3.x + b3.element.offsetWidth / 2, b3.y + b3.yCorr]).attr({ 'stroke-width': 1, stroke: 'silver' }).add();
                                    let path5 = chart.renderer.path(['M', b2.x + b2.element.offsetWidth / 2, b2.y + b2.yCorr, 'L', b2.x - gety(1) + b2.element.offsetWidth / 2, b2.y + b2.yCorr - gety(1), 'L', b2.x + gety(1) + b2.element.offsetWidth / 2, b2.y + b2.yCorr - gety(1)], 'Z').attr({ 'stroke-width': 1, stroke: 'silver', fill: "silver" }).add();
                                    let path6 = chart.renderer.path(['M', b3.x + b3.element.offsetWidth / 2, b3.y + b3.yCorr, 'L', b3.x - gety(1) + b3.element.offsetWidth / 2, b3.y + b3.yCorr - gety(1), 'L', b3.x + gety(1) + b3.element.offsetWidth / 2, b3.y + b3.yCorr - gety(1)], 'Z').attr({ 'stroke-width': 1, stroke: 'silver', fill: "silver" }).add();
                                }
                            }

                            let box0 = chart.renderer.html(getTableHtml("Buyers", "KPI", Series, chart), getx(0), gety(2)).add();
                            let box1 = chart.renderer.html(getTableHtml("Spend", "Spend (000 €)", Series, chart), getx(45), gety(4)).add();
                            let box2 = chart.renderer.html(getTableHtml("Volume", "Volume (000 Kg)", Series, chart), getx(10), gety(24)).add();
                            let box3 = chart.renderer.html(getTableHtml("Average Price", "Average Price (€) (Kg)", Series, chart), getx(60), gety(24)).add();
                            let box4 = chart.renderer.html(getTableHtml("Volume per Buyer", "Volume Per Buyers (Kg)", Series, chart), getx(7), gety(44)).add();
                            let box5 = chart.renderer.html(getTableHtml("Buyers", "Buyers (000 HH)", Series, chart), getx(60), gety(44)).add();
                            let box6 = chart.renderer.html(getTableHtml("Frequency", "Frequency", Series, chart), getx(4), gety(64)).add();
                            let box7 = chart.renderer.html(getTableHtml("Volume Per trip", "Volume Per Trip (Kg)", Series, chart), getx(40), gety(64)).add();
                            let box8 = chart.renderer.html(getTableHtml("Penetration", "Penetration %", Series, chart), getx(20), gety(84)).add();
                            let box9 = chart.renderer.html(getTableHtml("Total Households", "Total Households (000 HH)", Series, chart), getx(60), gety(84)).add();
                            if ($scope.animation) {
                                connect3Box(box1, box2, box3, true);
                                setTimeout(function () { connect3Box(box2, box4, box5, true) }, 300);
                                setTimeout(function () { connect3Box(box4, box6, box7, true) }, 500);
                                setTimeout(function () { connect3Box(box5, box8, box9, true) }, 700);
                            }
                            else {
                                connect3Box(box1, box2, box3, false);
                                connect3Box(box2, box4, box5, false);
                                connect3Box(box4, box6, box7, false);
                                connect3Box(box5, box8, box9, false);
                            }
                            chart.renderer.html('<div class="ss-widget-note"><span style="color:green;float:left;font-size:1.4vh;font-weight: bold;">* Change > 3% or > 1pp </span><span style="color:red;left:10%;float:left;position:relative;font-size:1.4vh;font-weight: bold;">* Change < -3% or < -1pp</span></div>', 4, chart.chartHeight - 1).attr({ zIndex: 5 }).add();
                        }
                        else {
                            chart.renderer.text('No Data Available', (chart.chartWidth / 2) - 100, chart.chartHeight / 2)
                            .css({
                                color: '#303030',
                                fontSize: '16px'
                            })
                            .add();
                        }
                    }
                    break;
                case 6:
                    xAxis = {
                        categories: _.cloneDeep(Categories),
                        labels: {
                            useHTML: true,
                            formatter: function () {
                                return '<div class="labelMain"> \
                                    <div class="labelText" title="' + this.value + '">' + this.value + '</div> \
                                    <div class="labelLine"></div></div>';
                            },
                            autoRotationLimit: 20
                        },
                        shadow: true,
                        startOnTick: false,
                        endOnTick: false,
                        minorTickLength: 0,
                        tickLength: 0,
                        lineWidth: 0,
                        minorGridLineWidth: 0,
                    };
                    yAxis = [{ // prime yAxis
                        gridLineColor: 'rgba(183, 183, 183, 0.5)',
                        gridLineDashStyle: 'Dot',
                        title: {
                            text: 'CONTRIBUTION vs YA'
                        },
                        tickPositioner: function () {
                            var maxDeviation = Math.ceil(Math.max(Math.abs(this.dataMax), Math.abs(this.dataMin)));
                            var halfMaxDeviation = Math.ceil(maxDeviation / 2);

                            if (this.dataMax == null) { return []; }
                            else if (this.dataMax == 0 && this.dataMin == 0) { return [0.2, 0.1, 0, -0.1, -0.2]; }
                            else { return [-maxDeviation, -halfMaxDeviation, 0, halfMaxDeviation, maxDeviation]; }
                        },
                        plotLines: [{
                            color: 'rgba(183, 183, 183, 0.9)',
                            width: 1,
                            value: 0
                        }],
                        labels: {
                            formatter: function () {
                                return numberWithCommas(this.value);
                            },
                            style: {
                                "font-family": "Montserrat",
                            }
                        }
                    }, { // second yAxis

                        gridLineWidth: 0,
                        title: {
                            text: '% CHANGE IN SPEND vs YA',
                            style: {
                                color: Highcharts.getOptions().colors[1]
                            }
                        },
                        tickPositioner: function () {
                            var maxDeviation = Math.ceil(Math.max(Math.abs(this.dataMax), Math.abs(this.dataMin)));
                            var halfMaxDeviation = Math.ceil(maxDeviation / 2);

                            if (this.dataMax == null) { return []; }
                            else if (this.dataMax == 0 && this.dataMin == 0) { return [0.2, 0.1, 0, -0.1, -0.2]; }
                            else { return [-maxDeviation, -halfMaxDeviation, 0, halfMaxDeviation, maxDeviation]; }
                        },
                        labels: {
                            formatter: function () {
                                return numberWithCommas(this.value) + '%';
                            },
                            style: {
                                "font-family": "Montserrat",
                            }
                        },
                        opposite: true
                    }];
                    series = _.cloneDeep(Series);
                    plotOptions = {
                        column: {
                            stacking: 'normal',
                            dataLabels: {
                                enabled: ShowDataLabel,
                                style: {
                                    fontWeight: 'normal'
                                },
                                backgroundColor: 'rgba(252, 255, 255, 0.8)',
                                color: 'black',
                                crop: false,
                                padding: 3,
                                borderWidth: 1,
                                borderColor: '#AAA',
                                overflow: 'justify',
                                allowOverlap: true,
                                useHTML: true,
                                formatter: function () {
                                    var html = "";
                                    var minSampleSize = Constants.Low_SampleSize_Value;
                                    var maxSampleSize = Constants.SampleSize_Value;
                                    if (this.point.SampleSize < minSampleSize || this.point.y == null) {
                                        return null;
                                    }
                                    else if (this.point.y == 0) {
                                        return null;
                                    }
                                    else if (this.point.SampleSize >= minSampleSize && this.point.SampleSize < maxSampleSize) {
                                        html += '<span style="color:grey;">' + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    else {
                                        html += '<span style="color:black;">' + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    return html;
                                }
                            }
                        },
                        line: {
                            dataLabels: {
                                enabled: ShowDataLabel,
                                style: {
                                    fontWeight: 'normal'
                                },
                                backgroundColor: 'rgba(252, 255, 255, 0.8)',
                                color: 'black',
                                crop: false,
                                padding: 3,
                                borderWidth: 1,
                                allowOverlap: true,
                                borderColor: '#AAA',
                                overflow: 'justify',
                                useHTML: true,
                                formatter: function () {
                                    var html = "";
                                    var minSampleSize = Constants.Low_SampleSize_Value;
                                    var maxSampleSize = Constants.SampleSize_Value;
                                    if (this.point.SampleSize < minSampleSize || this.point.y == null) {
                                        return null;
                                    }
                                    else if (this.point.SampleSize >= minSampleSize && this.point.SampleSize < maxSampleSize) {
                                        html += '<span style="color:grey;">' + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    else {
                                        html += '<span style="color:black;">' + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    return html;
                                }
                            }
                        },
                        series: {
                            animation: $scope.animation
                        }
                    };
                    tooltip = {
                        useHTML: true,
                        formatter: function () {
                            let returnHTML = "";
                            if (this.point.SampleSize < 70) {
                                returnHTML += "<div style='color:grey;font-weight:normal;'>" + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + "</div>";
                            }
                            else {
                                returnHTML += "<div>" + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + "</div>";
                            }
                            return "<div class='chart-tooltip'>" + returnHTML + "</div>";
                        },
                        snap: 0,
                    };
                    legend = {
                        align: 'center',
                        useHTML: true,
                        labelFormatter: function () {
                            if (InExpandPopUp) {
                                return '<div title="' + this.name + '">' + this.name + '</div>';
                            }
                            else {
                                return '<div title="' + this.name + '">' + $scope.TrimString(this.name, 9) + '</div>';
                            }
                        }
                    };
                    additionalfunction = function (chart) {
                        if (chart.series.length > 0) {
                            if (isLowSampleSize) chart.renderer.html('<div class="Warning_Icon" title="Low Sample Size"></div>', 0, chart.chartHeight - 7).attr({ zIndex: 5 }).add();
                            chart.renderer.html('<div class="ss-widget-note">* Contribution (000).</div>', 30, chart.chartHeight - 3).attr({ zIndex: 5 }).add();
                        }
                        else {
                            chart.renderer.text('No Data Available', (chart.chartWidth / 2) - 100, chart.chartHeight / 2)
                            .css({
                                color: '#303030',
                                fontSize: '16px'
                            })
                            .add();
                        }
                    }
                    break;
                case 7:
                    chart = {
                        type: 'bubble',
                        reflow: reflow,
                        style: {
                            fontFamily: "Montserrat"
                        }
                    };
                    xAxis = {
                        title: {
                            text: 'PENETRATION',
                        },
                        labels: {
                            formatter: function () {
                                return numberWithCommas(this.value) + '%';
                            },
                            style: {
                                "font-family": "Montserrat",
                            }
                        },
                        shadow: true,
                        alternateGridColor: '#f9f9f9',
                    };
                    yAxis = {
                        labels: {
                            formatter: function () {
                                return numberWithCommas(this.value);
                            },
                            style: {
                                "font-family": "Montserrat",
                            }
                        },
                        title: {
                            text: 'FREQUENCY'
                        },
                        gridLineColor: 'rgba(183, 183, 183, 0.5)',
                        gridLineDashStyle: 'dot'
                    };
                    legend = {
                        align: 'center',
                        useHTML: true,
                        labelFormatter: function () {
                            if (InExpandPopUp) {
                                return '<div title="' + this.name + '">' + this.name + '</div>';
                            }
                            else {
                                return '<div title="' + this.name + '">' + $scope.TrimString(this.name, 8) + '</div>';
                            }
                        }
                    };
                    plotOptions = {
                        series: {
                            animation: $scope.animation
                        },
                        bubble: {
                            marker: {
                                fillOpacity: 1
                            },
                            dataLabels: {
                                enabled: ShowDataLabel,
                                style: {
                                    fontWeight: 'normal'
                                },
                                backgroundColor: 'rgba(252, 255, 255, 0.8)',
                                color: 'black',
                                crop: false,
                                padding: 3,
                                inside: false,
                                borderWidth: 1,
                                borderColor: '#AAA',
                                overflow: 'justify',
                                shape: 'callout',
                                allowOverlap: true,
                                useHTML: true,
                                formatter: function () {
                                    var html = "";
                                    var minSampleSize = Constants.Low_SampleSize_Value;
                                    var maxSampleSize = Constants.SampleSize_Value;
                                    if (this.series.name == 'AqHacks') {
                                        return null;
                                    }
                                    else if (this.point.SampleSize < minSampleSize || this.point.z == null) {
                                        return null;
                                    }
                                    else if (this.point.SampleSize >= minSampleSize && this.point.SampleSize < maxSampleSize) {
                                        html += '<span style="color:grey;">' + numberWithCommas(this.point.z) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    else {
                                        html += '<span style="color:black;">' + numberWithCommas(this.point.z) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    return html;
                                }
                            }
                        }

                    };
                    tooltip = {
                        useHTML: true,
                        formatter: function () {
                            let returnHTML = "";
                            if (this.point.SampleSize < 70) {
                                returnHTML += "<div style='color:grey;font-weight:normal;'>" + numberWithCommas(this.point.z) + "</div>";
                            }
                            else {
                                returnHTML += "<div>" + numberWithCommas(this.point.z) + "</div>";
                            }
                            return "<div class='chart-tooltip'>" + returnHTML + "</div>";
                        },
                        snap: 0,
                    };
                    series = _.cloneDeep(Series);
                    if (series.length > 0) {
                        var obj = {
                            name: 'AqHacks',
                            data: [{
                                x: series[0].data[0].x,
                                y: series[0].data[0].y,
                                z: 0,
                                "SampleSize": 71
                            }],
                            showInLegend: false,
                            color: 'rgb(255,255,255,0)',
                            marker: {
                                fillOpacity: 0.0,
                                stroke: 'rgb(255,255,255,0)',
                            },
                            enableMouseTracking: false
                        };
                        series.push(obj);
                    }
                    additionalfunction = function (chart) {
                        if (chart.series.length > 0) {
                            if (isLowSampleSize) chart.renderer.html('<div class="Warning_Icon" title="Low Sample Size"></div>', 0, chart.chartHeight - 7).attr({ zIndex: 5 }).add();
                        }
                        else {
                            chart.renderer.text('No Data Available', (chart.chartWidth / 2) - 100, chart.chartHeight / 2)
                            .css({
                                color: '#303030',
                                fontSize: '16px'
                            })
                            .add();
                        }
                    }
                    break;
                case 8:
                    chart = {
                        type: 'column',
                        reflow: reflow,
                    };
                    title = {
                        text: 'AQHacks',
                        style: { "color": "#FFFFFF", "fontSize": "1px" }
                    }
                    yAxis = {
                        visible: false,
                        labels: {
                            style: {
                                "font-family": "Montserrat",
                            }
                        }
                    };
                    xAxis = {
                        categories: _.cloneDeep(Categories),
                        minorTickLength: 0,
                        tickLength: 0,
                        labels: {
                            style: {
                                "font-family": "Montserrat",
                            }
                        }
                    };
                    series = _.cloneDeep(Series);
                    plotOptions = {
                        column: {
                            pointWidth: 10,
                            dataLabels: {
                                enabled: true,
                                style: {
                                    fontWeight: 'normal'
                                },
                                color: 'black',
                                crop: false,
                                padding: 3,
                                zIndex: 11,
                                useHTML: true,
                                overflow: 'none',
                                allowOverlap: true,
                                y: -14,
                                formatter: function () {
                                    var html = "";
                                    var minSampleSize = Constants.Low_SampleSize_Value;
                                    var maxSampleSize = Constants.SampleSize_Value;
                                    if (this.point.SampleSize < minSampleSize) {
                                        html += "";
                                    }
                                    else if (this.point.SampleSize >= minSampleSize && this.point.SampleSize < maxSampleSize) {
                                        html += '<span style="color:grey;background-color: rgba(255, 255, 255, 0.8);">' + numberWithCommas(this.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    else {
                                        html += '<span style="color:black;background-color: rgba(255, 255, 255, 0.8);">' + numberWithCommas(this.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    return html;
                                }
                            }
                        },
                        series: {
                            animation: $scope.animation
                        }
                    };
                    legend = {
                        enabled: false
                    };
                    tooltip = {
                        useHTML: true,
                        formatter: function () {
                            let returnHTML = "";
                            if (this.point.SampleSize < 70) {
                                returnHTML += "<div style='color:grey;font-weight:normal;'>" + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + "</div>";
                            }
                            else {
                                returnHTML += "<div>" + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + "</div>";
                            }
                            return "<div class='chart-tooltip'>" + returnHTML + "</div>";
                        },
                        snap: 0,
                    }
                    additionalfunction = function (chart) {
                        if (chart.series.length > 0) {
                            if (isLowSampleSize) chart.renderer.html('<div class="Warning_Icon" title="Low Sample Size"></div>', 0, chart.chartHeight - 7).attr({ zIndex: 5 }).add();
                            if (chart.series[0].data.length == 2) {
                                var point1 = chart.series[0].data[0], point2 = chart.series[0].data[1]
                                chart.renderer.html('<div style="height:' + chart.plotHeight + 'px" class="shadow1"></div>',
                                (point1.plotX + point2.plotX) / 2 + chart.plotLeft - 10, chart.plotTop + 1).add();
                            }

                            for (var i = 0; i < chart.series[0].data.length; i++) {
                                var point = chart.series[0].data[i];
                                if (point.y != 0) {
                                    chart.renderer.circle(point.plotX + 10, point.plotY + 24, 12).attr({
                                        fill: point.color,
                                        stroke: '#F0F0F0',
                                        'stroke-width': 2,
                                        zIndex: 10
                                    }).add();
                                    chart.renderer.circle(point.plotX + 10, point.plotY + 24, 4).attr({
                                        fill: '#F0F0F0',
                                        zIndex: 10
                                    }).add();
                                }
                            }

                        }
                        else {
                            chart.renderer.text('No Data Available', (chart.chartWidth / 2) - 100, chart.chartHeight / 2)
                            .css({
                                color: '#303030',
                                fontSize: '16px'
                            })
                            .add();
                        }
                    }
                    break;
                case 9:
                    chart = {
                        type: 'column',
                        reflow: reflow,
                    };
                    title = {
                        text: 'AQHacks',
                        style: { "color": "#FFFFFF", "fontSize": "1px" }
                    }
                    yAxis = {
                        visible: false,
                        labels: {
                            style: {
                                "font-family": "Montserrat",
                            }
                        }

                    };
                    xAxis = {
                        categories: _.cloneDeep(Categories),
                        minorTickLength: 0,
                        tickLength: 0,
                        labels: {
                            style: {
                                "font-family": "Montserrat",
                            }
                        }
                    };
                    series = _.cloneDeep(Series);
                    plotOptions = {
                        column: {
                            pointWidth: 10,
                            dataLabels: {
                                enabled: true,
                                style: {
                                    fontWeight: 'normal'
                                },
                                color: 'black',
                                crop: false,
                                padding: 3,
                                zIndex: 11,
                                useHTML: true,
                                overflow: 'none',
                                allowOverlap: true,
                                y: -14,
                                formatter: function () {
                                    var html = "";
                                    var minSampleSize = Constants.Low_SampleSize_Value;
                                    var maxSampleSize = Constants.SampleSize_Value;
                                    if (this.point.SampleSize < minSampleSize) {
                                        html += "";
                                    }
                                    else if (this.point.SampleSize >= minSampleSize && this.point.SampleSize < maxSampleSize) {
                                        html += '<span style="color:grey;background-color: rgba(255, 255, 255, 0.8);">' + numberWithCommas(this.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    else {
                                        html += '<span style="color:black;background-color: rgba(255, 255, 255, 0.8);">' + numberWithCommas(this.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    return html;
                                }
                            }
                        },
                        series: {
                            animation: $scope.animation
                        }
                    };
                    legend = {
                        enabled: false
                    };
                    tooltip = {
                        useHTML: true,
                        formatter: function () {
                            let returnHTML = "";
                            if (this.point.SampleSize < 70) {
                                returnHTML += "<div style='color:grey;font-weight:normal;'>" + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + "</div>";
                            }
                            else {
                                returnHTML += "<div>" + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + "</div>";
                            }
                            return "<div class='chart-tooltip'>" + returnHTML + "</div>";
                        },
                        snap: 0,
                    }
                    additionalfunction = function (chart) {
                        if (chart.series.length > 0) {
                            if (isLowSampleSize) chart.renderer.html('<div class="Warning_Icon" title="Low Sample Size"></div>', 0, chart.chartHeight - 7).attr({ zIndex: 5 }).add();
                            if (chart.series[0].data.length == 2) {
                                var point1 = chart.series[0].data[0], point2 = chart.series[0].data[1]
                                chart.renderer.html('<div style="height:' + chart.plotHeight + 'px" class="shadow1"></div>',
                                (point1.plotX + point2.plotX) / 2 + chart.plotLeft - 10, chart.plotTop + 1).add();
                            }

                            for (var i = 0; i < chart.series[0].data.length; i++) {
                                var point = chart.series[0].data[i];
                                if (point.y != 0) {
                                    chart.renderer.circle(point.plotX + 10, point.plotY + 24, 12).attr({
                                        fill: point.color,
                                        stroke: '#F0F0F0',
                                        'stroke-width': 2,
                                        zIndex: 10
                                    }).add();
                                    chart.renderer.circle(point.plotX + 10, point.plotY + 24, 4).attr({
                                        fill: '#F0F0F0',
                                        zIndex: 10
                                    }).add();
                                }
                            }
                        }
                        else {
                            chart.renderer.text('No Data Available', (chart.chartWidth / 2) - 100, chart.chartHeight / 2)
                            .css({
                                color: '#303030',
                                fontSize: '16px'
                            })
                            .add();
                        }
                    }
                    break;
                case 10:
                    chart = {
                        type: 'column',
                        reflow: reflow,
                    };
                    title = {
                        text: 'AQHacks',
                        style: { "color": "#FFFFFF", "fontSize": "1px" }
                    }
                    yAxis = {
                        visible: false,
                        labels: {
                            style: {
                                "font-family": "Montserrat",
                            }
                        }
                    };
                    xAxis = {
                        categories: _.cloneDeep(Categories),
                        minorTickLength: 0,
                        tickLength: 0,
                        labels: {
                            style: {
                                "font-family": "Montserrat",
                            }
                        }
                    };
                    series = _.cloneDeep(Series);
                    plotOptions = {
                        column: {
                            pointWidth: 10,
                            dataLabels: {
                                enabled: true,
                                style: {
                                    fontWeight: 'normal'
                                },
                                color: 'black',
                                crop: false,
                                padding: 3,
                                zIndex: 11,
                                overflow: 'none',
                                useHTML: true,
                                allowOverlap: true,
                                y: -14,
                                formatter: function () {
                                    var html = "";
                                    var minSampleSize = Constants.Low_SampleSize_Value;
                                    var maxSampleSize = Constants.SampleSize_Value;
                                    if (this.point.SampleSize < minSampleSize) {
                                        html += "";
                                    }
                                    else if (this.point.SampleSize >= minSampleSize && this.point.SampleSize < maxSampleSize) {
                                        html += '<span style="color:grey;background-color: rgba(255, 255, 255, 0.8);">' + numberWithCommas(this.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    else {
                                        html += '<span style="color:black;background-color: rgba(255, 255, 255, 0.8);">' + numberWithCommas(this.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    return html;
                                }
                            }
                        },
                        series: {
                            animation: $scope.animation
                        }
                    };
                    legend = {
                        enabled: false
                    };
                    tooltip = {
                        useHTML: true,
                        formatter: function () {
                            let returnHTML = "";
                            if (this.point.SampleSize < 70) {
                                returnHTML += "<div style='color:grey;font-weight:normal;'>" + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + "</div>";
                            }
                            else {
                                returnHTML += "<div>" + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + "</div>";
                            }
                            return "<div class='chart-tooltip'>" + returnHTML + "</div>";
                        },
                        snap: 0,
                    }
                    additionalfunction = function (chart) {
                        if (chart.series.length > 0) {
                            if (isLowSampleSize) chart.renderer.html('<div class="Warning_Icon" title="Low Sample Size"></div>', 0, chart.chartHeight - 7).attr({ zIndex: 5 }).add();
                            if (chart.series[0].data.length == 2) {
                                var point1 = chart.series[0].data[0], point2 = chart.series[0].data[1]
                                chart.renderer.html('<div style="height:' + chart.plotHeight + 'px" class="shadow1"></div>',
                                (point1.plotX + point2.plotX) / 2 + chart.plotLeft - 10, chart.plotTop + 1).add();
                            }

                            for (var i = 0; i < chart.series[0].data.length; i++) {
                                var point = chart.series[0].data[i];
                                if (point.y != 0) {
                                    chart.renderer.circle(point.plotX + 10, point.plotY + 24, 12).attr({
                                        fill: point.color,
                                        stroke: '#F0F0F0',
                                        'stroke-width': 2,
                                        zIndex: 10
                                    }).add();
                                    chart.renderer.circle(point.plotX + 10, point.plotY + 24, 4).attr({
                                        fill: '#F0F0F0',
                                        zIndex: 10
                                    }).add();
                                }
                            }
                        }
                        else {
                            chart.renderer.text('No Data Available', (chart.chartWidth / 2) - 100, chart.chartHeight / 2)
                            .css({
                                color: '#303030',
                                fontSize: '16px'
                            })
                            .add();
                        }
                    }
                    break;
                case 11:
                    chart = {
                        type: 'column',
                        reflow: reflow,
                    };
                    yAxis = {
                        visible: false,
                        labels: {
                            style: {
                                "font-family": "Montserrat",
                            }
                        }
                    };
                    title = {
                        text: 'AQHacks',
                        style: { "color": "#FFFFFF", "fontSize": "1px" }
                    }
                    xAxis = {
                        categories: _.cloneDeep(Categories),
                        minorTickLength: 0,
                        tickLength: 0,
                        labels: {
                            style: {
                                "font-family": "Montserrat",
                            }
                        }
                    };
                    series = _.cloneDeep(Series);
                    plotOptions = {
                        column: {
                            pointWidth: 10,
                            dataLabels: {
                                enabled: true,
                                style: {
                                    fontWeight: 'normal'
                                },
                                color: 'black',
                                crop: false,
                                useHTML: true,
                                padding: 3,
                                zIndex: 11,
                                overflow: 'none',
                                allowOverlap: true,
                                y: -14,
                                formatter: function () {
                                    var html = "";
                                    var minSampleSize = Constants.Low_SampleSize_Value;
                                    var maxSampleSize = Constants.SampleSize_Value;
                                    if (this.point.SampleSize < minSampleSize) {
                                        html += "";
                                    }
                                    else if (this.point.SampleSize >= minSampleSize && this.point.SampleSize < maxSampleSize) {
                                        html += '<span style="color:grey;background-color: rgba(255, 255, 255, 0.8);">' + numberWithCommas(this.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    else {
                                        html += '<span style="color:black;background-color: rgba(255, 255, 255, 0.8);">' + numberWithCommas(this.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    return html;
                                }
                            }
                        },
                        series: {
                            animation: $scope.animation
                        }
                    };
                    legend = {
                        enabled: false
                    };
                    tooltip = {
                        useHTML: true,
                        formatter: function () {
                            let returnHTML = "";
                            if (this.point.SampleSize < 70) {
                                returnHTML += "<div style='color:grey;font-weight:normal;'>" + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + "</div>";
                            }
                            else {
                                returnHTML += "<div>" + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + "</div>";
                            }
                            return "<div class='chart-tooltip'>" + returnHTML + "</div>";
                        },
                        snap: 0,
                    }
                    additionalfunction = function (chart) {
                        if (chart.series.length > 0) {
                            if (isLowSampleSize) chart.renderer.html('<div class="Warning_Icon" title="Low Sample Size"></div>', 0, chart.chartHeight - 7).attr({ zIndex: 5 }).add();
                            if (chart.series[0].data.length == 2) {
                                var point1 = chart.series[0].data[0], point2 = chart.series[0].data[1]
                                chart.renderer.html('<div style="height:' + chart.plotHeight + 'px" class="shadow1"></div>',
                                (point1.plotX + point2.plotX) / 2 + chart.plotLeft - 10, chart.plotTop + 1).add();
                            }

                            for (var i = 0; i < chart.series[0].data.length; i++) {
                                var point = chart.series[0].data[i];
                                if (point.y != 0) {
                                    chart.renderer.circle(point.plotX + 10, point.plotY + 24, 12).attr({
                                        fill: point.color,
                                        stroke: '#F0F0F0',
                                        'stroke-width': 2,
                                        zIndex: 10
                                    }).add();
                                    chart.renderer.circle(point.plotX + 10, point.plotY + 24, 4).attr({
                                        fill: '#F0F0F0',
                                        zIndex: 10
                                    }).add();
                                }
                            }
                        }
                        else {
                            chart.renderer.text('No Data Available', (chart.chartWidth / 2) - 100, chart.chartHeight / 2)
                            .css({
                                color: '#303030',
                                fontSize: '16px'
                            })
                            .add();
                        }
                    }
                    break;
                case 12:
                    chart = {
                        type: 'line',
                        reflow: reflow,
                        style: {
                            fontFamily: "Montserrat"
                        }
                    };
                    xAxis = {
                        categories: _.cloneDeep(Categories),
                        alternateGridColor: '#f9f9f9',
                        minorTickLength: 0,
                        lineWidth: 0,
                        minorGridLineWidth: 0,
                        tickLength: 0,
                        title: { text: '' },
                        labels: {
                            useHTML: true,
                            formatter: function () {
                                return '<div class="labelMain"> \
                                <div class="labelText" title="' + this.value + '">' + this.value + '</div> </div>';
                            },
                            autoRotationLimit: 20
                        },
                    };
                    yAxis = {
                        gridLineWidth: 1,
                        minorGridLineWidth: 1,
                        gridLineDashStyle: 'dot',
                        gridLineColor: 'lightgray',
                        title: { text: 'Value (000 €)' },
                        labels: {
                            formatter: function () {
                                return numberWithCommas(this.value);
                            },
                            style: {
                                "font-family": "Montserrat",
                            }
                        }
                    };
                    plotOptions = {
                        series: {
                            label: {
                                connectorAllowed: false
                            },
                            marker: {
                                symbol: 'circle'
                            },
                            dataLabels: {
                                enabled: ShowDataLabel,
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
                                    var html = "";
                                    var minSampleSize = Constants.Low_SampleSize_Value;
                                    var maxSampleSize = Constants.SampleSize_Value;
                                    if (this.point.SampleSize < minSampleSize || this.point.y == null) {
                                        return null;
                                    }
                                    else if (this.point.SampleSize >= minSampleSize && this.point.SampleSize < maxSampleSize) {
                                        html += '<span style="color:grey;">' + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    else {
                                        html += '<span style="color:black;">' + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    return html;
                                }
                            },
                            stickyTracking: false,
                            animation: $scope.animation
                        }
                    };
                    legend = {
                        enabled: true,
                        symbolRadius: 1,
                        symbol: 'circle',
                        align: 'center',
                        useHTML: true,
                        labelFormatter: function () {
                            if (InExpandPopUp) {
                                return '<div title="' + this.name + '">' + this.name + '</div>';
                            }
                            else {
                                return '<div title="' + this.name + '">' + $scope.TrimString(this.name, 20) + '</div>';
                            }
                        }
                    };
                    series = _.cloneDeep(Series);
                    tooltip = {
                        useHTML: true,
                        formatter: function () {
                            let returnHTML = "";
                            if (this.point.SampleSize < 70) {
                                returnHTML += "<div style='color:grey;font-weight:normal;'>" + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + "</div>";
                            }
                            else {
                                returnHTML += "<div>" + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + "</div>";
                            }
                            return "<div class='chart-tooltip'>" + returnHTML + "</div>";
                        },
                        snap: 0,
                    };
                    additionalfunction = function (chart) {
                        if (chart.series.length > 0) {
                            if (isLowSampleSize) chart.renderer.html('<div class="Warning_Icon" title="Low Sample Size"></div>', 0, chart.chartHeight - 7).attr({ zIndex: 5 }).add();
                        }
                        else {
                            chart.renderer.text('No Data Available', (chart.chartWidth / 2) - 100, chart.chartHeight / 2)
                            .css({
                                color: '#303030',
                                fontSize: '16px'
                            })
                            .add();
                        }
                    }
                    break;
                case 13:
                    xAxis = {
                        categories: _.cloneDeep(Categories),
                        labels: {
                            useHTML: true,
                            formatter: function () {
                                return '<div class="labelMain"> \
                                <div class="labelText" title="' + this.value + '">' + this.value + '</div> </div>';
                            },
                            autoRotationLimit: 20
                        },
                        shadow: true,
                        startOnTick: false,
                        endOnTick: false,
                        minorTickLength: 0,
                        tickLength: 0,
                        lineWidth: 0,
                        minorGridLineWidth: 0,
                    };
                    title = {
                        text: 'AQHacks',
                        style: { "color": "#FFFFFF", "fontSize": "1px" }
                    }
                    yAxis = [{ // prime yAxis
                        gridLineColor: 'rgba(183, 183, 183, 0.5)',
                        gridLineDashStyle: 'Dot',
                        title: {
                            text: 'Value Change vs YA (€)',
                        },
                        tickPositioner: function () {
                            var maxDeviation = Math.ceil(Math.max(Math.abs(this.dataMax), Math.abs(this.dataMin)));
                            var halfMaxDeviation = Math.ceil(maxDeviation / 2);

                            if (this.dataMax == null) { return []; }
                            else if (this.dataMax == 0 && this.dataMin == 0) { return [0.2, 0.1, 0, -0.1, -0.2]; }
                            else { return [-maxDeviation, -halfMaxDeviation, 0, halfMaxDeviation, maxDeviation]; }
                        },
                        plotLines: [{
                            color: 'rgba(183, 183, 183, 0.9)',
                            width: 1,
                            value: 0
                        }],
                        labels: {
                            formatter: function () {
                                return numberWithCommas(this.value);
                            },
                            style: {
                                "font-family": "Montserrat",
                            }
                        }
                    }, { // second yAxis

                        gridLineWidth: 0,
                        title: {
                            text: '',
                            style: {
                                color: Highcharts.getOptions().colors[1]
                            }
                        },
                        tickPositioner: function () {
                            var maxDeviation = Math.ceil(Math.max(Math.abs(this.dataMax), Math.abs(this.dataMin)));
                            var halfMaxDeviation = Math.ceil(maxDeviation / 2);

                            if (this.dataMax == null) { return []; }
                            else if (this.dataMax == 0 && this.dataMin == 0) { return [0.2, 0.1, 0, -0.1, -0.2]; }
                            else { return [-maxDeviation, -halfMaxDeviation, 0, halfMaxDeviation, maxDeviation]; }
                        },
                        labels: {
                            formatter: function () {
                                return numberWithCommas(this.value) + '%';
                            },
                            style: {
                                "font-family": "Montserrat",
                            }
                        },
                        opposite: true
                    }];
                    series = _.cloneDeep(Series);
                    plotOptions = {
                        column: {
                            stacking: 'normal',
                            dataLabels: {
                                enabled: ShowDataLabel,
                                style: {
                                    fontWeight: 'normal'
                                },
                                backgroundColor: 'rgba(252, 255, 255, 0.8)',
                                color: 'black',
                                crop: false,
                                padding: 3,
                                borderWidth: 1,
                                borderColor: '#AAA',
                                overflow: 'justify',
                                allowOverlap: true,
                                useHTML: true,
                                formatter: function () {
                                    var html = "";
                                    var minSampleSize = Constants.Low_SampleSize_Value;
                                    var maxSampleSize = Constants.SampleSize_Value;
                                    if (this.point.SampleSize < minSampleSize || this.point.y == null) {
                                        return null;
                                    }
                                    else if (this.point.y == 0) {
                                        return null;
                                    }
                                    else if (this.point.SampleSize >= minSampleSize && this.point.SampleSize < maxSampleSize) {
                                        html += '<span style="color:grey;">' + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    else {
                                        html += '<span style="color:black;">' + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    return html;
                                }
                            }
                        },
                        line: {
                            dataLabels: {
                                enabled: ShowDataLabel,
                                style: {
                                    fontWeight: 'normal'
                                },
                                backgroundColor: 'rgba(252, 255, 255, 0.8)',
                                color: 'black',
                                crop: false,
                                padding: 3,
                                borderWidth: 1,
                                allowOverlap: true,
                                borderColor: '#AAA',
                                overflow: 'justify',
                                useHTML: true,
                                formatter: function () {
                                    var html = "";
                                    var minSampleSize = Constants.Low_SampleSize_Value;
                                    var maxSampleSize = Constants.SampleSize_Value;
                                    if (this.point.SampleSize < minSampleSize || this.point.y == null) {
                                        return null;
                                    }
                                    else if (this.point.SampleSize >= minSampleSize && this.point.SampleSize < maxSampleSize) {
                                        html += '<span style="color:grey;">' + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    else {
                                        html += '<span style="color:black;">' + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    return html;
                                }
                            }
                        },
                        series: {
                            animation: $scope.animation
                        }
                    };
                    tooltip = {
                        useHTML: true,
                        formatter: function () {
                            let returnHTML = "";
                            if (this.point.SampleSize < 70) {
                                returnHTML += "<div style='color:grey;font-weight:normal;'>" + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + "</div>";
                            }
                            else {
                                returnHTML += "<div>" + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + "</div>";
                            }
                            return "<div class='chart-tooltip'>" + returnHTML + "</div>";
                        },
                        snap: 0,
                    };
                    legend = {
                        align: 'center',
                        useHTML: true,
                        labelFormatter: function () {
                            if (InExpandPopUp) {
                                return '<div title="' + this.name + '">' + this.name + '</div>';
                            }
                            else {
                                return '<div title="' + this.name + '">' + $scope.TrimString(this.name, 20) + '</div>';
                            }
                        }
                    };
                    additionalfunction = function (chart) {
                        if (chart.series.length > 0) {
                            if (isLowSampleSize) chart.renderer.html('<div class="Warning_Icon" title="Low Sample Size"></div>', 0, chart.chartHeight - 7).attr({ zIndex: 5 }).add();
                        }
                        else {
                            chart.renderer.text('No Data Available', (chart.chartWidth / 2) - 100, chart.chartHeight / 2)
                            .css({
                                color: '#303030',
                                fontSize: '16px'
                            })
                            .add();
                        }
                    }
                    break;
                case 14:
                    xAxis = {
                        categories: _.cloneDeep(Categories),
                        labels: {
                            useHTML: true,
                            formatter: function () {
                                return '<div class="labelMain"> \
                                <div class="labelText" title="' + this.value + '">' + this.value + '</div> \
                                <div class="labelLine"></div></div>';
                            },
                            autoRotationLimit: 40
                        },
                        shadow: true,
                        startOnTick: false,
                        endOnTick: false,
                        minorTickLength: 0,
                        tickLength: 0,
                        lineWidth: 0,
                        minorGridLineWidth: 0,
                    };
                    yAxis = [{ // prime yAxis
                        gridLineColor: 'rgba(183, 183, 183, 0.5)',
                        gridLineDashStyle: 'Dot',
                        title: {
                            text: '',
                        },
                        max: 100,
                        labels: {
                            formatter: function () {
                                return numberWithCommas(this.value) + "%";
                            },
                            style: {
                                "font-family": "Montserrat"
                            }
                        }
                    }];
                    series = _.cloneDeep(Series);
                    plotOptions = {
                        column: {
                            stacking: 'normal',
                            dataLabels: {
                                enabled: ShowDataLabel,
                                style: {
                                    fontWeight: 'normal'
                                },
                                backgroundColor: 'rgba(252, 255, 255, 0.8)',
                                color: 'black',
                                crop: false,
                                padding: 3,
                                borderWidth: 1,
                                borderColor: '#AAA',
                                overflow: 'none',
                                allowOverlap: true,
                                useHTML: true,
                                formatter: function () {
                                    var html = "";
                                    var minSampleSize = Constants.Low_SampleSize_Value;
                                    var maxSampleSize = Constants.SampleSize_Value;
                                    if (this.point.SampleSize < minSampleSize || this.point.y == null) {
                                        return null;
                                    }
                                    else if (this.point.y == 0) {
                                        return null;
                                    }
                                    else if (this.point.SampleSize >= minSampleSize && this.point.SampleSize < maxSampleSize) {
                                        html += '<span style="color:grey;">' + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    else {
                                        html += '<span style="color:black;">' + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    return html;
                                }
                            }
                        },
                        line: {
                            dataLabels: {
                                enabled: ShowDataLabel,
                                style: {
                                    fontWeight: 'normal'
                                },
                                backgroundColor: 'rgba(252, 255, 255, 0.8)',
                                color: 'black',
                                crop: false,
                                padding: 3,
                                borderWidth: 1,
                                allowOverlap: true,
                                borderColor: '#AAA',
                                overflow: 'none',
                                useHTML: true,
                                formatter: function () {
                                    var html = "";
                                    var minSampleSize = Constants.Low_SampleSize_Value;
                                    var maxSampleSize = Constants.SampleSize_Value;
                                    if (this.point.SampleSize < minSampleSize || this.point.y == null) {
                                        return null;
                                    }
                                    else if (this.point.SampleSize >= minSampleSize && this.point.SampleSize < maxSampleSize) {
                                        html += '<span style="color:grey;">' + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    else {
                                        html += '<span style="color:black;">' + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + '</span>';
                                    }
                                    return html;
                                }
                            }
                        },
                        series: {
                            animation: $scope.animation
                        }
                    };
                    tooltip = {
                        useHTML: true,
                        formatter: function () {
                            let returnHTML = "";
                            if (this.point.SampleSize < 70) {
                                returnHTML += "<div style='color:grey;font-weight:normal;'>" + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + "</div>";
                            }
                            else {
                                returnHTML += "<div>" + numberWithCommas(this.point.y) + this.series.tooltipOptions.valueSuffix + "</div>";
                            }
                            return "<div class='chart-tooltip'>" + returnHTML + "</div>";
                        },
                        snap: 0,
                    };
                    legend = {
                        align: 'center',
                        useHTML: true,
                        labelFormatter: function () {
                            if (InExpandPopUp) {
                                return '<div title="' + this.name + '">' + this.name + '</div>';
                            }
                            else {
                                return '<div title="' + this.name + '">' + $scope.TrimString(this.name, 33) + '</div>';
                            }
                        }
                    };
                    additionalfunction = function (chart) {
                        if (chart.series.length > 0) {
                            if (isLowSampleSize) chart.renderer.html('<div class="Warning_Icon" title="Low Sample Size"></div>', 0, chart.chartHeight - 11).attr({ zIndex: 5 }).add();
                        }
                        else {
                            chart.renderer.text('No Data Available', (chart.chartWidth / 2) - 100, chart.chartHeight / 2)
                            .css({
                                color: '#303030',
                                fontSize: '16px'
                            })
                            .add();
                        }
                    }
                    break;
            }
            let json = {};
            json.chart = chart;
            json.title = title;
            json.subtitle = subtitle;
            json.xAxis = xAxis;
            json.yAxis = yAxis;
            json.tooltip = tooltip;
            json.legend = legend;
            json.series = series;
            json.plotOptions = plotOptions;
            json.credits = credits;
            json.annotations = annotations;
            $("#" + container).highcharts(json, additionalfunction);
        }

        $scope.ReOpenPopUp = function () {
            if ($scope.PopUpActive) {
                $scope.PopUpActive = !$scope.PopUpActive;
                $scope.OpenPopUp($scope.popupData);
            }
        }

        $scope.OpenPopUp = function (widget) {
            $scope.PopUpActive = !$scope.PopUpActive;
            $scope.popupData = widget;
            if ($scope.PopUpActive) {
                if (widget.WidgetData.Series != undefined && widget.WidgetData.Series.length > 0) {
                    if (!topMenuScope.isSlideUpdate)
                        $scope.IsDataLabelVisiblePopUp = $scope.IsDataLabelVisible;
                    setTimeout(function () {
                        let chart = new DrawChart('POPUPWidget', widget.widgetId, widget.WidgetData.Series, widget.WidgetData.Categories, widget.WidgetData.isLowSampleSize, $scope.IsDataLabelVisiblePopUp, $scope.OutputCompareName, true);
                    }, 100)
                    $scope.WidgetIds = [widget.widgetId];
                }
                else {
                    $scope.PopUpActive = !$scope.PopUpActive;
                    layoutScope.customAlert(Constants.NO_OUTPUT_TEXT_ON_SUBMIT, Constants.ALERT_HEADER_TEXT, null, null, Constants.OK_TEXT);
                }
            }
            else {
                $scope.WidgetIds = [1, 2, 3, 4];
            }
        }

        $scope.ShowHideDataLabelPopUp = function () {
            $scope.IsDataLabelVisiblePopUp = !$scope.IsDataLabelVisiblePopUp;
            let chart = new DrawChart('POPUPWidget', $scope.popupData.widgetId, $scope.popupData.WidgetData.Series, $scope.popupData.WidgetData.Categories, $scope.popupData.WidgetData.isLowSampleSize, $scope.IsDataLabelVisiblePopUp, $scope.OutputCompareName, true);
        }

        $scope.NavigateToDeepDive = function () {
            if (filterPanelScope.isSelectedFiltersChanged) {
                layoutScope.customAlert(Constants.EXPORT_SELECTIONS_CHANGED, Constants.EXPORT_ALERT_HEADER, null, null, Constants.OK_TEXT);
                return;
            }
            if ($scope.widgetData[3].WidgetData.Series[0] == undefined || $scope.widgetData[3].WidgetData.Series[0].data.length <= 1) {
                layoutScope.customAlert(Constants.NAVIGATION_DEEPDEIVE_ERROR_MSG, Constants.EXPORT_ALERT_HEADER, null, null, Constants.OK_TEXT);
            }
            else if ($scope.widgetData[3].WidgetData.Series.length > 0 && $scope.widgetData[3].WidgetData.Series[0].data) {
                layoutScope.isNavigatedFromOtherModule.isNavigated = true;
                filterPanelScope.NavigateToDeepDive($scope.widgetData[3].WidgetData.Series[0].data);
            }
        }

        $scope.NavigateToDeepDiveDemog = function () {
            if (filterPanelScope.isSelectedFiltersChanged) {
                layoutScope.customAlert(Constants.EXPORT_SELECTIONS_CHANGED, Constants.EXPORT_ALERT_HEADER, null, null, Constants.OK_TEXT);
                return;
            }
            if ($scope.widgetData[0].WidgetData.Series[0] == undefined || $scope.widgetData[0].WidgetData.Series[0].data.length <= 1) {
                layoutScope.customAlert(Constants.NAVIGATION_DEEPDEIVE_ERROR_MSG, Constants.EXPORT_ALERT_HEADER, null, null, Constants.OK_TEXT);
            }
            else if ($scope.widgetData[0].WidgetData.Series.length > 0 && $scope.widgetData[0].WidgetData.Series[0].data) {
                layoutScope.isNavigatedFromOtherModule.isNavigated = true;
                filterPanelScope.NavigateToDeepDiveDemog($scope.widgetData[0].WidgetData.Series[0].data);
            }
        }

        $scope.showLTDataFunc = function () {
            $scope.IsLTAPOPUpOpen = !$scope.IsLTAPOPUpOpen;
        }

        $scope.NavigateToGrowthOpportunity = function () {
            layoutScope.isNavigatedFromOtherModule.isNavigated = true;
            filterPanelScope.NavigateToGrowthOpportunity();
        }

        $scope.ShowNavigateToGrowthOpportunity = function () {
            if (!filterPanelScope.isSelectedFiltersChanged && !$scope.IsMultiSnapshot && !$scope.IsDemographicSingle) {
                return filterPanelScope.IsNavigateToGrowthOpportunity();
            }
            return false;
        }

        let getTableHtml = function (name, DisplayName, series, chart) {
            let minSampleSize = 20;
            let maxSampleSize = 70;
            let seriesData = _.find(series, function (d) {
                return d.name == name
            });
            let Absolute = _.find(seriesData.data, function (o) {
                return o.name == "Absolute"
            });
            let Change = _.find(seriesData.data, function (o) {
                return o.name == "Change"
            });
            let Contribution = _.find(seriesData.data, function (o) {
                return o.name == "Contribution"
            });
            let HtmlString = "";
            if (DisplayName == 'KPI') HtmlString += '<table style="font-size: 1.4vh;font-weight: bold;min-width:' + (chart.chartWidth * 30) / 100 + 'px;box-shadow:0px 0px 0px #000000;min-width:100px;"><tr><th colspan="2" style="border: none;">Data Label</th></tr><tr><th colspan="2">';
            else if (seriesData.color.toLowerCase() == 'black') HtmlString += '<table style="min-width:' + (chart.chartWidth * 30) / 100 + 'px;"><tr><th colspan="2">';
            else HtmlString += '<table style="min-width:' + (chart.chartWidth * 30) / 100 + 'px;box-shadow: 0px 0px 6px 0px ' + seriesData.color + ';"><tr style="box-shadow: inset 2px 0px 3px 0px ' + seriesData.color + ';"><th colspan="2" style ="color:' + seriesData.color + '">';
            HtmlString += DisplayName + '</th></tr>';

            if (DisplayName == 'KPI') {
                HtmlString += '<tr><td rowspan="2" title="Absolute">Absolute';
            }
            else if (Absolute != null && Absolute.SampleSize != null && Absolute.SampleSize < minSampleSize) {
                HtmlString += '<tr><td rowspan="2" title="Absolute \n *"> *';
            }
            else if (Absolute != null && Absolute.SampleSize != null && Absolute.SampleSize >= minSampleSize && Absolute.SampleSize < maxSampleSize) {
                HtmlString += '<tr><td rowspan="2" style="color:grey" title="Absolute \n' + numberWithCommas(Absolute.value) + Absolute.suffix + '">' + numberWithCommas(Absolute.value) + Absolute.suffix;
            }
            else if (Absolute != null && Absolute.SampleSize != null) {
                HtmlString += '<tr><td rowspan="2"  style="color:black" title="Absolute \n' + numberWithCommas(Absolute.value) + Absolute.suffix + '">' + numberWithCommas(Absolute.value) + Absolute.suffix;
            }
            else {
                HtmlString += '<tr><td rowspan="2" title="Absolute\nNA">NA';
            }

            if (DisplayName == 'KPI') {
                HtmlString += '</td><td title="Contribution"> Contribution (000)';
            }
            else if (Contribution != null && Contribution.SampleSize != null && Contribution.SampleSize < minSampleSize) {
                HtmlString += '</td><td title="Contribution\n *"> *';
            }
            else if (Contribution != null && Contribution.SampleSize != null && Contribution.SampleSize >= minSampleSize && Contribution.SampleSize < maxSampleSize) {
                HtmlString += '</td><td style="color:grey" title="Contribution\n' + numberWithCommas(Contribution.value) + Contribution.suffix + '">' + numberWithCommas(Contribution.value) + Contribution.suffix;
            }
            else if (Contribution != null && Contribution.SampleSize != null) {
                HtmlString += '</td><td style="color:black" title="Contribution\n' + numberWithCommas(Contribution.value) + Contribution.suffix + '">' + numberWithCommas(Contribution.value) + Contribution.suffix;
            }
            else {
                HtmlString += '</td><td title="Contribution\nNA">NA';
            }

            if (DisplayName == 'KPI') {
                HtmlString += '</td></tr><tr><td title="Change"> Change';
            }
            else if (Change != null && Change.SampleSize != null && Change.SampleSize < minSampleSize) {
                HtmlString += '</td></tr><tr><td title="Change\n *"> *';
            }
            else if (Change != null && Change.SampleSize != null && Change.SampleSize >= minSampleSize && Change.SampleSize < maxSampleSize) {
                if (Change.suffix == '%') {
                    if (Change.value > 3) {
                        HtmlString += '</td></tr><tr><td  style="color:green" title="Change\n' + numberWithCommas(Change.value) + Change.suffix + '">' + numberWithCommas(Change.value) + Change.suffix;
                    }
                    else if (Change.value < -3) {
                        HtmlString += '</td></tr><tr><td  style="color:red" title="Change\n' + numberWithCommas(Change.value) + Change.suffix + '">' + numberWithCommas(Change.value) + Change.suffix;
                    }
                    else {
                        HtmlString += '</td></tr><tr><td  style="color:grey" title="Change\n' + numberWithCommas(Change.value) + Change.suffix + '">' + numberWithCommas(Change.value) + Change.suffix;
                    }
                }
                else {
                    if (Change.value > 1) {
                        HtmlString += '</td></tr><tr><td  style="color:green" title="Change\n' + numberWithCommas(Change.value) + Change.suffix + '">' + numberWithCommas(Change.value) + Change.suffix;
                    }
                    else if (Change.value < -1) {
                        HtmlString += '</td></tr><tr><td  style="color:red" title="Change\n' + numberWithCommas(Change.value) + Change.suffix + '">' + numberWithCommas(Change.value) + Change.suffix;
                    }
                    else {
                        HtmlString += '</td></tr><tr><td  style="color:grey" title="Change\n' + numberWithCommas(Change.value) + Change.suffix + '">' + numberWithCommas(Change.value) + Change.suffix;
                    }
                }

            }
            else if (Change != null && Change.SampleSize != null) {
                if (Change.suffix == '%') {
                    if (Change.value > 3) {
                        HtmlString += '</td></tr><tr><td  style="color:green" title="Change\n' + numberWithCommas(Change.value) + Change.suffix + '">' + numberWithCommas(Change.value) + Change.suffix;
                    }
                    else if (Change.value < -3) {
                        HtmlString += '</td></tr><tr><td  style="color:red" title="Change\n' + numberWithCommas(Change.value) + Change.suffix + '">' + numberWithCommas(Change.value) + Change.suffix;
                    }
                    else {
                        HtmlString += '</td></tr><tr><td  style="color:black" title="Change\n' + numberWithCommas(Change.value) + Change.suffix + '">' + numberWithCommas(Change.value) + Change.suffix;
                    }
                }
                else {
                    if (Change.value > 1) {
                        HtmlString += '</td></tr><tr><td  style="color:green" title="Change\n' + numberWithCommas(Change.value) + Change.suffix + '">' + numberWithCommas(Change.value) + Change.suffix;
                    }
                    else if (Change.value < -1) {
                        HtmlString += '</td></tr><tr><td  style="color:red" title="Change\n' + numberWithCommas(Change.value) + Change.suffix + '">' + numberWithCommas(Change.value) + Change.suffix;
                    }
                    else {
                        HtmlString += '</td></tr><tr><td  style="color:black" title="Change\n' + numberWithCommas(Change.value) + Change.suffix + '">' + numberWithCommas(Change.value) + Change.suffix;
                    }
                }
            }
            else {
                HtmlString += '</td></tr><tr><td title="Change\nNA">NA';
            }
            HtmlString += '</td></tr></table>';
            return HtmlString;
        }

        $scope.showStoryBoardSave = function (id) {
            var outputContainer = id;
            var AdditionalInfo = {};

            $scope.ModuleRequestToDB.ExportsType = Constants.PPT_TEXT;
            $scope.ModuleRequestToDB.FooterText = topMenuScope.getFooterText();

            if (id.indexOf("popup") > -1) {
                AdditionalInfo.popupId = $scope.popupData.widgetId;
                AdditionalInfo.isShowDataLabel = $scope.IsDataLabelVisiblePopUp;
                AdditionalInfo.SlideName = $scope.popupData.WidgetTitle + " - SnapShot";
            }
            else {
                AdditionalInfo.popupId = -1;
                AdditionalInfo.isShowDataLabel = $scope.IsDataLabelVisible;
                AdditionalInfo.SlideName = $scope.ModuleRequestToDB.SnapshotTypeName + " - SnapShot";
            }
            AdditionalInfo.SlideParameters = $scope.ModuleRequestToDB;
            topMenuScope.showStoryBoardSave(outputContainer, $scope.ModuleRequestToDB, AdditionalInfo);
        }

        filterPanelScope.FillFilterPanal();

    }]);
})