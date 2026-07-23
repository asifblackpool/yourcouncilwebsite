$(document).ready(function () {
    logger.disableLogger();
    window.ieBrowser.init();
    window.surgetestingservices.init();
    window.scrollerservice.init();
    window.footerservices.init();


    var surgeTesgingClick = function () {
        console.log('surgetesting  click call');
        $('#surge-testing-button').click(function (e) {
            var postcode        = $("#surge-testing-input").val().trim();
            var errorMessage    = window.utilities.validateUKPostCode(postcode);
            $("#surge-testing-error").html(errorMessage);
            if (errorMessage === "") {      surgetestingservices.checkpostcode(postcode);   }
        });
    };

    surgeTesgingClick();


});