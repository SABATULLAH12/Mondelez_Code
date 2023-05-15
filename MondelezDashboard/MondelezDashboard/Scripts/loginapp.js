/*----------------------------------------------------------------------------------------------------*/
/*          Author: Rahul Kumar (Software Engineer, F&B)                                              */
/*          Date: 05-02-2019                                                                          */
/*          Discription: This page contains the UI-Router configuration to be used across states      */
/*----------------------------------------------------------------------------------------------------*/

"use strict";
var ReleaseMode = true;
var applicationPath = '/';
var apiUrl = '/API';
var automationData = {};

define(['angularAMD', 'angular-ui-route', 'angular-css'], function (angularAMD) {
    var app = angular.module("myapp", ['ui.router','angularCSS']);
    app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
        $stateProvider
        .state('defaultState', angularAMD.route({
            url: '',
            views: {
                '': {
                    templateUrl: '../Template/LayoutPage.html',
                    css: 'Content/Css/layout.css'
                }
            },
            resolve: {
                load: ['$q', '$rootScope', '$location', '$state',
                    function ($q, $rootScope, $location, $state) {
                        try {
                            var controllerName = "LayoutController";
                            var loadController = "Controller/" + controllerName;
                            var deferred = $q.defer();
                            require([loadController], function () {
                                $rootScope.$apply(function () {
                                    deferred.resolve();
                                });
                            });
                            return deferred.promise;
                        }
                        catch (e) {
                            console.log(e.message);
                        }
                    }]
            }
        }))
        .state('defaultState.LoginPage', angularAMD.route({
                url: '/Login',
                views: {
                    'container-view@defaultState': {
                        templateUrl: function (rp) {
                            return '../Template/LoginPage.html';
                        },
                        css: 'Content/Css/login.css'
                    }
                },
                resolve: {
                    load: ['$q', '$rootScope', '$location', '$state',
                        function ($q, $rootScope, $location, $state) {
                            try {
                                var controllerName = "LoginController";
                                var loadController = "Controller/" + controllerName;
                                var deferred = $q.defer();
                                require([loadController], function () {
                                    $rootScope.$apply(function () {
                                        deferred.resolve();
                                    });
                                });
                                return deferred.promise;
                            }
                            catch (e) {
                                console.log(e.message);
                            }
                        }]
                }
            }))
        
        $urlRouterProvider.otherwise('/Login');
        $locationProvider.html5Mode(true);
    }]);

    // Bootstrap Angular when DOM is ready
    angularAMD.bootstrap(app, false, document.getElementById("body2"));
    return app;
});
//Polyfill JavaScript Array.prototype.find for older browsers (e.g. IE 10, IE 11)
if (!Array.prototype.find) {

    Object.defineProperty(Array.prototype, "find", {
        enumerable: false,
        value: function (predicate) {
            if (this == null) {
                throw new TypeError('Array.prototype.find called on null or undefined');
            }
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }
            var list = Object(this);
            var length = list.length >>> 0;
            var thisArg = arguments[1];
            var value;

            for (var i = 0; i < length; i++) {
                value = list[i];
                if (predicate.call(thisArg, value, i, list)) {
                    return value;
                }
            }
            return undefined;
        }
    });

}
