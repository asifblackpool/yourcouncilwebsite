(function (votingservices, $, undefined) {

    var ddl_templateId              = "polling-template";
    var content_placeholder         = "polling-placeholder";
    var street_templateId           = "polling-address-template";
    var street_content_placeholder  = "polling-station-address";

    var getVotingByArea = function (postcode,callback) {

        var timeout = null;
        var pollingApiUrl = window.commonservices.Config().pollingStationUrl + 'properties?postcode=' + postcode;

        var populateTemplate = function (propertyList) {

            var pollingTemplate = Handlebars.compile($("#" + ddl_templateId).html());
            var data = (propertyList !== null) ? propertyList : [];
            $("." + content_placeholder).html(pollingTemplate({ apiproperties: data }));
            bindChangeEvent();
        };

        resetTemplates();
        function ajaxCall() {
            $.when($.ajax(pollingApiUrl))
               .done(function (data) {
                   if (data !== null) {
                       populateTemplate($.parseJSON(data));
                       callback(true);
                   }
                   else {
                       populateTemplate(null);
                       callback(false);
                   }
               }).fail(function () {
                   populateTemplate(null);
                   callback(false)
               });
        }

        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(ajaxCall, 3000);
    };

    var getPollingStationById = function (id) {

        var timeout = null;
        var pollingApiUrl = window.commonservices.Config().pollingStationUrl + 'PollingStation?id=' + id;

        var formatAddressObject = function (address) {

            var ps = [];

            var pollingStation = {
                name: '',
                address: ''
            };
            if (address !== null) {
                var formatedAddress = "";

                formatedAddress = (address.AddressLine1 !== null) ? address.AddressLine1 : "";
                formatedAddress = (address.AddressLine2 !== null) ? formatedAddress + ", " + address.AddressLine2 : formatedAddress;
                formatedAddress = (address.AddressLine3 !== null) ? formatedAddress + ", " + address.AddressLine3 : formatedAddress;
                formatedAddress = (address.AddressLine4 !== null) ? formatedAddress + ", " + address.AddressLine4 : formatedAddress;
                formatedAddress = (address.AddressLine5 !== null) ? formatedAddress + ", " + address.AddressLine5 : formatedAddress;
                formatedAddress = (address.AddressLine6 !== null) ? formatedAddress + ", " + address.AddressLine6 : formatedAddress;

                formatedAddress = (address.AddressLinePostCode !== null) ? formatedAddress + ", " + address.AddressLinePostCode : formatedAddress;

                formatedAddress = formatedAddress.replace(", , ,", ",");
                 formatedAddress = formatedAddress.replace(", ,", ",");

                pollingStation.address = formatedAddress;
                pollingStation.name = (address.AddressLine1 !== null) ? address.AddressLine1 : "";
                ps.push(pollingStation);
            }

            return ps;
        };

        function populateTemplate(address) {

            var pollingTemplate = Handlebars.compile($("#" + street_templateId).html());
            var data = (address !== null) ? address : [];
            $("." + street_content_placeholder).html(pollingTemplate({ apipolling: data }));
        }

        function ajaxCall() {
            $.when($.ajax(pollingApiUrl))
               .done(function (data) {
                   if (data !== null) {
                       populateTemplate(formatAddressObject($.parseJSON(data)));
                   }
                   else {
                       populateTemplate(null);
                   }
               }).fail(function () {
                   populateTemplate(null);
               });
        }

        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(ajaxCall, 500);
    };

    var resetTemplates = function () {
        if (window.commonservices.Config().includePollingStation) {
            $("." + street_content_placeholder).html("");
        }
    };

    var bindChangeEvent = function () {
        $("#streetDropDownList").show();
        $("#streetDropDownList").on("change", function (e) {
            resetTemplates();
            var id = parseInt(this.value);
            if (id > 0) {
                getPollingStationById(id);
            }
            e.preventDefault();
        });
    };

    votingservices.init = function (postcode, callback) {

        if (window.commonservices.Config().includePollingStation) {
            console.log('call voting init ' + postcode);
            getVotingByArea(postcode, callback);
        } else {
            $("#polling-panel").hide(); /* hide the panel completely */
        }
    };
})(window.votingservices = window.votingservices || {}, jQuery);
