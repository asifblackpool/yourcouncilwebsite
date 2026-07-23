"use strict";
(function (commonlibraryservices, $, undefined) {

    var libraryLookups = new Array();
    var _timeout = 50;
    var _cookiservice = null;

    function trace(message) {
        if (typeof console != 'undefined') {
            console.log(message);
        }
    }

    function search(array, key, prop) {
        // Optional, but fallback to key['name'] if not selected
        prop = (typeof prop === 'undefined') ? 'name' : prop;

        for (var i = 0; i < array.length; i++) {
            if (array[i][prop] === key) {
                return array[i];
            }
        }

        return null;
    }

    function predicateBy(prop) {
        return function (a, b) {
            if (a[prop] > b[prop]) {
                return 1;
            } else if (a[prop] < b[prop]) {
                return -1;
            }
            return 0;
        }
    }

    var getQueryString = function (field, url) {
        var href = url ? url : window.location.href;
        var reg = new RegExp('[?&]' + field + '=([^&#]*)', 'i');
        var string = reg.exec(href);
        return string ? string[1] : null;
    };

    var shortenString = function (str, len) {

        if (str !== null) {
            var stringLength = str.length;

            if (stringLength > len)
                return str.substring(0, len);
        }

        return str;
    };

    var createFirstSelectOption = function (Id, val, txt) {
        var s = $("<select id='" + Id + "' />");
        $('<option />', { value: val, text: txt }).appendTo(s);
        return s;
    };

    var returnListObjects = function (data) {

        var obj = [];
        if (Array.isArray(data)) {
            $.each(data, function (i, item) {
                obj.push(item);
            });
        }
        else {
            obj.push(data);
        }
        return obj;
    };

    var sharedTemplates = function () {

        var templates = {
            handlebarIDs: {
                pickuplocation: 'pickup-location-template',
                yourstatus: 'your-status-template'
            },
            contentIDs: {
                pickuplocation: 'pickup-location-content',
                yourstatus: 'your-status-content'
            },
            populatePickupLocation: function (pickup) {

                $('#' + this.contentIDs.searchContainer).hide();
                var template = Handlebars.compile($("#" + this.handlebarIDs.pickuplocation).html());
                var htmldata = template({ apidata: pickup.data, apiview: pickup.viewmode });
                $('#' + this.contentIDs.pickuplocation).html(htmldata);
                $('#' + this.contentIDs.pickuplocation).show();
                scrollTo(this.contentIDs.pickuplocation, false);

            },
            populateYourStatus: function (data) {
                var template = Handlebars.compile($("#" + this.handlebarIDs.yourstatus).html());
                var htmldata = template({ apidata: data });
                $('#' + this.contentIDs.yourstatus).html(htmldata);
                $('#' + this.contentIDs.yourstatus).show();
            },
            clearYourStatus: function () {
                $('#' + this.contentIDs.yourstatus).html('');
                $('#' + this.contentIDs.yourstatus).hide();
            },
            clearPickupLocation: function () {
                $('#' + this.contentIDs.pickuplocation).html('');
                $('#' + templates.contentIDs.pickuplocation).hide();
            },
            reset: function () {
                this.clearPickupLocation();
                this.clearYourStatus();

            }
        };

        return templates;

    };

    var catalogTemplates = function () {

        var templates = {
            handlebarIDs: {
                results: 'search-book-results-template',
                pagination: 'search-book-pagination-template',
                availability: 'availability-catalog-template',
                availabilityPartial: 'availability-information-partial',
                whatsNew: 'whats-new-template',
                advancedSearch: 'advanced-search-template'

            },
            contentIDs: {
                results: 'catalog-results-content',
                paginationTop: 'catalog-pagination-content-top',
                paginationBottom: 'catalog-pagination-content-bottom',
                availability: 'catalog-availability-content',
                searchcatalog: 'search-catalog',
                searchContainer: 'library-search-container',
                whatsNew: 'whats-new-content',
                advancedSearch: 'advanced-search-form-content'
            },
            populateResults: function (data) {

                var template = Handlebars.compile($("#" + this.handlebarIDs.results).html());
                var htmldata = template({ apidata: data });
                $('#' + this.contentIDs.searchcatalog).show();
                $('#' + this.contentIDs.results).html(htmldata);
                scrollTo(this.contentIDs.searchcatalog, false);
            },
            populatePagination: function (data, records) {

                $('#' + this.contentIDs.searchContainer).show();
                var template = Handlebars.compile($("#" + this.handlebarIDs.pagination).html());
                var htmldataTop = template({ apipages: data, apirecords: records, apilocation: 'top' });
                var htmldataBottom = template({ apipages: data, apirecords: records, apilocation: 'bottom' });
                $('#' + this.contentIDs.paginationTop).html(htmldataTop);
                $('#' + this.contentIDs.paginationBottom).html(htmldataBottom);
            },
            populateAvailability: function (data) {

                $('#' + this.contentIDs.searchContainer).hide();

                var template = Handlebars.compile($("#" + this.handlebarIDs.availability).html());
                Handlebars.registerPartial(this.handlebarIDs.availabilityPartial, $("#" + this.handlebarIDs.availabilityPartial).html());
                var htmldata = template({ apidata: data.TitleInfo });
                $('#' + this.contentIDs.availability).html(htmldata);

            },
            populateAdvancedSearch: function () {
                $('#' + this.contentIDs.advancedSearch).show();

                var template = Handlebars.compile($("#" + this.handlebarIDs.advancedSearch).html());
                var htmldata = template({ apidata: null });
                $('#' + this.contentIDs.advancedSearch).html(htmldata)
                scrollTo(this.contentIDs.advancedSearch, false);
            },
            populateWhatsNew: function (items, item) {
                var template = Handlebars.compile($("#" + this.handlebarIDs.whatsNew).html());
                var htmldata = template({ apilist: items, apidata: item });
                $('#' + this.contentIDs.whatsNew).html(htmldata);
                scrollTo(this.contentIDs.whatsNew, false);

            },
            clearResults: function () {
                $('#' + this.contentIDs.results).html('');
            },
            clearSearchInputBox: function () {
                $('#' + 'library-search').val('');
            },
            clearPagination: function () {
                $('#' + this.contentIDs.paginationTop).html('');
                $('#' + this.contentIDs.paginationBottom).html('');
            },
            clearAvailabilty: function () {
                $('#' + this.contentIDs.availability).html('');
            },
            clearAdvancedSearch: function () {
                $('#' + this.contentIDs.advancedSearch).html('');
            },
            clearWhatsNew: function () {
                $('#' + this.contentIDs.whatsNew).html('');
            },
            showSearchInput: function () {
                $('#' + templates.contentIDs.searchContainer).show();
            },
            hideSearchInput: function () {
                $('#' + templates.contentIDs.searchContainer).hide();
            },
            reset: function () {
                this.clearPagination();
                this.clearAvailabilty();
                this.clearResults();
                this.clearWhatsNew();
            }
        };

        return templates;

    };

    var accountTemplates = function () {
        var accountTemplate = {
            handlebarIDs: {
                account: {
                    main: 'account-template',
                    location: 'edit-location-template',
                    suspend: 'suspend-item-template',
                    partials:
                    {
                        mydetails: 'mydetails-partial',
                        changepin: 'changepin-partial',
                        preferences: 'preferences-partial',
                        onloan: 'onloan-partial',
                        onhold: 'onhold-partial',
                        mylist: 'mylist-partial',
                        mylistemail: 'mylist-email-partial',
                        fines: 'fines-partial'
                    }
                }
            },
            contentIDs: {
                account: 'account-content',
                location: 'account-location-content',
                mylist: { email: 'email-mylist-container', main: 'mylist-container' },
                suspend: 'suspend-content'
            },
            populateAccount: function (account, mylist) {
                var template = Handlebars.compile($("#" + this.handlebarIDs.account.main).html());
                Handlebars.registerPartial(this.handlebarIDs.account.partials.mydetails, $("#" + this.handlebarIDs.account.partials.mydetails).html());
                Handlebars.registerPartial(this.handlebarIDs.account.partials.changepin, $("#" + this.handlebarIDs.account.partials.changepin).html());
                Handlebars.registerPartial(this.handlebarIDs.account.partials.preferences, $("#" + this.handlebarIDs.account.partials.preferences).html());
                Handlebars.registerPartial(this.handlebarIDs.account.partials.onloan, $("#" + this.handlebarIDs.account.partials.onloan).html());
                Handlebars.registerPartial(this.handlebarIDs.account.partials.onhold, $("#" + this.handlebarIDs.account.partials.onhold).html());
                Handlebars.registerPartial(this.handlebarIDs.account.partials.mylist, $("#" + this.handlebarIDs.account.partials.mylist).html());
                Handlebars.registerPartial(this.handlebarIDs.account.partials.mylistemail, $("#" + this.handlebarIDs.account.partials.mylistemail).html());
                Handlebars.registerPartial(this.handlebarIDs.account.partials.fines, $("#" + this.handlebarIDs.account.partials.fines).html());

                var htmldata = template({ apiAccountInfo: account, apiMyList: mylist });
                $('#' + this.contentIDs.account).html(htmldata);
                this.setPageTitle('My library account');


            },
            clearAccount: function () {
                $('#' + this.contentIDs.account).html('');
            },
            hideAccount: function () {
                $('#' + this.contentIDs.account).hide();
            },
            showAccount: function () {
                $('#' + this.contentIDs.account).show();
            },
            populateLocation: function (data) {
                var template = Handlebars.compile($("#" + this.handlebarIDs.account.location).html());
                var htmldata = template({ apidata: data });
                $('#' + this.contentIDs.location).html(htmldata);
                scrollTo(this.contentIDs.location, false);

                this.setPageTitle('My library account');
            },
            populateSuspend: function (data) {
                var template = Handlebars.compile($("#" + this.handlebarIDs.account.suspend).html());
                var htmldata = template({ apidata: data });
                $('#' + this.contentIDs.suspend).html(htmldata);
                scrollTo(this.contentIDs.suspend, false);
                this.setPageTitle('My library account');
            },
            clearLocation: function () {
                $('#' + this.contentIDs.location).html('');
            },
            clearSuspend: function () {
                $('#' + this.contentIDs.suspend).html('');
            },
            hideLocation: function () {
                $('#' + this.contentIDs.location).hide();
            },
            showLocation: function () {
                $('#' + this.contentIDs.location).show();
            },
            hideSuspend: function () {
                $('#' + this.contentIDs.suspend).hide();
            },
            showSuspend: function () {
                $('#' + this.contentIDs.suspend).show();
            },
            setPageTitle: function (text) {
                $('.library-h1-title').html(text)
            },
            reset: function () {
                this.clearAccount();
                this.clearSuspend();
                this.clearLocation();

                this.hideAccount();
                this.hideLocation();
                this.hideSuspend();
            }
        };

        return accountTemplate;

    };

    var loginTemplates = function () {
        var loginTemplate = {
            handlebarIDs: {
                login: 'login-template',
                loginlink: 'loginlink-template',
                partials:
                {
                    resetPin: 'resetpin-partial',
                    resetPinConfirm: 'resetpin-confirm-partial'
                }
            },
            contentIDs: {
                login: 'login-content',
                loginlink: 'library-login-link',
                forms:
                {
                    login: 'login-form',
                    resetpin: 'resetpin-form',
                    resetpinconfirm: 'resetpin-confirm-form'
                }
            },
            populateLogin: function (libraryUrls) {

                var data = {};
                data.urls = libraryUrls;
                var template = Handlebars.compile($("#" + this.handlebarIDs.login).html());
                Handlebars.registerPartial(this.handlebarIDs.partials.resetPin, $("#" + this.handlebarIDs.partials.resetPin).html());
                Handlebars.registerPartial(this.handlebarIDs.partials.resetPinConfirm, $("#" + this.handlebarIDs.partials.resetPinConfirm).html());

                var htmldata = template({ apidata: data });
                $('#' + this.contentIDs.login).html(htmldata);
                scrollTo(this.contentIDs.login, false);
                this.setPageTitle('Log into your library account');
            },
            populateLoginLink: function (name, libraryUrls) {

                var data = {};
                data.user = name;
                data.urls = libraryUrls;

                var template = Handlebars.compile($("#" + this.handlebarIDs.loginlink).html());
                var htmldata = template({ apidata: data });
                $('#' + this.contentIDs.loginlink).html(htmldata);
            },
            showLogin: function () {
                $('#' + this.contentIDs.forms.login).show();
            },
            hideLogin: function () {
                $('#' + this.contentIDs.forms.login).hide();
            },
            showResetPin: function () {
                $('#' + this.contentIDs.forms.resetpin).show();
            },
            hideResetPin: function () {
                $('#' + this.contentIDs.forms.resetpin).show();
            },
            showResetPinConfirm: function () {
                $('#' + this.contentIDs.forms.resetpinconfirm).show();
            },
            hideResetPinConfirm: function () {
                $('#' + this.contentIDs.forms.resetpinconfirm).hide();
            },
            clearLogin: function () {
                $('#' + this.contentIDs.login).html('');
            },
            clearLoginLink: function () {
                $('#' + this.contentIDs.loginlink).html('');
            },
            setPageTitle: function (text) {
                $('.library-h1-title').html(text);
            },
            reset: function () { }
        };

        return loginTemplate;
    };

    var overlayTemplates = function () {
        var overlayTemplate = {

            contentIDs: {
                overlay: 'library-overlay-text'
            },
            populateOverlay: function (data) {
                $('#' + this.contentIDs.overlay).html(data);
            },
            clearOverlay: function () {
                $('#' + this.contentIDs.overlay).html('');
            },

            reset: function () { }
        };

        return overlayTemplate;
    };

    var hide = function () {
        $('#library-loading-indicator').hide();
    };

    var loadLibraries = function () {

        libraryLookups.push({ value: 'Anchorsholme', key: 'ANC' });
        libraryLookups.push({ value: 'Library @thegrange', key: 'GRA' });
        libraryLookups.push({ value: 'Central', key: 'CEN' });
        libraryLookups.push({ value: 'Layton', key: 'LAY' });
        libraryLookups.push({ value: 'Mereside', key: 'MER' });
        libraryLookups.push({ value: 'Moor Park', key: 'MOR' });
        libraryLookups.push({ value: 'Palatine', key: 'PAL' });
        libraryLookups.push({ value: 'Revoe', key: 'REV' });

        return libraryLookups;
    };

    var searchview = function () {
        var obj = { SEARCH_DEFAULT: 0, SEARCH: 1, ITEM_DETAIL: 2, PICKUP_LOCATION: 3, LOGIN: 4, ADV_SEARCH: 5, ACCOUNT: 6, FORGOTTEN_PASSWORD: 7 };
        return obj;
    };

    var setcontentview = function (pageview) {
        window.cookieservices.EraseCookie("contentview");
        window.cookieservices.CreateCookie("contentview", pageview, 0.05);
    };

    var scrollTo = function (Id, isclass) {
        var t = (isclass) ? '.' : '#';

        $('html,body').animate({
            scrollTop: $(t + Id).offset().top - 100
        }, 'slow');
    };

    var showHide = function (contentview) {

        switch (contentview) {
            case searchview().SEARCH_DEFAULT:
                $("#" + "library-search-container").show();
                $("#" + catalogTemplates().contentIDs.searchcatalog).hide();
                $("#" + catalogTemplates().contentIDs.availability).hide();
                $('#' + sharedTemplates().contentIDs.pickuplocation).hide();
                $('#' + catalogTemplates().contentIDs.advancedSearch).hide();
                $('#' + catalogTemplates().contentIDs.whatsNew).show();
                scrollTo(catalogTemplates().contentIDs.whatsNew, false);
                break;
            case searchview().SEARCH:
                $("#" + "library-search-container").show();
                $("#" + catalogTemplates().contentIDs.searchcatalog).show();
                $("#" + catalogTemplates().contentIDs.availability).hide();
                $('#' + sharedTemplates().contentIDs.pickuplocation).hide();
                $('#' + catalogTemplates().contentIDs.advancedSearch).hide();
                $('#' + catalogTemplates().contentIDs.whatsNew).hide();
                scrollTo(catalogTemplates().contentIDs.searchcatalog, false);
                break;
            case searchview().ITEM_DETAIL:
                $("#" + "library-search-container").hide();
                $("#" + catalogTemplates().contentIDs.searchcatalog).hide();
                $("#" + catalogTemplates().contentIDs.availability).show();
                $('#' + sharedTemplates().contentIDs.pickuplocation).hide();
                $('#' + catalogTemplates().contentIDs.advancedSearch).hide();
                $('#' + catalogTemplates().contentIDs.whatsNew).hide();
                scrollTo(catalogTemplates().contentIDs.availability, false);
                break;
            case searchview().PICKUP_LOCATION:
                $("#" + "library-search-container").hide();
                $("#" + catalogTemplates().contentIDs.searchcatalog).hide();
                $("#" + catalogTemplates().contentIDs.availability).hide();
                $('#' + catalogTemplates().contentIDs.advancedSearch).hide();
                $('#' + sharedTemplates().contentIDs.pickuplocation).show();
                $('#' + catalogTemplates().contentIDs.whatsNew).hide();
                $("#" + accountTemplates().contentIDs.account).hide();
                $("#" + accountTemplates().contentIDs.location).hide();
                $('#' + accountTemplates().contentIDs.suspend).hide();
                scrollTo(sharedTemplates().contentIDs.pickuplocation, false);
                break;
            case searchview().LOGIN:
                $("#" + "library-search-container").hide();
                $("#" + catalogTemplates().contentIDs.searchcatalog).hide();
                $("#" + catalogTemplates().contentIDs.availability).hide();
                $('#' + catalogTemplates().contentIDs.pickuplocation).hide();
                $('#' + catalogTemplates().contentIDs.advancedSearch).hide();
                $('#' + sharedTemplates().contentIDs.yourstatus).hide();
                $('#' + catalogTemplates().contentIDs.whatsNew).hide();

                scrollTo(loginTemplates().contentIDs.login, false);
                break;
            case searchview().FORGOTTEN_PASSWORD:
                $("#" + "library-search-container").hide();
                $("#" + catalogTemplates().contentIDs.searchcatalog).hide();
                $("#" + catalogTemplates().contentIDs.availability).hide();
                $('#' + catalogTemplates().contentIDs.pickuplocation).hide();
                $('#' + catalogTemplates().contentIDs.advancedSearch).hide();
                $('#' + sharedTemplates().contentIDs.yourstatus).hide();
                $('#' + catalogTemplates().contentIDs.whatsNew).hide();
                $('#' + loginTemplates().contentIDs.forms.login).hide();
                $('#' + loginTemplates().contentIDs.forms.resetpin).hide();
                $('#' + loginTemplates().contentIDs.forms.resetpinconfirm).show();
                scrollTo(loginTemplates().contentIDs.forms.resetpinconfirm, false);
                break;
            case searchview().ADV_SEARCH:
                catalogTemplates().reset();
                catalogTemplates().clearResults();
                catalogTemplates().clearSearchInputBox();
                $("#" + "library-search-container").hide();
                $("#" + catalogTemplates().contentIDs.searchcatalog).hide();
                $("#" + catalogTemplates().contentIDs.availability).hide();
                $('#' + catalogTemplates().contentIDs.pickuplocation).hide();
                $('#' + catalogTemplates().contentIDs.advancedSearch).show();
                scrollTo(catalogTemplates().contentIDs.advancedSearch, false);
                break;
            case searchview().ACCOUNT:
                $("#" + accountTemplates().contentIDs.account).show();
                $("#" + accountTemplates().contentIDs.location).hide();
                $('#' + accountTemplates().contentIDs.suspend).hide();
                $('#' + catalogTemplates().contentIDs.whatsNew).hide();
                $('#' + sharedTemplates().contentIDs.pickuplocation).hide();
                $('#' + sharedTemplates().contentIDs.yourstatus).show();
                scrollTo(accountTemplates().contentIDs.account, false);

                break;
            default:
                break;
        }
    };

    commonlibraryservices.init = function (cs) {
        trace('call common library services init ');
        loadLibraries();
        _cookiservice = cs;
    };

    commonlibraryservices.trace = function (msg) {
        return trace(msg);
    };

    commonlibraryservices.getQueryString = function (field, url) {
        return getQueryString(field, url);
    };

    commonlibraryservices.returnListObjects = function (data) {
        return returnListObjects(data);
    };

    commonlibraryservices.getLibraryName = function (key, prop) {
        return search(libraryLookups, key, prop);
    };

    commonlibraryservices.catalogTemplate = function () {
        return catalogTemplates();
    };

    commonlibraryservices.accountTemplate = function () {
        return accountTemplates();
    };

    commonlibraryservices.loginTemplate = function () {
        return loginTemplates();
    };

    commonlibraryservices.overlayTemplate = function () {
        return overlayTemplates();
    };

    commonlibraryservices.sharedTemplate = function () {
        return sharedTemplates();
    };

    commonlibraryservices.showHide = function (contentview) {
        showHide(contentview);
    };

    commonlibraryservices.show = function () {
        $('#library-loading-indicator').show();
    };

    commonlibraryservices.hide = function () {
        hide();
    };

    commonlibraryservices.overlay = function (width, message) {

        (overlayTemplates()).populateOverlay(message);

        var style = "width:{0}%; height:250px;border:solid {1}px purple;";
        style = style.replace('{0}', width).replace('{1}', (width > 0) ? 2 : 0);
        hide();
        $("#library-message").attr('style', style);
    };

    commonlibraryservices.searchView = function () {
        return searchview();
    };

    commonlibraryservices.getTimeout = function () {
        return _timeout;
    };

    commonlibraryservices.hidesearchbar = function () {
        $('#search').attr('style', 'display:none;');
        $('#toggle-search').attr('style', 'display:none;');
    };

    commonlibraryservices.setcontentview = function (pageview) {
        setcontentview(pageview);
    };

    commonlibraryservices.getcontentview = function () {
        var val = window.cookieservices.ReadCookie("contentview");
        return parseInt((val !== null) ? val : -1);
    };

    commonlibraryservices.setCookie = function (isOK, val) {
        if (isOK) {
            setcontentview(val);
        } else {
            setcontentview(-1);
        }
    };

    commonlibraryservices.scrollTo = function (Id, isclass) {
        scrollTo(Id, isclass);
    };

    commonlibraryservices.predicateBy = function (prop) {
        return predicateBy(prop);
    };

    commonlibraryservices.PositionXY = function (Id) {
        var value = Math.abs(($('#' + Id).offset().top) - 450);
        $('.overlay').css('top', value);
    }


})(window.commonlibraryservices = window.commonlibraryservices || {}, jQuery);