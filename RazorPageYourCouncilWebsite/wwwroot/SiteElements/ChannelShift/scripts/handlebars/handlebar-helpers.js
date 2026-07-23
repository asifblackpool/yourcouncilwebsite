
// Register useful handlebar helpers

Handlebars.registerHelper('capitalize', function (str) {
    // str is the argument passed to the helper when called
    str = str || '';
    return str.slice(0, 1).toUpperCase() + str.slice(1);
});

Handlebars.registerHelper('concat', function (str1, str2) {
    return str1 + str2;
});

Handlebars.registerHelper("foreach", function (arr, options) {

    if (arr === null) {
        return null;
    }

    if (options.inverse && !arr.length)
        return options.inverse(this);

    return arr.map(function (item, index) {
        item.$index = index;
        item.$first = index === 0;
        item.$last = index === arr.length - 1;
        return options.fn(item);
    }).join('');
});

Handlebars.registerHelper("getPropertyValueField", function (arr, label, labelValue, getKeyValue, options) {

    var obj = null;

    if (arr && arr.length > 0) {
        for (var i = 0, j = arr.length; i < j; i++) {
            var temp = (arr[i])[label];
            var value = (arr[i])[getKeyValue];
            if (temp === labelValue) {
                return (value !== null) ? value : "";
            }
        }
    }
    return "";
});

Handlebars.registerHelper('link', function (text, url, options) {
    var attrs = [];

    for (var prop in options.hash) {
        attrs.push(
            Handlebars.escapeExpression(prop) + '="'
            + Handlebars.escapeExpression(options.hash[prop]) + '"');
    }

    if (url === null) {
        return "";
    }

    return new Handlebars.SafeString(
        "<a href='" + Handlebars.escapeExpression(url) + "'" + attrs.join(" ") + ">" + Handlebars.escapeExpression(text) + "</a>"
    );
});

Handlebars.registerHelper('emaillink', function (text, email, options) {
    var attrs = [];

    for (var prop in options.hash) {
        attrs.push(
            Handlebars.escapeExpression(prop) + '="'
            + Handlebars.escapeExpression(options.hash[prop]) + '"');
    }

    if (email == null)
        return "";

    return new Handlebars.SafeString(
        "<a href='mailto:" + Handlebars.escapeExpression(email) + "'" + attrs.join(" ") + ">" + Handlebars.escapeExpression(text) + "</a>"
    );
});

Handlebars.registerHelper('attr', function (name, data) {
    if (typeof target === 'undefined') target = "";

    var result = ' ' + name + '="' + data + '" ';

    return new Handlebars.SafeString(result);
});

Handlebars.registerHelper('mailto', function (str) {
    str = str || '';
    return "mail" + "to:" + str
});

Handlebars.registerHelper('slugify', function (str) {
    return str.toString().trim().toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
});

Handlebars.registerHelper('greaterthanzero', function (val, options) {
    var fnTrue = options.fn, fnFalse = options.inverse;
    return val > 0 ? fnTrue() : fnFalse();
});

Handlebars.registerHelper('greaterthanlimit', function (val, limit, options) {
    var fnTrue = options.fn, fnFalse = options.inverse;
    return val > limit ? fnTrue() : fnFalse();
});

Handlebars.registerHelper('lessthanlimit', function (val, limit, options) {
    var fnTrue = options.fn, fnFalse = options.inverse;
    return val < limit ? fnTrue() : fnFalse();
});

Handlebars.registerHelper('checkIf', function (v1, o1, v2, mainOperator, v3, o2, v4, options) {
    var operators = {
        '==': function (a, b) { return a == b },
        '===': function (a, b) { return a === b },
        '!=': function (a, b) { return a != b },
        '!==': function (a, b) { return a !== b },
        '<': function (a, b) { return a < b },
        '<=': function (a, b) { return a <= b },
        '>': function (a, b) { return a > b },
        '>=': function (a, b) { return a >= b },
        '&&': function (a, b) { return a && b },
        '||': function (a, b) { return a || b },
    }
    var a1 = operators[o1](v1, v2);
    var a2 = operators[o2](v3, v4);
    var isTrue = operators[mainOperator](a1, a2);
    return isTrue ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper("compareshort", function (v1, op, v2, options) {

    var c = {
        "eq": function (v1, v2) { return v1 == v2; },
        "neq": function (v1, v2) { return v1 != v2; }
    }
    if (Object.prototype.hasOwnProperty.call(c, op)) {
        return c[op].call(this, v1, v2) ? options.fn(this) : options.inverse(this);
    }
    return options.inverse(this);
});

Handlebars.registerHelper('compare', function (lvalue, operator, rvalue, options) {

    var operators, result;

    if (arguments.length < 3) {
        throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
    }

    if (options === undefined) {
        options = rvalue;
        rvalue = operator;
        operator = "===";
    }

    operators = {
        '==': function (l, r) { return l == r; },
        '===': function (l, r) { return l === r; },
        '!=': function (l, r) { return l != r; },
        '!==': function (l, r) { return l !== r; },
        '<': function (l, r) { return l < r; },
        '>': function (l, r) { return l > r; },
        '<=': function (l, r) { return l <= r; },
        '>=': function (l, r) { return l >= r; },
        'typeof': function (l, r) { return typeof l == r; }
    };

    //remove whitespace
    operator = operator.trim();

    if (!operators[operator]) {
        throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
    }

    result = operators[operator](lvalue, rvalue);

    if (result) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }

});

Handlebars.registerHelper("math", function (lvalue, operator, rvalue, options) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);

    return {
        "+": lvalue + rvalue
    }[operator];
});

Handlebars.registerHelper("getObjectPropertyValue", function (val) {
    if (val === undefined || val === null || val === "") {
        return "null";
    }

    return val;
});

Handlebars.registerHelper('array_item', function (array, index, options) {

    if (array === undefined) { }
    else {
        return options.fn(array[index]);
    }
});

Handlebars.registerHelper('select', function (value, options) {
    return options.fn()
        .split('\n')
        .map(function (v) {
            var t = 'value="' + value + '"';
            return RegExp(t).test(v) ? v.replace(t, t + ' selected="selected"') : v;
        })
        .join('\n');
});

Handlebars.registerHelper('dotdotdot', function (str, len) {
    try {
        if (str.length > len)
            return str.substring(0, len) + '...';
        return str;
    } catch (e) { return ""; }
});

Handlebars.registerHelper('outputEmpty', function (str, comparer) {
    try {
        if (str.length > 0)
            return (str === comparer) ? "" : str;
    } catch (e) { return str; }
});

//if you want to test for if a radio button should be checked
Handlebars.registerHelper("setRadio", function (value, currentValue) {
    if (value == currentValue) {
        return "checked"
    } else {
        return "";
    }
});

Handlebars.registerHelper('times', function (n, block) {
    var accum = '';
    for (var i = 0; i < n; ++i)
        accum += block.fn(i);
    return accum;
});

Handlebars.registerHelper("debug", function (optionalValue) {
    console.log("Current Context");
    console.log("====================");
    console.log(this);

    if (optionalValue) {
        console.log("Value");
        console.log("====================");
        console.log(optionalValue);
    }
});

Handlebars.registerHelper('getLibraryName', function (Id) {
    var obj = window.commonlibraryservices.getLibraryName(Id, 'key');
    return (obj !== null) ? obj.value : Id;
});

Handlebars.registerHelper('buildLibrarySrc', function (isbn) {
    var url = "https:" + "//www.syndetics.com/index.aspx?type=xw12&upc=&oclc=&isbn={0}/MC.GIF";
    var noImageUrl = '/siteElements/channelshift/content/images/library/no-image.png';

    try {
        url = url.replace('{0}', isbn);
        if (isbn.length < 1) {
            url = noImageUrl;
        }

        return url

    } catch (e)
    {
        return noImageUrl;
    }
 
});

Handlebars.registerHelper('selectIsbn', function (isbn13, isbn10) {

    if (isbn13 !== null && isbn13.length > 0) { return isbn13; }
    if (isbn10 !== null && isbn10.length > 0) { return isbn10; }

    return "";

});

Handlebars.registerHelper('moneyFormat', function (value, character) {
    var money = null;
    var strFormat = "{0}.{1}"
    var valueToReturn = null;
    if (value !== null) {

        money = (value.toString()).split(character);
        strFormat = (money.length > 0) ? strFormat.replace('{0}', money[0]) : strFormat.replace('{0}', '0');
        if (money !== null && money.length > 1) {
            strFormat = (money[1].length > 1) ? strFormat.replace('{1}', money[1]) : strFormat.replace('{1}', money[1] + '0');
        }
        else {
            strFormat = strFormat.replace('{1}', '00');
        }


        // strFormat = (money.length > 1 && money[1].len < 2) ? strFormat.replace('{2}', '') : strFormat.replace('{2}', '0');
        return strFormat;
    }

    return value;
});

Handlebars.registerHelper('paidFor', function (value, character) {
    var money = null;
    var strFormat = "{0}.{1}"
    var valueToReturn = null;
    if (value !== null && value === 0) {
        return "(<span><strong>Paid</strong></span>)"
    }

    valueToReturn = "(<span><strong>Outstanding {0}</strong></span>".replace('{0}', Handlebars.helpers.dateToUkFormat(value, '.'));
    return valueToReturn
});

Handlebars.registerHelper('itemsOverdue', function (items) {

    var total = 0;
    if (items !== null) {
        for (var i = 0; i < items.length; i++) {
            try {
                if (items[i].overdueField) {
                    total++;
                }
            } catch (e) { }
        }
    }
    return total
});

Handlebars.registerHelper('pickuplocationView', function (items) {

    var view = 'radio'
    if (items !== null) {
        view = (items.length > 1) ? 'dropdown' : view;
    }
    return view;
});

Handlebars.registerHelper('pickupItemsTotal', function (items, character) {

    var total = 0;
    if (items !== null) {
        for (var i = 0; i < items.length; i++) {
            try {
                if (items[i].availableField !== undefined && items[i].availableField === true) {
                    total++;
                }
            } catch (e) { }
        }
    }
    return total
});

Handlebars.registerHelper('dateToUkFormatWithReplace', function (dt, character, replacechar) {
    var temp = Handlebars.helpers.dateToUkStandardFormat(dt, character, 'month_desc');
    return temp = temp.split(replacechar).join(' ');
});

Handlebars.registerHelper('dateToUkFormat', function (dt, character) {
    return Handlebars.helpers.dateToUkStandardFormat(dt, character, 'month_desc')
});

Handlebars.registerHelper('dateToUkStandardFormat', function (dt, character, mode) {
    var dateFormat = "{0}-{1}-{2}";
    if (dt !== null && dt.length > 9) {
        var returndate = dateservices.convertSQLDateWithoutTime(dt, character);
        var month = null;
        var day = returndate.getDate();

        if (mode === 'month_desc') {
            month = dateservices.GetMonth(returndate.getMonth());
        }
        else {
            month = returndate.getMonth() + 1;
            month = (month > 9) ? month : "0" + month;
        }

        var year = returndate.getFullYear();
        dateFormat = dateFormat.replace('{0}', (day > 9) ? day : "0" + day);
        dateFormat = dateFormat.replace('{1}', month);
        dateFormat = dateFormat.replace('{2}', year);
        return dateFormat;
    }
    return dt;
});

Handlebars.registerHelper('sqldateToUkFormatWithTime', function (dt, character) {

    var dateFormat = "{0} {1} {2} {3} {4}.{5} {6}";

    var returndate = null;
    if (dt !== null) {
        dt = dt.replace('Z', '');

        returndate = dateservices.convertSQLDate(dt, character);
        var dayofTheWk = dateservices.GetDayofTheWeek(returndate.getDay());
        var day = returndate.getDate();
        var month = dateservices.GetMonth(returndate.getMonth());
        var year = returndate.getFullYear();
        var hour = returndate.getHours();
        var min = returndate.getMinutes();
        dateFormat = dateFormat.replace('{0}', dayofTheWk);
        dateFormat = dateFormat.replace('{1}', (day > 9) ? day : "0" + day);
        dateFormat = dateFormat.replace('{2}', month);
        dateFormat = dateFormat.replace('{3}', year);
        dateFormat = dateFormat.replace('{4}', (hour < 9) ? "0" + hour : ((hour > 12) ? hour - 12 : hour));
        dateFormat = dateFormat.replace('{5}', (min < 9) ? "0" + min : min);
        dateFormat = dateFormat.replace('{6}', (hour <= 11) ? "am" : "pm");


    }

    return (returndate !== null) ? dateFormat : "";
});

Handlebars.registerHelper('sqldateToUkFormat', function (dt, character) {

    var dateFormat = "{0} {1} {2} {3}";

    var returndate = null;
    if (dt !== null) {
        dt = dt.replace('Z', '');

        returndate = dateservices.convertSQLDateWithoutTime(dt, character);
        var dayofTheWk = dateservices.GetDayofTheWeek(returndate.getDay());
        var day = returndate.getDate();
        var month = dateservices.GetMonth(returndate.getMonth());
        var year = returndate.getFullYear();
        dateFormat = dateFormat.replace('{0}', dayofTheWk);
        dateFormat = dateFormat.replace('{1}', (day > 9) ? day : "0" + day);
        dateFormat = dateFormat.replace('{2}', month);
        dateFormat = dateFormat.replace('{3}', year);
    }

    return (returndate !== null) ? dateFormat : "";
});

Handlebars.registerHelper('checkTodaysDate', function (startdate, enddate) {

    if ((startdate === undefined) || (enddate === undefined)) { return false; }
    var sd = dateservices.convertStringDate(startdate, "yyyy-mm-dd", "-");
    var ed = dateservices.convertStringDate(enddate, "yyyy-mm-dd", "-");
    var currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    return (sd <= currentDate && ed >= currentDate) ? true : false;

});

Handlebars.registerHelper('checkDateDifference', function (startdate, enddate) {

    if ((startdate === undefined) || (enddate === undefined)) { return false; }
    var sd = dateservices.convertStringDate(startdate, "yyyy-mm-dd", "-");
    var ed = dateservices.convertStringDate(enddate, "yyyy-mm-dd", "-");

    var toreturn = "{0} - {1}";

    if (sd < ed) {
        toreturn = "{0} - {1}";
        toreturn = toreturn.replace("{0}", Handlebars.helpers.sqldateToUkFormatWithTime(startdate, 'T'));
        toreturn = toreturn.replace("{1}", Handlebars.helpers.sqldateToUkFormatWithTime(enddate, 'T'));

        return toreturn;
    }
    else {
        toreturn = "{0}";
        toreturn = toreturn.replace("{0}", Handlebars.helpers.sqldateToUkFormatWithTime(startdate, 'T'));
        return toreturn;
    }

});

Handlebars.registerHelper('checkSuspended', function (startdate, enddate, options) {
    var fnTrue = options.fn, fnFalse = options.inverse;
    return Handlebars.helpers.checkTodaysDate(startdate, enddate) ? fnTrue() : fnFalse();

});

Handlebars.registerHelper('holdItemStatus', function (available, startdate, enddate, options) {

    var fnTrue = options.fn, fnFalse = options.inverse;
    if (available === undefined) {
        return fnFalse();
    }
    return (available) ? ((Handlebars.helpers.checkSuspended(startdate, enddate, options)) ? fnTrue() : fnFalse()) : fnFalse();
});

Handlebars.registerHelper('itemStatus', function (callInfo) {
    try {
        if (callInfo !== null) {
            return (callInfo.itemInfoField[0].dueDateFieldSpecified)
              ? "Due " + Handlebars.helpers.dateToUkStandardFormat(callInfo.itemInfoField[0].dueDateField, 'T')
              : callInfo.itemInfoField[0].currentLocationIDField;
        }

        return "";
    }
    catch (e) {
        return "Standard shelving location";
    }

});

Handlebars.registerHelper('holdItemStatusText', function (available, startdate, enddate) {

    if (available === undefined) { return "Pending"; }

    if (available) {
        ukformatdate = Handlebars.helpers.dateToUkFormat(enddate, '-');
        return Handlebars.helpers.checkTodaysDate(startdate, enddate) ? "Ready to pick up by " + ukformatdate : "Not available"
    }

    return "Not available";

});

Handlebars.registerHelper('hasAccess', function (val, options) {
    var fnTrue = options.fn, fnFalse = options.inverse;
    return val > 5 ? fnTrue() : fnFalse();
});

Handlebars.registerHelper("biblographySearch", function (arr, searchText, addtitle) {

    var obj = null;
    var textFound = false;
    var title = "<strong>{0}</strong>";
    var text = "";

    title = (addtitle) ? title.replace("{0}", searchText) : "";
    if (arr && arr.length > 0) {
        for (var i = 0, j = arr.length; i < j; i++) {
            var temp = arr[i].labelField;
            if (temp === searchText) {
                textFound = true;
                text = text + "<p style='margin:0px;'>" + arr[i].textField + "</p>";
            }
        }
    }
    return (textFound) ? ("<br/>" + title + text) : "";
});

Handlebars.registerHelper("biblographySearchLimit", function (arr, searchText, count) {

    var text = Handlebars.helpers.biblographySearch(arr, searchText, false);
    return Handlebars.helpers.dotdotdot(text, count);
});

//# sourceURL=handlebar-helpers.js


