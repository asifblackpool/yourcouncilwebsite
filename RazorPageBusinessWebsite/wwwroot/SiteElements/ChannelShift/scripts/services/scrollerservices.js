"use strict";
(function (scrollerservice, $, undefined) {

    var scrollUp = function () {
        /* Check to see if the window is top if not then display button */
        $(window).scroll(function () {
            if ($(this).scrollTop() > 100) {
                $('.scrollToTop').fadeIn();
            } else {
                $('.scrollToTop').fadeOut();
            }
        });

        /* Click event to scroll to top */
        $('.scrollToTop').click(function (e) {
            $('html, body').animate({ scrollTop: 0 }, 800);
            e.preventDefault();
            return false;
        });
    };

    var scorllToByClass = function (cls, e) {
        var x = $("." + cls).position(); /* gets the position of the div element...*/
        /*window.scrollTo(x.left, x.top);*/
        $('html, body').animate({ scrollTop: x.top }, 800);
        if (e !== null) {
            e.preventDefault();
        }

        return false;
    };

    scrollerservice.init = function () {
        scrollUp();
    };

    scrollerservice.ScrollToByClass = function (cls,e) {
        return scorllToByClass(cls,e);
    };

})(window.scrollerservice = window.scrollerservice || {}, jQuery);