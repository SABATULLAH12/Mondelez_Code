﻿module.controller('scrollController', function ($scope) {
    //$scope.data = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n"];
    //$scope.data = $scope.$parent.timeperiodObj[$scope.$parent.metric.Name];
    $scope.numberOfTicks = $scope.$parent.timeperiodObj[$scope.$parent.metric.Name].length < $scope.$parent.maxNumberOfTicks ? $scope.$parent.timeperiodObj[$scope.$parent.metric.Name].length -1 : $scope.$parent.maxNumberOfTicks-1;
    $scope.scrollKey = $scope.$parent.metric.Name;
    $scope.stepWidth = 20;
    $scope.stepValue = 100.0 / $scope.numberOfTicks;
    $scope.leftIndex = 0;
    $scope.rightIndex = $scope.numberOfTicks;
    $scope.position = { left: 0, right: 100 };

    $scope.sliderStyle = {};
    $scope.leftThumbStyle = {};
    $scope.rightThumbStyle = {};
    if ($scope.stepWidth != undefined && $scope.stepWidth != 0) {
        let percent = $scope.stepWidth * $scope.numberOfTicks;
        percent = percent < 100 ? 100 : percent;
        $scope.sliderStyle.width = "calc("+ percent + "% - 16px)";
    }

    $scope.onChangeValue = function () {
        if ($scope.position.right - $scope.position.left <=3) {
            if ($scope.position.left >= 50) {
                $scope.leftThumbStyle.pointerEvents = "auto";
                $scope.rightThumbStyle.pointerEvents = "none";
            }
            else if ($scope.position.right < 50) {
                $scope.leftThumbStyle.pointerEvents = "none";
                $scope.rightThumbStyle.pointerEvents = "auto";
            }
            else {
                $scope.leftThumbStyle.pointerEvents = "auto";
                $scope.rightThumbStyle.pointerEvents = "auto";
            }
        }
        else {
            $scope.leftThumbStyle.pointerEvents = "auto";
            $scope.rightThumbStyle.pointerEvents = "auto";
        }
        $scope.$parent.filterTimeperiod($scope.$parent.metric.Name, $scope.leftIndex, $scope.rightIndex);
    };
    if ($scope.$parent.timeperiodObj[$scope.$parent.metric.Name].default == true)
        $scope.onChangeValue();

    $scope.leftThumbStyle = {};
    $scope.rightThumbStyle = {};
    $scope.fillStyle = {};
    $scope.isLeftMouseDown = false;
    $scope.isRightMouseDown = false;
    $scope.mouseDown = function (value, isLeft) {
        if (value == false && ($scope.isLeftMouseDown || $scope.isRightMouseDown)) {
            $scope.onChangeValue();
            //$scope.getValue();
        }
        if (isLeft == true) {
            $scope.isLeftMouseDown = value;
            $scope.isRightMouseDown = false;
        }
        else if (isLeft == false) {
            $scope.isLeftMouseDown = false;
            $scope.isRightMouseDown = value;
        }
        else {
            $scope.isLeftMouseDown = false;
            $scope.isRightMouseDown = false;
        }
    }
    $scope.mouseMove = function (event) {
        let containerElement = document.getElementsByClassName($scope.$parent.metric.Name + "_srocll_container_inner")[0];
        let parentElement = document.getElementsByClassName($scope.$parent.metric.Name + "_srocll_container")[0];
        if ($scope.isLeftMouseDown) {
            let position = event.clientX + parentElement.scrollLeft - containerElement.getBoundingClientRect().left;
            let left = position / containerElement.offsetWidth * 100.0;
            left = left > 100 ? 100 : (left < 0 ? 0 : left);
            if (left < $scope.position.right) {
                $scope.leftThumbStyle = { left: left + "%" };
                $scope.fillStyle.left = left + "%";
                $scope.position.left = left;
                let leftIndex = Math.round(($scope.position.left) / $scope.stepValue);
                $scope.leftIndex = leftIndex < 0 ? 0 : leftIndex;
            }
        }
        else if ($scope.isRightMouseDown) {
            let position = event.clientX + parentElement.scrollLeft - containerElement.getBoundingClientRect().left;
            let left = position / containerElement.offsetWidth * 100.0;
            left = left > 100 ? 100 : (left < 0 ? 0 : left);
            if (left > $scope.position.left) {
                $scope.rightThumbStyle = { left: left + "%" };
                $scope.fillStyle.right = (100 - left) + "%";
                $scope.position.right = left;
                let rightIndex = Math.round(($scope.position.right) / $scope.stepValue);
                $scope.rightIndex = rightIndex > $scope.numberOfTicks ? $scope.numberOfTicks : rightIndex;
            }
        }
    }

});