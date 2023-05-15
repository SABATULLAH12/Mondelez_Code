"use strict";
define(['app', 'jquery', 'ajaxservice', 'constants'], function (app, $) {
    app.register.controller("LoginController", ["$scope", '$css', 'AjaxService', 'Constants', function ($scope, $css, AjaxService, Constants) {
        ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/login.min.css' }, $scope) : $css.bind({ href: '../Content/Css/login.css' }, $scope);
        let layoutScope = $scope.$parent;
        $scope.username = '';
        $scope.password = '';
        $scope.authenticateUser = function () {
            layoutScope.setLoader(true);
            if ($scope.username == '') {
                layoutScope.setLoader(false);
                layoutScope.customAlert(Constants.EMPTY_USERNAME_FIELD, Constants.LOGIN_ALERT_HEADER_TEXT, null, null, Constants.OK_TEXT);
                return;
            }
            if ($scope.username.length > 50) {
                layoutScope.setLoader(false);
                layoutScope.customAlert(Constants.USERNAME_RESTRICT, Constants.LOGIN_ALERT_HEADER_TEXT, null, null, Constants.OK_TEXT);
                return;
            }
            if (!validateInputs($scope.username)) {
                layoutScope.setLoader(false);
                layoutScope.customAlert(Constants.USERNAME_INVALID, Constants.LOGIN_ALERT_HEADER_TEXT, null, null, Constants.OK_TEXT);
                return;
            }
            if (!validateUserName($scope.username)) {
                layoutScope.setLoader(false);
                layoutScope.customAlert(Constants.USERNAME_EMAIL_ONLY, Constants.LOGIN_ALERT_HEADER_TEXT, null, null, Constants.OK_TEXT);
                return;
            }

            var request = {};
            request.UserName = $scope.username;
            request.Password = $scope.password;
            layoutScope.setLoader(true);

            AjaxService.AjaxPostNoHeader(request, apiUrl + '/Login/CheckUser', loginSuccess, loginError);
        };

        $scope.onKeyup = function (event) {
            event.stopPropagation();
            var key = event.which;
            if (key === 13) {
                $scope.authenticateUser();
            }
        };

        let validateInputs=function(u) {     //<---Function to check whether user has entered invalid characters in the input field
            var specialChars = "<>!$%^&*()_+[]{}?:;|'\"\\,/~`=";
            for (var i = 0; i < specialChars.length; i++) {
                if (u.indexOf(specialChars[i]) >= 0)
                    return false;
            }
            return true;
        }

        let validateUserName=function(username) {
            var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

            if (!filter.test(username)) {
                return false;
            }
            return true;
        }

        let loginSuccess=function(response){
            layoutScope.setLoader(false);
            if (response.status == 200) {
                window.location.href = "../Home/Index";
            }
            else if(response.status==401){
                layoutScope.customAlert(Constants.INVALID_CREDENTIALS, Constants.LOGIN_ALERT_HEADER_TEXT, null, null, Constants.OK_TEXT);
            }
            else {
                layoutScope.customAlert(Constants.SOMETHING_WRONG, Constants.LOGIN_ALERT_HEADER_TEXT, null, null, Constants.OK_TEXT);
            }
        }

        let loginError=function(response){
            layoutScope.setLoader(false);
            if (response.status == 401)
                layoutScope.customAlert(Constants.INVALID_CREDENTIALS, Constants.LOGIN_ALERT_HEADER_TEXT, null, null, Constants.OK_TEXT);
            else
                layoutScope.customAlert(Constants.SOMETHING_WRONG, Constants.LOGIN_ALERT_HEADER_TEXT, null, null, Constants.OK_TEXT);
        }

    }]);
});