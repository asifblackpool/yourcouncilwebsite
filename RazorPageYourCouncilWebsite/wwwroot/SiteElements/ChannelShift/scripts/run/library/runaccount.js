$(document).ready(function () {

    var closeOverlay = function () { commonlibraryservices.overlay(0, ""); };
    logger.disableLogger();

    var config = window.commonservices.Config();
    window.commonservices.Redirect();
    window.commonservices.removeCMSForm();
    window.homeservices.init();
    window.scrollerservice.init();
    window.footerservices.init();
    window.commonlibraryservices.hidesearchbar();

    window.commonservices.SetConfig(config);
    window.commonlibraryservices.show();
    window.accountlibraryservices.init(commonlibraryservices, cataloglibraryservices, sharedlibraryservices, togglelibraryservices, accordionservices);
    window.sharedlibraryservices.init(window.commonlibraryservices, window.accountlibraryservices, window.cataloglibraryservices);
    window.securitylibraryservices.init(commonlibraryservices);
    window.accountcallbacks.init(window.pickuplocationcallbacks, window.commonlibraryservices, accordionservices, togglelibraryservices);
    window.securitylibraryservices.authenticated(window.accountcallbacks.accountInfo);

    var bindEscapeKey = function () {
        $(document).on('keydown', function (e) { if (e.keyCode === 27) { closeOverlay(); } });

        $(document).on('click', "a.closebtn", function (e) {
            e.preventDefault();
            closeOverlay();
        });
    };

    bindEscapeKey();
});