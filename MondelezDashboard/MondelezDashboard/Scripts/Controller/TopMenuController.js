/*-------------------------------------------------------------------------------------------------------*/
/*          Author: Rahul Kumar (Software Engineer, F&B)                                                 */
/*          Date: 25-02-2019                                                                             */
/*          Discription: This Script contains TopMenu Controller definition                              */
/*-------------------------------------------------------------------------------------------------------*/

"use strict";
define(['app', 'angular', 'StoryBoardService', 'ajaxservice'], function (app, angular) {
    app.register.controller("TopMenuController", ['$scope', '$css', "$http", "$sce", "StoryBoardService", function ($scope, $css, $http, $sce, StoryBoardService) {
        ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/simplebar.min.css' }, $scope) : $css.bind({ href: '../Content/Css/simplebar.css' }, $scope);
        ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/top_menu.min.css' }, $scope) : $css.bind({ href: '../Content/Css/top_menu.css' }, $scope);
        ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/myStoryBoard.min.css' }, $scope) : $css.bind({ href: '../Content/Css/myStoryBoard.css' }, $scope);
        StoryBoardService.initialize($scope.$parent, $scope);
        $scope.selectedOption = "";
        $scope.selectedStory = "";
        $scope.storyboardFooter = false;
        $scope.showDeleteAlert = false;
        $scope.chart = null;
        $scope.showFooter = false;
        $scope.showFooterIcon = false;
        $scope.topmenuIcons = [];
        $scope.isSlideUpdate = false;
        $scope.SlideDetails = [];
        $scope.StoryBoardModules = [];
        $scope.isShowSubscriptionPopup = false;
        $scope.OpenHowDoesBrandGrow = [false];
        $scope.isLtdSlidesUpdate = false;
        $scope.isDownloadLtdSlide = false;
        $scope.slideIds = "";
        let layoutScope = $scope.$parent;

        window.onbeforeunload = function (event) {
            var e = e || window.event;
            if (e && $scope.isSlideUpdate) {
                e.returnValue = StoryBoardService.SetLock($scope.selectedStoryId, false).then(function (response) { }, function (error) { });
                return e;
            }
        };
        $scope.clickLayout = function (event) {
            if (event.target.className != "footer-info-icon" && !($(".foot-notes").has(event.target).length)) {
                $scope.showFooter = false;
            }

        };

        $scope.redirectToHome = function () {
            layoutScope.redirectToHome();
        }
        $scope.outputContainer = "";
        $scope.clickBody = function () { };
        $scope.sampleSize = { enable: false, colHeaders: [], rows: [] };
        $scope.latestAvailable = { enable: false, colHeaders: [], rows: [] };
        $scope.replaceWhiteSpace = function (value) {
            if (value !== null && value !== undefined)
                return value.replace(/ /g, '_');
        };
        $scope.footNotes = [];
        $scope.resetFootNotes = function () {
            $scope.footNotes = [];
        }
        $scope.setStoryBoardFooter = function (operation) {
            $scope.storyboardFooter = operation;
            $scope.showFooterIcon = false;
            if (!$scope.isDownloadLtdSlide) {
                $scope.slideIds = "";
            }
        }
        $scope.adSnapshotFooter = [];
        $scope.submittedFilterJSON = "";
        $scope.IsAdSignificance = false;
        /******************************* Story Board Related Scripts Start ****************************************************/
        $scope.isSavetoStory = false;
        $scope.saveStoryOptions = ["New Story", "Append To Saved/Shared Story"];
        $scope.saveStoryOpt = $scope.saveStoryOptions[0];
        //Bind the names of the existing stories
        $scope.storyNames = [];//{ "key": "3", "value": "test" }, { "key": "1", "value": "test1" }, { "key": "2", "value": "test2" }, ];
        $scope.error = "";
        $scope.newStoryName = "";
        $scope.existingStoryName = "";
        $scope.showNewStoryName = true;
        $scope.showExistingStoryName = false;
        $scope.isNewStory = true;
        $scope.AdditionalInfo = "";
        $scope.selectExistingStories = function (index, value) {
            $scope.selectedStory = index;
            $scope.existingStoryName = value;
            console.log($scope.existingStoryName);
        }
        $scope.clickSaveStoryBoardOption = function (value, index) {
            $scope.selectedOption = index;
            if (value == $scope.saveStoryOptions[0]) {
                $scope.showNewStoryName = true;
                $scope.showExistingStoryName = false;
                $scope.isNewStory = true;
                $scope.newStoryName = "";               
            }
            else {
                $scope.showNewStoryName = false;
                $scope.showExistingStoryName = true;
                $scope.isNewStory = false;
                $scope.selectedStory = 0;
                //Load the existing(related) story names
                $scope.StoriesToSave();
            }
        }

        $scope.showStoryBoardSave = function (outputContainer, selection, AdditionalInfo) {
            $scope.isSavetoStory = true;
            $scope.newStoryName = "";
            $scope.showNewStoryName = true;
            $scope.showExistingStoryName = false;
            $scope.isNewStory = true;
            $scope.selectedOption = 0;
            $scope.outputContainer = outputContainer;
            //$scope.submittedFilterJSON = selection;
            $scope.AdditionalInfo = AdditionalInfo;
            $scope.StoriesToSave();
        }

        $scope.saveSlideToStory = function () {
            layoutScope.setLoader(true);
            if ($scope.isNewStory) {
                if (_.includes(_.map($scope.storyNames, function (obj) { if (obj.CreUserId == obj.CurUserId) { return obj.StoryName.toLowerCase() } }), $scope.newStoryName.toLowerCase())) {
                    layoutScope.customAlert("Story Name already exists. Please enter a new name.", "Alert");
                    layoutScope.setLoader(false);
                    return;
                }
                else if ($scope.newStoryName != undefined && $scope.newStoryName != "") {
                    if ($scope.outputContainer != "") {
                        layoutScope.takeScreenshot(angular.element($scope.outputContainer), $scope.AddStory);
                    }
                    else {
                        layoutScope.setLoader(false);
                        layoutScope.customAlert("Output is empty.", "Alert");
                    }
                }
                else {
                    layoutScope.setLoader(false);
                    layoutScope.customAlert("Please enter a valid story name.", "Alert");
                }
            }
            else {
                if ($scope.existingStoryName != "") {
                    //Need to add a slide to existing story
                    if ($scope.outputContainer != "") {
                        layoutScope.takeScreenshot(angular.element($scope.outputContainer), $scope.AddSlide);
                    }
                    else {
                        layoutScope.setLoader(false);
                        layoutScope.customAlert("Output is empty.", "Alert");
                    }
                }
                else {
                    layoutScope.setLoader(false);
                    layoutScope.customAlert("Please select a story name.", "Alert");
                }
            }
        }

        $scope.getSlide_StoryInformation = function (value) {
            var slide_StoryInfo = "";
            if (value) {
                slide_StoryInfo = { StoryName: $scope.newStoryName };
            }
            else {
                slide_StoryInfo = { StoryName: $scope.existingStoryName };
            }
            slide_StoryInfo.ModuleName = $scope.selectedModule.ModuleName;
            slide_StoryInfo.Slides = bindSlideInformation();
            return slide_StoryInfo;
        }

        $scope.bindSlideInformation = function () {
            var slideInfo = "";
            //All the selections to be binded in the JSON format
            slideInfo.SlideParameter = $scope.selectedItems;

            return slideInfo;
        }
        /******************************* Story Board Related Scripts End ***************************************************/

        $scope.output = "";
        $scope.modules = [
            {
                ID: 1,
                Name: "SNAPSHOT",
                ModuleName: "SNAPSHOT",
                Children: [],
                IsDisabled: false,
                IsHidden: false,
                State: "defaultState.TopMenu.FilterPanel.SnapShot"
            },
            {
                ID: 2,
                Name: "DEEP DIVE",
                ModuleName: "DEEPDIVE",
                Children: [],
                IsDisabled: false,
                IsHidden: false,
                State: "defaultState.TopMenu.FilterPanel.DeepDive"
            },
            {
                ID: 3,
                Name: "CROSS TAB",
                ModuleName: "CROSSTAB",
                Children: [],
                IsDisabled: false,
                IsHidden: false,
                State: "defaultState.TopMenu.FilterPanel.CrossTab"
            },
            {
                ID: 4,
                Name: "GROWTH OPPORTUNITY",
                ModuleName: "GROWTHOPPORTUNITY",
                Children: [],
                IsDisabled: false,
                IsHidden: false,
                State: "defaultState.TopMenu.FilterPanel.GrowthOpportunity"
            },
            {
                ID: 5,
                Name: "REPORTS HUB",
                ModuleName: "REPORTSHUB",
                Children: [],
                IsDisabled: false,
                IsHidden: false,
                State: "defaultState.TopMenu.ReportsHub"
            },
            {
                ID: 7,
                Name: "DATA EXPLORER",
                ModuleName: "DATAEXPLORER",
                Children: [],
                IsDisabled: false,
                IsHidden: false,
                State: "defaultState.TopMenu.DataCrossTab"
            },
            {
                ID: 6,
                Name: "MY STORYBOARD",
                ModuleName: "MYSTORYBOARD",
                Children: [],
                IsDisabled: false,
                IsHidden: false,
                State: "defaultState.TopMenu.MyStoryBoard"
            }
            
        ];

        $scope.settings_list = [
            //{ Name: "Change Password", Handler: function () { $scope.$parent.showChangePassword = true; }, IsHidden: false },
            //{ Name: "Brand Hierarchy", Handler: $scope.BrandHierarchyExcel, IsHidden: false },
            { Name: "Worldpanel Online", Handler: $scope.$parent.redirectToKantar, IsHidden: false },
            { Name: "Guide Document", Handler: $scope.$parent.GuideDocumentDownload, IsHidden: false },
            { Name: "Support", Handler: $scope.$parent.SupportPop, IsHidden: false },
            //{ Name: "Mail Subscription", Handler: $scope.$parent.getSubscriptionData, IsHidden: false },
            { Name: "Logout", Handler: $scope.$parent.logOut, IsHidden: false },
        ];

        $scope.getSettingsLength = function () {
            let filtered = $scope.settings_list.filter(function (item) { return item.IsHidden != true });
            return filtered != undefined ? filtered.length : 0;
        }

        $scope.showSubMenu = function (m) {
            for (let i = 0; i < $scope.modules.length; i++) {
                $scope.modules[i].show = false;
            }
            $scope.isAnyMenuHovered = true;
            m.show = true;
        }

        $scope.hideSubMenu = function () {
            for (let i = 0; i < $scope.modules.length; i++) {
                $scope.modules[i].show = false;
            }
            $scope.isAnyMenuHovered = false;
        }

        $scope.AddStory = function (baseImage) {
            var ModuleId = _.result(_.find($scope.modules, function (obj) {
                return obj.isActive == true;
            }), 'ID');
            var story = { ModuleId: ModuleId, StoryName: $scope.newStoryName, SlideName: $scope.AdditionalInfo.SlideName, Selection: $scope.submittedFilterJSON, AddtionalInfo: JSON.stringify($scope.AdditionalInfo), base64: baseImage };
            StoryBoardService.AddStory(story).then(function (response) {
                layoutScope.setLoader(false);
                $scope.isSavetoStory = false;
                if (response.data) {
                    layoutScope.customAlert("Story added successfully.", "Alert");
                }
                else if (!response.data) {
                    layoutScope.customAlert("Story adding is failed.", "Alert");
                }
            }, function (error) {
                layoutScope.setLoader(false);
                layoutScope.customAlert("Story adding is failed.", "Alert");
            });
        }
        $scope.StoriesToSave = function () {
            if (!layoutScope.validateSession()) {
                return;
            }
            layoutScope.setLoader(true);
            var ModuleId = _.result(_.find($scope.modules, function (obj) {
                return obj.isActive == true;
            }), 'ID');
            StoryBoardService.StoriesToSave(ModuleId).then(function (response) {             
                //Bind the list of stories returned to the dropdown in the front end.
                if (response.data != null) {
                    $scope.storyNames = [];
                    var data = response.data;
                    if (data.length != 0) {
                        $scope.error = "";
                        for (var i = 0; i < data.length; i++) {
                            if (i == 0) {
                                $scope.existingStoryName = data[i].StoryID;
                            }
                            $scope.storyNames.push(data[i]);
                        }
                    }
                    else
                        $scope.error = "Existing Stories are not available";
                }
                layoutScope.setLoader(false);
            }, function (error) {
                layoutScope.setLoader(false);
                layoutScope.customAlert("Story loading is failed.");
            });
        }
        $scope.AddSlide = function (baseImage) {
            var ModuleId = _.result(_.find($scope.modules, function (obj) {
                return obj.isActive == true;
            }), 'ID');
            var slide = {ModuleId: ModuleId, SlideName: $scope.AdditionalInfo.SlideName,Selection: $scope.submittedFilterJSON, StoryID: $scope.existingStoryName, base64: baseImage, AddtionalInfo: JSON.stringify($scope.AdditionalInfo) };
            StoryBoardService.AddSlide(slide).then(function (response) {
                layoutScope.setLoader(false);
                $scope.isSavetoStory = false;
                if (response.data) {
                    layoutScope.customAlert("Slide added successfully.", "Alert");
                }
                else if (!response.data) {
                    layoutScope.customAlert("Slide adding is failed.", "Alert");
                }
            }, function (error) {
                layoutScope.setLoader(false);
                layoutScope.customAlert("Slide adding is failed.", "Alert");
            })
        };

        $scope.UpdateSlide = function (isSlideUpdate, slidesOfStory, StoryBoardModules, StoryBoardSlectedModule, selectedStoryId, isLtdSlidesUpdate) {
            $scope.isSlideUpdate = isSlideUpdate;
            $scope.SlideDetails = slidesOfStory;
            $scope.StoryBoardModules = StoryBoardModules;
            $scope.StoryBoardSlectedModule = StoryBoardSlectedModule;
            $scope.selectedStoryId = selectedStoryId;

            if (isLtdSlidesUpdate != null || isLtdSlidesUpdate != undefined) {
                $scope.isLtdSlidesUpdate = isLtdSlidesUpdate;
            }

            if ($scope.SlideDetails.length > 0) {
                var module = _.find($scope.modules, function (obj) { return slidesOfStory[0].ModuleId == obj.ID });
                if (module.isActive) {
                    //leave
                }
                else {
                    layoutScope.clickModule(module, $scope.modules);
                }
            }
        }

        $scope.setIsDownloadLtdSlide = function (flag, index, slideIds, slides) {
            $scope.isDownloadLtdSlide = flag;
            $scope.storyIndex = index;
            $scope.slideIds = slideIds;
            $scope.slides = slides;
        };

        $scope.setSelection = function (tempModuleSelection) {
            $scope.submittedFilterJSON = tempModuleSelection;
        };

        $scope.getSuffixForStory = function (story) {
            var output = "";
            if (story.CreUserId != story.CurUserId) {
                output = " - " + story.CreUser
            }
            if (story.IsShared) {
                output = output + " *"
            }
            return output;
        }

        $scope.checkIsSSO = function () {
            $http.post(applicationPath + 'Default/CheckIsSSO').then(function (response) {
                $scope.$parent.isSSO = response.data === "True" ? true : false;
                $scope.settings_list[0].IsHidden = $scope.$parent.isSSO;
            });
        };

        $scope.updateNiceScroll = function (selector) {
            setTimeout(function () {
                $(selector).getNiceScroll().resize();
            });
        };

        $scope.removeNiceScrollRail = function () {
            $(".nicescroll-rails").remove();
        };

        $scope.getTrustedHtml = function (string) {
            return $sce.trustAsHtml(string);
        };

        $scope.updateCustomEllipsis = function () {
            document.querySelectorAll("[text-custom-ellipsis]").forEach(function (d) {
                let container = d;
                let span = container.querySelector("span");
                if (container === undefined || span === undefined || container === null || span === null)
                    return;
                while (container.clientHeight !== 0 && span.offsetHeight > container.clientHeight) { // Check if the paragraph's height is taller than the container's height. If it is:               
                    span.textContent = span.textContent.replace(/\W*\s(\S)*$/, '...'); // add an ellipsis at the last shown space        
                }
            });
        };

        $scope.setFooterIcon = function (operation) {
            $scope.showFooterIcon = false;
            for (var i = 0; i < $scope.footNotes.length; i++) {
                if ($scope.footNotes[i].show() == true) {
                    $scope.showFooterIcon = true;
                    break;
                }
            }
            return false;
        }

        $scope.getFooterText = function () {
            var output = ""
            angular.forEach($scope.footNotes, function (obj) {
                if (obj.show()) {
                    output += obj.text + "\n";
                }
            });
            return output.substring(0, output.lastIndexOf("\n"));
        }

    }]);

    app.register.directive("textCustomEllipsis", function ($timeout) {
        return {
            link: function (scope, element, attrs) {
                let container = element[0];
                let span = container.querySelector("span");
                if (container === undefined || span === undefined || container === null || span === null)
                    return;
                $timeout(function () {
                    while (container.clientHeight !== 0 && span.offsetHeight > container.clientHeight) { // Check if the paragraph's height is taller than the container's height. If it is:               
                        span.textContent = span.textContent.replace(/\W*\s(\S)*$/, '...'); // add an ellipsis at the last shown space
                    }
                });
            }
        };
    });
})