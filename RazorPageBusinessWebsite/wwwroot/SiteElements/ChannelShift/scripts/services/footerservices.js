"use strict";
(function (footerservices, $, undefined) {

    var cls = null;
    var icon = null;
    var classIcons = { down: "icon-footer-arrow-down", up: "icon-footer-arrow-up" };
    var expand = function (icon) {
        cls = icon[0].className;
        icon[0].className = ((cls === classIcons.down) ? classIcons.up : classIcons.down);
    };

    var collapseAll = function () {
        $('h3.footer-header').each(function (i, obj) {

            icon = $(obj).find('span').find('i');
            var links = $(obj).next('ul.footer-site-links');
            //$(links).hide('slow');
            $(links).css("display", "");
            //$(links).addClass("footer-view");
            cls = icon[0].className;
            if (cls === classIcons.up) {
                icon[0].className = classIcons.down;
            }
        });
    };

    var openPanel = function (obj) {
        collapseAll();
        var links = $(obj).next('ul.footer-site-links');
        icon = $(obj).find('span').find('i');

        cls = icon[0].className;
        if (cls === classIcons.up) {
            icon[0].className = classIcons.down;
        }


        links.not(':animated').slideToggle(function () {
            expand(icon);
        });
    };

    footerservices.init = function () {
        $('#blackpool-footer').show();
        $(document).on('click', 'h3.footer-header', function (e) {
            e.preventDefault();
            icon = $(this).find('span').find('i');
            cls = icon[0].className;
            if (cls === classIcons.up) { collapseAll(); } else { openPanel(this); }
        });
    };

    footerservices.hide = function () {
        $('#blackpool-footer').hide();
    }

})(window.footerservices = window.footerservices || {}, jQuery);
