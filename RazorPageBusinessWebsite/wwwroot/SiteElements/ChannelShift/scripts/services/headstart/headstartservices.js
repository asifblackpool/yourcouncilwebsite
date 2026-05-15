"use strict";
(function (headstartservices, $, undefined) {

    var navbarScroll = function () {
        window.onscroll = function () { myFunction() };

        var sticky = 0;
        var navbar = document.getElementById("navbar");

        function myFunction() {
             if (navbar !== null) {
                if (window.pageYOffset >= sticky) {
                    navbar.classList.add("sticky")
                } else {
                    navbar.classList.remove("sticky");
                }
             }
        }

        if (navbar !== null) {
            sticky = navbar.offsetTop;
        }
    };

    var addEvents = function () {
        $(".event-link").click(function (e) {
            var tr = $(this).parent().parent(); // get the table row
            var nexttr = tr.next();
            var id = nexttr[0].id;
            var num = (id.split('-'))[2];
            $("#content-" + num).slideToggle("500", function () { });
            e.stopPropagation();
            return false;
        });
    }

    var loadTwitter = function () {

        var elem = document.getElementById('twitter-message');
        var likes = document.getElementById('twitter-likes');
        var retweet = document.getElementById('twitter-retweet');

        var twitterBindings = function () {

            var fadeToggle = function (e) {
                $(".share-panel").fadeToggle(1000);
                e.preventDefault();
            };

            $('.close-share-panel').click(function (e) { fadeToggle(e); });

            $('#share-link').click(function (e) { fadeToggle(e); });
        };

        var getLastHeadStartTweet = function (element, likes, retweet) {

            function replaceAll(str, find, repl) {
                var regex = new RegExp(find, 'g');
                return str.replace(regex, repl);
            }

            try {
                var hsUrl = window.commonservices.Config().twitterUrl + '/tweets/headstart/1';
                $.get(hsUrl,
                function (data, status) {
                    var html = data.Message
                    if (html !== null) {
                        var pos = html.indexOf('http');
                        var link = html.substr(pos, html.length - 1);
                        if (pos > 0) {
                            link = replaceAll('&nbsp; ...<br/><a href="xxx">xxx</a>', 'xxx', link);
                            html = html.substr(0, pos - 1) + link;
                        }
                    }
                    element.innerHTML = html;
                    likes.innerHTML = (data != null) ? data.Likes : "&nbsp;";
                    retweet.innerHTML = (data != null) ? data.Retweet : "&nbsp;";
                }).fail(function () { 
                    console.log('twitter api failed');
                });
            }
            catch (e) { 
                console.log("error occured " + e.message);
            }
        };

        if (elem != null) {
            getLastHeadStartTweet(elem, likes, retweet);
            twitterBindings();
        }

    };

    headstartservices.init = function () {
        navbarScroll();
        loadTwitter();
        addEvents();
    };

})(window.headstartservices = window.headstartservices || {}, jQuery);