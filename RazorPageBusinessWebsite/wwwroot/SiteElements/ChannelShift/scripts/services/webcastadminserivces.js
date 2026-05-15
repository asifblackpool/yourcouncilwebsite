(function (webcastadminservices, $, undefined) {

    timestampBindClickTracker = false;
    editsavedeleteBindClickerTracker = false;
    dropdownBindTracker = false;

    var delimiter = '/';
    var bsv = null;
    var ddlcounter = 0;
    var submitcounter = 0;
    var helloUserId = 'hello-user';

    var video = {
        Id: 0,
        Title: '',
        VideoKey: '',
        DemocracyMeetingId: '',
        StartDateAndTime: '',
        isActive: null
    };

    var videoTimestamp = {
        Id: 0,
        Title: '',
        TimeStamp: 0,
        videoId: 0
    };


    var authenticatepage = function() {

        var hideShowLinks = function (authenticated, data) {

        if (authenticated) {
            $('#login-link').hide();
            $('#logout-link').show();
            $('#video-tab').show();
            $('#' + helloUserId).html(data);

         
            return;
        }
        //default behaviour
        $('#login-link').show();
        $('#logout-link').hide();
        $('#video-tab').hide();
        $('#timestamp-tab').hide();
        $('#' + helloUserId).html('');
    };

        var logoutClick = function() {

        var logOut = function () {

            // To invalidate a basic auth login:
            // 
            // 	1. Call this logout function.
            //	2. It makes a GET request to an URL with false Basic Auth credentials
            //	3. The URL returns a 401 Unauthorized
            // 	4. Forward to some "you-are-logged-out"-page
            // 	5. Done, the Basic Auth header is invalid now
            $.ajax({
                type: "POST",
                url: commonservices.Config().webCasting + "authenticate",
                async: false,
                username: "logmeout",
                password: "123456",
                headers: { "Authorization": "Basic xxx:yyy" }
            })
            .done(function () {
                // If we don't get an error, we actually got an error as we expect an 401!
                alert("If we don't get an error, we actually got an error as we expect an 401!");
            })
            .fail(function () {
                // We expect to get an 401 Unauthorized error! In this case we are successfully 
                // logged out and we redirect the user.
                hideShowLinks(false);
                //window.location = "/help";
            });

            return false;
        };

        $('#logout-link').on('click', function (evt) {
            logOut();
            evt.preventDefault();
            evt.stopPropagation();
        });
    };

        var loginClick = function () {
        var authenticate = function () {
            $.ajax({
                type: "POST",
                url: commonservices.Config().webCasting + 'authenticate',
                async: true,
                success: function (data, status) {
                    console.log('ajax authentication success ' + data);
                    checkloginstatus();
                },
                error: function (request, status, err) {
                    //alert('ajax authentication error');
                    hideShowLinks(false,null);
                }
            });
        };

        $('#login-link').on('click', function (evt) {
            authenticate();
            evt.preventDefault();
            evt.stopPropagation();
        });
    };

        var checkloginstatus = function () {
      
        console.log('check login status');
        $.ajax({
            type: "GET",
            url: commonservices.Config().webCasting + 'loggedIn',
            async: true,
            success: function (data, status) {
                console.log('ajax LoggedIn success ' + data);
                hideShowLinks(true,data);
            },
            error: function (request, status, err) {
                //alert('ajax authentication error');
                console.log('ajax logged in fail');
                hideShowLinks(false,null);
            } 
        });
        };

         authenticatepage.init = function () {

            loginClick();
            logoutClick();
            checkloginstatus();
        };

         authenticatepage.init();
    };

    var resetVideo = function () {
        video.Id = 0;
        video.Title = video.VideoKey = video.DemocracyMeetingId = '';
        video.StartDateAndTime = '';
        video.isActive = null;
    };

    var listTag = function (Id, value) {
        return "<li><a id='videos_" + Id + "' href='#'>" + value + "</a></li>";
    };

    var shortenedString = function (text, len) {
        var stringArray = text.split(/(\s+)/);
        if (stringArray != null && stringArray.length >= len) {
            var txt_shortened = "";
            $.each(stringArray, function (i, val) {
                txt_shortened = (i == 0) ? val : txt_shortened + val;
            });
            return txt_shortened;
        }
        return text;
    };

    var clearTemplate = function () {
        $('#webcast-video').html('');
        $("#video-message").html('');
    };

    var populateTemplate = function (data) {

        template = Handlebars.compile($("#webcast-add-edit-template").html());
        $('#webcast-video').html(template({ apidata: data }));
        $('#videoId').val(data.Id);
        console.log('template loaded');
        console.log('validate video form ');
        validateVideoform();
        submitcounter = 0;
        ddlcounter++;
    };

    var getVideoById = function (id) {
        $.get(commonservices.Config().webCasting + 'Video/' + id,
                function (data, status) {
                    console.log('get video by id success');
                    populateTemplate(data);
                    $('#StartDateTime').datetimepicker({
                        showSecond: false,
                        timeFormat: 'HH:mm:ss',
                        dateFormat: 'dd-mm-yy'
                    }).datetimepicker('setDate', dateservices.convertSQLDate(data.StartDateAndTime));

                }
             ).fail(function () {
                 alert('get video by Id fail fetch');
             });
    };

    var dropdownList = function () {

        var counter = 0;
        var dropdownId = "ddl-videos";

        var getVideos = function () {

            $('#' + dropdownId).html('');
            $('#' + dropdownId).append(listTag(0, "Add New Video "));

            console.log('populate dropdown')
            $.get(commonservices.Config().webCasting + 'allVideos',
                    function (data, status) {
                          $.each(data, function (i, item) {
                              $('#' + dropdownId).append(listTag(item.Id, shortenedString(item.Title,5)));
                        });
                        bindDropDown();
                    }
                 ).fail(function () {
                     console.log('all videos fail fetch');
                     bindDropDown();
             });
        };

        var bindDropDown = function () {
            //bind link to event   
           
            $('#ddl-videos li a').off("click");
            $('#ddl-videos li a').on('click', function (e) {
      
                var Id = $(this).attr("id").split("_")[1];
                var title = $(this).text();
                var text = (parseInt(Id) > 0)
                    ? "<strong>Edit Video</strong> - " + $(this).text() : "<strong>Add New Video</strong>";
                clearTemplate();
                $('.add-edit-video').html(text);
                $('#videoId').val(Id);
                $('#video-container').show();
                $('#selectedVideoId').val(Id);
                
                if (parseInt(Id) > 0) {
                    getVideoById(parseInt(Id));

                    console.log('dropdown onchange videoId ' + Id + ' ' + text  + 'call timestamp');
                    timeStamps(Id);
                    $('#timestamp-tab').show();
                }
                else {
                    resetVideo();
                    populateTemplate(video)
                    $('#timestamp-tab').hide();
                }
                e.preventDefault();
            });
        };

        //public methods
        this.load = function () { getVideos(); }
    };

    var validateVideoform = function () {

        var submitNewVideo = function () {

            console.log('submit form -> submitNewVideo()');
            var new_obj = {}

            $.each($('#webcast-video').serializeArray(), function (i, obj) {
                new_obj[obj.name] = obj.value
            })
            video.Id                 = parseInt(new_obj["videoId"]);
            video.Title              = new_obj["VideoTitle"];
            video.VideoKey           = new_obj["VideoKey"];
            video.DemocracyMeetingId = new_obj["MemberId"];
            video.StartDateAndTime   = new_obj["StartDateTime"];
            video.isActive           = new_obj["inlineRadioOptions"] === "1" ? true : false;

            new_obj = null;

            console.log('form data is ' + video);
            video.StartDateAndTime = dateservices.convertStringDate(video.StartDateAndTime);

            $.ajax({
                type: "POST",
                url: commonservices.Config().webCasting + 'AddVideo',
                data: JSON.stringify(video),
                contentType: "application/json",
                async: true,
                success: function (data, status) {
                    console.log('ajax add video success' + data);
                    clearTemplate();
                    getVideoById(data.Id);
                    //timeStamps(data.Id);
                    (new dropdownList()).load(); //re-populate the dropdown lis
                    $('#timestamp-tab').show();
                    $('#videoId').val(data.Id);
                    addmessage('Video has been saved successfully.');
                    timeStamps(data.Id);
                    $('#selectedVideoId').val(data.Id);
                },
                error: function (request, status, err) {   
                    addmessage('Oops something went wrong video not saved.');
                }
            });

        };

        var bindDatepicker = function () {

            var validate_datepicker = function (dt) {
                $('#webcast-video')
                      .bootstrapValidator('updateStatus', 'StartDateTime', 'VALIDATED')
                      .bootstrapValidator('validateField', 'StartDateTime');
            };

            $("#StartDateTime").datetimepicker({
                dateFormat: "dd-mm-yy",
                timeFormat: 'HH:mm:ss',
                onSelect: function (selectedDateTime) { validate_datepicker(selectedDateTime); },
                onClose: function (selectedDateTime) { validate_datepicker(selectedDateTime); }
            });
        }; //end of bindDatePicker function

        var bindvalidataor = function () {

            //check if validator has been created
            if (bsv !== null) {
                //if created reset the form data
                // $('#webcast-video').data('bootstrapValidator').isvalid();
                //$('#webcast-video').bootstrapValidator('resetForm', true);
                $('#webcast-video').data('bootstrapValidator', null);
            }
            
            bsv = $('#webcast-video').bootstrapValidator({

                feedbackIcons: {
                    valid: 'glyphicon glyphicon-ok',
                    invalid: 'glyphicon glyphicon-remove',
                    validating: 'glyphicon glyphicon-refresh'
                },
                fields: {
                    VideoTitle: {
                        validators: {
                            notEmpty: {
                                message: 'The video title is required and cannot be empty'
                            },
                            stringLength: {
                                max: 200,
                                message: 'The title must be less than 100 characters long'
                            }
                        }
                    },
                    VideoKey: {
                        validators: {
                            notEmpty: {
                                message: 'The video title is required and cannot be empty'
                            },
                            stringLength: {
                                max: 200,
                                message: 'The title must be less than 100 characters long'
                            }
                        }
                    },
                    StartDateTime: {
                        
                        validators: {
                            notEmpty: {
                                message: 'The date is required'
                            }
                        }
                    },
                    MemberId: {
                        validators: {
                            integer: {
                                message: 'The value is not an integer'
                            },
                            greaterThan: {
                                value: 1,
                                message: 'The value must be greater than zero'
                            }
                        }
                    },
                    inlineRadioOptions: {
                        validators: {
                            notEmpty: {
                                message: 'Please select a isActive radio button'
                            }
                        }
                    }
                },
                submitHandler: function (validator, form, submitButton) {
                    
                    //var isvalid = $('#webcast-video').data('bootstrapValidator').isvalid();
                    submitcounter++;
                    console.log('submit counter ' + submitcounter);
                    console.log('drop down counter ' + ddlcounter)

                    /* 
                      hack to solve multiple submits we want to submit on the last submit
                      using a counter to track how many submits we get this will be the same 

                    */
                    if (submitcounter == ddlcounter)
                    {
                        submitNewVideo();
                        submitcounter = 0;
                    }
                },
                destroy: function () { console.log('destroy');}

            });

        }; //end of bind validator 

        var addmessage = function (text) {
            $("#video-message").html('<strong>' + text + '</strong>')
        }

        //calls
        console.log('bindDatepicker');
        bindDatepicker();
        console.log('bind validator');
        bindvalidataor();

    }; //end of validate video form

    var timeStamps = function (videoId) {

        var _tableId    = "timestamp";
        var _table      = null;
        var state       = { del: 'Delete', add: 'Add', update: 'Update' };

        var clickEvents = function () {

            var formId          = "timestamp-video";
            var templateId      = "webcast-timestamp-template";
            var messageId       = "timestamp-message";
            var dateinputId     = "Time";
            var timestampId     = "timestamp-Id";
            var timestampvideoId= "timestamp-videoId";
            var savetimestampId = "save-timestamp";
            var addnewId        = "addnew-timestamp";


            var activateformButton = function (isActive) {
                $("#save-timestamp").attr("disabled", isActive); //stop button from being loaded twice;
            };

            var editdeleteClick = function () {

                if (!editsavedeleteBindClickerTracker) {
                    //alert('bind click once');
                    $("#" + _tableId + " tbody").on("click", "tr a.row_edit", function (e)   {     formLoad(this, state.update, e);  });
                    $("#" + _tableId + " tbody").on("click", "tr a.row_remove", function (e) {     formLoad(this, state.del, e);     });
                    $('#' + addnewId).on("click", function (e) { formLoad(this, state.add, e); });
                    editsavedeleteBindClickerTracker =true;
                }
 
                var formLoad= function (obj, mode,e) {
                   
                    var resetVideoStamp = function () {
                        videoTimestamp.Id = 0;
                        videoTimestamp.Title = '';
                        videoTimestamp.TimeStamp = 0;
                        videoTimestamp.videoId = parseInt($('#selectedVideoId').val());

                        //alert($('#selectedVideoId').val());
                        return videoTimestamp;

                    };

                    var clearTemplate = function () {
                        $('#' + formId).html('');
                        $("#" + messageId).html('');
                    };

                    var populateTemplate = function (data, mode) {
                        template = Handlebars.compile($("#" + templateId).html());
                        $('#' + formId).html(template({ apidata: data, apimode: mode }));
                        $('.modal-title').html('<strong>' + mode + ' Timestamp Video</strong>')
                    };

                    var bindFieldToTimePicker = function (Id) {
                        $("#" + Id).timepicker({
                            template:'modal',
                            timeFormat: 'HH:mm:ss'  
                        });
                        function timepickerValidator(Id) { }
                    };

                    var launchModal = function () {

                        $("#myModal").modal({
                            backdrop: 'static'
                        });
                        activateformButton(false); //set to false enables the button
                    };
                     
                    var tablerowData = $('#' + _tableId).dataTable().fnGetData($(obj).closest('tr'));
                    resetVideoStamp();
                    clearTemplate();
                    if (mode === state.add){
                        populateTemplate(videoTimestamp, mode);
                        bindFieldToTimePicker(dateinputId);
                        $("#" + timestampId).val(videoTimestamp.Id);
                        $("#" + timestampvideoId).val(videoTimestamp.videoId);
                        $("#" + dateinputId).timepicker('setTime', dateservices.FormatSeconds(videoTimestamp.TimeStamp));
                    }
                    else {
                        populateTemplate(tablerowData, mode);
                        bindFieldToTimePicker(dateinputId);
                        $("#" + timestampId).val(tablerowData.Id);
                        $("#" + timestampvideoId).val(tablerowData.VideoId);
                        $("#" + dateinputId).timepicker('setTime', dateservices.FormatSeconds(tablerowData.TimeStamp));
                    }
                    
             
                    launchModal();
                    e.stopPropagation();
                    e.preventDefault();

                }; //end run click

                var AjaxAddRemoveCalls = function () {

                    var addMessage = function (text) {
                     $("#" + messageId).html('<strong>' + text + '</strong>');
                 };

                    var add = function () {
  
                    console.log('submit timestamp -> add()');
                    var new_obj = {};
                    $.each($('#' + formId).serializeArray(), function (i, obj) {
                        new_obj[obj.name] = obj.value
                    })
                    videoTimestamp.Id           = new_obj["timestamp-Id"]
                    videoTimestamp.Title        = new_obj["Title"];
                    videoTimestamp.videoId      = new_obj["timestamp-videoId"];
                    videoTimestamp.TimeStamp    = new_obj["Time"];
                    new_obj = null;

                    videoTimestamp.TimeStamp = dateservices.ConverToSeconds(videoTimestamp.TimeStamp);
                    
                    $.ajax({
                        type: "POST",
                        url: commonservices.Config().webCasting + 'AddVideoTimeStamp',
                        data: JSON.stringify(videoTimestamp),
                        contentType: "application/json",
                        async: true,
                        success: function (data, status) {
                            console.log('ajax add timestamp success' + data);

                            //$('#' + _tableId).dataTable().fnDestroy();
                            bindToTimeStampTable(videoTimestamp.videoId);
                            addMessage('video timestamp has been saved successfully.');
                        },
                        error: function (request, status, err) {
                            addMessage('oops something went wrong video timestamp not saved.')
                        }    
                    });
                };

                    var remove = function () {

                     var new_obj = {};
                     $.each($('#' + formId).serializeArray(), function (i, obj) {
                         new_obj[obj.name] = obj.value
                     })
                     videoTimestamp.Id          = new_obj["timestamp-Id"]
                     videoTimestamp.Title       = new_obj["Title"];
                     videoTimestamp.videoId     = new_obj["timestamp-videoId"];
                     videoTimestamp.TimeStamp   = new_obj["Time"];
                     new_obj = null;

                     videoTimestamp.TimeStamp = dateservices.ConverToSeconds(videoTimestamp.TimeStamp);
                    $.ajax({
                        type: "POST",
                        url: commonservices.Config().webCasting + 'DeleteVideoTimeStamp',
                        data: JSON.stringify(videoTimestamp),
                        contentType: "application/json",
                        async: true,
                        success: function (data, status) {
                            console.log('ajax add timestamp success ' + data);
                            //if (_table === null)
                            //    _table = $('#timestamp').DataTable();

                            //_table.ajax.reload();
                            bindToTimeStampTable(videoTimestamp.videoId);
                            addMessage('video timestamp has been deleted successfully.');
                        },
                        error: function (request, status, err) {
                            addMessage('oops something went wrong video timestamp not deleted.');
                        }
                    });
                 };

                    var bindClickOnceAgain = function () {
                     timestampBindClickTracker = true;
                     $('#' + savetimestampId).on("click", function (e) {
                         $('#timestamp-mode').val() === state.del ? remove() : add();
                         console.log('fired once only');
                     });
                 };

                    //stop multimple clicks - we only want to bind the id once.
                    if (!timestampBindClickTracker) {
                         bindClickOnceAgain();
                    }
                };

             console.log('bind edit delete clicks');
             AjaxAddRemoveCalls();
         }; //end of table row events


            editdeleteClick();
        };
        
        console.log('timestamp(vId) -> run bindToTimeStampTable with videoId ' + videoId)
        bindToTimeStampTable(videoId);
        clickEvents();
    };//end of timeStamps

    var bindToTimeStampTable = function (vId) {

        $('#timestamp').dataTable().fnDestroy(); //destroy data before re-initialising
        _table = $('#timestamp').DataTable({
            'ajax': {
                "type": "GET",
                "url": commonservices.Config().webCasting + 'allVideosTimeStamp?videoId=' + vId,
                "data": function (d) {

                },
                "dataSrc": ""
            },
            "searching": false,
            columns: [
                { data: "Id", visible: false },
                { data: "Title" },
                {
                    data: "TimeStamp",
                    "mRender": function (data, type, row) {
                        return dateservices.FormatSeconds(data);
                    }
                },
                { data: "VideoId", visible: false },
                {
                    data: null,
                    className: "center",
                    "mRender": function (data, type, row) {
                        return '<a id="{0}" href="#" class="row_edit">Edit</a> / <a id="delete_{0}"  href="" class="row_remove">Delete</a>'.replace("{0}", data.Id)
                    }
                }
            ]
        });
    };
  
    webcastadminservices.init = function () {
        console.log('webcastadminservices --> init() called');
        authenticatepage();
        (new dropdownList()).load();
    };

})(window.webcastadminservices = window.webcastadminservices || {}, jQuery);





