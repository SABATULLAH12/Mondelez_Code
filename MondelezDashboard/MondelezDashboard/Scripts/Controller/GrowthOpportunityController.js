/*----------------------------------------------------------------------------------------------------*/
/*          Author: Rahul Kumar (Software Engineer, F&B)                                              */
/*          Date: 17-04-2019                                                                          */
/*          Discription: This Script contains Growth Opportunity Controller definition                */
/*----------------------------------------------------------------------------------------------------*/
"use strict";
define(['app', 'angular', 'Highcharts', 'html2canvas', 'highcharts-more', 'ajaxservice', 'constants'], function (app, angular, Highcharts, html2canvas) {
    app.register.controller("GrowthOpportunityController", ['$scope', '$css', '$sce', 'AjaxService', 'Constants', function ($scope, $css, $sce, AjaxService, Constants) {
        ReleaseMode ? $css.bind({ href: '../Content/MinifiedCss/growthOpportunity.min.css' }, $scope) : $css.bind({ href: '../Content/Css/growthOpportunity.css' }, $scope)
        let filterPanelScope = $scope.$parent;
        let layoutScope = $scope.$parent.$parent.$parent;
        let topMenuScope = $scope.$parent.$parent;
        let selectedModule = topMenuScope.modules[3];
        selectedModule.isActive = true;
        filterPanelScope.clearAll();
        filterPanelScope.openFilterPanel(false);
        $scope.showOutput = false;
        filterPanelScope.setLowSampleSizeFlag(false);
        $scope.sData = {};  //selected time period Data
        $scope.pData = {};  //projected time period Data
        $scope.SelectedBrandQuadrant = "";
        $scope.GO_TimePeriod = "";
        $scope.ModuleRequestToDB = {};
        $scope.UnknownMetricList = [];
        $scope.AchievabilityBrandList = [];
        $scope.ValueIncreaseBy = 1;
        $scope.NoOfAchivedBrands = 0;
        $scope.headerButton = [{
            Name: 'Achievabilty',
            ImageClass: 'Achievabilty-Image',
            IsSelected: false
        }, {
            Name: 'How Does the Brand Grow?',
            ImageClass: 'How-Does-the-Brand-Grow-Image',
            IsSelected: topMenuScope.OpenHowDoesBrandGrow[0]
        }, {
            Name: 'Path to Growth',
            ImageClass: 'Path-to-Growth-Image',
            IsSelected: false
        }, {
            Name: 'Growth Curve',
            ImageClass: 'Growth-Curve-Image',
            IsSelected: !topMenuScope.OpenHowDoesBrandGrow[0]
        }];
        let BrandQuadrantMapping = [{
            Name: 'Disrupt',
            Image5: 'Disrupt/image5.png',
            Video: 'Disrupt/Disrupt.mp4',
            Document: 'Disrupt/MDLZ PBS_Growth Opportunity_Disrupt_case study.pptx',
            YourWorld: ['You are a following brand in a category that is regularly purchased.', 'You are likely to have a relatively high buyer churn and a lot of 1 time buyers.'],
            HowYouWin: ['Disrupt to win, you need to break habits of consumer and retailers. Drive switching to your brand from the category leaders.','Be distinctive and challenge the norms – from ingredients to packaging to tonality of communication.','Ensure you have a unique proposition but do not stretch your portfolio too far.','Promote a recognisable personality and consider partnering with celebrities.','Price and promote tactically to steal buyers from the competition']
        }, {
            Name: 'Lead / Defend',
            Image5: 'Lead/image5.png',
            Video: 'Lead/Lead.mp4',
            Document: 'Lead/MDLZ PBS_Growth Opportunity_Lead_case study.pptx',
            YourWorld: ['You are a leading brand in a category that is purchased frequently.','It is likely that you will have low buyer churn, high brand awareness and high availability'],
            HowYouWin: ['You are innovating out (expanding category boundaries) not just innovating in (identifying opportunities within the existing category).','You need to ensure consistency in look, feel and message across media','Invest in channels that yield the widest reach.','Promote distinctive brand assets.','Follow price promotions in the category (don’t drive discounts).']
        }, {
            Name: 'Develop',
            Image5: 'Develop/image5.png',
            Video: 'Develop/Develop.mp4',
            Document: 'Develop/MDLZ PBS_Growth Opportunity_Develop_case study.pptx',
            YourWorld: ['You are a leading brand in a category that is not purchased very frequently.','It is likely that you will lose half of your buyers every year and you will have high brand awareness/availability.'],
            HowYouWin: ['Your innovation should look to develop the category. What are the future category needs and how can you meet them. What formats will grow category occasions?','Target category rejectors, understand barriers to purchase','Offer promotions and sampling to drive trial and convert new category buyers']
        }, {
            Name: 'Consideration',
            Image5: 'Consideration/image5.png',
            Video: 'Consideration/Consideration.mp4',
            Document: 'Consideration/MDLZ PBS_Growth Opportunity_Consideration_case study.pptx',
            YourWorld: ['You are a following brand in a category that is not purchased very frequently.','You are likely to have very high buyer churn and low availability.'],
            HowYouWin: ['Drive desire for your brand, consider playing in premium and develop strong quality credentials.','Attract attention through promotions that encourage trial.','Display stands and off shelf locations are important','Don’t try and be all things to all people. You can tailor your brand but don’t make your target audience too narrow.']
        }];
        topMenuScope.OpenHowDoesBrandGrow[0] = false;
        $scope.showAchievedBrandPopUp = false;
        $scope.showValueInput = false;
        let colorList = ['#F3CFA3', '#EAAB5E', '#E59A4A', '#E18719'];

        let ImageLogicSelection = function (CategoryFrequency,RelativePentration) {
            let LogicId, ImageObj;
            if (CategoryFrequency < 6 && RelativePentration < 15) LogicId = 'Logic1';
            else if (CategoryFrequency < 6 && (15 <= RelativePentration && RelativePentration < 30)) LogicId = 'Logic2';
            else if (CategoryFrequency < 6 && (30 <= RelativePentration && RelativePentration < 45)) LogicId = 'Logic3';
            else if (CategoryFrequency < 6 && RelativePentration >= 45) LogicId = 'Logic4';
            else if (CategoryFrequency >= 6 && RelativePentration < 15) LogicId = 'Logic5';
            else if (CategoryFrequency >= 6 && (15 <= RelativePentration && RelativePentration < 30)) LogicId = 'Logic6';
            else if (CategoryFrequency >= 6 && (30 <= RelativePentration && RelativePentration < 45)) LogicId = 'Logic7';
            else if (CategoryFrequency >= 6 && RelativePentration >= 45) LogicId = 'Logic8';
            if (LogicId != null)
            ImageObj = {
                Image2: LogicId + '/image2.png',
                Image3: LogicId + '/image3.png',
                Image4: LogicId + '/image4.png',
            }
            return ImageObj;
        }

        let decimalPrecisionByDivideMultipy = function (Value, DecimalPlace) {
            if (DecimalPlace == null) DecimalPlace = 9;
            let i = 0, multiplier = 1;
            for (i; i < DecimalPlace; i++) {
                multiplier = multiplier * 10;
            }
            return Math.round(parseFloat(Value) * multiplier) / multiplier;
        }

        let decimalPrecision = function (x, y) {
            if (y == null) y = 9;
            return parseFloat(x.toFixed(y))
        }

        let CheckMetricVolumeIsNull = function (CurrentTimeMetric, propertyName) {
            if (_.find(CurrentTimeMetric, ['MetricName', propertyName]) != null && _.find(CurrentTimeMetric, ['MetricName', propertyName])['MetricVolume'] != null) {
                return [decimalPrecision(_.find(CurrentTimeMetric, ['MetricName', propertyName])['MetricVolume']), _.find(CurrentTimeMetric, ['MetricName', propertyName])['MetricType'], _.find(CurrentTimeMetric, ['MetricName', propertyName])['RoundBy']];
            }
            else {
                $scope.UnknownMetricList.push(propertyName);
                return [null,'',0];
            }
        }

        let numberWithCommas = function (x) {
            var parts = x.toString().split(".");
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return parts.join(".");
        }

        let GetOutput = function (data) {
            $scope.showOutput = true;
            layoutScope.setLoader(true);
            filterPanelScope.openFilterPanel(false);
            AjaxService.AjaxPost(data, apiUrl + "/" + selectedModule.Name.replace(" ", "") + "/" + "GetChartOutput", PrepareChartOutput, ErrorFunction);
            $scope.ModuleRequestToDB = data;
        }

        let PrepareChartOutput = function (response) {
            layoutScope.setLoader(true);
            $scope.outputData = response.data;
            filterPanelScope.setIsSelectedFiltersChanged(false);
            layoutScope.setLoader(false);
            InitializeTableObj(response.data);
        }

        let ErrorFunction = function (error) {
            console.log(error);
            $scope.outputData = [];
            layoutScope.customAlert("Something went wrong. Please refresh the screen and try. If it is occuring again, please contact support team.");
            $scope.showOutput = false;
            layoutScope.setLoader(false);
            filterPanelScope.openFilterPanel(true);
        }

        let InitializeTableObj = function (Data) {
            $scope.SelectedBrandQuadrant = "";
            if (Data == null || Data.length == 0) {
                ErrorFunction("Failed To retrieve Data.Data set empty");
                return;
            }
            let CurrentTimeMetric = Data[0];
            let PreviousTimeMetric = Data[1];
            let CurrentTimeOtherBrand = Data[2];
            //let level1Brand = Data[3];
            $scope.UnknownMetricList = [];
            $scope.sData = {
                ValueChangeControl: 1000,
                value: CheckMetricVolumeIsNull(CurrentTimeMetric, 'Absolute: Value (000 EUR)'),
                valueSuffix: CheckMetricVolumeIsNull(CurrentTimeMetric, 'Absolute: Value (000 EUR)'),
                volume: CheckMetricVolumeIsNull(CurrentTimeMetric, 'Absolute: Volume (000Kg)'),
                penetration: CheckMetricVolumeIsNull(CurrentTimeMetric, 'Absolute: Penetration'),
                frequency: CheckMetricVolumeIsNull(CurrentTimeMetric, 'Absolute: Frequency'),
                unitPerTrip: null,
                price: CheckMetricVolumeIsNull(CurrentTimeMetric, 'Absolute: Average Price (EUR/kg)'),
                buyers: CheckMetricVolumeIsNull(CurrentTimeMetric, 'Absolute: Buyers (000 HH)'),
                population: CheckMetricVolumeIsNull(CurrentTimeMetric, 'Absolute: Population (000 HH)'),
                YoYDiffrence: CheckMetricVolumeIsNull(CurrentTimeMetric, 'Yr on Yr Diff: Penetration'),
                difference: CheckMetricVolumeIsNull(CurrentTimeMetric, 'Difference Expected'),
                Coeff_A: CheckMetricVolumeIsNull(CurrentTimeMetric, 'Coeff_A'),
                Coeff_B: CheckMetricVolumeIsNull(CurrentTimeMetric, 'Coeff_B'),
                //level1BrandValue: CheckMetricVolumeIsNull(level1Brand, 'Absolute: Value (000 EUR)'),
                //level1Frequency: CheckMetricVolumeIsNull(level1Brand, 'Absolute: Frequency')
                level1BrandValue: CheckMetricVolumeIsNull(CurrentTimeMetric, 'Cat_Val_EUR'),
                level1Frequency: CheckMetricVolumeIsNull(CurrentTimeMetric, 'Cat_Frequency'),
                level1Penetration: CheckMetricVolumeIsNull(CurrentTimeMetric, 'Cat_Pen'),
            };
            if ($scope.UnknownMetricList.length > 0) {
                $scope.showOutput = false;
                layoutScope.customAlert(Constants.GROWTHOPPORTUNITYMETRICNOTAVAILABLE);
                console.log($scope.UnknownMetricList.join(',') + " are not available.")
                return;
            }
            $scope.GO_TimePeriod = CurrentTimeMetric[0].TimePeriodName;
            $scope.SelectedBrandQuadrant = CurrentTimeMetric[0].Quadrant;
            filterPanelScope.SetGrowthTimePeriod($scope.GO_TimePeriod);
            $scope.sData.unitPerTrip = decimalPrecision($scope.sData.volume[0] / ($scope.sData.frequency[0] * $scope.sData.buyers[0]));
            $scope.sData.RelativePentration = decimalPrecision($scope.sData.penetration[0] / $scope.sData.level1Penetration[0])*100;
            $scope.pData = {
                ValueChangePect: 0,
                ValueChangeControl: $scope.sData.ValueChangeControl,
                ValueChangeControlCalculated: null,
                frequencyOnGrowthCurve: null,
                ProjectedFrequency: null,
                ProjectedPenetration:null,
                ProjectedBuyers: null,
                ProjectedVolume: null,
                ProjectedValue: null,
                target: null,
                ProjectionPenetrationYoYChange: null,
                ProjectionFreqYoYChange: null,
                ProjectionVolumeYoYChange: null,
                ValueShareChange:null
            }
            $scope.pData.ValueChangeControlCalculated = decimalPrecision(1 + ($scope.sData.ValueChangeControl / 10 - 100) / 100);
            $scope.pData.target = decimalPrecision($scope.sData.value[0] * $scope.pData.ValueChangeControlCalculated);
            SetPentration($scope.sData.penetration[0]);
            $scope.GrowthOpportunityRePlot();
        }

        let SetPentration = function (penetration) {
            $scope.pData.ProjectedPenetration = decimalPrecision(penetration);
            $scope.pData.frequencyOnGrowthCurve = decimalPrecision($scope.sData.Coeff_A[0] * Math.exp($scope.pData.ProjectedPenetration * $scope.sData.Coeff_B[0]));
            if ($scope.pData.ValueChangePect == 0) {
                $scope.pData.ProjectedFrequency = $scope.sData.frequency[0];
                $scope.pData.ProjectedBuyers = $scope.sData.buyers[0];
                $scope.pData.ProjectedVolume = $scope.sData.volume[0];
                $scope.pData.ProjectedValue = $scope.sData.value[0];
            }
            else {
                $scope.pData.ProjectedFrequency = decimalPrecision($scope.pData.frequencyOnGrowthCurve + $scope.sData.difference[0]);
                $scope.pData.ProjectedBuyers = decimalPrecision($scope.pData.ProjectedPenetration * $scope.sData.population[0]);
                $scope.pData.ProjectedVolume = decimalPrecision(($scope.pData.ProjectedBuyers * $scope.sData.unitPerTrip * $scope.pData.ProjectedFrequency) / 100);
                $scope.pData.ProjectedValue = decimalPrecision((($scope.pData.ProjectedBuyers * $scope.sData.unitPerTrip * (($scope.sData.Coeff_A[0] * Math.exp($scope.pData.ProjectedPenetration * $scope.sData.Coeff_B[0])) + $scope.sData.difference[0])) / 100) * ($scope.sData.price[0]));
            }
            $scope.pData.ProjectionPenetrationYoYChange = decimalPrecision($scope.pData.ProjectedPenetration / $scope.sData.penetration[0] * 100 - 100);
            $scope.pData.ProjectionFreqYoYChange = decimalPrecision($scope.pData.ProjectedFrequency / $scope.sData.frequency[0] * 100 - 100);
            $scope.pData.ProjectionVolumeYoYChange = decimalPrecision($scope.pData.ProjectedVolume / $scope.sData.volume[0] * 100 - 100);
            $scope.pData.ValueShareChange = ($scope.pData.ProjectedValue / $scope.sData.level1BrandValue[0] * 100) - ($scope.sData.value[0] / $scope.sData.level1BrandValue[0] * 100);
            return $scope.pData.ProjectedValue;
        }

        let FindAchievability = function () {
            let Achievability = 0;
            $scope.AchievabilityBrandList = [];
            $scope.NoOfAchivedBrands = 0;
            if ($scope.outputData.length > 0) {
                let brandList = _.cloneDeep($scope.outputData[2]);
                $scope.AchievabilityBrandList = _.remove(_.map(brandList, function (obj) { if (obj.MetricName == "Yr on Yr Diff: Penetration") return obj; }), undefined);
                $scope.AchievabilityBrandList = _.map($scope.AchievabilityBrandList, function (obj) {
                    if (obj.MetricVolume >= $scope.pData.ProjectedPenetration - $scope.sData.penetration[0]) {
                        obj.Achieved = true;
                        $scope.NoOfAchivedBrands++;
                    }
                    else {
                        obj.Achieved = false;
                    }
                    return obj;
                });
            }
        }

        let RegressionLineData = function (maxx) {
            var data = [];
            let i = 0, points = 50;
            let xdiff = maxx / points;
            for (i; i < points; i++) {
                data.push({
                    x: i * xdiff,
                    y: $scope.sData.Coeff_A[0] * Math.exp(i * xdiff * $scope.sData.Coeff_B[0])
                });
            }
            return data;
        }

        let TargetGrowLine = function (ProjectionPenetrationYoYChange, PathToGrow) {
            var data = [];
            let range = 50;
            let points = 40;
            let additionalParameter = decimalPrecision(ProjectionPenetrationYoYChange - points); //c94
            for (var i = range; i >= (-1 * range) ; i--) {
                let penChange, freqChange;
                if (i == range) {
                    penChange = additionalParameter;
                }
                else {
                    penChange = decimalPrecision((ProjectionPenetrationYoYChange - (ProjectionPenetrationYoYChange - points)) / range + additionalParameter);
                }
                additionalParameter = penChange;
                freqChange = decimalPrecision(((100 + PathToGrow) / 100) / ((100 + penChange) / 100) * 100 - 100);
                let obj = {
                    x: decimalPrecision((100 + penChange) / 100 * $scope.sData.penetration[0]),
                    y: decimalPrecision((100 + freqChange) / 100 * $scope.sData.frequency[0]),
                };
                if (i == range) {
                    obj.label = "Target Growth Line";
                }
                data.push(obj);
            }
            //console.log('TargetGrowLine \n'+data);
            return data;
        }

        let GetCompetitorData = function () {
            let cData = [];
            if ($scope.outputData.length > 0) {
                let brands = _.uniq(_.map($scope.outputData[2], 'BrandName'));
                for (var i = 0; i < brands.length; i++) {
                    let Penetration = _.remove(_.map($scope.outputData[2], function (obj) { if (obj.BrandName == brands[i] && obj.MetricName == "Absolute: Penetration") return obj }), undefined)
                    let value = _.remove(_.map($scope.outputData[2], function (obj) { if (obj.BrandName == brands[i] && obj.MetricName == "Absolute: Value (000 EUR)") return obj }), undefined)
                    let Frequency = _.remove(_.map($scope.outputData[2], function (obj) { if (obj.BrandName == brands[i] && obj.MetricName == "Absolute: Frequency") return obj }), undefined)
                    cData.push({
                        x: Penetration.length > 0 ? Penetration[0].MetricVolume : null,
                        y: Frequency.length > 0 ? Frequency[0].MetricVolume : null,
                        value: value.length > 0 ? $scope.numberWithCommas(value[0].MetricVolume, value[0].RoundBy) + value[0].MetricType : null,
                        name: brands[i],
                        penetration : Penetration.length > 0 ? $scope.numberWithCommas(Penetration[0].MetricVolume, Penetration[0].RoundBy) + Penetration[0].MetricType : null, 
                        frequency: Frequency.length > 0 ? $scope.numberWithCommas(Frequency[0].MetricVolume, Frequency[0].RoundBy) + Frequency[0].MetricType : null,
                    });
                }
            }
            return cData;
        }

        let GetWidgit2Category = function () {
            var data = []
            if ($scope.outputData.length > 0) {
                data = _.uniq(_.map($scope.outputData[1], 'TimePeriodName'));
                data.push('Projection');
            }
            return data;
        }

        let GetWidgit1data = function () {
            let cData = [], colorid = 3;
            if ($scope.outputData.length > 0) {
                let TimePeriod = _.uniq(_.map($scope.outputData[1], 'TimePeriodName'));
                let brandName = _.uniq(_.map($scope.outputData[1], 'BrandName'));
                for (var i = 0; i < TimePeriod.length; i++) {
                    let Penetration = _.remove(_.map($scope.outputData[1], function (obj) { if (obj.TimePeriodName == $scope.GO_TimePeriod && obj.MetricName == "Absolute: Penetration") return obj }), undefined)
                    let value = _.remove(_.map($scope.outputData[1], function (obj) { if (obj.TimePeriodName == $scope.GO_TimePeriod && obj.MetricName == "Absolute: Value (000 EUR)") return obj }), undefined)
                    let Frequency = _.remove(_.map($scope.outputData[1], function (obj) { if (obj.TimePeriodName == $scope.GO_TimePeriod && obj.MetricName == "Absolute: Frequency") return obj }), undefined)
                    cData.push({
                        x: Penetration.length > 0 ? Penetration[0].MetricVolume : null,
                        y: Frequency.length > 0 ? Frequency[0].MetricVolume : null,
                        value: value.length > 0 ? $scope.numberWithCommas(value[0].MetricVolume, value[0].RoundBy) + value[0].MetricType : null,
                        name: Penetration.length > 0 ? Penetration[0].BrandName + " - " + Penetration[0].TimePeriodName : null,
                        penetration: Penetration.length > 0 ? $scope.numberWithCommas(Penetration[0].MetricVolume, Penetration[0].RoundBy) + Penetration[0].MetricType : null,
                        frequency: Frequency.length > 0 ? $scope.numberWithCommas(Frequency[0].MetricVolume, Frequency[0].RoundBy) + Frequency[0].MetricType : null,
                    });
                }
                cData.push({
                    name: brandName[0] + ' - Projection',
                    x: $scope.pData.ProjectedPenetration,
                    y: $scope.pData.ProjectedFrequency,
                    value: $scope.numberWithCommas($scope.pData.ProjectedValue,$scope.sData.value[2])+$scope.sData.value[1],
                    label: 'Projection',
                    penetration: $scope.numberWithCommas($scope.pData.ProjectedPenetration,$scope.sData.penetration[2]) + $scope.sData.penetration[1] ,
                    frequency: $scope.numberWithCommas($scope.pData.ProjectedFrequency, $scope.sData.frequency[2]) + $scope.sData.frequency[1],
                });
                for (let i = cData.length; i > 0; i--) {
                    cData[i - 1].color = colorList[colorid--];
                }
            }
            return cData;
        }

        let GetWidgit2data = function () {
            let cData = [],colorid=3;
            if ($scope.outputData.length > 0) {
                let TimePeriod = _.uniq(_.map($scope.outputData[1], 'TimePeriodName'));
                for (let i = 0; i < TimePeriod.length; i++) {
                    let value = _.remove(_.map($scope.outputData[1], function (obj) { if (obj.TimePeriodName == TimePeriod[i] && obj.MetricName == "Absolute: Value (000 EUR)") return obj }), undefined)
                    cData.push({
                        y: value.length > 0 ? value[0].MetricVolume : null,
                        name: TimePeriod,
                    });
                }
                cData.push({
                    y: $scope.pData.ProjectedValue,
                    name: "Projection"
                });
                for (let i = cData.length; i > 0; i--) {
                    cData[i - 1].color = colorList[colorid--];
                }
            }
            return cData;
        }

        let GetWidgit3data = function () {
            let cData = [], colorid = 3;
            if ($scope.outputData.length > 0) {
                let TimePeriod = _.uniq(_.map($scope.outputData[1], 'TimePeriodName'));
                let brandName = _.uniq(_.map($scope.outputData[1], 'BrandName'));
                for (var i = 0; i < TimePeriod.length; i++) {
                    let Penetration = _.remove(_.map($scope.outputData[1], function (obj) { if (obj.TimePeriodName == TimePeriod[i] && obj.MetricName == "Absolute: Penetration") return obj }), undefined)
                    let value = _.remove(_.map($scope.outputData[1], function (obj) { if (obj.TimePeriodName == TimePeriod[i] && obj.MetricName == "Absolute: Value (000 EUR)") return obj }), undefined)
                    let Frequency = _.remove(_.map($scope.outputData[1], function (obj) { if (obj.TimePeriodName == TimePeriod[i] && obj.MetricName == "Absolute: Frequency") return obj }), undefined)
                    cData.push({
                        x: Penetration.length > 0 ? Penetration[0].MetricVolume : null,
                        y: Frequency.length > 0 ? Frequency[0].MetricVolume : null,
                        value: value.length > 0 ? $scope.numberWithCommas(value[0].MetricVolume, value[0].RoundBy) + value[0].MetricType : null,
                        name: Penetration.length > 0 ? Penetration[0].BrandName + " - " + Penetration[0].TimePeriodName : null,
                        penetration: Penetration.length > 0 ? $scope.numberWithCommas(Penetration[0].MetricVolume, Penetration[0].RoundBy) + Penetration[0].MetricType : null,
                        frequency: Frequency.length > 0 ? $scope.numberWithCommas(Frequency[0].MetricVolume, Frequency[0].RoundBy) + Frequency[0].MetricType : null,
                    });
                }
                cData.push({
                    name: brandName[0] + ' - Projection',
                    x: $scope.pData.ProjectedPenetration,
                    y: $scope.pData.ProjectedFrequency,
                    value: $scope.numberWithCommas($scope.pData.ProjectedValue, $scope.sData.value[2]) + $scope.sData.value[1],
                    label: 'Projection',
                    penetration: $scope.numberWithCommas($scope.pData.ProjectedPenetration, $scope.sData.penetration[2]) + $scope.sData.penetration[1],
                    frequency: $scope.numberWithCommas($scope.pData.ProjectedFrequency, $scope.sData.frequency[2]) + $scope.sData.frequency[1],
                });
                for (let i = cData.length; i > 0; i--) {
                    cData[i - 1].color = colorList[colorid--];
                }
            }
            return cData;
        }

        let GetWidgit3ArrowData = function(length) {
            let slopeFinder = function (x1, y1, x2, y2) { return (y2 - y1) / (x2 - x1) }
            let pointFinder = function (x1, y1, x2, y2, x) { return slopeFinder(x1, y1, x2, y2) * (x - x1) + y1 }
            let x1 = $scope.pData.ProjectedPenetration - $scope.sData.penetration[0] > 0 ? $scope.pData.ProjectedPenetration + length : $scope.pData.ProjectedPenetration - length;
            let y1 = pointFinder($scope.sData.penetration[0], $scope.sData.frequency[0], $scope.pData.ProjectedPenetration, $scope.pData.ProjectedFrequency, x1);
            if (isNaN(y1) || y1==Infinity) return [];
            let x2 = $scope.pData.ProjectedPenetration;
            let y2 = $scope.pData.ProjectedFrequency;
            let Distance = function (x1, y1, x2, y2) { return Math.sqrt(Math.pow(Math.abs(x1 - x2), 2) + Math.pow(Math.abs(y1 - y2), 2)) }
            let AB = Distance(x1, y1, x2, y2);
            let AC = AB ;
            let BC = AB/10;
            let cData = [], colorid = 3;
            let calculate_third_point = function (Ax, Ay, Cx, Cy, a, b, c, A) {
                var data = [], Bx, By, Arad = A * Math.PI / 180; //degrees to radians
                var uACx = (Cx - Ax) / b, uACy = (Cy - Ay) / b; //unit vector
                var uABx = uACx * Math.cos(Arad) - uACy * Math.sin(Arad), uABy = uACx * Math.sin(Arad) + uACy * Math.cos(Arad);//rotated vector
                data.push({ 'x': Ax + c * uABx, 'y': Ay + c * uABy });//B position uses length of edge
                //vector rotated into another direction
                uABx = uACx * Math.cos(Arad) + uACy * Math.sin(Arad);
                uABy = -uACx * Math.sin(Arad) + uACy * Math.cos(Arad);
                data.push({ 'x': Ax + c * uABx, 'y': Ay + c * uABy });//second possible position
                return data;
            }
            let cal = calculate_third_point(x1, y1, x2, y2, AB, AC, BC, 15);
            if ($scope.outputData.length > 0) {
                
                cData.push({
                    x: x2,
                    y: y2,
                });
                cData.push({
                    x: x1,
                    y: y1
                });
                cData.push({
                    x: cal[0].x,
                    y: cal[0].y
                });
                cData.push({
                    x: x1,
                    y: y1
                });
                cData.push({
                    x: cal[1].x,
                    y: cal[1].y
                });
            }
            return cData;
        }
       
        let GetWidgit4data = function () {
            let cData = [], colorid = 3;
            if ($scope.outputData.length > 0) {
                cData.push({
                    name: $scope.ModuleRequestToDB.BrandName + ' - ' + $scope.GO_TimePeriod,
                    x: $scope.sData.penetration[0],
                    y: $scope.sData.YoYDiffrence[0],
                    value: $scope.numberWithCommas($scope.sData.value[0], $scope.sData.value[2]) + $scope.sData.value[1],
                    label: '',
                    color: cData[2],
                    penetration: $scope.numberWithCommas($scope.sData.penetration[0], $scope.sData.penetration[2]) + $scope.sData.penetration[1],
                    penetrationabs: $scope.numberWithCommas($scope.sData.YoYDiffrence[0], $scope.sData.YoYDiffrence[2]) + $scope.sData.YoYDiffrence[1],
                });
                cData.push({
                    name: $scope.ModuleRequestToDB.BrandName + ' - Projection',
                    x: $scope.pData.ProjectedPenetration,
                    y:  $scope.pData.ProjectedPenetration - $scope.sData.penetration[0],
                    value: $scope.numberWithCommas($scope.pData.ProjectedValue, $scope.sData.value[2]) + $scope.sData.value[1],
                    label: 'Projection',
                    color: cData[3],
                    penetration: $scope.numberWithCommas($scope.pData.ProjectedPenetration, $scope.sData.penetration[2]) + $scope.sData.penetration[1],
                    penetrationabs: $scope.numberWithCommas($scope.pData.ProjectedPenetration - $scope.sData.penetration[0], $scope.sData.YoYDiffrence[2]) + $scope.sData.YoYDiffrence[1],
                });
                for (let i = cData.length; i > 0; i--) {
                    cData[i - 1].color = colorList[colorid--];
                }
            }
            return cData;
        }

        let GetWidgit4CompetitorData = function () {
            let cData = [];
            if ($scope.outputData.length > 0) {
                let brands = _.uniq(_.map($scope.outputData[2], 'BrandName'));
                for (var i = 0; i < brands.length; i++) {
                    let Penetration = _.remove(_.map($scope.outputData[2], function (obj) { if (obj.BrandName == brands[i] && obj.MetricName == "Absolute: Penetration") return obj }), undefined)
                    let YoYDiffPenetration = _.remove(_.map($scope.outputData[2], function (obj) { if (obj.BrandName == brands[i] && obj.MetricName == "Yr on Yr Diff: Penetration") return obj }), undefined)
                    let value = _.remove(_.map($scope.outputData[2], function (obj) { if (obj.BrandName == brands[i] && obj.MetricName == "Absolute: Value (000 EUR)") return obj }), undefined)
                    cData.push({
                        x: Penetration.length > 0 ? Penetration[0].MetricVolume : null,
                        y: YoYDiffPenetration.length > 0 ? YoYDiffPenetration[0].MetricVolume : null,
                        value: value.length > 0 ? $scope.numberWithCommas(value[0].MetricVolume, value[0].RoundBy) + value[0].MetricType : null,
                        name: brands[i],
                        penetration: Penetration.length > 0 ? $scope.numberWithCommas(Penetration[0].MetricVolume, Penetration[0].RoundBy) + Penetration[0].MetricType : null,
                        penetrationabs: YoYDiffPenetration.length > 0 ? $scope.numberWithCommas(YoYDiffPenetration[0].MetricVolume, YoYDiffPenetration[0].RoundBy) + YoYDiffPenetration[0].MetricType : null,
                    });
                }
            }
            return cData;
        }

        $scope.openInNewTab = function (url) {
            var win = window.open(url, '_blank');
            win.focus();
        }

        $scope.GrowthOpportunityRePlot = function (animated) {
            if (animated == null) animated = true;
            FindAchievability();
            if (!ReleaseMode) {
                console.log("SelectedTimePeriodData");
                console.log($scope.sData);
                console.log("ProjectedTimePeriodData");
                console.log($scope.pData);
                console.log("Achived Brand List");
                console.log($scope.AchievabilityBrandList);
            }
            $scope.DrawChart('#widget1', animated);
            $scope.DrawChart('#widget2', animated);
            $scope.DrawChart('#widget3', animated);
            $scope.DrawChart('#widget4', animated);
            $scope.DrawChart('#widget5', animated);
        }

        $scope.HeaderButtonSelect = function (index) {
            _.forEach($scope.headerButton, function (obj) { _.set(obj, 'IsSelected', false) });
            $scope.headerButton[index].IsSelected = true;
            setTimeout(function () { $scope.GrowthOpportunityRePlot(true); }, 100);
        }

        $scope.IsHeaderButtonSelected = function () { return _.find($scope.headerButton, { IsSelected: true }).Name }

        $scope.getBrandQuadrantText = function (property) {
            let x = _.find(BrandQuadrantMapping, { Name: $scope.SelectedBrandQuadrant });
            if (x != null) {
                return x[property];
            }
            return [];
        }

        $scope.getBrandQuadrantPath = function (property) {
            let x = _.find(BrandQuadrantMapping, { Name: $scope.SelectedBrandQuadrant });
            if (x != null) {
                return "../content/growthopportunity/" + x[property];
            }
            return 'none';
        }

        $scope.getBrandLogicPath = function (property) {
            if ($scope.sData.level1Frequency != undefined) {
                let x = ImageLogicSelection($scope.sData.level1Frequency[0], $scope.sData.RelativePentration);
                if (x != null) {
                    return "../content/growthopportunity/" + x[property];
                }
            }
            return 'none';
        }

        $scope.GetValueChangeInput = function (event) {
            if (event.keyCode == 13) {
                $scope.ChangeValue(null, parseFloat(event.target.value));
            }
        }

        $scope.numberWithCommas = function (x,y) {
            if (x != null) {
                x = decimalPrecisionByDivideMultipy(x, y);
                var parts = x.toString().split(".");
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                return parts.join(".");
            }
        }

        $scope.ChangeValue = function (increase, ValueChangePect) {
            let oldValueChangePect = $scope.pData.ValueChangePect;
            if (increase == null && ValueChangePect != null && !isNaN(ValueChangePect) && decimalPrecision(ValueChangePect)<100000000) {
                $scope.pData.ValueChangePect = decimalPrecision(ValueChangePect);
                $scope.showValueInput = false;
            }
            else if (increase == true) {
                $scope.pData.ValueChangePect = decimalPrecision($scope.pData.ValueChangePect + $scope.ValueIncreaseBy);
            }
            else if (increase == false) {
                $scope.pData.ValueChangePect = decimalPrecision($scope.pData.ValueChangePect - $scope.ValueIncreaseBy);
            }
            else {
                $scope.pData.ValueChangePect = oldValueChangePect;
                layoutScope.customAlert(Constants.ONLYDECIMAL);
                $scope.showValueInput = false;
                document.getElementById('valueInput').value = oldValueChangePect;
            }
            $scope.pData.ValueChangeControl = $scope.sData.ValueChangeControl + ($scope.pData.ValueChangePect * 10);
            $scope.pData.ValueChangeControlCalculated = decimalPrecision(1 + ($scope.pData.ValueChangeControl / 10 - 100) / 100);
            $scope.pData.value = $scope.sData.value[0] + $scope.pData.ValueChangeControlCalculated * ($scope.sData.value[0] / 100);
            $scope.pData.target = $scope.sData.value[0] * $scope.pData.ValueChangeControlCalculated;

            if ($scope.pData.ValueChangePect == 0) {
                SetPentration($scope.sData.penetration[0]);
            }
            else if ($scope.pData.ProjectedValue < $scope.pData.target) {
                var Data1, Data2;
                while ($scope.pData.ProjectedValue < $scope.pData.target) {
                    if ($scope.pData.ProjectedPenetration + 0.01 < 0 || $scope.pData.ProjectedPenetration + 0.01 > 100) {
                        Data1 = SetPentration($scope.pData.ProjectedPenetration + 0.01);
                        break;
                    }
                    Data1 = SetPentration($scope.pData.ProjectedPenetration + 0.01);
                }
                Data2 = SetPentration($scope.pData.ProjectedPenetration - 0.01);
                Math.abs($scope.pData.target - Data1) < Math.abs($scope.pData.target - Data2) ? SetPentration($scope.pData.ProjectedPenetration + 0.01) : SetPentration($scope.pData.ProjectedPenetration);
            }
            else {
                var Data1, Data2;
                while ($scope.pData.ProjectedValue > $scope.pData.target) {
                    if ($scope.pData.ProjectedPenetration - 0.01 < 0 || $scope.pData.ProjectedPenetration - 0.01 > 100) {
                        Data1 = SetPentration($scope.pData.ProjectedPenetration - 0.01);
                        break;
                    }
                    Data1 = SetPentration($scope.pData.ProjectedPenetration - 0.01);
                }
                Data2 = SetPentration($scope.pData.ProjectedPenetration + 0.01);
                Math.abs($scope.pData.target - Data1) < Math.abs($scope.pData.target - Data2) ? SetPentration($scope.pData.ProjectedPenetration - 0.01) : SetPentration($scope.pData.ProjectedPenetration);
            }
            if ($scope.pData.ProjectedPenetration < 0 || $scope.pData.ProjectedPenetration > 100 || $scope.pData.ProjectedValue < 0 ||  $scope.pData.ProjectedFrequency < 0 ||  $scope.pData.ProjectedVolume < 0)
            {
                layoutScope.customAlert(Constants.PERMISSIBLELIMIT);
                $scope.ChangeValue(null, oldValueChangePect);
            }
            $scope.GrowthOpportunityRePlot(false);
        }

        $scope.DrawChart = function (widetId,animation) {
            var reflow = false;
            let maxx = 1;
            let minx = 0;
            var chart = {
                reflow: reflow,
                style: {
                    fontFamily: "Montserrat"
                }
            };
            var title = {
                    text: ''
                };
            var subtitle = {
                    text: ''
                };
            var xAxis = {};
            var yAxis = {};
            var tooltip = {};
            var legend = {};
            var series = [];
            var plotOptions = {};
            var credits = {
                    enabled: false
            };
            var additionalfunction = function () {}
            switch (widetId) {
                case '#widget1':
                    chart = {
                        type: 'scatter',
                        style: {
                            fontFamily: "Montserrat"
                        }
                    };
                    yAxis = {
                            labels: {
                                formatter: function () {
                                    return $scope.numberWithCommas(this.value);
                                },
                                style: {
                                    "font-family": "Montserrat",
                                }
                            },
                            title: {
                                text: 'FREQUENCY'
                            },
                            min: 0,
                            gridLineColor: 'rgba(183, 183, 183, 1)',
                            gridLineDashStyle: 'line'
                        };
                    xAxis = {
                            title: {
                                text: 'PENETRATION',
                            },
                            labels: {
                                format: '{value}%',
                                style: {
                                    "font-family": "Montserrat",
                                }
                            },
                            shadow: true,
                            gridLineWidth: 1,
                            gridLineColor: 'rgba(183, 183, 183, 1)',
                            gridLineDashStyle: 'line'
                        };
                    series = [
                            {
                                name: 'Competitor Set',
                                zIndex:10,
                                color: 'rgba(155, 155, 155, 1)',
                                data: GetCompetitorData(),
                                marker: {
                                    symbol: 'circle'
                                }

                            },
                            {
                                name: $scope.ModuleRequestToDB.BrandName,
                                color: colorList[3],
                                zIndex: 11,
                                data: GetWidgit1data(),
                                marker: {
                                    symbol: 'circle'
                                }
                            }
                        ];
                    for (let i = 0; i < series.length; i++) {
                            for (let j = 0; j < series[i].data.length; j++) {
                                if (maxx < series[i].data[j].x) maxx = series[i].data[j].x;
                            }
                        }
                    series.push({
                            type: 'line',
                            dashStyle: 'shortdash',
                            name: 'Regression Line',
                            zIndex: 9,
                            color: 'rgba(155, 155, 155, 1)',
                            data: RegressionLineData(maxx + 5),
                            enableMouseTracking: false,
                            showInLegend: false,
                            marker: {
                                enabled: false
                            }
                        })
                    plotOptions = {
                            series: {
                                animation: animation,
                                dataLabels: {
                                    enabled: true,
                                    formatter: function () {
                                        return this.point.label;
                                    }
                                }
                            }
                        }
                    tooltip = {
                            useHTML: true,
                            formatter: function () {
                                let returnHTML = "";
                                returnHTML += "<div>" + this.point.name + "</div>";
                                returnHTML += "<div>Penetration : " + this.point.penetration + "</div>";
                                returnHTML += "<div>Frequency : " + this.point.frequency + "</div>";
                                returnHTML += "<div>Value : " + this.point.value + "</div>";
                                return "<div class='chart-tooltip'>" + returnHTML + "</div>";
                            },
                            snap: 0,
                            hideDelay: 50
                        };
                    break;
                case '#widget2':
                    chart= {
                        type: 'column',
                        style: {
                            fontFamily: "Montserrat"
                        }
                    };
                    title= {
                        text: ''
                    };
                    xAxis= {
                        categories: GetWidgit2Category()
                    };
                    yAxis =  {
                        min: 0,
                        title: {
                            text: 'Value (000 EUR)'
                        },
                        labels: {
                            formatter: function () {
                                return numberWithCommas(this.value);
                            },
                            style: {
                                "font-family": "Montserrat"
                            }
                        }
                    };
                    tooltip = {
                        useHTML: true,
                        formatter: function () {
                            let returnHTML = "";
                            returnHTML += "<div>" + $scope.numberWithCommas(this.point.y,$scope.sData.value[2])+ "</div>";
                            return "<div class='chart-tooltip'>" + returnHTML + "</div>";
                        },
                        snap: 0,
                        hideDelay: 50
                    };
                    plotOptions = {
                            series: {
                                animation: animation,
                                shadow: true,
                                dataLabels: {
                                    enabled: true,
                                    useHTML: true,
                                    formatter: function () {
                                        let returnHTML =$scope.numberWithCommas(this.point.y, $scope.sData.value[2]);
                                        return returnHTML;
                                    }
                                }
                            }
                    };
                    legend = {
                        enabled: false ,
                    };
                    series = [{
                        data: GetWidgit2data()
                    }];
                    break;
                case  '#widget3':
                    chart = {
                        type: 'scatter',
                        style: {
                            fontFamily: "Montserrat"
                        }
                    };
                    title = {
                        text: 'AQHacks',
                        style: { "color": "#FFFFFF", "fontSize": "1px" }
                    }
                    yAxis = {
                        labels: {
                            formatter: function () {
                                return $scope.numberWithCommas(this.value);
                            },
                            style: {
                                "font-family": "Montserrat",
                            }
                        },
                        title: {
                            text: 'FREQUENCY'
                        },
                        min: 0,
                        gridLineColor: 'rgba(183, 183, 183, 1)',
                        gridLineDashStyle: 'line'
                    };
                    xAxis = {
                        title: {
                            text: 'PENETRATION',
                        },
                        labels: {
                            format: '{value}%',
                            style: {
                                "font-family": "Montserrat",
                            }
                        },
                        shadow: true,
                        gridLineWidth: 1,
                        gridLineColor: 'rgba(183, 183, 183, 1)',
                        gridLineDashStyle: 'line'
                    };
                    series = [
                     {
                         type: 'line',
                         dashStyle: 'shortdash',
                         name: 'Target Grow Line',
                         color: 'rgba(155, 155, 155, 1)',
                         data: TargetGrowLine($scope.pData.ProjectionPenetrationYoYChange, $scope.pData.ValueChangePect),
                         enableMouseTracking: false,
                         zIndex: 8,
                         showInLegend: false,
                         marker: {
                             enabled: false
                         }
                     },
                     {
                         type: 'scatter',
                         name: $scope.ModuleRequestToDB.BrandName,
                         color: colorList[3],
                         data: GetWidgit3data(),
                         zIndex: 10,
                         marker: {
                             symbol: 'circle'
                         },
                         showInLegend: false,
                     },
                     {
                         type: 'line',
                         name: $scope.ModuleRequestToDB.BrandName,
                         color: 'rgba(155, 155, 155, 1)',
                         zIndex:9,
                         data: GetWidgit3data(),
                         marker: {
                             enabled: false
                         },
                         showInLegend: false,
                         enableMouseTracking: false,
                     }
                    ];
                    for (let i = 0; i < series.length; i++) {
                        for (let j = 0; j < series[i].data.length; j++) {
                            if (maxx < series[i].data[j].x) maxx = series[i].data[j].x;
                        }
                    }
                    for (let i = 0; i < series.length; i++) {
                        for (let j = 0; j < series[i].data.length; j++) {
                            if (minx > series[i].data[j].x) minx = series[i].data[j].x;
                        }
                    }
                    series.push(
                     {
                         type: 'line',
                         name: $scope.ModuleRequestToDB.BrandName,
                         color: 'rgba(155, 155, 155, 1)',
                         zIndex: 9,
                         data: GetWidgit3ArrowData((maxx - minx)>1?(maxx - minx)/10:0.01),
                         marker: {
                             enabled: false
                         },
                         showInLegend: false,
                         enableMouseTracking: false,
                     })
                    plotOptions = {
                        series: {
                            animation: animation,
                            dataLabels: {
                                enabled: true,
                                formatter: function () {
                                    return this.point.label;
                                }
                            }
                        }
                    }
                    tooltip = {
                        useHTML: true,
                        formatter: function () {
                            let returnHTML = "";
                            returnHTML += "<div>" + this.point.name + "</div>";
                            returnHTML += "<div>Penetration : " + this.point.penetration + "</div>";
                            returnHTML += "<div>Frequency : " + this.point.frequency + "</div>";
                            returnHTML += "<div>Value : " + this.point.value + "</div>";
                            return "<div class='chart-tooltip'>" + returnHTML + "</div>";
                        },
                        snap: 0,
                        hideDelay: 50
                    };
                    break;
                case '#widget4':
                    chart = {
                        type: 'scatter',
                        style: {
                    fontFamily: "Montserrat"
                }
                    };
                    yAxis = {
                        labels: {
                            format: '{value}pp',
                            style: {
                                "font-family": "Montserrat",
                            }
                        },
                        title: {
                            text: 'Penetration Change (abs)'
                        },
                        gridLineColor: 'rgba(183, 183, 183, 1)',
                        gridLineDashStyle: 'line',
                        plotLines: [{
                            color: colorList[3],
                            width: 2,
                            value: $scope.pData.ProjectedPenetration - $scope.sData.penetration[0]
                        }]
                    };
                    xAxis = {
                        title: {
                            text: 'PENETRATION',
                        },
                        labels: {
                            format: '{value}%',
                            style: {
                                "font-family": "Montserrat",
                            }
                        },
                        shadow: true,
                        gridLineWidth: 1,
                        gridLineColor: 'rgba(183, 183, 183, 1)',
                        gridLineDashStyle: 'line'
                    };
                    series = [
                        {
                            type: 'scatter',
                            name: 'Competitor set',
                            zIndex: 9,
                            color: 'rgba(155, 155, 155, 1)',
                            data: GetWidgit4CompetitorData(),
                            marker: {
                                symbol: 'circle'
                            }

                        },
                        {
                            type: 'scatter',
                            zIndex: 10,
                            name: $scope.ModuleRequestToDB.BrandName,
                            color: colorList[3],
                            data: GetWidgit4data(),
                            marker: {
                             symbol: 'circle'
                            }
                        }
                    ];
                    plotOptions = {
                        series: {
                            animation: animation,
                            dataLabels: {
                                enabled: true,
                                formatter: function () {
                                    return this.point.label;
                                }
                            }
                        }
                    }
                    tooltip = {
                        useHTML: true,
                        formatter: function () {
                            let returnHTML = "";
                            returnHTML += "<div>" + this.point.name + "</div>";
                            returnHTML += "<div>Penetration : " + this.point.penetration + "</div>";
                            returnHTML += "<div>Penetration Change (abs) : " + this.point.penetrationabs + "</div>";
                            returnHTML += "<div>Value : " + this.point.value + "</div>";
                            return "<div class='chart-tooltip'>" + returnHTML + "</div>";
                        },
                        snap: 0,
                        hideDelay: 50
                    };
                    break;
                case '#widget5':
                    chart = {
                        type: 'scatter',
                        style: {
                            fontFamily: "Montserrat"
                        }
                    };
                    yAxis = {
                        labels: {
                            formatter: function () {
                                return $scope.numberWithCommas(this.value);
                            },
                            style: {
                                "font-family": "Montserrat",
                            }
                        },
                        title: {
                            text: 'CATEGORY FREQUENCY'
                        },
                        gridLineColor: 'rgba(183, 183, 183, 1)',
                        gridLineDashStyle: 'line',
                        min: 0,
                        max: $scope.sData.level1Frequency[0] < 6 ? 7 : 1 + $scope.sData.level1Frequency[0] ,
                        plotLines: [{
                            color: 'black',
                            width: 1,
                            value: 6,
                            zIndex: 5,
                        }],
                    };
                    xAxis = {
                        title: {
                            text: 'RELATIVE PENETRATION',
                        },
                        labels: {
                            format: '{value}%',
                            style: {
                                "font-family": "Montserrat",
                            }
                        },
                        gridLineWidth: 1,
                        gridLineColor: 'rgba(183, 183, 183, 1)',
                        gridLineDashStyle: 'line',
                        min: 0,
                        max: $scope.sData.RelativePentration < 30 ? 40 : 10 + $scope.sData.RelativePentration,
                        plotLines: [{
                            color: 'black',
                            width: 1,
                            zIndex:5,
                            value: 30
                        }]
                    };
                    series = [
                        {
                            enableMouseTracking: false,
                            marker: {
                                enabled: false
                            },
                            dataLabels: {
                                enabled: true,
                                style: {
                                    fontWeight: 'normal'
                                },
                                color: '#69386F',
                                crop: false,
                                padding: 3,
                                overflow: 'justify',
                                format: '{point.name}',
                                allowOverlap: true,
                            },
                            keys: ['x', 'y', 'name'],
                            data: [
                              [($scope.sData.RelativePentration < 30 ? 40 : $scope.sData.RelativePentration), ($scope.sData.level1Frequency[0] < 6 ? 7 : 1 + $scope.sData.level1Frequency[0]), 'LEAD | DEFEND'],
                              [0, ($scope.sData.level1Frequency[0] < 6 ? 7 : 1 + $scope.sData.level1Frequency[0]), 'DISRUPT'],
                              [0, 0, 'CONSIDERATION'],
                              [($scope.sData.RelativePentration < 30 ? 40 : $scope.sData.RelativePentration), 0, 'DEVELOP']
                            ]
                        }, {
                            type: 'scatter',
                            name: 'Brand',
                            zIndex: 9,
                            color: 'rgba(155, 155, 155, 1)',
                            data: [{
                                name: $scope.ModuleRequestToDB.BrandName,
                                x: $scope.sData.RelativePentration,
                                y: $scope.sData.level1Frequency[0],
                                label: $scope.ModuleRequestToDB.BrandName,
                                color: colorList[3]
                            }],
                            dataLabels: {
                                enabled: false,
                                style: {
                                    fontWeight: 'normal'
                                },
                                color: 'black',
                                crop: false,
                                padding: 3,
                                overflow: 'justify',
                                format: '{point.label}',
                                allowOverlap: true,
                                y:25
                            },
                            marker: {
                                symbol: 'circle'
                            }
                        }
                    ];
                    plotOptions = {
                        series: {
                            animation: animation,
                        }
                    }
                    legend = {
                        enabled: false,
                    };
                    tooltip = {
                        useHTML: true,
                        formatter: function () {
                            let returnHTML = "";
                            returnHTML += "<div>" + this.point.name + "</div>";
                            returnHTML += "<div> Relative Penetration : " + $scope.numberWithCommas($scope.sData.RelativePentration, $scope.sData.penetration[2]) + $scope.sData.penetration[1] + "</div>";
                            returnHTML += "<div> Category Frequency : " + $scope.numberWithCommas($scope.sData.level1Frequency[0], $scope.sData.level1Frequency[2]) + $scope.sData.level1Frequency[1] + "</div>";
                            return "<div class='chart-tooltip'>" + returnHTML + "</div>";
                        },
                        snap: 0,
                        hideDelay: 50
                    };
                    break;
            }

            let json = {};
            json.chart = chart;
            json.title = title;
            json.subtitle = subtitle;
            json.xAxis = xAxis;
            json.yAxis = yAxis;
            json.tooltip = tooltip;
            json.legend = legend;
            json.series = series;
            json.plotOptions = plotOptions;
            json.credits = credits;
            $(widetId).highcharts(json, additionalfunction);
        }

        $scope.ExportToPPT = function (id) {
            if (filterPanelScope.isSelectedFiltersChanged) {
                layoutScope.customAlert(Constants.EXPORT_SELECTIONS_CHANGED, Constants.EXPORT_ALERT_HEADER, null, null, Constants.OK_TEXT);
                return;
            }
            layoutScope.setLoader(true);
            var data = {};
            data = $scope.ModuleRequestToDB;
            data.ExportsType = Constants.PPT_TEXT;
            data.FooterText = topMenuScope.getFooterText();
            data.GrowthTimePeriod = $scope.GO_TimePeriod;
            if (!layoutScope.validateSession()) {
                return;
            }
            var sContainer = angular.element(id);
            var svgElements = angular.element('svg');

            //Replacing warning icon svg with png
            angular.element(id).find('.go-row-cell-header-Seperator').addClass('go-row-cell-header-Seperator_png');
            angular.element(id).find('.How-Does-the-Brand-Grow-Image').addClass('How-Does-the-Brand-Grow-Image_png');
            angular.element(id).find('.Path-to-Growth-Image').addClass('Path-to-Growth-Image_png');
            angular.element(id).find('.Growth-Curve-Image').addClass('Growth-Curve-Image_png');
            angular.element(id).find('.Achievabilty-Image').addClass('Achievabilty-Image_png');
            angular.element(id).find('.upButton').addClass('upButton_png');
            angular.element(id).find('.downButton').addClass('downButton_png');
            angular.element(id).find('.achieve-division-sign').addClass('achieve-division-sign_png');
            angular.element(id).find('.achieve-equal-sign').addClass('achieve-equal-sign_png');
            angular.element(id).find('.good_advertising_icon').addClass('good_advertising_icon_png');
            angular.element(id).find('.brand_case_study_icon').addClass('brand_case_study_icon_png');
            //svg to canvas conversion
            svgElements.each(function () {
                var canvas, xml;
                canvas = document.createElement("canvas");

                //convert SVG into a XML string
                xml = (new XMLSerializer()).serializeToString(this);

                // Removing the name space as IE throws an error
                xml = xml.replace(/xmlns=\"http:\/\/www\.w3\.org\/2000\/svg\"/, '');
                xml = xml.replace(/xlink:href/g, '');

                //draw the SVG onto a canvas
                canvg(canvas, xml);

                $(canvas).insertAfter(this);
                //hide the SVG element
                $(this).hide();
            });

            //canvas to Base64 encoding
            html2canvas($(sContainer), {
                allowTaint: true,
                letterRendering: true,
                onrendered: function (canvas) {
                    var base64 = canvas.toDataURL();
                    base64 = base64.replace('data:image/png;base64,', '');
                    data.imgBase64 = base64;
                    AjaxService.AjaxPost(data, apiUrl + "/" + selectedModule.ModuleName.toLowerCase() + "/" + "ExportPPT", layoutScope.DownloadFile, layoutScope.ErrorDownloading);
                    $(sContainer).find('canvas').remove();
                    //Removing png image of warning icon
                    angular.element(id).find('.go-row-cell-header-Seperator').removeClass('go-row-cell-header-Seperator_png');
                    angular.element(id).find('.How-Does-the-Brand-Grow-Image').removeClass('How-Does-the-Brand-Grow-Image_png');
                    angular.element(id).find('.Path-to-Growth-Image').removeClass('Path-to-Growth-Image_png');
                    angular.element(id).find('.Growth-Curve-Image').removeClass('Growth-Curve-Image_png');
                    angular.element(id).find('.Achievabilty-Image').removeClass('Achievabilty-Image_png');
                    angular.element(id).find('.upButton').removeClass('upButton_png');
                    angular.element(id).find('.downButton').removeClass('downButton_png');
                    angular.element(id).find('.achieve-division-sign').removeClass('achieve-division-sign_png');
                    angular.element(id).find('.achieve-equal-sign').removeClass('achieve-equal-sign_png');
                    angular.element(id).find('.good_advertising_icon').removeClass('good_advertising_icon_png');
                    angular.element(id).find('.brand_case_study_icon').removeClass('brand_case_study_icon_png');
                    $('svg').show();
                }
            });

        }

        filterPanelScope.callChildGetOutput(GetOutput);

        filterPanelScope.FillFilterPanal();
    }]);
})