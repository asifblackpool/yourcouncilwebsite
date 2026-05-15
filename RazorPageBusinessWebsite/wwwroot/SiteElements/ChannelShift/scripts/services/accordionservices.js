"use strict";
(function (accordionservices, $, undefined) { 

    var callback   = null;
    var classIcons =    {   down: "icon-arrow-down",  up: "icon-arrow-up"   };

    var expand = function (icon) {
        var cls = icon.className;
        /*. expand function class icon should always appear as up */
        icon.className = ((cls === classIcons.down) ? classIcons.up : classIcons.down);

    
    };

    var findPos = function(obj) {
    var curtop = 0;
    if (obj.offsetParent) {
        do {
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
    return [curtop];
    }
}

    var collapseAll = function () {
        var cls = "";
        var linkhead = null;
        var icon = null;
        $('.accordion-togglable').each(function (i, obj) {

            icon = (obj.parentElement.getElementsByTagName("i"))[0];
            linkhead = (($(obj).parent().closest('li')).find('a.link-head'));
            linkhead[0].className = 'link-head';
            cls = icon.className;
            if (cls === classIcons.up) {
                icon.className = classIcons.down;
            }
        });
    };

    var openPanel = function (objItem) {
        var linkhead = null;

        var obj = ($(objItem).closest('li').find('.accordion-togglable'))[0];
        console.log(obj);
        var icon = (obj.parentElement.getElementsByTagName("i"))[0];
        collapseAll();
        linkhead = (($(obj).parent().closest('li')).find('a.link-head'));
        linkhead[0].className = 'link-head open accessibility-tab-100';
        $(objItem).closest('li')
            .find('.accordion-togglable').not(':animated').slideToggle(function () {
                /*console.log('expand icon id ' + iconId); */
                expand(icon);
                if (callback !== null) { callback(obj.id); }
                   
            });
    };

    var findPanel = function (index) {
        var cls = "";
        var icon = null;
        var counter = 1;
        $('.accordion-togglable').each(function (i, obj) {

            icon = (obj.parentElement.getElementsByTagName("i"))[0];
            cls = icon.className;

            if (counter === index) {
                openPanel(this);
            }
            counter++;    
        });
    };

    var unbindClickEventDynamic = function () {
        $(document).off('click', '#accordion-ul .head a.link-head');
        $(document).off('focus', '#accordion-ul .head a.link-head');
    };

    var bindClickEventDynamic = function () {

        var clicked = false;

        var open = function (obj,e) {
            e.preventDefault();
            $(".accordion-togglable").hide(500);
            var linkId = e.currentTarget.id;
            openPanel(e.currentTarget);
            setTimeout(function () {
                scrollTo(linkId, e);
            }, 100);
        };

        var scrollTo = function (Id, e) {

            var target = $('#' + Id);
            var top = target.offset().top;
            $('html,body').animate({ scrollTop: top -200}, 1000);
            e.preventDefault();
           
        };

        //click event
        $(document).on('click', '#accordion-ul .head a.link-head', function (e) {
            open(this, e);
            clicked = true;
            e.preventDefault();
        });


        //focus event
        $(document).on('focusin', '#accordion-ul .head a.accessibility-tab-100', function (e) {
            setTimeout(function () {
                if (!clicked) { open(this, e); }
                clicked = false;
            }, 300);
            e.preventDefault();

        });

        /*stop even bubling up on all links within accrodion head */
        $(document).on('click', 'div.accordion-togglable a', function (evt) {
            evt.stopPropagation();
        });
        $(document).on('focusin', 'div.accordion-togglable a', function (evt) {
            evt.stopPropagation();
        });
      
    };

    accordionservices.init = function () {
        unbindClickEventDynamic();
        bindClickEventDynamic();
        /* console.log('bind accordion click event complete'); */
    };

    accordionservices.callback = function (cb) {
        accordionservices.init();
        callback = cb;
    }

    accordionservices.open = function (index) {

        findPanel(index);
    };


})(window.accordionservices = window.accordionservices || {}, jQuery);