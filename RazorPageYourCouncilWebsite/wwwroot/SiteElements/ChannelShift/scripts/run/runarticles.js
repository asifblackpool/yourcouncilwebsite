$(document).ready(function () {
    logger.disableLogger();
    window.commonservices.Redirect();
    window.ieBrowser.init();
    window.commonservices.AdditionalInformation();
    window.homeservices.init();
    window.accordionservices.init();
    window.tableservices.init();
    window.scrollerservice.init();
    window.footerservices.init();

    $("span.sys_sectionbreak-header").replaceWith(function() { 
        return "<h2>" + this.innerHTML + "</h2>"; 
    });

    window.utilities.helper.cleaner();
});