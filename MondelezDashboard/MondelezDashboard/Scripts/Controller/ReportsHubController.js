"use strict";
define(['app', 'angular', 'jquery', 'lodash', 'ajaxservice', 'JqueryUi', 'constants'], function (app, angular, $) {
    app.register.controller("ReportsHubController", ['$scope', '$css', '$sce', 'AjaxService', 'Constants', function ($scope, $css, $sce, AjaxService, Constants) {
        ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/reportsHub.min.css' }, $scope) : $css.bind({ href: '../Content/Css/reportsHub.css' }, $scope);
        let layoutScope = $scope.$parent.$parent;
        let topMenuScope = $scope.$parent;
        let selectedModule = topMenuScope.modules[4];
        selectedModule.isActive = true;
        layoutScope.setLoader(true);
        topMenuScope.setStoryBoardFooter(false);
        topMenuScope.resetFootNotes();
        $scope.showOutput = false;
        $scope.isDependentFiltersChanged = false;
        $scope.ShowTPDropDown = [false,false];
        $scope.FileLinks = [];
        $scope.FilterPanelData = [];
        $scope.FilterPanel = [];
        $scope.TimePeriodFrom = []
        $scope.TimePeriodTo = [];
        $scope.FilteredLinkList = [];
        $scope.UserRole = '';
        $scope.UserId = '';
        $scope.TimePeriodResponse = {
            From: null,
            To : null
        }
        let FillFilterPanel = function () {
            $scope.FilterPanel = [
                { Id: 0, Name: "markets", Dependent: [], Dependency: [1, 2], IsMulti: true, IsOpen: false, Data: $scope.FilterPanelData[0].Data, Selection: [], SelectionText: null },
                { Id: 1, Name: "category", Dependent: [0], Dependency: [2], IsMulti: true, IsOpen: false, Data: [], Selection: [], SelectionText: null },
                { Id: 2, Name: "time interval", Dependent: [0, 1], Dependency: [], IsMulti: false, IsOpen: false, Data: [], Selection: [], SelectionText: null },
            ];
        }

        let InitializeFilterPanel = function (Response) {
            let res = Response.data;
            $scope.FilterPanelData = res.Data[0].Data;
            $scope.FileLinks = res.ReportLinks;
            layoutScope.setLoader(false);
            FillFilterPanel();
            FillFilteredUrlList();
            $scope.UserRole = Response.data.UserROle.User_Role.User_ROLE;
            $scope.UserId = Response.data.UserId;
        }

        let replaceWhiteSpaceWithdash = function (value) { if (value !== null && value !== undefined) return value.replace(/ /g, '-').replace('/', '-').toLowerCase(); }

        $scope.replaceWhiteSpace = function (value) { if (value !== null && value !== undefined) return value.replace(/ /g, '_').replace('/', '_').toUpperCase(); }

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

        let CheckBeforeDepency = function (TabId) {
            for (var i = 0; i < $scope.FilterPanel[TabId].Dependent.length; i++) {
                if (!($scope.FilterPanel[$scope.FilterPanel[TabId].Dependent[i]].Selection.length > 0)) {
                    layoutScope.customAlert("Please make the selection in sequence.", "Alert");
                    return true;
                }
            }
            return false;
        }

        let getFilterSelectionValueOnKey = function (FilterId, key) {
            let SelectionList = [];
            angular.forEach($scope.FilterPanel[FilterId].Selection, function (obj) {
                SelectionList.push(obj[key]);
            })
            return SelectionList;
        }


        $scope.displayFileUploadPopUp = function () {
            let upLoadDiv = angular.element(document.querySelector('.RH_UploadPopUpDiv'));
            upLoadDiv.css("display", "block");
            let upLoadPopUp = angular.element(document.querySelector('#RH_UploadPopUp'));
            upLoadPopUp.css("display", "block");
            let browseButton = angular.element(document.querySelector('.RH_UploadFileButton'));
            browseButton.css("display", "block");
            let uploadButton = angular.element(document.querySelector('.RH_UploadButton'));
            uploadButton.css("display", "block");
            let fileNameDiv = angular.element(document.querySelector('.RH_UploadFileNames'));
            fileNameDiv.html(" ");
            let uploadSuccessMsg = angular.element(document.querySelector('#RH_UploadSuccessMsg'));
            uploadSuccessMsg.css("display", "none");
            if ($scope.files != undefined) {
                let len = $scope.files.length;
                $scope.files.splice(0, len);
            }
            $scope.dsblBtn = true;
            uploadButton.css("background-color", "gray");
        }

        $scope.uploadReportsHub = function () {
            alert("at");

        }
        $scope.files = [];
        $scope.tempFiles = [];
        $scope.getFileDetails = function (e) {
            $scope.dsblBtn = false;
            let uploadButton = angular.element(document.querySelector('.RH_UploadButton'));
            uploadButton.css("background-color", "rgb(225, 135, 25)");
            let uploadSuccessMsg = angular.element(document.querySelector('#RH_UploadSuccessMsg'));
            uploadSuccessMsg.html("");
            let deleteFileName = "";

            $scope.$apply(function () {
                for (var i = 0; i < e.files.length; i++) {
                    $scope.files.push(e.files[i]);
                }
            });
            for (var a = 0; a < $scope.files.length - 1; a++) {
                for (var b = a + 1; b < $scope.files.length; b++) {
                    if ($scope.files[a].name == $scope.files[b].name) {
                        $scope.files.splice(b, 1);
                    }
                }
            }

            let fileNameDiv = angular.element(document.querySelector('.RH_UploadFileNames'));
            fileNameDiv.html("");
            for (let i = 0 ; i < $scope.files.length; i++) {
                deleteFileName = '"' + $scope.files[i].name + '"';
                fileNameDiv.append("<div class='RH_fileName' id='RH_file" + (i + 1) + "'>" + (i + 1) + ". " + $scope.files[i].name + "</div><div class='RH_deleteFile' onclick='angular.element(this).scope().deleteSelectedFile(" + deleteFileName + ") '>X</div>");
            }
            $scope.deleteSelectedFile = function (fileName) {
                for (let i = 0; i < $scope.files.length; i++) {
                    if ($scope.files[i].name == fileName) {
                        for (let j = 0; j < $scope.files.length; j++) {
                            if (fileName == $scope.files[j].name) {
                                $scope.files.splice(j, 1);
                                //let deletedfileName = angular.element(document.querySelector('#RH_file'+(j+1)+''));
                                //deletedfileName.html("Removed");
                                let fileNameDiv1 = angular.element(document.querySelector('.RH_UploadFileNames'));
                                fileNameDiv1.html("");
                                for (let k = 0; k < $scope.files.length; k++) {
                                    let deleteFileName1 = '"' + $scope.files[k].name + '"';
                                    fileNameDiv1.append("<div class='RH_fileName' id='RH_file" + (k + 1) + "'>" + (k + 1) + ". " + $scope.files[k].name + "</div><div class='RH_deleteFile' onclick='angular.element(this).scope().deleteSelectedFile(" + deleteFileName1 + ") '>X</div>");
                                }
                            }
                        }
                    }
                }
            }

        };

        $scope.uploadFiles = function () {
            var data = new FormData();
            for (var i in $scope.files) {
                data.append("uploadedFile", $scope.files[i]);
            }

            var objXhr = new XMLHttpRequest();
            objXhr.addEventListener("load", transferComplete, false);

            objXhr.open("POST", "/api/ReportsHub/UploadFiles/");
            objXhr.send(data);
            layoutScope.setLoader(true);
            $scope.dsblBtn = true;
            $('#file').val('');
        }
        function transferComplete(e) {
            let uploadSuccessMsg = angular.element(document.querySelector('#RH_UploadSuccessMsg'));
            uploadSuccessMsg.css("display", "block");
            if ($scope.files != undefined) {
                if ($scope.files.length == 0) {
                    uploadSuccessMsg.html("No files Uploaded ");
                }
                else {
                    uploadSuccessMsg.html(" Files Uploaded Successfully ");
                }
            }
            else {
                uploadSuccessMsg.html("No files Uploaded ");
            }
            $scope.dsblBtn = true;
            let uploadButton = angular.element(document.querySelector('.RH_UploadButton'));
            uploadButton.css("background-color", "gray");
            let fileNameDiv1 = angular.element(document.querySelector('.RH_UploadFileNames'));
            fileNameDiv1.html("");
            // $scope.dsblFileBtn = false;
            if ($scope.files != undefined) {
                let len = $scope.files.length;
                if (len != 0) {
                    $scope.files.splice(0, len);
                }
            }
        }

        $scope.getReportsHubDiv = function () {
            let uploadImg = angular.element(document.querySelector('.RH_uploadImgContainer'));
            let uploadDiv = angular.element(document.querySelector('.RH_UploadFileDiv'));
            let uploadText = angular.element(document.querySelector('.RH_uploadReportsText'));
            if ($scope.UserRole == 'Admin') {
                uploadDiv.css("display", "block");
                uploadImg.css("display", "block");
                uploadText.css("display", "block");
            }
            else {
                uploadDiv.css("display", "none");
                uploadImg.css("display", "none");
                uploadText.css("display", "none");
            }
        }
        $scope.getUploadReportsHubStyles = function () {
            let uploadImg = angular.element(document.querySelector('.RH_uploadImgContainer'));
            let uploadDiv = angular.element(document.querySelector('.RH_UploadFileDiv'));
            let uploadText = angular.element(document.querySelector('.RH_uploadReportsText'));
            if ($scope.UserRole == 'Admin') {
                uploadDiv.css("display", "block");
                uploadImg.css("display", "block");
                uploadText.css("display", "block");
            }
            else {
                uploadDiv.css("display", "none");
                uploadImg.css("display", "none");
                uploadText.css("display", "none");
            }
        }
        $scope.hidePopUp = function () {
            let upLoadDiv = angular.element(document.querySelector('.RH_UploadPopUpDiv'));
            upLoadDiv.css("display", "none");
            let upLoadPopUp = angular.element(document.querySelector('#RH_UploadPopUp'));
            upLoadPopUp.css("display", "none");
            location.reload(true);
        }
        $scope.deleteSelectedFile = function () {
            console.log("On delete");
        }


        $scope.SelectFilterType = function (item, FilterPanel, index) {
            if (CheckBeforeDepency(item.Id)) {
                return;
            }
            else if (item.Name.toLowerCase() == "category") {
                let marketSelection = getFilterSelectionValueOnKey(0, "Id");
                let compareArray = [];
                let compareArray2 = [];
                let categoryData = _.cloneDeep($scope.FilterPanelData[1].Data);
                for (let i = 0; i < marketSelection.length; i++) {
                    if (i == 0) {
                        _.map(categoryData, function (element) {
                            if (element.CountryId == marketSelection[i]) {
                                compareArray.push(element);
                            }
                        });
                    }
                    compareArray2 = [];
                    _.map(categoryData, function (element) {
                        if (element.CountryId == marketSelection[i]) {
                            compareArray2.push(element);
                        }
                    });
                    compareArray = _.unionWith(compareArray, compareArray2, function (x, y) { return x.Id == y.Id });
                }
                if ($scope.FilterPanel[1].Data.length == 0) {
                    item.Data = compareArray;
                }
            }
            else if (item.Name.toLowerCase() == "time interval") {
                let marketSelectionNameList = getFilterSelectionValueOnKey(0, "Name");
                let categorySelection = getFilterSelectionValueOnKey(1, "Id");
                let compareArray = [];
                let compareArray2 = [];
                let timePerdiodData = _.cloneDeep($scope.FilterPanelData[2].Data);
                for (let i = 0; i < marketSelectionNameList.length; i++) {
                    if (i == 0) {
                        _.map(timePerdiodData, function (element) {
                            angular.forEach(categorySelection, function (obj, index) {
                                if (_.includes(element[$scope.removeWhiteSpace(marketSelectionNameList[i])], categorySelection[index])) {
                                    compareArray.push(element);
                                }
                            });
                        });
                    }
                    else {
                        compareArray2 = [];
                        _.map(timePerdiodData, function (element) {
                            angular.forEach(categorySelection, function (obj, index) {
                                if (_.includes(element[$scope.removeWhiteSpace(marketSelectionNameList[i])], categorySelection[index])) {
                                    compareArray2.push(element);
                                }
                            });
                        });
                        compareArray = _.unionWith(compareArray, compareArray2, function (x, y) { return x.Id == y.Id });
                    }
                }
                compareArray = compareArray.sort(function (a, b) { return a.SortID - b.SortID });
                compareArray = _.uniqWith(compareArray, _.isEqual);
                if ($scope.FilterPanel[2].Data.length == 0) {
                    item.Data = _.remove(_.map(formatTreeParent(compareArray), function (element) { if (element.Data.length > 0) return element }), undefined);
                }
            }
            $scope.ShowTPDropDown = [false, false];
            if (item.Data.length <= 0) {
                layoutScope.customAlert(Constants.NO_OUTPUT_TEXT, Constants.ALERT_HEADER_TEXT);
                return
            }
            if (OpenCloseFilterPanal(item, FilterPanel, index)) {
            }
        }

        $scope.RHLayoutClicked = function () {
            angular.forEach($scope.FilterPanel, function (obj) { obj.IsOpen = false; })
        }

        $scope.SelectAll = function (item) {
            if ($scope.IfAllSelected(item.Data)) {
                ClearTab(item.Id);
                ClearDependentFitler(item.Id);
                FillFilteredUrlList();
            }
            else {
                ClearTab(item.Id);
                ClearDependentFitler(item.Id);
                angular.forEach($scope.FilterPanel[item.Id].Data, function (obj) {
                    obj.IsSelected = false;
                    $scope.SelectSubFilterData(obj, item);
                })
            }
        }

        $scope.IfAllSelected = function (item) {
            
            let IsAllSelected = true;
            angular.forEach(item, function (obj) {
                if (obj.IsSelected == false || obj.IsSelected == null) {
                    IsAllSelected = false;
                }
            });
            return IsAllSelected;
        }

        $scope.SelectAllFilteredLink = function () {
            if ($scope.IfAllSelected($scope.FilteredLinkList)) {
                angular.forEach($scope.FilteredLinkList, function (obj) {
                    obj.IsSelected = false;
                });
            }
            else {
                angular.forEach($scope.FilteredLinkList, function (obj) {
                    obj.IsSelected = true;
                });
            }
        }

        $scope.GetSelectionObject = function (item) {
            let Myselection = [];
            Myselection.push(
            {
                "Id": item.Id,
                "Name": item.Name
            })
            return Myselection[Myselection.length - 1];
        }

        $scope.DownloadSelected = function () {
            let filesForDownload = [];
            let count = 0;
            let totalSelected = _.remove(_.map($scope.FilteredLinkList, function (obj) { if (obj.IsSelected == true) return obj }), undefined).length;
            //userTracking
            if (totalSelected > 0) {
                var UserDetailObject = {};
                UserDetailObject.moduleId = 5;
                UserDetailObject.selection = sessionStorage.getItem("selection");
                AjaxService.AjaxPost(UserDetailObject, apiUrl + '/FilterPanel/UserTrackingDetails', function (response) { ReportHubselection = []; }, function (response) { })
            }
            //
            for (let i = 0; i < $scope.FilteredLinkList.length; i++) {
                if ($scope.FilteredLinkList[i].IsSelected) {
                    count++;
                    let ua = window.navigator.userAgent;
                    let msie = ua.indexOf("MSIE ");
                    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))  // If Internet Explorer, return version number
                    {
                        window.open("../Reports/" + $scope.FilteredLinkList[i].Name, '_blank');
                    }
                    else  // If another browser, return 0
                    {
                        layoutScope.setLoader(true);
                        setTimeout(function () {
                            let temporaryDownloadLink = document.createElement("a");
                            temporaryDownloadLink.style.display = 'none';
                            document.body.appendChild(temporaryDownloadLink);
                            temporaryDownloadLink.setAttribute('href', "../Reports/" + $scope.FilteredLinkList[i].Name);
                            temporaryDownloadLink.setAttribute('download', $scope.FilteredLinkList[i].Name);
                            temporaryDownloadLink.click();
                            document.body.removeChild(temporaryDownloadLink);
                            if (count == totalSelected) {
                                layoutScope.setLoader(false);
                                $scope.$apply();
                            }
                        }, Math.floor(i / 5) * 1000 + 1500);
                    }
                }
            }
        }

        $scope.ClearAll = function () {
            ClearTab(0);
            ClearDependentFitler(0);
            FillFilteredUrlList();
        }

        let ClearTab = function (TabId) {
            $scope.FilterPanel[TabId].Selection = [];
            $scope.FilterPanel[TabId].SelectionText = "";
            $scope.FilterPanel[TabId].Data = angular.forEach($scope.FilterPanel[TabId].Data, function (obj) {
                obj.IsSelected = false;
            })
        }

        let ClearDependentFitler = function (TabId) {
            angular.forEach($scope.FilterPanel[TabId].Dependency, function (obj) {
                $scope.FilterPanel[obj].Selection = [];
                $scope.FilterPanel[obj].SelectionText = "";
                $scope.FilterPanel[obj].Data = [];
            })
        }

        let FillFilteredUrlList = function () {
            $scope.FilteredLinkList= [];
            let Selection = [];
            var reportSelection = [];
            angular.forEach($scope.FilterPanel, function (obj) {
                let arr = [];
                angular.forEach(obj.Selection, function (item) {
                    arr.push(replaceWhiteSpaceWithdash(item.Name));                   
                })
               
                if (obj.Name.toLowerCase() == 'time interval') {
                    let Insert = false;
                    let TPType = arr[0] + " ";
                    arr = [];
                    if (obj.Selection.length != 0) {
                        angular.forEach($scope.TimePeriodFrom, function (obj) {
                            if (obj.Name == $scope.TimePeriodResponse.From.Name)
                                Insert = true;
                            if (Insert)
                                arr.push(replaceWhiteSpaceWithdash(TPType + obj.Name));
                            if (obj.Name == $scope.TimePeriodResponse.To.Name)
                                Insert = false;
                        });
                    }
                }
                Selection.push(arr);
            })
            reportSelection.push({ name: 'Market', selection: Selection[0] });
            reportSelection.push({ name: 'Category', selection: Selection[1] });
            reportSelection.push({ name: 'TimeInterval', selection: Selection[2] });
            sessionStorage.setItem('selection', JSON.stringify(reportSelection));
            if (!ReleaseMode) {
                console.log("Selection :- ");
                console.log(Selection);    
            }
            //Filter URL Code
            angular.forEach($scope.FileLinks, function (link) {
                let insert = true;
                for (var i = 0; i < Selection.length; i++) {
                    if (Selection[i].length == 0) break; 
                    insert = false;
                    for (var j = 0; j < Selection[i].length; j++) {
                        if (link.toLowerCase().indexOf(Selection[i][j]) > -1) {
                            insert = true;
                            break;
                        }
                    }
                    if (insert == false) break;
                }
                if (insert) {
                    $scope.FilteredLinkList.push({IsSelected:false,Name:link});
                }
            })
        }

        $scope.removeWhiteSpace = function (value) {
            if (value !== null && value !== undefined) {
                return value.replace(/ /g, '');
            }
        };

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

        $scope.SelectTimePeriod = function (IsTP1,item) {
            if (IsTP1) {
                $scope.TimePeriodResponse.From = item;
                let arr = [];
                let Insert = false;
                angular.forEach($scope.TimePeriodFrom, function (obj) {
                    if (obj.Name == $scope.TimePeriodResponse.From.Name)
                        Insert = true;
                    if (Insert) {
                        arr.push(obj);
                    }
                });
                $scope.TimePeriodTo = arr;
                $scope.TimePeriodResponse.To = $scope.TimePeriodTo[$scope.TimePeriodTo.length-1];
            }
            else {
                $scope.TimePeriodResponse.To = item;
            }
            $scope.ShowTPDropDown = [false, false];
            FillFilteredUrlList();
        }

        $scope.SelectSubFilterData = function (item, parent) {
            
            let Selection = $scope.GetSelectionObject(item);
            
            if (parent.IsMulti){
                if (item.IsSelected) {
                    //Match selection in filterpanel and remove
                    parent.Selection = _.remove(parent.Selection, function (obj) {
                        return !_.isMatch(obj, Selection)
                    });
                    item.IsSelected = !item.IsSelected;
                    ClearDependentFitler(parent.Id);
                }
                else {
                    ClearDependentFitler(parent.Id);
                    item.IsSelected = !item.IsSelected;
                    $scope.FilterPanel[parent.Id].Selection.push(Selection);
                    $scope.FilterPanel[parent.Id].SelectionText = item.DisplayName;
                }
            }
            else {
                //Time Period Selection Code
                if (item.IsSelected) {
                    ClearTab(parent.Id);
                }
                else {
                    ClearTab(parent.Id);
                    item.IsSelected = !item.IsSelected;
                    $scope.FilterPanel[parent.Id].Selection.push(Selection);
                    $scope.FilterPanel[parent.Id].SelectionText = item.DisplayName;
                    $scope.TimePeriodFrom = item.Data;
                    $scope.TimePeriodTo = $scope.TimePeriodFrom;
                    $scope.TimePeriodResponse.From = $scope.TimePeriodFrom[0];
                    $scope.TimePeriodResponse.To = $scope.TimePeriodTo[$scope.TimePeriodTo.length - 1];
                    $scope.ShowTPDropDown = [false, false];
                }
            }
           
            
            FillFilteredUrlList();
           
            //    ReportHubselection.map(item => {
            //        if (item.name == parent.Name) {
            //            (item.selection = Selection)
            //        }
            //        else {
            //            ReportHubselection.push([{ name: parent.Name, selection: Selection }]);
            //        }
            //    });

            //}
            //if (item.IsSelected) {
            //    if (ReportHubselection.length == 0) {
            //        ReportHubselection.push([{ name: parent.Name, selection: Selection }]);
            //    } else{
            //        $.each(ReportHubselection, function (i, items) {
            //            if (items[i].name == parent.Name)
            //            {
            //                let sele = [{}];
            //                sele.push(items[i].selection);
            //                sele.push(Selection);
            //                items[i].selection = sele;
            //            }
            //            else
            //            {
            //                ReportHubselection.push([{ name: parent.Name, selection: Selection }]);
            //            }
            //        });
            //    }
            //}
            //else {
            //    $.each(ReportHubselection, function (i, item) {
            //        if (item[i].name == parent.Name) {
            //            let arr = [];
            //            arr.push(item[i].selection);
            //            $.each(arr, function (j, value) {
                           
            //                if (value[j+1].Id == Selection.Id) {
            //                    delete arr[i][j+1];
            //                }
            //                });
                        
            //            item[i].selection = arr;
            //        }else
            //        {
            //            ReportHubselection.pop();
            //        }
            //    });
            //} 
        }
       

        $scope.getDistinctCategory = function (data) {
            return _.uniqWith(data, function (a, b) { return a.CategoryId == b.CategoryId })
        }

        AjaxService.AjaxPost(null, apiUrl + "/ReportsHub/GetReportHubData", InitializeFilterPanel, function (response) { layoutScope.setLoader(false); layoutScope.customAlert(Constants.SOMETHING_WRONG_REFRESH, Constants.ERROR_HEADER_TEXT); console.log(response) });
    }]);
});