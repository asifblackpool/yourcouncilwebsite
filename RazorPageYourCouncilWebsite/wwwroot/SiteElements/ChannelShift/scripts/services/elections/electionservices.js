"use strict";
(function (electionservices, $, undefined) {


    var _placeholderId          = "voting-elections-placeholder";
    var _templateId             = 'elections-accordion-template';
    var _sheetId                = null;
    var _showAnalysisSheet      = true;
    var _sheets = new Array();
    var _analysis = null;
    var _selectedSheet = { sheetId: 0, sheetName: '' };
    var _chartservices = null;
    var _hexCodes = null;

    var getShortName = function (name) {
        if (name !== null) {
            var arraynames = name.split(' ');
            if (arraynames.length > 0) {
                var len = arraynames.length;
                return (arraynames[0]).charAt(0) + ' ' + arraynames[len - 1];
            }
        }

        return name;
    };

    var returnSheet = function (sheetId) {
        if (_sheets !== null) {
            var item = $.grep(_sheets, function (e) { return e.sheetId === sheetId });
            return (item.length > 0) ? item[0].name : null;
        }
    };

    var returnListObjects = function (data) {

        var obj = [];
        if (Array.isArray(data)) {
            $.each(data, function (i, item) {
                obj.push(item);
            });
        }
        else {
            obj.push(data);
        }
        return obj;
    };

    var showLoader = function () {
        $("#voting-loading-indicator").show();
    };

    var hideLoader = function () {
        $("#voting-loading-indicator").hide();
    };

    var getTemplate = function () {
        return commonservices.returnHandlebarTemplate(Handlebars, _templateId);
    };

    var populateTemplate = function (data, analysisdata) {
        var _html = getTemplate();
       $("#" + _placeholderId).html(_html({ apiData: data, apiResults: analysisdata, apiShow : _showAnalysisSheet }));
    }

    var resetTemplates = function () {
        $("." + _placeholderId).html("");
    };

    var getAllSheets = function () {
        $.get(window.commonservices.Config().googleSheetsUrl + 'allsheets/' + _sheetId,
            function (data, status) {
                var sheets = returnListObjects(data.sheets);
                $.each(sheets, function (index, item) {
                    console.log('item index is ' + index);
                    _sheets.push({ sheetId: item.properties.sheetId, name: item.properties.title });
                });
                _analysis = _sheets[0];
                _sheets.shift();
                getAnalysisSheet(_analysis);
            }
        ).fail(function () { });
    };

    var getSheet = function (sheetId) {

        var sheetTemplateId = 'elections-item-template';
        var sheetplaceholderId = 'sheet_' + sheetId;
        var url = window.commonservices.Config().googleSheetsUrl + 'datasheet/' + _sheetId + '/{0}/';


        _selectedSheet.sheetId = sheetId;
        _selectedSheet.sheetName = returnSheet(sheetId);

        url = (url.replace("{0}", _selectedSheet.sheetName));
        url = url.replace(/ /g, '%20');

        var getSheetTemplate = function () {
            return commonservices.returnHandlebarTemplate(Handlebars, sheetTemplateId);
        }

        var populateSheet = function (sheetInfo, vote, statement, turnout) {
            var sheetHtml = getSheetTemplate();
            $("#" + sheetplaceholderId).html(sheetHtml({ apisheet: sheetInfo, apivote: vote, apistatement: statement, apiturnout: turnout }));
        };

        var resetSheet = function () {
            $("#" + sheetplaceholderId).html("");
        }

        resetSheet();

        //two ajax calls
        $.when($.ajax(url + 'A2/E12'), $.ajax(url + 'A15/B21'), $.ajax(url + 'A23/B26'))
            .then(function (data1, data2, data3) {
                var values = returnListObjects(data1[0].values);
                var vote = new Array();
                var statement = new Array();
                var turnout = new Array();
                $.each(values, function (index, item) {
                    if (values.length > 0 && values[index][0] !== "") {
                        vote.push({
                            party: values[index][0],
                            candidate: values[index][1],
                            votes: values[index][2],
                            percentage: values[index][3],
                            elected: values[index][4]
                        });
                    }
                });
                values = returnListObjects(data2[0].values);
                $.each(values, function (index, item) {
                    if (values.length > 0 && values[index][0] !== "") {
                        var stmt = (values[index].length > 1) ? values[index][0] + ' - ' + values[index][1] : values[index][0];
                        statement.push({ paragraph: stmt });
                    }
                });
                values = returnListObjects(data3[0].values);
                $.each(values, function (index, item) {
                    if (values.length > 0 && values[index][0] !== "") {
                        var stmt = (values[index].length > 1) ? values[index][0] + ' - ' + values[index][1] : values[index][0];
                        turnout.push({ paragraph: stmt });
                    }
                });

                vote.shift();

                populateSheet(_selectedSheet, vote, statement, turnout);

                //get chart services - draw histogram 

                var dt = new Array();
                var colors = new Array();
                var lbls = new Array();
                $.each(vote, function (key, value) {
                    dt.push(value.votes);
                    lbls.push(getShortName(value.candidate));
                    colors.push(getHexCode(value.party));
                   
                });

                _chartservices.init('responsive-canvas-' + _selectedSheet.sheetId, 1.5);
                _chartservices.barchart(lbls, 'bar',dt, colors);

                hideLoader();
            })
        .fail(function (err) {

        });

    };

    var getAnalysisSheet = function (sheet) {

        var url = window.commonservices.Config().googleSheetsUrl + 'datasheet/' + _sheetId + '/{0}/';
        var values = null;
        var results = new Array();

        _selectedSheet.sheetId = sheet.sheetId;
        _selectedSheet.sheetName = sheet.name;

        url = (url.replace("{0}", _selectedSheet.sheetName));
        url = url.replace(/ /g, '%20');

        $.when($.ajax(url + 'A1/B10'))
            .then(function (data1) {
                values = returnListObjects(data1.values);
                $.each(values, function (index, item) {
                    if (values.length > 0 && values[index][0] !== "") {
                        results.push({
                            party: values[index][0],
                            seats: values[index][1]
                        });
                    }
                });
                results.shift();
                populateTemplate(_sheets, results);

                //add graph
                var dt = new Array();
                var colors = new Array();
                var lbls = new Array();
                $.each(results, function (key, value) {
                    dt.push(value.seats);
                    lbls.push(value.party);
                    colors.push(getHexCode(value.party));
                });

                
                //if anlaysis is hidden we do not need to show this
                if (_showAnalysisSheet === true) {

                    _chartservices.init('responsive-canvas-analysis', 1.5);
                    _chartservices.barchart(lbls, 'horizontalBar',dt, colors);
                }


                hideLoader();
               
            })
            .fail(function (err) {
    
            });
    };

    var getHexCode = function (party ) {
        if (party !== null) {
            var pos = -1;
            var indexFound = -1;
            var key = party.substring(0, 2).toLowerCase();
            for (var i = 0; i < _hexCodes.length; i++) {
                pos = _hexCodes[i].key.indexOf(key);
                if (pos > -1) { indexFound = i; break; }
            }
            return (indexFound > -1) ? _hexCodes[indexFound].hexcolor : _hexCodes[_hexCodes.length - 1];
        }
    };


    electionservices.init = function (cs, hexCodes,sheetId, show) {
        console.log('-- election services initialisation --');

        _sheetId = sheetId;  
        _showAnalysisSheet = show;      
        _chartservices = cs;
        showLoader();
        resetTemplates();
        getAllSheets();

        _hexCodes = hexCodes
    };

    electionservices.getSheet = function (sheetId) {
        showLoader();
        getSheet(parseInt(sheetId))
    }

    electionservices.authRefresh = function () {
        window.location = window.location.href; 
    };


})(window.electionservices = window.electionservices || {}, jQuery);