(function (locationmapservices, $, undefined) {

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

    var polyfillArray = function () {
        if (!Array.isArray) {
            Array.isArray = function (arg) {
                return Object.prototype.toString.call(arg) === '[object Array]';
            };
        }
    };

    var yoh = {};
    var gmarkers = [];
    var chkbxs = new Array();
    var map = null;
    var infoWindow = null;
    var baseIconUrl = 'siteElements/channelshift/content/Images/maps/';

    var _addressList = new Array();
    var _radius = 2; //distance from postcode in km
    var _postcode = null;
    var _selectedTitle = null;
    var _selectedId = null;

    function setEqualHeight(selector, triggerContinusly) {

        var elements = $(selector)
        elements.css("height", "auto")
        var max = Number.NEGATIVE_INFINITY;

        $.each(elements, function (index, item) {
            if ($(item).height() > max) {
                max = $(item).height()
            }
        })
        $(selector).css("height", max + "px")

        if (!!triggerContinusly) {
            $(document).on("input", selector, function () {
                setEqualHeight(selector, false)
            })
            $(window).resize(function () {
                setEqualHeight(selector, false)
            })
        }
    }

    function trace(message) {
        if (typeof console != 'undefined') {
            console.log(message);
        }
    }

    function contentBuilder(item, distance) {

        this.item = item;
        this.distance = distance;

        this.getAddress = function () {
            return formatAddress(this.item);
        };

        this.getContent = function () {
            return buildContent(this.item);
        };

        function formatAddress(item) {
            var address = "";

            address = (item.Address1 != null && item.Address1.length > 0) ? item.Address1 : "";
            trace('address 1 ' + address);
            address = address + ((item.Address2 !== null && item.Address2.length > 0) ? ("," + item.Address2) : "");
            trace('address 2 ' + address);
            address = address + ((item.Address3 !== null && item.Address3.length > 0) ? ("," + item.Address3) : "");
            trace('address 3 ' + address);
            address = address + ((item.Town !== null && item.Town.length > 0) ? ("," + item.Town) : "");
            trace('Town ' + address);
            address = address + ((item.PostCode !== null && item.PostCode.length > 0) ? ("," + item.PostCode) : "");
            trace('PostCode ' + address);

            return address;
        }

        function buildContent() {

            var text = "";
            var content = "<div><ul>{0}</ul></div>";
            var li = "<li>{0}</li>";
            var link = "<a href='{0}'>{1}</a>";

            text = li;
            text = text.replace("{0}", "<strong>" + item.Name + "</strong>");
            text = text + li;
            text = text.replace("{0}", formatAddress(item));

            if (item.Telephone !== null && item.Telephone.length > 0) {
                text = text + li;
                text = text.replace("{0}", item.Telephone);
            }
            if (item.Email !== null && item.Email.length > 0) {
                text = text + li;
                text = text.replace("{0}", item.Email);
            }
            if (item.Website !== null && item.Website.length > 0) {
                link = link.replace("{0}", item.Website);
                link = link.replace("{1}", "More Information");
                text = text + li.replace("{0}", link);

            }

            text = text + "<li>distance {0}</li>".replace("{0}", distance);
            return content.replace("{0}", text);

        };
    }

    var removeMe = function (arr, me) {
        var i = arr.length;
        while (i--) if (arr[i] === me) arr.splice(i, 1);
    };

    var clearAddressList = function () {
        _addressList.splice(0, _addressList.length);
    };

    var clearMarkers = function () {
        /* Remove All Markers */
        for (i = 0; i < gmarkers.length; i++) {
            gmarkers[i].setMap(null);
        }

        gmarkers.splice(0, gmarkers.length);
    };

    var clearDetails = function () {
        $('.your-details-placeholder').html('');
    };

    var initialise = function () {

        var isDraggable = $(document).width() > 480 ? true : false; 
        //var latlng = new google.maps.LatLng(53.7996, -3.0170); //default values;
        //var latlng =  {lat: 53.7996, lng: -3.0170};


        var buildMap = function (lt, lg) {
            var latlng =  {lat: lt, lng: lg};
            map = new google.maps.Map(document.getElementById('map'), {
                draggable : isDraggable,
                center: {lat: lt, lng:  lg},
                zoom: 13,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                radius: 600
            });
        };

        var addPostCodeMarker = function (latlng) {
            //var location = { lat: data.Latitude, lng: data.Longitude };
            var icon = baseIconUrl + "/icons/home.png";

            trace('add marker for location ' + location.lat);
            trace('image path is ' + icon);
            var thisplace = new google.maps.Marker({
                typeId: -1,
                map: map,
                position: latlng,
                icon: icon,
                title: _postcode
            });

            //add radius 
            var cityCircle = new google.maps.Circle({
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.05,
                map: map,
                center: latlng,
                radius: _radius * 1000
            });
        };

        if (_postcode !== null) {
            $.get(window.commonservices.Config().locationMaps + 'PostCodeLatLong/' + _postcode,
           function (data, status) {
               trace('get location map types');
               latlng = new google.maps.LatLng(data.Latitude, data.Longittude);
               buildMap(data.Latitude, data.Longittude);
               addPostCodeMarker(latlng);
           })
            .fail(function () {
                alert('get post code lat long maps type fail fetch');
            });
        }
        else {
            
            buildMap(53.7996, -3.0170);
        }
    };

    var createId = function (name) {
        return name.replace(/ /g, '-') + "-details";
    };

    var addDetails = function (list) {

        var data = new Array();
        var id = createId(_selectedTitle);

        $.each(list, function (i, item) {

            var url = baseIconUrl + item.Address.TypeOfLocation.ImageUrl;
            var contentbuilder = new contentBuilder(item.Address, item.DisplayDistance);
            data.push({ Name: item.Address.Name, Distance: item.DisplayDistance, Url: url, Address: contentbuilder.getAddress(), Website: item.Address.Website });
        });
        //alert(data);

        var source = $("#locationmaps-details-template").html();
        var template = Handlebars.compile(source);
        $('.your-details-placeholder').append(template({ apidata: data, Title: _selectedTitle, Id: id }));

        setEqualHeight("#" + id + " div.media-body", true);
    };

    var addMarker = function (item, distance) {

        //create content builder object;

        var contentbuilder = new contentBuilder(item, distance);

        var location = { lat: item.Latitude, lng: item.Longitude };
        var icon = baseIconUrl + item.TypeOfLocation.ImageUrl;

        trace('add marker for location ' + location.lat);
        trace('image path is ' + icon);
        var thisplace = new google.maps.Marker({
            typeId: item.TypeOfLocation.Id,
            map: map,
            position: location,
            icon: icon,
            title: item.Name
        });

     
        thisplace.addListener('click', function () {
            infowindow = new google.maps.InfoWindow({
                content: contentbuilder.getContent()
            });

            infowindow.open(map, thisplace);
      
        });

        thisplace.addListener('mouseout', function () {
           // alert(this);

        });


        gmarkers.push(thisplace);
    };

    var removeMarkers = function (locationTypeId) {
        /* Remove All Markers */
        for (i = 0; i < gmarkers.length; i++) {
            trace("selected marker is " + locationTypeId + "marker type is " + gmarkers[i].typeId);
            var currentId = parseInt(gmarkers[i].typeId);
            if (locationTypeId === currentId) {
                gmarkers[i].setMap(null);
            }
        }
        trace("Remove All Markers");
    };

    var getLocationPlacesByPostCode = function (collection) {

        $(function () {
            var addresses = {
                list: collection
            };
            $.ajax({
                type: "POST",
                data: JSON.stringify(addresses),
                url: window.commonservices.Config().locationMaps + "AddressesAll",
                contentType: "application/json",
                success: function (data, status) {
                    var addressBuilder = function (addrs) {
                        if (addrs !== null && addrs.length > 0) {
                            addDetails(addrs);
                        }

                        $.each(addrs, function (i, item) {
                            console.log('each addresses ' + item.Address.Name)
                            addMarker(item.Address, item.DisplayDistance);
                            chkbxs.push(item.Address.LocationTypeId);
                        });
                    };

                    var temp = returnListObjects(data);
                    if (temp != null && temp.length > 0) {
 
                        $.each(temp, function (i, item) {
                            _selectedTitle= $(":checkbox[value="+ item.LocationTypeId + "]").attr('title');
                            addressBuilder(item.LocationAddressesWithRadius);
                        });
                    }    
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert("Status: " + textStatus); alert("Error: " + errorThrown);
                }
            });
        });
    };

    yoh.createTreeViewPlaces = function () {

        var populateTemplate = function (data) {
            //register the handle bar template 
            var source = $("#locationmaps-treeview-template").html();
            Handlebars.registerPartial("fixednode-partial", $("#fixednode-partial").html());
            Handlebars.registerPartial("checknode-partial", $("#checknode-partial").html());
            var template = Handlebars.compile(source);

            $('.locationmaps-placeholder').html(template({ apidata: data }));
            $("#locationmaps-loading-indicator").hide();
        };

        var clearTemplate = function () {
            $('#locationmaps-placeholder').html('');
            $("#locationmaps-loading-indicator").show();
        };

        var bindEvents = function () {
            //var tree = document.querySelectorAll('ul.tree a:not(:last-child)');
            var tree = $("ul.tree a");

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

        clearTemplate();
        $.get(window.commonservices.Config().locationMaps + 'PlaceTypes',
           function (data, status) {
               console.log('get location map types');
               var places = returnListObjects(data);
               populateTemplate(places);
               bindEvents();
           })
            .fail(function () {
                alert('get all location maps type fail fetch');
            });
    };

    yoh.bindCheckBox = function () {

        var getLocationPlacesById = function (Id) {
            $.get(window.commonservices.Config().locationMaps + 'Addresses/' + Id,
          function (data, status) {
              var addresses = returnListObjects(data);
              $.each(addresses, function (i, item) {
                  console.log('each addresses ' + item.Name)
                  addMarker(item, item.DisplayDistance);
              });
          })
           .fail(function () {
               alert('get all location maps type fail fetch');
           });
        };

        $(document).on('change', 'input[type="checkbox"]', function (e) {
            var id = parseInt((this.id).split('-')[2]);
            _selectedTitle = this.title;
            if ($('#' + this.id).is(':checked')) {
                $('#' + this.id).css({ 'background-color': '#830065' })
                clearAddressList();
                _addressList.push({ Id: id, Radius: _radius, Postcode: _postcode })

                getLocationPlacesByPostCode(_addressList);

            }
            else {
                $('#' + this.id).css({ 'background-color': 'white' })
                $('#' + createId(this.title)).remove();
                removeMarkers(id);
                removeMe(chkbxs, id);
            }

        });
    };

    yoh.submitTextBox = function (postcode) {

        trace('submit text box');
        clearDetails();
        _postcode = postcode;
        clearAddressList();
        clearMarkers();
        initialise();
        $.each($("input[name='yourAreaCheckbox']:checked"), function () {
            _addressList.push({ Id: this.value, Radius: _radius, Postcode: _postcode })
        });
      
        //now that we have added the checkboxes clear the list 
       if (chkbxs !== null && chkbxs.length > 0){
            chkbxs.splice(0, chkbxs.length);
        }
        getLocationPlacesByPostCode(_addressList);
    };

    //public properties
    locationmapservices.init = function (currentLocation) {
        logger.disableLogger();
        trace('location map services called');
        _postcode = currentLocation;
        polyfillArray();
        initialise();
        trace('location map initialise called');
        yoh.createTreeViewPlaces();
        yoh.bindCheckBox();
    };

    locationmapservices.submit = function (postcode) {
        yoh.submitTextBox(postcode);
    };

})(window.locationmapservices = window.locationmapservices || {}, jQuery);

(function (democracy, $, undefined) {

    var _templateId = null;

    function populateTemplate(title, data, message) {

        try {
            if (data !== null) {
                $.each(data, function (i, item) {
                    item.photosmallurl = item.photosmallurl.replace("http", "https");
                });
            }

        }
        catch (ex) {
            console.log('error in photo small replacement');
        }
    
        var councillorTemplate = Handlebars.compile($("#" + _templateId).html());
        $('.councillor-placeholder').html(councillorTemplate({ apidata: data, wardTitle: title, msg: message }));
        $("#councillor-loading-indicator").hide();
    }

    function getCouncillorsByArea(postcode, isoffline) {

        var returnList = [];

        var resetTemplates = function () {
            $(".councillor-placeholder").html("");
            $("#councillor-loading-indicator").show();
        };

        resetTemplates();
        $.get(window.commonservices.Config().democracyUrl + 'CouncillorsByArea?postcode=' + postcode,
             function (data, status) {
                 console.log("Data: " + data + "\nStatus: " + status);
                 var list = $.parseJSON(data);
                 var title = JSON.search(list, '//wardtitle/text()');
                 var councillors = JSON.search(list, '//councillor');

                 (isoffline) ? populateTemplate(null, null, "Our ward/councillor search is currently being updated. We apologise for any inconvenience.")
                             : populateTemplate(title, list, "No councillor information can be found for the post code entered");



             }
          ).fail(function () {
              populateTemplate("", returnList);
          });
    }

    democracy.init = function (postcode, tempalateId, isoffline) {

        console.log('call democracy init ' + postcode);
        _templateId = tempalateId;
   
        getCouncillorsByArea(postcode, isoffline);
    };

})(window.democracy = window.democracy || {}, jQuery);

(function (votingservices, $, undefined) {

    var ddl_templateId              = "polling-template";
    var content_placeholder         = "polling-placeholder";
    var street_templateId           = "polling-address-template";
    var street_content_placeholder  = "polling-station-address";

    var getVotingByArea = function (postcode,callback) {

        var timeout = null;
        var pollingApiUrl = window.commonservices.Config().pollingStationUrl + 'properties?postcode=' + postcode;

        var populateTemplate = function (propertyList) {

            var pollingTemplate = Handlebars.compile($("#" + ddl_templateId).html());
            var data = (propertyList !== null) ? propertyList : [];
            $("." + content_placeholder).html(pollingTemplate({ apiproperties: data }));
            bindChangeEvent();
        };

        resetTemplates();
        function ajaxCall() {
            $.when($.ajax(pollingApiUrl))
               .done(function (data) {
                   if (data !== null) {
                       populateTemplate($.parseJSON(data));
                       callback(true);
                   }
                   else {
                       populateTemplate(null);
                       callback(false);
                   }
               }).fail(function () {
                   populateTemplate(null);
                   callback(false)
               });
        }

        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(ajaxCall, 3000);
    };

    var getPollingStationById = function (id) {

        var timeout = null;
        var pollingApiUrl = window.commonservices.Config().pollingStationUrl + 'PollingStation?id=' + id;

        var formatAddressObject = function (address) {

            var ps = [];

            var pollingStation = {
                name: '',
                address: ''
            };
            if (address !== null) {
                var formatedAddress = "";

                formatedAddress = (address.AddressLine1 !== null) ? address.AddressLine1 : "";
                formatedAddress = (address.AddressLine2 !== null) ? formatedAddress + ", " + address.AddressLine2 : formatedAddress;
                formatedAddress = (address.AddressLine3 !== null) ? formatedAddress + ", " + address.AddressLine3 : formatedAddress;
                formatedAddress = (address.AddressLine4 !== null) ? formatedAddress + ", " + address.AddressLine4 : formatedAddress;
                formatedAddress = (address.AddressLine5 !== null) ? formatedAddress + ", " + address.AddressLine5 : formatedAddress;
                formatedAddress = (address.AddressLine6 !== null) ? formatedAddress + ", " + address.AddressLine6 : formatedAddress;

                formatedAddress = (address.AddressLinePostCode !== null) ? formatedAddress + ", " + address.AddressLinePostCode : formatedAddress;

                formatedAddress = formatedAddress.replace(", , ,", ",");
                formatedAddress = formatedAddress.replace(", ,", ",");

                pollingStation.address = formatedAddress;
                pollingStation.name = (address.AddressLine1 !== null) ? address.AddressLine1 : "";
                ps.push(pollingStation);
            }

            return ps;
        };

        function populateTemplate(address) {

            var pollingTemplate = Handlebars.compile($("#" + street_templateId).html());
            var data = (address !== null) ? address : [];
            $("." + street_content_placeholder).html(pollingTemplate({ apipolling: data }));
        }

        function ajaxCall() {
            $.when($.ajax(pollingApiUrl))
               .done(function (data) {
                   if (data !== null) {
                       populateTemplate(formatAddressObject($.parseJSON(data)));
                   }
                   else {
                       populateTemplate(null);
                   }
               }).fail(function () {
                   populateTemplate(null);
               });
        }

        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(ajaxCall, 500);
    };

    var resetTemplates = function () {
        if (window.commonservices.Config().includePollingStation) {
            $("." + street_content_placeholder).html("");
        }
    };

    var bindChangeEvent = function () {
        $("#streetDropDownList").show();
        $("#streetDropDownList").on("change", function (e) {
            resetTemplates();
            var id = parseInt(this.value);
            if (id > 0) {
                getPollingStationById(id);
            }
            e.preventDefault();
        });
    };

    votingservices.init = function (postcode, callback) {

        if (window.commonservices.Config().includePollingStation) {
            console.log('call voting init ' + postcode);
            getVotingByArea(postcode, callback);
        } else {
            $("#polling-panel").hide(); /* hide the panel completely */
        }
    };
})(window.votingservices = window.votingservices || {}, jQuery);

(function (wasteservices, $, undefined) {

    var getBinCollection = function (postcode) {

        var returnList = [];

        var populateTemplate = function (data) {
            var binTemplate = Handlebars.compile($("#bin-template").html());
            $('.bin-placeholder').append(binTemplate({ apidata: data, count: data.length }));
            $("#bin-loading-indicator").hide();
        };

        var resetTemplates = function () {
            $(".bin-placeholder").html("");
            $("#bin-loading-indicator").show();
        };

        resetTemplates();
        $.post(window.commonservices.Config().veoliaUrl + 'BinCollection',
        {
            '': postcode
        },
          function (data, status) {

              console.log("Bin collection Data: " + data + "\nStatus: " + status);
              populateTemplate(data);
          }
       ).fail(function () {
           populateTemplate(returnList);
       });
    };


    wasteservices.init = function (postcode) {
        console.log('call waste services init postcode ' + postcode);
        getBinCollection(postcode);

    };

})(window.wasteservices = window.wasteservices || {}, jQuery);

(function (googleservices, $, undefined) {

    var getParks = function (postcode) {

        var returnlist = [];
        var currentParks = null;

        var populateTempalates = function () {

            var parkTemplate = Handlebars.compile($("#park-template").html());
            $('.parks-placeholder').append(parkTemplate({ apidata: returnlist }));
            $("#park-loading-indicator").hide();
        };

        var resetTemplates = function () {
            $(".parks-placeholder").html("");
            $("#park-loading-indicator").show();
        };

        var getCurrentParks = function () {

            $.get(window.commonservices.Config().googleUrl + 'CurrentParks', function (data, status) {
                console.log('data ' + data + '  status' + status);
                currentParks = data;
                populate();
            });
        };





        var populate = function () {
            $.get(window.commonservices.Conf.googleUrl + 'Place',
              {
                  'postcode': postcode,
                  'type': "park",
                  'radius': "3000"
              },
                function (data, status) {

                    console.log('status is ' + status);
                    var list = $.parseJSON(data);

                    var subList = JSON.search(list, '//results[contains(name, "Park") and not (contains(name,"Caravan"))]');
                    $.each(subList, function (i, item) {
                        var parklookup = JSON.search(currentParks, '//Parks[Name="' + item.name + '"]');
                        if (item.name.indexOf('Holiday') < 1) {
                            var parks = {
                                name: item.name,
                                vicinity: (parklookup.length === 1) ? parklookup[0].Address : item.vicinity,
                                url: (parklookup.length === 1) ? parklookup[0].pageLink : '#'
                            };

                            returnlist.push(parks);

                        }
                    });


                    /* sort by name */
                    utilities.helper.sortObjArray(returnlist, "name");
                    /* remove duplicates */
                    returnlist = utilities.helper.removeDuplicatesFromObjArray(returnlist, "name");
                    populateTempalates();
                }
             ).fail(function () { populateTempalates(); });
        };



        resetTemplates();
        getCurrentParks();

    };

    /* public properties */
    googleservices.init = function (postcode) {

        if (window.commonservices.Config().includeGoogleServices) {
            console.log('call google services init postcode ' + postcode);
            getParks(postcode);
        }
        else {
            $("#park-panel").hide(); /* hide the panel completely */
        }

    };

})(window.googleservices = window.googleservices || {}, jQuery);

(function (signInServices, $, undefined) {

    var _utility = utilities;

    var addFormTemplate = function () {
        var template = $('#sign-in-form-template');
        var placeholder = $('#sign-in-form-placeholder');
        if (placeholder.length) {

            console.log('template exists');
        }
        else {
            console.log('add sign in template');
            var signInTemplate = Handlebars.compile(template.html());
            placeholder = "<div id='sign-in-form-placeholder' style='display:none'></div>";
            $('body').append(placeholder);
            $('#sign-in-form-placeholder').append(signInTemplate({ apiData: "" }));
        }

    };

    signInServices.proxySubmit = function () {


        var firstname = $('#proxy-firstname').val();
        var secondname = $('#proxy-secondname').val();
        var email = $('#proxy-email').val();
        var messages = signInServices.submitform(email, firstname, secondname);

        if (messages.email === '' && messages.firstname === '' && messages.secondname === '' ) {

            $("#Email").val(email);
            $("#cd_FIRSTNAME").val(firstname);
            $("#cd_SECONDNAME").val(secondname);
            $('form[name="signup"]').submit();
        }
        else {
            $("#proxy-email-error").html(messages.email);
            $("#proxy-firstname-error").html(messages.firstname);
            $("#proxy-secondname-error").html(messages.secondname);
          

        }

    };

    signInServices.init = function () {
        addFormTemplate();
    };

    signInServices.submitform = function (email, firstname, secondname) {

        var message = '';
        var errorMessages = {email: '',postcode: '',firstname: '',secondname: '' };

        if (firstname === "") {
            errorMessages.firstname = 'You have not entered a first name.'
        }
        if (secondname === "") {
            errorMessages.secondname = 'You have not entered a second name.'
        }

        //message = _utility.validateUKPostCode(postcode);
        //if (message !== "") {
        //    errorMessages.postcode = message;
        //    message = '';
        //}
        message = _utility.validateEmailAddress(email);
        if (message !== "") {
            errorMessages.email = message;
            message = '';
        }

        /* submit proxy form */

        return errorMessages;
    };


})(window.signInServices = window.signInServices || {}, jQuery);

