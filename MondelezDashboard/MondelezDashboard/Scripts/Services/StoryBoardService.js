
define(['app'], function (app) {

    app.register.service('StoryBoardService', function ($http) {       
        let layoutScope = {}, scope = {}, storyBoardScope = {};
        this.initialize = function (layoutValue, scopeValue) {
            layoutScope = layoutValue;
            scope = scopeValue;
            layoutScope.setLoader(true);
        }
        this.StoryBoardScope = function (storyboardScope) {
            storyBoardScope = storyboardScope;
        }
        scope.error = "";
        //Story related service calls
        this.AddStory = function (story) {
            return $http.post(apiUrl + "/storyboard/AddStory", story, { });
        }
        this.ShareStory = function (userids, storyId) {
            var data = { UserIdsToShare: userids, StoryID: storyId }
            return $http.post(apiUrl + "/Storyboard/ShareStory", data, { });
        }
        this.SavedStories = function (ModuleId) {
            var data = { ModuleId: ModuleId };
            return $http.post(apiUrl + "/storyboard/SavedStories", data, {});
        };
        this.StoriesToSave = function (ModuleId) {
            scope.existingStoryName = "";
            var data = { ModuleId: ModuleId };
            return $http.post(apiUrl + "/storyboard/StoriesToSave", data, {});
        }
        this.LoadStorySlides = function (storyId) {
            return $http.post(apiUrl + "/Storyboard/GetStorySlides", storyId, {});
        }
        this.EditStoryName = function (storyId, storyName) {
            return $http.post(apiUrl + "/Storyboard/EditStoryName", { StoryID: storyId, StoryName: storyName }, {});
        }
        this.saveASNewStory = function (storyId, storyName) {
            return $http.post(apiUrl + "/Storyboard/saveASNewStory", { StoryID: storyId, StoryName: storyName }, { });
        }

        this.LoadSharedStories = function (isSharedWithMe, modulename) {
            return $http.post(apiUrl + "/Storyboard/SharedStories", { isSharedWithMe: isSharedWithMe }, { });

        }
        //Slide related services
        this.AddSlide = function (slide) {
            return $http.post(apiUrl + "/storyboard/AddSlide", slide, { });
        }
        //Common (Story and Slide) services
        this.Delete = function (data, isStory) {
            var actionMethod = "";
            if (isStory){
                actionMethod = "DeleteStory";
            }
            else {
                actionMethod = "DeleteSlide";
                data = { SelectedSlides: data }
            }

            return $http.post(apiUrl + "/Storyboard/" + actionMethod, data, {});
        }
        this.Update = function (Id, user, isstory) {
            $http({
                method: "POST",
                url: apiUrl + "Storyboard/Update",
                data: { storyId: Id, updatedUser: user, isStory: isstory }
            }).then(function (response) {
                return response;
            });
        }
        this.GetInfo = function (Id, isstory) {
            $http({
                method: "GET",
                url: apiUrl + "Storyboard/GetInfo",
                data: { storyId: Id, isStory: isstory }
            }).then(function (response) {
                return response;
            });
        }

        this.PreparePPTTemplate = function (selectedSlideObj, isStory) {
            var actionName = "", parameter = "";
            if (isStory) {
                actionName = "PrepareStoryBoardPPT";
            }
            else {
                actionName = "PrepareStoryBoardPPT";
            }
            return $http.post(apiUrl + "/Storyboard/" + actionName, selectedSlideObj, {});
        }
        this.PreparePPT = function (objectId, isStory, moduleName) {
            var actionName = "", parameter = "";
            if (isStory) {
                actionName = "PrepareStoryPPT";
                parameter = "?storyId=" + objectId + "&moduleName=" + moduleName;
            }
            else {
                actionName = "PrepareSlidePPT";
                parameter = "?slideId=" + objectId + "&moduleName=" + moduleName;
            }
            return $http.get(
                apiUrl + "storyboard/" + actionName + parameter
            );
        }
        this.UpdateStory = function (storyId, currentURL) {
            return $http.get(
                   apiUrl + "Storyboard/UpdateStory?storyId=" + storyId + "&currentURL=" + currentURL
            );
        }
        this.RearrangeSlides = function (slideIds) {
            return $http.get(
                        apiUrl + "storyboard/RearrangeSlideOrder?slideIds=" + slideIds
                   );
        }

        this.GetLockStatus = function (storyId) {
            return $http.post(apiUrl + "/Storyboard/GetLockStatus", storyId, {});
        }
        this.SetLock = function (storyId, operation) {
            return $http.post(apiUrl + "/Storyboard/SetLock", { StoryID: storyId, IsLocked: operation }, {});
        }


        this.GetUsers = function (storyId) {
            return $http.post(apiUrl + "/Storyboard/GetUsers", storyId, {});
        }
    });
});