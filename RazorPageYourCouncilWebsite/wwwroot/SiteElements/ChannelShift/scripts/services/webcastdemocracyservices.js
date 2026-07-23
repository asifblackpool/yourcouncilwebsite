(function (webcastservices, $, undefined) {
 
    var _table = null;
    var _table_wrapper_id = "table-wrapper";

var loader = function (loading){
    if (loading) {
        $("#meeting-loading-indicator").show();
        console.log('show loader');
    }
   else
   {
        $("#meeting-loading-indicator").hide();
        console.log('hide loader');
   }
};

var showHide = function (Id, state) {
   $("#" + Id).css('display', (state === 'hide') ? 'none' : 'block');
};

var populateTemplate = function (data) {

    var Id = "agenda-placeholder";
    var template = '';
    var counter = 0;
    

    var getAttendees = function (data) {

        var person = {
            memberId: '',
            name: '',
            roledescription: '',
            attendance: '',
            ward: '',
            politicalparty: ''
        };

        var obj = [];
        var counter = 0;

        if (data.attendee !== null && data.attendee.length > 0) {
            $.each(data.attendee, function (i, item) {

                //check if we want to deep copy object if counter > 0
                var pers = (counter === 0) ? person : $.extend(true, {}, person);
                pers.memberId = getJsonValue(item, "//@memberid");
                pers.name = getJsonValue(item, "//@name");
                pers.roledescription = getJsonValue(item, "//@roledescription");
                pers.attendance = getJsonValue(item, "//@attendance");
                pers.ward = getJsonValue(item, "//@ward");
                pers.politicalparty = getJsonValue(item, "//@politicalparty");
                obj.push(pers);
                counter++;
            });

            return obj;
        }
        return null;
    };

    var bindToAttendanceDataTable = function (data) {

        _table = $('#meeting-attendance').DataTable({
            data: data,
            "searching": false,
            columns: [
                { data: "memberId", visible: false },
               
                { data: "name" },
                { data: "roledescription" },
                { data: "attendance" }     
            ]
        });
    };

    var domInserted = function () {
        $('#' + Id).bind('DOMNodeInserted', function (e) {

           if (counter === 0) {
                //alert('detected');
                setTimeout(function () {
                    var attendees = getAttendees(data.attendees[0]);
                    bindToAttendanceDataTable(attendees);
                }, 2000);
            }

  
            counter++;
        });
    };

    var registerHandlebars = function () {
        template = Handlebars.compile($("#webcast-agenda-template").html());
        Handlebars.registerPartial("documents-partial", $("#documents-partial").html());
        Handlebars.registerPartial("documents-list-partial", $("#documents-list-partial").html());
    };

    $('#' + Id).html('');
    domInserted();
    registerHandlebars();

  

    var obj = returnListObjects(data.agendas[0].agendaitem);
    $('#agenda-placeholder').html(template({ apidata: data, apiagendas: obj }));

  
};

var loadMeeting = function (Id) {

    var meeting = {
        Id              : '',
        date            : '',
        date_description: '',
        status          : '',
        location        : '',
        startTime       : '',
        finishTime      : '',
        agendas         : null,
        attendees       : null
    };


    $.post(window.commonservices.Config().democracyUrl + 'Meeting/' + Id,
         {},
         function (data, status) {
             var dom = $.parseJSON(data);

             meeting.Id             = JSON.search(dom, "//meeting/meetingid", true);
             meeting.date           = JSON.search(dom, "//meeting/meetingdate", true);
             meeting.status         = JSON.search(dom, "//meeting/meetingstatus",true);
             meeting.location       = JSON.search(dom, "//meeting/meetinglocation",true);
             meeting.startTime      = JSON.search(dom, "//meeting/meetingtime",true);
             meeting.finishTime     = JSON.search(dom, "//meeting/meetingactualfinishtime", true);
             meeting.agendas        = JSON.search(dom, "//meeting/agendaitems", false);
             meeting.attendees      = JSON.search(dom, "//meeting/attendees",false);
      
           
             var dt = window.dateservices.convertToDate(getValue(meeting.date), "dd/mm/yyyy", "/");
             meeting.date_description = window.dateservices.formatDate(dt.getDay(), dt.getMonth(), dt.getFullYear());
             populateTemplate(meeting);
           
         }
      ).fail(function () {
          alert('democoracy meeting fail fetch for meeting Id '+ Id);
      });
};

var loadComittees = function () {

        console.log('load committees');
    $.get(window.commonservices.Config().democracyUrl + 'Committees',
             function (data, status) {
                 var dom = $.parseJSON(data);
                 var activeCommittees = JSON.search(dom, "//committee[committeeexpired='False']");
                 $.each(activeCommittees, function (i, item) {
                     $('#ddl-committees').append(listTag(item.committeeid, item.committeetitle));
                 });
                 bindDropDown();
             }
          ).fail(function () {
              alert('democoracy fail fetch');
          });

        var bindDropDown = function () {
            //bind link to event
            $('#ddl-committees li a').on('click', function (e) {
                //$(this).text();
                var Id = $(this).attr("id").split("_")[1];
                loader(true);
                loadMeetings(Id);
                e.preventDefault();
            });
        };

        var listTag = function (Id, value) {
            return "<li><a id='committeeId_" + Id + "' href='#'>" + value + "</a></li>";
        };
    };

var loadMeetings = function (Id) {

    console.log('load meetings');
    if (_table !== null) {
        _table.destroy();
        showHide(_table_wrapper_id,'hide');
    }
    loader(true);

    setTimeout(function () {
        post();
    }, 2000);

    var post = function() {
        $.ajax({
            type: "POST",
            url: window.commonservices.Config.democracyUrl + 'Meetings/' + Id,
            data: {},
            async:true,
            success: function (data, status) {
                console.log('ajax get meetings success');
                var dom = $.parseJSON(data);
                var webcast = JSON.search(dom, "//meeting[iswebcast = 'True']");
                bindToDataTable(webcast);
                loader(false);
                showHide(_table_wrapper_id, 'show');
            },
            error: function (request, status, err) {
                if (status === 'timeout')
                {
                    alert('failded from timeout');
                }
                alert('democoracy meetings fail fetch for committee Id ' + Id);
            },
            timeout: 3000,
        });
    };
 
    var bindToDataTable = function (data) {

        $.each(data, function (i, item) {
            item.meetingdate = window.dateservices.convertToDate(item.meetingdate, "dd/mm/yyyy", "/");
        });

       _table = $('#meetings').DataTable({
            data: data,
            columns: [
                { data: "meetingid", visible:false },
                {
                    data: "meetingdate",
                    "sType": "date-uk",
                    "mRender": function (data, type, row) {
                        return window.dateservices.DisplayDate(data, "dd/mm/yyyy");
                    }
                },
                { data: "meetingtime." },
                { data: "meetingstatus." },
                { data: "iswebcast" },
                {
                     "mRender": function (data, type, row) {
                         return '<a id="meetinglink_' + row.meetingid + ' href="#" onclick=webcastservices.showMeeting("' + row.meetingid + '");>Edit</a>';
                     }
                }
            ]
        });
    };

};

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

var getJsonValue = function(item, search)
{
    var n = JSON.search(item, search, false);

    if ((n !== null) && (n.length > 0))
    {
        return (n.length === 1) ? n[0] : n;
    }
    return null;
};

var getValue = function (item) {
    if (item !== null) {
        return (Array.isArray(item) && item.length > 0) ? item[0] : item;
    }

    return null;
};

var polyfillArray = function () {
    if (!Array.isArray) {
        Array.isArray = function (arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        };
    }
};

webcastservices.init = function () {
    polyfillArray();
    loader(false);
    loadComittees();
};

webcastservices.showMeeting = function (Id) {
    loadMeeting(Id);
};

webcastservices.showVideo = function () {

    console.log("call webchatservices -> showVideo()");
    var embedYoutubeLink = "https://www.youtube.com/embed/";

    $("a.you-tube-link").on("click", function (e) {
        console.log("click");

        var vid = $(".iframe-wrapper").find("iframe");

        var url = this.href;
        if (url !== null) {
            url = url.substring(url.lastIndexOf('/') + 1);
            url = embedYoutubeLink + url;
            vid[0].src = url + "&autoplay=1";
        }  
        e.preventDefault();
    });

};


})(window.webcastservices = window.webcastservices || {}, jQuery);





(function (webcastservices, $, undefined) {
 
    var _table = null;
    var _table_wrapper_id = "table-wrapper";

var loader = function (loading){
    if (loading) {
        $("#meeting-loading-indicator").show();
        console.log('show loader');
    }
   else
   {
        $("#meeting-loading-indicator").hide()
        console.log('hide loader');
   }
};

var showHide = function (Id, state) {
   $("#" + Id).css('display', (state === 'hide') ? 'none' : 'block');
};

var populateTemplate = function (data) {

    var Id = "agenda-placeholder";
    var template = '';
    var counter = 0;
    

    var getAttendees = function (data) {

        var person = {
            memberId: '',
            name: '',
            roledescription: '',
            attendance: '',
            ward: '',
            politicalparty: ''
        };

        var obj = new Array();
        var counter = 0;

        if (data.attendee != null && data.attendee.length > 0) {
            $.each(data.attendee, function (i, item) {

                //check if we want to deep copy object if counter > 0
                var pers = (counter == 0) ? person : $.extend(true, {}, person);
                pers.memberId = getJsonValue(item, "//@memberid");
                pers.name = getJsonValue(item, "//@name");
                pers.roledescription = getJsonValue(item, "//@roledescription");
                pers.attendance = getJsonValue(item, "//@attendance");
                pers.ward = getJsonValue(item, "//@ward");
                pers.politicalparty = getJsonValue(item, "//@politicalparty");
                obj.push(pers);
                counter++;
            });

            return obj;
        }
        return null;
    };

    var bindToAttendanceDataTable = function (data) {

        var div = document.getElementById("meeting-attendance");
      
        _table = $('#meeting-attendance').DataTable({
            data: data,
            "searching": false,
            columns: [
                { data: "memberId", visible: false },
               
                { data: "name" },
                { data: "roledescription" },
                { data: "attendance" }     
            ]
        });
    };

    var domInserted = function () {
        $('#' + Id).bind('DOMNodeInserted', function (e) {
            var element = e.target;

            if (counter === 0) {
                //alert('detected');
                setTimeout(function () {
                    var attendees = getAttendees(data.attendees[0]);
                    bindToAttendanceDataTable(attendees);
                }, 2000);
            }

  
            counter++;
        });
    };

    var registerHandlebars = function () {
        template = Handlebars.compile($("#webcast-agenda-template").html());
        Handlebars.registerPartial("documents-partial", $("#documents-partial").html());
        Handlebars.registerPartial("documents-list-partial", $("#documents-list-partial").html());
    };

    $('#' + Id).html('');
    domInserted();
    registerHandlebars();

  

    var obj = returnListObjects(data.agendas[0].agendaitem);
    $('#agenda-placeholder').html(template({ apidata: data, apiagendas: obj }));

  
};

var LoadMeeting = function (Id) {

    var meeting = {
        Id              : '',
        date            : '',
        date_description: '',
        status          : '',
        location        : '',
        startTime       : '',
        finishTime      : '',
        agendas         : null,
        attendees       : null
    };

    var search = function (data, searchStr, firstItem) {
        var obj = JSON.search(data, searchStr)

        if (obj !== null && obj.length > 0) {
            if (firstItem)
                return obj[0];

            return (obj.length < 2) ? obj[0] : obj;
        }

        return '';
    };


    $.post(commonservices.Config().democracyUrl + 'Meeting/' + Id,
         {},
         function (data, status) {
             var dom = $.parseJSON(data);

             meeting.Id             = JSON.search(dom, "//meeting/meetingid", true);
             meeting.date           = JSON.search(dom, "//meeting/meetingdate", true);
             meeting.status         = JSON.search(dom, "//meeting/meetingstatus",true);
             meeting.location       = JSON.search(dom, "//meeting/meetinglocation",true);
             meeting.startTime      = JSON.search(dom, "//meeting/meetingtime",true);
             meeting.finishTime     = JSON.search(dom, "//meeting/meetingactualfinishtime", true);
             meeting.agendas        = JSON.search(dom, "//meeting/agendaitems", false);
             meeting.attendees      = JSON.search(dom, "//meeting/attendees",false);
      
           
             var dt = dateservices.convertToDate(getValue(meeting.date), "dd/mm/yyyy", "/");
             meeting.date_description = dateservices.formatDate(dt.getDay(), dt.getMonth(), dt.getFullYear());
             populateTemplate(meeting);
           
         }
      ).fail(function () {
          alert('democoracy meeting fail fetch for meeting Id '+ Id);
      });
};

var loadComittees = function () {

        console.log('load committees');
    $.get(commonservices.Config().democracyUrl + 'Committees',
             function (data, status) {
                 var dom = $.parseJSON(data);
                 var activeCommittees = JSON.search(dom, "//committee[committeeexpired='False']");
                 $.each(activeCommittees, function (i, item) {
                     $('#ddl-committees').append(listTag(item.committeeid, item.committeetitle));
                 });
                 bindDropDown();
             }
          ).fail(function () {
              alert('democoracy fail fetch');
          });

        var bindDropDown = function () {
            //bind link to event
            $('#ddl-committees li a').on('click', function (e) {
                //$(this).text();
                var Id = $(this).attr("id").split("_")[1];
                loader(true);
                loadMeetings(Id);
                e.preventDefault();
            });
        };

        var listTag = function (Id, value) {
            return "<li><a id='committeeId_" + Id + "' href='#'>" + value + "</a></li>";
        };
    };

var loadMeetings = function (Id) {

    console.log('load meetings');
    if (_table !== null) {
        _table.destroy();
        showHide(_table_wrapper_id,'hide');
    }
    loader(true);

    setTimeout(function () {
        post();
    }, 2000);

    var post = function() {
        $.ajax({
            type: "POST",
            url: config.democracyUrl + 'Meetings/' + Id,
            data: {},
            async:true,
            success: function (data, status) {
                console.log('ajax get meetings success');
                var dom = $.parseJSON(data);
                var webcast = JSON.search(dom, "//meeting[iswebcast = 'True']");
                bindToDataTable(webcast);
                loader(false);
                showHide(_table_wrapper_id, 'show');
            },
            error: function (request, status, err) {
                if (status === 'timeout')
                {
                    alert('failded from timeout');
                }
                alert('democoracy meetings fail fetch for committee Id ' + Id);
            },
            timeout: 3000,
        });
    };
 
    var bindToDataTable = function (data) {

        $.each(data, function (i, item) {
            item.meetingdate = dateservices.convertToDate(item.meetingdate, "dd/mm/yyyy", "/");
        });

       _table = $('#meetings').DataTable({
            data: data,
            columns: [
                { data: "meetingid", visible:false },
                {
                    data: "meetingdate",
                    "sType": "date-uk",
                    "mRender": function (data, type, row) {
                        return dateservices.DisplayDate(data, "dd/mm/yyyy");
                    }
                },
                { data: "meetingtime." },
                { data: "meetingstatus." },
                { data: "iswebcast" },
                {
                     "mRender": function (data, type, row) {
                         return '<a id="meetinglink_' + row.meetingid + ' href="#" onclick=webcastservices.showMeeting("' + row.meetingid + '");>Edit</a>';
                     }
                }
            ]
        });
    };

    var clickTableRow = function()
    {
        $('#meetings tbody tr').on('click', function () {

            var oTable = $('#meetings').dataTable(); //get data table
        
            //var nTds = $('td', this);
            //var index = $(nTds[0]).text();
            var tre = $(this).closest('tr');
            var fid = oTable.fnGetData(tre, 0);
            alert(fid);
        });
    }

};

var returnListObjects = function (data) {

    var obj = new Array();
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

var getJsonValue = function(item, search)
{
    var n = JSON.search(item, search, false);

    if ((n !== null) && (n.length > 0))
    {
        return (n.length === 1) ? n[0] : n;
    }
    return null;
};

var getValue = function(item)
{
    if (item !== null) {
       return  (Array.isArray(item) && item.length > 0) ? item[0] : item;
    }

    return null;
}

var polyfillArray = function () {
    if (!Array.isArray) {
        Array.isArray = function (arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        };
    }
};

webcastservices.init = function () {
    polyfillArray();
    loader(false);
    loadComittees();

    //var _testdate = "16/05/2016"
    //var _date = dateservices.convertToDate(_testdate, "dd/mm/yyyy", "/");
    //alert('orig date is ' + _testdate + ' format date is now ' + dateservices.displayDate(_date, "/"));
};

webcastservices.showMeeting = function (Id) {
    LoadMeeting(Id);
};

webcastservices.showVideo = function () {

    console.log("call webchatservices -> showVideo()");
    var embedYoutubeLink = "https://www.youtube.com/embed/";

    $("a.you-tube-link").on("click", function (e) {
        console.log("click");

        var vid = $(".iframe-wrapper").find("iframe");

        var url = this.href
        if (url !== null) {
            url = url.substring(url.lastIndexOf('/') + 1);
            url = embedYoutubeLink + url;
            vid[0].src = url + "&autoplay=1";
        }  
        e.preventDefault();
    });

    var display = function (src) {
        $(".iframe-wrapper").find("iframe").remove();
        var iframe = $('<iframe src="' + src + '" frameborder="0" width="640" height="360"></iframe>');
        $(".iframe-wrapper").html(iframe);
        alert('added');
    };
};


})(window.webcastservices = window.webcastservices || {}, jQuery);





