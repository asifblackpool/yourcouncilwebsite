$(document).ready(function () {
    logger.disableLogger();
    window.ieBrowser.init();
    window.documentservices.init();
    window.scrollerservice.init();
    window.footerservices.init();

    //window.utilities.helper.setEqualHeight('sidebar', 'mainbar');

    $(function () {

        //$('content-scroller').show();

        function showBackToTop() { $('#back-to-content').addClass('show-btt'); }       //Function To add Class
        function hideBackToTop() { $('#back-to-content').removeClass('show-btt'); }    //Function To remove Class

        //Check Scroll and Add Class
        function checkScrollPos() {
            console.log('check scroll position');
            //$('content-scroller').show();
            if ($(this).scrollTop() >= 600) {
                showBackToTop();
            } else {
                hideBackToTop()
            }
        }

        $(window).on('scroll', function () {

            checkScrollPos();
        });



        checkScrollPos();   //Check the scroll position once when the page loads
    });



});