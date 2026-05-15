"use strict";
(function (googlemapservices, $, undefined) {

    var createMap = function (lat, lng, mapId, zoomNumber) {
        var mapOptions = {
            center: new google.maps.LatLng(lat, lng),
            zoom: zoomNumber,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }
        var map = new google.maps.Map(document.getElementById(mapId), mapOptions);
    };

    googlemapservices.map = function (lat, lng, mapId, num) {
        createMap(lat, lng, mapId, num);
    };

})(window.googlemapservices = window.googlemapservices || {}, jQuery);
