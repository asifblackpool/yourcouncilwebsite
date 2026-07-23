/*********************************************************************
*  #### Twitter Post Fetcher v13.1 ####
*  Coded by Jason Mayes 2015. A present to all the developers out there.
*  www.jasonmayes.com
*  Please keep this disclaimer with my code if you use it. Thanks. :-)
*  Got feedback or questions, ask here:
*  http://www.jasonmayes.com/projects/twitterApi/
*  Github: https://github.com/jasonmayes/Twitter-Post-Fetcher
*  Updates will be posted to this site.
*********************************************************************/
(function (w, p) { "function" === typeof define && define.amd ? define([], p) : "object" === typeof exports ? module.exports = p() : p() })(this, function () {
    function w(a) { if (null === r) { for (var g = a.length, d = 0, k = document.getElementById(D), f = "<ul>"; d < g;) f += "<li>" + a[d] + "</li>", d++; k.innerHTML = f + "</ul>" } else r(a) } function p(a) { return a.replace(/<b[^>]*>(.*?)<\/b>/gi, function (a, d) { return d }).replace(/class="(?!(tco-hidden|tco-display|tco-ellipsis))+.*?"|data-query-source=".*?"|dir=".*?"|rel=".*?"/gi, "") } function E(a) {
        a = a.getElementsByTagName("a");
        for (var g = a.length - 1; 0 <= g; g--) a[g].setAttribute("target", "_blank")
    } function l(a, g) { for (var d = [], k = new RegExp("(^| )" + g + "( |$)"), f = a.getElementsByTagName("*"), h = 0, b = f.length; h < b; h++) k.test(f[h].className) && d.push(f[h]); return d } function F(a) { if (void 0 !== a && 0 <= a.innerHTML.indexOf("data-srcset")) return a = a.innerHTML.match(/data-srcset="([A-z0-9%_\.-]+)/i)[0], decodeURIComponent(a).split('"')[1] } var D = "", g = 20, G = !0, x = [], z = !1, y = !0, t = !0, A = null, B = !0, C = !0, r = null, H = !0, I = !1, u = !0, J = !0, K = !1, m = null, L = {
        fetch: function (a) {
            void 0 ===
            a.maxTweets && (a.maxTweets = 20); void 0 === a.enableLinks && (a.enableLinks = !0); void 0 === a.showUser && (a.showUser = !0); void 0 === a.showTime && (a.showTime = !0); void 0 === a.dateFunction && (a.dateFunction = "default"); void 0 === a.showRetweet && (a.showRetweet = !0); void 0 === a.customCallback && (a.customCallback = null); void 0 === a.showInteraction && (a.showInteraction = !0); void 0 === a.showImages && (a.showImages = !1); void 0 === a.linksInNewWindow && (a.linksInNewWindow = !0); void 0 === a.showPermalinks && (a.showPermalinks = !0); void 0 === a.dataOnly &&
            (a.dataOnly = !1); if (z) x.push(a); else {
                z = !0; D = a.domId; g = a.maxTweets; G = a.enableLinks; t = a.showUser; y = a.showTime; C = a.showRetweet; A = a.dateFunction; r = a.customCallback; H = a.showInteraction; I = a.showImages; u = a.linksInNewWindow; J = a.showPermalinks; K = a.dataOnly; var l = document.getElementsByTagName("head")[0]; null !== m && l.removeChild(m); m = document.createElement("script"); m.type = "text/javascript"; m.src = "https://cdn.syndication.twimg.com/widgets/timelines/" + a.id + "?&lang=" + (a.lang || "en") + "&callback=twitterFetcher.callback&suppress_response_codes=true&rnd=" +
                Math.random(); l.appendChild(m)
            }
        }, callback: function (a) {
            function m(a) { var b = a.getElementsByTagName("img")[0]; b.src = b.getAttribute("data-src-2x"); return a } var d = document.createElement("div"); d.innerHTML = a.body; "undefined" === typeof d.getElementsByClassName && (B = !1); a = []; var k = [], f = [], h = [], b = [], q = [], n = [], e = 0; if (B) for (d = d.getElementsByClassName("timeline-Tweet") ; e < d.length;) {
                0 < d[e].getElementsByClassName("timeline-Tweet-retweetCredit").length ? b.push(!0) : b.push(!1); if (!b[e] || b[e] && C) a.push(d[e].getElementsByClassName("timeline-Tweet-text")[0]),
                q.push(d[e].getAttribute("data-tweet-id")), k.push(m(d[e].getElementsByClassName("timeline-Tweet-author")[0])), f.push(d[e].getElementsByClassName("dt-updated")[0]), n.push(d[e].getElementsByClassName("timeline-Tweet-timestamp")[0]), void 0 !== d[e].getElementsByClassName("timeline-Tweet-media")[0] ? h.push(d[e].getElementsByClassName("timeline-Tweet-media")[0]) : h.push(void 0); e++
            } else for (d = l(d, "timeline-Tweet") ; e < d.length;) {
                0 < l(d[e], "timeline-Tweet-retweetCredit").length ? b.push(!0) : b.push(!1); if (!b[e] ||
                b[e] && C) a.push(l(d[e], "timeline-Tweet-text")[0]), q.push(d[e].getAttribute("data-tweet-id")), k.push(m(l(d[e], "timeline-Tweet-author")[0])), f.push(l(d[e], "dt-updated")[0]), n.push(l(d[e], "timeline-Tweet-timestamp")[0]), void 0 !== l(d[e], "timeline-Tweet-media")[0] ? h.push(l(d[e], "timeline-Tweet-media")[0]) : h.push(void 0); e++
            } a.length > g && (a.splice(g, a.length - g), k.splice(g, k.length - g), f.splice(g, f.length - g), b.splice(g, b.length - g), h.splice(g, h.length - g), n.splice(g, n.length - g)); var d = [], e = a.length, c = 0; if (K) for (; c <
            e;) d.push({ tweet: a[c].innerHTML, author: k[c].innerHTML, time: f[c].innerText, image: F(h[c]), rt: b[c], tid: q[c], permalinkURL: void 0 === n[c] ? "" : n[c].href }), c++; else for (; c < e;) {
                if ("string" !== typeof A) {
                    var b = f[c].getAttribute("datetime"), v = new Date(f[c].getAttribute("datetime").replace(/-/g, "/").replace("T", " ").split("+")[0]), b = A(v, b); f[c].setAttribute("aria-label", b); if (a[c].innerText) if (B) f[c].innerText = b; else {
                        var v = document.createElement("p"), r = document.createTextNode(b); v.appendChild(r); v.setAttribute("aria-label",
                        b); f[c] = v
                    } else f[c].textContent = b
                } b = ""; G ? (u && (E(a[c]), t && E(k[c])), t && (b += '<div class="user">' + p(k[c].innerHTML) + "</div>"), b += '<p class="tweet">' + p(a[c].innerHTML) + "</p>", y && (b = J ? b + ('<p class="timePosted"><a href="' + n[c] + '">' + f[c].getAttribute("aria-label") + "</a></p>") : b + ('<p class="timePosted">' + f[c].getAttribute("aria-label") + "</p>"))) : a[c].innerText ? (t && (b += '<p class="user">' + k[c].innerText + "</p>"), b += '<p class="tweet">' + a[c].innerText + "</p>", y && (b += '<p class="timePosted">' + f[c].innerText + "</p>")) :
                (t && (b += '<p class="user">' + k[c].textContent + "</p>"), b += '<p class="tweet">' + a[c].textContent + "</p>", y && (b += '<p class="timePosted">' + f[c].textContent + "</p>")); H && (b += '<p class="interact"><a href="https://twitter.com/intent/tweet?in_reply_to=' + q[c] + '" class="twitter_reply_icon"' + (u ? ' target="_blank">' : ">") + 'Reply</a><a href="https://twitter.com/intent/retweet?tweet_id=' + q[c] + '" class="twitter_retweet_icon"' + (u ? ' target="_blank">' : ">") + 'Retweet</a><a href="https://twitter.com/intent/favorite?tweet_id=' +
                q[c] + '" class="twitter_fav_icon"' + (u ? ' target="_blank">' : ">") + "Favorite</a></p>"); I && void 0 !== h[c] && (b += '<div class="media"><img src="' + F(h[c]) + '" alt="Image from tweet" /></div>'); d.push(b); c++
            } w(d); z = !1; 0 < x.length && (L.fetch(x[0]), x.splice(0, 1))
        }
    }; return window.twitterFetcher = L
});



/**
 * ### HOW TO CREATE A VALID ID TO USE: ###
 * Go to www.twitter.com and sign in as normal, go to your settings page.
 * Go to "Widgets" on the left hand side.
 * Create a new widget for what you need eg "user time line" or "search" etc.
 * Feel free to check "exclude replies" if you don't want replies in results.
 * Now go back to settings page, and then go back to widgets page and
 * you should see the widget you just created. Click edit.
 * Look at the URL in your web browser, you will see a long number like this:
 * 345735908357048478
 * Use this as your ID below instead!
 */

/**
 * How to use TwitterFetcher's fetch function:
 * 
 * @function fetch(object) Fetches the Twitter content according to
 *     the parameters specified in object.
 * 
 * @param object {Object} An object containing case sensitive key-value pairs
 *     of properties below.
 * 
 * You may specify at minimum the following two required properties:
 * 
 * @param object.id {string} The ID of the Twitter widget you wish
 *     to grab data from (see above for how to generate this number).
 * @param object.domId {string} The ID of the DOM element you want
 *     to write results to.
 *
 * You may also specify one or more of the following optional properties
 *     if you desire:
 *
 * @param object.maxTweets [int] The maximum number of tweets you want
 *     to return. Must be a number between 1 and 20. Default value is 20.
 * @param object.enableLinks [boolean] Set false if you don't want
 *     urls and hashtags to be hyperlinked.
 * @param object.showUser [boolean] Set false if you don't want user
 *     photo / name for tweet to show.
 * @param object.showTime [boolean] Set false if you don't want time of tweet
 *     to show.
 * @param object.dateFunction [function] A function you can specify
 *     to format date/time of tweet however you like. This function takes
 *     a JavaScript date as a parameter and returns a String representation
 *     of that date.
 * @param object.showRetweet [boolean] Set false if you don't want retweets
 *     to show.
 * @param object.customCallback [function] A function you can specify
 *     to call when data are ready. It also passes data to this function
 *     to manipulate them yourself before outputting. If you specify
 *     this parameter you must output data yourself!
 * @param object.showInteraction [boolean] Set false if you don't want links
 *     for reply, retweet and favourite to show.
 * @param object.showImages [boolean] Set true if you want images from tweet
 *     to show.
 * @param object.lang [string] The abbreviation of the language you want to use
 *     for Twitter phrases like "posted on" or "time ago". Default value
 *     is "en" (English).
 */

/*


// ##### Simple example 2 #####
// A simple example to get my latest 5 of my favourite tweets and write to a
// HTML element with id "talk". Also automatically hyperlinks URLS and user
// mentions and hashtags but does not display time of post. We also make the
// request to Twitter specifiying we would like results where possible in
// English language.
var config2 = {
    "id": '347099293930377217',
    "domId": 'example2',
    "maxTweets": 5,
    "enableLinks": true,
    "showUser": true,
    "showTime": true,
    "lang": 'en'
};
twitterFetcher.fetch(config2);


// ##### Simple example 3 #####
// A simple example to get latest 5 tweets for #API tag and shows any images
// attached to tweets.
var config3 = {
    "id": '502160051226681344',
    "domId": 'example3',
    "maxTweets": 5,
    "enableLinks": true,
    "showImages": true
};
twitterFetcher.fetch(config3);


// ##### Advanced example #####
// An advance example to get latest 5 posts using hashtag #API and write to a
// HTML element with id "tweets2" without showing user details and using a
// custom format to display the date/time of the post, and does not show
// retweets.
var config4 = {
    "id": '345690956013633536',
    "domId": 'example4',
    "maxTweets": 3,
    "enableLinks": true,
    "showUser": false,
    "showTime": true,
    "dateFunction": dateFormatter,
    "showRetweet": false
};

// For advanced example which allows you to customize how tweet time is
// formatted you simply define a function which takes a JavaScript date as a
// parameter and returns a string!
// See http://www.w3schools.com/jsref/jsref_obj_date.asp for properties
// of a Date object.
function dateFormatter(date) {
    return date.toTimeString();
}

twitterFetcher.fetch(config4);


// ##### Advanced example 2 #####
// Similar as previous, except this time we pass a custom function to render the
// tweets ourself! Useful if you need to know exactly when data has returned or
// if you need full control over the output.

var config5 = {
    "id": '345690956013633536',
    "domId": '',
    "maxTweets": 3,
    "enableLinks": true,
    "showUser": true,
    "showTime": true,
    "dateFunction": '',
    "showRetweet": false,
    "customCallback": handleTweets,
    "showInteraction": false
};

function handleTweets(tweets) {
    var x = tweets.length;
    var n = 0;
    var element = document.getElementById('example5');
    var html = '<ul>';
    while (n < x) {
        html += '<li>' + tweets[n] + '</li>';
        n++;
    }
    html += '</ul>';
    element.innerHTML = html;
}

twitterFetcher.fetch(config5);

*/