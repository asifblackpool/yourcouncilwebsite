"use strict";
(function (timetableservices, $, undefined) {

    var _baseUrl            = '/custom/api/contenttype/entries/';
    var _apiSearchUrl       = null;
    var _tableId            = 'familyhubtimetable';
    var _dropdownId         = 'ddl-location';
    var _dropdownDayId      = 'ddl-day';
    var _dropdownClassId    = 'ddl-class'
    var _commonservices     = null;
    var _dateservices       = null;
    var _overlayId          = null;
    var _csbs               = null;
    var _table              = null;
    var _template           = '';
    var _list               = new Array();

    var dayEnum = { Mon: 1, Tues: 2, Weds: 3, Thurs: 4, Fri: 5, Sat: 6, Sun: 7 };

 
    function TimeTable(Id, title, location, time, day, dayId, address, moreinformation, sd, ed, tt,booking) {
        this.Id = Id;
        this.Title = title;
        this.Location = location;
        this.Time = time;
        this.Day = day;
        this.DayId = dayId;
        this.Address = address;
        this.MoreInformation = moreinformation;
        this.StartDate = sd;
        this.EndDate = ed;
        this.TermTime = tt;
        this.Booking = booking
    };

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

    var formatAddress = function (entry) {

        var address = ""
        if (entry !== null) {
            address = entry.venue;
            address = (entry.town !== null) ? address + "<br/>" + entry.address : "";
            address = (entry.town !== null) ? address + "<br/>" + entry.town : "";
            address = (entry.postCode !== null) ? address + "<br/>" + entry.postCode : "";
        }

        return address;
    };

    var formatMoreInformation = function (info) {
        var text = "";
        if (info !== null) {
            text = "<strong>{0}</strong><br/>".replace("{0}", info.title)
            text = text + info.longText;
        }

        return text;
    };

    var formatDate = function (dt) {
        return _dateservices.formatDateShort(dt.getDate(), dt.getMonth(), dt.getFullYear(), true);
    };

    var getRow = function (objthis) {

        var row = objthis.closest('tr');
        /* mobile view */
        if (row !== null && row[0].className === 'child') {
            var prev = row.prev();
            row = (_table.rows(prev).data())[0];
        }
        else {
            row = _table.row(objthis.parents('tr')).data();
        }

        return row;
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
                { data: 'Time' },
                { data: 'Day', visible: false },
                { data: 'DayId', visible: false },
                {
                    data: null,
                    "mRender": function (data, type, row) {
                        return '<a class="open-modal" data-toggle="modal" data-target="#myModal" href="#">' +
                            '<img src="/siteElements/channelshift/content/images/icons/timetables/info-icon-red.png" alt="information" style="width:20px; height:20px; margin-left:25px;" /></a>';
                    }
                },
                {
                    data: null,
                    "mRender": function (data, type, row) {
                        if (row.Booking !== null) {
                            return '<button class="class-booking bkg-red-color">Booking</button>';
                        }
                        else
                            return '';
                    }
                },
                { data: 'StartDate', visible: false },
                { data: 'EndDate', visible: false },
                { data: 'Booking', visible: false },

               
            ],
            order: [[5, 'asc'], [8, 'asc']],
            rowGroup: {
                dataSrc: 'Day'
            },
        });
    };

    var bindMoreInfoEvent = function () {

        var populatePopup = function () {
        
            var row = getRow($(this));

        
            $("h4.modal-title").html(row.Title)
            var data = _template;

            data = data.replace("{0}", formatDate(row.StartDate));
            data = data.replace("{1}", formatDate(row.EndDate));
            data = data.replace("{2}", row.Day);
            data = data.replace("{3}", row.Time);
            data = data.replace("{4}", row.TermTime);
            data = data.replace("{5}", row.Location);
            data = data.replace("{6}", row.Address);
            data = data.replace("{7}", row.MoreInformation);

            if (row.Booking === null) {
                data = data.replace("display:block;", "display:none;");
            }

            $('section.center-modal').html(data);
        };

        $('#' + _tableId).on('click', 'a.open-modal', populatePopup);
    };

    var bindBookingEvent = function () {

        var book = function () {
            var row = getRow($(this));
            window.location.href = (row.Booking === '#') ? "#" : row.Booking;
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

    var getTableData = function () {

        var venuedata = function () {
            var data = {
                "where": [
                    { "field": "sys.contentTypeId", "equalTo": "venue" },
                    { "field": "sys.versionStatus", "contains": "published" },
                    { "field": "venue", "contains": "hub" }
                ],
                "pageSize": 200,
                "pageIndex": 0,
                "orderBy": [{ "asc": "datePublished" }]
            };

            return JSON.stringify(data);
        };

        var venuedataDropDown = function (list) {

            const arrayOfStrings = ['central family hub', 'north family hub', 'south family hub'];
            var counter = 1;
            var ddl = list.sort();
            $('#' + _dropdownId).append(listTag(-1, 'All Venues'));
            $.each(ddl, function (i, item) {

                var str = ddl[i].venue;
                const found = isUndefined(arrayOfStrings.find(v => v.includes(str.toLowerCase())));
                if (found !== "") {
                    $('#' + _dropdownId).append(listTag(counter, ddl[i].venue));
                }
                counter++;
            });
            venueOnChange();
        };

        var titledataDropDown = function (list) {
            const ids = list.map(({ Title }) => Title);
            const filtered = list.filter(({ Title }, index) => !ids.includes(Title, index + 1));

            var counter = 1;
            var temp = new Array();
            $.each(filtered, function (i, item) {
                  temp.push(item.Title);    
            });
            temp.sort();
            $('#' + _dropdownClassId).append(listTag(-1, 'All'));
            $.each(temp, function (i, item) {
                $('#' + _dropdownClassId).append(listTag(counter, temp[i]));
                counter++;
            });
            classOnChange();
        };

        $.when(
            $.get(_baseUrl + 'familyHubEvents',
              function (data, status) {
                  var item = null;

                  if (data !== null) {
                      for (var i = 0; i < data.length; i++) {
                          item = data[i];
                          var location = (item.venue === null) ? "Unknown" : item.entry.venue;
                          var enddate = _dateservices.convertSQLDateWithoutTime(item.endDate);
                          var strdate = enddate.getDate() + "-" + enddate.getMonth() + "-" + enddate.getYear();
                          var futureDate = _dateservices.GreaterThanToday(strdate);
                          var booking = (item.booking === null) ? "#" : item.booking;
                          var termtimeonly = (item.termTimeOnly.length > 0) ? item.termTimeOnly[0] : "";
                          var days = item.day;

                          for (var j = 0; j < days.length; j++) {
                              _list.push(
                                  new TimeTable(
                                      item.sys.id + "_" + item.day[j],
                                      item.entryTitle,
                                      location,
                                      item.familyHub,
                                      item.day[j],
                                      getDayEnum(item.day[j]),
                                      formatAddress(item.entry),
                                      formatMoreInformation(item.moreInformation),
                                      _dateservices.convertSQLDateWithoutTime(item.startDate),
                                      enddate,
                                      termtimeonly,
                                      item.booking
                                  )
                              );        
                          }   
                      }
                      _template = $('section.center-modal').html();
                      bindDataTable(_list);
                      bindMoreInfoEvent();
                      bindPageEvent();
                      bindBookingEvent();
                      dayOnChange();
                  }
              }
           ).fail(function () { alert('family hub events timetable data fail fetch'); }),

            $.post(_apiSearchUrl, venuedata(),
                function (data, status) {
                    venuedataDropDown(data.items);
           
              }
           ).fail(function () { alert('family hub events timetable dropdown location fetch fail fetch'); })
        ).then(function () {
             titledataDropDown(_list);
             console.log('data clean up requests finished');

            setTimeout(function() {  _csbs.overlay(_overlayId, 0, ""); }, 1000);
         });
    };

    timetableservices.init = function (commonservices, dateservices,csbs, overlayId) {
        console.log('run fun family events services init');
        _commonservices = commonservices;
        _dateservices = dateservices;
        _apiSearchUrl = _commonservices.Config().deliveryApi.rootUrl + _commonservices.Config().deliveryApi.templateUrls.entriesSearch;
        _apiSearchUrl = _apiSearchUrl.replace("{0}", _commonservices.Config().deliveryApi.projectId);
        _overlayId = overlayId
        _csbs = csbs;
        getTableData();
    };

   

})(window.timetableservices = window.timetableservices || {}, jQuery);
