/*----------------------------------------------------------------------------------------------------*/
/*          Author: Rahul kumar (Software Engineer, F&B)                                              */
/*          Date: 05-02-2019                                                                          */
/*          Discription: This page contains the UI-Router configuration to be used across states      */
/*----------------------------------------------------------------------------------------------------*/

"use strict";
var ReleaseMode = false;
var IsStickyEnabled = false; //This flag is not for crosstab 
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
                }
            },
            resolve: {
                load: ['$q', '$rootScope', '$location', '$state',
                    function ($q, $rootScope, $location, $state) {
                        try {
                            var controllerName = "LayoutController";
                            var loadController =ReleaseMode ? "Controller/Minified/" + controllerName + '.min': "Controller/" + controllerName;
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
        .state('defaultState.MainMenu', angularAMD.route({
            url: '/Index',
            views: {
                'container-view@defaultState': {
                    templateUrl: function (rp) {
                        return '../Template/HomePage.html';
                    }
                }
            },
            resolve: {
                load: ['$q', '$rootScope', '$location', '$state',
                    function ($q, $rootScope, $location, $state) {
                        try {
                            var controllerName = "HomeController";
                            var loadController =ReleaseMode ? "Controller/Minified/" + controllerName + '.min' : "Controller/" + controllerName;
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
                        }
                    }
                },
                resolve: {
                    load: ['$q', '$rootScope', '$location', '$state',
                        function ($q, $rootScope, $location, $state) {
                            try {
                                var controllerName = "LoginController";
                                var loadController =ReleaseMode ? "Controller/Minified/" + controllerName + '.min' : "Controller/" + controllerName;
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
        .state('defaultState.TopMenu', angularAMD.route({
            url: '',
            views: {
                'container-view@defaultState': {
                    templateUrl: function (rp) {
                        return '../Template/TopMenuPage.html';
                    }
                }
            },
            resolve: {
                load: ['$q', '$rootScope', '$location', '$state',
                    function ($q, $rootScope, $location, $state) {
                        try {
                            var controllerName = "TopMenuController";
                            var loadController =ReleaseMode ? "Controller/Minified/" + controllerName + '.min' : "Controller/" + controllerName;
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
        .state('defaultState.TopMenu.FilterPanel', angularAMD.route({
            url: '',
            views: {
                'filterpanal-view@defaultState.TopMenu': {
                    templateUrl: function (rp) {
                        return '../Template/FilterPanelPage.html';
                    }
                }
            },
            resolve: {
                load: ['$q', '$rootScope', '$location', '$state',
                    function ($q, $rootScope, $location, $state) {
                        try {
                            var controllerName = "FilterPanelController";
                            var loadController =ReleaseMode ? "Controller/Minified/" + controllerName + '.min' : "Controller/" + controllerName;
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
        .state('defaultState.TopMenu.MyStoryBoard', angularAMD.route({
            url: '/MyStoryBoard',
            views: {
                'filterpanal-view@defaultState.TopMenu': {
                    templateUrl: function (rp) {
                        return '../Template/MyStoryBoardPage.html';
                    }
                }
            },
            resolve: {
                load: ['$q', '$rootScope', '$location', '$state',
                    function ($q, $rootScope, $location, $state) {
                        try {
                            var controllerName = "MyStoryBoardController";
                            var loadController =ReleaseMode ? "Controller/Minified/" + controllerName + '.min' : "Controller/" + controllerName;
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
        .state('defaultState.TopMenu.ReportsHub', angularAMD.route({
            url: '/ReportsHub',
            views: {
                'filterpanal-view@defaultState.TopMenu': {
                    templateUrl: function (rp) {
                        return '../Template/ReportsHubPage.html';
                    }
                }
            },
            resolve: {
                load: ['$q', '$rootScope', '$location', '$state',
                    function ($q, $rootScope, $location, $state) {
                        try {
                            var controllerName = "ReportsHubController";
                            var loadController = ReleaseMode ? "Controller/Minified/" + controllerName + '.min' : "Controller/" + controllerName;
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
        .state('defaultState.TopMenu.FilterPanel.SnapShot', angularAMD.route({
            url: '/Snapshot',
            views: {
                'module-view@defaultState.TopMenu.FilterPanel': {
                    templateUrl: function (rp) {
                        return '../Template/SnapShotPage.html';
                    }
                }
            },
            resolve: {
                load: ['$q', '$rootScope', '$location', '$state',
                    function ($q, $rootScope, $location, $state) {
                        try {
                            var controllerName = "SnapshotController";
                            var loadController =ReleaseMode ? "Controller/Minified/" + controllerName + '.min' : "Controller/" + controllerName;
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
        .state('defaultState.TopMenu.FilterPanel.DeepDive', angularAMD.route({
            url: '/DeepDive',
            views: {
                'module-view@defaultState.TopMenu.FilterPanel': {
                    templateUrl: function (rp) {
                        return '../Template/DeepDivePage.html';
                    }
                }
            },
            resolve: {
                load: ['$q', '$rootScope', '$location', '$state',
                    function ($q, $rootScope, $location, $state) {
                        try {
                            var controllerName = "DeepDiveController";
                            var loadController =ReleaseMode ? "Controller/Minified/" + controllerName + '.min' : "Controller/" + controllerName;
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
        .state('defaultState.TopMenu.FilterPanel.CrossTab', angularAMD.route({
            url: '/CrossTab',
            views: {
                'module-view@defaultState.TopMenu.FilterPanel': {
                    templateUrl: function (rp) {
                        return '../Template/CrossTabPage.html';
                    }
                }
            },
            resolve: {
                load: ['$q', '$rootScope', '$location', '$state',
                    function ($q, $rootScope, $location, $state) {
                        try {
                            var controllerName = "CrossTabController";
                            var loadController =ReleaseMode ? "Controller/Minified/" + controllerName + '.min' : "Controller/" + controllerName;
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
            .state('defaultState.TopMenu.DataCrossTab', angularAMD.route({
                url: '/DataExplorer',
                views: {
                    'filterpanal-view@defaultState.TopMenu': {
                        templateUrl: function (rp) {
                            return '../Template/DataCrossTabPage.html';
                        }
                    }
                },
                resolve: {
                    load: ['$q', '$rootScope', '$location', '$state',
                        function ($q, $rootScope, $location, $state) {
                            try {
                                var controllerName = "DataCrossTabController";
                                var loadController = ReleaseMode ? "Controller/Minified/" + controllerName + '.min' : "Controller/" + controllerName;
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
        .state('defaultState.TopMenu.FilterPanel.GrowthOpportunity', angularAMD.route({
            url: '/GrowthOpportunity',
            views: {
                'module-view@defaultState.TopMenu.FilterPanel': {
                    templateUrl: function (rp) {
                        return '../Template/GrowthOpportunityPage.html';
                    }
                }
            },
            resolve: {
                load: ['$q', '$rootScope', '$location', '$state',
                    function ($q, $rootScope, $location, $state) {
                        try {
                            var controllerName = "GrowthOpportunityController";
                            var loadController =ReleaseMode ? "Controller/Minified/" + controllerName + '.min' : "Controller/" + controllerName;
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
        
        $urlRouterProvider.otherwise('/Index');
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
