"use strict";
(function (mapservices, $, undefined) {

    var _map = null;
    var _zengenti = null;
    var isDraggable = $(document).width() > 480 ? true : false;

    var buildMap = function (Id,zoom, radius, lat, lng) {

        //var latlng = new google.maps.LatLng(53.815883400, -3.035);
        var latlng = new google.maps.LatLng(lat,lng);

        _map = new google.maps.Map(document.getElementById(Id), {
            draggable: isDraggable,
            center: latlng,
            zoom: zoom,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            radius: radius
        });
    };

    var addMarker = function (data, callback) {
        var marker = new google.maps.Marker({
            position: { lat: data.lat, lng: data.long },
            map: _map
        });

        var infowindow = new google.maps.InfoWindow({
            content: data.text
        });

        google.maps.event.addListener(marker, 'click', function () {
            infowindow.open(_map, marker);
        });

        return callback(true, google, infowindow); //callback function

    };

    var clearMap = function (Id) {
        $('#' + Id).html('')
    }

    mapservices.init = function (Id, zoom, radius, lat, lon) {
        buildMap(Id, zoom, radius, lat, lon);
    };

    mapservices.addMarker = function (data, callback) {
        addMarker(data, callback);
    };

    mapservices.clearMap = function (Id) {
        clearMap(Id);
    }

})(window.mapservices = window.mapservices || {}, jQuery);