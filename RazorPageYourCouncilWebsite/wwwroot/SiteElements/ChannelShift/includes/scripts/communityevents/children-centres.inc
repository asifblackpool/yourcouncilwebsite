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
        headerOneTag: 'Children Centres',
        title : 'Number of Children Centres found',
        category: 'children',
        defaultImageUrl: 'images/childrens-and-families/Childrens-centres-events/BC-Childrens-Centres-RGB-min.png'
    };

  
    window.communityeventservices.init(null, window.pagingservices, catergoryType);
});

</script>