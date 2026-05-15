(function (webcastvideoservices, $, undefined) {

    var youtube_url_tmeplate = 'https://www.youtube.com/embed/{0}?start={1}{2}';
    var democracy_url_template = 'http:/' + '/democracy.blackpool.gov.uk/ielistdocuments.aspx?CId=134&MId={0}';

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

    var showVideos = function () {
        console.log("call webchatservices -> showVideo()");
        var embedYoutubeLink = "https://www.youtube.com/embed/";

        //create you tube link 
        $("a.you-tube-link").on("click", function (e) {
            console.log("click");

            var vid = $(".iframe-wrapper").find("iframe");

            var url = this.href;
            if (url !== null) {
                url = url.substring(url.lastIndexOf('/') + 1);
                url = embedYoutubeLink + url;
                vid[0].src = url + "&autoplay=1";
                vid[0].width = 900;
            }
            window.scrollerservice.ScrollToByClass('iframe-wrapper', e);
            e.preventDefault();
        });
    };

    var removeTrailingZeros = function (time) {

        if (time.length === 8) {
            time = time.replace("00:00:00", "");
        }

        if (time.length > 3) {
            var prefix = time.substring(0, 3);
            if (prefix === '00:') {
                return time.substring(3, time.length);
            }
        }
        return time;
    };
    
    var getVideos = function () {

        var timestamp = {
            link        :'',
            text        :''
        };

        var linkBuilder = { link: '', text: '' };
        var currentVideo = null;
        var currentVideoTimestamps = [];

        var displayCurrentVideo = function (src) {
            var iframe = $('<iframe id="iframe-webcast" src="' + src + '" frameborder="0" allowfullscreen="allowfullscreen" width="100%"></iframe>');
            $(".iframe-wrapper").html(iframe);
        };

        var populateTemplate = function (videodata, timestampdata, democracydata, current) {
            //register the handle bar template 
            var defaultvideo = { isLatest: current, Id: $('#current-hidden-videoId').val(), Title: $('#current-hidden-title').val() };
            var template = Handlebars.compile($("#webcast-video-timestamp-template").html());
            $('#webcast-video-placeholder').html(template({ apivideodata: videodata, apitimestampdata: timestampdata, democracy: democracydata, apidefault: defaultvideo }));
            $("#iframe-loading-indicator").hide();
            showVideos();
        };

        var populateTemplateLinks = function (data) {
            var template = Handlebars.compile($("#webcast-video-links-template").html());
            $('#webcasts-links-placeholder').html(template({ apidata: data }));
        };

        var clearTemplate = function () {
            $('#webcasts-video-placeholder').html('');
            $("#iframe-loading-indicator").show();
            $(".iframe-wrapper").find("iframe").remove();

        };

        var videoAndTimeStampBuilder = function (video, isLatest) {

            var democracyUrl = "";
            //check we have an array with no data - so lets clear it
            while (currentVideoTimestamps.length > 0) {
                currentVideoTimestamps.pop();
            }
            if (video !== null) {
                $('#current-title').html(video.Title);
                
                if (video.DemocracyMeetingId > 0) {
                    democracyUrl = democracy_url_template.replace('{0}', video.DemocracyMeetingId);
                }
                displayCurrentVideo(youtube_url_tmeplate.replace('{0}', video.VideoKey).replace('{1}', 0).replace('{2}', ""));

                if (video.TimeStamps.length > 0) {
                    var counter = 1;
                    $.each(video.TimeStamps, function (index, item) {
                        var ts = $.extend({}, timestamp); //create a shallow copy (so data not overwritten
                        var time = removeTrailingZeros(window.dateservices.FormatSeconds(item.TimeStamp));
                        ts.title = counter + ". " + item.Title + ' ' + time;
                        if (time !== "") {
                            ts.link = youtube_url_tmeplate.replace('{0}', video.VideoKey).replace('{1}', item.TimeStamp).replace('{2}', ";autoplay=1");
                        } else {
                            ts.link = "";
                        }
                        currentVideoTimestamps.push(ts);
                        counter++;
                    });
                }

                linkBuilder.link = democracyUrl;
                linkBuilder.text = democracyUrl.replace('http://', '');
                populateTemplate(video, currentVideoTimestamps, linkBuilder, isLatest);
                democracyUrl = "";
            }
        };

        var getVideoById = function (Id) {
            //check if current 
            var currentVideoId = $('#current-hidden-videoId').val();
            var isLatest = (parseInt(currentVideoId) === parseInt(Id)) ? true : false;
            clearTemplate();
            $.get(window.commonservices.Config().webCasting + 'Video/' + Id,
                   function (data, status) {
                       console.log('get video by id success');
                       var videos = returnListObjects(data);
                       var video = (videos.length > 0) ? videos[0] : null;
                       setTimeout(function () {
                           videoAndTimeStampBuilder(video, isLatest);
                           bindLinks();
                       }, 3000);

                   }
                ).fail(function () {
                    alert('get video by Id fail fetch');
                });
        };

        var getAllVideos = function () {

           Date.prototype.addDays = function (days) {
                this.setDate(this.getDate() + parseInt(days));
                return this;
            };

            //check 7 days in advance
            var todaysDate  = window.dateservices.DisplayDate((new Date().addDays(7)), "yyyy-mm-dd");

            console.log('get video by date');
            clearTemplate();
            $.get(window.commonservices.Config().webCasting + 'allVideosByDate/' + todaysDate,
                function (data, status) {
                    var videos = returnListObjects(data);
                    console.log('ajax status is ' + status);
                    currentVideo = (videos.length > 0) ? videos[0] : null;

                    if (currentVideo !== null) {
                        //set hidden fields
                        $("#current-hidden-videoId").val(currentVideo.Id);
                        $("#current-hidden-title").val(currentVideo.Title);
                        setTimeout(function () {
                            videoAndTimeStampBuilder(currentVideo, true); 
                        }, 3000);

                    }

                    if (videos.length > 0) {
                            videos.shift();
                            populateTemplateLinks(videos);
                            bindLinks(); // make a tags clickable
                    }
                }
             ).fail(function (jqXhr, textStatus, errorThrown) {
                 //alert('get webcast videos fail fetch');
                if (jqXhr.getResponseHeader('Content-Type').indexOf('application/json') > -1) {
                // only parse the response if you know it is JSON
                        var error = $.parseJSON(jqXhr.responseText);
                        alert(error.Message);
                } else {
                        alert('Fatal error');
            }
             });
        };

        var bindLinks = function () {
            $("a.other-webcast-link").on("click", function (e) {
                var Id = $(this).attr("id").split("_")[1];
                console.log("other webcast click link " + Id);
                getVideoById(Id);

              

                e.preventDefault();
            });
        };

        getAllVideos();
    };

    webcastvideoservices.init = function () {
        polyfillArray();
        getVideos();
    };

    webcastvideoservices.autoResize = function (id) {

         var newheight;
         var newwidth;

            if (document.getElementById) {
                newheight = document.getElementById(id).contentWindow.document.body.scrollHeight;
                newwidth = document.getElementById(id).contentWindow.document.body.scrollWidth;
            }

            document.getElementById(id).height = (newheight) + "px";
            document.getElementById(id).width = (newwidth) + "px";

    };


})(window.webcastvideoservices = window.webcastvideoservices || {}, jQuery);