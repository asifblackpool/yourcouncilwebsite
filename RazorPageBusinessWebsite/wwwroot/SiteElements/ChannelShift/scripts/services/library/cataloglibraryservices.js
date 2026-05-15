(function (cataloglibraryservices, $, undefined) {

    pager = { page: 1, records: 0, total: 0, firstHitToDisplay: 0, lastHitToDisplay: 0, queryId: '' };

    var token = "";
    var timeout = 200;
    var _commonlibraryservices = null;
    var _catalogTemplate = null;
    var _sharedTemplate = null;
    var _btnSearchFunction = null;
    var hotlist = null;

    var searchCritera = {
        Term1: '',
        Term2: '',
        SearchType: '',
        HitsToDisplay: 5,
        LibraryFilter: '',
        PublishYearFilter: null,
        LanguageFilter: '',
        ItemTypeFilter: '',
        ExactMatch: false,
        Token: token
    };

    var paging = {
        current: 0,
        total: 0,
        pageSize: 0,
        pageBoundary: { first: 1, last: 1 },
        pageRange: { start: 0, end: 0 }
    };

    var pagingAlgorthm = function (pagenumber, size, total) {

        paging.current = pagenumber;
        paging.total = total;
        paging.pageSize = size;
        paging.pageBoundary.last = total;
        paging.pageRange.start = pagenumber;
        paging.pageRange.end = pagenumber + (paging.pageSize - 1);

        //boundary check
        if (paging.pageRange.end >= paging.pageBoundary.last) {
            var difference = paging.pageRange.end - paging.pageBoundary.last;
            paging.pageRange.end = (paging.pageRange.end - difference);
            paging.pageRange.start = (paging.pageRange.start - difference);
        }

        var showLinks = function (id) {
            var counter = 1;
            $('ul#' + id + ' a.center-links').each(function () {
                if ((counter < paging.pageRange.start) ||
                    counter > paging.pageRange.end) {
                    $(this).hide();
                } else {

                    if (paging.pageBoundary.last > 5) {
                        $(this).css('display', '');
                    } else {
                        $(this).show();
                    }    
                }

                counter++;
            });
        };

        var showDots = function (name, visible) {
            if (visible) { $(name).show(); } else { $(name).hide(); }
        };

        var showNextLinks = function (visible) {
            showDots('li.dots-right', visible);
            $('a.right-link').each(function () {
                if (visible) { $(this).css('display', ''); } else { $(this).hide(); }
            });
        };
        var showPrevLinks = function (visible) {
            showDots('li.dots-left', visible);
            $('a.left-link').each(function () {
                if (visible) { $(this).css('display', ''); } else { $(this).hide(); }
            });
        }
        //show or hide next links 
        if (paging.pageRange.end < paging.pageBoundary.last) { showNextLinks(true); } else { showNextLinks(false); }
        // show  or hide prev links
        if (paging.pageRange.start > paging.pageBoundary.first) { showPrevLinks(true); } else { showPrevLinks(false); }

        showLinks('top_library_pager');
        showLinks('bottom_library_pager');
    };

    var bindPaginationLinks = function () {

        var pagingCalculation = function (currentpage, total, perPage, islastpage) {
            if (total > 0 && perPage > 0 && (total > perPage)) {
                var remainder = total % perPage;
                var pages = ((total - remainder) / perPage) + 1;
                if (remainder == 0) {
                    pages--; //decrement by 1 as we have no remainder
                }
                pager.page = currentpage;
                pager.firstHitToDisplay = ((pager.page - 1) * perPage) + 1;
                pager.lastHitToDisplay = (islastpage) ? (pageItem.FirstHitToDisplay + remainder - 1) : pager.page * perPage;
            }
        };

        var catalogSearchPages = function (queryId, start, end) {

            var paramters = queryId + '/' + start + '/' + end;

            $.ajax({
                url: window.commonservices.Config().libraryUrl + '/standard/catalogsearchpages/' + paramters,

            })
             .then(function (data) {

                 var results = {};
                 results.data = data;
                 results.pages = (results.data.totalHitsField > 0) ? data.GetAllPages : null;

                 if (results.pages !== null) {
                     var holdItems = new Array();
                     for (var i = 0; i < results.data.hitlistTitleInfoField.length; i++) {
                         holdItems.push(
                             {
                                 HoldKey: 0,
                                 TitleKey: results.data.hitlistTitleInfoField[i].titleIDField,
                                 Location: '',
                                 Token: '',
                                 UserID: ''
                             });
                     }
                     catalogItemsList(holdItems, function (data, isOk) {
                         if (isOk) {
                             _catalogTemplate.populateResults(data);
                             _btnSearchFunction(isOk, data);
                             _commonlibraryservices.hide();
                         }
                     });
                 }     
             })
             .fail(function (err) {
                 _commonlibraryservices.trace('Promise Error: cataloglibraryservices');
                 _commonlibraryservices.trace(err);
                 commonlibraryservices.hide();
             });
        };

        $('a.page-link').on('click', function (e) {
            e.stopPropagation();
            e.preventDefault();

            var splitter            = (this.id).split('-');
            pager.page              = parseInt(splitter[1]);
            pager.firstHitToDisplay = parseInt(splitter[2]);
            pager.lastHitToDisplay = parseInt(splitter[3]);

            _catalogTemplate.clearResults();
            _catalogTemplate.clearAvailabilty();
            _commonlibraryservices.show();

            var runpagelink = function () {
                catalogSearchPages(pager.queryId, pager.firstHitToDisplay, pager.lastHitToDisplay);
                pagingAlgorthm(pager.page, searchCritera.HitsToDisplay, pager.total);

                $('ul.pagination > li > a.page-link').removeClass('active');
                var pagerId = "pager-{0}-{1}-{2}";
                pagerId = pagerId.replace("{0}", pager.page)
                pagerId = pagerId.replace("{1}", pager.firstHitToDisplay)
                pagerId = pagerId.replace("{2}", pager.lastHitToDisplay);
                $('#top_' + pagerId).addClass('active');
                $('#bottom_' + pagerId).addClass('active');

            };

            setTimeout(function () { runpagelink(); }, timeout);  
        });

        $('a.library-pager-prev').on('click', function (e) {

            e.stopPropagation();
            e.preventDefault();
            _catalogTemplate.clearResults();
            _catalogTemplate.clearAvailabilty();
            _commonlibraryservices.show();
          
            var runpreview = function () {
                pager.page = (pager.page > 1) ? pager.page - 1 : 1;
                pagingCalculation(pager.page, pager.records, searchCritera.HitsToDisplay, false);
                catalogSearchPages(pager.queryId, pager.firstHitToDisplay, pager.lastHitToDisplay);
                pagingAlgorthm(pager.page, searchCritera.HitsToDisplay, pager.total);

                $('ul.pagination > li > a.page-link').removeClass('active');
                var pagerId = "pager-{0}-{1}-{2}";
                pagerId = pagerId.replace("{0}", pager.page)
                pagerId = pagerId.replace("{1}", pager.firstHitToDisplay)
                pagerId = pagerId.replace("{2}", pager.lastHitToDisplay);
                $('#top_' + pagerId).addClass('active');
                $('#bottom_' + pagerId).addClass('active');
            };
            setTimeout(function () { runpreview(); }, 2000);
        });

        $('a.library-pager-next').on('click', function (e) {

            e.stopPropagation();
            e.preventDefault();
            _catalogTemplate.clearResults();
            _catalogTemplate.clearAvailabilty();
            _commonlibraryservices.show();
         
            var runnext = function () {
                pager.page = (pager.page < pager.total) ? pager.page + 1 : pager.total;
                pagingCalculation(pager.page, pager.records, searchCritera.HitsToDisplay, (pager.page === pager.total));

                catalogSearchPages(pager.queryId, pager.firstHitToDisplay, pager.lastHitToDisplay);
                pagingAlgorthm(pager.page, searchCritera.HitsToDisplay, pager.total);

                $('ul.pagination > li > a.page-link').removeClass('active');
                var pagerId = "pager-{0}-{1}-{2}";
                pagerId = pagerId.replace("{0}", pager.page)
                pagerId = pagerId.replace("{1}", pager.firstHitToDisplay)
                pagerId = pagerId.replace("{2}", pager.lastHitToDisplay);
                $('#top_' + pagerId).addClass('active');
                $('#bottom_' + pagerId).addClass('active');
            };
            setTimeout(function () { runnext(); }, timeout);
        });
    };

    var catalogItemsList = function (holdItems, callback) {
        $.ajax({
            type: 'POST',
            url: window.commonservices.Config().libraryUrl + '/standard/lookupTitleInformationList',
            data: { '': holdItems },
        })
           .then(function (data) {
               return callback(data, true);
           })
           .fail(function (err) {
               return callback(null, false);
           });
    };

    var catalogItem = function (titleId, callback) {
         var runAvailability = function () {

                var availabilityResults = {};

                $.ajax({
                    url: window.commonservices.Config().libraryUrl + '/standard/lookupTitleInformation/' + titleId,
                })
                 .then(function (data) {

                     $('#' + _catalogTemplate.contentIDs.searchcatalog).hide();
                     availabilityResults.TitleInfo = data;
                     _catalogTemplate.populateAvailability(availabilityResults);
                     _commonlibraryservices.showHide(_commonlibraryservices.searchView().ITEM_DETAIL);
                     _commonlibraryservices.hide();
                     return callback(true);
                 })
                 .fail(function (err) {
                     _commonlibraryservices.trace('Promise Error: cataloglibraryservices');
                     _commonlibraryservices.trace(err);
                     return callback(false);
                 });
            };
         setTimeout(function () { runAvailability(); }, timeout);
    };

    var catalogSearch = function (searCriteria, callback) {

        var results = {};
        _catalogTemplate.reset();
        _sharedTemplate.clearPickupLocation();
        _commonlibraryservices.show();
        var runsearch = function () {

            $.ajax({
                url: window.commonservices.Config().libraryUrl + '/standard/catalogsearchrest/',
                data: {
                    Term1               : searchCritera.Term1,
                    Term2               : searchCritera.Term2,
                    SearchType          : searchCritera.SearchType,
                    HitsToDisplay       : searchCritera.HitsToDisplay,
                    LibraryFilter       : searchCritera.LibraryFilter,
                    LanguageFilter      : searchCritera.LanguageFilter,
                    ItemTypeFilter      : searchCritera.ItemTypeFilter,
                    ExactMatch          : searchCritera.ExactMatch,
                    showAvailableOnly   : searchCritera.showAvailableOnly,
                    IsAdvancedSearch    : searchCritera.IsAdvancedSearch,
                    Token               : searchCritera.Token
                },
            })
                .then(function (data) {
                    commonlibraryservices.trace("First Response:");
                    if (data !== null && data.hitlistTitleInfoField !== null) {
                        results.data = data;
                        pager.queryId = data.queryIDField;
                        return $.ajax({
                            url: window.commonservices.Config().libraryUrl + '/standard/pager/' + data.totalHitsField + '/' + searchCritera.HitsToDisplay,
                        });
                    }
                    else {
                        results.data = data;
                        pager.queryId = '';
                    }
                })
                .then(function (data) {
                    commonlibraryservices.trace("second Response:");
                    results.pages = (results.data.totalHitsField > 0) ? data.GetAllPages : null;

                    if (results.pages !== null) {
                        var holdItems = new Array();
                        for (var i = 0; i < results.data.hitlistTitleInfoField.length; i++) {

                                holdItems.push({
                                   HoldKey: 0,
                                   TitleKey: results.data.hitlistTitleInfoField[i].titleIDField,
                                   Location: '',
                                   Token: '',
                                   UserID: ''
                               });
                           
                        }
                        catalogItemsList(holdItems, function (data, isOk) {
                            if (isOk) {
                                _catalogTemplate.populateResults(data);
                                _catalogTemplate.populatePagination(results.pages, results.data.totalHitsField);

                                if (results.pages !== null) {
                                    bindPaginationLinks();
                                    pager.total = results.pages.length;
                                    pager.records = results.data.totalHitsField;
                                    pagingAlgorthm(1, searchCritera.HitsToDisplay, pager.total);
                                    _catalogTemplate.clearAdvancedSearch();
                                    _catalogTemplate.showSearchInput();
                                    callback(true, data); //callback to bind
                                }
                                commonlibraryservices.hide()
                            }
                        });
                    } else {
                        commonlibraryservices.hide();
                        _catalogTemplate.populateResults(null);
                        callback(false, null);
                    }
                })
                .fail(function (err) {
                    commonlibraryservices.trace('Promise Error: cataloglibraryservices');
                    commonlibraryservices.trace(err);
                });
        };
        setTimeout(function () { runsearch();}, timeout);
    };

    var hotList = function (callback) {
      
        $.ajax({
            url: window.commonservices.Config().libraryUrl + '/standard/cataloghotlist/',
            method: 'GET',
        }).then(function (data) {

            if (data !== null) {
                hotlist = data.hitlistTitleInfoField;
                return $.ajax({
                    url: window.commonservices.Config().libraryUrl + '/standard/lookupTitleInformation/' + hotlist[0].titleIDField,
                })
            } else {
                return callback(false, null, null);
            }

        }).then(function (data) {
            return callback(true, hotlist, data);

        }).fail(function (err) {
           return callback(false,null, null);
        });
    }

    var catalogSearchByISBN = function (searchCriteria, callback) {
        var results = {};
        _commonlibraryservices.show();
        var runsearch = function () {

            $.ajax({
                url: window.commonservices.Config().libraryUrl + '/standard/catalogsearchrest/',
                data: {
                    Term1: searchCritera.Term1,
                    Term2: searchCritera.Term2,
                    SearchType: searchCritera.SearchType,
                    HitsToDisplay: 1,
                    LibraryFilter: null,
                    LanguageFilter: null,
                    ItemTypeFilter: null,
                    ExactMatch:searchCritera.ExactMatch,
                    showAvailableOnly: null,
                    IsAdvancedSearch: false,
                    Token: null
                },
            }).then(function (data) {
                if (data !== null && data.totalHitsField === 1) {
                        var items = new Array();
                         items.push({  HoldKey: 0,TitleKey:data.hitlistTitleInfoField[0].titleIDField, Location: '',Token: '',UserID: ''  });
                         catalogItemsList(items, function (data, isOk) { if (isOk) { callback(data,true);  } });
                    } else {    callback(null, false);    }
                })
                .fail(function (err) {
                    callback(null, false);
                });
        };
        setTimeout(function () { runsearch(); }, timeout);
    };
    
    cataloglibraryservices.init = function (services, callback) {
        _commonlibraryservices = services;
        _catalogTemplate = _commonlibraryservices.catalogTemplate();
        _sharedTemplate = _commonlibraryservices.sharedTemplate();
        _btnSearchFunction = callback;
        timeout = _commonlibraryservices.getTimeout();
        _commonlibraryservices.trace('call catalog library services init ');
        
    };

    cataloglibraryservices.searchCriteria = function () {
        return searchCritera;
    };

    cataloglibraryservices.catalogsearch = function (sc, callback) {
        catalogSearch(sc, callback);
    };

    cataloglibraryservices.catalogSearchByISBN = function (sc, callback) {
        catalogSearchByISBN(sc, callback);
    };

    cataloglibraryservices.catalogitem = function (titleId, callback) {
       catalogItem(titleId, callback)
    };

    cataloglibraryservices.catalogItemsList = function (data, callback) {
        catalogItemsList(data, callback);
    };

    cataloglibraryservices.hotList = function (callback) {
        hotList(callback);
    };

    cataloglibraryservices.selectedHotList = function (titleId, callback) {
        $.ajax({
            url: window.commonservices.Config().libraryUrl + '/standard/lookupTitleInformation/' + titleId
        }).then(function (data) {
                  return callback(true,data);
        }).fail(function (err) {
                  return callback(false,data);
        });
    };
  
})(window.cataloglibraryservices = window.cataloglibraryservices || {}, jQuery);


