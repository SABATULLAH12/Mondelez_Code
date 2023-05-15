/*----------------------------------------------------------------------------------------------------*/
/*          Author: Rahul Kumar (Software Engineer, F&B)                                              */
/*          Date: 25-02-2019                                                                          */
/*          Discription: This Script contains Filter Controller definition across all modules         */
/*----------------------------------------------------------------------------------------------------*/
"use strict";
define(['app', 'angular', 'jquery', 'lodash', 'ajaxservice', 'JqueryUi', 'constants'], function (app, angular, $) {
    app.register.controller("FilterPanelController", ['$scope', '$css', '$sce', 'AjaxService', 'Constants', function ($scope, $css, $sce, AjaxService, Constants) {
        ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/filter_panel.min.css' }, $scope) : $css.bind({ href: '../Content/Css/filter_panel.css' }, $scope);
        ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/timeperiod.min.css' }, $scope) : $css.bind({ href: '../Content/Css/timeperiod.css' }, $scope);
        //FilterScope Variables 
        let FilterResponseData = [];
        let ModuleSelection = [], level1Data = [], level2Data = [];
        let layoutScope = $scope.$parent.$parent;
        if (!layoutScope.validateSession()) {
            return;
        }
        let topMenuScope = $scope.$parent;
        let ResposeFilterPanalData = {};
        $scope.BrandTab = 1;
        $scope.FilterPanel = [];
        $scope.IsChannelToggle = true;
        $scope.ChannelOrDemographicsToggleDisabled = false;
        $scope.SearchData = [];
        $scope.SearchDataSegment1 = [];
        $scope.SearchDataSegment2 = [];
        $scope.BrandB2Data = [];
        $scope.BrandB3Data = [];
        $scope.BrandB4Data = [];
        $scope.StoryBoardSlides = [];
        topMenuScope.setStoryBoardFooter(false);
        $scope.IsTrend = false;
        $scope.FirstTime = false;
        $scope.level1Data = {};
        $scope.selectionExpanded = false;
        $scope.formData = {};
        $scope.growth_opportunity_TimePeriod = "";
        $scope.FilterPanelFooterText = "";
        $scope.isSelectedFiltersChanged = false;
        $scope.isDependentFiltersChanged = false;
        let DefaultSelectionObj = {
            "channel/retailer": [{ "Id": 1, "Name": "Total Channels", "Selection": null }],
            "demographics": [{ "Id": 1, "Name": "Total Demographics", "Selection": null }]
        }
        $scope.ModuleName = "";
        $scope.AdditionalFooter = [];
        $scope.isLowSampleSize = false;
        $scope.IsChildSelectionAllowed = true;
        topMenuScope.resetFootNotes();
        topMenuScope.footNotes.push({
            type: "LSS", className: "LSS",
            html: $sce.trustAsHtml("<span>Caution! Some data points have low raw buyers. Export to Excel for more details</span>"),
            text: "Sample size less than 20: * (low sample), Sample size 20 – 70: Numbers in Grey.",
            show: function () { return $scope.isLowSampleSize; }
        });
        topMenuScope.footNotes.push({
            type: "DeedpiveTrend-Market/Category", className: "LSS",
            html: $sce.trustAsHtml("<span>Trend Breaks in the output might reepresent data not avaialble for the time period selected.</span>"),
            text: "Trend Breaks in the output might represent data not avaialble for the time period selected.",
            show: function () { return $scope.IsTrend && (isFIlterSelected("compare", "markets") || isFIlterSelected("compare", "category")); }
        });
        topMenuScope.footNotes.push({
            type: "Market-Germany", className: "LSS",
            html: $sce.trustAsHtml("<span>Panel data is not consistent in Germany with Cheese having Household Panel data and Chocolate & Biscuits having individual panel data.</span>"),
            text: "Panel data is not consistent in Germany with Cheese having Household Panel data and Chocolate & Biscuits having individual panel data.",
            show: function () { return isFIlterSelected("markets", "germany"); },
           
        });
        $scope.AdditionalFooter.push({
            type: "Market-Germany", className: "LSS",
            html: $sce.trustAsHtml("<span>* Panel data is not consistent in Germany with Cheese having Household Panel data and Chocolate & Biscuits having individual panel data.</span>"),
            text: "Panel data is not consistent in Germany with Cheese having Household Panel data and Chocolate & Biscuits having individual panel data.",
            show: function () { return isFIlterSelected("markets", "germany"); }
          

        });
        topMenuScope.footNotes.push({
            type: "DeepDive-Top15Brands", className: "LSS",
            html: $sce.trustAsHtml("<span>Top/worst performing brands with the highest change in Buyers compared to year ago are displayed. In legends: '+' represents growth in Buyer change & '-' represents decline in Buyers change.</span>"),
            text: "Top/worst performing brands with the highest change in Buyers compared to year ago are displayed. In legends: '+' represents growth in Buyer change & '-' represents decline in Buyers change.",
            show: function () { return isFIlterSelected("compare", "top/worst performing brands") },
            style: function () { return setFooterTop() },
        });
        topMenuScope.footNotes.push({
            type: "Category-Brands", className: "LSS",
            html: $sce.trustAsHtml("<span>Brand selection across multiple Category not available due to different hierarchy structure across various Market-Category.</span>"),
            text: "Brand selection across multiple Category not available due to different hierarchy structure across various Market-Category.",
            show: function () { return $scope.ModuleName.toLowerCase() != "crosstab" && (isFIlterSelected("compare", "category") || isFIlterSelected("row", "category") || isFIlterSelected("column", "category") || isFIlterSelected("snapshot type", "category-multi")) },
            style: function () { return setFooterTop() },
        });

        ////////////////////////////////////------------------------Important Filter Functions----------------//////////////////////////////////////////////

        $scope.openFilterPanel = function (operation) {
            $scope.isFilterpanelOpen = operation;
            $scope.selectionExpanded = false;
        }
    

        let PrepareFilterPanel = function (data) {
            FilterResponseData = data.data;
            ModuleSelection = FilterResponseData.SelectionData;
            $scope.level1Data.IsHidden = false;
            $scope.level1Data.Data = [{ "ID": 2, "Name": "POINT IN TIME", "IsSelectable": true, "MapID": null, "IsSelected": true, "IsMulti": false }, { "ID": 1, "Name": "TREND", "IsSelectable": true, "MapID": null, "IsSelected": false, "IsMulti": false }];
            level2Data = FilterResponseData.Data[1].Data;
            layoutScope.setLoader(true);
            $scope.FillFilterPanal();
        }
        
        $scope.FillFilterPanal = function () {
            let Module = _.result(_.find(topMenuScope.modules, function (obj) {
                return obj.isActive == true;
            }), 'ModuleName');
            if (FilterResponseData.length == 0) return;
            $scope.ModuleName = Module;
            $scope.level1Data.IsHidden = false;
            $scope.IsTrend = false;
            $scope.FirstTime = true;
            let moduleSelection = JSON.parse(_.result(_.find(ModuleSelection, function (obj) { return obj.Name == Module.toLowerCase(); }), 'Selection'));
            if (topMenuScope.isSlideUpdate) {
                moduleSelection = JSON.parse(topMenuScope.SlideDetails[0].SelectionJSON);
            }
            if (layoutScope.StoryBoardSlideNavigationDetails.isNavigated) {
                moduleSelection = layoutScope.StoryBoardSlideNavigationDetails.Selection;
            }
            if (Module.toLowerCase() == "snapshot") {
                $scope.FilterPanel = [
                { Id: 0, Name: "snapshot type", Dependent: [], Dependency: [2, 3, 4, 5, 6, 7, 8], IsMulti: false, IsHidden: false, IsOpen: false, IsDisabled: false, Data: level2Data[0].Data, Selection: moduleSelection[0].Selection, SelectionText: moduleSelection[0].SelectionText },
                { Id: 1, Name: "markets", Dependent: [], Dependency: [2, 3, 4, 5, 6, 7, 8], IsMulti: false, IsHidden: false, IsOpen: false, IsDisabled: false, Data: level2Data[2].Data, Selection: moduleSelection[1].Selection, SelectionText: moduleSelection[1].SelectionText },
                { Id: 2, Name: "category", Dependent: [0, 1], Dependency: [3, 4, 5, 6, 7, 8], IsMulti: true, IsHidden: false, IsOpen: false, IsDisabled: false, Data: null, Selection: moduleSelection[2].Selection, SelectionText: moduleSelection[2].SelectionText },
                { Id: 3, Name: "time period", Dependent: [0, 1, 2], Dependency: [], IsMulti: false, IsHidden: false, IsOpen: false, IsDisabled: false, Data: null, Selection: moduleSelection[3].Selection, SelectionText: moduleSelection[3].SelectionText },
                { Id: 4, Name: "brands", Dependent: [0, 1, 2], Dependency: [], IsMulti: false, IsHidden: moduleSelection[0].SelectionText.toLowerCase() == "demographics-single", IsOpen: false, IsDisabled: false, Data: null, Selection: moduleSelection[4].Selection, SelectionText: moduleSelection[4].SelectionText },
                { Id: 5, Name: "primary brands", Dependent: [0, 1, 2], Dependency: [6], IsHidden: moduleSelection[0].SelectionText.toLowerCase() != "demographics-single", IsMulti: false, IsOpen: false, IsDisabled: false, Data: null, Selection: moduleSelection[5].Selection, SelectionText: moduleSelection[5].SelectionText },
                { Id: 6, Name: "secondary brands", Dependent: [0, 1, 2, 5], Dependency: [], IsHidden: moduleSelection[0].SelectionText.toLowerCase() != "demographics-single", IsMulti: true, IsOpen: false, IsDisabled: false, Data: null, Selection: moduleSelection[6].Selection, SelectionText: moduleSelection[6].SelectionText },
                { Id: 7, Name: "segments", Dependent: [0, 1, 2], Dependency: [], IsHidden: false, IsMulti: false, IsOpen: false, IsDisabled: false, Data: null, Selection: moduleSelection[7].Selection, SelectionText: moduleSelection[7].SelectionText },
                { Id: 8, Name: moduleSelection[8].Name, Dependent: [0, 1, 2], Dependency: [], IsHidden: false, IsMulti: false, IsOpen: false, IsDisabled: false, Data: null, Selection: moduleSelection[8].Selection, SelectionText: moduleSelection[8].SelectionText }
                ];
            }
            else if (Module.toLowerCase() == "deepdive") {
                $scope.level1Data.IsHidden = true;
                $scope.IsTrend = moduleSelection[3].Selection.length > 1 ? true : false;
                $scope.level1Data.Data[0].IsSelected = !$scope.IsTrend;
                $scope.level1Data.Data[1].IsSelected = $scope.IsTrend;
                $scope.FilterPanel = [
                { Id: 0, Name: "compare", Dependent: [], Dependency: [1, 2, 3, 4, 5, 6, 7], IsHidden: false, IsMulti: false, IsOpen: false, IsDisabled: false, Data: level2Data[1].Data, Selection: moduleSelection[0].Selection, SelectionText: moduleSelection[0].SelectionText },
                { Id: 1, Name: "markets", Dependent: [0], Dependency: [2, 3, 4, 5, 6, 7], IsHidden: false, IsMulti: false, IsOpen: false, IsDisabled: false, Data: level2Data[2].Data, Selection: moduleSelection[1].Selection, SelectionText: moduleSelection[1].SelectionText },
                { Id: 2, Name: "category", Dependent: [0, 1], Dependency: [3, 4, 5, 6, 7], IsHidden: false, IsMulti: false, IsOpen: false, IsDisabled: false, Data: null, Selection: moduleSelection[2].Selection, SelectionText: moduleSelection[2].SelectionText },
                { Id: 3, Name: "time period", Dependent: [0, 1, 2], Dependency: [], IsHidden: false, IsMulti: false, IsOpen: false, IsDisabled: false, Data: null, Selection: moduleSelection[3].Selection, SelectionText: moduleSelection[3].SelectionText },
                { Id: 4, Name: "Brands", Dependent: [0, 1, 2], Dependency: [], IsHidden: false, IsMulti: false, IsOpen: false, Data: null, Selection: moduleSelection[4].Selection, SelectionText: moduleSelection[4].SelectionText },
                { Id: 5, Name: "segments", Dependent: [0, 1, 2], Dependency: [], IsHidden: false, IsMulti: false, IsOpen: false, Data: null, Selection: moduleSelection[5].Selection, SelectionText: moduleSelection[5].SelectionText },
                { Id: 6, Name: "kpi", Dependent: [0], Dependency: [], IsMulti: false, IsHidden: false, IsOpen: false, Data: level2Data[7].Data, Selection: moduleSelection[6].Selection, SelectionText: moduleSelection[6].SelectionText },
                { Id: 7, Name: moduleSelection[7].Name, Dependent: [0, 1, 2], IsHidden: false, Dependency: [], IsMulti: false, IsOpen: false, Data: null, Selection: moduleSelection[7].Selection, SelectionText: moduleSelection[7].SelectionText }
                ];
            }
            else if (Module.toLowerCase() == "crosstab") {
                $scope.FilterPanel = [
                { Id: 0, Name: "column", Dependent: [], Dependency: [1, 2, 3, 4, 5, 6, 7, 8], IsHidden: false, IsMulti: false, IsOpen: false, IsDisabled: false, Data: null, Selection: moduleSelection[0].Selection, SelectionText: moduleSelection[0].SelectionText },
                { Id: 1, Name: "row", Dependent: [0], Dependency: [2, 3, 4, 5, 6, 7, 8], IsHidden: false, IsMulti: false, IsOpen: false, IsDisabled: false, Data: null, Selection: moduleSelection[1].Selection, SelectionText: moduleSelection[1].SelectionText },
                { Id: 2, Name: "markets", Dependent: [0, 1], Dependency: [3, 4, 5, 6, 7, 8], IsHidden: false, IsMulti: false, IsOpen: false, IsDisabled: false, Data: level2Data[2].Data, Selection: moduleSelection[2].Selection, SelectionText: moduleSelection[2].SelectionText },
                { Id: 3, Name: "category", Dependent: [0, 1, 2], Dependency: [4, 5, 6, 7, 8], IsHidden: false, IsMulti: false, IsOpen: false, IsDisabled: false, Data: null, Selection: moduleSelection[3].Selection, SelectionText: moduleSelection[3].SelectionText },
                { Id: 4, Name: "time period", Dependent: [0, 1, 2, 3], Dependency: [], IsHidden: false, IsMulti: false, IsOpen: false, IsDisabled: false, Data: null, Selection: moduleSelection[4].Selection, SelectionText: moduleSelection[4].SelectionText },
                { Id: 5, Name: "Brands", Dependent: [0, 1, 2, 3], Dependency: [], IsHidden: false, IsMulti: false, IsOpen: false, Data: null, Selection: moduleSelection[5].Selection, SelectionText: moduleSelection[5].SelectionText },
                { Id: 6, Name: "segments", Dependent: [0, 1, 2, 3], Dependency: [], IsHidden: false, IsMulti: false, IsOpen: false, Data: null, Selection: moduleSelection[6].Selection, SelectionText: moduleSelection[6].SelectionText },
                { Id: 7, Name: "kpi", Dependent: [0, 1], Dependency: [], IsHidden: false, IsMulti: false, IsOpen: false, Data: level2Data[7].Data, Selection: moduleSelection[7].Selection, SelectionText: moduleSelection[7].SelectionText },
                { Id: 8, Name: moduleSelection[8].Name, Dependent: [0, 1, 2, 3], IsHidden: false, Dependency: [], IsMulti: false, IsOpen: false, Data: null, Selection: moduleSelection[8].Selection, SelectionText: moduleSelection[8].SelectionText }
                ];
            }
            else if (Module.toLowerCase() == "growthopportunity") {
                $scope.FilterPanel = [
                { Id: 0, Name: "markets", Dependent: [], Dependency: [1, 2], IsMulti: false, IsHidden: false, IsOpen: false, IsDisabled: false, Data: level2Data[2].Data, Selection: moduleSelection[0].Selection, SelectionText: moduleSelection[0].SelectionText },
                { Id: 1, Name: "category", Dependent: [0], Dependency: [2], IsMulti: false, IsHidden: false, IsOpen: false, IsDisabled: false, Data: null, Selection: moduleSelection[1].Selection, SelectionText: moduleSelection[1].SelectionText },
                { Id: 2, Name: "Brands", Dependent: [0, 1], Dependency: [], IsMulti: false, IsHidden: false, IsOpen: false, IsDisabled: false, Data: null, Selection: moduleSelection[2].Selection, SelectionText: moduleSelection[2].SelectionText },
                ];
            }
            angular.forEach($scope.FilterPanel, function (obj) {
                if (_.includes(["snapshot type", "compare", "kpi", "row", "column"], obj.Name.toLowerCase())) {
                    ApplyModuleCustomization({
                        "Id": obj.Id,
                        "Name": obj.Name,
                        "Selection": obj.Selection
                    });
                }
                else if (obj.Name.toLowerCase() == "segments") {
                    angular.forEach(obj.Selection, function (objSelection) {
                        ApplyModuleCustomization({
                            "Id": obj.Id,
                            "Name": obj.Name,
                            "Selection": [objSelection]
                        });
                    })
                }
            });
            ApplyModuleDefaultSelection("");
            if (Module.toLowerCase() == "crosstab" && !layoutScope.IsCrossTabSubmit) {
                $scope.setIsSelectedFiltersChanged(true);
                $scope.SetIsCrossTabSubmit(true);
                $scope.clearAll();
                $scope.openFilterPanel(true);
                $scope.CheckandOpenTagStoryMySelection();
                layoutScope.setLoader(false);
                return;
            }
            else if (Module.toLowerCase() == "crosstab" && layoutScope.IsCrossTabSubmit) {
                $scope.submitFilter();
            }
            else if (topMenuScope.isSlideUpdate) {
                $scope.updateSelectionsFromStoryBoard();
            }
            else if (layoutScope.isNavigatedFromOtherModule.isNavigated) {
                layoutScope.isNavigatedFromOtherModule.isNavigated = false;
                $scope.submitFilter();
            }
            else if (IsStickyEnabled) {
                $scope.submitFilter();
            }
            else {
                $scope.setIsSelectedFiltersChanged(true);
                $scope.clearAll();
                $scope.openFilterPanel(true);
                layoutScope.setLoader(false);
                return;
            }

            $scope.setIsSelectedFiltersChanged(false);
        }

        let OpenCloseFilterPanal = function (item, parent, index) {
            //OpenClose filter
            let FinalCondition = false;
            if (item.IsOpen == true) {
                angular.forEach(parent, function (obj) { obj.IsOpen = false; })
            }
            else {
                angular.forEach(parent, function (obj) { obj.IsOpen = false; });
                parent[index].IsOpen = FinalCondition = true;
            }
            return FinalCondition;
        }

        let ApplySelection = function (item, Selection) {
            let selection = Selection == undefined ? [] : Selection;
            var x = $scope.GetSelectionObject(item);
            if ($scope.FilterPanel[x.Id].IsMulti) {
                angular.forEach(item.Data, function (obj) {
                    obj.Selection = [];
                    obj.IsSelected = obj.IsSelected
                    obj.IsChildSelected = false

                    for (var i = 0; i < selection.length; i++) {
                        if (obj.Id == selection[i].Id) {
                            if (selection[i].Selection == null) {
                                obj.IsSelected = true;
                                obj.IsChildSelected = false;
                                //obj.Selection = [];
                            }
                            else {
                                obj.IsChildSelected = true
                                obj.Selection.push(selection[i].Selection[0])
                            }
                        }
                        else {
                            if (selection.length == 1) {
                                obj.IsSelected = false
                                obj.IsChildSelected = false
                                obj.Selection = [];
                            }
                        }
                    }
                    obj.Parent = item;
                });
            }
            else {
                angular.forEach(item.Data, function (obj) {
                    for (var i = 0; i < selection.length; i++) {

                        if (obj.Id == selection[i].Id) {
                            if (selection[i].Selection == null) {
                                obj.IsSelected = true;
                                obj.IsChildSelected = false;
                                obj.Selection = [];
                            }
                            else {
                                obj.IsSelected = false
                                obj.IsChildSelected = true
                                obj.Selection = selection[i].Selection
                            }
                            obj.IsOpen = false;
                        }
                        else {
                            if (selection.length == 1) {
                                obj.IsSelected = false
                                obj.IsChildSelected = false
                                obj.Selection = [];
                            }
                        }
                    }
                    obj.Parent = item;
                });
            }

        }

        let CheckBeforeDepency = function (TabId) {
            for (var i = 0; i < $scope.FilterPanel[TabId].Dependent.length; i++) {
                if (!($scope.FilterPanel[$scope.FilterPanel[TabId].Dependent[i]].Selection.length > 0)) {
                    layoutScope.customAlert("Please make the selection in sequence.", "Alert");
                    return true;
                }
            }
            return false;
        }

        let SelectTimePeriodType = function (IsUnion) {
            let marketSelectionIdList = getFilterSelectionValueOnKey(getModuleFilterTypeId("markets"), "Id");
            let marketSelectionNameList = getFilterSelectionValueOnKey(getModuleFilterTypeId("markets"), "Name");
            let categorySelection = getFilterSelectionValueOnKey(getModuleFilterTypeId("category"), "Id");
            let compareArray = [];
            let compareArray2 = [];
            if (IsUnion == undefined) {
                IsUnion = $scope.IsTrend;
            }
            for (let i = 0; i < marketSelectionNameList.length; i++) {
                if (!IsUnion) {
                    if (i == 0) {
                        _.map(level2Data[4].Data, function (element) {
                            if (_.difference(categorySelection, element[$scope.removeWhiteSpace(marketSelectionNameList[i])]).length == 0) {
                                compareArray.push(element);
                            }
                        });
                    }
                    else {
                        compareArray2 = [];
                        _.map(level2Data[4].Data, function (element) {
                            if (_.difference(categorySelection, element[$scope.removeWhiteSpace(marketSelectionNameList[i])]).length == 0) {
                                compareArray2.push(element);
                            }
                        });
                        compareArray = _.intersectionWith(compareArray, compareArray2, function (x, y) { return x.Id == y.Id });
                    }
                }
                else if (IsUnion) {
                    if (i == 0) {
                        _.map(level2Data[4].Data, function (element) {
                            angular.forEach(categorySelection, function (obj, index) {
                                if (_.difference([categorySelection[index]], element[$scope.removeWhiteSpace(marketSelectionNameList[i])]).length == 0) {
                                    compareArray.push(element);
                                }
                            });
                        });
                    }
                    else {
                        compareArray2 = [];
                        _.map(level2Data[4].Data, function (element) {
                            angular.forEach(categorySelection, function (obj, index) {
                                if (_.difference([categorySelection[index]], element[$scope.removeWhiteSpace(marketSelectionNameList[i])]).length == 0) {
                                    compareArray2.push(element);
                                }
                            });
                        });
                        //_.remove(compareArray, function (obj) { if (obj.Id == obj.ParentId) { return obj } });
                        compareArray = _.unionWith(compareArray, compareArray2, function (x, y) { return x.Id == y.Id });
                    }
                }
            }
            compareArray = compareArray.sort(function (a, b) { return a.SortID - b.SortID });
            compareArray = _.uniqWith(compareArray, _.isEqual);
            return _.remove(_.map(formatTreeParent(compareArray), function (element) { if (element.Data.length > 0) return element }), undefined);
        }

        let SelectChannelDemogType = function (IsUnion, DataTableId) {
            let marketSelectionIdList = getFilterSelectionValueOnKey(getModuleFilterTypeId("markets"), "Id");
            let marketSelectionNameList = getFilterSelectionValueOnKey(getModuleFilterTypeId("markets"), "Name");
            let categorySelection = getFilterSelectionValueOnKey(getModuleFilterTypeId("category"), "Id");
            let compareArray = [];
            let compareArray2 = [];
            if (IsUnion == undefined) IsUnion = false;
            for (let i = 0; i < marketSelectionNameList.length; i++) {
                if (!IsUnion) {
                    if (i == 0) {
                        _.map(level2Data[DataTableId].Data, function (element) {
                            if (_.difference(categorySelection, element[$scope.removeWhiteSpace(marketSelectionNameList[i])]).length == 0) {
                                compareArray.push(element);
                            }
                        });
                    }
                    else {
                        compareArray2 = [];
                        _.map(level2Data[DataTableId].Data, function (element) {
                            if (_.difference(categorySelection, element[$scope.removeWhiteSpace(marketSelectionNameList[i])]).length == 0) {
                                compareArray2.push(element);
                            }
                        });
                        compareArray = _.intersectionWith(compareArray, compareArray2, function (x, y) { return x.Id == y.Id });
                    }
                }
                else if (IsUnion) {
                    if (i == 0) {
                        _.map(level2Data[DataTableId].Data, function (element) {
                            angular.forEach(categorySelection, function (obj, index) {
                                if (_.difference([categorySelection[index]], element[$scope.removeWhiteSpace(marketSelectionNameList[i])]).length == 0) {
                                    compareArray.push(element);
                                }
                            });
                        });
                    }
                    else {
                        compareArray2 = [];
                        _.map(level2Data[DataTableId].Data, function (element) {
                            angular.forEach(categorySelection, function (obj, index) {
                                if (_.difference([categorySelection[index]], element[$scope.removeWhiteSpace(marketSelectionNameList[i])]).length == 0) {
                                    compareArray2.push(element);
                                }
                            });
                        });
                        //_.remove(compareArray, function (obj) { if (obj.Id == obj.ParentId) { return obj } });
                        compareArray = _.unionWith(compareArray, compareArray2, function (x, y) { return x.Id == y.Id });
                    }
                }
            }
            compareArray = compareArray.sort(function (a, b) { return a.Id - b.Id });
            compareArray = _.uniqWith(compareArray, _.isEqual);
            compareArray = formatTreeParent(compareArray)
            if ($scope.ModuleName.toLowerCase() == "snapshot" && $scope.FilterPanel[getModuleFilterTypeId("snapshot type")].SelectionText.toLowerCase() == "demographics-single") {

                if (compareArray.length > 0) {
                    compareArray = _.map(compareArray[0].Data, function (obj) {
                        obj.Data = [];
                        obj.IsLeaf = true;
                        return obj;
                    });
                }
            }
            return compareArray;
        }

        $scope.SelectFilterType = function (item, FilterPanel, index) {
            if (CheckBeforeDepency(item.Id)) {
                return;
            }
            if (!item.IsDisabled) {
                if (item.Name.toLowerCase() == "snapshot type") {


                }
                else if (item.Name.toLowerCase() == "compare") {
                    angular.element(".content1 span:contains('Top/Worst')").parent().css("overflow", "inherit");
                }
                else if (item.Name.toLowerCase() == "row") {
                    item.Data = _.cloneDeep(level2Data[10].Data);
                }
                else if (item.Name.toLowerCase() == "column") {
                    item.Data = _.cloneDeep(level2Data[12].Data);
                }
                else if (item.Name.toLowerCase() == "markets") {

                }
                else if (item.Name.toLowerCase() == "category") {
                    let marketSelection = getFilterSelectionValueOnKey(getModuleFilterTypeId("markets"), "Id");
                    let compareArray = [];
                    let compareArray2 = [];
                    for (let i = 0; i < marketSelection.length; i++) {
                        if (i == 0) {
                            _.map(level2Data[3].Data, function (element) {
                                if (element.CountryId == marketSelection[i]) {
                                    if ($scope.ModuleName.toLowerCase() == "crosstab") {
                                        compareArray.push(element);
                                    }
                                    else if ($scope.ModuleName.toLowerCase() != "crosstab" && !element.OnlyInCrossTab) {
                                        compareArray.push(element);
                                    }

                                }
                            });
                        }
                        else if ((getModuleFilterTypeId("compare") > -1 && $scope.FilterPanel[getModuleFilterTypeId("compare")].SelectionText.toLowerCase() == "top/worst performing brands") || ($scope.ModuleName.toLowerCase() == "crosstab")) {
                            compareArray2 = [];
                            _.map(level2Data[3].Data, function (element) {
                                if (element.CountryId == marketSelection[i]) {
                                    if ($scope.ModuleName.toLowerCase() == "crosstab") {
                                        compareArray2.push(element);
                                    }
                                    else if ($scope.ModuleName.toLowerCase() != "crosstab" && !element.OnlyInCrossTab) {
                                        compareArray2.push(element);
                                    }
                                }
                            });
                            compareArray = _.unionWith(compareArray, compareArray2, function (x, y) { return x.Id == y.Id });
                        }
                        else {
                            compareArray2 = [];
                            _.map(level2Data[3].Data, function (element) {
                                if (element.CountryId == marketSelection[i]) {
                                    if ($scope.ModuleName.toLowerCase() == "crosstab") {
                                        compareArray2.push(element);
                                    }
                                    else if ($scope.ModuleName.toLowerCase() != "crosstab" && !element.OnlyInCrossTab) {
                                        compareArray2.push(element);
                                    }
                                }
                            });
                            compareArray = _.intersectionWith(compareArray, compareArray2, function (x, y) { return x.Id == y.Id });
                        }
                    }
                    item.Data = compareArray;
                }
                else if (item.Name.toLowerCase() == "time period") {
                    if ($scope.CheckCrossTabMultiMarketOrMultiCategory()) {
                        item.Data = SelectTimePeriodType(true);
                    }
                    else {
                        item.Data = SelectTimePeriodType();
                    }
                }
                else if (item.Name.toLowerCase() == "brands" && item.IsOpen == false) {
                    if ($scope.CheckCrossTabMultiMarketOrMultiCategory()) {
                        item.Data = SelectFilterBrandTypeUnion();
                    }
                    else {
                        item.Data = SelectFilterBrandType();
                    }
                    $scope.SetBrandTab(1);
                    $scope.CloseBrandSearch();
                }
                else if (item.Name.toLowerCase() == "primary brands") {
                    item.Data = SelectFilterBrandType();
                    $scope.SetBrandTab(1);
                    $scope.CloseBrandSearch()
                }
                else if (item.Name.toLowerCase() == "secondary brands") {
                    item.Data = SelectFilterBrandType();
                    $scope.SetBrandTab(1);
                    $scope.CloseBrandSearch()
                }
                else if (item.Name.toLowerCase() == "segments") {
                    if ($scope.CheckCrossTabMultiMarketOrMultiCategory()) {
                        item.Data = SelectFilterSegmentTypeUnion();
                    }
                    else {
                        item.Data = SelectFilterSegmentType();
                    }

                    let Module = _.result(_.find(topMenuScope.modules, function (obj) { return obj.isActive == true; }), 'ModuleName');
                    if (Module.toLowerCase() == "snapshot" && $scope.FilterPanel[getModuleFilterTypeId("snapshot type")].SelectionText.toLowerCase() == "channel/retailer-multi") {
                        item.Data[1].IsHidden = true;
                        item.Data[1].Data[0].Data = [];
                    }
                    else if (Module.toLowerCase() == "snapshot" && $scope.FilterPanel[getModuleFilterTypeId("snapshot type")].SelectionText.toLowerCase() == "channel/retailer-single") {
                        item.Data[1].IsHidden = true;
                        item.Data[1].Data[0].Data = [];
                    }
                    else if (Module.toLowerCase() == "snapshot" && $scope.FilterPanel[getModuleFilterTypeId("snapshot type")].SelectionText.toLowerCase() == "demographics-single") {
                        item.Data[1].IsHidden = true;
                        item.Data[1].Data[0].Data = [];
                    }
                    else if (Module.toLowerCase() == "deepdive" && isChannelOrDemogSelectedAsCompare()) {
                        item.Data[1].IsHidden = true;
                        item.Data[1].Data[0].Data = [];
                    }
                    else if (Module.toLowerCase() == "crosstab" && isChannelOrDemogSelectedAsCompare()) {
                        //!$scope.CheckCrossTabMultiMarketOrMultiCategory()
                        item.Data[1].IsHidden = true;
                        if (item.Data[1].Data.length > 0) item.Data[1].Data[0].Data = [];
                    }
                    if (Module.toLowerCase() == "crosstab") {
                        var RowSelectionText = getModuleFilterTypeId("row") > -1 ? $scope.FilterPanel[getModuleFilterTypeId("row")].SelectionText.toLowerCase() : "";
                        var ColSelectionText = getModuleFilterTypeId("column") > -1 ? $scope.FilterPanel[getModuleFilterTypeId("column")].SelectionText.toLowerCase() : "";
                        if (RowSelectionText.indexOf("segment 1") > -1 || ColSelectionText.indexOf("segment 1") > -1) {
                            //item.IsMulti = true;
                        }
                        if (item.Data.length > 1 && item.Data[1].Data.length == 0) {
                            item.Data[1].IsHidden = true;
                        }
                    }
                }
                else if (item.Name.toLowerCase() == "kpi") {
                    let alldata = level2Data[7].Data;
                    item.Data = alldata;

                }
                else if (item.Name.toLowerCase() == "channel/retailer") {
                    if ($scope.CheckCrossTabMultiMarketOrMultiCategory()) {
                        item.Data = SelectChannelDemogType(true, 8);
                    }
                    else {
                        item.Data = SelectChannelDemogType(false, 8);
                    }
                }
                else if (item.Name.toLowerCase() == "demographics") {
                    if ($scope.CheckCrossTabMultiMarketOrMultiCategory()) {
                        item.Data = SelectChannelDemogType(true, 9);
                    }
                    else {
                        item.Data = SelectChannelDemogType(false, 9);
                    }

                }

                if (item.Data.length <= 0) {
                    layoutScope.customAlert(Constants.NO_OUTPUT_TEXT, Constants.ALERT_HEADER_TEXT);
                    return
                }
                if (OpenCloseFilterPanal(item, FilterPanel, index)) {
                    //apply Previous made Selection to the filter
                    ApplySelection(item, item.Selection);
                }
            }
            else {
                layoutScope.customAlert(item.Name + " Filter is currently disabled.", Constants.ALERT_HEADER_TEXT);
            }
        }

        $scope.GetRowColumnSelction = function () {
            let RowSelectionText = getModuleFilterTypeId("row") > -1 ? $scope.FilterPanel[getModuleFilterTypeId("row")].SelectionText.toLowerCase() : "";
            let ColSelectionText = getModuleFilterTypeId("column") > -1 ? $scope.FilterPanel[getModuleFilterTypeId("column")].SelectionText.toLowerCase() : "";
            let RowSelectionArray = RowSelectionText.split(' - ');
            let ColSelectionArray = ColSelectionText.split(' - ');
            return _.concat(RowSelectionArray, ColSelectionArray);
        }

        $scope.CheckCrossTabMultiMarketOrMultiCategory = function () {
            let RowColArray = $scope.GetRowColumnSelction();
            return ($scope.ModuleName.toLocaleLowerCase() == "crosstab" && (_.includes(RowColArray, 'markets') || _.includes(RowColArray, 'category')));
            //return ($scope.ModuleName.toLocaleLowerCase() == "crosstab" && ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 1 || $scope.FilterPanel[getModuleFilterTypeId("markets")].Selection.length > 1));
        }

        $scope.IsMultiMarCatSelDeepCross = function () {
            return (($scope.ModuleName.toLocaleLowerCase() == "crosstab" || $scope.ModuleName.toLocaleLowerCase() == "deepdive") && ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 1 || $scope.FilterPanel[getModuleFilterTypeId("markets")].Selection.length > 1));
        }

        $scope.BrandHierarchyText = function () {
            let BHText = "Brand Hierarchy";
            if ($scope.ModuleName.toLocaleLowerCase() == "deepdive") {
                if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 1 || $scope.FilterPanel[getModuleFilterTypeId("markets")].Selection.length > 1) {
                    BHText = "Available Brands";
                }
            }
            else if ($scope.ModuleName.toLocaleLowerCase() == "crosstab") {
                if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 1 || $scope.FilterPanel[getModuleFilterTypeId("markets")].Selection.length > 1) {
                    BHText = "Available Brands & Segments";
                }
            }
            return BHText;
        }

        $scope.SubFilterClick = function (item, parent, index) {
            //debugger

            //open next level and apply selection
            if (!item.IsDisabled) {
                if (!isLeaveNode(item)) {
                    if (item.Parent != undefined && item.Parent.Name != undefined && item.Parent.Name.toLowerCase() == "row") {
                        let colSelctedId = -1, rLvl1SelctedId = -1, rLvl2SelctedId = -1, rLvl3SelctedId = -1;
                        let isChannelOrDemogSelected = false, isBrandOrCategorySelected = false, isSegmentOrCategorySelected = false;
                        let BrandId = 2, CategoryId = 3, ChannelId = 4, DemogId = 5, Segment1Id = 8;

                        if (item.Id == 101) {
                            colSelctedId = getFilterSelectionValueOnKey(getModuleFilterTypeId("column"), "Id")[0] == undefined ? -1 : getFilterSelectionValueOnKey(getModuleFilterTypeId("column"), "Id")[0];
                        }
                        else if (item.Id == 102) {
                            colSelctedId = getFilterSelectionValueOnKey(getModuleFilterTypeId("column"), "Id")[0] == undefined ? -1 : getFilterSelectionValueOnKey(getModuleFilterTypeId("column"), "Id")[0];
                            rLvl1SelctedId = getFilterSelectionValueOnKey(getModuleFilterTypeId("row"), "Id")[0] == undefined ? -1 : getFilterSelectionValueOnKey(getModuleFilterTypeId("row"), "Id")[0];
                            if (rLvl1SelctedId == -1) {
                                layoutScope.customAlert("Please make the selection in sequence.", "Alert");
                                return;
                            }
                        }
                        else if (item.Id == 103) {
                            colSelctedId = getFilterSelectionValueOnKey(getModuleFilterTypeId("column"), "Id")[0] == undefined ? -1 : getFilterSelectionValueOnKey(getModuleFilterTypeId("column"), "Id")[0];
                            rLvl1SelctedId = getFilterSelectionValueOnKey(getModuleFilterTypeId("row"), "Id")[0] == undefined ? -1 : getFilterSelectionValueOnKey(getModuleFilterTypeId("row"), "Id")[0];
                            rLvl2SelctedId = getFilterSelectionValueOnKey(getModuleFilterTypeId("row"), "Id")[1] == undefined ? -1 : getFilterSelectionValueOnKey(getModuleFilterTypeId("row"), "Id")[1];
                            if (rLvl2SelctedId == -1) {
                                layoutScope.customAlert("Please make the selection in sequence.", "Alert");
                                return;
                            }
                        }
                        else if (item.Id == 104) {
                            colSelctedId = getFilterSelectionValueOnKey(getModuleFilterTypeId("column"), "Id")[0] == undefined ? -1 : getFilterSelectionValueOnKey(getModuleFilterTypeId("column"), "Id")[0];
                            rLvl1SelctedId = getFilterSelectionValueOnKey(getModuleFilterTypeId("row"), "Id")[0] == undefined ? -1 : getFilterSelectionValueOnKey(getModuleFilterTypeId("row"), "Id")[0];
                            rLvl2SelctedId = getFilterSelectionValueOnKey(getModuleFilterTypeId("row"), "Id")[1] == undefined ? -1 : getFilterSelectionValueOnKey(getModuleFilterTypeId("row"), "Id")[1];
                            rLvl3SelctedId = getFilterSelectionValueOnKey(getModuleFilterTypeId("row"), "Id")[2] == undefined ? -1 : getFilterSelectionValueOnKey(getModuleFilterTypeId("row"), "Id")[2];
                            if (rLvl3SelctedId == -1) {
                                layoutScope.customAlert("Please make the selection in sequence.", "Alert");
                                return;
                            }
                        }
                        let checkArray = [colSelctedId, rLvl1SelctedId, rLvl2SelctedId, rLvl3SelctedId];
                        if (_.includes(checkArray, ChannelId) || _.includes(checkArray, DemogId)) {
                            isChannelOrDemogSelected = true;
                        }
                        //AllowAll
                        //if (_.includes(checkArray, Segment1Id) || _.includes(checkArray, CategoryId)) {
                        //    isSegmentOrCategorySelected = true;
                        //}
                        //if (_.includes(checkArray, BrandId) || _.includes(checkArray, CategoryId) ) {
                        //    isBrandOrCategorySelected = true;
                        //}
                        let rowData = [];
                        rowData = _.map(_.cloneDeep(level2Data[12].Data), function (obj) {
                            if (isChannelOrDemogSelected && _.includes(["channel/retailer", "demographics"], obj.Name.toLowerCase()) ||
                                (isBrandOrCategorySelected && _.includes(["brands", "category"], obj.Name.toLowerCase())) ||
                                (isSegmentOrCategorySelected && _.includes(["segment 1", "category"], obj.Name.toLowerCase()))) {
                                return undefined;
                            }
                            else if (!_.includes(checkArray, obj.Id)) {
                                return obj;
                            }
                        });
                        rowData = _.remove(rowData, undefined);
                        item.Data = rowData;
                    }
                    if (OpenCloseFilterPanal(item, parent, index)) {
                        //apply Previous made Selection to the filter
                        ApplySelection(item, item.Selection);
                        let x = $('.list_item_child_container').not(".ng-hide")[0];
                        setTimeout(function () { x.scrollTo(0, x.scrollHeight); }, 200);
                    }
                    if (item.Parent != undefined && item.Parent.Name != undefined && item.Parent.Name.toLowerCase() == "time period" && $scope.IsTrend && item.IsOpen) {
                        item.Data = _.remove(_.map(item.Data, function (obj) { if (obj.Name.toLowerCase() != 'latest time period available') { return obj } }), undefined);
                        let obj = FilterPositionFromSelection(item);
                        item.TimeperiodMin = obj.min;
                        item.TimeperiodMax = obj.max;
                        timeperiodSlider(item);
                        changeSelectionOfTimeperiod(obj, item);
                    }
                }
            }
            else {
                layoutScope.customAlert(item.Name + " Filter is currently disabled.", "Alert");
            }
        }

        let SelectFilterSegmentTypeUnion = function () {
            let marketSelectionIdList = getFilterSelectionValueOnKey(getModuleFilterTypeId("markets"), "Id");
            let categorySelection = getFilterSelectionValueOnKey(getModuleFilterTypeId("category"), "Id");
            let data = level2Data[6].Data;
            let compareArray = [];
            let compareArray1 = [];
            let compareArray2 = [];
            let compareArray3 = [];
            for (let i = 0; i < marketSelectionIdList.length; i++) {
                if (i == 0) {
                    _.map(data, function (element) {
                        if (marketSelectionIdList[i] == element.CountryId && _.includes(categorySelection, element.CategoryId) && element.type == 1) {
                            let RepeatedElement = _.remove(_.map(compareArray, function (obj) {
                                if (obj.Name.toLocaleLowerCase() == element.Name.toLocaleLowerCase()) return obj;
                            }), undefined);
                            if (RepeatedElement.length > 0) {
                                RepeatedElement[0].SegmentMappings.push({ CountryId: element.CountryId, CategoryId: element.CategoryId, SegmentId: element.Id, Type: element.type, SegmentName: element.Name.toLocaleLowerCase() });
                            }
                            else {
                                element.IsTopLevel = element.ParentId == element.type;
                                element.SegmentMappings = [];
                                element.SegmentMappings.push({ CountryId: element.CountryId, CategoryId: element.CategoryId, SegmentId: element.Id, Type: element.type, SegmentName: element.Name.toLocaleLowerCase() });
                                compareArray.push(element);
                            }
                        }
                        else if (marketSelectionIdList[i] == element.CountryId && _.includes(categorySelection, element.CategoryId) && element.type == 2) {
                            let RepeatedElement = _.remove(_.map(compareArray1, function (obj) {
                                if (obj.Name.toLocaleLowerCase() == element.Name.toLocaleLowerCase()) return obj;
                            }), undefined);
                            if (RepeatedElement.length > 0) {
                                RepeatedElement[0].SegmentMappings.push({ CountryId: element.CountryId, CategoryId: element.CategoryId, SegmentId: element.Id, Type: element.type, SegmentName: element.Name.toLocaleLowerCase() });
                            }
                            else {
                                element.IsTopLevel = element.ParentId == element.type;
                                element.SegmentMappings = [];
                                element.SegmentMappings.push({ CountryId: element.CountryId, CategoryId: element.CategoryId, SegmentId: element.Id, Type: element.type, SegmentName: element.Name.toLocaleLowerCase() });
                                compareArray1.push(element);
                            }
                        }
                    });
                }
                else {
                    compareArray3 = [];
                    compareArray2 = [];
                    _.map(data, function (element) {
                        if (marketSelectionIdList[i] == element.CountryId && _.includes(categorySelection, element.CategoryId) && element.type == 1) {
                            let RepeatedElement = _.remove(_.map(compareArray2, function (obj) {
                                if (obj.Name.toLocaleLowerCase() == element.Name.toLocaleLowerCase()) return obj;
                            }), undefined);
                            if (RepeatedElement.length > 0) {
                                RepeatedElement[0].SegmentMappings.push({ CountryId: element.CountryId, CategoryId: element.CategoryId, SegmentId: element.Id, Type: element.type, SegmentName: element.Name.toLocaleLowerCase() });
                            }
                            else {
                                element.IsTopLevel = element.ParentId == element.type;
                                element.SegmentMappings = [];
                                element.SegmentMappings.push({ CountryId: element.CountryId, CategoryId: element.CategoryId, SegmentId: element.Id, Type: element.type, SegmentName: element.Name.toLocaleLowerCase() });
                                compareArray2.push(element);
                            }
                        }
                        else if (marketSelectionIdList[i] == element.CountryId && _.includes(categorySelection, element.CategoryId) && element.type == 2) {
                            let RepeatedElement = _.remove(_.map(compareArray3, function (obj) {
                                if (obj.Name.toLocaleLowerCase() == element.Name.toLocaleLowerCase()) return obj;
                            }), undefined);
                            if (RepeatedElement.length > 0) {
                                RepeatedElement[0].SegmentMappings.push({ CountryId: element.CountryId, CategoryId: element.CategoryId, SegmentId: element.Id, Type: element.type, SegmentName: element.Name.toLocaleLowerCase() });
                            }
                            else {
                                element.IsTopLevel = element.ParentId == element.type;
                                element.SegmentMappings = [];
                                element.SegmentMappings.push({ CountryId: element.CountryId, CategoryId: element.CategoryId, SegmentId: element.Id, Type: element.type, SegmentName: element.Name.toLocaleLowerCase() });
                                compareArray3.push(element);
                            }
                        }
                    });
                    compareArray = _.unionWith(compareArray, compareArray2, function (x, y) {
                        if (x.Name.toLocaleLowerCase() == y.Name.toLocaleLowerCase() && x.type == y.type) {
                            if (x.Name.toLocaleLowerCase() == y.Name.toLocaleLowerCase()) {
                                y.SegmentMappings = _.concat(y.SegmentMappings, x.SegmentMappings);
                            }
                        }
                        return x.Name.toLocaleLowerCase() == y.Name.toLocaleLowerCase() && x.type == y.type
                    });
                    compareArray1 = _.unionWith(compareArray1, compareArray3, function (x, y) {
                        if (x.Name.toLocaleLowerCase() == y.Name.toLocaleLowerCase() && x.type == y.type) {
                            if (x.Name.toLocaleLowerCase() == y.Name.toLocaleLowerCase()) {
                                y.SegmentMappings = _.concat(y.SegmentMappings, x.SegmentMappings);
                            }
                        }
                        return x.Name.toLocaleLowerCase() == y.Name.toLocaleLowerCase() && x.type == y.type
                    });
                }
            }
            $scope.SearchDataSegment1 = compareArray;
            $scope.SearchDataSegment2 = compareArray1;
            return formatSegmentParentUnion(_.concat(compareArray, compareArray1));
        }

        let SelectFilterSegmentType = function () {
            let marketSelectionIdList = getFilterSelectionValueOnKey(getModuleFilterTypeId("markets"), "Id");
            let marketSelectionNameList = getFilterSelectionValueOnKey(getModuleFilterTypeId("markets"), "Name");
            let categorySelection = getFilterSelectionValueOnKey(getModuleFilterTypeId("category"), "Id");
            let data = _.map(level2Data[6].Data, function (obj) {
                if (obj.CategoryId == categorySelection[0]) {
                    return obj;
                }
            });
            data = _.remove(data, undefined);
            let compareArray = [];
            let compareArray2 = [];
            for (let i = 0; i < marketSelectionIdList.length; i++) {
                if (i == 0) {
                    _.map(data, function (element) {
                        if (marketSelectionIdList[i] == element.CountryId) {
                            element.SegmentMappings = [];
                            element.SegmentMappings.push({ CountryId: element.CountryId, CategoryId: element.CategoryId, SegmentId: element.Id, Type: element.type, SegmentName: element.Name });
                            compareArray.push(element);
                        }
                    });
                }
                else {
                    compareArray2 = [];
                    _.map(data, function (element) {
                        if (marketSelectionIdList[i] == element.CountryId) {
                            compareArray2.push(element);
                        }
                    });
                    compareArray = _.intersectionWith(compareArray, compareArray2, function (x, y) {
                        if (x.Name.toLocaleLowerCase() == y.Name.toLocaleLowerCase() && x.type == y.type) {
                            x.SegmentMappings.push({ CountryId: y.CountryId, CategoryId: y.CategoryId, SegmentId: y.Id, Type: y.type, SegmentName: element.Name });
                        }
                        return x.Name.toLocaleLowerCase() == y.Name.toLocaleLowerCase() && x.type == y.type
                    });
                }
            }
            return formatSegmentParent(compareArray);
        }

        let SelectFilterBrandTypeUnion = function () {
            let marketSelectionIdList = getFilterSelectionValueOnKey(getModuleFilterTypeId("markets"), "Id");
            let categorySelection = getFilterSelectionValueOnKey(getModuleFilterTypeId("category"), "Id");
            let data = level2Data[5].Data;
            let compareArray = [];
            let compareArray2 = [];

            for (let i = 0; i < marketSelectionIdList.length; i++) {
                if (i == 0) {
                    _.map(data, function (element) {
                        if (marketSelectionIdList[i] == element.CountryId && _.includes(categorySelection, element.CategoryId)) {
                            let RepeatedElement = _.remove(_.map(compareArray, function (obj) {
                                if (obj.Name.toLocaleLowerCase() == element.Name.toLocaleLowerCase()) return obj;
                            }), undefined);
                            if (RepeatedElement.length > 0) {
                                RepeatedElement[0].BrandMappings.push({ CountryId: element.CountryId, CategoryId: element.CategoryId, BrandId: element.Id, BrandName: element.Name.toLocaleLowerCase() });
                            }
                            else {
                                element.BrandMappings = [];
                                element.BrandMappings.push({ CountryId: element.CountryId, CategoryId: element.CategoryId, BrandId: element.Id, BrandName: element.Name.toLocaleLowerCase() });
                                compareArray.push(element);
                            }
                        }
                    });
                }
                else {
                    compareArray2 = [];
                    _.map(data, function (element) {
                        if (marketSelectionIdList[i] == element.CountryId && _.includes(categorySelection, element.CategoryId)) {
                            let RepeatedElement = _.remove(_.map(compareArray2, function (obj) {
                                if (obj.Name.toLocaleLowerCase() == element.Name.toLocaleLowerCase()) return obj;
                            }), undefined);
                            if (RepeatedElement.length > 0) {
                                RepeatedElement[0].BrandMappings.push({ CountryId: element.CountryId, CategoryId: element.CategoryId, BrandId: element.Id, BrandName: element.Name.toLocaleLowerCase() });
                            }
                            else {
                                element.BrandMappings = [];
                                element.BrandMappings.push({ CountryId: element.CountryId, CategoryId: element.CategoryId, BrandId: element.Id, BrandName: element.Name.toLocaleLowerCase() });
                                compareArray2.push(element);
                            }
                        }
                    });
                    compareArray = _.unionWith(compareArray, compareArray2, function (x, y) {
                        if (x.Name.toLocaleLowerCase() == y.Name.toLocaleLowerCase()) {
                            y.BrandMappings = _.concat(y.BrandMappings, x.BrandMappings);
                        }
                        return x.Name.toLocaleLowerCase() == y.Name.toLocaleLowerCase()
                    });
                }
            }
            $scope.SearchData = compareArray;
            return formatBrandParentAllInOneLevel(compareArray);
        }


        $scope.IsAllSearchItemSelected = function (ArrayObj, id) {
            let Allselected = true;
            for (let i = 0; i < ArrayObj.length; i++) {
                if (!$scope.IsNamePresentInFilterSelection(id, ArrayObj[i].DisplayName)) {
                    Allselected = false;
                    break;
                }
            }
            return Allselected;
        }

        $scope.SelectAllSearchedListItem = function (ArrayObj, id) {
            if ($scope.IsAllSearchItemSelected(ArrayObj, id)) {
                for (let i = 0; i < ArrayObj.length; i++) {
                    if ($scope.IsNamePresentInFilterSelection(id, ArrayObj[i].DisplayName)) {
                        $scope.SelectBrand(ArrayObj[i], false);
                    }
                }
            }
            else {
                for (let i = 0; i < ArrayObj.length; i++) {
                    if (!$scope.IsNamePresentInFilterSelection(id, ArrayObj[i].DisplayName)) {
                        $scope.SelectBrand(ArrayObj[i], false);
                    }
                }
            }
        }

        let SelectFilterBrandType = function (module) {
            let marketSelectionIdList = getFilterSelectionValueOnKey(getModuleFilterTypeId("markets"), "Id");
            let marketSelectionNameList = getFilterSelectionValueOnKey(getModuleFilterTypeId("markets"), "Name");
            let categorySelection = getFilterSelectionValueOnKey(getModuleFilterTypeId("category"), "Id");
            let data = _.map(level2Data[5].Data, function (obj) {
                if (obj.CategoryId == categorySelection[0]) {
                    return obj;
                }
            });
            if ((module != null && module.toLocaleLowerCase() == 'growthopportunity') || $scope.ModuleName == 'GROWTHOPPORTUNITY') {
                data = _.map(level2Data[11].Data, function (obj) {
                    if (obj.CategoryId == categorySelection[0]) {
                        return obj;
                    }
                });
            }
            data = _.remove(data, undefined);
            let compareArray = [];
            let compareArray2 = [];
            for (let i = 0; i < marketSelectionIdList.length; i++) {
                if (i == 0) {
                    _.map(data, function (element) {
                        if (marketSelectionIdList[i] == element.CountryId) {
                            element.BrandMappings = [];
                            element.BrandMappings.push({ CountryId: element.CountryId, CategoryId: element.CategoryId, BrandId: element.Id, BrandName: element.Name });
                            compareArray.push(element);
                        }
                    });
                }
                else {
                    compareArray2 = [];
                    _.map(data, function (element) {
                        if (marketSelectionIdList[i] == element.CountryId) {
                            element.BrandMappings = [];
                            element.BrandMappings.push({ CountryId: element.CountryId, CategoryId: element.CategoryId, BrandId: element.Id, BrandName: element.Name });
                            compareArray2.push(element);
                        }
                    });
                    compareArray = _.intersectionWith(compareArray, compareArray2, function (x, y) {
                        if (x.Name == y.Name) {
                            if (x.BrandMappings == undefined) {
                                y.BrandMappings.push({ CountryId: y.CountryId, CategoryId: y.CategoryId, BrandId: y.Id, BrandName: y.Name });
                            }
                            else {
                                x.BrandMappings.push({ CountryId: y.CountryId, CategoryId: y.CategoryId, BrandId: y.Id, BrandName: y.Name });
                            }
                        }
                        return x.Name == y.Name
                    });
                }
            }
            $scope.SearchData = compareArray;
            return formatBrandParent(compareArray);
        }

        $scope.SetBrandTab = function (SetToTab) {
            $scope.BrandTab = SetToTab;
            if ($scope.BrandTab == 1) {
                if ($scope.BrandB2Data.length == undefined) { $scope.BrandB2Data.IsOpen = false; }
                $scope.BrandB2Data = [];
                $scope.BrandB3Data = [];
                $scope.BrandB4Data = [];
            } else if ($scope.BrandTab == 2) {
                $scope.BrandB3Data = [];
                $scope.BrandB4Data = [];
                CloseOpenedBrand($scope.BrandB2Data);
            }
            else if ($scope.BrandTab == 3) {
                $scope.BrandB4Data = [];
                CloseOpenedBrand($scope.BrandB3Data);
            }
            else if ($scope.BrandTab == 4) {
                CloseOpenedBrand($scope.BrandB4Data);
            }
        }

        let CloseOpenedBrand = function (item) {
            item.IsOpen = false;
            angular.forEach(item.Data, function (element) {
                if (!isLeaveNode(element)) CloseOpenedBrand(element);
            });
        }

        $scope.CloseBrandSearch = function () {
            $scope.formData.brandSearchText = "";
        }

        $scope.SelectSegment = function (ListItem, CloseBrandSearch) {
            //Search and select the brand 
            var FilterId = _.result(_.find($scope.FilterPanel, function (obj) {
                return obj.IsOpen;
            }), 'Id')
            let FilterData = $scope.FilterPanel[FilterId].Data;
            $scope.SelectSubFilterData(FindSegmentItem(FilterData, ListItem));
            if (CloseBrandSearch == undefined || CloseBrandSearch == true)
                $scope.CloseBrandSearch();
        }

        let FindSegmentItem = function (data, ListItem) {
            for (var i = 0; i < data.length; i++) {
                ApplySelection(data[i]);
                if (data[i].Name == ListItem.Name && (data[i].Parent.Name.toLowerCase() == 'segment 1' ? 1 : (data[i].Parent.Name.toLowerCase() == 'segment 2' ? 2 : ListItem.type)) == ListItem.type) {
                    return data[i];
                }
                else if (!isLeaveNode(data[i])) {
                    if (FindSegmentItem(data[i].Data, ListItem) != null)
                        return FindSegmentItem(data[i].Data, ListItem);
                }
            }
        }

        $scope.SelectBrand = function (ListItem, CloseBrandSearch) {
            //Search and select the brand 
            var FilterbrandId = _.result(_.find($scope.FilterPanel, function (obj) {
                return obj.IsOpen;
            }), 'Id')
            let FilterData = $scope.FilterPanel[FilterbrandId].Data;
            $scope.SelectSubFilterData(FindBrandItem(FilterData, ListItem));
            if (CloseBrandSearch == undefined || CloseBrandSearch == true)
                $scope.CloseBrandSearch();
        }


        let FindBrandItem = function (data, ListItem) {
            for (var i = 0; i < data.length; i++) {
                ApplySelection(data[i]);
                if (data[i].Name == ListItem.Name) {
                    return data[i];
                }
                else if (!isLeaveNode(data[i])) {
                    if (FindBrandItem(data[i].Data, ListItem) != null)
                        return FindBrandItem(data[i].Data, ListItem);
                }
            }
        }

        $scope.SubBrandFilterClick = function (item, parent, index) {
            if (!isLeaveNode(item)) {
                $scope.SetBrandTab(item.Data[0].brandTabId)

                if ($scope.BrandTab == 1) {

                } else if ($scope.BrandTab == 2) {
                    $scope.BrandB2Data = item;
                    CloseOpenedBrand($scope.BrandB2Data);
                }
                else if ($scope.BrandTab == 3) {
                    $scope.BrandB3Data = item;
                    CloseOpenedBrand($scope.BrandB3Data);
                }
                else if ($scope.BrandTab == 4) {
                    $scope.BrandB4Data = item;
                }
            }
            //add the data to that tab
            if (!item.IsDisabled) {
                if (!isLeaveNode(item)) {
                    if (OpenCloseFilterPanal(item, parent, index)) {
                        //apply Previous made Selection to the filter
                        ApplySelection(item, item.Selection);
                        let BrandScrolls = $('.brandbannerChildContainer').not(".ng-hide");
                        angular.forEach(BrandScrolls, function (x) { setTimeout(function () { x.scrollTo(0, x.scrollHeight); }, 200); });
                    }
                }
            }
            else {
                layoutScope.customAlert(item.Name + " Filter is currently disabled.", "Alert");
            }
        }

        layoutScope.setLoader(true);
        if (!layoutScope.validateSession()) {
            return;
        }
        AjaxService.AjaxPost(null, apiUrl + "/FilterPanel/GetSelection", PrepareFilterPanel, function (response) { layoutScope.setLoader(false); layoutScope.customAlert("Error Occured."); console.log(response) });

        let GenerateSelectionJSON = function () {
            return JSON.stringify(_.map($scope.FilterPanel, function (obj) { return { Id: obj.Id, Name: obj.Name, Selection: obj.Selection, SelectionText: obj.SelectionText } }));
        }

        $scope.submitFilter = function () {
            if (!layoutScope.validateSession()) {
                return;
            }
            if (!checkAllFiltersSelected()) {
                return;
            }
            var submittedFilter = prepareSelectedFiltersData();
            layoutScope.setLoader(true);
            var tempModuleSelection = GenerateSelectionJSON();
            ReleaseMode ? {} : console.log(tempModuleSelection);
            var Object = {};
            var UserDetailObject = {};
            Object.moduleId = _.result(_.find(topMenuScope.modules, function (obj) {
                return obj.isActive == true;
            }), 'ID');
            angular.forEach(ModuleSelection, function (obj) {
                if (obj.Name.toLowerCase() == $scope.ModuleName.toLowerCase())
                    obj.Selection = tempModuleSelection;
            });
            topMenuScope.setSelection(tempModuleSelection);
            Object.selection = tempModuleSelection;
            //UserDetailObject.moduleName = $scope.ModuleName;
           //UserDetailObject.selection = tempModuleSelection;
            if (!layoutScope.validateSession()) {
                return;
            }
            AjaxService.AjaxPost(Object, apiUrl + '/FilterPanel/SaveSelection', function (response) {
                AjaxService.AjaxPost(Object, apiUrl + '/FilterPanel/UserTrackingDetails', function (response) { }, function (response) { console.log(response) });
            }, function (response) {
                console.log(response);
               
            });
            $scope.getOutput(submittedFilter);
        }

        ////////////////////////////////////------------------------Important Filter exception Functions------------//////////////////////////////////////////////

        $scope.SetGrowthTimePeriod = function (GO_TimePeriod) {
            $scope.growth_opportunity_TimePeriod = " || " + GO_TimePeriod;
        }

        $scope.HideItemData = function (item) {
            if (item.IsHidden) return true;
            if ($scope.ModuleName.toLowerCase() == "deepdive") {
                if (!isLeaveSelection($scope.FilterPanel[getModuleFilterTypeId("compare")]) && $scope.FilterPanel[getModuleFilterTypeId("compare")].Selection[0].Name.toLowerCase() == "demographics") {
                    if (item.IsChannelOnlyMetric != null && item.IsChannelOnlyMetric) return true;
                }
            }
            else if ($scope.ModuleName.toLowerCase() == "crosstab") {
                if (!isLeaveSelection($scope.FilterPanel[getModuleFilterTypeId("row")])
                    && !isLeaveSelection($scope.FilterPanel[getModuleFilterTypeId("column")])) {
                    let List = $scope.FilterPanel[getModuleFilterTypeId("row")].SelectionText.toLowerCase().split(' - ');
                    List.push($scope.FilterPanel[getModuleFilterTypeId("column")].SelectionText.toLowerCase());
                    if (item.IsChannelOnlyMetric != null && item.IsChannelOnlyMetric && _.includes(List, "demographics")) return true;
                }
            }
            return false;
        };

        let formatBrandParentAllInOneLevel = function (compareArray) {
            let Data = [];
            angular.forEach(compareArray, function (element) {

                var obj = {
                    Data: null,
                    DisplayName: element.DisplayName,
                    Id: element.Id,
                    IsChildSelected: false,
                    IsLeaf: true,
                    IsOpen: false,
                    IsSelectable: element.IsSelectable == 1,
                    IsSelected: false,
                    Name: element.Name,
                    Selection: [],
                    brandTabId: element.brandTabId,
                    BrandMappings: element.BrandMappings,
                }
                Data.push(obj);

            });
            return Data;
        }

        let formatBrandParent = function (compareArray) {
            let Data = [];
            angular.forEach(compareArray, function (element) {
                if (element.Id == element.ParentId) {
                    var obj = {
                        Data: element.IsLastLevel == 0 ? FormatBrandChild(compareArray, element.Id) : null,
                        DisplayName: element.DisplayName,
                        Id: element.Id,
                        IsChildSelected: false,
                        IsLeaf: element.IsLastLevel == 1,
                        IsOpen: false,
                        IsSelectable: element.IsSelectable == 1,
                        IsSelected: false,
                        Name: element.Name,
                        Selection: [],
                        brandTabId: element.brandTabId,
                        BrandMappings: element.BrandMappings,
                    }
                    Data.push(obj);
                }
            });
            return Data;
        }

        let FormatBrandChild = function (List, parentid) {
            let Data = [];
            angular.forEach(List, function (element) {
                if (element.Id != element.ParentId && element.ParentId == parentid) {
                    var obj = {
                        Data: element.IsLastLevel == 0 ? FormatBrandChild(List, element.Id) : null,
                        DisplayName: element.DisplayName,
                        Id: element.Id,
                        IsChildSelected: false,
                        IsLeaf: element.IsLastLevel == 1,
                        IsOpen: false,
                        IsSelectable: element.IsSelectable == 1,
                        IsSelected: false,
                        Name: element.Name,
                        Selection: [],
                        brandTabId: element.brandTabId,
                        BrandMappings: element.BrandMappings,
                    }
                    Data.push(obj);
                }
            });
            return Data;
        }

        let formatSegmentParentUnion = function (compareArray) {
            let Data = [];
            angular.forEach(compareArray, function (element) {
                if (element.Id == element.ParentId) {
                    var obj = {
                        Data: element.IsLastLevel == 0 ? FormatSegmentChildUnion(compareArray, element.type) : null,
                        DisplayName: element.DisplayName,
                        Id: element.Id,
                        IsChildSelected: false,
                        IsLeaf: element.IsLastLevel == 1,
                        IsOpen: false,
                        IsSelectable: element.IsSelectable == 1,
                        IsSelected: false,
                        Name: element.Name,
                        Selection: [],
                        Type: element.type,
                        SegmentMappings: element.SegmentMappings,
                    }
                    Data.push(obj);
                }
            });
            return Data;
        }

        let FormatSegmentChildUnion = function (List, type) {
            let Data = [];
            angular.forEach(List, function (element) {
                if (element.Id != element.ParentId && element.type == type) {
                    var obj = {
                        Data: null,
                        IsTopLevel: element.ParentId == 2,
                        DisplayName: element.DisplayName,
                        Id: element.Id,
                        IsChildSelected: false,
                        IsLeaf: true,
                        IsOpen: false,
                        IsSelectable: element.IsSelectable == 1,
                        IsSelected: false,
                        Name: element.Name,
                        Selection: [],
                        Type: element.type,
                        SegmentMappings: element.SegmentMappings,
                    }
                    Data.push(obj);
                }
            });
            return Data;
        }

        let formatSegmentParent = function (compareArray) {
            let Data = [];
            angular.forEach(compareArray, function (element) {
                if (element.Id == element.ParentId) {
                    var obj = {
                        Data: element.IsLastLevel == 0 ? FormatSegmentChild(compareArray, element.Id) : null,
                        DisplayName: element.DisplayName,
                        Id: element.Id,
                        IsChildSelected: false,
                        IsLeaf: element.IsLastLevel == 1,
                        IsOpen: false,
                        IsSelectable: element.IsSelectable == 1,
                        IsSelected: false,
                        Name: element.Name,
                        Selection: [],
                        Type: element.type,
                        SegmentMappings: element.SegmentMappings,
                    }
                    Data.push(obj);
                }
            });
            return Data;
        }

        let FormatSegmentChild = function (List, parentid) {
            let Data = [];
            angular.forEach(List, function (element) {
                if (element.Id != element.ParentId && element.ParentId == parentid) {
                    var obj = {
                        Data: element.IsLastLevel == 0 ? FormatSegmentChild(List, element.Id) : null,
                        DisplayName: element.DisplayName,
                        Id: element.Id,
                        IsChildSelected: false,
                        IsLeaf: element.IsLastLevel == 1,
                        IsOpen: false,
                        IsSelectable: element.IsSelectable == 1,
                        IsSelected: false,
                        Name: element.Name,
                        Selection: [],
                        Type: element.type,
                        SegmentMappings: element.SegmentMappings,
                    }
                    Data.push(obj);
                }
            });
            return Data;
        }

        let formatTreeParent = function (compareArray) {
            let Data = [];
            angular.forEach(compareArray, function (element) {
                if (element.Id == element.ParentId) {
                    var obj = {
                        Data: element.IsLastLevel == 0 ? formatTreechild(compareArray, element.Id) : null,
                        DisplayName: element.DisplayName,
                        Id: element.Id,
                        IsChildSelected: false,
                        IsLeaf: element.IsLastLevel == 1,
                        IsOpen: false,
                        IsSelectable: element.IsSelectable == 1,
                        IsSelected: false,
                        Name: element.Name,
                        Selection: []
                    }
                    Data.push(obj);
                }
            });
            return Data;
        }

        let formatTreechild = function (List, parentid) {
            let Data = [];
            angular.forEach(List, function (element) {
                if (element.Id != element.ParentId && element.ParentId == parentid) {
                    var obj = {
                        Data: element.IsLastLevel == 0 ? formatTreechild(List, element.Id) : null,
                        DisplayName: element.DisplayName,
                        Id: element.Id,
                        IsChildSelected: false,
                        IsLeaf: element.IsLastLevel == 1,
                        IsOpen: false,
                        IsSelectable: element.IsSelectable == 1,
                        IsSelected: false,
                        Name: element.Name,
                        Selection: []
                    }
                    Data.push(obj);
                }
            });
            return Data;
        }

        /////////////////////////////////////-----------------trend time period Functions-------------------------//////////////////////////////////////////////

        let timeperiodSlider = function (data) {
            var sliderElement = angular.element(".content1 span:contains('" + data.Name + "')").parent().parent().find("#slider");
            var ticks = data.Data;
            var slider = sliderElement.slider({
                min: 0,
                max: ticks.length - 1,
                range: true,
                values: [data.TimeperiodMin, data.TimeperiodMax],
                start: function (event, ui) {
                    if (event.originalEvent.type == "mousedown") {
                        $(this).addClass("ui-slider-mousesliding");
                    }
                },
                change: function (event, ui) {
                    if (event.originalEvent) {
                        var min = sliderElement.slider("values")[0];
                        var max = sliderElement.slider("values")[1];
                        if (min == max) {
                            if (max == 0) {
                                min = 0;
                                max = 1;
                                sliderElement.slider('values', 0, min);
                                sliderElement.slider('values', 1, max);
                            }
                            else if (max == sliderElement.find(".tick span").length - 1) {
                                min = sliderElement.find(".tick span").length - 2;
                                max = sliderElement.find(".tick span").length - 1;
                                sliderElement.slider('values', 0, sliderElement.find(".tick span").length - 2);
                                sliderElement.slider('values', 1, sliderElement.find(".tick span").length - 1);
                            }
                            else {
                                min = max - 1;
                                max = max;
                                sliderElement.slider('values', 0, min);
                                sliderElement.slider('values', 1, max);
                            }

                        }
                        else if (max - min + 1 > Constants.MAX_SELCTION_VALUE_DEEPDIVE) {
                            layoutScope.customAlert(Constants.MAX_SELCTION_TEXT_DEEPDIVE, Constants.ALERT_HEADER_TEXT);
                            min = max - Constants.MAX_SELCTION_VALUE_DEEPDIVE + 1;
                            sliderElement.slider('values', 0, min);
                            sliderElement.slider('values', 1, max);
                        }
                        var i = 0;
                        sliderElement.find(".tick span").each(function (obj) {
                            if (i == max || i == min || i == 0 || i == sliderElement.find(".tick span").length - 1) {
                                //this.style = "display:block"
                                sliderElement.find(".tick span")[obj].style.display = "block";
                            }
                            else {
                                //this.style = "display:none"
                                sliderElement.find(".tick span")[obj].style.display = "none";
                            }

                            i++;
                        })
                        changeSelectionOfTimeperiod({ "min": min, "max": max }, data);
                        $scope.isSelectedFiltersChanged = true;
                    }
                    $scope.$apply();
                },
            });
            sliderElement.find('.tick').remove();
            for (var i = 0; i < ticks.length; i++) {
                var tick = $('<div class="tick ui-widget-content" title="' + ticks[i].DisplayName + '"><span style="' + (i == 0 || i == ticks.length - 1 || i == data.TimeperiodMin || i == data.TimeperiodMax ? "" : "display:none") + '">' + ticks[i].DisplayName + '</span></div>').appendTo(slider);
                tick.css({
                    left: (100 / (ticks.length - 1) * i) + '%',
                    width: (100 / ticks.length - 1) + '%'
                });
            }

            slider.find(".tick:first").css("border-left", "none");
        }

        let changeSelectionOfTimeperiod = function (array, CompleteTimePeriodData) {
            var selected = [];
            var FilterTimeId = _.result(_.find($scope.FilterPanel, function (obj) {
                return obj.Name.toLowerCase() == "time period";
            }), 'Id')
            for (var i = array.min ; i <= array.max ; i++) {
                selected.push($scope.GetSelectionObject(CompleteTimePeriodData.Data[i]).Selection[0])
            }
            $scope.FilterPanel[FilterTimeId].Selection = selected;
        }

        $scope.toggleTrendAndPIT = function () {
            $scope.IsTrend = !$scope.IsTrend;
            $scope.level1Data.Data[0].IsSelected = !$scope.IsTrend;
            $scope.level1Data.Data[1].IsSelected = $scope.IsTrend;
            var FilterTimeId = _.result(_.find($scope.FilterPanel, function (obj) {
                return obj.Name.toLowerCase() == "time period";
            }), 'Id')
            $scope.clearTab(FilterTimeId);
            $scope.isSelectedFiltersChanged = true;
            $scope.FilterPanel[FilterTimeId].IsOpen = false;
        }

        let FilterPositionFromSelection = function (item) {
            var FilterTimeId = _.result(_.find($scope.FilterPanel, function (obj) {
                return obj.Name.toLowerCase() == "time period";
            }), 'Id')
            let min = item.Data.length - 2, max = item.Data.length - 1;
            if ($scope.FilterPanel[FilterTimeId].Selection.length > 1) {
                for (var i = 0; i < item.Data.length; i++) {
                    if ($scope.FilterPanel[FilterTimeId].Selection[0].Name.toLowerCase() == item.Name.toLowerCase()) {
                        if ($scope.FilterPanel[FilterTimeId].Selection[0].Selection[0].Name.toLowerCase() == item.Data[i].Name.toLowerCase()) {
                            min = i;
                        }
                        else if ($scope.FilterPanel[FilterTimeId].Selection[$scope.FilterPanel[FilterTimeId].Selection.length - 1].Selection[0].Name.toLowerCase() == item.Data[i].Name.toLowerCase()) {
                            max = i;
                        }
                    }
                }
            }
            angular.forEach(item.Parent.Data, function (obj) {
                obj.IsChildSelected = false;
            })
            item.IsChildSelected = true;
            return { "min": min, "max": max }
        }

        /////////////////////////////////////-----------------------Helping Functions-------------------------//////////////////////////////////////////////

        let getFilterSelectionId = function (FilterId) {
            let SelectionList = [];
            angular.forEach($scope.FilterPanel[FilterId].Selection, function (obj) {
                let Id = LoopSelectionId(obj);
                if (!_.includes(SelectionList, Id)) {
                    SelectionList.push(Id);
                }
            });
            return SelectionList;
        }

        let getFilterSelectionDisplayName = function (FilterId) {
            let SelectionList = [];

            angular.forEach($scope.FilterPanel[FilterId].Selection, function (obj) {
                SelectionList.push(LoopSelectionDisplayName(obj));
            })

            return SelectionList;
        }

        let getFilterSelectionName = function (FilterId) {
            let SelectionList = [];

            angular.forEach($scope.FilterPanel[FilterId].Selection, function (obj) {
                SelectionList.push(LoopSelectionName(obj));
            })

            return SelectionList;
        }

        let getFilterSelectionNameType = function (FilterId, Segment) {
            let SelectionList = [];
            let FilterSelection = _.remove(_.map($scope.FilterPanel[FilterId].Selection, function (obj) { if (obj.Name == Segment) return obj; }), undefined);
            angular.forEach(FilterSelection, function (obj) {
                SelectionList.push(LoopSelectionName(obj));
            })

            return SelectionList;
        }

        let getFilterSelectionValueOnKey = function (FilterId, key) {
            let SelectionList = [];

            angular.forEach($scope.FilterPanel[FilterId].Selection, function (obj) {
                SelectionList.push(LoopSelectionKey(obj, key));
            })

            return SelectionList;
        }

        let LoopSelectionKey = function (Selection, key) {
            if (isLeaveSelection(Selection)) {
                return Selection[key]
            }
            else {
                return LoopSelectionKey(Selection.Selection[0], key)
            }
        }

        $scope.IsNamePresentInFilterSelection = function (Id, Name) {
            return _.includes(getFilterSelectionName(Id), Name);
        }

        $scope.IsNameTypePresentInFilterSelection = function (Id, Name, Segment) {
            return _.includes(getFilterSelectionNameType(Id, Segment), Name);
        }

        $scope.LoopSelectionName = function (Selection) {
            if (isLeaveSelection(Selection)) {
                return Selection.Name
            }
            else {
                return LoopSelectionName(Selection.Selection[0])
            }
        }

        $scope.RemoveSelection = function (FilterId, Selection) {

            _.remove($scope.FilterPanel[FilterId].Selection, function (obj) {
                return _.isMatch(Selection, obj)
            })
            ApplyModuleCustomization({
                "Id": FilterId,
                "Name": $scope.FilterPanel[FilterId].Name,
                "DisplayName": $scope.FilterPanel[FilterId].Name,
                "Selection": [Selection]
            });
        }

        let LoopSelectionId = function (Selection) {
            if (isLeaveSelection(Selection)) {
                return Selection.Id
            }
            else {
                return LoopSelectionId(Selection.Selection[0])
            }
        }

        let LoopSelectionName = function (Selection) {
            if (isLeaveSelection(Selection)) {
                return Selection.Name
            }
            else {
                return LoopSelectionName(Selection.Selection[0])
            }
        }

        let LoopSelectionDisplayName = function (Selection) {
            if (isLeaveSelection(Selection)) {
                return Selection.DisplayName
            }
            else {
                return LoopSelectionDisplayName(Selection.Selection[0])
            }
        }

        $scope.getSelectionText = function (item) {
            let text = "None";
            if ((item.Name.toLowerCase() == "snapshot type") && !isLeaveSelection(item)) {
                text = item.Selection[0].Name + '-' + item.Selection[0].Selection[0].Name;
            }
            else if (item.Name.toLowerCase() == "time period" && !isLeaveSelection(item)) {
                if (item.Selection.length == 1) {
                    text = item.Selection[0].Name + ' - ' + item.Selection[0].Selection[0].Name;
                }
                else if (item.IsMulti && item.Selection.length > 1) {
                    text = item.Selection[0].Name + " - Multiple";
                }
                else if ($scope.IsTrend) {
                    text = item.Selection[0].Name + ' - ' + item.Selection[0].Selection[0].Name + '-' + item.Selection[item.Selection.length - 1].Selection[0].Name;
                }
            }
            else if (item.Name.toLowerCase() == "segments") {
                let segment1Data = "";
                let segment1DataArray = [];
                let segment2Data = "";
                angular.forEach(item.Selection, function (obj) {
                    if (obj.Id == 1) {
                        segment1Data = LoopSelectionName(obj);
                        segment1DataArray.push(LoopSelectionName(obj));
                    }
                    else if (obj.Id == 2) {
                        segment2Data = LoopSelectionName(obj)
                    }
                })
                if (segment1DataArray.length == 0) {
                    text = "None | ";
                }
                else if (segment1DataArray.length == 1) {
                    text = segment1Data + " | ";
                }
                else {
                    text = "Multiple | ";
                }
                if (segment2Data == "" || segment2Data == null) {
                    text += "None";
                }
                else {
                    text += segment2Data;
                }
            }
            else if (item.Name.toLowerCase() == "kpi") {
                let list = getFilterSelectionDisplayName(item.Id);
                text = ((item.Selection.length == 0 ? "None" : (item.Selection.length == 1 ? list[0].toLowerCase() : "Multiple")))
            }
            else if (item.Name.toLowerCase() == "row") {
                let list = getFilterSelectionValueOnKey(getModuleFilterTypeId("row"), "DisplayName");
                text = ((item.Selection.length == 0 ? "None" : (item.Selection.length == 1 ? list[0].toLowerCase() : list.join(' - '))))
            }
            else {
                let list = getFilterSelectionName(item.Id);
                text = ((item.Selection.length == 0 ? "None" : (item.Selection.length == 1 ? list[0].toLowerCase() : "Multiple")))
            }
            item.SelectionText = text;
            return text;
        }

        $scope.CompareByToolTip = function (parent, child) {
            let tooltip = child;
            if ((parent.toLowerCase() == 'row' || parent.toLowerCase() == 'column') && (child.toLowerCase() == 'channel/retailer' || child.toLowerCase() == 'demographics')) {
                tooltip = child + "\nOnly one cut from Channel/Retailers or Demographics can be selected in Row/Column";
            }
            else if (parent.toLowerCase() == 'compare') {
                if (child.toLowerCase() == 'channel/retailer') {
                    tooltip = "Channel/Retailer\nDemographics cannot be used as a filter";
                }
                else if (child.toLowerCase() == 'demographics') {
                    tooltip = "Demographics\nChannel/Retailer cannot be used as a filter";
                }
            }
            return tooltip;
        }

        $scope.SingleMultiToolTip = function (parent, child) {
            let tooltip = child;
            if (child.toLowerCase() == "single") {
                if (parent.toLowerCase() == 'brands') {
                    tooltip = "Focus on key KPIs for a single Brand";
                }
                else if (parent.toLowerCase() == 'channel/retailer') {
                    tooltip = "Focus on key KPIs for a single Channel/Retailer\nDemographics cannot be used as a filter";
                }
                else if (parent.toLowerCase() == 'demographics') {
                    tooltip = "Focus on key KPIs for a single Demographic\nChannel/Retailer cannot be used as a filter";
                }
                else {
                    tooltip = "Focus on key KPIs for a single " + parent;
                }
            }
            else if (child.toLowerCase() == "multi") {
                if (parent.toLowerCase() == 'category') {
                    tooltip = "Compare key KPIs across multiple Categories";
                }
                else if (parent.toLowerCase() == 'demographics') {
                    tooltip = "Compare key KPIs across multiple Demographics \nChannel/Retailer cannot be used as a filter";
                }
                else if (parent.toLowerCase() == 'channel/retailer') {
                    tooltip = "Compare key KPIs across multiple Channel/Retailer\nDemographics cannot be used as a filter";
                }
                else {
                    tooltip = "Compare key KPIs across multiple " + parent;
                }
            }
            return tooltip
        }

        $scope.getHeight = function (selector) {
            var element = $("." + selector);
            return element.css("height");
        };

        $scope.TrimString = function (str) {
            if (str.toLowerCase() == "top/worst performing brands") {
                return str;
            }
            let maxLength = 20;
            if (str != null && str != '' && str.length - 2 > maxLength) {
                return str.slice(0, maxLength) + "...";
            }
            return str;
        }

        let ClearDependentFitler = function (TabId) {
            angular.forEach($scope.FilterPanel[TabId].Dependency, function (obj) {
                $scope.clearTab(obj, false);
            })
        }

        let ClearFilterTab = function (item) {
            angular.forEach(item.Data, function (obj) {
                obj.IsSelected = false;
                obj.IsChildSelected = false;
                obj.Selection = [];
                if (!obj.IsLeaf) {
                    ClearFilterTab(obj);
                }
            });
        }

        $scope.clearTab = function (TabId, popupFlag) {
            let tabId = TabId == undefined ? _.result(_.find($scope.FilterPanel, function (obj) { return obj.IsOpen == true; }), 'Id') : TabId
            if (popupFlag == null || popupFlag == undefined) {
                if (tabId != null && $scope.FilterPanel[tabId].Dependency.length > 0 && !$scope.isDependentFiltersChanged) {
                    layoutScope.customAlert("Changing this selection would clear the selections made in subsequent tabs", "Alert", null, $scope.clearTab, "OK", false, "Cancel", tabId);
                    return;
                }
            }
            if (popupFlag == true) {
                $scope.isDependentFiltersChanged = true;
            }
            $scope.FilterPanel[tabId].Selection = [];
            $scope.FilterPanel[tabId].SelectionText = "";
            $scope.isSelectedFiltersChanged = true;
            ClearFilterTab($scope.FilterPanel[tabId]);
            ClearDependentFitler(tabId);
            if (tabId == 0) {
                angular.forEach($scope.FilterPanel, function (obj) {
                    obj.IsDisabled = false;
                })
            }
            else if (tabId == getModuleFilterTypeId("segments")) {
                if ($scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].IsDisabled && !isChannelOrDemogSelectedAsCompare()) {
                    ChangeChannelDemogSettings(true, false);
                    $scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].IsDisabled = false;
                    setDefaultSelectionForChannelDemog();
                }
                ApplyModuleDefaultSelection("");

            }
            else if (getModuleFilterTypeId("compare") > -1 && $scope.FilterPanel[getModuleFilterTypeId("compare")].SelectionText.toLowerCase() == "top/worst performing brands") {
                $scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].IsDisabled = true;
                ChangeChannelDemogSettings(true, true);
            }
        }

        $scope.clearAll = function () {
            $scope.isDependentFiltersChanged = true;
            angular.forEach($scope.FilterPanel, function (obj) {
                $scope.clearTab(obj.Id, false);
                obj.IsOpen = false;
                obj.IsDisabled = false;
            })
        }

        $scope.getFooterheight = function () {
            let filter_panel_button = document.getElementById("filter_panel_button").getBoundingClientRect();
            if(filter_panel_button.y==undefined){
                filter_panel_button = filter_panel_button.top
            }
            else{
                filter_panel_button = filter_panel_button.y
            }
            return filter_panel_button;
        }
        $scope.getBottomFooterHeight= function () {
            let top = $scope.getFooterheight();
            if ($scope.ShowHideFilterPanelFooter())
                return top - 17;
            else
                return top;
        }

        let setDefaultSelectionForChannelDemog = function () {
            if ($scope.ModuleName.toLowerCase() != "crosstab" &&
                !$scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].IsDisabled &&
                $scope.FilterPanel[getModuleFilterTypeId("markets")].Selection.length > 0 &&
                $scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 &&
                $scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].Selection.length == 0 &&
                !isChannelOrDemogSelectedAsCompare()) {
                $scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].Selection = DefaultSelectionObj[$scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].Name];
            }
        }

        let isChannelOrDemogSelectedAsCompare = function () {
            let tabId = 0, flag = false, checkArray = ["channel/retailer", "demographics"];
            flag = _.includes(checkArray, (($scope.FilterPanel[tabId].SelectionText.split('-'))[0].toLowerCase()));
            tabId = 1;
            flag = flag || ($scope.ModuleName.toLowerCase() == "crosstab" && (_.difference(checkArray, $scope.FilterPanel[tabId].SelectionText.toLowerCase().split(" - ")).length != 2));
            return flag;
        }

        $scope.isChannelOrDemogSelectedAsCompare = function () {
            return isChannelOrDemogSelectedAsCompare();
        }

        let ApplyModuleDefaultSelection = function (FilterName) {
            let Module = _.result(_.find(topMenuScope.modules, function (obj) {
                return obj.isActive == true;
            }), 'ModuleName');
            if (Module == undefined) return;
            if (Module.toLowerCase() == "snapshot") {
                angular.forEach($scope.FilterPanel, function (obj) {
                    if (obj.Selection.length == 0 && obj.Name.toLowerCase() == "brands") {
                        if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("snapshot type")].SelectionText.toLowerCase() == "channel/retailer-multi") {
                            let Brand = SelectFilterBrandType();
                            if (Brand != null && !isLeaveNode(Brand[0]) && FilterName.toLowerCase() != obj.Name.toLowerCase()) {
                                obj.Selection = [$scope.GetSelectionObject(Brand[0])]
                            }
                        }
                        else if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("snapshot type")].SelectionText.toLowerCase() == "channel/retailer-single") {
                            let Brand = SelectFilterBrandType();
                            if (Brand != null && !isLeaveNode(Brand[0]) && FilterName.toLowerCase() != obj.Name.toLowerCase()) {
                                obj.Selection = [$scope.GetSelectionObject(Brand[0])]
                            }
                        }
                        else {
                            obj.Selection = [];
                            obj.SelectionText = "";
                        }
                    }
                    else if (obj.Selection.length == 0 && obj.Name.toLowerCase() == "segments") {
                        if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("snapshot type")].SelectionText.toLowerCase() == "brands-multi") {
                            let Segment = SelectFilterSegmentType();
                            if (!isLeaveNode(Segment[0])) {
                                ApplySelection(Segment[0]);
                                obj.Selection.push($scope.GetSelectionObject(Segment[0].Data[0]));
                            }
                            if (!isLeaveNode(Segment[1])) {
                                ApplySelection(Segment[1]);
                                obj.Selection.push($scope.GetSelectionObject(Segment[1].Data[0]));
                            }
                        }
                        else if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("snapshot type")].SelectionText.toLowerCase() == "brands-single") {
                            let Segment = SelectFilterSegmentType();
                            if (!isLeaveNode(Segment[0])) {
                                ApplySelection(Segment[0]);
                                obj.Selection.push($scope.GetSelectionObject(Segment[0].Data[0]));
                            }
                            if (!isLeaveNode(Segment[1])) {
                                ApplySelection(Segment[1]);
                                obj.Selection.push($scope.GetSelectionObject(Segment[1].Data[0]));
                            }
                        }
                        else if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("snapshot type")].SelectionText.toLowerCase() == "channel/retailer-multi") {
                            let Segment = SelectFilterSegmentType();
                            if (!isLeaveNode(Segment[0])) {
                                ApplySelection(Segment[0]);
                                obj.Selection.push($scope.GetSelectionObject(Segment[0].Data[0]));
                            }
                            if (!isLeaveNode(Segment[1])) {
                                ApplySelection(Segment[1]);
                                obj.Selection.push($scope.GetSelectionObject(Segment[1].Data[0]));
                            }
                        }
                        else if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("snapshot type")].SelectionText.toLowerCase() == "channel/retailer-single") {
                            let Segment = SelectFilterSegmentType();
                            if (!isLeaveNode(Segment[0])) {
                                ApplySelection(Segment[0]);
                                obj.Selection.push($scope.GetSelectionObject(Segment[0].Data[0]));
                            }
                            if (!isLeaveNode(Segment[1])) {
                                ApplySelection(Segment[1]);
                                obj.Selection.push($scope.GetSelectionObject(Segment[1].Data[0]));
                            }
                        }
                        else if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("snapshot type")].SelectionText.toLowerCase() == "demographics-single") {
                            let Segment = SelectFilterSegmentType();
                            if (!isLeaveNode(Segment[0])) {
                                ApplySelection(Segment[0]);
                                obj.Selection.push($scope.GetSelectionObject(Segment[0].Data[0]));
                            }
                            if (!isLeaveNode(Segment[1])) {
                                ApplySelection(Segment[1]);
                                obj.Selection.push($scope.GetSelectionObject(Segment[1].Data[0]));
                            }
                        }
                        else if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("snapshot type")].SelectionText.toLowerCase() == "category-single") {
                            let Segment = SelectFilterSegmentType();
                            if (!isLeaveNode(Segment[0])) {
                                ApplySelection(Segment[0]);
                                obj.Selection.push($scope.GetSelectionObject(Segment[0].Data[0]));
                            }
                            if (!isLeaveNode(Segment[1])) {
                                ApplySelection(Segment[1]);
                                obj.Selection.push($scope.GetSelectionObject(Segment[1].Data[0]));
                            }
                        }
                        else {
                            obj.Selection = [];
                            obj.SelectionText = "";
                        }
                    }
                    else if (obj.Selection.length == 0 && obj.Name.toLowerCase() == "channel/retailer") {
                        if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("snapshot type")].SelectionText.toLowerCase() == "category-multi" && FilterName.toLowerCase() != obj.Name.toLowerCase()) {
                            obj.Selection = DefaultSelectionObj["channel/retailer"];

                        }
                        else if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("snapshot type")].SelectionText.toLowerCase() == "category-single" && FilterName.toLowerCase() != obj.Name.toLowerCase()) {
                            obj.Selection = DefaultSelectionObj["channel/retailer"];

                        }
                        else if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("snapshot type")].SelectionText.toLowerCase() == "brands-multi" && FilterName.toLowerCase() != obj.Name.toLowerCase()) {
                            obj.Selection = DefaultSelectionObj["channel/retailer"];

                        }
                        else if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("snapshot type")].SelectionText.toLowerCase() == "brands-single" && FilterName.toLowerCase() != obj.Name.toLowerCase()) {
                            obj.Selection = DefaultSelectionObj["channel/retailer"];

                        }
                        else {
                            obj.Selection = [];
                            obj.SelectionText = "";
                        }
                    }
                    else if (obj.Selection.length == 0 && obj.Name.toLowerCase() == "demographics") {
                        if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("snapshot type")].SelectionText.toLowerCase() == "category-multi" && FilterName.toLowerCase() != obj.Name.toLowerCase()) {
                            obj.Selection = DefaultSelectionObj["demographics"];

                        }
                        else if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("snapshot type")].SelectionText.toLowerCase() == "brands-multi" && FilterName.toLowerCase() != obj.Name.toLowerCase()) {
                            obj.Selection = DefaultSelectionObj["demographics"];
                        }
                        else if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("snapshot type")].SelectionText.toLowerCase() == "category-single" && FilterName.toLowerCase() != obj.Name.toLowerCase()) {
                            obj.Selection = DefaultSelectionObj["demographics"];

                        }
                        else if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("snapshot type")].SelectionText.toLowerCase() == "brands-single" && FilterName.toLowerCase() != obj.Name.toLowerCase()) {
                            obj.Selection = DefaultSelectionObj["demographics"];
                        }
                        else {
                            obj.Selection = [];
                            obj.SelectionText = "";
                        }
                    }

                })
            }
            else if (Module.toLowerCase() == "deepdive") {
                angular.forEach($scope.FilterPanel, function (obj) {
                    if (obj.Selection.length == 0 && obj.Name.toLowerCase() == "brands") {
                        if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("compare")].SelectionText.toLowerCase() == "markets") {
                            let Brand = SelectFilterBrandType();
                            if (Brand != null && !isLeaveNode(Brand[0]) && FilterName.toLowerCase() != obj.Name.toLowerCase()) {
                                obj.Selection = [$scope.GetSelectionObject(Brand[0])]
                            }
                        }
                        else if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("compare")].SelectionText.toLowerCase() == "channel/retailer") {
                            let Brand = SelectFilterBrandType();
                            if (Brand != null && !isLeaveNode(Brand[0]) && FilterName.toLowerCase() != obj.Name.toLowerCase()) {
                                obj.Selection = [$scope.GetSelectionObject(Brand[0])]
                            }
                        }
                        else if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("compare")].SelectionText.toLowerCase() == "demographics") {
                            let Brand = SelectFilterBrandType();
                            if (Brand != null && !isLeaveNode(Brand[0]) && FilterName.toLowerCase() != obj.Name.toLowerCase()) {
                                obj.Selection = [$scope.GetSelectionObject(Brand[0])]
                            }
                        }
                        else {
                            obj.Selection = [];
                            obj.SelectionText = "";
                        }
                    }
                    else if (obj.Selection.length == 0 && obj.Name.toLowerCase() == "segments") {
                        if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("compare")].SelectionText.toLowerCase() == "brands") {
                            let Segment = SelectFilterSegmentType();
                            if (!isLeaveNode(Segment[0])) {
                                ApplySelection(Segment[0]);
                                obj.Selection.push($scope.GetSelectionObject(Segment[0].Data[0]));
                            }
                            if (!isLeaveNode(Segment[1])) {
                                ApplySelection(Segment[1]);
                                obj.Selection.push($scope.GetSelectionObject(Segment[1].Data[0]));
                            }
                        }
                        else if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("compare")].SelectionText.toLowerCase() == "channel/retailer") {
                            let Segment = SelectFilterSegmentType();
                            if (!isLeaveNode(Segment[0])) {
                                ApplySelection(Segment[0]);
                                obj.Selection.push($scope.GetSelectionObject(Segment[0].Data[0]));
                            }
                            if (!isLeaveNode(Segment[1])) {
                                ApplySelection(Segment[1]);
                                obj.Selection.push($scope.GetSelectionObject(Segment[1].Data[0]));
                            }
                        }
                        else if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("compare")].SelectionText.toLowerCase() == "demographics") {
                            let Segment = SelectFilterSegmentType();
                            if (!isLeaveNode(Segment[0])) {
                                ApplySelection(Segment[0]);
                                obj.Selection.push($scope.GetSelectionObject(Segment[0].Data[0]));
                            }
                            if (!isLeaveNode(Segment[1])) {
                                ApplySelection(Segment[1]);
                                obj.Selection.push($scope.GetSelectionObject(Segment[1].Data[0]));
                            }
                        }
                        else {
                            obj.Selection = [];
                        }
                    }
                    else if (obj.Selection.length == 0 && obj.Name.toLowerCase() == "channel/retailer") {
                        if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("compare")].SelectionText.toLowerCase() == "markets" && FilterName.toLowerCase() != obj.Name.toLowerCase()) {
                            obj.Selection = DefaultSelectionObj["channel/retailer"];

                        }
                        else if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("compare")].SelectionText.toLowerCase() == "category" && FilterName.toLowerCase() != obj.Name.toLowerCase()) {
                            obj.Selection = DefaultSelectionObj["channel/retailer"];

                        }
                        else if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("compare")].SelectionText.toLowerCase() == "brands" && FilterName.toLowerCase() != obj.Name.toLowerCase()) {
                            obj.Selection = DefaultSelectionObj["channel/retailer"];

                        }
                        else {
                            obj.Selection = [];
                            obj.SelectionText = "";
                        }
                    }
                    else if (obj.Selection.length == 0 && obj.Name.toLowerCase() == "demographics") {
                        if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("compare")].SelectionText.toLowerCase() == "markets" && FilterName.toLowerCase() != obj.Name.toLowerCase()) {
                            obj.Selection = DefaultSelectionObj["demographics"];

                        }
                        else if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("compare")].SelectionText.toLowerCase() == "category" && FilterName.toLowerCase() != obj.Name.toLowerCase()) {
                            obj.Selection = DefaultSelectionObj["demographics"];

                        }
                        else if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("compare")].SelectionText.toLowerCase() == "brands" && FilterName.toLowerCase() != obj.Name.toLowerCase()) {
                            obj.Selection = DefaultSelectionObj["demographics"];

                        }
                        else {
                            obj.Selection = [];
                            obj.SelectionText = "";
                        }
                    }
                })
            }
            else if (Module.toLowerCase() == "crosstab") {
                //angular.forEach($scope.FilterPanel, function (obj) {
                //    var RowSelectionText = getModuleFilterTypeId("row") > -1 ? $scope.FilterPanel[getModuleFilterTypeId("row")].SelectionText.toLowerCase() : "";
                //    var ColSelectionText = getModuleFilterTypeId("column") > -1 ? $scope.FilterPanel[getModuleFilterTypeId("column")].SelectionText.toLowerCase() : "";
                //    if ((obj.Name.toLowerCase() == "segments" || obj.Name.toLowerCase() == "brands") && !obj.IsDisabled && FilterName == "category" && obj.Selection.length > 0 && ($scope.FilterPanel[getModuleFilterTypeId("markets")].IsMulti || $scope.FilterPanel[getModuleFilterTypeId("category")].IsMulti)) {
                //        obj.Selection = [];
                //        obj.SelectionText = "";
                //    }
                //    if (obj.Name.toLowerCase() == "brands" && !obj.IsMulti && !obj.IsDisabled && obj.Selection.length == 0) {
                //        var checkArray = ["markets", "time period", "kpi", "channel/retailer", "demographics"];
                //        if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("markets")].Selection.length < 2 && $scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length < 2 &&
                //            (_.difference(checkArray, ColSelectionText.split(' - ')).length != checkArray.length || _.difference(checkArray, RowSelectionText.split(' - ')).length != checkArray.length)) {
                //            let Brand = SelectFilterBrandType();
                //            if (Brand != null && Brand.length > 0 && !isLeaveNode(Brand[0]) && FilterName.toLowerCase() != obj.Name.toLowerCase()) {
                //                obj.Selection = [$scope.GetSelectionObject(Brand[0])]
                //            }
                //        }
                //        else {
                //            obj.Selection = [];
                //            obj.SelectionText = "";
                //        }
                //    }
                //    else if (obj.Name.toLowerCase() == "segments" && !obj.IsDisabled && obj.Selection.length == 0) {
                //        var checkArray = ["markets", "time period", "kpi", "channel/retailer", "demographics"];
                //        if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("markets")].Selection.length < 2 && $scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length < 2 &&
                //            (_.difference(checkArray, ColSelectionText.split(' - ')).length != checkArray.length || _.difference(checkArray, RowSelectionText.split(' - ')).length != checkArray.length)) {
                //            let Segment = SelectFilterSegmentType();
                //            if (!isLeaveNode(Segment[0]) && !obj.IsMulti) {
                //                ApplySelection(Segment[0]);
                //                obj.Selection.push($scope.GetSelectionObject(Segment[0].Data[0]));
                //            }
                //            if (!isLeaveNode(Segment[1])) {
                //                ApplySelection(Segment[1]);
                //                obj.Selection.push($scope.GetSelectionObject(Segment[1].Data[0]));
                //            }
                //        }
                //        else {
                //            obj.Selection = [];
                //            obj.SelectionText = "";
                //        }
                //    }
                //    else if (obj.Name.toLowerCase() == "channel/retailer" && !obj.IsMulti && !obj.IsDisabled && obj.Selection.length == 0) {
                //        var checkArray = ["markets", "category", "brands", "time period", "kpi"];
                //        if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && FilterName.toLowerCase() != obj.Name.toLowerCase() &&
                //            (_.difference(checkArray, ColSelectionText.split(' - ')).length != checkArray.length || _.difference(checkArray, RowSelectionText.split(' - ')).length != checkArray.length)) {
                //            obj.Selection = DefaultSelectionObj["channel/retailer"];
                //        }
                //        else {
                //            obj.Selection = [];
                //            obj.SelectionText = "";
                //        }
                //    }
                //    else if (obj.Name.toLowerCase() == "demographics" && !obj.IsMulti && !obj.IsDisabled && obj.Selection.length == 0) {
                //        var checkArray = ["markets", "category", "brands", "time period", "kpi"];
                //        if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && FilterName.toLowerCase() != obj.Name.toLowerCase() &&
                //           (_.difference(checkArray, ColSelectionText.split(' - ')).length != checkArray.length || _.difference(checkArray, RowSelectionText.split(' - ')).length != checkArray.length)) {
                //            obj.Selection = DefaultSelectionObj["demographics"];
                //        }
                //        else {
                //            obj.Selection = [];
                //            obj.SelectionText = "";
                //        }
                //    }
                //});
            }
        }

        let ApplyModuleCustomization = function (Selection) {
            let Module = _.result(_.find(topMenuScope.modules, function (obj) {
                return obj.isActive == true;
            }), 'ModuleName');
            if (Module.toLowerCase() == "snapshot") {
                if ($scope.FilterPanel[Selection.Id].Name.toLowerCase() == "snapshot type") {
                    var SelectionArray = $scope.FilterPanel[Selection.Id].SelectionText.split('-');
                    angular.forEach($scope.FilterPanel, function (obj) {
                        obj.IsMulti = false;
                        if (SelectionArray[0].toLowerCase() == obj.Name.toLowerCase() ||
                            SelectionArray[0].toLowerCase().replace("demographics", "channel/retailer") == obj.Name.toLowerCase() ||
                            SelectionArray[0].toLowerCase().replace("channel/retailer", "demographics") == obj.Name.toLowerCase()) {
                            obj.IsMulti = SelectionArray[1].toLowerCase() == "multi" ? true : false;
                        }
                        if ($scope.FilterPanel[Selection.Id].SelectionText.toLowerCase() == "demographics-single" && obj.Name.toLowerCase() == "secondary brands") {
                            obj.IsMulti = true;
                        }
                    });
                    angular.forEach($scope.FilterPanel, function (obj) {
                        if (obj.Name.toLowerCase() == "brands") {
                            if (SelectionArray[0].toLowerCase() == "category" && SelectionArray[1].toLowerCase() == "multi") {
                                obj.IsDisabled = true;
                            }
                            else if (SelectionArray[0].toLowerCase() == "category" && SelectionArray[1].toLowerCase() == "single") {
                                obj.IsDisabled = true;
                            }
                            else {
                                obj.IsDisabled = false;
                            }
                        }
                        else if (obj.Name.toLowerCase() == "segments") {
                            if (SelectionArray[0].toLowerCase() == "category" && SelectionArray[1].toLowerCase() == "multi") {
                                obj.IsDisabled = true;
                            }
                            else {
                                obj.IsDisabled = false;
                            }
                        }
                        else if (obj.Name.toLowerCase() == "channel/retailer") {

                        }
                    });

                    if (SelectionArray[0].toLowerCase() == "channel/retailer") {
                        ChangeChannelDemogSettings(true, true);
                        $scope.FirstTime = false;
                    }
                    else if (SelectionArray[0].toLowerCase() == "demographics") {
                        ChangeChannelDemogSettings(false, true);
                        $scope.FirstTime = false;
                    }
                    else if ($scope.FirstTime) {
                        let moduleSelection = JSON.parse(_.result(_.find(ModuleSelection, function (obj) { return obj.Name == $scope.ModuleName.toLowerCase(); }), 'Selection'));
                        if (moduleSelection[8].Name.toLowerCase() == "channel/retailer") {
                            ChangeChannelDemogSettings(true, false);
                        }
                        else {
                            ChangeChannelDemogSettings(false, false);
                        }
                        $scope.FirstTime = false;
                    }
                    else {
                        ChangeChannelDemogSettings(true, false);
                    }
                }
                else if ($scope.FilterPanel[Selection.Id].Name.toLowerCase() == "segments") {
                    if (Selection.Selection[0].Id == 2) {
                        var segmentTabId = getModuleFilterTypeId("segments");
                        var isItemSelected = (($scope.FilterPanel[segmentTabId].Selection.length > 0 && $scope.FilterPanel[segmentTabId].Selection[0] != undefined && $scope.FilterPanel[segmentTabId].Selection[0].Id == 2)
                                            || ($scope.FilterPanel[segmentTabId].Selection.length > 1 && $scope.FilterPanel[segmentTabId].Selection[1] != undefined && $scope.FilterPanel[segmentTabId].Selection[1].Id == 2));
                        if (FindHierarchyLength(Selection.Selection[0]) > 1 && isItemSelected) {
                            $scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].IsDisabled = true;
                            $scope.ChannelOrDemographicsToggleDisabled = true;
                            $scope.clearTab(getModuleFilterTypeId("channel/retailer"));
                        }
                        else if (!isItemSelected || (FindHierarchyLength(Selection.Selection[0]) <= 1 && !isChannelOrDemogSelectedAsCompare())) {
                            $scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].IsDisabled = false;
                            $scope.ChannelOrDemographicsToggleDisabled = false;
                            setDefaultSelectionForChannelDemog();
                        }
                        var SelectionArray = $scope.FilterPanel[getModuleFilterTypeId("snapshot type")].SelectionText.split('-');
                        if (SelectionArray[0].toLowerCase() == "channel/retailer") {
                            ChangeChannelDemogSettings(true, true);
                        }
                        else if (SelectionArray[0].toLowerCase() == "demographics") {
                            ChangeChannelDemogSettings(false, true);
                        }
                    }
                }
            }
            else if (Module.toLowerCase() == "deepdive") {
                if ($scope.FilterPanel[Selection.Id].Name.toLowerCase() == "compare") {
                    var SelectionText = $scope.FilterPanel[Selection.Id].SelectionText;
                    angular.forEach($scope.FilterPanel, function (obj) {
                        obj.IsMulti = false;
                        if (SelectionText.toLowerCase() == obj.Name.toLowerCase() ||
                            (SelectionText.toLowerCase() == "top/worst performing brands" && obj.Name.toLowerCase() == "category") ||
                            (SelectionText.toLowerCase() == "top/worst performing brands" && obj.Name.toLowerCase() == "markets") ||
                            SelectionText.toLowerCase().replace("demographics", "channel/retailer") == obj.Name.toLowerCase() ||
                            SelectionText.toLowerCase().replace("channel/retailer", "demographics") == obj.Name.toLowerCase()) {
                            obj.IsMulti = true;
                        }
                    });
                    angular.forEach($scope.FilterPanel, function (obj) {
                        if (obj.Name.toLowerCase() == "brands") {
                            if (SelectionText.toLowerCase() == "category") {
                                obj.IsDisabled = true;
                            }
                            else if (SelectionText.toLowerCase() == "top/worst performing brands") {
                                obj.IsDisabled = true;
                            }
                            else {
                                obj.IsDisabled = false;
                            }
                        }
                        else if (obj.Name.toLowerCase() == "segments") {
                            if (SelectionText.toLowerCase() == "markets") {
                                obj.IsDisabled = true;
                            }
                            else if (SelectionText.toLowerCase() == "category") {
                                obj.IsDisabled = true;
                            }
                            else if (SelectionText.toLowerCase() == "top/worst performing brands") {
                                obj.IsDisabled = true;
                            }
                            else {
                                obj.IsDisabled = false;
                            }
                        }
                        else if (obj.Name.toLowerCase() == "kpi") {
                            if (SelectionText.toLowerCase() == "top/worst performing brands") {
                                //obj.IsDisabled = true;
                            }
                            else {
                                //obj.IsDisabled = false;
                            }
                        }
                        else if (obj.Name.toLowerCase() == "channel/retailer") {
                            if (SelectionText.toLowerCase() == "top/worst performing brands") {
                                obj.IsDisabled = true;
                                $scope.ChannelOrDemographicsToggleDisabled = true;
                            }
                            else {
                                obj.IsDisabled = false;
                                $scope.ChannelOrDemographicsToggleDisabled = false;
                            }
                        }
                        else if (obj.Name.toLowerCase() == "demographics") {
                            if (SelectionText.toLowerCase() == "top/worst performing brands") {
                                obj.IsDisabled = true;
                                $scope.ChannelOrDemographicsToggleDisabled = true;
                            }
                            else {
                                obj.IsDisabled = false;
                                $scope.ChannelOrDemographicsToggleDisabled = false;
                            }
                        }
                        else if (obj.Name.toLowerCase() == "markets") {
                            if (obj.Selection.length == 0 && $scope.FilterPanel[getModuleFilterTypeId("compare")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("compare")].Selection[0].Id == 6) {
                                ApplySelection(obj);
                                angular.forEach(obj.Data, function (subObj) {
                                    var Selection = $scope.GetSelectionObject(subObj);
                                    obj.Selection.push(Selection.Selection[0]);
                                });
                                var categoryObj = $scope.FilterPanel[getModuleFilterTypeId("category")];
                                categoryObj.Selection = [];
                                let marketSelection = getFilterSelectionId(1);
                                let compareArray = [];
                                let compareArray2 = [];
                                for (let i = 0; i < marketSelection.length; i++) {
                                    if (i == 0) {
                                        _.map(level2Data[3].Data, function (element) {
                                            if (element.CountryId == marketSelection[i]) {
                                                compareArray.push(element);
                                            }
                                        });
                                    }
                                    else {
                                        compareArray2 = [];
                                        _.map(level2Data[3].Data, function (element) {
                                            if (element.CountryId == marketSelection[i]) {
                                                compareArray2.push(element);
                                            }
                                        });
                                        compareArray = _.unionWith(compareArray, compareArray2, function (x, y) { return x.Id == y.Id });
                                    }
                                }
                                categoryObj.Data = compareArray;
                                ApplySelection(categoryObj);
                                angular.forEach(categoryObj.Data, function (subObj) {
                                    var Selection = $scope.GetSelectionObject(subObj);
                                    categoryObj.Selection.push(Selection.Selection[0]);
                                });
                            }
                        }
                    });

                    if (SelectionText.toLowerCase() == "channel/retailer") {
                        ChangeChannelDemogSettings(true, true);
                        $scope.FirstTime = false;
                    }
                    else if (SelectionText.toLowerCase() == "demographics") {
                        ChangeChannelDemogSettings(false, true);
                        $scope.FirstTime = false;
                    }
                    else if (SelectionText.toLowerCase() == "top/worst performing brands") {
                        $scope.ChannelOrDemographicsToggleDisabled = true;
                        $scope.FirstTime = false;
                    }
                    else if ($scope.FirstTime) {
                        let moduleSelection = JSON.parse(_.result(_.find(ModuleSelection, function (obj) { return obj.Name == $scope.ModuleName.toLowerCase(); }), 'Selection'));
                        if (moduleSelection[7].Name.toLowerCase() == "channel/retailer") {
                            ChangeChannelDemogSettings(true, false);
                        }
                        else {
                            ChangeChannelDemogSettings(false, false);
                        }
                        $scope.FirstTime = false;
                    }
                    else {
                        ChangeChannelDemogSettings(true, false);
                    }
                }
                else if ($scope.FilterPanel[Selection.Id].Name.toLowerCase() == "segments") {
                    if (Selection.Selection[0].Id == 2) {
                        var segmentTabId = getModuleFilterTypeId("segments");
                        var isItemSelected = (($scope.FilterPanel[segmentTabId].Selection.length > 0 && $scope.FilterPanel[segmentTabId].Selection[0] != undefined && $scope.FilterPanel[segmentTabId].Selection[0].Id == 2)
                                            || ($scope.FilterPanel[segmentTabId].Selection.length > 1 && $scope.FilterPanel[segmentTabId].Selection[1] != undefined && $scope.FilterPanel[segmentTabId].Selection[1].Id == 2));
                        if (FindHierarchyLength(Selection.Selection[0]) > 1 && isItemSelected) {
                            $scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].IsDisabled = true;
                            $scope.ChannelOrDemographicsToggleDisabled = true;
                            $scope.clearTab(getModuleFilterTypeId("channel/retailer"));
                        }
                        else if (!isItemSelected || (FindHierarchyLength(Selection.Selection[0]) <= 1 && !isChannelOrDemogSelectedAsCompare())) {
                            $scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].IsDisabled = false;
                            $scope.ChannelOrDemographicsToggleDisabled = false;
                            setDefaultSelectionForChannelDemog();
                        }
                        var SelectionArray = $scope.FilterPanel[getModuleFilterTypeId("compare")].SelectionText.split('-');
                        if (SelectionArray[0].toLowerCase() == "channel/retailer") {
                            ChangeChannelDemogSettings(true, true);
                        }
                        else if (SelectionArray[0].toLowerCase() == "demographics") {
                            ChangeChannelDemogSettings(false, true);
                        }
                    }
                }

                if (!_.includes(["channel/retailer", "demographics"], $scope.FilterPanel[getModuleFilterTypeId("compare")].SelectionText.toLowerCase())
                    && _.includes([getModuleFilterTypeId("segments"), getModuleFilterTypeId("kpi")], Selection.Id)) {
                    if (!$scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].IsDisabled && getIschannelmetric(level2Data[7].Data)) {
                        if (!$scope.IsChannelToggle) {
                            ChangeChannelDemogSettings(true, true);
                            $scope.clearTab(getModuleFilterTypeId("channel/retailer"));
                            setDefaultSelectionForChannelDemog();
                        }
                        else {
                            ChangeChannelDemogSettings(true, true);
                        }
                    }
                    else if (!getIschannelmetric(level2Data[7].Data)) {
                        if ($scope.FilterPanel[getModuleFilterTypeId("compare")].SelectionText.toLowerCase() == "top/worst performing brands") {
                            $scope.ChannelOrDemographicsToggleDisabled = true;
                        }
                        else if (!$scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].IsDisabled && !getIschannelmetric(level2Data[7].Data)) {
                            $scope.ChannelOrDemographicsToggleDisabled = false;
                        }
                        else {
                            $scope.ChannelOrDemographicsToggleDisabled = $scope.ChannelOrDemographicsToggleDisabled;
                        }
                    }
                }

                if ($scope.FilterPanel[getModuleFilterTypeId("compare")].SelectionText.toLowerCase() == "top/worst performing brands") {
                    $scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].IsDisabled = true;
                    ChangeChannelDemogSettings(true, true);
                }
            }
            else if (Module.toLowerCase() == "crosstab") {
                var RowSelectionText = getModuleFilterTypeId("row") > -1 ? $scope.FilterPanel[getModuleFilterTypeId("row")].SelectionText.toLowerCase() : "";
                var ColSelectionText = getModuleFilterTypeId("column") > -1 ? $scope.FilterPanel[getModuleFilterTypeId("column")].SelectionText.toLowerCase() : "";
                if ($scope.FilterPanel[Selection.Id].Name.toLowerCase() == "column") {
                    var SelectionText = $scope.FilterPanel[Selection.Id].SelectionText.toLowerCase();
                    SelectionText = SelectionText.replace("segment 1", "segments");
                    angular.forEach($scope.FilterPanel, function (obj) {
                        obj.IsMulti = false;
                        if (SelectionText.toLowerCase() == obj.Name.toLowerCase() ||
                            SelectionText.toLowerCase().replace("demographics", "channel/retailer") == obj.Name.toLowerCase() ||
                            SelectionText.toLowerCase().replace("channel/retailer", "demographics") == obj.Name.toLowerCase()) {
                            obj.IsMulti = true;
                        }
                    });
                    angular.forEach($scope.FilterPanel, function (obj) {
                        if (obj.Name.toLowerCase() == "brands") {
                            if (SelectionText.toLowerCase() == "category") {
                                obj.IsDisabled = false;//AllowAll obj.IsDisabled = true;
                            }
                            else {
                                obj.IsDisabled = false;
                            }
                        }
                        else if (obj.Name.toLowerCase() == "segments") {
                            if (SelectionText.toLowerCase() == "category") {
                                obj.IsDisabled = false;//AllowAll obj.IsDisabled = true;
                            }
                            else {
                                obj.IsDisabled = false;
                            }
                        }
                    });
                    ApplyChannelOrDemogCustomization(SelectionText, "");
                }
                else if ($scope.FilterPanel[Selection.Id].Name.toLowerCase() == "row") {
                    var SelectionText = $scope.FilterPanel[Selection.Id].SelectionText.toLowerCase().replace("segment 1", "segments");
                    var ColumnSelectionText = $scope.FilterPanel[getModuleFilterTypeId("column")].SelectionText.toLowerCase().replace("segment 1", "segments");
                    var RowSelectionText = $scope.FilterPanel[Selection.Id].SelectionText.toLowerCase();
                    angular.forEach($scope.FilterPanel, function (obj) {
                        if (obj.Name.toLowerCase() != getFilterSelectionValueOnKey(getModuleFilterTypeId("column"), "Name")[0].toLowerCase().replace("segment 1", "segments")) {
                            obj.IsMulti = false;
                        }
                        if (_.includes(SelectionText.split(' - '), obj.Name.toLowerCase()) ||
                            SelectionText.toLowerCase().replace("demographics", "channel/retailer").indexOf(obj.Name.toLowerCase()) > -1 ||
                            SelectionText.toLowerCase().replace("channel/retailer", "demographics").indexOf(obj.Name.toLowerCase()) > -1) {
                            obj.IsMulti = true;
                        }
                    });
                    angular.forEach($scope.FilterPanel, function (obj) {
                        if (obj.Name.toLowerCase() == "brands") {
                            if (RowSelectionText.indexOf("category") > -1 || ColumnSelectionText == "category") {
                                obj.IsDisabled = false;//AllowAll obj.IsDisabled = true;
                            }
                            else {
                                obj.IsDisabled = false;
                            }
                        }
                        else if (obj.Name.toLowerCase() == "segments") {
                            if (RowSelectionText.indexOf("category") > -1 || ColumnSelectionText == "category") {
                                obj.IsDisabled = false;//AllowAll obj.IsDisabled = true;
                            }
                            else {
                                obj.IsDisabled = false;
                            }
                        }
                    });
                    ApplyChannelOrDemogCustomization(SelectionText, "column");
                }
                else if ($scope.FilterPanel[Selection.Id].Name.toLowerCase() == "segments") {
                    if (Selection.Selection[0].Id == 2) {
                        if ($scope.CheckCrossTabMultiMarketOrMultiCategory()) {
                            SelectFilterSegmentTypeUnion();
                        }
                        else {
                            SelectFilterSegmentType();
                        }
                        var segmentTabId = getModuleFilterTypeId("segments");
                        var segmentSelectedArr = _.remove(_.map($scope.FilterPanel[segmentTabId].Selection, function (obj) { if (obj.Id == 2) return obj.Id == 2 }), undefined);
                        segmentSelectedArr = segmentSelectedArr.length > 0 ? true : false;
                        var isItemSelected = (($scope.FilterPanel[segmentTabId].Selection.length > 0 && $scope.FilterPanel[segmentTabId].Selection[0] != undefined && $scope.FilterPanel[segmentTabId].Selection[0].Id == 2)
                                            || ($scope.FilterPanel[segmentTabId].Selection.length > 1 && $scope.FilterPanel[segmentTabId].Selection[1] != undefined && $scope.FilterPanel[segmentTabId].Selection[1].Id == 2));
                        isItemSelected = isItemSelected || segmentSelectedArr;
                        if ((FindHierarchyLength(Selection.Selection[0]) > 1 || !IsTopLevelSegment2(LoopSelectionName(Selection))) && isItemSelected) {
                            $scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].IsDisabled = true;
                            $scope.ChannelOrDemographicsToggleDisabled = true;
                            $scope.clearTab(getModuleFilterTypeId("channel/retailer"));
                        }
                        else if (!isItemSelected || (FindHierarchyLength(Selection.Selection[0]) <= 1) && !isChannelOrDemogSelectedAsCompare()) {
                            $scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].IsDisabled = false;
                            $scope.ChannelOrDemographicsToggleDisabled = false;
                            setDefaultSelectionForChannelDemog();
                        }
                        if (_.includes([$scope.FilterPanel[getModuleFilterTypeId("row")].SelectionText.toLowerCase(), $scope.FilterPanel[getModuleFilterTypeId("column")].SelectionText.toLowerCase()], "channel/retailer")) {
                            ChangeChannelDemogSettings(true, true);
                        }
                        else if (_.includes([$scope.FilterPanel[getModuleFilterTypeId("row")].SelectionText.toLowerCase(), $scope.FilterPanel[getModuleFilterTypeId("column")].SelectionText.toLowerCase()], "demographics")) {
                            ChangeChannelDemogSettings(false, true);
                        }
                    }
                }
                if ((_.difference(["channel/retailer", "demographics"], RowSelectionText.split(' - ')).length == 2 &&
                    _.difference(["channel/retailer", "demographics"], ColSelectionText.split(' - ')).length == 2)
                    && _.includes([getModuleFilterTypeId("segments"), getModuleFilterTypeId("kpi")], Selection.Id)) {
                    if (!$scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].IsDisabled && getIschannelmetric(level2Data[7].Data)) {
                        if (!$scope.IsChannelToggle) {
                            ChangeChannelDemogSettings(true, true);
                            $scope.clearTab(getModuleFilterTypeId("channel/retailer"));
                            setDefaultSelectionForChannelDemog();
                        }
                        else {
                            ChangeChannelDemogSettings(true, true);
                        }
                    }
                    else if (!getIschannelmetric(level2Data[7].Data)) {
                        if (!$scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].IsDisabled && !getIschannelmetric(level2Data[7].Data)) {
                            $scope.ChannelOrDemographicsToggleDisabled = false;
                        }
                        else {
                            $scope.ChannelOrDemographicsToggleDisabled = $scope.ChannelOrDemographicsToggleDisabled;
                        }
                    }
                }
            }
        }

        let IsTopLevelSegment2 = function (seg2ItemName) {
            let flag = true;
            let item = _.find($scope.SearchDataSegment2, { 'Name': seg2ItemName });
            if (item != null && item.IsTopLevel != undefined) flag = item.IsTopLevel;
            return flag;
        }

        let ApplyChannelOrDemogCustomization = function (SelectionText, tabName) {
            let splitText = '-';
            SelectionText = SelectionText.toLowerCase();
            let Module = _.result(_.find(topMenuScope.modules, function (obj) {
                return obj.isActive == true;
            }), 'ModuleName');
            if (Module.toLowerCase() == "crosstab") {
                splitText = ' - ';
            }
            if (tabName.length > 0 && _.difference(["channel/retailer", "demographics"], $scope.FilterPanel[getModuleFilterTypeId(tabName)].SelectionText.toLowerCase().split(splitText)).length != 2) {
                return;
            }
            if (_.includes(SelectionText.split(splitText), "channel/retailer")) {
                $scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].IsDisabled = false;
                ChangeChannelDemogSettings(true, true);
                $scope.FirstTime = false;
            }
            else if (_.includes(SelectionText.split(splitText), "demographics")) {
                $scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].IsDisabled = false;
                ChangeChannelDemogSettings(false, true);
                $scope.FirstTime = false;
            }
            else if (_.includes(SelectionText.split(splitText), "top/worst performing brands")) {
                $scope.ChannelOrDemographicsToggleDisabled = true;
                $scope.FirstTime = false;
            }
            else if ($scope.FirstTime) {
                let moduleSelection = JSON.parse(_.result(_.find(ModuleSelection, function (obj) { return obj.Name == $scope.ModuleName.toLowerCase(); }), 'Selection'));
                if (moduleSelection[getModuleFilterTypeId("channel/retailer")].Name.toLowerCase() == "channel/retailer") {
                    ChangeChannelDemogSettings(true, false);
                }
                else {
                    ChangeChannelDemogSettings(false, false);
                }
                $scope.FirstTime = false;
            }
            else if (tabName.length == 0) {
                ChangeChannelDemogSettings($scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].Name.toLowerCase() == "channel/retailer", false);
            }
            else {
                ChangeChannelDemogSettings($scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].Name.toLowerCase() == "channel/retailer", false);
            }
        }

        let ChangeChannelDemogSettings = function (SetChannel, DisableToggle) {
            $scope.IsChannelToggle = SetChannel;
            $scope.ChannelOrDemographicsToggleDisabled = DisableToggle;
            $scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].Name = SetChannel ? "channel/retailer" : "demographics";
        }

        let getIschannelmetric = function (Data) {
            var flag = false;
            let selection = $scope.FilterPanel[getModuleFilterTypeId("kpi")].Selection;
            if (selection == null || selection.length == 0) {
                return false;
            }
            for (var i = 0; i < selection.length; i++) {
                var tempSelection = selection[i].Selection;
                while (!isLeaveSelection(tempSelection[0])) {
                    tempSelection = tempSelection[0].Selection;
                }
                flag = flag || searchData(tempSelection[0].Id, Data);
            }
            return flag;
        }

        var searchData = function (itemId, Data) {
            var x = false;
            for (var i = 0; i < Data.length; i++) {
                if (Data[i].Id == itemId) {
                    return Data[i].IsChannelOnlyMetric;
                }
                else if (!isLeaveNode(Data[i])) {
                    x = searchData(itemId, Data[i].Data)
                    if (x) { return x }
                }
            }
            return x;
        }

        let ApplyTopToBottom = function (item) {
            ApplySelection(item, item.Selection)
            if (!isLeaveNode(item)) ApplyTopToBottomRecursion(item);
        }

        let ApplyTopToBottomRecursion = function (item) {
            angular.forEach(item.Data, function (obj) {
                ApplySelection(obj, obj.Selection)
                if (!isLeaveNode(obj)) ApplyTopToBottomRecursion(obj);
            })
        }

        $scope.SelectSubFilterData = function (item, popupFlag) {
            let Selection = $scope.GetSelectionObject(item);
            if (popupFlag == null || popupFlag == undefined) {
                if ($scope.FilterPanel[Selection.Id].Dependency.length > 0 && !$scope.isDependentFiltersChanged) {
                    layoutScope.customAlert("Changing this selection would clear the selections made in subsequent tabs", "Alert", null, $scope.SelectSubFilterData, "OK", false, "Cancel", item);
                    return;
                }
            }
            if (popupFlag == true) {
                $scope.isDependentFiltersChanged = true;
            }
            if ($scope.FilterPanel[Selection.Id].Name.toLowerCase() == 'secondary brands') {
                if (_.isMatch($scope.FilterPanel[Selection.Id - 1].Selection[0], Selection.Selection[0])) {
                    layoutScope.customAlert(Constants.ERROR_MESSAGE_AlreadySelected($scope.FilterPanel[Selection.Id - 1].SelectionText), Constants.ALERT_HEADER_TEXT);
                    return;
                }
            }
            else if ($scope.FilterPanel[Selection.Id].Name.toLowerCase() == 'time period' && $scope.FilterPanel[Selection.Id].IsMulti) {
                if ($scope.FilterPanel[Selection.Id].Selection.length > 0 && !_.isMatch($scope.FilterPanel[Selection.Id].Selection[0].Name, Selection.Selection[0].Name)) {
                    layoutScope.customAlert(Constants.ERROR_MESSAGE_DIFF_TIMEPERIOD($scope.FilterPanel[Selection.Id].Selection[0].Name), Constants.ALERT_HEADER_TEXT);
                    return;
                }
            }

            $scope.isSelectedFiltersChanged = true;
            if ($scope.FilterPanel[Selection.Id].Name.toLowerCase() == 'segments') {
                if (Selection.Selection[0].Id == 1) {
                    if (item.IsSelected) {
                        $scope.FilterPanel[Selection.Id].Selection = _.remove($scope.FilterPanel[Selection.Id].Selection, function (obj) {
                            return !_.isMatch(obj, Selection.Selection[0])
                        });
                        item.IsSelected = !item.IsSelected;
                        ClearFilterTab($scope.FilterPanel[Selection.Id].Data[0]);
                        $scope.FilterPanel[Selection.Id].Data[0].IsSelected = false;
                        $scope.FilterPanel[Selection.Id].Data[0].IsChildSelected = false;
                        $scope.FilterPanel[Selection.Id].Data[0].Selection = [];
                    }
                    else {
                        if (!$scope.FilterPanel[Selection.Id].IsMulti) {
                            $scope.FilterPanel[Selection.Id].Selection = _.remove($scope.FilterPanel[Selection.Id].Selection, function (obj) {
                                return !(obj.Id == 1);
                            });
                        }
                        ClearFilterTab($scope.FilterPanel[Selection.Id].Data[0]);
                        item.IsSelected = !item.IsSelected;
                        $scope.FilterPanel[Selection.Id].Selection.push(Selection.Selection[0]);
                        let pnode = item;
                        while (pnode != null) {
                            pnode.IsChildSelected = true;
                            pnode = pnode.Parent;
                        }
                    }
                    // Added to deselect default selected element RISKY
                    if (!$scope.FilterPanel[Selection.Id].IsMulti) {
                        $scope.FilterPanel[Selection.Id].IsMulti = true;
                        ApplyTopToBottom($scope.FilterPanel[Selection.Id]);
                        $scope.FilterPanel[Selection.Id].IsMulti = false;
                    }
                    else {
                        ApplyTopToBottom($scope.FilterPanel[Selection.Id]);
                    }
                }
                else {
                    if (item.IsSelected) {
                        $scope.FilterPanel[Selection.Id].Selection = _.remove($scope.FilterPanel[Selection.Id].Selection, function (obj) {
                            return !_.isMatch(obj, Selection.Selection[0])
                        });
                        item.IsSelected = !item.IsSelected;
                        ClearFilterTab($scope.FilterPanel[Selection.Id].Data[1]);
                        $scope.FilterPanel[Selection.Id].Data[1].IsSelected = false;
                        $scope.FilterPanel[Selection.Id].Data[1].IsChildSelected = false;
                        $scope.FilterPanel[Selection.Id].Data[1].Selection = [];
                    }
                    else {
                        $scope.FilterPanel[Selection.Id].Selection = _.remove($scope.FilterPanel[Selection.Id].Selection, function (obj) {
                            return !(obj.Id == 2);
                        });
                        ClearFilterTab($scope.FilterPanel[Selection.Id].Data[1]);
                        item.IsSelected = !item.IsSelected;
                        $scope.FilterPanel[Selection.Id].Selection.push(Selection.Selection[0]);
                        let pnode = item;
                        while (pnode != null) {
                            pnode.IsChildSelected = true;
                            pnode = pnode.Parent;
                        }
                        // Added to deselect default selected element RISKY
                        if (!$scope.FilterPanel[Selection.Id].IsMulti) {
                            $scope.FilterPanel[Selection.Id].IsMulti = true;
                            ApplyTopToBottom($scope.FilterPanel[Selection.Id]);
                            $scope.FilterPanel[Selection.Id].IsMulti = false;
                        }
                        else {
                            ApplyTopToBottom($scope.FilterPanel[Selection.Id]);
                        }
                    }
                }
                ApplyModuleCustomization(Selection);
                return;
            }
            if ($scope.FilterPanel[Selection.Id].Name.toLowerCase() == 'row') {
                var levelId = Selection.Selection[0].Id
                var level = Selection.Selection[0].Id - 101;//starting from 0 to 3
                for (var i = levelId + 1; i <= 104; i++) {
                    $scope.FilterPanel[Selection.Id].Selection = _.remove($scope.FilterPanel[Selection.Id].Selection, function (obj) {
                        if (obj.Id != i) {
                            return true;
                        }
                        else
                            return false;
                    });
                }
                if (item.IsSelected) {
                    $scope.FilterPanel[Selection.Id].Selection = _.remove($scope.FilterPanel[Selection.Id].Selection, function (obj) {
                        return !_.isMatch(obj, Selection.Selection[0])
                    });
                    item.IsSelected = !item.IsSelected;
                    $scope.FilterPanel[Selection.Id].Data[level].IsSelected = false;
                    $scope.FilterPanel[Selection.Id].Data[level].IsChildSelected = false;
                    $scope.FilterPanel[Selection.Id].Data[level].Selection = [];
                }
                else {
                    $scope.FilterPanel[Selection.Id].Selection = _.remove($scope.FilterPanel[Selection.Id].Selection, function (obj) {
                        return !(obj.Id == levelId);
                    });
                    item.IsSelected = !item.IsSelected;
                    $scope.FilterPanel[Selection.Id].Selection.push(Selection.Selection[0]);
                    let pnode = item;
                    while (pnode != null) {
                        pnode.IsChildSelected = true;
                        pnode = pnode.Parent;
                    }
                }
                // Added to deselect default selected element RISKY
                $scope.FilterPanel[Selection.Id].IsMulti = true;
                ApplyTopToBottom($scope.FilterPanel[Selection.Id]);
                $scope.FilterPanel[Selection.Id].IsMulti = false;

                $scope.FilterPanel[Selection.Id].SelectionText = $scope.getSelectionText($scope.FilterPanel[Selection.Id]);
                ClearDependentFitler(Selection.Id);
                ApplyModuleCustomization(Selection);
                ApplyModuleDefaultSelection($scope.FilterPanel[Selection.Id].Name.toLowerCase());
                return;
            }
            if (Selection.Name == "demographics" && $scope.FilterPanel[Selection.Id].IsMulti && !item.IsSelected && $scope.IsChildSelectionAllowed) {
                if ($scope.ModuleName.toLowerCase() == 'crosstab') {
                    SelectAllChildsOfParent(item, Selection.Id);
                }
                else if ($scope.ModuleName.toLowerCase() == 'deepdive') {
                    if (CheckIfChildSelectionPossible(Constants.MAX_SELCTION_VALUE_DEEPDIVE - 1, item, Selection.Id)) {
                        SelectAllChildsOfParent(item, Selection.Id);
                    }
                    else {
                        layoutScope.customAlert(Constants.MAX_SELCTION_TEXT_DEEPDIVE, Constants.ALERT_HEADER_TEXT);
                        return;
                        //unselect parent
                    }
                }
            }

            if ($scope.FilterPanel[Selection.Id].IsMulti) {
                if (item.IsSelected) {
                    //Match selection in filterpanel and remove
                    $scope.FilterPanel[Selection.Id].Selection = _.remove($scope.FilterPanel[Selection.Id].Selection, function (obj) {
                        return !_.isMatch(obj, Selection.Selection[0])
                    });

                    item.IsSelected = !item.IsSelected;
                    ClearDependentFitler(Selection.Id);
                    ApplyTopToBottom($scope.FilterPanel[Selection.Id]);
                }
                else {
                    if (checkMaxSelections(Selection.Id)) {
                        return;
                    }
                    ClearDependentFitler(Selection.Id);
                    item.IsSelected = !item.IsSelected;
                    $scope.FilterPanel[Selection.Id].Selection.push(Selection.Selection[0]);
                    $scope.FilterPanel[Selection.Id].SelectionText = item.DisplayName;
                    let pnode = item;
                    while (pnode != null) {
                        pnode.IsChildSelected = true;
                        pnode = pnode.Parent;
                    }
                }
            }
            else {
                if (item.IsSelected) {
                    $scope.clearTab(Selection.Id);
                    //remove this object from selection
                }
                else {
                    $scope.clearTab(Selection.Id);
                    item.IsSelected = !item.IsSelected;
                    $scope.FilterPanel[Selection.Id].Selection = Selection.Selection;
                    $scope.FilterPanel[Selection.Id].SelectionText = item.DisplayName;
                    let pnode = item;
                    while (pnode != null) {
                        pnode.IsChildSelected = true;
                        pnode = pnode.Parent;
                    }
                }
            }
            if (item.IsSelected && Selection.Name == "snapshot type" && item.DisplayName.toLowerCase() == "demographics-single") {
                $scope.FilterPanel[getModuleFilterTypeId("brands")].IsHidden = true;
                $scope.FilterPanel[getModuleFilterTypeId("primary brands")].IsHidden = false;
                $scope.FilterPanel[getModuleFilterTypeId("secondary brands")].IsHidden = false;
            }
            else if (Selection.Name == "snapshot type") {
                $scope.FilterPanel[getModuleFilterTypeId("brands")].IsHidden = false;
                $scope.FilterPanel[getModuleFilterTypeId("primary brands")].IsHidden = true;
                $scope.FilterPanel[getModuleFilterTypeId("secondary brands")].IsHidden = true;
            }
            ApplyModuleCustomization(Selection);
            ApplyModuleDefaultSelection($scope.FilterPanel[Selection.Id].Name.toLowerCase());
            //if ((Selection.Name.toLowerCase() == "column" || Selection.Name.toLowerCase() == "row") && isChannelOrDemogSelectedAsCompare()) {
            //    layoutScope.customAlert("Only one cut from Channel/Retailers or Demographics can be selected in Row/Column","Alert")
            //}
            //else if ((Selection.Name.toLowerCase() == "compare" || Selection.Name.toLowerCase() == "snapshot type") && isChannelOrDemogSelectedAsCompare()) {
            //    if (Selection.Selection[0].Name.toLocaleLowerCase() == "channel/retailer") {
            //        layoutScope.customAlert("Demographics cannot be used as a filter", "Alert");
            //    }
            //    else {
            //        layoutScope.customAlert("Channel/Retailers cannot be used as a filter", "Alert");
            //    }              
            //}
        }

        $scope.GetSelectionObject = function (item) {
            let pnode = item;
            let Myselection = [];
            let Selection = [];
            var i = 0, si = 0;
            while (pnode != null) {
                Myselection.push(
                    {
                        "Id": pnode.Id,
                        "Name": pnode.Name,
                        "DisplayName": pnode.DisplayName,
                        "Selection": null
                    })
                if (i == 0 && item.BrandMappings != undefined) {
                    Myselection[0].BrandMappings = item.BrandMappings;
                    i == 1;
                }
                if (si == 0 && item.SegmentMappings != undefined) {
                    Myselection[0].SegmentMappings = item.SegmentMappings;
                    si == 1;
                }
                pnode = pnode.Parent;
            }
            for (let i = 0; i < Myselection.length - 1; i++) {
                Myselection[i + 1].Selection = [Myselection[i]];
            }
            return Myselection[Myselection.length - 1];
        };

        let SelectAllChildsOfParent = function (parent, tabId) {
            angular.forEach(parent.Data, function (child) {
                child.Parent = parent;
                LoopAllChildsOfParent(parent, child, tabId);
            });
        }

        let GetUnselectedChildList = function (item) {
            let count = 0;
            angular.forEach(item.Data, function (obj) {
                if (!obj.IsSelected) {
                    count += 1;
                }
                if (!isLeaveNode(obj)) {
                    count += GetUnselectedChildList(obj);
                }
            });
            return count;
        }

        let CheckIfChildSelectionPossible = function (MaxSelection, item, tabId) {
            let flag = true, count = 0;
            count = $scope.FilterPanel[tabId].Selection.length;
            count += GetUnselectedChildList(item);
            if (count > MaxSelection)
                return false;
            return flag
        }

        let LoopAllChildsOfParent = function (parent, child, tabId) {
            if (checkMaxSelections(tabId)) {
                return;
            }
            let Selection = $scope.GetSelectionObject(child);
            if (!child.IsSelected) {
                child.IsSelected = !child.IsSelected;
                $scope.FilterPanel[tabId].Selection.push(Selection.Selection[0]);
            }
            let pnode = child;
            while (pnode != null) {
                pnode.IsChildSelected = true;
                pnode = pnode.Parent;
            }
            if (!isLeaveNode(child)) {
                angular.forEach(child.Data, function (subChild) {
                    subChild.Parent = child;
                    LoopAllChildsOfParent(child, subChild, tabId);
                });
            }
        }

        $scope.replaceWhiteSpace = function (value) {
            if (value !== null && value !== undefined)
                return value.replace(/ /g, '_').replace('/', '_').toUpperCase();
        };

        $scope.removeWhiteSpace = function (value) {
            if (value !== null && value !== undefined)
                return value.replace(/ /g, '');
        };

        let isLeaveNode = function (item) {
            return item.Data === undefined || item.Data === null || item.Data.length === 0
        };

        $scope.IsLeaf = function (item) {
            return item.Data === undefined || item.Data === null || item.Data.length === 0
        }

        let isLeaveSelection = function (item) {
            return item.Selection === undefined || item.Selection === null || item.Selection.length === 0
        };

        $scope.callChildGetOutput = function (getOutput) {
            $scope.getOutput = getOutput;
        }

        $scope.OpenTagStoryMySelection = function (func) {
            $scope.CheckandOpenTagStoryMySelection = func;
        }

        $scope.setLowSampleSizeFlag = function (operation) {
            $scope.isLowSampleSize = operation;
        }

        $scope.ToggleChannel = function (state) {
            if (!$scope.ChannelOrDemographicsToggleDisabled) {
                $scope.IsChannelToggle = state;
                var isDefaultSelctions = false;
                if (_.isEqual($scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].Selection, DefaultSelectionObj[$scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].Name])) {
                    isDefaultSelctions = true;
                }
                $scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].Name = state ? "channel/retailer" : "demographics";
                $scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].IsOpen = false;
                if (isDefaultSelctions) {
                    $scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].Selection = DefaultSelectionObj[$scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].Name];
                }
                else {
                    $scope.clearTab($scope.FilterPanel.length - 1);
                }
                if ($scope.ModuleName.toLowerCase() != "crosstab" && $scope.FilterPanel[getModuleFilterTypeId("markets")].Selection.length > 0 && $scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 0 && !isChannelOrDemogSelectedAsCompare()) {
                    $scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].Selection = DefaultSelectionObj[$scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].Name];
                }
            }
        }

        $scope.ToggleChildSelection = function () {
            $scope.IsChildSelectionAllowed = !$scope.IsChildSelectionAllowed;
        }

        let getModuleFilterTypeId = function (FilterName) {
            let ModuleFiltersId = {
                "snapshot": {
                    "snapshot type": 0, "markets": 1, "category": 2, "time period": 3, "brands": 4, "primary brands": 5, "secondary brands": 6, "segments": 7, "channel/retailer": 8, "demographics": 8,
                },
                "deepdive": {
                    "compare": 0, "markets": 1, "category": 2, "time period": 3, "brands": 4, "segments": 5, "kpi": 6, "channel/retailer": 7, "demographics": 7,
                },
                "crosstab": {
                    "column": 0, "row": 1, "markets": 2, "category": 3, "time period": 4, "brands": 5, "segments": 6, "kpi": 7, "channel/retailer": 8, "demographics": 8,
                },
                "growthopportunity": {
                    "markets": 0, "category": 1, "brands": 2,
                }
            }
            return $scope.ModuleName != undefined && ModuleFiltersId[$scope.ModuleName.toLowerCase()] != undefined && ModuleFiltersId[$scope.ModuleName.toLowerCase()][FilterName.toLowerCase()] != undefined ? ModuleFiltersId[$scope.ModuleName.toLowerCase()][FilterName.toLowerCase()] : -1;
        }

        $scope.GetSegmentSelectionCount = function (SegId, type) {
            let count = 0;
            for (var i = 0; i < $scope.FilterPanel[SegId].Selection.length; i++) {
                if ($scope.FilterPanel[SegId].Selection[i].Name.toLowerCase() == type) {
                    count++;
                }
            }
            return count;
        }

        let checkAllFiltersSelected = function (Id) {
            let flag = false;
            for (var i = 0; i < $scope.FilterPanel.length; i++) {
                if ($scope.ModuleName.toLowerCase() == "crosstab" && $scope.FilterPanel[i].Name.toLowerCase() == "segments" && !$scope.FilterPanel[i].IsDisabled && !$scope.FilterPanel[i].IsHidden) {
                    if (_.includes($scope.GetRowColumnSelction(), 'segment 1') && $scope.GetSegmentSelectionCount(i, 'segment 1') == 0) {
                        layoutScope.customAlert(Constants.MANDATORY_SELCTION_TEXT.replace("||", "SEGMENT 1"), Constants.ALERT_HEADER_TEXT);
                        $scope.isFilterpanelOpen = true;
                        return false;
                    }
                }
                else if ($scope.ModuleName.toLowerCase() == "crosstab" && $scope.FilterPanel[i].Selection.length == 0 && !$scope.FilterPanel[i].IsDisabled && !$scope.FilterPanel[i].IsHidden) {
                    if (($scope.FilterPanel[i].Name.toLowerCase() == "brands" || $scope.FilterPanel[i].Name.toLowerCase() == "channel/retailer" || $scope.FilterPanel[i].Name.toLowerCase() == "demographics") && !$scope.FilterPanel[i].IsMulti) {
                        //skip
                    }
                    else {
                        layoutScope.customAlert(Constants.MANDATORY_SELCTION_TEXT.replace("||", $scope.FilterPanel[i].Name), Constants.ALERT_HEADER_TEXT);
                        $scope.isFilterpanelOpen = true;
                        return false;
                    }
                }
                else if ($scope.FilterPanel[i].Selection.length == 0 && !$scope.FilterPanel[i].IsDisabled && !$scope.FilterPanel[i].IsHidden) {
                    layoutScope.customAlert(Constants.MANDATORY_SELCTION_TEXT.replace("||", $scope.FilterPanel[i].Name), Constants.ALERT_HEADER_TEXT);
                    $scope.isFilterpanelOpen = true;
                    return false;
                }
                else if ($scope.FilterPanel[i].Name.toLowerCase() == "segments" && !$scope.FilterPanel[i].IsDisabled) {
                    //var checkArray = ["channel/retailer-multi", "channel/retailer", "demographics"];
                    var checkArray = [];
                    if (!_.includes(checkArray, $scope.FilterPanel[0].SelectionText.toLowerCase())) {
                        if ($scope.FilterPanel[i].Selection.length < 2) {
                            let segmentData = SelectFilterSegmentType();
                            if (segmentData.length > 1 && segmentData[1].Data.length == 0) {
                                //segment 2 is empty leave it alone!!
                            }
                            else {
                                layoutScope.customAlert(Constants.MANDATORY_SELCTION_TEXT.replace("||", $scope.FilterPanel[i].Name), Constants.ALERT_HEADER_TEXT);
                                $scope.isFilterpanelOpen = true;
                                return false;
                            }

                        }
                    }
                }
            }

            return true;
        }

        $scope.isSelectionOverflown = function () {
            return document.getElementsByClassName("top_selection_bar_inner")[0].scrollWidth > document.getElementsByClassName("top_selection_bar")[0].clientWidth;
        }

        let checkMaxSelections = function (Id) {
            if ($scope.ModuleName.toLowerCase() == "deepdive") {
                if ($scope.FilterPanel[Id].Selection.length == Constants.MAX_SELCTION_VALUE_DEEPDIVE) {
                    layoutScope.customAlert(Constants.MAX_SELCTION_TEXT_DEEPDIVE, Constants.ALERT_HEADER_TEXT);
                    return true;
                }
                else
                    return false;
            }
            else if ($scope.ModuleName.toLowerCase() == "snapshot") {
                if (Id == getModuleFilterTypeId("secondary brands")) {
                    if ($scope.FilterPanel[Id].Selection.length == Constants.MAX_SELCTION_VALUE_SNAPSHOT_SECONDARYBRAND) {
                        layoutScope.customAlert(Constants.MAX_SELCTION_TEXT_SNAPSHOT_SECONDARYBRAND, Constants.ALERT_HEADER_TEXT);
                        return true;
                    }
                    else {
                        return false;
                    }
                }
                else if ($scope.FilterPanel[Id].Selection.length == Constants.MAX_SELCTION_VALUE_SNAPSHOT) {
                    layoutScope.customAlert(Constants.MAX_SELCTION_TEXT_SNAPSHOT, Constants.ALERT_HEADER_TEXT);
                    return true;
                }
                else
                    return false;
            }
            else
                return false;
        }

        let prepareSelectedFiltersData = function () {
            let data = {};
            data.CompareId = getModuleFilterTypeId("compare") != -1 ? getFilterSelectionId(getModuleFilterTypeId("compare")).join('|') : "";
            data.CompareTabName = getModuleFilterTypeId("compare") != -1 ? getFilterSelectionName(getModuleFilterTypeId("compare")).join('|') : "";
            data.SnapshotTypeId = getModuleFilterTypeId("snapshot type") != -1 ? getFilterSelectionId(getModuleFilterTypeId("snapshot type")).join('|') : "";
            data.SnapshotTypeName = getModuleFilterTypeId("snapshot type") != -1 ? $scope.FilterPanel[getModuleFilterTypeId("snapshot type")].SelectionText : "";
            data.RowId = getModuleFilterTypeId("row") != -1 ? getFilterSelectionId(getModuleFilterTypeId("row")).join('|') : "";
            data.RowName = getModuleFilterTypeId("row") != -1 ? getFilterSelectionValueOnKey(getModuleFilterTypeId("row"), "Name").join(' - ') : "";
            data.ColumnId = getModuleFilterTypeId("column") != -1 ? getFilterSelectionId(getModuleFilterTypeId("column")).join('|') : "";
            data.ColumnName = getModuleFilterTypeId("column") != -1 ? getFilterSelectionValueOnKey(getModuleFilterTypeId("column"), "Name").join('|') : "";
            data.MarketId = getModuleFilterTypeId("markets") != -1 ? getFilterSelectionId(getModuleFilterTypeId("markets")).join('|') : "";
            data.MarketName = getModuleFilterTypeId("markets") != -1 ? getFilterSelectionName(getModuleFilterTypeId("markets")).join('|') : "";
            data.CategoryId = getModuleFilterTypeId("category") != -1 ? getFilterSelectionId(getModuleFilterTypeId("category")).join('|') : "";
            data.CategoryName = getModuleFilterTypeId("category") != -1 ? getFilterSelectionName(getModuleFilterTypeId("category")).join('|') : "";
            data.TimePeriodId = getModuleFilterTypeId("time period") != -1 ? getFilterSelectionId(getModuleFilterTypeId("time period")).join('|') : "";
            data.TimePeriodName = getModuleFilterTypeId("time period") != -1 ? $scope.FilterPanel[getModuleFilterTypeId("time period")].SelectionText : "";
            data.BrandId = getModuleFilterTypeId("brands") != -1 ? getFilterSelectionId(getModuleFilterTypeId("brands")).join('|') : "";
            data.BrandName = getModuleFilterTypeId("brands") != -1 ? getFilterSelectionName(getModuleFilterTypeId("brands")).join('|') : "";
            data.PrimaryBrandName = getModuleFilterTypeId("primary brands") != -1 ? getFilterSelectionName(getModuleFilterTypeId("primary brands")).join(',') : "";
            data.SecondaryBrandName = getModuleFilterTypeId("secondary brands") != -1 ? getFilterSelectionName(getModuleFilterTypeId("secondary brands")).join(',') : "";
            data.BrandMappings = getModuleFilterTypeId("brands") != -1 ? getFilterSelectionValueOnKey(getModuleFilterTypeId("brands"), "BrandMappings") : "";
            data.BrandMappings = _.flatten(data.BrandMappings);
            data.PrimaryBrandMappings = getModuleFilterTypeId("primary brands") != -1 ? getFilterSelectionValueOnKey(getModuleFilterTypeId("primary brands"), "BrandMappings") : "";
            data.PrimaryBrandMappings = _.flatten(data.PrimaryBrandMappings);
            data.SecondaryBrandMappings = getModuleFilterTypeId("secondary brands") != -1 ? getFilterSelectionValueOnKey(getModuleFilterTypeId("secondary brands"), "BrandMappings") : "";
            data.SecondaryBrandMappings = _.flatten(data.SecondaryBrandMappings);
            data.KpiId = getModuleFilterTypeId("kpi") != -1 ? getFilterSelectionId(getModuleFilterTypeId("kpi")).join('|') : "";
            data.KpiName = getModuleFilterTypeId("kpi") != -1 ? getFilterSelectionDisplayName(getModuleFilterTypeId("kpi")).join('|') : "";
            data.isTrend = getModuleFilterTypeId("time period") != -1 ? ($scope.FilterPanel[getModuleFilterTypeId("time period")].Selection.length > 1 ? true : false) : false;
            data.isChannelOrDemog = getModuleFilterTypeId("channel/retailer") != -1 ? $scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].IsDisabled ? "0" : "1" : "";

            var channelOrDemogId = getModuleFilterTypeId("channel/retailer") != -1 ? getFilterSelectionId(getModuleFilterTypeId("channel/retailer")).join('|') : "";
            var channelOrDemogName = getModuleFilterTypeId("channel/retailer") != -1 ? getFilterSelectionName(getModuleFilterTypeId("channel/retailer")).join('|') : "";
            data.isChannel = $scope.IsChannelToggle;
            data.ChannelId = $scope.IsChannelToggle ? channelOrDemogId : "";
            data.DemographicId = !$scope.IsChannelToggle ? channelOrDemogId : "";
            data.ChannelName = $scope.IsChannelToggle ? channelOrDemogName : "";
            data.DemographicName = !$scope.IsChannelToggle ? channelOrDemogName : "";

            data.Segment1Id = null;
            data.Segment2Id = null;
            data.Segment1Name = null;
            data.Segment2Name = null;
            let segment1Arr = [], segment1IdArr = [], segment1NameArr = [];
            if (getModuleFilterTypeId("segments") != -1) {
                var segmentTabId = getModuleFilterTypeId("segments");
                if ($scope.FilterPanel[segmentTabId].Selection.length > 0) {
                    segment1Arr = _.filter($scope.FilterPanel[segmentTabId].Selection, function (obj) { return obj.Id == 1 });
                    segment1NameArr = _.map(segment1Arr, function (obj) { return LoopSelectionName(obj) });
                    segment1IdArr = _.map(segment1Arr, function (obj) { return LoopSelectionId(obj) });
                    if ($scope.FilterPanel[segmentTabId].Selection[0].Id == 1) {
                        data.Segment1Id = LoopSelectionId($scope.FilterPanel[segmentTabId].Selection[0]);
                        data.Segment1Name = LoopSelectionName($scope.FilterPanel[segmentTabId].Selection[0]);
                    }
                    else {
                        data.Segment2Id = LoopSelectionId($scope.FilterPanel[segmentTabId].Selection[0]);
                        data.Segment2Name = LoopSelectionName($scope.FilterPanel[segmentTabId].Selection[0]);
                    }
                }
                if ($scope.FilterPanel[segmentTabId].Selection.length == 2) {
                    if ($scope.FilterPanel[segmentTabId].Selection[1].Id == 1) {
                        data.Segment1Id = LoopSelectionId($scope.FilterPanel[segmentTabId].Selection[1]);
                        data.Segment1Name = LoopSelectionName($scope.FilterPanel[segmentTabId].Selection[1]);
                    }
                    else {
                        data.Segment2Id = LoopSelectionId($scope.FilterPanel[segmentTabId].Selection[1]);
                        data.Segment2Name = LoopSelectionName($scope.FilterPanel[segmentTabId].Selection[1]);
                    }
                }
                if (segment1Arr.length > 1) {
                    data.Segment1Id = segment1IdArr.join('|');
                    data.Segment1Name = "Multiple";
                }

                let seg2Obj = _.remove(_.map($scope.FilterPanel[segmentTabId].Selection, function (obj) { if (obj.Id == 2) return obj }), undefined);
                if (seg2Obj.length > 0) {
                    data.Segment2Id = LoopSelectionId(seg2Obj[0]);
                    data.Segment2Name = LoopSelectionName(seg2Obj[0]);
                }
                data.SegmentMappings = _.flatten(_.remove(getFilterSelectionValueOnKey(getModuleFilterTypeId("segments"), "SegmentMappings"), undefined));
            }
            return data;
        }

        let FindHierarchyLength = function (Selection) {
            var x = 0;
            if (!isLeaveSelection(Selection))
                x = FindHierarchyLength(Selection.Selection[0]) + 1;
            return x;
        }

        let isFIlterSelected = function (tabName, tabValue) {
            var flag = false, tabId = getModuleFilterTypeId(tabName);
            if (tabId >= 0 && $scope.FilterPanel[tabId].Selection.length > 0) {
                for (var i = 0; i < $scope.FilterPanel[tabId].Selection.length; i++) {
                    if (_.includes(_.map(getFilterSelectionValueOnKey(tabId, "DisplayName"), function (x) { if (x) return x.toLowerCase() }), tabValue)) {
                        return true;
                    }
                }
            }
            return flag;
        }

        let setFooterTop = function () {
            var i = 0;
            angular.element('.foot-notes .foon_note').each(function (obj) {
                if (angular.element(this).is(':visible') == true)
                    i++;
            })
            angular.element('.foot-notes').css("top", (98.1 - 1.9 * i) + "%");
            return true;
        }
        
       
        $scope.setIsSelectedFiltersChanged = function (operation) {
            $scope.isSelectedFiltersChanged = operation;
            $scope.isDependentFiltersChanged = operation;
        }

        $scope.NavigateToDeepDive = function (timeperiodData) {
            var module = _.find(topMenuScope.modules, function (obj) {
                return obj.ModuleName.toLowerCase() == "deepdive";
            });
            angular.forEach(ModuleSelection, function (obj) {
                if (obj.Name.toLowerCase() == "deepdive")
                    obj.Selection = prepareDeepDiveSelectionObject(timeperiodData);
            });
            topMenuScope.clickModule(module, topMenuScope.modules)
        }

        $scope.NavigateToDeepDiveDemog = function (timeperiodData) {
            var module = _.find(topMenuScope.modules, function (obj) {
                return obj.ModuleName.toLowerCase() == "deepdive";
            });
            angular.forEach(ModuleSelection, function (obj) {
                if (obj.Name.toLowerCase() == "deepdive")
                    obj.Selection = prepareDeepDiveSelectionObjectDemog(timeperiodData);
            });
            topMenuScope.clickModule(module, topMenuScope.modules)
        }

        $scope.NavigateToGrowthOpportunity = function () {
            var module = _.find(topMenuScope.modules, function (obj) {
                return obj.ModuleName.toLowerCase() == "growthopportunity";
            });
            angular.forEach(ModuleSelection, function (obj) {
                if (obj.Name.toLowerCase() == "growthopportunity")
                    obj.Selection = prepareGrowthOpportunitySelectionObject();
            });
            topMenuScope.OpenHowDoesBrandGrow[0] = true;
            topMenuScope.clickModule(module, topMenuScope.modules)
        }

        $scope.VisibleFilterPanelLength = function () {
            let i = 0;
            angular.forEach($scope.FilterPanel, function (obj) { i += (obj.IsHidden == undefined || obj.IsHidden == true ? 0 : 1); })
            return i++;
        }

        let prepareDeepDiveSelectionObject = function (timeperiodData) {
            var selectionObj = [];
            var compareSelection = $scope.FilterPanel[getModuleFilterTypeId("snapshot type")];
            selectionObj.push({ Id: 0, Name: "compare", "Selection": [{ Id: compareSelection.Selection[0].Id, Name: compareSelection.Selection[0].Name, Selection: null }], SelectionText: compareSelection.Selection[0].Name });//compare
            selectionObj.push({ Id: 1, Name: $scope.FilterPanel[getModuleFilterTypeId("markets")].Name, Selection: $scope.FilterPanel[getModuleFilterTypeId("markets")].Selection, SelectionText: $scope.FilterPanel[getModuleFilterTypeId("markets")].SelectionText });//markets
            selectionObj.push({ Id: 2, Name: $scope.FilterPanel[getModuleFilterTypeId("category")].Name, Selection: $scope.FilterPanel[getModuleFilterTypeId("category")].Selection, SelectionText: $scope.FilterPanel[getModuleFilterTypeId("category")].SelectionText });//category
            selectionObj.push({ Id: 3, Name: $scope.FilterPanel[getModuleFilterTypeId("time period")].Name, Selection: [], SelectionText: $scope.FilterPanel[getModuleFilterTypeId("time period")].SelectionText })//time period
            selectionObj.push({ Id: 4, Name: $scope.FilterPanel[getModuleFilterTypeId("brands")].Name, Selection: $scope.FilterPanel[getModuleFilterTypeId("brands")].Selection, SelectionText: $scope.FilterPanel[getModuleFilterTypeId("brands")].SelectionText });//brands
            selectionObj.push({ Id: 5, Name: $scope.FilterPanel[getModuleFilterTypeId("segments")].Name, Selection: $scope.FilterPanel[getModuleFilterTypeId("segments")].Selection, SelectionText: $scope.FilterPanel[getModuleFilterTypeId("segments")].SelectionText });//segments
            selectionObj.push({ Id: 6, Name: "kpi", Selection: [{ Id: 1, Name: "Absolute", DisplayName: "Absolute", Selection: [{ Id: 8, Name: "Penetration", DisplayName: "Absolute: Penetration", Selection: null }] }], SelectionText: "absolute: penetration" });//kpi
            selectionObj.push({ Id: 7, Name: $scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].Name, Selection: $scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].Selection, SelectionText: $scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].SelectionText });//channel
            angular.forEach(timeperiodData, function (obj) {
                var tempTimeperiodObj = _.cloneDeep($scope.FilterPanel[getModuleFilterTypeId("time period")].Selection[0]);
                tempTimeperiodObj.Selection[0].Id = obj.TimePeriodId;
                tempTimeperiodObj.Selection[0].Name = obj.TimePeriodName;
                tempTimeperiodObj.Selection[0].DisplayName = obj.TimePeriodName;
                selectionObj[3].Selection.push(tempTimeperiodObj);
            })
            return JSON.stringify(selectionObj);
        }

        let prepareDeepDiveSelectionObjectDemog = function (timeperiodData) {
            var selectionObj = [];
            var compareSelection = $scope.FilterPanel[getModuleFilterTypeId("snapshot type")];
            var demogId = $scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].Selection[0].Id;
            let marketSelectionName = getFilterSelectionValueOnKey(getModuleFilterTypeId("markets"), "Name")[0];
            let categorySelection = getFilterSelectionValueOnKey(getModuleFilterTypeId("category"), "Id")[0];

            let filteredDemog = level2Data[9].Data
            filteredDemog = _.remove(_.map(level2Data[9].Data, function (obj) { if (_.includes(obj[marketSelectionName], categorySelection)) return obj }), undefined);
            filteredDemog = formatTreeParent(filteredDemog);
            var demogSelectionObj = getAllChildSelectionObj(demogId, filteredDemog, "channel/retailer");
            selectionObj.push({ Id: 0, Name: "compare", "Selection": [{ Id: compareSelection.Selection[0].Id, Name: compareSelection.Selection[0].Name, Selection: null }], SelectionText: compareSelection.Selection[0].Name });//compare
            selectionObj.push({ Id: 1, Name: $scope.FilterPanel[getModuleFilterTypeId("markets")].Name, Selection: $scope.FilterPanel[getModuleFilterTypeId("markets")].Selection, SelectionText: $scope.FilterPanel[getModuleFilterTypeId("markets")].SelectionText });//markets
            selectionObj.push({ Id: 2, Name: $scope.FilterPanel[getModuleFilterTypeId("category")].Name, Selection: $scope.FilterPanel[getModuleFilterTypeId("category")].Selection, SelectionText: $scope.FilterPanel[getModuleFilterTypeId("category")].SelectionText });//category
            selectionObj.push({ Id: 3, Name: $scope.FilterPanel[getModuleFilterTypeId("time period")].Name, Selection: [], SelectionText: $scope.FilterPanel[getModuleFilterTypeId("time period")].SelectionText })//time period
            selectionObj.push({ Id: 4, Name: $scope.FilterPanel[getModuleFilterTypeId("brands")].Name, Selection: $scope.FilterPanel[getModuleFilterTypeId("brands")].Selection, SelectionText: $scope.FilterPanel[getModuleFilterTypeId("brands")].SelectionText });//brands
            selectionObj.push({ Id: 5, Name: $scope.FilterPanel[getModuleFilterTypeId("segments")].Name, Selection: $scope.FilterPanel[getModuleFilterTypeId("segments")].Selection, SelectionText: $scope.FilterPanel[getModuleFilterTypeId("segments")].SelectionText });//segments
            selectionObj.push({ Id: 6, Name: "kpi", Selection: [{ "Id": 1, "Name": "Absolute", "DisplayName": "Absolute", "Selection": [{ "Id": 14, "Name": "Value (000)", "DisplayName": "NULL", "Selection": [{ "Id": 15, "Name": "Euro", "DisplayName": "Absolute: Value (000 EUR)", "Selection": null }] }] }], SelectionText: "absolute: value (000 eur)" });//kpi

            selectionObj.push({ Id: 7, Name: $scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].Name, Selection: demogSelectionObj, SelectionText: $scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].SelectionText });//channel
            angular.forEach(timeperiodData, function (obj) {
                var tempTimeperiodObj = _.cloneDeep($scope.FilterPanel[getModuleFilterTypeId("time period")].Selection[0]);
                tempTimeperiodObj.Selection[0].Id = obj.TimePeriodId;
                tempTimeperiodObj.Selection[0].Name = obj.TimePeriodName;
                tempTimeperiodObj.Selection[0].DisplayName = obj.TimePeriodName;
                selectionObj[3].Selection.push(tempTimeperiodObj);
            })
            return JSON.stringify(selectionObj);
        }

        let prepareGrowthOpportunitySelectionObject = function () {
            var selectionObj = [];
            let BrandId = getFilterSelectionValueOnKey(getModuleFilterTypeId("brands"), "Id")[0];
            $scope.GrowthBrandSelectionObj = [];
            let filterPanelObj = $scope.FilterPanel[getModuleFilterTypeId('brands')];
            filterPanelObj.Data = SelectFilterBrandType('growthopportunity');
            getBrandSelectionObj(BrandId, filterPanelObj, "brands");
            selectionObj.push({ Id: 0, Name: $scope.FilterPanel[getModuleFilterTypeId("markets")].Name, Selection: $scope.FilterPanel[getModuleFilterTypeId("markets")].Selection, SelectionText: $scope.FilterPanel[getModuleFilterTypeId("markets")].SelectionText });//markets
            selectionObj.push({ Id: 1, Name: $scope.FilterPanel[getModuleFilterTypeId("category")].Name, Selection: $scope.FilterPanel[getModuleFilterTypeId("category")].Selection, SelectionText: $scope.FilterPanel[getModuleFilterTypeId("category")].SelectionText });//category
            selectionObj.push({ Id: 2, Name: $scope.FilterPanel[getModuleFilterTypeId("brands")].Name, Selection: $scope.GrowthBrandSelectionObj, SelectionText: $scope.FilterPanel[getModuleFilterTypeId("brands")].SelectionText });//brands
            return JSON.stringify(selectionObj);
        }

        let getBrandSelectionObj = function (BrandId, Data, Module) {
            var selObj = [];
            angular.forEach(Data.Data, function (obj) {
                obj.Parent = Data;
                if (obj.Id == BrandId) {
                    $scope.GrowthBrandSelectionObj.push($scope.GetSelectionObject(obj).Selection[0]);
                    return;
                }
                else {
                    getBrandSelectionObj(BrandId, obj, Module)
                }
            })
        }

        $scope.IsNavigateToGrowthOpportunity = function () {
            let marketSelectionId = getFilterSelectionValueOnKey(getModuleFilterTypeId("markets"), "Id")[0];
            let categorySelection = getFilterSelectionValueOnKey(getModuleFilterTypeId("category"), "Id")[0];
            let BrandSelection = getFilterSelectionValueOnKey(getModuleFilterTypeId("brands"), "Name")[0];
            let TimePeriodSelection = $scope.FilterPanel[getModuleFilterTypeId("time period")].SelectionText.split(' - ');
            let TimePeriodSelectionId = getFilterSelectionValueOnKey(getModuleFilterTypeId("time period"), "Id")[0];
            if (TimePeriodSelection[0].toLowerCase() == "mat" && getFilterSelectionValueOnKey(getModuleFilterTypeId("snapshot type"), "DisplayName")[0].toLocaleLowerCase() == "brands-single") {
                let MATTimePeriod = _.remove(_.map(SelectTimePeriodType(), function (obj) { if (obj.Name.toLocaleLowerCase() == 'mat') return obj; }), undefined);
                if (MATTimePeriod != null && MATTimePeriod.length > 0 && MATTimePeriod[0].Data[MATTimePeriod[0].Data.length - 1].Id == TimePeriodSelectionId) {
                    if (FilterResponseData.Data != null && FilterResponseData.Data[1].Data[11].Data != null) {
                        let CompleteData = _.remove(_.map(FilterResponseData.Data[1].Data[11].Data, function (obj) { if (categorySelection == obj.CategoryId && obj.CountryId == marketSelectionId && obj.IsSelectable == 1 && BrandSelection == obj.Name) return obj.Name; }), undefined);
                        if (CompleteData.length > 0) return true;
                    }
                }
            }
            return false;
        }

        let getAllChildSelectionObj = function (parentId, data, Module) {
            var selObj = [];
            data[0].Parent = $scope.FilterPanel[getModuleFilterTypeId(Module)];
            var parentData = _.remove(_.map(data[0].Data, function (obj) { if (obj.Id == parentId) { obj.Parent = data[0]; return obj } }), undefined)[0];
            $scope.tempChildList = [];
            FindChildObjectDemog(parentData);
            return _.remove($scope.tempChildList, undefined);
        }

        let FindChildObjectDemog = function (data) {
            angular.forEach(data.Data, function (obj) {
                obj.Parent = data;
                if (obj.IsLeaf) {
                    $scope.tempChildList.push($scope.GetSelectionObject(obj).Selection[0]);
                }
                else {
                    if (!isLeaveNode(obj)) {
                        FindChildObjectDemog(obj);
                    }
                }
            });
        }

        $scope.ShowHideCategoryFooter = function () {
            return $scope.FilterPanel[getModuleFilterTypeId("category")].IsOpen && !isFIlterSelected("compare", "top/worst performing brands");
        }

        $scope.ShowHideCompareFooter = function () {
            return getModuleFilterTypeId("compare") > -1 && $scope.FilterPanel[getModuleFilterTypeId("compare")].IsOpen && isFIlterSelected("compare", "top/worst performing brands");
        }

        $scope.ShowHideFilterPanelFooter = function () {
            var flag = false;
            let FilterPanelFooterText = "";
            if (getModuleFilterTypeId("compare") > -1 && $scope.FilterPanel[getModuleFilterTypeId("compare")].IsOpen && isFIlterSelected("compare", "top/worst performing brands")) {
                FilterPanelFooterText = "Top 15 Brand with the highest change in Buyers compared to year ago will be displayed. Category & Manufacturers cuts not included while identifying the Top/Worst Performing Brands.";
                flag = true;
            }
            else if ($scope.ModuleName.toLowerCase() != "crosstab" && $scope.FilterPanel[getModuleFilterTypeId("category")].IsOpen && !isFIlterSelected("compare", "top/worst performing brands")) {
                FilterPanelFooterText = "* Categories displayed are based on the Market selection, if multiple Markets selected then only common categories across the Markets displayed.";
                flag = true;
            }
            else if (getModuleFilterTypeId("segments") > -1 && $scope.FilterPanel[getModuleFilterTypeId("segments")].IsOpen) {
                FilterPanelFooterText = "";
                if (_.includes(getFilterSelectionName(getModuleFilterTypeId("markets")), 'France') && !isChannelOrDemogSelectedAsCompare()) {
                    FilterPanelFooterText = "* In France, Segment 2 is only available at Total level.";
                }
                if ($scope.ModuleName == 'CROSSTAB' && $scope.FilterPanel[getModuleFilterTypeId("segments")].IsOpen && $scope.FilterPanel[getModuleFilterTypeId("segments")].IsMulti) {
                    if (FilterPanelFooterText.length > 0) FilterPanelFooterText += "<br/>";
                    FilterPanelFooterText += "* Segment 2 is an optional selection. By default, Total level will be selected";
                }
                if ($scope.ModuleName == 'CROSSTAB' && $scope.FilterPanel[getModuleFilterTypeId("segments")].IsOpen && !$scope.FilterPanel[getModuleFilterTypeId("segments")].IsMulti) {
                    if (FilterPanelFooterText.length > 0) FilterPanelFooterText += "<br/>";
                    FilterPanelFooterText += "* Segment 1 and Segment 2 are optional selection. By default, Total level will be selected";
                }
                if (FilterPanelFooterText.length > 0) FilterPanelFooterText += "<br/>"
                FilterPanelFooterText += "* Segments divided into two cuts, allowing users to cross segment 1 with segment 2 to view data at a more granular level.";
                flag = true;
            }
            else if ($scope.ModuleName == 'GROWTHOPPORTUNITY' && getModuleFilterTypeId("brands") > -1 && $scope.FilterPanel[getModuleFilterTypeId("brands")].IsOpen) {
                FilterPanelFooterText = "* Brands available here are a sub-set of total brand list for the Market-Category. Brands with sufficient competitors to undertake the calculations have been included.";
                flag = true;
            }
            if ($scope.ModuleName != 'GROWTHOPPORTUNITY' && !$scope.IsChannelToggle && $scope.FilterPanel[getModuleFilterTypeId("demographics")].IsOpen && $scope.FilterPanel[getModuleFilterTypeId("demographics")].IsMulti && $scope.IsChildSelectionAllowed) {
                if (FilterPanelFooterText.length > 0) FilterPanelFooterText += "<br/>"
                FilterPanelFooterText += "* On selecting the parent cut, all child elements will be included however on de-selecting the parent cut, the child elements will still remain selected.";
                flag = true;
            }
            if ($scope.ModuleName == 'CROSSTAB') {
                if ($scope.FilterPanel[getModuleFilterTypeId("brands")].IsOpen && !$scope.FilterPanel[getModuleFilterTypeId("brands")].IsMulti) {
                    if (FilterPanelFooterText.length > 0) FilterPanelFooterText += "<br/>"
                    FilterPanelFooterText += "* This is an optional selection. By default, Total level will be selected";
                    flag = true;
                }
                else if ($scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].IsOpen && !$scope.FilterPanel[getModuleFilterTypeId("channel/retailer")].IsMulti) {
                    if (FilterPanelFooterText.length > 0) FilterPanelFooterText += "<br/>"
                    FilterPanelFooterText += "* This is an optional selection. By default, Total level will be selected";
                    flag = true;
                }
                else if ($scope.FilterPanel[getModuleFilterTypeId("demographics")].IsOpen && !$scope.FilterPanel[getModuleFilterTypeId("demographics")].IsMulti) {
                    if (FilterPanelFooterText.length > 0) FilterPanelFooterText += "<br/>"
                    FilterPanelFooterText += "* This is an optional selection. By default, Total level will be selected";
                    flag = true;
                }
              

            }
            $scope.FilterPanelFooterText = $sce.trustAsHtml(FilterPanelFooterText);
            return flag;
        }

        $scope.ShowHideFilterPanelChildSelect = function () {
            let flag = false;
            if (!$scope.IsChannelToggle && getModuleFilterTypeId("demographics") > -1 && $scope.FilterPanel[getModuleFilterTypeId("demographics")].IsOpen && $scope.FilterPanel[getModuleFilterTypeId("demographics")].IsMulti) {
                flag = true;
            }
            return flag;
        }

        $scope.ShowSelectAllFilterPanel = function (OnlyUnder) {
            let flag = false;
            if (getModuleFilterTypeId("KPI") > -1 && $scope.FilterPanel[getModuleFilterTypeId("KPI")].IsOpen && $scope.FilterPanel[getModuleFilterTypeId("KPI")].IsMulti && OnlyUnder != null) {
                if (_.includes(["absolute", "yr on yr %", "yr on yr diff"], OnlyUnder.toLowerCase())) flag = true;
            }
            return flag;
        }

        let SelectUnSelectAllChildElements = function (item, IsSelect) {
            angular.forEach(item.Data, function (obj) {
                if (!$scope.HideItemData(obj) && obj.IsSelectable && IsSelect && obj.IsSelected != false)
                    $scope.SelectSubFilterData(obj);
                else if (!$scope.HideItemData(obj) && obj.IsSelectable && !IsSelect && obj.IsSelected != true)
                    $scope.SelectSubFilterData(obj);
                if (!isLeaveNode(obj)) {
                    SelectUnSelectAllChildElements(obj, IsSelect);
                }
            });
        }

        $scope.SelectAllClick = function (item) {
            if ($scope.AllActiveChildSelected(item)) {
                SelectUnSelectAllChildElements(item, true);
            }
            else {
                SelectUnSelectAllChildElements(item, false);
            }
            //temprory only for KPI
            ApplyTopToBottom($scope.FilterPanel[getModuleFilterTypeId("KPI")]);
        }

        let checkAllActiveChildSelected = function (item) {
            let flag = true;
            //temprory only for KPI
            angular.forEach(item.Data, function (obj) {
                if (!$scope.HideItemData(obj) && obj.IsSelectable && obj.IsSelected != true) {
                    flag = false;
                }
                if (!isLeaveNode(obj)) {
                    flag = flag && checkAllActiveChildSelected(obj);
                }
            });
            return flag;
        }

        $scope.AllActiveChildSelected = function (item) {
            let allSelected = true;
            if (item != null) {
                ApplyTopToBottom($scope.FilterPanel[getModuleFilterTypeId("KPI")]);
                allSelected = checkAllActiveChildSelected(item);
            }
            return allSelected;
        }

        $scope.MakeSelection = function (Selection, SelectionParameters, Module) {
            var ModuleIndex = _.findIndex(ModuleSelection, function (obj) { return obj.Name == Module });
            if (ModuleIndex >= 0) {
                var tempModuleSelection = JSON.parse(Selection);

                if (Module == "crosstab") {
                    if (tempModuleSelection[getModuleFilterTypeId("row")].SelectionText.toLowerCase() != "time period" &&
                        tempModuleSelection[getModuleFilterTypeId("column")].SelectionText.toLowerCase() != "time period") {
                        var moduleSelectionParams = JSON.parse(SelectionParameters);
                        if (!(moduleSelectionParams.TimePeriodId == "-1001" || moduleSelectionParams.TimePeriodId == "-1002" || moduleSelectionParams.TimePeriodId == "-1003" || moduleSelectionParams.TimePeriodId == "-1004")) {
                            let timePeriodData = getTimePeriodData(moduleSelectionParams.MarketId.split('|'), moduleSelectionParams.MarketName.split('|'), moduleSelectionParams.CategoryId.split('|'), moduleSelectionParams.isTrend);
                            if (moduleSelectionParams.MarketId.split('|').length > 1 || moduleSelectionParams.CategoryId.split('|') > 1) timePeriodData = getTimePeriodData(moduleSelectionParams.MarketId.split('|'), moduleSelectionParams.MarketName.split('|'), moduleSelectionParams.CategoryId.split('|'), true);
                            timePeriodData = _.map(timePeriodData, function (obj) {
                                if (obj.Name.toLowerCase() == moduleSelectionParams.TimePeriodName.split('-')[0].trim().toLowerCase())
                                    return obj;
                            });
                            timePeriodData = _.remove(timePeriodData, undefined);

                            let timeperiodTabId = getModuleFilterTypeId("time period");
                            let tempTimeperiodData = timePeriodData[0].Data[timePeriodData[0].Data.length - 1];
                            tempModuleSelection[timeperiodTabId].Selection[0].Selection[0].Id = tempTimeperiodData.Id;
                            tempModuleSelection[timeperiodTabId].Selection[0].Selection[0].Name = tempTimeperiodData.Name;
                            tempModuleSelection[timeperiodTabId].Selection[0].Selection[0].DisplayName = tempTimeperiodData.DisplayName;
                            Selection = JSON.stringify(tempModuleSelection);
                        }
                    }
                }
                ModuleSelection[ModuleIndex].Selection = Selection;
                $scope.FillFilterPanal();
            }
        }

        $scope.updateSelectionsFromStoryBoard = function () {
            var slideDetails = topMenuScope.SlideDetails[0]
            var AddtionalInfo = slideDetails.AddtionalInfo;
            var SelectionJSON = slideDetails.SelectionJSON;
            AddtionalInfo = JSON.parse(AddtionalInfo);
            SelectionJSON = JSON.parse(SelectionJSON);
            var moduleSelectionParams = AddtionalInfo.SlideParameters;

            var timePeriodData = getTimePeriodData(moduleSelectionParams.MarketId.split('|'), moduleSelectionParams.MarketName.split('|'), moduleSelectionParams.CategoryId.split('|'), moduleSelectionParams.isTrend);
            timePeriodData = _.map(timePeriodData, function (obj) {
                if (obj.Name.toLowerCase() == moduleSelectionParams.TimePeriodName.split('-')[0].trim().toLowerCase())
                    return obj;
            });
            timePeriodData = _.remove(timePeriodData, undefined);

            var timePeriodIds = moduleSelectionParams.TimePeriodId.toString().split('|');
            if (!_.includes(["-1001", "-1002", "-1003", "-1004"], (timePeriodIds[0]).toString())) {
                var timeperiodTabId = getModuleFilterTypeId("time period");
                angular.forEach(timePeriodIds, function (obj, index) {
                    var tempTimeperiodData = timePeriodData[0].Data[timePeriodData[0].Data.length - index - 1];
                    SelectionJSON[timeperiodTabId].Selection[timePeriodIds.length - index - 1].Selection[0].Id = tempTimeperiodData.Id;
                    SelectionJSON[timeperiodTabId].Selection[timePeriodIds.length - index - 1].Selection[0].Name = tempTimeperiodData.Name;
                    SelectionJSON[timeperiodTabId].Selection[timePeriodIds.length - index - 1].Selection[0].DisplayName = tempTimeperiodData.DisplayName;
                    if (index == 0) {
                        moduleSelectionParams.TimePeriodId = tempTimeperiodData.Id;
                    }
                    else {
                        moduleSelectionParams.TimePeriodId = tempTimeperiodData.Id + "|" + moduleSelectionParams.TimePeriodId
                    }
                });
                if (timePeriodIds.length == 1) {
                    moduleSelectionParams.TimePeriodName = timePeriodData[0].Name + " - " + timePeriodData[0].Data[timePeriodData[0].Data.length - 1].DisplayName
                }
                else if (timePeriodIds.length > 1) {
                    moduleSelectionParams.TimePeriodName = timePeriodData[0].Name + " - " + timePeriodData[0].Data[timePeriodData[0].Data.length - timePeriodIds.length].DisplayName + "-" + timePeriodData[0].Data[timePeriodData[0].Data.length - 1].DisplayName;
                }
                SelectionJSON[timeperiodTabId].SelectionText = moduleSelectionParams.TimePeriodName;
            }
            $scope.getOutput(moduleSelectionParams);
            AddtionalInfo.SlideParameters = moduleSelectionParams;
            topMenuScope.SlideDetails[0].AddtionalInfo = AddtionalInfo;
            topMenuScope.SlideDetails[0].SelectionJSON = SelectionJSON;
        }

        $scope.ApplyModuleCustomizationStoryBoard = function () {
            var slideDetails = topMenuScope.SlideDetails[0];
            var container = "";
            if (slideDetails.ModuleId == 1) {
                container = slideDetails.AddtionalInfo.popupId == -1 ? ".ss-row-body" : ".ss-widget-popup";//.ss-popup-body     
            }
            else if (slideDetails.ModuleId == 2) {
                container = "#chart_container";
            }

            layoutScope.takeScreenshot(angular.element(container), $scope.updateSlideImageAndSelectionsInDB, slideDetails)
        }

        $scope.updateSlideImageAndSelectionsInDB = function (params) {
            layoutScope.alert.show = false;
            topMenuScope.SlideDetails[0].AddtionalInfo = JSON.stringify(topMenuScope.SlideDetails[0].AddtionalInfo);
            topMenuScope.SlideDetails[0].SelectionJSON = JSON.stringify(topMenuScope.SlideDetails[0].SelectionJSON);
            $scope.StoryBoardSlides.push(topMenuScope.SlideDetails[0]);
            topMenuScope.SlideDetails = _.slice(topMenuScope.SlideDetails, 1);
            if (topMenuScope.SlideDetails.length > 0) {
                var module = _.find(topMenuScope.modules, function (obj) { return topMenuScope.SlideDetails[0].ModuleId == obj.ID });
                if (module.isActive) {
                    $scope.updateSelectionsFromStoryBoard();
                }
                else {
                    layoutScope.clickModule(module, $scope.modules);
                }
            }
            else {
                topMenuScope.UpdateSlide(false, [], topMenuScope.StoryBoardModules, topMenuScope.StoryBoardSlectedModule, topMenuScope.selectedStoryId);
                AjaxService.AjaxPost($scope.StoryBoardSlides, apiUrl + "/StoryBoard/UpdateSlides", function (respose) {
                    if (!topMenuScope.isLtdSlidesUpdate) {
                        if (respose.data)
                            layoutScope.customAlert("Story updated successfully", "Alert");
                        else
                            layoutScope.customAlert("Error in updating Story", "Alert");
                    }
                    $scope.StoryBoardSlides = [];
                    var module = _.find(topMenuScope.modules, function (obj) { return obj.ID == 6 });
                    layoutScope.clickModule(module, $scope.modules);
                }, function (response) { layoutScope.customAlertStoryBoard("Error in updating Story", "Alert"); });
                
            }
        }

        let getTimePeriodData = function (marketSelectionIdList, marketSelectionNameList, categorySelection, IsTrend) {
            marketSelectionIdList = _.map(marketSelectionIdList, function (obj) { return parseInt(obj) });
            categorySelection = _.map(categorySelection, function (obj) { return parseInt(obj) });
            let compareArray = [];
            let compareArray2 = [];
            for (let i = 0; i < marketSelectionNameList.length; i++) {
                if (!IsTrend) {
                    if (i == 0) {
                        _.map(level2Data[4].Data, function (element) {
                            if (_.difference(categorySelection, element[$scope.removeWhiteSpace(marketSelectionNameList[i])]).length == 0) {
                                compareArray.push(element);
                            }
                        });
                    }
                    else {
                        compareArray2 = [];
                        _.map(level2Data[4].Data, function (element) {
                            if (_.difference(categorySelection, element[$scope.removeWhiteSpace(marketSelectionNameList[i])]).length == 0) {
                                compareArray2.push(element);
                            }
                        });
                        compareArray = _.intersectionWith(compareArray, compareArray2, function (x, y) { return x.Id == y.Id });
                    }
                }
                else if (IsTrend) {
                    if (i == 0) {
                        _.map(level2Data[4].Data, function (element) {
                            angular.forEach(categorySelection, function (obj, index) {
                                if (_.difference([categorySelection[index]], element[$scope.removeWhiteSpace(marketSelectionNameList[i])]).length == 0) {
                                    compareArray.push(element);
                                }
                            });
                        });
                    }
                    else {
                        compareArray2 = [];
                        _.map(level2Data[4].Data, function (element) {
                            angular.forEach(categorySelection, function (obj, index) {
                                if (_.difference([categorySelection[index]], element[$scope.removeWhiteSpace(marketSelectionNameList[i])]).length == 0) {
                                    compareArray2.push(element);
                                }
                            });
                        });
                        //_.remove(compareArray, function (obj) { if (obj.Id == obj.ParentId) { return obj } });
                        compareArray = _.unionWith(compareArray, compareArray2, function (x, y) { return x.Id == y.Id });
                    }
                }
            }
            compareArray = compareArray.sort(function (a, b) { return a.SortID - b.SortID });
            compareArray = _.uniqWith(compareArray, _.isEqual);
            compareArray = _.remove(_.map(formatTreeParent(compareArray), function (element) { if (element.Data.length > 0) return element }), undefined);
            return compareArray;
        }

        $scope.downloadBrandHierarchy = function (item) {
            var brandData = {};
            if ($scope.BrandHierarchyText() == 'Brand Hierarchy') {
                for (var i = 0; i < $scope.FilterPanel[item.Id].Dependent.length; i++) {
                    if (!($scope.FilterPanel[$scope.FilterPanel[item.Id].Dependent[i]].Selection.length > 0)) {
                        layoutScope.customAlert("Please make the selection in " + $scope.FilterPanel[$scope.FilterPanel[item.Id].Dependent[i]].Name + " Tab.", "Alert");
                        return;
                    }
                }
                if ($scope.FilterPanel[getModuleFilterTypeId("markets")].Selection.length > 1) {
                    layoutScope.customAlert("Please make only one selection in Market tab.", "Alert");
                    return;
                }
                if ($scope.FilterPanel[getModuleFilterTypeId("category")].Selection.length > 1) {
                    layoutScope.customAlert("Please make only one selection in Category tab.", "Alert");
                    return;
                }
                layoutScope.setLoader(true);
                AjaxService.AjaxPost(getBrandsAndLevles(), apiUrl + '/FilterPanel/BrandHierarchyExcel', layoutScope.DownloadFile, layoutScope.ErrorDownloading);
            }
            else if ($scope.BrandHierarchyText() == 'Available Brands') {
                layoutScope.setLoader(true);
                AjaxService.AjaxPost(false, apiUrl + '/FilterPanel/AvailableBrandSegmentData', layoutScope.DownloadFile, layoutScope.ErrorDownloading);
            }
            else if ($scope.BrandHierarchyText() == 'Available Brands & Segments') {
                layoutScope.setLoader(true);
                AjaxService.AjaxPost(true, apiUrl + '/FilterPanel/AvailableBrandSegmentData', layoutScope.DownloadFile, layoutScope.ErrorDownloading);
            }
        }

        let getBrandsAndLevles = function () {
            var brandLevelData = {};
            let Data = [];

            let marketSelectionIdList = getFilterSelectionValueOnKey(getModuleFilterTypeId("markets"), "Id");
            let marketSelectionNameList = getFilterSelectionValueOnKey(getModuleFilterTypeId("markets"), "Name");
            let categorySelection = getFilterSelectionValueOnKey(getModuleFilterTypeId("category"), "Id");
            let data = _.map(level2Data[5].Data, function (obj) {
                if (obj.CategoryId == categorySelection[0]) {
                    return obj;
                }
            });
            if ($scope.ModuleName == 'GROWTHOPPORTUNITY') {
                data = _.map(level2Data[11].Data, function (obj) {
                    if (obj.CategoryId == categorySelection[0]) {
                        return obj;
                    }
                });
            }
            data = _.remove(data, undefined);
            let compareArray = [];
            let compareArray2 = [];
            for (let i = 0; i < marketSelectionIdList.length; i++) {
                if (i == 0) {
                    _.map(data, function (element) {
                        if (marketSelectionIdList[i] == element.CountryId) {
                            element.BrandMappings = [];
                            element.BrandMappings.push({ CountryId: element.CountryId, CategoryId: element.CategoryId, BrandId: element.Id, BrandName: element.Name });
                            compareArray.push(element);
                        }
                    });
                }
                else {
                    compareArray2 = [];
                    _.map(data, function (element) {
                        if (marketSelectionIdList[i] == element.CountryId) {
                            compareArray2.push(element);
                        }
                    });
                    compareArray = _.intersectionWith(compareArray, compareArray2, function (x, y) {
                        if (x.Name == y.Name) {
                            x.BrandMappings.push({ CountryId: y.CountryId, CategoryId: y.CategoryId, BrandId: y.Id, BrandName: y.Name });
                        }
                        return x.Name == y.Name
                    });
                }
            }

            angular.forEach(compareArray, function (element) {
                if (element.Id == element.ParentId) {
                    Data.push({ "BrandName": element.Name, "LevelId": 1 })
                    if (element.IsLastLevel == 0) {
                        Data.push(getBrandsAndLevlesChild(compareArray, element.Id, 2));
                    }
                }
            });

            brandLevelData.MarketName = marketSelectionNameList[0];
            brandLevelData.CategoryName = getFilterSelectionValueOnKey(getModuleFilterTypeId("category"), "Name")[0];
            brandLevelData.Data = _.flatten(Data);
            return brandLevelData;
        }

        let getBrandsAndLevlesChild = function (List, parentid, LevelId) {
            let Data = [];
            angular.forEach(List, function (element) {
                if (element.Id != element.ParentId && element.ParentId == parentid) {

                    Data.push({ "BrandName": element.Name, "LevelId": LevelId })
                    if (element.IsLastLevel == 0) {
                        Data.push(getBrandsAndLevlesChild(List, element.Id, LevelId + 1));
                    }
                }
            });
            return _.flatten(Data);
        }

        $scope.AvialableTimePeriodData = function (item) {
            layoutScope.setLoader(true);
            AjaxService.AjaxPost(_.result(_.find(topMenuScope.modules, function (obj) { return obj.isActive == true; }), 'ID'), apiUrl + '/FilterPanel/AvailableTimePeriodData', layoutScope.DownloadFile, layoutScope.ErrorDownloading);
        }

        $scope.ShowOrHideLTD = function (obj) {
            var flag = true;
            if (obj.Name.toLowerCase() == 'latest time period available') {
                if ($scope.FilterPanel[getModuleFilterTypeId("time period")].IsMulti) {
                    flag = false;
                }
                else if ($scope.FilterPanel[getModuleFilterTypeId("markets")].IsMulti || $scope.FilterPanel[getModuleFilterTypeId("category")].IsMulti) {
                    flag = true;
                }
                else {
                    flag = false;
                }
            }
            return flag;
        }
    }]);
    app.register.directive('onSizeChanged', ['$window', function ($window) {
        return {
            restrict: 'A',
            scope: {
                onSizeChanged: '&'
            },
            link: function (scope, $element, attr) {
                var element = $element[0];

                cacheElementSize(scope, element);
                $window.addEventListener('resize', onWindowResize);

                function cacheElementSize(scope, element) {
                    scope.cachedElementWidth = element.offsetWidth;
                    scope.cachedElementHeight = element.offsetHeight;
                }

                function onWindowResize() {
                    var isSizeChanged = scope.cachedElementWidth != element.offsetWidth || scope.cachedElementHeight != element.offsetHeight;
                    if (isSizeChanged) {
                        var expression = scope.onSizeChanged();
                        expression();
                    }
                };
            }
        }
    }]);



    var getTemplateType1FilterLevel = function (id) {
        let calculateNextLevelClass = function (times) {
            let array = [];
            for (let i = 0; i < times; i++) {
                let text = "'L'+";
                for (let j = 0; j < times - i; j++) {
                    text += "$parent.";
                }
                array.push(text + "$index");
            }
            return array.join("+");
        }
        let NextClass = calculateNextLevelClass(id);
        let item = "item";
        let currentItem = item + id;
        let NextFilterLevelId = "subfilterleveli" + (id + 1);
        let itemlist = ["item", "item1", "item2", "item3", "item4", "item5", "item6", "item7", "item8", "item9"];
        let PreviousItem = itemlist[itemlist.indexOf(currentItem) - 1];
        let NextItem = (itemlist.indexOf(currentItem) + 1) > itemlist.length ? null : itemlist[itemlist.indexOf(currentItem) + 1];
        let template = "<div ng-if='ShowSelectAllFilterPanel(" + PreviousItem + ".Name)' class='list_item' style='width:82%;' ng-click='$event.stopPropagation();'><div class='list_item_content'><div ng-click='SelectAllClick(" + PreviousItem + ")' ng-class=\"{'MultiRadioUnSelected':!AllActiveChildSelected(" + PreviousItem + ") ,'MultiRadioSelected':AllActiveChildSelected(" + PreviousItem + ") }\" ng-attr-title='Select All'></div>\
                    <span style='padding-left:0.5%' ng-style=\"{color:AllActiveChildSelected("+ PreviousItem + ")?'#E18719':'#404041'}\" ng-attr-title='Select All'>Select All</span></div></div><div ng-repeat='" + currentItem + " in " + PreviousItem + ".Data' class='list_item' ng-show='" + PreviousItem + ".IsOpen  && !HideItemData(" + currentItem + ")'><div class='list_item_content'>\
                    <div ng-click='SelectSubFilterData(" + currentItem + ")' ng-show='" + currentItem + ".IsSelectable' ng-class=\"{'MultiRadioUnSelected':" + item + ".IsMulti && !" + currentItem + ".IsSelected ,'MultiRadioSelected':" + item + ".IsMulti  && " + currentItem + ".IsSelected ,'SingleRadioUnSelected':(!" + item + ".IsMulti|| item1.Name.toLowerCase() =='segment 2') && !" + currentItem + ".IsSelected ,'SingleRadioSelected':(!" + item + ".IsMulti|| item1.Name.toLowerCase() =='segment 2') && " + currentItem + ".IsSelected }\" ng-attr-title='{{" + currentItem + ".Name.toUpperCase()}}'></div>\
                    <span ng-click='SubFilterClick(" + currentItem + ",$parent." + PreviousItem + ".Data,$index)' ng-style=\"{color:" + currentItem + ".IsChildSelected||" + currentItem + ".IsSelected?'#E18719':'#404041'}\" ng-attr-title=\"{{(" + item + ".Name.toLowerCase()=='snapshot type')?SingleMultiToolTip(" + PreviousItem + ".Name," + currentItem + ".Name):" + currentItem + ".Name.toUpperCase()}}\">{{TrimString(" + currentItem + ".Name)}} </span>\
                    <div ng-click='SubFilterClick("+ currentItem + ",$parent." + PreviousItem + ".Data,$index)' ng-show='!IsLeaf(" + currentItem + ")' ng-class=\"{'ArrowRight':!" + currentItem + ".IsOpen,'ArrowDown':" + currentItem + ".IsOpen}\"></div></div>";
        template += ((NextItem == null) ? "</div>" : "<" + NextFilterLevelId + " class='content2' ng-class=\"" + NextClass + "+'L'+$index\" ng-show='" + currentItem + ".IsOpen' ng-style=\"{'top':getHeight(" + NextClass + ")}\"></" + NextFilterLevelId + "></div>");
        return template;
    }

    var getTemplateType2FilterLevel = function (id, BrandTabId) {
        let calculateNextLevelClass = function (times) {
            let array = [];
            for (let i = 0; i < times; i++) {
                let text = "'L'+";
                for (let j = 0; j < times - i; j++) {
                    text += "$parent.";
                }
                array.push(text + "$index");
            }
            return array.join("+");
        }
        let NextClass = calculateNextLevelClass(id);
        let item = "item";
        let currentItem = item + id;
        let NextFilterLevelId = "subbrand" + BrandTabId + "filterleveli" + (id + 1);
        let itemlist = ["item", "item1", "item2", "item3", "item4", "item5", "item6", "item7", "item8", "item9"];
        let PreviousItem = itemlist[itemlist.indexOf(currentItem) - 1];
        let NextItem = (itemlist.indexOf(currentItem) + 1) > itemlist.length ? null : itemlist[itemlist.indexOf(currentItem) + 1];
        let template = "<div ng-if='ShowSelectAllFilterPanel(" + PreviousItem + ".Name)' class='list_item' style='width:82%;' ng-click='$event.stopPropagation();'><div class='list_item_content'><div ng-click='SelectAllClick(" + PreviousItem + ")' ng-class=\"{'MultiRadioUnSelected':!AllActiveChildSelected(" + PreviousItem + ") ,'MultiRadioSelected':AllActiveChildSelected(" + PreviousItem + ") }\" ng-attr-title='Select All'></div>\
                    <span style='padding-left:0.5%' ng-style=\"{color:AllActiveChildSelected("+ PreviousItem + ")?'#E18719':'#404041'}\" ng-attr-title='Select All'>Select All</span></div></div><div ng-repeat='" + currentItem + " in " + PreviousItem + ".Data' class='list_item' ng-show='" + PreviousItem + ".IsOpen  && !HideItemData(" + currentItem + ")'><div class='list_item_content'>\
                    <div ng-click='SelectSubFilterData(" + currentItem + ")' ng-show='" + currentItem + ".IsSelectable' ng-class=\"{'MultiRadioUnSelected':" + item + ".IsMulti && !" + currentItem + ".IsSelected ,'MultiRadioSelected':" + item + ".IsMulti  && " + currentItem + ".IsSelected ,'SingleRadioUnSelected':(!" + item + ".IsMulti|| item1.Name.toLowerCase() =='segment 2') && !" + currentItem + ".IsSelected ,'SingleRadioSelected':(!" + item + ".IsMulti|| item1.Name.toLowerCase() =='segment 2') && " + currentItem + ".IsSelected }\" ng-attr-title='{{" + currentItem + ".Name.toUpperCase()}}'></div>\
                    <span ng-click='SubBrandFilterClick(" + currentItem + ",$parent." + PreviousItem + ".Data,$index)' ng-style=\"{color:" + currentItem + ".IsChildSelected||" + currentItem + ".IsSelected?'#E18719':'#404041'}\" ng-attr-title=\"{{(" + item + ".Name.toLowerCase()=='snapshot type')?SingleMultiToolTip(" + PreviousItem + ".Name," + currentItem + ".Name):" + currentItem + ".Name.toUpperCase()}}\">{{TrimString(" + currentItem + ".Name)}} </span>\
                    <div ng-click='SubBrandFilterClick(" + currentItem + ",$parent." + PreviousItem + ".Data,$index)' ng-show='!IsLeaf(" + currentItem + ")' ng-class=\"{'ArrowRight':!" + currentItem + ".IsOpen,'ArrowDown':" + currentItem + ".IsOpen}\"></div></div>";
        template += ((NextItem == null) ? "</div>" : "<" + NextFilterLevelId + " class='content2' ng-class=\"" + NextClass + "+'L'+$index\" ng-show='" + currentItem + ".IsOpen && (!IsLeaf(" + currentItem + ") && " + currentItem + ".Data[0].brandTabId==" + BrandTabId + ")' ng-style=\"{'top':getHeight(" + NextClass + ")}\"></" + NextFilterLevelId + "></div>");
        return template;
    }

    app.register.directive("subfilterleveli2", function () {
        return {
            template: getTemplateType1FilterLevel(2)
        };
    });

    app.register.directive("subfilterleveli3", function () {
        return {
            template: getTemplateType1FilterLevel(3)
        };
    });

    app.register.directive("subfilterleveli4", function () {
        return {
            template: getTemplateType1FilterLevel(4)
        };
    });

    app.register.directive("subfilterleveli5", function () {
        return {
            template: getTemplateType1FilterLevel(5)
        };
    });

    app.register.directive("subfilterleveli6", function () {
        return {
            template: getTemplateType1FilterLevel(6)
        };
    });

    app.register.directive("subfilterleveli7", function () {
        return {
            template: getTemplateType1FilterLevel(7)
        };
    });

    app.register.directive("subfilterleveli8", function () {
        return {
            template: getTemplateType1FilterLevel(8)
        };
    });

    app.register.directive("subfilterleveli9", function () {
        return {
            template: getTemplateType1FilterLevel(9)
        };
    });

    app.register.directive("subbrand1filterleveli2", function () {
        return {
            template: getTemplateType2FilterLevel(2, 1)
        };
    });

    app.register.directive("subbrand1filterleveli3", function () {
        return {
            template: getTemplateType2FilterLevel(3, 1)
        };
    });

    app.register.directive("subbrand1filterleveli4", function () {
        return {
            template: getTemplateType2FilterLevel(4, 1)
        };
    });

    app.register.directive("subbrand1filterleveli5", function () {
        return {
            template: getTemplateType2FilterLevel(5, 1)
        };
    });

    app.register.directive("subbrand1filterleveli6", function () {
        return {
            template: getTemplateType2FilterLevel(6, 1)
        };
    });

    app.register.directive("subbrand1filterleveli7", function () {
        return {
            template: getTemplateType2FilterLevel(7, 1)
        };
    });

    app.register.directive("subbrand1filterleveli8", function () {
        return {
            template: getTemplateType2FilterLevel(8, 1)
        };
    });

    app.register.directive("subbrand1filterleveli9", function () {
        return {
            template: getTemplateType2FilterLevel(9, 1)
        };
    });


    app.register.directive("subbrand2filterleveli2", function () {
        return {
            template: getTemplateType2FilterLevel(2, 2)
        };
    });

    app.register.directive("subbrand2filterleveli3", function () {
        return {
            template: getTemplateType2FilterLevel(3, 2)
        };
    });

    app.register.directive("subbrand2filterleveli4", function () {
        return {
            template: getTemplateType2FilterLevel(4, 2)
        };
    });

    app.register.directive("subbrand2filterleveli5", function () {
        return {
            template: getTemplateType2FilterLevel(5, 2)
        };
    });

    app.register.directive("subbrand2filterleveli6", function () {
        return {
            template: getTemplateType2FilterLevel(6, 2)
        };
    });

    app.register.directive("subbrand2filterleveli7", function () {
        return {
            template: getTemplateType2FilterLevel(7, 2)
        };
    });

    app.register.directive("subbrand2filterleveli8", function () {
        return {
            template: getTemplateType2FilterLevel(8, 2)
        };
    });

    app.register.directive("subbrand2filterleveli9", function () {
        return {
            template: getTemplateType2FilterLevel(9, 2)
        };
    });

    app.register.directive("subbrand3filterleveli2", function () {
        return {
            template: getTemplateType2FilterLevel(2, 3)
        };
    });

    app.register.directive("subbrand3filterleveli3", function () {
        return {
            template: getTemplateType2FilterLevel(3, 3)
        };
    });

    app.register.directive("subbrand3filterleveli4", function () {
        return {
            template: getTemplateType2FilterLevel(4, 3)
        };
    });

    app.register.directive("subbrand3filterleveli5", function () {
        return {
            template: getTemplateType2FilterLevel(5, 3)
        };
    });

    app.register.directive("subbrand3filterleveli6", function () {
        return {
            template: getTemplateType2FilterLevel(6, 3)
        };
    });

    app.register.directive("subbrand3filterleveli7", function () {
        return {
            template: getTemplateType2FilterLevel(7, 3)
        };
    });

    app.register.directive("subbrand3filterleveli8", function () {
        return {
            template: getTemplateType2FilterLevel(8, 3)
        };
    });

    app.register.directive("subbrand3filterleveli9", function () {
        return {
            template: getTemplateType2FilterLevel(9, 3)
        };
    });

    app.register.directive("subbrand4filterleveli2", function () {
        return {
            template: getTemplateType2FilterLevel(2, 4)
        };
    });

    app.register.directive("subbrand4filterleveli3", function () {
        return {
            template: getTemplateType2FilterLevel(3, 4)
        };
    });

    app.register.directive("subbrand4filterleveli4", function () {
        return {
            template: getTemplateType2FilterLevel(4, 4)
        };
    });

    app.register.directive("subbrand4filterleveli5", function () {
        return {
            template: getTemplateType2FilterLevel(5, 4)
        };
    });

    app.register.directive("subbrand4filterleveli6", function () {
        return {
            template: getTemplateType2FilterLevel(6, 4)
        };
    });

    app.register.directive("subbrand4filterleveli7", function () {
        return {
            template: getTemplateType2FilterLevel(7, 4)
        };
    });

    app.register.directive("subbrand4filterleveli8", function () {
        return {
            template: getTemplateType2FilterLevel(8, 4)
        };
    });

    app.register.directive("subbrand4filterleveli9", function () {
        return {
            template: getTemplateType2FilterLevel(9, 4)
        };
    });
});