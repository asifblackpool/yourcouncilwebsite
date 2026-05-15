$(document).ready(function () {
    logger.disableLogger();
    window.commonservices.Redirect();
    window.ieBrowser.init();
    window.homeservices.init();
    window.accordionservices.init();
    window.scrollerservice.init();
    window.footerservices.init();
});