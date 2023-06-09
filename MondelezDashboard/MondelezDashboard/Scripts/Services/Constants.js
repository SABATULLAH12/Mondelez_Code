﻿define(['app'], function (app) {
    app.register.service('Constants', [function () {
        this.LOGIN_ALERT_HEADER_TEXT = 'Login Alert';
        this.OK_TEXT = 'OK';
        this.EMPTY_USERNAME_FIELD = 'Username field is empty';
        this.USERNAME_RESTRICT = 'Username field cannot contain more than 50 characters';
        this.USERNAME_INVALID = 'Username has invalid characters';
        this.USERNAME_EMAIL_ONLY = 'Please enter email address only';
        this.INVALID_CREDENTIALS = 'Invalid username or password';
        this.ALERT_HEADER_TEXT = "Alert";
        this.ERROR_HEADER_TEXT = 'Error';
        this.SOMETHING_WRONG = 'Something went wrong';
        this.SESSION_EXPIRED = 'Session expired';
        this.MAX_SELCTION_TEXT_DEEPDIVE = 'Maximum Selection is 15';
        this.MAX_SELCTION_TEXT_SNAPSHOT = 'Maximum Selection is 6';
        this.MAX_SELCTION_TEXT_SNAPSHOT_SECONDARYBRAND = 'Maximum Selection is 5';
        this.MANDATORY_SELCTION_TEXT = "Please Make Selections in || Tab";
        this.NO_OUTPUT_TEXT = "No common data available, please change the selections";
        this.NO_OUTPUT_TEXT_ON_SUBMIT = "No Data Available for this particular selection, Please change the selection";
        this.MAX_SELCTION_VALUE_SNAPSHOT = 6;
        this.MAX_SELCTION_VALUE_SNAPSHOT_SECONDARYBRAND = 5;
        this.MAX_SELCTION_VALUE_DEEPDIVE = 15;
        this.CROSS_TAB_LIMIT = 2000;
        this.PPT_TEXT = "ppt";
        this.EXCEL_TEXT = "excel";
        this.EXPORT_ALERT_HEADER = "Export Alert";
        this.EXPORT_SELECTIONS_CHANGED = 'Some selections have been changed. Please click on submit and then proceed';
        this.COLUMN_TEXT = "column";
        this.BAR_TEXT = "bar";
        this.LINE_TEXT = "line";
        //this.DEEPDIVE_BRAND_CHART_HEADER ="Brand KPI (SELECTED KPI) for Market (SELECTED MARKET)";
        //this.DEEPDIVE_CATEGORY_CHART_HEADER = "Category KPI (SELECTED KPI) for Market (SELECTED MARKET)";
        //this.DEEPDIVE_MARKET_CHART_HEADER = "Market KPI (SELECTED KPI) for Category (SELECTED CATEGORY)";
        //this.DEEPDIVE_CHANNEL_CHART_HEADER = "Channel KPI (SELECTED KPI) for Market (SELECTED MARKET)";
        //this.DEEPDIVE_DEMOGRAPHICS_CHART_HEADER = "Demographics KPI (SELECTED KPI) for Market (SELECTED MARKET)";
        this.DEEPDIVE_BRAND_CHART_HEADER = "COMPARE COMPARETAB : KPI (SELECTED KPI) for SELECTED BRAND";
        this.DEEPDIVE_CATEGORY_CHART_HEADER = "COMPARE COMPARETAB : KPI (SELECTED KPI) for SELECTED BRAND";
        this.DEEPDIVE_MARKET_CHART_HEADER = "COMPARE COMPARETAB : KPI (SELECTED KPI) for SELECTED BRAND";
        this.DEEPDIVE_CHANNEL_CHART_HEADER = "COMPARE COMPARETAB : KPI (SELECTED KPI) for SELECTED BRAND";
        this.DEEPDIVE_DEMOGRAPHICS_CHART_HEADER = "COMPARE COMPARETAB : KPI (SELECTED KPI) for SELECTED BRAND";
        this.DEEPDIVE_TOPWORST_PERFORMING_BRAND_CHART_HEADER = "Top/Worst Perfoming Brands KPI (SELECTED KPI)";
        this.Low_SampleSize_Value = 20;
        this.SampleSize_Value = 70;
        this.MAX_EXCEL_ROWS = 1048500;//change it to whatever limit is provided.
        this.MAX_EXCEL_ROWS_Exceeded = "Data is too large to be written to an excel file. Please reduce the number of selections.";
        this.NAVIGATION_DEEPDEIVE_ERROR_MSG = "For This Selections, Data is Not Avialable in DeepDive Module";
        this.CONTRIBUTION_TEXT = "Contribution";
        this.CONTRIBUTION_TEXT_SHORT = "Contib.";
        this.CHANNEL_RETAILER_SLASH_TEXT = "Channel/Retailer";
        this.CHANNEL_RETAILER_UNDERSCORE_TEXT = "Channel_Retailer";
        this.SNAPSHOT_MULTI_TEXT = "Multi";
        this.SNAPSHOT_SINGLE_TEXT = "Single";
        this.SNAPSHOT_DEMOG_TEXT = "Demographic";
        this.SPLITS_DRIVE_TEXT = "Splits Drive";
        this.VALUE_SPLIT_TEXT = "Value Split";
        this.PRODUCT_MAP_TEXT = "Product Map";
        this.PRODUCT_VALUE_SPLIT_TEXT = "Product Comparison - Value Split";
        this.ONLYDECIMAL = "Only Decimal Values are Allowed!";
        this.PERMISSIBLELIMIT = "Projection beyond permissible limits!";
        this.GROWTHOPPORTUNITYMETRICNOTAVAILABLE = "Required information for Growth Opportunity calculations are not available.";
        this.ERROR_MESSAGE_AlreadySelected = function (Brand) { return Brand.toUpperCase() + " is already selected in Primary Brand." };
        this.ERROR_MESSAGE_DIFF_TIMEPERIOD = function (TimePeriod) { return "Timeperiods from different Sections cannot be selected." };
      // this.SUPPORT_TEXT = '<span>For any assistance/queries, please drop a mail at : </br> <a class="loginlink" href="mailto:aq-mdlzpbs-support@kantar.com">aq-mdlzpbs-support@kantar.com</a></span>';
        this.SUPPORT_TEXT = '<span>For any technical assistance/queries, please drop a mail at: </br> <a class="loginlink" href="mailto:aq-mdlzpbs-support@kantar.com">aq-mdlzpbs-support@kantar.com</a></span></br> <span>For any scope or data related queries, please drop a mail at:  </br> <a class="loginlink" href="mailto:EP-MDLZ@europanel.com">EP-MDLZ@europanel.com</a></span>';
        this.SUPPORT_HEADER_TEXT = 'Support';
        this.SOMETHING_WRONG_REFRESH = 'Something went wrong. Please refresh the screen and try. If it is occuring again, please contact support team.';
    }]);
});
