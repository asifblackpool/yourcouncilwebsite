(function (sharedlibraryservices, $, undefined) {

    var token = "";
    var timeout = 200;
    var _commonlibraryservices = null;
    var _accountlibraryservices = null;
    var _cataloglibraryservices = null;
    var _sharedTemplate = null;

    var lookuptitlesInformationList = function (holdItems, callback) {
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
 
    var pickuplocation = function (titleIds, view, callback) {

        var holdItems = new Array();
        for (var i = 0; i < titleIds.length; i++) {
            holdItems.push(
                {
                    HoldKey: 0,
                    TitleKey: titleIds[i],
                    Location: '',
                    Token: '',
                    UserID: ''
                });
        }


        var runPickupLocation = function (view, callback) {

            _cataloglibraryservices.catalogItemsList(holdItems, function (data, isOK) {

                var pickupdata = {};
                pickupdata.data = data;
                pickupdata.viewmode = { title: 'Choose a pick up location', page: view }
                if (isOK) {
                    $('#' + _commonlibraryservices.catalogTemplate().contentIDs.searchcatalog).hide();
                    _sharedTemplate.populatePickupLocation(pickupdata);
                  
                    _commonlibraryservices.hide();
                    callback(true);
                } else {
                    _commonlibraryservices.trace('Promise Error: cataloglibraryservices');
                    _commonlibraryservices.trace(err);
                    _commonlibraryservices.hide();
                    callback(false);
                }
            });
        };

        setTimeout(function () { runPickupLocation(view, callback); }, timeout);
    };

    sharedlibraryservices.init = function (services, accountservices, catalogservices) {
        _commonlibraryservices = services;
        _accountlibraryservices = accountservices;
        _cataloglibraryservices = catalogservices;

        _sharedTemplate = _commonlibraryservices.sharedTemplate();
        timeout = _commonlibraryservices.getTimeout();
        _commonlibraryservices.trace('call shared library services init ');

    };

    sharedlibraryservices.populatePickupLocation = function (titleIds, view, callback) {
        pickuplocation(titleIds, view, callback);
    };

    sharedlibraryservices.clearPickupLocation = function () {
        templates.clearPickupLocation();
    };

  
})(window.sharedlibraryservices = window.sharedlibraryservices || {}, jQuery);


