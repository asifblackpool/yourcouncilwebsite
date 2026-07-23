
(function (cookieservices, $, undefined) {

function createCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    else var expires = "";
    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}

cookieservices.CreateCookie = function(n,v,d)
{
    createCookie(n,v,d);
};

cookieservices.ReadCookie = function(n) {
    return readCookie(n);
};

cookieservices.EraseCookie = function(n) {
    eraseCookie(n);
}

})(window.cookieservices = window.cookieservices || {}, jQuery);