"use strict";
(function (communityeventservices, $, undefined) {

    var _imageUrl = 'https://www.blackpool.gov.uk/';
    var _zengenti = null;
    var _timeout = 100;
    var _template = null;
    var _templateId = 'community-events-template';
    var _detailTemplateId = 'community-events-detail-template';
    var _contentPlaceHolder = "content-placeholder";
    var _topPaginationPlaceHolder = 'top-placeholder';
    var _templatePagination = '';
    var _selectedItems = new Array();
    var _selectedVenueValue = null;
    var _rootUrl = '';
    var _projectId = '';
    var _accessToken = '';
    var _searchTerm = '';
    var _qs = '';
    var _selectedFilter = "";
    var _filterData = null;
    var _loadPaging = false;
    var _pagingservices = null;
    var _pagesize = null;
    var _currentPage = 1;
    var _templateModule = null;
    var _errorsModule = null;
    var _loadersModule = null;
    var _items = new Array();
    var _dataview = { defaultview: 1, searchview: 5 };
    var _runview = _dataview.defaultview;
    var _category = null;
    var _defaultImageUrl = null;

    var errors = {
        emptyError: 'You have not entered a filter term.',
        dateError: 'Date error: you must enter the date in the following format eg 27/12/2016'
    };

    var checkUndefined = function (property) {
        if (typeof property === 'undefined') {
            return null;
        }
        return property
    };

    var findById = function (source, id) {
        for (var i = 0; i < source.length; i++) {
            if (source[i].Id === parseInt(id)) {
                return source[i];
            }
        }
        return null;
    };

    var findContentById = function (source, id) {
        for (var i = 0; i < source.length; i++) {
            if (source[i].id === id) {
                return source[i];
            }
        }
        return null;
    };

    var formatDateTerm = function (term) {
        var dt = term.split('/');
        return dt[2] + "-" + dt[1] + "-" + dt[0];
    };

    var buildContentTypeFieldUrl = function (ct, pagesize, fields) {
        var deliveryApi = window.commonservices.Config().deliveryApi;
        var t = t = deliveryApi.templateUrls.contenttypeField;
        if (ct === 'AdultLearning') {
            t = deliveryApi.templateUrls.contenttype;
        }

        t = t.replace('{0}', _projectId);
        t = t.replace('{1}', ct);
        t = t.replace('{2}', "")

        return _rootUrl + t + "?pageSize=" + pagesize + "&fields=" + fields;
    };

    var buildSearchUrl = function () {
        var deliveryApi = window.commonservices.Config().deliveryApi;
        var t = deliveryApi.templateUrls.entriesSearch;
        t = t.replace('{0}', _projectId);

        return _rootUrl + t + "?linkdepth=1";
    };

    var loaders = function () {
        var showLoader = function () {
            $("#loading-indicator").show();
        };
        var hideLoader = function () {
            $("#loading-indicator").hide();
        };
        return {
            show: function () { return showLoader; },
            hide: function () { return hideLoader; }
        }
    };

    var errors = function () {

        var showErrorMessage = function (message) {

            $('.error-message').html(message);
            $('.error-message').attr('style', 'display:block');
        };

        var hideErrorMessage = function () {
            $('.error-message').hide();
        };

        return {
            show: function (message) { return showErrorMessage(message); },
            hide: function () { return hideErrorMessage(); }
        }
    };

    var templates = function () {

        var getTemplate = function (Id) {
            var t = commonservices.returnHandlebarTemplate(Handlebars, Id);
            return t;
        };

        var resetTemplates = function () {
            $("." + _contentPlaceHolder).html("");
        };

        return {
            template: function (Id) { return getTemplate(Id); },
            reset: function () { resetTemplates(); }
        }
    };

    //event binding methods
    var bindDetailTemplate = function (item) {
        var bindBackButton = function () {
            $('.back-to-search').on("click", function (e) {
                _pagingservices.show();
                $(".search-box").show();
                getCommunityEvents(_currentPage > 1 ? _currentPage : 1, true);
                window.location.hash = '';
            });
        };

        var bindCourseTypeLink = function () {
            $('.coursetype-link').on("click", function (e) {

                filterby('venue');
                var term = $('#hidden-venue').val();
                getSearch(term, function (isOk, data) {
                    populateTemplate(1, data);
                });
                window.location.hash = '';

                e.preventDefault();
            });
        };

        _loadersModule.show();
        populateDetailTemplate(item);
        bindBackButton();
        bindCourseTypeLink();
    };

    var bindSearch = function () {

        $("#generic-search-button").on("click", function () {
            _loadPaging = true;
            var term = $('#autocomplete').val();

            if (term.length < 1) {
                _errorsModule.show(errors.emptyError);
                return;
            }

            if (_selectedFilter === 'date') {
                var isvalid = utilities.validateDate(term);
                if (!isvalid) {
                    _errorsModule.show(errors.dateError);
                    return;
                }
            }

            _currentPage = 1;
            filterby(_selectedFilter);
            _loadersModule.show();
            _templateModule.reset();
            _pagingservices.reset();
            getSearch(term, function (isOk, data) {
                populateTemplate(1, data)
            });
        });

        $("#reset-search-button").on("click", function () {
            _loadPaging = true;
            _runview = _dataview.defaultview;
            $('#autocomplete').val('');
            _selectedVenueValue = "";
            _errorsModule.hide();
            _loadersModule.show();
            _templateModule.reset();
            _pagingservices.reset();
            $('.venue-picker').hide();
            $('.generic-search').show();
            getCommunityEvents(1, _loadPaging);
            $('#GenericFilterDropDownList').val('title').change();
        });

        //binddropdown
        $('#GenericFilterDropDownList').on("change", function () {

            var _selectedFilterValue = $(this).val();
            _selectedFilter = _selectedFilterValue;

            var createSelectBox = function () {
                try {
                    $("#xFilterDropDownList").selectpicker('refresh');
                } catch (e) { alert(e.message); }
            }

            var buildDropDownList = function (listtype) {

                var addOptions = function (listarray) {

                    var options = '<option value="-1" selected="selected">-- Please select --</option>';
                    for (var i = 0; i < listarray.length; i++) {
                        var value = listarray[i];
                        if (listtype === 'venue') {
                            var option = '<option value="' + value.sys.id + '">' + value.venue + '</option>';
                        }
                        if (listtype === 'course') {
                            var option = '<option value="' + value["en-GB"] + '">' + value["en-GB"] + '</option>';
                        }


                        options = options + option;
                    }

                    $('#xFilterDropDownList').empty();
                    $('#xFilterDropDownList').append(options);
                    createSelectBox();
                };

                var bindDropDown = function () {
                    $('#xFilterDropDownList').on("change", function () {
                        _selectedVenueValue = $(this).val();
                        if (_selectedVenueValue !== '') {
                            getSearchByDDLType(_selectedFilterValue, _selectedVenueValue, 1);
                        }
                        else {
                            resetTemplates();
                        }
                    });
                };

                var getVenues = function () {
                    $.ajax({
                        url: buildContentTypeFieldUrl('venue', 50, "sys.id,venue"),
                        type: "GET",
                        headers: { 'Content-Type': 'application/json' },
                        success: function (result) {
                            console.log(result);
                            if (result !== null) {
                                addOptions(result.items);
                                bindDropDown();
                            }
                        },
                        error: function (error) {
                            console.log("Something went wrong", error);
                        }
                    });
                };

                var getCourses = function () {
                    $.ajax({
                        url: buildContentTypeFieldUrl('AdultLearning', 0, ""),
                        type: "GET",
                        headers: { 'Content-Type': 'application/json' },
                        success: function (result) {

                            var fields = result.fields;
                            var items = findContentById(fields, 'courseType');

                            if (items.validations.allowedValues.values !== null) {
                                addOptions(items.validations.allowedValues.values);
                                bindDropDown();
                            }
                        },
                        error: function (error) {
                            console.log("Something went wrong", error);
                        }
                    });
                };

                if (listtype === 'venue') { getVenues(); }
                if (listtype === 'course') { getCourses(); }

            };

            ;

            if (_selectedFilterValue != 'title' || _selectedFilterValue != 'coursetype') {
                _runview = _dataview.searchview;
                if (_selectedFilterValue === 'venue') {
                    $('div.generic-search').hide();
                    $('.x-text').html('&nbsp;&nbsp;Venue:&nbsp;&nbsp;');
                    $('.x-picker').show();
                    buildDropDownList('venue');
                }
                else if (_selectedFilterValue === 'coursetype') {
                    $('div.generic-search').hide();
                    $('.x-text').html('&nbsp;&nbsp;Course:&nbsp;&nbsp;');
                    $('.x-picker').show();
                    buildDropDownList('course');
                }
                else {
                    $('.generic-search').show();
                    $('.x-text').html('');
                    $('.x-picker').hide();
                }

            }
            else {
                _runview = _dataview.defaultview;
                $('.generic-search').show();
                $('.x-picker').hide();
            }

            filterby(_selectedFilterValue);

        });
    };

    //populate methods
    var populateTemplate = function (currentpage, data) {
        var template = null;
        var count = (data !== null) ? data.totalCount : 0;
        var data = (data !== null) ? data.items : [];

        var bindDetailLink = function () {

            $('.detail-link').on("click", function (e) {
                var splitter = (this.id).split('_');
                var item = findById(_items, splitter[1]);
                bindDetailTemplate(item);

                window.location.hash = 'events/' + splitter[1];
                e.stopPropagation();
                e.preventDefault();
            });
        };

        var clearArray = function () {
            if (_items !== null) {
                for (var i = _items.length; i > 0; i--) {
                    _items.pop();
                }
            }
        };

        var loadApiData = function (data, index) {

            var getFirst = function (listarray) {
                for (var i = 0; i < listarray.length; i++) {
                    return listarray[i];
                }
                return "";
            };

            var formatTypes = function (listarray) {
                var count = 0;
                var types = '';
                for (var i = 0; i < listarray.length; i++) {
                    types = (count === 0) ? listarray[i] : types + ', ' + listarray[i];
                    count++;
                }
                return types;
            };

            var addPictures = function (index, images, coursetypes) {
                var count = 0;
                var defaultImageUrl = _defaultImageUrl;

               
                if (images !== null && images.length > 0) {
                    for (var i = 0; i < images.length; i++) {
                        if (images[i].asset !== null) {
                            _items[index].pictures.push({
                                url: images[i].asset.sys.uri,
                                alt: images[i].asset.altText
                            });
                            count++;
                        }
                    }
                    _items[index].picture = (images[0].asset !== null) ? images[0].asset.sys.uri : defaultImageUrl
                }
                else {
                    _items[index].picture = defaultImageUrl;
                    _items[index].pictures.push({ url: defaultImageUrl, alt: "no image" });
                    count = 1;
                }
                _items[index].picturesTotal = count;
            };

            _items.push({
                Id: index,
                title: data.courseTitle,
                description: data.descriptionOfCourse,
                venue: data.venue,
                coursecode: (data.courseCode == null) ? null : data.courseCode,
                coursetype: formatTypes(data.courseType),
                coursetypelink: getFirst(data.courseType),
                daytime: data.daysAndTime,
                startdate: data.startDate,
                enddate: data.endDate,
                daysandtime: data.daysAndTime,
                cost: {
                    blackpoolresidentcost: data.blackpoolResidentCost,
                    nonblackpoolresidentcost: data.nonBlackpoolResidentCost,
                    blackpoolresidentonbenefitscost: data.blackpoolResidentOnBenefitsCost
                },
                picture: '',
                pictures: new Array(),
                picturesTotal: 0,
                map: { lat: data.venue.locationMap.lat, long: data.venue.locationMap.lon },
            });

            addPictures(index, checkUndefined(data.image), data.courseType);
        };


        $('.' + _topPaginationPlaceHolder).show();
        clearArray();
        for (var i = 0, len = data.length; i < len; i++) {
            loadApiData(data[i], i);
        }

        $(".search-box").show();
        _template = _templateModule.template(_templateId);
        $("." + _contentPlaceHolder).html(_template({ apidata: _items, imageBaseUrl: _imageUrl }));
        if (_loadPaging) {
            _pagingservices.reset();
            _pagingservices.create(currentpage, count, runpagelink);
        }

        _loadersModule.hide();
        bindDetailLink();
    };

    var populateDetailTemplate = function (data) {
        var htmlTemplate = null;
        try {
            htmlTemplate = _templateModule.template(_detailTemplateId);
        }
        catch (e) {
            htmlTemplate = '';
        }

        $("." + _contentPlaceHolder).html(htmlTemplate({ apidata: data, imageBaseUrl: _imageUrl }));
        _loadersModule.hide();
        $(".search-box").hide();
        _pagingservices.hide();
    };

    //get methods 
    var getCommunityEvents = function (currentpage, loadpaging) {

        var timeout = null;
        var deliveryApi = window.commonservices.Config().deliveryApi;
        var ApiUrl = deliveryApi.templateUrls.contenttypes + "?pageSize={2}&pageIndex={3}&order=";
        ApiUrl = ApiUrl.replace('{0}', _projectId);
        ApiUrl = ApiUrl.replace('{1}', 'adultlearning');
        ApiUrl = ApiUrl.replace('{2}', _pagingservices.pagesize(5));
        ApiUrl = ApiUrl.replace('{3}', currentpage - 1); //page 1 => index is 0
        ApiUrl = _rootUrl + ApiUrl;
        _loadPaging = loadpaging;

        _templateModule.reset();

        /* use this in the live cms environment */
        function ajaxCallPost() {

            var dt = dateservices.DisplayDate(new Date(), 'dd/mm/yyyy');
            var data = null;


            if (_category == 'children') {
                data = {
                    "where": [{ "field": "endDate", "greaterThanOrEqualTo": "" },
                    {
                        "and": { "field": "category", "contains": "Children" }
                    },
                    { "field": "sys.contentTypeId", "equalTo": "adultlearning" },
                    { "field": "sys.versionStatus", "contains": "published" }],
                    "pageSize": _pagesize, "pageIndex": currentpage - 1,
                    "orderBy": [{ "asc": "startDate" }]
                };
            }
            else if (_category == 'library') {
                data = {
                    "where": [{ "field": "endDate", "greaterThanOrEqualTo": "" },
                    {
                        "not": { "field": "category", "contains": "Children" }
                    },
                    { "field": "sys.contentTypeId", "equalTo": "adultlearning" },
                    { "field": "sys.versionStatus", "contains": "published" }],
                    "pageSize": _pagesize, "pageIndex": currentpage - 1,
                    "orderBy": [{ "asc": "startDate" }]
                };
            }
            else
            {
                data = {
                    "where": [{ "field": "endDate", "greaterThanOrEqualTo": "" },
                    {
                        "and": { "field": "category", "contains": "Community" }
                    },
                    { "field": "sys.contentTypeId", "equalTo": "adultlearning" },
                    { "field": "sys.versionStatus", "contains": "published" }],
                    "pageSize": _pagesize, "pageIndex": currentpage - 1,
                    "orderBy": [{ "asc": "startDate" }]
                };
            }



            data.where[0].greaterThanOrEqualTo = formatDateTerm(dt) + "T00:00:00";
            var url = buildSearchUrl();
            $.ajax({
                url: url,
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

        if (timeout) { clearTimeout(timeout); }
        timeout = setTimeout(ajaxCallPost, _timeout);
    };

    var getSearch = function (term, callback) {

        var selectedItem = null;
        _searchTerm = term;
        var data = _filterData;

        if (_selectedFilter == 'date') {
            _searchTerm = formatDateTerm(_searchTerm);
            data.where[0].equalTo = _searchTerm;
        } else {
            data.where[0].contains = _searchTerm;
        }

        var url = buildSearchUrl();
        $.ajax({
            url: url,
            type: "POST",
            headers: { 'accesstoken': _accessToken, 'Content-Type': 'application/json' },
            data: JSON.stringify(data),
            success: function (result) {
                console.log(result);
                return callback(true, result);

            },
            error: function (error) {
                console.log("Something went wrong", error);
                return callback(false, new Array());
            }
        });
    };

    var getSearchByDDLType = function (filter, ddlType, pagenumber) {
        _currentPage = pagenumber;
        filterby(filter);
        _loadersModule.show();
        _templateModule.reset();
        _pagingservices.reset();
        getSearch(ddlType, function (isOk, result) {

            populateTemplate(pagenumber, result);
            _loadersModule.show();
        });
    };

    var filterby = function (selectedfilter) {

        _selectedFilter = selectedfilter;
        var dt = dateservices.DisplayDate(new Date(), 'dd/mm/yyyy');

        var childrenCenter = function (sf) {
            switch (sf) {
                case 'date':
                    _filterData = {
                        "where": [
                            { "field": "endDate", "greaterThanOrEqualTo": "" },
                            {
                                "and": { "field": "category", "contains": "Children" }
                            },
                            { "field": "sys.contentTypeId", "equalTo": "adultLearning" },
                            { "field": "sys.versionStatus", "contains": "published" }],
                        "pageSize": _pagesize,
                        "pageIndex": _currentPage - 1,
                        "orderBy": [{ "asc": "startDate" }]
                    };
                    $("#autocomplete").attr("placeholder", "Search by date");
                    _errorsModule.hide();
                    break;
                case 'coursetype':
                    _filterData = {
                        "where": [{ "field": "courseType", "contains": "" },
                        { "field": "endDate", "greaterThanOrEqualTo": "" },
                        {
                            "and": { "field": "category", "contains": "Children" }
                        },
                        { "field": "sys.contentTypeId", "equalTo": "adultLearning" },
                        { "field": "sys.versionStatus", "contains": "published" }],
                        "pageSize": _pagesize,
                        "pageIndex": _currentPage - 1,
                        "orderBy": [{ "asc": "startDate" }]
                    };
                    $("#autocomplete").attr("placeholder", "Search by course type");

                    break;
                case 'venue':
                    _filterData = {
                        "where": [{ "field": "venue.sys.id", "contains": "" },
                        { "field": "endDate", "greaterThanOrEqualTo": "" },
                        {
                            "and": { "field": "category", "contains": "Children" }
                        },
                        { "field": "sys.contentTypeId", "equalTo": "adultLearning" },
                        { "field": "sys.versionStatus", "contains": "published" }],
                        "pageSize": _pagesize,
                        "pageIndex": _currentPage - 1,
                        "orderBy": [{ "asc": "startDate" }]
                    };
                    $("#autocomplete").attr("placeholder", "Search by venue");
                    break;
                default:
                    _filterData = {
                        "where": [{ "field": "courseTitle", "contains": "" },
                        { "field": "endDate", "greaterThanOrEqualTo": "" },
                        {
                            "and": { "field": "category", "contains": "Children" }
                        },
                        { "field": "sys.contentTypeId", "equalTo": "adultLearning" },
                        { "field": "sys.versionStatus", "contains": "published" }],
                        "pageSize": _pagesize,
                        "pageIndex": _currentPage - 1,
                        "orderBy": [{ "asc": "startDate" }]
                    };
                    $("#autocomplete").attr("placeholder", "Search by title");
                    _errorsModule.hide();
                    break;
            }
        };

        var courseEvents = function (sf) {
            switch (sf) {
                case 'date':
                    _filterData = {
                        "where": [
                            { "field": "endDate", "greaterThanOrEqualTo": "" },
                            {
                                "and": { "field": "category", "contains": "Community" }
                            },
                            { "field": "sys.contentTypeId", "equalTo": "adultLearning" },
                            { "field": "sys.versionStatus", "contains": "published" }],
                        "pageSize": _pagesize,
                        "pageIndex": _currentPage - 1,
                        "orderBy": [{ "asc": "startDate" }]
                    };
                    $("#autocomplete").attr("placeholder", "Search by date");
                    _errorsModule.hide();
                    break;
                case 'coursetype':
                    _filterData = {
                        "where": [{ "field": "courseType", "contains": "" },
                        { "field": "endDate", "greaterThanOrEqualTo": "" },
                        {
                            "and": { "field": "category", "contains": "Community " }
                        },
                        { "field": "sys.contentTypeId", "equalTo": "adultLearning" },
                        { "field": "sys.versionStatus", "contains": "published" }],
                        "pageSize": _pagesize,
                        "pageIndex": _currentPage - 1,
                        "orderBy": [{ "asc": "startDate" }]
                    };
                    $("#autocomplete").attr("placeholder", "Search by course type");

                    break;
                case 'venue':
                    _filterData = {
                        "where": [{ "field": "venue.sys.id", "contains": "" },
                        { "field": "endDate", "greaterThanOrEqualTo": "" },
                        {
                            "and": { "field": "category", "contains": "Community " }
                        },
                        { "field": "sys.contentTypeId", "equalTo": "adultLearning" },
                        { "field": "sys.versionStatus", "contains": "published" }],
                        "pageSize": _pagesize,
                        "pageIndex": _currentPage - 1,
                        "orderBy": [{ "asc": "startDate" }]
                    };
                    $("#autocomplete").attr("placeholder", "Search by venue");
                    break;
                default:
                    _filterData = {
                        "where": [{ "field": "courseTitle", "contains": "" },
                        { "field": "endDate", "greaterThanOrEqualTo": "" },
                        {
                            "and": { "field": "category", "contains": "Community " }
                        },
                        { "field": "sys.contentTypeId", "equalTo": "adultLearning" },
                        { "field": "sys.versionStatus", "contains": "published" }],
                        "pageSize": _pagesize,
                        "pageIndex": _currentPage - 1,
                        "orderBy": [{ "asc": "startDate" }]
                    };
                    $("#autocomplete").attr("placeholder", "Search by title");
                    _errorsModule.hide();
                    break;
            }
        };

        var libraryEvents = function (sf) {
            switch (sf) {
                case 'date':
                    _filterData = {
                        "where": [
                            { "field": "endDate", "greaterThanOrEqualTo": "" },
                            {
                                "not": { "field": "category", "contains": "Children" }
                            },
                            { "field": "sys.contentTypeId", "equalTo": "adultLearning" },
                            { "field": "sys.versionStatus", "contains": "published" }],
                        "pageSize": _pagesize,
                        "pageIndex": _currentPage - 1,
                        "orderBy": [{ "asc": "startDate" }]
                    };
                    $("#autocomplete").attr("placeholder", "Search by date");
                    _errorsModule.hide();
                    break;
                case 'coursetype':
                    _filterData = {
                        "where": [{ "field": "courseType", "contains": "" },
                        { "field": "endDate", "greaterThanOrEqualTo": "" },
                        {
                            "not": { "field": "category", "contains": "Children" }
                        },
                        { "field": "sys.contentTypeId", "equalTo": "adultLearning" },
                        { "field": "sys.versionStatus", "contains": "published" }],
                        "pageSize": _pagesize,
                        "pageIndex": _currentPage - 1,
                        "orderBy": [{ "asc": "startDate" }]
                    };
                    $("#autocomplete").attr("placeholder", "Search by course type");

                    break;
                case 'venue':
                    _filterData = {
                        "where": [{ "field": "venue.sys.id", "contains": "" },
                        { "field": "endDate", "greaterThanOrEqualTo": "" },
                        {
                            "not": { "field": "category", "contains": "Children" }
                        },
                        { "field": "sys.contentTypeId", "equalTo": "adultLearning" },
                        { "field": "sys.versionStatus", "contains": "published" }],
                        "pageSize": _pagesize,
                        "pageIndex": _currentPage - 1,
                        "orderBy": [{ "asc": "startDate" }]
                    };
                    $("#autocomplete").attr("placeholder", "Search by venue");
                    break;
                default:
                    _filterData = {
                        "where": [{ "field": "courseTitle", "contains": "" },
                        { "field": "endDate", "greaterThanOrEqualTo": "" },
                        {
                            "not": { "field": "category", "contains": "Children" }
                        },
                        { "field": "sys.contentTypeId", "equalTo": "adultLearning" },
                        { "field": "sys.versionStatus", "contains": "published" }],
                        "pageSize": _pagesize,
                        "pageIndex": _currentPage - 1,
                        "orderBy": [{ "asc": "startDate" }]
                    };
                    $("#autocomplete").attr("placeholder", "Search by title");
                    _errorsModule.hide();
                    break;
            }
        };

        switch (_category) {

            case 'children':
                childrenCenter(_selectedFilter);
                break;
            case 'community':
                courseEvents(_selectedFilter);
                break;
            default:
                libraryEvents(_selectedFilter);
        }

        _filterData.where[1].greaterThanOrEqualTo = formatDateTerm(dt) + "T00:00:00";
    };

    var runpagelink = function (page, loadpage) {

        if (_runview === _dataview.defaultview) {
            getCommunityEvents(page, loadpage);
        } else {
            getSearchByDDLType(_selectedFilter, _selectedVenueValue, page);
        }
    };

    communityeventservices.filterby = function (selectedfilter) {
        $("autocomplete").val('');
        filterby(selectedfilter);
    };

    communityeventservices.init = function (zengentiapi, pagingservices, ct) {

        _rootUrl = window.commonservices.Config().deliveryApi.rootUrl;
        _zengenti = zengentiapi;
        _projectId = window.commonservices.Config().deliveryApi.projectId;
        _accessToken = window.commonservices.Config().deliveryApi.accessToken;
        _qs = '';
        _templateModule = new templates();
        _errorsModule = new errors();
        _loadersModule = new loaders();
        _pagingservices = pagingservices;

        _pagingservices.init("top-placeholder", "bottom-placeholder", "top-template", "bottom-template");

        _pagesize = _pagingservices.pagesize(5);

       
        _pagingservices.title(ct.title);
        _category = ct.category;
        _defaultImageUrl = ct.defaultImageUrl;
        $(".adult-learning-h1").html(ct.headerOneTag)
        
 

        _errorsModule.hide();
        _loadersModule.show();
        $('.x-picker').hide();
        bindSearch();
        getCommunityEvents(1, true);
        filterby("");

        $("#autocomplete").autocomplete({
            delay: 100,
            minLength: 3,
            source: function (request, response) {

                if (_selectedFilter !== 'date') {
                    getSearch(request.term, function (isOk, data) {
                        _selectedItems = new Array();
                        response($.map(data.items, function (el) {
                            _selectedItems.push(el);
                            return {
                                label: el.courseTitle,
                                value: el.courseTitle
                            };
                        }));

                    });
                }
            },
            select: function (event, ui) {

                console.log(ui);
                console.log(_selectedItems);
                _loadersModule.show();

                var _items = _.filter(_selectedItems, function (item) { return item.courseTitle === ui.item.label });
                _templateModule.reset();
                _currentPage = 1;
                populateTemplate(_currentPage, { items: _items, toatalCount: _items.length });
                $("." + _topPaginationPlaceHolder).hide();
                _loadersModule.hide();

                return false;
            }
        }).data("ui-autocomplete")._renderItem = function (ul, item) {

            _errorsModule.hide();

            return $("<li></li>")
                .data("ui-autocomplete-item", item).append("<a>" + item.label + "</a>").appendTo(ul);
        };

        try { $('.content-container select').selectBox(); } catch (e) { }

        $(".content-container select").change(function () {
            _selectedFilter = $('#GenericFilterDropDownList').val();
            filterby(_selectedFilter);
        });
    };


})(window.communityeventservices = window.communityeventservices || {}, jQuery);