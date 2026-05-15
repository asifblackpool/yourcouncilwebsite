"use strict";
(function (healthychoicesservices, $, undefined) {

    var _mapservices = null;
    var _zengenti = null;
    var _timeout = 100;
    var _template = null;
    var _templateId = 'healthy-choices-template';
    var _contentPlaceHolder = "content-placeholder";
    var _topPaginationPlaceHolder = 'top-placeholder';
    var _templatePagination = '';
    var _selectedItems = new Array();
    var _rootUrl = '';
    var _projectId = '';
    var _contentTypeId = '';
    var _accessToken = '';
    var _searchTerm = '';
    var _qs = '';
    var _selectedFilter = "";
    var _filterData = null;
    var _loadPaging = false;
    var _pagingservices = null;
    var _pagesize = null;
    var _currentPage = 1;
    var _mapdata = { text: '', lat: '', long: '' };

    

    var errors = {
        emptyError: 'You have not entered a filter term.',
        dateError: 'Date error: you must enter the date in the following format eg 27/12/2016'
    };

    var formatDateTerm = function (term) {
        var dt = term.split('/');
        return dt[2] + "-" + dt[1] + "-" + dt[0];
    };

    var buildSearchUrl = function () {
        var deliveryApi = window.commonservices.Config().deliveryApi;
        var t = deliveryApi.templateUrls.entriesSearch;
        t = t.replace('{0}', _projectId);

        return _rootUrl + t + '?linkdepth=1';

    };

    var showLoader = function () {
        $("#loading-indicator").show();
    };

    var hideLoader = function () {
        $("#loading-indicator").hide();
    };

    var viewMap = function (Id, lat, lng) {

        var populateGoogleMap = function (id, lat, lng) {
            _mapservices.init('map-' + id, 16, 300, lat, lng); // create map    
            _mapdata.text = '';
            _mapdata.lat = lat;
            _mapdata.long = lng

            //add marker with a callback function 
            _mapservices.addMarker(_mapdata, function (isOk, gmap, infow) { });
        };

        var clearGoogleMap = function () {
            _mapservices.clearMap('map');
        };

        populateGoogleMap(Id, lat, lng);
    };

    var populateTemplate = function (currentpage, data) {
        var template = null;
        var count = (data !== null) ? data.totalCount : 0;
        var data = (data !== null) ? data.items : [];

        var map_coords = new Array();

        for (var i = 0; i < data.length; i++) {
            data[i].address = data[i].street;
            data[i].address = data[i].address + ' ' + data[i].town;
            data[i].address = data[i].address + '<br/>&nbsp;' + data[i].postcode;

            map_coords.push({
                id: data[i].sys.id,
                lat: data[i].location.lat,
                lon: data[i].location.lon
            });

            data[i].link = (data[i].webside !== null) ? "<a href='{0}'>{1}</a>" : "";

            if (data[i].webside !== null) {
                data[i].link = data[i].link.replace('{0}', data[i].webside);
                data[i].websiteText = (data[i].websiteText === null) ? data[i].entryTitle : data[i].websiteText;
                data[i].link = data[i].link.replace('{1}', data[i].websiteText);
            }


            try {
                var awardType = data[i].awardType
                if (awardType[0] === 'Healthier Choices') {
                    data[i].imageUrl = '/SiteElements/ChannelShift/Content/Images/healthy-choices/Healthier-Choices-Award-Sticker.png';
                }
                else {
                    data[i].imageUrl = '/SiteElements/ChannelShift/Content/Images/healthy-choices/junior-healthier-choices-logo.png';
                }
            } catch (e) {
                data[i].imageUrl = '/SiteElements/ChannelShift/Content/Images/placeholders/600x380.png';
            }
            data[i].imageCaption = '';
            if (data[i].image !== null) {
                try {
                    data[i].imageUrl = data[i].image.asset.sys.uri;
                    data[i].imageCaption = data[i].image.asset.altText;
                } catch (e) { }
            }

            var type = data[i].type;
            if (type != null && type.length > 0) {
                for (var j = 0; j < type.length; j++) {
                    if (j == 0) {
                        data[i].typename = type[j];
                    } else {
                        data[i].typename = data[i].typename + " " + type[j];
                    }
                }
            }
        }

        $('.' + _topPaginationPlaceHolder).show();
        $("." + _contentPlaceHolder).html(_template({ apidata: data }));

        //populate goolemaps 
        $.each(map_coords, function (index, item) {
            viewMap(item.id, item.lat, item.lon);
        });

        if (_loadPaging) {
            _pagingservices.reset();
            _pagingservices.create(currentpage, count, getdata);
        }

        hideLoader();
    };

    var getTemplate = function () {
        return commonservices.returnHandlebarTemplate(Handlebars, _templateId);
    };

    var getPaginationTemplate = function () {
        return commonservices.returnHandlebarTemplate(Handlebars, _pagingationTemplateId);
    };

    var getBottomPaginationTemplate = function () {
        return commonservices.returnHandlebarTemplate(Handlebars, _paginationBottomTemplateId);
    };

    var getdata = function (currentpage, loadpaging) {

        var timeout = null;
        var deliveryApi = window.commonservices.Config().deliveryApi;
        var inquestApiUrl = deliveryApi.templateUrls.contenttype + "?pageSize={2}&pageIndex={3}&order=";
        inquestApiUrl = inquestApiUrl.replace('{0}', _projectId);
        inquestApiUrl = inquestApiUrl.replace('{1}', 'healthyChoiceAwards');
        inquestApiUrl = inquestApiUrl.replace('{2}', _pagingservices.pagesize(5));
        inquestApiUrl = inquestApiUrl.replace('{3}', currentpage - 1); //page 1 => index is 0
        inquestApiUrl = _rootUrl + inquestApiUrl;
        _loadPaging = loadpaging;

        resetTemplates();

        

        /* use this in the live cms environment */
        function ajaxCallPost() {

            filterDropdowns();

            var nullChecker = function (val) {
                try {
                    return (typeof val === "undefined") ? "" : ((val === null) ? "" : val);
                }
                catch (e) {
                    return "";
                }
      
            }

            var selectedAwardType = nullChecker($('#AwardTypeDropDown').val());
            var selectedPropertyType = nullChecker($('#FilterTypeDropDown').val());
            var data = _filterData;
            var ddlPopulated = false;

            if (selectedAwardType !== '' && selectedPropertyType !== '')
            {
                data.where[0].contains = selectedAwardType
                data.where[1].contains = selectedPropertyType[1];
                ddlPopulated = true;
            }
            if (selectedAwardType !=='' && !ddlPopulated) {
                data.where[0].contains = selectedAwardType;
                ddlPopulated = true;
            }

            if (selectedPropertyType !== '' && !ddlPopulated) {
                data.where[0].contains = selectedPropertyType
            }

            data.pageIndex = (currentpage !== null) ? currentpage - 1 : 0;
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

        if (timeout) { clearTimeout(timeout); }
        _currentPage = currentpage;
        timeout = setTimeout(ajaxCallPost, _timeout);
    };

    var getSearch = function (term, callback) {
        var selectedItem = null;
        var data = _filterData;
        if (term !== null && term.indexOf("[*]") > -1) {
            var arrayTerms = term.split("[*]")
            data.where[0].contains = arrayTerms[0];
            data.where[1].contains = arrayTerms[1];
        }
        else {
            _searchTerm = term;
            data.where[0].contains = _searchTerm;
        }

        $.ajax({
            url: buildSearchUrl(),
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

    var bindSearchEvents = function () {

        $("#autocomplete").attr("placeholder", "Search by Business name");

        $("#ct-search-button").on("click", function () {
            _loadPaging = true;

            _filterData = {
                "where": [{ "field": "businessName", "contains": "" },
                { "field": "sys.contentTypeId", "equalTo": "healthyChoiceAwards" },
                { "field": "sys.versionStatus", "contains": "published" }], "pageSize": _pagingservices.pagesize,
                "orderBy": [{ "asc": "businessName" }]
            };

            var term = $('#autocomplete').val();

            if (term.length < 1) {
                showErrorMessage(errors.emptyError);
                return;
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
            getdata(1, _loadPaging);
            $("#FilterDropDownList").val("").change();
            $("#AwardTypeDropDown").val("").change();


        });

        $("#FilterDropDownList").on("change", function () {
            _loadPaging = true;
            var term = $(this).val() + '[*]' + $('#AwardTypeDropDown').val();

            showLoader();
            resetTemplates();
            _pagingservices.reset();
            filterDropdowns();
            getSearch(term, function (isOk, data) {
                populateTemplate(1, data)
            });
        });

        $("#AwardTypeDropDown").on("change", function () {
            _loadPaging = true;
            var term = $(this).val() + '[*]' + $('#FilterDropDownList').val();
            var term = $(this).val();
            showLoader();
            resetTemplates();
            _pagingservices.reset();
            filterDropdowns();
            getSearch(term, function (isOk, data) {
                populateTemplate(1, data)
            });
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

    var filterby = function (typeValue) {

        var mypagesize = _pagesize;

        _filterData = {
            "where": [{ "field": "businessName", "contains": "" },
            { "field": "sys.contentTypeId", "equalTo": "healthyChoiceAwards" },
            { "field": "sys.versionStatus", "contains": "published" }],
            "pageSize": _pagesize,
            "pageIndex": _currentPage - 1,
            "orderBy": [{ "asc": "businessName" }]
        };
        $("#autocomplete").attr("placeholder", "Search by business name");
        hideErrorMessage();
    };

    var filterDropdowns = function () {
        var selectedType = $('#FilterDropDownList').val();
        var selectedAwardsType = $('#AwardTypeDropDown').val();

        if (selectedType !== '') {
            _filterData = {
                "where": [{ "field": "type", "contains": "" },
                { "field": "sys.contentTypeId", "equalTo": "healthyChoiceAwards" },
                { "field": "sys.versionStatus", "contains": "published" }],
                "pageSize": _pagesize,
                "pageIndex": _currentPage - 1,
                "orderBy": [{ "asc": "businessName" }]
            };
        }

        if (selectedAwardsType !== '') {
            _filterData = {
                "where": [{ "field": "awardType", "contains": "" },
                { "field": "sys.contentTypeId", "equalTo": "healthyChoiceAwards" },
                { "field": "sys.versionStatus", "contains": "published" }],
                "pageSize": _pagesize,
                "pageIndex": _currentPage - 1,
                "orderBy": [{ "asc": "businessName" }]
            };
        }

        if (selectedType !== '' && selectedAwardsType !== '') {
            _filterData = {
                "where": [{ "field": "type", "contains": "" },
                { "field": "awardType", "contains": "" },
                { "field": "sys.contentTypeId", "equalTo": "healthyChoiceAwards" },
                { "field": "sys.versionStatus", "contains": "published" }],
                "pageSize": _pagesize,
                "pageIndex": _currentPage - 1,
                "orderBy": [{ "asc": "businessName" }]
            };
        }
        $("#autocomplete").attr("placeholder", "Search by name");
    };

    var populateTypeDropdown = function () {
        var deliveryApi = window.commonservices.Config().deliveryApi;
        var baseUrl = deliveryApi.rootUrl;
        var addressUrl = deliveryApi.templateUrls.contenttype;
        addressUrl = addressUrl.replace('{0}', _projectId);
        addressUrl = addressUrl.replace('{1}', _contentTypeId);
        var addressUrl = baseUrl + addressUrl;


        var createSelectOption = function (val, txt) {
            return "<option value='" + val + "'> " + txt + "</option>";
        };

        $.ajax({
            url: addressUrl,
            type: "GET",
            headers: { 'accesstoken': _accessToken, 'Content-Type': 'application/json' },
            success: function (result) {
                console.log(result);
                var fields = result.fields;
                var t = fields.filter(function (field) {
                    return (field.id == 'type');
                });
                if (t !== null && t.length > 0) {
                    var object = t[0];
                    var options = createSelectOption('', '-- Please Select a Type --');
                    var values = object.validations.allowedValues.values;
                    $.each(values, function (i, item) {
                        options = options + createSelectOption(item["en-GB"], item["en-GB"]);
                    });

                    document.getElementById("FilterDropDownList").innerHTML = options
                }
                console.log(t);
            },
            error: function (error) {

            }
        });

    };

    var populateAwardsTypeDropdown = function () {
        var deliveryApi = window.commonservices.Config().deliveryApi;
        var baseUrl = deliveryApi.rootUrl;
        var addressUrl = deliveryApi.templateUrls.contenttype;
        addressUrl = addressUrl.replace('{0}', _projectId);
        addressUrl = addressUrl.replace('{1}', _contentTypeId);
        var addressUrl = baseUrl + addressUrl;

        var createSelectOption = function (val, txt) {
            return "<option value='" + val + "'> " + txt + "</option>";
        };

        $.ajax({
            url: addressUrl,
            type: "GET",
            headers: { 'accesstoken': _accessToken, 'Content-Type': 'application/json' },
            success: function (result) {
                console.log(result);
                var fields = result.fields;
                var t = fields.filter(function (field) {
                    return (field.id == 'awardType');
                });
                if (t !== null && t.length > 0) {
                    var object = t[0];
                    var options = createSelectOption('', '-- Please Select Award Type --');
                    var values = object.validations.allowedValues.values;
                    $.each(values, function (i, item) {
                        options = options + createSelectOption(item["en-GB"], item["en-GB"]);
                    });
                    document.getElementById("AwardTypeDropDown").innerHTML = options
                }
                console.log(t);
            },
            error: function (error) {

            }
        });

    };

    healthychoicesservices.filterby = function (selectedfilter) {

        filterby(selectedfilter);
    };

    healthychoicesservices.init = function (zengentiapi, mapservices, pagingservices) {

        _zengenti = zengentiapi;
        _rootUrl = window.commonservices.Config().deliveryApi.rootUrl;
        _projectId = window.commonservices.Config().deliveryApi.projectId;
        _accessToken = window.commonservices.Config().deliveryApi.accessToken;
        _qs = '';
        _mapservices = mapservices;
        _template = getTemplate();
        _pagingservices = pagingservices;
        _contentTypeId = 'healthyChoiceAwards';

        _pagingservices.init("top-placeholder", "bottom-placeholder", "top-template", "bottom-template");
        _pagingservices.title('Number of Awards found');
        _pagesize = _pagingservices.pagesize(5);


        hideErrorMessage();
        showLoader();
        bindSearchEvents();
        getdata(1, true);
        filterby("");
        populateTypeDropdown();
        populateAwardsTypeDropdown();

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
                                label: el.businessName,
                                value: el.dateAwarded
                            };
                        }));

                    });
                }
            },
            select: function (event, ui) {

                console.log(ui);
                console.log(_selectedItems);
                showLoader();

                var _items = _.filter(_selectedItems, function (item) { return item.businessName === ui.item.label });
                resetTemplates();
                _currentPage = 1;
                populateTemplate(_currentPage, { items: _items, toatalCount: _items.length });
                $("." + _topPaginationPlaceHolder).hide();
                hideLoader();

                return false;
            }
        }).data("ui-autocomplete")._renderItem = function (ul, item) {

            hideErrorMessage();
            var dtAwarded = (item.value > 0) ? ", date awarded " + item.value : "";
            return $("<li></li>")
                .data("ui-autocomplete-item", item).append("<a>" + item.label + " " + (dtAwarded) + "</a>").appendTo(ul);
        };

        try { $('.container select').selectBox(); } catch (e) { }

        $(".container select").change(function () {
            filterby($('.container select').val());
        });
    };

})(window.healthychoicesservices = window.healthychoicesservices || {}, jQuery);