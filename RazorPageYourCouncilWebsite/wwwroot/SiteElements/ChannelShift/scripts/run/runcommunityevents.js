$(document).ready(function () {
    logger.disableLogger();
    window.ieBrowser.init();
    window.commonservices.AdditionalInformation();
    window.homeservices.init();
    window.accordionservices.init();
    window.tableservices.init();
    window.scrollerservice.init();
    window.footerservices.init();
    
    var catergoryType = {
        headerOneTag: 'Library Course & Events',
        title: 'Number of library events found',
        category: 'library'
    };

    window.communityeventservices.init(null, window.pagingservices,catergoryType);
});