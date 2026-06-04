$(document).ready(function () {

    var runPostCode = function () {
        var savedCookieValue = window.cookieservices.ReadCookie('myareapostcode');
        if (savedCookieValue !== null) {
            $(".your-current-postcode").html(savedCookieValue);
            $("#find-postcode-input").val(savedCookieValue);
        }
        else {
            savedCookieValue = "FY1 1NA"
        }

        $(".your-current-postcode").html(savedCookieValue);

        window.democracy.init(savedCookieValue, "councillor-postcode-template", false); //if its offline set to true
        $(".councillor-placeholder").fadeIn(1200, function () {

        });

    };

    var getPostCodeData = function (buttonClicked) {

        var myAreaValue = $("#find-postcode-input").val().trim();
        var errorMessage = window.utilities.validateUKPostCode(myAreaValue);
        $("#find-services_error-extra").html(errorMessage);
        $("#find-services_error-extra").hide();

        var showError = function () {
            if (buttonClicked) {
                $("#find-services_error-extra").show();
            }
        };

        if (errorMessage === "") {
            $.ajax({
                url: window.commonservices.Config().pollingStationUrl + 'ValidatePostCode?postcode=' + myAreaValue,
                type: 'GET',
                success: function (data) {

                    if (data.indexOf("OK") > -1) {
                        window.cookieservices.CreateCookie("myareapostcode", myAreaValue, 30);
                        runPostCode();
                    }
                    else {
                        $("#find-services_error-extra").html('This post code is not valid for blackpool council');
                        showError();
                        window.democracy.reset();
                    }
                }
            }).fail(function (jqXHR, textStatus, error) {
                $("#find-services_error-extra").html('Oops an error occured validating the post code');
                showError();
                window.democracy.reset();
            });
        }
        else {
            $("#find-services_error-extra").html(errorMessage);
            showError();
            window.democracy.reset();
        }
    };

    var postCodeClick = function () {
        console.log('post code click call');
        $('#find-postcode-button').click(function (e) {
            getPostCodeData(true); //the true boolean value indicates a button click
            e.preventDefault();
        });
    };


    postCodeClick();
    getPostCodeData(false); //false indicates a page load only and no button click

});

