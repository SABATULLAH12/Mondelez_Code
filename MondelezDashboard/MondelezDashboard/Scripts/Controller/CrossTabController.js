﻿define(['app', 'angular', 'ajaxservice', 'constants', 'niceScroll'], function (app, angular) {
    app.register.controller("CrossTabController", ['$scope', '$css', '$sce', 'AjaxService', 'Constants', function ($scope, $css, $sce, AjaxService, Constants) {
        ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/crosstab.min.css'}, $scope) :$css.bind({ href: '../Content/Css/crosstab.css'}, $scope)
        let filterPanelScope = $scope.$parent;
        let layoutScope = $scope.$parent.$parent.$parent;
        let topMenuScope = $scope.$parent.$parent;
        let selectedModule = topMenuScope.modules[2];
        selectedModule.isActive = true;
        filterPanelScope.clearAll();
        filterPanelScope.openFilterPanel(false);
        $scope.showOutput = false;
        $scope.showLTDIcon = false;
        $scope.showLTData = false;
        $scope.LTData = false;
        
        $scope.ModuleRequestToDB = { };
        $scope.crossTabTitle = "Title";      
        $scope.crossTabData = { rowHeaderData: [], columnHeaderData: [], data: [] };
        $scope.NumberOfLevels = 1;
        let colorCodes = [
            "#4F2170", "#E18719", "#287819", "#623E23", "#A52323", "#2D6EAA", "#E6AF23", "#666666",
            "#724D8D", "#EAAB5E", "#73A769", "#93785F", "#C97B7B", "#81A8CC", "#EDC765", "#858585",
            "#957AA9", "#F3CFA3", "#B4D0AF", "#BEADA0", "#E4BDBD", "#ABC5DD", "#F4DB9C", "#A3A3A3"
        ];
        let DownloadList = [];
        let DownloadSelections = [];
        let calculateProjectedDataPoints = function (data) {
            let dpoint = 1, cFilter = [];
            cFilter = data.RowId.split("|");
            cFilter.push(data.ColumnId);
            for (let i = 0; i < cFilter.length; i++) {
                if (cFilter[i] == '8') dpoint = dpoint * (filterPanelScope.FilterPanel[getFilterIdFromCompareId(cFilter[i])].Selection.length-1);
                else dpoint = dpoint * filterPanelScope.FilterPanel[getFilterIdFromCompareId(cFilter[i])].Selection.length;
            }
            return dpoint;
        }
        let calculateProjectedRows = function (data) {
            let dpoint = 1, cFilter = [];
            cFilter = data.RowId.split("|");
            for (let i = 0; i < cFilter.length; i++) {
                if (cFilter[i] == '8') dpoint = dpoint * (filterPanelScope.FilterPanel[getFilterIdFromCompareId(cFilter[i])].Selection.length-1);
                else dpoint = dpoint * filterPanelScope.FilterPanel[getFilterIdFromCompareId(cFilter[i])].Selection.length;
            }
            return dpoint;
        }
        let getOutput = function (data) {
            $scope.ModuleRequestToDB = data;
            let ProjectedDataPoints = calculateProjectedDataPoints(data);
            if (ProjectedDataPoints > Constants.CROSS_TAB_LIMIT) {
                let ProjectedRows = calculateProjectedRows(data);
                if (ProjectedRows <= Constants.MAX_EXCEL_ROWS) {
                    layoutScope.customAlert("Number of data points is too large to display in the tool. Please reduce the selection or export the output to Excel.", "Warning", null, function () {
                        filterPanelScope.setIsSelectedFiltersChanged(false);
                        $scope.ExportToExcel();
                        $scope.showOutput = false;
                    }, 'Download Excel', false, 'Cancel');
                }
                else {
                    layoutScope.customAlert(Constants.MAX_EXCEL_ROWS_Exceeded, Constants.ALERT_HEADER_TEXT);
                }
            }
            else {
                AjaxService.AjaxPost(data, apiUrl + "/" + selectedModule.ModuleName.toLowerCase() + "/" + "GetData", buildCrossTabData, errorFunction);
                $scope.showOutput = true;
                filterPanelScope.setIsSelectedFiltersChanged(false);
            }
        }

        let buildCrossTabData = function (response) {
            if (response != undefined && response.data.CrossTabDataList.length > 0) {
                filterPanelScope.setLowSampleSizeFlag(_.find(response.data.CrossTabDataList, function (obj) { return obj.SampleSize < Constants.SampleSize_Value; }) !== undefined);
                prepareCrossTabData(response);
                $scope.showOutput = true;
                CheckAndOpenTagStoryMySelection();
                if (response.data.LatestTimePeriod!=undefined && response.data.LatestTimePeriod.length > 0) {
                    bindLatestTimeperiodData(response.data.LatestTimePeriod)
                }
                else {
                    $scope.showLTDIcon = false;
                    $scope.showLTDataFunc(false);
                }
                return;
            }
            else {
                $scope.crossTabData = { rowHeaderData: [], columnHeaderData: [], data: [] };
                layoutScope.customAlert(Constants.NO_OUTPUT_TEXT_ON_SUBMIT, Constants.ALERT_HEADER_TEXT);
                $scope.showOutput = false;
                layoutScope.setLoader(false);
                filterPanelScope.openFilterPanel(false);
                return;
            }
        }
        
        let bindLatestTimeperiodData = function (data) {
            $scope.showLTDIcon = true;
            $scope.LTData = data;
        }

        let CheckAndOpenTagStoryMySelection = function(){
            if (layoutScope.SetTagStoryMySelection()) {
                $scope.CrossTabOpenSelection(layoutScope.TagStoryMySelectionSelectedStory);
            }
        }

        let prepareCrossTabData = function (response) {
            $scope.crossTabDbData = response;
            $scope.crossTabData = { rowHeaderData: [], columnHeaderData: [], data: [] };
            $scope.crossTabTitle = $scope.ModuleRequestToDB.ColumnName + " vs " + $scope.ModuleRequestToDB.RowName
            $scope.crossTabTitle = $scope.crossTabTitle + ($scope.crossTabTitle.indexOf("KPI") > -1 ? "" : " (" + $scope.ModuleRequestToDB.KpiName + ")");
            let SelectedRowLevels = $scope.ModuleRequestToDB.RowId.split("|");
            let dynamicL1RowName = "", dynamicL2RowName = "", dynamicL3RowName = "", dynamicL4RowName = "", dynamicColumnName = "";
            let distinctL1RowValues = "", distinctL2RowValues = "", distinctL3RowValues = "", distinctL4RowValues = "", distinctColumnValues = "";

            $scope.NumberOfLevels = SelectedRowLevels.length;

            dynamicColumnName = getColumnName($scope.ModuleRequestToDB.ColumnId);
            dynamicL1RowName = SelectedRowLevels.length >= 1 ? getColumnName(SelectedRowLevels[0]) : "";
            dynamicL2RowName = SelectedRowLevels.length >= 2 ? getColumnName(SelectedRowLevels[1]) : "";
            dynamicL3RowName = SelectedRowLevels.length >= 3 ? getColumnName(SelectedRowLevels[2]) : "";
            dynamicL4RowName = SelectedRowLevels.length >= 4 ? getColumnName(SelectedRowLevels[3]) : "";

            distinctColumnValues = _.uniq(_.map(response.data.CrossTabDataList, dynamicColumnName));
            distinctL1RowValues = dynamicL1RowName.length > 0 ? _.uniq(_.map(response.data.CrossTabDataList, dynamicL1RowName)) : [];
            distinctL2RowValues = dynamicL2RowName.length > 0 ? _.uniq(_.map(response.data.CrossTabDataList, dynamicL2RowName)) : [];
            distinctL3RowValues = dynamicL3RowName.length > 0 ? _.uniq(_.map(response.data.CrossTabDataList, dynamicL3RowName)) : [];
            distinctL4RowValues = dynamicL4RowName.length > 0 ? _.uniq(_.map(response.data.CrossTabDataList, dynamicL4RowName)) : [];

            distinctColumnValues = _.map(distinctColumnValues, function (obj, index) {
                return {
                    'value': obj,
                    'isHeader': true,
                    'headerColor': colorCodes[0],
                }
            });
            $scope.crossTabData.columnHeaderData = distinctColumnValues;

            let widthratio = 1;

            if (SelectedRowLevels.length == 1) {
                widthratio = 0.75;
                prepareCrossTabDataTwoLevelNesting(response.data.CrossTabDataList, { "column": dynamicColumnName, "columnValues": distinctColumnValues, "L1": dynamicL1RowName, "L1Values": distinctL1RowValues });
            }
            else if (SelectedRowLevels.length == 2) {
                widthratio = 0.65;
                prepareCrossTabDataThreeLevelNesting(response.data.CrossTabDataList, { "column": dynamicColumnName, "columnValues": distinctColumnValues, "L1": dynamicL1RowName, "L1Values": distinctL1RowValues, "L2": dynamicL2RowName, "L2Values": distinctL2RowValues });
            }
            else if (SelectedRowLevels.length == 3) {
                widthratio = 0.55;
                prepareCrossTabDataFourLevelNesting(response.data.CrossTabDataList, { "column": dynamicColumnName, "columnValues": distinctColumnValues, "L1": dynamicL1RowName, "L1Values": distinctL1RowValues, "L2": dynamicL2RowName, "L2Values": distinctL2RowValues, "L3": dynamicL3RowName, "L3Values": distinctL3RowValues });

            }
            else if (SelectedRowLevels.length == 4) {
                widthratio = 0.5;
                prepareCrossTabDataFiveLevelNesting(response.data.CrossTabDataList, { "column": dynamicColumnName, "columnValues": distinctColumnValues, "L1": dynamicL1RowName, "L1Values": distinctL1RowValues, "L2": dynamicL2RowName, "L2Values": distinctL2RowValues, "L3": dynamicL3RowName, "L3Values": distinctL3RowValues, "L4": dynamicL4RowName, "L4Values": distinctL4RowValues });
            }

            $scope.crossTabData.rowHeight = (100 / $scope.crossTabData.data.length) + '%'
            $scope.crossTabData.rowWidth = (angular.element(".crosstabTableDiv").width() * (widthratio)) / $scope.crossTabData.columnHeaderData.length + 'px';
            $scope.crossTabData.L1width = 100 / $scope.NumberOfLevels + "%";

            prepareHTMLContent();
        }

        let prepareHTMLContent = function () {
            var html = '';

            //Row Nesting

            //Level 1
            angular.forEach($scope.crossTabData.rowHeaderData, function (item) {
                html += '<div style="width:' + $scope.crossTabData.L1width + '" class="row-item L1 row-line-top-gap row-top-left-bar">';
                html += '<div class="row-left-item-div row-item-dashed">';
                html += '<div class="row-left-item-content-title" title="' + item.value + '">' + $scope.TrimString(item.value, 50) + '</div>';
                //html += '<!--<div class="row-item-head-colorline" style="background-color":' + item.headerColor + '></div>-->';
                html += '</div>';
                html += '</div>';
            });

            //Level 2
            if ($scope.NumberOfLevels >= 2) {
                html += '<div class="Row-l2" style="width:' + $scope.crossTabData.L1width + ';left:' + ($scope.NumberOfLevels == 2 ? '50%' : ($scope.NumberOfLevels == 3 ? '33.33%' : '25%')) + '">';
                angular.forEach($scope.crossTabData.rowHeaderData, function (item) {
                    html += '<div>';
                    angular.forEach(item.NextLevelData, function (item2) {
                        html += '<div class="row-item L2 row-line-top-gap row-top-left-bar">';
                        html += '<div class="row-left-item-div row-item-dashed">'
                        html += '<div class="row-left-item-content-title" title="' + item2.value + '">' + $scope.TrimString(item2.value, 45) + '</div>';
                        html += '</div>';
                        html += '</div>';
                    });
                    html += '</div>';
                });
                html += '</div>';
            }

            //Level 3
            if ($scope.NumberOfLevels >= 3) {
                html += '<div class="Row-l3" style="width:' + $scope.crossTabData.L1width + ';left:' + ($scope.NumberOfLevels == 3 ? '66.66%':'50%') + '">';
                angular.forEach($scope.crossTabData.rowHeaderData, function (item) {
                    html += '<div>';
                    angular.forEach(item.NextLevelData, function (item2) {
                        html += '<div>';
                        angular.forEach(item2.NextLevelData, function (item3) {
                            html += '<div class="row-item L3 row-line-top-gap row-top-left-bar">';
                            html += '<div class="row-left-item-div row-item-dashed">';
                            html += '<div class="row-left-item-content-title" title="' + item3.value + '">' + $scope.TrimString(item3.value, 40) + '</div>';
                            html += '</div>';
                            html += '</div>';
                        });
                        html += '</div>';
                    });
                    html += '</div>';
                });
                html += '</div>';
            }

            //Level 4
            if ($scope.NumberOfLevels >= 4) {
                html += '<div class="Row-l4" style="width:' + $scope.crossTabData.L1width + ';left:75%">';
                angular.forEach($scope.crossTabData.rowHeaderData, function (item) {
                    html += '<div>';
                    angular.forEach(item.NextLevelData, function (item2) {
                        html += '<div>';
                        angular.forEach(item2.NextLevelData, function (item3) {
                            html += '<div>';
                            angular.forEach(item3.NextLevelData, function (item4) {
                                html += '<div class="row-item L4 row-line-top-gap row-top-left-bar">';
                                html += '<div class="row-left-item-div row-item-dashed">';
                                html += '<div class="row-left-item-content-title" title="' + item4.value + '">' + $scope.TrimString(item4.value, 40) + '</div>';
                                html += '</div>';
                                html += '</div>';
                            });
                            html += '</div>';
                        });
                        html += '</div>';
                    });
                    html += '</div>';
                });
                html += '</div>';
            }

            angular.element('.leftBody').html(html);

            //Main data
            html = '';
            angular.forEach($scope.crossTabData.data, function (item) {
                html += '<div class="row-item" >'
                angular.forEach(item, function (item2) {
                    html += '<div class="row-item-div row-line-no-gap" style="width: ' + $scope.crossTabData.rowWidth + ';color:' + item2.textColor + '">';
                    html += '<div class="row-right-item-container" class="' + item2.class + '">'
                    html += '<div class="row-right-item-content">'
                    html += '<div class="row-item-value row-value">' + item2.value + '</div>';
                    html += '</div>';
                    html += '</div>';
                    html += '</div>';
                })
                html += '</div>';
            })
            angular.element('.rightBody').html(html);

            setTimeout(function () { setTableRowWidthHeight(); }, 1);
        }

        let prepareCrossTabDataTwoLevelNesting = function (data, headers) {
            angular.forEach(headers.L1Values, function (value) {
                $scope.crossTabData.rowHeaderData.push({
                    'value': value,
                    'headerColor':  '#b8b8b8'//colorCodes[0],
                })
                $scope.crossTabData.data.push(
                _.map(_.filter(data, function (obj) { return obj[headers.L1] == value }),
                function (obj, index) {
                    return {
                        'value': isValueEmpty(obj.MetricVolume) ? "NA" : (isSampleSizeLessOrEmpty(obj.SampleSize) ? '*' : Number(parseFloat(obj.MetricVolume)).toFixed(obj.RoundBy).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + obj.MetricType),
                        'textColor': getSampleSizeColor(obj.SampleSize),
                    }
                }));
            });
        }

        let prepareCrossTabDataThreeLevelNesting = function (data, headers) {
            angular.forEach(headers.L1Values, function (l1value,l1Index) {
                $scope.crossTabData.rowHeaderData.push({
                    'value': l1value,
                    'NextLevelData': [],
                    'headerColor': '#b8b8b8'//colorCodes[0],
                })
                angular.forEach(headers.L2Values, function (l2value) {
                    $scope.crossTabData.rowHeaderData[l1Index].NextLevelData.push({
                        'value': l2value,
                        'NextLevelData': [],
                        'headerColor': '#b8b8b8'//colorCodes[0],
                    })
                    $scope.crossTabData.data.push(
                    _.map(_.filter(data, function (obj) { return obj[headers.L1] == l1value && obj[headers.L2] == l2value }),
                    function (obj, index) {
                        return {
                            'value': isValueEmpty(obj.MetricVolume) ? "NA" : (isSampleSizeLessOrEmpty(obj.SampleSize) ? '*' : Number(parseFloat(obj.MetricVolume)).toFixed(obj.RoundBy).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + obj.MetricType),
                            'textColor': getSampleSizeColor(obj.SampleSize),
                        }
                    }));
                });
            });
        }

        let prepareCrossTabDataFourLevelNesting = function (data, headers) {
            angular.forEach(headers.L1Values, function (l1value, l1Index) {
                $scope.crossTabData.rowHeaderData.push({
                    'value': l1value,
                    'NextLevelData': [],
                    'headerColor': '#b8b8b8'//colorCodes[0],
                })
                angular.forEach(headers.L2Values, function (l2value,l2Index) {
                    $scope.crossTabData.rowHeaderData[l1Index].NextLevelData.push({
                        'value': l2value,
                        'NextLevelData': [],
                        'headerColor': '#b8b8b8'//colorCodes[0],
                    })
                    angular.forEach(headers.L3Values, function (l3value) {
                        $scope.crossTabData.rowHeaderData[l1Index].NextLevelData[l2Index].NextLevelData.push({
                            'value': l3value,
                            'NextLevelData': [],
                            'headerColor': '#b8b8b8'//colorCodes[0],
                        })
                        $scope.crossTabData.data.push(
                        _.map(_.filter(data, function (obj) { return obj[headers.L1] == l1value && obj[headers.L2] == l2value && obj[headers.L3] == l3value }),
                        function (obj, index) {
                            return {
                                'value': isValueEmpty(obj.MetricVolume) ? "NA" : (isSampleSizeLessOrEmpty(obj.SampleSize) ? '*' : Number(parseFloat(obj.MetricVolume)).toFixed(obj.RoundBy).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + obj.MetricType),
                                'textColor': getSampleSizeColor(obj.SampleSize),
                            }
                        }));
                    });
                });
            });
        }

        let prepareCrossTabDataFiveLevelNesting = function (data, headers) {
            angular.forEach(headers.L1Values, function (l1value, l1Index) {
                $scope.crossTabData.rowHeaderData.push({
                    'value': l1value,
                    'NextLevelData': [],
                    'headerColor': '#b8b8b8'//colorCodes[0],
                })
                angular.forEach(headers.L2Values, function (l2value, l2Index) {
                    $scope.crossTabData.rowHeaderData[l1Index].NextLevelData.push({
                        'value': l2value,
                        'NextLevelData': [],
                        'headerColor': '#b8b8b8'//colorCodes[0],
                    })
                    angular.forEach(headers.L3Values, function (l3value, l3Index) {
                        $scope.crossTabData.rowHeaderData[l1Index].NextLevelData[l2Index].NextLevelData.push({
                            'value': l3value,
                            'NextLevelData': [],
                            'headerColor': '#b8b8b8'//colorCodes[0],
                        })
                        angular.forEach(headers.L4Values, function (l4value) {
                            $scope.crossTabData.rowHeaderData[l1Index].NextLevelData[l2Index].NextLevelData[l3Index].NextLevelData.push({
                                'value': l4value,
                                'NextLevelData': [],
                                'headerColor': '#b8b8b8'//colorCodes[0],
                            })
                            $scope.crossTabData.data.push(
                            _.map(_.filter(data, function (obj) { return obj[headers.L1] == l1value && obj[headers.L2] == l2value && obj[headers.L3] == l3value && obj[headers.L4] == l4value }),
                            function (obj, index) {
                                return {
                                    'value': isValueEmpty(obj.MetricVolume) ? "NA" : (isSampleSizeLessOrEmpty(obj.SampleSize) ? '*' : Number(parseFloat(obj.MetricVolume)).toFixed(obj.RoundBy).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + obj.MetricType),
                                    'textColor': getSampleSizeColor(obj.SampleSize),
                                }
                            }));
                        });
                    });
                });
            });
        }

        let setTableRowWidthHeight = function () {
            if ($scope.NumberOfLevels >= 1) {
                angular.element('.leftHeader').css('width', '35%');
                angular.element('.leftBody').css('width', '35%');
                angular.element('.rightHeader').css('width', '65%');
                angular.element('.rightBody').css('width', '65%');
            }
            if ($scope.NumberOfLevels >= 3) {
                angular.element('.leftHeader').css('width', '45%');
                angular.element('.leftBody').css('width', '45%');
                angular.element('.rightHeader').css('width', '55%');
                angular.element('.rightBody').css('width', '55%');
            }
            if ($scope.NumberOfLevels >= 4) {
                angular.element('.leftHeader').css('width', '50%');
                angular.element('.leftBody').css('width', '50%');
                angular.element('.rightHeader').css('width', '50%');
                angular.element('.rightBody').css('width', '50%');
            }
            let rchildCount = $scope.crossTabData.data.length;//angular.element('.crosstabBodyDiv .rightHeader').find('.row-item-div').length
            let childCount = angular.element('.crosstabBodyDiv .rightHeader').find('.row-item-div').length
            let totalWidth = angular.element('.crosstabBodyDiv .rightHeader').find('.row-item-div').eq(0).width() * childCount;

            if (angular.element('.rightHeader').width() < totalWidth) {
                angular.element('.rightHeader').find('.row-item').css('width', totalWidth + childCount + 10 + 'px');
                angular.element('.rightBody').find('.row-item').css('width', totalWidth + childCount + 10 + 'px');
            }
            else if (angular.element('.rightHeader').width() >= totalWidth || childCount <= 4) {
                angular.element('.rightHeader').find('.row-item').css('width', '100%');
                angular.element('.rightBody').find('.row-item').css('width', '100%');
            }
            let rowHeight = angular.element('.crosstabBodyDiv').height() * 0.15;
            angular.element('.row-item').css('height', rowHeight + 'px');
            angular.element('.leftHeader, .rightHeader, .rightHeader .row-item').css('height', rowHeight*1.3 + 'px');
            angular.element('.leftBody, .rightBody').css('height', 'calc(100% - ' + rowHeight + 'px)');
            if ($scope.NumberOfLevels >= 1) {
                angular.element('.leftBody .row-item.L1').css('height', (rowHeight * rchildCount) / $scope.crossTabData.rowHeaderData.length + 'px');
            }
            if ($scope.NumberOfLevels >= 3) {
                angular.element('.leftBody .row-item.L2').css('height', ((rowHeight * rchildCount) / $scope.crossTabData.rowHeaderData.length) / $scope.crossTabData.rowHeaderData[0].NextLevelData.length + 'px');
            }
            if ($scope.NumberOfLevels >= 4) {
                angular.element('.leftBody .row-item.L3').css('height', (((rowHeight * rchildCount) / $scope.crossTabData.rowHeaderData.length) / $scope.crossTabData.rowHeaderData[0].NextLevelData.length) / $scope.crossTabData.rowHeaderData[0].NextLevelData[0].NextLevelData.length + 'px');
            }
            SetScroll($(".rightBody"), "#006EFC", 0, -8, 0, -8, 5, true);
            layoutScope.setLoader(false);
            filterPanelScope.openFilterPanel(false);
            $scope.$apply();
        }

        let errorFunction = function (error) {
            if (!ReleaseMode) console.log(error);
            layoutScope.customAlert("Something went wrong. Please refresh the screen and try. If it is occuring again, please contact support team.");
            $scope.showOutput = false;
            layoutScope.setLoader(false);
            filterPanelScope.openFilterPanel(true);
        }

        let getFilterIdFromCompareId = function (compareId) {
            var id = -1;
            if (compareId == "1") {     //Markets
                id = 2;
            }
            else if (compareId == "2") { //Brands or Top 15 Brands
                id = 5;
            }
            else if (compareId == "3") {//Category's
                id = 3;
            }
            else if (compareId == "4") {//Channel's
                id = 8;
            }
            else if (compareId == "5") {//Demographics
                id = 8;
            }
            else if (compareId == "6") {//timePeriod
                id = 4;
            }
            else if (compareId == "7") {//metric
                id = 7;
            }
            else if (compareId == "8") {//segment
                id = 6;
            }
            return id;
        }

        let getColumnName = function (compareId) {
            var cName = '';
            if (compareId == "1") {     //Markets
                cName = 'MarketName';
            }
            else if (compareId == "2") { //Brands or Top 15 Brands
                cName = 'BrandName';
            }
            else if (compareId == "3") {//Category's
                cName = 'CategoryName';
            }
            else if (compareId == "4") {//Channel's
                cName = 'ChannelName';
            }
            else if (compareId == "5") {//Demographics
                cName = 'DemographicName';
            }
            else if (compareId == "6") {
                cName = 'TimePeriodName';
            }
            else if (compareId == "7") {
                cName = 'MetricName';
            }
            else if (compareId == "8") {
                cName = 'Segment1Name';
            }
            return cName;
        }

        let isSampleSizeLessOrEmpty = function (sampleSize) {
            if (sampleSize === '' || sampleSize == null || parseInt(sampleSize) < Constants.Low_SampleSize_Value)
                return true;
            else
                return false;
        }

        let isValueEmpty = function (MetricVolume) {
            if (MetricVolume === '' || MetricVolume == null)
                return true;
            else
                return false;
        }

        let getSampleSizeColor = function (sampleSize) {
            var color = 'black';
            if (sampleSize == '' || sampleSize == null || parseInt(sampleSize) < Constants.Low_SampleSize_Value)
                color = 'black';
            else if (sampleSize == '' || sampleSize == null || (parseInt(sampleSize) >= Constants.Low_SampleSize_Value && parseInt(sampleSize) < Constants.SampleSize_Value))
                color = 'gray';
            return color;
        }

        let SetScroll = function (Obj, cursor_color, top, right, left, bottom, cursorwidth, horizrailenabled) {
            if (horizrailenabled != undefined) {
                $(Obj).niceScroll({
                    cursorcolor: cursor_color,
                    cursorborder: cursor_color,
                    cursorwidth: cursorwidth + "px",
                    autohidemode: false,
                    horizrailenabled: horizrailenabled,
                    railpadding: {
                        top: top,
                        right: right,
                        left: left,
                        bottom: bottom
                    }
                });
            }
            else {
                $(Obj).niceScroll({
                    cursorcolor: cursor_color,
                    cursorborder: cursor_color,
                    cursorwidth: cursorwidth + "px",
                    autohidemode: false,
                    railpadding: {
                        top: top,
                        right: right,
                        left: left,
                        bottom: bottom
                    }
                });
            }

            $(Obj).getNiceScroll().resize();
            angular.element(".nicescroll-cursors").css("cursor", "pointer");
        }

        $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
            setTableRowWidthHeight();
        });

        $scope.onReSize = function () {
            $scope.crossTabData = { rowHeaderData: [], columnHeaderData: [], data: [] };
            prepareCrossTabData($scope.crossTabDbData);
            setTimeout(function () {
                $scope.$apply();
            }, 10);
        }

        $scope.TrimString = function (str, len) {
            let maxLength = len == null ? 25 : len;
            if (str != null && str != '' && str.length - 2 > maxLength) {
                return str.slice(0, maxLength) + "...";
            }
            return str;
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
            AjaxService.AjaxPost(request, apiUrl + '/CrossTab/ExportToExcel', layoutScope.DownloadFile, layoutScope.ErrorDownloading);
        }

        layoutScope.SetIsCrossTabSubmit(false);
        filterPanelScope.callChildGetOutput(getOutput);
        filterPanelScope.OpenTagStoryMySelection(CheckAndOpenTagStoryMySelection);
        filterPanelScope.FillFilterPanal(false);

        /********************************Cross Tab Save Related Script START ***************************************************/
        $scope.TAG_Options = [{
            Id: 0,
            Name: 'NewTag',
            DisplayName: 'New Tag',
            IsSelected: true
        }, {
            Id: 1,
            Name: 'AddToTag',
            DisplayName: 'Add to Tag',
            IsSelected: false
        }, {
            Id: 2,
            Name: 'AddToStory',
            DisplayName: 'Tag to Story',
            IsSelected: false
        }]
        $scope.showSaveSelectionDropdown = false;
        $scope.isSaveToCrossTab = false;
        $scope.crossTabMySelections = [];
        $scope.crossTabMySelectionsMapped = [];
        $scope.showMySelections = false;
        $scope.myselection_output_DropDown_Open = false;
        $scope.SelectedTagOrStorySelectionsList = [];
        $scope.isTagMySelections = true;
        $scope.IsTagStoryView = true;
        $scope.TagSearchText = '';
        $scope.TableSearchText = '';
        $scope.showDeleteAlert = true;

        $scope.mySelectionResponse = {
            SelectionTitle: "",
            AddToStoryName:"",
            AddToTagName: "",
            IsTag: true,
            TagOrStoryId: null 
        }

        $scope.noSelection_Error = "Selections are not available.";

        $scope.SelectTagOption = function (Id) {
            angular.forEach($scope.TAG_Options, function (obj) { obj.IsSelected = false; });
            $scope.TAG_Options[Id].IsSelected = true;
            $scope.mySelectionResponse.AddToTagName = "";
            $scope.mySelectionResponse.AddToStoryName = "";
        }

        //$scope.clickCrossTabBody = function (event) {};

        $scope.OpenClosemyselection_dropDown = function () {
            if ($scope.myselection_output_DropDown_Open) {
                $scope.myselection_output_DropDown_Open = false;
                return;
            }
            $scope.myselection_output_DropDown_Open = true;
            
        }

        $scope.openSaveSelectionDropDown = function (option) {
            if (option == null) {
                return $scope.showSaveSelectionDropdown;
            }
            $scope.showSaveSelectionDropdown = option;
        }

        $scope.CrossTabOpenSaveSelectionPopup = function () {
            if (filterPanelScope.isSelectedFiltersChanged) {
                layoutScope.customAlert(Constants.EXPORT_SELECTIONS_CHANGED, Constants.EXPORT_ALERT_HEADER, null, null, Constants.OK_TEXT);
                return;
            }
            layoutScope.setLoader(true);
            AjaxService.AjaxPost({}, apiUrl + "/filterpanel/" + "GetCrossTabMySelections", function (response) {
                $scope.crossTabMySelections = response.data;
                $scope.SelectTagOption(0);
                $scope.mySelectionResponse.SelectionTitle = "";
                var currentSelection = $scope.ModuleRequestToDB;
                $scope.isSaveToCrossTab = true;
                layoutScope.setLoader(false);
            }, errorFunction);
        }

        $scope.getSuffixForStory = function (story) {
            var output = "";
            if (story.CreatedBy != story.CurUserId) {
                output = " - " + story.CreatedUserName
            }
            if (story.IsShared) {
                output = output + " *"
            }
            return output;
        }

        $scope.TagStoryTableViewItemName = function (item) {
            let name = "";
            name = item.SelectionTitle;
            if (item.IsTag) {
                name += ' - ' + item.Tag.TagName + ' - Tag';
            }
            else {
                name += ' - ' + item.Story.StoryName + $scope.getSuffixForStory(item.Story) + ' - Story';
            }
            return name;
        }

        $scope.CrossTabOpenSelection = function (story) {
            if ($scope.showMySelections) {
                $scope.showMySelections = false;
                return;
            }
            layoutScope.setLoader(true);
            AjaxService.AjaxPost({}, apiUrl + "/filterpanel/" + "GetCrossTabMySelections", function (response) {
                //$scope.crossTabMySelections = response.data;
                $scope.crossTabMySelectionsMapped = GetMySelectionsObj(response.data);
                $scope.showMySelections = true;
                $scope.myselection_output_TagStoryHead = false
                $scope.isTagMySelections = true;
                $scope.IsTagStoryView = true;
                layoutScope.setLoader(false);
                $scope.SelectedTagOrStorySelectionsList = [];
                if (story != undefined) {
                    $scope.isTagMySelections = false;
                    _.map($scope.crossTabMySelectionsMapped.Storys, function (item) {
                        if (item.Id == story.StoryID) {
                            item.IsSelected = true;
                            $scope.SelectedTagOrStorySelectionsList = item.Selections;
                        }
                    });
                }
            }, errorFunction);
        }

        $scope.SelectTagOrStory = function (item) {
            $scope.ClearCrossTabSaveSelection();
            item.IsSelected = true;
            $scope.SelectedTagOrStorySelectionsList = item.Selections;
        }

        $scope.ClearCrossTabSaveSelection = function () {
            $scope.SelectedTagOrStorySelectionsList = [];
            _.map($scope.crossTabMySelectionsMapped.Tags, function (obj) {
                obj.IsSelected = false;
                _.map(obj.Selections, function (item) { item.IsSelected = false; });
            });
            _.map($scope.crossTabMySelectionsMapped.Storys, function (obj) {
                obj.IsSelected = false;
                _.map(obj.Selections, function (item) { item.IsSelected = false; });
            });
            _.map($scope.crossTabMySelectionsMapped.AllSelection, function (obj) {
                obj.IsSelected = false;
            });
        }

        $scope.SelectSelection = function (item) {
            if (item.IsSelected) {
                _.map($scope.SelectedTagOrStorySelectionsList, function (obj) { obj.IsSelected = false; });
            }
            else {
                _.map($scope.SelectedTagOrStorySelectionsList, function (obj) { obj.IsSelected = false; });
                item.IsSelected = true;
            }
        }

        $scope.SelectTableViewSelection = function (item) {
            if (item.IsSelected) {
                _.map($scope.crossTabMySelectionsMapped.AllSelection, function (obj) {
                    obj.IsSelected = false;
                });
            }
            else {
                _.map($scope.crossTabMySelectionsMapped.AllSelection, function (obj) {
                    obj.IsSelected = false;
                });
                item.IsSelected = true;
            }
        }

        $scope.DeleteTagOrSelection = function (IsTagorSelection,IsStory, item) {
            //IsTagorSelection True:tag false selection
            layoutScope.customAlert("Delete " + (IsTagorSelection ? "Tag " + item.TagName.toUpperCase() : "Table " + item.SelectionTitle.toUpperCase()) + " ?", "Confirm", null, function () {
                let data = {
                    SelectionId: IsTagorSelection ? item.Id : item.SelectionId,
                    IsTagOrSelection: IsTagorSelection,
                    IsStory: IsStory
                }
                layoutScope.setLoader(true);
                AjaxService.AjaxPost(data, apiUrl + "/filterpanel/CrossTabDeleteSelection", function (response) {
                    if (response.data) {
                        if (IsTagorSelection) {
                            $scope.SelectedTagOrStorySelectionsList = [];
                            _.remove($scope.crossTabMySelectionsMapped.AllSelection, {
                                TagId: item.Id
                            });
                            _.remove($scope.crossTabMySelectionsMapped.Tags, {
                                Id: item.Id
                            });
                        }
                        else {
                            _.remove($scope.SelectedTagOrStorySelectionsList, {
                                SelectionId: item.SelectionId
                            });
                            _.remove($scope.crossTabMySelectionsMapped.AllSelection, {
                                SelectionId: item.SelectionId
                            });
                        }
                        layoutScope.customAlert("Deleted successfully.", "Alert");
                    }
                    else {
                        layoutScope.customAlert("Deletion Failed.", "Error");
                    }
                    layoutScope.setLoader(false);
                }, errorFunction);
            },"Delete",false);
            
        }

        let GetMySelectionsObj = function (data) {
            data.AllSelection = [];
            angular.forEach(data.Tags, function (obj) {
                obj.Selections = _.remove(_.map(data.TagSelectionMapping, function (item) {
                    if (item.TagId == obj.Id) {
                        item.IsSelected = false;
                        let o = _.cloneDeep(item);
                        o.IsTag = true;
                        o.Tag = obj;
                        data.AllSelection.push(o);
                        return item;
                    }
                }), undefined);
            });
            angular.forEach(data.Storys, function (obj) {
                obj.Selections = _.remove(_.map(data.StorySelectionMapping, function (item) {
                    if (item.TagId == obj.Id) {
                        item.IsSelected = false;
                        let o = _.cloneDeep(item);
                        o.IsTag = false;
                        o.Story = obj;
                        data.AllSelection.push(o);
                        return item;
                    }
                }), undefined);
            });
            return data;
        }

        $scope.crossTabMakeSelection = function () {
            let selection = {};
            if ($scope.IsTagStoryView) {
                //TagStory View
                selection = _.find($scope.SelectedTagOrStorySelectionsList, { 'IsSelected': true });
            }
            else {
                //Table View
                selection = _.find($scope.crossTabMySelectionsMapped.AllSelection, { 'IsSelected': true });
            }
            if (selection == undefined) {
                layoutScope.customAlert("Please make a Table Selection.", "Alert");
                return;
            }
            layoutScope.setLoader(true);
            $scope.showMySelections = false;
            filterPanelScope.MakeSelection(selection.Selection, selection.SelectionParameters, "crosstab");
        }
        
        $scope.SelectTAG_Story_list_item = function (IsTag, item) {
            if (IsTag) {
                $scope.mySelectionResponse.AddToTagName = item.TagName;
            }
            else {
                $scope.mySelectionResponse.AddToStoryName = item.StoryName + $scope.getSuffixForStory(item);
                $scope.mySelectionResponse.AddToTagName = item.StoryName;
            }
            $scope.mySelectionResponse.TagOrStoryId = item.Id;
            $scope.openSaveSelectionDropDown(false);
        }

        $scope.crossTabSaveSelection = function () {
            if ($scope.mySelectionResponse.SelectionTitle == undefined || $scope.mySelectionResponse.SelectionTitle == "") {
                layoutScope.customAlert("Please enter a valid Table name.", "Alert");
                return;
            }
            if (_.find($scope.TAG_Options, { 'IsSelected': true }).Id == 0) {
                $scope.mySelectionResponse.IsTag = true;
                if ($scope.mySelectionResponse.AddToTagName == undefined || $scope.mySelectionResponse.AddToTagName == "") {
                    layoutScope.customAlert("Please enter a valid Tag name.", "Alert");
                    return;
                }
                else if (_.find($scope.crossTabMySelections.Tags, { 'TagName': $scope.mySelectionResponse.AddToTagName.toLowerCase() })) {
                    layoutScope.customAlert("Tag name already exists.", "Alert");
                    return;
                }
            }
            else if (_.find($scope.TAG_Options, { 'IsSelected': true }).Id == 1) {
                $scope.mySelectionResponse.IsTag = true;
                if ($scope.mySelectionResponse.AddToTagName == undefined || $scope.mySelectionResponse.AddToTagName == "") {
                    layoutScope.customAlert("Please select a Tag.", "Alert");
                    return;
                }
                else if (_.find($scope.crossTabMySelections.TagSelectionMapping, { 'TagName': $scope.mySelectionResponse.AddToTagName.toLowerCase(), 'SelectionTitle': $scope.mySelectionResponse.SelectionTitle.toLowerCase() })) {
                    layoutScope.customAlert("Table name already exists in the selected Tag.", "Alert");
                    return
                }
            }
            else if (_.find($scope.TAG_Options, { 'IsSelected': true }).Id == 2) {
                $scope.mySelectionResponse.IsTag = false;
                if ($scope.mySelectionResponse.AddToTagName == undefined || $scope.mySelectionResponse.AddToTagName == "") {
                    layoutScope.customAlert("Please select a story.", "Alert");
                    return;
                }
                else if (_.find($scope.crossTabMySelections.StorySelectionMapping, { 'TagName': $scope.mySelectionResponse.AddToTagName.toLowerCase(), 'SelectionTitle': $scope.mySelectionResponse.SelectionTitle.toLowerCase() })) {
                    layoutScope.customAlert("Table name already exists in the selected story.", "Alert");
                    return
                }
            }
            layoutScope.setLoader(true);
            var data = {};
            data.TagOrStoryId = $scope.mySelectionResponse.TagOrStoryId;
            data.IsTag = $scope.mySelectionResponse.IsTag;
            data.TagName = $scope.mySelectionResponse.AddToTagName.toLowerCase();
            data.selection = topMenuScope.submittedFilterJSON;
            data.FooterText = topMenuScope.getFooterText();
            data.selectionTitle = $scope.mySelectionResponse.SelectionTitle.toLowerCase();
            data.selectionParameters = JSON.stringify($scope.ModuleRequestToDB)
            AjaxService.AjaxPost(data, apiUrl + "/filterpanel/CrossTabSaveSelection", function (response) {
                $scope.isSaveToCrossTab = false;
                if (response.data) {
                    layoutScope.customAlert("Selection saved successfully.", "Alert");
                }
                else {
                    layoutScope.customAlert("Selection could not be saved.", "Alert");
                }
                layoutScope.setLoader(false);
            }, errorFunction);
        }

        let checkDownloadListandDownload = function () {
            if (DownloadList.length == DownloadSelections.length) {
                var temporaryDownloadLink = document.createElement("a");
                temporaryDownloadLink.style.display = 'none';
                document.body.appendChild(temporaryDownloadLink);
                for (let i = 0; i < DownloadList.length; i++) {   
                    temporaryDownloadLink.setAttribute('href', DownloadList[i].path);
                    temporaryDownloadLink.setAttribute('download', DownloadList[i].SelName + '_' + DownloadList[i].path.split('/')[4]);
                    temporaryDownloadLink.click();
                }
                document.body.removeChild(temporaryDownloadLink);
                let deletelist = _.cloneDeep(DownloadList);
                //setTimeout(function () { layoutScope.DeleteFileListFromServer(deletelist); }, 60000);
                layoutScope.setLoader(false);
            }
        }

        $scope.CrossTabSaveSelectionExcelDownload = function () {
            let selection = [], tagorstory, SingleSelection;
            DownloadList = [];
            DownloadSelections = [];
            if ($scope.IsTagStoryView) {
                //TagStory View
                SingleSelection = _.find($scope.SelectedTagOrStorySelectionsList, { 'IsSelected': true });
            }
            else {
                //Table View
                SingleSelection = _.find($scope.crossTabMySelectionsMapped.AllSelection, { 'IsSelected': true });
            }
            if (SingleSelection == undefined) {
                if ($scope.isTagMySelections) {
                    tagorstory= _.find($scope.crossTabMySelectionsMapped.Tags, { 'IsSelected': true });
                }
                else {
                    tagorstory = _.find($scope.crossTabMySelectionsMapped.Storys, { 'IsSelected': true });
                }
                if (tagorstory != undefined) {
                    selection = tagorstory.Selections;
                }
            }
            else {
                selection.push(SingleSelection);
            }
            if (selection.length==0) {
                layoutScope.customAlert("Please make a Selection.", "Alert");
                return;
            }
            layoutScope.setLoader(true);
            DownloadSelections = selection;
            for(let i=0;i<selection.length;i++){
                let request = {};
                request = JSON.parse(selection[i].SelectionParameters);
                request.ExportsType = Constants.EXCEL_TEXT;
                request.FooterText = selection[i].FooterText;
                AjaxService.AjaxPost(request, apiUrl + '/CrossTab/ExportToExcel', function (response) {
                    if (response.status == 200) {
                        DownloadList.push({'path':response.data,'SelName':selection[i].SelectionTitle});
                        checkDownloadListandDownload();
                    }
                    else {
                        layoutScope.customAlert(Constants.SOMETHING_WRONG, Constants.ERROR_HEADER_TEXT, null, null, Constants.OK_TEXT);
                    }
                }, layoutScope.ErrorDownloading);
            }
        }

        $scope.showLTDataFunc = function (flag) {
            if (flag == undefined) {
                $scope.showLTData = !$scope.showLTData
            }
            else {
                $scope.showLTData = flag;
            }
        }

        /********************************Cross Tab Save Related Script END ***************************************************/

    }]);
    
    app.register.directive('onFinishRender', function ($timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last === true) {
                    $timeout(function () {
                        scope.$emit(attr.onFinishRender);
                    });
                }
            }
        };
    });

})

let reposVertical = function (e) {
    angular.element(".leftBody").scrollTop(e.scrollTop);
    angular.element(".rightHeader").scrollLeft(e.scrollLeft);
}