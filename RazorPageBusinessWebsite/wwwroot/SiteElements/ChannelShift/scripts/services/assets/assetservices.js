"use strict";
(function (assetservices, $, undefined) {

    //var _imageUrl = '/SiteElements/ChannelShift/Content/Images/assets/';
    var _mapservices = null;

    var _imageUrl = 'https://www.blackpool.gov.uk/';
    var _zengenti = null;
    var _timeout = 100;
    var _template = null;
    var _contentPlaceHolder = "assets-placeholder";
    var _templateBottomPagination = null;
    var _templateId = 'assets-listing-template';
    var _templateItemId = 'asset-detail-template';
    var _selectedItems = new Array();
    var _rootUrl = '';
    var _projectId = '';
    var _accessToken = '';
    var _searchTerm = '';
    var _qs = '';
    var _selectedFilter = "";
    var _selectedPropertyType = '';
    var _filterData = null;
    var _items = new Array();
    var _loadPaging = false;
    var _dataview = { defaultview: 1, searchview: 5 };
    var _runview = _dataview.defaultview;
    var _pagingservices = null;
    var _pagesize = null;
    var _currentPage = 1;

    var _mapdata = { text: '', lat: '', long: '' };

    var errors = {
        emptyError: 'You have not entered a filter term.',
        dateError: 'Date error: you must enter the date in the following format eg 27/12/2016',
        postcodeError: 'Post code error: You must enter the postcode in the following format FY1 1DS'
    };

    var scrollTo = function (Id, isclass) {
        var t = (isclass) ? '.' : '#';

        $('html,body').animate({
            scrollTop: $(t + Id).offset().top - (100)
        }, 'slow');
    };

    var formatDateTerm = function (term) {
        var dt = term.split('/');
        return dt[2] + "-" + dt[1] + "-" + dt[0];
    };

    var buildSearchUrl = function () {
        var deliveryApi = window.commonservices.Config().deliveryApi;
        var t = deliveryApi.templateUrls.entriesSearch;
        t = t.replace('{0}', _projectId);

        return _rootUrl + t + "?linkDepth=2"
    };

    var buildContentTypeFieldUrl = function (ct, Id) {
        var deliveryApi = window.commonservices.Config().deliveryApi;
        var t = deliveryApi.templateUrls.contenttypeField;
        t = t.replace('{0}', _projectId);
        t = t.replace('{1}', ct);
        t = t.replace('{2}', Id);

        return _rootUrl + t;
    };

    var showLoader = function () {
        $("#assets-loading-indicator").show();
    };

    var hideLoader = function () {
        $("#assets-loading-indicator").hide();
    };

    var populateTemplate = function (currentpage, data) {
        var template = null;
        var count = (data !== null) ? data.totalCount : 0;
        var data = (data !== null) ? data.items : [];
        _template = getAssetsTemplate();

        $("." + _contentPlaceHolder).html(_template({ apiAssets: data, imageBaseUrl: _imageUrl }));
        if (_loadPaging) {
            _pagingservices.reset();
            _pagingservices.create(currentpage, count, runpagelink);
        }

        $(".asset-intro").show();
        hideLoader();
        hidemapLink(false);
        scrollTo('search-box', true);
    };

    var populateDetailTemplate = function (data) {
        var htmlTemplate = getAssetTemplate();

        $("." + _contentPlaceHolder).html(htmlTemplate({ apidata: data, imageBaseUrl: _imageUrl }));
        hideLoader();
        $(".asset-intro").hide();
        $(".search-box").hide();
        _pagingservices.hide();
        hidemapLink(true);

    };

    var getAssetsTemplate = function () {
        return commonservices.returnHandlebarTemplate(Handlebars, _templateId);
    };

    var getAssetTemplate = function () {
        return commonservices.returnHandlebarTemplate(Handlebars, _templateItemId);
    };

    var detailBindings = function (item) {
        var bindBackButton = function () {
            $('.back-to-search').on("click", function (e) {
                _pagingservices.show();
                $(".search-box").show();
                getAssets(_currentPage > 1 ? _currentPage : 1, true);
                window.location.hash = '';
            });
        };

        showLoader();
        populateDetailTemplate(item);
        bindBackButton();
    };

    var formatAddress = function (address, addname) {
        var addrss = ''
        var spacer = ' ';
        addrss = (address.name != '' && addname === true) ? address.name + spacer : '';
        addrss = (address.street != '') ? addrss + address.street + spacer : '';
        addrss = (address.town != '') ? addrss + address.town + spacer : '';
        addrss = (address.postcode != '') ? addrss + address.postcode : ''
        return addrss;
    };

    var findById = function (source, id) {
        for (var i = 0; i < source.length; i++) {
            if (source[i].Id === parseInt(id)) {
                return source[i];
            }
        }
        return null;
    };

    var viewhideMap = function () {

        var populateGoogleMap = function () {
            _mapservices.init('map', 12, 700, 53.815883400, -3.035); // create map

            if (_items !== null) {
                for (var i = 0; i < _items.length; i++) {
                    //add map marking using mapservices
                    var txt = '<p>' + _items[i].title + '</p> .. <a id="map_{0}" class="detail-link" href="#" >click here for More information. </a>';

                    _mapdata.text = txt.replace('{0}', i);
                    _mapdata.lat = _items[i].map.lat;
                    _mapdata.long = _items[i].map.long;

                    //add marker with a callback function 
                    _mapservices.addMarker(_mapdata, function (isOk, gmap, infow) {

                        if (isOk) {
                            gmap.maps.event.addListener(infow, 'domready', function () {
                                $(document).on('click', '.detail-link', function (e) {
                                    var splitter = (this.id).split('_');
                                    var item = findById(_items, splitter[1]);
                                    detailBindings(item);
                                    window.location.hash = 'property/' + splitter[1];
                                    e.stopPropagation();
                                    e.preventDefault();
                                });
                            });
                        }
                    });
                }
            }
        };

        var clearGoogleMap = function () {
            _mapservices.clearMap('map');
        };

        $("#map-viewer").click(function (e) {
            var txt = $(this).text().toLowerCase();
            $(".assets-map-placeholder").slideToggle();
            if (txt === 'view results on a map') {
                populateGoogleMap();
                var txt = $(this).text('Hide Map');
            }
            else {
                clearGoogleMap();
                var txt = $(this).text('View results on a map');
            }
            e.preventDefault();
        });
    };

    var hidemapLink = function (hide) {
        if (hide) {
            $("#map-viewer").hide();
        } else {
            $("#map-viewer").show();
        }
        $(".assets-map-placeholder").hide();
    }

    var dataLoader = function (currentpage, data) {

        var loadTestData = function () {
            var items = new Array();


            var text = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Qui dicta minus molestiae vel beatae natus eveniet ratione temporibus aperiam harum alias officiis assumenda officia quibusdam deleniti eos cupiditate dolore doloribus!';

            items.push({
                Id: '1',
                title: 'Semi-detached house',
                fulladdress: '',
                addresswithoutName: '',
                address: { name: '', street: 'East Pines Drive', town: 'Thornton-Cleveleys', postcode: ' FY5 2UH' },
                size: '2,000 sq ft (350 sq m)',
                type: 'Residential',
                uses: 'living accommodation',
                leaseTerms: 'Leasehold',
                cost: '£ 625 (pcm)',
                picture: 'house-1-main.jpg',
                pictures: new Array(),
                picturesTotal: 6,
                map: { lat: '', long: '' },
                brochure: '',
                features: '3 bedroom house' + text,
                description: 'Spacious three bedroom semi detached property - Available now - Hallway - Lounge - dining room - modern fitted kitchen ...'
            });
            items.push({
                Id: '2',
                title: 'Bungalow',
                fulladdress: '',
                addresswithoutName: '',
                address: { name: '', street: 'East Pines Drive', town: 'Thornton-Cleveleys', postcode: ' FY5 2UH' },
                size: '7,000 sq ft (650 sq m)',
                type: 'Residential',
                uses: 'living accommodation',
                leaseTerms: 'Leasehold',
                cost: '£ 595 (pcm)',
                picture: 'house2-main.jpg',
                pictures: new Array(),
                picturesTotal: 4,
                map: { lat: '', long: '' },
                brochure: '',
                features: '2 Bed semi detached bungalow for sale' + text,
                description: ' well presented semi detached dormer bungalow in A great location with no onward chain** Well Presented Semi Detached Bungalow consisting of Entrance Hallway, Lounge, Dining Kitchen, Two Double Bedrooms on the Ground Floor, 3 Piece Bathroom, Double ...'
            });

            items[0].pictures.push({ url: 'house-1-main.jpg', alt: '' });
            items[0].pictures.push({ url: 'house-1-livingroom.jpg', alt: '' });
            items[0].pictures.push({ url: 'house-1-secondroom.jpg', alt: '' });
            items[0].pictures.push({ url: 'house-1-kitchen.jpg', alt: '' });
            items[0].pictures.push({ url: 'house-1-bedroom.jpg', alt: '' });
            items[0].pictures.push({ url: 'house-1-bathroom.jpg', alt: '' });

            items[0].fulladdress = formatAddress(items[0].address);

            items[1].pictures.push({ url: 'house2-main.jpg', alt: '' });
            items[1].pictures.push({ url: 'house2-livingrooom.jpg', alt: '' });
            items[1].pictures.push({ url: 'house2-conservatory.jpg', alt: '' });
            items[1].pictures.push({ url: 'house2-bathroom.jpg', alt: '' });


            items[0].fulladdress = formatAddress(items[0].address, true);
            items[0].addresswithoutName = formatAddress(items[0].address, false);


            return { items: items, totalCount: 2 };


        };

        var loadApiData = function (data, index) {

            var formatTypes = function (listarray) {
                var count = 0;
                var types = '';
                for (var i = 0; i < listarray.length; i++) {
                    types = (count === 0) ? listarray[i] : types + ', ' + listarray[i];
                    count++;
                }
                return types;
            };

            var addPictures = function (index, images) {
                var count = 0;
                if (images != null) {

                    for (var i = 0; i < images.length; i++) {

                        if (images[i].asset !== null) {
                            _items[index].pictures.push({
                                url: images[i].asset.sys.uri,
                                alt: images[i].asset.altText
                            });
                            count++;
                        }

                    }
                }

                _items[index].picture = (images[0].asset !== null) ? images[0].asset.sys.uri : ''
                _items[index].picturesTotal = count;
            };

            _items.push({
                Id: index,
                title: data.entryTitle,
                fulladdress: '',
                address: { name: data.text, street: data.street, town: data.town, postcode: data.postcode },
                size: data.size,
                type: formatTypes(data.typeOfProperty),
                uses: data.uses,
                leaseTerms: data.leaseTerms,
                cost: data.cost,
                picture: '',
                pictures: new Array(),
                picturesTotal: 0,
                map: { lat: data.location.lat, long: data.location.lon },
                brochure: (data.brochure !== null) ? data.brochure.sys.uri : '',
                features: data.keyFeatures,
                description: data.description
            });

            _items[index].fulladdress = formatAddress(_items[index].address, true);
            _items[index].addresswithoutName = formatAddress(_items[index].address, false);
            addPictures(index, data.image);
        };

        var bindDetailClickFromListings = function () {
            $('.detail-link').on("click", function (e) {
                var splitter = (this.id).split('_');
                var item = findById(_items, splitter[1]);
                detailBindings(item);

                window.location.hash = 'property/' + splitter[1];
                e.stopPropagation();
                e.preventDefault();
            });
        };

        if (data !== null) {
            //populateTemplate(currentpage, loadTestData());

            _items.length = 0;
            for (var i = 0, len = data.items.length; i < len; i++) {
                loadApiData(data.items[i], i);
            }
            populateTemplate(currentpage, { items: _items, totalCount: data.totalCount });
            bindDetailClickFromListings();
        }
    };

    var getAssets = function (currentpage, loadpaging) {
        var timeout = null;
        _loadPaging = loadpaging;

        resetTemplates();
        function ajaxCall() {

            var query = _filterData = {
                "where": [{ "field": "sys.contentTypeId", "equalTo": "asset" },
                { "field": "sys.versionStatus", "contains": "published" },
                { "field": "active", "equalTo": true }
                ], "pageSize": _pagesize, "pageIndex": currentpage - 1,
                "orderBy": [{ "asc": "sys.version.published" }]
            };

            $.ajax({
                url: buildSearchUrl(),
                type: "POST",
                headers: { 'Content-Type': 'application/json' },
                data: JSON.stringify(query),
                success: function (result) {
                    _currentPage = currentpage;
                    dataLoader(currentpage, result);
                    hideLoader();
                },
                error: function (error) {
                    populateTemplate(0, null);
                    hideLoader();
                }
            });
        }

        showLoader();
        if (timeout) { clearTimeout(timeout); }
        timeout = setTimeout(ajaxCall, _timeout);
    };

    var getSearch = function (term, callback) {

        var selectedItem = null;
        _searchTerm = term;
        filterby(_selectedFilter);
        var data = _filterData;
        data.where[0].contains = _searchTerm;

        $.ajax({
            url: buildSearchUrl(),
            type: "POST",
            headers: { 'Content-Type': 'application/json' },
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

    var runpagelink = function (page, loadpage) {

        if (_runview === _dataview.defaultview) {
            getAssets(page, loadpage);
        } else {
            getSearchByPropertyType(_selectedPropertyType, page);
        }
    };

    var getSearchByPropertyType = function (property_type, pagenumber) {
        _currentPage = pagenumber;
        filterby('typeOf');
        showLoader();
        resetTemplates();
        _pagingservices.reset();
        getSearch(property_type, function (isOk, result) {
           
            dataLoader(pagenumber, result);
            hideLoader();
        });
    };

    var bindSearchEvents = function () {

        $("#generic-search-button").on("click", function () {
            _loadPaging = true;
            var term = $('#autocomplete').val();

            if (term.length < 1) {
                showErrorMessage(errors.emptyError);
                return;
            }

            if (_selectedFilter === 'postcode') {
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
                // alert('search data returned ' + data);
            });
        });

        $("#reset-search-button").on("click", function () {
            _loadPaging = true;
            _runview = _dataview.defaultview;
            $('#autocomplete').val('');
            hideErrorMessage();
            showLoader();
            resetTemplates();
            _pagingservices.reset();
            getAssets(1, _loadPaging);

        });

        //binddropdown
        $('#AssertsFilterDropDownList').on("change", function () {

            var property_types_list = null;

            var selectedvalue = $(this).val();

            var buildDropDownList = function () {

                var addOptions = function (listarray) {

                    var options = '<option value="-1" selected="selected">-- Please select --</option>';
                    for (var i = 0; i < listarray.length; i++) {
                        var value = listarray[i];
                        var option = '<option value="' + value["en-GB"] + '">' + value["en-GB"] + '</option>';
                        options = options + option;
                    }

                    $('.property-type-filter').show();
                    $('#PropertyTypesDropDownList').empty();
                    $('#PropertyTypesDropDownList').append(options);
                    createSelectBox();
                };

                var bindTypeOfPropertyDropDown = function () {
                    $('#PropertyTypesDropDownList').on("change", function () {
                        _selectedPropertyType = $(this).val();
                        if (_selectedPropertyType !== '') {
                            getSearchByPropertyType(_selectedPropertyType, 1);
                        }
                        else {
                            resetTemplates();
                        }
                    });
                };

                $.ajax({
                    url: buildContentTypeFieldUrl('asset', 'typeofproperty'),
                    type: "GET",
                    headers: { 'Content-Type': 'application/json' },
                    success: function (result) {
                        console.log(result);
                        if (result !== null) {
                            addOptions(result.validations.allowedValues.values);
                            bindTypeOfPropertyDropDown();
                        }
                    },
                    error: function (error) {
                        console.log("Something went wrong", error);
                    }
                });

            };

            if (selectedvalue === 'typeOf') {
                _runview = _dataview.searchview;
                $('div.generic-search .input-group').hide();
                buildDropDownList();
            }
            else {
                _runview = _dataview.defaultview;
                $('.generic-search .input-group').show();
                $('.property-type-filter').hide();
            }
        });
    };

    var resetTemplates = function () {
        $("." + _contentPlaceHolder).html("");
    };

    var filterby = function (selectedfilter) {

        _selectedFilter = selectedfilter;
        var content_type = 'asset';
        var order_by = 'postcode';

        console.log('current page is ' + _pagesize);

        switch (selectedfilter) {
            case 'leaseTerms':
                _filterData = {
                    "where": [{ "field": "leaseTerms", "contains": "" },
                    { "field": "sys.contentTypeId", "equalTo": content_type },
                    { "field": "sys.versionStatus", "contains": "published" },
                    { "field": "active", "equalTo": true }
                    ], "pageSize": _pagesize,
                    "orderBy": [{ "asc": order_by }]
                };
                $("#autocomplete").attr("placeholder", "Search by Lease terms")
                hideErrorMessage();
                break;
            case 'postcode':
                _filterData = {
                    "where": [{ "field": "postcode", "contains": "" },
                    { "field": "sys.contentTypeId", "equalTo": content_type },
                    { "field": "sys.versionStatus", "contains": "published" },
                    { "field": "active", "equalTo": true }
                    ], "pageSize": _pagesize,
                    "orderBy": [{ "asc": order_by }]
                };
                $("#autocomplete").attr("placeholder", "Search by postcode")
                hideErrorMessage();
                break;
            case 'typeOf':
                _filterData = {
                    "where": [{ "field": "typeOfProperty", "contains": "" },
                    { "field": "sys.contentTypeId", "equalTo": content_type },
                    { "field": "sys.versionStatus", "contains": "published" },
                    { "field": "active", "equalTo": true }
                    ], "pageSize": _pagesize, "pageIndex":  _currentPage  - 1,
                    "orderBy": [{ "asc": order_by }]
                };
                $("#autocomplete").attr("placeholder", "Search by Bar, Cafe,Land, Office, ...")
                break;
            default:
                _filterData = {
                    "where": [{ "field": "text", "contains": "" },
                    { "field": "sys.contentTypeId", "equalTo": content_type },
                    { "field": "sys.versionStatus", "contains": "published" },
                    { "field": "active", "equalTo": true }
                    ], "pageSize": _pagesize,
                    "orderBy": [{ "asc": order_by }]
                };
                $("#autocomplete").attr("placeholder", "Search by Title")
                hideErrorMessage();
                break;
        }
    };

    var showErrorMessage = function (message) {

        $('.error-message').html(message);
        $('.error-message').attr('style', 'display:block');
    };

    var hideErrorMessage = function () {
        $('.error-message').hide();
    };

    var createSelectBox = function () {
        try {
            $("#PropertyTypesDropDownList").selectpicker('refresh');
        } catch (e) { alert(e.message); }
    }

    assetservices.filterby = function (selectedfilter) {
        filterby(selectedfilter);
    };

    assetservices.init = function (zengentiapi, mapservices, pagingservices) {

        _zengenti = zengentiapi;
        _rootUrl = window.commonservices.Config().deliveryApi.rootUrl;
        _projectId = window.commonservices.Config().deliveryApi.projectId;
        _accessToken = window.commonservices.Config().deliveryApi.accessToken;
        _mapservices = mapservices;
        _pagingservices = pagingservices;

        _pagingservices.init("top-placeholder", "bottom-placeholder", "top-template", "bottom-template");
        _pagingservices.title('Number of properties found');
        _pagesize = _pagingservices.pagesize(5);


        hideErrorMessage();
        showLoader();
        viewhideMap();
        bindSearchEvents();
        getAssets(1, true);
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
                                label: el.text,
                                value: el.postcode
                            };
                        }));

                    });
                }
            },
            select: function (event, ui) {


                if (_items != null && _items.length > 0)
                    _items.splice(0, _items.length);

                console.log(ui);
                console.log(_selectedItems);
                showLoader();
                var selectedItems = _.filter(_selectedItems, function (item) { return item.text === ui.item.label });
                resetTemplates();
                _currentPage = 1;
                dataLoader(_currentPage, { items: selectedItems, totalCount: selectedItems.length });
             
                //$("." + _topPaginationPlaceHolder).html(_templatePagination({ apipages: new Array(), apiTotal: selectedItems.length }));
                hideLoader();

                return false;
            }
        }).data("ui-autocomplete")._renderItem = function (ul, item) {

            hideErrorMessage();
            var postcode = (item.value !== '') ? "  postcode " + item.value : "";
            return $("<li></li>")
                .data("ui-autocomplete-item", item).append("<a>" + item.label + " " + (postcode) + "</a>").appendTo(ul);
        };

        try { $('.assets-container select').selectBox(); } catch (e) { }

        $(".assets-container select").change(function () {
            filterby($('.assets-container select').val());
        });
    };

})(window.assetservices = window.assetservices || {}, jQuery);

