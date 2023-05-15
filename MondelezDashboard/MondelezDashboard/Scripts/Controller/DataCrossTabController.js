"use strict";
define(['app', 'angular', 'jquery', 'lodash', 'ajaxservice', 'JqueryUi', 'constants'], function (app, angular, $) {
    app.register.controller("DataCrossTabController", ['$scope', '$css', '$sce', 'AjaxService', 'Constants', function ($scope, $css, $sce, AjaxService, Constants) {
        ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/dataCrossTab.min.css' }, $scope) : $css.bind({ href: '../Content/Css/dataCrossTab.css' }, $scope)
             let layoutScope = $scope.$parent.$parent;
          
        layoutScope.setLoader(false);
        let topMenuScope = $scope.$parent;
        let selectedModule = topMenuScope.modules[5];
        selectedModule.isActive = true;
        topMenuScope.setStoryBoardFooter(false);
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
