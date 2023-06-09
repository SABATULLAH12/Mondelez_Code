﻿/*----------------------------------------------------------------------------------------------------*/
/*          Author: Rahul Kumar (Software Engineer, F&B)                                              */
/*          Date: 28-02-2019                                                                          */
/*          Discription: This Script contains Layout Controller definition for default state          */
/*----------------------------------------------------------------------------------------------------*/

"use strict";
define(['app', 'lodash'], function (app) {

    app.register.controller("HomeController", function ($scope,$css, $http, $location, $window, $filter) {
        ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/home.min.css' }, $scope) : $css.bind({ href: '../Content/Css/home.css' }, $scope);
        //ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/layout.min.css' }, $scope) : $css.bind({ href: '../Content/Css/layout.css' }, $scope);
        //ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/filter_panel.min.css' }, $scope) : $css.bind({ href: '../Content/Css/filter_panel.css' }, $scope);
        //ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/myStoryBoard.min.css' }, $scope) : $css.bind({ href: '../Content/Css/myStoryBoard.css' }, $scope);
        let layoutScope = $scope.$parent;
        if (!layoutScope.validateSession()) {
            return;
        }
        $scope.metricStyle = { width: "calc(100% / " + $scope.modules.filter(function (item) { return !item.IsHidden; }).length + ")" };
        $scope.replaceWhiteSpace = function (value) {
            if (value != null && value != undefined)
                return value.replace(/ /g, '_');
        };
        $scope.approutePath = applicationPath;
        $scope.settings_list = [
            //{ Name: "Change Password", Handler: function () { $scope.$parent.showChangePassword = true; }, IsHidden: false },
            { Name: "Worldpanel Online", Handler: $scope.$parent.redirectToKantar, IsHidden: false },
            { Name: "Guide Document", Handler: $scope.$parent.GuideDocumentDownload, IsHidden: false },
            { Name: "Support", Handler: $scope.$parent.SupportPop, IsHidden: false },
            //{ Name: "Mail Subscription", Handler: layoutScope.getSubscriptionData, IsHidden: false },
            { Name: "Logout", Handler: $scope.$parent.logOut, IsHidden: false }
        ];
        $scope.logout = function () {
            $scope.$parent.logOut();
        };
        $scope.getSettingsLength = function () {
            let filtered = $scope.settings_list.filter(function (item) { return item.IsHidden != true });
            return filtered != undefined ? filtered.length : 0;
        };
        layoutScope.clickLayout = function () {
            $scope.showSettings = false;
            $scope.showFooter = false;
        };
        $scope.showToolTip = function (value) {
            var toolTipText = '';
            if (value == "SNAPSHOT") {
                toolTipText = 'Dashboard style visuals. Focus on Brand, Category, Retailers or Demographics to get a quick summary of key metrics';
            }
            if (value == "DEEPDIVE") {
                toolTipText = 'Chart anything from your dataset using single point-in-time Bar Charts or Trended Line Charts';
            }
            if (value == "CROSSTAB") {
                toolTipText = 'Create a data table from anything that exists within your dataset';
            }
            if (value == "GROWTH OPPORTUNITY") {
                toolTipText = "The Growth Opportunity module is a scenario builder enabling users to simulate the relationship between Penetration, Frequency & Value of a Brand.";
            }
            if (value == "REPORTS HUB") 
            {
                toolTipText = "User can download reports based on Market, Category and Time Period.";
            }
            if (value == "MY STORYBOARD") {
                toolTipText = "The Storyboard module allows users to create & share custom story from other modules of the Dashboard.";
            }
            if (value == "DATA EXPLORER") {
                toolTipText = "The data explorer module allows the user to create a table from Harmonized or non-harmonized data sets.";
            }
            let leftPos = '', topPos = '';
            let pWidth = angular.element('#moduleToolTip').width();
            let pHeight = angular.element('#moduleToolTip').height();
            var tempPadding = angular.element('#moduleToolTip')[0].style.padding;
            tempPadding = tempPadding.substring(0, tempPadding.length - 2);
            let pPadding = Number(tempPadding) * 2;

            if ((event.pageX + pWidth + pPadding + 30) < window.innerWidth)
                leftPos = event.pageX + 15;
            else
                leftPos = event.pageX - angular.element('#moduleToolTip').width() - 35;

            if ((event.pageY + pHeight + pPadding) < window.innerHeight) {
                topPos = event.pageY + 15;
            }
            else {
                topPos = event.pageY - angular.element('#moduleToolTip').height() - 15;
            }

            angular.element('#moduleToolTip').css({
                'left': (leftPos + 10) + 'px',
                'top': (topPos) + 'px'
            });
            angular.element('.moduleToolTipText').html(toolTipText);
            if (toolTipText.length > 0) {
                angular.element('#moduleToolTip').show();
            }
            else {
                angular.element('#moduleToolTip').hide();
            }
        }
        $scope.hideToolTip = function () {
            angular.element('#moduleToolTip').hide();
        }
        $scope.AuthLandingPage = function () {
            if (sessionStorage["LoginPage"] == 'false') {
                window.location = sessionStorage["LoginPageURL"] + '/Landing';
            }
        }
    });
})