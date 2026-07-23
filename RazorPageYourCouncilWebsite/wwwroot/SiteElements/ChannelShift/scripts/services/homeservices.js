"use strict";


(function (homeservices, $, undefined) {

    var homepage_view = { search: false, menu: false };
    var sidr = null;

    var sidrSetup = function () {

        var isClosed = false;

        var open = function () {
            homepage_view.menu = true;
            reset_menu();
            $("#menu-anchor-icon").toggleClass("mobile-nav-icon mobile-close-icon");
            reset_search();
        };

        var closed = function () {
            reset_menu();
            $("#menu-anchor-icon").toggleClass("mobile-nav-icon mobile-close-icon");
            homepage_view.menu = false;
        };

        var runMenu = function () {
            if (!isClosed) {
                $.sidr('close', 'sidr-menu');
                isClosed = true;
            }
            else {
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
            onOpen: function () { open(); },
            onClose: function () { closed(); }
        });

        /* added this to enable sidr menu to work in firefox */
        $('#toggle-menu').on('click', function (evt) {
            runMenu();
            evt.preventDefault();
            evt.stopPropagation();
        });

        runMenu();

    };

    var clickEventsSetup = function () {
        $('#toggle-search').click(function () {

            reset_menu();
            if (!homepage_view.search) {
                $("#search-box-inner").css({ 'height': '155px' });
            }
            $('.toggle-search').toggle('slow');
            $("#search-anchor-icon").toggleClass("mobile-search-icon mobile-close-icon");
            homepage_view.search = !homepage_view.search;
            return false;
        });

        $('#home-show-hide-services').click(function () {

            var showDisplay = function () {

                var imgDetails = {
                    id: 'more-services-icon',
                    up: 'arrowup-white.svg',
                    down: 'arrowdown-white.svg',
                    path: '/SiteElements/ChannelShift/content/images/mobile/'
                };

                var src = $("#" + imgDetails.id).attr('src');
                var img_name = src.substr(src.lastIndexOf('/') + 1);

                if (img_name === "arrowdown-white.svg") {
                    $('.home-icon').find('*').removeClass('mobile-hidden');
                    $("#" + imgDetails.id).attr('src', imgDetails.path + imgDetails.up);

                } else {
                    $('.home-icon').find('div:nth-child(n+7)').addClass('mobile-hidden');
                    $("#" + imgDetails.id).attr('src', imgDetails.path + imgDetails.down);
                }


            };

            showDisplay();

        });
    };

    var reset_search = function () {
        $("#search-anchor-icon").removeClass();
        $("#search-anchor-icon").addClass("mobile-search-icon");

        if (homepage_view.search) {
            $('.toggle-search').toggle('slow');
            homepage_view.search = false;
        }

    };

    var reset_menu = function () {
        $("#search-box-inner").css({ 'height': '' });
        if (homepage_view.menu) {
            sidr.click();
        }
    };

    homeservices.init = function () {

        console.log('home services initialisation');
        sidrSetup();
        clickEventsSetup();
    };

})(window.homeservices = window.homeservices || {}, jQuery);
