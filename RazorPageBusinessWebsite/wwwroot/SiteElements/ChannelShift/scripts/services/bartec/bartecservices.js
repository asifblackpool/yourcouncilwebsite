"use strict";
(function (bartecservices, $, undefined) {
    var _postcode = null;
    var _template = null;
    var _templateId = 'bartec-bin-collection-template';
    var _contentPlaceHolder = "bin-placeholder";
    var _templatedateId = 'bartec-bin-dates-template';
    var _contentDatePlaceHolder = "bartec-bin-date-placeholder";
    var addresses = null;
    var binCollectionDates = new Array();

    var showLoader = function () {
        $("#loading-indicator").show();
    };

    var hideLoader = function () {
        $("#loading-indicator").hide();
    };

    var populateTemplate = function (data) {
        $("." + _contentPlaceHolder).html(_template({ apidata: data }));
        hideLoader();
    };

    var populateDatesTemplate = function (data) {
        $("#" + _contentDatePlaceHolder).html(_template({ apidata: data }));
        hideLoader();
    };

    var clearDateTemplate = function () {
        $("#" + _contentDatePlaceHolder).html('');
        binCollectionDates = new Array();
    }

    var getTemplate = function () {
        return commonservices.returnHandlebarTemplate(Handlebars, _templateId);
    };

    var getDatesTemplate = function () {
        return commonservices.returnHandlebarTemplate(Handlebars, _templatedateId);
    };

    var binDescription = function (bartecdescription) {
        switch (bartecdescription) {
            case'Empty Dry Recycling 140L':
                return 'Blue Bin';
            case 'Empty Domestic Refuse 240L':
            case 'Empty Domestic Refuse 240 L':
                return 'Grey bin or Red sack';
            case'Empty Bin Green Waste 240L':
            case 'Empty Green Waste 240 L':
            case 'Empty Green Waste 240L':
                 return 'Green bin or Garden waste';
    
            case 'Empty Commercial Refuse':
                return 'Commercial Refuse'
            default:
                return bartecdescription;
        }
    };

    var formatAddress = function (address) {

        var addrs = '';

        var found = false;
        if (address.address1Field !== '') {
            addrs = addrs + address.address1Field; found = true;
        }
        if (address.address2Field !== '') {
            addrs = addrs + ((found) ? ', ' : '') + address.address2Field; found = true;
        }
        if (address.streetField !== '') {
            addrs = addrs + ((found) ? ', ' : '') + address.streetField; found = true;
        }
        if (address.townField !== '') {
            // addrs = addrs + ((found) ? ', ' : '') + address.townField; found = true;
        }
        return addrs
    };

    var firstLineAddress = function (address) {

        if (address.address1Field !== '') {
            return address.address1Field; 
        }
        if (address.address2Field !== '') {
            return address.address2Field; 
        }
        if (address.streetField !== '') {
            return addresses.streetField;
        }

         return "not found";
    
    };


    var getPremises = function (address) {
        var data = address;
        //url: 'api/bartec/collection/PremisesById',
        $.ajax({
            url: window.commonservices.Config().bartecUrl + 'collection/Premises',
            type: "POST",
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify(data),

            success: function (result) {
                var premises = (result !== null) ? result.premisesField : new Array();
                addresses = new Array();
                $.each(premises, function (index, item) {
                    //console.log('uprn ' + item.uPRNField, formatAddress(item.addressField));
                    addresses.push({ uprn: item.uPRNField, addressNumber: firstLineAddress(item.addressField), addressLine: formatAddress(item.addressField) })
                });
                _template = getTemplate();
             
                addresses.sort(
                    function (a, b) {
                        if (isNaN(a.addressNumber) && isNaN(b.addressNumber)) return a.addressNumber < b.addressNumber ? -1 : a.addressNumber == b.addressNumber ? 0 : 1;//both are string
                        else if (isNaN(a.addressNumber)) return 1;//only a is a string
                        else if (isNaN(b.addressNumber)) return -1;//only b is a string
                        else return a.addressNumber - b.addressNumber;//both are num
                    }
                );
                populateTemplate(addresses);
                getJobs(data);

            },
            error: function (error) {

            }
        });

        var getJobs = function (data) {
            $("#bartec-ddl").on("change", function () {
                clearDateTemplate();
                showLoader();
                data.UPRN = $(this).val();
                _template = getDatesTemplate();
                $.ajax({
                    url: window.commonservices.Config().bartecUrl + 'collection/PremiseJobs',
                    type: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    data: JSON.stringify(data),

                    success: function (result) {
                        var jobs = (result !== null) ? result.jobsField : new Array();

                        if (jobs !== null) {
                            $.each(jobs, function (index, item) {
                                var dt = dateservices.convertSQLDateWithoutTime(item.jobField.scheduledStartField, '-');
                                var day = dateservices.GetDayofTheWeek(dt.getDay());
                                var mt = dateservices.GetMonth(dt.getMonth());
                                var monthNumber = dt.getDate();
                                var fulldate = day + ' ' + dt.getDate() + ' ' + mt + ' ' + dt.getFullYear();
                                var bd = binDescription(item.jobField.nameField);
                                var dontAdd = (bd === 'Green bin/Garden waste' && monthNumber < 18) ? true : false;

                                if (bd !== '' && dontAdd !== true) {
                                  
                                    binCollectionDates.push({ sqldate: dt, date: fulldate, description: bd });
                                }
                     
                            });

                            //sort ascending dates
                            binCollectionDates.sort(function (a, b) {
                                return new Date(a.sqldate) - new Date(b.sqldate)
                            });
                            populateDatesTemplate(binCollectionDates);
                        }
                        else {
                            populateDatesTemplate(null);
                        }
                      


                    },
                    error: function (error) {

                    }
                });

            });
        };

    };

    var getToken = function (callback) {

        var user = { UserId: '', Token: '' };
        var addressUser = { UPRN: '100010804381', USRN: '', PostCode: '', StreetNumber: '', CurrentUser: null }

        $.when($.ajax(window.commonservices.Config().bartecUrl + 'security/token'))
            .done(function (data) {
                if (data !== null) {
                    user.Token = data;
                    addressUser.CurrentUser = user;
                    addressUser.PostCode = _postcode,
                        callback(addressUser);
                }

            }).fail(function () {

            });
    };

    bartecservices.init = function (postcode) {
        showLoader();
        _postcode = postcode;
        getToken(getPremises);
    };

})(window.bartecservices = window.accordionservices || {}, jQuery);