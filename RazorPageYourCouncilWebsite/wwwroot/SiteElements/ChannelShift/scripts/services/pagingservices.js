"use strict";
(function (pagingservices, $, undefined) {

    var _timeout = 100;
    var _templatePagination = null;
    var _templateBottomPagination = null;
    var _pagingationTemplateId = '';
    var _paginationBottomTemplateId = '';
    var _topPaginationPlaceHolder = "";
    var _bottomPaginationPlaceHolder = '';
    var _title = '';
    var _callback = null;
    var getAllpages = new Array();

    var pager = { page: 1, records: 0, total: 0, firstHitToDisplay: 0, lastHitToDisplay: 0, pagesize: 5 };

    var paging = {
        current: 0,
        total: 0,
        pageSize: pager.pagesize,
        pageBoundary: { first: 1, last: 1 },
        pageRange: { start: 0, end: 0 }
    };

    var pagebuilderArray = function (count, pagesize) {
        var numberOfPages = 0;
        var remainderexists = false;
        if (count > pagesize) {
            var remainder = count % pagesize;
            if (remainder > 0) {
                numberOfPages = (count - remainder) / pagesize;
                numberOfPages++;
                remainderexists = true;
            }
            else {
                numberOfPages = count / pagesize;
            }

            var startvalue = 0;
            var endvalue = 0;
            for (var i = 1; i <= numberOfPages; i++) {

                startvalue = endvalue + 1;
                endvalue = startvalue + pagesize - 1;
                if (i === 1) { startvalue = i; endvalue = pager.pagesize; }
                if (i === numberOfPages) {
                    endvalue = (remainderexists) ? startvalue + (remainder - 1) : endvalue;
                }

                getAllpages.push({ PageNumber: i, FirstHitToDisplay: startvalue, LastHitToDisplay: endvalue })
            }
        }



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
        };
        //show or hide next links 
        if (paging.pageRange.end < paging.pageBoundary.last) { showNextLinks(true); } else { showNextLinks(false); }
        // show  or hide prev links
        if (paging.pageRange.start > paging.pageBoundary.first) { showPrevLinks(true); } else { showPrevLinks(false); }

        showLinks('top_pager');
        showLinks('bottom_pager');
    };

    var bindPaginationLinks = function () {

        var reset = function () {
            //resetTemplates();
            //showLoader();
        };

        var setpagerIds = function () {
            $('ul.pagination > li > a.page-link').removeClass('active');

            var pagerId = "pager-{0}-{1}-{2}";
            pagerId = pagerId.replace("{0}", pager.page);
            pagerId = pagerId.replace("{1}", pager.firstHitToDisplay);
            pagerId = pagerId.replace("{2}", pager.lastHitToDisplay);

            $('#top_' + pagerId).addClass('active');
            $('#bottom_' + pagerId).addClass('active');
        };

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

        $('a.page-link').on('click', function (e) {
            e.stopPropagation();
            e.preventDefault();
            reset();

            var splitter = (this.id).split('-');
            pager.page = parseInt(splitter[1]);
            pager.firstHitToDisplay = parseInt(splitter[2]);
            pager.lastHitToDisplay = parseInt(splitter[3]);

            var runpagelink = function () {
                _callback(pager.page, false);
                pagingAlgorthm(pager.page, pager.pagesize, pager.total);
                setpagerIds();
            };

            setTimeout(function () { runpagelink(); }, _timeout);
        });

        $('a.pager-prev').on('click', function (e) {

            e.stopPropagation();
            e.preventDefault();
            reset();

            var runpreview = function () {
                pager.page = (pager.page > 1) ? pager.page - 1 : 1;
                pagingCalculation(pager.page, pager.records, pager.pagesize, false);
                _callback(pager.page, false);
                pagingAlgorthm(pager.page, pager.pagesize, pager.total);
                setpagerIds();

            };
            setTimeout(function () { runpreview(); }, _timeout);
        });

        $('a.pager-next').on('click', function (e) {

            e.stopPropagation();
            e.preventDefault();
            reset();

            var runnext = function () {
                pager.page = (pager.page < pager.total) ? pager.page + 1 : pager.total;
                pagingCalculation(pager.page, pager.records, pager.pagesize, (pager.page === pager.total));
                _callback(pager.page, false);
                pagingAlgorthm(pager.page, pager.pagesize, pager.total);
                setpagerIds();

            };
            setTimeout(function () { runnext(); }, _timeout);
        });
    };

    var buildPages = function (currentpage, count) {
        var template = null;

        if (count > pager.pagesize) {
            pagebuilderArray(count, pager.pagesize);
            pager.total = getAllpages.length;
            pager.records = count;
            template =
                $("." + _topPaginationPlaceHolder).html(_templatePagination({ apipages: getAllpages, apiTotal: count, apiTitle: _title }));
            $("." + _bottomPaginationPlaceHolder).html(_templateBottomPagination({ apipages: getAllpages, apiTotal: count, apiTitle: _title }));
            bindPaginationLinks();
            pagingAlgorthm(currentpage, pager.pagesize, pager.total)
            $("a.center-links").filter(function () {   
                 return parseInt($(this).text()) === currentpage;
              }).addClass("active");
        }
        else {
            $("." + _topPaginationPlaceHolder).html(_templatePagination({ apipages: new Array(), apiTotal: count, apiTitle: _title }));
            $("." + _bottomPaginationPlaceHolder).html(_templateBottomPagination({ apipages: new Array(), apiTotal: count, apiTitle: _title }));
        }
    };

    var getPaginationTemplate = function () {
        return commonservices.returnHandlebarTemplate(Handlebars, _pagingationTemplateId);
    };

    var getBottomPaginationTemplate = function () {
        return commonservices.returnHandlebarTemplate(Handlebars, _paginationBottomTemplateId);
    };

    pagingservices.init = function (topPlaceholder, bottomPlaceholder, topTemplateId, bottomTemplateId) {

        _topPaginationPlaceHolder = topPlaceholder;
        _bottomPaginationPlaceHolder = bottomPlaceholder;
        _paginationBottomTemplateId = bottomTemplateId;
        _pagingationTemplateId = topTemplateId;
        _templatePagination = getPaginationTemplate();
        _templateBottomPagination = getBottomPaginationTemplate();

    };

    pagingservices.create = function (currentpage, count, callback) {

        _callback = callback;
        buildPages(currentpage, count);
    };

    pagingservices.reset = function () {
        $("." + _topPaginationPlaceHolder).html("");
        $("." + _bottomPaginationPlaceHolder).html("");
        getAllpages = new Array();
    };

    pagingservices.pagesize = function (ps) {
        paging.pageSize = (ps === null) ? paging.pageSize : ps;
        pager.pagesize = paging.pageSize;
        return paging.pageSize;
    };

    pagingservices.title = function (t) {
        _title = t;
    };

    pagingservices.hide = function () {
        $("." + _topPaginationPlaceHolder).hide();
        $("." + _bottomPaginationPlaceHolder).hide();
    };

    pagingservices.show = function () {
        $("." + _topPaginationPlaceHolder).show();
        $("." + _bottomPaginationPlaceHolder).show();

    };

})(window.pagingservices = window.pagingservices || {}, jQuery);