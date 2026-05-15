"use strict";
(function (newsstoryservices, $, undefined) {

    var _imageUrl = 'https://www.blackpool.gov.uk/';
    var _zengenti = null;
    var _timeout = 100;

    var _selectedItems = new Array();
    var _rootUrl = '';
    var _projectId = '';

    var _pagingservices = null;
    var _errorsModule = null;
    var _loadersModule = null;


    var bindSearch = function () {

        $("#generic-search-button").on("click", function () {

            console.log('search button click')
            /*
            getSearch(term, function (isOk, data) {
                populateTemplate(1, data)
            });
            */
        });

        $("#reset-search-button").on("click", function () {
            console.log('reset button click');
        });

        //binddropdown
        $('#GenericFilterDropDownList').on("change", function () {


        });
    };


    //get methods 
    var getNewsStories = function (currentpage, loadpaging) {

        var timeout = null;
        var deliveryApi = window.commonservices.Config().deliveryApi;
        var ApiUrl = deliveryApi.templateUrls.contenttypes + "?pageSize={2}&pageIndex={3}&order=";
        ApiUrl = ApiUrl.replace('{0}', _projectId);
        ApiUrl = ApiUrl.replace('{1}', 'adultlearning');
        ApiUrl = ApiUrl.replace('{2}', _pagingservices.pagesize(5));
        ApiUrl = ApiUrl.replace('{3}', currentpage - 1); //page 1 => index is 0
        ApiUrl = _rootUrl + ApiUrl;
        _loadPaging = loadpaging;

    };

    var getSearch = function (term, callback) {

        console.log('get search term ' + term);
    };

   

    newsstoryservices.filterby = function (selectedfilter) {
        console.log("news story filter by");
    };

    newsstoryservices.init = function (zengentiapi, pagingservices, ct) {

        _rootUrl = window.commonservices.Config().deliveryApi.rootUrl;
        _zengenti = zengentiapi;
        _projectId = window.commonservices.Config().deliveryApi.projectId;
        _accessToken = window.commonservices.Config().deliveryApi.accessToken;
        _qs = '';

        $('.x-picker').hide();
        bindSearch();


        getCommunityEvents(1, true);
        filterby("");

        $("#autocomplete").autocomplete({
            delay: 100,
            minLength: 3,
            source: function (request, response) {
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
            },
            select: function (event, ui) {

                console.log(ui);
                console.log(_selectedItems);
                return false;
            }
        }).data("ui-autocomplete")._renderItem = function (ul, item) {

            _errorsModule.hide();

            return $("<li></li>")
                .data("ui-autocomplete-item", item).append("<a>" + item.label + "</a>").appendTo(ul);
        };

        try { $('.content-container select').selectBox(); } catch (e) { }

  
    };


})(window.newsstoryservices = window.newsstoryservices || {}, jQuery);