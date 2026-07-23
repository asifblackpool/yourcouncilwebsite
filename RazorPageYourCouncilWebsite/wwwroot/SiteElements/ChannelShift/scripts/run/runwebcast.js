$(document).ready(function () {
    logger.disableLogger();
    window.commonservices.Redirect();
    window.ieBrowser.init();
    window.commonservices.AdditionalInformation();
    window.footerservices.init();
    window.webcastvideoservices.init();
});