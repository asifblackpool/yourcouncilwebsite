"use strict";

//onst { template } = require("underscore");

(function (searchservices, $, undefined) {

    var _baseUrl = '/custom/api/contenttype/';
    var _sitemap = new Array();
    var _list = new Array();
    var _template = "";
    var _pagesize = 5;
    var _pagingservices = null;
    var _searchsettings = null;


    var loading = function (hide) {

        if (hide) { setTimeout(function () { $('#loading-indicator').hide(); }, 800); }
        else { $('#loading-indicator').show(); }
    };

    var returnHandlebarTemplate = function (sourceId) {
        return commonservices.returnHandlebarTemplate(Handlebars, sourceId);
    };

    var registerHandlebarPartial = function (sourceId) {
        commonservices.registerHandlebarPartial(Handlebars, sourceId);
    };

    var SearchTemplates = function () {

        var template = {
            handlebarIDs: {
                Search: 'search-template'
            },
            contentIDs: {
                Search: 'search-content',

            },
            populateSearch: function (data) {

                var template = returnHandlebarTemplate(this.handlebarIDs.Search);
                var htmldata = template({ apidata: data });
                $('#' + this.contentIDs.Search).html(htmldata);
            },

            showSearch: function () {
                $('#' + this.contentIDs.Search).show();
            },
            hideSearch: function () {
                $('#' + this.contentIDs.Search).hide();
            },
            clearSearch: function () {
                $('#' + this.contentIDs.Search).html('');
            },

            reset: function () {
                _sitemap = new Array();
                _list = new Array();
            }
        };

        return template;
    };

    function getSiteMapNode(arr, value) {

        var result = arr.filter(function (x) { return x.EntryId == value; });
        return result ? result[0] : null;

    }

    function search_results(Id, alias, title, tag, metadescription, htmlmarkup, href, content) {
        this.EntryId = Id;
        this.Alias = alias;
        this.Title = title;
        this.Tag = tag;
        this.MetaDescription = metadescription;
        this.HtmlMarkup = htmlmarkup;
        this.Href = href;
        this.Content = content;
    }

    function sitemap_results(Id, slug, path, pagelink) {
        this.EntryId = Id;
        this.Slug = slug;
        this.Path = path;
        this.PageLink = pagelink;

    }

    var getSearchResults = function (currentPage, endPage) {
        var item = null;


        var sitemapUrl = "{0}sitemap/{1}/{2}/{3}?path={4}&siteviewpath=={5}";
        sitemapUrl = sitemapUrl.replace("{0}", _baseUrl);
        sitemapUrl = sitemapUrl.replace("{1}", _searchsettings.homepage);
        sitemapUrl = sitemapUrl.replace("{2}", _searchsettings.defaultEntryId);
        sitemapUrl = sitemapUrl.replace("{3}", _searchsettings.depth);
        sitemapUrl = sitemapUrl.replace("{4}", _searchsettings.configPath);
        sitemapUrl = sitemapUrl.replace("{5}", _searchsettings.siteViewPath);


        var searchUrl = "{0}searchBlackpool/{1}/{2}?path={3}";
        searchUrl = searchUrl.replace("{0}", _baseUrl);
        searchUrl = searchUrl.replace("{1}", _searchsettings.contentTypeId);
        searchUrl = searchUrl.replace("{2}", _searchsettings.searchTerm);
        searchUrl = searchUrl.replace("{3}", _searchsettings.configPath);


        var searchdata = function (data) {
            if (data !== null) {

                for (var i = 0; i < data.length; i++) {
                    item = data[i];

                    _list.push(
                        new search_results(item.EntryId,
                            item.Title,
                            item.Title,
                            item.Tag,
                            item.MetaDescription,
                            item.HtmlMarkup,
                            item.Href,
                            item.Content))
                }
            }
        };

        var updateHrefs = function () {
            if (_list !== null) {
                for (var i = 0; i < _list.length; i++) {

                    var sitmapnode = getSiteMapNode(_sitemap, _list[i].EntryId);
                    if (sitmapnode !== null) {
                        _list[i].Href = sitmapnode.PageLink;

                    }
                }
            }
        };

        var sitemapdata = function (data) {
            if (data !== null) {

                for (var i = 0; i < data.length; i++) {
                    item = data[i];
                    _sitemap.push(new sitemap_results(item.EntryId, item.Slug, item.Path, item.PageLink))
                }
            }
        };

        $.when(
            $.get(sitemapUrl,
                function (data1) {
                    sitemapdata(data1);

                }).fail(function () {
                    loading(true);
                }),
            $.get(searchUrl,
                function (data2) {
                    searchdata(data2);

                }).fail(function () {
                    loading(true);
                })

        ).then(function () {
            updateHrefs();
            _template.populateSearch(_list.slice(currentPage, endPage));
            _pagingservices.create(1, _list.length, pageResults);
            loading(true);
        });

    };

    var pageResults = function (currentPage) {

        var sp = (currentPage == 1) ? 0 : (currentPage - 1) * (_pagesize);
        var ep = sp + _pagesize;
        var ep = (_list.length > ep) ? ep : _list.length;

        loading(false);
        _template.clearSearch();
        _template.populateSearch(_list.slice(sp, ep));
        loading(true);
    };

    searchservices.init = function (searchsettings, pagingservices) {
        console.log('run search services init');

        _searchsettings = searchsettings;
        _template = SearchTemplates();
        _template.reset();
        _template.clearSearch();

        _pagingservices = pagingservices;
        _pagingservices.init("top-placeholder", "bottom-placeholder", "top-template", "bottom-template");
        _pagingservices.title('Number of search results found');
        _pagingservices.pagesize(_pagesize);


        loading(false);
        getSearchResults(0, _pagesize);

    };

})(window.searchservices = window.searchservices || {}, jQuery);

