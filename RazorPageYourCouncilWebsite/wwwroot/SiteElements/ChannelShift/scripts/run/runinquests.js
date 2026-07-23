$(document).ready(function () {
    logger.disableLogger();
    window.ieBrowser.init();
    window.commonservices.AdditionalInformation();
    window.homeservices.init();
    window.accordionservices.init();
    window.tableservices.init();
    window.scrollerservice.init();
    window.footerservices.init();
    window.inquestservices.init(null, window.pagingservices);
});