"use strict";
(function (newbookscallbacks, $, undefined) {

    var _newbookslist = null;
    var _pickulocationcallbacks = null;
    var _catalogItemcallback = null;
    var _sharedcallback = null;
    var _commonlibraryservices = null;
    var _selectedIndex = null;
    var titleId = null;

    var buttonClick = { RESERVE: 0, ADD_MYLIST: 1 };
    var clickdata = { click: buttonClick, selectedclick: null, Ids: new Array() };

    function imageExists(url, callback) {
        var img = new Image();
        img.src = url;
        img.onload = function () {
            var w = img.width;
            var h = img.height;
            callback(true, w,h);
        };
        img.onerror = function () {
            callback(false, 0,0);
        };
      
    }

    var populateList = function () {
        var selectBook = function () {

            titleId = _newbookslist[_selectedIndex].titleIDField;
            cataloglibraryservices.selectedHotList(titleId, function (isOK, data) {
                if (isOK) {


                   

                    _commonlibraryservices.catalogTemplate().populateWhatsNew(_newbookslist, data);



                    bindButtonEvents();
                }

                _commonlibraryservices.hide();
            });
        };
        commonlibraryservices.show();
        commonlibraryservices.catalogTemplate().clearWhatsNew();
        setTimeout(function () { selectBook(); }, 300);
    };

    var bindButtonEvents = function () {

        var detailLinkClick = function () {
            $('a.hotlist-detail-link').on('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                _commonlibraryservices.show();
                var splitter = (this.id).split('-');
                cataloglibraryservices.catalogitem(parseInt(splitter[1]), function (isOk) {
                    if (isOk) {
                        _catalogItemcallback.searchView(_commonlibraryservices.searchView().SEARCH_DEFAULT);
                        _catalogItemcallback.itemClicks(isOk);
                    }
                });
            });
        };

        var reserveButtonClick = function () {

            $('.hotlist-reserve').on('click', function (e) {
                titleId = ((this.id).split('-'))[2];
                clickdata.Ids = new Array();
                clickdata.Ids.push(titleId);
                clickdata.selectedclick = clickdata.click.RESERVE;
                _commonlibraryservices.show();
                _sharedcallback.clickData(clickdata);
                _sharedcallback.searchView(_commonlibraryservices.searchView().SEARCH_DEFAULT);
                securitylibraryservices.authenticated(_sharedcallback.reserveCallback);
            });
        };

        var myListButtonClick = function () {
            $('.hotlist-mylist').on('click', function (e) {
                titleId = ((this.id).split('-'))[2];
                clickdata.Ids.push(titleId);
                 _commonlibraryservices.show();
                 _sharedcallback.clickData(clickdata);
                 _sharedcallback.searchView(_commonlibraryservices.searchView().SEARCH_DEFAULT);
                 securitylibraryservices.authenticated(_sharedcallback.mylistCallback);
            });
        };

        var imageClick = function () {
            $('a.hotlist-link').bind('click', function (e) {
                _selectedIndex = parseInt(((this.id).split('-'))[1]);
                populateList();
                e.preventDefault(); 
            });   
        };

        reserveButtonClick();
        myListButtonClick();
        detailLinkClick();
        imageClick();
    };

    newbookscallbacks.init = function (data, commonlibraryservices, catalogitemcallback, pickupcallback, sharedcallback) {

        _newbookslist = data;
        _sharedcallback             = sharedcallback;
        _pickulocationcallbacks     = pickupcallback;
        _catalogItemcallback        = catalogitemcallback;
        _commonlibraryservices      = commonlibraryservices;
        _sharedcallback.init(_commonlibraryservices, _pickulocationcallbacks);
        _catalogItemcallback.init(_commonlibraryservices, _pickulocationcallbacks, _sharedcallback,null);
        bindButtonEvents();
    };

    newbookscallbacks.replaceImage = function(obj) {
       
        var noimageurl = '/siteElements/channelshift/content/images/library/no-image.png';
        obj.onload = null;
        imageExists(obj.src, function (exists, w, h) {
            obj.src = (exists && w > 10) ? obj.src : noimageurl;
        
        
            //var content = $("#" + obj.id).contents().find("img");
            //alert(content);
      
        });

        
    };


    newbookscallbacks.iframeClick = function (Id) {
        _selectedIndex = Id
        populateList();
        e.preventDefault();
    };



})(window.newbookscallbacks = window.newbookscallbacks || {}, jQuery);

