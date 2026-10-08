/**
 * pdflinkservices
 *
 * Client-side rewriter for PDF links.
 *
 * Many legacy pages link directly to PDFs stored in the Contensis CMS
 * (e.g. "/Your-Council/Blackpool-Co-production/Assets/foo.pdf"). Those
 * paths are NOT served as static files by the Block, so clicking them
 * returns a 500 error.
 *
 * This service finds every <a href="...pdf"> on the page and rewrites it
 * to go through the /pdf/download endpoint instead, which fetches the
 * file from the Contensis Delivery API and streams it back.
 *
 * Only *relative* links (starting with "/") are rewritten. Absolute URLs
 * (http://, https://, //) are left alone so external PDFs keep working.
 *
 * Usage (once, from a layout or page):
 *     pdflinkservices.init();
 *
 * Debug logging:
 *     pdflinkservices.setDebug(true);   // turn logs on
 *     pdflinkservices.setDebug(false);  // turn logs off
 *     pdflinkservices.setDebug('warn'); // only warnings/errors
 */
window.pdflinkservices = (function () {
    'use strict';

    var LOG_PREFIX = '[pdflinkservices]';
    var DOWNLOAD_ENDPOINT = '/pdf/download';
    var LINK_SELECTOR = 'a[href]';

    // ---------------------------------------------------------------------
    // Debug switch
    //   false      -> no logging at all (default)
    //   true       -> log + warn
    //   'warn'     -> warn only
    // ---------------------------------------------------------------------
    var debug = false;

    function setDebug(value) {
        debug = value;
        return debug;
    }

    function log() {
        if (debug !== true) { return; }
        var args = Array.prototype.slice.call(arguments);
        args.unshift(LOG_PREFIX);
        console.log.apply(console, args);
    }

    function warn() {
        if (debug !== true && debug !== 'warn') { return; }
        var args = Array.prototype.slice.call(arguments);
        args.unshift(LOG_PREFIX);
        console.warn.apply(console, args);
    }

    function isPdfLink(href) {
        if (!href) { return false; }

        // Strip any query string or fragment before checking the extension,
        // so "/foo.pdf?download=1" and "/foo.pdf#page=2" still match.
        var clean = href.split('?')[0].split('#')[0];
        return /\.pdf$/i.test(clean);
    }

    function isRelative(href) {
        if (!href) { return false; }
        // Only rewrite same-site paths. Leave absolute URLs alone.
        return href.charAt(0) === '/'
            && href.charAt(1) !== '/';  // exclude protocol-relative "//cdn..."
    }

    function isAlreadyRewritten(href) {
        return href.indexOf(DOWNLOAD_ENDPOINT) === 0;
    }

    function rewriteLinks() {
        log('init() called — rewriting PDF links');

        var links = document.querySelectorAll(LINK_SELECTOR);
        log('found ' + links.length + ' anchor(s) on the page');

        var rewritten = 0;
        var skippedExternal = 0;
        var skippedAlreadyDone = 0;

        links.forEach(function (link) {
            var href = link.getAttribute('href');

            if (!isPdfLink(href)) {
                return;
            }

            if (isAlreadyRewritten(href)) {
                skippedAlreadyDone++;
                log('skipping (already rewritten): ' + href);
                return;
            }

            if (!isRelative(href)) {
                skippedExternal++;
                log('skipping (not relative): ' + href);
                return;
            }

            // Strip the leading slash — Contensis node paths don't include it.
            var contensisPath = href.replace(/^\//, '');

            // Preserve any query string / fragment by appending them back
            // after the path parameter.
            var queryIndex = href.indexOf('?');
            var hashIndex = href.indexOf('#');
            var suffix = '';

            if (queryIndex !== -1) {
                suffix += href.substring(queryIndex);
            }
            if (hashIndex !== -1 && (queryIndex === -1 || hashIndex < queryIndex)) {
                suffix = href.substring(hashIndex) + suffix;
            }

            var newHref = DOWNLOAD_ENDPOINT
                + '?path=' + encodeURIComponent(contensisPath)
                + suffix;

            link.setAttribute('href', newHref);
            rewritten++;

            log('rewrote "' + href + '" -> "' + newHref + '"');
        });

        log('done — ' + rewritten + ' rewritten, '
            + skippedExternal + ' external skipped, '
            + skippedAlreadyDone + ' already-rewritten skipped');
    }

    function init() {
        log('init() invoked (readyState="' + document.readyState + '")');

        if (document.readyState === 'loading') {
            log('DOM not ready — deferring until DOMContentLoaded');
            document.addEventListener('DOMContentLoaded', rewriteLinks, { once: true });
        } else {
            log('DOM already ready — running immediately');
            rewriteLinks();
        }
    }

    return {
        init: init,
        rebuild: rewriteLinks,
        setDebug: setDebug
    };
})();