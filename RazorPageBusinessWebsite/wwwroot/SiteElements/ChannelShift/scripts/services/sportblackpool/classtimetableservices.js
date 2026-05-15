"use strict";
(function (classtimetableservices, $, undefined) {

    var _baseUrl            = '/custom/api/contenttype/entries/';
    var _tableId            = 'classtimetable';
    var _dropdownId         = 'ddl-location';
    var _dropdownDayId      = 'ddl-day';
    var _dropdownClassId    = 'ddl-class'
    var _commonservices     = null;
    var _overlayId          = null;
    var _csbs               = null;
    var _table              = null;
    var _template           = '';
    var _list               = new Array();
    var _location           = new Array();

    var dayEnum = { Mon: 1, Tues: 2, Weds: 3, Thurs: 4, Fri: 5, Sat: 6, Sun: 7 };

    function Charges(name, nonres, nonressScc, res, resScc) {
        this.Name = name,
        this.NonResidential =nonres;
        this.NonResidentialSCC = nonressScc;
        this.Residential = res;
        this.ResidentialSCC = resScc
    }

    function classTimeTable(Id, resource, location, opentime, time, day, dayId, bookingdetails, charges, description, title) {
        this.Id = Id;
        this.Charges = charges;
        this.Location = location;
        this.OpenTime = opentime
        this.Time = time;
        this.Day = day;
        this.DayId = dayId;
        this.BookingDetails = bookingdetails;
        this.Resource = resource;
        this.Title = title
        this.Description = description;
    }

    var listTag = function (Id, value) {
        return "<li><a id='item_" + Id + "' href='#'>" + value + "</a></li>";
    };

    var isUndefined = function (s) {
        return (typeof s == "undefined" || s === null) ? "" : s;
    };

    var getDayEnum = function (day) {
        switch (day) {
            case 'Monday':
                return dayEnum.Mon;
            case 'Tuesday':
                return dayEnum.Tues;
            case 'Wednesday':
                return dayEnum.Weds;
            case 'Thursday':
                return dayEnum.Thurs;
            case 'Friday':
                return dayEnum.Fri
            case 'Saturday':
                return dayEnum.Sat;
            case 'Monday':
                return dayEnum.Sun;
            default:
                return 0;
        }
    };

    var formatBookingTime = function (st, et) {

        var timeformat = "{0} - {1}";
        timeformat = timeformat.replace("{0}", convertTo24HourClock(st)).replace("{1}", convertTo24HourClock(et));
        return timeformat;
    };

    var convertTo24HourClock = function (time) {

        if (time != null && time.length > 1) {
            var firstChar = parseInt(time.substring(0, 1));
            var firstTwoChar = parseInt(time.substring(0, 2));

            if (firstChar < 1) {
                return time.slice(1, time.length) + " am";
            } else {
                var temp = ((firstTwoChar - 12) == 0) ? 12 : "0".concat((firstTwoChar - 12));
                return (firstTwoChar > 9 && firstTwoChar < 12)
                    ? time + " am"
                    : temp + time.slice(2, time.length) + " pm";
            }
        }

        return time;
    };

    var bindclassDataTable = function (data) {

        _table = $('#' + _tableId).DataTable({
            responsive: true,
            data: data,
            "searching": true,
            columns: [
                { data: 'Id', visible: false },
                { data: 'Title' },
                { data: 'Location' },
                { data: 'Time' },
                { data: 'Day', visible: false },
                { data: 'DayId', visible: false },
                {
                    data: null,
                    "mRender": function (data, type, row) {
                        return '<a class="open-modal" data-toggle="modal" data-target="#myModal" href="#">' +
                            '<img src="/siteElements/channelshift/content/images/sport-blackpool/info-icon-red.png" alt="information" style="width:20px; height:20px; margin-left:25px;" /></a>';
                    }
                },
                {
                    data: null,
                    "mRender": function (data, type, row) {
                        return '<button class="class-booking bkg-red-color">Booking</button>';
                    }
                },
                { data: 'BookingDetails', visible: false },
                { data: 'Resource', visible: false },
                { data: 'Charges', visible: false },
                { data: 'Description', visible: false },
                { data: 'OpenTime', visible: false}
               
            ],
            order: [[5, 'asc'], [12, 'asc']],
            rowGroup: {
                dataSrc: 'Day'
            },
        });
    };

    var bindMoreInfoEvent = function () {

        var formatPrice = function (price) {

            return "£" + price.toFixed(2);
        };

        var displayCharges = function (charges) {

            var t = "";
            if (charges !== null) {
                t = "<tr><td><strong>Residential:</strong></td><td>" + formatPrice(charges.chargeResidential) + "</td></tr>";
                t = t + "<tr><td>Non Residential</strong></td><td>" + formatPrice(charges.chargeNonResidential) + "</td></tr>";
                t = t + "<tr><td>Residential Senior Citizen</strong></td><td>" + formatPrice(charges.chargeResidentialSCC) + "</td></tr>";
                t = t + "<tr><td>Non Residential Senior Citizen</strong></td><td>" + formatPrice(charges.chargeNonResidentialSCC) + "</td></tr>";

                return "<table>" + t + "</table>"
            }
            return t;
        }

        var populatePopup = function () {
       
            var row = $(this).closest('tr');
            /* mobile view */
            if (row !== null && row[0].className === 'child')  {
                  var prev = row.prev();
                  row = (_table.rows(prev).data())[0];
            }
            else {
               row = _table.row($(this).parents('tr')).data();
            }


         
            $("h4.modal-title").html(row.BookingDetails)
            var data = _template;

            var price = displayCharges(row.Charges);

            data = data.replace("{0}", row.Location);
            data = data.replace("{1}", (row.Charges === null) ? "&nbsp;" : row.Charges.name);
            data = data.replace("{2}", row.Resource);
            data = data.replace("{3}", row.Day);
            data = data.replace("{4}", row.Time);
            data = data.replace("{5}", price);
            data = data.replace("{6}", row.Description);

            $('section.center-modal').html(data);
        };

        $('#' + _tableId).on('click', 'a.open-modal', populatePopup);
    };

    var bindBookingEvent = function () {

        var book = function () {
            var url = commonservices.Config().sportWebBookingUrl;
            window.location.href = url;
            return false;
        };

        $('#' + _tableId).on('click', 'button.class-booking', book);
    };

    var bindPageEvent = function () {
        $('#' + _tableId).on('page.dt', function () {
            bindMoreInfoEvent();
        });
    };

    var venueOnChange = function () {
        $('#' + _dropdownId + ' li a').on('click', function (e) {

            var value = $(this).attr("id").split("_")[1];
            var text = $(this).text();

            if (value != "-1") {
                _table.column(2).search(text).draw();
                $("span.selected-location").html("Filters (selected location): <strong>" + text + "</strong>");
                $("span.selected-location").css('display', 'block');
            } else {
                _table.search('').columns().search('').draw();
                $("span.selected-location").html('');
                $("span.selected-location").css('display', 'none');
            }
            e.preventDefault();
        });
    };

    var classOnChange = function () {
        $('#' + _dropdownClassId + ' li a').on('click', function (e) {

            var value = $(this).attr("id").split("_")[1];
            var text = $(this).text();

            if (value != "-1") {
                _table.column(1).search(text).draw();
                $("span.selected-class").html("Filters (selected class): <strong>" + text + "</strong>");
                $("span.selected-class").css('display', 'block');
            } else {
                _table.search('').columns().search('').draw();
                $("span.selected-class").html('');
                $("span.selected-class").css('display', 'block');
            }
            e.preventDefault();
        });
    };

    var dayOnChange = function () {

        var bindDropdown = function () {
            $('#' + _dropdownDayId).append(listTag(-1, 'All'));
            $('#' + _dropdownDayId).append(listTag(dayEnum.Mon, 'Monday'));
            $('#' + _dropdownDayId).append(listTag(dayEnum.Tues, 'Tuesday'));
            $('#' + _dropdownDayId).append(listTag(dayEnum.Weds, 'Wednesday'));
            $('#' + _dropdownDayId).append(listTag(dayEnum.Thurs, 'Thursday'));
            $('#' + _dropdownDayId).append(listTag(dayEnum.Fri, 'Friday'));
            $('#' + _dropdownDayId).append(listTag(dayEnum.Sat, 'Saturday'));
            $('#' + _dropdownDayId).append(listTag(dayEnum.Sun, 'Sunday'));

        };

        bindDropdown();

        $('#' + _dropdownDayId + ' li a').on('click', function (e) {

            var value = $(this).attr("id").split("_")[1];
            var text = $(this).text();

            if (value != "-1") {
                _table.column(4).search(text).draw();
                $("span.selected-day ").html("Filters (selected day):  <strong>" + text + "</strong>");
                $("span.selected-day").css('display', 'block');
            } else {
                _table.search('').columns().search('').draw();
                $("span.selected-day ").html('');
                $("span.selected-day").css('display', 'none');
            }
            e.preventDefault();
        });
    };

    var getClassTimeTableData = function () {

        $.when(
          $.get(_baseUrl + 'sportblackpoolclasslist',
              function (data, status) {
                  var item = null;
                  var title = null;
                  var bookingTime = null;
                  var description = "";
                  if (data !== null) {
                      for (var i = 0; i < data.length; i++) {
                          item = data[i];
                          bookingTime   = item.bookingTime;
                          var location  = (item.venue === null) ? "Unknown" : item.venue.venue;
                          try {
                              description = item.descrption.description;
                              title = item.descrption.entryTitle;
                          } catch (e) { description = ""; }
                          _list.push(
                              new classTimeTable(
                                                 item.sys.id,
                                                 item.resource,
                                                 location,
                                                 bookingTime.openingTime,
                                                 formatBookingTime(bookingTime.openingTime, bookingTime.closingTime),
                                                 bookingTime.days[0],
                                                 getDayEnum(bookingTime.days[0]),
                                                 item.bookingDetailsActivity, 
                                                 item.charges,
                                                 isUndefined(description), title
                                                )
                          );
                         // sanity check does day exist if not remove
                         if ( getDayEnum(bookingTime.days[0]) === 0) {  
                            _list.pop(); 
                         }



                      }
                      _template = $('section.center-modal').html();
                      bindclassDataTable(_list);
                      bindMoreInfoEvent();
                      bindPageEvent();
                      bindBookingEvent();
                      dayOnChange();
                  }
              }
           ).fail(function () { alert('class timetable data fail fetch'); }),

          $.get(_baseUrl + 'sportblackpoolclasslist/0',
              function (data, status) {
                  var counter = 1;
                  var ddl = data.sort();
                  $.each(ddl, function (i, item) {
                      $('#' + _dropdownId).append(listTag(counter, ddl[i]));
                      counter++;
                  });
                  venueOnChange();
              }
           ).fail(function () { alert('class timetable dropdown location fetch fail fetch'); }),

           $.get(_baseUrl + 'Classdescription',
              function (data, status) {
                  var counter = 1;
                  var temp = new Array();
                  $.each(data, function (i, item) {
                      var type = (data[i].type.length > 0) ? data[i].type[0] : ''
                      if (type == 'class') {
                          temp.push(data[i].entryTitle);
                      }
                  });
                  temp.sort();
                  $('#' + _dropdownClassId).append(listTag(-1, 'All'));
                  $.each(temp, function (i, item) {
                      $('#' + _dropdownClassId).append(listTag(counter, temp[i]));
                      counter++;
                  });
                  classOnChange();
              }
           ).fail(function () { alert('class timetable dropdown class type fetch fail fetch'); })
         ).then(function () {
             console.log('data clean up requests finished');
            setTimeout(function() {  _csbs.overlay(_overlayId, 0, ""); }, 1000);
         });
    };

    classtimetableservices.init = function (commonservices, csbs, overlayId) {
        console.log('run swimtimetable services init');
        _commonservices = commonservices;
        _overlayId = overlayId
        _csbs = csbs;
        getClassTimeTableData();
    };

   

})(window.classtimetableservices = window.classtimetableservices || {}, jQuery);
