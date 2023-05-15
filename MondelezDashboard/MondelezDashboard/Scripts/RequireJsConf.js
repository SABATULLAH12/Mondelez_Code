"use strict";
require.config({
    //-- base/ root folder to all your js files --//
    baseUrl: "../Scripts",
    waitSeconds: 30,
    // alias libraries paths
    paths: {
        'app': 'app',
        'angular': 'Plugin/angular.min',
        'angularAMD': 'Plugin/angularAMD.min',
        'angular-ui-route': 'Plugin/angular-ui-router.min',
        'angular-animate': 'Plugin/angular-animate.min',
        'ajaxservice': 'Services/CommonAjaxService',
        'angular-css': 'Plugin/angular-css.min',
        'StoryBoardService': 'Services/StoryBoardService',
        'jquery': 'Plugin/jquery-3.3.1.min',
        'lodash': 'Plugin/lodash.min',
        'Highcharts': 'Plugin/HighCharts',
        'highcharts-more': 'Plugin/highcharts-more',
        'JqueryUi': 'Plugin/JqueryUi',
        'constants': 'Services/Constants',
        'html2canvas': 'Services/html2canvas',
        'canvg': 'Services/canvg.min',
        'rgbcolor': 'Services/rgbcolor',
        'promise': 'Services/promise',
        'niceScroll': 'Plugin/jquery.nicescroll',
        'big': 'Plugin/big.min.js',
        //'html2canvasvg': 'Services/html2canvas.svg'
    },

    // angular does not support AMD out of the box, put it in a shim
    shim: {
        angular: {
            exports: 'angular',
            deps: ['jquery']
        },
        html2canvas: {
            exports: 'html2canvas',
            deps: ['canvg', 'promise']
        },
        canvg: {
            deps: ['rgbcolor']
        },
        niceScroll: ['jquery'],
        //html2canvasvg: ['html2canvas'],
        'angularAMD': ['angular'],
        'angular-route': ['angular'],
        'angular-css': ['angular'],
        'angular-animate': ['angular'],
        'highcharts-more': ['Highcharts'],
        Highcharts: {
            exports: "Highcharts",
            deps: ['jquery']
        },
        'JqueryUi': ['jquery']
    }
});


//just a convention
require(['app'], function (app) {
});
