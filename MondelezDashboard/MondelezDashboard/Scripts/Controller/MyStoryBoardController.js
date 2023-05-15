"use strict";
define(['app', 'angular', 'jquery', 'StoryBoardService', 'lodash', 'ajaxservice', 'JqueryUi', 'constants'], function (app, angular, $) {
    app.register.controller("MyStoryBoardController", ['$scope', '$css', '$sce', 'AjaxService', 'Constants', 'StoryBoardService', function ($scope, $css, $sce, AjaxService, Constants, StoryBoardService) {
        let layoutScope = $scope.$parent.$parent;
        let topMenuScope = $scope.$parent;
        let selectedModule = topMenuScope.modules[6];
        selectedModule.isActive = true;
        topMenuScope.setStoryBoardFooter(true);
        topMenuScope.resetFootNotes();
        $scope.isLtdSlidesUpdate = false;

        $scope.myStoryNames = [];

        $scope.submodules = [
        {
            "Name": "Saved Stories",
            "Isselected": true,
            "SUB": []
        },
        {
            "Name": "Shared Stories",
            "Isselected": false,
            "SUB": [
                { "Name": "Shared with me", "Isselected": false },
                { "Name": "Shared by me", "Isselected": false }
            ]
        }
        ];


        $scope.ActiveModule = 
        $scope.showSubItems = false;
        $scope.isallSlidesSelected = false;
        $scope.showStory = 0;
        $scope.showDeleteAlert = false;
        $scope.showStoryNameEdit = false;
        $scope.newStoryName = "";
        $scope.saveStoryName = "";
        $scope.showSlideInformation = false;
        $scope.slideInfoJson = {};
        $scope.isShareStory = false;
        $scope.selectedSlide = -1;
        $scope.deleteUpdateText = "";
        $scope.isStoryDelete = true;
        $scope.isUpdateStory = false;
        $scope.viewSlideZoom = false;
        $scope.slideViewTitle = "";
        $scope.selectedSlideView = "";
        $scope.usersList = [];
        $scope.noStory_Error = "";
        $scope.isStoryAvailable = false;
        $scope.showDeleteOptions = false;
        $scope.searchStory = "";
        $scope.searchUser = "";
        $scope.selectedSubItem = "";
        $scope.showSelectedSubOption = false;
        $scope.isSaveStoryRunning = false;

        let selectedStoryId = 0, selectedSlideId = 0, selectedSlides = "", selectedUserEmails = "", selectedUserIds = "|";

        var CheckResponse = function (response) {
            if (response.status == 401) {
                layoutScope.setLoader(false);
                var logout = function () { window.location = '../Home/logout'; }
                layoutScope.customAlert("Session Timeout", "ALERT", logout, logout, "OK");
                setTimeout(function () { logout(); }, 10000);
                console.log(response);
            }
        }

        $scope.clickOnPage = function () {
            $scope.showSubItems = false;
        }
        $scope.RemoveStorySelection = function () {
            if ($scope.searchStory != "") {
                $scope.showStory = -1;
                $scope.slidesOfStory = [];
            }
            else {
                this.LoadSlides(topMenuScope.storyNames[0].StoryID, 0);
            }
        }
        $scope.LoadStoriesOfUser = function () {
            if (topMenuScope.isDownloadLtdSlide) {
                selectedSlides = topMenuScope.slideIds
            }
            if (topMenuScope.StoryBoardModules.length > 0) {
                StoryBoardService.SetLock(topMenuScope.selectedStoryId, false).then(function (response) {
                    if (topMenuScope.isDownloadLtdSlide) {
                        selectedSlides = topMenuScope.slideIds
                        $scope.DownloadStory(topMenuScope.selectedStoryId, 0, topMenuScope.slides);
                    }
                }, function (error) { CheckResponse(error); });
                $scope.submodules = topMenuScope.StoryBoardModules;
                $scope.selectedSubItem = topMenuScope.StoryBoardSlectedModule;
                $scope.isLoadUpdatedStory = true;
                if (topMenuScope.StoryBoardModules[1].Isselected) {
                    $scope.ViewSharedStories(topMenuScope.StoryBoardSlectedModule);
                    topMenuScope.UpdateSlide(false, [], [], "", topMenuScope.selectedStoryId,false);
                    layoutScope.setStoryBoardLoader(false);
                    return;
                }
                layoutScope.setStoryBoardLoader(false);
                topMenuScope.UpdateSlide(false, [], [], "", topMenuScope.selectedStoryId,false);
                topMenuScope.StoryBoardModules = [];
            }
            layoutScope.setLoader(true);
            for (var selectedChild in selectedModule.Children) {
                if (selectedModule.Children[selectedChild].ModuleName === $scope.selectedChildModule)
                    selectedModule.Children[selectedChild].isActive = true;
            }
            StoryBoardService.SavedStories($scope.selectedChildModule).then(function (response) {
                layoutScope.setLoader(false);
                BindStories(response, false);
            }, function (error) {
                layoutScope.setLoader(false);
                layoutScope.customAlert("Story loading is failed.", "Alert");
                CheckResponse(error);
            });
        }

    
        let BindStories = function (response, isShared) {
            //Bind the list of stories returned to the dropdown in the front end.
            if (response.data != null) {
                topMenuScope.storyNames = [];
                var data = response.data;
                if (data.length != 0) {
                    $scope.isStoryAvailable = true;
                    $scope.showStory = 0;
                    $scope.noStory_Error = "";
                    var index = -1;
                    for (var i = 0; i < data.length; i++) {
                        topMenuScope.storyNames.push(data[i]);
                        if ($scope.isLoadUpdatedStory) {
                            if (topMenuScope.selectedStoryId == data[i].StoryID)
                                index = i;
                        }
                    }
                    $scope.StoryCount = topMenuScope.storyNames.length;
                    layoutScope.setLoader(true);
                    if ($scope.isLoadUpdatedStory) {
                        selectedStoryId = topMenuScope.selectedStoryId;
                        $scope.LoadSlides(selectedStoryId, index);
                        $scope.isLoadUpdatedStory = false;
                        return;
                    }
                    StoryBoardService.LoadStorySlides(topMenuScope.storyNames[0].StoryID).then(function (response) {
                        selectedStoryId = topMenuScope.storyNames[0].StoryID;                        
                        BindSlidesOfStories(response);
                        layoutScope.setLoader(false);
                    }, function (error) {
                        layoutScope.setLoader(false);
                        layoutScope.customAlert("Error in loading slides.", "Alert");
                        CheckResponse(error);
                    });
                }
                else {
                    $scope.isStoryAvailable = false;
                    $scope.noStory_Error = "Stories are not available";
                }
            }
        }

        StoryBoardService.StoryBoardScope($scope);

        $scope.GetMySavedStories = function () {
            StoryBoardService.StoriesToSave("").then(function (response) {
                if (response.data != null) {
                    $scope.myStoryNames = [];
                    var data = response.data;
                    if (data.length != 0) {
                        for (var i = 0; i < data.length; i++) {
                            $scope.myStoryNames.push(data[i]);
                        }
                    }
                }
                layoutScope.setLoader(false);
            });
        }

        $scope.GetMySavedStories();
       
        $scope.slidesOfStory = [];
        $scope.slideCountInRow = 3;
        $scope.slideCountInCol = 2;
        $scope.LoadSlides = function (storyId, index) {
            selectedStoryId = storyId, selectedSlideId = 0, selectedSlides = "";
            $scope.showStory = index;
            $scope.isallSlidesSelected = false;
            layoutScope.setLoader(true);
            StoryBoardService.LoadStorySlides(storyId).then(function (response) {
                BindSlidesOfStories(response);
                layoutScope.setLoader(false);
            }, function (error) {
                layoutScope.setLoader(false);
                layoutScope.customAlert("Error in loading slides.", "Alert");
                CheckResponse(error);
            });
        }

        $scope.ViewSavedOrSharedStory = function (value) {
            $scope.searchStory = "";
            if (value == $scope.submodules[0].Name) {
                $scope.selectedSubItem = "";
                $scope.showSelectedSubOption = false;
                $scope.submodules[0].Isselected = true;
                $scope.submodules[1].Isselected = false;
                $scope.showSubItems = false;
                //Load the saved stories
                $scope.LoadStoriesOfUser();
            }
            else if (value == $scope.submodules[1].Name) {
                $scope.submodules[0].Isselected = false;
                $scope.submodules[1].Isselected = true;
                $scope.showSubItems = !$scope.showSubItems;
            }
        }

        $scope.ViewSharedStories = function (value) {
            layoutScope.setLoader(true);
            $scope.showSubItems = false;
            $scope.searchStory = "";
            $scope.showSelectedSubOption = true;
            $scope.selectedSubItem = value;
            if (value == $scope.submodules[1].SUB[0].Name) {
                //Load shared with me stories
                StoryBoardService.LoadSharedStories(true, $scope.selectedChildModule).then(function (response) {
                    layoutScope.setLoader(false);
                    BindStories(response, true);
                }, function (error) {
                    layoutScope.setLoader(false);
                    layoutScope.customAlert("Story loading is failed.", "Alert");
                    CheckResponse(error);
                });
            }
            else {
                //Load shared by me stories
                StoryBoardService.LoadSharedStories(false, $scope.selectedChildModule).then(function (response) {
                    layoutScope.setLoader(false);
                    BindStories(response, true);
                }, function (error) {
                    layoutScope.setLoader(false);
                    layoutScope.customAlert("Story loading is failed.", "Alert");
                    CheckResponse(error);
                });
            }
        }

        $scope.ViewEditStoryName = function (storyId, index) {
            selectedStoryId = storyId;
            MakeStoryActive(storyId, index);
            var story = $scope.storyNames.filter(function (d) { return d.StoryID == storyId })
            $scope.newStoryName = story[0].StoryName;
            $scope.showStoryNameEdit = true;
        }
        $scope.DeleteStoryPop = function (storyId, index) {
            MakeStoryActive(storyId, index);
            StoryBoardService.GetLockStatus(storyId).then(function (response) {
                if (response.data != undefined && response.data.IsLocked === false) {
                    selectedStoryId = storyId;
                    $scope.showDeleteAlert = true;
                    $scope.showDeleteOptions = true;
                    if ($scope.selectedSubItem == 'Shared with me' || $scope.selectedSubItem == 'Shared by me') {
                        $scope.deleteUpdateText = "Story will be deleted for all users.Are you sure you want to delete the entire story?";
                    }
                    else {
                        $scope.deleteUpdateText = "Do you wish to delete the entire story?";
                    }               
                    $scope.isStoryDelete = true;
                }
                else {
                    layoutScope.customAlert("Story is locked.", "Alert");
                }
            }, function (error) {
                layoutScope.customAlert("Story deleted has failed.", "Alert");
                CheckResponse(error);
            })
        }
        $scope.DeleteSelectedSlides = function () {
            StoryBoardService.GetLockStatus(selectedStoryId).then(function (response) {
                if (response.data != undefined && response.data.IsLocked === false) {
                    $scope.showDeleteAlert = true;
                    $scope.showDeleteOptions = true;
                    if ($scope.selectedSubItem == 'Shared with me' || $scope.selectedSubItem == 'Shared by me') {
                        $scope.deleteUpdateText = "Selected Slide(s) will be deleted for all users.Are you sure you want to delete the selected slides?";
                    }
                    else {
                        $scope.deleteUpdateText = "Do you wish to delete the selected slides?";
                    }
                    $scope.isStoryDelete = false;
                }
                else {
                    layoutScope.customAlert("Story is locked.", "Alert");
                }
            })
        }
        $scope.saveASNewStory = function () {
            if ($scope.isSaveStoryRunning)
                return;
            $scope.isSaveStoryRunning = true;
            layoutScope.setLoader(true);
            if (_.includes(_.map($scope.myStoryNames, function (obj) { if (obj.CreUserId == obj.CurUserId) { return obj.StoryName.toLowerCase() } }), $scope.saveStoryName.toLowerCase())) {
                layoutScope.customAlert("Story Name already exists. Please enter a new name.", "Alert");
            }
            else if ($scope.saveStoryName == undefined || $scope.saveStoryName == "")
                layoutScope.customAlert("Please enter a valid story name.", "Alert");
            else {
                StoryBoardService.GetLockStatus(selectedStoryId).then(function (response) {
                    if (response.data != undefined && response.data.IsLocked === false) {
                        StoryBoardService.saveASNewStory(selectedStoryId, $scope.saveStoryName).then(function (response) {
                            layoutScope.setLoader(false);
                            $scope.saveStoryPopup = false;
                            $scope.GetMySavedStories();
                            $scope.isSaveStoryRunning = false;
                            if (response.data === true) {
                                layoutScope.customAlert("Story Saved successful.", "Alert");
                                if ($scope.submodules[0].Isselected) {
                                    $scope.ViewSavedOrSharedStory($scope.submodules[0].Name);
                                }
                            }
                            else {
                                layoutScope.customAlert("Story could not be Saved.", "Alert");
                            }
                        }, function (error) {
                            layoutScope.setLoader(false);
                            $scope.isSaveStoryRunning = false;
                            layoutScope.customAlert("Story could not be Saved.", "Alert");
                            CheckResponse(error);
                        });
                    }
                    else {
                        $scope.isSaveStoryRunning = false;
                        layoutScope.customAlert("Story is locked.", "Alert");
                    }
                }, function (error) {
                    $scope.isSaveStoryRunning = false;
                    layoutScope.customAlert("Story could not be Saved.", "Alert");
                    CheckResponse(error);
                })              
            }
            layoutScope.setLoader(false);
        }

        $scope.ShareStoryView = function (storyId, index) {
            layoutScope.setLoader(true);
            $scope.searchUser = "";
            selectedStoryId = storyId;
            $scope.isShareStory = true;
            MakeStoryActive(storyId, index);

            StoryBoardService.GetUsers(storyId).then(function (response) {
                layoutScope.setLoader(false);
                if (response != undefined && response.data != null) {
                    $scope.usersList = [];
                    $scope.usersList.push({ "UserName": "All", "isSelected": false });
                    for (var data in response.data) {
                        response.data[data].isSelected = response.data[data].isShared;
                        if (response.data[data].isSelected) {
                            selectedUserIds += response.data[data].UserId + "|";
                        }
                        $scope.usersList.push(response.data[data]);
                    }
                }
                else
                    layoutScope.customAlert("Share is not successful.", "Alert");

            }, function (error) {
                layoutScope.setLoader(false);
                layoutScope.customAlert("Share is not successful.", "Alert");
                CheckResponse(error);
            });
        }
        $scope.deleteStory = function (isStory, isUpdate) {
            if (isUpdate) {
                $scope.UpdateStory();
            }
            else if (isStory) {
                layoutScope.setLoader(true);
                StoryBoardService.Delete(selectedStoryId, isStory).then(function (response) {
                    layoutScope.setLoader(false);
                    $scope.GetMySavedStories();
                    if (response != undefined) {
                        PostDeleteAction(response, selectedStoryId, isStory);
                    }
                    else
                        layoutScope.customAlert("Story deleted has failed.", "Alert");
                }, function (error) {
                    layoutScope.setLoader(false);
                    layoutScope.customAlert("Story deleted has failed.", "Alert");
                    CheckResponse(error);
                })
            }
            else {
                if (selectedSlides != "") {
                    layoutScope.setLoader(true);
                    StoryBoardService.Delete(selectedSlides, isStory).then(function (response) {
                        layoutScope.setLoader(false);
                        if (response != undefined) {
                            PostDeleteAction(response, selectedSlides, isStory);
                        }
                        else
                            layoutScope.customAlert("Slides are not deleted.", "Alert");
                    }, function (error) {
                        layoutScope.setLoader(false);
                        layoutScope.customAlert("Slides are not deleted.", "Alert");
                        CheckResponse(error);
                    })
                }
                else {
                    $scope.showDeleteAlert = false;
                    layoutScope.customAlert("Please select the slide(s)", "Alert");
                }
                   
            }
        }
        let PostDeleteAction = function (response, Id, isStory) {
            if (response.data === true) {
                $scope.showDeleteAlert = !response.data;
                $scope.showDeleteOptions = !response.data;
                if (isStory) {
                    layoutScope.customAlert("Story is deleted successfully.", "Alert");
                    //Remove the story 
                    let story = topMenuScope.storyNames.find(function (stories) {
                        return stories.StoryID === Id;
                    });
                    topMenuScope.storyNames.splice(topMenuScope.storyNames.indexOf(story), 1);
                    if (topMenuScope.storyNames.length != 0) {
                        //Remove all the slides of that story
                        $scope.slidesOfStory.length = 0;
                        //Make the first story as active on the page.
                        $scope.showStory = 0;
                        //Bind the slides of the first story
                        StoryBoardService.LoadStorySlides(topMenuScope.storyNames[0].StoryID).then(function (response) {
                            selectedStoryId = topMenuScope.storyNames[0].StoryID;
                            BindSlidesOfStories(response);
                            layoutScope.setLoader(false);
                        }, function (error) {
                            layoutScope.setLoader(false);
                            layoutScope.customAlert("Error in loading slides.", "Alert");
                            CheckResponse(error);
                        });
                    }
                    else {
                        $scope.isStoryAvailable = false;
                        $scope.noStory_Error = "Stories are not available";
                    }
                }
                else {
                    layoutScope.customAlert("Slides are deleted successfully.", "Alert");
                    var slideIds = Id.substring(0, Id.length - 1).split(',');
                    if (slideIds.length == $scope.slidesOfStory.length) {
                        PostDeleteAction(response, selectedStoryId, true)
                    }
                    for (var slideId in slideIds) {
                        if (slideIds[slideId] != "") {
                            let slide = $scope.slidesOfStory.find(function (slides) {
                                return slides.SlideID == slideIds[slideId];
                            });
                            $scope.slidesOfStory.splice($scope.slidesOfStory.indexOf(slide), 1);
                        }
                    }
                    selectedSlides = "";
                }
            }
        }
        $scope.editStoryName = function () {
            if ($scope.newStoryName != undefined && $scope.newStoryName != "") {
                var story = topMenuScope.storyNames.find(function (stories) {
                    return stories.StoryID === selectedStoryId && stories.StoryName != $scope.newStoryName;
                });
                if (story != undefined && story != null) {
                    layoutScope.setLoader(true);
                    StoryBoardService.EditStoryName(selectedStoryId, $scope.newStoryName).then(function (response) {
                        layoutScope.setLoader(false);
                        $scope.showStoryNameEdit = false;
                        $scope.GetMySavedStories();
                        if (response.data === true) {
                            layoutScope.customAlert("Story Name edit is successful.", "Alert");
                            //Update the story name in the array
                            //let story = topMenuScope.storyNames.find(function (stories) {
                            //    return stories.StoryID === selectedStoryId;
                            //});
                            if (story !== undefined)
                                story.StoryName = $scope.newStoryName;
                        }
                        else {
                            $scope.showStoryNameEdit = true;
                            layoutScope.customAlert("Story Name already exists. Please enter a new name.", "Alert");
                        }
                    }, function (error) {
                        layoutScope.setLoader(false);
                        layoutScope.customAlert("Story Name could not be changed.", "Alert");
                        CheckResponse(error);
                    });
                }
                else
                    layoutScope.customAlert("Story Name is same as the old name.", "Alert");
            }
            else
                layoutScope.customAlert("Please enter a valid story name.", "Alert");
        }
        $scope.showSlideInfo = function (slideId, slideObj) {
            selectedSlideId = slideId;
            $scope.showSlideInformation = true;
            LoadSlideInfo(slideId, false, slideObj);
        }

        let LoadSlideInfo = function (slideId, isViewSlide, slideObj) {
            sessionStorage.SlideSelections = "";
            sessionStorage.WidgetId = 0;
            sessionStorage.ActiveAdId = 0;
            var isPush = false;
            var slideParameters = JSON.parse(slideObj.SelectionJSON)
            if (!isViewSlide) {
                var slideInfoArray = slideParameters;
                $scope.slideInfoJson = [];
                for (var slideInfoIndex = 0; slideInfoIndex < slideInfoArray.length; slideInfoIndex++) {
                    isPush = true;
                    if (slideInfoArray[slideInfoIndex].SelectionText == "") {
                        isPush = false;
                    }
                    if (isPush && slideParameters[0].SelectionText.toLowerCase().indexOf("demographics-single") < 0 && _.includes(["primary brands", "secondary brands"], slideInfoArray[slideInfoIndex].Name.toLowerCase())) {
                        isPush = false;
                    }
                    else if (isPush && slideParameters[0].SelectionText.toLowerCase().indexOf("demographics-single") > -1 && _.includes(["brands"], slideInfoArray[slideInfoIndex].Name.toLowerCase())) {
                        isPush = false;
                    }
                    if (isPush) {
                        $scope.slideInfoJson.push({ Key: slideInfoArray[slideInfoIndex].Name.toUpperCase(), Value: slideInfoArray[slideInfoIndex].SelectionText.toUpperCase() });
                    }                       
                }
            } 
        }

        $scope.SelectSlide = function (slideId, index) {
            //If the current slide Id is not available then
            //it means Select all is not selected and so add or else remove
            if (selectedSlides.indexOf(slideId) == -1) {
                selectedSlides += slideId + ",";
                let slide = $scope.slidesOfStory.find(function (slides) {
                    return slides.SlideID === slideId;
                });
                slide.isSlideSelected = true;
            }
            else {
                selectedSlides = selectedSlides.split(slideId + ',').join('');
                let slide = $scope.slidesOfStory.find(function (slides) {
                    return slides.SlideID === slideId;
                });
                slide.isSlideSelected = false;
                if ($scope.isallSlidesSelected)
                    $scope.isallSlidesSelected = !$scope.isallSlidesSelected;
            }
            console.log(selectedSlides);
        }
        $scope.SelectAllSlides = function () {
            selectedSlides = "";
            $scope.isallSlidesSelected = !$scope.isallSlidesSelected;
            //Get all the selected slide Id's if the check is true
            if ($scope.isallSlidesSelected) {
                for (var slide in $scope.slidesOfStory) {
                    selectedSlides += $scope.slidesOfStory[slide].SlideID + ",";
                    $scope.slidesOfStory[slide].isSlideSelected = true;
                }
            }
            else {
                for (var slide in $scope.slidesOfStory) {
                    $scope.slidesOfStory[slide].isSlideSelected = false;
                }
            }
            console.log(selectedSlides);
        }
        $scope.ViewSlideScale = function (slideId) {
            $scope.viewSlideZoom = true;
            //var imageScaleDiv = "";
            //if (angular.element(document.querySelector('.slide_Body')).get('currentImage').value == true) {
            //    var imageDiv = angular.element(document.querySelector('.slide_Body'));
            //    imageScaleDiv = angular.element(document.querySelector('.slideView'));
            //    imageScaleDiv.append(imageDiv.clone());
            //}

            let selectedSlide = $scope.slidesOfStory.find(function (slides) {
                return slides.SlideID === slideId;
            });
            $scope.slideViewTitle = selectedSlide.Title;
            $scope.selectedSlideView = selectedSlide.slideImg;
        }
        $scope.SelectedUsers = function (item, index) {
            if (index == 0 && item.UserName == "All") {
                $scope.usersList[0].isSelected = !$scope.usersList[0].isSelected;
                //Selecting All is checked - Select all the users or remove all users
                if ($scope.usersList[0].isSelected) { //Deselected on the page and made selected, add all users 
                    selectedUserIds = "|";
                    for (var user in $scope.usersList) {
                        if ($scope.usersList[user].UserId)
                            selectedUserIds += $scope.usersList[user].UserId + "|";
                        $scope.usersList[user].isSelected = true;
                    }
                }
                else {
                    selectedUserIds = "|";
                    for (var user in $scope.usersList) {
                        $scope.usersList[user].isSelected = false;
                    }
                }
            }
            else {
                //If the current click is deselect, All should be deselected
                if (item.isSelected)
                    $scope.usersList[0].isSelected = false;
                item.isSelected = !item.isSelected;
                if (selectedUserIds.indexOf("|" + item.UserId + "|") == -1)
                    selectedUserIds += item.UserId + "|";
                else 
                    selectedUserIds = selectedUserIds.split(item.UserId + '|').join('');
            }
        }
        $scope.ShareStory = function () {
            if (selectedUserIds != "|") {
                layoutScope.setLoader(true);
                StoryBoardService.ShareStory(selectedUserIds, selectedStoryId).then(function (response) {
                    layoutScope.setLoader(false);
                    if (response.data === true) {
                        selectedUserIds = "|";
                        $scope.isStoryAvailable = true;
                        $scope.isShareStory = false;
                        layoutScope.customAlert("Story Shared Successfully.", "Alert");
                        if ($scope.submodules[0].Isselected) {
                            let story = topMenuScope.storyNames.find(function (stories) {
                                return stories.StoryID === selectedStoryId;
                            });
                            topMenuScope.storyNames.splice(topMenuScope.storyNames.indexOf(story), 1);
                            $scope.slidesOfStory.length = 0;
                            if (topMenuScope.storyNames.length != 0) {
                                $scope.showStory = 0;
                                layoutScope.setLoader(true);
                                StoryBoardService.LoadStorySlides(topMenuScope.storyNames[0].StoryID).then(function (response) {
                                    BindSlidesOfStories(response);
                                    layoutScope.setLoader(false);
                                }, function (error) {
                                    layoutScope.setLoader(false);
                                    layoutScope.customAlert("Error in loading slides.", "Alert");
                                    CheckResponse(error);
                                });
                            }
                            else {
                                $scope.isStoryAvailable = false;
                                $scope.noStory_Error = "Stories are not available.";
                            }
                        }
                    }
                }, function (error) {
                    layoutScope.setLoader(false);
                    selectedUserIds = "|";
                    layoutScope.customAlert("Story Share Failed.", "Alert");
                    CheckResponse(error);
                });
            }
            else
                layoutScope.customAlert("Please select an user to share.", "Alert");
        }
        $scope.ViewSlide = function (slideId, slideObj) {
            //StoryBoardService.GetLockStatus(selectedStoryId).then(function (response) {
            //    if (response.data != undefined && response.data.IsLocked === false) {
            layoutScope.isNavigatedFromOtherModule.isNavigated = true;
            layoutScope.StoryBoardSlideNavigationDetails.isNavigated = true;
            layoutScope.StoryBoardSlideNavigationDetails.Selection = JSON.parse(slideObj.SelectionJSON);
            layoutScope.StoryBoardSlideNavigationDetails.AddtionalInfo = JSON.parse(slideObj.AddtionalInfo);
            layoutScope.clickModule(layoutScope.modules[slideObj.ModuleId - 1], layoutScope.modules);
            //selectedSlideId = slideId;
            //LoadSlideInfo(slideId, true);
            //    }
            //    else
            //        layoutScope.customAlert("Story is locked", "Alert");
            //}), function (error) {

            //}
        }
        var MakeStoryActive = function (storyId, index, isImageUpdate) {
            if (isImageUpdate) {
                layoutScope.setLoader(true);
                $scope.showStory = index;
                StoryBoardService.LoadStorySlides(storyId).then(function (response) {
                    BindSlidesOfStories(response);
                    layoutScope.setLoader(false);
                }, function (error) {
                    layoutScope.setLoader(false);
                    layoutScope.customAlert("Error in loading slides.", "Alert");
                    CheckResponse(error);
                });
            }
            else
                if ($scope.showStory != index) {
                    MakeStoryActive(storyId, index, true);
                }
        }
        $scope.UpdateStoryPopUp = function (storyId, index) {
            selectedStoryId = storyId;
            MakeStoryActive(storyId, index);

            StoryBoardService.GetLockStatus(storyId).then(function (response) {
                if (response.data != undefined && response.data.IsLocked === false) {
                    $scope.deleteUpdateText = "Do you wish to update the entire story?";
                    $scope.isUpdateStory = true;
                    $scope.showDeleteAlert = true;
                    $scope.showDeleteOptions = true;
                }
                else {
                    layoutScope.customAlert("Story is locked.", "Alert");
                }
            });
        }

        $scope.UpdateStory = function (slides) {
            layoutScope.setStoryBoardLoader(true);
            $scope.isUpdateStory = false;
            $scope.showDeleteAlert = false;
            $scope.showDeleteOptions = false;


            var updateSlides = $scope.slidesOfStory;
            if (slides != null || slides != undefined) {
                updateSlides = slides;
            }

            StoryBoardService.SetLock(selectedStoryId,true).then(function (response) {
                if (response.data != undefined && response.data === true) {
                    topMenuScope.UpdateSlide(true, updateSlides, $scope.submodules, $scope.selectedSubItem, selectedStoryId, $scope.isLtdSlidesUpdate);
                }
                else {
                    layoutScope.setStoryBoardLoader(false);
                    layoutScope.customAlert("Story update is failed.", "Alert");
                }                   
            }, function (error) {
                layoutScope.setStoryBoardLoader(false);
                layoutScope.customAlert("Story update is failed.", "Alert");
                CheckResponse(error);
            })         
        }

        let checkForLtdSlides = function (slides, index, slideIds) {
            var flag = false;

            var ltdSlides = _.remove(_.map(slides, function (obj) {
                if (obj.ModuleId == 1 && _.includes([-1001, -1002, -1003, -1004], JSON.parse(obj.SelectionJSON)[3].Selection[0].Selection[0].Id)) { return obj }
            }), undefined)

            if (ltdSlides.length > 0) {
                flag = true;
                $scope.isLtdSlidesUpdate = true;
                topMenuScope.setIsDownloadLtdSlide(true, index, slideIds, slides);
                layoutScope.setStoryBoardLtdLoader(true);
                $scope.UpdateStory(ltdSlides);
            }

            return flag;
        }

        $scope.DownloadStory = function (storyId, index, slides) {
            MakeStoryActive(storyId, index);
            if (slides == null && slides == undefined) {
                slides = $scope.slidesOfStory
            }
            StoryBoardService.GetLockStatus(storyId).then(function (response) {
                if (response.data != undefined && response.data.IsLocked === false) {

                    if (!topMenuScope.isDownloadLtdSlide && checkForLtdSlides($scope.slidesOfStory, index, "")) {
                        return;
                    }
                    topMenuScope.setIsDownloadLtdSlide(false, -1, topMenuScope.slideIds);
                    layoutScope.setLoader(true);
                    
                    StoryBoardService.PreparePPTTemplate(slides, true).then(function (response) {
                        if (response.data) {
                            layoutScope.DownloadFile(response);
                            layoutScope.setStoryBoardLtdLoader(false);
                        }
                        else {
                            layoutScope.setLoader(false);
                            layoutScope.setStoryBoardLtdLoader(false);
                            layoutScope.customAlert("Story Download is failed.", "Alert");
                        }
                    }, function (error) {
                        layoutScope.setLoader(false);
                        layoutScope.setStoryBoardLtdLoader(false);
                        layoutScope.customAlert("Story Download is failed.", "Alert");
                        CheckResponse(error);
                    })
                }
                else
                    layoutScope.customAlert("Story is locked.", "Alert");
            }, function (error) {
                layoutScope.setLoader(false);
                layoutScope.setStoryBoardLtdLoader(false);
                layoutScope.customAlert("Story Download is failed.", "Alert");
                CheckResponse(error);
            })
        }

        $scope.DownloadSlides = function (slideIds, slides) {
            if (slideIds != null || slideIds != undefined) {
                selectedSlides = slideIds;
            }
            if (selectedSlides != "") {
                layoutScope.setLoader(true);
                var selectedSlideObj = [];
                if (slides != null || slides != undefined) {
                    selectedSlideObj = slides;
                }
                else {
                    selectedSlideObj = _.map($scope.slidesOfStory, function (obj) {
                        if (_.includes(selectedSlides.split(','), obj.SlideID.toString()))
                            return obj;
                    })
                    selectedSlideObj = _.remove(selectedSlideObj, undefined);
                }
                StoryBoardService.GetLockStatus(selectedSlideObj[0].StoryID).then(function (response) {
                    if (response.data != undefined && response.data.IsLocked === false) {
                        layoutScope.setLoader(true);

                        if (!topMenuScope.isDownloadLtdSlide && checkForLtdSlides(selectedSlideObj, -1, selectedSlides)) {
                            return;
                        }
                        topMenuScope.setIsDownloadLtdSlide(false, -1, topMenuScope.slideIds);

                        StoryBoardService.PreparePPTTemplate(selectedSlideObj, false).then(function (response) {
                            if (response.data) {
                                layoutScope.DownloadFile(response);
                            }
                            else {
                                layoutScope.setLoader(false);
                                layoutScope.customAlert("Slide download is failed.", "Alert");
                            }
                        }, function (error) {
                            layoutScope.setLoader(false);
                            CheckResponse(error);
                            layoutScope.customAlert("Slide download is failed.", "Alert");
                        })
                    }
                    else {
                        layoutScope.setLoader(false);
                        layoutScope.customAlert("Story is locked.", "Alert");
                    }
                        
                }, function (error) {
                    layoutScope.setLoader(false);
                    layoutScope.customAlert("Story Download is failed.", "Alert");
                    CheckResponse(error);
                })
            }
            else
                layoutScope.customAlert("Please select the slide(s)", "Alert");
        }

        let PreparePPT = function (objectId, isStory, storyName) {
            StoryBoardService.PreparePPT(objectId, isStory, $scope.selectedChildModule).then(function (response) {
                layoutScope.setLoader(false);
                if (response.data !== "") {
                    window.location.href = apiUrl + "download/downloadfile?file=" + response.data + "&fileName=" + encodeURIComponent(storyName + ".pptx");
                    layoutScope.setLoader(false);
                }
                else {
                    layoutScope.setLoader(false);
                    if (isStory)
                        layoutScope.customAlert("Story Download is failed.", "Alert");
                    else
                        layoutScope.customAlert("Slide Download is failed.", "Alert");
                }
            }, function (error) {
                layoutScope.setLoader(false);
                if (isStory)
                    layoutScope.customAlert("Story Download is failed.", "Alert");
                else
                    layoutScope.customAlert("Slide Download is failed.", "Alert");
                CheckResponse(error);
            });
        }
        let BindSlidesOfStories = function (response) {
            $scope.isallSlidesSelected = false;
            if (response !== undefined) {
                layoutScope.setLoader(false);
                if (response.data !== null) {
                    //Bind all the slide information
                    var data = response.data;
                    $scope.slidesOfStory.length = 0;
                    for (var slideIndex = 0; slideIndex < data.length; slideIndex++) {
                        data[slideIndex].slideImg = "/StoryBoardImages/" + data[slideIndex].SlidePath.replace(/\\/g, "/") + "?" + Math.random();
                        data[slideIndex].isSlideSelected = false;
                        if(topMenuScope.slideIds.indexOf(data[slideIndex].SlideID) != -1) {
                            data[slideIndex].isSlideSelected = true;
                            selectedSlides = topMenuScope.slideIds;
                            if (topMenuScope.slideIds.substr(0, topMenuScope.slideIds.length - 1).split(',').length == data.length) {
                                $scope.isallSlidesSelected = true;
                            }
                        }

                        let titleInfo = JSON.parse(data[slideIndex].AddtionalInfo);
                        data[slideIndex].Title = titleInfo.SlideName;
                        $scope.slidesOfStory.push(data[slideIndex]);
                    }
                }
            }
            else {
                layoutScope.customAlert("Error in loading slides.", "Alert");
            }
        }
        $scope.leftScroll = function () {
            document.querySelector('div.stories').scrollLeft -= angular.element("div.stories .story")[0].offsetWidth;
        }
        $scope.righScroll = function () {
            if ((angular.element("div.stories .story")[0].offsetWidth * (angular.element("div.stories .story").length - 5)) == document.querySelector('div.stories').scrollLeft) {
                return
            }
            document.querySelector('div.stories').scrollLeft += angular.element("div.stories .story")[0].offsetWidth;
        }

        $scope.RearrangeSlides = function () {
            layoutScope.setLoader(true);
            var slideIds = "";
            for (var slides in $scope.slidesOfStory)
                slideIds += $scope.slidesOfStory[slides].SlideID + ",";
            StoryBoardService.RearrangeSlides(slideIds).then(function (response) {
                layoutScope.setLoader(false);
            }, function (error) {
                layoutScope.setLoader(false);
                CheckResponse(error);
            })
        }
        $scope.NavigateToCrossTab = function (Story) {
            layoutScope.setLoader(true);
            AjaxService.AjaxPost({}, apiUrl + "/filterpanel/" + "GetCrossTabMySelections", function (response) {
                let Data = GetMyStorySelectionsObj(response.data);
                let Requiredstory = _.find(Data, { Id: Story.StoryID });
                if (Requiredstory && Requiredstory.Selections.length == 0) {
                    layoutScope.setLoader(false);
                    layoutScope.customAlert("There are no tables for this story.", "Alert");
                }
                else if (Requiredstory && Requiredstory.Selections.length > 0) {
                    layoutScope.SetTagStoryMySelection(_.cloneDeep(Story));
                    layoutScope.clickModule(layoutScope.modules[2], layoutScope.modules);
                }
            },
            function(){
                layoutScope.setLoader(false);
                layoutScope.customAlert("Error in loading Tables.", "Alert");
                CheckResponse(error);
            })
        }
        let GetMyStorySelectionsObj = function (data) {
            data.AllSelection = [];
            angular.forEach(data.Storys, function (obj) {
                obj.Selections = _.remove(_.map(data.StorySelectionMapping, function (item) {
                    if (item.TagId == obj.Id) {return item;}
                }), undefined);
            });
            return data.Storys;
        }

    }]);

    app.register.filter("searchStories", function () {
        return function (list, search, input2) {
            if (search === undefined || search === "")
                return list;
            return list.filter(function (d) {
                return d.StoryName.toLowerCase().search(search.toLowerCase()) > -1;
            });
        }
    });

    app.register.filter("searchUsers", function () {
        return function (list, search, input2) {
            if (search === undefined || search === "")
                return list;
            return list.filter(function (d) {
                return d.UserName.toLowerCase().search(search.toLowerCase()) > -1;
            });
        }
    });

    app.register.directive("draggableItem", function () {
        return {
            link: function (scope, elem, attr) {
                elem[0].ondragstart = function (event) {
                    scope.$parent.selectedItem = scope.items;
                };
            }
        };
    });

    app.register.directive("dropContainer", function () {
        return {
            link: function (scope, elem, attr) {
                elem[0].ondrop = function (event) {
                    //event.preventDefault();
                    //let selectedIndex = scope.slidesOfStory.indexOf(scope.$parent.selectedItem);
                    //let newPosition = scope.slidesOfStory.indexOf(scope.items);
                    //scope.$parent.slidesOfStory.splice(selectedIndex, 1);
                    //scope.$parent.slidesOfStory.splice(newPosition, 0, scope.$parent.selectedItem);
                    //scope.$apply();
                    //scope.RearrangeSlides();
                };
            }
        };
    });

    app.register.directive("draggrbleContainer", function () {
        return {
            link: function (scope, elem, attr) {
                elem[0].ondragover = function (event) {
                    //event.preventDefault();
                    //let scrollContainer = document.querySelector(".slide_Container .simplebar-scroll-content");
                    //let startPosition = scrollContainer.offsetTop;
                    //let endPosition = scrollContainer.offsetTop + scrollContainer.offsetHeight;
                    //let positionDelta = 50;
                    //let scrollSpeed = 5;
                    //
                    //if (event.clientY > (endPosition - positionDelta)) {
                    //    for (let i = 0; i < scrollSpeed; i++)
                    //        scrollContainer.scrollTop += i;
                    //}
                    //else if (event.clientY < (startPosition + positionDelta)) {
                    //    for (let i = 0; i < scrollSpeed; i++)
                    //        scrollContainer.scrollTop -= i;
                    //}
                };
            }
        };
    });
});