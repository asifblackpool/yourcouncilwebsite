(function (sunbedservices, $, undefined) {

    var _height = 600;
    var sunbed_view = {
        menu: false
    };
    var sidr = null;

    var sidrSetup = function () {

        var isClosed = false;

        var open = function () {
            sunbed_view.menu = true;
            reset_menu();
            $(".sidr").height(_height);
            $("#menu-anchor-icon").toggleClass("mobile-nav-icon mobile-close-icon");

        };

        var closed = function () {
            reset_menu();
            $("#menu-anchor-icon").toggleClass("mobile-nav-icon mobile-close-icon");
            sunbed_view.menu = false;
        };

        var runMenu = function () {
            if (!isClosed) {
                $.sidr('close', 'sidr-menu');
                isClosed = true;
            } else {
                $.sidr('open', 'sidr-menu');
                isClosed = false;
            }
        };

        sidr = $("#toggle-menu").sidr({
            name: "sidr-menu",
            side: "right",
            source: "#navigation",
            displace: true,
            speed: "200",
            onOpen: function () {
                open();
            },
            onClose: function () {
                closed();
            }
        });

        /* added this to enable sidr menu to work in firefox */
        $('#toggle-menu').on('click', function (evt) {
            runMenu();
            evt.preventDefault();
            evt.stopPropagation();
        });

        runMenu();

    };

    var reset_menu = function () {

        if (sunbed_view.menu) {
            sidr.click();
        }
    };

    var autoSizeText = function () {
        var el, elements, _i, _len, _results;
        elements = $('.resize');
        console.log(elements);
        if (elements.length < 0) {
            return;
        }
        _results = [];
        for (_i = 0, _len = elements.length; _i < _len; _i++) {
            el = elements[_i];
            _results.push((function (el) {
                var resizeText, _results1;
                resizeText = function () {
                    var elNewFontSize;
                    elNewFontSize = (parseInt($(el).css('font-size').slice(0, -2)) - 1) + 'px';
                    return $(el).css('font-size', elNewFontSize);
                };
                _results1 = [];
                while (el.scrollHeight > el.offsetHeight) {
                    _results1.push(resizeText());
                }
                return _results1;
            })(el));
        }
        return _results;
    };

    sunbedservices.init = function () {

        console.log('home services initialisation');
        sidrSetup();
    };

    sunbedservices.height = function (h) {
        _height = h
    };

    sunbedservices.autosizetext = function () {
        autoSizeText();
    };

})(window.sunbedservices = window.sunbedservices || {}, jQuery);

$(document).ready(function () {
    var _width = 1180;
    var _height = null;

    var qs = function (key) {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars[key];
    };

    var pg = function (url, key) {
        var vars = [], hash;
        var hashes = url.slice(url.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars[key];
    };

    var menuclick = function () {

        var removeclasses = function () {
            $("ul.gateway-links li a").removeClass("selected");
        };

        $('ul.gateway-links li a').on("click", function () {
            removeclasses();
            var url = $(this).attr("href");
            window.contentsunbedservices.load(pg(url, 'page'));
            $(this).addClass("selected");
            return false;
        });
    };

    calcHeight = function (Id, ratio, factor, minheight) {
        var h = ($(window).width() * ratio * factor) - 10;
        if (h < minheight) {
            h = h + 50;
        }
        $(Id).height(h);

        return h;
    };

    var setHeight = function () {
        var w = parseInt($(window).width());
        var minheight = (w < 568) ? 150 : 200;

        var Id = ($('.homepage-outer-container').css('background-image') !== 'none') ? '.homepage-outer-container' : 'not-found';

        var factor = null;

        switch (true) {
            case (w < 400):
                $(Id).height(290);
                factor = 0.7
                break;
            case (w < 568):
                $(Id).height(380);
                factor = 0.7;
                break;
            case (w < 768):
                ratio = (580 / 768);
                $(Id).height(400);
                factor = 0.3;
                break;
            default:
                ratio = (680 / _width);
                factor = 0.3;
                calcHeight(Id, ratio, 1, 10);


        }



        calcHeight('.the-truth', (300 / _width), 1, 10);
        calcHeight('.faketan-home', (300 / _width), 1, 10);
        calcHeight('.casestudies-home', 300 / _width, 1, 10);
        var h = calcHeight('.competition', (189 / 442), factor, minheight);
        $('.win-header-text').height(h + 30); //padding top and bottom

        _height = $("#container").height()
        window.sunbedservices.height(_height);
    };

    // calls the function on window resize

    var resizeTimer;
    $(window).on("resize", function () {
        if (resizeTimer) {
            clearTimeout(resizeTimer);
        }
        resizeTimer = setTimeout(function () {
            //console.log('resize event fired');
            setHeight();
            resizeTimer = null;
        }, 200);

    });

    setTimeout(function () {
        window.sunbedservices.init();
        setHeight();
        //$('#sunbed-loading-indicator').hide();
    }, 200);

    //$('#sunbed-loading-indicator').show();

});