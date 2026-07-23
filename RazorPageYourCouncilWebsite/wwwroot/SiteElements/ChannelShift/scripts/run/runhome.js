$(document).ready(function () {

    var getLastTweet = function () {
        function replaceAll(str, find, repl) {
            var regex = new RegExp(find, 'g');
            return str.replace(regex, repl);
        }
        var element = document.getElementById('tweet-text-box-container');
        try {
            $.get(window.commonservices.Config().twitterUrl + '/tweets/blackpool/1',
                function (data, status) {
                     var html = data.Message
                    if (html !== null) {
                        var pos = html.indexOf('http');
                        var link = html.substr(pos, html.length - 1);
                        if (pos > 0) {
                            link = replaceAll('&nbsp;<a href="xxx">xxx</a>', 'xxx', link);
                            html = html.substr(0, pos - 1) + link;
                        }
                    }
                    element.innerHTML = "<span id='twitter-feed-last-tweet' class='clearfix'>" + html + "</span>";
                }).fail(function () { });
        } catch (e) { }
    };


    var getYourAreaCurrentLocation = function () {
        var savedCookieValue = window.cookieservices.ReadCookie('myareapostcode');
        if (savedCookieValue !== null) {
            $(".your-current-postcode").html(savedCookieValue);
            $("#find-services-input").val(savedCookieValue);
            return savedCookieValue;
        }

        return "";
    };

    var getApiData = function () {
        $("#myarea-container").fadeOut(1000);
        var myAreaValue = $("#find-services-input").val().trim();
        var errorMessage = window.utilities.validateUKPostCode(myAreaValue);
        $("#find-services_error").html(errorMessage);
        if (errorMessage === "") {
            //$("#myarea-container").fadeIn(3000);
             $.ajax({
                url: window.commonservices.Config().pollingStationUrl + 'ValidatePostCode?postcode=' + myAreaValue,
                type: 'GET',
                success: function (data) {
                    if (data.indexOf("OK") > -1) {
                        window.cookieservices.CreateCookie("myareapostcode", myAreaValue, 30);
                        getYourAreaCurrentLocation();
                        window.location.href = "/Your-Area.aspx";
                    }
                    else {
                        $("#find-services_error").html('This post code is not valid for blackpool council.');
                    }
                }
            }).fail(function (jqXHR, textStatus, error) {
                $("#find-services_error").html('Oops an error occured validating the post code.');
            });            
        }
    };

    var myAreaKeyPress = function () {
        var input = document.getElementById("find-services-input");
        var button = document.getElementById("find-services-button");
        try {
            input.addEventListener("keypress", function (e) {
                if (e.keyCode === 13) {
                    getApiData();
                    e.preventDefault();
                }
            });
        }
        catch (e) { }

    };

    var myAreaClick = function () {
        $('#find-services-button').click(function (e) {
            getApiData();
            e.preventDefault();
        });
    };

    logger.disableLogger();
    window.commonservices.Redirect();
    window.ieBrowser.init();
    window.homeservices.init();
    window.scrollerservice.init();
    window.footerservices.init();
    myAreaClick();
    myAreaKeyPress();
    getLastTweet();



});