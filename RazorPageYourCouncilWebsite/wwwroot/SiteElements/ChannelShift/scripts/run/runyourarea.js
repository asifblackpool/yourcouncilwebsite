
$(document).ready(function () {
    console.log('start page services');
    logger.disableLogger();
    window.commonservices.Redirect();
    window.ieBrowser.init();
    window.homeservices.init();
    window.scrollerservice.init();
    window.footerservices.init();

    var getYourAreaData = function () {
        $("#myarea-container").fadeOut(1000);
        var myAreaValue = $("#find-services-input").val().trim();
        var errorMessage = window.utilities.validateUKPostCode(myAreaValue);
        $("#find-services_error").html(errorMessage);
        if (errorMessage === "") {

            $.ajax({
                url: window.commonservices.Config().pollingStationUrl + 'ValidatePostCode?postcode=' + myAreaValue,
                type: 'GET',
                success: function (data) {

                    if (data.indexOf("OK") > -1) {
                        window.cookieservices.CreateCookie("myareapostcode", myAreaValue, 30);
                        runYourArea(true);
                    }
                    else {
                        $("#find-services_error").html('This post code is not valid for blackpool council');
                    }
                }
            }).fail(function (jqXHR, textStatus, error) {
                $("#find-services_error").html('Oops an error occured validating the post code');
            });
        }
    };

    var getYourAreaCurrentLocation = function () {
        var savedCookieValue = window.cookieservices.ReadCookie('myareapostcode');
        if (savedCookieValue !== null) {
            $(".your-current-postcode").html(savedCookieValue);
            $("#find-services-input").val(savedCookieValue);
            return savedCookieValue;
        }
        savedCookieValue = "FY1 1NA"
        $(".your-current-postcode").html(savedCookieValue);
        return savedCookieValue;;
    };

    var yourAreaClick = function () {
        console.log('your area click call');
        $('#find-services-button').click(function (e) {
            getYourAreaData();
            e.preventDefault();
        });
    };

    var runYourArea = function (buttonSubmit) {
        var myAreaValue = getYourAreaCurrentLocation();
        if (buttonSubmit) {
            locationmapservices.submit(myAreaValue);
        } else {
            locationmapservices.init(myAreaValue);
        }


        window.votingservices.init(myAreaValue, function (isOK) {
            if (isOK) { $("#polling-loading-indicator").hide(); }
        });
        window.democracy.init(myAreaValue, "councillor-template", true);
        window.bartecservices.init(myAreaValue);
        window.signInServices.init();
    };
    yourAreaClick();
    runYourArea(false);

});
