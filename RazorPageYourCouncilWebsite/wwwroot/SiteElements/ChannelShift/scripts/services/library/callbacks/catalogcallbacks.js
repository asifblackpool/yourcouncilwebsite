"use strict";
(function (catalogcallbacks, $, undefined) {
  
    var _searchResultsData = null;
    var _pickulocationcallbacks = null;
    var _catalogItemcallback = null;
    var _sharedcallback = null;
    var _commonlibraryservices = null;
    var _timeout = null;
    var buttonClick = { RESERVE: 0, ADD_MYLIST: 1, RESERVE_ALL: 2, ADD_MYLIST_ALL: 3 };
    var clickdata = { click: buttonClick, selectedclick: null, Ids: new Array() };
    var titleId = null;
    
    var setCookie = function (isOK, val) {
        commonlibraryservices.setCookie(isOK, val);
    };


    var orderbyPopulate = function (data) {

        var populateContent = function (data) {
            _commonlibraryservices.catalogTemplate().clearResults();
            _commonlibraryservices.catalogTemplate().populateResults(data);
            _commonlibraryservices.hide();
            
        };

        populateContent(data);
        bindSearchButtonsEventCallback();
    };

    var getAllCheckedItems = function () {
        var values = $('div.catalog-item input:checked').map(function () {
            return this.value;
        }).get();

        return (values.length > 0) ? values : null;
    };

    var selectAll = function () {
        $("#checkbox-all").change(function () { 
            $("div.catalog-item input[type='checkbox']").prop('checked', $(this).prop("checked")); 
        });
    };

    var deselectAll = function () {
        $("div.catalog-item input[type='checkbox']").prop('checked', false);
    };

    var addReserveClick = function () {
        $('.reserve-click').on('click', function (e) {
            clickdata.Ids = new Array();
            clickdata.Ids.push(((this.id).split('-'))[1]);
            clickdata.selectedclick = clickdata.click.RESERVE;
            _commonlibraryservices.show();
            _sharedcallback.clickData(clickdata);
            _sharedcallback.searchView(_commonlibraryservices.searchView().SEARCH);
            securitylibraryservices.authenticated(_sharedcallback.reserveCallback);
        });
    };

    var addMyListClick = function () {
        $('.mylist-click').on('click', function (e) {
            clickdata.Ids = new Array();
            clickdata.Ids.push(((this.id).split('-'))[1]);
            clickdata.selectedclick = clickdata.click.ADD_MYLIST;
            commonlibraryservices.show();
            _sharedcallback.clickData(clickdata);
            _sharedcallback.searchView(_commonlibraryservices.searchView().SEARCH);
            securitylibraryservices.authenticated(_sharedcallback.mylistCallback); 
        });
    };

    var addReserveAllClick = function () {
        $('.reserve-all-click').on('click', function (e) {

            clickdata.Ids = getAllCheckedItems();
            clickdata.selectedclick = clickdata.click.RESERVE_ALL;
            if (clickdata.Ids === null) {
                commonlibraryservices.overlay(100, 'You need to select your items by ticking the checkbox(s).');
                setCookie(false, '');
            }
            else {
                commonlibraryservices.show();
                _sharedcallback.clickData(clickdata);
                _sharedcallback.searchView(_commonlibraryservices.searchView().SEARCH);
                securitylibraryservices.authenticated(_sharedcallback.reserveCallback);
            }
        });
    };

    var addMyListAllClick = function () {
        $('.mylist-all-click').on('click', function (e) {

            clickdata.Ids = getAllCheckedItems();
            clickdata.selectedclick = clickdata.click.ADD_MYLIST_ALL;
            if (clickdata.Ids === null) {
                commonlibraryservices.overlay(100, 'You need to select your items by ticking the checkbox(s).');
                setCookie(false, '');
            }
            else {
                commonlibraryservices.show();
                _sharedcallback.clickData(clickdata);
                _sharedcallback.searchView(_commonlibraryservices.searchView().SEARCH);
                securitylibraryservices.authenticated(_sharedcallback.mylistCallback);
            }
        });
    };

    var detailLinkClick = function () {
        $('a.catalog-detail-link').on('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            _commonlibraryservices.show();
            var splitter = (this.id).split('-');
            cataloglibraryservices.catalogitem(parseInt(splitter[1]), function (isOk) {
                if (isOk) {
                    _catalogItemcallback.searchView(_commonlibraryservices.searchView().SEARCH);
                    _catalogItemcallback.itemClicks(isOk);
                }
            });
        });
    };

    var bindSearchButtonsEventCallback = function () {

        var onSelectFilter = function () {

            var id_class_name = "select.catalog-results-filter";
            var selectedIndex = 0;

            $(id_class_name).on('change', function () {

                selectedIndex = this.selectedIndex;
                switch (this.value) {
                    case 'Title':
                        _searchResultsData.sort(_commonlibraryservices.predicateBy("titleField"));
                        orderbyPopulate(_searchResultsData);
                        selectedIndex = this.selectedIndex;
                        break;
                    case 'Author':
                        _searchResultsData.sort(_commonlibraryservices.predicateBy("authorField"));
                        orderbyPopulate(_searchResultsData);
                        selectedIndex = this.selectedIndex;
                        break;
                    case 'Publish':
                        _searchResultsData.sort(_commonlibraryservices.predicateBy("datePublishedField"));
                        orderbyPopulate(_searchResultsData);
                        selectedIndex = this.selectedIndex;
                        break
                    default:
                        break;
                }

                $(id_class_name).prop("selectedIndex", selectedIndex)
            });
        };

        selectAll();
        addReserveClick();
        addMyListClick();
        addReserveAllClick();
        addMyListAllClick();
        detailLinkClick();
        onSelectFilter();

        _catalogItemcallback.searchView(_commonlibraryservices.searchView().SEARCH);
        _catalogItemcallback.itemClicks();
    };

    catalogcallbacks.init = function (commonlibraryservices, catalogitemcallback, pickupcallback, sharedcallback) {
        _sharedcallback             = sharedcallback;
        _pickulocationcallbacks     = pickupcallback;
        _catalogItemcallback        = catalogitemcallback;
        _commonlibraryservices      = commonlibraryservices;
        _sharedcallback.init(_commonlibraryservices, _pickulocationcallbacks);
        _catalogItemcallback.init(_commonlibraryservices, _pickulocationcallbacks, _sharedcallback,null);

    };

    catalogcallbacks.addReserveButtonClick = function () {
        addReserveClick();
    };

    catalogcallbacks.addMyListButtonClick = function () {
        addMyListClick();
    };

    catalogcallbacks.bindSearchButtonsEventCallback = function (isOK, data) {
        _searchResultsData = data;
        bindSearchButtonsEventCallback();
    };
    
    catalogcallbacks.deselectAllCheckboxes = function () {
        deselectAll();
    };

})(window.catalogcallbacks = window.catalogcallbacks || {}, jQuery);





