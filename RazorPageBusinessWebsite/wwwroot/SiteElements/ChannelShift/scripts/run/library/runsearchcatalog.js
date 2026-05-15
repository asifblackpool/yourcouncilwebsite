$(document).ready(function () {


    var loadHotList = function () {
        cataloglibraryservices.hotList(function (isOK, items, selectedItem) {
            if (isOK) {


                var removeDuplicates = function(array, key) {
                    let lookup = {};
                    array.forEach(element => {
                        lookup[element[key]] = element
                    });
                    return Object.keys(lookup).map(key => lookup[key]);
                };

                var removeByMessage = function (array, msg) {
                    var result = [];
                    for (var i = 0, len = array.length; i < len; i++)
                        if (array[i].messageField !== msg) result.push(array[i]);
                    return result;
                };

                var temp = removeDuplicates(items, 'callNumberField');
                var temp = removeByMessage(temp, 'Unavailable for display');

                var firstFiveItems = (temp !== null && temp.length > 4) ? temp.slice(0, 5) : temp;
                commonlibraryservices.catalogTemplate().populateWhatsNew(firstFiveItems, selectedItem);
                newbookscallbacks.init(firstFiveItems, commonlibraryservices, catalogitemcallbacks, pickuplocationcallbacks, window.sharedcallbacks);
                commonlibraryservices.hide();
            }
        });
    };

    var sc = cataloglibraryservices.searchCriteria();
    sc.SearchType = "General"; //default setting

    var getCatalogSearchResults = function () {
        sc.Term1 = $('#library-search').val();

        cataloglibraryservices.catalogsearch(sc, catalogcallbacks.bindSearchButtonsEventCallback);
    };

    var closeOverlay = function () {
        commonlibraryservices.overlay(0, "");
        commonlibraryservices.show();
        setTimeout(function () {
            commonlibraryservices.showHide(commonlibraryservices.getcontentview());
            catalogcallbacks.deselectAllCheckboxes();
            commonlibraryservices.hide();
        }, 200);
    };

    var bindEscapeKey = function () {
        $(document).on('keydown', function (e) { if (e.keyCode === 27) { closeOverlay(); } });

        $('#library-run').on('click', function (e) {
            getCatalogSearchResults();
        });

        $("#library-search").keydown(function (e) {
            if (e.which === 13) {
                getCatalogSearchResults();
            }
        });

        $(document).on('click', "a.closebtn", function (e) {
            e.preventDefault();
            closeOverlay();
        });
    };

    $(document).on('change', "#search-select-picker-ddl", function () {
        sc.SearchType = $(this).val();
    });

    $(document).on('click', "a.closebtn", function (e) {
        e.preventDefault();
        closeOverlay();
    });

    $(document).on('click', "a#adv-search-link", function (e) {
        e.preventDefault();
        var runAdvanceSearch = function (search) {

            var libraryAdvancedSearch = function (search) {

                var reset = function () {
                    var resetDDL = function (Id) {
                        $('select#' + Id + 'option:selected').removeAttr('selected');
                    };

                    var resetInputText = function (Id) {
                        $('#' + Id).val('');
                    };

                    var resetCheckbox = function (Id) {
                        $("#" + Id).prop('checked', false);
                    };

                    var resetRadiobutton = function (name, value) {
                        $("input[type=radio][name='" + name + "']").val([value]);
                    };

                    resetDDL('language-ddl');
                    resetDDL('format-type-ddl');
                    resetDDL('library-ddl');
                    resetInputText('term1');
                    resetInputText('term2');
                    resetCheckbox('chkbox-showavailableonly');
                    resetRadiobutton('advOptRadio', 'ALL');
                };

                var bindCheckbox = function () {
                    $(".library-available").change(function () {
                        search.showAvailableOnly = null;
                        if (this.checked) {
                            search.showAvailableOnly = true;
                        }
                    });
                };

                var bindRadioButton = function () {
                    $("input[type=radio][name='advOptRadio']").on('change', function () {
                        switch ($(this).val()) {
                            case 'ALL':
                                search.ExactMatch = true;
                                break;
                            default:
                                search.ExactMatch = false;
                                break;
                        }
                    });
                };

                var bindLanguageDDL = function () {
                    $("#language-ddl").change(function () { search.LanguageFilter = this.value; });
                };

                var bindLFormatTypeDDL = function () {
                    $("#format-type-ddl").change(function () { search.ItemTypeFilter = this.value; });
                };

                var bindLibraryFilterDDL = function () {
                    $("#library-ddl").change(function () { search.LibraryFilter = this.value; });
                };

                var bindBacktoSearch = function () {
                    $('#back-to-search').on('click', function (e) {
                        commonlibraryservices.showHide(commonlibraryservices.searchView().SEARCH_DEFAULT);
                        loadHotList();
                    });
                };

                var keyup = function (search) {
                    $("#term1, #term2").keyup(function () {
                        update();
                    });

                    function update() {
                        var unwantedTerms = (($('#term2').val()).length > 0) ? '-' + $('#term2').val() : '';
                        unwantedTerms = unwantedTerms.replace(/\s+/g, ' -');

                        var lastChar = unwantedTerms.substr(unwantedTerms.length - 1);
                        if (lastChar === '-') { unwantedTerms.slice(0, -1); }

                        search.Term1 = $('#term1').val();
                        search.Term2 = unwantedTerms;
                        $("#library-result").val(search.Term1 + " " + search.Term2);
                    }
                };

                var submitAdvancedSearch = function () {
                    $('#library-advanced-search-submit').on('click', function (e) {

                        cataloglibraryservices.catalogsearch(search, function (isOk) {
                            if (isOk) {
                                commonlibraryservices.showHide(commonlibraryservices.searchView().SEARCH);
                                catalogcallbacks.bindSearchButtonsEventCallback();
                            } else {
                                commonlibraryservices.overlay(100, "No search results found. Please alter your search parameters");
                                commonlibraryservices.setcontentview(commonlibraryservices.searchView().ADV_SEARCH);
                                commonlibraryservices.showHide(commonlibraryservices.searchView().ADV_SEARCH);
                            }

                        });
                    });
                };

                reset();
                bindRadioButton();
                bindLanguageDDL();
                bindLFormatTypeDDL();
                bindLibraryFilterDDL();
                bindCheckbox();
                bindBacktoSearch();
                keyup(search);
                submitAdvancedSearch();

            };

            var ct = commonlibraryservices.catalogTemplate();
            ct.populateAdvancedSearch();
            commonlibraryservices.showHide(commonlibraryservices.searchView().ADV_SEARCH);
            libraryAdvancedSearch(search);
            commonlibraryservices.hide();
        };

        commonlibraryservices.show();
        setTimeout(function () { runAdvanceSearch(sc); }, 500);
    });

    //initialise services 
    logger.disableLogger();
    var config = window.commonservices.Config();
    window.commonservices.Redirect();
    window.commonservices.removeCMSForm();
    window.homeservices.init();
    window.scrollerservice.init();
    window.footerservices.init();

    window.commonservices.SetConfig(config);
    window.commonlibraryservices.init();
    window.commonlibraryservices.show();
    window.pickuplocationcallbacks.init(window.commonlibraryservices);
    window.catalogcallbacks.init(window.commonlibraryservices, window.catalogitemcallbacks, window.pickuplocationcallbacks, window.sharedcallbacks);
    window.cataloglibraryservices.init(window.commonlibraryservices, window.catalogcallbacks.bindSearchButtonsEventCallback);
    window.securitylibraryservices.init(window.commonlibraryservices);
    window.sharedlibraryservices.init(window.commonlibraryservices, window.accountlibraryservices, window.cataloglibraryservices);

    window.commonlibraryservices.hidesearchbar();
    window.securitylibraryservices.authenticated(function (isLoggedIn) {
        if (isLoggedIn) {
            window.securitylibraryservices.patronInfo();
            window.securitylibraryservices.yourStatus(true);
        } else {
            window.securitylibraryservices.yourStatus(false);
        }
    });


    loadHotList();
    bindEscapeKey();

}); //end of document ready