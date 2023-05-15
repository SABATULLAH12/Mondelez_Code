/*-----------------------------------------------------------------------------------------------------*/
/*          Author: Rahul Kumar (Software Engineer, F&B)                                               */
/*          Date: 23-12-2018                                                                           */
/*          Discription: This is cetralized Ajax service to be used by across application.             */
/*-----------------------------------------------------------------------------------------------------*/

define(['app'], function (app) {

    //------------ Common Ajax Service ------------//
    app.register.service('AjaxService', ['$http', function ($http) {
        var data = [];
        var LoginUrl;
        var LogoutUrl;
        var ShowAlert = true;
        let layoutScope = {};
        this.initialize = function (layoutValue) {
            layoutScope = layoutValue;
        }

        var CheckSuccess = function () {
            if (localStorage["ErrorList"] != undefined && localStorage["ErrorList"] != "") {
                return $http.post(apiUrl + "/FilterPanel/LogError",{ message : localStorage["ErrorList"]}, {
                    headers: {
                        "Token": null//JSON.parse(localStorage.getItem("tokenData")).token
                    }
                }).then(function successCallback
                 (response, status, headers, config) {
                    localStorage["ErrorList"] = "";
                }, function errorCallback(response) {
                    CheckResponse(response);
                    console.log("error occured");
                });
            }
        }

        var CheckResponse = function (response) {
            if (response.status == 401 && ShowAlert) {
                layoutScope.setLoader(false);
                var logout = function () { window.location = '../Home/logout'; }
                layoutScope.customAlert("Session Timeout", "ALERT", logout, logout, "OK");
                setTimeout(function () { logout(); }, 10000);
                console.log(response);
            }
            else if (response.status == 500) {
                layoutScope.setLoader(false);
                layoutScope.customAlert("Network connectivity issue detected. Please refresh and try again.", "Error 500", null, null, "OK");
                console.log(response);
            }
            else if (response.status == 503) {
                layoutScope.setLoader(false);
                layoutScope.customAlert("Network connectivity issue detected. Please refresh and try again.", "Error 503", null, null, "OK");
                console.log(response);
            }
            else if (response.status == -1) {
                layoutScope.setLoader(false);
                layoutScope.customAlert("Network connectivity issue detected. Please refresh and try again.", "Error", null, null, "OK");
                console.log(response);
            }

            if (localStorage["ErrorList"] == undefined) {
                localStorage["ErrorList"] = Date() + "|" + response.status + "| statusText " + response.statusText + "||\n";
            }
            else {
                localStorage["ErrorList"] += Date() + "|" + response.status + "| statusText " + response.statusText + "||\n";
            }
        }
        //without param
        this.AjaxGet = function (route, successFunction, errorFunction) {
            return $http({
                method: 'GET',
                url: route,
                headers: {
                    "Token": null//JSON.parse(localStorage.getItem("tokenData")).token
                }

            }).then(function successCallback(response, status, headers, config) {
                successFunction(response, status);
            }, function errorCallback(response) {
                errorFunction(response);
                CheckResponse(response);
            });

        }
        //with param
        this.AjaxGetWithData = function (data, route, successFunction, errorFunction) {
            return $http({
                method: 'GET', url: route, params: data, headers: {
                    "Token": null// JSON.parse(localStorage.getItem("tokenData")).token
                }
            }).then(
                 function successCallback(response, status, headers, config) {
                     successFunction(response, status);
                 },
                function errorCallback(response) {
                    CheckResponse(response);
                })
        }
        this.AjaxPost = function (data, route, successFunction, errorFunction) {
            return $http.post(route, data, {
                headers: {
                    "Token": null//JSON.parse(localStorage.getItem("tokenData")).token
                }
            }).then(function successCallback
                 (response, status, headers, config) {
                successFunction(response, status);
                CheckSuccess();
            }, function errorCallback(response) {
                errorFunction(response);
                CheckResponse(response);
            });
        }

        ///This is only for login page. Don't use it anywhere else!! 
        this.AjaxPostNoHeader = function (data, route, successFunction, errorFunction) {
            return $http.post(route, data).then(function successCallback
                 (response, status, headers, config) {
                successFunction(response, status);
            }, function errorCallback(response) {
                errorFunction(response);
            });

        }
        this.AjaxFileUpload = function (data, route, successFunction, errorFunction) {
            $http.post(route, data, {
                transformRequest: angular.identity,
                headers: {
                    "Content-Type": undefined,
                    "Token": null//JSON.parse(localStorage.getItem("tokenData")).token
                }
            }).then(function successCallback
                 (response, status, headers, config) {
                successFunction(response, status);
            }, function errorCallback(response) {
                errorFunction(response);
                CheckResponse(response);
            });
        }
    }]);
});