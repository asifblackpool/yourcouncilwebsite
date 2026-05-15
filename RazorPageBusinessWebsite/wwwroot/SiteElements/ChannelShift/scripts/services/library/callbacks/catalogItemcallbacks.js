"use strict";
(function (catalogitemcallbacks, $, undefined) {

    var _pickulocationcallbacks = null;
    var _commonlibraryservices = null;
    var _sharedcallback = null;
    var _timeout = null;
    var _searchView = null;
    var buttonClick = { RESERVE: 0, ADD_MYLIST: 1, RESERVE_ALL: 2, ADD_MYLIST_ALL: 3 };
    var clickdata = { click: buttonClick, selectedclick: null, Ids: new Array() };
    var titleId = null;

    var setCookie = function (isOK, val) {
        _commonlibraryservices.setCookie(isOK, val);
    };

    //all buttons event bindings
    var itemClicks = function (isOK) {
        var reserveItemClick = function () {

            $('.reserve-item-click').on('click', function (e) {
                titleId = ((this.id).split('-'))[2];
                clickdata.Ids.push(titleId);
                clickdata.selectedclick = clickdata.click.RESERVE;
                _commonlibraryservices.show();
                _sharedcallback.clickData(clickdata);
                _sharedcallback.searchview =
                _sharedcallback.searchView(_searchView);
                securitylibraryservices.authenticated(_sharedcallback.reserveCallback);

            });
        };

        var mylistItemClick = function () {
            $('.mylist-item-click').on('click', function (e) {
                titleId = ((this.id).split('-'))[2];
                clickdata.Ids.push(titleId);
                clickdata.selectedclick = clickdata.click.ADD_MYLIST;
                _commonlibraryservices.show();
                _sharedcallback.clickData(clickdata);
                _sharedcallback.searchView(_searchView);
                securitylibraryservices.authenticated(_sharedcallback.mylistCallback);
            });
        };

        var backbuttonclick = function () {

            $('button#back-to-search').on('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                _commonlibraryservices.show();
                setTimeout(function () {
                    (_commonlibraryservices.catalogTemplate()).clearAvailabilty();
                    _commonlibraryservices.setcontentview(_searchView);
                    _commonlibraryservices.showHide(_searchView);
                    _commonlibraryservices.hide();
                }, _timeout);
            });
        };

        if (isOK) {
            reserveItemClick();
            mylistItemClick();
            backbuttonclick();
        }

    };


    catalogitemcallbacks.init = function (commonlibraryservices,  pickupcallback, sharedcallback, searchView) {
        _sharedcallback = sharedcallback;
        _pickulocationcallbacks = pickupcallback;
        _commonlibraryservices = commonlibraryservices;
        _searchView = searchView; 
    };
    
    catalogitemcallbacks.searchView = function (val) {
        _searchView = val;
    };

    catalogitemcallbacks.addReserveButtonClick = function () {
        addReserveClick();
    };

    catalogitemcallbacks.addMyListButtonClick = function () {
        addMyListClick();
    };

    catalogitemcallbacks.itemClicks = function (isOK) {
        itemClicks(isOK);
    };


})(window.catalogitemcallbacks = window.catalogitemcallbacks || {}, jQuery);