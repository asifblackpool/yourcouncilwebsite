"use strict";
(function (swimtimetableservices, $, undefined) {

    var _baseUrl    = '/custom/api/contenttype/entries/';
    var _tableId    = 'swimtimetable';
    var _dropdownId = 'ddl-location';
    var _dropdownDayId = 'ddl-day';
    var _dropdownClassId = 'ddl-class';
    var _overlayId  = null;
    var _csbs       = null;
    var _table      = null;
    var _list       = new Array();
    var _location   = new Array();
    var _template   = "";

    var dayEnum = { Mon: 1, Tues: 2, Weds: 3, Thurs: 4, Fri: 5, Sat: 6, Sun: 7 };

    function PoolTimes(Id, title, day, venue, opentime,time, dayId, lanes, pools, description, publicswimming) {
        this.Id = Id;
        this.Title = title;
        this.Day = day;
        this.Location = venue;
        this.OpenTime = opentime
        this.Time = time;
        this.DayId = dayId;
        this.Lanes = lanes;
        this.Pools = pools;
        this.Description = description;
        this.PublicSwimming = publicswimming;
    }

    var listTag = function (Id, value) {
        return "<li><a id='item_" + Id + "' href='#'>" + value + "</a></li>";
    };

    var isUndefined = function (s) {
        return (typeof s == "undefined" || s === null) ? "" : s;
    };

    var mockData = function () {

      
         _list.push(new swimTimeTable('1', 'Swim 4 Health', 'Monday', '08:45am - 09:15pm', 'Moor Park', dayEnum.Mon));
         _list.push(new swimTimeTable('2', 'Tiny TadPoles', 'Monday', '09:15 - 10:30', 'Moor Park', dayEnum.Mon));
         _list.push(new swimTimeTable('3', 'Adult Waders', 'Tuesday', '10:45 - 11:15', 'Moor Park', dayEnum.Tues));
         _list.push(new swimTimeTable('4', 'Advanced Tiddlers', 'Tuesday', '13:30 - 14:00', 'Moor Park', dayEnum.Tues));
         _list.push(new swimTimeTable('5', 'Swim Clinic', 'Thursday', '08:45 - 09:15', 'Moor Park', dayEnum.Thurs));
         _list.push(new swimTimeTable('6', 'Stage1', 'Friday', '10:45 - 11:15', 'Moor Park', dayEnum.Fri));
         _list.push(new swimTimeTable('7', 'Stage2', 'Friday', '10:45 - 11:15', 'Moor Park', dayEnum.Fri));
         _list.push(new swimTimeTable('8', 'Swim 4 Health', 'Monday', '10:45 - 11:15', 'Palatine', dayEnum.Mon));
         _list.push(new swimTimeTable('9', 'School Swimming', 'Tuesday', '13:30 - 14:00', 'Palatine', dayEnum.Tues));
         _list.push(new swimTimeTable('10', 'Stage 1', 'Friday', '18:45 - 19:15', 'Palatine', dayEnum.Fri));
         _list.push(new swimTimeTable('11', 'Stage 2', 'Friday', '19:15 - 19:45', 'Palatine', dayEnum.Fri));

        _location.push("Moor Park");
        _location.push("Palatine");

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

    var bindDataTable = function (data) {

        _table = $('#' + _tableId).DataTable({
            responsive: true,
            data: data,
            "searching": true,
            columns: [
                { data: 'Id', visible: false },
                { data: 'Title' },
                { data: 'Location' },
                { data: 'Lanes', visible:false },
                { data: 'Time' },
                { data: 'Day' , visible : false },
                { data: 'DayId', visible: false },
                {
                    data: null,
                    "mRender": function (data, type, row) {
                        return '<a class="open-modal" data-toggle="modal" data-target="#myModal" href="#">' +
                            '<img src="/siteElements/channelshift/content/images/sport-blackpool/info-icon-blue.png" alt="information" style="width:20px; height:20px; margin-left:25px;" /></a>';
                    }
                },
                { data: 'Pools', visible: false },
                { data: 'Description', visible: false },
                { data: 'PublicSwimming', visible: false },
                { data: 'OpenTime', visible: false }
            ],
            order: [[5, 'asc'], [11, 'asc']],
            rowGroup: {
                dataSrc: 'Day'
            },
        });
    };

    var venueOnChange = function () {
        $('#'+ _dropdownId + ' li a').on('click', function (e) {

            var value      = $(this).attr("id").split("_")[1];
            var text = $(this).text();

            if (value != "-1") {
                _table.column(2).search(text).draw();
                $("span.selected-location").html(text);
            } else {
                _table.search('').columns().search('').draw();
                $("span.selected-location").html('');
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
                _table.column(5).search(text).draw();
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

    var getLanes = function(lanes) {
  
        var laneText = "";
        if (lanes !== null) {
            for (var i = 0; i < lanes.length; i++) {
                var temp = (i > 0 ) ?  " " + lanes[i]:  lanes[i];
                laneText = laneText + temp;
            }
        }

        return laneText
    };

    var getPools = function(pools) {
  
        var poolText = "";
        if (pools !== null) {
            for (var i = 0; i < pools.length; i++) {
                var temp = (i > 0 ) ?  "," + pools[i]:  pools[i];
                poolText = poolText + temp;
            }
        }

        return poolText
    };

    var getSwimTimeTableData = function () {

        $.when(
          $.get(_baseUrl + 'blackpoolswimpooltimes',
              function (data, status) {
                  var item = null;
                  var bookingTime = null;
            
                  if (data !== null) {
                      for (var i = 0; i < data.length; i++) {
                          item = data[i];
                          var description = (item.description === null) ? "" : item.description.description;
                          bookingTime       = item.bookingTime;
                          var location      = (item.venue === null) ? "Uknown" : item.venue.venue;
                          var days          = bookingTime.days;
                          var ps = (item.publicSwimming) ? "Yes" : "No";
                          console.log("public swimming " + ps)
                          if (days.length > 0 ) {
                              for (var j = 0; j < days.length; j++) {
                                  _list.push(new PoolTimes(item.sys.id, item.title, days[j], location, bookingTime.openingTime,
                                                 formatBookingTime(bookingTime.openingTime, bookingTime.closingTime),
                                                 getDayEnum(bookingTime.days[0]), getLanes(item.lane), getPools(item.pool),
                                                 description, ps));
                              }
                          }
                         // sanity check does day exist if not remove
                         if ( getDayEnum(bookingTime.days[0]) === 0) {  
                            _list.pop(); 
                         }
                      }
                      _template = $('section.center-modal').html();
                      bindDataTable(_list);
                      bindMoreInfoEvent();
                      bindPageEvent();
                      dayOnChange();
                 
                  }
              }
           ).fail(function () {
               alert('pool timetable fail fetch');
           }),
            $.get(_baseUrl + 'blackpoolswimpooltimes/1',
              function (data, status) {   
                  var counter = 1;
                  $('#' + _dropdownId).append(listTag(-1, 'All'));
                  $.each(data, function (i, item) {
                      $('#' + _dropdownId).append(listTag(counter, data[i]));
                      counter++;
                  });
                  venueOnChange();
              }
           ).fail(function () {
               alert('pool timetable dropdown fetch fail fetch');
           }),
        $.get(_baseUrl + 'Classdescription',
              function (data, status) {
                  var counter = 1;
                  var temp = new Array();
                  $.each(data, function (i, item) {
                      var type = (data[i].type.length > 0) ? data[i].type[0] : '';
                      var isActive = (data[i].type.length > 0) ? data[i].isActive : false;
                      if (type == 'swim' && isActive) {
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
           ).fail(function () { alert('pool timetable class descripton dropdown class type fetch fail fetch'); })
         ).then(function () {
             console.log('data clean up requests finished');
             setTimeout(function() {  _csbs.overlay(_overlayId, 0, ""); }, 1000);
         });
    };

    var bindMoreInfoEvent = function () {

        var populatePopup = function() {
             var row = $(this).closest('tr');
            /* mobile view */
            if (row !== null && row[0].className === 'child')  {
                  var prev = row.prev();
                  row = (_table.rows(prev).data())[0];
            }
            else {
               row = _table.row($(this).parents('tr')).data();
            }

            $("h4.modal-title").html(row.Title)
            var data = _template;

            data = data.replace("{0}", row.Location);
            data = data.replace("{1}", row.Lanes);
            data = data.replace("{2}", row.Pools);
            data = data.replace("{3}", row.Day);
            data = data.replace("{4}", row.Time);
            data = data.replace("{5}", row.PublicSwimming);

            $('section.center-modal').html(data);
        };

        $('#' + _tableId).on('click', 'a.open-modal', populatePopup);
    };

    var bindPageEvent = function () {
        $('#' + _tableId).on('page.dt', function () {
            bindMoreInfoEvent();
        });
    };

    swimtimetableservices.init = function (csbs, overlayId) {
        console.log('run swimtimetable services init'); 
        _overlayId = overlayId;
        _csbs = csbs;
        getSwimTimeTableData();
    };

})(window.swimtimetableservices = window.swimtimetableservices || {}, jQuery);
