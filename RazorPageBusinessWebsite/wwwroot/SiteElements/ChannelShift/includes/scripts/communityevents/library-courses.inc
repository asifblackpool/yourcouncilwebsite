<script>
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
        headerOneTag: 'Library & Events',
        title: 'Number of Library & Events Courses found',
        category: 'library',
        defaultImageUrl: 'SiteElements/ChannelShift/Content/Images/placeholders/475x300.png',
    };

    window.communityeventservices.init(null, window.pagingservices, catergoryType);
});

</script>