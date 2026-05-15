"use strict";
(function (commonsportblackpoolservices, $, undefined) {

    var _timeout = 50;
 
    var overlayTemplates = function (Id) {
        var overlayTemplate = {
         
            contentIDs: {
                overlay: Id
            },
            populateOverlay: function (data) {
                $('#' + this.contentIDs.overlay).html(data);
            },
            clearOverlay: function () {
                $('#' + this.contentIDs.overlay).html('');
            },

            reset: function () { }
        };

        return overlayTemplate;
    };

    var hide = function (Id) {
        $('#' + Id).hide();
    };

    commonsportblackpoolservices.show = function (Id) {
        $('#' + Is).show();
    };

    commonsportblackpoolservices.hide = function () {
        hide();
    };
    
    commonsportblackpoolservices.overlay = function (Id,width, message) {

        (overlayTemplates()).populateOverlay(message);

        var style = "width:{0}%; border:solid {1}px purple;";
        style = style.replace('{0}', width).replace('{1}', (width > 0) ? 2 : 0);
        hide();
        $("#" +Id).attr('style', style);
    };
    
})(window.commonsportblackpoolservices = window.commonsportblackpoolservices || {}, jQuery);