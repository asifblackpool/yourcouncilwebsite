var utilities = (function ($) {
    var module = {
        dropdown: {},
        unorderdList: {},
        helper: {}
    };

    module.dropdown.appendOptions = function (Id, list) {
        var selectorTag = $('#' + Id);
        selectorTag.append($(new Option('-- Please Select --', '0')));
        $.each(list, function (index, item) {
            selectorTag.append($(new Option(item.Text, item.Value)));
        });
    };

    module.dropdown.removeAllOptions = function (Id) { $('#' + Id).empty(); };

    module.unorderdList.appendList = function (Id, list) {
        $.each(list, function (i, item) {
            $('#' + Id).append("<li>" + item.Text + "</li>");
        });
    };

    module.splitString = function (str, i) {
        try {
            var mySplitResult = str.split(",");
            return mySplitResult.length > i ? mySplitResult[i] : str;
        }
        catch (e) { alert("module.splitString() => error: " + e.message); }
    };

    module.validateUKPostCode = function (postcode) {

        if (postcode !== '' && postcode.length > 2) {
            var shortPostCode = (postcode.substring(0, 2)).toUpperCase();
            var validPostCode = /^(FY)/;
            if (!shortPostCode.match(validPostCode)) {
                return "Post code must start with FY.";
            }
        }
        else {
            return "Please provide a valid Blackpool post code.";
        }

        postcode = postcode.replace(/\s/g, "");
        var regex = /[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}/gi;
        var isValid = regex.test(postcode);

        if (!isValid) {
            return "You have entered an invalid post code for Blackpool.";
        }

        return "";
    };

    module.validateEmailAddress = function (email) {

        var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

        if (!filter.test(email)) {
            return "Please provide a valid email address.";
        }

        return "";
    };

    module.validateDate = function (dateString) {

        var isValid = false;
        var regex = /(((0|1)[0-9]|2[0-9]|3[0-1])\/(0[1-9]|1[0-2])\/((19|20)\d\d))$/;
        if (regex.test(dateString)) {
            var parts = dateString.split("/");
            var dt = new Date(parts[1] + "/" + parts[0] + "/" + parts[2]);
            isValid = (dt.getDate() == parts[0] && dt.getMonth() + 1 == parts[1] && dt.getFullYear() == parts[2]);
        }
        return isValid;
    };

    module.searchQuery = function (querytext) {
        var text = querytext.trim();
        if (text !== "") {
            document.location.href = "/Search-Results.aspx?search_keywords=" + encodeURIComponent(text);
        }
    };

    module.ajaxRequest = function () {
        var activexmodes = ["Msxml2.XMLHTTP", "Microsoft.XMLHTTP"];
        if (window.ActiveXObject) {
            for (var i = 0; i < activexmodes.length; i++) {
                try {
                    return new window.ActiveXObject(activexmodes[i]);
                }
                catch (e) { }
            }
        }
        else if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        }
        else { return null; }
    };

    module.helper.sortObjArray = function (arr, field) {
        arr.sort(
            function compare(a, b) {
                if (a[field] < b[field]) {
                    return -1;
                }
                if (a[field] > b[field]) {
                    return 1;
                }
                return 0;
            }
        );
    };

    module.helper.removeDuplicatesFromObjArray = function (arr, field) {
        var u = [];
        arr.reduce(function (a, b) {
            if (a[field] !== b[field]) { u.push(b); return b; }
        }, []);
        return u;
    };

    module.helper.cleaner = function() {
        function cleaner(el) {
          if (el.innerHTML === '&nbsp;' || el.innerHTML === '') {
            el.parentNode.removeChild(el);
          }
        }

        const elements = document.querySelectorAll('h1, h2, h3, h4');
        elements.forEach(cleaner);
    };


    module.helper.setEqualHeight = function (leftId, rightId) {
            var height = Math.max($("#" + leftId).height(), $("#" + rightId).height());
            $("#" + leftId).height(height);
            $("#" + rightId).height(height);
       
    };

    module.helper.getQueryString = function (key) {
        var vars = [], hash;

        function arrayHasKey(arr, key) {
            for (const val of arr) {
                if (key === val) {
                    return true;
                }
            }
            return false;
        }

        try {
            var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
            for (var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                vars[hash[0]] = hash[1];
            }
            if (vars.length > 0) {
                console.log("vars key is " + vars[key]);
                return (arrayHasKey(vars, key)) ? vars[key] : null;
            }
            return null;
        }
        catch {
            return null;
        }
    };

    module.helper.getPageName = function() {
        
            // Get the full URL path
            const path = window.location.pathname;

            // Split by slashes and get the last part
            const parts = path.split('/');
            let pageName = parts[parts.length - 1];

            // Remove query string if present
            pageName = pageName.split('?')[0];

            // Remove hash fragment if present
            pageName = pageName.split('#')[0];

            // Return the page name or empty string if none found
            return pageName || '';
    };

    return module;
})(jQuery);