(function (togglelibraryservices, $, undefined) {

    var slideToggle = function (Id, obj, name) {

        var toggleArrow = function (obj, name) {
            if (name.indexOf("down") > 0) {
                obj.removeClass("down"); obj.addClass("up");
            } else {
                obj.removeClass("up"); obj.addClass("down");
            }
        };

        //slide up or down
        $("#" + Id).slideToggle("slow", function () {
            toggleArrow(obj, name);
        });
    };

    var changePinClick = function () {
        $("h4#change-pin").on("click", function (e) {
            var obj = $(this).find('span:first');
            slideToggle('change-pin-container', obj, obj.attr('class'));
        });
    };

    var preferencesClick = function () {
        $("h4#preferences").on("click", function (e) {
            var obj = $(this).find('span:first');
            slideToggle('preferences-container', obj, obj.attr('class'));
        });

    };


    togglelibraryservices.init = function () {
        changePinClick();
        preferencesClick();
    };

})(window.togglelibraryservices = window.togglelibraryservices || {}, jQuery);