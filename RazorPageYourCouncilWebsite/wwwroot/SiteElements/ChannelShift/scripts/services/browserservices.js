(function (ieBrowser, $, undefined) {

    var cookiename = "outdatedbrowser";
    var cookieValue = "set";

    function setCookie(cookieName, cookieValue, nDays) {
        var today = new Date();
        var expire = new Date();
        if (nDays === null || nDays === 0) { nDays = 1; }
        expire.setTime(today.getTime() + 3600000 * 24 * nDays);
        document.cookie = cookieName + "=" + window.escape(cookieValue) + ";expires=" + expire.toGMTString();
    }

    function readCookie(cookieName) {
        try {
            var theCookie = " " + document.cookie;
            var ind = theCookie.indexOf(" " + cookieName + "=");
            if (ind === -1) { ind = theCookie.indexOf(";" + cookieName + "="); }
            if (ind === -1 || cookieName === "") { return ""; }
            var ind1 = theCookie.indexOf(";", ind + 1);
            if (ind1 === -1) { ind1 = theCookie.length; }
            return window.unescape(theCookie.substring(ind+ cookieName.length + 2, ind1));
        }
        catch(e){
            return "error";
        } 
    }

    var is_IE_9_or_Less = false;

    var Browser = function() {
        var self = this;
        var nav = navigator.userAgent.toLowerCase();

        if (nav.indexOf('msie') !== -1) {
            self.ie = {

                version: parseInt(nav.split('msie')[1].trim().substr(0, 1))
            };
        }
    };

    var outdatedBrowser = function () {
        try {
            var clickBrowserSVG = function (objectId) {
                try {
                    var o = document.getElementById(objectId);
                    o.addEventListener("load", function () {
                        o.style = "cursor:pointer;";
                        var svgRoot = o.contentDocument;
                        svgRoot.onclick = function (evt) {
                            $("#outdated-browser").css('display', 'none');
                            setCookie(cookiename, cookieValue, 240);
                            evt.preventDefault();
                        };
                    }, false);
                } catch (e) { }
            };
            clickBrowserSVG('close-button-svg');
            if (Browser !== null && Browser.ie.version < 9) {
                var temp = readCookie(cookiename);
                if (temp !== cookieValue){
                    clickBrowserSVG('close-button-svg');
                    $("#outdated-browser").css('display', 'block');
                }
            }
        }
        catch (e) { }
    };

    var addPlaceHolders = function () {
        if (Browser.ie && Browser.ie.version < 10) {
            console.log('IE ' + Browser.ie + " version " + Browser.ie.version);
            is_IE_9_or_Less = true;
        }

        if (is_IE_9_or_Less) {
            console.log('replace place holders');
            $('input[placeholder]').each(function () {

                var input = $(this);
                $(input).val(input.attr('placeholder'));
                $(input).focus(function () {
                    if (input.val() === input.attr('placeholder')) {
                        input.val('');
                    }
                });
                $(input).blur(function () {
                    if (input.val() === '' || input.val() === input.attr('placeholder')) {
                        input.val(input.attr('placeholder'));
                    }
                });
            });
        }
    };

    ieBrowser.init = function () {
        addPlaceHolders();
        outdatedBrowser();
    };

})(window.ieBrowser = window.ieBrowser || {}, jQuery);