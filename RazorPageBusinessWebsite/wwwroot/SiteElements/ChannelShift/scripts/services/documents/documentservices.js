"use strict";
(function (documentservices, $, undefined) {

    var cls = null;
    var icon = null;


    var replacespacewithHyphen = function (str) {
        str = str.replace(/\s/g, '-');
        return str;
    }

    var createLinkList = function (txt, href) {
        var a = document.createElement('a');
        a.setAttribute('href', href);
        a.className = "hide-for-print";
        a.innerHTML = txt;

        var li = document.createElement("li");

        li.appendChild(a);

        return li;
    };

    var bindScrolling = function () {

        $('a.hide-for-print').on('click', function (e) {
            e.preventDefault();
            var id = this.hash;
            id = id.substring(1);
            var ele = document.getElementById(id);
            ele.scrollIntoView({
                behavior: 'smooth'
            });

            return false;
        });
    }
  

    documentservices.init = function () {
        console.log('document services init call');

        var nav         = document.createElement("nav");
        var title       = document.createElement("h3");
        var ul          = document.createElement("ul");

        alert('class added');
        ul.classList.add("no-bullets");
        nav.classList.add("contents-nav"); // Add your desired class name


        title.innerText = "Contents";
        nav.appendChild(title);

 
        var counter = 1;
        $("div#mainbar h1, div#mainbar h2, div#mainbar h3, div#mainbar h4 , div#mainbar h5").each(function () {

            if (this.className !== 'ignore') {
                console.log($(this).text());
                var txt = $(this).text();
                this.id = "doc-link-" + counter;  
                ul.appendChild(createLinkList(txt, '#' + this.id)); 
                counter++;
            }
        });

        nav.append(ul);
        $('div#sidebar').append(nav);

        bindScrolling();

    };



})(window.documentservices = window.documentservices || {}, jQuery);