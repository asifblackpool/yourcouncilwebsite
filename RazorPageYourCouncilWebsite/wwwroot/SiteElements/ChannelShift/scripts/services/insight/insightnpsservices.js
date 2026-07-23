"use strict";
(function (insightnpsservices, $, undefined) {

    var _baseUrl            = "/custom/api/insightnps/";
    var _template           = null;
    var _templateId         = 'review-template';
    var _contentPlaceHolder = "happy-members";
    var _token              = null;
    var _filteredReviews    = null;

    var showLoader = function () {
        $("#review-loading-indicator").show();
    };

    var hideLoader = function () {
        $("#review-loading-indicator").hide();
    };

    var populateTemplate = function (data) {
        var template = null;

        $("#" + _contentPlaceHolder).html(_template({ apidata: data }));
        hideLoader();
    };

    var resetTemplates = function () {
        $("." + _contentPlaceHolder).html("");
    };

    var getTemplate = function () {
        return commonservices.returnHandlebarTemplate(Handlebars, _templateId);
    };

    var getComments = function () {

        var reviews = null;

        var gettoken = function () {

            var data = { "email": "apiaccess@blackpoolcouncil.insightnps.co.uk", "password": "123qwe" };

            return $.ajax({
                url: _baseUrl + 'authenticate',
                dataType: 'json',
                data: JSON.stringify(data),
                type: 'POST'
            });
        };

        var history = function () {

            var data = { "token": _token };

            return $.ajax({
                url: _baseUrl + 'recipienthistory',
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                data: JSON.stringify(data),
                type: 'POST'
            });
        };

        var filterReviews = function () {
            if (reviews != null) {
                _filteredReviews = new Array();
                var counter = 0;
                for (var i = 0; i < reviews.length; i++) {
                    var item = reviews[i];
                    if (item.score > 6 && item.response.length > 10 && item.response.length < 180) {
                        _filteredReviews.push(item);
                        counter++;
                    }
                    if (counter > 5) { break; }
                }
                populateTemplate(_filteredReviews);
                hideLoader();
            }
        };

        gettoken()
            .done(function (tkn) {
                console.log('authenticated token' + tkn);
                _token = tkn;
            })
            .then(history).done(function (data) {
                console.log('data returned' + data);
                reviews = JSON.parse(data);
                filterReviews();

            })
            .fail(function () {

        });
    };

    insightnpsservices.init = function () {
        
        _template = getTemplate();
        showLoader();
        resetTemplates();
        getComments();
        
    };

})(window.insightnpsservices = window.insightnpsservices || {}, jQuery);