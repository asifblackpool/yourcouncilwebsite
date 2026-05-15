"use strict";
(function (dateservices, $, undefined) {

    function hmsToSecondsOnly(str) {
        var p = str.split(':'),
            s = 0, m = 1;

        while (p.length > 0) {
            s += m * parseInt(p.pop(), 10);
            m *= 60;
        }
        return s;
    }

    function absVal(integer) {
        return integer < 0 ? -integer : integer;
    }

    var getTimeZoneOffSet = function () {
        var d = new Date();
        var n = d.getTimezoneOffset();
        return ((n % 60) === 0) ? (n / 60) : 0;

    };

    var convertSqlDate = function (_date, character, addTime) {
        var sqlsplitter     = _date.split('T');
        var datesplitter    = (sqlsplitter[0]).split('-');
        var timesplitter    = (sqlsplitter[1]).split(':');
        var year            = parseInt(datesplitter[0]);
        var month           = parseInt(datesplitter[1]) - 1;
        var day             = parseInt(datesplitter[2]);

        if (addTime) {
            var hour = timesplitter[0];
            var min = timesplitter[1];
            var sec = timesplitter[2];
            return new Date(year, month, day, hour, min, sec);
        }
      
        return new Date(year, month, day);
         
    };

    var convertStringDate = function (_date) {

        var sqlsplitter = _date.split(' ');
        var datesplitter = (sqlsplitter[0]).split('-');
        var timesplitter = (sqlsplitter[1]).split(':');
        var day = parseInt(datesplitter[0]);
        var month = parseInt(datesplitter[1]) - 1;
        var year = parseInt(datesplitter[2]);
        var hour = parseInt(timesplitter[0]);
        var min = parseInt(timesplitter[1]);
        var sec = parseInt(timesplitter[2]);

        var offsetHour = getTimeZoneOffSet();
        hour = (offsetHour < 0) ? hour + parseInt(absVal(offsetHour)) : hour;
        hour = (offsetHour > 0) ? hour + parseInt(absVal(offsetHour)) : hour;

        return new Date(year, month, day, hour, min, sec);
    };

    var stringToDate = function (_date, _format, _delimiter) {
        var formatLowerCase = _format.toLowerCase();
        var formatItems = formatLowerCase.split(_delimiter);
        var dateItems = _date.split(_delimiter);
        var monthIndex = formatItems.indexOf("mm");
        var dayIndex = formatItems.indexOf("dd");
        var yearIndex = formatItems.indexOf("yyyy");
        var month = parseInt(dateItems[monthIndex]);
        var year = parseInt(dateItems[yearIndex]);
        var day = parseInt(dateItems[dayIndex]);
       
        month -= 1;
        var formatedDate = new Date(year, month, day);
        return formatedDate;
    };

    var displayDate = function (_date, format) {

        var day = _date.getDate();
        var month = _date.getMonth() + 1;
        var year = _date.getFullYear();

        if (day < 10) {
            day = "0" + day;
        }

        if (month < 10) {
            month = "0" + eval(month);
        }

        format = format.replace("yyyy", year).replace("dd", day).replace("mm", month);

        return format;
    };

    /* return the Full Day Monday, Tuesday, etc ... */
    var getDay = function (d) {
        var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        console.log('getDay() -> ' + days);
        return days[d];
    };

    /*return the Months full name example: January */
    var getMonth = function (m) {
        var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return months[m];
    };

    var getShortMonth = function (m) {
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
        return months[m];
    };

    var getShortDay = function (d) {
        var days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
        console.log('getDay() -> ' + days);
        return days[d];
    };

    var nth = function (d) {
        if (d > 3 && d < 21) { return 'th'; /* thanks kennebec */ }
        switch (d % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    };

    var formatSeconds = function (totalSec) {

        var hours = parseInt(totalSec / 3600) % 24;
        var minutes = parseInt(totalSec / 60) % 60;
        var seconds = totalSec % 60;

        return (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
    };

    var LessThanToday = function (dateEntered) {

        var date    = dateEntered.substring(0, 2);
        var month   = dateEntered.substring(3, 5);
        var year    = dateEntered.substring(6, 10);

        var dateToCompare = new Date(year, month - 1, date);
        var currentDate = new Date();

        return dateToCompare <= currentDate
    };

    var GreaterThanToday = function (dateEntered) {

        var date = dateEntered.substring(0, 2);
        var month = dateEntered.substring(3, 5);
        var year = dateEntered.substring(6, 10);

        var dateToCompare = new Date(new Date(year, month - 1, date).setUTCHours(24, 0, 0, 0));
       
        var currentDate = new Date(new Date().setHours(0,0,0,0));

        return dateToCompare >= currentDate
    };

    var useDatewithNth = function (d,m,y) {
        const dt = new Date(y, m, d);
        return getDay(dt.getDay()) + ", " + d + nth(d) + " " + getMonth(m) + ", " + y;
    }

    var useShortDatewithNth = function (d, m, y) {
        const dt = new Date(y, m, d);
        return getShortDay(dt.getDay()) + " " + d + nth(d) + " " + getShortMonth(m) + " " + y;
    };

    var useShortDate = function (d, m, y) {
        const dt = new Date(y, m, d);
        return getShortDay(dt.getDay()) + " " + d + " " + getShortMonth(m) + " " + y;
    };

    /*public properties */
    dateservices.convertToDate = function (_date, f, _delimter) {
        return stringToDate(_date, f, _delimter);
    };

    dateservices.formatDate = function (d, m, y) {

        return getDay(dt.getDay()) + " " + d + " " + getMonth(m) + " " + y; 
    };

    dateservices.formatDateShort = function (d, m, y) {
        return getShortDay(dt.getDay()) + " " + d + " " + getShortMonth(m) + "  " + y;

    };

    dateservices.formatDateShort = function (d, m, y, usenth) {

        const dt = new Date(y, m, d);
        if (usenth) {
            return useShortDatewithNth(d, m, dt.getFullYear());
        }
        return useShortDate(d, my, y);

    };

    dateservices.formatDate = function (d, m, y, usenth) {

        const dt = new Date(y, m, d);
        if (usenth) {
            return useDatewithNth(d, m, dt.getFullYear());
        }
        return getDay(dt.getDay()) + " " + d + " " + getMonth(m) + " " + y; 
    };

    dateservices.DisplayDate = function (_date, format) {
        return displayDate(_date, format);
    };

    dateservices.convertSQLDate = function (_date, _delimiter) {
        return convertSqlDate(_date, _delimiter, true);
    };

    dateservices.convertSQLDateWithoutTime = function (_date, _delimiter) {
        return convertSqlDate(_date, _delimiter, false);
    }

    dateservices.convertStringDate = function (_date) {
        return convertStringDate(_date);
    };

    dateservices.convertStringDate = function (_date, _format, _delimiter) {
        return stringToDate(_date, _format, _delimiter);
    };

    dateservices.FormatSeconds = function (total) {
        return formatSeconds(total);
    };

    dateservices.ConverToSeconds = function (time) {
        return hmsToSecondsOnly(time);
    };

    dateservices.GetMonth = function (m) {
        return getMonth(m);
    };

    dateservices.GetDayofTheWeek = function (d) {
        return getDay(d);
    };


    dateservices.WithinDateRange = function (startdate, enddate) {
        var validStartDate = false;
        var validEndDate = false;
        if (startdate !== null) {
            validStartDate = LessThanToday(startdate);
        }
        if (enddate !== null) {
            validEndDate = GreaterThanToday(enddate);
        }

        return ((startdat) && (enddate));
    };

    dateservices.GreaterThanToday = function (date) {
        return GreaterThanToday(date);
    };

})(window.dateservices = window.dateservices || {}, jQuery);