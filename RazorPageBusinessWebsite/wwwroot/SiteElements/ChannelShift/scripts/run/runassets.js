$(document).ready(function () {
  logger.disableLogger();
  window.ieBrowser.init();
  window.commonservices.AdditionalInformation();
  window.homeservices.init();
  window.accordionservices.init();
  window.tableservices.init();
  window.scrollerservice.init();
  window.footerservices.init();
  window.assetservices.init(null, window.mapservices, window.pagingservices);

  /* show hide form */

  $(".form-toggle").click(function () {
    $("div.form-placeholder").toggle(1000);
  });
});