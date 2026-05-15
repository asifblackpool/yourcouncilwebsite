"use strict";
(function (inquestservices, $, undefined) {

    var _zengenti                   = null;
    var _timeout                    = 100;
    var _template                   = null;
    var _templateId                 = 'inquest-template';
    var _contentPlaceHolder         = "inquest-placeholder";
    var _topPaginationPlaceHolder   = 'top-placeholder';
    var _templatePagination         = '';
    var _selectedItems              = new Array();
    var _rootUrl                    = '';
    var _projectId                  = '';
    var _accessToken                = '';
    var _searchTerm                 = '';
    var _qs                         = '';
    var _selectedFilter             = "";
    var _filterData                 = null;     
    var _loadPaging                 = false;
    var _pagingservices             = null;
    var _pagesize                   = null;
    var _currentPage                = 1;

    var errors = {
        emptyError: 'You have not entered a filter term.',
        dateError: 'Date error: you must enter the date in the following format eg 27/12/2016'
    };

    var formatDateTerm = function (term) {
        var dt = term.split('/');
        return dt[2]  + "-" + dt[1] + "-" +  dt[0];
    };

    var buildSearchUrl = function () {
        var deliveryApi = window.commonservices.Config().deliveryApi;
        var t           = deliveryApi.templateUrls.entriesSearch;
        t = t.replace('{0}', _projectId);

        return _rootUrl + t;

    };

    var showLoader = function () {
        $("#inquest-loading-indicator").show();
    };

    var hideLoader = function () {
        $("#inquest-loading-indicator").hide();
    };

    var populateTemplate = function (currentpage, data) {
        var template = null;
        var count    = (data !== null) ? data.totalCount : 0;
        var data     = (data !== null) ? data.items : [];

        $('.' + _topPaginationPlaceHolder).show();
        $("." + _contentPlaceHolder).html(_template({ apiInquests: data }));
        if (_loadPaging) {
            _pagingservices.reset();
            _pagingservices.create(currentpage, count, getInquests);
        }
        
        hideLoader();
    };

    var getInquestTemplate = function () {
        return commonservices.returnHandlebarTemplate(Handlebars, _templateId);
    };

    var getPaginationTemplate = function () {
        return commonservices.returnHandlebarTemplate(Handlebars, _pagingationTemplateId);
    };

    var getBottomPaginationTemplate = function () {
        return commonservices.returnHandlebarTemplate(Handlebars, _paginationBottomTemplateId);
    };

    var getInquests = function (currentpage, loadpaging) {

        var timeout         = null;
        var deliveryApi     = window.commonservices.Config().deliveryApi;
        var inquestApiUrl = deliveryApi.templateUrls.contenttypes + "?pageSize={2}&pageIndex={3}&order=";
        inquestApiUrl       = inquestApiUrl.replace('{0}', _projectId);
        inquestApiUrl       = inquestApiUrl.replace('{1}', 'inquests');
        inquestApiUrl       = inquestApiUrl.replace('{2}', _pagingservices.pagesize(5));
        inquestApiUrl       = inquestApiUrl.replace('{3}', currentpage - 1); //page 1 => index is 0
        inquestApiUrl       = _rootUrl + inquestApiUrl;
        _loadPaging         = loadpaging;
 
        resetTemplates();

        /* use ajax call get for test purposes only */
        function ajaxCallGet() {
            $.when($.ajax(inquestApiUrl))
               .done(function (data) {
                   if (data !== null) {
                       populateTemplate(currentpage, data);
                   }
                  
               }).fail(function () {
                   populateTemplate(0, null);
               });
        }

        /* use this in the live cms environment */
        function ajaxCallPost() {

            var dt = dateservices.DisplayDate(new Date(), 'dd/mm/yyyy');
           
            var data  = {
                "where": [{ "field": "dateOfHearing.to", "greaterThanOrEqualTo": ""},
                          { "field": "sys.contentTypeId", "equalTo": "inquests" },
                          { "field": "sys.versionStatus", "contains": "published" },
                          {"not": { "field": "nameOfTheDeceased", "equalTo": "Lee Antony Garforth"}},
                        ], 
                "pageSize": _pagesize, "pageIndex": currentpage - 1,
                "orderBy": [{ "asc": "dateOfHearing.from" }]
            };

            data.where[0].greaterThanOrEqualTo = formatDateTerm(dt) + "T00:00:00";
            $.ajax({
                url: buildSearchUrl(),
                type: "POST",
                headers: { 'accesstoken': _accessToken, 'Content-Type': 'application/json' },
                data: JSON.stringify(data),
                success: function (result) {
                    populateTemplate(currentpage, result);
                },
                error: function (error) {
                    populateTemplate(0, null);
                }
            });
        };
 
        if (timeout) {  clearTimeout(timeout); }
        timeout = setTimeout(ajaxCallPost, _timeout);
    };

    var getSearch = function (term, callback) {

        var selectedItem        = null;
        _searchTerm             = term;
        var data                = _filterData;

        if (_selectedFilter == 'date') {
            _searchTerm = formatDateTerm(_searchTerm);
            data.where[0].equalTo = _searchTerm;
        } else {
            data.where[0].contains = _searchTerm;
        }
       

        $.ajax({
            url: buildSearchUrl(),
            type: "POST",
            headers: { 'accesstoken': _accessToken, 'Content-Type': 'application/json' },
            data: JSON.stringify(data),
            success: function (result) {
                console.log(result);
               return callback(true,result);
               
            },
            error: function (error) {
                console.log("Something went wrong", error);
                return callback(false, new Array());
            }
        });
    };

    var bindSearchEvents = function () {

       $("#inquest-search-button").on( "click", function() {
            _loadPaging = true;
            var term = $('#autocomplete').val();

            if (term.length < 1) {
                showErrorMessage(errors.emptyError);
                return;
            }

            if (_selectedFilter === 'date') {
                var isvalid = utilities.validateDate(term);
                if (!isvalid) {
                    showErrorMessage(errors.dateError);
                    return;
                }
            }


            showLoader();
            resetTemplates();
            _pagingservices.reset();
            getSearch(term, function (isOk, data) {
                populateTemplate(1, data)
            });
       });

       $("#reset-search-button").on("click", function () {
           _loadPaging = true;
           $('#autocomplete').val('');
           hideErrorMessage();
           showLoader();
           resetTemplates();
           _pagingservices.reset();
           getInquests(1, _loadPaging);
       });
    };

    var resetTemplates = function () {
        $("." + _contentPlaceHolder).html("");
    };

    var showErrorMessage = function (message) {

        $('.error-message').html(message);
        $('.error-message').attr('style', 'display:block');
    };

    var hideErrorMessage = function () {
        $('.error-message').hide();
    };

    var filterby = function (selectedfilter) {

        _selectedFilter = selectedfilter;
        var dt = dateservices.DisplayDate(new Date(), 'dd/mm/yyyy');
        switch (selectedfilter) {
            case 'place':
                _filterData = {
                    "where": [{ "field": "placeOfDeath", "contains": "" },
                              { "field": "dateOfHearing.to", "greaterThanOrEqualTo": ""},
                              { "field": "sys.contentTypeId",  "equalTo": "inquests" },
                              { "field": "sys.versionStatus", "contains": "published" },
                              {"not": { "field": "nameOfTheDeceased", "equalTo": "Lee Antony Garforth"}},
                     ], 
                    "pageSize": _pagingservices.pagesize,
                    "orderBy": [{ "asc": "dateOfHearing.to" }]
                };
                $("#autocomplete").attr("placeholder", "Search by place");
                hideErrorMessage();
                break;
            case 'date':
                _filterData = {
                    "where": [{ "field": "dateOfDeath", "equalTo": "" },
                              { "field": "dateOfHearing.from", "greaterThanOrEqualTo": "" },
                              { "field": "sys.contentTypeId",  "equalTo": "inquests" },
                              { "field": "sys.versionStatus", "contains": "published" },
                              {"not": { "field": "nameOfTheDeceased", "equalTo": "Lee Antony Garforth"}},
                    ], 
                    "pageSize": _pagingservices.pagesize,
                    "orderBy": [{ "asc": "dateOfHearing.from" }]
                };
                $("#autocomplete").attr("placeholder", "Search by dd/mm/yyyy");
                break;
            default:
                _filterData = {
                    "where": [{ "field": "nameOfTheDeceased", "contains": "" },
                              { "field": "dateOfHearing.to", "greaterThanOrEqualTo": "" },
                              { "field": "sys.contentTypeId",  "equalTo": "inquests" },
                              { "field": "sys.versionStatus", "contains": "published" },
                              {"not": { "field": "nameOfTheDeceased", "equalTo": "Lee Antony Garforth"}},
                    ], 
                    "pageSize": _pagingservices.pagesize,
                    "orderBy": [{ "asc": "dateOfHearing.to" }]
                };
                $("#autocomplete").attr("placeholder", "Search by name");
                hideErrorMessage();
                break;
        }
        _filterData.where[1].greaterThanOrEqualTo = formatDateTerm(dt) + "T00:00:00";
    };

    inquestservices.filterby = function (selectedfilter) {
        $("autocomplete").val('');
        filterby(selectedfilter);
    };

    inquestservices.init = function (zengentiapi, pagingservices) {

        _zengenti                   = zengentiapi;
        _rootUrl                    = window.commonservices.Config().deliveryApi.rootUrl;
        _projectId                  = window.commonservices.Config().deliveryApi.projectId;
        _accessToken                = window.commonservices.Config().deliveryApi.accessToken;
        _qs                         = '';
        _template                   = getInquestTemplate();
        _pagingservices             = pagingservices;

        _pagingservices.init("top-placeholder", "bottom-placeholder", "top-template", "bottom-template");
        _pagingservices.title('Number of inquests found');
        _pagesize =_pagingservices.pagesize(5);


        hideErrorMessage();
        showLoader();

        bindSearchEvents();
        getInquests(1, true);
        filterby("");

        $("#autocomplete").autocomplete({
            delay: 100,
            minLength:3,
            source: function (request, response) {

                if (_selectedFilter !== 'date') {
                    getSearch(request.term, function (isOk, data) {
                        _selectedItems = new Array();
                        response($.map(data.items, function (el) {
                            _selectedItems.push(el);
                            return {
                                label: el.nameOfTheDeceased,
                                value: el.age
                            };
                        }));

                    });
                }
            },
            select: function (event, ui) {
                
                console.log(ui);
                console.log(_selectedItems);
                showLoader();

                var _items = _.filter(_selectedItems, function (item) { return item.nameOfTheDeceased === ui.item.label });
                resetTemplates();
                _currentPage = 1;
                populateTemplate(_currentPage, { items: _items, toatalCount: _items.length });
                $("." + _topPaginationPlaceHolder).hide();
                hideLoader();
            
                return false;
            }
        }).data("ui-autocomplete")._renderItem = function (ul, item) {

            hideErrorMessage();
            var age = (item.value > 0) ? ",Age " + item.value : "";
            return $("<li></li>")
                .data("ui-autocomplete-item", item).append("<a>" + item.label + " " + (age) + "</a>").appendTo(ul);                             
        };

        try { $('.inquest-container select').selectBox(); } catch (e) { }

        $(".inquest-container select").change(function () {
            filterby($('.inquest-container select').val());
        });
    };

})(window.inquestservices = window.inquestservices || {}, jQuery);