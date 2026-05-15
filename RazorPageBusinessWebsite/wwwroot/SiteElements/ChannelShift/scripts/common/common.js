//mobile search query
var searchQuery = function (Id) {
    var queryText = $("#" + Id).val();
    window.utilities.searchQuery(queryText);
    return false;
};

function handleKeyPress(e) {
    var key = e.keyCode || e.which;
    if (key === 13) {
        searchQuery('mobile_searchquery_text');
    }
}

//proxy sign up call
var clearError = function (id) {
    $("#" + id).html("");
};

var console = console || {};
console.log = console.log || function () { }; var console = console || {};

var logger = function () {
    var oldConsoleLog = null;
    var pub = {};

    pub.enableLogger = function enableLogger() {
        if (oldConsoleLog === null) {
            return;
        }

        window['console']['log'] = oldConsoleLog;
    };

    pub.disableLogger = function disableLogger() {
        oldConsoleLog = console.log;
        window['console']['log'] = function () { };
    };

    return pub;
}();

(function (commonservices, $, undefined) {

    window.BLACKPOOL_CONFIG = null;
    var _ROOT_API_URL   = null;
    var _CMS_URL        = null;
 

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    };

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    };
 

    var root = function () {

        return _ROOT_API_URL
    };

    var additionalInfo = function () {

        try {
            var nolist = $("#RelatedItemsasStandardList_List").find("a");
            if (nolist !== null && nolist.length > 0) {
                $("#RelatedItemsasStandardList_List").parent().css("display", "block");
            }
            else {
                $("#RelatedItemsasStandardList_List").parent().css("display", "none");
            }
        }
        catch (e) { }
    };

    var httpsRedirect = function () {
        if (window.location.protocol !== "https:") {
            if (window.location.href.indexOf("preview") < 0) {
                var httpURL = window.location.hostname + window.location.pathname;
                var httpsURL = "https://" + httpURL;
                //window.location = httpsURL;
            }
        }
    };

  
    commonservices.init = function (cmsurl, apiUrl) {
        _CMS_URL        = cmsurl;
        _ROOT_API_URL   = apiUrl;

        window.BLACKPOOL_CONFIG  =  {
            deliveryApi:
            {
                accessToken: '',
                rootUrl: _ROOT_API_URL,
                projectId: 'lgWebsite',
                templateUrls: {
                    project         :'/api/delivery/project/{0}',
                    contenttype     :'/api/delivery/project/{0}/contenttype/{1}',
                    contenttypes    :'/api/delivery/project/{0}/contenttypes/{1}',
                    contenttypeField:'/api/delivery/project/{0}/contenttypes/{1}/{2}',
                    entryById       :'/api/delivery/project/{0}/entries/{1}',
                    entriesSearch   :'/api/delivery/project/{0}/search'
                }
            },
            democracyUrl: root() + '/api/Democracy/',
            veoliaUrl: root() + '/api/WasteServices/',
            bartecUrl: root() + '/api/bartec/',
            surgeTestingUrl: root() + '/api/surgetesting/',
            googleUrl: root() + '/api/Google/',
            googleSheetsUrl: root() + '/api/googlesheets/',
            pollingStationUrl: root() + '/api/pollingstation/',
            webCasting: root() + "/api/WebCast/",
            locationMaps: root() + "/api/LocationMaps/",
            nhschoicesUrl: root() + "/api/NHSChoices/",
            twitterUrl: root() + '/api/twitter/',
            libraryUrl: root() + '/api/library',
            sportWebBookingUrl      : 'https://webbookings.blackpool.gov.uk/connect/mrmlogin.aspx',
            sportWebBookingJoinUrl  : 'http://sport.blackpool.gov.uk/offers/ ',
            includePollingStation: true,
            includeGoogleServices: false,
            precompiledHandlebars: false
        };
    };

    commonservices.Config = function () { 
        return window.BLACKPOOL_CONFIG;
    };

    commonservices.SetConfig = function (config) { 
        window.BLACKPOOL_CONFIG = config;
    };

    commonservices.Redirect = function () {
        httpsRedirect();
    };

    commonservices.Kiosk = function () {
        var url = document.referrer;
        if (url.indexOf("www2") !=-1) {
              setCookie("kioskmode", true, 1);
        }
        var val = getCookie("kioskmode");
        if (val) {
            console.log('hide social media links');
            setTimeout(function(){ 
                document.getElementById("footer-top-outer-container").style.display = "none";
            }, 800);
     
        }
    };

    commonservices.removeCMSForm = function () {

        try {
            var $form = $('#form1');
            $form.replaceWith($form.html());
        } catch (e) {
            //alert('remove form1 error:' + e.message);
        }

    };

    commonservices.AdditionalInformation = function () { return additionalInfo(); };

    commonservices.IsNumberKey = function (evt) {

        var charCode = (evt.which) ? evt.which : evt.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;
    };

    commonservices.returnHandlebarTemplate = function (hbars, sourceId) {

        if (window.BLACKPOOL_CONFIG.precompiledHandlebars) {
            return hbars.templates[sourceId];
        }
        return hbars.compile($("#" + sourceId).html());
    };

    commonservices.registerHandlebarPartial = function (hbars, sourceId) {
        if (window.BLACKPOOL_CONFIG.precompiledHandlebars) {
            hbars.registerPartial(sourceId, Handlebars.partials[sourceId]);
        }
        hbars.registerPartial(sourceId, $("#" + sourceId).html());
    };


})(window.commonservices = window.commonservices || {}, jQuery);


commonservices.Kiosk();