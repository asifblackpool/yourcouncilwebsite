"use strict";
(function (roadworkservices, $, undefined) {

    var gmarkers = [];
    var _table_wrapper_id   = "table-wrapper";
    var baseIconUrl = '/SiteElements/ChannelShift/Content/images/maps/';
    var map = null;
    var mapclicked = false;
    var selectedIcon =  { typeId: 0, url: null, defaultUrl: ''  };

    //corodinates for map - initial- are the default setttings, shifted is when menu side bar appears
    var coords = {
        initial: { lat: 53.8186, lng: -3.0000 },
        mobile: { lat: 53.8186, lng: -3.0150},
        shifted: { lat: 53.8186, lng: -3.0200 },
    }


    Number.prototype.toRad = function () {  // convert degrees to radians
        return this * Math.PI / 180;
    }
    Number.prototype.toDeg = function () {  // convert radians to degrees (signed)
        return this * 180 / Math.PI;
    }
    Number.prototype.padLZ = function (w) {
        var n = this.toString();
        for (var i = 0; i < w - n.length; i++) n = '0' + n;
        return n;
    }

    function OSGridToLatLong(E, N) {

        var a = 6377563.396, b = 6356256.910;                                   // Airy 1830 major & minor semi-axes
        var F0 = 0.9996012717;                                                  // NatGrid scale factor on central meridian
        var lat0 = 49 * Math.PI / 180, lon0 = -2 * Math.PI / 180;               // NatGrid true origin
        var N0 = -100000, E0 = 400000;                                          // northing & easting of true origin, metres
        var e2 = 1 - (b * b) / (a * a);                                         // eccentricity squared
        var n = (a - b) / (a + b), n2 = n * n, n3 = n * n * n;

        var lat = lat0, M = 0;
        do {
            lat = (N - N0 - M) / (a * F0) + lat;

            var Ma = (1 + n + (5 / 4) * n2 + (5 / 4) * n3) * (lat - lat0);
            var Mb = (3 * n + 3 * n * n + (21 / 8) * n3) * Math.sin(lat - lat0) * Math.cos(lat + lat0);
            var Mc = ((15 / 8) * n2 + (15 / 8) * n3) * Math.sin(2 * (lat - lat0)) * Math.cos(2 * (lat + lat0));
            var Md = (35 / 24) * n3 * Math.sin(3 * (lat - lat0)) * Math.cos(3 * (lat + lat0));
            M = b * F0 * (Ma - Mb + Mc - Md);                                   // meridional arc

        } while (N - N0 - M >= 0.00001);                                        // ie until < 0.01mm

        var cosLat = Math.cos(lat), sinLat = Math.sin(lat);
        var nu = a * F0 / Math.sqrt(1 - e2 * sinLat * sinLat);                  // transverse radius of curvature
        var rho = a * F0 * (1 - e2) / Math.pow(1 - e2 * sinLat * sinLat, 1.5);  // meridional radius of curvature
        var eta2 = nu / rho - 1;

        var tanLat = Math.tan(lat);
        var tan2lat = tanLat * tanLat, tan4lat = tan2lat * tan2lat, tan6lat = tan4lat * tan2lat;
        var secLat = 1 / cosLat;
        var nu3 = nu * nu * nu, nu5 = nu3 * nu * nu, nu7 = nu5 * nu * nu;
        var VII = tanLat / (2 * rho * nu);
        var VIII = tanLat / (24 * rho * nu3) * (5 + 3 * tan2lat + eta2 - 9 * tan2lat * eta2);
        var IX = tanLat / (720 * rho * nu5) * (61 + 90 * tan2lat + 45 * tan4lat);
        var X = secLat / nu;
        var XI = secLat / (6 * nu3) * (nu / rho + 2 * tan2lat);
        var XII = secLat / (120 * nu5) * (5 + 28 * tan2lat + 24 * tan4lat);
        var XIIA = secLat / (5040 * nu7) * (61 + 662 * tan2lat + 1320 * tan4lat + 720 * tan6lat);

        var dE = (E - E0), dE2 = dE * dE, dE3 = dE2 * dE, dE4 = dE2 * dE2, dE5 = dE3 * dE2, dE6 = dE4 * dE2, dE7 = dE5 * dE2;
        lat = lat - VII * dE2 + VIII * dE4 - IX * dE6;
        var lon = lon0 + X * dE - XI * dE3 + XII * dE5 - XIIA * dE7;


        return {

            longitude: lon.toDeg(),
            latitude: lat.toDeg()

        };
    }

    var returnListObjects = function (data) {

        var obj = [];
        if (Array.isArray(data)) {
            $.each(data, function (i, item) {
                obj.push(item);
            });
        }
        else {
            obj.push(data);
        }
        return obj;
    };

    function trace(message) {
        if (typeof console != 'undefined') {
            console.log(message);
        }
    }

    function formatDate(data) {
        var d = dateservices.convertSQLDate(data, "-");
        return d.getDate() + " " + dateservices.GetMonth(d.getMonth()) + " " + d.getFullYear();
    }

    var showHide = function (Id, state) {
        $("#" + Id).css('display', (state === 'hide') ? 'none' : 'block');
    };

    var bindToTimeStampTable = function () {
  
        $('#roadworks').dataTable().fnDestroy();  /* destroy data before re-initialising */

        $('#roadworks').DataTable({
            responsive: true,
            "order": [[ 3, "asc" ]],
            'ajax': {
                "type": "GET",
                "url": window.commonservices.Config().locationMaps + 'allRoadWorks',
                "dataSrc": ""
            },
            "searching": false,
             columnDefs: [
                    { responsivePriority: 1, targets: 0 },
                    { responsivePriority: 1, targets: 1 },
                    { responsivePriority: 1, targets: 3 },
                    { responsivePriority: 1, targets: 4 }

            ],
            columns: [

                { data: null,
                "mRender": function (data) {
                    return data.Address1 + " " + data.Address2;
                }
                },
                { data: "SiteLocation" },
                { data: "Description" },
                {
                  data: "StartDate",
                  className: 'date-text',
                  "mRender": function (data) {
                      var d = dateservices.convertSQLDate(data, "-");
                      return d.getDate() + " " + dateservices.GetMonth(d.getMonth()) + " " + d.getFullYear();
                  }
                },
                {
                    data: "EndDate",
                    className: 'date-text',
                   "mRender": function (data) {
                       var d = dateservices.convertSQLDate(data, "-");
                       return d.getDate() + " " + dateservices.GetMonth(d.getMonth()) + " " + d.getFullYear();
                     }
                 },
                 { data: "PromoterOrganisation" },
                 { data: "TrafficManagement" },
                 { data: "WorksTypeDescription"},
                 { data: "WorksStatus" }
            ]
        });
    };

    var populateTemplate = function (data) {
        //register the handle bar template 
        data.StartDate = formatDate(data.StartDate);
        data.EndDate = formatDate(data.EndDate);
        var template = Handlebars.compile($("#roadworks-template").html());
        var htmldata = template({ apidata: data });
        $('.traffic-content').html(htmldata);
        $("#roadworks-loading-indicator").hide();
    };

    var clearTemplate = function () {
        $('.traffic-content').html('');
        $("roadworks-loading-indicator").show();
    };

    var getTrafficInformation = function(Id) {
        $('#mySidenav').fadeOut(500, function () {
            $('#traffic-information-detail').fadeIn(300, function () {
                $('#traffic-information-detail').css("border", "1px solid black");
                $('#traffic-information-detail').css("width", "260px");

                $.get(window.commonservices.Config().locationMaps + 'GetRoadwork/' + Id,
                  function (data, status) {
                      populateTemplate(data);
                      moveMap(coords.shifted.lat, coords.shifted.lng);
                  })
                   .fail(function () {
                       alert('road works detail fail fetch');
                   });
            });
        });
    };

    var setSelectedIcon = function (obj) {

        if (selectedIcon.typeId > 0) {

            var result = $.grep(gmarkers, function (e) { return e.typeId == selectedIcon.typeId });
            if (result != null && result.length > 0) {
                result[0].icon = selectedIcon.defaultUrl;
                result[0].setAnimation(google.maps.Animation.DROP);
            }
        }

        var url = (obj.icon).split('.png')
        if (url.indexOf('-selected') > 0) {

        } else {
            obj.setAnimation(google.maps.Animation.DROP);
            selectedIcon.typeId = obj.typeId;
            selectedIcon.url = url[0] + '-selected.png';
            selectedIcon.defaultUrl = obj.icon;
            obj.setIcon(selectedIcon.url);
        }
    };

    var addMarker = function (item) {

        var datum = OSGridToLatLong(item.Easting, item.Northing);
        var location = { lat: datum.latitude, lng: datum.longitude };
        var icon = baseIconUrl + item.RoadWorkType.ImageUrl;

        var thisplace = new google.maps.Marker({
            typeId: item.Id,
            category: item.RoadWorkType.Id,
            map: map,
            position: location,
            icon: icon,
            title: item.SiteLocation
        });


        thisplace.addListener('click', function () {
            mapclicked = true;
            var Id = this.typeId;
            getTrafficInformation(Id);
            setSelectedIcon(this);
          

        });

        gmarkers.push(thisplace);
    };

    var initialise = function () {

        var width = parseInt($(window).width());
       

        var isDraggable = $(document).width() > 480 ? true : false;
        var latlng = new google.maps.LatLng(coords.initial.lat, coords.initial.lng); //default values;
        if (width < 560) {
            latlng = new google.maps.LatLng(coords.mobile.lat, coords.mobile.lng);
        }

        //default values;

        var buildMap = function () {
            map = new google.maps.Map(document.getElementById('map'), {
                draggable: isDraggable,
                center: latlng,
                zoom: 12,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                radius: 400
            });
        };

        var buildSideBar = function () {

            var _collection = new Array();
            var roadWorksCollections = { list: null };

            var populateSideBar = function (data) {
                var source = $("#roadworks-sidebar-template").html();
                Handlebars.registerPartial("roadworks-sidebar-link-partial", $("#roadworks-sidebar-link-partial").html());
                var template = Handlebars.compile(source);
                $('.roadworks-menu').html(template({ apidata: data }));
            }

            var setAllCheckboxes = function () {
                $('input[type="checkbox"].checkbox-places').attr('checked', true);
                $.each($('input[type="checkbox"].checkbox-places'), function (index, value) {
                    if ($(this).attr('checked') == 'checked')
                    $(this).css({ 'background-color': '#830065' })
                });
            }

            $.get(window.commonservices.Config().locationMaps + 'AllRoadWorksByWorkStatus',
                  function (data, status) {

                      $.each(data, function (i, item) {
                          $.each(item.RoadWorksList, function (i, roadworkItem) {
                              _collection.push(roadworkItem);
                          });
                      });


                      $.each(_collection, function (i, item) {
                          addMarker(item);
                      });

                      populateSideBar(data);
                      bindCheckBoxEvent();
                      bindEvents();
                      setAllCheckboxes();

                  }).fail(function () {
                              alert('road works tree view fail fetch');
                          });

        }

        var bindCheckBoxEvent = function () {

            var addMarkers = function (roadworktypeId) {
                /* Remove All Markers */
                for (var i = 0; i < gmarkers.length; i++) {
                    var currentId = parseInt(gmarkers[i].category);
                    if (roadworktypeId === currentId) {
                        gmarkers[i].setMap(map);
                        
                    }
                }
            };

            var removeMarkers = function (roadworktypeId) {
                /* Remove All Markers */
                for (var i = 0; i < gmarkers.length; i++) {
                    trace("selected marker is " + roadworktypeId + "marker type is " + gmarkers[i].typeId);
                    var currentId = parseInt(gmarkers[i].category);
                    if (roadworktypeId === currentId) {
                        gmarkers[i].setMap(null);
                    }
                }
                trace("Remove All Markers");
            };

            $(document).on('change', 'input[type="checkbox"].checkbox-places', function (e) {
                trace('checkbox onchange event called');
                var Id = parseInt((this.id).split('-')[1]);
                if ($('#' + this.id).is(':checked')) {
                    $('#' + this.id).css({ 'background-color': '#830065' });
                    $('.all-items-' + Id).show();
                    addMarkers(Id);
                } else {
                    $('#' + this.id).css({ 'background-color': 'white' });
                    $('.all-items-' + Id).hide();
                    removeMarkers(Id);
                }
            });
        };

        //click on a map icon to open traffic info details
        var bindLinkEvent = function () {
        
            $(document).on('click', '.roadwork-traffic-link', function (e) {
                trace('open traffic panel');
                clearTemplate();
                var Id = (this.id.split('-'))[3];
                getTrafficInformation(Id);
                var obj = $.grep(gmarkers, function (e) { return e.typeId == parseInt(Id) });
                if (obj !== null && obj.length > 0) {
                    setSelectedIcon(obj[0]);
                }
 
                e.preventDefault();
            });
        }

        var bindEvents = function () {
            //var tree = document.querySelectorAll('ul.tree a:not(:last-child)');
            var tree = $("ul.tree a.pseudo-link");
            

            for (var i = 0; i < tree.length; i++) {
                trace('tree length ' + tree.length);
                tree[i].addEventListener('click', function (e) {

                    e.preventDefault();
                    var parent = e.target.parentElement;
                    var classList = parent.classList;
                    trace('class list is ' + classList);
                    if (classList.contains("open")) {
                        classList.remove('open');

                        var opensubs = parent.querySelectorAll(':scope .open');

                        for (var i = 0; i < opensubs.length; i++) {
                            opensubs[i].classList.remove('open');
                        }
                    } else {
                        classList.add('open');
                    }


                });
            }
        };

        buildMap();
        buildSideBar();
        bindLinkEvent();
           
    };

    var moveMap = function (lat, long) {
        var newLocation = new google.maps.LatLng(lat, long);
        map.setCenter(newLocation);
    }

    var open = function () {

        $('#mySidenav').fadeIn(500, function () {
            $('#mySidenav').css("width", "260px");
            $('#mySidenav').css("border", "solid 1px black");
            moveMap(coords.shifted.lat, coords.shifted.lng);
            mapclicked = false;
        });
    };

    roadworkservices.init = function () {
        logger.disableLogger();
        console.log('roadworkservices --> init() called');
        showHide(_table_wrapper_id, '');
        initialise();
        bindToTimeStampTable();
     
    };

    roadworkservices.MoveMap = function (x,y) {
        moveMap(x,y);
    };

    roadworkservices.openMapSideBar = function () { open();};

    roadworkservices.closeMapSideBar = function () {
        $('#mySidenav').css("width", "0px");
        $('#mySidenav').css("border", "none");
        moveMap(coords.initial.lat, coords.initial.lng);
        mapclicked = false;
    };

    roadworkservices.closeRoadworkInformation = function () {
     
        $('#traffic-information-detail').fadeOut(400, function () {
            $('#traffic-information-detail').css("width", "0px;");
            if (!mapclicked) {
                open();
            }
            else {
                moveMap(coords.initial.lat, coords.initial.lng);
            }
         
        });
   
      
    };

})(window.roadworkservices = window.roadworkservices || {}, jQuery);