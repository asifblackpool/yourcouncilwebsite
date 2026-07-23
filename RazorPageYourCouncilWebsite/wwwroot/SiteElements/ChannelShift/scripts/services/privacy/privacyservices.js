"use strict";
(function (privacyservices, $, undefined) {

    var _baseUrl = "";
    var _foundValue = null;
    var _containerSelector = "";

    // Private functions
    function createcontainer() {
        var containerId = _containerSelector;

        // 1. Check if container already exists
        if (document.getElementById(containerId)) {
            return; // already exists, do nothing
        }

        // 2. Find the first h2 with class "privacy-header"
        var firstHeader = document.querySelector("h2.privacy-header");
        if (!firstHeader) {
            console.warn("No <h2 class='privacy-header'> found in the DOM.");
            return;
        }

        // 3. Create the new div
        var div = document.createElement("div");
        div.id = containerId;

        // 4. Insert before the first header
        firstHeader.parentNode.insertBefore(div, firstHeader);
    }

    //private: build labels
    var getlabels = function (Ids) {

        var callLabels = function () {
            return $.ajax({
                url: _baseUrl + '/custom/api/contenttype/privacynoticenew/section',
                dataType: 'json',
                type: 'GET'
            });
        };

        callLabels()
            .done(function (data) {
                var json = data;
                var json = data.validations.allowedValues.labeledValues;

                var labels = json.map(function (item) {
                    var temp = item;
                    return item.label["en-GB"];
                });

                for (var i = 0; i < Ids.length; i++) {

                    var found = json.find(function (item) {
                        return item.label["en-GB"] === Ids[i];
                    });

                    _foundValue = found ? found.label["en-GB"] : null;
                    $('#privacy-title-' + Ids[i]).text(_foundValue)
                }

            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.error('Failed to fetch labels:', textStatus, errorThrown);
            });
    };

    //private: build the UL element
    var buildlistelement = function () {
        var headers = document.querySelectorAll('h2.privacy-header a');
        var ul = document.createElement('ul');

        headers.forEach(function (link) {
            var id = link.id;
            var text = link.textContent;

            if (id && text) {
                var li = document.createElement('li');
                var a = document.createElement('a');
                a.href = '#' + id;
                a.textContent = text;
                li.appendChild(a);
                ul.appendChild(li);
            }
        });

        return ul;
    };

    //private: build the UL as HTML string
    var buildlisthtml = function () {
        var headers = document.querySelectorAll('h2.privacy-header a');
        var html = '<ul>';

        headers.forEach(function (link) {
            var id = link.id;
            var text = link.textContent;

            if (id && text) {
                html += '<li><a href="#' + id + '">' + text + '</a></li>';
            }
        });

        html += '</ul>';
        return html;
    };

    // Public method to initialize service
    privacyservices.init = function (baseUrl, containerSelector) {
        _baseUrl = baseUrl;
        _containerSelector = containerSelector;
        createcontainer();
    };

    privacyservices.rendertitles = function () {
        var Ids = [];
        getlabels(Ids);
    };

    // Public: render list inside configured container
    privacyservices.renderlist = function () {
        var html = buildlisthtml();

        if (_containerSelector) {
            $('#' + _containerSelector).html(html);
        }

        return html; // return string as well
    };

    // Public: get the list as HTML string without rendering
    privacyservices.getlisthtml = function () {
        return buildlisthtml();
    };

    // Public: get the list as a DOM element
    privacyservices.getlistelement = function () {
        return buildlisthtml();
    };


})(window.privacyservices = window.privacyservices || {}, jQuery);