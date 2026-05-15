"use strict";
(function (pickuplocationcallbacks, $, undefined) {

    var titleId = null;
    var _timeout = null;
    var _commonlibraryservices = null;
    var _callback = null;

    var setCookie = function (isOK, val) {
        if (isOK) {
            commonlibraryservices.setcontentview(val);
        } else {
            commonlibraryservices.setcontentview(-1);
        }
    };

    var addLocationReserveClick = function (Ids, backto,populated) {

        var selectedIds = Ids;

        var getLibrary = function () {
            var value = null;
            if ($("div.radio-info input:radio[name='optradio']").is(":checked")) {
                value = $('div.radio-info input[type="radio"]:checked').val();
            }

            return value;
        };

        var getLibraries = function () {

            var values = $('select.library-ddl :selected').map(function (i, el) {

                var tId = ($(el).parent().attr("id")).split('-')[2];
                return { titleId: tId, libraryId: $(el).val() };

            }).get();
            return (values.length > 0) ? values : null;
        };

        var BindClick = function () {
            $('#location-reserve').on('click', function (e) {
                commonlibraryservices.show();
                securitylibraryservices.authenticated(authenticatedOk);
            });
        };

        var backbuttonclick = function () {

            $('button#pickuplocation-back-to').on('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                _commonlibraryservices.show();
                setTimeout(function () {
                    (_commonlibraryservices.catalogTemplate()).clearAvailabilty();
                    var gobackto = parseInt($("#backtoview").val());
                    switch (gobackto) {
                        case _commonlibraryservices.searchView().SEARCH_DEFAULT:
                            _commonlibraryservices.showHide(_commonlibraryservices.searchView().SEARCH_DEFAULT);
                            break;
                        case _commonlibraryservices.searchView().SEARCH:
                            _commonlibraryservices.showHide(_commonlibraryservices.searchView().SEARCH);
                            break;
                        case _commonlibraryservices.searchView().ITEM_DETAIL:
                            _commonlibraryservices.showHide(_commonlibraryservices.searchView().ITEM_DETAIL);
                            break;
                        case _commonlibraryservices.searchView().ACCOUNT:
                            _commonlibraryservices.showHide(_commonlibraryservices.searchView().ACCOUNT);
                            break;
                        default:
                            break;
                    }
                   
                    _commonlibraryservices.hide();
                }, _timeout);
            });
        };

        var authenticatedOk = function (ok) {
            if (ok) {
                securitylibraryservices.yourStatus(true);
                var view = $('#pickuplocationview').val();

                if (view === 'radio') {
                    var locationKey = getLibrary();
                    if (getLibrary() === null) {
                        commonlibraryservices.overlay(100, "Please select the library location to complete your reservation.");
                        setCookie(false, -1);
                        return;
                    }
                    var objReturn = commonlibraryservices.getLibraryName(locationKey, 'key');
                    accountlibraryservices.createhold(selectedIds[0], locationKey, function (success, errortext) {
                     

                        var msg = success ? "This item has been reserved for you at {0} library.".replace('{0}', (objReturn !== null ? objReturn.value : ""))
                                          : "Unable to reserve this items. {0}".replace('{0}', errortext)
                        commonlibraryservices.overlay(100, msg);
                        setCookie(success, backto);
                        return _callback(success);
                    });
                }
                else {
                    var data = getLibraries();
                    accountlibraryservices.createholds(data, function (success, errortext) {
                        commonlibraryservices.overlay(100, success ? "This items has been reserved for you." : "Unable to reserve this items.");
                        setCookie(success, backto);
                        return _callback(success);

                    });
                }
            }
        };

        if (populated) {
            BindClick();
            backbuttonclick();
        }
    };


    pickuplocationcallbacks.init = function (commonlibraryservices) {
        _commonlibraryservices = commonlibraryservices;
        _timeout = _commonlibraryservices.getTimeout();
    };

    pickuplocationcallbacks.bindEvents = function (Ids, backto, populated, callback) {

        _callback = callback;
        addLocationReserveClick(Ids, backto,populated);
    };

})(window.pickuplocationcallbacks = window.pickuplocationcallbacks || {}, jQuery);
