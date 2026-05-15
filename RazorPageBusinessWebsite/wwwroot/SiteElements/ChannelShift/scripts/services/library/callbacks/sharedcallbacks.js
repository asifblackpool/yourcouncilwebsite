"use strict";
(function (sharedcallbacks, $, undefined) {

    var _pickulocationcallbacks = null;
    var _commonlibraryservices = null;
    var _timeout = null;
    var _clickdata = null;
    var _searchview = null;
    var buttonClick = { RESERVE: 0, ADD_MYLIST: 1, RESERVE_ALL: 2, ADD_MYLIST_ALL: 3 };

    var setCookie = function (isOK, val) {
        commonlibraryservices.setCookie(isOK, val);
    };

    var loginCallback = function (isOk, clickdata) {

        switch (clickdata.selectedclick) {
            case clickdata.click.ADD_MYLIST:
            case clickdata.click.ADD_MYLIST_ALL:
                myListCallback(isOk);
                break;
            case clickdata.click.RESERVE:
            case clickdata.click.RESERVE_ALL:
                reserveCallback(isOk);
                break;
            default:
                _commonlibraryservices.showHide(_searchview);
        }

        securitylibraryservices.clearloginTemplate();
        _commonlibraryservices.hide();
    };

    var reserveCallback = function (loginState) {

        if (!loginState) {

            _commonlibraryservices.showHide(_commonlibraryservices.searchView().LOGIN);
            securitylibraryservices.goToLoginPage(loginCallback, _clickdata);
        }
        else {
            _commonlibraryservices.showHide(_commonlibraryservices.searchView().PICKUP_LOCATION);
            _commonlibraryservices.show();
            var backto = _searchview;
            sharedlibraryservices.populatePickupLocation(_clickdata.Ids, backto, function (success) {
                if (success) {
                    _pickulocationcallbacks.bindEvents(_clickdata.Ids, backto, true, function (isOk) {
                        securitylibraryservices.yourStatus(true);
                    });
                }
            });
        }
    };

    var myListCallback = function (loginState) {

        if (!loginState) {
            setCookie(false, -1);
            _commonlibraryservices.showHide(commonlibraryservices.searchView().LOGIN);
            securitylibraryservices.goToLoginPage(loginCallback, _clickdata);
        }
        else {
            _commonlibraryservices.show();
            _commonlibraryservices.showHide(_searchview);
            accountlibraryservices.savemylist(_clickdata.Ids, 'create', function (success) {
                var msg = success ? "My List items has been successfully updated." : "Unable to update My List items.";
                _commonlibraryservices.overlay(100, msg);
                setCookie(success, _searchview);
            });
        }
    };

    sharedcallbacks.init = function (commonlibraryservices, pickupcallback) {
        _pickulocationcallbacks = pickupcallback;
        _commonlibraryservices = commonlibraryservices;
    };

    sharedcallbacks.reserveCallback = function (loginState) {
        reserveCallback(loginState)
    };

    sharedcallbacks.mylistCallback = function (loginState) {
        myListCallback(loginState);
    };

    sharedcallbacks.loginCallback = function (isOk, clickdata) {
        loginCallback(isOk, clickdata);
    };

    sharedcallbacks.searchView = function (val) {
        _searchview = val;
    };

    sharedcallbacks.clickData = function (data) {
        _clickdata = data;
    };

})(window.sharedcallbacks = window.sharedcallbacks || {}, jQuery);