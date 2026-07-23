//******************************************************************************
// Description: Implement a Web chat  on selected resident school pages only 
//
// Date: 17/03/2016											Author: Asif Nissar
//
//******************************************************************************

(function (webchatservice, $, undefined) {

    var setUp = function () {
        var head = document.getElementsByTagName('head')[0];
        var srcC4AW = document.createElement('script');
        srcC4AW.type = 'text/javascript';
        srcC4AW.charset = 'utf-8';
        srcC4AW.id = 'srcC4AWidget';
        srcC4AW.defer = true;
        srcC4AW.async = true;
        srcC4AW.src = 'https://prod3si.click4assistance.co.uk/JS/ChatWidget.js';
        if (head) { head.appendChild(srcC4AW); }
    };

    function initialize() { setUp(); }

    function load() {
        var OC4AW_Widget = new OC4AW_Widget();
        OC4AW_Widget.setAccGUID("F6FC8B4F-DBED-4B92-BE66-41AFBDD360DF");
        OC4AW_Widget.setWSGUID("97ee9365-b18d-4ea7-b90e-61e5fa7e4736");
        OC4AW_Widget.setWFGUID("8a43196e-a411-4b64-8474-da649c5ef21b");
        OC4AW_Widget.setPopupWindowWFGUID("a4cf0c79-0ba3-482d-9c33-420273f43127");
        OC4AW_Widget.setDockPosition("BOTTOM");
        OC4AW_Widget.setBtnStyle("position:fixed; border:none; bottom:0em; right:1em;");
        OC4AW_Widget.setIdentity("Embedded Chat");
        OC4AW_Widget.Initilize();
    }

    webchatservice.init = function () {
        initialize();

    };
    webchatservice.loadWidget = function () {
        load();
    };
   
})(window.webchatservice = window.webchatservice || {}, jQuery);
