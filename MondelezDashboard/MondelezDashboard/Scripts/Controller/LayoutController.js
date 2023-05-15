/*----------------------------------------------------------------------------------------------------*/
/*          Author: Rahul Kumar (Software Engineer, F&B)                                              */
/*          Date: 25-02-2019                                                                          */
/*          Discription: This Script contains Layout Controller definition for default state          */
/*----------------------------------------------------------------------------------------------------*/
"use strict";
define(['app', 'angular', 'html2canvas', 'ajaxservice', 'constants'], function (app, angular, html2canvas) {
    app.register.controller("LayoutController", ['$scope', '$css', '$sce', '$http', '$state', 'AjaxService', 'Constants', function ($scope, $css, $sce, $http, $state, AjaxService, Constants) {
        ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/layout.min.css' }, $scope) : $css.bind({ href: '../Content/Css/layout.css' }, $scope);
        AjaxService.initialize($scope);
        $scope.logOut = function () {
            $scope.clearTokenCookie();
            $scope.redirectToLogin();
        };
        let layoutScope = $scope;
        //var Moduledetails = [{ ModuleName: "REPORTSHUB", id: "5" }, { ModuleName: "MYSTORYBOARD", id: "6" }]
        $scope.isNavigatedFromOtherModule = { isNavigated: false };
        $scope.showStoryBardLtdLoader = false;
        $scope.SelectionsFromStoryBoard = [];
        $scope.isShowSubscriptionPopup = false;
        $scope.IsReportToggle = true;
        $scope.SubscriptionData = [];
        $scope.IsSubscribedToCommonReports = false;
        $scope.LoggedUser = "";
        $scope.module = "";
        $scope.subscriptionSearchText = "";
        $scope.SetTagStoryMySelectionFlag = false;
        $scope.TagStoryMySelectionSelectedStory = {};
        $scope.StoryBoardSlideNavigationDetails = {};
        $scope.MaxSessionTime = 20; //Session time in minutes
        $scope.clickLayout = function () {
        };
        $scope.validateSession = function () {
            return true;
        };
        $scope.IsCrossTabSubmit = false;

        $scope.alert = {};

        $scope.customAlert = function (message, title, closeHandler, submitHandler, submitButtonText,isHtmlText,cancelButtonText,submitParams) {
            $scope.alert.button1 = {};
            $scope.alert.button2 = {};
            $scope.alert.button1.Show = submitHandler !== undefined;
            $scope.alert.button1.Value = submitButtonText === undefined ? "Submit" : submitButtonText;
            if (cancelButtonText) {
                $scope.alert.button2.Value = cancelButtonText;
                $scope.alert.button2.Show = true;
            }
            $scope.alert.button1.SumbitParams = submitParams;
            $scope.alert.button1.onSuccess = submitHandler;
            title = title === undefined ? "Error" : title;
            $scope.alert.show = true;
            $scope.alert.htmlText_show = false || isHtmlText;
            $scope.alert.header = title;
            $scope.alert.message = message;
            if (closeHandler == null) {
                $scope.alert.onClose = function () { $scope.alert.show = false; $scope.alert.style = {}; $scope.setLoader(false); };
            }
            else {
                $scope.alert.onClose = closeHandler;
            }
        };

        $scope.clickModule = function (module, Modules) {
            if (module.IsDisabled) {
                $scope.customAlert(module.Name + " is currently disabled.", 'Maintenance');
                return;
            }
            var UserDetailObject = {};
            angular.forEach(Modules, function (obj) { if (module.ModuleName != obj.ModuleName) obj.isActive = false; });
            UserDetailObject.selection = null;
            if (module.ModuleName == "MYSTORYBOARD") {
                UserDetailObject.moduleId = 6;
                AjaxService.AjaxPost(UserDetailObject, apiUrl + '/FilterPanel/UserTrackingDetails', function (response) { }, function (response) { console.log(response) })
            }
            $scope.removeNiceScrollRail();
            window.dataLayer = window.dataLayer || [];
            function gtag() { dataLayer.push(arguments); }
            gtag('js', new Date());
            gtag('config', sessionStorage['GID'], { 'page_path': 'MondelezPBS/' + module.ModuleName });
            $state.go(module.State, {}, { location: 'replace' });
        };

        $scope.removeNiceScrollRail = function () {
            $(".nicescroll-rails").remove();
        };

        $scope.clickPath = function (path) {
            $scope.validateSession(function () {
                if (path !== undefined && path !== null && path !== "") {
                    window.location.href = applicationPath + path;
                }
            });
        };
        $scope.SetTagStoryMySelection = function (story) {
            if (story == undefined) {
                let currstatus = $scope.SetTagStoryMySelectionFlag;
                $scope.SetTagStoryMySelectionFlag = false;
                return currstatus;
            }
            else {
                $scope.SetTagStoryMySelectionFlag = true;
                $scope.TagStoryMySelectionSelectedStory = story;
            }
        }
        $scope.modules = [
            {
                Name: "SNAPSHOT",
                ModuleName: "SNAPSHOT",
                Children: [],
                IsDisabled: false,
                IsHidden: false,
                State: "defaultState.TopMenu.FilterPanel.SnapShot"
            },
            {
                Name: "DEEPDIVE",
                ModuleName: "DEEPDIVE",
                Children: [],
                IsDisabled: false,
                IsHidden: false,
                State: "defaultState.TopMenu.FilterPanel.DeepDive"
            },
            {
                Name: "CROSSTAB",
                ModuleName: "CROSSTAB",
                Children: [],
                IsDisabled: false,
                IsHidden: false,
                State: "defaultState.TopMenu.FilterPanel.CrossTab"
            },
            {
                Name: "GROWTH OPPORTUNITY",
                ModuleName: "GROWTHOPPORTUNITY",
                Children: [],
                IsDisabled: false,
                IsHidden: false,
                State: "defaultState.TopMenu.FilterPanel.GrowthOpportunity"
            },
            {
                Name: "REPORTS HUB",
                ModuleName: "REPORTSHUB",
                Children: [],
                IsDisabled: false,
                IsHidden: false,
                State: "defaultState.TopMenu.ReportsHub"
            },
            {
                Name: "MY STORYBOARD",
                ModuleName: "MYSTORYBOARD",
                Children: [],
                IsDisabled: false,
                IsHidden: false,
                State: "defaultState.TopMenu.MyStoryBoard"
            },
            {
                Name: "DATA EXPLORER",
                ModuleName: "DATAEXPLORER",
                Children: [],
                IsDisabled: false,
                IsHidden: false,
                State: "defaultState.TopMenu.DataCrossTab"
            }
        ];

        $scope.SetIsCrossTabSubmit = function (value) {
            $scope.IsCrossTabSubmit = value;
        }

        $scope.takeScreenshot = function (element, returnFunc, params) {
            var base64 = "";
            var svgElements = angular.element('svg');
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
            html2canvas(element, {
                letterRendering: true,
                useCORS: true,
                allowTaint: true,
                logging: true,
                profile: true,
                onrendered: function (canvas) {
                    base64 = canvas.toDataURL();
                    base64 = base64.replace('data:image/png;base64,', '');
                    angular.element(element).find('canvas').remove();
                    $('svg').show();
                    if (params == undefined) {
                        returnFunc(base64);
                    }
                    else if (params != undefined) {
                        params.base64 = base64;
                        returnFunc(params);
                    }
                }
            });

        }

        $scope.setLoader = function(state){
            $scope.showLoader = state
        }
        $scope.setStoryBoardLoader = function (state) {
            $scope.showStoryBardLoader = state
        }
        $scope.setStoryBoardLtdLoader = function (state) {
            $scope.showStoryBardLtdLoader = state
        }

        $scope.setToken = function setToken() {
            $http.post(applicationPath + 'home/GetToken').then(function (response) {
                sessionStorage.setItem("UserEmail", response.data);
            })
        };

        $scope.capitalizeFirstLetter = function (string) {
            if (string === undefined || string === null || string === "" || string.length === 0)
                return "";
            return string.charAt(0).toUpperCase() + string.toLowerCase().slice(1);
        }

        $scope.setTokenAndUserCookie = function (data) {
            let tokenData = data.split(',');
            localStorage.setItem("tokenData", JSON.stringify({ "token": tokenData[0], "time": (new Date()).getTime() }));
            if (tokenData.length > 1)
                localStorage.setItem("userData", JSON.stringify({ "userId": tokenData[1], "userName": tokenData[2] , "ssoFlag":tokenData[3]}));
        }

        let getTokenCookie = function () {
            var tokenData = localStorage.getItem("tokenData");
            return tokenData;
        }

        $scope.clearTokenCookie = function () {
            localStorage.setItem("tokenData", undefined);
            localStorage.setItem("userData", undefined);
        }

        $scope.redirectToLogin = function () {

            window.location.replace(applicationPath + 'Home/Logout');
            
        }
        $scope.redirectToKantar = function () {
            window.open("https://eu.worldpanelonline.com/Commissioning/SPages/login.aspx?ReturnUrl=%2fCommissioning%2fPages%2fHome.aspx", '_blank')
        }
        $scope.redirectToHome = function () {
            window.location.replace( applicationPath + "Home/Index");
        }

        $scope.DownloadFile = function (response) {
            $scope.setLoader(false);
            if (response.status == 200 && response.data!="" && response.data!=null) {
                window.location.href = response.data;
            }
            else if (response.status == 401) {
                $scope.logOut();
            }
            else {
                $scope.customAlert(Constants.SOMETHING_WRONG_REFRESH, Constants.ERROR_HEADER_TEXT, null, null, Constants.OK_TEXT);
            }
            //Delete downloaded file after 30 seconds
            //setTimeout(function () { $scope.DeleteFileFromServer(response); }, 60000);
        }

        $scope.ErrorDownloading = function (response) {
            $scope.setLoader(false);
            $scope.customAlert(Constants.SOMETHING_WRONG, Constants.ERROR_HEADER_TEXT, null, null, Constants.OK_TEXT);          
        }

        //$scope.DeleteFileFromServer = function (response) {
        //    var FilePath = response.data;
        //    FilePath = FilePath.replace("..", "~");
        //    FilePath = FilePath.split("/");
        //    FilePath.length = FilePath.length - 1;
        //    AjaxService.AjaxGet(apiUrl + '/Snapshot/DeleteFile?FilePath='+FilePath.join("/"), DeleteSuccess, DeleteError);
        //}
        //$scope.DeleteFileListFromServer = function (list) {
        //    angular.forEach(list, function (li) {
        //        var FilePath = li;
        //        FilePath = FilePath.replace("..", "~");
        //        FilePath = FilePath.split("/");
        //        FilePath.length = FilePath.length - 1;
        //        AjaxService.AjaxGet(apiUrl + '/Snapshot/DeleteFile?FilePath=' + FilePath.join("/"), DeleteSuccess, DeleteError);
        //    });
        //}
        $scope.SupportPop = function () {
            $scope.customAlert($sce.trustAsHtml(Constants.SUPPORT_TEXT), Constants.SUPPORT_HEADER_TEXT, null, null, Constants.OK_TEXT,true);
        }

        $scope.GuideDocumentDownload = function () {
            window.open('../Content/Mondelez_PBS_User_Manual.pdf', '_blank');
        }

        $scope.getSubscriptionData = function () {
            $scope.setLoader(true);
            if (!$scope.validateSession()) {
                return;
            }
            AjaxService.AjaxPost(null, apiUrl + "/FilterPanel/GetSubscriptionData", $scope.prepareSubscriptionData, function (response) { layoutScope.setLoader(false); layoutScope.customAlert("Error Occured."); console.log(response) });
        }

        $scope.prepareSubscriptionData = function (data) {
            $scope.SubscriptionData = data.data.SubscriptionDataList

            let cR_Index = _.findIndex($scope.SubscriptionData, function (obj) { return obj.CountryId == -1 && obj.CategoryId == -1 });
            let cR_Row = $scope.SubscriptionData[cR_Index];
            _.remove($scope.SubscriptionData, function (obj) { return obj.CountryId == -1 && obj.CategoryId == -1 })
            if (cR_Row.IsSubscribedToReport) {
                $scope.IsSubscribedToCommonReports = true;
            }
            else {
                $scope.IsSubscribedToCommonReports = false;
            }

            $scope.isShowSubscriptionPopup = true;
            $scope.subscriptionSearchText = "";
            $scope.setLoader(false);
        }

        $scope.SelectedSubscriptionItem = function (item, index) {
            if ($scope.IsReportToggle) {
                item.IsSubscribedToReport = !item.IsSubscribedToReport
            }
            else {
                item.IsSubscribedToDataLoad = !item.IsSubscribedToDataLoad
            }
        }

        $scope.SaveSubscriptionData = function () {
            $scope.setLoader(true);
            if (!$scope.validateSession()) {
                return;
            }
            let data = {};
            data.SubscriptionDataList = $scope.SubscriptionData;
            if ($scope.IsSubscribedToCommonReports) {
                data.SubscriptionDataList.push({ CountryId: -1, CategoryId: -1, DisplayName: "Common Reports", IsSubscribedToReport: true, IsSubscribedToDataLoad: false });
            }
            AjaxService.AjaxPost(data, apiUrl + "/FilterPanel/SaveSubscriptionData",
                function (response) {
                    layoutScope.setLoader(false);
                    $scope.isShowSubscriptionPopup = false;
                    if (response.data) {
                        layoutScope.customAlert("Subscribed Successfully", "ALERT");
                    }
                    else {
                        layoutScope.customAlert("Something went wrong. Please refresh the screen and try. If it is occuring again, please contact support team.");
                    }
                },
                function (response) {
                    $scope.isShowSubscriptionPopup = false;
                    layoutScope.setLoader(false);
                    layoutScope.customAlert("Error Occured."); console.log(response)
                });
        }

        let DeleteSuccess = function (response) {
            if (response.status==200){
                return;
            }
            else if(response.status==401){
                $scope.logOut();
            }
            else {
                return;
            }
        }

        let DeleteError = function (response) {
            if (response.status == 401) {
                $scope.logOut();
            }
            else {
                return;
            }
        }
    }]);

    app.register.filter("searchSubscriptionItems", function () {
        return function (list, search, input2) {
            if (search === undefined || search === "")
                return list;
            return list.filter(function (d) {
                return d.DisplayName.toLowerCase().search(search.toLowerCase()) > -1;
            });
        }
    });
})

